"use client";

import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CloudUpload,
  FileText,
  FolderOpen,
  Github,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Users,
  X,
  Zap
} from "lucide-react";
import { useState } from "react";

const sources = [
  { name: "Q3 Product Brief.pdf", meta: "Updated 2h ago", color: "violet", icon: FileText },
  { name: "Research synthesis.docx", meta: "Updated yesterday", color: "cyan", icon: FileText },
  { name: "Customer interviews", meta: "18 sources", color: "orange", icon: MessageSquare }
];

const faqs = [
  ["What can I connect to DocuMind?", "Bring context from the tools your team already trusts — upload files directly or connect Notion, Google Drive, Slack, and more. Your workspace stays organized and searchable."],
  ["How does DocuMind keep my data safe?", "Your workspace is private by default. We use enterprise-grade encryption in transit and at rest, with granular permissions and no training on your data."],
  ["Can I try it with my team?", "Absolutely. The Starter plan includes a 14-day free trial with unlimited teammates, so you can feel the difference before making a decision."]
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
  };

  return (
    <main>
      <nav className="nav-wrap">
        <div className="nav container">
          <a className="brand" href="#" aria-label="DocuMind home"><span className="brand-mark"><Sparkles size={16} /></span><span>docu<span>mind</span></span></a>
          <div className={`nav-links ${mobileOpen ? "is-open" : ""}`}>
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#workflow" onClick={() => setMobileOpen(false)}>How it works</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
            <div className="mobile-actions"><a href="#dashboard">Log in</a><a className="button button-small" href="#pricing">Start for free <ArrowRight size={14} /></a></div>
          </div>
          <div className="nav-actions"><a href="#dashboard">Log in</a><a className="button button-small" href="#pricing">Start for free <ArrowRight size={14} /></a></div>
          <button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      <section className="hero section-grid">
        <div className="orb orb-one" /><div className="orb orb-two" /><div className="noise" />
        <div className="container hero-inner">
          <div className="eyebrow"><span className="pulse-dot" /> The intelligent workspace for modern teams</div>
          <h1>Think beyond<br /><em>your documents.</em></h1>
          <p className="hero-sub">DocuMind turns your scattered knowledge into a clear, conversational workspace. Ask better questions, move faster, and keep your best thinking in flow.</p>
          <div className="hero-actions"><a className="button button-primary" href="#dashboard">Explore your workspace <ArrowRight size={16} /></a><a className="text-link" href="#workflow">See how it works <span>↗</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>AL</span><span>JM</span><span>RK</span><span>+2k</span></div><span>Trusted by curious teams everywhere</span><div className="stars">★★★★★</div></div>
        </div>
        <div className="hero-visual container" id="dashboard">
          <div className="dashboard-window glass-panel">
            <div className="window-top"><div className="window-dots"><i /><i /><i /></div><div className="window-title"><span className="mini-logo"><Sparkles size={10} /></span> Acme workspace <ChevronDown size={12} /></div><div className="window-tools"><Search size={14} /><MoreHorizontal size={16} /></div></div>
            <div className="dashboard-body">
              <aside className="workspace-sidebar"><div className="side-workspace"><span className="workspace-avatar">A</span><div><strong>Acme Inc.</strong><small>Pro workspace</small></div><ChevronDown size={13} /></div><div className="side-label">Workspace</div><div className="side-item active"><LayoutDashboard size={15} /> Overview</div><div className="side-item"><MessageSquare size={15} /> Conversations <b>3</b></div><div className="side-item"><FolderOpen size={15} /> Collections</div><div className="side-item"><Users size={15} /> Team members</div><div className="side-label sources-label">Your sources</div>{sources.map((source) => <div className="side-source" key={source.name}><span className={`source-icon ${source.color}`}><source.icon size={13} /></span>{source.name.split(".")[0]}<MoreHorizontal size={13} /></div>)}<div className="side-bottom"><div className="upgrade-card"><Zap size={14} /><span><strong>Unlock more magic</strong><small>Upgrade your plan</small></span><ArrowRight size={13} /></div><div className="profile"><span className="profile-avatar">JD</span><span>Jordan Davis</span><MoreHorizontal size={14} /></div></div></aside>
              <section className="chat-area"><div className="chat-header"><div><small>CONVERSATION</small><h3>Untitled conversation</h3></div><button className="icon-button"><MoreHorizontal size={17} /></button></div><div className="chat-scroll"><div className="welcome"><div className="bot-orb"><Sparkles size={21} /></div><h2>How can I help you today?</h2><p>Ask questions about your workspace or let me connect the dots.</p></div><div className="suggestions"><button>Summarize the product brief <ArrowRight size={13} /></button><button>What are our main user insights? <ArrowRight size={13} /></button><button>Draft a launch checklist <ArrowRight size={13} /></button></div>{sent && <div className="chat-message user-message">Can you find the key takeaways from my sources?<small>Just now</small></div>}<div className="input-wrap"><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask anything about your workspace..." rows={1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} /><div className="input-actions"><button className="attach"><Paperclip size={16} /></button><span>Press ⌘ + Enter</span><button className="send-button" onClick={sendMessage} aria-label="Send message"><Send size={15} /></button></div></div></div></section>
              <aside className="insight-panel"><div className="insight-head"><span>CONTEXT</span><button className="icon-button"><X size={14} /></button></div><div className="context-card"><div className="context-top"><span className="sparkle-small"><Sparkles size={14} /></span><span>AI GENERATED</span></div><h4>Workspace insights</h4><p>Based on 23 sources in your workspace</p><div className="insight-stat"><strong>86<span>%</span></strong><span>context coverage</span></div><div className="progress"><i /></div><div className="insight-foot"><span><Check size={12} /> 12 sources connected</span><ArrowRight size={13} /></div></div><div className="context-list"><small>RELEVANT SOURCES</small>{sources.map((source) => <div className="context-source" key={source.name}><span className={`source-icon ${source.color}`}><source.icon size={13} /></span><span><strong>{source.name}</strong><small>{source.meta}</small></span><span className="relevance">92%</span></div>)}</div><div className="dropzone"><CloudUpload size={17} /><strong>Drop files here</strong><small>or click to browse</small></div></aside>
            </div>
          </div>
        </div>
      </section>

      <section className="logo-strip"><div className="container logo-row"><span>BUILT FOR TEAMS WHO THINK BIG</span><strong>vertex<span>®</span></strong><strong className="logo-serif">Northstar</strong><strong className="logo-mono">KINETIC</strong><strong className="logo-round">radial</strong><strong className="logo-serif">arc<span>°</span></strong></div></section>

      <section className="section features-section" id="features"><div className="container"><div className="section-heading"><div><div className="eyebrow purple">A better way to work</div><h2>Your knowledge,<br /><em>finally in focus.</em></h2></div><p>Powerful by design, simple by nature. DocuMind brings everything your team knows into one living, thinking space.</p></div><div className="feature-grid"><article className="feature-card feature-large"><div className="feature-copy"><span className="feature-number">01</span><h3>Ask anything.<br /><em>Find everything.</em></h3><p>Get trusted answers from your entire knowledge base in seconds. No more searching through endless tabs and half-remembered links.</p><a className="arrow-link" href="#dashboard">Meet your AI copilot <ArrowRight size={15} /></a></div><div className="feature-art neural-art"><div className="neural-center"><Sparkles size={22} /></div><i className="node n1" /><i className="node n2" /><i className="node n3" /><i className="node n4" /><i className="node n5" /><span className="line l1" /><span className="line l2" /><span className="line l3" /><span className="line l4" /></div></article><article className="feature-card"><span className="feature-number">02</span><div className="feature-icon cyan-icon"><CloudUpload size={20} /></div><h3>Bring your<br /><em>world with you.</em></h3><p>Connect your favorite tools and transform your scattered docs into one intelligent source of truth.</p><div className="floating-files"><span><FileText size={14} /> Brief.pdf</span><span><Globe2 size={14} /> Notion</span><span><Github size={14} /> GitHub</span></div></article><article className="feature-card"><span className="feature-number">03</span><div className="feature-icon orange-icon"><Users size={20} /></div><h3>Make ideas<br /><em>move together.</em></h3><p>Share context, not just files. Give every teammate the clarity to do their best work.</p><div className="team-orbit"><span>AL</span><span>JM</span><span>RK</span><span>+8</span><div><MessageSquare size={13} /> 24 active threads</div></div></article></div></div></section>

      <section className="section workflow-section" id="workflow"><div className="container"><div className="center-heading"><div className="eyebrow cyan">From scattered to synched</div><h2>Clarity is a <em>workflow.</em></h2><p>Three simple steps between you and your team&apos;s next great idea.</p></div><div className="steps"><div className="step"><span className="step-number">01</span><div className="step-icon"><CloudUpload size={22} /></div><h3>Connect your sources</h3><p>Bring your docs, notes, and conversations into one private workspace.</p></div><div className="step-line" /><div className="step"><span className="step-number">02</span><div className="step-icon"><Sparkles size={22} /></div><h3>Ask better questions</h3><p>Let DocuMind connect the dots and surface what matters most.</p></div><div className="step-line" /><div className="step"><span className="step-number">03</span><div className="step-icon"><Zap size={22} /></div><h3>Move with confidence</h3><p>Turn insight into action while the context is still fresh.</p></div></div></div></section>

      <section className="section pricing-section" id="pricing"><div className="container"><div className="center-heading"><div className="eyebrow purple">Simple, transparent pricing</div><h2>Start thinking <em>bigger.</em></h2><p>Everything you need to make your team&apos;s knowledge work harder.</p></div><div className="pricing-grid"><div className="price-card"><span className="price-label">PERSONAL</span><h3>Free</h3><p>For curious minds building better habits.</p><div className="price"><strong>$0</strong><span>/ forever</span></div><a className="button button-outline" href="#dashboard">Get started <ArrowRight size={15} /></a><ul><li><Check size={15} /> 3 connected sources</li><li><Check size={15} /> 100 AI questions / month</li><li><Check size={15} /> 1 workspace member</li></ul></div><div className="price-card popular"><div className="popular-tag">MOST POPULAR</div><span className="price-label">TEAM</span><h3>Pro</h3><p>For teams ready to move as one.</p><div className="price"><strong>$16</strong><span>/ member / month</span></div><a className="button button-primary" href="#dashboard">Start 14-day trial <ArrowRight size={15} /></a><ul><li><Check size={15} /> Unlimited sources</li><li><Check size={15} /> Unlimited AI questions</li><li><Check size={15} /> Shared team workspace</li></ul></div><div className="price-card"><span className="price-label">ORGANIZATION</span><h3>Scale</h3><p>For teams with big ideas and bigger context.</p><div className="price"><strong>Let&apos;s talk</strong></div><a className="button button-outline" href="mailto:hello@documind.ai">Talk to our team <ArrowRight size={15} /></a><ul><li><Check size={15} /> Advanced permissions</li><li><Check size={15} /> Priority support</li><li><Check size={15} /> Custom integrations</li></ul></div></div></div></section>

      <section className="section faq-section" id="faq"><div className="container faq-layout"><div><div className="eyebrow cyan">Questions, answered</div><h2>Good to<br /><em>know.</em></h2><p>Still curious? We&apos;re happy to help.</p><a className="text-link" href="mailto:hello@documind.ai">Talk to a human <ArrowRight size={15} /></a></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><ChevronDown size={17} /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></div></section>

      <section className="cta-section"><div className="cta-orb" /><div className="container cta-inner"><div className="eyebrow">Your next breakthrough is hiding in plain sight.</div><h2>Give your ideas<br /><em>room to connect.</em></h2><a className="button button-primary" href="#dashboard">Build your workspace <ArrowRight size={16} /></a><small>No credit card required · 14-day free trial</small></div></section>
      <footer><div className="container footer-main"><div><a className="brand" href="#"><span className="brand-mark"><Sparkles size={16} /></span><span>docu<span>mind</span></span></a><p>Make your knowledge<br />work harder.</p></div><div className="footer-links"><div><strong>Product</strong><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#dashboard">Integrations</a></div><div><strong>Company</strong><a href="#workflow">About us</a><a href="#faq">Contact</a><a href="#faq">Careers <small>2</small></a></div><div><strong>Social</strong><a href="#0">Twitter ↗</a><a href="#0">LinkedIn ↗</a><a href="#0">Instagram ↗</a></div></div></div><div className="container footer-bottom"><span>© 2024 DocuMind, Inc.</span><span>Privacy · Terms · Security</span><span>Made for deep work <span className="heart">♥</span></span></div></footer>
    </main>
  );
}
