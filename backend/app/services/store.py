from __future__ import annotations

from functools import lru_cache
from typing import Any
from uuid import UUID

from supabase import Client, create_client

from app.config import Settings


@lru_cache
def get_supabase(url: str, key: str) -> Client:
    return create_client(url, key)


def require_client(settings: Settings) -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured")
    return get_supabase(settings.supabase_url, settings.supabase_service_role_key)


def insert_document(
    settings: Settings,
    *,
    filename: str,
    content_type: str | None,
    byte_size: int,
    chunks: list[str],
    embeddings: list[list[float]],
) -> dict[str, Any]:
    client = require_client(settings)
    doc_res = (
        client.table("documents")
        .insert(
            {
                "filename": filename,
                "content_type": content_type,
                "byte_size": byte_size,
            }
        )
        .execute()
    )
    document = doc_res.data[0]
    rows = [
        {
            "document_id": document["id"],
            "chunk_index": idx,
            "content": chunk,
            "embedding": embedding,
        }
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]
    if rows:
        client.table("document_chunks").insert(rows).execute()
    document["chunk_count"] = len(rows)
    return document


def list_documents(settings: Settings) -> list[dict[str, Any]]:
    client = require_client(settings)
    docs = (
        client.table("documents")
        .select("id,filename,content_type,byte_size,created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return docs.data or []


def match_chunks(settings: Settings, embedding: list[float], top_k: int) -> list[dict[str, Any]]:
    client = require_client(settings)
    res = client.rpc(
        "match_document_chunks",
        {"query_embedding": embedding, "match_count": top_k},
    ).execute()
    return res.data or []


def delete_document(settings: Settings, document_id: UUID) -> None:
    client = require_client(settings)
    client.table("documents").delete().eq("id", str(document_id)).execute()
