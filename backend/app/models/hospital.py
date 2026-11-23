from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_number = Column(String)
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    facilities = relationship("HospitalFacility", back_populates="hospital")
    capacity = relationship("HospitalCapacity", back_populates="hospital", uselist=False)
    notifications = relationship("HospitalNotification", back_populates="hospital")


class HospitalFacility(Base):
    __tablename__ = "hospital_facilities"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    facility_name = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)

    hospital = relationship("Hospital", back_populates="facilities")


class HospitalCapacity(Base):
    __tablename__ = "hospital_capacity"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), unique=True, nullable=False)
    total_beds = Column(Integer, default=0)
    available_beds = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="capacity")
