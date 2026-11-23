import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class AmbulanceStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    EN_ROUTE_TO_PATIENT = "EN_ROUTE_TO_PATIENT"
    AT_PICKUP = "AT_PICKUP"
    EN_ROUTE_TO_HOSPITAL = "EN_ROUTE_TO_HOSPITAL"
    AT_HOSPITAL = "AT_HOSPITAL"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"


class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(Enum(AmbulanceStatus), default=AmbulanceStatus.AVAILABLE)
    last_location_update = Column(DateTime(timezone=True), nullable=True)

    driver = relationship("Driver", foreign_keys=[driver_id], post_update=True)
    location_history = relationship("LocationHistory", back_populates="ambulance")
    assignments = relationship("AmbulanceAssignment", back_populates="ambulance")
