import os


class Settings:
    def __init__(self) -> None:
        self.api_token = os.getenv("CORTEX_API_TOKEN", "").strip()
        self.require_auth = os.getenv("CORTEX_REQUIRE_AUTH", "0").strip().lower() in ("1", "true", "yes")
        self.db_path = os.getenv("CORTEX_DB_PATH", "./data/events.db").strip()
        self.initial_token_balance = int(os.getenv("CORTEX_INITIAL_TOKENS", "100"))
        self.cost_analyze_edital = int(os.getenv("CORTEX_COST_ANALYZE_EDITAL", "5"))


settings = Settings()
