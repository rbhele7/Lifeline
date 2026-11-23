from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str
    emergency_contact: Optional[str] = None  # for patients
    license_number: Optional[str] = None  # for drivers


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
