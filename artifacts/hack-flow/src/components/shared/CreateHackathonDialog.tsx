import { useState } from "react";
import { useCreateHackathon, useUpdateHackathon, Hackathon, HackathonInput } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Plus, X, Trophy, Calendar, Users, Code2 } from "lucide-react";

interface CreateHackathonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathon?: Hackathon;
  onSuccess?: (hackathon: Hackathon) => void;
}

const TECH_SUGGESTIONS = ["React", "Node.js", "Python", "TypeScript", "Go", "Rust", "Vue.js", "Flutter", "ML/AI", "Web3", "GraphQL", "Docker"];

export function CreateHackathonDialog({ open, onOpenChange, hackathon, onSuccess }: CreateHackathonDialogProps) {
  const isEditing = !!hackathon;
  const createHackathon = useCreateHackathon();
  const updateHackathon = useUpdateHackathon();

  const [title, setTitle] = useState(hackathon?.title || "");
  const [description, setDescription] = useState(hackathon?.description || "");
  const [bannerUrl, setBannerUrl] = useState(hackathon?.bannerUrl || "");
  const [startDate, setStartDate] = useState(hackathon?.startDate ? hackathon.startDate.slice(0, 10) : "");
  const [endDate, setEndDate] = useState(hackathon?.endDate ? hackathon.endDate.slice(0, 10) : "");
  const [registrationDeadline, setRegistrationDeadline] = useState(
    hackathon?.registrationDeadline ? hackathon.registrationDeadline.slice(0, 10) : ""
  );
  const [minTeamSize, setMinTeamSize] = useState(hackathon?.minTeamSize || 1);
  const [maxTeamSize, setMaxTeamSize] = useState(hackathon?.maxTeamSize || 4);
  const [maxParticipants, setMaxParticipants] = useState(hackathon?.maxParticipants || 200);
  const [prizePool, setPrizePool] = useState(hackathon?.prizePool || "");
  const [techStack, setTechStack] = useState<string[]>(hackathon?.techStack || []);
  const [techInput, setTechInput] = useState("");

  const isLoading = createHackathon.isPending || updateHackathon.isPending;

  const addTech = (tech: string) => {
    const t = tech.trim();
    if (t && !techStack.includes(t)) setTechStack(prev => [...prev, t]);
    setTechInput("");
  };

  const removeTech = (tech: string) => setTechStack(prev => prev.filter(t => t !== tech));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload: HackathonInput = {
      title: title.trim(),
      description: description.trim(),
      bannerUrl: bannerUrl.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
      minTeamSize: Number(minTeamSize),
      maxTeamSize: Number(maxTeamSize),
      maxParticipants: Number(maxParticipants) || undefined,
      prizePool: prizePool.trim() || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    };

    try {
      let result: Hackathon;
      if (isEditing && hackathon) {
        result = await updateHackathon.mutateAsync({ id: hackathon.id, data: payload });
        toast.success("Hackathon updated successfully");
      } else {
        result = await createHackathon.mutateAsync({ data: payload });
        toast.success("Hackathon created! You can now add evaluation criteria and milestones.");
      }
      onSuccess?.(result);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEditing ? "update" : "create"} hackathon`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-card border-white/10 p-0 overflow-hidden bg-[#0B0F19] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-5 border-b border-white/10 bg-black/20 shrink-0">
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Trophy size={18} className="text-primary" />
            </div>
            {isEditing ? "Edit Hackathon" : "Create New Hackathon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Basic Info</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Title <span className="text-rose-400">*</span></label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Global AI Hackathon 2026"
                    required
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description <span className="text-rose-400">*</span></label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the hackathon theme, goals, and what participants will build..."
                    required
                    className="min-h-[100px] resize-none bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Banner Image URL</label>
                  <Input
                    value={bannerUrl}
                    onChange={e => setBannerUrl(e.target.value)}
                    placeholder="https://... (optional)"
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Registration Deadline</label>
                  <Input
                    type="date"
                    value={registrationDeadline}
                    onChange={e => setRegistrationDeadline(e.target.value)}
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Start Date <span className="text-rose-400">*</span></label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">End Date <span className="text-rose-400">*</span></label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Team config */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Users size={14} /> Team Configuration
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Min Team Size</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={minTeamSize}
                    onChange={e => setMinTeamSize(Number(e.target.value))}
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Max Team Size</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={maxTeamSize}
                    onChange={e => setMaxTeamSize(Number(e.target.value))}
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Max Participants</label>
                  <Input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={e => setMaxParticipants(Number(e.target.value))}
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Prizes & Tech */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Code2 size={14} /> Prizes & Tech Stack
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prize Pool</label>
                  <Input
                    value={prizePool}
                    onChange={e => setPrizePool(e.target.value)}
                    placeholder="e.g. $10,000 in prizes"
                    className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Allowed Technologies</label>
                  <div className="flex gap-2">
                    <Input
                      value={techInput}
                      onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTech(techInput); } }}
                      placeholder="Add technology (Enter)"
                      className="flex-1 bg-black/20 border-white/10 focus-visible:ring-primary/50"
                    />
                    <Button type="button" variant="outline" onClick={() => addTech(techInput)} disabled={!techInput.trim()} className="border-white/10">
                      <Plus size={16} />
                    </Button>
                  </div>
                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {techStack.map(t => (
                        <Badge key={t} variant="outline" className="border-cyan-500/20 bg-cyan-500/10 text-cyan-400 pr-1">
                          {t}
                          <button type="button" onClick={() => removeTech(t)} className="ml-1 hover:bg-cyan-500/20 rounded-full p-0.5">
                            <X size={10} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {TECH_SUGGESTIONS.filter(s => !techStack.includes(s)).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addTech(s)}
                        className="text-xs px-2 py-0.5 rounded border border-white/10 bg-white/5 text-muted-foreground hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/10 bg-black/20 shrink-0 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 text-muted-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Hackathon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
