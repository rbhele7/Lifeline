from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lifeline.db")
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars-long-security"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OSRM_BASE_URL: str = "https://router.project-osrm.org"
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
