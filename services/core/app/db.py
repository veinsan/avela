import os
import sqlite3
import uuid
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('resident', 'staff')),
    display_name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS memberships (
    account_id TEXT NOT NULL REFERENCES accounts(id),
    facility_id TEXT NOT NULL REFERENCES facilities(id),
    PRIMARY KEY (account_id, facility_id)
);
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES accounts(id),
    facility_id TEXT NOT NULL REFERENCES facilities(id),
    complaint TEXT NOT NULL,
    onset_at TEXT NOT NULL,
    course TEXT NOT NULL,
    additional_context TEXT,
    consent_version TEXT NOT NULL,
    state TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    reviewer_id TEXT REFERENCES accounts(id),
    idempotency_key TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (owner_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS report_events (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL REFERENCES reports(id),
    author_id TEXT NOT NULL REFERENCES accounts(id),
    kind TEXT NOT NULL,
    text TEXT,
    disposition TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES accounts(id),
    report_id TEXT NOT NULL REFERENCES reports(id),
    facility_id TEXT NOT NULL REFERENCES facilities(id),
    author_id TEXT NOT NULL REFERENCES accounts(id),
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    created_at TEXT NOT NULL,
    published_at TEXT
);
"""


def db_path() -> str:
    return os.environ.get("AVELA_DB_PATH", "avela.db")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 5000")
    return conn


def init_db() -> None:
    conn = connect()
    conn.execute("PRAGMA journal_mode = WAL")
    conn.executescript(SCHEMA)
    conn.close()


def get_db():
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


def new_id() -> str:
    return str(uuid.uuid4())


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
