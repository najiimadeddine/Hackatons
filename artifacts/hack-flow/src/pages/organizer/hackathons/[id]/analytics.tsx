import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useGetHackathonAnalytics, useGetLeaderboard } from "@workspace/api-client-react";
import { StatCard } from "@/components/shared/StatCard";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { LeaderboardPodium } from "@/components/shared/LeaderboardPodium";
import { PresentationMode } from "@/components/shared/PresentationMode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Code2, CheckCircle2, ArrowLeft, Presentation, BarChart3, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function AnalyticsPage() {
  const { id } = useParams();
  const hackathonId = parseInt(id || "0", 10);
  const [presentationMode, setPresentationMode] = useState(false);
  
  const { data: analytics, isLoading: analyticsLoading } = useGetHackathonAnalytics(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });
  
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });

  return (
    <ProtectedRoute allowedRoles={["organizer", "admin"]}>
      <DashboardLayout title="Hackathon Analytics">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-primary/4 to-transparent p-7 mb-6"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/8 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/6 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={15} className="text-violet-400" />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Event Analytics</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                Hackathon <span className="gradient-text">Insights</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Real-time metrics — registrations, submissions, evaluations, and leaderboard standings.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/organizer/hackathons">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                  <ArrowLeft size={14} /> Back
                </Button>
              </Link>
              <Button
                onClick={() => setPresentationMode(true)}
                size="sm"
                className="border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-600 hover:text-white border shadow-[0_0_15px_rgba(139,92,246,0.2)] gap-1.5"
              >
                <Presentation size={14} /> Presentation Mode
              </Button>
            </div>
          </div>
        </motion.div>

        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Participants" value={analytics.participantCount} icon={Users} neonColor="blue" trend={{ value: 12, isPositive: true }} />
              <StatCard title="Teams" value={analytics.teamCount} icon={Users} neonColor="cyan" />
              <StatCard title="Projects" value={analytics.projectCount} icon={Code2} neonColor="violet" />
              <StatCard
                title="Submission Rate"
                value={`${(analytics.submissionRate * 100).toFixed(1)}%`}
                icon={CheckCircle2}
                neonColor="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Registration Over Time */}
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold mb-6">Registrations Over Time</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.registrationOverTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                        itemStyle={{ color: '#F8FAFC' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col">
                <h3 className="text-lg font-bold mb-6">Top Tech Stacks</h3>
                <div className="flex-1 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.techStackDistribution || []} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                        {(analytics.techStackDistribution || []).map((_: any, i: number) => (
                          <rect key={i} fill={`hsl(${200 + i * 20}, 70%, 60%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-6 rounded-2xl border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Current Leaderboard</h3>
                {analytics.evaluationProgress !== undefined && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                    Judging {(analytics.evaluationProgress * 100).toFixed(0)}% Complete
                  </Badge>
                )}
              </div>
              
              {!leaderboardLoading && leaderboard && leaderboard.length > 0 ? (
                <div className="mt-8">
                  <LeaderboardPodium entries={leaderboard} />
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  Not enough evaluations to display leaderboard yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center glass-card rounded-2xl text-muted-foreground border border-white/10">
            Analytics not available.
          </div>
        )}

        <AnimatePresence>
          {presentationMode && (
            <PresentationMode
              hackathonId={hackathonId}
              onClose={() => setPresentationMode(false)}
            />
          )}
        </AnimatePresence>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
