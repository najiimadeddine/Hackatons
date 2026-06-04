import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { 
  useGetPlatformAnalytics, useListHackathons, useListTickets, 
  useListProjects, useGetMe
} from "@workspace/api-client-react";
import { StatCard } from "@/components/shared/StatCard";
import { SkeletonCard, SkeletonList } from "@/components/shared/SkeletonLoader";
import { HackathonCard } from "@/components/shared/HackathonCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Users, Code2, Trophy, Activity, Calendar, Ticket as TicketIcon,
  ArrowRight, MessageSquare, Gavel, Sparkles, BarChart3, CheckCircle2,
  Clock, AlertCircle, ShieldAlert, Star, Target, Rocket, TrendingUp,
  Zap, Award, User as UserIcon, Plus, Brain
} from "lucide-react";

// ─── ADMIN ───────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuthStore();
  const { data: analytics, isLoading } = useGetPlatformAnalytics();

  const ROLE_COLORS = [
    { bar: "bg-primary/60",        text: "text-primary",        dot: "bg-primary"        },
    { bar: "bg-cyan-400/60",       text: "text-cyan-400",       dot: "bg-cyan-400"       },
    { bar: "bg-emerald-400/60",    text: "text-emerald-400",    dot: "bg-emerald-400"    },
    { bar: "bg-amber-400/60",      text: "text-amber-400",      dot: "bg-amber-400"      },
    { bar: "bg-purple-400/60",     text: "text-purple-400",     dot: "bg-purple-400"     },
    { bar: "bg-rose-400/60",       text: "text-rose-400",       dot: "bg-rose-400"       },
  ];

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-rose-500/20 bg-gradient-to-br from-rose-500/6 via-violet-600/4 to-transparent p-7"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-600/8 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-rose-400" />
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Platform Administration</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-1.5">
              Welcome, <span className="text-rose-400">{user?.name?.split(" ")[0] || "Admin"}</span> — you control the platform.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {analytics
                ? `${analytics.totalUsers?.toLocaleString()} users · ${analytics.activeHackathons} active events · ${analytics.totalProjects} projects submitted.`
                : "Loading platform metrics…"}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/admin/users">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.3)] gap-1.5">
                  <Users size={14} /> Manage Users
                </Button>
              </Link>
              <Link href="/hackathons">
                <Button size="sm" variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 gap-1.5">
                  <Trophy size={14} /> All Events
                </Button>
              </Link>
            </div>
          </div>
          {!isLoading && analytics && (
            <div className="hidden md:flex items-center gap-8 shrink-0">
              {[
                { label: "Total Users",    value: analytics.totalUsers,    color: "text-primary" },
                { label: "Active Events",  value: analytics.activeHackathons, color: "text-emerald-400" },
                { label: "Projects",       value: analytics.totalProjects,  color: "text-amber-400" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-4xl font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Platform Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Users"       value={analytics?.totalUsers || 0}       icon={Users}    neonColor="blue"   trend={{ value: 8,  isPositive: true }} />
            <StatCard title="Active Hackathons" value={analytics?.activeHackathons || 0} icon={Activity} neonColor="green"  trend={{ value: 3,  isPositive: true }} />
            <StatCard title="Total Projects"    value={analytics?.totalProjects || 0}    icon={Code2}    neonColor="cyan"   trend={{ value: 15, isPositive: true }} />
            <StatCard title="Total Events"      value={analytics?.totalHackathons || 0}  icon={Trophy}   neonColor="amber" />
          </>
        )}
      </div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Users by Role */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Users size={15} className="text-primary" /> Users by Role
            </h3>
            <span className="text-xs text-muted-foreground">{analytics?.totalUsers || 0} total</span>
          </div>
          {isLoading ? <SkeletonList count={5} /> : (
            <div className="space-y-4">
              {analytics?.usersByRole?.map((role, i) => {
                const pct = analytics.totalUsers > 0 ? (role.count / analytics.totalUsers) * 100 : 0;
                const c = ROLE_COLORS[i % ROLE_COLORS.length];
                return (
                  <div key={role.name}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <span className="capitalize font-medium">{role.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${c.text}`}>{role.count}</span>
                        <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${c.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Zap size={15} className="text-amber-400" /> Admin Controls
          </h3>
          <div className="space-y-2">
            {[
              { href: "/admin/users",      label: "Manage all users",        icon: Users,       color: "text-primary",     bg: "bg-primary/8 hover:bg-primary/15 border-primary/10 hover:border-primary/25" },
              { href: "/admin/audit-logs", label: "View audit logs",          icon: Activity,    color: "text-amber-400",   bg: "bg-amber-500/8 hover:bg-amber-500/15 border-amber-500/10 hover:border-amber-500/25" },
              { href: "/hackathons",       label: "All hackathons",           icon: Trophy,      color: "text-emerald-400", bg: "bg-emerald-500/8 hover:bg-emerald-500/15 border-emerald-500/10 hover:border-emerald-500/25" },
              { href: "/tickets",          label: "Support ticket queue",     icon: TicketIcon,  color: "text-rose-400",    bg: "bg-rose-500/8 hover:bg-rose-500/15 border-rose-500/10 hover:border-rose-500/25" },
              { href: "/leaderboard",      label: "Platform leaderboard",     icon: TrendingUp,  color: "text-violet-400",  bg: "bg-violet-500/8 hover:bg-violet-500/15 border-violet-500/10 hover:border-violet-500/25" },
              { href: "/chat",             label: "All chat rooms",           icon: MessageSquare,color: "text-cyan-400",   bg: "bg-cyan-500/8 hover:bg-cyan-500/15 border-cyan-500/10 hover:border-cyan-500/25" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group ${item.bg}`}>
                  <item.icon size={15} className={item.color} />
                  <span className="text-sm flex-1 font-medium">{item.label}</span>
                  <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}

// ─── PARTICIPANT ─────────────────────────────────────────────────────────────
function ParticipantDashboard() {
  const { user } = useAuthStore();
  const { data: hackathons, isLoading: hackLoading } = useListHackathons({ status: "active", limit: 3 });
  const { data: allHacks } = useListHackathons({ limit: 50 });
  const { data: tickets, isLoading: ticketLoading } = useListTickets({});
  const { data: freshUser } = useGetMe();
  const me = (freshUser as any) || user;
  const skills: string[] = me?.skills || [];
  const profileFields = [me?.name, me?.bio, me?.githubUrl, me?.linkedinUrl, skills.length > 0];
  const profilePct = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const openCount = (allHacks?.data || []).filter(h => h.status === "open").length;
  const activeCount = (allHacks?.data || []).filter(h => h.status === "active").length;
  const ticketList = (tickets as any[]) || [];

  return (
    <div className="space-y-8">

      {/* ── Welcome Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-violet-600/5 to-transparent p-7"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-600/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Rocket size={18} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Participant Workspace</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-1.5">
              Welcome back, <span className="gradient-text">{me?.name?.split(" ")[0] || "Builder"}</span> 👋
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {openCount > 0
                ? `${openCount} hackathon${openCount > 1 ? "s" : ""} currently open for registration. Don't miss your shot.`
                : activeCount > 0
                ? `${activeCount} hackathon${activeCount > 1 ? "s" : ""} in progress — keep building!`
                : "The next big challenge is coming. Stay ready."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/hackathons">
                <Button size="sm" className="shadow-[0_0_20px_rgba(59,130,246,0.35)] gap-1.5">
                  <Trophy size={14} /> Browse Hackathons
                </Button>
              </Link>
              <Link href="/teams">
                <Button size="sm" variant="outline" className="border-white/10 gap-1.5">
                  <Users size={14} /> My Teams
                </Button>
              </Link>
              <Link href="/ai">
                <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 gap-1.5">
                  <Brain size={14} /> AI Match
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile completion ring */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="url(#prog-grad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - profilePct / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <defs>
                  <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black">{profilePct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground">Profile Power</p>
              {profilePct < 100 && (
                <Link href="/profile">
                  <p className="text-[10px] text-primary hover:underline cursor-pointer">Complete profile →</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Journey Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Events",   value: openCount,   icon: Trophy,      color: "from-amber-500/15 to-amber-600/5 border-amber-500/20 text-amber-400" },
          { label: "Live Now",      value: activeCount, icon: Zap,         color: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 text-emerald-400" },
          { label: "Your Skills",   value: skills.length || "—", icon: Star, color: "from-primary/15 to-primary/5 border-primary/20 text-primary" },
          { label: "Open Tickets",  value: ticketList.filter((t: any) => t.status === "open").length, icon: TicketIcon, color: "from-rose-500/15 to-rose-600/5 border-rose-500/20 text-rose-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass-card rounded-2xl border bg-gradient-to-br p-5 flex items-center gap-3 ${s.color}`}
          >
            <div className="w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center shrink-0">
              <s.icon size={18} className="text-current" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-current">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Active Hackathons ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity size={17} className="text-primary" /> Live Hackathons
          </h2>
          <Link href="/hackathons">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1">
              View all <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {hackLoading ? (
            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : hackathons?.data && hackathons.data.length > 0 ? (
            hackathons.data.map(h => (
              <HackathonCard key={h.id} hackathon={h} href={`/hackathons/${h.id}`} />
            ))
          ) : (
            <div className="col-span-3 p-12 glass-card rounded-2xl text-center border border-white/10 space-y-3">
              <Trophy size={40} className="mx-auto opacity-10" />
              <p className="font-semibold">No active hackathons right now</p>
              <p className="text-sm text-muted-foreground">Browse all upcoming events and register early.</p>
              <Link href="/hackathons">
                <Button variant="outline" size="sm" className="mt-2 border-white/10">Explore Events</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Skills Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Star size={15} className="text-amber-400" /> Your Skills
            </h3>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                Edit <ArrowRight size={11} />
              </Button>
            </Link>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 12).map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-primary/90 text-xs font-medium"
                >
                  {skill}
                </motion.span>
              ))}
              {skills.length > 12 && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-xs">
                  +{skills.length - 12} more
                </span>
              )}
            </div>
          ) : (
            <div className="py-4 text-center space-y-3">
              <Star size={28} className="mx-auto opacity-15" />
              <p className="text-sm text-muted-foreground">Add skills to improve AI matchmaking</p>
              <Link href="/profile">
                <Button size="sm" variant="outline" className="border-white/10 gap-1.5">
                  <Plus size={13} /> Add Skills
                </Button>
              </Link>
            </div>
          )}
          <div className="pt-2 border-t border-white/[0.06]">
            <Link href="/ai">
              <Button size="sm" variant="ghost" className="w-full text-xs text-primary hover:bg-primary/5 gap-1.5">
                <Brain size={13} /> Find team matches with AI
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <TicketIcon size={15} className="text-primary" /> Support Tickets
            </h3>
            <Link href="/tickets">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
            </Link>
          </div>
          {ticketLoading ? <SkeletonList count={3} /> : ticketList.length > 0 ? (
            <div className="space-y-1.5">
              {ticketList.slice(0, 4).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    t.status === "open" ? "bg-rose-400" : t.status === "claimed" ? "bg-amber-400" : "bg-emerald-400"
                  }`} />
                  <span className="text-sm flex-1 truncate">{t.title}</span>
                  <Badge variant="outline" className="text-[10px] capitalize border-white/10 bg-white/5 shrink-0">
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center">
              <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400 opacity-40" />
              <p className="text-sm text-muted-foreground">No open tickets — all clear!</p>
            </div>
          )}
          <Link href="/tickets">
            <Button variant="outline" size="sm" className="w-full border-white/10 hover:border-primary/30 gap-1.5">
              <Plus size={13} /> Open a Ticket
            </Button>
          </Link>
        </div>

        {/* Quick Nav */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <h3 className="font-bold flex items-center gap-2">
            <Zap size={15} className="text-amber-400" /> Quick Access
          </h3>
          <div className="space-y-1.5">
            {[
              { href: "/hackathons",  label: "Browse all events",       icon: Trophy,        color: "text-amber-400",  bg: "bg-amber-500/8 hover:bg-amber-500/15 border-amber-500/10 hover:border-amber-500/25" },
              { href: "/teams",       label: "Manage my teams",          icon: Users,         color: "text-cyan-400",   bg: "bg-cyan-500/8 hover:bg-cyan-500/15 border-cyan-500/10 hover:border-cyan-500/25" },
              { href: "/chat",        label: "Team chat",                icon: MessageSquare, color: "text-primary",    bg: "bg-primary/8 hover:bg-primary/15 border-primary/10 hover:border-primary/25" },
              { href: "/leaderboard", label: "Global leaderboard",       icon: TrendingUp,    color: "text-violet-400", bg: "bg-violet-500/8 hover:bg-violet-500/15 border-violet-500/10 hover:border-violet-500/25" },
              { href: "/profile",     label: "Edit profile & skills",    icon: UserIcon,      color: "text-emerald-400",bg: "bg-emerald-500/8 hover:bg-emerald-500/15 border-emerald-500/10 hover:border-emerald-500/25" },
              { href: "/ai",          label: "AI team matchmaking",      icon: Brain,         color: "text-rose-400",   bg: "bg-rose-500/8 hover:bg-rose-500/15 border-rose-500/10 hover:border-rose-500/25" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group ${item.bg}`}>
                  <item.icon size={15} className={item.color} />
                  <span className="text-sm flex-1 font-medium">{item.label}</span>
                  <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORGANIZER ────────────────────────────────────────────────────────────────
function OrganizerDashboard() {
  const { user } = useAuthStore();
  const { data: hackathons, isLoading } = useListHackathons({ limit: 20 });
  const hackList = hackathons?.data || [];

  const stats = {
    total:     hackList.length,
    active:    hackList.filter(h => h.status === "active").length,
    open:      hackList.filter(h => h.status === "open").length,
    completed: hackList.filter(h => h.status === "completed").length,
    judging:   hackList.filter(h => h.status === "judging").length,
    draft:     hackList.filter(h => h.status === "draft").length,
    participants: hackList.reduce((acc, h) => acc + (h.participantCount || 0), 0),
  };

  const STATUS_STYLE: Record<string, string> = {
    active:    "border-blue-500/30 text-blue-400 bg-blue-500/10",
    open:      "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    completed: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    judging:   "border-amber-500/30 text-amber-400 bg-amber-500/10",
    draft:     "border-white/10 text-muted-foreground bg-white/5",
  };

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-cyan-600/4 to-transparent p-7"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-600/8 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Organizer Control Center</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-1.5">
              Hey, <span className="text-emerald-400">{user?.name?.split(" ")[0] || "Organizer"}</span> — your events await.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {stats.active > 0
                ? `${stats.active} event${stats.active > 1 ? "s" : ""} live now with ${stats.participants.toLocaleString()} total participants.`
                : stats.open > 0
                ? `${stats.open} event${stats.open > 1 ? "s" : ""} open for registration.`
                : "Create your first hackathon and start building your community."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/organizer/hackathons">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.35)] gap-1.5">
                  <Rocket size={14} /> My Hackathons
                </Button>
              </Link>
              <Link href="/organizer/hackathons/new">
                <Button size="sm" variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 gap-1.5">
                  <Plus size={14} /> New Event
                </Button>
              </Link>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="text-5xl font-black font-mono text-emerald-400">{stats.participants.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground text-center">Total participants<br />across all events</div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Events",   value: stats.total,     color: "from-white/5 border-white/10 text-foreground" },
          { label: "Active",         value: stats.active,    color: "from-blue-500/10 border-blue-500/20 text-blue-400" },
          { label: "Open",           value: stats.open,      color: "from-emerald-500/10 border-emerald-500/20 text-emerald-400" },
          { label: "In Judging",     value: stats.judging,   color: "from-amber-500/10 border-amber-500/20 text-amber-400" },
          { label: "Completed",      value: stats.completed, color: "from-purple-500/10 border-purple-500/20 text-purple-400" },
          { label: "Draft",          value: stats.draft,     color: "from-white/3 border-white/8 text-muted-foreground" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`glass-card p-4 rounded-2xl border bg-gradient-to-br text-center ${s.color}`}
          >
            <div className="text-3xl font-black font-mono mb-0.5 text-current">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Events Table + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Events list */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Trophy size={15} className="text-emerald-400" /> Your Events
            </h3>
            <Link href="/organizer/hackathons">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                Manage all <ArrowRight size={11} />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="p-4"><SkeletonList count={5} /></div>
          ) : hackList.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {hackList.slice(0, 6).map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.025] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Trophy size={15} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{h.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {h.participantCount ?? 0} participants{h.prizePool ? ` · ${h.prizePool}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${STATUS_STYLE[h.status] || STATUS_STYLE.draft}`}>
                    {h.status}
                  </Badge>
                  <div className="flex gap-1.5 shrink-0">
                    <Link href={`/organizer/hackathons/${h.id}/manage`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 hover:border-emerald-500/30 px-2.5">
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/organizer/hackathons/${h.id}/analytics`}>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-white/8 hover:border-primary/30">
                        <BarChart3 size={13} />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Trophy size={40} className="mx-auto opacity-10" />
              <p className="font-semibold">No hackathons yet</p>
              <p className="text-sm text-muted-foreground">Create your first event and start building your community.</p>
              <Link href="/organizer/hackathons/new">
                <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                  <Plus size={14} /> Create Hackathon
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <Zap size={15} className="text-amber-400" /> Quick Actions
            </h3>
            {[
              { href: "/organizer/hackathons/new",    label: "Create new hackathon",   icon: Plus,       color: "text-emerald-400", bg: "bg-emerald-500/8 hover:bg-emerald-500/15 border-emerald-500/10 hover:border-emerald-500/25" },
              { href: "/organizer/hackathons",        label: "Manage all events",       icon: Trophy,     color: "text-primary",     bg: "bg-primary/8 hover:bg-primary/15 border-primary/10 hover:border-primary/25" },
              { href: "/chat",                        label: "Announcements & chat",    icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/8 hover:bg-cyan-500/15 border-cyan-500/10 hover:border-cyan-500/25" },
              { href: "/tickets",                     label: "Support ticket queue",    icon: TicketIcon,  color: "text-rose-400",   bg: "bg-rose-500/8 hover:bg-rose-500/15 border-rose-500/10 hover:border-rose-500/25" },
              { href: "/leaderboard",                 label: "Global leaderboard",      icon: TrendingUp, color: "text-violet-400",  bg: "bg-violet-500/8 hover:bg-violet-500/15 border-violet-500/10 hover:border-violet-500/25" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group ${item.bg}`}>
                  <item.icon size={15} className={item.color} />
                  <span className="text-sm flex-1 font-medium">{item.label}</span>
                  <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

// ─── MENTOR ──────────────────────────────────────────────────────────────────
function MentorDashboard() {
  const { user } = useAuthStore();
  const { data: tickets, isLoading } = useListTickets({});
  const ticketList = (tickets as any[]) || [];
  const openTickets    = ticketList.filter((t: any) => t.status === "open");
  const claimedTickets = ticketList.filter((t: any) => t.status === "claimed");
  const resolvedTickets= ticketList.filter((t: any) => t.status === "resolved");
  const highPriority   = openTickets.filter((t: any) => t.priority === "high");

  const PRIORITY_DOT: Record<string, string> = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" };
  const STATUS_DOT: Record<string, string>   = { open: "bg-rose-400", claimed: "bg-amber-400", resolved: "bg-emerald-400", closed: "bg-zinc-500" };

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 via-blue-600/4 to-transparent p-7"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/8 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={18} className="text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Mentor Support Center</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-1.5">
              Hey, <span className="text-cyan-400">{user?.name?.split(" ")[0] || "Mentor"}</span> — hackers need you.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {openTickets.length > 0
                ? `${openTickets.length} open ticket${openTickets.length > 1 ? "s" : ""} waiting${highPriority.length > 0 ? ` — ${highPriority.length} high priority` : ""}.`
                : "No open tickets right now. Stay ready for the next wave."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/tickets">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 shadow-[0_0_20px_rgba(6,182,212,0.35)] gap-1.5">
                  <TicketIcon size={14} /> Open Ticket Queue
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="sm" variant="outline" className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 gap-1.5">
                  <MessageSquare size={14} /> Mentor Chat
                </Button>
              </Link>
            </div>
          </div>
          {/* Stats ring for resolved */}
          <div className="hidden md:flex items-center gap-8 shrink-0">
            {[
              { label: "Open",     value: openTickets.length,     color: "text-rose-400" },
              { label: "Claimed",  value: claimedTickets.length,  color: "text-amber-400" },
              { label: "Resolved", value: resolvedTickets.length, color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-4xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row (mobile) ── */}
      <div className="grid grid-cols-3 gap-4 md:hidden">
        {[
          { label: "Open",     value: openTickets.length,     color: "from-rose-500/10 border-rose-500/20 text-rose-400" },
          { label: "Claimed",  value: claimedTickets.length,  color: "from-amber-500/10 border-amber-500/20 text-amber-400" },
          { label: "Resolved", value: resolvedTickets.length, color: "from-emerald-500/10 border-emerald-500/20 text-emerald-400" },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-2xl border bg-gradient-to-br p-4 text-center ${s.color}`}>
            <div className="text-3xl font-black font-mono">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── High Priority Alert ── */}
      {highPriority.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/8 px-5 py-4 flex items-center gap-4"
        >
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm text-rose-400">{highPriority.length} high-priority ticket{highPriority.length > 1 ? "s" : ""} need immediate attention</p>
            <p className="text-xs text-muted-foreground mt-0.5">These participants are blocked — claim and resolve ASAP.</p>
          </div>
          <Link href="/tickets">
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 shrink-0 gap-1.5">
              <ArrowRight size={13} /> Respond Now
            </Button>
          </Link>
        </motion.div>
      )}

      {/* ── Ticket Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <TicketIcon size={15} className="text-cyan-400" /> Recent Tickets
              {openTickets.length > 0 && (
                <Badge variant="outline" className="ml-1 border-rose-500/30 text-rose-400 text-[10px]">{openTickets.length} open</Badge>
              )}
            </h3>
            <Link href="/tickets">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                View all <ArrowRight size={11} />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="p-4"><SkeletonList count={5} /></div>
          ) : ticketList.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {ticketList.slice(0, 7).map((t: any, i: number) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.025] transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[t.status] || "bg-zinc-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[t.priority] || "bg-zinc-500"}`} />
                      <span className="text-[11px] text-muted-foreground capitalize">{t.priority} priority</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px] border-white/10 bg-white/5 shrink-0">
                    {t.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400 opacity-30" />
              <p className="font-semibold">All clear — no tickets in the queue!</p>
              <p className="text-sm text-muted-foreground">Great work. Check back during active hackathons.</p>
            </div>
          )}
        </div>

        {/* Mentor Tips */}
        <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Star size={15} className="text-cyan-400" /> Mentor Tips
          </h3>
          <div className="space-y-3">
            {[
              { tip: "Claim tickets within 5 min of opening to build trust with participants.", icon: Zap, color: "text-amber-400 bg-amber-500/10" },
              { tip: "Link to docs or code snippets — don't just describe solutions abstractly.", icon: Code2, color: "text-cyan-400 bg-cyan-500/10" },
              { tip: "Mark tickets resolved only after confirming the participant is unblocked.", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10" },
              { tip: "Use the chat rooms to proactively share tips before tickets are opened.", icon: MessageSquare, color: "text-primary bg-primary/10" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
                  <item.icon size={13} className="text-current" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-white/[0.06]">
            <Link href="/chat">
              <Button size="sm" variant="outline" className="w-full border-white/10 hover:border-cyan-500/30 gap-1.5 text-xs">
                <MessageSquare size={12} /> Open Mentor Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── JURY ────────────────────────────────────────────────────────────────────
function JuryDashboard() {
  const { user } = useAuthStore();
  const { data: judgingHacks, isLoading } = useListHackathons({ status: "judging", limit: 6 });
  const { data: allHacks } = useListHackathons({ limit: 20 });
  const judging = judgingHacks?.data || [];
  const completed = (allHacks?.data || []).filter(h => h.status === "completed");

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-600/8 via-orange-600/4 to-transparent p-7"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/8 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Gavel size={18} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Jury Evaluation Panel</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-1.5">
              Welcome, <span className="text-amber-400">{user?.name?.split(" ")[0] || "Judge"}</span> — your verdict awaits.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {judging.length > 0
                ? `${judging.length} hackathon${judging.length > 1 ? "s" : ""} awaiting your evaluation. Your scores shape the winner.`
                : "No events in judging phase right now. Check back when submissions close."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/jury">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.35)] gap-1.5">
                  <Gavel size={14} /> Open Evaluation Panel
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="sm" variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 gap-1.5">
                  <Trophy size={14} /> Leaderboard
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 shrink-0">
            {[
              { label: "In Judging", value: judging.length, color: "text-amber-400" },
              { label: "Completed",  value: completed.length, color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-4xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Scoring Tips ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Star,       color: "text-amber-400 bg-amber-500/10 border-amber-500/20",   title: "Be Objective",       desc: "Focus on the criteria rubric, not personal taste or presentation style alone." },
          { icon: Award,      color: "text-primary bg-primary/10 border-primary/20",         title: "Score All Criteria", desc: "Fill every criterion for each project — partial scores are unfair to all teams." },
          { icon: CheckCircle2,color:"text-emerald-400 bg-emerald-500/10 border-emerald-500/20", title: "Finalize Promptly",desc: "Submitted evaluations are final. Review carefully before submitting." },
        ].map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass-card rounded-2xl border p-5 flex gap-4 ${tip.color}`}
          >
            <div className="w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center shrink-0 mt-0.5">
              <tip.icon size={18} className="text-current" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Hackathons in Judging ── */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Gavel size={15} className="text-amber-400" /> Awaiting Evaluation
            {judging.length > 0 && (
              <Badge variant="outline" className="ml-1 border-amber-500/30 text-amber-400 text-[10px]">{judging.length}</Badge>
            )}
          </h3>
          <Link href="/jury">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              Open panel <ArrowRight size={11} />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="p-4"><SkeletonList count={4} /></div>
        ) : judging.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {judging.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.025] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Gavel size={16} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{h.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{h.participantCount ?? 0} participants</span>
                    {h.prizePool && <span className="text-[11px] text-amber-400">{h.prizePool} prize</span>}
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/8 text-[10px] shrink-0">
                  Judging
                </Badge>
                <Link href={`/jury/${h.id}`}>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 shrink-0 gap-1.5">
                    <Gavel size={13} /> Evaluate
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <Clock size={40} className="mx-auto opacity-10" />
            <p className="font-semibold">No events in judging phase</p>
            <p className="text-sm text-muted-foreground">You'll be notified when projects are ready for evaluation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  
  const getDashboardContent = () => {
    switch (user?.role) {
      case "admin": return <AdminDashboard />;
      case "participant": return <ParticipantDashboard />;
      case "organizer": return <OrganizerDashboard />;
      case "mentor": return <MentorDashboard />;
      case "jury": return <JuryDashboard />;
      default: return (
        <div className="p-8 text-center text-muted-foreground glass-card rounded-2xl border border-white/10">
          <AlertCircle size={40} className="mx-auto mb-4 opacity-30" />
          <p>Dashboard not configured for role: {user?.role}</p>
        </div>
      );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        {getDashboardContent()}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
