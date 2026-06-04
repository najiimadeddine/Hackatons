import { MatchCandidate } from "@workspace/api-client-react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Code2, Sparkles, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MatchCardProps {
  candidate: MatchCandidate;
  onSwipe: (direction: "left" | "right") => void;
  className?: string;
  isFront?: boolean;
}

export function MatchCard({ candidate, onSwipe, className, isFront = true }: MatchCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const crossOpacity = useTransform(x, [-100, -50, 0], [1, 0, 0]);
  const heartOpacity = useTransform(x, [0, 50, 100], [0, 0, 1]);
  
  const [exitX, setExitX] = useState<number>(0);
  const controls = useAnimation();

  const handleDragEnd = (e: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(300);
      controls.start({ x: 300, opacity: 0, transition: { duration: 0.3 } }).then(() => onSwipe("right"));
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      controls.start({ x: -300, opacity: 0, transition: { duration: 0.3 } }).then(() => onSwipe("left"));
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const ringColor = candidate.compatibilityScore > 80 ? "text-emerald-500" : candidate.compatibilityScore > 60 ? "text-amber-500" : "text-muted-foreground";

  return (
    <motion.div
      className={cn("glass-card rounded-3xl overflow-hidden w-full max-w-sm aspect-[3/4] absolute shadow-2xl", className)}
      style={{
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        opacity: isFront ? opacity : 1,
        scale: isFront ? 1 : 0.95,
        y: isFront ? 0 : 20,
        zIndex: isFront ? 10 : 0,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={isFront ? { cursor: "grabbing" } : {}}
    >
      {/* Overlays for swipe feedback */}
      {isFront && (
        <>
          <motion.div 
            className="absolute inset-0 bg-emerald-500/20 z-20 flex items-center justify-center"
            style={{ opacity: heartOpacity }}
          >
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 text-emerald-500 flex items-center justify-center rotate-12">
              <span className="text-4xl font-black uppercase">MATCH</span>
            </div>
          </motion.div>
          <motion.div 
            className="absolute inset-0 bg-rose-500/20 z-20 flex items-center justify-center"
            style={{ opacity: crossOpacity }}
          >
            <div className="w-24 h-24 rounded-full border-4 border-rose-500 text-rose-500 flex items-center justify-center -rotate-12">
              <span className="text-4xl font-black uppercase">PASS</span>
            </div>
          </motion.div>
        </>
      )}

      <div className="h-full w-full flex flex-col p-6 relative">
        <div className="absolute top-0 right-0 p-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
              <circle 
                cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="4" 
                strokeDasharray={`${(candidate.compatibilityScore / 100) * 163} 163`}
                className={ringColor}
              />
            </svg>
            <span className="font-bold text-sm">{candidate.compatibilityScore}%</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
          <Avatar className="w-32 h-32 mb-4 border-4 border-white/10 shadow-xl">
            <AvatarImage src={candidate.user.avatarUrl || undefined} />
            <AvatarFallback className="text-3xl bg-primary/20 text-primary">{candidate.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-bold tracking-tight mb-1">{candidate.user.name}</h2>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
            <Briefcase size={14} />
            <span className="capitalize">{candidate.user.role}</span>
            {candidate.timezoneCompatibility !== undefined && (
              <>
                <span className="px-1">•</span>
                <MapPin size={14} />
                <span>Zone match: {candidate.timezoneCompatibility}%</span>
              </>
            )}
          </div>
          
          {candidate.user.bio && (
            <p className="text-sm text-foreground/80 line-clamp-3 mb-6 px-4">
              "{candidate.user.bio}"
            </p>
          )}
        </div>

        <div className="mt-auto space-y-4">
          {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                <Sparkles size={12} />
                Shared Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matchedSkills.slice(0, 4).map(skill => (
                  <Badge key={`match-${skill}`} variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {candidate.complementaryRoles && candidate.complementaryRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <Code2 size={12} />
                Complementary
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.complementaryRoles.slice(0, 4).map(role => (
                  <Badge key={`comp-${role}`} variant="outline" className="border-primary/30 text-primary/90">{role}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
