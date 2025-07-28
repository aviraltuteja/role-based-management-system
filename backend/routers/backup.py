from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pandas as pd
import io
from sqlalchemy.orm import Session
from database import get_db
from models import Patient, GenderEnum
from datetime import datetime
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

        return df  # ✅ Return DataFrame directly

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload-excel/")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files allowed")

    df = validate_excel(file)

    for _, row in df.iterrows():
        try:
            # Normalize gender to uppercase and strip whitespace
            gender_value = row["Gender"]
            if not isinstance(gender_value, str):
                raise ValueError(f"Invalid gender type at row: {gender_value}")

            normalized_gender = gender_value.strip().upper()

            patient = Patient(
                first_name=row["First Name"].strip(),
                last_name=row["Last Name"].strip(),
                date_of_birth=pd.to_datetime(row["Date of Birth"]).date(),
                gender=GenderEnum[normalized_gender]
            )
            db.add(patient)

        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid gender value: '{row['Gender']}'")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error inserting row: {e}")

    db.commit()

    return {"message": f"Successfully uploaded {len(df)} records."}
