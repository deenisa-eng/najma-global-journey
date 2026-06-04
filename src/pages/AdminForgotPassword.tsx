import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import najmaLogo from "@/assets/najma.png";
import heroKaaba from "@/assets/hero-kaaba.jpg";

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "sent">("idle");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendResetEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim()) {
      setFormError("Please enter your admin email.");
      return;
    }

    setSubmissionState("sending");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/forgot-password`,
    });
    setSubmissionState("idle");

    if (error) {
      toast.error(error.message);
      return;
    }

    setSubmissionState("sent");
    toast.success("Password reset email sent.");
  };

  const resetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setFormError("Enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setResetting(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setResetting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully. Please sign in.");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-svh flex">
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
              "Reset your admin access<br />and stay in control of the portal."
            </blockquote>
            <p className="text-sm text-muted-foreground">Secure password recovery for authenticated staff.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="eyebrow">Admin Recovery</div>
            <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 inline-block mr-1 align-middle" /> Back to login
            </Link>
          </div>

          <h1 className="font-display text-4xl mb-2">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {recoveryMode
              ? "Choose a new password to complete reset."
              : "Enter your admin email to receive a password reset link."}
          </p>

          {recoveryMode ? (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5"
                />
              </div>
              {formError && <p className="text-xs text-destructive mt-1">{formError}</p>}
              <Button variant="gold" size="lg" className="w-full mt-2" disabled={resetting}>
                {resetting ? "Updating password…" : "Reset password"}
              </Button>
            </form>
          ) : (
            <form onSubmit={sendResetEmail} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@najma.com"
                  className="mt-1.5"
                />
              </div>
              {formError && <p className="text-xs text-destructive mt-1">{formError}</p>}
              <Button variant="gold" size="lg" className="w-full mt-2" disabled={submissionState === "sending"}>
                {submissionState === "sending" ? "Sending…" : submissionState === "sent" ? "Sent!" : "Send reset email"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
