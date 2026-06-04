import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useGetPlatformAnalytics, useListHackathons, useListUsers } from "@workspace/api-client-react";
import { StatCard } from "@/components/shared/StatCard";
import { SkeletonCard, SkeletonList } from "@/components/shared/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Users, Trophy, Code2, Activity, ShieldAlert, Terminal,
  ArrowRight, TrendingUp, UserCheck, Globe, Zap, BarChart3,
  AlertTriangle, CheckCircle2, Clock
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  organizer: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  participant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  mentor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  jury: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  active: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  judging: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  completed: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

export default function AdminOverviewPage() {
  const { data: analytics, isLoading: analyticsLoading } = useGetPlatformAnalytics();
  const { data: hackathonsData, isLoading: hackLoading } = useListHackathons({ limit: 5 });
  const { data: usersData, isLoading: usersLoading } = useListUsers({ limit: 5 });

  const hackathons = hackathonsData?.data || [];
  const users = (usersData as unknown as any)?.data || [];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Platform Administration">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-rose-500/25 bg-gradient-to-br from-rose-600/10 via-primary/4 to-transparent p-7 mb-8"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/6 rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={16} className="text-rose-400" />
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Admin Control Center</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">Platform Overview</h2>
              <p className="text-muted-foreground text-sm max-w-lg">
                Full visibility and control over all users, hackathons, and platform activity.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/admin/users">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                  <Users size={14} className="mr-1.5" /> Manage Users
                </Button>
              </Link>
              <Link href="/admin/audit-logs">
                <Button size="sm" variant="outline" className="border-white/10 hover:border-white/25">
                  <Terminal size={14} className="mr-1.5" /> Audit Logs
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {analyticsLoading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={analytics?.totalUsers || 0}
                icon={Users}
                neonColor="blue"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Active Hackathons"
                value={analytics?.activeHackathons || 0}
                icon={Activity}
                neonColor="green"
                trend={{ value: 5, isPositive: true }}
              />
              <StatCard
                title="Total Projects"
                value={analytics?.totalProjects || 0}
                icon={Code2}
                neonColor="cyan"
                trend={{ value: 18, isPositive: true }}
              />
              <StatCard
                title="All Events"
                value={analytics?.totalHackathons || 0}
                icon={Trophy}
                neonColor="amber"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Users by Role */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Users size={16} className="text-primary" /> Users by Role
              </h3>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  View all <ArrowRight size={11} className="ml-1" />
                </Button>
              </Link>
            </div>
            {analyticsLoading ? <SkeletonList count={5} /> : (
              <div className="space-y-3">
                {(analytics?.usersByRole || []).map((role: any, i: number) => {
                  const pct = analytics?.totalUsers ? (role.count / analytics.totalUsers) * 100 : 0;
                  const colors = ["bg-primary", "bg-cyan-400", "bg-emerald-400", "bg-amber-400", "bg-purple-400"];
                  return (
                    <div key={role.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                          <span className="capitalize font-medium">{role.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">{pct.toFixed(0)}%</span>
                          <span className="font-bold text-xs w-6 text-right">{role.count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className={`h-full rounded-full ${colors[i % colors.length]}/60`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Hackathons */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" /> Recent Hackathons
              </h3>
              <Link href="/hackathons">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  View all <ArrowRight size={11} className="ml-1" />
                </Button>
              </Link>
            </div>
            {hackLoading ? <SkeletonList count={4} /> : (
              <div className="space-y-2">
                {hackathons.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Trophy size={14} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{h.title}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${STATUS_COLORS[h.status] || ""}`}>
                      {h.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Zap size={16} className="text-primary" /> Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { href: "/admin/users", label: "User Management", icon: Users, color: "text-primary hover:border-primary/30" },
                { href: "/admin/audit-logs", label: "Audit Logs", icon: Terminal, color: "text-amber-400 hover:border-amber-500/30" },
                { href: "/hackathons", label: "All Hackathons", icon: Trophy, color: "text-emerald-400 hover:border-emerald-500/30" },
                { href: "/chat", label: "Platform Chat", icon: Activity, color: "text-cyan-400 hover:border-cyan-500/30" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <Button variant="outline" className={`w-full justify-between border-white/10 h-11 ${item.color}`}>
                    <span className="flex items-center gap-2">
                      <item.icon size={15} />
                      {item.label}
                    </span>
                    <ArrowRight size={13} className="text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <UserCheck size={16} className="text-primary" /> Recent Users
            </h3>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Manage all <ArrowRight size={11} className="ml-1" />
              </Button>
            </Link>
          </div>
          {usersLoading ? (
            <div className="p-5"><SkeletonList count={5} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-muted-foreground uppercase">
                    <th className="px-5 py-3 text-left font-semibold">User</th>
                    <th className="px-5 py-3 text-left font-semibold">Role</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.slice(0, 5).map((u: any) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {u.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className={`capitalize text-[10px] ${ROLE_COLORS[u.role] || ""}`}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {u.isActive ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400" />
                              <span className="text-xs text-emerald-400">Active</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={13} className="text-rose-400" />
                              <span className="text-xs text-rose-400">Suspended</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
