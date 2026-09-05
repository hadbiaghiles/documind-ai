from __future__ import annotations


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> list[str]:
    """Simple character-window chunker with overlap (free-tier friendly)."""
    normalized = " ".join(text.split())
    if not normalized:
        return []
    if len(normalized) <= chunk_size:
        return [normalized]

    chunks: list[str] = []
    start = 0
    n = len(normalized)
    while start < n:
        end = min(start + chunk_size, n)
        # Prefer breaking on whitespace near the end
        if end < n:
            soft = normalized.rfind(" ", start, end)
            if soft > start + chunk_size // 2:
                end = soft
        piece = normalized[start:end].strip()
        if piece:
            chunks.append(piece)
        if end >= n:
            break
        start = max(end - overlap, start + 1)
    return chunks
