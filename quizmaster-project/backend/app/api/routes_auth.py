from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, verify_password
from app.db.schemas import LoginIn, TokenOut
from app.db.models import User
from app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=TokenOut)
def register(body: LoginIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    new_user = User(
        email=body.email,
        password=hash_password(body.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return TokenOut(
        access_token=create_access_token({"sub": body.email})
    )


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenOut(
        access_token=create_access_token({"sub": body.email})
    )
