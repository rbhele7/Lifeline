"""
Seed script for LifeLine – creates demo accounts and realistic fictional data.
Run: python scripts/seed.py

DEMO ACCOUNTS (fictional data only, no real patient information):
- Super Admin: admin@lifeline.com / Admin@123
- Patient:     john.patient@example.com / Patient@123
- Driver 1:    driver1@lifeline.com / Driver@123
- Driver 2:    driver2@lifeline.com / Driver@123
- Hospital:    hospital@lifeline.com / Hospital@123
"""

import sys
import os
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.db.base import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.driver import Driver
from app.models.hospital import Hospital, HospitalFacility, HospitalCapacity
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.emergency import (
    EmergencyRequest, EmergencyStatus, EmergencyType, EmergencySeverity,
    AmbulanceAssignment, AssignmentStatus, HospitalNotification, HospitalNotificationStatus
)
from app.models.notification import Notification
from app.models.audit import EmergencyHistory
import app.models  # noqa – ensures all models registered


def seed():
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Clear existing data
        print("Clearing existing seed data...")
        for model in [EmergencyHistory, Notification, HospitalNotification, AmbulanceAssignment,
                      EmergencyRequest, HospitalCapacity, HospitalFacility, Hospital,
                      Driver, Ambulance, Patient, User]:
            db.query(model).delete()
        db.commit()

        print("Creating demo users...")

        # Super Admin
        admin = User(
            full_name="System Administrator",
            email="admin@lifeline.com",
            phone="+44 20 0000 0001",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.super_admin,
            is_active=True,
        )
        db.add(admin)

        # Patient
        patient_user = User(
            full_name="John Smith",
            email="john.patient@example.com",
            phone="+44 7700 900001",
            password_hash=get_password_hash("Patient@123"),
            role=UserRole.patient,
            is_active=True,
        )
        db.add(patient_user)

        # Driver 1
        driver1_user = User(
            full_name="Michael Johnson",
            email="driver1@lifeline.com",
            phone="+44 7700 900002",
            password_hash=get_password_hash("Driver@123"),
            role=UserRole.driver,
            is_active=True,
        )
        db.add(driver1_user)

        # Driver 2
        driver2_user = User(
            full_name="Sarah Williams",
            email="driver2@lifeline.com",
            phone="+44 7700 900003",
            password_hash=get_password_hash("Driver@123"),
            role=UserRole.driver,
            is_active=True,
        )
        db.add(driver2_user)

        # Driver 3
        driver3_user = User(
            full_name="James Brown",
            email="driver3@lifeline.com",
            phone="+44 7700 900004",
            password_hash=get_password_hash("Driver@123"),
            role=UserRole.driver,
            is_active=True,
        )
        db.add(driver3_user)

        # Hospital admin
        hospital_user = User(
            full_name="Dr. Emma Davis",
            email="hospital@lifeline.com",
            phone="+44 20 7000 0001",
            password_hash=get_password_hash("Hospital@123"),
            role=UserRole.hospital_admin,
            is_active=True,
        )
        db.add(hospital_user)

        # Patient 2
        patient2_user = User(
            full_name="Alice Thompson",
            email="alice.patient@example.com",
            phone="+44 7700 900010",
            password_hash=get_password_hash("Patient@123"),
            role=UserRole.patient,
            is_active=True,
        )
        db.add(patient2_user)

        db.flush()

        print("Creating profiles...")

        # Patient profiles
        patient = Patient(user_id=patient_user.id, emergency_contact="+44 7700 900099")
        db.add(patient)

        patient2 = Patient(user_id=patient2_user.id, emergency_contact="+44 7700 900098")
        db.add(patient2)

        # Ambulances (without driver_id first)
        print("Creating ambulances...")
        amb1 = Ambulance(
            vehicle_number="AMB-LDN-001",
            latitude=51.5074,
            longitude=-0.1278,
            status=AmbulanceStatus.AVAILABLE,
            last_location_update=datetime.now(timezone.utc),
        )
        amb2 = Ambulance(
            vehicle_number="AMB-LDN-002",
            latitude=51.5155,
            longitude=-0.0922,
            status=AmbulanceStatus.AVAILABLE,
            last_location_update=datetime.now(timezone.utc),
        )
        amb3 = Ambulance(
            vehicle_number="AMB-LDN-003",
            latitude=51.4994,
            longitude=-0.1245,
            status=AmbulanceStatus.AVAILABLE,
            last_location_update=datetime.now(timezone.utc),
        )
        amb4 = Ambulance(
            vehicle_number="AMB-LDN-004",
            latitude=51.5225,
            longitude=-0.1572,
            status=AmbulanceStatus.OUT_OF_SERVICE,
            last_location_update=datetime.now(timezone.utc),
        )
        amb5 = Ambulance(
            vehicle_number="AMB-LDN-005",
            latitude=51.5033,
            longitude=-0.0754,
            status=AmbulanceStatus.AVAILABLE,
            last_location_update=datetime.now(timezone.utc),
        )

        for a in [amb1, amb2, amb3, amb4, amb5]:
            db.add(a)
        db.flush()

        # Driver profiles (linked to ambulances)
        driver1 = Driver(user_id=driver1_user.id, license_number="DL-2024-001", assigned_ambulance_id=amb1.id)
        driver2 = Driver(user_id=driver2_user.id, license_number="DL-2024-002", assigned_ambulance_id=amb2.id)
        driver3 = Driver(user_id=driver3_user.id, license_number="DL-2024-003", assigned_ambulance_id=amb3.id)
        db.add(driver1)
        db.add(driver2)
        db.add(driver3)
        db.flush()

        # Link ambulances to drivers
        amb1.driver_id = driver1.id
        amb2.driver_id = driver2.id
        amb3.driver_id = driver3.id

        print("Creating hospitals...")

        # Hospitals (London area – fictional)
        h1 = Hospital(
            name="City General Hospital",
            address="123 Victoria Street, London, SW1E 5NW",
            latitude=51.4975,
            longitude=-0.1357,
            contact_number="+44 20 7000 1000",
            is_active=True,
            user_id=hospital_user.id,
        )
        h2 = Hospital(
            name="St. Thomas Medical Centre",
            address="Westminster Bridge Road, London, SE1 7EH",
            latitude=51.4993,
            longitude=-0.1174,
            contact_number="+44 20 7000 2000",
            is_active=True,
        )
        h3 = Hospital(
            name="Royal London Hospital",
            address="80 Newark Street, London, E1 2ES",
            latitude=51.5188,
            longitude=-0.0601,
            contact_number="+44 20 7000 3000",
            is_active=True,
        )
        h4 = Hospital(
            name="Chelsea & Westminster Hospital",
            address="369 Fulham Road, London, SW10 9NH",
            latitude=51.4847,
            longitude=-0.1808,
            contact_number="+44 20 7000 4000",
            is_active=True,
        )

        for h in [h1, h2, h3, h4]:
            db.add(h)
        db.flush()

        # Facilities
        facilities_data = {
            h1.id: ["Emergency", "ICU", "Cardiac Care", "Surgery", "Blood Bank", "Trauma"],
            h2.id: ["Emergency", "Maternity", "NICU", "Surgery", "ICU"],
            h3.id: ["Emergency", "Trauma", "Surgery", "Blood Bank", "Burn Unit", "Neurology"],
            h4.id: ["Emergency", "ICU", "Pulmonology", "Cardiology", "Oncology"],
        }

        for hosp_id, facs in facilities_data.items():
            for f in facs:
                db.add(HospitalFacility(hospital_id=hosp_id, facility_name=f, is_available=True))

        # Capacity
        capacity_data = [
            (h1.id, 200, 45),
            (h2.id, 150, 32),
            (h3.id, 300, 78),
            (h4.id, 180, 20),
        ]
        for hosp_id, total, available in capacity_data:
            db.add(HospitalCapacity(
                hospital_id=hosp_id, total_beds=total, available_beds=available,
                last_updated=datetime.now(timezone.utc)
            ))

        db.flush()

        print("Creating historical emergencies...")

        # Historical emergencies (completed)
        past_emergencies = [
            {
                "type": EmergencyType.CARDIAC,
                "severity": EmergencySeverity.CRITICAL,
                "lat": 51.5074, "lon": -0.1278,
                "status": EmergencyStatus.COMPLETED,
                "days_ago": 7,
                "desc": "Patient reported chest pain and difficulty breathing",
            },
            {
                "type": EmergencyType.ACCIDENT,
                "severity": EmergencySeverity.HIGH,
                "lat": 51.5155, "lon": -0.0922,
                "status": EmergencyStatus.COMPLETED,
                "days_ago": 5,
                "desc": "Road traffic accident with multiple injuries",
            },
            {
                "type": EmergencyType.RESPIRATORY,
                "severity": EmergencySeverity.MEDIUM,
                "lat": 51.5033, "lon": -0.1245,
                "status": EmergencyStatus.COMPLETED,
                "days_ago": 3,
                "desc": "Severe asthma attack",
            },
            {
                "type": EmergencyType.TRAUMA,
                "severity": EmergencySeverity.HIGH,
                "lat": 51.5225, "lon": -0.0754,
                "status": EmergencyStatus.CANCELLED,
                "days_ago": 2,
                "desc": "Fall from height",
            },
            {
                "type": EmergencyType.GENERAL,
                "severity": EmergencySeverity.LOW,
                "lat": 51.4975, "lon": -0.1357,
                "status": EmergencyStatus.COMPLETED,
                "days_ago": 1,
                "desc": "Severe allergic reaction",
            },
        ]

        for pe in past_emergencies:
            created = datetime.now(timezone.utc) - timedelta(days=pe["days_ago"])
            e = EmergencyRequest(
                patient_id=patient.id,
                emergency_type=pe["type"],
                severity=pe["severity"],
                description=pe["desc"],
                latitude=pe["lat"],
                longitude=pe["lon"],
                contact_name="John Smith",
                contact_phone="+44 7700 900001",
                status=pe["status"],
                created_at=created,
                updated_at=created + timedelta(hours=2),
            )
            db.add(e)
            db.flush()

            if pe["status"] == EmergencyStatus.COMPLETED:
                assignment = AmbulanceAssignment(
                    emergency_id=e.id,
                    ambulance_id=amb1.id,
                    assigned_at=created + timedelta(minutes=2),
                    accepted_at=created + timedelta(minutes=3),
                    completed_at=created + timedelta(hours=1),
                    status=AssignmentStatus.COMPLETED,
                    estimated_arrival_minutes=8.5,
                    distance_km=4.2,
                )
                db.add(assignment)

                notif = HospitalNotification(
                    emergency_id=e.id,
                    hospital_id=h1.id,
                    status=HospitalNotificationStatus.ACCEPTED,
                    created_at=created + timedelta(minutes=5),
                    response_time=created + timedelta(minutes=7),
                    estimated_arrival_minutes=15.0,
                )
                db.add(notif)

        # Active emergency for demonstration
        active_emergency = EmergencyRequest(
            patient_id=patient.id,
            emergency_type=EmergencyType.CARDIAC,
            severity=EmergencySeverity.CRITICAL,
            description="Patient experiencing severe chest pain, left arm numbness",
            latitude=51.5100,
            longitude=-0.1200,
            contact_name="John Smith",
            contact_phone="+44 7700 900001",
            status=EmergencyStatus.AMBULANCE_ASSIGNED,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=5),
            updated_at=datetime.now(timezone.utc) - timedelta(minutes=3),
        )
        db.add(active_emergency)
        db.flush()

        active_assignment = AmbulanceAssignment(
            emergency_id=active_emergency.id,
            ambulance_id=amb2.id,
            assigned_at=datetime.now(timezone.utc) - timedelta(minutes=4),
            status=AssignmentStatus.PENDING,
            estimated_arrival_minutes=7.5,
            distance_km=3.8,
        )
        db.add(active_assignment)
        amb2.status = AmbulanceStatus.ASSIGNED

        print("Creating notifications...")

        notifications = [
            Notification(
                user_id=patient_user.id,
                title="Emergency Created",
                message="Your emergency #1 has been reported and we are dispatching help.",
                is_read=True,
                created_at=datetime.now(timezone.utc) - timedelta(hours=5),
            ),
            Notification(
                user_id=patient_user.id,
                title="Ambulance Assigned",
                message="An ambulance has been assigned to your active emergency.",
                is_read=False,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=4),
            ),
            Notification(
                user_id=driver1_user.id,
                title="New Emergency Assignment",
                message="You have been assigned to Emergency #1. ETA: 8 minutes.",
                is_read=False,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=3),
            ),
            Notification(
                user_id=hospital_user.id,
                title="Incoming Ambulance",
                message="An ambulance carrying a cardiac patient is en route to your hospital.",
                is_read=False,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=2),
            ),
        ]
        for n in notifications:
            db.add(n)

        db.commit()

        print("\n" + "="*60)
        print("✅ SEED DATA CREATED SUCCESSFULLY")
        print("="*60)
        print("\n🔑 DEMO ACCOUNTS (fictional data):")
        print("-" * 60)
        print(f"  Super Admin:    admin@lifeline.com        / Admin@123")
        print(f"  Patient:        john.patient@example.com  / Patient@123")
        print(f"  Patient 2:      alice.patient@example.com / Patient@123")
        print(f"  Driver 1:       driver1@lifeline.com      / Driver@123")
        print(f"  Driver 2:       driver2@lifeline.com      / Driver@123")
        print(f"  Driver 3:       driver3@lifeline.com      / Driver@123")
        print(f"  Hospital Admin: hospital@lifeline.com     / Hospital@123")
        print("-" * 60)
        print("\n⚠️  NOTE: All data is fictional for demonstration purposes.")
        print("   No real patient information has been used.")
        print("="*60)

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
