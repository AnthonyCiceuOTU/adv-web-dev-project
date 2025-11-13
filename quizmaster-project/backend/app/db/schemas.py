from pydantic import BaseModel
from typing import List

class LoginIn(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Category(BaseModel):
    id: int
    name: str

class Question(BaseModel):
    question: str
    correct_answer: str
    incorrect_answers: List[str]

class StartOut(BaseModel):
    items: List[Question]

class SubmitIn(BaseModel):
    total: int
    correct: int
    category: str
    difficulty: str

class ScoreOut(BaseModel):
    id: int
    total: int
    correct: int
    category: str
    difficulty: str
