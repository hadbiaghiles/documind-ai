from fastapi import APIRouter

from app.config import get_settings
from app.models.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        gemini_configured=bool(settings.gemini_api_key),
        supabase_configured=bool(settings.supabase_url and settings.supabase_service_role_key),
    )
