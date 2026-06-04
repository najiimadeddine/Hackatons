import { useParams, Link } from "wouter";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  useGetHackathon, useRegisterForHackathon, useGetHackathonMilestones,
  useListTeams, useListProjects, useGetLeaderboard, useGetEvaluationCriteria,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Users, Trophy, Code2, Loader2, ArrowRight, Clock,
  CheckCircle2, Circle, Target, Star, Medal, MapPin, Zap,
  ChevronRight, Globe, GitBranch, LayoutList, ExternalLink, Lock, TrendingUp,
} from "lucide-react";

/* ─── COUNTDOWN HOOK ─── */
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}
function calcTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    over: false,
  };
}

/* ─── STATUS CONFIG ─── */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  draft:     { label: "Draft",     color: "bg-muted/80 text-muted-foreground border-white/10",                     dot: "bg-muted-foreground" },
  open:      { label: "Open",      color: "bg-primary/20 text-primary border-primary/30",                          dot: "bg-primary animate-pulse" },
  active:    { label: "Active",    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",              dot: "bg-emerald-400 animate-pulse" },
  judging:   { label: "Judging",   color: "bg-amber-500/20 text-amber-400 border-amber-500/30",                    dot: "bg-amber-400 animate-pulse" },
  completed: { label: "Completed", color: "bg-violet-500/20 text-violet-400 border-violet-500/30",                 dot: "bg-violet-400" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive border-destructive/30",              dot: "bg-destructive" },
};

const MEDAL_COLORS = ["text-amber-400", "text-slate-300", "text-amber-600"];
const MEDAL_ICONS = [Trophy, Medal, Medal];

/* ─── COUNTDOWN UNIT ─── */
function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl md:text-3xl font-black tabular-nums text-primary min-w-[2.5ch] text-center"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

/* ─── TABS ─── */
type Tab = "overview" | "teams" | "projects" | "leaderboard" | "milestones";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview",    label: "Overview",    icon: LayoutList },
  { id: "milestones",  label: "Milestones",  icon: Target },
  { id: "teams",       label: "Teams",       icon: Users },
  { id: "projects",    label: "Projects",    icon: GitBranch },
  { id: "leaderboard", label: "Leaderboard", icon: TrendingUp },
];

export default function HackathonDetailPage() {
  const { id } = useParams();
  const hackathonId = parseInt(id || "0", 10);
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: hackathon, isLoading } = useGetHackathon(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });
  const { data: milestones } = useGetHackathonMilestones(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });
  const { data: teams } = useListTeams(hackathonId, {
    query: { enabled: !!hackathonId && (activeTab === "teams" || activeTab === "leaderboard") } as any,
  });
  const { data: projects } = useListProjects(hackathonId, {
    query: { enabled: !!hackathonId && activeTab === "projects" } as any,
  });
  const { data: leaderboard } = useGetLeaderboard(hackathonId, {
    query: { enabled: !!hackathonId && activeTab === "leaderboard" } as any,
  });
  const { data: criteria } = useGetEvaluationCriteria(hackathonId, {
    query: { enabled: !!hackathonId && activeTab === "overview" } as any,
  });

  const register = useRegisterForHackathon();

  /* countdown target: start if future, end if active */
  const countdownTarget = hackathon
    ? isFuture(new Date(hackathon.startDate))
      ? hackathon.startDate
      : hackathon.endDate
    : new Date().toISOString();
  const countdown = useCountdown(countdownTarget);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to register for this hackathon");
      return;
    }
    try {
      await register.mutateAsync({ id: hackathonId });
      toast.success("Registered successfully! Welcome aboard.");
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    }
  };

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <SkeletonLoader className="w-full h-72 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <SkeletonLoader className="h-10 w-2/3 rounded-xl" />
              <SkeletonLoader className="h-40 rounded-xl" />
            </div>
            <SkeletonLoader className="h-72 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hackathon) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center glass-card rounded-3xl">
          <Trophy size={40} className="mx-auto text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground text-lg">Hackathon not found.</p>
          <Link href="/hackathons"><Button variant="outline" className="mt-4">Back to events</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  const sc = STATUS_CONFIG[hackathon.status] || STATUS_CONFIG.draft;
  const isOpen = hackathon.status === "open";
  const isActive = hackathon.status === "active";
  const isCompleted = hackathon.status === "completed";
  const showCountdown = (isOpen || isActive) && !countdown.over;
  const countdownLabel = isFuture(new Date(hackathon.startDate)) ? "Starts in" : "Ends in";
  const milestoneList = (milestones as any[]) || [];
  const teamList = (teams as any[]) || [];
  const projectList = (projects as any[]) || [];
  const leaderboardList = (leaderboard as any[]) || [];
  const criteriaList = (criteria as any[]) || [];
  const completedMilestones = milestoneList.filter((m: any) => m.isCompleted).length;

  return (
    <DashboardLayout>
      <div className="space-y-0 pb-16">

        {/* ── HERO BANNER ── */}
        <div className="relative w-full h-60 md:h-80 rounded-3xl overflow-hidden mb-8 group">
          {hackathon.bannerUrl ? (
            <img
              src={hackathon.bannerUrl}
              alt={hackathon.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-violet-600/30 to-cyan-600/40" />
              {/* Animated orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[60px]" style={{ animation: "float 8s ease-in-out infinite" }} />
              {/* Neon grid */}
              <div className="absolute inset-0 neon-grid-overlay opacity-30" />
              {/* Central glow orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_80px_rgba(65,130,255,0.2)]">
                  <Trophy size={48} className="text-white/20" />
                </div>
              </div>
            </>
          )}
          {/* Overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge className={`mb-3 border text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5 ${sc.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                  {hackathon.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-white/60 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary/80" />
                    {format(new Date(hackathon.startDate), "MMM d")} – {format(new Date(hackathon.endDate), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-cyan-400/70" />
                    {hackathon.participantCount || 0} participants
                  </span>
                  {hackathon.prizePool && (
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                      <Trophy size={13} />
                      {hackathon.prizePool}
                    </span>
                  )}
                </div>
              </div>

              {/* Countdown in banner */}
              {showCountdown && (
                <div className="glass-void rounded-2xl px-5 py-3.5 border border-primary/20 shrink-0 shadow-[0_0_30px_rgba(65,130,255,0.12)]">
                  <p className="text-[10px] text-primary/80 uppercase tracking-[0.2em] mb-2.5 text-center font-bold">{countdownLabel}</p>
                  <div className="flex items-end gap-2.5">
                    <CountUnit value={countdown.days} label="days" />
                    <span className="text-primary/40 font-black mb-3.5 text-lg">:</span>
                    <CountUnit value={countdown.hours} label="hrs" />
                    <span className="text-primary/40 font-black mb-3.5 text-lg">:</span>
                    <CountUnit value={countdown.minutes} label="min" />
                    <span className="text-primary/40 font-black mb-3.5 text-lg">:</span>
                    <CountUnit value={countdown.seconds} label="sec" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: TABS + CONTENT ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tab bar */}
            <div className="flex overflow-x-auto scrollbar-none gap-1 bg-white/3 backdrop-blur-sm border border-white/8 p-1 rounded-2xl">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 relative flex-1 justify-center ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-primary/12 border border-primary/18" transition={{ type: "spring", bounce: 0.15, duration: 0.35 }} />
                  )}
                  <tab.icon size={15} className="relative z-10 shrink-0" />
                  <span className="relative z-10 hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    {/* Description */}
                    <div className="relative rounded-2xl p-6 border border-white/[0.08] overflow-hidden glass-card">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <h2 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-muted-foreground/70">
                        <LayoutList size={14} className="text-primary" /> About this Event
                      </h2>
                      <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
                        {hackathon.description}
                      </p>
                    </div>

                    {/* Tech stack */}
                    {hackathon.techStack && hackathon.techStack.length > 0 && (
                      <div className="relative rounded-2xl p-6 border border-cyan-500/15 overflow-hidden glass-card inner-glow-cyan">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground/70">
                          <Code2 size={14} className="text-cyan-400" /> Tech Stack
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.techStack.map((tech: string) => (
                            <motion.span
                              key={tech}
                              whileHover={{ scale: 1.06, y: -1 }}
                              className="px-3 py-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/8 text-cyan-300 text-[12px] font-semibold cursor-default transition-colors hover:bg-cyan-500/15 hover:border-cyan-400/30"
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evaluation criteria */}
                    {criteriaList.length > 0 && (
                      <div className="relative rounded-2xl p-6 border border-amber-500/15 overflow-hidden glass-card inner-glow-amber">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground/70">
                          <Star size={14} className="text-amber-400" /> Evaluation Criteria
                        </h2>
                        <div className="space-y-2.5">
                          {criteriaList.map((c: any, idx: number) => {
                            const totalWeight = criteriaList.reduce((s: number, x: any) => s + x.weight, 0);
                            const pct = totalWeight > 0 ? (c.weight / totalWeight) * 100 : c.weight;
                            return (
                              <div key={c.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                  <span className="text-[11px] font-black text-amber-400">{idx + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <p className="font-semibold text-sm truncate">{c.name}</p>
                                    <span className="text-sm font-black text-amber-400 shrink-0">{c.weight}%</span>
                                  </div>
                                  {c.description && <p className="text-[11px] text-muted-foreground/60 leading-relaxed mb-2">{c.description}</p>}
                                  <div className="metric-bar-track h-1.5">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.9, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                      className="metric-bar-fill bg-gradient-to-r from-amber-500 to-amber-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Open stack fallback */}
                    {(!hackathon.techStack || hackathon.techStack.length === 0) && (
                      <div className="rounded-2xl p-5 border border-white/[0.06] glass-card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Code2 size={18} className="text-primary/70" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Open Stack</p>
                          <p className="text-xs text-muted-foreground">Use any technologies you like — no restrictions.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MILESTONES */}
                {activeTab === "milestones" && (
                  <div className="glass-card rounded-2xl p-6 border border-white/8">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Target size={18} className="text-primary" /> Timeline
                      </h2>
                      {milestoneList.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          <span className="text-primary font-semibold">{completedMilestones}</span>/{milestoneList.length} complete
                        </span>
                      )}
                    </div>

                    {milestoneList.length > 0 ? (
                      <div className="relative">
                        {/* vertical line */}
                        <div className="absolute left-5 top-0 bottom-0 w-px bg-white/8" />
                        <div className="space-y-4">
                          {milestoneList.map((m: any, i: number) => {
                            const due = new Date(m.dueDate);
                            const overdue = !m.isCompleted && isPast(due);
                            return (
                              <motion.div
                                key={m.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex gap-5 pl-2"
                              >
                                <div className={`relative z-10 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  m.isCompleted
                                    ? "bg-emerald-500/20 border-emerald-500"
                                    : overdue
                                    ? "bg-rose-500/20 border-rose-500"
                                    : "bg-white/5 border-white/20"
                                }`}>
                                  {m.isCompleted
                                    ? <CheckCircle2 size={13} className="text-emerald-400" />
                                    : <Circle size={11} className={overdue ? "text-rose-400" : "text-muted-foreground"} />
                                  }
                                </div>
                                <div className="flex-1 pb-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`font-semibold text-sm leading-tight ${m.isCompleted ? "line-through text-muted-foreground" : ""}`}>{m.title}</p>
                                    <Badge variant="outline" className={`text-[10px] shrink-0 ${
                                      m.isCompleted ? "border-emerald-500/30 text-emerald-400" :
                                      overdue ? "border-rose-500/30 text-rose-400" :
                                      "border-white/10 text-muted-foreground"
                                    }`}>
                                      {m.isCompleted ? "Done" : overdue ? "Overdue" : format(due, "MMM d")}
                                    </Badge>
                                  </div>
                                  {m.description && (
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.description}</p>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <EmptyState icon={Target} text="No milestones defined yet." />
                    )}
                  </div>
                )}

                {/* TEAMS */}
                {activeTab === "teams" && (
                  <div className="glass-card rounded-2xl p-6 border border-white/8">
                    <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <Users size={18} className="text-primary" />
                      Teams
                      {teamList.length > 0 && <Badge variant="outline" className="ml-auto border-white/10 text-muted-foreground text-xs">{teamList.length}</Badge>}
                    </h2>
                    {teamList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {teamList.map((team: any, i: number) => (
                          <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Link href={`/teams/${team.id}`}>
                              <div className="group flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0">
                                  {team.name?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{team.name}</p>
                                  <p className="text-xs text-muted-foreground">{team.memberCount ?? "?"} members</p>
                                </div>
                                <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={Users} text="No teams registered yet." />
                    )}
                  </div>
                )}

                {/* PROJECTS */}
                {activeTab === "projects" && (
                  <div className="space-y-4">
                    {projectList.length > 0 ? projectList.map((proj: any, i: number) => (
                      <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link href={`/projects/${proj.id}`}>
                          <div className="glass-card rounded-2xl p-5 border border-white/8 hover:border-primary/20 hover:bg-primary/3 transition-all group cursor-pointer">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors truncate">{proj.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{proj.description}</p>
                                {proj.techStack && proj.techStack.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {proj.techStack.slice(0, 4).map((t: string) => (
                                      <Badge key={t} variant="outline" className="text-[11px] border-white/10 text-muted-foreground px-2 py-0.5">{t}</Badge>
                                    ))}
                                    {proj.techStack.length > 4 && (
                                      <Badge variant="outline" className="text-[11px] border-white/10 text-muted-foreground px-2 py-0.5">+{proj.techStack.length - 4}</Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              {proj.demoUrl && (
                                <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                  className="shrink-0 p-2.5 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                                  <ExternalLink size={15} />
                                </a>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )) : (
                      <div className="glass-card rounded-2xl p-6 border border-white/8">
                        <EmptyState icon={GitBranch} text="No projects submitted yet." />
                      </div>
                    )}
                  </div>
                )}

                {/* LEADERBOARD */}
                {activeTab === "leaderboard" && (
                  <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <TrendingUp size={18} className="text-primary" />
                      <h2 className="text-lg font-bold">Live Leaderboard</h2>
                    </div>

                    {leaderboardList.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {leaderboardList.map((entry: any, i: number) => {
                          const MedalIcon = MEDAL_ICONS[i] || Medal;
                          const medalColor = MEDAL_COLORS[i] || "text-muted-foreground";
                          const isTop3 = i < 3;
                          return (
                            <motion.div
                              key={entry.project?.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors ${isTop3 ? "bg-gradient-to-r from-white/[0.02] to-transparent" : ""}`}
                            >
                              {/* Rank */}
                              <div className={`w-8 text-center font-black text-sm ${medalColor}`}>
                                {isTop3 ? <MedalIcon size={20} className="mx-auto" /> : `#${entry.rank ?? i + 1}`}
                              </div>

                              {/* Team/Project */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{entry.project?.title ?? "Untitled"}</p>
                                <p className="text-xs text-muted-foreground truncate">{entry.project?.teamName ?? "—"}</p>
                              </div>

                              {/* Score bar */}
                              <div className="hidden sm:flex items-center gap-3 shrink-0 w-40">
                                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, ((entry.totalScore ?? 0) / 100) * 100)}%` }}
                                    transition={{ delay: i * 0.04 + 0.3, duration: 0.8, ease: "easeOut" }}
                                    className={`h-full rounded-full ${isTop3 ? "bg-primary" : "bg-white/30"}`}
                                  />
                                </div>
                              </div>

                              {/* Score */}
                              <div className={`text-right shrink-0 font-black text-sm tabular-nums ${isTop3 ? medalColor : "text-muted-foreground"}`}>
                                {(entry.totalScore ?? 0).toFixed(1)}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8">
                        <EmptyState icon={TrendingUp} text={isCompleted ? "Results not yet published." : "Leaderboard available after judging."} />
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">

            {/* Register / CTA card */}
            <div className="glass-card rounded-2xl p-5 border border-primary/15 bg-gradient-to-b from-primary/5 to-transparent shadow-[0_0_30px_rgba(59,130,246,0.08)]">

              {isOpen && (
                <Button
                  className="w-full h-12 font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(59,130,246,0.55)] hover:scale-[1.01] transition-all mb-4 border border-primary/40"
                  onClick={handleRegister}
                  disabled={register.isPending}
                >
                  {register.isPending
                    ? <><Loader2 size={16} className="mr-2 animate-spin" /> Registering…</>
                    : !isAuthenticated
                    ? <><Lock size={15} className="mr-2" /> Sign In to Register</>
                    : <>Register Now <ArrowRight size={16} className="ml-2" /></>
                  }
                </Button>
              )}

              {isActive && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-4">
                  <Zap size={15} className="shrink-0" />
                  Hackathon is live right now!
                </div>
              )}

              {isCompleted && (
                <Link href={`/hackathons/${hackathon.id}/portfolio`}>
                  <Button className="w-full h-12 font-bold bg-violet-600 hover:bg-violet-500 border-violet-500/50 mb-4 text-white">
                    <Globe size={16} className="mr-2" /> View Portfolio
                  </Button>
                </Link>
              )}

              {/* Stats */}
              <div className="space-y-3">
                {[
                  { icon: Calendar, color: "text-primary bg-primary/10", label: "Starts", value: format(new Date(hackathon.startDate), "MMM d, yyyy") },
                  { icon: Clock,    color: "text-rose-400 bg-rose-400/10", label: "Ends", value: format(new Date(hackathon.endDate), "MMM d, yyyy") },
                  ...(hackathon.prizePool ? [{ icon: Trophy, color: "text-amber-400 bg-amber-400/10", label: "Prize Pool", value: hackathon.prizePool }] : []),
                  { icon: Users, color: "text-emerald-400 bg-emerald-400/10", label: "Participants", value: String(hackathon.participantCount || 0) },
                  { icon: Users, color: "text-cyan-400 bg-cyan-400/10", label: "Team Size", value: `${hackathon.minTeamSize} – ${hackathon.maxTeamSize} members` },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
                      <p className="font-semibold text-sm truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress (milestones summary) */}
            {milestoneList.length > 0 && (
              <div className="glass-card rounded-2xl p-5 border border-white/8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Target size={15} className="text-primary" /> Progress</h3>
                  <button onClick={() => setActiveTab("milestones")} className="text-xs text-primary hover:underline">{completedMilestones}/{milestoneList.length}</button>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneList.length > 0 ? (completedMilestones / milestoneList.length) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-2">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h3>
              {[
                { label: "Find your team", href: `/hackathons/${hackathon.id}/matchmaking`, icon: Users, show: isOpen || isActive },
                { label: "Browse teams", href: "#teams", icon: Users, show: true, onClick: () => setActiveTab("teams") },
                { label: "View projects", href: "#projects", icon: GitBranch, show: isActive || isCompleted, onClick: () => setActiveTab("projects") },
                { label: "Leaderboard", href: "#leaderboard", icon: TrendingUp, show: isCompleted || hackathon.status === "judging", onClick: () => setActiveTab("leaderboard") },
              ].filter(a => a.show).map(a => (
                a.onClick ? (
                  <button key={a.label} onClick={a.onClick}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-left group">
                    <a.icon size={15} className="text-primary/70 group-hover:text-primary transition-colors shrink-0" />
                    {a.label}
                    <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <Link key={a.label} href={a.href}>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group">
                      <a.icon size={15} className="text-primary/70 group-hover:text-primary transition-colors shrink-0" />
                      {a.label}
                      <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon size={32} className="text-muted-foreground opacity-25 mb-3" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}
