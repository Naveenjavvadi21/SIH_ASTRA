import asyncio
import json
import logging
import random
from datetime import datetime, timedelta
from database import SessionLocal
from models import Bus, RoadDefect, IncidentAlert, AIEvent
from services.bus_simulator import bus_fleet_simulator
from websocket_manager import ws_manager

logger = logging.getLogger("astra_simulator")

# Seed initial defects in Vijayawada
INITIAL_DEFECTS = [
    {
        "id": "DEF-P-101",
        "type": "pothole",
        "severity": "CRITICAL",
        "priority": "HIGH",
        "confidence": 0.96,
        "lat": 16.5020,
        "lng": 80.6580,
        "address": "MG Road near DV Manor",
        "ward": "Ward 12 - Central Zone",
        "recurrence_count": 4,
        "detected_by": json.dumps(["ASTRA-101", "ASTRA-103", "ASTRA-105"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-P-104",
        "type": "pothole",
        "severity": "HIGH",
        "priority": "HIGH",
        "confidence": 0.94,
        "lat": 16.5074,
        "lng": 80.6482,
        "address": "Sub-Collector Office Jn",
        "ward": "Ward 14 - East Zone",
        "recurrence_count": 3,
        "detected_by": json.dumps(["ASTRA-101", "ASTRA-103"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-P-108",
        "type": "pothole",
        "severity": "MEDIUM",
        "priority": "MEDIUM",
        "confidence": 0.91,
        "lat": 16.5145,
        "lng": 80.6275,
        "address": "Governorpet 5-Roads Junction",
        "ward": "Ward 08 - North Zone",
        "recurrence_count": 2,
        "detected_by": json.dumps(["ASTRA-101", "ASTRA-104"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-P-112",
        "type": "pothole",
        "severity": "LOW",
        "priority": "LOW",
        "confidence": 0.88,
        "lat": 16.4950,
        "lng": 80.6720,
        "address": "Patamata High School Road",
        "ward": "Ward 19 - East Zone",
        "recurrence_count": 1,
        "detected_by": json.dumps(["ASTRA-101"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-W-201",
        "type": "waterlogging",
        "severity": "CRITICAL",
        "priority": "HIGH",
        "confidence": 0.97,
        "lat": 16.5060,
        "lng": 80.6050,
        "address": "Prakasam Barrage North Ramp",
        "ward": "Ward 03 - Riverfront Zone",
        "recurrence_count": 4,
        "detected_by": json.dumps(["ASTRA-102", "ASTRA-103"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-W-204",
        "type": "waterlogging",
        "severity": "HIGH",
        "priority": "MEDIUM",
        "confidence": 0.92,
        "lat": 16.4890,
        "lng": 80.6110,
        "address": "Tadepalli Underpass Submerged",
        "ward": "Ward 02 - South Zone",
        "recurrence_count": 2,
        "detected_by": json.dumps(["ASTRA-102"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-S-301",
        "type": "missing_signage",
        "severity": "LOW",
        "priority": "LOW",
        "confidence": 0.89,
        "lat": 16.5245,
        "lng": 80.6475,
        "address": "Machavaram Down School Zone",
        "ward": "Ward 22 - North Zone",
        "recurrence_count": 1,
        "detected_by": json.dumps(["ASTRA-104"]),
        "status": "OPEN"
    },
    {
        "id": "DEF-S-303",
        "type": "missing_signage",
        "severity": "MEDIUM",
        "priority": "MEDIUM",
        "confidence": 0.93,
        "lat": 16.4750,
        "lng": 80.6550,
        "address": "Kanuru Center Speed Limit Post",
        "ward": "Ward 28 - Outer Zone",
        "recurrence_count": 2,
        "detected_by": json.dumps(["ASTRA-105"]),
        "status": "OPEN"
    }
]

INITIAL_ALERTS = [
    {
        "id": "INC-2026-081",
        "type": "HIT_AND_RUN",
        "title": "🚨 Hit & Run with Two-Wheeler",
        "license_plate": "AP 37 AB 4821",
        "confidence": 0.942,
        "bus_id": "ASTRA-103",
        "timestamp": datetime.utcnow() - timedelta(minutes=14),
        "lat": 16.4998,
        "lng": 80.6625,
        "location_name": "Benz Circle Flyover Underpass",
        "status": "OPEN",
        "notes": "Red hatchback collided with scooter and fled towards Ring Road."
    },
    {
        "id": "INC-2026-080",
        "type": "ILLEGAL_PARKING",
        "title": "⛔ BRTS Dedicated Bus Lane Blocked",
        "license_plate": "AP 16 TX 7780",
        "confidence": 0.915,
        "bus_id": "ASTRA-101",
        "timestamp": datetime.utcnow() - timedelta(minutes=42),
        "lat": 16.5145,
        "lng": 80.6275,
        "location_name": "Governorpet Commercial Corridor",
        "status": "REVIEWED",
        "notes": "Commercial loading truck parked inside rapid bus lane during peak hour."
    },
    {
        "id": "INC-2026-079",
        "type": "WATERLOGGED_ROAD",
        "title": "🌊 Flash Flood Inundation Alert",
        "license_plate": "N/A",
        "confidence": 0.968,
        "bus_id": "ASTRA-102",
        "timestamp": datetime.utcnow() - timedelta(minutes=68),
        "lat": 16.5060,
        "lng": 80.6050,
        "location_name": "Prakasam Barrage Approach Road",
        "status": "DISPATCHED",
        "notes": "Water depth measured > 22cm by optical edge gauge. Traffic diverted."
    },
    {
        "id": "INC-2026-078",
        "type": "RECKLESS_DRIVING",
        "title": "⚠️ High-Speed Erratic Lane Weaving",
        "license_plate": "TS 09 UB 1042",
        "confidence": 0.934,
        "bus_id": "ASTRA-104",
        "timestamp": datetime.utcnow() - timedelta(minutes=95),
        "lat": 16.5220,
        "lng": 80.6370,
        "location_name": "Eluru Road Chuttugunta Circle",
        "status": "RESOLVED",
        "notes": "Traffic police interception unit dispatched; e-challan served."
    }
]

def seed_database():
    """Seeds SQLite database on first startup if tables are empty."""
    db = SessionLocal()
    try:
        # Seed buses if not existing
        if db.query(Bus).count() == 0:
            logger.info("Seeding virtual buses into database...")
            for bus_data in bus_fleet_simulator.buses.values():
                b = Bus(
                    id=bus_data["id"],
                    route_name=bus_data["route_name"],
                    plate_number=bus_data["plate_number"],
                    status=bus_data["status"],
                    lat=bus_data["lat"],
                    lng=bus_data["lng"],
                    heading=bus_data["heading"],
                    speed=bus_data["speed"],
                    occupancy=bus_data["occupancy"],
                    battery_or_fuel=bus_data["battery_or_fuel"],
                    ai_status="ACTIVE",
                    last_event="All onboard cameras streaming",
                    last_updated=datetime.utcnow()
                )
                db.add(b)
            db.commit()

        # Seed defects if not existing
        if db.query(RoadDefect).count() == 0:
            logger.info("Seeding road defects with recurrence data...")
            for defect_data in INITIAL_DEFECTS:
                d = RoadDefect(**defect_data)
                db.add(d)
            db.commit()

        # Seed incidents if not existing
        if db.query(IncidentAlert).count() == 0:
            logger.info("Seeding incident alerts...")
            for alert_data in INITIAL_ALERTS:
                a = IncidentAlert(**alert_data)
                db.add(a)
            db.commit()

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

async def run_simulation_loop():
    """
    Background simulation worker:
    1. Steps virtual buses every 2.5 seconds
    2. Syncs coordinates to DB
    3. Broadcasts telemetry via WebSocket
    4. Simulates recurrence detections and periodic incidents
    """
    counter = 0
    while True:
        try:
            counter += 1
            updated_buses = bus_fleet_simulator.step()

            # Broadcast bus telemetry
            await ws_manager.broadcast({
                "type": "bus_telemetry",
                "timestamp": datetime.utcnow().isoformat(),
                "data": updated_buses
            })

            # Sync bus state to DB periodically
            if counter % 4 == 0:
                db = SessionLocal()
                try:
                    for b in updated_buses:
                        db_bus = db.query(Bus).filter(Bus.id == b["id"]).first()
                        if db_bus:
                            db_bus.lat = b["lat"]
                            db_bus.lng = b["lng"]
                            db_bus.heading = b["heading"]
                            db_bus.speed = b["speed"]
                            db_bus.occupancy = b["occupancy"]
                            db_bus.status = b["status"]
                            db_bus.last_updated = datetime.utcnow()
                    db.commit()
                except Exception as db_err:
                    logger.error(f"DB bus sync error: {db_err}")
                finally:
                    db.close()

            # Every ~25 iterations (~60s), simulate a re-detection of an existing defect to demonstrate recurrence escalation
            if counter % 25 == 0:
                await _simulate_defect_recurrence()

        except Exception as e:
            logger.error(f"Simulation loop error: {e}")

        await asyncio.sleep(2.5)

async def _simulate_defect_recurrence():
    """Finds an open defect, increments recurrence count, updates priority, and broadcasts update."""
    db = SessionLocal()
    try:
        defects = db.query(RoadDefect).filter(RoadDefect.status == "OPEN").all()
        if defects:
            defect = random.choice(defects)
            detectors = json.loads(defect.detected_by) if defect.detected_by else []
            new_bus = random.choice(["ASTRA-101", "ASTRA-102", "ASTRA-103", "ASTRA-104", "ASTRA-105"])
            if new_bus not in detectors:
                detectors.append(new_bus)

            defect.recurrence_count += 1
            defect.detected_by = json.dumps(detectors)
            defect.last_detected = datetime.utcnow()

            # Recurrence escalation logic
            if defect.recurrence_count >= 3:
                defect.priority = "HIGH"
                defect.severity = "HIGH"
            elif defect.recurrence_count == 2:
                defect.priority = "MEDIUM"
            else:
                defect.priority = "LOW"

            db.commit()

            logger.info(f"Escalated defect {defect.id}: Recurrence={defect.recurrence_count}, Priority={defect.priority}")
            await ws_manager.broadcast({
                "type": "defect_update",
                "data": {
                    "id": defect.id,
                    "type": defect.type,
                    "recurrence_count": defect.recurrence_count,
                    "priority": defect.priority,
                    "severity": defect.severity,
                    "detected_by": detectors,
                    "lat": defect.lat,
                    "lng": defect.lng,
                    "address": defect.address
                }
            })
    except Exception as e:
        logger.error(f"Recurrence simulation error: {e}")
    finally:
        db.close()
