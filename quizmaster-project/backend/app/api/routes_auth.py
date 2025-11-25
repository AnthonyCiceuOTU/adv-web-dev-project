import os
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
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

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
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

@router.post("/google", response_model=TokenOut)
def login_with_google(payload: dict, db: Session = Depends(get_db)):
    """
    Frontend sends: { "id_token": "<google id_token>" }
    We verify the token with Google, extract email/name, create user if needed,
    and return our own JWT (TokenOut).
    """
    id_token = payload.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing id_token")

    try:
        # Verify token and get claims
        claims = google_id_token.verify_oauth2_token(id_token, google_requests.Request(), GOOGLE_CLIENT_ID)
        # claims will contain 'email', 'email_verified', 'name', 'picture', etc.
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    # Require email_verified to be true (optional but recommended)
    if not claims.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google account email not verified")

    email = claims.get("email")
    name = claims.get("name") or email.split("@")[0]

    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # create a user without password (OAuth-only)
        user = User(email=email, password="", name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # keep name in sync if not set
        if not user.name and name:
            user.name = name
            db.add(user)
            db.commit()
            db.refresh(user)

    # Return JWT token for our app (sub = email)
    token = create_access_token({"sub": email})
    return TokenOut(access_token=token)


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

    # Update name
    if body.name is not None:
        user.name = body.name.strip()

    # Update email
    if body.email is not None:
        # Check if email already exists
        existing = db.query(User).filter(User.email == body.email).first()
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already in use")

        user.email = body.email

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
