import os
import secrets
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.core.settings import settings


@dataclass(frozen=True)
class SessionRow:
    token: str
    user_id: int
    expires_at: datetime


class SessionStore:
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
                CREATE TABLE IF NOT EXISTS user_sessions (
                  token TEXT PRIMARY KEY,
                  user_id INTEGER NOT NULL,
                  expires_at TEXT NOT NULL,
                  created_at TEXT NOT NULL
                )
                """
            )
            con.commit()
        finally:
            con.close()

    def create_session(self, user_id: int, ttl_hours: int = 24 * 30) -> SessionRow:
        token = secrets.token_urlsafe(48)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=int(ttl_hours))
        con = self._connect()
        try:
            con.execute(
                "INSERT INTO user_sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, datetime('now'))",
                (token, int(user_id), expires_at.isoformat()),
            )
            con.commit()
            return SessionRow(token=token, user_id=int(user_id), expires_at=expires_at)
        finally:
            con.close()

    def get_user_id(self, token: str) -> int | None:
        con = self._connect()
        try:
            cur = con.execute("SELECT user_id, expires_at FROM user_sessions WHERE token = ?", (token,))
            row = cur.fetchone()
            if not row:
                return None
            user_id = int(row[0])
            expires_at_raw = row[1]
            try:
                expires_at = datetime.fromisoformat(expires_at_raw)
            except Exception:
                return None
            now = datetime.now(timezone.utc)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at <= now:
                return None
            return user_id
        finally:
            con.close()

    def delete_session(self, token: str) -> None:
        con = self._connect()
        try:
            con.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
            con.commit()
        finally:
            con.close()

