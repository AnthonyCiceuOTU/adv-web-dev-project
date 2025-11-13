from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.session import SessionLocal, engine
from app.db.models import Base, User, Attempt
from app.db.schemas import SubmitIn, ScoreOut

router = APIRouter()
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_or_create_user(db: Session, email: str) -> User:
    u = db.query(User).filter(User.email == email).first()
    if not u:
        u = User(email=email)
        db.add(u)
        db.commit()
        db.refresh(u)
    return u

@router.post("", response_model=ScoreOut)
def submit_score(body: SubmitIn, current: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_or_create_user(db, current)
    a = Attempt(total=body.total, correct=body.correct, category=body.category, difficulty=body.difficulty, user_id=user.id)
    db.add(a); db.commit(); db.refresh(a)
    return ScoreOut(id=a.id, total=a.total, correct=a.correct, category=a.category, difficulty=a.difficulty)

@router.get("", response_model=List[ScoreOut])
def list_scores(current: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_or_create_user(db, current)
    items = db.query(Attempt).filter(Attempt.user_id == user.id).order_by(Attempt.created_at.desc()).all()
    return [ScoreOut(id=i.id, total=i.total, correct=i.correct, category=i.category, difficulty=i.difficulty) for i in items]
