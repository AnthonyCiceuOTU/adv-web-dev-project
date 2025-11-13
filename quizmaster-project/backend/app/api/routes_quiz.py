import os, requests, html
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.db.schemas import Category, Question, StartOut

router = APIRouter()
BASE = os.getenv("EXTERNAL_API_BASE","https://opentdb.com")

@router.get("/categories", response_model=List[Category])
def categories(current: str = Depends(get_current_user)):
    try:
        r = requests.get(f"{BASE}/api_category.php", timeout=10)
        r.raise_for_status()
        cats = r.json().get("trivia_categories") or []
        return [Category(id=c["id"], name=c["name"]) for c in cats]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"External API error: {e}")

@router.get("/start", response_model=StartOut)
def start(category: int, difficulty: str="easy", amount: int = 10, current: str = Depends(get_current_user)):
    try:
        params = {"amount": amount, "type": "multiple", "category": category, "difficulty": difficulty}
        r = requests.get(f"{BASE}/api.php", params=params, timeout=10)
        r.raise_for_status()
        results = r.json().get("results") or []
        items = []
        for q in results:
            items.append(Question(
                question=html.unescape(q["question"]),
                correct_answer=html.unescape(q["correct_answer"]),
                incorrect_answers=[html.unescape(a) for a in q["incorrect_answers"]]
            ))
        return StartOut(items=items)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"External API error: {e}")
