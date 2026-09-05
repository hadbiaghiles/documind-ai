from uuid import UUID

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import get_settings
from app.models.schemas import DocumentOut, UploadResponse
from app.services.chunk import chunk_text
from app.services.embed import embed_texts
from app.services.extract import extract_text
from app.services import store

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentOut])
def list_documents() -> list[DocumentOut]:
    settings = get_settings()
    try:
        rows = store.list_documents(settings)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Supabase error: {exc}") from exc
    return [DocumentOut(**row) for row in rows]


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    settings = get_settings()
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File too large for free tier (max 8 MB)")

    filename = file.filename or "upload.bin"
    try:
        text = extract_text(data, filename, file.content_type)
        chunks = chunk_text(text, settings.chunk_size, settings.chunk_overlap)
        if not chunks:
            raise ValueError("No chunks produced")
        embeddings = embed_texts(chunks, settings)
        document = store.insert_document(
            settings,
            filename=filename,
            content_type=file.content_type,
            byte_size=len(data),
            chunks=chunks,
            embeddings=embeddings,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Ingest failed: {exc}") from exc

    return UploadResponse(document=DocumentOut(**document))


@router.delete("/{document_id}")
def remove_document(document_id: UUID) -> dict[str, str]:
    settings = get_settings()
    try:
        store.delete_document(settings, document_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Delete failed: {exc}") from exc
    return {"status": "deleted", "id": str(document_id)}
