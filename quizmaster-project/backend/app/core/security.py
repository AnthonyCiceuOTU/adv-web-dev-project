import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from passlib.context import CryptContext

SECRET = os.getenv("JWT_SECRET", "change-me")
ALGO = "HS256"
auth = HTTPBearer()

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # bcrypt max size fix
    password = password[:72]
    return pwd.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd.verify(password[:72], hashed)


def create_access_token(data: dict, expires: timedelta = timedelta(hours=3)) -> str:
    to_encode = {**data, "exp": datetime.utcnow() + expires}
    return jwt.encode(to_encode, SECRET, algorithm=ALGO)

def get_current_user(credentials=Depends(auth)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=[ALGO])
        return str(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
