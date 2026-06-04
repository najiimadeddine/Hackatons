import { useState, useEffect } from "react";
import { EvaluationCriterion, EvaluationInput, CriterionScore } from "@workspace/api-client-react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

interface EvaluationMatrixProps {
  criteria: EvaluationCriterion[];
  onSubmit: (evaluation: EvaluationInput) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const color = pct >= 0.8 ? "#10b981" : pct >= 0.6 ? "#f59e0b" : pct >= 0.3 ? "#60a5fa" : "#6b7280";
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
      />
    </svg>
  );
}

export function EvaluationMatrix({ criteria, onSubmit, isSubmitting = false, className }: EvaluationMatrixProps) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const initialScores: Record<number, number> = {};
    criteria.forEach(c => { initialScores[c.id] = 0; });
    setScores(initialScores);
  }, [criteria]);

  const handleScoreChange = (id: number, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const totalScore = criteria.reduce((sum, c) => {
    const rawScore = scores[c.id] || 0;
    return sum + (rawScore / c.maxScore) * c.weight;
  }, 0);

  const handleSubmit = () => {
    const scoreArray: CriterionScore[] = Object.entries(scores).map(([id, score]) => ({
      criterionId: parseInt(id, 10),
      score
    }));
    onSubmit({ scores: scoreArray, feedback });
  };

  const scoreColor = totalScore >= 80 ? "text-emerald-400" : totalScore >= 60 ? "text-amber-400" : "text-primary";
  const scoreShadow = totalScore >= 80
    ? "shadow-[0_0_30px_rgba(16,185,129,0.2)]"
    : totalScore >= 60
    ? "shadow-[0_0_30px_rgba(245,158,11,0.2)]"
    : "shadow-[0_0_30px_rgba(65,130,255,0.15)]";

  return (
    <div className={cn("flex flex-col h-full gap-5", className)}>

      {/* Total Score Header */}
      <div className={cn(
        "glass-card rounded-2xl border border-white/[0.08] p-5 flex items-center justify-between",
        scoreShadow
      )}>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Weighted Score</p>
          <div className={`text-5xl font-black font-mono tabular-nums tracking-tight ${scoreColor}`}>
            {totalScore.toFixed(1)}
            <span className="text-xl text-muted-foreground font-sans font-normal">/100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{criteria.length} criteria · jury matrix</p>
        </div>

        {/* Radial gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={totalScore >= 80 ? "#10b981" : totalScore >= 60 ? "#f59e0b" : "#60a5fa"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * (1 - totalScore / 100)}
              style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-black font-mono ${scoreColor}`}>{Math.round(totalScore)}</span>
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-none">
        {criteria.map((criterion, i) => {
          const currentScore = scores[criterion.id] || 0;
          const pct = criterion.maxScore > 0 ? currentScore / criterion.maxScore : 0;
          const barColor = pct >= 0.8 ? "from-emerald-500 to-emerald-400" : pct >= 0.6 ? "from-amber-500 to-amber-400" : "from-blue-500 to-blue-400";

          return (
            <motion.div
              key={criterion.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden"
            >
              {/* Top weight bar */}
              <div className="h-0.5 bg-white/5">
                <div
                  className={`h-full bg-gradient-to-r ${barColor} transition-all duration-400`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{criterion.name}</div>
                    {criterion.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{criterion.description}</div>
                    )}
                  </div>
                  <div className="shrink-0 relative">
                    <ScoreRing score={currentScore} max={criterion.maxScore} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black font-mono text-foreground">{currentScore}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">0</span>
                  <div className="flex-1">
                    <Slider
                      value={[currentScore]}
                      max={criterion.maxScore}
                      step={1}
                      onValueChange={vals => handleScoreChange(criterion.id, vals[0])}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{criterion.maxScore}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-white/5 border border-white/8 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {criterion.weight}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Feedback */}
        <div className="pt-1">
          <label className="block text-sm font-semibold mb-2 text-foreground">
            Jury Feedback <span className="text-rose-400">*</span>
          </label>
          <Textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Provide constructive, detailed feedback for the team..."
            className="min-h-[120px] resize-none bg-black/20 border-white/10 focus-visible:ring-primary/40 text-sm leading-relaxed"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {feedback.length} chars · feedback is shared with the team after evaluation
          </p>
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !feedback.trim()}
        className="w-full h-12 text-base font-bold shadow-[0_0_20px_rgba(65,130,255,0.25)] hover:shadow-[0_0_35px_rgba(65,130,255,0.45)] transition-all gap-2"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Submitting…</>
        ) : (
          <><CheckCircle2 size={16} /> Submit Evaluation</>
        )}
      </Button>
    </div>
  );
}
