import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth";
import najmaLogo from "@/assets/najma.png";
import heroKaaba from "@/assets/hero-kaaba.jpg";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setErrors({});
    setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = mode === "signin" ? signInSchema : signUpSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      const f: Record<string, string> = {};
      result.error.issues.forEach((i) => { f[i.path[0] as string] = i.message; });
      setErrors(f);
      return;
    }
    setErrors({});
    setLoading(true);

    const { error } = mode === "signin"
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password);

    setLoading(false);

    if (error) { toast.error(error.message); return; }

    if (mode === "signup") {
      toast.success("Account created! Check your email to confirm.");
    } else {
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    }
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
              "Every great journey begins<br />with a single <span className="text-gold italic">step of faith.</span>"
            </blockquote>
            <p className="text-sm text-muted-foreground">Trusted by hundreds of pilgrims and students across Nigeria.</p>
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
            {mode === "signin" ? "Welcome back" : "Get started"}
          </div>
          <h1 className="font-display text-4xl mb-2">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "signin"
              ? "Enter your credentials to access your bookings."
              : "Join Najma Global and start your journey."}
          </p>

          {/* Toggle */}
          <div className="flex rounded-sm border border-border overflow-hidden mb-8">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                  mode === m ? "bg-gold text-gold-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={form.fullName} onChange={set("fullName")} placeholder="Aisha Abdullahi" className="mt-1.5" />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className="mt-1.5" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    Forgot password?
                  </button>
                )}
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

            {mode === "signup" && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="••••••••"
                  className="mt-1.5"
                />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
              className="text-gold hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
