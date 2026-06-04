import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Users, MessageSquare, CheckCircle2, Star,
  Bell, ArrowRight, LogIn, Shield, UserPlus, GitBranch,
  AlertCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetAuditLogs, useListHackathons, useListTickets } from "@workspace/api-client-react";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  href?: string;
}

const ACTION_META: Record<string, { icon: React.ElementType; iconColor: string; label: string }> = {
  USER_LOGIN:         { icon: LogIn,          iconColor: "text-blue-400 bg-blue-500/15",    label: "User login" },
  USER_REGISTER:      { icon: UserPlus,       iconColor: "text-emerald-400 bg-emerald-500/15", label: "New user registered" },
  USER_UPDATED:       { icon: Users,          iconColor: "text-cyan-400 bg-cyan-500/15",    label: "User updated" },
  HACKATHON_CREATED:  { icon: Trophy,         iconColor: "text-amber-400 bg-amber-500/15",  label: "Hackathon created" },
  HACKATHON_UPDATED:  { icon: Trophy,         iconColor: "text-amber-400 bg-amber-500/15",  label: "Hackathon updated" },
  TEAM_CREATED:       { icon: Users,          iconColor: "text-violet-400 bg-violet-500/15",label: "Team formed" },
  TEAM_JOINED:        { icon: Users,          iconColor: "text-violet-400 bg-violet-500/15",label: "Joined team" },
  PROJECT_SUBMITTED:  { icon: CheckCircle2,   iconColor: "text-primary bg-primary/15",      label: "Project submitted" },
  TICKET_CREATED:     { icon: MessageSquare,  iconColor: "text-cyan-400 bg-cyan-500/15",    label: "Ticket opened" },
  TICKET_RESOLVED:    { icon: CheckCircle2,   iconColor: "text-emerald-400 bg-emerald-500/15", label: "Ticket resolved" },
  SETTINGS_UPDATED:   { icon: Shield,         iconColor: "text-rose-400 bg-rose-500/15",    label: "Settings updated" },
  DEFAULT:            { icon: Star,           iconColor: "text-muted-foreground bg-white/5",label: "Event" },
};

function actionMeta(action: string) {
  return ACTION_META[action] ?? ACTION_META.DEFAULT;
}

function relTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "recently";
  }
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.icon;
  return (
    <div className={cn(
      "px-5 py-3.5 flex items-start gap-3 group cursor-pointer transition-colors hover:bg-white/[0.03]"
    )}>
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", item.iconColor)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground/90 leading-tight">{item.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">{item.time}</span>
        <ArrowRight size={11} className="text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="px-5 py-10 text-center">
      <Clock size={28} className="mx-auto mb-3 opacity-15" />
      <p className="text-xs text-muted-foreground/50">No recent activity yet.</p>
    </div>
  );
}

export function ActivityFeed() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === "admin";

  /* ── Admin: real audit logs ── */
  const { data: auditData } = useGetAuditLogs({ limit: 8 }, {
    query: { enabled: isAdmin } as any,
  });

  /* ── Non-admin: hackathons + tickets ── */
  const { data: hackathonsData } = useListHackathons({ limit: 5 }, {
    query: { enabled: !isAdmin } as any,
  });
  const { data: ticketsData } = useListTickets(undefined, {
    query: { enabled: !isAdmin } as any,
  });

  let items: ActivityItem[] = [];

  if (isAdmin && auditData) {
    const logs = (auditData as any).data ?? [];
    items = logs.slice(0, 7).map((l: any) => {
      const meta = actionMeta(l.action);
      return {
        id: String(l.id),
        icon: meta.icon,
        iconColor: meta.iconColor,
        title: meta.label,
        description: l.userName
          ? `${l.userName}${l.details ? ` — ${typeof l.details === "string" ? l.details : JSON.stringify(l.details).slice(0, 60)}` : ""}`
          : (l.action ?? "Platform event"),
        time: relTime(l.createdAt),
        href: l.action?.includes("HACKATHON") ? "/hackathons"
            : l.action?.includes("TEAM")       ? "/teams"
            : l.action?.includes("TICKET")     ? "/tickets"
            : l.action?.includes("USER")       ? "/admin"
            : undefined,
      } satisfies ActivityItem;
    });
  } else {
    const hackathons = (hackathonsData as any)?.data ?? [];
    const tickets = (ticketsData as any) ?? [];

    const hackItems: ActivityItem[] = hackathons.slice(0, 4).map((h: any) => ({
      id: `h-${h.id}`,
      icon: Trophy,
      iconColor: "text-amber-400 bg-amber-500/15",
      title: h.status === "open" ? "Hackathon accepting registrations" : `Hackathon ${h.status}`,
      description: h.title,
      time: relTime(h.startDate ?? h.createdAt ?? new Date().toISOString()),
      href: `/hackathons/${h.id}`,
    }));

    const ticketItems: ActivityItem[] = (tickets as any[]).slice(0, 3).map((t: any) => ({
      id: `t-${t.id}`,
      icon: t.status === "resolved" ? CheckCircle2 : MessageSquare,
      iconColor: t.status === "resolved"
        ? "text-emerald-400 bg-emerald-500/15"
        : "text-cyan-400 bg-cyan-500/15",
      title: t.status === "resolved" ? "Support ticket resolved" : "Open support ticket",
      description: t.title,
      time: relTime(t.createdAt),
      href: "/tickets",
    }));

    items = [...hackItems, ...ticketItems]
      .sort((a, b) => 0)
      .slice(0, 7);
  }

  return (
    <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-primary" />
          <span className="font-bold text-sm">Recent Activity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {items.length === 0 ? (
          <EmptyFeed />
        ) : (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {item.href ? (
                <Link href={item.href}>
                  <ActivityRow item={item} />
                </Link>
              ) : (
                <ActivityRow item={item} />
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className="px-5 py-3.5 border-t border-white/[0.07]">
        <Link href={isAdmin ? "/admin" : "/hackathons"}>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary justify-center gap-1.5 h-8">
            View all activity <ArrowRight size={12} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
