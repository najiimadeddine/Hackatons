import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuthStore } from "@/store/authStore";
import { useLocation, Link } from "wouter";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();
  const login = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await login.mutateAsync({ data: values });
      setAuth(res.user, res.accessToken);
      toast.success("Welcome back!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    }
  }

  return (
    <AuthLayout title="Log in to Hack-Flow" subtitle="Enter your credentials to access your workspace.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                  <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} className="bg-black/20 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <div />
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full h-11 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-1" disabled={login.isPending}>
            {login.isPending ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            Sign In
            {!login.isPending && <ArrowRight size={18} className="ml-2" />}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </div>
    </AuthLayout>
  );
}
