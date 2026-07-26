import os
import sqlite3
from datetime import datetime, timezone

from app.core.settings import settings


class UploadStore:
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
                CREATE TABLE IF NOT EXISTS uploads (
                  id TEXT PRIMARY KEY,
                  client_id TEXT,
                  filename TEXT,
                  path TEXT NOT NULL,
                  created_at TEXT NOT NULL
                )
                """
            )
            con.commit()
        finally:
            con.close()

    def insert(self, upload_id: str, client_id: str | None, filename: str | None, path: str) -> None:
        con = self._connect()
        try:
            con.execute(
                """
                INSERT OR REPLACE INTO uploads (id, client_id, filename, path, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    upload_id,
                    client_id,
                    filename,
                    path,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            con.commit()
        finally:
            con.close()

    def get_path(self, upload_id: str) -> str | None:
        con = self._connect()
        try:
            cur = con.execute("SELECT path FROM uploads WHERE id = ?", (upload_id,))
            row = cur.fetchone()
            return row[0] if row else None
        finally:
            con.close()

