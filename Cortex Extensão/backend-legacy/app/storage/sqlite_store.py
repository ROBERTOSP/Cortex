import json
import os
import sqlite3
from typing import Iterable

from app.core.settings import settings
from app.models.events import TelemetryEvent


class SqliteEventStore:
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
                CREATE TABLE IF NOT EXISTS telemetry_events (
                  id TEXT PRIMARY KEY,
                  occurred_at TEXT NOT NULL,
                  source TEXT NOT NULL,
                  event_type TEXT NOT NULL,
                  client_id TEXT NOT NULL,
                  url TEXT NOT NULL,
                  payload_json TEXT NOT NULL
                )
                """
            )
            con.commit()
        finally:
            con.close()

    def insert_many(self, events: Iterable[TelemetryEvent]) -> int:
        rows = []
        for e in events:
            payload = e.model_dump(mode="json")
            rows.append(
                (
                    e.id,
                    e.occurred_at,
                    e.source,
                    e.event_type,
                    e.client_id,
                    e.url,
                    json.dumps(payload, ensure_ascii=False),
                )
            )

        con = self._connect()
        try:
            con.executemany(
                """
                INSERT OR REPLACE INTO telemetry_events
                (id, occurred_at, source, event_type, client_id, url, payload_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                rows,
            )
            con.commit()
            return len(rows)
        finally:
            con.close()
