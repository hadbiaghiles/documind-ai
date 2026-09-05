export type ApiDocument = {
  id: string;
  filename: string;
  content_type?: string | null;
  byte_size?: number | null;
  created_at?: string | null;
  chunk_count?: number | null;
};

export type ApiSource = {
  document_id: string;
  filename: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export type ChatApiResponse = {
  answer: string;
  sources: ApiSource[];
  model: string;
};

/** Base URL of the FastAPI backend. Empty ⇒ demo/mock mode. */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBase());
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    return JSON.stringify(data?.detail ?? data);
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

export async function apiHealth(): Promise<{ status: string } | null> {
  const base = getApiBase();
  if (!base) return null;
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function listDocuments(): Promise<ApiDocument[]> {
  const base = getApiBase();
  if (!base) return [];
  const res = await fetch(`${base}/api/documents`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function uploadDocument(file: File): Promise<ApiDocument> {
  const base = getApiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${base}/api/documents/upload`, { method: "POST", body });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.document as ApiDocument;
}

export async function askQuestion(question: string): Promise<ChatApiResponse> {
  const base = getApiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
