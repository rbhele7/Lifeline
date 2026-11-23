from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(db: Session, user_id: int, title: str, message: str) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def create_emergency_notification(db: Session, patient_user_id: int, emergency_id: int, event: str):
    messages = {
        "AMBULANCE_ASSIGNED": (
            "Ambulance Assigned",
            f"An ambulance has been assigned to your Emergency #{emergency_id}.",
        ),
        "DRIVER_ACCEPTED": (
            "Driver Accepted",
            f"Your driver has accepted the assignment for Emergency #{emergency_id}.",
        ),
        "EN_ROUTE": (
            "Ambulance En Route",
            f"The ambulance is on its way to you for Emergency #{emergency_id}.",
        ),
        "AT_PICKUP": (
            "Ambulance Arrived",
            f"The ambulance has arrived at your location for Emergency #{emergency_id}.",
        ),
        "HOSPITAL_ASSIGNED": (
            "Hospital Notified",
            f"A hospital has been notified for Emergency #{emergency_id}.",
        ),
        "COMPLETED": (
            "Emergency Completed",
            f"Emergency #{emergency_id} has been completed. Stay safe!",
        ),
    }
    title, message = messages.get(event, ("Update", f"Update for Emergency #{emergency_id}"))
    return create_notification(db, patient_user_id, title, message)


def create_audit_log(
    db: Session,
    emergency_id: int,
    action: str,
    prev_status: str,
    new_status: str,
    performed_by: int,
    details: str = None,
):
    from app.models.audit import EmergencyHistory

    history = EmergencyHistory(
        emergency_id=emergency_id,
        action=action,
        previous_status=prev_status,
        new_status=new_status,
        performed_by=performed_by,
        details=details,
    )
    db.add(history)
    db.commit()
