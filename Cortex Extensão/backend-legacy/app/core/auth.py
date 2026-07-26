from dataclasses import dataclass

from fastapi import Header, HTTPException

from app.core.settings import settings
from app.storage.session_store import SessionStore


@dataclass(frozen=True)
class AuthContext:
    is_authenticated: bool
    auth_type: str
    user_id: int | None = None


def require_auth(authorization: str | None = Header(default=None)) -> AuthContext:
    if not settings.require_auth and not settings.api_token and not authorization:
        return AuthContext(is_authenticated=False, auth_type="none", user_id=None)

    if not authorization:
        raise HTTPException(status_code=401, detail="unauthorized")

    token = authorization.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    expected = settings.api_token
    if expected and token == expected:
        return AuthContext(is_authenticated=True, auth_type="static", user_id=None)

    user_id = SessionStore().get_user_id(token)
    if user_id is not None:
        return AuthContext(is_authenticated=True, auth_type="session", user_id=user_id)

    raise HTTPException(status_code=401, detail="unauthorized")
