from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.base import get_db
from app.models.user import User, UserRole
from app.models.emergency import EmergencyRequest
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.services.analytics_service import get_analytics

import csv
import io

router = APIRouter()


@router.get("/analytics")
def get_admin_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None
    return get_analytics(db, sd, ed)


@router.get("/emergencies")
def admin_list_emergencies(
    status: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    q = db.query(EmergencyRequest)
    if status:
        q = q.filter(EmergencyRequest.status == status)
    total = q.count()
    emergencies = q.order_by(EmergencyRequest.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for e in emergencies:
        result.append({
            "id": e.id, "type": e.emergency_type, "severity": e.severity,
            "status": e.status, "created_at": e.created_at, "updated_at": e.updated_at,
            "latitude": e.latitude, "longitude": e.longitude,
            "patient_id": e.patient_id,
            "assignments_count": len(e.assignments),
        })
    return {"total": total, "emergencies": result}


@router.get("/users")
def admin_list_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    users = q.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id, "full_name": u.full_name, "email": u.email,
            "phone": u.phone, "role": u.role, "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.put("/users/{user_id}")
def admin_update_user(
    user_id: int,
    update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    allowed = ["full_name", "phone", "is_active", "role"]
    for k, v in update.items():
        if k in allowed:
            setattr(user, k, v)
    db.commit()
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
def admin_deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.get("/ambulances")
def admin_list_ambulances(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    ambulances = db.query(Ambulance).all()
    return [
        {
            "id": a.id, "vehicle_number": a.vehicle_number, "status": a.status,
            "latitude": a.latitude, "longitude": a.longitude,
            "driver_id": a.driver_id,
            "last_location_update": a.last_location_update,
            "driver": {
                "id": a.driver.id,
                "full_name": a.driver.user.full_name if a.driver and a.driver.user else None,
                "license_number": a.driver.license_number if a.driver else None,
            } if a.driver else None,
        }
        for a in ambulances
    ]


@router.get("/reports")
def admin_reports(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    sd = datetime.fromisoformat(start_date) if start_date else datetime(2020, 1, 1, tzinfo=timezone.utc)
    ed = datetime.fromisoformat(end_date) if end_date else datetime.now(timezone.utc)

    emergencies = (
        db.query(EmergencyRequest)
        .filter(EmergencyRequest.created_at >= sd, EmergencyRequest.created_at <= ed)
        .order_by(EmergencyRequest.created_at.desc())
        .all()
    )
    return {
        "total": len(emergencies),
        "records": [
            {
                "id": e.id, "type": e.emergency_type, "severity": e.severity,
                "status": e.status, "created_at": e.created_at,
                "latitude": e.latitude, "longitude": e.longitude,
            }
            for e in emergencies
        ],
    }


@router.get("/reports/export")
def export_reports_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.super_admin)),
):
    sd = datetime.fromisoformat(start_date) if start_date else datetime(2020, 1, 1, tzinfo=timezone.utc)
    ed = datetime.fromisoformat(end_date) if end_date else datetime.now(timezone.utc)

    emergencies = (
        db.query(EmergencyRequest)
        .filter(EmergencyRequest.created_at >= sd, EmergencyRequest.created_at <= ed)
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Type", "Severity", "Status", "Created At", "Latitude", "Longitude"])
    for e in emergencies:
        writer.writerow([e.id, e.emergency_type, e.severity, e.status, e.created_at, e.latitude, e.longitude])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lifeline_report.csv"},
    )
