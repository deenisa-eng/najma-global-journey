import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trash2, Check, Clock, RefreshCw, LayoutDashboard, Calendar, MessageSquare, Settings as SettingsIcon, ChevronRight, Sparkles, Plus, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { formatNGN } from "@/data/packages";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getUmrahDepartures, upsertUmrahDeparture, deleteUmrahDeparture, getHajjPackage, upsertHajjPackage, getPackageTiers, upsertPackageTier, type PackageTier, type TierService } from "@/lib/schedules";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  is_read: boolean;
  resolved: boolean;
  created_at: string;
};

type AdminBooking = {
  id: string;
  created_at: string;
  status: "pending" | "confirmed" | string;
  amount: number;
  service_type: string;
  package_label: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
};

export default function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = useMemo(() => {
    const path = location.pathname;
    if (path === "/admin/departures") return "departures";
    if (path === "/admin/tiers") return "tiers";
    if (path === "/admin/inquiries") return "inquiries";
    if (path === "/admin/settings") return "settings";
    return "dashboard";
  }, [location.pathname]);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");
  const [loading, setLoading] = useState(true);
  const [departures, setDepartures] = useState<any[]>([]);
  const [departureError, setDepartureError] = useState<string | null>(null);
  const [depForm, setDepForm] = useState({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" });
  const [depLoading, setDepLoading] = useState(false);
  const [hajjPackage, setHajjPackage] = useState<any>(null);
  const [hajjForm, setHajjForm] = useState({ title: "", departRoute: "", returnRoute: "", departDate: "", returnDate: "", price: "0", seatsLeft: "0" });
  const [hajjLoading, setHajjLoading] = useState(false);

  const [tierService, setTierService] = useState<TierService>("umrah");
  const [packageTiers, setPackageTiers] = useState<PackageTier[]>([]);
  const [editingTier, setEditingTier] = useState<Partial<PackageTier> | null>(null);
  const [tierLoading, setTierLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const [adminProfile, setAdminProfile] = useState<{ email: string; full_name: string | null; role: string | null } | null>(null);
  const [adminForm, setAdminForm] = useState({ email: "", full_name: "" });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: bData, error: bErr }, { data: iData, error: iErr }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false }),
    ]);

    try {
      const [d, h, t] = await Promise.all([getUmrahDepartures(), getHajjPackage(), getPackageTiers("umrah")]);
      setDepartures(d as any[]);
      setDepartureError(null);
      setHajjPackage(h as any);
      setPackageTiers(t);
      if (h) {
        setHajjForm({
          title: h.title || "",
          departRoute: h.departRoute || "",
          returnRoute: h.returnRoute || "",
          departDate: h.departDate || "",
          returnDate: h.returnDate || "",
          price: String(h.price || 0),
          seatsLeft: String(h.seatsLeft || 0),
        });
      }
    } catch (err: any) {
      setDepartures([]);
      setDepartureError(err?.message ?? "Unable to load data");
    }

    if (bErr) toast.error(`Bookings error: ${bErr.message}`);
    else setBookings(bData ?? []);

    if (iErr) toast.error(`Inquiries error: ${iErr.message}`);
    else setInquiries(iData ?? []);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, fetchData]);

  useEffect(() => {
    if (!user) return;

    const fetchAdminProfile = async () => {
      const { data, error } = await supabase.from("admin_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (error) {
        toast.error(`Admin profile error: ${error.message}`);
        return;
      }
      if (data) {
        setAdminProfile(data);
        setAdminForm({ email: data.email, full_name: data.full_name ?? "" });
      } else {
        setAdminForm({ email: user.email ?? "", full_name: "" });
      }
    };

    void fetchAdminProfile();
  }, [user]);

  const saveAdminDetails = async () => {
    if (!user) return;
    setSavingAdmin(true);

    try {
      if (adminForm.email && adminForm.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: adminForm.email });
        if (authError) {
          toast.error(authError.message);
          return;
        }
      }

      const { error } = await supabase.from("admin_profiles").upsert({
        user_id: user.id,
        email: adminForm.email,
        full_name: adminForm.full_name || null,
      }, { onConflict: "user_id" });

      if (error) {
        toast.error(error.message);
        return;
      }

      setAdminProfile((prev) => ({
        email: adminForm.email,
        full_name: adminForm.full_name || null,
        role: prev?.role ?? "admin",
      }));
      toast.success("Admin details updated");
    } finally {
      setSavingAdmin(false);
    }
  };

  const resetPassword = async () => {
    if (!user) return;
    if (!passwordForm.password.trim()) {
      toast.error("Enter a new password");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords must match");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
    setChangingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setPasswordForm({ password: "", confirmPassword: "" });
    toast.success("Password updated");
  };

  const confirmBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
    toast.success("Booking confirmed");
  };

  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success("Booking deleted");
  };

  const markRead = async (id: string) => {
    const { error } = await supabase.from("contact_inquiries").update({ is_read: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, is_read: true } : i));
  };

  const toggleResolved = async (id: string, current: boolean) => {
    const { error } = await supabase.from("contact_inquiries").update({ resolved: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, resolved: !current } : i));
  };

  const filtered = bookings.filter((b) => filter === "all" || b.status === filter);
  const totals = {
    count: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    revenue: bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + (b.amount ?? 0), 0),
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-fade-in">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-gold">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Total Bookings</div>
          <div className="font-display text-4xl text-foreground">{totals.count}</div>
        </div>
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-amber-500">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Pending</div>
          <div className="font-display text-4xl text-foreground">{totals.pending}</div>
        </div>
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-emerald-500">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Confirmed Revenue</div>
          <div className="font-display text-3xl text-foreground">{formatNGN(totals.revenue)}</div>
        </div>
      </div>

      {/* Bookings table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl flex items-center gap-2">
            Recent Bookings
          </h2>
          <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
            {(["all", "pending", "confirmed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] rounded-md transition-all",
                  filter === f ? "bg-white text-gold shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="glass-card rounded-xl p-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gold/50" />
            <p className="text-muted-foreground">Syncing data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-16 text-center border-dashed">
            <div className="font-display text-xl mb-1">No bookings found</div>
            <p className="text-sm text-muted-foreground">Adjust your filters or wait for new orders.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/20">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-5 font-mono text-[10px] text-gold">{b.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-5">
                        <div className="font-medium capitalize">{b.service_type}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{b.package_label || "—"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium">{b.contact_name}</div>
                        <div className="text-[10px] text-muted-foreground">{b.contact_email}</div>
                      </td>
                      <td className="px-6 py-5 font-medium">{formatNGN(b.amount ?? 0)}</td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold border",
                          b.status === "confirmed" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-amber-500/30 text-amber-500 bg-amber-500/5"
                        )}>
                          {b.status === "confirmed" ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[11px] text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString("en-NG")}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2 justify-end">
                          {b.status === "pending" && (
                            <Button size="sm" variant="outlineGold" className="h-8 text-[10px]" onClick={() => confirmBooking(b.id)}>
                              Confirm
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteBooking(b.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden grid gap-4">
              {filtered.map((b) => (
                <div key={b.id} className="glass-card rounded-xl p-5 border-l-4 border-l-gold">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-[10px] text-gold">{b.id.slice(0, 8).toUpperCase()}</div>
                      <div className="font-display text-lg mt-1">{b.contact_name}</div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border",
                      b.status === "confirmed" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-amber-500/30 text-amber-500 bg-amber-500/5"
                    )}>{b.status}</span>
                  </div>
                  <div className="text-xs space-y-2 mb-4 text-muted-foreground">
                    <div className="flex justify-between"><span>Service:</span> <span className="text-foreground capitalize">{b.service_type}</span></div>
                    <div className="flex justify-between"><span>Amount:</span> <span className="text-foreground font-medium">{formatNGN(b.amount ?? 0)}</span></div>
                    <div className="flex justify-between"><span>Date:</span> <span className="text-foreground">{new Date(b.created_at).toLocaleDateString("en-NG")}</span></div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border/40">
                    {b.status === "pending" && (
                      <Button size="sm" variant="outlineGold" className="flex-1 h-9 text-[10px]" onClick={() => confirmBooking(b.id)}>
                        Confirm
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="flex-1 h-9 text-[10px] text-destructive" onClick={() => deleteBooking(b.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderDepartures = () => (
    <div className="space-y-10 animate-fade-in">
      {departureError && (
        <div className="glass-card rounded-xl p-4 border border-destructive/20 text-sm text-destructive bg-destructive/5">
          Unable to load departures: {departureError}
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
        {/* Umrah Departures */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Umrah Departures</h2>
            <Button size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-widest" onClick={() => setDepForm({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" })}>
              New Departure
            </Button>
          </div>

          <div className="glass-card rounded-xl p-1 overflow-hidden">
            {departures.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                No active departures found.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {departures.map((d) => (
                  <div key={d.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display text-lg">{d.label || "Untitled"}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          {new Date(d.depart).toLocaleDateString()} <ChevronRight className="w-3 h-3" /> {new Date(d.ret).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{d.seatsLeft}</div>
                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">Seats Left</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                          setDepForm({
                            id: d.id,
                            label: d.label || "",
                            depart: d.depart,
                            ret: d.ret,
                            seatsLeft: String(d.seatsLeft ?? 0),
                          });
                        }}>
                          <SettingsIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={async () => {
                          if (confirm("Delete this departure?")) {
                            setDepLoading(true);
                            await deleteUmrahDeparture(d.id);
                            const d2 = await getUmrahDepartures();
                            setDepartures(d2 as any[]);
                            setDepLoading(false);
                            toast.success("Departure removed");
                          }
                        }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-xl p-6 border-t-2 border-t-gold">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gold">
              {depForm.id ? "Edit Departure" : "Add New Departure"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dep-label" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Label</Label>
                <Input
                  id="dep-label"
                  value={depForm.label}
                  onChange={(e) => setDepForm((s) => ({ ...s, label: e.target.value }))}
                  placeholder="e.g. Ramadan Special 2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep-seats" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Available Seats</Label>
                <Input
                  id="dep-seats"
                  type="number"
                  min="0"
                  value={depForm.seatsLeft}
                  onChange={(e) => setDepForm((s) => ({ ...s, seatsLeft: e.target.value }))}
                  placeholder="Seats"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep-start" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Departure Date</Label>
                <Input
                  id="dep-start"
                  type="date"
                  value={depForm.depart}
                  onChange={(e) => setDepForm((s) => ({ ...s, depart: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep-end" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Return Date</Label>
                <Input
                  id="dep-end"
                  type="date"
                  value={depForm.ret}
                  onChange={(e) => setDepForm((s) => ({ ...s, ret: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="gold" className="flex-1" onClick={async () => {
                if (!depForm.label || !depForm.depart || !depForm.ret) {
                  toast.error("Please fill all required fields");
                  return;
                }
                setDepLoading(true);
                const payload = {
                  id: depForm.id || undefined,
                  label: depForm.label,
                  depart: depForm.depart,
                  ret: depForm.ret,
                  seatsLeft: Number(depForm.seatsLeft),
                };
                await upsertUmrahDeparture(payload as any);
                const d2 = await getUmrahDepartures();
                setDepartures(d2 as any[]);
                setDepForm({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" });
                setDepLoading(false);
                toast.success(depForm.id ? "Departure updated" : "Departure added");
              }} disabled={depLoading}>
                {depLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                {depForm.id ? "Save Changes" : "Create Departure"}
              </Button>
              {depForm.id && (
                <Button variant="outline" onClick={() => setDepForm({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" })}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hajj Package */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl">Hajj Package Configuration</h2>
          <div className="glass-card rounded-xl p-6 border-t-2 border-t-gold space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Title</Label>
              <Input
                value={hajjForm.title}
                onChange={(e) => setHajjForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="e.g. Premium Hajj Package 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Depart Route</Label>
                <Input
                  value={hajjForm.departRoute}
                  onChange={(e) => setHajjForm((s) => ({ ...s, departRoute: e.target.value }))}
                  placeholder="LOS - JED"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Return Route</Label>
                <Input
                  value={hajjForm.returnRoute}
                  onChange={(e) => setHajjForm((s) => ({ ...s, returnRoute: e.target.value }))}
                  placeholder="MED - LOS"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Depart Date</Label>
                <Input
                  type="date"
                  value={hajjForm.departDate}
                  onChange={(e) => setHajjForm((s) => ({ ...s, departDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Return Date</Label>
                <Input
                  type="date"
                  value={hajjForm.returnDate}
                  onChange={(e) => setHajjForm((s) => ({ ...s, returnDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Price (NGN)</Label>
                <Input
                  type="number"
                  min="0"
                  value={hajjForm.price}
                  onChange={(e) => setHajjForm((s) => ({ ...s, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Seats Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={hajjForm.seatsLeft}
                  onChange={(e) => setHajjForm((s) => ({ ...s, seatsLeft: e.target.value }))}
                />
              </div>
            </div>
            <div className="pt-4">
              <Button variant="gold" className="w-full" onClick={async () => {
                setHajjLoading(true);
                const payload = {
                  ...hajjPackage,
                  title: hajjForm.title,
                  departRoute: hajjForm.departRoute,
                  returnRoute: hajjForm.returnRoute,
                  departDate: hajjForm.departDate,
                  returnDate: hajjForm.returnDate,
                  price: Number(hajjForm.price),
                  seatsLeft: Number(hajjForm.seatsLeft),
                };
                const updated = await upsertHajjPackage(payload as any);
                setHajjPackage(updated);
                toast.success("Hajj configuration updated");
                setHajjLoading(false);
              }} disabled={hajjLoading}>
                {hajjLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Sync Hajj Package
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderTiers() {
    const serviceLabel = tierService === "umrah" ? "Umrah" : "Travel";

    return (
      <div className="space-y-10 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gold" />
              {serviceLabel} Package Tiers
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["umrah", "travel"] as TierService[]).map((service) => (
                <Button
                  key={service}
                  variant={tierService === service ? "gold" : "outline"}
                  size="sm"
                  onClick={async () => {
                    setTierService(service);
                    setEditingTier(null);
                    setPackageTiers(await getPackageTiers(service));
                  }}
                >
                  {service === "umrah" ? "Umrah" : "Travel & Visas"}
                </Button>
              ))}
            </div>
          </div>

          {!editingTier && (
            <Button onClick={() => setEditingTier({ id: "", service: tierService, tier: "", stars: 4, price: 0, duration: "14 Days", totalSeats: 50, seatsBooked: 0, highlights: [], isFeatured: false })}>
              <Plus className="w-4 h-4 mr-2" /> Add Tier
            </Button>
          )}
        </div>

        {editingTier ? (
          <div className="glass-card rounded-xl p-8 border-t-4 border-t-gold max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl">{editingTier.id ? "Edit Tier" : "Create New Tier"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingTier(null)}>
                <XIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <Label>Service</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["umrah", "travel"] as TierService[]).map((service) => (
                    <Button
                      key={service}
                      variant={editingTier.service === service ? "gold" : "outline"}
                      size="sm"
                      onClick={() => setEditingTier({ ...editingTier, service })}
                    >
                      {service === "umrah" ? "Umrah" : "Travel & Visas"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tier Name (e.g. Economy, Luxury)</Label>
                <Input value={editingTier.tier} onChange={(e) => setEditingTier({ ...editingTier, tier: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stars (4 or 5)</Label>
                <Input type="number" min="4" max="5" value={editingTier.stars} onChange={(e) => setEditingTier({ ...editingTier, stars: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Price (NGN)</Label>
                <Input type="number" value={editingTier.price} onChange={(e) => setEditingTier({ ...editingTier, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (e.g. 14 Days)</Label>
                <Input value={editingTier.duration} onChange={(e) => setEditingTier({ ...editingTier, duration: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Total Capacity</Label>
                <Input type="number" value={editingTier.totalSeats} onChange={(e) => setEditingTier({ ...editingTier, totalSeats: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Seats Booked (Initial Offset)</Label>
                <Input type="number" value={editingTier.seatsBooked} onChange={(e) => setEditingTier({ ...editingTier, seatsBooked: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Highlights (one per line)</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingTier.highlights?.join("\n")}
                  onChange={(e) => setEditingTier({ ...editingTier, highlights: e.target.value.split("\n") })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="featured"
                  checked={editingTier.isFeatured}
                  onCheckedChange={(val) => setEditingTier({ ...editingTier, isFeatured: !!val })}
                />
                <Label htmlFor="featured" className="cursor-pointer">Featured (Most Booked) badge</Label>
              </div>
              {!editingTier.id && (
                <div className="space-y-2">
                  <Label>ID (Internal, e.g. economy-2026)</Label>
                  <Input value={editingTier.id} onChange={(e) => setEditingTier({ ...editingTier, id: e.target.value })} />
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <Button className="flex-1" onClick={async () => {
                if (!editingTier.id || !editingTier.tier) {
                  toast.error("ID and Tier Name are required");
                  return;
                }
                setTierLoading(true);
                try {
                  await upsertPackageTier(editingTier as any);
                  const t = await getPackageTiers(editingTier.service || tierService);
                  setPackageTiers(t);
                  setEditingTier(null);
                  toast.success("Tier saved successfully");
                } catch (err: any) {
                  toast.error(err.message);
                } finally {
                  setTierLoading(false);
                }
              }} disabled={tierLoading}>
                {tierLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Save Tier Data
              </Button>
              <Button variant="outline" onClick={() => setEditingTier(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packageTiers.map((t) => (
              <div key={t.id} className={cn("glass-card rounded-xl p-6 border-l-4", t.isFeatured ? "border-l-gold shadow-gold" : "border-l-border")}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t.stars}★ Package</div>
                    <h3 className="font-display text-2xl text-foreground">{t.tier}</h3>
                    {t.service !== "umrah" && (
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">{t.service === "travel" ? "Travel & Visas" : t.service}</div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTier(t)}>
                    <SettingsIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xl font-display text-gold mb-2">{formatNGN(t.price)}</div>
                <div className="text-xs text-muted-foreground mb-4">{t.duration}</div>
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-[10px] uppercase tracking-tighter">
                    <span className="text-muted-foreground">Booked</span>
                    <span className="text-foreground">{t.seatsBooked} / {t.totalSeats}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${(t.seatsBooked / t.totalSeats) * 100}%` }} />
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Highlights</div>
                <ul className="space-y-1">
                  {t.highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Check className="w-3 h-3 text-gold" /> {h}
                    </li>
                  ))}
                  {t.highlights.length > 3 && <li className="text-[10px] text-muted-foreground italic">+{t.highlights.length - 3} more...</li>}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderInquiries = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl flex items-center gap-3">
          Contact Inquiries
          {inquiries.filter((i) => !i.is_read).length > 0 && (
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full uppercase tracking-tighter">
              {inquiries.filter((i) => !i.is_read).length} new
            </span>
          )}
        </h2>
        <Button variant="ghost" size="sm" onClick={fetchData} className="text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <div className="glass-card rounded-xl p-16 text-center border-dashed">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <div className="font-display text-xl mb-1">Inbox Zero</div>
          <p className="text-sm text-muted-foreground">You don't have any customer inquiries yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((iq) => (
            <div
              key={iq.id}
              className={cn(
                "glass-card rounded-xl p-6 transition-all duration-300",
                !iq.is_read ? "border-l-4 border-l-gold shadow-md" : "border-l-4 border-l-transparent opacity-75",
                iq.resolved && "grayscale-[0.5] opacity-50"
              )}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-display text-xl">{iq.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-muted/50 px-2 py-0.5 rounded">
                      {new Date(iq.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    {iq.resolved && <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em] border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/5">Resolved</span>}
                  </div>
                  <div className="text-sm text-gold font-medium mb-3 flex items-center gap-2">
                    {iq.email} {iq.subject && <><span className="w-1 h-1 rounded-full bg-border" /> <span className="text-muted-foreground">{iq.subject}</span></>}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{iq.message}</p>
                </div>
                <div className="flex md:flex-col gap-2 items-center md:items-end shrink-0 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
                  {!iq.is_read && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => markRead(iq.id)}
                      className="h-8 text-[10px] font-bold uppercase tracking-widest flex-1 md:flex-none"
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleResolved(iq.id, iq.resolved)}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest flex-1 md:flex-none"
                  >
                    {iq.resolved ? "Unresolve" : "Mark Resolved"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="glass-card rounded-xl p-8 border-t-4 border-t-gold">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-border/40">
          <div>
            <h2 className="font-display text-3xl">Profile Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your administrative identity and access.</p>
          </div>
          <div className="rounded-full border border-gold/30 bg-gold/5 px-4 py-1 text-[10px] uppercase font-bold tracking-[0.2em] text-gold">
            Level: {adminProfile?.role ?? "Administrator"}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground">General Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-full-name" className="text-[11px] uppercase tracking-widest font-bold">Display Name</Label>
                <Input
                  id="admin-full-name"
                  value={adminForm.full_name}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-[11px] uppercase tracking-widest font-bold">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@najma.com"
                />
              </div>
              <div className="pt-2">
                <Button onClick={saveAdminDetails} disabled={savingAdmin} className="w-full">
                  {savingAdmin ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Profile
                </Button>
                <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  Important: Changing your email will require re-verification to maintain access to the admin portal.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground">Security & Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-[11px] uppercase tracking-widest font-bold">New Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password-confirm" className="text-[11px] uppercase tracking-widest font-bold">Confirm Password</Label>
                <Input
                  id="admin-password-confirm"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                />
              </div>
              <div className="pt-2">
                <Button variant="outlineGold" onClick={resetPassword} disabled={changingPassword} className="w-full">
                  {changingPassword ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Reset Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="pt-32 pb-12 border-b border-border/40">
          <div className="container-luxe flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" /> Admin Portal
              </div>
              <h1 className="font-display text-4xl sm:text-5xl mb-2 capitalize">
                {currentTab === "dashboard" ? "Dashboard" : currentTab.replace("-", " ")}
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                {currentTab === "dashboard" && "Overview of system activity, revenue metrics, and booking registrations."}
                {currentTab === "departures" && "Manage Umrah schedules and Hajj package configurations."}
                {currentTab === "tiers" && "Configure tiers, pricing, and hotel highlights."}
                {currentTab === "inquiries" && "Review and respond to messages from the website contact form."}
                {currentTab === "settings" && "Configure your administrator profile and security credentials."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="h-10 text-xs px-5 border-border/60 hover:bg-white" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn("w-3.5 h-3.5 mr-2", loading && "animate-spin")} /> Refresh Data
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container-luxe">
            {currentTab === "dashboard" && renderDashboard()}
            {currentTab === "departures" && renderDepartures()}
            {currentTab === "tiers" && renderTiers()}
            {currentTab === "inquiries" && renderInquiries()}
            {currentTab === "settings" && renderSettings()}
          </div>
        </section>
      </div>
    </Layout>
  );
}
