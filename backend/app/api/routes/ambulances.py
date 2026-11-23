from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.core.security import get_current_user, require_role
from app.db.base import get_db
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.driver import Driver
from app.models.location import LocationHistory
from app.models.user import User, UserRole
from app.schemas.ambulance import AmbulanceCreate, AmbulanceLocationUpdate, AmbulanceResponse, AmbulanceUpdate
from app.websocket.manager import ws_manager

router = APIRouter()


@router.get("", response_model=List[AmbulanceResponse])
def list_ambulances(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Ambulance).all()


@router.post("", response_model=AmbulanceResponse, status_code=201)
def create_ambulance(
    data: AmbulanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    existing = db.query(Ambulance).filter(Ambulance.vehicle_number == data.vehicle_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle number already registered")
    ambulance = Ambulance(**data.model_dump())
    db.add(ambulance)
    db.commit()
    db.refresh(ambulance)
    return ambulance


@router.get("/{ambulance_id}", response_model=AmbulanceResponse)
def get_ambulance(ambulance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb


@router.put("/{ambulance_id}", response_model=AmbulanceResponse)
def update_ambulance(
    ambulance_id: int,
    data: AmbulanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(amb, k, v)
    db.commit()
    db.refresh(amb)
    return amb


@router.put("/{ambulance_id}/location", response_model=AmbulanceResponse)
async def update_ambulance_location(
    ambulance_id: int,
    data: AmbulanceLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    # Drivers can only update their assigned ambulance
    if current_user.role == UserRole.driver:
        driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
        if not driver or driver.assigned_ambulance_id != ambulance_id:
            raise HTTPException(status_code=403, detail="Not your ambulance")

    amb.latitude = data.latitude
    amb.longitude = data.longitude
    amb.last_location_update = datetime.now(timezone.utc)

    # Store location history
    history = LocationHistory(
        ambulance_id=ambulance_id,
        latitude=data.latitude,
        longitude=data.longitude,
    )
    db.add(history)
    db.commit()
    db.refresh(amb)

    # Broadcast via WebSocket
    await ws_manager.broadcast_to_ambulance(
        ambulance_id,
        {
            "event": "location_update",
            "ambulance_id": ambulance_id,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "is_simulated": data.is_simulated,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": "⚠️ SIMULATED GPS – Demo Mode" if data.is_simulated else None,
        },
    )
    return amb


@router.put("/{ambulance_id}/availability")
def update_availability(
    ambulance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    if amb.status == AmbulanceStatus.AVAILABLE:
        amb.status = AmbulanceStatus.OUT_OF_SERVICE
    elif amb.status == AmbulanceStatus.OUT_OF_SERVICE:
        amb.status = AmbulanceStatus.AVAILABLE
    else:
        raise HTTPException(status_code=400, detail="Cannot toggle availability while ambulance is on duty")

    db.commit()
    db.refresh(amb)
    return {"status": amb.status, "ambulance_id": ambulance_id}
