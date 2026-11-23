import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base, get_db
from app.main import app as fastapi_app
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.driver import Driver
from app.models.emergency import EmergencyRequest, EmergencySeverity, EmergencyStatus, EmergencyType
from app.models.hospital import Hospital, HospitalCapacity, HospitalFacility
from app.models.patient import Patient
from app.models.user import User, UserRole

# Use SQLite with StaticPool so in-memory DB is shared across connections
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    user = User(
        full_name="Admin Test",
        email="admin.test@lifeline.com",
        password_hash=get_password_hash("Admin@123"),
        role=UserRole.super_admin,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def patient_user(db):
    user = User(
        full_name="Patient Test",
        email="patient.test@lifeline.com",
        password_hash=get_password_hash("Patient@123"),
        role=UserRole.patient,
        is_active=True,
    )
    db.add(user)
    db.flush()
    patient = Patient(user_id=user.id, emergency_contact="+447700900000")
    db.add(patient)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def driver_user(db):
    amb = Ambulance(
        vehicle_number="AMB-TEST-01",
        latitude=51.5074,
        longitude=-0.1278,
        status=AmbulanceStatus.AVAILABLE,
    )
    db.add(amb)
    db.flush()

    user = User(
        full_name="Driver Test",
        email="driver.test@lifeline.com",
        password_hash=get_password_hash("Driver@123"),
        role=UserRole.driver,
        is_active=True,
    )
    db.add(user)
    db.flush()

    driver = Driver(user_id=user.id, license_number="DL-TEST-001", assigned_ambulance_id=amb.id)
    db.add(driver)
    db.flush()

    amb.driver_id = driver.id
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def hospital_admin_user(db):
    user = User(
        full_name="Hospital Admin Test",
        email="hospital.test@lifeline.com",
        password_hash=get_password_hash("Hospital@123"),
        role=UserRole.hospital_admin,
        is_active=True,
    )
    db.add(user)
    db.flush()

    h = Hospital(
        name="Test General Hospital",
        address="100 Test St",
        latitude=51.5000,
        longitude=-0.1300,
        contact_number="+442070001111",
        is_active=True,
        user_id=user.id,
    )
    db.add(h)
    db.flush()

    cap = HospitalCapacity(hospital_id=h.id, total_beds=100, available_beds=25)
    db.add(cap)

    fac = HospitalFacility(hospital_id=h.id, facility_name="Emergency", is_available=True)
    db.add(fac)

    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user):
    return create_access_token({"user_id": admin_user.id, "role": admin_user.role})


@pytest.fixture
def patient_token(patient_user):
    return create_access_token({"user_id": patient_user.id, "role": patient_user.role})


@pytest.fixture
def driver_token(driver_user):
    return create_access_token({"user_id": driver_user.id, "role": driver_user.role})


@pytest.fixture
def hospital_token(hospital_admin_user):
    return create_access_token({"user_id": hospital_admin_user.id, "role": hospital_admin_user.role})
