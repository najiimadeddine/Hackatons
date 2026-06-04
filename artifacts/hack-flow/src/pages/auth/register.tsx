import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, RegisterInputRole } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Loader2, Code2, Sparkles, Gavel, UserCog } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["participant", "organizer", "mentor", "jury"] as const)
});

const roles = [
  { id: "participant", label: "Participant", icon: Code2, desc: "Join teams and build projects" },
  { id: "organizer", label: "Organizer", icon: Sparkles, desc: "Create and manage hackathons" },
  { id: "mentor", label: "Mentor", icon: UserCog, desc: "Guide and help participants" },
  { id: "jury", label: "Jury", icon: Gavel, desc: "Evaluate submitted projects" },
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const registerUser = useRegister();
  const [selectedRole, setSelectedRole] = useState<string>("participant");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "participant"
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await registerUser.mutateAsync({ 
        data: {
          ...values,
          role: values.role as RegisterInputRole
        } 
      });
      toast.success("Account created! Please log in.");
      setLocation("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Join the elite hackathon network.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map(role => (
              <button
                type="button"
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  form.setValue("role", role.id as any);
                }}
                className={cn(
                  "p-3 rounded-xl border text-left flex flex-col items-start gap-2 transition-all",
                  selectedRole === role.id 
                    ? "bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                    : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-black/30"
                )}
              >
                <div className={cn("p-2 rounded-lg", selectedRole === role.id ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground")}>
                  <role.icon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-sm">{role.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{role.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="John Doe" {...field} className="bg-black/20 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input autoComplete="email" placeholder="you@example.com" {...field} className="bg-black/20 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} className="bg-black/20 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full h-11 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2" disabled={registerUser.isPending}>
            {registerUser.isPending ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            Create Account
            {!registerUser.isPending && <ArrowRight size={18} className="ml-2" />}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
