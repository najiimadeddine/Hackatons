import { useState } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useListUsers, useToggleUserStatus } from "@workspace/api-client-react";
import { SkeletonList } from "@/components/shared/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users, Search, Filter, Shield, CheckCircle2, AlertTriangle,
  UserX, UserCheck, Mail, Calendar, Loader2, Github, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  admin:       "bg-rose-500/15 text-rose-400 border-rose-500/25",
  organizer:   "bg-blue-500/15 text-blue-400 border-blue-500/25",
  participant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  mentor:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  jury:        "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

const ROLE_ICONS: Record<string, React.FC<any>> = {
  admin: Shield,
  organizer: CheckCircle2,
  participant: Users,
  mentor: UserCheck,
  jury: Filter,
};

function UserRow({ user, onToggle, isToggling }: { user: any; onToggle: (id: number) => void; isToggling: boolean }) {
  const RoleIcon = ROLE_ICONS[user.role] || Users;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
    >
      {/* User */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {user.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail size={11} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <Badge variant="outline" className={cn("capitalize text-xs gap-1.5", ROLE_COLORS[user.role] || "")}>
          <RoleIcon size={10} />
          {user.role}
        </Badge>
      </td>

      {/* Skills */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(user.skills || []).slice(0, 3).map((s: string) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground">
              {s}
            </span>
          ))}
          {(user.skills?.length || 0) > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground">
              +{user.skills.length - 3}
            </span>
          )}
          {(!user.skills || user.skills.length === 0) && (
            <span className="text-xs text-muted-foreground/50 italic">No skills listed</span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          {user.isActive ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Active</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-xs text-rose-400 font-medium">Suspended</span>
            </>
          )}
        </div>
      </td>

      {/* Joined */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar size={12} />
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {user.githubUrl && (
            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Github size={13} />
              </Button>
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 text-xs px-2.5",
              user.isActive
                ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            )}
            onClick={() => onToggle(user.id)}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 size={12} className="animate-spin" />
            ) : user.isActive ? (
              <><UserX size={12} className="mr-1.5" />Suspend</>
            ) : (
              <><UserCheck size={12} className="mr-1.5" />Activate</>
            )}
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useListUsers({ limit: 100 });
  const toggleStatus = useToggleUserStatus();
  const qc = useQueryClient();

  const users: any[] = (data as unknown as any)?.data || [];

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "suspended" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const handleToggle = async (userId: number) => {
    setTogglingId(userId);
    try {
      await toggleStatus.mutateAsync({ id: userId });
      toast.success("User status updated");
      refetch();
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = users.filter(u => u.isActive).length;
  const suspendedCount = users.filter(u => !u.isActive).length;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="User Management">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-rose-500/20 bg-gradient-to-br from-rose-500/7 via-primary/4 to-transparent p-7 mb-6"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/8 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/6 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={15} className="text-rose-400" />
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Admin Control</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                User <span className="gradient-text">Management</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                {users.length > 0
                  ? `${users.length} registered users — ${activeCount} active, ${suspendedCount > 0 ? `${suspendedCount} suspended` : "none suspended"}.`
                  : "No users registered yet."}
              </p>
            </div>
            <div className="flex items-center gap-8 shrink-0">
              {[
                { value: users.length,    label: "Total",     color: "text-foreground" },
                { value: activeCount,     label: "Active",    color: "text-emerald-400" },
                { value: suspendedCount,  label: "Suspended", color: "text-rose-400" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users", value: users.length, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { label: "Active", value: activeCount, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Suspended", value: suspendedCount, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
            { label: "Filtered", value: filtered.length, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-2xl border p-4 text-center ${stat.bg}`}
            >
              <div className={`text-3xl font-black font-mono mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 bg-black/20 border-white/10 h-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[160px] bg-black/20 border-white/10 h-10">
              <Shield size={14} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="organizer">Organizer</SelectItem>
              <SelectItem value="participant">Participant</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="jury">Jury</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px] bg-black/20 border-white/10 h-10">
              <Filter size={14} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h3 className="font-bold">All Users</h3>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground text-[10px]">
                {filtered.length}
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6"><SkeletonList count={8} /></div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={40} className="mx-auto mb-3 opacity-10" />
              <p className="text-muted-foreground">No users match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-black/20">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skills</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onToggle={handleToggle}
                      isToggling={togglingId === user.id}
                    />
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
