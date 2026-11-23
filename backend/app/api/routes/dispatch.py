from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.base import get_db
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.driver import Driver
from app.models.emergency import AmbulanceAssignment, AssignmentStatus, EmergencyRequest, EmergencyStatus
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.services.ambulance_service import dispatch_ambulance
from app.services.notification_service import create_audit_log, create_emergency_notification, create_notification
from app.websocket.manager import ws_manager

router = APIRouter()


@router.post("/dispatch/{emergency_id}")
async def trigger_dispatch(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    result = await dispatch_ambulance(db, emergency_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return {
        "message": "Ambulance dispatched successfully",
        "assignment_id": result["assignment"].id,
        "estimated_arrival_minutes": result["estimated_arrival_minutes"],
        "distance_km": result["distance_km"],
        "is_estimated": result["is_estimated"],
    }


@router.get("/dispatch/{emergency_id}")
def get_dispatch(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(AmbulanceAssignment)
        .filter(
            AmbulanceAssignment.emergency_id == emergency_id,
            AmbulanceAssignment.status.in_([AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED]),
        )
        .order_by(AmbulanceAssignment.assigned_at.desc())
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="No active assignment found")
    return {
        "assignment_id": assignment.id,
        "ambulance_id": assignment.ambulance_id,
        "status": assignment.status,
        "assigned_at": assignment.assigned_at,
        "accepted_at": assignment.accepted_at,
        "estimated_arrival_minutes": assignment.estimated_arrival_minutes,
        "distance_km": assignment.distance_km,
        "ambulance": assignment.ambulance,
    }


@router.post("/assignments/{assignment_id}/accept")
async def accept_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver)),
):
    assignment = db.query(AmbulanceAssignment).filter(AmbulanceAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Verify driver owns this ambulance
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or assignment.ambulance_id != driver.assigned_ambulance_id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this assignment")

    if assignment.status != AssignmentStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Assignment is already {assignment.status}")

    assignment.status = AssignmentStatus.ACCEPTED
    assignment.accepted_at = datetime.now(timezone.utc)

    # Update emergency status
    emergency = assignment.emergency
    if emergency:
        emergency.status = EmergencyStatus.DRIVER_ACCEPTED
        emergency.updated_at = datetime.now(timezone.utc)

        # Notify patient
        if emergency.patient and emergency.patient.user_id:
            create_emergency_notification(db, emergency.patient.user_id, emergency.id, "DRIVER_ACCEPTED")

        create_audit_log(
            db=db,
            emergency_id=emergency.id,
            action="DRIVER_ACCEPTED",
            prev_status="AMBULANCE_ASSIGNED",
            new_status="DRIVER_ACCEPTED",
            performed_by=current_user.id,
        )

    db.commit()

    await ws_manager.broadcast_to_emergency(
        assignment.emergency_id,
        {"event": "driver_accepted", "assignment_id": assignment_id, "driver_id": current_user.id},
    )

    return {"message": "Assignment accepted", "assignment_id": assignment_id}


@router.post("/assignments/{assignment_id}/reject")
async def reject_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver)),
):
    assignment = db.query(AmbulanceAssignment).filter(AmbulanceAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or assignment.ambulance_id != driver.assigned_ambulance_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    assignment.status = AssignmentStatus.REJECTED

    # Free the ambulance
    ambulance = assignment.ambulance
    if ambulance:
        ambulance.status = AmbulanceStatus.AVAILABLE

    # Mark emergency for reassignment
    emergency = assignment.emergency
    if emergency:
        emergency.status = EmergencyStatus.REASSIGNMENT_REQUIRED
        emergency.updated_at = datetime.now(timezone.utc)

        create_audit_log(
            db=db,
            emergency_id=emergency.id,
            action="DRIVER_REJECTED",
            prev_status="AMBULANCE_ASSIGNED",
            new_status="REASSIGNMENT_REQUIRED",
            performed_by=current_user.id,
        )

    db.commit()

    # Trigger re-dispatch
    result = await dispatch_ambulance(db, assignment.emergency_id)

    await ws_manager.broadcast_to_emergency(
        assignment.emergency_id,
        {"event": "driver_rejected", "reassigned": result["success"]},
    )

    return {"message": "Assignment rejected", "reassignment_attempted": result["success"]}
