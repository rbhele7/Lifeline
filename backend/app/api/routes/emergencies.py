from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.base import get_db
from app.models.emergency import EmergencyRequest, EmergencyStatus, HospitalNotification, HospitalNotificationStatus
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.emergency import EmergencyCreate, EmergencyResponse, EmergencyStatusUpdate
from app.services.ambulance_service import dispatch_ambulance
from app.services.notification_service import create_audit_log, create_emergency_notification
from app.websocket.manager import ws_manager

router = APIRouter()


@router.post("", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
async def create_emergency(
    data: EmergencyCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    emergency = EmergencyRequest(
        patient_id=patient.id,
        emergency_type=data.emergency_type,
        severity=data.severity,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        contact_name=data.contact_name,
        contact_phone=data.contact_phone,
        status=EmergencyStatus.REPORTED,
    )
    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    # Trigger dispatch in background
    async def run_dispatch():
        result = await dispatch_ambulance(db, emergency.id)
        await ws_manager.broadcast_to_emergency(
            emergency.id,
            {"event": "status_update", "status": "AMBULANCE_ASSIGNED" if result["success"] else "NO_AMBULANCE_AVAILABLE"},
        )
        if result["success"] and patient.user_id:
            create_emergency_notification(db, patient.user_id, emergency.id, "AMBULANCE_ASSIGNED")

    background_tasks.add_task(run_dispatch)
    return emergency


@router.get("", response_model=List[EmergencyResponse])
def list_emergencies(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(EmergencyRequest)

    if current_user.role == UserRole.patient:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if patient:
            query = query.filter(EmergencyRequest.patient_id == patient.id)
    elif current_user.role not in [UserRole.super_admin, UserRole.hospital_admin]:
        raise HTTPException(status_code=403, detail="Access denied")

    if status_filter:
        query = query.filter(EmergencyRequest.status == status_filter)

    return query.order_by(EmergencyRequest.created_at.desc()).all()


@router.get("/{emergency_id}", response_model=EmergencyResponse)
def get_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    # Patients can only see their own emergencies
    if current_user.role == UserRole.patient:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or emergency.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return emergency


@router.put("/{emergency_id}/status", response_model=EmergencyResponse)
async def update_emergency_status(
    emergency_id: int,
    update: EmergencyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    prev_status = emergency.status
    emergency.status = update.status
    emergency.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(emergency)

    # Audit log
    create_audit_log(
        db=db,
        emergency_id=emergency_id,
        action="STATUS_UPDATE",
        prev_status=str(prev_status),
        new_status=str(update.status),
        performed_by=current_user.id,
        details=update.details,
    )

    # Notify patient
    if emergency.patient and emergency.patient.user_id:
        event_map = {
            EmergencyStatus.DRIVER_ACCEPTED: "DRIVER_ACCEPTED",
            EmergencyStatus.EN_ROUTE_TO_PATIENT: "EN_ROUTE",
            EmergencyStatus.AT_PICKUP: "AT_PICKUP",
            EmergencyStatus.COMPLETED: "COMPLETED",
        }
        event = event_map.get(update.status)
        if event:
            create_emergency_notification(db, emergency.patient.user_id, emergency_id, event)

    await ws_manager.broadcast_to_emergency(
        emergency_id,
        {"event": "status_update", "status": update.status, "emergency_id": emergency_id},
    )
    return emergency


@router.post("/{emergency_id}/cancel", response_model=EmergencyResponse)
async def cancel_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    if current_user.role == UserRole.patient:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or emergency.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")

    if emergency.status == EmergencyStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed emergency")

    emergency.status = EmergencyStatus.CANCELLED
    emergency.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(emergency)

    await ws_manager.broadcast_to_emergency(
        emergency_id, {"event": "cancelled", "emergency_id": emergency_id}
    )
    return emergency
