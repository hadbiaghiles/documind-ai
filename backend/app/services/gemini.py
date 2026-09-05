from __future__ import annotations

import google.generativeai as genai

from app.config import Settings


SYSTEM_PROMPT = (
    "Tu es DocuMind, un assistant documentaire. Réponds en français sauf si la question "
    "est clairement dans une autre langue. Base ta réponse UNIQUEMENT sur les extraits "
    "fournis. Cite les noms de fichiers pertinents. Si le contexte est insuffisant, dis-le."
)


def generate_answer(
    settings: Settings,
    *,
    question: str,
    contexts: list[dict],
) -> str:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=settings.gemini_api_key)

    if not contexts:
        return (
            "Je n'ai trouvé aucun passage pertinent dans les documents indexés. "
            "Uploadez un PDF/DOCX puis reformulez votre question."
        )

    blocks = []
    for i, ctx in enumerate(contexts, start=1):
        blocks.append(
            f"[{i}] Fichier: {ctx.get('filename')} (similarité={ctx.get('similarity', 0):.3f})\n"
            f"{ctx.get('content', '')}"
        )
    context_blob = "\n\n".join(blocks)
    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"### Contexte récupéré\n{context_blob}\n\n"
        f"### Question\n{question}\n\n"
        f"### Réponse"
    )
    model = genai.GenerativeModel(settings.gemini_chat_model)
    response = model.generate_content(prompt)
    text = getattr(response, "text", None)
    if not text:
        return "Le modèle n'a pas renvoyé de réponse. Réessayez dans un instant."
    return text.strip()
