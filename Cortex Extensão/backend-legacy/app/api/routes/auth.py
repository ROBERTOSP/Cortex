import json
import urllib.request
from typing import Any

from fastapi import APIRouter
from fastapi import HTTPException

from app.models.auth import GoogleAuthRequest, GoogleAuthResponse, UserOut
from app.storage.session_store import SessionStore
from app.storage.user_store import UserStore


router = APIRouter()


def _google_userinfo(access_token: str) -> dict[str, Any]:
    req = urllib.request.Request(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except Exception:
        raise HTTPException(status_code=401, detail="invalid_google_token")
    try:
        data = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=401, detail="invalid_google_token")
    if not isinstance(data, dict) or "sub" not in data:
        raise HTTPException(status_code=401, detail="invalid_google_token")
    return data


@router.post("/v1/auth/google", response_model=GoogleAuthResponse)
def auth_google(payload: GoogleAuthRequest) -> GoogleAuthResponse:
    info = _google_userinfo(payload.access_token)
    sub = str(info.get("sub") or "")
    if not sub:
        raise HTTPException(status_code=401, detail="invalid_google_token")

    email = info.get("email")
    name = info.get("name")
    picture = info.get("picture")

    user = UserStore().upsert_google_user(sub=sub, email=email, name=name, picture=picture)
    session = SessionStore().create_session(user_id=user.id)

    return GoogleAuthResponse(
        session_token=session.token,
        user=UserOut(id=user.id, email=user.email, name=user.name, picture=user.picture),
    )

