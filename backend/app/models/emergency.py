import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class EmergencyStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    SEARCHING_AMBULANCE = "SEARCHING_AMBULANCE"
    AMBULANCE_ASSIGNED = "AMBULANCE_ASSIGNED"
    DRIVER_ACCEPTED = "DRIVER_ACCEPTED"
    EN_ROUTE_TO_PATIENT = "EN_ROUTE_TO_PATIENT"
    AT_PICKUP = "AT_PICKUP"
    EN_ROUTE_TO_HOSPITAL = "EN_ROUTE_TO_HOSPITAL"
    AT_HOSPITAL = "AT_HOSPITAL"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REASSIGNMENT_REQUIRED = "REASSIGNMENT_REQUIRED"
    NO_AMBULANCE_AVAILABLE = "NO_AMBULANCE_AVAILABLE"


class EmergencyType(str, enum.Enum):
    CARDIAC = "CARDIAC"
    ACCIDENT = "ACCIDENT"
    TRAUMA = "TRAUMA"
    RESPIRATORY = "RESPIRATORY"
    PREGNANCY = "PREGNANCY"
    GENERAL = "GENERAL"


class EmergencySeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AssignmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


class HospitalNotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    emergency_type = Column(Enum(EmergencyType), nullable=False)
    severity = Column(Enum(EmergencySeverity), nullable=False)
    description = Column(Text)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_name = Column(String)
    contact_phone = Column(String)
    status = Column(Enum(EmergencyStatus), default=EmergencyStatus.REPORTED, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient = relationship("Patient", back_populates="emergency_requests")
    assignments = relationship("AmbulanceAssignment", back_populates="emergency")
    hospital_notifications = relationship("HospitalNotification", back_populates="emergency")
    history = relationship("EmergencyHistory", back_populates="emergency")


class AmbulanceAssignment(Base):
    __tablename__ = "ambulance_assignments"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergency_requests.id"), nullable=False)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.PENDING)
    estimated_arrival_minutes = Column(Float, nullable=True)
    distance_km = Column(Float, nullable=True)

    emergency = relationship("EmergencyRequest", back_populates="assignments")
    ambulance = relationship("Ambulance", back_populates="assignments")


class HospitalNotification(Base):
    __tablename__ = "hospital_notifications"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergency_requests.id"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    status = Column(Enum(HospitalNotificationStatus), default=HospitalNotificationStatus.PENDING)
    response_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    estimated_arrival_minutes = Column(Float, nullable=True)

    emergency = relationship("EmergencyRequest", back_populates="hospital_notifications")
    hospital = relationship("Hospital", back_populates="notifications")
