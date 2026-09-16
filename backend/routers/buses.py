from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Bus
from schemas import BusBase
from services.bus_simulator import bus_fleet_simulator

router = APIRouter(prefix="/api/buses", tags=["buses"])

@router.get("", response_model=List[BusBase])
def get_all_buses(db: Session = Depends(get_db)):
    """Returns the current live status and telemetry of all buses in the fleet."""
    # Priority to live in-memory simulator telemetry
    sim_buses = list(bus_fleet_simulator.buses.values())
    if sim_buses:
        return sim_buses
    return db.query(Bus).all()

@router.get("/{bus_id}", response_model=BusBase)
def get_bus_by_id(bus_id: str, db: Session = Depends(get_db)):
    if bus_id in bus_fleet_simulator.buses:
        return bus_fleet_simulator.buses[bus_id]
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail=f"Bus {bus_id} not found")
    return bus
