import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useGetProject } from "@workspace/api-client-react";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Code2, Github, ExternalLink, Video, ArrowLeft,
  Layers, Hash, CheckCircle2, Clock, Zap,
  Star, Eye, Users, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft:      { label: "Draft",       color: "text-zinc-400  bg-zinc-500/10  border-zinc-500/25",  icon: Clock       },
  submitted:  { label: "Submitted",   color: "text-blue-400  bg-blue-500/10  border-blue-500/25",  icon: CheckCircle2 },
  reviewing:  { label: "Under Review",color: "text-amber-400 bg-amber-500/10 border-amber-500/25", icon: Eye         },
  approved:   { label: "Approved",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", icon: Zap    },
  winner:     { label: "Winner",      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", icon: Star    },
};

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const projectId = parseInt(id || "0", 10);

  const { data: project, isLoading } = useGetProject(projectId, {
    query: { enabled: !!projectId } as any,
  });

  return (
    <ProtectedRoute allowedRoles={["participant", "jury", "organizer", "admin"]}>
      <DashboardLayout title="Project Workspace">
        {isLoading ? (
          <div className="space-y-6">
            <SkeletonLoader className="h-52 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              {[0,1,2].map(i => <SkeletonLoader key={i} className="h-24 rounded-2xl" />)}
            </div>
            <SkeletonLoader className="h-96 w-full rounded-2xl" />
          </div>
        ) : !project ? (
          <div className="p-16 text-center glass-card rounded-2xl border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Code2 size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6 text-sm">This project may have been removed or you don't have access.</p>
            <Link href="/hackathons">
              <Button variant="outline" className="bg-black/20 border-white/10">
                <ArrowLeft size={14} className="mr-2" /> Browse Hackathons
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-cyan-600/5 to-transparent p-8 overflow-hidden shadow-[0_0_60px_rgba(65,130,255,0.06)]"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/6 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Status */}
                  {(() => {
                    const meta = STATUS_META[project.status] || STATUS_META["draft"];
                    const Icon = meta.icon;
                    return (
                      <Badge variant="outline" className={cn("text-xs gap-1.5 mb-4", meta.color)}>
                        <Icon size={11} />
                        {meta.label}
                      </Badge>
                    );
                  })()}

                  <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
                    {project.title}
                  </h1>
                  <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-5">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map(tech => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                        >
                          <Hash size={10} />
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2.5 min-w-[180px] w-full md:w-auto shrink-0">
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-black/30 border-white/10 hover:bg-white/5 gap-3"
                      >
                        <Github size={15} />
                        <span>Repository</span>
                        <ExternalLink size={11} className="ml-auto opacity-50" />
                      </Button>
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-primary/10 border-primary/25 hover:bg-primary/15 text-primary gap-3"
                      >
                        <ExternalLink size={15} />
                        <span>Live Demo</span>
                        <Zap size={11} className="ml-auto opacity-60" />
                      </Button>
                    </a>
                  )}
                  {project.videoUrl && (
                    <a href={project.videoUrl} target="_blank" rel="noreferrer">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/15 text-amber-400 gap-3"
                      >
                        <Video size={15} />
                        <span>Pitch Video</span>
                        <ExternalLink size={11} className="ml-auto opacity-60" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                {
                  label: "Hackathon ID",
                  value: `#${project.hackathonId}`,
                  icon: CalendarDays,
                  color: "text-primary",
                },
                {
                  label: "Team",
                  value: project.teamId ? `Team #${project.teamId}` : "Solo",
                  icon: Users,
                  color: "text-cyan-400",
                },
                {
                  label: "Tech Stack",
                  value: `${project.techStack?.length || 0} technologies`,
                  icon: Layers,
                  color: "text-emerald-400",
                },
                {
                  label: "Status",
                  value: STATUS_META[project.status]?.label || project.status,
                  icon: STATUS_META[project.status]?.icon || CheckCircle2,
                  color: "text-amber-400",
                },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <div
                  key={label}
                  className="glass-card rounded-xl border border-white/8 p-4 flex items-center gap-3"
                >
                  <div className={cn("p-2.5 rounded-xl bg-white/5", color)}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{label}</p>
                    <p className="text-sm font-semibold truncate">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* README */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl border border-white/8 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-8 py-5 border-b border-white/8 bg-white/[0.015]">
                <Code2 size={18} className="text-emerald-500" />
                <h2 className="font-bold text-lg">README</h2>
                <span className="ml-auto text-xs text-muted-foreground font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
                  README.md
                </span>
              </div>

              <div className="p-8">
                {project.readmeMarkdown ? (
                  <div className="prose prose-invert max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-code:text-emerald-400 prose-headings:font-black prose-a:text-primary whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {project.readmeMarkdown}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
                      <Code2 size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium mb-1">No README provided</p>
                    <p className="text-xs text-muted-foreground/60">The team hasn't added a README for this project yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
