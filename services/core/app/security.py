import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, Header

from .db import get_db
from .errors import ApiError

TOKEN_TTL = timedelta(hours=12)


def _secret() -> str:
    secret = os.environ.get("AVELA_JWT_SECRET")
    if not secret or len(secret) < 32:
        raise RuntimeError("AVELA_JWT_SECRET must be set to at least 32 characters")
    return secret


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    _, salt, digest = stored.split("$")
    candidate = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=2**14, r=8, p=1)
    return hmac.compare_digest(candidate.hex(), digest)


def issue_token(account_id: str) -> str:
    exp = datetime.now(timezone.utc) + TOKEN_TTL
    return jwt.encode({"sub": account_id, "exp": exp}, _secret(), algorithm="HS256")


def current_account(authorization: str = Header(default=""), db: sqlite3.Connection = Depends(get_db)) -> dict:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise ApiError(401, "UNAUTHENTICATED", "Sign in is required.")
    try:
        sub = jwt.decode(token, _secret(), algorithms=["HS256"])["sub"]
    except jwt.PyJWTError:
        raise ApiError(401, "UNAUTHENTICATED", "Session is invalid or expired.")
    row = db.execute("SELECT id, username, role, display_name FROM accounts WHERE id = ?", (sub,)).fetchone()
    if row is None:
        raise ApiError(401, "UNAUTHENTICATED", "Session is invalid or expired.")
    account = dict(row)
    account["facilities"] = [r[0] for r in db.execute(
        "SELECT facility_id FROM memberships WHERE account_id = ?", (sub,))]
    return account


def resident(account: dict = Depends(current_account)) -> dict:
    if account["role"] != "resident":
        raise ApiError(403, "FORBIDDEN", "This action is for resident accounts.")
    return account


def staff(account: dict = Depends(current_account)) -> dict:
    if account["role"] != "staff" or not account["facilities"]:
        raise ApiError(403, "FORBIDDEN", "This action is for facility staff.")
    return account
