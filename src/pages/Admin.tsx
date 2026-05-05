import { useEffect, useState } from "react";
import { Trash2, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Booking, deleteBooking, formatNGN, getBookings, updateBookingStatus } from "@/data/packages";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  const refresh = () => setBookings(getBookings());
  useEffect(() => { refresh(); }, []);

  const filtered = bookings.filter((b) => filter === "all" ? true : b.status === filter);
  const totals = {
    count: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    revenue: bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.amount, 0),
  };

  return (
    <Layout>
      <section className="pt-32 pb-10">
        <div className="container-luxe">
          <div className="eyebrow mb-4">Admin</div>
          <h1 className="font-display text-4xl sm:text-5xl mb-2">Bookings Dashboard</h1>
          <p className="text-muted-foreground text-sm">Mock dashboard — bookings stored locally in your browser.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxe">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="glass-card rounded-sm p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Total bookings</div>
              <div className="font-display text-4xl text-gold">{totals.count}</div>
            </div>
            <div className="glass-card rounded-sm p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Pending</div>
              <div className="font-display text-4xl text-gold">{totals.pending}</div>
            </div>
            <div className="glass-card rounded-sm p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Confirmed revenue</div>
              <div className="font-display text-3xl text-gold">{formatNGN(totals.revenue)}</div>
            </div>
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

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="glass-card rounded-sm p-16 text-center">
              <div className="font-display text-2xl mb-2">No bookings yet</div>
              <p className="text-sm text-muted-foreground">Submit a booking from the booking page to see it here.</p>
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
                      <th className="px-5 py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr key={b.id} className="border-b border-border/50">
                        <td className="px-5 py-4 font-mono text-xs text-gold">{b.id}</td>
                        <td className="px-5 py-4 capitalize">{b.type}</td>
                        <td className="px-5 py-4">
                          <div>{b.fullName}</div>
                          <div className="text-xs text-muted-foreground">{b.email} · {b.phone}</div>
                        </td>
                        <td className="px-5 py-4">{b.packageLabel}</td>
                        <td className="px-5 py-4">{b.amount ? formatNGN(b.amount) : "—"}</td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border",
                            b.status === "confirmed" ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground"
                          )}>
                            {b.status === "confirmed" ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 justify-end">
                            {b.status === "pending" && (
                              <Button size="sm" variant="outlineGold" onClick={() => { updateBookingStatus(b.id, "confirmed"); refresh(); toast.success("Booking confirmed"); }}>
                                Confirm
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => { deleteBooking(b.id); refresh(); }}>
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
                        <div className="font-mono text-xs text-gold">{b.id}</div>
                        <div className="font-display text-lg mt-1">{b.fullName}</div>
                        <div className="text-xs text-muted-foreground">{b.email}</div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] uppercase border",
                        b.status === "confirmed" ? "border-gold text-gold" : "border-border text-muted-foreground"
                      )}>{b.status}</span>
                    </div>
                    <div className="text-sm space-y-1 mb-4">
                      <div><span className="text-muted-foreground">Package:</span> {b.packageLabel}</div>
                      <div><span className="text-muted-foreground">Amount:</span> {b.amount ? formatNGN(b.amount) : "—"}</div>
                    </div>
                    <div className="flex gap-2">
                      {b.status === "pending" && (
                        <Button size="sm" variant="outlineGold" className="flex-1" onClick={() => { updateBookingStatus(b.id, "confirmed"); refresh(); }}>
                          Confirm
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { deleteBooking(b.id); refresh(); }}>
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
