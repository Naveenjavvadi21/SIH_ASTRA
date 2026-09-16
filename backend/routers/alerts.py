import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import IncidentAlert
from schemas import IncidentAlertBase, IncidentStatusUpdate
from services.pdf_report import generate_incident_pdf
from websocket_manager import ws_manager

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

class TriggerIncidentRequest(BaseModel):
    type: Optional[str] = "HIT_AND_RUN"
    license_plate: Optional[str] = "AP 37 AB 4821"
    bus_id: Optional[str] = "ASTRA-103"
    location_name: Optional[str] = "Benz Circle Flyover Underpass"

@router.get("", response_model=List[IncidentAlertBase])
def get_all_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(IncidentAlert).order_by(IncidentAlert.timestamp.desc())
    if status:
        query = query.filter(IncidentAlert.status == status)
    return query.all()

@router.get("/{alert_id}", response_model=IncidentAlertBase)
def get_alert_by_id(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(IncidentAlert).filter(IncidentAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Incident alert not found")
    return alert

@router.patch("/{alert_id}", response_model=IncidentAlertBase)
def update_alert_status(alert_id: str, payload: IncidentStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(IncidentAlert).filter(IncidentAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Incident alert not found")
    alert.status = payload.status
    if payload.notes is not None:
        alert.notes = payload.notes
    db.commit()
    db.refresh(alert)
    return alert

@router.get("/{alert_id}/pdf")
def export_incident_pdf(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(IncidentAlert).filter(IncidentAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Incident alert not found")

    incident_dict = {
        "id": alert.id,
        "type": alert.type,
        "title": alert.title,
        "license_plate": alert.license_plate,
        "confidence": alert.confidence,
        "bus_id": alert.bus_id,
        "timestamp": alert.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if alert.timestamp else "N/A",
        "lat": alert.lat,
        "lng": alert.lng,
        "location_name": alert.location_name,
        "status": alert.status,
        "notes": alert.notes
    }

    pdf_buffer = generate_incident_pdf(incident_dict)
    filename = f"ASTRA_Incident_{alert.id}.pdf"
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.post("/trigger")
async def trigger_live_incident(payload: TriggerIncidentRequest, db: Session = Depends(get_db)):
    """Triggers an immediate incident alert for judging demonstration and broadcasts via WebSocket."""
    titles = {
        "HIT_AND_RUN": "🚨 Hit & Run with Two-Wheeler",
        "ILLEGAL_PARKING": "⛔ Bus Rapid Transit Corridor Blocked",
        "RECKLESS_DRIVING": "⚠️ Dangerous Overtaking & Lane Weaving",
        "WATERLOGGED_ROAD": "🌊 Critical Underpass Waterlogging",
        "HAZARD_OBSTRUCTION": "⚠️ Fallen Debris on Main Carriage Way"
    }

    inc_id = f"INC-2026-{random.randint(100, 999)}"
    new_alert = IncidentAlert(
        id=inc_id,
        type=payload.type,
        title=titles.get(payload.type, "🚨 Urgent Municipal Incident"),
        license_plate=payload.license_plate or "AP 37 AB 4821",
        confidence=round(random.uniform(0.92, 0.98), 3),
        bus_id=payload.bus_id or "ASTRA-103",
        timestamp=datetime.utcnow(),
        lat=round(16.50 + random.uniform(-0.015, 0.015), 4),
        lng=round(80.64 + random.uniform(-0.02, 0.02), 4),
        location_name=payload.location_name or "Vijayawada Central Corridor",
        status="OPEN",
        notes="Automated edge event captured by bus onboard camera vision module."
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    # Broadcast via WebSocket with pulse trigger
    await ws_manager.broadcast({
        "type": "new_alert",
        "data": {
            "id": new_alert.id,
            "type": new_alert.type,
            "title": new_alert.title,
            "license_plate": new_alert.license_plate,
            "confidence": new_alert.confidence,
            "bus_id": new_alert.bus_id,
            "timestamp": new_alert.timestamp.isoformat(),
            "lat": new_alert.lat,
            "lng": new_alert.lng,
            "location_name": new_alert.location_name,
            "status": new_alert.status,
            "pulse": True
        }
    })

    return {"status": "success", "alert": new_alert}
