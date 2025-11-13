from fastapi import APIRouter, HTTPException
from app.core.security import create_access_token
from app.db.schemas import LoginIn, TokenOut

router = APIRouter()

@router.post("/login", response_model=TokenOut)
def login(body: LoginIn):
    if body.email == "demo@user.com" and body.password == "demo":
        return TokenOut(access_token=create_access_token({"sub": body.email}))
    raise HTTPException(status_code=401, detail="Invalid credentials")
