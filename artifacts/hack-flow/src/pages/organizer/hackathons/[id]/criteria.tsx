import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useGetEvaluationCriteria, useCreateEvaluationCriterion, EvaluationCriterion } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonList } from "@/components/shared/SkeletonLoader";
import { Settings, Plus, ArrowLeft, AlertCircle, Save, Percent, Gavel } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function CriteriaBuilderPage() {
  const { id } = useParams();
  const hackathonId = parseInt(id || "0", 10);
  
  const { data: criteria, isLoading, refetch } = useGetEvaluationCriteria(hackathonId, {
    query: { enabled: !!hackathonId } as any,
  });
  
  const createCriterion = useCreateEvaluationCriterion();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCriterion, setNewCriterion] = useState({
    name: "",
    description: "",
    weight: 20,
    maxScore: 10
  });

  const totalWeight = criteria?.reduce((sum, c) => sum + c.weight, 0) || 0;
  const isWeightValid = totalWeight === 100;

  const handleAdd = async () => {
    try {
      await createCriterion.mutateAsync({
        id: hackathonId,
        data: newCriterion
      });
      toast.success("Criterion added successfully");
      setIsAdding(false);
      setNewCriterion({ name: "", description: "", weight: 20, maxScore: 10 });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to add criterion");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["organizer", "admin"]}>
      <DashboardLayout title="Evaluation Criteria">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/8 via-orange-600/4 to-transparent p-7 mb-6"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/8 rounded-full blur-[90px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Gavel size={15} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Jury Matrix</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                Evaluation <span className="text-amber-400">Criteria</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                {criteria?.length
                  ? `${criteria.length} criteria defined. Total weight: `
                  : "Define what juries evaluate. Each criterion has a weight — "}
                <span className={isWeightValid ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                  {totalWeight}%{isWeightValid ? " ✓" : " (must total 100%)"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/organizer/hackathons">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                  <ArrowLeft size={14} /> Back
                </Button>
              </Link>
              {!isAdding && (
                <Button
                  size="sm"
                  onClick={() => setIsAdding(true)}
                  className="shadow-[0_0_15px_rgba(251,191,36,0.2)] bg-amber-600 hover:bg-amber-700 gap-1.5"
                >
                  <Plus size={14} /> Add Criterion
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {!isWeightValid && !isLoading && criteria && criteria.length > 0 && (
          <Alert variant="destructive" className="mb-6 bg-rose-500/10 border-rose-500/20 text-rose-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The total weight of all criteria must equal exactly 100%. Currently it is {totalWeight}%.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <SkeletonList count={3} />
            ) : criteria && criteria.length > 0 ? (
              criteria.map((c, i) => {
                const barWidth = Math.min(100, c.weight);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden"
                  >
                    {/* Weight progress bar */}
                    <div className="h-1 bg-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="p-5 flex gap-4">
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                        <div className="text-lg font-black font-mono text-amber-400 leading-none">{c.weight}</div>
                        <div className="text-[9px] text-amber-400/70 uppercase tracking-wider mt-0.5">%</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-bold text-base text-foreground">{c.name}</h3>
                          <div className="text-xs text-muted-foreground px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg font-mono">
                            Max {c.maxScore} pts
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center p-12 glass-card rounded-2xl border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Settings size={24} className="text-amber-400 opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Criteria Yet</h3>
                <p className="text-muted-foreground text-sm">Add evaluation criteria for the jury to use when scoring projects.</p>
              </div>
            )}
          </div>

          {isAdding && (
            <div className="glass-card p-6 rounded-2xl border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] h-fit sticky top-24">
              <h3 className="text-lg font-bold mb-6">New Criterion</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={newCriterion.name} 
                    onChange={e => setNewCriterion(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Technical Complexity"
                    className="bg-black/20 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newCriterion.description} 
                    onChange={e => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What should the jury look for?"
                    className="bg-black/20 border-white/10 resize-none h-24"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (%)</Label>
                    <Input 
                      type="number"
                      value={newCriterion.weight} 
                      onChange={e => setNewCriterion(prev => ({ ...prev, weight: parseInt(e.target.value, 10) || 0 }))}
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Score</Label>
                    <Input 
                      type="number"
                      value={newCriterion.maxScore} 
                      onChange={e => setNewCriterion(prev => ({ ...prev, maxScore: parseInt(e.target.value, 10) || 0 }))}
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-black/20 border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAdd}
                    disabled={createCriterion.isPending || !newCriterion.name}
                    className="flex-1"
                  >
                    <Save size={16} className="mr-2" /> Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
