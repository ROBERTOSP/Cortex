import os
import sqlite3

from app.core.settings import settings


class TokenStore:
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
                CREATE TABLE IF NOT EXISTS token_balances (
                  client_id TEXT PRIMARY KEY,
                  balance INTEGER NOT NULL
                )
                """
            )
            con.commit()
        finally:
            con.close()

    def get_or_create(self, client_id: str) -> int:
        con = self._connect()
        try:
            cur = con.execute("SELECT balance FROM token_balances WHERE client_id = ?", (client_id,))
            row = cur.fetchone()
            if row:
                return int(row[0])
            con.execute(
                "INSERT INTO token_balances (client_id, balance) VALUES (?, ?)",
                (client_id, int(settings.initial_token_balance)),
            )
            con.commit()
            return int(settings.initial_token_balance)
        finally:
            con.close()

    def try_consume(self, client_id: str, amount: int) -> tuple[bool, int]:
        con = self._connect()
        try:
            cur = con.execute("SELECT balance FROM token_balances WHERE client_id = ?", (client_id,))
            row = cur.fetchone()
            if not row:
                balance = int(settings.initial_token_balance)
                con.execute(
                    "INSERT INTO token_balances (client_id, balance) VALUES (?, ?)",
                    (client_id, balance),
                )
                con.commit()
            else:
                balance = int(row[0])

            if balance < amount:
                return False, balance

            next_balance = balance - int(amount)
            con.execute(
                "UPDATE token_balances SET balance = ? WHERE client_id = ?",
                (next_balance, client_id),
            )
            con.commit()
            return True, next_balance
        finally:
            con.close()

