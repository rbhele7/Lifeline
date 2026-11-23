"""Initial migration - create all tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.Enum("patient", "driver", "hospital_admin", "super_admin", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("emergency_contact", sa.String(), nullable=True),
    )

    op.create_table(
        "hospitals",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("contact_number", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "hospital_facilities",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("hospital_id", sa.Integer(), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("facility_name", sa.String(), nullable=False),
        sa.Column("is_available", sa.Boolean(), default=True),
    )

    op.create_table(
        "hospital_capacity",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("hospital_id", sa.Integer(), sa.ForeignKey("hospitals.id"), nullable=False, unique=True),
        sa.Column("total_beds", sa.Integer(), default=0),
        sa.Column("available_beds", sa.Integer(), default=0),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "ambulances",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("vehicle_number", sa.String(), nullable=False, unique=True),
        sa.Column("driver_id", sa.Integer(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("status", sa.Enum(
            "AVAILABLE", "ASSIGNED", "EN_ROUTE_TO_PATIENT", "AT_PICKUP",
            "EN_ROUTE_TO_HOSPITAL", "AT_HOSPITAL", "OUT_OF_SERVICE",
            name="ambulancestatus"
        ), default="AVAILABLE"),
        sa.Column("last_location_update", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "drivers",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("license_number", sa.String(), nullable=True, unique=True),
        sa.Column("assigned_ambulance_id", sa.Integer(), sa.ForeignKey("ambulances.id"), nullable=True),
    )

    op.create_foreign_key("fk_ambulances_driver", "ambulances", "drivers", ["driver_id"], ["id"])

    op.create_table(
        "emergency_requests",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("emergency_type", sa.Enum("CARDIAC", "ACCIDENT", "TRAUMA", "RESPIRATORY", "PREGNANCY", "GENERAL", name="emergencytype"), nullable=False),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="emergencyseverity"), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("contact_name", sa.String(), nullable=True),
        sa.Column("contact_phone", sa.String(), nullable=True),
        sa.Column("status", sa.Enum(
            "REPORTED", "SEARCHING_AMBULANCE", "AMBULANCE_ASSIGNED", "DRIVER_ACCEPTED",
            "EN_ROUTE_TO_PATIENT", "AT_PICKUP", "EN_ROUTE_TO_HOSPITAL", "AT_HOSPITAL",
            "COMPLETED", "CANCELLED", "REASSIGNMENT_REQUIRED", "NO_AMBULANCE_AVAILABLE",
            name="emergencystatus"
        ), default="REPORTED", index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "ambulance_assignments",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("emergency_id", sa.Integer(), sa.ForeignKey("emergency_requests.id"), nullable=False),
        sa.Column("ambulance_id", sa.Integer(), sa.ForeignKey("ambulances.id"), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Enum("PENDING", "ACCEPTED", "REJECTED", "COMPLETED", name="assignmentstatus"), default="PENDING"),
        sa.Column("estimated_arrival_minutes", sa.Float(), nullable=True),
        sa.Column("distance_km", sa.Float(), nullable=True),
    )

    op.create_table(
        "hospital_notifications",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("emergency_id", sa.Integer(), sa.ForeignKey("emergency_requests.id"), nullable=False),
        sa.Column("hospital_id", sa.Integer(), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("status", sa.Enum("PENDING", "ACCEPTED", "REJECTED", name="hospitalnotificationstatus"), default="PENDING"),
        sa.Column("response_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("estimated_arrival_minutes", sa.Float(), nullable=True),
    )

    op.create_table(
        "location_history",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("ambulance_id", sa.Integer(), sa.ForeignKey("ambulances.id"), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "emergency_history",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("emergency_id", sa.Integer(), sa.ForeignKey("emergency_requests.id"), nullable=False),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("previous_status", sa.String(), nullable=True),
        sa.Column("new_status", sa.String(), nullable=True),
        sa.Column("performed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("emergency_history")
    op.drop_table("notifications")
    op.drop_table("location_history")
    op.drop_table("hospital_notifications")
    op.drop_table("ambulance_assignments")
    op.drop_table("emergency_requests")
    op.drop_constraint("fk_ambulances_driver", "ambulances", type_="foreignkey")
    op.drop_table("drivers")
    op.drop_table("ambulances")
    op.drop_table("hospital_capacity")
    op.drop_table("hospital_facilities")
    op.drop_table("hospitals")
    op.drop_table("patients")
    op.drop_table("users")
