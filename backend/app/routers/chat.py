from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse, SourceChunk
from app.services.embed import embed_query
from app.services.gemini import generate_answer
from app.services import store

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    settings = get_settings()
    top_k = payload.top_k or settings.top_k
    try:
        query_vec = embed_query(payload.question, settings)
        matches = store.match_chunks(settings, query_vec, top_k)
        answer = generate_answer(settings, question=payload.question, contexts=matches)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Chat failed: {exc}") from exc

    sources = [
        SourceChunk(
            document_id=m["document_id"],
            filename=m["filename"],
            chunk_index=m["chunk_index"],
            content=m["content"],
            similarity=float(m.get("similarity") or 0),
        )
        for m in matches
    ]
    return ChatResponse(answer=answer, sources=sources, model=settings.gemini_chat_model)
