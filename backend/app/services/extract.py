from io import BytesIO

from docx import Document as DocxDocument
from pypdf import PdfReader


def sniff_kind(filename: str, content_type: str | None) -> str:
    name = (filename or "").lower()
    ct = content_type or ""
    if name.endswith(".pdf") or ct == "application/pdf":
        return "pdf"
    if name.endswith(".docx") or ct.endswith("wordprocessingml.document"):
        return "docx"
    if name.endswith((".txt", ".md", ".markdown")) or ct.startswith("text/"):
        return "txt"
    raise ValueError(f"Unsupported file type: {filename or content_type}")


def extract_text(data: bytes, filename: str, content_type: str | None = None) -> str:
    kind = sniff_kind(filename, content_type)
    if kind == "pdf":
        reader = PdfReader(BytesIO(data))
        parts = [(page.extract_text() or "") for page in reader.pages]
        text = "\n".join(parts)
    elif kind == "docx":
        doc = DocxDocument(BytesIO(data))
        text = "\n".join(p.text for p in doc.paragraphs if p.text)
    else:
        text = data.decode("utf-8", errors="ignore")

    cleaned = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not cleaned:
        raise ValueError("No extractable text found in document")
    return cleaned
