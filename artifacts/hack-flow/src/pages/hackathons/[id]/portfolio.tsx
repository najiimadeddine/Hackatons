import { useParams, Link } from "wouter";
import { useGetPortfolio } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Github, Code2, Users, Trophy, Star, Sparkles } from "lucide-react";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RANK_CONFIG: Record<number, { label: string; border: string; glow: string; badge: string; score: string }> = {
  1: { label: "🥇 1st Place", border: "border-amber-400/50",   glow: "shadow-[0_0_30px_rgba(251,191,36,0.15)]",  badge: "bg-amber-400/15 text-amber-300 border-amber-400/30",  score: "text-amber-300" },
  2: { label: "🥈 2nd Place", border: "border-slate-300/40",   glow: "shadow-[0_0_20px_rgba(203,213,225,0.10)]", badge: "bg-slate-400/15 text-slate-300 border-slate-400/30",  score: "text-slate-300" },
  3: { label: "🥉 3rd Place", border: "border-orange-600/40",  glow: "shadow-[0_0_20px_rgba(194,65,12,0.12)]",   badge: "bg-orange-600/15 text-orange-400 border-orange-600/30", score: "text-orange-400" },
};

export default function PortfolioPage() {
  const { id } = useParams();
  const hackathonId = parseInt(id || "0", 10);

  const { data: portfolio, isLoading } = useGetPortfolio(hackathonId, {
    query: { enabled: !!hackathonId } as any
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <SkeletonCard />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Trophy size={32} className="text-amber-400 opacity-50" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Portfolio Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">This hackathon portfolio may not be published yet.</p>
        <Link href="/hackathons">
          <Button>Back to Hackathons</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background orbs */}
      <div className="fixed top-[-5%] left-[-5%] w-[35%] h-[35%] bg-primary/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-500/8 rounded-full blur-[130px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="px-6 py-4 border-b border-white/[0.07] bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/hackathons/${hackathonId}`}>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground h-8 w-8">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Public Portfolio</span>
              </div>
              <h1 className="text-base font-bold tracking-tight leading-tight">{portfolio.hackathonTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <div className="hidden sm:flex items-center gap-1.5">
              <Users size={13} className="text-primary" />
              <span className="font-semibold text-foreground">{portfolio.totalParticipants || 0}</span>
              <span>hackers</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Code2 size={13} className="text-emerald-400" />
              <span className="font-semibold text-foreground">{portfolio.projects?.length || 0}</span>
              <span>projects</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative border-b border-white/[0.06] px-6 py-14 text-center overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
            <Trophy size={12} />
            Final Submissions
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">{portfolio.hackathonTitle}</span>
          </h2>
          <p className="text-muted-foreground">
            {portfolio.projects?.length || 0} projects from {portfolio.totalParticipants || 0} brilliant hackers
          </p>
        </motion.div>
      </div>

      {/* Project Grid */}
      <main className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto relative z-10">
        {(!portfolio.projects || portfolio.projects.length === 0) ? (
          <div className="text-center py-24 glass-card rounded-3xl border border-white/10">
            <Trophy size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-muted-foreground">Check back after the hackathon concludes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.projects.map((project, index) => {
              const rankCfg = RANK_CONFIG[project.rank];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className={cn(
                    "glass-card rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 duration-200 border",
                    rankCfg ? `${rankCfg.border} ${rankCfg.glow}` : "border-white/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(65,130,255,0.08)]"
                  )}
                >
                  {/* Top rank bar for podium */}
                  {rankCfg && (
                    <div className={cn(
                      "h-1 w-full",
                      project.rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-300" :
                      project.rank === 2 ? "bg-gradient-to-r from-slate-300 to-slate-400" :
                      "bg-gradient-to-r from-orange-600 to-orange-400"
                    )} />
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 mr-3">
                        {rankCfg && (
                          <Badge className={cn("mb-2 text-[10px] border font-semibold", rankCfg.badge)}>
                            {rankCfg.label}
                          </Badge>
                        )}
                        {!rankCfg && project.rank <= 10 && (
                          <Badge variant="outline" className="mb-2 text-[10px] border-white/10 text-muted-foreground">
                            #{project.rank}
                          </Badge>
                        )}
                        <h3 className="text-lg font-bold line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">by {project.teamName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={cn("font-mono text-xl font-black", rankCfg ? rankCfg.score : "text-primary")}>
                          {project.totalScore.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">score</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground/75 line-clamp-3 mb-5 flex-1 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.techStack.slice(0, 4).map(tech => (
                          <Badge key={tech} variant="outline" className="bg-white/[0.04] border-white/10 text-[10px] text-muted-foreground px-2 py-0.5">
                            {tech}
                          </Badge>
                        ))}
                        {project.techStack.length > 4 && (
                          <Badge variant="outline" className="bg-white/[0.04] border-white/10 text-[10px] text-muted-foreground px-2 py-0.5">
                            +{project.techStack.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* CTA buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-black/20 border-white/10 hover:bg-white/5 gap-1.5 text-xs">
                            <Github size={12} /> Code
                          </Button>
                        </a>
                      )}
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex-1">
                          <Button size="sm" className="w-full gap-1.5 text-xs bg-primary/20 hover:bg-primary border-primary/30 border text-primary hover:text-white">
                            <ExternalLink size={12} /> Demo
                          </Button>
                        </a>
                      )}
                      {!project.repoUrl && !project.demoUrl && (
                        <div className="flex-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Star size={11} className="text-amber-400" />
                          {project.totalScore >= 8 ? "Exceptional project" : "Strong submission"}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
