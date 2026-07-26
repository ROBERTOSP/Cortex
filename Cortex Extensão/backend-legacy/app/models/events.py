from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class QuestionRef(BaseModel):
    id_portal: str = Field(default="N/A")
    subject_parts: List[str] = Field(default_factory=list)


class AnswerPayload(BaseModel):
    selected: Optional[str] = None
    correct: Optional[bool] = None
    correct_letter: Optional[str] = None
    duration_ms: Optional[int] = None


class TelemetryEvent(BaseModel):
    id: str
    event_type: str
    source: str
    url: str
    client_id: str
    occurred_at: str
    question: Optional[QuestionRef] = None
    answer: Optional[AnswerPayload] = None
    extra: Dict[str, Any] = Field(default_factory=dict)

    model_config = {"extra": "allow"}


class EventsIngestRequest(BaseModel):
    events: List[TelemetryEvent]


class EventsIngestResponse(BaseModel):
    accepted: int

