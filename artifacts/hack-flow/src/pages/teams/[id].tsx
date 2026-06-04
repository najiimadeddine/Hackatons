import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useGetTeam } from "@workspace/api-client-react";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Code2, Calendar, Crown, ArrowLeft, Sparkles, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  leader:    "bg-amber-500/15 text-amber-400 border-amber-500/25",
  member:    "bg-primary/15 text-primary border-primary/25",
  default:   "bg-white/5 text-muted-foreground border-white/10",
};

export default function TeamDetailPage() {
  const { id } = useParams();
  const teamId = parseInt(id || "0", 10);

  const { data: team, isLoading } = useGetTeam(teamId, {
    query: { enabled: !!teamId } as any,
  });

  return (
    <ProtectedRoute allowedRoles={["participant", "organizer", "admin"]}>
      <DashboardLayout title={team?.name || "Team"}>
        {isLoading ? (
          <div className="space-y-6">
            <SkeletonLoader className="h-52 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonLoader className="h-64 rounded-2xl" />
              <SkeletonLoader className="h-64 rounded-2xl" />
            </div>
          </div>
        ) : !team ? (
          <div className="p-16 text-center glass-card rounded-2xl border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-muted-foreground opacity-40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
            <p className="text-muted-foreground text-sm mb-6">This team may have been removed or you don't have access.</p>
            <Link href="/teams">
              <Button variant="outline" className="gap-1.5 border-white/10">
                <ArrowLeft size={14} /> Back to Teams
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Hero ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/8 via-cyan-600/4 to-transparent p-8"
            >
              <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/8 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/6 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-[0_0_30px_rgba(65,130,255,0.15)] shrink-0">
                  <AvatarImage src={team.avatarUrl || undefined} />
                  <AvatarFallback className="text-3xl bg-primary/20 text-primary font-black">
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Team Profile</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 truncate">{team.name}</h1>
                  {team.description && (
                    <p className="text-muted-foreground text-sm max-w-2xl mb-4 leading-relaxed">{team.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Created {format(new Date(team.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-primary" />
                      <span className="text-primary font-semibold">{team.members?.length || 0}</span> members
                    </div>
                    {(team.lookingForRoles?.length || 0) > 0 && (
                      <div className="flex items-center gap-1.5">
                        <UserPlus size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Recruiting</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live stats */}
                <div className="flex items-center gap-8 shrink-0">
                  {[
                    { value: team.members?.length || 0,          label: "Members",    color: "text-foreground" },
                    { value: team.lookingForRoles?.length || 0,  label: "Open roles", color: "text-emerald-400" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Members + Looking For ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Members */}
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-2">
                  <Users size={15} className="text-primary" />
                  <h2 className="font-bold">Team Members</h2>
                  <Badge variant="outline" className="ml-1 border-white/10 text-muted-foreground text-[10px]">
                    {team.members?.length || 0}
                  </Badge>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {team.members?.map((member, i) => {
                    const isLeader = team.leaderId === member.userId;
                    return (
                      <motion.div
                        key={member.userId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="w-10 h-10 border border-white/10">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback className={cn(
                              "text-sm font-bold",
                              isLeader ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"
                            )}>
                              {member.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isLeader && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                              <Crown size={9} className="text-black" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{member.name}</div>
                          <div className="text-[11px] text-muted-foreground capitalize">{member.role}</div>
                        </div>
                        {isLeader && (
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${ROLE_COLORS.leader}`}>
                            <Crown size={9} className="mr-1" /> Leader
                          </Badge>
                        )}
                      </motion.div>
                    );
                  })}
                  {(!team.members || team.members.length === 0) && (
                    <div className="py-12 text-center text-muted-foreground text-sm">No members yet.</div>
                  )}
                </div>
              </div>

              {/* Looking For */}
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-2">
                  <Code2 size={15} className="text-emerald-400" />
                  <h2 className="font-bold">Open Roles</h2>
                  {(team.lookingForRoles?.length || 0) > 0 && (
                    <Badge variant="outline" className="ml-1 border-emerald-500/30 text-emerald-400 text-[10px]">
                      {team.lookingForRoles?.length} open
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  {team.lookingForRoles && team.lookingForRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {team.lookingForRoles.map((role, i) => (
                        <motion.div
                          key={role}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <Badge
                            variant="outline"
                            className="px-3 py-2 border-emerald-500/25 text-emerald-400 bg-emerald-500/8 text-sm font-medium hover:bg-emerald-500/15 transition-colors cursor-default"
                          >
                            <UserPlus size={12} className="mr-1.5" />
                            {role}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto">
                        <Users size={20} className="text-muted-foreground opacity-40" />
                      </div>
                      <p className="text-sm text-muted-foreground">Team is not actively recruiting.</p>
                      <p className="text-xs text-muted-foreground/60">The team has all the roles it needs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
