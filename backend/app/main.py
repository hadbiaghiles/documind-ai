from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import chat, documents, health

settings = get_settings()

app = FastAPI(
    title="DocuMind AI Backend",
    description="Free-tier RAG API: PDF/DOCX → chunk → Gemini embeddings → Supabase pgvector → Gemini answers",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["https://hadbiaghiles.github.io"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "documind-ai-backend",
        "docs": "/docs",
        "health": "/health",
    }
