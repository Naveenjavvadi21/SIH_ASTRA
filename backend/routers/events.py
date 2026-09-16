import json
import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import RoadDefect
from schemas import RoadDefectBase
from websocket_manager import ws_manager

router = APIRouter(prefix="/api/events", tags=["events"])

class DefectStatusUpdate(BaseModel):
    status: str

class TriggerDefectRequest(BaseModel):
    type: Optional[str] = "pothole"
    bus_id: Optional[str] = "ASTRA-103"
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None

@router.get("/defects", response_model=List[RoadDefectBase])
def get_all_defects(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RoadDefect)
    if status:
        query = query.filter(RoadDefect.status == status)
    return query.all()

@router.patch("/defects/{defect_id}/status", response_model=RoadDefectBase)
def update_defect_status(defect_id: str, payload: DefectStatusUpdate, db: Session = Depends(get_db)):
    defect = db.query(RoadDefect).filter(RoadDefect.id == defect_id).first()
    if not defect:
        raise HTTPException(status_code=404, detail="Defect not found")
    defect.status = payload.status
    db.commit()
    db.refresh(defect)
    return defect

@router.post("/trigger-defect")
async def trigger_defect_detection(payload: TriggerDefectRequest, db: Session = Depends(get_db)):
    """
    Demo trigger: simulates an immediate onboard camera defect detection event.
    Clustering: If near an existing defect, increments recurrence count.
    """
    lat = payload.lat or round(16.50 + random.uniform(-0.02, 0.02), 4)
    lng = payload.lng or round(80.64 + random.uniform(-0.03, 0.03), 4)

    # Check for existing nearby defect within ~0.003 degrees (~300m)
    existing = db.query(RoadDefect).filter(
        RoadDefect.type == payload.type,
        RoadDefect.status == "OPEN"
    ).all()

    target_defect = None
    for d in existing:
        dist = ((d.lat - lat)**2 + (d.lng - lng)**2)**0.5
        if dist < 0.005:  # Close proximity match
            target_defect = d
            break

    if target_defect:
        detectors = json.loads(target_defect.detected_by) if target_defect.detected_by else []
        if payload.bus_id not in detectors:
            detectors.append(payload.bus_id)
        target_defect.recurrence_count += 1
        target_defect.detected_by = json.dumps(detectors)
        target_defect.last_detected = datetime.utcnow()
        if target_defect.recurrence_count >= 3:
            target_defect.priority = "HIGH"
            target_defect.severity = "HIGH"
        elif target_defect.recurrence_count == 2:
            target_defect.priority = "MEDIUM"

        db.commit()
        db.refresh(target_defect)

        await ws_manager.broadcast({
            "type": "defect_update",
            "data": {
                "id": target_defect.id,
                "type": target_defect.type,
                "recurrence_count": target_defect.recurrence_count,
                "priority": target_defect.priority,
                "severity": target_defect.severity,
                "detected_by": detectors,
                "lat": target_defect.lat,
                "lng": target_defect.lng,
                "address": target_defect.address
            }
        })
        return {"action": "recurrence_updated", "defect": target_defect}
    else:
        new_id = f"DEF-{payload.type[:1].upper()}-{random.randint(400, 999)}"
        new_defect = RoadDefect(
            id=new_id,
            type=payload.type,
            severity="MEDIUM" if payload.type != "pothole" else "HIGH",
            priority="LOW",
            confidence=round(random.uniform(0.91, 0.98), 2),
            lat=lat,
            lng=lng,
            address=payload.address or f"Corridor section near {payload.bus_id}",
            ward="Ward 16 - Central Zone",
            recurrence_count=1,
            detected_by=json.dumps([payload.bus_id]),
            status="OPEN"
        )
        db.add(new_defect)
        db.commit()
        db.refresh(new_defect)

        await ws_manager.broadcast({
            "type": "new_defect",
            "data": {
                "id": new_defect.id,
                "type": new_defect.type,
                "recurrence_count": 1,
                "priority": "LOW",
                "severity": new_defect.severity,
                "detected_by": [payload.bus_id],
                "lat": new_defect.lat,
                "lng": new_defect.lng,
                "address": new_defect.address
            }
        })
        return {"action": "new_defect_created", "defect": new_defect}
