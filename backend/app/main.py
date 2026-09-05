import io
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field
from pypdf import PdfReader
from docx import Document

load_dotenv()

EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.0-flash")
MAX_FILE_BYTES = int(os.getenv("MAX_FILE_BYTES", "10485760"))
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    workspace_id: str = Field(default="default", min_length=1, max_length=100)


def database_url() -> str:
    value = os.getenv("DATABASE_URL")
    if not value:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured")
    return value


def gemini_client() -> genai.Client:
    value = os.getenv("GEMINI_API_KEY")
    if not value:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured")
    return genai.Client(api_key=value)


def embed(text: str) -> list[float]:
    response = gemini_client().models.embed_content(model=EMBEDDING_MODEL, contents=text)
    return list(response.embeddings[0].values)


def vector_literal(values: list[float]) -> str:
    return "[" + ",".join(str(value) for value in values) + "]"


def extract_text(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        return "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(content)).pages)
    if suffix == ".docx":
        document = Document(io.BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    return content.decode("utf-8", errors="replace")


def chunks(text: str, size: int = 1200, overlap: int = 180) -> list[str]:
    normalized = " ".join(text.split())
    return [normalized[index:index + size] for index in range(0, len(normalized), size - overlap)] or [normalized]


def ensure_schema() -> None:
    url = os.getenv("DATABASE_URL")
    if not url:
        return
    with psycopg.connect(url) as connection:
        connection.execute("CREATE EXTENSION IF NOT EXISTS vector")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
              id BIGSERIAL PRIMARY KEY,
              workspace_id TEXT NOT NULL,
              filename TEXT NOT NULL,
              mime_type TEXT NOT NULL,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            CREATE TABLE IF NOT EXISTS document_chunks (
              id BIGSERIAL PRIMARY KEY,
              document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
              workspace_id TEXT NOT NULL,
              content TEXT NOT NULL,
              embedding vector(3072),
              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
              ON document_chunks USING hnsw (embedding vector_cosine_ops);
            """
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_schema()
    yield


app = FastAPI(title="DocuMind API", version="1.0.0", lifespan=lifespan)
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    database_ok = False
    if os.getenv("DATABASE_URL"):
        try:
            with psycopg.connect(database_url(), connect_timeout=3) as connection:
                connection.execute("SELECT 1")
            database_ok = True
        except Exception:
            database_ok = False
    return {
        "status": "ok",
        "database": database_ok,
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "rag_ready": database_ok and bool(os.getenv("GEMINI_API_KEY")),
    }


@app.post("/documents")
def upload_document(
    file: UploadFile = File(...),
    workspace_id: str = "default",
) -> dict[str, Any]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Supported files: PDF, DOCX, TXT, MD")
    content = file.file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds MAX_FILE_BYTES")
    text = extract_text(file.filename or "document", content).strip()
    if not text:
        raise HTTPException(status_code=422, detail="Could not extract readable text")
    connection_url = database_url()
    vectors = [(chunk, embed(chunk)) for chunk in chunks(text)]
    with psycopg.connect(connection_url) as connection:
        document = connection.execute(
            "INSERT INTO documents (workspace_id, filename, mime_type) VALUES (%s, %s, %s) RETURNING id",
            (workspace_id, file.filename, file.content_type or "application/octet-stream"),
        ).fetchone()
        document_id = document[0]
        connection.executemany(
            "INSERT INTO document_chunks (document_id, workspace_id, content, embedding) VALUES (%s, %s, %s, %s)",
            [(document_id, workspace_id, chunk, vector_literal(vector)) for chunk, vector in vectors],
        )
    return {"id": document_id, "filename": file.filename, "chunks": len(vectors)}


@app.post("/ask")
def ask(request: AskRequest) -> dict[str, Any]:
    query_embedding = embed(request.question)
    with psycopg.connect(database_url()) as connection:
        rows = connection.execute(
            """
            SELECT content, filename, 1 - (embedding <=> %s::vector) AS similarity
            FROM document_chunks
            JOIN documents ON documents.id = document_chunks.document_id
            WHERE document_chunks.workspace_id = %s
            ORDER BY embedding <=> %s::vector
            LIMIT 6
            """,
            (vector_literal(query_embedding), request.workspace_id, vector_literal(query_embedding)),
        ).fetchall()
    if not rows:
        return {"answer": "I could not find any indexed sources in this workspace yet.", "sources": [], "live": True}
    context = "\n\n".join(f"[{filename}]\n{content}" for content, filename, _ in rows)
    prompt = (
        "You are DocuMind, a precise document assistant. Answer only from the context below. "
        "If the context is insufficient, say so. Keep the answer concise and cite filenames inline.\n\n"
        f"Context:\n{context}\n\nQuestion: {request.question}"
    )
    response = gemini_client().models.generate_content(model=CHAT_MODEL, contents=prompt)
    return {
        "answer": response.text or "I could not generate an answer from the indexed context.",
        "sources": [{"filename": filename, "similarity": round(float(similarity), 3)} for _, filename, similarity in rows],
        "live": True,
    }
