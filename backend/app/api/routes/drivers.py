from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.base import get_db
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.driver import Driver
from app.models.emergency import AmbulanceAssignment, AssignmentStatus
from app.models.user import User, UserRole

router = APIRouter()


@router.get("/profile")
def get_driver_profile(db: Session = Depends(get_db), current_user: User = Depends(require_role(UserRole.driver))):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    return {
        "id": driver.id,
        "user_id": driver.user_id,
        "license_number": driver.license_number,
        "assigned_ambulance_id": driver.assigned_ambulance_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "ambulance": {
            "id": driver.ambulance.id,
            "vehicle_number": driver.ambulance.vehicle_number,
            "status": driver.ambulance.status,
            "latitude": driver.ambulance.latitude,
            "longitude": driver.ambulance.longitude,
        } if driver.ambulance else None,
    }


@router.get("/assignments")
def get_driver_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver)),
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or not driver.assigned_ambulance_id:
        return []

    assignments = (
        db.query(AmbulanceAssignment)
        .filter(AmbulanceAssignment.ambulance_id == driver.assigned_ambulance_id)
        .order_by(AmbulanceAssignment.assigned_at.desc())
        .all()
    )

    result = []
    for a in assignments:
        e = a.emergency
        result.append({
            "assignment_id": a.id,
            "status": a.status,
            "assigned_at": a.assigned_at,
            "accepted_at": a.accepted_at,
            "completed_at": a.completed_at,
            "estimated_arrival_minutes": a.estimated_arrival_minutes,
            "distance_km": a.distance_km,
            "emergency": {
                "id": e.id,
                "type": e.emergency_type,
                "severity": e.severity,
                "status": e.status,
                "latitude": e.latitude,
                "longitude": e.longitude,
                "contact_name": e.contact_name,
                "contact_phone": e.contact_phone,
                "description": e.description,
                "created_at": e.created_at,
            } if e else None,
        })
    return result


@router.get("/active-assignment")
def get_active_assignment(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver)),
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or not driver.assigned_ambulance_id:
        return None

    assignment = (
        db.query(AmbulanceAssignment)
        .filter(
            AmbulanceAssignment.ambulance_id == driver.assigned_ambulance_id,
            AmbulanceAssignment.status.in_([AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED]),
        )
        .order_by(AmbulanceAssignment.assigned_at.desc())
        .first()
    )
    if not assignment:
        return None

    e = assignment.emergency
    return {
        "assignment_id": assignment.id,
        "status": assignment.status,
        "estimated_arrival_minutes": assignment.estimated_arrival_minutes,
        "distance_km": assignment.distance_km,
        "emergency": {
            "id": e.id, "type": e.emergency_type, "severity": e.severity,
            "status": e.status, "latitude": e.latitude, "longitude": e.longitude,
            "contact_name": e.contact_name, "contact_phone": e.contact_phone,
        } if e else None,
    }


@router.put("/status")
def update_driver_status(
    available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver)),
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or not driver.assigned_ambulance_id:
        raise HTTPException(status_code=404, detail="No ambulance assigned")

    amb = db.query(Ambulance).filter(Ambulance.id == driver.assigned_ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    if amb.status not in [AmbulanceStatus.AVAILABLE, AmbulanceStatus.OUT_OF_SERVICE]:
        raise HTTPException(status_code=400, detail="Cannot change status while on duty")

    amb.status = AmbulanceStatus.AVAILABLE if available else AmbulanceStatus.OUT_OF_SERVICE
    db.commit()
    return {"status": amb.status}
