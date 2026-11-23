import asyncio
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.emergency import AmbulanceAssignment, AssignmentStatus, EmergencyRequest, EmergencyStatus
from app.services.notification_service import create_notification
from app.services.osrm_service import get_route


async def find_best_ambulance(db: Session, patient_lat: float, patient_lon: float) -> Optional[dict]:
    """
    Smart ambulance allocation:
    Score = 0.7 × normalized_eta + 0.3 × normalized_distance
    Lower score = better candidate
    """
    ambulances = (
        db.query(Ambulance)
        .filter(
            Ambulance.status == AmbulanceStatus.AVAILABLE,
            Ambulance.latitude.isnot(None),
            Ambulance.longitude.isnot(None),
            Ambulance.driver_id.isnot(None),
        )
        .all()
    )

    if not ambulances:
        return None

    async def evaluate_ambulance(amb):
        route = await get_route(amb.latitude, amb.longitude, patient_lat, patient_lon)
        return {
            "ambulance": amb,
            "distance_km": route["distance_km"],
            "duration_minutes": route["duration_minutes"],
            "geometry": route.get("geometry"),
            "is_estimated": route.get("is_estimated", False),
        }

    tasks = [evaluate_ambulance(amb) for amb in ambulances]
    results = await asyncio.gather(*tasks)

    if not results:
        return None

    max_eta = max(r["duration_minutes"] for r in results) or 1
    max_dist = max(r["distance_km"] for r in results) or 1

    for r in results:
        normalized_eta = r["duration_minutes"] / max_eta
        normalized_dist = r["distance_km"] / max_dist
        r["score"] = 0.7 * normalized_eta + 0.3 * normalized_dist

    best = min(results, key=lambda x: x["score"])
    return best


async def dispatch_ambulance(db: Session, emergency_id: int) -> dict:
    """
    Dispatch ambulance to emergency. Uses SELECT FOR UPDATE for concurrency safety.
    """
    emergency = (
        db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).with_for_update().first()
    )

    if not emergency:
        return {"success": False, "message": "Emergency not found"}

    if emergency.status not in [EmergencyStatus.REPORTED, EmergencyStatus.REASSIGNMENT_REQUIRED]:
        return {
            "success": False,
            "message": f"Emergency is in {emergency.status} status, cannot dispatch",
        }

    emergency.status = EmergencyStatus.SEARCHING_AMBULANCE
    db.flush()

    best = await find_best_ambulance(db, emergency.latitude, emergency.longitude)

    if not best:
        emergency.status = EmergencyStatus.NO_AMBULANCE_AVAILABLE
        db.commit()
        return {"success": False, "message": "No available ambulances found"}

    ambulance = best["ambulance"]

    # Lock ambulance row to prevent duplicate assignment
    ambulance = (
        db.query(Ambulance)
        .filter(Ambulance.id == ambulance.id, Ambulance.status == AmbulanceStatus.AVAILABLE)
        .with_for_update()
        .first()
    )

    if not ambulance:
        emergency.status = EmergencyStatus.REASSIGNMENT_REQUIRED
        db.commit()
        return {"success": False, "message": "Selected ambulance no longer available"}

    assignment = AmbulanceAssignment(
        emergency_id=emergency_id,
        ambulance_id=ambulance.id,
        assigned_at=datetime.now(timezone.utc),
        status=AssignmentStatus.PENDING,
        estimated_arrival_minutes=best["duration_minutes"],
        distance_km=best["distance_km"],
    )

    ambulance.status = AmbulanceStatus.ASSIGNED
    emergency.status = EmergencyStatus.AMBULANCE_ASSIGNED

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Notify driver
    if ambulance.driver and ambulance.driver.user_id:
        create_notification(
            db=db,
            user_id=ambulance.driver.user_id,
            title="New Emergency Assignment",
            message=f"You have been assigned to Emergency #{emergency_id}. ETA: {best['duration_minutes']:.0f} minutes.",
        )

    return {
        "success": True,
        "assignment": assignment,
        "estimated_arrival_minutes": best["duration_minutes"],
        "distance_km": best["distance_km"],
        "is_estimated": best["is_estimated"],
    }
