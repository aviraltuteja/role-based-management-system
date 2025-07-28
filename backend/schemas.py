from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime, date
from uuid import UUID


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    USER = "USER"

class LocationEnum(str, Enum):
    EUROPE = "EUROPE"
    INDIA = "INDIA"
    NORTH_AMERICA = "NORTH_AMERICA"
    

class GenderEnum(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class UserCreate(BaseModel):
    username: str
    full_name: str
    password: str
    role: RoleEnum
    location: LocationEnum
    team: str

class UserOut(BaseModel):
    username: str
    full_name: str
    role: RoleEnum
    location: LocationEnum
    team: str
    disabled: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserWithToken(BaseModel):
    user: UserOut
    token: Token

class PatientOut(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    user_id: Optional[UUID]

    class Config:
        from_attributes = True

class MetaData(BaseModel):
    page: int
    limit: int
    total: int

class PatientListResponse(BaseModel):
    data: List[PatientOut]
    meta: MetaData

class PatientUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[GenderEnum]    


class UserTableOut(BaseModel):
    id: str
    username: str
    full_name: Optional[str]
    role: Optional[str]
    location: Optional[str]
    team: Optional[str]
    disabled: bool
    created_at: datetime

    class Config:
        from_attributes = True    