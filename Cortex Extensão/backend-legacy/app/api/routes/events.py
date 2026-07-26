from fastapi import APIRouter, Depends, Header

from app.core.auth import AuthContext, require_auth
from app.models.events import EventsIngestRequest, EventsIngestResponse
from app.storage.sqlite_store import SqliteEventStore


router = APIRouter()


@router.post("/v1/events", response_model=EventsIngestResponse)
def ingest_events(
    payload: EventsIngestRequest,
    _auth: AuthContext = Depends(require_auth),
    x_client_id: str | None = Header(default=None),
) -> EventsIngestResponse:
    store = SqliteEventStore()
    accepted = store.insert_many(payload.events)
    return EventsIngestResponse(accepted=accepted)
