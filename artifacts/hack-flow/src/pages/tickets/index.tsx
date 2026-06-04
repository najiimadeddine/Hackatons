import { useState } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  useListTickets, useCreateTicket, useClaimTicket, useResolveTicket,
  useListHackathons
} from "@workspace/api-client-react";
import { SkeletonList } from "@/components/shared/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import {
  Ticket as TicketIcon, AlertCircle, CheckCircle2, Clock, Plus,
  Search, Filter, Loader2, UserCheck, X, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  high:   "bg-rose-500/15 text-rose-400 border-rose-500/25",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  low:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.FC<any> }> = {
  open:     { color: "text-primary bg-primary/10 border-primary/20",         icon: AlertCircle },
  claimed:  { color: "text-amber-400 bg-amber-500/10 border-amber-500/20",   icon: Clock },
  resolved: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  closed:   { color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",      icon: X },
};

function CreateTicketDialog({ open, onOpenChange, hackathons, onSuccess }: {
  open: boolean; onOpenChange: (v: boolean) => void; hackathons: any[]; onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const createTicket = useCreateTicket();

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      await createTicket.mutateAsync({
        data: {
          title,
          description,
          priority: priority as any,
          hackathonId: hackathonId ?? (hackathons[0]?.id ?? 1),
        }
      });
      toast.success("Ticket created — a mentor will pick it up shortly");
      onSuccess();
      onOpenChange(false);
      setTitle(""); setDescription(""); setPriority("medium"); setHackathonId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to create ticket");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon size={18} className="text-primary" /> Open a Support Ticket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Title *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you need help with?"
              className="bg-black/20 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description *</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your issue in detail — what you tried, what happened, and what you expected..."
              className="bg-black/20 border-white/10 min-h-[100px] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Hackathon (optional)</label>
              <Select value={hackathonId ? String(hackathonId) : ""} onValueChange={v => setHackathonId(v ? parseInt(v) : null)}>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {hackathons.map((h: any) => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createTicket.isPending || !title.trim() || !description.trim()}>
            {createTicket.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Plus size={14} className="mr-2" />}
            Submit Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TicketRow({ ticket, isMentor, onClaim, onResolve, claiming, resolving }: {
  ticket: any; isMentor: boolean;
  onClaim: (id: number) => void;
  onResolve: (id: number) => void;
  claiming: boolean; resolving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-white/5 last:border-0"
    >
      <div
        className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status icon */}
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", statusCfg.color)}>
          <StatusIcon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
              {ticket.title}
            </h3>
            <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", PRIORITY_COLORS[ticket.priority || "low"])}>
              {ticket.priority || "low"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {ticket.authorName || "Unknown"} · {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy") : "—"}
            {ticket.hackathonTitle && ` · ${ticket.hackathonTitle}`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="outline" className={cn("text-[10px] capitalize", statusCfg.color)}>
            {ticket.status}
          </Badge>
          {isMentor && ticket.status === "open" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 px-2.5"
              onClick={e => { e.stopPropagation(); onClaim(ticket.id); }}
              disabled={claiming}
            >
              {claiming ? <Loader2 size={11} className="animate-spin" /> : <><UserCheck size={11} className="mr-1" />Claim</>}
            </Button>
          )}
          {isMentor && ticket.status === "claimed" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2.5"
              onClick={e => { e.stopPropagation(); onResolve(ticket.id); }}
              disabled={resolving}
            >
              {resolving ? <Loader2 size={11} className="animate-spin" /> : <><CheckCircle2 size={11} className="mr-1" />Resolve</>}
            </Button>
          )}
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-5 pt-1"
        >
          <div className="bg-black/20 rounded-xl p-4 border border-white/8 text-sm text-muted-foreground leading-relaxed">
            {ticket.description || "No description provided."}
          </div>
          {ticket.mentorName && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <UserCheck size={12} className="text-cyan-400" />
              Claimed by <span className="text-cyan-400 font-medium">{ticket.mentorName}</span>
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TicketsPage() {
  const { user } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const { data: ticketsData, isLoading, refetch } = useListTickets({});
  const { data: hackathonsData } = useListHackathons({ limit: 20 });
  const claimTicket = useClaimTicket();
  const resolveTicket = useResolveTicket();
  const qc = useQueryClient();

  const tickets: any[] = (ticketsData as any[]) || [];
  const hackathons = hackathonsData?.data || [];
  const isMentor = user?.role === "mentor" || user?.role === "admin";

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleClaim = async (id: number) => {
    setClaimingId(id);
    try {
      await claimTicket.mutateAsync({ id });
      toast.success("Ticket claimed — reach out to the participant!");
      refetch(); qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Failed to claim ticket");
    } finally {
      setClaimingId(null);
    }
  };

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    try {
      await resolveTicket.mutateAsync({ id });
      toast.success("Ticket resolved!");
      refetch(); qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setResolvingId(null);
    }
  };

  const openCount    = tickets.filter(t => t.status === "open").length;
  const claimedCount = tickets.filter(t => t.status === "claimed").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <ProtectedRoute allowedRoles={["participant", "mentor", "organizer", "admin"]}>
      <DashboardLayout title="Support Tickets">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/8 via-violet-600/4 to-transparent p-7 mb-6"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/8 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/6 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <TicketIcon size={15} className="text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Support Queue</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                {isMentor ? (
                  <>Help hackers <span className="gradient-text">build better</span></>
                ) : (
                  <>Get <span className="gradient-text">unstuck fast</span></>
                )}
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                {isMentor
                  ? `${openCount} open ticket${openCount !== 1 ? "s" : ""} waiting for expert help.${openCount > 0 ? " Claim one to start mentoring." : ""}`
                  : "Submit a support ticket and a mentor will respond shortly."}
              </p>
              {!isMentor && (
                <div className="mt-5">
                  <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="shadow-[0_0_20px_rgba(65,130,255,0.3)] gap-1.5"
                  >
                    <Plus size={14} /> Open Ticket
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-8 shrink-0">
              {[
                { value: openCount,     label: "Open",       color: "text-primary" },
                { value: claimedCount,  label: "In Progress", color: "text-amber-400" },
                { value: resolvedCount, label: "Resolved",   color: "text-emerald-400" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Open", value: openCount, color: "text-primary bg-primary/10 border-primary/20" },
            { label: "In Progress", value: claimedCount, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { label: "Resolved", value: resolvedCount, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          ].map(stat => (
            <div key={stat.label} className={`glass-card rounded-2xl border p-4 text-center ${stat.color}`}>
              <div className="text-3xl font-black font-mono mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="pl-9 bg-black/20 border-white/10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "open", "claimed", "resolved"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 h-10 rounded-xl text-xs font-medium border capitalize transition-all",
                  statusFilter === s
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-black/20 border-white/10 text-muted-foreground hover:border-white/20"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {(user?.role === "participant" || user?.role === "organizer") && (
            <Button onClick={() => setCreateOpen(true)} className="shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">
              <Plus size={14} className="mr-2" /> New Ticket
            </Button>
          )}
        </div>

        {/* Ticket list */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TicketIcon size={16} className="text-primary" />
              <h3 className="font-bold">Ticket Queue</h3>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground text-[10px]">
                {filtered.length}
              </Badge>
            </div>
            {isMentor && (
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-[10px] gap-1">
                <UserCheck size={10} /> Mentor view
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="p-6"><SkeletonList count={6} /></div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400 opacity-30" />
              <p className="font-medium mb-1">All clear!</p>
              <p className="text-sm text-muted-foreground">No tickets match your filters</p>
            </div>
          ) : (
            <div>
              {filtered.map(ticket => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isMentor={isMentor}
                  onClaim={handleClaim}
                  onResolve={handleResolve}
                  claiming={claimingId === ticket.id}
                  resolving={resolvingId === ticket.id}
                />
              ))}
            </div>
          )}
        </div>

        <CreateTicketDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          hackathons={hackathons}
          onSuccess={() => { refetch(); qc.invalidateQueries(); }}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
