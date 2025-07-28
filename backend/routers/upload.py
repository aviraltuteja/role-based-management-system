from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pandas as pd
import io
from sqlalchemy.orm import Session
from database import get_db
from models import Patient
from datetime import datetime
from encryption import encrypt_field
import uuid

router = APIRouter()

EXPECTED_COLUMNS = {
    "Patient ID": str,
    "First Name": str,
    "Last Name": str,
    "Date of Birth": "datetime64[ns]",
    "Gender": str
}

def validate_excel(file: UploadFile) -> pd.DataFrame:
    try:
        content = file.file.read()
        df = pd.read_excel(io.BytesIO(content))

        missing = [col for col in EXPECTED_COLUMNS if col not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing)}")

        errors = []
        for index, row in df.iterrows():
            for col, dtype in EXPECTED_COLUMNS.items():
                value = row[col]
                if pd.isnull(value):
                    errors.append(f"Row {index+2}: Missing value in '{col}'")
                elif dtype == str and not isinstance(value, str):
                    errors.append(f"Row {index+2}: '{col}' should be text")
                elif dtype == "datetime64[ns]" and not pd.api.types.is_datetime64_any_dtype(pd.Series([value])):
                    errors.append(f"Row {index+2}: '{col}' should be a valid date")

        if errors:
            raise HTTPException(status_code=400, detail=errors)

        return df

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload-excel/")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files allowed")

    df = validate_excel(file)

    for _, row in df.iterrows():
        try:
            # Normalize and encrypt gender
            gender_value = row["Gender"]
            if not isinstance(gender_value, str):
                raise ValueError(f"Invalid gender type at row: {gender_value}")
            normalized_gender = gender_value.strip().upper()
            encrypted_gender = encrypt_field(normalized_gender)

            encrypted_first_name = encrypt_field(row["First Name"].strip())
            encrypted_last_name = encrypt_field(row["Last Name"].strip())
            dob = pd.to_datetime(row["Date of Birth"]).date()

            patient = Patient(
                first_name=encrypted_first_name,
                last_name=encrypted_last_name,
                date_of_birth=dob, 
                gender=encrypted_gender,
            )
            db.add(patient)

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error inserting row: {e}")

    db.commit()

    return {"message": f"Successfully uploaded {len(df)} records."}
