from typing import List, Optional

from pydantic import BaseModel


class HospitalCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    contact_number: Optional[str] = None


class HospitalCapacityUpdate(BaseModel):
    total_beds: int
    available_beds: int


class HospitalFacilityItem(BaseModel):
    facility_name: str
    is_available: bool = True


class HospitalFacilitiesUpdate(BaseModel):
    facilities: List[HospitalFacilityItem]


class HospitalCapacityResponse(BaseModel):
    total_beds: int
    available_beds: int

    class Config:
        from_attributes = True


class HospitalFacilityResponse(BaseModel):
    id: int
    facility_name: str
    is_available: bool

    class Config:
        from_attributes = True


class HospitalResponse(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    contact_number: Optional[str] = None
    is_active: bool
    facilities: List[HospitalFacilityResponse] = []
    capacity: Optional[HospitalCapacityResponse] = None

    class Config:
        from_attributes = True
