from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_user,
)
from app.db.schemas import LoginIn, TokenOut, UserProfile, UserUpdate
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

    # Default display name from email prefix
    display_name = body.email.split("@")[0]

    new_user = User(
        email=body.email,
        password=hash_password(body.password),
        name=display_name,
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


@router.get("/me", response_model=UserProfile)
def read_me(current: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(email=user.email, name=user.name)


@router.patch("/me", response_model=UserProfile)
def update_me(
    body: UserUpdate,
    current: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == current).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_name = body.name.strip()
    user.name = new_name or None

    db.add(user)
    db.commit()
    db.refresh(user)

    return UserProfile(email=user.email, name=user.name)


@router.delete("/me", status_code=204)
def delete_me(current: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return Response(status_code=204)
