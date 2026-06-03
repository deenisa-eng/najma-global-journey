import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";
import najmaLogo from "@/assets/najma.png";
import heroKaaba from "@/assets/hero-kaaba.jpg";
import { useAuth } from "@/hooks/useAuth";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAdmin } = useAuth();
  const from = (location.state as { from?: string })?.from ?? "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/portal", { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signInSchema.safeParse(form);
    if (!result.success) {
      const f: Record<string, string> = {};
      result.error.issues.forEach((i) => { f[i.path[0] as string] = i.message; });
      setErrors(f);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { error } = await signIn(form.email, form.password);

    setSubmitting(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-svh flex">
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroKaaba} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <img src={najmaLogo} alt="Najma Global" className="w-12 h-12 object-contain bg-white/90 rounded-full p-1" />
            <div className="leading-tight">
              <div className="font-display text-xl text-foreground">Najma <span className="text-gold">Global</span></div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Tours & Consulting</div>
            </div>
          </Link>
          <div>
            <blockquote className="font-display text-3xl leading-snug mb-4">
              "Manage your journey<br />with <span className="text-gold italic">admin access.</span>"
            </blockquote>
            <p className="text-sm text-muted-foreground">Secure admin portal for Najma Global staff.</p>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <Link to="/" className="flex lg:hidden items-center gap-3 mb-10">
          <img src={najmaLogo} alt="Najma Global" className="w-10 h-10 object-contain bg-white/90 rounded-full p-1" />
          <div className="font-display text-xl">Najma <span className="text-gold">Global</span></div>
        </Link>

        <div className="w-full max-w-sm">
          <div className="eyebrow mb-3">
            Admin Portal
          </div>
          <h1 className="font-display text-4xl mb-2">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Enter your credentials to access the admin dashboard.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className="mt-1.5" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? "Please wait…" : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
