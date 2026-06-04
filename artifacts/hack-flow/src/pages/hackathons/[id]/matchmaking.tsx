import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { MatchCard } from "@/components/shared/MatchCard";
import { useGetMatchCandidates, useSwipeCandidate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { toast } from "sonner";
import { ArrowLeft, Users, RefreshCw, Sparkles, Heart, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function MatchmakingPage() {
  const { id } = useParams();
  const hackathonId = parseInt(id || "0", 10);
  
  const { data: candidatesData, isLoading, refetch } = useGetMatchCandidates(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });
  
  const swipe = useSwipeCandidate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const candidates = (candidatesData as any[] | undefined) || [];
  const currentCandidate = candidates[currentIndex];
  const nextCandidate = candidates[currentIndex + 1];

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentCandidate) return;
    
    try {
      await swipe.mutateAsync({
        hackathonId,
        data: { targetUserId: currentCandidate.user.id, direction }
      });
      
      if (direction === "right") {
        toast.success(`Liked ${currentCandidate.user.name}`);
      }
      
      setCurrentIndex(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to process swipe");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["participant"]}>
      <DashboardLayout title="AI Matchmaking">
        <div className="flex flex-col items-center max-w-2xl mx-auto">

          {/* ── Hero header ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 via-primary/4 to-transparent p-6 mb-6"
          >
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">AI-Powered</span>
                </div>
                <h2 className="text-xl font-black">Team Matchmaking</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {candidates.length - currentIndex > 0
                    ? `${candidates.length - currentIndex} candidates remaining — swipe to find your perfect team`
                    : "You've reviewed all candidates"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/hackathons/${hackathonId}`}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                    <ArrowLeft size={13} /> Back
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <X size={13} className="text-rose-400" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Heart size={13} className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="w-full flex flex-col items-center h-[calc(100vh-320px)]">
          <div className="relative w-full max-w-sm flex-1 flex items-center justify-center">
            {isLoading ? (
              <SkeletonLoader className="w-full aspect-[3/4] rounded-3xl" />
            ) : currentIndex >= candidates.length ? (
              <div className="text-center glass-card p-10 rounded-3xl w-full">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
                <p className="text-muted-foreground mb-8">We're finding more potential teammates for you.</p>
                <Button onClick={() => { setCurrentIndex(0); refetch(); }} variant="outline" className="bg-black/20 border-white/10">
                  <RefreshCw size={16} className="mr-2" /> Refresh Candidates
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-full flex justify-center mt-10">
                <AnimatePresence>
                  {nextCandidate && (
                    <MatchCard 
                      key={nextCandidate.user.id} 
                      candidate={nextCandidate} 
                      onSwipe={() => {}} 
                      isFront={false} 
                    />
                  )}
                  {currentCandidate && (
                    <MatchCard 
                      key={currentCandidate.user.id} 
                      candidate={currentCandidate} 
                      onSwipe={handleSwipe} 
                      isFront={true} 
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {!isLoading && currentIndex < candidates.length && (
            <div className="flex items-center gap-6 mt-12 pb-8">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 bg-black/40 backdrop-blur-md"
                onClick={() => handleSwipe("left")}
                disabled={swipe.isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 bg-black/40 backdrop-blur-md"
                onClick={() => handleSwipe("right")}
                disabled={swipe.isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </Button>
            </div>
          )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
