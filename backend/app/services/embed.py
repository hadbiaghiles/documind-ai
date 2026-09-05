from __future__ import annotations

import google.generativeai as genai

from app.config import Settings


def _configure(settings: Settings) -> None:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=settings.gemini_api_key)


def embed_texts(texts: list[str], settings: Settings) -> list[list[float]]:
    """Embed with Gemini text-embedding-004 (same API key as chat)."""
    if not texts:
        return []
    _configure(settings)
    vectors: list[list[float]] = []
    # Batch in small groups to stay within free-tier request sizes
    batch_size = 16
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        result = genai.embed_content(
            model=settings.gemini_embed_model,
            content=batch,
            task_type="retrieval_document",
        )
        # google-generativeai may return {"embedding": [...]} or {"embedding": [[...], ...]}
        emb = result["embedding"]
        if emb and isinstance(emb[0], (int, float)):
            vectors.append([float(x) for x in emb])
        else:
            for row in emb:
                vectors.append([float(x) for x in row])
    if len(vectors) != len(texts):
        # Fallback: one-by-one if batch shape unexpected
        vectors = []
        for text in texts:
            one = genai.embed_content(
                model=settings.gemini_embed_model,
                content=text,
                task_type="retrieval_document",
            )
            vectors.append([float(x) for x in one["embedding"]])
    return vectors


def embed_query(text: str, settings: Settings) -> list[float]:
    _configure(settings)
    result = genai.embed_content(
        model=settings.gemini_embed_model,
        content=text,
        task_type="retrieval_query",
    )
    return [float(x) for x in result["embedding"]]
