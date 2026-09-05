"use client";

import {
  ArrowLeft, ArrowUp, Bot, Check, ChevronDown, CloudUpload, FileText,
  FolderOpen, Menu, MessageSquare, MoreHorizontal, Paperclip, Plus,
  Search, Send, Settings, Sparkles, Users, X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  askQuestion,
  isApiConfigured,
  listDocuments,
  uploadDocument,
  type ApiDocument,
  type ApiSource
} from "../../lib/api";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const demoSources = [
  ["Q3 Product Brief.pdf", "PDF · 2.4 MB", "violet"],
  ["Research synthesis.docx", "DOCX · 1.1 MB", "cyan"],
  ["Customer interviews", "18 conversations", "orange"]
] as const;
const replies = [
  "I found three strong themes across your workspace: clearer ownership, faster onboarding, and tighter feedback loops. This is a mock response for the frontend demo — no live LLM is connected yet.",
  "The research points to less setup friction and more visible progress as the biggest opportunities. I can turn this into a brief, checklist, or follow-up question.",
  "Here is a useful next step: define the outcome, assign one owner, and link the supporting source beside each task. This response is simulated demo context."
];
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: ApiSource[];
  meta?: string;
};

export default function WorkspacePage() {
  const apiReady = isApiConfigured();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [liveSources, setLiveSources] = useState<ApiSource[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshDocs = useCallback(async () => {
    if (!apiReady) return;
    try {
      const rows = await listDocuments();
      setDocuments(rows);
    } catch {
      /* keep UI usable if backend is cold / unreachable */
    }
  }, [apiReady]);

  useEffect(() => {
    void refreshDocs();
  }, [refreshDocs]);

  const send = async (value = message) => {
    const text = value.trim();
    if (!text || thinking) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }]);
    setMessage("");
    setThinking(true);
    setUploadError(null);

    if (!apiReady) {
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            role: "assistant",
            text: replies[current.length % replies.length],
            meta: "Demo assistant · mock response"
          }
        ]);
        setThinking(false);
      }, 650);
      return;
    }

    try {
      const result = await askQuestion(text);
      setLiveSources(result.sources ?? []);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: result.answer,
          sources: result.sources,
          meta: `Gemini · ${result.model}`
        }
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Request failed";
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: `Impossible de joindre l'API (${detail}). Vérifiez Render / NEXT_PUBLIC_API_URL.`,
          meta: "API error"
        }
      ]);
    } finally {
      setThinking(false);
    }
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;
    setUploadError(null);

    if (!apiReady) {
      setFiles((current) => [...current, ...selected.map((f) => f.name)]);
      return;
    }

    for (const file of selected) {
      try {
        const doc = await uploadDocument(file);
        setDocuments((current) => [doc, ...current.filter((d) => d.id !== doc.id)]);
        setFiles((current) => [...current, file.name]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      }
    }
  };

  return (
    <main className="workspace-page">
      <header className="workspace-topbar">
        <a className="workspace-brand" href={`${basePath}/`}><span className="brand-mark"><Sparkles size={15} /></span><strong>docu<span>mind</span></strong></a>
        <div className="workspace-breadcrumb"><span>Acme Inc.</span><ChevronDown size={14} /><i /> <MessageSquare size={14} /> <strong>Workspace assistant</strong></div>
        <div className="workspace-top-actions"><button className="icon-button" aria-label="Search workspace"><Search size={18} /></button><button className="workspace-avatar">JD</button><button className="mobile-menu" aria-label="Open workspace menu" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X /> : <Menu />}</button></div>
      </header>
      <div className="workspace-layout">
        <aside className={`workspace-nav ${sidebarOpen ? "open" : ""}`}>
          <a className="back-home" href={`${basePath}/`}><ArrowLeft size={15} /> Back to home</a>
          <div className="workspace-switcher"><span className="workspace-avatar">A</span><span><strong>Acme Inc.</strong><small>Pro workspace</small></span><ChevronDown size={14} /></div>
          <span className="nav-caption">WORKSPACE</span>
          <button className="workspace-nav-item active"><MessageSquare size={16} /> Assistant <b>1</b></button>
          <button className="workspace-nav-item"><FolderOpen size={16} /> Collections</button>
          <button className="workspace-nav-item"><Users size={16} /> Team members</button>
          <span className="nav-caption source-caption">DOCUMENTS <button aria-label="Add document" onClick={() => inputRef.current?.click()}><Plus size={14} /></button></span>
          {apiReady
            ? documents.map((doc) => (
              <button className="document-row" key={doc.id}>
                <span className="source-icon violet"><FileText size={14} /></span>
                <span><strong>{doc.filename}</strong><small>{doc.chunk_count != null ? `${doc.chunk_count} chunks` : "Indexed"}</small></span>
                <MoreHorizontal size={15} />
              </button>
            ))
            : demoSources.map(([name, meta, color]) => (
              <button className="document-row" key={name}>
                <span className={`source-icon ${color}`}><FileText size={14} /></span>
                <span><strong>{name}</strong><small>{meta}</small></span>
                <MoreHorizontal size={15} />
              </button>
            ))}
          {!apiReady && files.map((name) => (
            <button className="document-row" key={name}>
              <span className="source-icon cyan"><FileText size={14} /></span>
              <span><strong>{name}</strong><small>Ready for demo</small></span>
            </button>
          ))}
          <div className="workspace-nav-bottom">
            <button className="workspace-nav-item"><Settings size={16} /> Settings</button>
            <div className="demo-notice">
              <Sparkles size={15} />
              <span>
                <strong>{apiReady ? "Live RAG backend" : "Demo workspace"}</strong>
                <small>{apiReady ? "Gemini + Supabase" : "Responses are simulated"}</small>
              </span>
            </div>
          </div>
        </aside>
        {sidebarOpen && <button className="workspace-scrim" aria-label="Close workspace menu" onClick={() => setSidebarOpen(false)} />}
        <section className="workspace-chat">
          <div className="assistant-header">
            <div>
              <span className="status-dot" /> <span>{apiReady ? "ONLINE · LIVE API" : "ONLINE · DEMO MODE"}</span>
              <h1>Workspace assistant</h1>
              <p>Ask questions about your connected documents.</p>
            </div>
            <div className="assistant-actions">
              <button className="secondary-button" onClick={() => { setMessages([]); setLiveSources([]); }}><Plus size={15} /> New chat</button>
              <button className="icon-button" aria-label="More options"><MoreHorizontal size={19} /></button>
            </div>
          </div>
          <div className="conversation">
            {messages.length === 0 && (
              <div className="empty-chat">
                <div className="large-bot-orb"><Bot size={28} /></div>
                <h2>What are you working on?</h2>
                <p>
                  {apiReady
                    ? "Upload a PDF/DOCX then ask the assistant. Answers cite retrieved chunks."
                    : "Ask the assistant to synthesize your documents. Set NEXT_PUBLIC_API_URL to enable live RAG."}
                </p>
                <div className="prompt-grid">
                  <button onClick={() => void send("Summarize the product brief")}><span><FileText size={16} /></span>Summarize the product brief<ArrowUp size={14} /></button>
                  <button onClick={() => void send("What are our main user insights?")}><span><Search size={16} /></span>Find the main user insights<ArrowUp size={14} /></button>
                  <button onClick={() => void send("Draft a launch checklist")}><span><Check size={16} /></span>Draft a launch checklist<ArrowUp size={14} /></button>
                </div>
              </div>
            )}
            <div className="workspace-messages">
              {messages.map((item) => (
                <div className={`workspace-message ${item.role}`} key={item.id}>
                  {item.role === "assistant" && <span className="message-avatar"><Sparkles size={12} /></span>}
                  <div>
                    <p>{item.text}</p>
                    <small>
                      {item.role === "assistant"
                        ? (item.meta ?? "Assistant")
                        : "You · just now"}
                    </small>
                  </div>
                </div>
              ))}
              {thinking && <div className="thinking"><span /><span /><span /> Assistant is thinking…</div>}
            </div>
          </div>
          {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
          <form className="workspace-composer" onSubmit={(event) => { event.preventDefault(); void send(); }}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              placeholder="Ask anything about your workspace…"
              aria-label="Ask the workspace assistant"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <div className="composer-toolbar">
              <button type="button" className="attach-button" aria-label="Upload document" onClick={() => inputRef.current?.click()}><Paperclip size={17} /></button>
              <input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,.txt,.md" multiple onChange={(e) => void upload(e)} />
              <span>Enter to send · Shift + Enter for a new line</span>
              <button className="composer-send" type="submit" disabled={!message.trim() || thinking} aria-label="Send message"><Send size={16} /></button>
            </div>
          </form>
        </section>
        {contextOpen && (
          <aside className="workspace-context">
            <div className="context-title"><span>CONTEXT & SOURCES</span><button className="icon-button" onClick={() => setContextOpen(false)} aria-label="Close context panel"><X size={16} /></button></div>
            <div className="context-summary">
              <span className="context-icon"><Sparkles size={16} /></span>
              <small>AI GENERATED INSIGHT</small>
              <h2>{apiReady ? "Retrieved context" : "Strong product momentum"}</h2>
              <p>
                {apiReady
                  ? (liveSources.length
                    ? `${liveSources.length} chunk(s) used for the last answer.`
                    : "Ask a question to populate live sources from Supabase.")
                  : "Your documents show a clear focus on reducing friction for new users."}
              </p>
              <div className="context-progress"><span /><b>{apiReady ? `${Math.min(100, liveSources.length * 20)}%` : "86%"}</b></div>
              <small>{apiReady ? "Live retrieval coverage (approx.)" : "Context coverage from 23 sources"}</small>
            </div>
            <div className="context-sources">
              <span className="nav-caption">RELEVANT SOURCES</span>
              {apiReady && liveSources.length > 0
                ? liveSources.map((src) => (
                  <div className="context-document" key={`${src.document_id}-${src.chunk_index}`}>
                    <span className="source-icon cyan"><FileText size={14} /></span>
                    <span><strong>{src.filename}</strong><small>chunk #{src.chunk_index}</small></span>
                    <b>{Math.round(src.similarity * 100)}%</b>
                  </div>
                ))
                : demoSources.map(([name, meta, color]) => (
                  <div className="context-document" key={name}>
                    <span className={`source-icon ${color}`}><FileText size={14} /></span>
                    <span><strong>{name}</strong><small>{meta}</small></span>
                    <b>92%</b>
                  </div>
                ))}
            </div>
            <button className="context-upload" onClick={() => inputRef.current?.click()}>
              <CloudUpload size={18} />
              <strong>Add a source</strong>
              <small>Upload PDF, DOCX, TXT or Markdown</small>
            </button>
          </aside>
        )}
        {!contextOpen && <button className="context-reopen" onClick={() => setContextOpen(true)} aria-label="Open context panel"><Sparkles size={16} /></button>}
      </div>
    </main>
  );
}
