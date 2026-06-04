import { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Trophy, Users, Brain, CheckCircle2, ArrowRight } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const HIGHLIGHTS = [
  { icon: Brain,  label: "AI Team Matchmaking",    desc: "Skill-based algorithm" },
  { icon: Trophy, label: "Matrix Jury Evaluation", desc: "Structured scoring" },
  { icon: Users,  label: "48K+ Participants",      desc: "Worldwide community" },
];

const PERKS = [
  "Zero setup — deployed in minutes",
  "End-to-end event management",
  "Real-time chat & collaboration",
  "Portfolio auto-generation",
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-background">

      {/* ════════════════════════════════════
          LEFT — immersive visual panel
      ════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">

        {/* ── Real background photo ── */}
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=85&auto=format&fit=crop"
          alt="Team collaborating"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ objectPosition: "center 30%" }}
        />

        {/* ── Multi-layer gradient overlay ── */}
        <div className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, rgba(4,6,17,0.97) 0%, rgba(4,6,17,0.85) 45%, rgba(4,6,17,0.6) 100%),
              linear-gradient(to right, rgba(4,6,17,0.95) 0%, transparent 70%)
            `
          }}
        />

        {/* ── Aurora blobs ── */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* ── Grid overlay ── */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.025] pointer-events-none" />

        {/* ── Content layer ── */}
        <div className="relative z-10 flex flex-col h-full p-10 pb-12">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit group mb-auto">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-primary/40 rounded-xl blur-md" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Zap size={18} className="text-primary" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              Hack<span className="gradient-text">Flow</span>
            </span>
          </Link>

          {/* Main content — pushed to bottom */}
          <div className="mt-auto space-y-8">

            {/* Headline */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.08] tracking-tight mb-4">
                  Where great ideas<br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #22d3ee 100%)" }}
                  >
                    become reality.
                  </span>
                </h2>
                <p className="text-white/55 text-base leading-relaxed max-w-sm font-light">
                  The enterprise platform for hackathons — AI matchmaking, real-time collaboration, and matrix jury evaluation.
                </p>
              </motion.div>
            </div>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-3"
            >
              {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.08] transition-colors">
                  <Icon size={16} className="text-primary" />
                  <div>
                    <div className="text-white text-xs font-semibold leading-snug">{label}</div>
                    <div className="text-white/40 text-[11px] mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Perks list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-2.5"
            >
              {PERKS.map(perk => (
                <div key={perk} className="flex items-center gap-2.5 text-white/60 text-[13px]">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  {perk}
                </div>
              ))}
            </motion.div>

            {/* Testimonial card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.05] border border-white/[0.09] rounded-2xl p-5 backdrop-blur-md"
            >
              <div className="flex gap-1 mb-3">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
              <p className="text-white/70 text-[13px] leading-relaxed italic mb-4">
                "HackFlow completely changed how we run our annual innovation challenge. The AI team matching alone saved us dozens of hours of manual work."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary">
                  SC
                </div>
                <div>
                  <div className="text-white text-[13px] font-semibold">Sarah Chen</div>
                  <div className="text-white/40 text-[11px]">CTO, InnovateLab</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          RIGHT — form panel
      ════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden bg-background">

        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern-sm opacity-[0.02] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Zap size={17} className="text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-black tracking-tight text-lg">Hack<span className="gradient-text">Flow</span></span>
        </Link>

        <div className="w-full max-w-[420px] z-10">

          {/* Form header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h1 className="text-[28px] font-black tracking-tight text-foreground mb-2 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground text-[14px] leading-relaxed">{subtitle}</p>
            )}
          </motion.div>

          {/* Form content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 pt-6 border-t border-white/[0.06]"
          >
            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/50">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Enterprise Ready
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                GDPR Safe
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
