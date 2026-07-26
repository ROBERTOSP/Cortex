from typing import Optional

from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    access_token: str


class UserOut(BaseModel):
    id: int
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None


class GoogleAuthResponse(BaseModel):
    session_token: str
    user: UserOut

