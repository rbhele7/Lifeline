from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    emergency_contact = Column(String)

    user = relationship("User", back_populates="patient_profile")
    emergency_requests = relationship("EmergencyRequest", back_populates="patient")
