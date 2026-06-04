import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Trophy, Users, MessageSquare, Ticket, LogOut,
  Menu, X, Activity, ShieldAlert, Gavel,
  Settings, Code2, ChevronRight, Bell, CheckCircle2,
  Clock, Sparkles, Search, Zap, ArrowUpRight, Bot, BarChart3
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/dashboard",            roles: ["participant","organizer","mentor","jury","admin"], group: "main" },
  { icon: Trophy,          label: "Hackathons",     href: "/hackathons",           roles: ["participant","organizer","mentor","jury","admin"], group: "main" },
  { icon: Users,           label: "Teams",          href: "/teams",                roles: ["participant"], group: "main" },
  { icon: Code2,           label: "Projects",       href: "/projects",             roles: ["participant"], group: "main" },
  { icon: Activity,        label: "My Hackathons",  href: "/organizer/hackathons", roles: ["organizer"], group: "manage" },
  { icon: Gavel,           label: "Evaluations",    href: "/jury",                 roles: ["jury"], group: "manage" },
  { icon: MessageSquare,   label: "Chat",           href: "/chat",                 roles: ["participant","organizer","mentor","jury","admin"], group: "tools" },
  { icon: Ticket,          label: "Tickets",        href: "/tickets",              roles: ["participant","mentor","organizer"], group: "tools" },
  { icon: BarChart3,       label: "Leaderboard",    href: "/leaderboard",          roles: ["participant","organizer","mentor","jury","admin"], group: "tools" },
  { icon: Bot,             label: "AI Assistant",   href: "/ai",                   roles: ["participant","organizer","mentor","jury","admin"], group: "tools", highlight: true },
  { icon: ShieldAlert,     label: "Admin Panel",    href: "/admin",                roles: ["admin"], group: "admin" },
];

const ROLE_CONFIG: Record<string, { color: string; badge: string; dot: string; glow: string }> = {
  admin:       { color: "text-rose-400",    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",    dot: "bg-rose-400",    glow: "shadow-[0_0_8px_rgba(251,113,133,0.4)]" },
  organizer:   { color: "text-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",    dot: "bg-blue-400",    glow: "shadow-[0_0_8px_rgba(65,130,255,0.4)]" },
  participant: { color: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]" },
  mentor:      { color: "text-cyan-400",    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",    dot: "bg-cyan-400",    glow: "shadow-[0_0_8px_rgba(6,182,212,0.4)]" },
  jury:        { color: "text-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400",   glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]" },
};

const DEMO_NOTIFICATIONS = [
  { id: 1, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10", title: "Team invitation accepted", body: "Alex joined your team AlphaBuilders", time: "2m ago", read: false },
  { id: 2, icon: Sparkles,     color: "text-blue-400 bg-blue-500/10",       title: "New hackathon open",       body: "AI Innovation Challenge is now accepting registrations", time: "1h ago",  read: false },
  { id: 3, icon: Clock,        color: "text-amber-400 bg-amber-500/10",     title: "Deadline approaching",     body: "FinTech Hackathon closes in 48 hours", time: "3h ago",  read: true },
  { id: 4, icon: MessageSquare,color: "text-cyan-400 bg-cyan-500/10",       title: "New message in #general",  body: "Sarah: Great work everyone!", time: "5h ago",  read: true },
  { id: 5, icon: Trophy,       color: "text-amber-400 bg-amber-500/10",     title: "Leaderboard updated",      body: "Your project moved to rank #2", time: "1d ago",  read: true },
];

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200",
          open
            ? "bg-blue-500/15 border-blue-500/30 shadow-[0_0_12px_rgba(65,130,255,0.25)]"
            : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12]"
        )}
      >
        <Bell size={15} className={open ? "text-blue-400" : "text-muted-foreground"} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-blue-500 text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(65,130,255,0.8)] border border-background">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-11 w-[340px] glass-premium border border-white/[0.09] rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.65)] z-50 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

            <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell size={13} className="text-blue-400" />
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-blue-500/25 text-blue-400 bg-blue-500/8 font-bold">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className="text-[11px] text-muted-foreground hover:text-blue-400 transition-colors font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.map(n => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className={cn(
                      "px-4 py-3 flex gap-3 cursor-pointer transition-all border-b border-white/[0.04] last:border-0",
                      n.read ? "opacity-60 hover:opacity-80 hover:bg-white/[0.02]" : "bg-white/[0.035] hover:bg-white/[0.06]"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5", n.color)}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={cn("text-[12px] font-semibold truncate", n.read ? "text-foreground/50" : "text-foreground")}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground/40 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 line-clamp-1">{n.body}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0 shadow-[0_0_5px_rgba(65,130,255,0.9)]" />}
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-white/[0.06]">
              <button className="w-full text-[11px] text-muted-foreground hover:text-blue-400 transition-colors flex items-center justify-center gap-1 font-medium">
                View all notifications <ArrowUpRight size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardLayout({ children, title, headerRight }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, clearAuth } = useAuthStore();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || "participant";
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.participant;

  const handleLogout = async () => {
    try { await logout.mutateAsync(); } catch {}
    clearAuth();
    setLocation("/");
    toast.success("Signed out successfully");
  };

  const navItems = NAV_ITEMS.filter(item => user && item.roles.includes(role));

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const GROUP_LABELS: Record<string, string> = {
    main: "Main",
    manage: "Manage",
    tools: "Tools",
    admin: "Admin",
  };

  const SidebarContent = () => (
    <>
      {/* ── LOGO ── */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-white/[0.04] relative">
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="relative w-9 h-9 shrink-0">
          <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-md" />
          <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500/30 to-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(65,130,255,0.25)]">
            <Zap size={16} className="text-blue-400" strokeWidth={2.5} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-black tracking-tight text-[15px] leading-none">
            Hack<span className="gradient-text">Flow</span>
          </div>
          <div className="text-[9px] text-muted-foreground/40 tracking-[0.18em] uppercase mt-0.5 font-medium">
            Enterprise Platform
          </div>
        </div>
        {/* Version dot */}
        <div className="ml-auto shrink-0 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
        </div>
      </div>

      {/* ── NAV ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">

        {/* Search bar */}
        <div className="px-1 mb-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.09] hover:bg-white/[0.05] transition-all cursor-pointer group">
            <Search size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
            <span className="text-[12px] text-muted-foreground/35 group-hover:text-muted-foreground/55 transition-colors flex-1">Quick search...</span>
            <kbd className="text-[9px] text-muted-foreground/25 bg-white/[0.03] px-1.5 py-0.5 rounded font-mono border border-white/[0.04]">⌘K</kbd>
          </div>
        </div>

        {/* Grouped nav items */}
        {Object.entries(groupedNav).map(([group, items]) => (
          <div key={group} className="mb-1">
            {Object.keys(groupedNav).length > 1 && (
              <div className="px-3 pb-1 pt-1">
                <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/25 font-bold">
                  {GROUP_LABELS[group] || group}
                </span>
              </div>
            )}
            {items.map((item) => {
              const active = location === item.href || location.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group cursor-pointer relative",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground/70 hover:bg-white/[0.04] hover:text-foreground/90"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-blue-500/[0.1] border border-blue-500/[0.15]"
                        style={{ boxShadow: "0 0 15px rgba(65,130,255,0.06)" }}
                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                      />
                    )}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full shadow-[2px_0_8px_rgba(65,130,255,0.5)]" />
                    )}
                    <item.icon
                      size={14}
                      className={cn(
                        "relative z-10 shrink-0 transition-colors",
                        active ? "text-blue-400" : "group-hover:text-foreground/60"
                      )}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span className="relative z-10 flex-1 truncate">{item.label}</span>
                    {(item as any).highlight && !active && (
                      <span className="relative z-10 text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-bold">AI</span>
                    )}
                    {active && (
                      <ChevronRight size={10} className="text-blue-400/50 relative z-10 shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── USER PANEL ── */}
      <div className="p-2.5 border-t border-white/[0.04] space-y-1">
        {/* Top border beam */}
        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />

        <Link href="/profile" onClick={() => setMobileOpen(false)}>
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group relative overflow-hidden",
            location === "/profile"
              ? "bg-white/[0.05] border border-white/[0.07]"
              : "hover:bg-white/[0.04] hover:border hover:border-white/[0.04]"
          )}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 border border-white/[0.09]">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-blue-500/15 text-blue-400 text-xs font-bold">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background", roleConf.dot, roleConf.glow)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate leading-none mb-1.5 text-foreground/90">{user?.name}</p>
              <Badge
                variant="outline"
                className={cn("text-[10px] h-4 px-1.5 capitalize leading-none border font-medium", roleConf.badge)}
              >
                {user?.role}
              </Badge>
            </div>
            <Settings size={12} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0 group-hover:rotate-45 duration-300" />
          </div>
        </Link>

        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all group"
          onClick={handleLogout}
        >
          <LogOut size={13} className="group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full overflow-hidden">

      {/* ── IMMERSIVE BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, rgba(3,5,16,0.97) 0%, rgba(3,5,16,0.92) 50%, rgba(3,5,16,0.96) 100%)"
        }} />
        {/* Animated aurora blobs */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-blue-600/12 rounded-full blur-[140px] animate-[aurora-1_25s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] animate-[aurora-2_30s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[120px] animate-[aurora-3_20s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-circuit-pattern opacity-60" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.018]" />
      </div>

      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.05] z-50 relative"
        style={{ background: "rgba(3,5,16,0.85)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/25 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(65,130,255,0.2)]">
            <Zap size={15} className="text-blue-400" strokeWidth={2.5} />
          </div>
          <span className="font-black tracking-tight text-[15px]">
            Hack<span className="gradient-text">Flow</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-[12px] text-muted-foreground font-medium truncate max-w-[120px]">{title}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/[0.06] rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col w-[220px] h-[100dvh] sticky top-0 border-r border-white/[0.045] z-40 shrink-0 relative"
        style={{ background: "rgba(3,5,16,0.75)", backdropFilter: "blur(40px) saturate(200%)" }}
      >
        {/* Sidebar inner glow top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -230 }}
              animate={{ x: 0 }}
              exit={{ x: -230 }}
              transition={{ type: "spring", bounce: 0.08, duration: 0.32 }}
              className="fixed top-0 left-0 bottom-0 w-[220px] flex flex-col border-r border-white/[0.07] z-50 md:hidden"
              style={{ background: "rgba(3,5,16,0.98)", backdropFilter: "blur(40px)" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto h-[100dvh] relative z-10 flex flex-col min-w-0">

        {/* Top bar */}
        <div
          className="sticky top-0 z-30 border-b border-white/[0.045] px-5 md:px-7 py-3 flex items-center justify-between gap-4 shrink-0"
          style={{ background: "rgba(3,5,16,0.8)", backdropFilter: "blur(28px)" }}
        >
          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent pointer-events-none" />

          {/* Left: title */}
          <div className="flex items-center gap-3 min-w-0">
            {title ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn("w-1 h-5 rounded-full shrink-0 shadow-lg", roleConf.dot, roleConf.glow)} />
                <h1 className="text-[15px] font-bold tracking-tight truncate text-foreground/90">{title}</h1>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={cn("w-1 h-4 rounded-full", roleConf.dot)} />
                <span className="text-[13px] text-muted-foreground/60 font-medium capitalize">{role} workspace</span>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
            <NotificationsBell />
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
