import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Clock, Copy, GraduationCap, HeartPulse,
  Plane, Sparkles, User, Mail, Phone, Calendar, RefreshCw,
  BookOpen, MessageCircle, LogOut, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { formatNGN } from "@/data/packages";

// ─── Types ───────────────────────────────────────────────────────────────────

type Booking = {
  id: string;
  service_type: string;
  package_label: string | null;
  amount: number;
  status: "pending" | "confirmed" | string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string | null;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  email: string;
  phone?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, React.ElementType> = {
  hajj: Sparkles,
  umrah: Plane,
  study: GraduationCap,
  medical: HeartPulse,
};

const SERVICE_LABELS: Record<string, string> = {
  hajj: "Hajj",
  umrah: "Umrah",
  study: "Study Abroad",
  medical: "Medical Tourism",
};

function StatusBadge({ status }: { status: string }) {
  const confirmed = status === "confirmed";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border font-medium",
      confirmed ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground bg-secondary/30"
    )}>
      {confirmed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {confirmed ? "Confirmed" : "Pending"}
    </span>
  );
}

function BookingCard({ b, expanded, onToggle }: { b: Booking; expanded: boolean; onToggle: () => void }) {
  const Icon = SERVICE_ICONS[b.service_type] ?? BookOpen;
  return (
    <div className={cn("glass-card rounded-sm transition-all duration-300", expanded && "border-gold/40")}>
      {/* Header row */}
      <button className="w-full p-5 flex items-center gap-4 text-left" onClick={onToggle}>
        <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg leading-tight">
              {b.package_label ?? SERVICE_LABELS[b.service_type] ?? b.service_type}
            </span>
            <StatusBadge status={b.status} />
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {new Date(b.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg text-gold">{b.amount ? formatNGN(b.amount) : "—"}</div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto mt-1" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4 grid sm:grid-cols-2 gap-4 animate-fade-in">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-3.5 h-3.5 shrink-0" /> {b.contact_name}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {b.contact_email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" /> {b.contact_phone}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Booked {new Date(b.created_at).toLocaleString("en-NG")}
            </div>
            {b.notes && (
              <div className="text-muted-foreground italic">"{b.notes}"</div>
            )}
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Ref:</span>
            <span className="font-mono text-xs text-gold">{b.id}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(b.id); toast.success("Copied"); }}
              className="text-muted-foreground hover:text-gold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {b.status === "pending" && (
              <span className="ml-auto text-xs text-muted-foreground">
                Awaiting confirmation — our team will contact you shortly.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Portal() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "pending" | "confirmed">("all");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: bData }, { data: pData }] = await Promise.all([
      supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    setBookings(bData ?? []);
    if (pData) {
      setProfile(pData);
      setProfileForm({ full_name: pData.full_name ?? "", phone: pData.phone ?? "" });
    } else {
      setProfile({ full_name: null, email: user.email ?? "" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [authLoading, user?.id]); // eslint-disable-line

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      email: user.email,
      full_name: profileForm.full_name || null,
      phone: profileForm.phone || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    setProfile((p) => p ? { ...p, full_name: profileForm.full_name, phone: profileForm.phone } : p);
    setEditingProfile(false);
    toast.success("Profile updated");
  };

  const filtered = bookings.filter((b) => tab === "all" || b.status === tab);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const totalSpend = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + (b.amount ?? 0), 0);
  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || null;

  return (
    <Layout>
      {/* Hero strip */}
      <section className="pt-32 pb-10 border-b border-border/60">
        <div className="container-luxe flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-3">My Portal</div>
            <h1 className="font-display text-4xl sm:text-5xl">
              Welcome back,{" "}
              <span className="text-gold italic">
                {displayName ?? user?.email}
              </span>
            </h1>
            {displayName && (
              <p className="text-muted-foreground text-sm mt-2">{user?.email}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-luxe space-y-12">

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: bookings.length, highlight: false },
              { label: "Pending", value: pending, highlight: pending > 0 },
              { label: "Confirmed", value: confirmed, highlight: false },
              { label: "Total Spend", value: totalSpend ? formatNGN(totalSpend) : "—", highlight: false },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-sm p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">{s.label}</div>
                <div className={cn("font-display text-3xl", s.highlight ? "text-amber-400" : "text-gold")}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Bookings — takes 2/3 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">My Bookings</h2>
                <Button asChild variant="gold" size="sm">
                  <Link to="/booking">+ New Booking</Link>
                </Button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {(["all", "pending", "confirmed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTab(f)}
                    className={cn(
                      "px-4 py-1.5 text-xs uppercase tracking-[0.2em] rounded-sm border transition-all",
                      tab === f ? "bg-gold text-gold-foreground border-gold" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f}
                    {f === "pending" && pending > 0 && (
                      <span className="ml-1.5 bg-amber-400 text-background rounded-full w-4 h-4 inline-flex items-center justify-center text-[9px]">
                        {pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="glass-card rounded-sm p-12 text-center text-muted-foreground">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="glass-card rounded-sm p-12 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <div className="font-display text-2xl mb-2">No bookings yet</div>
                  <p className="text-sm text-muted-foreground mb-6">Start your journey with Najma Global.</p>
                  <Button asChild variant="gold">
                    <Link to="/booking">Book a Service <ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((b) => (
                    <BookingCard
                      key={b.id}
                      b={b}
                      expanded={expandedId === b.id}
                      onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar — 1/3 */}
            <div className="space-y-5">

              {/* Profile card */}
              <div className="glass-card rounded-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl">My Profile</h3>
                  <button
                    onClick={() => setEditingProfile((v) => !v)}
                    className="text-xs text-gold hover:underline"
                  >
                    {editingProfile ? "Cancel" : "Edit"}
                  </button>
                </div>

                {editingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fn">Full Name</Label>
                      <Input
                        id="fn"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                        className="mt-1.5"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ph">Phone</Label>
                      <Input
                        id="ph"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                        className="mt-1.5"
                        placeholder="+234 ..."
                      />
                    </div>
                    <Button variant="gold" size="sm" className="w-full" onClick={saveProfile} disabled={savingProfile}>
                      {savingProfile ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div>{profile?.full_name ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="break-all">{user?.email}</div>
                      </div>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Phone</div>
                          <div>{profile.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="glass-card rounded-sm p-6">
                <h3 className="font-display text-xl mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: "Book Hajj", to: "/booking?type=hajj", icon: Sparkles },
                    { label: "Book Umrah", to: "/booking?type=umrah", icon: Plane },
                    { label: "Study Abroad", to: "/booking?type=study", icon: GraduationCap },
                    { label: "Medical Tourism", to: "/booking?type=medical", icon: HeartPulse },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      to={a.to}
                      className="flex items-center justify-between px-4 py-3 rounded-sm border border-border hover:border-gold/50 hover:bg-gold/5 transition-all group"
                    >
                      <span className="flex items-center gap-2.5 text-sm">
                        <a.icon className="w-4 h-4 text-gold" /> {a.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className="glass-card rounded-sm p-6">
                <h3 className="font-display text-xl mb-4">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Our team is available to assist with your booking, documents, or any questions.
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Link to="/contact">
                      <Mail className="w-4 h-4" /> Send a Message
                    </Link>
                  </Button>
                  <a
                    href="https://wa.me/2348167767271"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm rounded-sm bg-gold/10 border border-gold/30 hover:bg-gold/20 transition-colors text-gold"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
