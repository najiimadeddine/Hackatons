import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { 
  useGetHackathon, useGetHackathonMilestones, useCreateMilestone, 
  useGetEvaluationCriteria, useAssignHackathonRole,
  useListUsers, useUpdateHackathon
} from "@workspace/api-client-react";
import type { HackathonUpdateStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, CheckCircle2, Clock, Calendar, Users, 
  Settings, Gavel, MessageSquare, Loader2, ChevronDown,
  BarChart3, Trophy
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

const STATUS_OPTIONS: HackathonUpdateStatus[] = ["draft", "open", "active", "judging", "completed", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  draft: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
  open: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  active: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  judging: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  completed: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  cancelled: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

export default function HackathonManagePage() {
  const { id } = useParams();
  const hackathonId = parseInt(id || "0", 10);
  const [activeTab, setActiveTab] = useState<"milestones" | "roles" | "settings">("milestones");
  
  // Milestone form
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneDue, setMilestoneDue] = useState("");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // Role assignment
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"mentor" | "jury">("mentor");

  const { data: hackathon, isLoading: hackLoading, refetch: refetchHackathon } = useGetHackathon(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });

  const { data: milestones, isLoading: milestonesLoading, refetch: refetchMilestones } = useGetHackathonMilestones(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });

  const { data: usersData, isLoading: usersLoading } = useListUsers({ role: "mentor", limit: 100 }, {
    query: { enabled: activeTab === "roles" } as any,
  });

  const { data: juryData } = useListUsers({ role: "jury", limit: 100 }, {
    query: { enabled: activeTab === "roles" } as any,
  });

  const createMilestone = useCreateMilestone();
  const assignRole = useAssignHackathonRole();
  const updateHackathon = useUpdateHackathon();

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDue) return;
    try {
      await createMilestone.mutateAsync({
        id: hackathonId,
        data: {
          title: milestoneTitle.trim(),
          description: milestoneDesc.trim() || undefined,
          dueDate: new Date(milestoneDue).toISOString(),
        }
      });
      toast.success("Milestone added");
      setMilestoneTitle("");
      setMilestoneDesc("");
      setMilestoneDue("");
      setShowMilestoneForm(false);
      refetchMilestones();
    } catch (err: any) {
      toast.error(err.message || "Failed to add milestone");
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId) return;
    try {
      await assignRole.mutateAsync({
        id: hackathonId,
        data: { userId: parseInt(selectedUserId), role: selectedRole }
      });
      toast.success(`User assigned as ${selectedRole}`);
      setSelectedUserId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to assign role");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateHackathon.mutateAsync({ id: hackathonId, data: { status: status as HackathonUpdateStatus } });
      toast.success(`Status updated to ${status}`);
      refetchHackathon();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const allUsers = [
    ...(usersData?.data || []).map(u => ({ ...u, userRole: "mentor" as const })),
    ...(juryData?.data || []).map(u => ({ ...u, userRole: "jury" as const })),
  ];

  const tabs = [
    { id: "milestones" as const, label: "Milestones", icon: Calendar },
    { id: "roles" as const, label: "Assign Roles", icon: Users },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <ProtectedRoute allowedRoles={["organizer", "admin"]}>
      <DashboardLayout title="Manage Hackathon">
        {hackLoading ? (
          <SkeletonLoader className="h-32 rounded-2xl" />
        ) : hackathon ? (
          <div className="space-y-6">
            {/* Hero Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-primary/4 to-transparent p-6"
            >
              <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
              <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/8 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <Link href="/organizer/hackathons">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
                      <ArrowLeft size={14} className="mr-1" /> Back
                    </Button>
                  </Link>
                  <span className="text-white/20">·</span>
                  <div className="flex items-center gap-1.5">
                    <Settings size={13} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Manage Event</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black mb-1 truncate">{hackathon.title}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`capitalize text-[11px] ${STATUS_COLORS[hackathon.status]}`}>
                        {hackathon.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Hackathon #{hackathonId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Link href={`/organizer/hackathons/${hackathonId}/analytics`}>
                      <Button size="sm" variant="outline" className="border-white/10 hover:border-violet-500/30 hover:text-violet-400 h-8 text-xs">
                        <BarChart3 size={13} className="mr-1.5" /> Analytics
                      </Button>
                    </Link>
                    <Link href={`/organizer/hackathons/${hackathonId}/criteria`}>
                      <Button size="sm" variant="outline" className="border-white/10 hover:border-amber-500/30 hover:text-amber-400 h-8 text-xs">
                        <Gavel size={13} className="mr-1.5" /> Criteria
                      </Button>
                    </Link>
                    <Link href={`/hackathons/${hackathonId}/portfolio`}>
                      <Button size="sm" variant="outline" className="border-white/10 hover:border-purple-500/30 hover:text-purple-400 h-8 text-xs">
                        <Trophy size={13} className="mr-1.5" /> Portfolio
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tab navigation */}
            <div className="flex gap-1 p-1 glass-card rounded-xl border border-white/10 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* MILESTONES TAB */}
              {activeTab === "milestones" && (
                <motion.div
                  key="milestones"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Project Milestones</h3>
                    <Button
                      size="sm"
                      onClick={() => setShowMilestoneForm(v => !v)}
                      className="shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                      <Plus size={14} className="mr-1.5" /> Add Milestone
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showMilestoneForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateMilestone}
                        className="glass-card rounded-2xl p-5 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.08)] space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Title <span className="text-rose-400">*</span></label>
                            <Input
                              value={milestoneTitle}
                              onChange={e => setMilestoneTitle(e.target.value)}
                              placeholder="e.g. Project submission deadline"
                              required
                              className="bg-black/20 border-white/10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Due Date <span className="text-rose-400">*</span></label>
                            <Input
                              type="date"
                              value={milestoneDue}
                              onChange={e => setMilestoneDue(e.target.value)}
                              required
                              className="bg-black/20 border-white/10"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={milestoneDesc}
                            onChange={e => setMilestoneDesc(e.target.value)}
                            placeholder="What does this milestone entail?"
                            className="min-h-[80px] resize-none bg-black/20 border-white/10"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button type="button" variant="ghost" onClick={() => setShowMilestoneForm(false)} className="text-muted-foreground">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createMilestone.isPending}>
                            {createMilestone.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Add Milestone
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {milestonesLoading ? (
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => <SkeletonLoader key={i} className="h-20 rounded-xl" />)}
                    </div>
                  ) : milestones && milestones.length > 0 ? (
                    <div className="space-y-3">
                      {(milestones as any[]).map((m: any, i: number) => {
                        const dueDate = new Date(m.dueDate);
                        const isPast = dueDate < new Date();
                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-xl p-4 border border-white/10 flex items-start gap-4 hover:border-primary/20 transition-colors"
                          >
                            <div className={`mt-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              m.isCompleted 
                                ? "border-emerald-500 bg-emerald-500/10" 
                                : isPast 
                                  ? "border-rose-500 bg-rose-500/10" 
                                  : "border-primary/50 bg-primary/10"
                            }`}>
                              {m.isCompleted ? (
                                <CheckCircle2 size={16} className="text-emerald-400" />
                              ) : (
                                <Clock size={16} className={isPast ? "text-rose-400" : "text-primary"} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold">{m.title}</h4>
                                  {m.description && <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>}
                                </div>
                                <div className={`shrink-0 text-sm font-medium ${isPast && !m.isCompleted ? "text-rose-400" : "text-muted-foreground"}`}>
                                  {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                      <Calendar size={40} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">No milestones set yet. Add key dates for participants to track.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ROLES TAB */}
              {activeTab === "roles" && (
                <motion.div
                  key="roles"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                    <h3 className="font-semibold text-lg">Assign Mentors & Jury</h3>
                    <p className="text-sm text-muted-foreground">
                      Assign registered mentors and jury members to this hackathon so they gain access to the relevant panels.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Select a user..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d1117] border-white/10">
                            <div className="px-2 py-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mentors</div>
                            {(usersData?.data || []).map(u => (
                              <SelectItem key={`m-${u.id}`} value={String(u.id)} className="hover:bg-white/5">
                                {u.name} ({u.email})
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">Jury</div>
                            {(juryData?.data || []).map(u => (
                              <SelectItem key={`j-${u.id}`} value={String(u.id)} className="hover:bg-white/5">
                                {u.name} ({u.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                          <SelectTrigger className="bg-black/20 border-white/10 flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d1117] border-white/10">
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="jury">Jury</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleAssignRole}
                          disabled={!selectedUserId || assignRole.isPending}
                          className="shrink-0"
                        >
                          {assignRole.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary" /> Mentors
                      </h4>
                      {usersLoading ? (
                        <SkeletonLoader className="h-20 rounded-xl" />
                      ) : (usersData?.data || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No mentors registered on the platform.</p>
                      ) : (
                        <div className="space-y-2">
                          {(usersData?.data || []).slice(0, 6).map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Gavel size={16} className="text-amber-400" /> Jury Members
                      </h4>
                      {usersLoading ? (
                        <SkeletonLoader className="h-20 rounded-xl" />
                      ) : (juryData?.data || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No jury members registered on the platform.</p>
                      ) : (
                        <div className="space-y-2">
                          {(juryData?.data || []).slice(0, 6).map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                    <h3 className="font-semibold text-lg">Hackathon Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Control the lifecycle of this hackathon. Participants can register when status is <strong>open</strong>, 
                      and jury can evaluate when status is <strong>judging</strong>.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {STATUS_OPTIONS.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={updateHackathon.isPending}
                          className={`px-4 py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                            hackathon.status === status
                              ? `${STATUS_COLORS[status]} scale-105 shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          {updateHackathon.isPending && hackathon.status !== status ? (
                            <Loader2 size={14} className="mx-auto animate-spin" />
                          ) : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link href={`/organizer/hackathons/${hackathonId}/criteria`}>
                        <Button variant="outline" className="w-full border-white/10 hover:border-primary/30 justify-start">
                          <Gavel size={16} className="mr-2 text-primary" />
                          Manage Evaluation Criteria
                        </Button>
                      </Link>
                      <Link href={`/organizer/hackathons/${hackathonId}/analytics`}>
                        <Button variant="outline" className="w-full border-white/10 hover:border-emerald-500/30 justify-start">
                          <BarChart3 size={16} className="mr-2 text-emerald-400" />
                          View Analytics & Leaderboard
                        </Button>
                      </Link>
                      <Link href={`/hackathons/${hackathonId}/portfolio`}>
                        <Button variant="outline" className="w-full border-white/10 hover:border-purple-500/30 justify-start">
                          <Trophy size={16} className="mr-2 text-purple-400" />
                          Public Portfolio Page
                        </Button>
                      </Link>
                      <Link href={`/chat`}>
                        <Button variant="outline" className="w-full border-white/10 hover:border-cyan-500/30 justify-start">
                          <MessageSquare size={16} className="mr-2 text-cyan-400" />
                          Hackathon Chat Rooms
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Hackathon not found.</p>
            <Link href="/organizer/hackathons">
              <Button variant="outline" className="mt-4">Back to My Hackathons</Button>
            </Link>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
