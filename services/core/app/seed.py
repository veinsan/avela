"""Create synthetic demo facilities and accounts. Usage: python -m app.seed (safe to rerun after an upgrade)"""
import json
import os

from .db import connect, init_db, new_id
from .security import hash_password

WEEK = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")

# (id, name, area, services, hours per day from Monday; None is an unknown day) - all fictional (D-24)
FACILITIES = [
    ("demo-facility-001", "Puskesmas Simulasi Avela A", "pekanbaru",
     ["Pemeriksaan umum", "Pemeriksaan pernapasan", "Nebulisasi"],
     ["07:30-14:00"] * 4 + ["07:30-11:00", "07:30-12:00", "closed"]),
    ("demo-facility-002", "Klinik Simulasi Avela B", "palangka-raya",
     ["Pemeriksaan umum", "Konsultasi dokter"],
     ["08:00-16:00"] * 5 + [None, None]),
]

# (username, role, display name, facility) - all fictional
ACCOUNTS = [("warga1", "resident", "Warga Fiktif Satu", None),
            ("warga2", "resident", "Warga Fiktif Dua", None),
            ("petugas1", "staff", "Petugas Simulasi A", "demo-facility-001"),
            ("petugas2", "staff", "Petugas Simulasi B", "demo-facility-002")]


PEER_TEST_ACCOUNT = ("uji-mitra", "resident", "Akun Uji Mitra", None)  # shared with peer groups (A-18)


def seed(password: str, peer_password: str | None = None) -> None:
    """The peer test account gets its own password so sharing it never exposes the demo accounts."""
    init_db()
    conn = connect()
    with conn:
        for fid, name, area, services, hours in FACILITIES:
            schedule = json.dumps([{"day": d, "hours": h} for d, h in zip(WEEK, hours)])
            conn.execute("INSERT INTO facilities (id, name, area_id, services, schedule) VALUES (?, ?, ?, ?, ?)"
                         " ON CONFLICT (id) DO UPDATE SET name = excluded.name, area_id = excluded.area_id,"
                         " services = excluded.services, schedule = excluded.schedule",
                         (fid, name, area, json.dumps(services), schedule))
        accounts = [(a, password) for a in ACCOUNTS]
        if peer_password:
            accounts.append((PEER_TEST_ACCOUNT, peer_password))
        for (username, role, name, facility), secret in accounts:
            if conn.execute("SELECT 1 FROM accounts WHERE username = ?", (username,)).fetchone():
                continue
            account_id = new_id()
            conn.execute("INSERT INTO accounts (id, username, password_hash, role, display_name) "
                         "VALUES (?, ?, ?, ?, ?)", (account_id, username, hash_password(secret), role, name))
            if facility:
                conn.execute("INSERT INTO memberships (account_id, facility_id) VALUES (?, ?)",
                             (account_id, facility))
    conn.close()


if __name__ == "__main__":
    password = os.environ.get("AVELA_DEMO_PASSWORD")
    if not password or len(password) < 10:
        raise SystemExit("Set AVELA_DEMO_PASSWORD (10+ characters) before seeding.")
    peer_password = os.environ.get("AVELA_PEER_TEST_PASSWORD")
    if peer_password is not None and len(peer_password) < 10:
        raise SystemExit("AVELA_PEER_TEST_PASSWORD needs 10+ characters.")
    seed(password, peer_password)
    names = [a[0] for a in ACCOUNTS] + ([PEER_TEST_ACCOUNT[0]] if peer_password else [])
    print("Seeded demo facilities and accounts:", ", ".join(names))
