from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from database import Base

class Bus(Base):
    __tablename__ = "buses"

    id = Column(String, primary_key=True, index=True)
    route_name = Column(String, nullable=False)
    plate_number = Column(String, nullable=False)
    status = Column(String, default="IN_TRANSIT")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    heading = Column(Float, default=0.0)
    speed = Column(Float, default=30.0)
    occupancy = Column(Integer, default=50)
    battery_or_fuel = Column(Integer, default=85)
    ai_status = Column(String, default="ACTIVE")
    last_event = Column(String, default="All systems operational")
    last_updated = Column(DateTime, default=datetime.utcnow)

class RoadDefect(Base):
    __tablename__ = "road_defects"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)  # pothole, waterlogging, missing_signage
    severity = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    priority = Column(String, default="LOW")  # LOW, MEDIUM, HIGH
    confidence = Column(Float, default=0.90)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String, default="Urban Corridor")
    ward = Column(String, default="Zone 1")
    recurrence_count = Column(Integer, default=1)
    detected_by = Column(Text, default="[]")  # JSON string array e.g. ["ASTRA-101", "ASTRA-103"]
    first_detected = Column(DateTime, default=datetime.utcnow)
    last_detected = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="OPEN")  # OPEN, IN_PROGRESS, REPAIRED
    image_snapshot = Column(Text, nullable=True)

class IncidentAlert(Base):
    __tablename__ = "incident_alerts"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)  # HIT_AND_RUN, ILLEGAL_PARKING, RECKLESS_DRIVING, WATERLOGGED_ROAD, HAZARD_OBSTRUCTION
    title = Column(String, nullable=False)
    license_plate = Column(String, default="UNKNOWN")
    confidence = Column(Float, default=0.92)
    bus_id = Column(String, default="ASTRA-101")
    timestamp = Column(DateTime, default=datetime.utcnow)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    location_name = Column(String, default="Central City Area")
    status = Column(String, default="OPEN")  # OPEN, REVIEWED, DISPATCHED, RESOLVED
    evidence_snapshot = Column(Text, nullable=True)
    notes = Column(Text, default="")

class AIEvent(Base):
    __tablename__ = "ai_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    bus_id = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    confidence = Column(Float, default=0.90)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    snapshot = Column(Text, nullable=True)
