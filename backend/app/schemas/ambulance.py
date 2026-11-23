from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.ambulance import AmbulanceStatus


class AmbulanceCreate(BaseModel):
    vehicle_number: str
    driver_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AmbulanceUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    driver_id: Optional[int] = None
    status: Optional[AmbulanceStatus] = None


class AmbulanceLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    is_simulated: bool = False  # Must label simulated GPS


class AmbulanceResponse(BaseModel):
    id: int
    vehicle_number: str
    driver_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: AmbulanceStatus
    last_location_update: Optional[datetime] = None

    class Config:
        from_attributes = True
