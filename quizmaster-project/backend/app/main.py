from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_auth import router as auth_router
from app.api.routes_quiz import router as quiz_router
from app.api.routes_scores import router as scores_router

app = FastAPI(title="QuizMaster API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(quiz_router, prefix="/quiz", tags=["quiz"])
app.include_router(scores_router, prefix="/scores", tags=["scores"])
