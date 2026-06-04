import { Link } from "wouter";
import { motion, useScroll, useTransform, useSpring, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Code2, Users, Trophy, Zap, Shield, 
  BarChart3, MessageSquare, Star, Globe, Cpu, 
  GitBranch, Award, CheckCircle2, Clock, 
  ArrowUpRight, Sparkles, Play, ChevronDown,
  Bot, Lightbulb, Brain, Wand2, TrendingUp, Lock
} from "lucide-react";
import { useListHackathons } from "@workspace/api-client-react";
import { HackathonCard } from "@/components/shared/HackathonCard";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { useAuthStore } from "@/store/authStore";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, to, {
      duration: 2.2,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return controls.stop;
  }, [to]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const STATS = [
  { to: 10000, suffix: "+", label: "Participants",  color: "gradient-text" },
  { to: 500,   suffix: "+", label: "Hackathons",    color: "gradient-text-cyan" },
  { to: 98,    suffix: "%", label: "Satisfaction",  color: "gradient-text-emerald" },
  { to: 150,   suffix: "+", label: "Universities",  color: "gradient-text-amber" },
];

const FEATURES = [
  {
    icon: Cpu,
    gradient: "from-blue-500/20 via-blue-600/10 to-transparent",
    border: "border-blue-500/20 hover:border-blue-400/40",
    iconBg: "bg-blue-500/15 text-blue-400",
    glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    title: "AI Matchmaking",
    desc: "Our proprietary algorithm analyzes skills, interests, and working styles to form balanced, high-performing teams automatically.",
    badge: "AI-Powered",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: BarChart3,
    gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
    border: "border-emerald-500/20 hover:border-emerald-400/40",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    glow: "hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]",
    title: "Matrix Evaluation",
    desc: "Structured multi-criteria scoring with weighted rubrics ensures fair, transparent, and defensible judging outcomes.",
    badge: "Jury Tools",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: MessageSquare,
    gradient: "from-cyan-500/20 via-cyan-600/10 to-transparent",
    border: "border-cyan-500/20 hover:border-cyan-400/40",
    iconBg: "bg-cyan-500/15 text-cyan-400",
    glow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]",
    title: "Real-Time Chat",
    desc: "Multi-room team communication with threaded discussions, file sharing, and live mentor office hours built right in.",
    badge: "Live",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Globe,
    gradient: "from-violet-500/20 via-violet-600/10 to-transparent",
    border: "border-violet-500/20 hover:border-violet-400/40",
    iconBg: "bg-violet-500/15 text-violet-400",
    glow: "hover:shadow-[0_0_40px_rgba(167,139,250,0.15)]",
    title: "Portfolio Generator",
    desc: "Automatically compile project showcases into beautiful public portfolios — perfect for recruiters and future references.",
    badge: "Auto-Generated",
    badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Shield,
    gradient: "from-amber-500/20 via-amber-600/10 to-transparent",
    border: "border-amber-500/20 hover:border-amber-400/40",
    iconBg: "bg-amber-500/15 text-amber-400",
    glow: "hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]",
    title: "Role-Based Access",
    desc: "Granular permissions for admins, organizers, participants, mentors, and juries with full audit trail and compliance.",
    badge: "Enterprise",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: BarChart3,
    gradient: "from-rose-500/20 via-rose-600/10 to-transparent",
    border: "border-rose-500/20 hover:border-rose-400/40",
    iconBg: "bg-rose-500/15 text-rose-400",
    glow: "hover:shadow-[0_0_40px_rgba(251,113,133,0.15)]",
    title: "Analytics Suite",
    desc: "Deep insights on participation trends, engagement metrics, and a stunning Presentation Mode for awards ceremonies.",
    badge: "Insights",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
];

const STEPS = [
  { n: "01", icon: Globe,     title: "Create Your Event",    desc: "Configure settings, timeline, prizes, evaluation criteria, and tech stack in minutes.", color: "text-primary bg-primary/10 border-primary/25" },
  { n: "02", icon: Users,     title: "Teams Form via AI",    desc: "Participants register and let the AI engine form balanced, skill-matched teams instantly.", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" },
  { n: "03", icon: GitBranch, title: "Build & Collaborate",  desc: "Integrated chat, mentor support, milestones, and project submission tools — all in one place.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  { n: "04", icon: Award,     title: "Jury Evaluates",       desc: "Matrix scoring, live leaderboard, and Presentation Mode deliver a spectacular closing ceremony.", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
];

const ROLES = [
  {
    role: "Organizer",
    emoji: "🏛️",
    color: "text-primary",
    gradient: "from-blue-600/20 to-blue-800/5",
    border: "border-blue-500/20",
    glow: "hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]",
    icon: Globe,
    perks: ["Create & manage hackathons", "Milestone tracking", "Role assignment", "Analytics dashboard", "Portfolio generation", "Presentation Mode"],
  },
  {
    role: "Participant",
    emoji: "💻",
    color: "text-emerald-400",
    gradient: "from-emerald-600/20 to-emerald-800/5",
    border: "border-emerald-500/20",
    glow: "hover:shadow-[0_8px_40px_rgba(52,211,153,0.15)]",
    icon: Code2,
    perks: ["AI team matchmaking", "Project workspace", "Real-time chat", "Mentor access", "Portfolio showcase", "Leaderboard rankings"],
  },
  {
    role: "Mentor",
    emoji: "🎓",
    color: "text-cyan-400",
    gradient: "from-cyan-600/20 to-cyan-800/5",
    border: "border-cyan-500/20",
    glow: "hover:shadow-[0_8px_40px_rgba(6,182,212,0.15)]",
    icon: MessageSquare,
    perks: ["Ticket queue management", "Office hours scheduling", "Team support tools", "Cross-event mentorship", "Feedback tracking", "Reputation system"],
  },
  {
    role: "Jury",
    emoji: "⚖️",
    color: "text-amber-400",
    gradient: "from-amber-600/20 to-amber-800/5",
    border: "border-amber-500/20",
    glow: "hover:shadow-[0_8px_40px_rgba(251,191,36,0.15)]",
    icon: Award,
    perks: ["Matrix evaluation panel", "Weighted rubric scoring", "Blind judging mode", "Score collaboration", "Automatic ranking", "Ceremony integration"],
  },
];

const TESTIMONIALS = [
  { 
    name: "Sarra Benali", 
    role: "Hackathon Organizer · USTHB", 
    quote: "Hack-Flow turned a chaotic 200-person event into the smoothest competition I've ever run. The matrix judging alone saved us 3 hours.", 
    initials: "SB",
    color: "bg-blue-500/20 text-blue-400",
    stars: 5,
  },
  { 
    name: "Amine Lakhdari", 
    role: "Full-Stack Developer · Finalist", 
    quote: "The AI matched me with the perfect team. We won first place. I'd have never found these people on my own.",
    initials: "AL",
    color: "bg-emerald-500/20 text-emerald-400",
    stars: 5,
  },
  { 
    name: "Dr. Khelifa Rachid", 
    role: "Jury Member · ESI Algiers", 
    quote: "The evaluation matrix is brilliantly designed. Transparent, structured, and the analytics after are incredibly useful for feedback.",
    initials: "KR",
    color: "bg-amber-500/20 text-amber-400",
    stars: 5,
  },
];

const LOGOS = ["Google", "Microsoft", "Amazon", "Meta", "Intel", "IBM", "Oracle", "SAP"];

export default function LandingPage() {
  const { data: hackathonsData, isLoading } = useListHackathons({ status: "open", limit: 3 });
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.5], [1, 0.97]);
  const smoothY     = useSpring(heroY, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">

      {/* ── HACKATHON BACKGROUND IMAGE ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Real hackathon photo — people coding at event */}
        <img
          src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectPosition: "center 40%" }}
        />

        {/* Dark overlay — strong enough to keep text legible */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(160deg, rgba(4,6,18,0.95) 0%, rgba(4,6,18,0.87) 50%, rgba(4,6,18,0.94) 100%)"
        }} />

        {/* Aurora color tinting over the photo */}
        <div className="aurora-orb aurora-orb-1" style={{ opacity: 0.5 }} />
        <div className="aurora-orb aurora-orb-2" style={{ opacity: 0.4 }} />
        <div className="aurora-orb aurora-orb-3" style={{ opacity: 0.3 }} />

        {/* Subtle grid on top */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />

        {/* Vignette edges */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 0%, transparent 50%, rgba(4,6,18,0.7) 100%)"
        }} />
      </div>

      {/* ── HEADER ── */}
      <header className="px-6 md:px-10 py-4 border-b border-white/[0.06] bg-background/40 backdrop-blur-2xl sticky top-0 z-50 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md group-hover:blur-lg transition-all" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
              <Zap size={17} className="text-primary" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-black tracking-tight text-lg">Hack<span className="gradient-text">Flow</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[["Features", "#features"], ["How it works", "#how"], ["For Teams", "#roles"], ["Pricing", "#pricing"], ["Testimonials", "#testimonials"]].map(([label, href]) => (
            <a key={label} href={href} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-white/[0.04]">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="btn-primary-glow h-9 px-5 text-sm font-semibold shadow-[0_0_25px_rgba(59,130,246,0.35)] border border-primary/40 rounded-xl gap-2">
                Dashboard <ArrowRight size={14} />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="h-9 px-4 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04]">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-primary-glow h-9 px-5 text-[13px] font-semibold shadow-[0_0_25px_rgba(59,130,246,0.35)] border border-primary/40 rounded-xl">
                  Get Started →
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-4 text-center min-h-[95vh]">
        <motion.div style={{ y: smoothY, opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto flex flex-col items-center">

          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium backdrop-blur-md cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group">
              <span className="w-2 h-2 rounded-full bg-emerald-400 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
              </span>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                Now with AI Team Matchmaking 2.0
              </span>
              <span className="text-primary flex items-center gap-1">
                Learn more <ArrowRight size={11} />
              </span>
            </div>
          </motion.div>

          {/* Main headline — premium gradient, word-by-word reveal, crescendo sizing */}
          <div
            className="font-black tracking-[-0.048em] leading-[0.9] mb-8 select-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {([
              { word: "Build.",    cls: "hero-word-1", size: "text-[52px] md:text-[72px] lg:text-[88px]"  },
              { word: "Compete.",  cls: "hero-word-2", size: "text-[62px] md:text-[88px] lg:text-[108px]" },
              { word: "Conquer.",  cls: "hero-word-3", size: "text-[56px] md:text-[80px] lg:text-[96px]"  },
            ] as const).map(({ word, cls, size }, i) => (
              <motion.span
                key={word}
                className={`block ${cls} ${size}`}
                initial={{ opacity: 0, y: 44 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.12 + i * 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="text-[17px] md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light"
          >
            The enterprise platform trusted by elite hackathon organizers worldwide —
            AI-powered team formation, matrix jury evaluation, real-time collaboration,
            and stunning portfolio generation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3.5 mb-20"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              <Button
                size="lg"
                className="btn-primary-glow h-13 px-9 text-[15px] font-bold shadow-[0_0_50px_rgba(59,130,246,0.45)] border border-primary/40 rounded-2xl gap-2.5 bg-primary hover:bg-primary/90"
              >
                <Sparkles size={16} />
                Launch Your Workspace
                <ArrowRight size={15} />
              </Button>
            </Link>
            <a href="#how">
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 text-[15px] font-medium bg-white/[0.03] border-white/[0.1] hover:bg-white/[0.06] hover:border-white/[0.16] rounded-2xl gap-2.5 transition-all"
              >
                <Play size={14} className="text-primary fill-primary" />
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.88, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap justify-center gap-10 md:gap-16"
          >
            {STATS.map(({ to, suffix, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                className="flex flex-col items-center"
              >
                <span className={`text-3xl md:text-4xl font-black ${color} tabular-nums`}>
                  <AnimatedCounter to={to} suffix={suffix} />
                </span>
                <span className="text-[11px] text-muted-foreground mt-1.5 tracking-widest uppercase font-medium">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/40"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown size={14} className="animate-bounce" />
        </motion.div>

        {/* Hero bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="relative z-10 py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 border-y border-white/[0.04]" />
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-8 font-medium">
            Trusted by leading universities & organizations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {LOGOS.map((name) => (
              <div key={name} className="text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors font-bold text-sm tracking-widest uppercase cursor-default select-none">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-widest mb-5">
                <Sparkles size={11} /> Platform Features
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tight mb-5 leading-tight">
                Everything you need to run<br />
                <span className="gradient-text">world-class hackathons</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
                From registration to ceremony — every workflow engineered for speed, clarity, and scale.
              </p>
            </motion.div>
          </div>

          {/* Feature cards — 3 col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={`relative rounded-2xl p-6 border bg-gradient-to-br ${f.gradient} ${f.border} ${f.glow} glass-card-hover group cursor-default overflow-hidden transition-all duration-300`}
              >
                {/* Top shimmer on hover */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                    <f.icon size={22} />
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${f.badgeColor} border font-medium`}>
                    {f.badge}
                  </Badge>
                </div>

                <h3 className="text-base font-bold mb-2.5 group-hover:text-white transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                  Learn more <ArrowUpRight size={11} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative z-10 py-32 px-4 md:px-8 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-widest mb-5">
                Process
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tight mb-5 leading-tight">
                From idea to <span className="gradient-text">award ceremony</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto font-light">
                Four elegant steps. Zero friction. Maximum impact.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative glass-card rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.14] transition-all group"
              >
                {/* Step number watermark */}
                <div className="text-[72px] font-black text-white/[0.04] leading-none mb-4 select-none group-hover:text-white/[0.07] transition-colors">
                  {step.n}
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-5 h-px bg-gradient-to-r from-white/10 to-transparent z-20" />
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${step.color}`}>
                  <step.icon size={18} />
                </div>
                <h3 className="font-bold text-[15px] mb-2.5 group-hover:text-white transition-colors">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="relative z-10 py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-widest mb-5">
                Built For Everyone
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tight mb-5 leading-tight">
                One platform, <span className="gradient-text">four perspectives</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto font-light">
                Every role gets a tailored experience — no clutter, no compromise.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r, i) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`glass-card bg-gradient-to-b ${r.gradient} rounded-2xl p-6 border ${r.border} ${r.glow} hover:scale-[1.02] transition-all duration-300 group`}
              >
                {/* Role header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{r.emoji}</span>
                  <h3 className={`font-bold text-lg ${r.color}`}>{r.role}</h3>
                </div>

                <ul className="space-y-2.5">
                  {r.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                      <CheckCircle2 size={13} className={`${r.color} mt-0.5 shrink-0`} />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                    <span className={`text-xs font-semibold ${r.color} flex items-center gap-1.5 hover:gap-2.5 transition-all`}>
                      Get started <ArrowRight size={11} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="relative z-10 py-32 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">

          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-widest mb-5">
                Social Proof
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tight mb-5 leading-tight">
                Trusted by <span className="gradient-text">top innovators</span>
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card rounded-2xl p-7 border border-white/[0.07] hover:border-white/[0.14] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                  "{t.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative z-10 py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-[11px] font-semibold uppercase tracking-widest mb-5">
                <Zap size={11} /> Simple Pricing
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tight mb-5 leading-tight">
                One platform, <span className="gradient-text-emerald">every role</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
                Free for participants. Transparent plans for organizations of every size.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "forever",
                desc: "Perfect for participants, students, and small communities.",
                color: "border-white/[0.08]",
                badge: null,
                features: ["Up to 2 hackathons/year", "AI team matchmaking", "Project submission", "Real-time chat", "Basic portfolio", "Community support"],
                cta: "Get Started Free",
                ctaStyle: "border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-foreground",
                popular: false,
              },
              {
                name: "Pro",
                price: "$149",
                period: "per event",
                desc: "For serious organizers running competitive hackathons.",
                color: "border-primary/40",
                badge: "Most Popular",
                features: ["Unlimited participants", "Matrix jury evaluation", "AI matchmaking 2.0", "Analytics dashboard", "Mentor assignment", "Priority support", "Custom criteria builder", "Presentation mode"],
                cta: "Start Free Trial",
                ctaStyle: "bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-primary/40",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                desc: "For universities, enterprises, and large-scale competitions.",
                color: "border-violet-500/30",
                badge: null,
                features: ["Unlimited events", "White-label branding", "SSO & SAML", "SLA guarantee", "Dedicated support", "Custom integrations", "Advanced analytics", "On-premise option"],
                cta: "Contact Sales",
                ctaStyle: "border border-violet-500/30 bg-violet-500/8 hover:bg-violet-500/15 text-violet-300",
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`relative rounded-2xl border ${plan.color} ${plan.popular ? "bg-primary/[0.04]" : "bg-white/[0.02]"} p-7 flex flex-col ${plan.popular ? "ring-1 ring-primary/30 shadow-[0_0_60px_rgba(59,130,246,0.12)]" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    {plan.badge}
                  </div>
                )}
                {plan.popular && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-t-2xl" />}

                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-5">{plan.desc}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 size={14} className={plan.popular ? "text-primary shrink-0" : "text-emerald-400/60 shrink-0"} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                  <button className={`w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${plan.ctaStyle}`}>
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-8">
            No credit card required for Starter. All plans include 14-day free trial on paid tiers.
          </p>
        </div>
      </section>

      {/* ── AI SECTION ── */}
      <section className="relative z-10 py-32 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/[0.07] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-[11px] font-semibold uppercase tracking-widest mb-6">
                <Sparkles size={11} /> Built-in Free AI · No API Key Needed
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tight mb-6 leading-[1.05]">
                Your AI hackathon<br />
                <span className="gradient-text-ai">coach is here</span>
              </h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed mb-8 max-w-lg">
                HackFlow AI is embedded directly in your workspace — completely free, always on. Get expert hackathon advice, project ideas, pitch coaching, and strategy — no setup required.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Lightbulb, color: "text-amber-400 bg-amber-500/10", text: "Generate project ideas tailored to your skills and hackathon theme" },
                  { icon: Code2,     color: "text-cyan-400 bg-cyan-500/10",   text: "Get code help, reviews, and architecture guidance on demand" },
                  { icon: Trophy,    color: "text-emerald-400 bg-emerald-500/10", text: "Learn winning strategies and how jury evaluation works" },
                  { icon: Users,     color: "text-violet-400 bg-violet-500/10", text: "Advice on team formation, task delegation, and collaboration" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className="flex items-start gap-3.5"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <p className="text-[14px] text-foreground/75 mt-1.5">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <Link href={isAuthenticated ? "/ai" : "/register"}>
                <Button className="btn-ai-glow h-12 px-8 rounded-2xl font-bold gap-2.5 text-[14px]">
                  <Bot size={16} />
                  {isAuthenticated ? "Open HackFlow AI" : "Try It Free"}
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </motion.div>

            {/* Right: AI chat mockup */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-violet-600/10 rounded-3xl blur-3xl" />
              <div className="relative glass-premium rounded-3xl border border-violet-500/20 overflow-hidden shadow-[0_32px_80px_rgba(139,92,246,0.25)]">
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-3 bg-gradient-to-r from-violet-500/10 to-transparent">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Sparkles size={16} className="text-violet-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">HackFlow AI</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] text-emerald-400">Free · Always available</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-5 space-y-4 bg-black/10">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/20 border border-primary/25 rounded-2xl px-4 py-2.5 max-w-[80%]">
                      <p className="text-[13px]">Give me a winning hackathon project idea for an AI theme</p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={13} className="text-violet-300" />
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 max-w-[85%]">
                      <p className="text-[13px] text-foreground/85 leading-relaxed mb-2">
                        Here's a strong idea: <strong className="text-foreground">MediFlow</strong> — an AI triage assistant for rural clinics.
                      </p>
                      <ul className="space-y-1.5">
                        {["Symptom analysis with LLM + image recognition", "Offline-first PWA for low-bandwidth areas", "Integrates with local pharmacy inventory", "30-min MVP possible with FastAPI + React"].map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400/60 shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* User message 2 */}
                  <div className="flex justify-end">
                    <div className="bg-primary/20 border border-primary/25 rounded-2xl px-4 py-2.5 max-w-[80%]">
                      <p className="text-[13px]">How do I pitch this in 3 minutes?</p>
                    </div>
                  </div>

                  {/* AI thinking */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-violet-300" />
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5 items-center h-4">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="px-5 py-4 border-t border-white/[0.06] flex gap-2.5">
                  <div className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-muted-foreground/50">
                    Ask HackFlow AI anything...
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-primary/80 flex items-center justify-center">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-6 bg-background border border-emerald-500/25 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Brain size={14} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-foreground">Instant answers</div>
                  <div className="text-[10px] text-muted-foreground">No waiting, no limits</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 bg-background border border-violet-500/25 rounded-xl px-3 py-2 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <Lock size={11} className="text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">100% Free · Always on</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LIVE HACKATHONS ── */}
      <section className="relative z-10 py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                </span>
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">Live Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Open for <span className="gradient-text">Registration</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Join an event and start competing today</p>
            </div>
            <Link href="/hackathons">
              <Button variant="outline" className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 gap-2 transition-all">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : hackathonsData?.data && hackathonsData.data.length > 0 ? (
              hackathonsData.data.map(h => (
                <HackathonCard key={h.id} hackathon={h} href={`/hackathons/${h.id}`} />
              ))
            ) : (
              <div className="col-span-3 text-center py-20 glass-card rounded-2xl border border-white/[0.07]">
                <Clock size={36} className="mx-auto text-muted-foreground mb-4 opacity-30" />
                <p className="text-muted-foreground">No open hackathons right now. Check back soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-36 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-primary/[0.04] rounded-3xl blur-3xl pointer-events-none scale-110" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-premium rounded-3xl border border-white/[0.08] p-16 overflow-hidden"
          >
            {/* Decorative top line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-widest mb-7">
              <Zap size={10} /> Ready to ship?
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-[-0.03em] mb-5 leading-tight">
              Start building<br />
              <span className="gradient-text">something legendary</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto font-light">
              Join thousands of developers, designers, and innovators who run their hackathons on HackFlow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button
                  size="lg"
                  className="btn-primary-glow h-14 px-12 text-base font-bold shadow-[0_0_50px_rgba(59,130,246,0.5)] border border-primary/40 rounded-2xl gap-2"
                >
                  <Sparkles size={17} />
                  {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/hackathons">
                <Button size="lg" variant="ghost" className="h-14 px-8 text-base text-muted-foreground hover:text-foreground rounded-2xl hover:bg-white/[0.04]">
                  Browse events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-12 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-primary" />
              </div>
              <span className="font-black tracking-tight">Hack<span className="gradient-text">Flow</span></span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              {["Features", "Pricing", "Docs", "Privacy", "Terms"].map(link => (
                <a key={link} href="#" className="hover:text-foreground transition-colors">{link}</a>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              {["GitHub", "Twitter", "LinkedIn"].map(s => (
                <a key={s} href="#" className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground border border-white/[0.06] hover:border-white/[0.12] hover:text-foreground hover:bg-white/[0.04] transition-all">
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-muted-foreground/50">
              © 2026 HackFlow. Built for the next generation of innovators.
            </p>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
