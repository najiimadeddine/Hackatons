import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean; label?: string };
  description?: string;
  className?: string;
  accentColor?: string;
  subtitle?: string;
  neonColor?: string;
}

function useAnimatedNumber(target: number, duration = 1400) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

const NEON_PRESETS: Record<string, { icon: string; glow: string; bar: string; bg: string }> = {
  blue:   { icon: "text-blue-400 bg-blue-500/12 border-blue-500/20",   glow: "group-hover:shadow-[0_0_30px_rgba(65,130,255,0.18)]",  bar: "from-blue-500 to-blue-400",   bg: "from-blue-500/5 to-transparent" },
  cyan:   { icon: "text-cyan-400 bg-cyan-500/12 border-cyan-500/20",   glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.18)]",   bar: "from-cyan-500 to-cyan-400",   bg: "from-cyan-500/5 to-transparent" },
  green:  { icon: "text-emerald-400 bg-emerald-500/12 border-emerald-500/20", glow: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.18)]", bar: "from-emerald-500 to-emerald-400", bg: "from-emerald-500/5 to-transparent" },
  amber:  { icon: "text-amber-400 bg-amber-500/12 border-amber-500/20", glow: "group-hover:shadow-[0_0_30px_rgba(251,191,36,0.18)]",  bar: "from-amber-500 to-amber-400",  bg: "from-amber-500/5 to-transparent" },
  violet: { icon: "text-violet-400 bg-violet-500/12 border-violet-500/20", glow: "group-hover:shadow-[0_0_30px_rgba(167,139,250,0.18)]", bar: "from-violet-500 to-violet-400", bg: "from-violet-500/5 to-transparent" },
  rose:   { icon: "text-rose-400 bg-rose-500/12 border-rose-500/20",   glow: "group-hover:shadow-[0_0_30px_rgba(251,113,133,0.18)]", bar: "from-rose-500 to-rose-400",   bg: "from-rose-500/5 to-transparent" },
};

export function StatCard({ title, value, icon: Icon, trend, description, className, accentColor, subtitle, neonColor = "blue" }: StatCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericValue) && typeof value === "number";
  const animated = useAnimatedNumber(isNumeric ? numericValue : 0);
  const displayValue = isNumeric ? animated.toLocaleString() : value;

  const preset = NEON_PRESETS[neonColor] || NEON_PRESETS.blue;
  const iconClasses = accentColor || preset.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 group cursor-default",
        "bg-gradient-to-br from-white/[0.025] to-transparent",
        "backdrop-filter backdrop-blur-sm",
        "transition-all duration-400",
        preset.glow,
        className
      )}
    >
      {/* Top right gradient wash */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", preset.bg)} />

      {/* Circuit dots */}
      <div className="absolute top-3 right-10 w-1 h-1 rounded-full bg-white/[0.06]" />
      <div className="absolute top-6 right-7 w-0.5 h-0.5 rounded-full bg-white/[0.04]" />
      <div className="absolute bottom-5 left-5 w-0.5 h-0.5 rounded-full bg-white/[0.04]" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-5">
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.12em]">{title}</p>
        <div className={cn(
          "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
          "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
          iconClasses
        )}>
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>

      {/* Value */}
      <div className="relative z-10 flex items-end gap-3 mb-2">
        <span className="text-[32px] font-black tracking-tight text-foreground tabular-nums leading-none">
          {displayValue}
        </span>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg mb-0.5",
            trend.isPositive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          )}>
            {trend.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Subtitle / description */}
      {(subtitle || description || trend?.label) && (
        <p className="relative z-10 text-[11px] text-muted-foreground/50 font-medium">
          {subtitle || trend?.label || description}
        </p>
      )}

      {/* Bottom neon bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        preset.bar
      )} />

      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at bottom right, rgba(255,255,255,0.03) 0%, transparent 70%)` }} />
    </motion.div>
  );
}
