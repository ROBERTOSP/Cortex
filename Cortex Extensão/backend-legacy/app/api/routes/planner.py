import os
import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, File, Header, UploadFile
from fastapi import HTTPException

from app.core.auth import AuthContext, require_auth
from app.core.settings import settings
from app.models.planner import EditalAnalyzeRequest, EditalAnalyzeResponse, MeResponse, UploadResponse
from app.storage.token_store import TokenStore
from app.storage.upload_store import UploadStore


router = APIRouter()


@router.get("/v1/me", response_model=MeResponse)
def me(
    auth: AuthContext = Depends(require_auth),
    x_client_id: str | None = Header(default=None),
) -> MeResponse:
    principal_id = f"user:{auth.user_id}" if auth.user_id is not None else (x_client_id or "anonymous")
    balance = TokenStore().get_or_create(principal_id)
    return MeResponse(token_balance=balance)


@router.post("/v1/uploads", response_model=UploadResponse)
def upload_pdf(
    file: UploadFile = File(...),
    _auth: AuthContext = Depends(require_auth),
    x_client_id: str | None = Header(default=None),
) -> UploadResponse:
    upload_id = str(uuid.uuid4())
    os.makedirs("./data/uploads", exist_ok=True)
    safe_name = file.filename or "upload.pdf"
    path = os.path.join("./data/uploads", f"{upload_id}.pdf")
    with open(path, "wb") as f:
        f.write(file.file.read())
    UploadStore().insert(upload_id=upload_id, client_id=x_client_id, filename=safe_name, path=path)
    return UploadResponse(upload_id=upload_id)


def _extract_pdf_text(pdf_path: str) -> str:
    try:
        from pdfminer.high_level import extract_text
    except Exception:
        return ""
    try:
        return extract_text(pdf_path) or ""
    except Exception:
        return ""


@router.post("/v1/edital/analyze", response_model=EditalAnalyzeResponse)
def analyze_edital(
    payload: EditalAnalyzeRequest,
    auth: AuthContext = Depends(require_auth),
    x_client_id: str | None = Header(default=None),
) -> EditalAnalyzeResponse:
    principal_id = f"user:{auth.user_id}" if auth.user_id is not None else (x_client_id or "anonymous")
    ok, remaining = TokenStore().try_consume(principal_id, int(settings.cost_analyze_edital))
    if not ok:
        raise HTTPException(status_code=402, detail={"error": "insufficient_tokens", "token_balance": remaining})

    exam_date = payload.exam_date
    today = date.today()
    days_left = (exam_date - today).days if exam_date else None
    weeks_total = (days_left // 7) if (days_left is not None and days_left >= 0) else None

    hours_total = None
    if payload.hours_per_day is not None and payload.days_per_week is not None and weeks_total is not None:
        hours_total = float(payload.hours_per_day) * int(payload.days_per_week) * int(max(0, weeks_total))

    edital_text = ""
    edital_chars = 0
    if payload.upload_id:
        path = UploadStore().get_path(payload.upload_id)
        if path:
            edital_text = _extract_pdf_text(path)
            edital_chars = len(edital_text)

    now_iso = datetime.now(timezone.utc).isoformat()
    plan = {
        "generated_at": now_iso,
        "job_title": payload.job_title,
        "exam_date": exam_date.isoformat() if exam_date else None,
        "days_left": days_left,
        "weeks_total": weeks_total,
        "hours_total": hours_total,
        "tokens_remaining": remaining,
        "note": "Plano inicial (heurístico). A etapa de IA refinará por disciplina/tópico quando habilitada."
    }

    today_tasks = [
        {"title": "Configurar rotina e metas do dia", "minutes": 10, "kind": "setup", "meta": {}},
        {"title": "Estudo base do tópico mais importante do edital", "minutes": 50, "kind": "study", "meta": {}},
        {"title": "Revisão (flashcards) + checklist de pontos fracos", "minutes": 20, "kind": "review", "meta": {}},
    ]

    return EditalAnalyzeResponse(
        plan=plan,
        today=today_tasks,
        weeks_total=weeks_total,
        hours_total=hours_total,
        edital_summary={"upload_id": payload.upload_id, "chars": edital_chars},
    )
