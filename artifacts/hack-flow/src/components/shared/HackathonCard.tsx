import { Hackathon } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Trophy, Zap, Clock, CheckCircle2, Activity, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HackathonCardProps {
  hackathon: Hackathon;
  href: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, {
  label: string; badge: string; dot: string; glow: string;
  topBar: string; cardBorder: string;
}> = {
  draft:     { label: "Draft",     badge: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",       dot: "bg-zinc-400",                   glow: "",                                                                   topBar: "from-zinc-600/40 to-zinc-800/20",  cardBorder: "hover:border-zinc-500/30" },
  open:      { label: "Open",      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",        dot: "bg-blue-400 animate-pulse",      glow: "hover:shadow-[0_8px_40px_rgba(65,130,255,0.15),0_0_0_1px_rgba(65,130,255,0.1)]",  topBar: "from-blue-600/50 via-blue-500/20 to-cyan-600/30",    cardBorder: "hover:border-blue-500/25" },
  active:    { label: "Live",      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400 animate-pulse", glow: "hover:shadow-[0_8px_40px_rgba(52,211,153,0.15),0_0_0_1px_rgba(52,211,153,0.1)]", topBar: "from-emerald-600/50 via-teal-500/20 to-cyan-600/30", cardBorder: "hover:border-emerald-500/25" },
  judging:   { label: "Judging",   badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",     dot: "bg-amber-400 animate-pulse",    glow: "hover:shadow-[0_8px_40px_rgba(251,191,36,0.15),0_0_0_1px_rgba(251,191,36,0.1)]",  topBar: "from-amber-600/50 via-orange-500/20 to-rose-600/20", cardBorder: "hover:border-amber-500/25" },
  completed: { label: "Completed", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",  dot: "bg-violet-400",                 glow: "hover:shadow-[0_8px_40px_rgba(167,139,250,0.15),0_0_0_1px_rgba(167,139,250,0.1)]", topBar: "from-violet-600/50 via-purple-500/20 to-fuchsia-600/30", cardBorder: "hover:border-violet-500/25" },
  cancelled: { label: "Cancelled", badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",        dot: "bg-rose-400",                   glow: "",                                                                   topBar: "from-rose-600/40 to-rose-800/20",   cardBorder: "" },
};

const BANNER_GRADIENTS = [
  "from-blue-700/50 via-indigo-600/30 to-cyan-700/40",
  "from-emerald-700/50 via-teal-600/30 to-cyan-700/40",
  "from-violet-700/50 via-purple-600/30 to-fuchsia-700/40",
  "from-amber-700/50 via-orange-600/30 to-rose-700/40",
  "from-cyan-700/50 via-sky-600/30 to-blue-700/40",
];

export function HackathonCard({ hackathon, href, className }: HackathonCardProps) {
  const sc = STATUS_CONFIG[hackathon.status] || STATUS_CONFIG.draft;
  const gradientIdx = (hackathon.id || 0) % BANNER_GRADIENTS.length;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const daysLeft = hackathon.status === "open"
    ? Math.max(0, Math.ceil((new Date(hackathon.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.005 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "group relative rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col h-full cursor-pointer",
          "bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-sm",
          "transition-all duration-400",
          sc.glow,
          sc.cardBorder,
          className
        )}
      >
        {/* Banner */}
        <div className="h-40 w-full relative overflow-hidden">
          {hackathon.bannerUrl ? (
            <img
              src={hackathon.bannerUrl}
              alt={hackathon.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
          ) : (
            <div className={cn("absolute inset-0 bg-gradient-to-br", BANNER_GRADIENTS[gradientIdx])}>
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.04) 20px,rgba(255,255,255,0.04) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.04) 20px,rgba(255,255,255,0.04) 21px)"
                }}
              />
              {/* Radial glow center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Trophy size={28} className="text-white/20" />
                </div>
              </div>
              {/* Corner orbs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/4 blur-lg" />
            </div>
          )}

          {/* Top colored accent bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-80", sc.topBar)} />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold backdrop-blur-xl",
              sc.badge
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sc.dot)} />
              {sc.label}
            </div>
          </div>

          {/* Prize pill */}
          {hackathon.prizePool && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl border border-amber-400/25 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Trophy size={10} className="text-amber-400" />
              <span className="text-[11px] font-bold text-amber-300">{hackathon.prizePool}</span>
            </div>
          )}

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 relative">
          {/* Title */}
          <h3 className="text-[15px] font-bold tracking-tight mb-2 line-clamp-1 transition-colors duration-200 group-hover:text-white">
            {hackathon.title}
          </h3>
          <p className="text-[12px] text-muted-foreground/70 line-clamp-2 mb-4 flex-1 leading-relaxed">
            {hackathon.description || "Join this exciting hackathon and build something amazing."}
          </p>

          {/* Tech stack chips */}
          {hackathon.techStack && hackathon.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {hackathon.techStack.slice(0, 3).map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] font-medium text-muted-foreground/80 hover:bg-white/[0.09] transition-colors">
                  {t}
                </span>
              ))}
              {hackathon.techStack.length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-muted-foreground/50">
                  +{hackathon.techStack.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="pt-3.5 border-t border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
              <div className="flex items-center gap-1.5">
                <Calendar size={11} className="text-blue-400/60 shrink-0" />
                <span>{formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={11} className="text-cyan-400/60 shrink-0" />
                <span>{hackathon.participantCount || 0}</span>
              </div>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <Zap size={11} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-semibold">
                  {daysLeft === 0 ? "Starts today!" : `${daysLeft}d to register`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hover footer */}
        <div className="px-5 pb-4 pt-0 flex items-center justify-between opacity-0 group-hover:opacity-100 -mt-2 group-hover:mt-0 transition-all duration-300">
          <span className="text-[11px] text-muted-foreground/50">View details</span>
          <ArrowRight size={13} className="text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Bottom neon line */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500", sc.topBar)} />
      </motion.div>
    </Link>
  );
}
