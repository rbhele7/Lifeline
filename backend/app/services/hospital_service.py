import asyncio
from typing import List

from sqlalchemy.orm import Session

from app.models.hospital import Hospital
from app.services.osrm_service import get_route

FACILITY_BY_EMERGENCY = {
    "CARDIAC": ["ICU", "Cardiac Care", "Emergency"],
    "ACCIDENT": ["Trauma", "Surgery", "Emergency", "Blood Bank"],
    "TRAUMA": ["Trauma", "Surgery", "Emergency"],
    "RESPIRATORY": ["ICU", "Emergency", "Pulmonology"],
    "PREGNANCY": ["Maternity", "Emergency", "NICU"],
    "GENERAL": ["Emergency"],
}


async def recommend_hospitals(
    db: Session,
    ambulance_lat: float,
    ambulance_lon: float,
    emergency_type: str,
    limit: int = 5,
) -> List[dict]:
    """
    Rank hospitals by:
    - Road travel time (40% weight)
    - Available beds (30% weight)
    - Facility match (30% weight)
    """
    hospitals = db.query(Hospital).filter(Hospital.is_active == True).all()

    if not hospitals:
        return []

    required_facilities = FACILITY_BY_EMERGENCY.get(emergency_type, ["Emergency"])

    async def evaluate_hospital(h):
        route = await get_route(ambulance_lat, ambulance_lon, h.latitude, h.longitude)

        hospital_facility_names = [f.facility_name for f in h.facilities if f.is_available]
        matched = sum(
            1
            for f in required_facilities
            if any(f.lower() in hf.lower() for hf in hospital_facility_names)
        )
        facility_score = matched / len(required_facilities) if required_facilities else 1.0

        capacity = h.capacity
        available_beds = capacity.available_beds if capacity else 0
        total_beds = capacity.total_beds if capacity else 1
        capacity_score = available_beds / max(total_beds, 1)

        return {
            "hospital": h,
            "distance_km": route["distance_km"],
            "duration_minutes": route["duration_minutes"],
            "is_estimated": route.get("is_estimated", False),
            "facility_score": facility_score,
            "capacity_score": capacity_score,
            "available_beds": available_beds,
            "matched_facilities": [
                f
                for f in required_facilities
                if any(f.lower() in hf.lower() for hf in hospital_facility_names)
            ],
        }

    tasks = [evaluate_hospital(h) for h in hospitals]
    results = await asyncio.gather(*tasks)

    max_eta = max(r["duration_minutes"] for r in results) or 1

    for r in results:
        normalized_eta = 1 - (r["duration_minutes"] / max_eta)
        score = (0.4 * normalized_eta) + (0.3 * r["capacity_score"]) + (0.3 * r["facility_score"])
        r["recommendation_score"] = score

    ranked = sorted(results, key=lambda x: x["recommendation_score"], reverse=True)
    return ranked[:limit]
