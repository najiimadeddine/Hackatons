import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useGetAuditLogs } from "@workspace/api-client-react";
import { format } from "date-fns";
import { SkeletonList } from "@/components/shared/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Terminal, Shield, User, Globe } from "lucide-react";

export default function AdminAuditLogsPage() {
  const { data, isLoading } = useGetAuditLogs();
  const logs = data?.data || [];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Audit Logs">
        <div className="space-y-6">

        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/8 via-cyan-600/4 to-transparent p-6">
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Terminal size={18} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Shield size={12} className="text-primary/70" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin</span>
              </div>
              <h2 className="text-xl font-black">System Events Stream</h2>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono font-semibold">Live</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.07]">
          <div className="p-4 border-b border-white/[0.07] bg-black/20 flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Event Log</span>
            {logs.length > 0 && (
              <span className="ml-auto text-[10px] bg-white/[0.06] px-2 py-0.5 rounded font-mono text-muted-foreground">{logs.length} events</span>
            )}
          </div>
          
          <div className="p-0">
            {isLoading ? (
              <div className="p-6"><SkeletonList count={8} /></div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No audit logs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Timestamp</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Details</th>
                      <th className="px-6 py-4 font-semibold">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary uppercase">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-foreground">
                            <User size={14} className="text-muted-foreground" />
                            {log.userName} <span className="text-muted-foreground">#{log.userId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                            {log.details || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe size={14} />
                            {log.ipAddress || "Unknown"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
