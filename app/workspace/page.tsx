"use client";

import {
  ArrowLeft, ArrowUp, Bot, Check, ChevronDown, CloudUpload, FileText,
  FolderOpen, Menu, MessageSquare, MoreHorizontal, Paperclip, Plus,
  Search, Send, Settings, Sparkles, Users, X
} from "lucide-react";
import { useRef, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sources = [
  ["Q3 Product Brief.pdf", "PDF · 2.4 MB", "violet"],
  ["Research synthesis.docx", "DOCX · 1.1 MB", "cyan"],
  ["Customer interviews", "18 conversations", "orange"]
];
const replies = [
  "I found three strong themes across your workspace: clearer ownership, faster onboarding, and tighter feedback loops. This is a mock response for the frontend demo — no live LLM is connected yet.",
  "The research points to less setup friction and more visible progress as the biggest opportunities. I can turn this into a brief, checklist, or follow-up question.",
  "Here is a useful next step: define the outcome, assign one owner, and link the supporting source beside each task. This response is simulated demo context."
];
type ChatMessage = { id: number; role: "user" | "assistant"; text: string };

export default function WorkspacePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = (value = message) => {
    const text = value.trim();
    if (!text || thinking) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }]);
    setMessage("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: replies[current.length % replies.length] }]);
      setThinking(false);
    }, 650);
  };
  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? []).map((file) => file.name);
    setFiles((current) => [...current, ...names]);
    event.target.value = "";
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
          {sources.map(([name, meta, color]) => <button className="document-row" key={name}><span className={`source-icon ${color}`}><FileText size={14} /></span><span><strong>{name}</strong><small>{meta}</small></span><MoreHorizontal size={15} /></button>)}
          {files.map((name) => <button className="document-row" key={name}><span className="source-icon cyan"><FileText size={14} /></span><span><strong>{name}</strong><small>Ready for demo</small></span></button>)}
          <div className="workspace-nav-bottom"><button className="workspace-nav-item"><Settings size={16} /> Settings</button><div className="demo-notice"><Sparkles size={15} /><span><strong>Demo workspace</strong><small>Responses are simulated</small></span></div></div>
        </aside>
        {sidebarOpen && <button className="workspace-scrim" aria-label="Close workspace menu" onClick={() => setSidebarOpen(false)} />}
        <section className="workspace-chat">
          <div className="assistant-header"><div><span className="status-dot" /> <span>ONLINE · DEMO MODE</span><h1>Workspace assistant</h1><p>Ask questions about your connected documents.</p></div><div className="assistant-actions"><button className="secondary-button" onClick={() => setMessages([])}><Plus size={15} /> New chat</button><button className="icon-button" aria-label="More options"><MoreHorizontal size={19} /></button></div></div>
          <div className="conversation">
            {messages.length === 0 && <div className="empty-chat"><div className="large-bot-orb"><Bot size={28} /></div><h2>What are you working on?</h2><p>Ask the assistant to synthesize your documents, find patterns, or shape your next idea.</p><div className="prompt-grid"><button onClick={() => send("Summarize the product brief")}><span><FileText size={16} /></span>Summarize the product brief<ArrowUp size={14} /></button><button onClick={() => send("What are our main user insights?")}><span><Search size={16} /></span>Find the main user insights<ArrowUp size={14} /></button><button onClick={() => send("Draft a launch checklist")}><span><Check size={16} /></span>Draft a launch checklist<ArrowUp size={14} /></button></div></div>}
            <div className="workspace-messages">{messages.map((item) => <div className={`workspace-message ${item.role}`} key={item.id}>{item.role === "assistant" && <span className="message-avatar"><Sparkles size={12} /></span>}<div><p>{item.text}</p><small>{item.role === "assistant" ? "Demo assistant · mock response" : "You · just now"}</small></div></div>)}{thinking && <div className="thinking"><span /><span /><span /> Assistant is thinking…</div>}</div>
          </div>
          <form className="workspace-composer" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={2} placeholder="Ask anything about your workspace…" aria-label="Ask the workspace assistant" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} /><div className="composer-toolbar"><button type="button" className="attach-button" aria-label="Upload document" onClick={() => inputRef.current?.click()}><Paperclip size={17} /></button><input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,.txt,.md" multiple onChange={upload} /><span>Enter to send · Shift + Enter for a new line</span><button className="composer-send" type="submit" disabled={!message.trim() || thinking} aria-label="Send message"><Send size={16} /></button></div></form>
        </section>
        {contextOpen && <aside className="workspace-context"><div className="context-title"><span>CONTEXT & SOURCES</span><button className="icon-button" onClick={() => setContextOpen(false)} aria-label="Close context panel"><X size={16} /></button></div><div className="context-summary"><span className="context-icon"><Sparkles size={16} /></span><small>AI GENERATED INSIGHT</small><h2>Strong product momentum</h2><p>Your documents show a clear focus on reducing friction for new users.</p><div className="context-progress"><span /><b>86%</b></div><small>Context coverage from 23 sources</small></div><div className="context-sources"><span className="nav-caption">RELEVANT SOURCES</span>{sources.map(([name, meta, color]) => <div className="context-document" key={name}><span className={`source-icon ${color}`}><FileText size={14} /></span><span><strong>{name}</strong><small>{meta}</small></span><b>92%</b></div>)}</div><button className="context-upload" onClick={() => inputRef.current?.click()}><CloudUpload size={18} /><strong>Add a source</strong><small>Upload PDF, DOCX, TXT or Markdown</small></button></aside>}
        {!contextOpen && <button className="context-reopen" onClick={() => setContextOpen(true)} aria-label="Open context panel"><Sparkles size={16} /></button>}
      </div>
    </main>
  );
}
