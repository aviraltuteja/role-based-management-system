import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class RoleEnum(PyEnum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    USER = "USER"

class LocationEnum(PyEnum):
    EUROPE = "EUROPE"
    INDIA = "INDIA"
    NORTH_AMERICA = "NORTH_AMERICA"

class GenderEnum(PyEnum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class Role(Base):
    __tablename__ = "roles"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = Column(Enum(RoleEnum), unique=True, index=True)
    parent_id = Column(String(36), ForeignKey("roles.id"), nullable=True)
    parent = relationship("Role", remote_side=[id])

class Location(Base):
    __tablename__ = "locations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    code = Column(Enum(LocationEnum), unique=True)

class Team(Base):
    __tablename__ = "teams"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    code = Column(String, unique=True)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    action = Column(String, unique=True)

class RolePermission(Base):
    __tablename__ = "role_permissions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id"))
    permission_id = Column(String(36), ForeignKey("permissions.id"))
    role = relationship("Role")
    permission = relationship("Permission")

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role_id = Column(String(36), ForeignKey("roles.id"))
    location_id = Column(String(36), ForeignKey("locations.id"))
    team_id = Column(String(36), ForeignKey("teams.id"))
    disabled = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("Role")
    location = relationship("Location")
    team = relationship("Team")

class AuthLog(Base):
    __tablename__ = "auth_logs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String)
    ip_address = Column(String)
    user = relationship("User")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False)

    user = relationship("User", backref="patient_profile", uselist=False)
