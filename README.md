# QuizMaster — CSCI 4230U Advanced Web Development Project

A full‑stack quiz app where users log in, pick a category & difficulty, answer questions pulled from **Open Trivia DB**, and save their scores.

## How to run Manually

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
- Demo login: `test@Otech.com` / `test`

### Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
- Frontend: http://localhost:5173


## How to run using Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 📘 API Endpoint Reference

### 🔐 Authentication Endpoints

| Method | Endpoint     | Auth | Body                        | Description                                           |
|--------|--------------|------|-----------------------------|-------------------------------------------------------|
| **POST** | `/register` | ❌    | `LoginIn`                   | Register a new user. Returns JWT.                     |
| **POST** | `/login`    | ❌    | `LoginIn`                   | Log in with email/password. Returns JWT.              |
| **POST** | `/google`   | ❌    | `{ "id_token": "string" }` | Log in via Google OAuth. Creates user if missing.     |

---

### 👤 User Endpoints

| Method | Endpoint | Auth | Body         | Description                                 |
|--------|----------|------|--------------|---------------------------------------------|
| **GET** | `/me`    | ✅    | None         | Returns current user's profile.             |
| **PATCH** | `/me`  | ✅    | `UserUpdate` | Update current user’s name or email.        |
| **DELETE** | `/me` | ✅    | None         | Delete the authenticated user account.      |

---

### 🎮 Trivia Endpoints

| Method | Endpoint        | Auth | Parameters                                   | Description                                  |
|--------|------------------|------|------------------------------------------------|----------------------------------------------|
| **GET** | `/categories`   | ✅    | None                                           | Fetch trivia categories from external API.   |
| **GET** | `/start`        | ✅    | `category`, `difficulty`, `amount`             | Fetch trivia questions from external API.    |

---

### 🏆 Score Endpoints

Base path: `/scores`

| Method | Endpoint     | Auth | Body / Query | Description                               |
|--------|--------------|------|--------------|-------------------------------------------|
| **POST** | `/scores`  | ✅    | `SubmitIn`   | Save a user score after completing a quiz.|
| **GET**  | `/scores`  | ✅    | None         | List all quiz attempts for the user.      |

---


## Testing
### Selenium Base
- `cd backend`
- Make sure to have venv activated
- Make sure frontend and backend are running on separate terminals
- Selenium Base Tests `pytest tests/selenium_tests.py`
