import os
import sqlite3
from dataclasses import dataclass

from app.core.settings import settings


@dataclass(frozen=True)
class UserRow:
    id: int
    email: str | None
    name: str | None
    picture: str | None


class UserStore:
    def __init__(self, db_path: str | None = None) -> None:
        self.db_path = db_path or settings.db_path
        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        self._init()

    def _connect(self) -> sqlite3.Connection:
        con = sqlite3.connect(self.db_path)
        con.execute("PRAGMA journal_mode=WAL;")
        return con

    def _init(self) -> None:
        con = self._connect()
        try:
            con.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  provider TEXT NOT NULL,
                  provider_sub TEXT NOT NULL UNIQUE,
                  email TEXT,
                  name TEXT,
                  picture TEXT,
                  created_at TEXT NOT NULL
                )
                """
            )
            con.commit()
        finally:
            con.close()

    def upsert_google_user(self, sub: str, email: str | None, name: str | None, picture: str | None) -> UserRow:
        con = self._connect()
        try:
            cur = con.execute("SELECT id, email, name, picture FROM users WHERE provider = ? AND provider_sub = ?", ("google", sub))
            row = cur.fetchone()
            if row:
                user_id = int(row[0])
                con.execute(
                    "UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?",
                    (email, name, picture, user_id),
                )
                con.commit()
                return UserRow(id=user_id, email=email, name=name, picture=picture)

            con.execute(
                "INSERT INTO users (provider, provider_sub, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
                ("google", sub, email, name, picture),
            )
            user_id = int(con.execute("SELECT last_insert_rowid()").fetchone()[0])
            con.commit()
            return UserRow(id=user_id, email=email, name=name, picture=picture)
        finally:
            con.close()

