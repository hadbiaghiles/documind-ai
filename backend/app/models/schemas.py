from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str = "documind-ai-backend"
    gemini_configured: bool
    supabase_configured: bool


class DocumentOut(BaseModel):
    id: UUID
    filename: str
    content_type: Optional[str] = None
    byte_size: Optional[int] = None
    created_at: Optional[datetime] = None
    chunk_count: Optional[int] = None


class UploadResponse(BaseModel):
    document: DocumentOut
    message: str = "Document ingested"


class SourceChunk(BaseModel):
    document_id: UUID
    filename: str
    chunk_index: int
    content: str
    similarity: float


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    top_k: Optional[int] = Field(default=None, ge=1, le=12)


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    model: str
