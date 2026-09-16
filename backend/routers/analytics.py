from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Bus, RoadDefect, IncidentAlert
from services.bus_simulator import bus_fleet_simulator

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    active_buses = len(bus_fleet_simulator.buses)
    total_defects = db.query(RoadDefect).count()
    high_priority_defects = db.query(RoadDefect).filter(RoadDefect.priority == "HIGH").count()
    active_incidents = db.query(IncidentAlert).filter(IncidentAlert.status.in_(["OPEN", "REVIEWED", "DISPATCHED"])).count()
    total_incidents = db.query(IncidentAlert).count()

    return {
        "active_buses": active_buses,
        "total_buses": 5,
        "active_buses_status": "All systems operational",
        "total_defects": total_defects,
        "high_priority_defects": high_priority_defects,
        "active_incidents": active_incidents,
        "total_incidents": total_incidents,
        "avg_traffic_density": 62,  # vehicles/min
        "traffic_status": "Moderate Flow (Corridor Avg)",
        "routes_monitored": 5,
        "total_corridor_km": 142.8,
        "ai_events_today": 1845,
        "camera_uptime_percent": 99.4
    }

@router.get("/defects-by-type")
def get_defects_by_type(db: Session = Depends(get_db)):
    defects = db.query(RoadDefect).all()
    counts = {"pothole": 0, "waterlogging": 0, "missing_signage": 0}
    for d in defects:
        if d.type in counts:
            counts[d.type] += 1

    return [
        {"name": "Potholes", "type": "pothole", "count": counts["pothole"], "color": "#f97316"},
        {"name": "Waterlogging", "type": "waterlogging", "count": counts["waterlogging"], "color": "#0284c7"},
        {"name": "Missing Signage", "type": "missing_signage", "count": counts["missing_signage"], "color": "#eab308"}
    ]

@router.get("/recurrence-breakdown")
def get_recurrence_breakdown(db: Session = Depends(get_db)):
    defects = db.query(RoadDefect).all()
    breakdown = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for d in defects:
        p = d.priority.upper() if d.priority else "LOW"
        if p in breakdown:
            breakdown[p] += 1

    return [
        {"priority": "Low (1 Detection)", "level": "LOW", "count": breakdown["LOW"], "color": "#10b981"},
        {"priority": "Medium (2 Detections)", "level": "MEDIUM", "count": breakdown["MEDIUM"], "color": "#f59e0b"},
        {"priority": "High (3+ Detections)", "level": "HIGH", "count": breakdown["HIGH"], "color": "#ef4444"}
    ]

@router.get("/hourly-incidents")
def get_hourly_incidents():
    return [
        {"time": "06:00", "incidents": 1, "defects": 2, "traffic": 28},
        {"time": "08:00", "incidents": 3, "defects": 4, "traffic": 74},
        {"time": "10:00", "incidents": 5, "defects": 6, "traffic": 88},
        {"time": "12:00", "incidents": 2, "defects": 3, "traffic": 65},
        {"time": "14:00", "incidents": 2, "defects": 2, "traffic": 54},
        {"time": "16:00", "incidents": 4, "defects": 5, "traffic": 82},
        {"time": "18:00", "incidents": 7, "defects": 8, "traffic": 96},
        {"time": "20:00", "incidents": 3, "defects": 3, "traffic": 68},
    ]

@router.get("/fleet-metrics")
def get_fleet_metrics():
    return [
        {"bus_id": "ASTRA-101", "route": "Central Corridor", "km_monitored": 38.4, "ai_detections": 482, "health": "98%"},
        {"bus_id": "ASTRA-102", "route": "Riverfront Line", "km_monitored": 29.1, "ai_detections": 367, "health": "95%"},
        {"bus_id": "ASTRA-103", "route": "MG Road City Loop", "km_monitored": 34.6, "ai_detections": 512, "health": "99%"},
        {"bus_id": "ASTRA-104", "route": "Gunadala Line", "km_monitored": 22.8, "ai_detections": 294, "health": "94%"},
        {"bus_id": "ASTRA-105", "route": "NH-16 Link", "km_monitored": 41.2, "ai_detections": 410, "health": "97%"}
    ]

@router.get("/road-quality-index")
def get_road_quality_index():
    return [
        {"zone": "Ward 12 (Central)", "score": 64, "status": "Needs Maintenance", "color": "#f59e0b"},
        {"zone": "Ward 03 (Riverfront)", "score": 52, "status": "Vulnerable (Waterlogging)", "color": "#ef4444"},
        {"zone": "Ward 14 (East)", "score": 71, "status": "Fair", "color": "#3b82f6"},
        {"zone": "Ward 22 (North)", "score": 83, "status": "Good", "color": "#10b981"},
        {"zone": "Ward 28 (Outer NH)", "score": 88, "status": "Excellent", "color": "#10b981"}
    ]

@router.get("/congestion-corridors")
def get_congestion_corridors():
    return [
        {"corridor": "MG Road (DV Manor - Benz Circle)", "level": "HIGH", "vehicles_per_min": 92, "speed_avg": "18 km/h"},
        {"corridor": "Prakasam Barrage Approach", "level": "MEDIUM", "vehicles_per_min": 64, "speed_avg": "24 km/h"},
        {"corridor": "Governorpet 5-Roads", "level": "HIGH", "vehicles_per_min": 86, "speed_avg": "16 km/h"},
        {"corridor": "Eluru Road Chuttugunta", "level": "MEDIUM", "vehicles_per_min": 58, "speed_avg": "28 km/h"},
        {"corridor": "NH-16 Outer Bypass", "level": "LOW", "vehicles_per_min": 32, "speed_avg": "48 km/h"}
    ]
