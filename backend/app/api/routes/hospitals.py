from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.base import get_db
from app.models.emergency import HospitalNotification, HospitalNotificationStatus, EmergencyRequest, EmergencyStatus
from app.models.hospital import Hospital, HospitalCapacity, HospitalFacility
from app.models.user import User, UserRole
from app.schemas.hospital import HospitalCapacityUpdate, HospitalCreate, HospitalFacilitiesUpdate, HospitalResponse
from app.services.hospital_service import recommend_hospitals
from app.services.notification_service import create_audit_log, create_notification
from app.websocket.manager import ws_manager

router = APIRouter()


@router.get("", response_model=List[HospitalResponse])
def list_hospitals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Hospital).filter(Hospital.is_active == True).all()


@router.post("", response_model=HospitalResponse, status_code=201)
def create_hospital(
    data: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    hospital = Hospital(**data.model_dump())
    db.add(hospital)
    db.flush()
    # Initialize capacity
    capacity = HospitalCapacity(hospital_id=hospital.id, total_beds=50, available_beds=20)
    db.add(capacity)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.get("/recommend")
async def get_recommendations(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    # Use ambulance location if assigned, else patient location
    lat, lon = emergency.latitude, emergency.longitude
    if emergency.assignments:
        active = next((a for a in emergency.assignments if a.status in ["PENDING", "ACCEPTED"]), None)
        if active and active.ambulance and active.ambulance.latitude:
            lat, lon = active.ambulance.latitude, active.ambulance.longitude

    recommendations = await recommend_hospitals(db, lat, lon, emergency.emergency_type, limit=5)

    result = []
    for r in recommendations:
        h = r["hospital"]
        result.append({
            "hospital_id": h.id,
            "name": h.name,
            "address": h.address,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "distance_km": round(r["distance_km"], 2),
            "duration_minutes": round(r["duration_minutes"], 1),
            "is_estimated": r["is_estimated"],
            "available_beds": r["available_beds"],
            "matched_facilities": r["matched_facilities"],
            "recommendation_score": round(r["recommendation_score"], 3),
            "facilities": [{"name": f.facility_name, "available": f.is_available} for f in h.facilities],
        })
    return result


@router.get("/{hospital_id}")
def get_hospital(hospital_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {
        "id": h.id, "name": h.name, "address": h.address,
        "latitude": h.latitude, "longitude": h.longitude,
        "contact_number": h.contact_number, "is_active": h.is_active,
        "facilities": [{"id": f.id, "name": f.facility_name, "available": f.is_available} for f in h.facilities],
        "capacity": {"total_beds": h.capacity.total_beds, "available_beds": h.capacity.available_beds,
                     "last_updated": h.capacity.last_updated} if h.capacity else None,
    }


@router.put("/{hospital_id}/capacity")
def update_capacity(
    hospital_id: int,
    data: HospitalCapacityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if h.capacity:
        h.capacity.total_beds = data.total_beds
        h.capacity.available_beds = data.available_beds
        h.capacity.last_updated = datetime.now(timezone.utc)
    else:
        cap = HospitalCapacity(
            hospital_id=hospital_id,
            total_beds=data.total_beds,
            available_beds=data.available_beds,
        )
        db.add(cap)
    db.commit()
    return {"message": "Capacity updated", "total_beds": data.total_beds, "available_beds": data.available_beds}


@router.put("/{hospital_id}/facilities")
def update_facilities(
    hospital_id: int,
    data: HospitalFacilitiesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Remove existing, add new
    db.query(HospitalFacility).filter(HospitalFacility.hospital_id == hospital_id).delete()
    for f in data.facilities:
        facility = HospitalFacility(hospital_id=hospital_id, facility_name=f.facility_name, is_available=f.is_available)
        db.add(facility)
    db.commit()
    return {"message": "Facilities updated", "count": len(data.facilities)}


@router.get("/{hospital_id}/emergencies")
def get_hospital_emergencies(
    hospital_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = (
        db.query(HospitalNotification)
        .filter(HospitalNotification.hospital_id == hospital_id)
        .order_by(HospitalNotification.created_at.desc())
        .all()
    )
    result = []
    for n in notifications:
        e = n.emergency
        result.append({
            "notification_id": n.id,
            "status": n.status,
            "created_at": n.created_at,
            "estimated_arrival_minutes": n.estimated_arrival_minutes,
            "emergency": {
                "id": e.id, "type": e.emergency_type, "severity": e.severity,
                "status": e.status, "created_at": e.created_at, "description": e.description,
            } if e else None,
        })
    return result


@router.post("/{hospital_id}/emergencies/{emergency_id}/accept")
async def accept_emergency(
    hospital_id: int,
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(HospitalNotification)
        .filter(
            HospitalNotification.hospital_id == hospital_id,
            HospitalNotification.emergency_id == emergency_id,
        )
        .first()
    )
    if not notification:
        # Create notification if doesn't exist (manual accept)
        notification = HospitalNotification(
            hospital_id=hospital_id,
            emergency_id=emergency_id,
            status=HospitalNotificationStatus.PENDING,
        )
        db.add(notification)
        db.flush()

    notification.status = HospitalNotificationStatus.ACCEPTED
    notification.response_time = datetime.now(timezone.utc)

    # Notify patient about hospital acceptance
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if emergency and emergency.patient and emergency.patient.user_id:
        create_notification(
            db, emergency.patient.user_id,
            "Hospital Accepted",
            f"A hospital has accepted your emergency #{emergency_id} and is preparing to receive you.",
        )

    create_audit_log(db, emergency_id, "HOSPITAL_ACCEPTED", "PENDING", "ACCEPTED", current_user.id)
    db.commit()

    await ws_manager.broadcast_to_emergency(
        emergency_id,
        {"event": "hospital_accepted", "hospital_id": hospital_id, "emergency_id": emergency_id},
    )
    return {"message": "Emergency accepted by hospital"}


@router.post("/{hospital_id}/emergencies/{emergency_id}/reject")
async def reject_emergency(
    hospital_id: int,
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(HospitalNotification)
        .filter(
            HospitalNotification.hospital_id == hospital_id,
            HospitalNotification.emergency_id == emergency_id,
        )
        .first()
    )
    if notification:
        notification.status = HospitalNotificationStatus.REJECTED
        notification.response_time = datetime.now(timezone.utc)
        create_audit_log(db, emergency_id, "HOSPITAL_REJECTED", "PENDING", "REJECTED", current_user.id)
        db.commit()

    await ws_manager.broadcast_to_emergency(
        emergency_id,
        {"event": "hospital_rejected", "hospital_id": hospital_id},
    )
    return {"message": "Emergency rejected by hospital"}
