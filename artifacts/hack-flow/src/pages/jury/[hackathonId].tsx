import { useState } from "react";
import { useParams } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useListProjects, useGetEvaluationCriteria, useEvaluateProject, EvaluationInput } from "@workspace/api-client-react";
import { EvaluationMatrix } from "@/components/shared/EvaluationMatrix";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Code2, AlertCircle, Star, Users, GitBranch, ChevronRight, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted:   { label: "Submitted",   color: "border-primary/30 text-primary bg-primary/10" },
  under_review:{ label: "In Review",   color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  evaluated:   { label: "Evaluated",   color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  winner:      { label: "🏆 Winner",   color: "border-amber-400/50 text-amber-300 bg-amber-500/15" },
};

export default function JuryPage() {
  const { hackathonId: idStr } = useParams();
  const hackathonId = parseInt(idStr || "0", 10);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [evaluatedIds, setEvaluatedIds] = useState<Set<number>>(new Set());

  const { data: projectsData, isLoading: projectsLoading } = useListProjects(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });

  const { data: criteria, isLoading: criteriaLoading } = useGetEvaluationCriteria(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });

  const evaluate = useEvaluateProject();

  const handleEvaluate = async (evaluation: EvaluationInput) => {
    if (!selectedProjectId) return;
    try {
      await evaluate.mutateAsync({ id: selectedProjectId, data: evaluation });
      setEvaluatedIds(prev => new Set(prev).add(selectedProjectId));
      toast.success("Evaluation submitted successfully!");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit evaluation");
    }
  };

  const projects = (projectsData as any[] | undefined) || [];
  const criteriaList = (criteria as any[] | undefined) || [];
  const evaluatedCount = evaluatedIds.size;
  const pendingCount = projects.length - evaluatedCount;

  return (
    <ProtectedRoute allowedRoles={["jury", "admin"]}>
      <DashboardLayout title="Jury Evaluation Panel">
        <div className="space-y-8">

          {/* ── Hero Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-amber-600/12 via-orange-600/5 to-transparent p-7"
          >
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/12 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-orange-600/8 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={18} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Jury Control Panel</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                  Evaluation Dashboard
                </h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  {pendingCount > 0
                    ? `${pendingCount} project${pendingCount !== 1 ? "s" : ""} pending your evaluation. Score each against the defined criteria.`
                    : "All projects evaluated — great work!"}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 shrink-0">
                {[
                  { value: projects.length, label: "Projects",   color: "text-foreground" },
                  { value: criteriaList.length, label: "Criteria",  color: "text-primary" },
                  { value: evaluatedCount, label: "Evaluated",  color: "text-emerald-400" },
                  { value: pendingCount,   label: "Pending",    color: "text-amber-400" },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {projects.length > 0 && (
              <div className="relative z-10 mt-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Evaluation progress</span>
                  <span className="text-amber-400 font-semibold">{Math.round((evaluatedCount / projects.length) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(evaluatedCount / projects.length) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Loading ── */}
          {(projectsLoading || criteriaLoading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <SkeletonLoader key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          )}

          {/* ── No Criteria ── */}
          {!projectsLoading && !criteriaLoading && criteriaList.length === 0 && (
            <div className="p-16 text-center glass-card rounded-2xl border border-amber-500/20">
              <AlertCircle size={48} className="mx-auto mb-4 text-amber-400 opacity-40" />
              <h2 className="text-2xl font-bold mb-2">No Evaluation Criteria</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                The organizer hasn't defined scoring criteria for this hackathon yet. Check back soon.
              </p>
            </div>
          )}

          {/* ── No Projects ── */}
          {!projectsLoading && !criteriaLoading && criteriaList.length > 0 && projects.length === 0 && (
            <div className="p-16 text-center glass-card rounded-2xl border border-white/10">
              <Trophy size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
              <h2 className="text-2xl font-bold mb-2">No Projects Yet</h2>
              <p className="text-muted-foreground">Teams haven't submitted any projects for this hackathon.</p>
            </div>
          )}

          {/* ── Project Grid ── */}
          {!projectsLoading && !criteriaLoading && criteriaList.length > 0 && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project: any, i: number) => {
                const sc = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.submitted;
                const isEvaluated = evaluatedIds.has(project.id);

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      "glass-card p-5 rounded-2xl flex flex-col border transition-all duration-300 group relative overflow-hidden",
                      isEvaluated
                        ? "border-emerald-500/25 hover:border-emerald-500/40"
                        : "border-white/10 hover:border-primary/25"
                    )}
                  >
                    {/* Evaluated overlay */}
                    {isEvaluated && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold">
                          <CheckCircle2 size={10} /> Evaluated
                        </div>
                      </div>
                    )}

                    {/* Glow on hover */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl",
                      isEvaluated
                        ? "shadow-[inset_0_0_40px_rgba(16,185,129,0.04)]"
                        : "shadow-[inset_0_0_40px_rgba(65,130,255,0.04)]"
                    )} />

                    {/* Top accent line */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl",
                      isEvaluated
                        ? "bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-transparent"
                        : "bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    )} />

                    <div className="flex-1 relative z-10">
                      {/* Status + rank */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={cn("text-[10px] capitalize", sc.color)}>
                          {sc.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #{String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      {/* Team name */}
                      <div className="flex items-center gap-1.5 text-primary text-sm font-medium mb-3">
                        <Users size={13} />
                        <span>{project.teamName || "Team"}</span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                        {project.description || "No description provided."}
                      </p>

                      {/* Tech tags */}
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.techStack.slice(0, 4).map((tech: string) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-muted-foreground font-mono"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-muted-foreground">
                              +{project.techStack.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Criteria preview */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
                        <Star size={11} className="text-amber-400" />
                        <span>{criteriaList.length} scoring criteria</span>
                        <span className="mx-1 opacity-30">·</span>
                        <GitBranch size={11} />
                        <span>Score &amp; feedback required</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Dialog
                      open={isDialogOpen && selectedProjectId === project.id}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) setSelectedProjectId(project.id);
                        else if (selectedProjectId === project.id) setSelectedProjectId(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className={cn(
                            "w-full gap-2 font-semibold transition-all relative z-10",
                            isEvaluated
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                              : "bg-primary/15 text-primary hover:bg-primary hover:text-white border border-primary/30"
                          )}
                        >
                          {isEvaluated ? (
                            <><CheckCircle2 size={15} /> Re-Evaluate</>
                          ) : (
                            <><Award size={15} /> Evaluate Project<ChevronRight size={14} className="ml-auto opacity-60" /></>
                          )}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-3xl border-white/10 p-0 overflow-hidden bg-[#080C14]">
                        <DialogHeader className="px-6 py-4 border-b border-white/10 bg-black/30">
                          <DialogTitle className="text-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                              <Award size={15} className="text-amber-400" />
                            </div>
                            <div>
                              <p className="text-base font-bold">{project.title}</p>
                              <p className="text-xs text-muted-foreground font-normal">{project.teamName}</p>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 h-[70vh] overflow-hidden">
                          <EvaluationMatrix
                            criteria={criteriaList}
                            onSubmit={handleEvaluate}
                            isSubmitting={evaluate.isPending}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
