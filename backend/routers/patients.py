from fastapi import APIRouter, Query, Depends, Path, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from database import get_db
from models import Patient
from schemas import PatientOut, PatientListResponse, GenderEnum, PatientUpdate
from encryption import decrypt_field, encrypt_field  # ⬅️ Import decryption function

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=PatientListResponse)
def get_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    sort_by: str = Query("id"),
    order: str = Query("asc"),
    db: Session = Depends(get_db)
):
    valid_columns = Patient.__table__.columns.keys()
    if sort_by not in valid_columns:
        sort_by = "id"

    sort_column = getattr(Patient, sort_by)
    sort_direction = asc(sort_column) if order == "asc" else desc(sort_column)

    total = db.query(Patient).count()
    patients = (
        db.query(Patient)
        .order_by(sort_direction)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    decrypted_patients = []
    for p in patients:
        decrypted_patients.append(PatientOut(
            id=p.id,
            first_name=decrypt_field(p.first_name),
            last_name=decrypt_field(p.last_name),
            date_of_birth=p.date_of_birth,
            gender=GenderEnum(decrypt_field(p.gender)),        
            user_id=p.user_id 
        ))

    return {
        "data": decrypted_patients,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
        },
    }

@router.patch("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: str = Path(...),
    patient_update: PatientUpdate = ...,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Update only provided fields with encryption if necessary
    if patient_update.first_name is not None:
        patient.first_name = encrypt_field(patient_update.first_name)

    if patient_update.last_name is not None:
        patient.last_name = encrypt_field(patient_update.last_name)

    if patient_update.date_of_birth is not None:
        patient.date_of_birth = patient_update.date_of_birth

    if patient_update.gender is not None:
        patient.gender = encrypt_field(patient_update.gender.value)

    db.commit()
    db.refresh(patient)

    return PatientOut(
        id=patient.id,
        first_name=decrypt_field(patient.first_name),
        last_name=decrypt_field(patient.last_name),
        date_of_birth=patient.date_of_birth,
        gender=GenderEnum(decrypt_field(patient.gender)),
        user_id=patient.user_id
    )

