import { useState } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useListHackathons, useGeneratePortfolio, Hackathon } from "@workspace/api-client-react";
import { CreateHackathonDialog } from "@/components/shared/CreateHackathonDialog";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Settings, Trophy, Globe, Loader2, Pencil } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  draft: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
  open: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  active: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  judging: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  completed: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  cancelled: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

function HackathonOrgCard({ hackathon, onEdit }: { hackathon: Hackathon; onEdit: (h: Hackathon) => void }) {
  const generatePortfolio = useGeneratePortfolio();
  const qc = useQueryClient();

  const handleGenPortfolio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generatePortfolio.mutateAsync({ hackathonId: hackathon.id });
      toast.success("Portfolio generated! It's now publicly accessible.");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate portfolio");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-white/10 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {hackathon.bannerUrl ? (
        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${hackathon.bannerUrl})` }} />
      ) : (
        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
          <Trophy size={40} className="text-primary/30" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold line-clamp-2 flex-1">{hackathon.title}</h3>
          <Badge variant="outline" className={`capitalize text-[10px] shrink-0 ${STATUS_COLORS[hackathon.status]}`}>
            {hackathon.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1">{hackathon.description}</p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 border-t border-white/5 pt-4">
          <span>Teams: {hackathon.minTeamSize}–{hackathon.maxTeamSize}</span>
          {hackathon.prizePool && <span className="text-emerald-400 font-medium">{hackathon.prizePool}</span>}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/organizer/hackathons/${hackathon.id}/manage`}>
            <Button size="sm" variant="outline" className="w-full border-white/10 hover:border-primary/30 h-8 text-xs">
              <Settings size={12} className="mr-1.5" /> Manage
            </Button>
          </Link>
          <Link href={`/organizer/hackathons/${hackathon.id}/analytics`}>
            <Button size="sm" variant="outline" className="w-full border-white/10 hover:border-emerald-500/30 h-8 text-xs">
              <BarChart3 size={12} className="mr-1.5" /> Analytics
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-foreground h-8"
            onClick={() => onEdit(hackathon)}
          >
            <Pencil size={12} className="mr-1.5" /> Edit
          </Button>
          {hackathon.status === "completed" && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-purple-400 hover:text-purple-300 h-8"
              onClick={handleGenPortfolio}
              disabled={generatePortfolio.isPending}
            >
              {generatePortfolio.isPending ? (
                <Loader2 size={12} className="mr-1.5 animate-spin" />
              ) : (
                <Globe size={12} className="mr-1.5" />
              )}
              Portfolio
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function OrganizerHackathonsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editHackathon, setEditHackathon] = useState<Hackathon | null>(null);
  const { data, isLoading, refetch } = useListHackathons({ limit: 50 });

  return (
    <ProtectedRoute allowedRoles={["organizer", "admin"]}>
      <DashboardLayout title="My Hackathons">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-cyan-600/5 to-transparent p-7 mb-8"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/6 rounded-full blur-[70px] pointer-events-none" />
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Organizer Hub</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-1.5">My Hackathons</h2>
              <p className="text-muted-foreground text-sm">
                {data?.data?.length || 0} event{(data?.data?.length || 0) !== 1 ? "s" : ""} created — manage, track, and analyze your hackathons.
              </p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="btn-primary-glow shadow-[0_0_25px_rgba(65,130,255,0.35)] shrink-0 gap-2 h-10"
            >
              <Plus size={16} /> Create Hackathon
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : data?.data && data.data.length > 0 ? (
            data.data.map(h => (
              <HackathonOrgCard
                key={h.id}
                hackathon={h}
                onEdit={h => setEditHackathon(h)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass-card rounded-2xl border border-white/10">
              <Trophy size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground mb-2 font-medium">No hackathons yet</p>
              <p className="text-sm text-muted-foreground mb-6">Create your first hackathon to get started</p>
              <Button onClick={() => setCreateOpen(true)} className="shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Plus size={16} className="mr-2" /> Create your first hackathon
              </Button>
            </div>
          )}
        </div>

        <CreateHackathonDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => refetch()}
        />

        {editHackathon && (
          <CreateHackathonDialog
            open={!!editHackathon}
            onOpenChange={open => { if (!open) setEditHackathon(null); }}
            hackathon={editHackathon}
            onSuccess={() => { refetch(); setEditHackathon(null); }}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
