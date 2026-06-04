import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { useUpdateUser, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  User, Github, Linkedin, Globe, Plus, X, Save, Loader2,
  Shield, Calendar, Mail, Sparkles, Star
} from "lucide-react";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo",
  "Australia/Sydney", "Pacific/Auckland"
];

const SKILL_SUGGESTIONS = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Rust", "Vue.js", "Angular",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MongoDB",
  "GraphQL", "REST API", "Machine Learning", "UI/UX", "Figma", "Swift", "Kotlin",
  "Flutter", "React Native", "Solidity", "Web3", "DevOps", "CI/CD"
];

export default function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const { data: freshUser, refetch } = useGetMe();
  const updateUser = useUpdateUser();
  const qc = useQueryClient();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (freshUser) {
      setName(freshUser.name || "");
      setBio(freshUser.bio || "");
      setGithubUrl(freshUser.githubUrl || "");
      setLinkedinUrl(freshUser.linkedinUrl || "");
      setTimezone(freshUser.timezone || "UTC");
      setSkills(freshUser.skills || []);
    }
  }, [freshUser]);

  const markDirty = () => setIsDirty(true);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      markDirty();
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
    markDirty();
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const updated = await updateUser.mutateAsync({
        id: user.id,
        data: { name, bio, githubUrl, linkedinUrl, timezone, skills }
      });
      // Update auth store with new user data while preserving token
      if (accessToken) {
        setAuth(updated, accessToken);
      }
      await qc.invalidateQueries();
      setIsDirty(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const currentUser = freshUser || user;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Profile & Settings">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-violet-600/5 to-transparent p-7"
          >
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.025] pointer-events-none" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/6 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/40 shadow-[0_0_30px_rgba(65,130,255,0.25)]">
                  <AvatarImage src={currentUser?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black">
                    {currentUser?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-background shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">Profile</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 truncate">{currentUser?.name}</h2>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail size={13} />
                    <span>{currentUser?.email}</span>
                  </div>
                  <span className="text-white/20">·</span>
                  <Badge variant="outline" className="capitalize border-primary/30 text-primary bg-primary/10 text-[11px]">
                    <Shield size={9} className="mr-1" />
                    {currentUser?.role}
                  </Badge>
                  <span className="text-white/20">·</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>Joined {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
                  </div>
                </div>
              </div>

              {isDirty && (
                <Button
                  onClick={handleSave}
                  disabled={updateUser.isPending}
                  className="shrink-0 shadow-[0_0_25px_rgba(65,130,255,0.35)] bg-primary hover:bg-primary/90"
                >
                  {updateUser.isPending ? (
                    <Loader2 size={15} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={15} className="mr-2" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>

            {/* Skills preview bar */}
            {(currentUser?.skills || []).length > 0 && (
              <div className="relative z-10 mt-5 pt-5 border-t border-white/[0.08] flex flex-wrap gap-1.5">
                {(currentUser?.skills || []).slice(0, 8).map((skill: string) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-[11px] text-muted-foreground font-mono">
                    <Star size={8} className="text-primary" />
                    {skill}
                  </span>
                ))}
                {(currentUser?.skills || []).length > 8 && (
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] text-muted-foreground">
                    +{(currentUser?.skills || []).length - 8} more
                  </span>
                )}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Basic info */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <Input
                      value={name}
                      onChange={e => { setName(e.target.value); markDirty(); }}
                      placeholder="Your full name"
                      className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={e => { setBio(e.target.value); markDirty(); }}
                      placeholder="Tell others about yourself — your background, interests, and what you're looking for in hackathons..."
                      className="min-h-[120px] resize-none bg-black/20 border-white/10 focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                    <select
                      value={timezone}
                      onChange={e => { setTimezone(e.target.value); markDirty(); }}
                      className="w-full h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz} className="bg-background">{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  Skills & Expertise
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Add a skill (press Enter)"
                      className="flex-1 bg-black/20 border-white/10 focus-visible:ring-primary/50"
                    />
                    <Button
                      variant="outline"
                      onClick={() => addSkill(newSkill)}
                      disabled={!newSkill.trim()}
                      className="border-white/10 hover:border-primary/30"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-primary/20 bg-primary/10 text-primary pr-1 hover:border-primary/40 transition-colors"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 12).map(s => (
                        <button
                          key={s}
                          onClick={() => addSkill(s)}
                          className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                <h3 className="font-bold text-lg">Social Links</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Github size={14} /> GitHub
                    </label>
                    <Input
                      value={githubUrl}
                      onChange={e => { setGithubUrl(e.target.value); markDirty(); }}
                      placeholder="https://github.com/username"
                      className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Linkedin size={14} /> LinkedIn
                    </label>
                    <Input
                      value={linkedinUrl}
                      onChange={e => { setLinkedinUrl(e.target.value); markDirty(); }}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Achievement badges */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-amber-400">🏅</span> Achievements
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { emoji: "🏆", label: "Winner",    color: "bg-amber-500/10 border-amber-500/25",  earned: true  },
                    { emoji: "🔥", label: "On Fire",   color: "bg-orange-500/10 border-orange-500/25", earned: true  },
                    { emoji: "⚡", label: "Fast Ship", color: "bg-yellow-500/10 border-yellow-500/25", earned: true  },
                    { emoji: "🤝", label: "Team MVP",  color: "bg-emerald-500/10 border-emerald-500/25",earned: false },
                    { emoji: "🧠", label: "Innovator", color: "bg-violet-500/10 border-violet-500/25", earned: false },
                    { emoji: "🌟", label: "All-Star",  color: "bg-blue-500/10 border-blue-500/25",    earned: false },
                  ].map(a => (
                    <div
                      key={a.label}
                      className={`rounded-xl p-2.5 border text-center transition-all ${a.earned ? a.color : "bg-white/[0.02] border-white/[0.06] opacity-40 grayscale"}`}
                    >
                      <div className="text-xl mb-1">{a.emoji}</div>
                      <div className="text-[10px] font-medium text-muted-foreground">{a.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile strength */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="font-bold text-lg">Profile Strength</h3>
                {(() => {
                  const checks = [
                    { label: "Name set", done: !!name.trim() },
                    { label: "Bio written", done: !!bio.trim() },
                    { label: "Skills added", done: skills.length > 0 },
                    { label: "GitHub linked", done: !!githubUrl.trim() },
                    { label: "LinkedIn linked", done: !!linkedinUrl.trim() },
                  ];
                  const score = checks.filter(c => c.done).length;
                  const pct = (score / checks.length) * 100;
                  return (
                    <>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{score}/{checks.length} complete</span>
                        <span className={`font-bold ${pct === 100 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                        />
                      </div>
                      <ul className="space-y-2 mt-4">
                        {checks.map(c => (
                          <li key={c.label} className={`flex items-center gap-2 text-sm ${c.done ? "text-foreground" : "text-muted-foreground"}`}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${c.done ? "bg-emerald-500/20 border-emerald-500/50" : "bg-white/5 border-white/20"}`}>
                              {c.done && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                            </div>
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()}
              </div>

              {isDirty && (
                <Button
                  onClick={handleSave}
                  disabled={updateUser.isPending}
                  className="w-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  {updateUser.isPending ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Save Changes
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
