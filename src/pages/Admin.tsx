import { useEffect, useState, useCallback } from "react";
import { Trash2, Check, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatNGN } from "@/data/packages";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getUmrahDepartures, upsertUmrahDeparture, deleteUmrahDeparture } from "@/lib/schedules";

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
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");
  const [loading, setLoading] = useState(true);
  const [departures, setDepartures] = useState<any[]>([]);
  const [depForm, setDepForm] = useState({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" });
  const [depLoading, setDepLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [{ data: bData, error: bErr }, { data: iData, error: iErr }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false }),
    ]);

    // fetch departures too
    try {
      const d = await getUmrahDepartures();
      setDepartures(d as any[]);
    } catch (e) {
      // ignore
    }

    if (bErr) toast.error(`Bookings error: ${bErr.message}`);
    else setBookings(bData ?? []);

    if (iErr) toast.error(`Inquiries error: ${iErr.message}`);
    else setInquiries(iData ?? []);

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  return (
    <Layout>
      <section className="pt-32 pb-10">
        <div className="container-luxe flex items-end justify-between">
          <div>
            <div className="eyebrow mb-4">Admin Portal</div>
            <h1 className="font-display text-4xl sm:text-5xl mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Live booking metrics and contact inquiries.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxe">

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="glass-card rounded-sm p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Total Bookings</div>
              <div className="font-display text-4xl text-gold">{totals.count}</div>
            </div>
            <div className="glass-card rounded-sm p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Pending</div>
              <div className="font-display text-4xl text-gold">{totals.pending}</div>
            </div>
            <div className="glass-card rounded-sm p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Confirmed Revenue</div>
              <div className="font-display text-3xl text-gold">{formatNGN(totals.revenue)}</div>
            </div>
          </div>

          {/* Manage Umrah Departures */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-3xl">Manage Umrah Departures</h2>
            </div>
            <div className="grid gap-3 mb-4">
              {departures.map((d) => (
                <div key={d.id} className="glass-card rounded-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="font-display">{d.label}</div>
                    <div className="text-xs text-muted-foreground">{new Date(d.depart).toLocaleDateString()} → {new Date(d.ret).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{d.seatsLeft} seats</div>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      setDepLoading(true);
                      await deleteUmrahDeparture(d.id);
                      const d2 = await getUmrahDepartures();
                      setDepartures(d2 as any[]);
                      setDepLoading(false);
                    }}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-sm p-6">
              <div className="grid sm:grid-cols-4 gap-3">
                <input value={depForm.label} onChange={(e) => setDepForm((s) => ({ ...s, label: e.target.value }))} placeholder="Label (e.g. July 2026)" className="input" />
                <input value={depForm.depart} onChange={(e) => setDepForm((s) => ({ ...s, depart: e.target.value }))} placeholder="YYYY-MM-DD" className="input" />
                <input value={depForm.ret} onChange={(e) => setDepForm((s) => ({ ...s, ret: e.target.value }))} placeholder="YYYY-MM-DD" className="input" />
                <input value={depForm.seatsLeft} onChange={(e) => setDepForm((s) => ({ ...s, seatsLeft: e.target.value }))} placeholder="Seats" className="input" />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="gold" onClick={async () => {
                  setDepLoading(true);
                  const payload = { label: depForm.label, depart: depForm.depart, ret: depForm.ret, seatsLeft: Number(depForm.seatsLeft) };
                  await upsertUmrahDeparture(payload as any);
                  const d2 = await getUmrahDepartures();
                  setDepartures(d2 as any[]);
                  setDepForm({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" });
                  setDepLoading(false);
                }} disabled={depLoading}>Save</Button>
                <Button variant="outline" onClick={() => setDepForm({ id: "", label: "", depart: "", ret: "", seatsLeft: "0" })}>Reset</Button>
              </div>
            </div>
          </div>

          {/* Inquiries */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display text-3xl">Contact Inquiries</h2>
              {inquiries.filter((i) => !i.is_read).length > 0 && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                  {inquiries.filter((i) => !i.is_read).length} new
                </span>
              )}
            </div>
            {inquiries.length === 0 ? (
              <div className="glass-card rounded-sm p-8 text-center text-muted-foreground">No inquiries yet.</div>
            ) : (
              <div className="grid gap-3">
                {inquiries.map((iq) => (
                  <div
                    key={iq.id}
                    className={cn(
                      "glass-card rounded-sm p-5 flex justify-between gap-4",
                      !iq.is_read && "border-l-4 border-l-destructive",
                      iq.resolved && "opacity-60"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-display text-lg">{iq.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(iq.created_at).toLocaleString("en-NG")}</span>
                        {iq.resolved && <span className="text-xs text-gold uppercase tracking-widest">Resolved</span>}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {iq.email}{iq.subject ? ` · ${iq.subject}` : ""}
                      </div>
                      <p className="text-sm leading-relaxed">{iq.message}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end shrink-0">
                      {!iq.is_read && (
                        <button
                          onClick={() => markRead(iq.id)}
                          className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => toggleResolved(iq.id, iq.resolved)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {iq.resolved ? "Unresolve" : "Resolve"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(["all", "pending", "confirmed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-[0.22em] rounded-sm border transition-all",
                  filter === f ? "bg-gold text-gold-foreground border-gold" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Bookings table */}
          {loading ? (
            <div className="glass-card rounded-sm p-16 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-sm p-16 text-center">
              <div className="font-display text-2xl mb-2">No bookings</div>
              <p className="text-sm text-muted-foreground">No bookings match this filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block glass-card rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border">
                      <th className="px-5 py-4">Reference</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Package</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                        <td className="px-5 py-4 font-mono text-xs text-gold">{b.id.slice(0, 12)}…</td>
                        <td className="px-5 py-4 capitalize">{b.service_type}</td>
                        <td className="px-5 py-4">
                          <div>{b.contact_name}</div>
                          <div className="text-xs text-muted-foreground">{b.contact_email} · {b.contact_phone}</div>
                        </td>
                        <td className="px-5 py-4 text-sm">{b.package_label || "—"}</td>
                        <td className="px-5 py-4">{formatNGN(b.amount ?? 0)}</td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border",
                            b.status === "confirmed" ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground"
                          )}>
                            {b.status === "confirmed" ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {new Date(b.created_at).toLocaleDateString("en-NG")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 justify-end">
                            {b.status === "pending" && (
                              <Button size="sm" variant="outlineGold" onClick={() => confirmBooking(b.id)}>
                                Confirm
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => deleteBooking(b.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden grid gap-3">
                {filtered.map((b) => (
                  <div key={b.id} className="glass-card rounded-sm p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-mono text-xs text-gold">{b.id.slice(0, 12)}…</div>
                        <div className="font-display text-lg mt-1">{b.contact_name}</div>
                        <div className="text-xs text-muted-foreground">{b.contact_email}</div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] uppercase border",
                        b.status === "confirmed" ? "border-gold text-gold" : "border-border text-muted-foreground"
                      )}>{b.status}</span>
                    </div>
                    <div className="text-sm space-y-1 mb-4">
                      <div><span className="text-muted-foreground">Package:</span> {b.package_label || "—"}</div>
                      <div><span className="text-muted-foreground">Amount:</span> {formatNGN(b.amount ?? 0)}</div>
                      <div><span className="text-muted-foreground">Date:</span> {new Date(b.created_at).toLocaleDateString("en-NG")}</div>
                    </div>
                    <div className="flex gap-2">
                      {b.status === "pending" && (
                        <Button size="sm" variant="outlineGold" className="flex-1" onClick={() => confirmBooking(b.id)}>
                          Confirm
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteBooking(b.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </section>
    </Layout>
  );
}
