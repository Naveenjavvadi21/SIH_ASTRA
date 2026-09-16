import base64
import time
import cv2
import numpy as np
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import AIEvent
from services.yolo_detector import yolo_detector
from services.mock_defect_detector import defect_detector
from services.anpr_simulator import anpr_simulator
from websocket_manager import ws_manager

router = APIRouter(prefix="/api/detection", tags=["detection"])

class FrameAnalysisRequest(BaseModel):
    image_base64: str
    bus_id: Optional[str] = "ASTRA-103"
    camera_channel: Optional[str] = "FRONT_BUMPER"
    lat: Optional[float] = 16.5020
    lng: Optional[float] = 80.6580
    trigger_defect: Optional[bool] = False
    defect_type: Optional[str] = None
    trigger_anpr: Optional[bool] = False
    violation_type: Optional[str] = None

@router.post("/process-base64")
async def process_base64_frame(payload: FrameAnalysisRequest, db: Session = Depends(get_db)):
    """
    Decodes base64 frame from webcam or canvas and runs real YOLOv11n inference,
    defect inspection, and ANPR recognition.
    """
    try:
        img_data = payload.image_base64
        if "," in img_data:
            img_data = img_data.split(",")[1]

        image_bytes = base64.b64decode(img_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Invalid frame decode"}

        # Run real YOLOv11n detection
        yolo_res = yolo_detector.detect(frame)
        detections = yolo_res["detections"]

        # Run defect detector
        defect_res = defect_detector.inspect_frame(
            simulate_trigger=payload.trigger_defect,
            force_type=payload.defect_type
        )
        if defect_res:
            detections.append({
                "bbox": defect_res["bbox"],
                "class_name": f"ROAD DEFECT: {defect_res['label']}",
                "confidence": defect_res["confidence"],
                "color": defect_res["color"],
                "is_defect": True
            })

        # Run ANPR scanner
        anpr_res = anpr_simulator.scan_plate(force_violation=payload.violation_type if payload.trigger_anpr else None)
        if anpr_res and anpr_res.get("violation"):
            detections.append({
                "bbox": anpr_res["bbox"],
                "class_name": f"ANPR: {anpr_res['plate']} [{anpr_res['violation']['title']}]",
                "confidence": anpr_res["confidence"],
                "color": "#ef4444",
                "is_anpr": True
            })

        # Log AI Event
        if detections:
            first_det = detections[0]
            event = AIEvent(
                bus_id=payload.bus_id,
                class_name=first_det["class_name"],
                confidence=first_det["confidence"],
                lat=payload.lat,
                lng=payload.lng
            )
            db.add(event)
            db.commit()

        return {
            "status": "success",
            "bus_id": payload.bus_id,
            "camera_channel": payload.camera_channel,
            "engine": yolo_res.get("engine", "YOLOv11n"),
            "detections": detections,
            "vehicle_count": yolo_res["vehicle_count"],
            "pedestrian_count": yolo_res["pedestrian_count"],
            "defect_detected": defect_res["type"] if defect_res else None,
            "anpr_detected": anpr_res["plate"] if anpr_res else None,
            "inference_time_ms": yolo_res["inference_time_ms"],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "detections": [],
            "vehicle_count": 0,
            "pedestrian_count": 0,
            "inference_time_ms": 14.2
        }

@router.post("/process-upload")
async def process_uploaded_image(
    file: UploadFile = File(...),
    bus_id: str = Form("ASTRA-103"),
    camera_channel: str = Form("FRONT_BUMPER"),
    db: Session = Depends(get_db)
):
    """Processes an uploaded image with YOLOv11n."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Could not decode uploaded image"}

    yolo_res = yolo_detector.detect(frame)
    return {
        "status": "success",
        "bus_id": bus_id,
        "camera_channel": camera_channel,
        "filename": file.filename,
        "engine": yolo_res.get("engine", "YOLOv11n"),
        "detections": yolo_res["detections"],
        "vehicle_count": yolo_res["vehicle_count"],
        "pedestrian_count": yolo_res["pedestrian_count"],
        "inference_time_ms": yolo_res["inference_time_ms"]
    }
