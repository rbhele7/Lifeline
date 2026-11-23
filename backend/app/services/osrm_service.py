import math
from typing import Optional

import httpx

from app.core.config import settings


def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Calculate straight-line distance in km. NOTE: This is NOT road distance."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


async def get_route(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
) -> dict:
    """
    Get route from OSRM. Falls back to straight-line estimate if OSRM unavailable.
    Returns: {distance_km, duration_minutes, geometry, is_estimated, is_simulated}
    """
    try:
        url = f"{settings.OSRM_BASE_URL}/route/v1/driving/{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
        params = {"overview": "full", "geometries": "geojson", "steps": "false"}

        async with httpx.AsyncClient(timeout=1.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                return {
                    "distance_km": route["distance"] / 1000,
                    "duration_minutes": route["duration"] / 60,
                    "geometry": route["geometry"],
                    "is_estimated": False,
                    "is_simulated": False,
                    "source": "OSRM",
                }
    except Exception:
        pass

    # FALLBACK: Straight-line distance estimate (NOT actual road distance)
    # This is clearly labeled as an estimate for demonstration purposes
    straight_line_km = haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)
    # Road distance is typically 1.3–1.5x straight-line distance
    estimated_road_km = straight_line_km * 1.4
    # Assuming 30 km/h average urban speed
    estimated_minutes = (estimated_road_km / 30) * 60

    return {
        "distance_km": round(estimated_road_km, 2),
        "duration_minutes": round(estimated_minutes, 1),
        "geometry": None,
        "is_estimated": True,
        "is_simulated": True,
        "source": "ESTIMATE (straight-line × 1.4 — NOT actual road distance)",
        "note": "DEMO MODE: OSRM unavailable. Showing estimated values only.",
    }
