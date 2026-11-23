from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.emergency import (
    AmbulanceAssignment,
    EmergencyRequest,
    EmergencyStatus,
    HospitalNotification,
    HospitalNotificationStatus,
)
from app.models.hospital import Hospital
from app.models.user import User, UserRole


def get_analytics(db: Session, start_date: datetime = None, end_date: datetime = None) -> dict:
    if not start_date:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
    if not end_date:
        end_date = datetime.now(timezone.utc)

    total_emergencies = (
        db.query(EmergencyRequest)
        .filter(
            EmergencyRequest.created_at >= start_date,
            EmergencyRequest.created_at <= end_date,
        )
        .count()
    )

    active_emergencies = (
        db.query(EmergencyRequest)
        .filter(
            EmergencyRequest.status.in_(
                [
                    EmergencyStatus.REPORTED,
                    EmergencyStatus.SEARCHING_AMBULANCE,
                    EmergencyStatus.AMBULANCE_ASSIGNED,
                    EmergencyStatus.DRIVER_ACCEPTED,
                    EmergencyStatus.EN_ROUTE_TO_PATIENT,
                    EmergencyStatus.AT_PICKUP,
                    EmergencyStatus.EN_ROUTE_TO_HOSPITAL,
                    EmergencyStatus.AT_HOSPITAL,
                ]
            )
        )
        .count()
    )

    completed_emergencies = (
        db.query(EmergencyRequest)
        .filter(
            EmergencyRequest.status == EmergencyStatus.COMPLETED,
            EmergencyRequest.created_at >= start_date,
        )
        .count()
    )

    available_ambulances = (
        db.query(Ambulance).filter(Ambulance.status == AmbulanceStatus.AVAILABLE).count()
    )

    busy_ambulances = (
        db.query(Ambulance)
        .filter(
            Ambulance.status.in_(
                [
                    AmbulanceStatus.ASSIGNED,
                    AmbulanceStatus.EN_ROUTE_TO_PATIENT,
                    AmbulanceStatus.AT_PICKUP,
                    AmbulanceStatus.EN_ROUTE_TO_HOSPITAL,
                    AmbulanceStatus.AT_HOSPITAL,
                ]
            )
        )
        .count()
    )

    registered_hospitals = db.query(Hospital).filter(Hospital.is_active == True).count()

    total_notified = db.query(HospitalNotification).count()
    accepted = (
        db.query(HospitalNotification)
        .filter(HospitalNotification.status == HospitalNotificationStatus.ACCEPTED)
        .count()
    )
    acceptance_rate = (accepted / total_notified * 100) if total_notified > 0 else 0

    type_dist = (
        db.query(
            EmergencyRequest.emergency_type,
            func.count(EmergencyRequest.id).label("count"),
        )
        .filter(EmergencyRequest.created_at >= start_date)
        .group_by(EmergencyRequest.emergency_type)
        .all()
    )

    daily_stats = []
    for i in range(7):
        day = datetime.now(timezone.utc).date() - timedelta(days=6 - i)
        day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(EmergencyRequest)
            .filter(
                EmergencyRequest.created_at >= day_start,
                EmergencyRequest.created_at < day_end,
            )
            .count()
        )
        daily_stats.append({"date": day.isoformat(), "count": count})

    assignments_with_acceptance = (
        db.query(AmbulanceAssignment).filter(AmbulanceAssignment.accepted_at.isnot(None)).all()
    )

    avg_dispatch = None
    if assignments_with_acceptance:
        dispatch_times = []
        for a in assignments_with_acceptance:
            if a.emergency and a.emergency.created_at and a.accepted_at:
                diff = (a.accepted_at - a.emergency.created_at).total_seconds() / 60
                if diff > 0:
                    dispatch_times.append(diff)
        if dispatch_times:
            avg_dispatch = sum(dispatch_times) / len(dispatch_times)

    return {
        "total_emergencies": total_emergencies,
        "active_emergencies": active_emergencies,
        "completed_emergencies": completed_emergencies,
        "available_ambulances": available_ambulances,
        "busy_ambulances": busy_ambulances,
        "registered_hospitals": registered_hospitals,
        "hospital_acceptance_rate": round(acceptance_rate, 1),
        "average_dispatch_minutes": round(avg_dispatch, 1) if avg_dispatch else None,
        "emergency_type_distribution": [
            {"type": t.emergency_type, "count": t.count} for t in type_dist
        ],
        "daily_stats": daily_stats,
        "total_patients": db.query(User).filter(User.role == UserRole.patient).count(),
        "total_drivers": db.query(User).filter(User.role == UserRole.driver).count(),
    }
