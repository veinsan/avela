"""Create synthetic demo facilities and accounts. Usage: python -m app.seed"""
import os

from .db import connect, init_db, new_id
from .security import hash_password

FACILITIES = [("demo-facility-001", "Puskesmas Simulasi Avela A"),
              ("demo-facility-002", "Klinik Simulasi Avela B")]

# (username, role, display name, facility) - all fictional
ACCOUNTS = [("warga1", "resident", "Warga Fiktif Satu", None),
            ("warga2", "resident", "Warga Fiktif Dua", None),
            ("petugas1", "staff", "Petugas Simulasi A", "demo-facility-001"),
            ("petugas2", "staff", "Petugas Simulasi B", "demo-facility-002")]


def seed(password: str) -> None:
    init_db()
    conn = connect()
    with conn:
        conn.executemany("INSERT OR IGNORE INTO facilities (id, name) VALUES (?, ?)", FACILITIES)
        for username, role, name, facility in ACCOUNTS:
            if conn.execute("SELECT 1 FROM accounts WHERE username = ?", (username,)).fetchone():
                continue
            account_id = new_id()
            conn.execute("INSERT INTO accounts (id, username, password_hash, role, display_name) "
                         "VALUES (?, ?, ?, ?, ?)", (account_id, username, hash_password(password), role, name))
            if facility:
                conn.execute("INSERT INTO memberships (account_id, facility_id) VALUES (?, ?)",
                             (account_id, facility))
    conn.close()


if __name__ == "__main__":
    password = os.environ.get("AVELA_DEMO_PASSWORD")
    if not password or len(password) < 10:
        raise SystemExit("Set AVELA_DEMO_PASSWORD (10+ characters) before seeding.")
    seed(password)
    print("Seeded demo facilities and accounts:", ", ".join(a[0] for a in ACCOUNTS))
