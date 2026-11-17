import sqlite3
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from pydantic import BaseModel, Field

from . import care, environment, errors, results
from .db import get_db, init_db
from .errors import ApiError
from .security import _secret, current_account, issue_token, verify_password


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _secret()  # fail fast at startup when the signing secret is missing
    init_db()
    yield


app = FastAPI(title="Avela Core API", version="0.1.0", lifespan=lifespan)
errors.install(app)
api = APIRouter(prefix="/api/v1")


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


@app.get("/health")
def health():
    return {"status": "ok"}


@api.post("/auth/login")
def login(body: LoginIn, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id, password_hash FROM accounts WHERE username = ?", (body.username,)).fetchone()
    if row is None or not verify_password(body.password, row["password_hash"]):
        raise ApiError(401, "INVALID_CREDENTIALS", "Username or password is incorrect.")
    return {"accessToken": issue_token(row["id"]), "tokenType": "bearer"}


@api.get("/me")
def me(account: dict = Depends(current_account)):
    return {"id": account["id"], "username": account["username"], "role": account["role"],
            "displayName": account["display_name"], "facilities": account["facilities"]}


api.include_router(care.router)
api.include_router(results.router)
api.include_router(environment.router)
app.include_router(api)
