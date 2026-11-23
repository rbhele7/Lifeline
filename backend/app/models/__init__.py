# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User, UserRole  # noqa
from app.models.patient import Patient  # noqa
from app.models.driver import Driver  # noqa
from app.models.hospital import Hospital, HospitalFacility, HospitalCapacity  # noqa
from app.models.ambulance import Ambulance, AmbulanceStatus  # noqa
from app.models.emergency import (  # noqa
    EmergencyRequest,
    AmbulanceAssignment,
    HospitalNotification,
    EmergencyStatus,
    EmergencyType,
    EmergencySeverity,
    AssignmentStatus,
    HospitalNotificationStatus,
)
from app.models.location import LocationHistory  # noqa
from app.models.notification import Notification  # noqa
from app.models.audit import EmergencyHistory  # noqa
