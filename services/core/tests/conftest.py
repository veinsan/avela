import pytest
from fastapi.testclient import TestClient

PASSWORD = "test-password-only"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("AVELA_DB_PATH", str(tmp_path / "test.db"))
    monkeypatch.setenv("AVELA_JWT_SECRET", "x" * 40)
    from app.main import app
    from app.seed import seed
    seed(PASSWORD)
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth(client):
    def headers(username: str) -> dict:
        r = client.post("/api/v1/auth/login", json={"username": username, "password": PASSWORD})
        assert r.status_code == 200, r.text
        return {"Authorization": f"Bearer {r.json()['accessToken']}"}
    return headers
