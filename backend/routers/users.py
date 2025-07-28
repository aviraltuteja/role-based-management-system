from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserTableOut

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=list[UserTableOut])
def get_users(db: Session = Depends(get_db)):
    print('API HIT')
    users = db.query(User).all()
    return [
        UserTableOut(
            id=u.id,
            username=u.username,
            full_name=u.full_name,
            role=u.role.name.name if u.role else None,
            location=u.location.code.name if u.location else None,
            team=u.team.code if u.team else None,
            disabled=u.disabled,
            created_at=u.created_at,
        )
        for u in users
    ]
