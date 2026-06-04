import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, ExternalLink, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { streamAIResponse } from "@/lib/hackathon-ai";

interface QuickMsg { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "What hackathon should I join?",
  "Give me project ideas",
  "How to win a hackathon?",
  "Best tech stack for MVP?",
];

export function AIFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<QuickMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || streaming) return;
    setMessages(prev => [...prev, { role: "user", content }]);
    setInput("");
    setStreaming(true);
    setStreamContent("");
    abortRef.current = new AbortController();

    await streamAIResponse(
      content,
      (chunk) => setStreamContent(prev => prev + chunk),
      (fullText) => {
        // Truncate for widget display
        const display = fullText.length > 600
          ? fullText.slice(0, 600).replace(/[*#`]/g, "").trim() + "…\n\n*Open full AI for the complete answer →*"
          : fullText;
        setMessages(prev => [...prev, { role: "assistant", content: display }]);
        setStreamContent("");
        setStreaming(false);
      },
      abortRef.current.signal,
    );
  }, [streaming]);

  const displayText = (text: string) =>
    text.replace(/#{1,3} /g, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/`(.*?)`/g, "$1").replace(/\*(.*?)\*/g, "$1");

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[320px] glass-premium rounded-2xl border border-white/[0.12] shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col"
            style={{ maxHeight: 500 }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between bg-gradient-to-r from-violet-500/15 to-blue-500/8 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Sparkles size={14} className="text-violet-300" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-background" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none">HackFlow AI</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield size={9} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">{streaming ? "Thinking…" : "Free · Always on"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/ai">
                  <button className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center transition-colors" title="Open full AI workspace">
                    <ExternalLink size={12} className="text-muted-foreground" />
                  </button>
                </Link>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                  <X size={13} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-none" style={{ maxHeight: 320 }}>
              {messages.length === 0 && !streaming && (
                <div className="space-y-2.5">
                  <p className="text-[12px] text-muted-foreground text-center py-1">
                    👋 Ask me anything about hackathons!
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-[11px] px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-violet-500/10 hover:border-violet-500/25 text-muted-foreground hover:text-foreground transition-all text-left leading-tight"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "max-w-[88%] rounded-xl px-3 py-2 text-[12px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary/20 border border-primary/25"
                      : "bg-white/[0.05] border border-white/[0.08] text-foreground/90",
                  )}>
                    {displayText(msg.content)}
                  </div>
                </div>
              ))}

              {streaming && streamContent && (
                <div className="flex gap-2">
                  <div className="max-w-[88%] rounded-xl px-3 py-2 text-[12px] leading-relaxed bg-white/[0.05] border border-white/[0.08] text-foreground/90">
                    {displayText(streamContent)}
                    <span className="inline-block w-1.5 h-3.5 bg-violet-400/70 rounded-sm ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {streaming && !streamContent && (
                <div className="flex gap-1.5 items-center px-1 py-2">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400/70 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06] shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
                  placeholder="Ask anything about hackathons…"
                  disabled={streaming}
                  className="flex-1 bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-violet-500/40 focus:bg-white/[0.07] transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center disabled:opacity-30 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] shrink-0"
                >
                  <Send size={12} className="text-white" />
                </button>
              </div>
              <div className="text-center mt-1.5">
                <Link href="/ai">
                  <span className="text-[10px] text-muted-foreground/50 hover:text-violet-400 transition-colors cursor-pointer">
                    Open full AI workspace →
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="relative w-13 h-13 rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(139,92,246,0.55)] transition-all bg-gradient-to-br from-violet-500 to-blue-600"
        style={{ width: 52, height: 52 }}
      >
        {pulse && !open && (
          <span className="absolute inset-0 rounded-2xl bg-violet-400/40 animate-ping" />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}>
              <X size={20} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}>
              <Bot size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-background text-[8px] font-black text-background flex items-center justify-center">
            AI
          </span>
        )}
      </motion.button>
    </div>
  );
}
