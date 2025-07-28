from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import List
import models, schemas, auth
from database import SessionLocal, engine, Base
from routers.upload import router as upload_router
from database import get_db
from routers import patients, users






app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(upload_router)
app.include_router(patients.router)
app.include_router(users.router)



Base.metadata.create_all(bind=engine)



@app.post("/register", response_model=schemas.UserWithToken)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db), request: Request = None):
    role = db.query(models.Role).filter_by(name=user_in.role).first()
    if not role:
        role = models.Role(name=user_in.role)
        db.add(role)
    
    location = db.query(models.Location).filter_by(code=user_in.location).first()
    if not location:
        location = models.Location(code=user_in.location)
        db.add(location)

    team = db.query(models.Team).filter_by(code=user_in.team).first()
    if not team:
        team = models.Team(code=user_in.team)
        db.add(team)

    db.commit()
    db.refresh(role)
    db.refresh(location)
    db.refresh(team)

    hashed_password = auth.get_password_hash(user_in.password)
    user = models.User(username=user_in.username, full_name=user_in.full_name, hashed_password=hashed_password,
                       role_id=role.id, location_id=location.id, team_id=team.id)
    db.add(user)
    db.commit()
    db.refresh(user)

    log = models.AuthLog(user_id=user.id, status="success", ip_address=request.client.host)
    db.add(log)
    db.commit()

    # 🔐 Create and return access token just like login
    access_token = auth.create_access_token(data={"sub": user.username, "role": str(user.role.name)})
 

    return {
    "user": schemas.UserOut(
                username=user.username,
                full_name=user.full_name,
                role=user.role.name.value,  
                location=user.location.code.value,  
                team=str(user.team),
                disabled=user.disabled
            ),
    "token": {"access_token": access_token, "token_type": "bearer"}
}

@app.post("/token", response_model=schemas.UserWithToken)
def login(form_data: schemas.UserCreate, db: Session = Depends(get_db), request: Request = None):
    user = db.query(models.User).filter_by(username=form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        log = models.AuthLog(user_id=user.id if user else None, status="failed", ip_address=request.client.host)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = auth.create_access_token(data={"sub": user.username, "role": str(user.role.name)})
    log = models.AuthLog(user_id=user.id, status="success", ip_address=request.client.host)
    db.add(log)
    db.commit()
    return {
    "user": schemas.UserOut(
                username=user.username,
                full_name=user.full_name,
                role=user.role.name.value,  
                location=user.location.code.value,  
                team=str(user.team),
                disabled=user.disabled
            ),
    "token": {"access_token": access_token, "token_type": "bearer"}
}

@app.post("/token/refresh", response_model=schemas.UserWithToken)
def login_with_token(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db), request: Request = None):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter_by(username=username).first()
    if user is None or user.disabled:
        raise credentials_exception

    # Optionally log this re-authentication
    log = models.AuthLog(user_id=user.id, status="token_login", ip_address=request.client.host)
    db.add(log)
    db.commit()

    # Generate a fresh token (if needed)
    access_token = auth.create_access_token(data={"sub": user.username, "role": str(user.role.name)})
    
    return {
        "user": schemas.UserOut(
            username=user.username,
            full_name=user.full_name,
            role=user.role.name.value,
            location=user.location.code.value,
            team=user.team.code,
            disabled=user.disabled
        ),
        "token": {"access_token": access_token, "token_type": "bearer"}
    }

@app.get("/me", response_model=schemas.UserOut)
def read_me(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username = payload.get("sub")
        role_name = payload.get("role")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter_by(username=username).first()
    return schemas.UserOut(username=user.username, full_name=user.full_name,
                           role=user.role.name.value,
                           location=user.location.code,
                           team=user.team.code,
                           disabled=user.disabled)

@app.get("/permissions/{role}", response_model=List[str])
def get_permissions(role: schemas.RoleEnum, db: Session = Depends(get_db)):
    role_obj = db.query(models.Role).filter_by(name=role).first()
    if not role_obj:
        raise HTTPException(status_code=404, detail="Role not found")
    permissions = db.query(models.Permission.action).join(models.RolePermission).filter(models.RolePermission.role_id == role_obj.id).all()
    return [p[0] for p in permissions]

@app.post("/logout")
def logout(request: Request, token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log = models.AuthLog(user_id=user.id, status="logout", ip_address=request.client.host)
    db.add(log)
    db.commit()
    return {"message": "Logout successful"}

