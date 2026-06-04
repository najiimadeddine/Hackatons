import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { HackathonCard } from "@/components/shared/HackathonCard";
import { useListHackathons } from "@workspace/api-client-react";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Search, Filter, Trophy, Activity, Clock, CheckCircle2,
  Sparkles, Users, CalendarDays, ArrowRight
} from "lucide-react";

const STATUSES = [
  { value: "all",       label: "All",       color: "text-muted-foreground" },
  { value: "open",      label: "Open",      color: "text-emerald-400" },
  { value: "active",    label: "Live",      color: "text-blue-400" },
  { value: "judging",   label: "Judging",   color: "text-amber-400" },
  { value: "completed", label: "Completed", color: "text-purple-400" },
  { value: "draft",     label: "Draft",     color: "text-zinc-400" },
];

const STATUS_ICON: Record<string, React.FC<any>> = {
  open:      CheckCircle2,
  active:    Activity,
  judging:   Clock,
  completed: Trophy,
  draft:     Filter,
};

export default function HackathonsPage() {
  const [status, setStatus] = useState("open");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "prize" | "participants">("newest");

  const { data, isLoading } = useListHackathons({
    status: status === "all" ? undefined : status,
    limit: 100
  });

  const hackathons = useMemo(() => {
    let list = data?.data || [];

    if (search.trim()) {
      list = list.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "prize") {
      list = [...list].sort((a, b) => {
        const aVal = parseFloat((a.prizePool || "0").replace(/[^0-9.]/g, ""));
        const bVal = parseFloat((b.prizePool || "0").replace(/[^0-9.]/g, ""));
        return bVal - aVal;
      });
    } else if (sortBy === "participants") {
      list = [...list].sort((a, b) => (b.maxParticipants || 0) - (a.maxParticipants || 0));
    }

    return list;
  }, [data, search, sortBy]);

  // Stats derived from all data
  const allData = data?.data || [];
  const totalPrize = allData.reduce((sum, h) => {
    const val = parseFloat((h.prizePool || "0").replace(/[^0-9.,]/g, "").replace(",", ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Browse Hackathons">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-violet-600/6 to-cyan-600/5 p-8 mb-6"
        >
          {/* Layered backgrounds */}
          <div className="absolute inset-0 neon-grid-overlay opacity-[0.45] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/12 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/6 rounded-full blur-[60px] pointer-events-none" />
          {/* Top beam line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" />
                </div>
                <Trophy size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em]">HackFlow Events</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-2.5 tracking-tight">
                Find your next{" "}
                <span className="gradient-text-animated">challenge</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                {allData.filter(h => h.status === "open").length > 0
                  ? `${allData.filter(h => h.status === "open").length} events open for registration right now — your next breakthrough awaits.`
                  : "Browse hackathons, register your team, and build something amazing."}
              </p>
              {allData.filter(h => h.status === "active").length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {allData.filter(h => h.status === "active").length} LIVE right now
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-8 shrink-0 pr-4">
              {[
                { value: allData.length,                                         label: "Total Events",  color: "text-foreground",    glow: "" },
                { value: allData.filter(h => h.status === "open").length,        label: "Open Now",      color: "text-primary",       glow: "drop-shadow-[0_0_8px_rgba(65,130,255,0.6)]" },
                { value: allData.filter(h => h.status === "active").length,      label: "Live Now",      color: "text-emerald-400",   glow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" },
                { value: `$${(totalPrize/1000).toFixed(0)}K+`,                   label: "Total Prizes",  color: "text-amber-400",     glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-black font-mono ${stat.color} ${stat.glow}`}>{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground/70 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mini stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Events", value: allData.length, icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { label: "Open Now", value: allData.filter(h => h.status === "open").length, icon: Sparkles, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "Live Now", value: allData.filter(h => h.status === "active").length, icon: Activity, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { label: "In Judging", value: allData.filter(h => h.status === "judging").length, icon: Clock, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card rounded-2xl border p-4 flex items-center gap-3 ${stat.color}`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-current/10">
                <stat.icon size={18} className="text-current" />
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-current">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search hackathons by name or description..."
              className="pl-9 bg-black/20 border-white/10 h-10"
            />
          </div>
          <div className="flex gap-2">
            {(["newest", "prize", "participants"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 h-10 rounded-lg text-xs font-medium border transition-all capitalize ${
                  sortBy === s
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-black/20 border-white/10 text-muted-foreground hover:border-white/20"
                }`}
              >
                {s === "newest" ? "Newest" : s === "prize" ? "Prize ↓" : "Capacity ↓"}
              </button>
            ))}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {STATUSES.map(s => {
            const Icon = STATUS_ICON[s.value] || Filter;
            const count = s.value === "all"
              ? allData.length
              : allData.filter(h => h.status === s.value).length;
            return (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${
                  status === s.value
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-black/20 border-white/8 text-muted-foreground hover:border-white/15 hover:text-foreground"
                }`}
              >
                {s.value !== "all" && <Icon size={13} className={status === s.value ? "text-primary" : s.color} />}
                {s.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  status === s.value ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : hackathons.length > 0 ? (
            hackathons.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <HackathonCard hackathon={h} href={`/hackathons/${h.id}`} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass-card rounded-2xl border border-white/10">
              <Trophy size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-medium text-lg mb-2">
                {search ? "No results found" : "No hackathons in this category"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search ? `Try a different search term` : "Check back soon or switch to another status"}
              </p>
              {search && (
                <Button variant="outline" className="mt-4 border-white/10" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
