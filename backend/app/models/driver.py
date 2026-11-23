from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    license_number = Column(String, unique=True)
    assigned_ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)

    user = relationship("User", back_populates="driver_profile")
    ambulance = relationship("Ambulance", foreign_keys=[assigned_ambulance_id], post_update=True)
