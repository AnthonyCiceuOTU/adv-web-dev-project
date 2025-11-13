from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def login():
    r = client.post("/auth/login", json={"email":"demo@user.com","password":"demo"})
    assert r.status_code == 200
    return {"Authorization": "Bearer " + r.json()["access_token"]}

def test_categories_requires_auth():
    r = client.get("/quiz/categories")
    assert r.status_code in (401,403)

def test_categories_mock(monkeypatch):
    headers = login()
    class MockResp:
        def raise_for_status(self): pass
        def json(self): return {"trivia_categories":[{"id":9,"name":"General Knowledge"}]}
    import app.api.routes_quiz as rq
    monkeypatch.setattr(rq.requests, "get", lambda *a, **k: MockResp())
    r = client.get("/quiz/categories", headers=headers)
    assert r.status_code == 200
    assert r.json()[0]["name"] == "General Knowledge"
