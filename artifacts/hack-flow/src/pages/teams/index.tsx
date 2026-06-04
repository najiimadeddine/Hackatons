import { useState } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useListHackathons, useListTeams, useCreateTeam, useLeaveTeam, useInviteToTeam } from "@workspace/api-client-react";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Users, Plus, Search, Trophy, Crown, LogOut, Mail,
  Loader2, Code2, UserPlus, ArrowRight, Shield
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  frontend: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  backend: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  design: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  ml: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  devops: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  fullstack: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

function CreateTeamDialog({ open, onOpenChange, hackathons, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  hackathons: any[];
  onSuccess: () => void;
}) {
  const [hackathonId, setHackathonId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const createTeam = useCreateTeam();

  const ROLES = ["frontend", "backend", "design", "ml", "devops", "fullstack"];

  const toggleRole = (role: string) => {
    setLookingFor(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleCreate = async () => {
    if (!hackathonId || !name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTeam.mutateAsync({
        hackathonId: parseInt(hackathonId),
        data: { name, description, lookingForRoles: lookingFor }
      });
      toast.success("Team created successfully!");
      onSuccess();
      onOpenChange(false);
      setName(""); setDescription(""); setLookingFor([]); setHackathonId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create team");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={18} className="text-primary" /> Create a Team
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Hackathon *</label>
            <Select value={hackathonId} onValueChange={setHackathonId}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Select hackathon..." />
              </SelectTrigger>
              <SelectContent>
                {hackathons.map((h: any) => (
                  <SelectItem key={h.id} value={String(h.id)}>{h.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Team Name *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. AlphaBuilders"
              className="bg-black/20 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is your team working on?"
              className="bg-black/20 border-white/10 min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Looking for roles</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                    lookingFor.includes(role)
                      ? ROLE_COLORS[role] || "text-primary bg-primary/10 border-primary/20"
                      : "text-muted-foreground bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createTeam.isPending || !hackathonId || !name.trim()}>
            {createTeam.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Plus size={14} className="mr-2" />}
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog({ open, onOpenChange, teamId, teamName }: {
  open: boolean; onOpenChange: (v: boolean) => void; teamId: number; teamName: string;
}) {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const inviteToTeam = useInviteToTeam();

  const handleInvite = async () => {
    const id = parseInt(userId);
    if (!id) return;
    try {
      await inviteToTeam.mutateAsync({ id: teamId, data: { userId: id, message } });
      toast.success("Invitation sent!");
      onOpenChange(false);
      setUserId(""); setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" /> Invite to {teamName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">User ID</label>
            <Input
              type="number"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="Enter participant's user ID"
              className="bg-black/20 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Personal message (optional)</label>
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. We need a great frontend dev!"
              className="bg-black/20 border-white/10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleInvite} disabled={inviteToTeam.isPending || !userId}>
            {inviteToTeam.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Mail size={14} className="mr-2" />}
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamCard({ team, onInvite }: { team: any; onInvite: (t: any) => void }) {
  const leaveTeam = useLeaveTeam();
  const qc = useQueryClient();

  const handleLeave = async () => {
    if (!confirm("Leave this team?")) return;
    try {
      await leaveTeam.mutateAsync({ id: team.id });
      toast.success("You left the team");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Failed to leave team");
    }
  };

  const members: any[] = team.members || [];
  const lookingFor: string[] = team.lookingForRoles || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-white/10 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
            <Users size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold truncate">{team.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{team.hackathonTitle || "Hackathon"}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] shrink-0">
          Active
        </Badge>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-4">
        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
        )}

        {/* Members */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Members ({members.length})</p>
          <div className="flex items-center gap-2 flex-wrap">
            {members.slice(0, 5).map((m: any) => (
              <div key={m.userId} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
                    {m.userName?.substring(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{m.userName?.split(" ")[0]}</span>
                {m.role === "leader" && <Crown size={10} className="text-amber-400" />}
              </div>
            ))}
            {members.length > 5 && (
              <span className="text-xs text-muted-foreground">+{members.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Looking for */}
        {lookingFor.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Looking for</p>
            <div className="flex flex-wrap gap-1.5">
              {lookingFor.map((role: string) => (
                <Badge key={role} variant="outline" className={`text-[10px] capitalize ${ROLE_COLORS[role] || "border-white/10 text-muted-foreground"}`}>
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <Link href={`/teams/${team.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full border-white/10 hover:border-primary/30 h-8 text-xs">
            <ArrowRight size={12} className="mr-1.5" /> View Team
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-3"
          onClick={() => onInvite(team)}
        >
          <UserPlus size={12} className="mr-1.5" /> Invite
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2"
          onClick={handleLeave}
          disabled={leaveTeam.isPending}
        >
          {leaveTeam.isPending ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
        </Button>
      </div>
    </motion.div>
  );
}

export default function TeamsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<any>(null);
  const [hackathonFilter, setHackathonFilter] = useState("all");
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: hackathonsData } = useListHackathons({ status: "active", limit: 20 });
  const hackathons = hackathonsData?.data || [];

  const hackId = hackathonFilter !== "all" ? parseInt(hackathonFilter) : (hackathons[0]?.id || 1);
  const { data: teamsData, isLoading, refetch } = useListTeams(hackId, {
    query: { enabled: hackId > 0 } as any,
  });
  const teams: any[] = (teamsData as any[]) || [];

  const filtered = teams.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["participant"]}>
      <DashboardLayout title="My Teams">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 via-primary/5 to-transparent p-7 mb-6"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/8 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Team Hub</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                Build your <span className="gradient-text-cyan">dream team</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                {teams.length > 0
                  ? `${teams.length} team${teams.length !== 1 ? "s" : ""} in this hackathon. Collaborate, build, and win together.`
                  : "Create a team or join one to start collaborating with builders across the globe."}
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              {[
                { value: teams.length,                                                    label: "Teams",      color: "text-foreground" },
                { value: teams.filter(t => (t.lookingForRoles?.length || 0) > 0).length, label: "Recruiting", color: "text-emerald-400" },
                { value: teams.reduce((s: number, t: any) => s + (t.members?.length || 0), 0), label: "Members",    color: "text-cyan-400" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3 mt-5">
            <Button
              onClick={() => setCreateOpen(true)}
              className="shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-cyan-600 hover:bg-cyan-700 gap-1.5"
              size="sm"
            >
              <Plus size={14} /> Create Team
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teams by name..."
              className="pl-9 bg-black/20 border-white/10 h-10"
            />
          </div>
          <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
            <SelectTrigger className="w-full sm:w-[240px] bg-black/20 border-white/10 h-10">
              <Trophy size={14} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by hackathon" />
            </SelectTrigger>
            <SelectContent>
              {hackathons.map((h: any) => (
                <SelectItem key={h.id} value={String(h.id)}>{h.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length > 0 ? (
            filtered.map(team => (
              <TeamCard key={team.id} team={team} onInvite={t => setInviteTarget(t)} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass-card rounded-2xl border border-white/10">
              <Users size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-medium mb-2">No teams found</p>
              <p className="text-sm text-muted-foreground mb-6">
                {search ? "Try a different search term" : "Create a team to start collaborating"}
              </p>
              {!search && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus size={16} className="mr-2" /> Create your first team
                </Button>
              )}
            </div>
          )}
        </div>

        <CreateTeamDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          hackathons={hackathons}
          onSuccess={() => { refetch(); qc.invalidateQueries(); }}
        />

        {inviteTarget && (
          <InviteDialog
            open={!!inviteTarget}
            onOpenChange={open => { if (!open) setInviteTarget(null); }}
            teamId={inviteTarget.id}
            teamName={inviteTarget.name}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
