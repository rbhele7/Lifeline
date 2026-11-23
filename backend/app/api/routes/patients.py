from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.base import get_db
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.models.emergency import EmergencyRequest

router = APIRouter()


@router.get("/profile")
def get_patient_profile(db: Session = Depends(get_db), current_user: User = Depends(require_role(UserRole.patient))):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "emergency_contact": patient.emergency_contact,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
    }


@router.put("/profile")
def update_patient_profile(
    update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.patient)),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    if "emergency_contact" in update:
        patient.emergency_contact = update["emergency_contact"]
    if "full_name" in update:
        current_user.full_name = update["full_name"]
    if "phone" in update:
        current_user.phone = update["phone"]

    db.commit()
    return {"message": "Profile updated"}


@router.get("/emergencies")
def get_patient_emergencies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.patient)),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return []

    emergencies = (
        db.query(EmergencyRequest)
        .filter(EmergencyRequest.patient_id == patient.id)
        .order_by(EmergencyRequest.created_at.desc())
        .all()
    )

    result = []
    for e in emergencies:
        active_assignment = next(
            (a for a in e.assignments if a.status in ["PENDING", "ACCEPTED"]), None
        )
        result.append({
            "id": e.id,
            "type": e.emergency_type,
            "severity": e.severity,
            "status": e.status,
            "created_at": e.created_at,
            "updated_at": e.updated_at,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "description": e.description,
            "assignment": {
                "ambulance_id": active_assignment.ambulance_id,
                "estimated_arrival_minutes": active_assignment.estimated_arrival_minutes,
                "distance_km": active_assignment.distance_km,
                "status": active_assignment.status,
                "ambulance": {
                    "vehicle_number": active_assignment.ambulance.vehicle_number,
                    "latitude": active_assignment.ambulance.latitude,
                    "longitude": active_assignment.ambulance.longitude,
                    "status": active_assignment.ambulance.status,
                } if active_assignment.ambulance else None,
            } if active_assignment else None,
        })
    return result
