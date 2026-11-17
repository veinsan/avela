"""Manage X-API-Keys for peer groups and the integration service.

Usage:
  python -m app.keys create <label> <scope> [<scope> ...]   prints the key once
  python -m app.keys list
  python -m app.keys revoke <label>

Peer group scopes: areas:read signal:read guidance:read. Integration service: snapshots:write.
"""
import secrets
import sys

from .db import connect, init_db, new_id, now
from .security import hash_key

SCOPES = {"snapshots:write", "areas:read", "signal:read", "guidance:read"}


def create_key(label: str, scopes: list[str]) -> str:
    unknown = set(scopes) - SCOPES
    if not scopes or unknown:
        raise ValueError(f"Unknown or missing scopes: {sorted(unknown)}. Allowed: {sorted(SCOPES)}")
    raw = "avk_" + secrets.token_urlsafe(32)
    init_db()
    conn = connect()
    with conn:
        conn.execute("INSERT INTO api_keys (id, label, key_hash, scopes, created_at) VALUES (?, ?, ?, ?, ?)",
                     (new_id(), label, hash_key(raw), " ".join(sorted(set(scopes))), now()))
    conn.close()
    return raw


def main(args: list[str]) -> None:
    init_db()
    conn = connect()
    if args[:1] == ["create"] and len(args) >= 3:
        print(create_key(args[1], args[2:]))
        print("Store this key now; only its hash is kept.", file=sys.stderr)
    elif args == ["list"]:
        for row in conn.execute("SELECT label, scopes, created_at FROM api_keys ORDER BY created_at"):
            print(row["label"], row["scopes"], row["created_at"], sep="\t")
    elif args[:1] == ["revoke"] and len(args) == 2:
        with conn:
            deleted = conn.execute("DELETE FROM api_keys WHERE label = ?", (args[1],)).rowcount
        print("revoked" if deleted else "no key with that label")
    else:
        raise SystemExit(__doc__)
    conn.close()


if __name__ == "__main__":
    main(sys.argv[1:])
