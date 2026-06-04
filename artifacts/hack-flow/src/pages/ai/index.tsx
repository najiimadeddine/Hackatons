import { useState, useRef, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  streamAIResponse, createConversation, getConversation,
  listConversations, deleteConversation, addMessage,
  type Conversation,
} from "@/lib/hackathon-ai";
import {
  Sparkles, Send, Plus, Trash2, MessageSquare, Bot,
  Code2, Users, Trophy, Lightbulb, Copy, Check,
  RotateCcw, Brain, Star, Zap, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { icon: Code2,     label: "Project Ideas",    text: "Give me 5 innovative hackathon project ideas for 2025 that use AI and have real-world impact.", color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-400/40" },
  { icon: Users,     label: "Team Formation",   text: "What's the optimal team composition for a 48-hour hackathon? What roles are essential?",      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-400/40" },
  { icon: Trophy,    label: "Winning Strategy", text: "What are the key factors that make hackathon projects win? Give me the full strategy.",         color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40" },
  { icon: Lightbulb, label: "Pitch Tips",       text: "How should I structure my hackathon demo/pitch in 3 minutes to impress judges?",               color: "text-violet-400 bg-violet-500/10 border-violet-500/20 hover:border-violet-400/40" },
  { icon: Brain,     label: "Tech Stack",       text: "What's the best tech stack for building a hackathon MVP in 24 hours?",                         color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-400/40" },
  { icon: Star,      label: "Judging Criteria", text: "Explain how jury matrix scoring works and how I can maximize my score.",                        color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-400/40" },
];

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[12px] text-cyan-300">{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    return part;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-bold text-foreground mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold text-foreground mt-5 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold text-foreground mt-5 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-white/10">
          {lang && <div className="px-4 py-1.5 bg-white/5 border-b border-white/10 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">{lang}</div>}
          <pre className="p-4 bg-black/40 text-sm font-mono overflow-x-auto text-emerald-300/90 leading-relaxed scrollbar-none"><code>{codeLines.join("\n")}</code></pre>
        </div>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      elements.push(
        <ul key={i} className="my-2 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-foreground/85">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      elements.push(
        <ol key={i} className="my-2 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-foreground/85">
              <span className="mt-0.5 text-primary font-bold text-xs min-w-[18px]">{j + 1}.</span>
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    } else if (line.startsWith("|")) {
      // Table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter(r => !r.match(/^\|[-| ]+\|$/));
      const headers = rows[0]?.split("|").filter(Boolean).map(h => h.trim()) || [];
      const body = rows.slice(1);
      elements.push(
        <div key={i} className="my-3 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>{headers.map((h, j) => <th key={j} className="px-4 py-2 text-left font-semibold text-foreground/80 whitespace-nowrap">{renderInlineMarkdown(h)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, j) => {
                const cells = row.split("|").filter(Boolean).map(c => c.trim());
                return (
                  <tr key={j} className="border-t border-white/5 hover:bg-white/[0.02]">
                    {cells.map((c, k) => <td key={k} className="px-4 py-2 text-foreground/75">{renderInlineMarkdown(c)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
      );
      continue;
    } else if (line === "---" || line === "***") {
      elements.push(<hr key={i} className="my-4 border-white/10" />);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="my-3 pl-4 border-l-2 border-primary/40 italic text-sm text-foreground/70">
          {renderInlineMarkdown(line.slice(2))}
        </blockquote>,
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="text-sm text-foreground/85 leading-relaxed">{renderInlineMarkdown(line)}</p>);
    }
    i++;
  }
  return <div className="space-y-0.5">{elements}</div>;
}

function MessageBubble({ msg, isStreaming }: { msg: UIMessage; isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 border text-xs font-bold",
        isUser
          ? "bg-primary/15 border-primary/30 text-primary"
          : "bg-gradient-to-br from-violet-500/20 to-blue-500/20 border-violet-500/30 text-violet-300",
      )}>
        {isUser ? "U" : <Bot size={14} />}
      </div>
      <div className={cn("max-w-[82%] group relative flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary/20 border border-primary/30"
            : "bg-white/[0.04] border border-white/[0.08]",
        )}>
          {isUser
            ? <p className="text-sm leading-relaxed">{msg.content}</p>
            : (
              <>
                <MarkdownContent content={msg.content} />
                {isStreaming && <span className="inline-block w-2 h-4 bg-violet-400/70 rounded-sm ml-1 animate-pulse" />}
              </>
            )}
        </div>
        {!isUser && !isStreaming && msg.content.length > 10 && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-1 py-0.5 rounded"
          >
            {copied ? <><Check size={11} className="text-emerald-400" /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AIPage() {
  const { user } = useAuthStore();
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [convList, setConvList] = useState<Conversation[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refreshConvList = useCallback(() => setConvList(listConversations()), []);

  useEffect(() => { refreshConvList(); }, [refreshConvList]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamContent]);

  const startNewConversation = useCallback(async (firstMessage?: string) => {
    const title = firstMessage ? firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "…" : "") : "New Conversation";
    const conv = createConversation(title);
    setConvId(conv.id);
    setMessages([]);
    refreshConvList();
    if (firstMessage) {
      setTimeout(() => sendMessage(firstMessage, conv.id), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshConvList]);

  const sendMessage = useCallback(async (content: string, overrideConvId?: string) => {
    const id = overrideConvId ?? convId;
    if (!content.trim() || streaming) return;

    const userMsg: UIMessage = { id: `u_${Date.now()}`, role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    if (id) addMessage(id, { role: "user", content });
    setInput("");
    setStreaming(true);
    setStreamContent("");

    abortRef.current = new AbortController();

    await streamAIResponse(
      content,
      (chunk) => setStreamContent(prev => prev + chunk),
      (fullText) => {
        const assistantMsg: UIMessage = { id: `a_${Date.now()}`, role: "assistant", content: fullText };
        setMessages(prev => [...prev, assistantMsg]);
        if (id) addMessage(id, { role: "assistant", content: fullText });
        setStreamContent("");
        setStreaming(false);
        refreshConvList();
      },
      abortRef.current.signal,
    );
  }, [convId, streaming, refreshConvList]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    if (!convId) {
      await startNewConversation(input);
    } else {
      await sendMessage(input);
    }
  };

  const handleSelectConv = (id: string) => {
    const conv = getConversation(id);
    if (!conv) return;
    setConvId(id);
    setMessages(conv.messages.map((m, i) => ({ id: `${m.role}_${i}`, role: m.role, content: m.content })));
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
    if (convId === id) { setConvId(null); setMessages([]); }
    refreshConvList();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="AI Assistant">
        <div className="flex gap-5 h-[calc(100vh-148px)] min-h-[500px]">

          {/* ── SIDEBAR ── */}
          <div className="w-60 shrink-0 flex-col gap-3 hidden lg:flex">
            <Button
              onClick={() => startNewConversation()}
              className="w-full gap-2 bg-violet-500/12 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold rounded-xl h-10"
              variant="ghost"
            >
              <Plus size={14} /> New Chat
            </Button>

            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
              {convList.length === 0 && (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  <MessageSquare size={22} className="mx-auto mb-2 opacity-20" />
                  No conversations yet
                </div>
              )}
              {convList.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all border",
                    convId === conv.id
                      ? "bg-violet-500/10 border-violet-500/25 text-foreground"
                      : "border-transparent hover:bg-white/[0.04] hover:border-white/[0.08] text-muted-foreground hover:text-foreground",
                  )}
                >
                  <MessageSquare size={12} className="shrink-0 opacity-60" />
                  <span className="text-[12px] flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-400 p-0.5 rounded"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>

            {/* AI Info card */}
            <div className="rounded-2xl border border-violet-500/20 p-4 bg-gradient-to-b from-violet-500/8 to-transparent">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Zap size={12} className="text-violet-400" />
                </div>
                <span className="text-xs font-bold text-violet-300">HackFlow AI</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Free</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
                Built-in hackathon intelligence. Expert knowledge on teams, pitches, tech stacks, judging, and strategy.
              </p>
              <div className="flex items-center gap-1.5">
                <Shield size={10} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400">100% private · No data sent externally</span>
              </div>
            </div>
          </div>

          {/* ── CHAT AREA ── */}
          <div className="flex-1 flex flex-col glass-card rounded-2xl border border-white/[0.08] overflow-hidden">

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-violet-500/8 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Sparkles size={16} className="text-violet-300" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background" />
                </div>
                <div>
                  <div className="text-sm font-bold">HackFlow AI</div>
                  <div className="text-[11px] text-muted-foreground">
                    {streaming ? (
                      <span className="text-violet-400 animate-pulse">Thinking…</span>
                    ) : (
                      "Expert hackathon assistant · Always free"
                    )}
                  </div>
                </div>
              </div>
              {convId && (
                <Button variant="ghost" size="sm" onClick={() => startNewConversation()} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8">
                  <RotateCcw size={11} /> New Chat
                </Button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-none">
              <AnimatePresence mode="wait">
                {!convId && messages.length === 0 && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center py-8"
                  >
                    {/* Hero icon */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-violet-500/20 rounded-3xl blur-2xl scale-150" />
                      <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/30 to-blue-600/20 border border-violet-500/25 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.2)]">
                        <Bot size={36} className="text-violet-300" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-black mb-2">
                      Ask <span className="gradient-text-ai">HackFlow AI</span> anything
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-2">
                      Expert hackathon knowledge — project ideas, team strategy, tech stacks, pitch tips, judging criteria, and more.
                    </p>
                    <p className="text-xs text-emerald-400 mb-8 flex items-center gap-1.5">
                      <Shield size={11} /> Free · Always available · No API key needed
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
                      {QUICK_PROMPTS.map(p => (
                        <motion.button
                          key={p.label}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => startNewConversation(p.text)}
                          className={cn(
                            "flex flex-col gap-2.5 p-4 rounded-xl border text-left transition-all",
                            p.color,
                          )}
                        >
                          <p.icon size={16} />
                          <span className="text-[12px] font-bold leading-tight">{p.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {streaming && streamContent && (
                <MessageBubble
                  msg={{ id: "streaming", role: "assistant", content: streamContent }}
                  isStreaming
                />
              )}

              {streaming && !streamContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Bot size={14} className="text-violet-300" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center gap-1.5 h-11">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 rounded-full bg-violet-400/70 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.06] bg-white/[0.015]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about hackathons, teams, strategy, tech stacks…"
                  disabled={streaming}
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] h-11 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-violet-500/40 focus:bg-white/[0.07] transition-all disabled:opacity-50"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || streaming}
                  className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-40 disabled:shadow-none transition-all"
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
                HackFlow AI · Built-in intelligence · Always free · No external API
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
