import { LeaderboardEntry } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const RANK_CONFIG = [
  {
    trueRank: 2,
    Icon: Medal,
    height: "h-36",
    gradient: "from-slate-400/20 via-slate-500/10 to-transparent",
    border: "border-slate-400/30",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]",
    iconColor: "text-slate-300",
    scoreColor: "text-slate-300",
    numColor: "text-slate-400/60",
    delay: 0.2,
  },
  {
    trueRank: 1,
    Icon: Trophy,
    height: "h-52",
    gradient: "from-amber-400/25 via-amber-500/12 to-orange-500/8",
    border: "border-amber-400/40",
    glow: "shadow-[0_0_50px_rgba(251,191,36,0.35)]",
    iconColor: "text-amber-400",
    scoreColor: "text-amber-300",
    numColor: "text-amber-400/50",
    delay: 0.5,
  },
  {
    trueRank: 3,
    Icon: Award,
    height: "h-28",
    gradient: "from-orange-700/20 via-orange-800/10 to-transparent",
    border: "border-orange-700/30",
    glow: "shadow-[0_0_20px_rgba(194,65,12,0.2)]",
    iconColor: "text-orange-600",
    scoreColor: "text-orange-500",
    numColor: "text-orange-700/60",
    delay: 0.1,
  },
];

export function LeaderboardPodium({ entries, className }: LeaderboardPodiumProps) {
  const top3 = [...entries].sort((a, b) => a.rank - b.rank).slice(0, 3);

  // Podium visual order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1] || null, top3[0] || null, top3[2] || null];

  return (
    <div className={cn("flex items-end justify-center gap-3 sm:gap-5 h-80 pt-10", className)}>
      {podiumOrder.map((entry, idx) => {
        const cfg = RANK_CONFIG[idx];
        const { Icon, trueRank } = cfg;

        return (
          <div key={`podium-${idx}`} className="flex flex-col items-center w-28 sm:w-36">
            {/* Name + score above pillar */}
            <AnimatePresence>
              {entry && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cfg.delay + 0.45, duration: 0.45 }}
                  className="flex flex-col items-center mb-3 text-center w-full px-1"
                >
                  {trueRank === 1 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: cfg.delay + 0.7, type: "spring", stiffness: 200 }}
                      className="mb-1"
                    >
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                    </motion.div>
                  )}
                  <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 w-full">{entry.project.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 w-full mt-0.5">{entry.project.teamName}</p>
                  <p className={`font-mono font-black text-sm sm:text-base mt-1 ${cfg.scoreColor}`}>
                    {entry.totalScore.toFixed(1)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pillar */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: cfg.delay, duration: 0.7, type: "spring", stiffness: 60 }}
              style={{ transformOrigin: "bottom" }}
              className={cn(
                "w-full rounded-t-2xl border-t-2 border-x flex flex-col items-center justify-start pt-4 relative overflow-hidden backdrop-blur-md",
                cfg.height,
                `bg-gradient-to-t ${cfg.gradient}`,
                cfg.border,
                cfg.glow
              )}
            >
              {/* shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-transparent pointer-events-none" />
              {trueRank === 1 && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.12),transparent_65%)] pointer-events-none" />
              )}

              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: cfg.delay + 0.4, type: "spring", stiffness: 180 }}
                className="relative z-10"
              >
                <Icon
                  size={trueRank === 1 ? 38 : 28}
                  className={cn("drop-shadow-lg", cfg.iconColor)}
                  strokeWidth={trueRank === 1 ? 1.8 : 2}
                />
              </motion.div>

              <div className={`text-3xl sm:text-4xl font-black mt-1 ${cfg.numColor} relative z-10`}>
                {trueRank}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
