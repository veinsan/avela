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
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);
INSERT OR IGNORE INTO areas (id, name, province, latitude, longitude) VALUES
    ('pekanbaru', 'Pekanbaru', 'Riau', 0.5071, 101.4478),
    ('palangka-raya', 'Palangka Raya', 'Kalimantan Tengah', -2.2096, 113.9213);
CREATE TABLE IF NOT EXISTS area_snapshots (
    id TEXT PRIMARY KEY,
    area_id TEXT NOT NULL REFERENCES areas(id),
    provider TEXT NOT NULL,
    model_domain TEXT,
    data_kind TEXT NOT NULL,
    unit TEXT NOT NULL,
    attributions TEXT NOT NULL,
    is_synthetic INTEGER NOT NULL,
    points TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    pushed_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS area_snapshots_latest ON area_snapshots (area_id, retrieved_at);
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    key_hash TEXT NOT NULL UNIQUE,
    scopes TEXT NOT NULL,
    created_at TEXT NOT NULL
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


# Columns added after the first STB deploy. CREATE TABLE IF NOT EXISTS leaves an existing table as it is,
# so each one is added here when missing. Old rows keep NULL.
COLUMNS = [
    ("reports", "area_id", "TEXT REFERENCES areas(id)"),
    ("reports", "exposure_context", "TEXT"),
    ("reports", "exposure_context_reason", "TEXT"),
    ("facilities", "area_id", "TEXT REFERENCES areas(id)"),
    ("facilities", "services", "TEXT"),
    ("facilities", "schedule", "TEXT"),
]


def init_db() -> None:
    conn = connect()
    conn.execute("PRAGMA journal_mode = WAL")
    conn.executescript(SCHEMA)
    for table, column, ddl in COLUMNS:
        if column not in {r["name"] for r in conn.execute(f"PRAGMA table_info({table})")}:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")
    conn.commit()
    conn.close()


def get_db():
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


def new_id() -> str:
    return str(uuid.uuid4())


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def now() -> str:
    return iso(datetime.now(timezone.utc))
