import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetLeaderboard, useGetHackathon, useGetHackathonAnalytics } from "@workspace/api-client-react";
import { X, Trophy, Medal, Award, ChevronRight, Sparkles, Users, Code2, CheckCircle2 } from "lucide-react";

interface PresentationModeProps {
  hackathonId: number;
  onClose: () => void;
}

const PODIUM_COLORS = [
  { bg: "from-amber-500/30 to-amber-600/10", border: "border-amber-500/40", text: "text-amber-400", glow: "shadow-[0_0_40px_rgba(245,158,11,0.3)]", icon: Trophy },
  { bg: "from-slate-400/20 to-slate-500/10", border: "border-slate-400/40", text: "text-slate-300", glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]", icon: Medal },
  { bg: "from-orange-600/20 to-orange-700/10", border: "border-orange-600/40", text: "text-orange-500", glow: "shadow-[0_0_30px_rgba(234,88,12,0.2)]", icon: Award },
];

const SLIDES = ["intro", "stats", "winners", "podium", "ceremony"] as const;
type Slide = typeof SLIDES[number];

export function PresentationMode({ hackathonId, onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState<Slide>("intro");
  const [confetti, setConfetti] = useState(false);

  const { data: hackathon } = useGetHackathon(hackathonId);
  const { data: leaderboard } = useGetLeaderboard(hackathonId);
  const { data: analytics } = useGetHackathonAnalytics(hackathonId);

  const top3 = (leaderboard || []).slice(0, 3);
  const winner = top3[0];
  
  type Entry = NonNullable<typeof leaderboard>[number];

  const nextSlide = useCallback(() => {
    const idx = SLIDES.indexOf(currentSlide);
    if (idx < SLIDES.length - 1) {
      setCurrentSlide(SLIDES[idx + 1]);
    }
    if (SLIDES[idx + 1] === "ceremony") {
      setTimeout(() => setConfetti(true), 500);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    const idx = SLIDES.indexOf(currentSlide);
    if (idx > 0) setCurrentSlide(SLIDES[idx - 1]);
  }, [currentSlide]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide, onClose]);

  const slideIndex = SLIDES.indexOf(currentSlide);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#020617] flex flex-col overflow-hidden"
    >
      {/* Background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Confetti effect */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1, rotate: 0, scale: Math.random() * 0.8 + 0.4 }}
              animate={{ y: "110vh", opacity: 0, rotate: Math.random() * 720 - 360 }}
              transition={{ duration: Math.random() * 3 + 2, delay: Math.random() * 1.5, ease: "linear" }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: ["#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"][Math.floor(Math.random() * 6)] }}
            />
          ))}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Hack-Flow</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">Award Ceremony</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {SLIDES.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === slideIndex ? "w-8 bg-primary" : i < slideIndex ? "w-4 bg-primary/40" : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {currentSlide === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
              >
                <Sparkles size={14} />
                Award Ceremony
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent"
              >
                {hackathon?.title || "Hackathon"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-muted-foreground"
              >
                {hackathon?.description || "The results are in."}
              </motion.p>
            </motion.div>
          )}

          {/* STATS */}
          {currentSlide === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl"
            >
              <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                By The Numbers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Participants", value: analytics?.participantCount ?? "—", icon: Users, color: "text-primary" },
                  { label: "Teams", value: analytics?.teamCount ?? "—", icon: Users, color: "text-cyan-400" },
                  { label: "Projects", value: analytics?.projectCount ?? "—", icon: Code2, color: "text-emerald-400" },
                  { label: "Submission Rate", value: `${((analytics?.submissionRate || 0) * 100).toFixed(0)}%`, icon: CheckCircle2, color: "text-amber-400" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="glass-card rounded-2xl p-8 text-center border border-white/10"
                  >
                    <stat.icon size={28} className={`mx-auto mb-4 ${stat.color}`} />
                    <div className={`text-5xl font-black font-mono mb-2 ${stat.color}`}>{stat.value}</div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* WINNERS LIST */}
          {currentSlide === "winners" && (
            <motion.div
              key="winners"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <h2 className="text-4xl font-black text-center mb-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Final Rankings
              </h2>
              <div className="space-y-4">
                {(leaderboard || []).slice(0, 8).map((entry, i) => (
                  <motion.div
                    key={entry.project.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`glass-card rounded-2xl p-5 border flex items-center gap-4 ${
                      i === 0 ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
                    }`}
                  >
                    <div className={`text-3xl font-black font-mono w-12 text-center ${
                      i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-500" : "text-muted-foreground"
                    }`}>
                      #{entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate">{entry.project.title}</div>
                      <div className="text-sm text-muted-foreground">{entry.project.teamName}</div>
                    </div>
                    <div className="text-2xl font-black font-mono text-primary">{entry.totalScore.toFixed(1)}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PODIUM */}
          {currentSlide === "podium" && (
            <motion.div
              key="podium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl"
            >
              <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent">
                The Podium
              </h2>
              <div className="flex items-end justify-center gap-4">
                {[top3[1], top3[0], top3[2]].map((entry, i) => {
                  const rankIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
                  const colors = PODIUM_COLORS[rankIndex];
                  const heights = ["h-40", "h-56", "h-32"];
                  const Icon = colors.icon;
                  if (!entry) return <div key={i} className="w-48" />;
                  return (
                    <motion.div
                      key={entry.project.id}
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 + 0.3, type: "spring", stiffness: 100 }}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${colors.glow} flex items-center justify-center mb-4`}>
                        <Icon size={28} className={colors.text} />
                      </div>
                      <div className="text-center mb-4">
                        <div className="font-bold text-base truncate max-w-[160px]">{entry.project.title}</div>
                        <div className="text-sm text-muted-foreground">{entry.project.teamName}</div>
                        <div className={`text-2xl font-black font-mono mt-1 ${colors.text}`}>{entry.totalScore.toFixed(1)}</div>
                      </div>
                      <div className={`w-full ${heights[i]} bg-gradient-to-t ${colors.bg} border-t-2 ${colors.border} ${colors.glow} rounded-t-xl flex items-start justify-center pt-3`}>
                        <span className={`text-4xl font-black font-mono ${colors.text}`}>#{rankIndex + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* CEREMONY */}
          {currentSlide === "ceremony" && winner && (
            <motion.div
              key="ceremony"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1.1, 1.1, 1] }}
                transition={{ duration: 1, delay: 0.5 }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 border-2 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.4)] flex items-center justify-center"
              >
                <Trophy size={64} className="text-amber-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-muted-foreground text-lg mb-3">Champion</p>
                <h2 className="text-6xl font-black tracking-tighter mb-3 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  {winner.project.title}
                </h2>
                <p className="text-2xl text-muted-foreground mb-6">{winner.project.teamName}</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-2xl font-black font-mono">
                  <Sparkles size={20} />
                  {winner.totalScore.toFixed(1)} points
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-white/10 bg-black/20 backdrop-blur-md z-10 shrink-0">
        <button
          onClick={prevSlide}
          disabled={slideIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
        >
          ← Previous
        </button>
        <div className="text-sm text-muted-foreground">
          {slideIndex + 1} / {SLIDES.length} · Press Space or → to advance
        </div>
        <button
          onClick={nextSlide}
          disabled={slideIndex === SLIDES.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
