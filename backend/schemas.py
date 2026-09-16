from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class BusBase(BaseModel):
    id: str
    route_name: str
    plate_number: str
    status: str
    lat: float
    lng: float
    heading: float
    speed: float
    occupancy: int
    battery_or_fuel: int
    ai_status: str
    last_event: str
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RoadDefectBase(BaseModel):
    id: str
    type: str
    severity: str
    priority: str
    confidence: float
    lat: float
    lng: float
    address: str
    ward: str
    recurrence_count: int
    detected_by: str
    first_detected: Optional[datetime] = None
    last_detected: Optional[datetime] = None
    status: str
    image_snapshot: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class IncidentAlertBase(BaseModel):
    id: str
    type: str
    title: str
    license_plate: str
    confidence: float
    bus_id: str
    timestamp: Optional[datetime] = None
    lat: float
    lng: float
    location_name: str
    status: str
    evidence_snapshot: Optional[str] = None
    notes: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)

class IncidentStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class AIEventCreate(BaseModel):
    bus_id: str
    class_name: str
    confidence: float
    lat: float
    lng: float
    snapshot: Optional[str] = None

class DetectionBox(BaseModel):
    bbox: List[float]  # [ymin, xmin, ymax, xmax] normalized or [x1, y1, x2, y2]
    class_name: str
    confidence: float
    color: str

class DetectionResponse(BaseModel):
    type: str
    detections: List[DetectionBox]
    vehicle_count: int
    pedestrian_count: int
    anpr_detected: Optional[str] = None
    defect_detected: Optional[str] = None
    inference_time_ms: float
    bus_id: str
    timestamp: str
    lat: float
    lng: float
