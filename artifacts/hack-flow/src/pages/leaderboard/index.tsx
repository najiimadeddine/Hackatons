import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useListHackathons, useGetLeaderboard, useListUsers } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Trophy, Medal, Star, Crown, Users,
  TrendingUp, Code2, BarChart3
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

const PODIUM_CONFIG = [
  { pos: 1, height: "h-36", bg: "from-amber-500/30 to-amber-600/10", border: "border-amber-500/40", crown: "text-amber-400", label: "1st", glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]" },
  { pos: 2, height: "h-24", bg: "from-zinc-400/20 to-zinc-500/5",   border: "border-zinc-500/30",  crown: "text-zinc-300",  label: "2nd", glow: "shadow-[0_0_30px_rgba(161,161,170,0.15)]" },
  { pos: 3, height: "h-20", bg: "from-amber-700/20 to-amber-800/5", border: "border-amber-700/30", crown: "text-amber-600", label: "3rd", glow: "shadow-[0_0_25px_rgba(180,83,9,0.15)]" },
];

const PODIUM_ORDER = [1, 0, 2];

const ROLE_COLORS: Record<string, string> = {
  admin:       "bg-rose-500/20 text-rose-200",
  organizer:   "bg-blue-500/20 text-blue-200",
  participant: "bg-emerald-500/20 text-emerald-200",
  mentor:      "bg-cyan-500/20 text-cyan-200",
  jury:        "bg-amber-500/20 text-amber-200",
};

const PODIUM_GLOWS = [
  "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  "shadow-[0_0_20px_rgba(52,211,153,0.3)]",
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"teams" | "participants">("teams");
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);

  const { data: hackathonsData, isLoading: hackLoading } = useListHackathons({ limit: 20 });
  const hackathons = hackathonsData?.data || [];

  const completedHackathons = hackathons.filter(h => h.status === "completed" || h.status === "judging");
  const activeHackathonId = selectedHackathonId ?? completedHackathons[0]?.id ?? null;

  const { data: leaderboardData, isLoading: lbLoading } = useGetLeaderboard(activeHackathonId!, {
    query: { enabled: !!activeHackathonId } as any,
  });

  const { data: usersData, isLoading: usersLoading } = useListUsers({ limit: 50 });

  const leaderboard = (leaderboardData as any[]) || [];
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const participants = (usersData as any)?.data?.filter((u: any) => u.role === "participant") || [];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Leaderboard">
        <div className="space-y-8">

          {/* ── Hero Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-transparent p-8"
          >
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-600/8 rounded-full blur-[60px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={18} className="text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Global Rankings</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-2">Hall of Champions</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  The most outstanding teams across all HackFlow competitions.
                </p>
              </div>
              <div className="flex items-center gap-8">
                {[
                  { icon: Trophy, value: hackathons.length || 0,    label: "Events" },
                  { icon: Users,  value: leaderboard.length || "—", label: "Teams" },
                  { icon: Star,   value: participants.length || "—", label: "Participants" },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <stat.icon size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Tabs + Hackathon Selector ── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {(["teams", "participants"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize",
                    tab === t
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      : "bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:border-white/[0.15] hover:text-foreground"
                  )}
                >
                  {t === "teams" ? "🏆 Teams" : "👤 Participants"}
                </button>
              ))}
            </div>

            {tab === "teams" && completedHackathons.length > 0 && (
              <Select
                value={String(activeHackathonId)}
                onValueChange={v => setSelectedHackathonId(parseInt(v))}
              >
                <SelectTrigger className="w-56 h-9 text-xs bg-black/30 border-white/10">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {completedHackathons.map(h => (
                    <SelectItem key={h.id} value={String(h.id)} className="text-xs">
                      {h.title.slice(0, 35)}{h.title.length > 35 ? "…" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ── TEAMS TAB ── */}
          {tab === "teams" && (
            <>
              {lbLoading || hackLoading ? (
                <div className="space-y-3">
                  {[0,1,2].map(i => <SkeletonLoader key={i} className="h-20 rounded-2xl" />)}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="glass-card rounded-2xl border border-white/[0.08] py-20 text-center">
                  <Trophy size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="text-muted-foreground">No results yet for this event.</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Select a completed or judging hackathon above.</p>
                </div>
              ) : (
                <>
                  {/* Podium */}
                  {topThree.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end justify-center gap-3 md:gap-6 py-8"
                    >
                      {PODIUM_ORDER.slice(0, topThree.length).map((idx) => {
                        const entry = topThree[idx];
                        if (!entry) return null;
                        const conf = PODIUM_CONFIG[idx];
                        return (
                          <motion.div
                            key={entry.rank}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.12 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div className="relative">
                              {idx === 0 && (
                                <motion.div
                                  animate={{ y: [-3, 3, -3] }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                                >
                                  <Crown size={22} className={conf.crown} />
                                </motion.div>
                              )}
                              <div className={cn(
                                "w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-sm font-black bg-gradient-to-br",
                                conf.bg, conf.border, conf.glow
                              )}>
                                {(entry.project?.teamName || "??").substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold truncate max-w-[120px]">{entry.project?.teamName || "—"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{Number(entry.totalScore).toFixed(2)}/10</p>
                            </div>
                            <div className={cn(
                              "w-24 md:w-32 rounded-t-xl border-t border-x bg-gradient-to-b flex items-center justify-center",
                              conf.height, conf.bg, conf.border
                            )}>
                              <span className={cn("text-3xl font-black", conf.crown)}>{conf.label}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Full rankings table */}
                  <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.02] grid grid-cols-12 gap-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-3">Team</span>
                      <span className="col-span-4">Project</span>
                      <span className="col-span-2 hidden md:block">Tech Stack</span>
                      <span className="col-span-2 text-right">Score</span>
                    </div>

                    {leaderboard.map((entry: any, i: number) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-5 py-4 border-b border-white/[0.04] last:border-0 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.025] transition-colors group"
                      >
                        <div className="col-span-1 text-center">
                          {i === 0 ? <Crown size={16} className="text-amber-400 mx-auto" />
                           : i === 1 ? <Medal size={16} className="text-zinc-300 mx-auto" />
                           : i === 2 ? <Medal size={16} className="text-amber-600 mx-auto" />
                           : <span className="font-mono text-sm font-bold text-muted-foreground/50">{entry.rank}</span>}
                        </div>
                        <div className="col-span-3 flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs font-bold shrink-0">
                            {(entry.project?.teamName || "??").substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {entry.project?.teamName || "Unknown"}
                          </p>
                        </div>
                        <div className="col-span-4 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{entry.project?.title || "—"}</p>
                        </div>
                        <div className="col-span-2 hidden md:flex gap-1 flex-wrap">
                          {(entry.project?.techStack || []).slice(0, 2).map((t: string) => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] text-muted-foreground/70">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-sm font-bold font-mono text-amber-300">{Number(entry.totalScore).toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground ml-0.5">/10</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── PARTICIPANTS TAB ── */}
          {tab === "participants" && (
            <div className="space-y-3">
              {usersLoading ? (
                <div className="space-y-3">
                  {[0,1,2,3].map(i => <SkeletonLoader key={i} className="h-20 rounded-2xl" />)}
                </div>
              ) : participants.length === 0 ? (
                <div className="glass-card rounded-2xl border border-white/[0.08] py-20 text-center">
                  <Users size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="text-muted-foreground">No participants found.</p>
                </div>
              ) : (
                participants.map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      "relative rounded-2xl border p-5 flex items-center gap-5 transition-all duration-300",
                      i < 3
                        ? "border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/8"
                        : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
                    )}
                  >
                    <div className="w-10 text-center shrink-0">
                      {i === 0 ? <Crown size={22} className="text-amber-400 mx-auto" />
                       : i === 1 ? <Medal size={22} className="text-zinc-300 mx-auto" />
                       : i === 2 ? <Medal size={22} className="text-amber-600 mx-auto" />
                       : <span className="text-lg font-black text-muted-foreground/40 font-mono">#{i + 1}</span>}
                    </div>

                    <div className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0",
                      ROLE_COLORS[p.role] || "bg-white/10 text-white",
                      i < 3 ? PODIUM_GLOWS[i] : ""
                    )}>
                      {p.name?.substring(0, 2).toUpperCase() || "??"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.bio || "Participant"}</p>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                      {(p.skills || []).slice(0, 3).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] text-muted-foreground border border-white/[0.07]">
                          {s}
                        </span>
                      ))}
                    </div>

                    <Badge variant="outline" className={cn("text-[10px] shrink-0 capitalize", ROLE_COLORS[p.role])}>
                      {p.role}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
