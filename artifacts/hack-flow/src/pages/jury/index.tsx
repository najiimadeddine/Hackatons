import { useState } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useListHackathons, useListProjects, useGetEvaluationCriteria, useEvaluateProject } from "@workspace/api-client-react";
import { EvaluationMatrix } from "@/components/shared/EvaluationMatrix";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Gavel, Trophy, Users, Code2, CheckCircle2, Clock,
  ChevronRight, Star, Award, BarChart3, Eye, Sparkles,
  GitBranch, ExternalLink, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function JuryPage() {
  const [selectedHackathon, setSelectedHackathon] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [evaluatedProjects, setEvaluatedProjects] = useState<Set<number>>(new Set());

  const { data: hackathonsData, isLoading: hackLoading } = useListHackathons({ status: "judging", limit: 20 });
  const { data: allHackathons } = useListHackathons({ limit: 20 });
  const { data: projectsData, isLoading: projectsLoading } = useListProjects(selectedHackathon!, {
    query: { enabled: !!selectedHackathon } as any,
  });
  const { data: criteriaData, isLoading: criteriaLoading } = useGetEvaluationCriteria(selectedHackathon!, {
    query: { enabled: !!selectedHackathon } as any,
  });
  const evaluateProject = useEvaluateProject();
  const qc = useQueryClient();

  const hackathons = [
    ...(hackathonsData?.data || []),
    ...(allHackathons?.data?.filter(h => h.status !== "judging") || []),
  ].slice(0, 10);

  const projects = (projectsData as any[]) || [];
  const criteria = (criteriaData as any[]) || [];

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const handleSubmitEval = async (evaluation: any) => {
    if (!selectedProject || !selectedHackathon) return;
    try {
      await evaluateProject.mutateAsync({
        id: selectedProject,
        data: evaluation,
      });
      toast.success("Evaluation submitted successfully!");
      setEvaluatedProjects(prev => new Set([...prev, selectedProject]));
      setSelectedProject(null);
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit evaluation");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["jury", "admin"]}>
      <DashboardLayout title="Evaluations">
        <div className="space-y-6">

          {/* ── Hero banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-transparent p-7"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/6 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gavel size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Jury Panel</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-1">Project Evaluations</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Score projects using the weighted matrix criteria set by the organizer. Your evaluations are final once submitted.
                </p>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { icon: Trophy,     value: hackathons.filter(h => h.status === "judging").length, label: "In Judging" },
                  { icon: Code2,      value: projects.length || "—",  label: "Projects" },
                  { icon: CheckCircle2, value: evaluatedProjects.size, label: "Evaluated" },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <stat.icon size={14} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Main layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left: hackathon + project list */}
            <div className="lg:col-span-1 space-y-4">

              {/* Hackathon selector */}
              <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
                  <Trophy size={13} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Select Event</span>
                </div>
                <div className="p-2">
                  {hackLoading ? (
                    <div className="space-y-2 p-2">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
                      ))}
                    </div>
                  ) : hackathons.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Clock size={24} className="mx-auto mb-2 opacity-30" />
                      No events available
                    </div>
                  ) : (
                    hackathons.map(h => (
                      <button
                        key={h.id}
                        onClick={() => { setSelectedHackathon(h.id); setSelectedProject(null); }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl flex items-center justify-between gap-2 transition-all text-sm group",
                          selectedHackathon === h.id
                            ? "bg-amber-500/10 border border-amber-500/20"
                            : "hover:bg-white/[0.04] border border-transparent"
                        )}
                      >
                        <span className={cn("font-medium truncate", selectedHackathon === h.id ? "text-amber-300" : "")}>
                          {h.title}
                        </span>
                        <Badge variant="outline" className={cn("text-[9px] shrink-0", h.status === "judging" ? "border-amber-500/30 text-amber-400" : "border-white/10 text-muted-foreground")}>
                          {h.status}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Project list */}
              {selectedHackathon && (
                <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
                    <Code2 size={13} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Projects</span>
                    {projects.length > 0 && (
                      <span className="ml-auto text-[10px] bg-white/[0.06] text-muted-foreground px-1.5 py-0.5 rounded font-mono">{projects.length}</span>
                    )}
                  </div>
                  <div className="p-2">
                    {projectsLoading ? (
                      <div className="space-y-2 p-2">
                        {Array(4).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />)}
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <GitBranch size={24} className="mx-auto mb-2 opacity-30" />
                        No submitted projects
                      </div>
                    ) : (
                      projects.map((p: any) => {
                        const isEvaluated = evaluatedProjects.has(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedProject(p.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-xl transition-all group",
                              selectedProject === p.id
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-white/[0.04] border border-transparent"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className={cn("text-sm font-semibold truncate", selectedProject === p.id ? "text-primary" : "")}>{p.title}</span>
                              {isEvaluated && <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />}
                            </div>
                            <div className="flex items-center gap-2">
                              {p.totalScore != null && (
                                <span className="text-[10px] font-mono text-amber-400">{Number(p.totalScore).toFixed(1)}/10</span>
                              )}
                              <span className="text-[10px] text-muted-foreground/50 truncate">{p.teamName || "Team"}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: evaluation panel */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {!selectedHackathon ? (
                  <motion.div
                    key="no-hackathon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card rounded-2xl border border-white/[0.08] h-96 flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                      <Gavel size={28} className="text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Select an Event</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">Choose a hackathon from the left panel to see the submitted projects you need to evaluate.</p>
                  </motion.div>
                ) : !selectedProject ? (
                  <motion.div
                    key="no-project"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Evaluation summary cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: Code2,      label: "Total Projects",     value: projects.length,              color: "text-primary bg-primary/10 border-primary/20" },
                        { icon: CheckCircle2,label: "Evaluated",         value: evaluatedProjects.size,        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                        { icon: Clock,      label: "Pending",            value: projects.length - evaluatedProjects.size, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                      ].map(stat => (
                        <div key={stat.label} className={cn("rounded-2xl border p-4 flex items-center gap-3", stat.color)}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-current/10 shrink-0">
                            <stat.icon size={18} className="text-current" />
                          </div>
                          <div>
                            <div className="text-2xl font-black font-mono">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Project grid */}
                    <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
                      <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-2">
                        <BarChart3 size={15} className="text-primary" />
                        <span className="font-bold text-sm">Projects to Evaluate</span>
                      </div>
                      <div className="divide-y divide-white/[0.04]">
                        {projects.length === 0 ? (
                          <div className="py-16 text-center">
                            <GitBranch size={36} className="mx-auto mb-3 opacity-10" />
                            <p className="text-muted-foreground">No projects submitted yet</p>
                          </div>
                        ) : (
                          projects.map((p: any, i: number) => {
                            const isEvaluated = evaluatedProjects.has(p.id);
                            return (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors group cursor-pointer"
                                onClick={() => setSelectedProject(p.id)}
                              >
                                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 text-xs font-bold">
                                  {(i + 1).toString().padStart(2, "0")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{p.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{p.description?.slice(0, 80) || "No description"}</p>
                                </div>
                                {p.totalScore != null && (
                                  <div className="text-center hidden md:block">
                                    <p className="text-xs text-muted-foreground/50 mb-1">Score</p>
                                    <p className="font-mono font-black text-amber-400">{Number(p.totalScore).toFixed(1)}</p>
                                  </div>
                                )}
                                {isEvaluated ? (
                                  <Badge variant="outline" className="border-emerald-500/25 text-emerald-400 bg-emerald-500/8 text-[10px] shrink-0">
                                    <CheckCircle2 size={10} className="mr-1" /> Done
                                  </Badge>
                                ) : (
                                  <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 h-8 text-xs shrink-0 gap-1.5">
                                    <Gavel size={12} /> Evaluate
                                  </Button>
                                )}
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedProject}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="space-y-5"
                  >
                    {/* Back button + project header */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedProject(null)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft size={14} /> Back to projects
                      </button>
                    </div>

                    {selectedProjectData && (
                      <div className="glass-card rounded-2xl border border-primary/15 p-5 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-bold">{selectedProjectData.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{selectedProjectData.description}</p>
                          </div>
                          {selectedProjectData.demoUrl && (
                            <a href={selectedProjectData.demoUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="border-white/10 h-8 gap-1.5 text-xs shrink-0">
                                <ExternalLink size={12} /> Demo
                              </Button>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {selectedProjectData.techStack?.length > 0 && (
                            <div className="flex gap-1.5">
                              {selectedProjectData.techStack.slice(0, 4).map((t: string) => (
                                <span key={t} className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Evaluation matrix */}
                    {criteriaLoading ? (
                      <div className="glass-card rounded-2xl border border-white/[0.08] p-8 text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Loading evaluation criteria...</p>
                      </div>
                    ) : criteria.length > 0 ? (
                      <div className="glass-card rounded-2xl border border-white/[0.08] p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <Star size={15} className="text-amber-400" />
                          <span className="font-bold">Scoring Matrix</span>
                          <Badge variant="outline" className="ml-auto text-[10px] border-white/10 text-muted-foreground">
                            {criteria.length} criteria
                          </Badge>
                        </div>
                        <EvaluationMatrix
                          criteria={criteria}
                          onSubmit={handleSubmitEval}
                          isSubmitting={evaluateProject.isPending}
                        />
                      </div>
                    ) : (
                      <div className="glass-card rounded-2xl border border-amber-500/20 p-8 text-center">
                        <Award size={36} className="mx-auto mb-3 text-amber-400/30" />
                        <h3 className="font-bold mb-2">No Evaluation Criteria</h3>
                        <p className="text-sm text-muted-foreground">The organizer hasn't defined scoring criteria yet. Check back later or contact the organizer.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
