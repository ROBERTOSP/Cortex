from datetime import date
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Profile(BaseModel):
    job_title: Optional[str] = None
    exam_date: Optional[date] = None
    hours_per_day: Optional[float] = None
    days_per_week: Optional[int] = None


class UploadResponse(BaseModel):
    upload_id: str


class EditalAnalyzeRequest(BaseModel):
    job_title: Optional[str] = None
    exam_date: Optional[date] = None
    hours_per_day: Optional[float] = None
    days_per_week: Optional[int] = None
    upload_id: Optional[str] = None


class PlanTask(BaseModel):
    title: str
    minutes: int
    kind: str = Field(default="study")
    meta: Dict[str, Any] = Field(default_factory=dict)


class EditalAnalyzeResponse(BaseModel):
    plan: Dict[str, Any]
    today: List[PlanTask]
    weeks_total: Optional[int] = None
    hours_total: Optional[float] = None
    edital_summary: Dict[str, Any] = Field(default_factory=dict)


class MeResponse(BaseModel):
    ok: bool = True
    subscription_status: str = "dev"
    token_balance: int = 999999

