from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.emergency import (
    AssignmentStatus,
    EmergencySeverity,
    EmergencyStatus,
    EmergencyType,
    HospitalNotificationStatus,
)


class EmergencyCreate(BaseModel):
    emergency_type: EmergencyType
    severity: EmergencySeverity
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None


class EmergencyStatusUpdate(BaseModel):
    status: EmergencyStatus
    details: Optional[str] = None


class AmbulanceAssignmentResponse(BaseModel):
    id: int
    emergency_id: int
    ambulance_id: int
    assigned_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: AssignmentStatus
    estimated_arrival_minutes: Optional[float] = None
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class EmergencyResponse(BaseModel):
    id: int
    patient_id: int
    emergency_type: EmergencyType
    severity: EmergencySeverity
    description: Optional[str] = None
    latitude: float
    longitude: float
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    status: EmergencyStatus
    created_at: datetime
    updated_at: datetime
    assignments: List[AmbulanceAssignmentResponse] = []

    class Config:
        from_attributes = True


class HospitalNotificationResponse(BaseModel):
    id: int
    emergency_id: int
    hospital_id: int
    status: HospitalNotificationStatus
    estimated_arrival_minutes: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
