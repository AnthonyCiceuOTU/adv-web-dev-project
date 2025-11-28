# QuizMaster — CSCI 4230U Advanced Web Development Project

A full‑stack quiz app where users log in, pick a category & difficulty, answer questions pulled from **Open Trivia DB**, and save their scores.

### Backend (FastAPI)
Requires python version 3.11 installed 
```powershell
cd quizmaster-project
cd backend
py -3.11 -m venv .venv
.\venv\Scripts\Activate
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Demo login: `demo@user.com` / `demo`

### Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
- Frontend: http://localhost:5173

## Docker (to satisfy deliverables)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## API (overview)
- `POST /auth/login` → JWT
- `GET  /quiz/categories` → from external API (Open Trivia DB)
- `GET  /quiz/start?category=9&difficulty=easy&amount=10` → normalized questions
- `POST /quiz/submit` → save score `{ total, correct, category, difficulty }`
- `GET  /scores` → list of attempts for the user

## Testing
- `cd backend && pytest -q` (unit/integration)
- Selenium E2E script at `tests/e2e/test_e2e.py`

## Deployment (high level)
- Push to GitHub (public repo).
- Deploy backend Docker image to Render/Fly.io.
- Deploy frontend to Netlify/Vercel (or Docker host).
- Put Cloudflare in front for HTTPS/HTTP2.
- Record PageSpeed results in README.

## License
MIT
