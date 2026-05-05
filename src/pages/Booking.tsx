import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Copy, GraduationCap, Plane, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HAJJ_PACKAGE, UMRAH_DEPARTURES, UMRAH_PRICE, BookingType,
  formatDate, formatNGN, saveBooking,
} from "@/data/packages";
import { cn } from "@/lib/utils";

const SERVICES: { id: BookingType; title: string; desc: string; icon: any }[] = [
  { id: "study", title: "Study Abroad", desc: "Admissions consulting & placement", icon: GraduationCap },
  { id: "hajj", title: "Hajj 2026", desc: "31-night premium pilgrimage", icon: Sparkles },
  { id: "umrah", title: "Umrah 2026", desc: "Year-round departures", icon: Plane },
];

const detailsSchema = z.object({
  fullName: z.string().trim().min(2, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Required").max(20),
  notes: z.string().trim().max(500).optional(),
});

export default function Booking() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<BookingType | null>(null);
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [details, setDetails] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  // Prefill from query string
  useEffect(() => {
    const t = params.get("type") as BookingType | null;
    const p = params.get("pkg");
    if (t && SERVICES.some((s) => s.id === t)) { setType(t); setStep(2); }
    if (p) setPkgId(p);
  }, []); // eslint-disable-line

  const summary = useMemo(() => {
    if (!type) return null;
    if (type === "hajj") return { label: HAJJ_PACKAGE.title, price: HAJJ_PACKAGE.price, sub: `${HAJJ_PACKAGE.departRoute} · ${formatDate(HAJJ_PACKAGE.departDate)}` };
    if (type === "umrah") {
      const d = UMRAH_DEPARTURES.find((x) => x.id === pkgId);
      return d ? { label: `Umrah — ${d.label}`, price: UMRAH_PRICE, sub: `Depart ${formatDate(d.depart)} · Return ${formatDate(d.ret)}` } : null;
    }
    return { label: "Study Abroad Consultation", price: 0, sub: "Free initial consultation" };
  }, [type, pkgId]);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = () => {
    const r = detailsSchema.safeParse(details);
    if (!r.success) {
      const f: Record<string, string> = {};
      r.error.issues.forEach((i) => { f[i.path[0] as string] = i.message; });
      setErrors(f);
      return;
    }
    setErrors({});
    if (!type || !summary) return;
    const saved = saveBooking({
      type,
      packageLabel: summary.label,
      fullName: details.fullName,
      email: details.email,
      phone: details.phone,
      notes: details.notes || undefined,
      amount: summary.price,
    });
    setConfirmedId(saved.id);
    setStep(4);
    toast.success("Booking received", { description: `Reference ${saved.id}` });
  };

  const steps = ["Service", "Package", "Details", "Confirm"];

  return (
    <Layout>
      <section className="pt-32 pb-10">
        <div className="container-luxe max-w-4xl">
          <div className="eyebrow mb-4">Book Your Journey</div>
          <h1 className="font-display text-4xl sm:text-5xl mb-8">A few simple steps.</h1>

          {/* Stepper */}
          <ol className="flex items-center gap-2 sm:gap-4 mb-12 text-xs">
            {steps.map((s, i) => {
              const idx = i + 1;
              const active = step === idx;
              const done = step > idx;
              return (
                <li key={s} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                    active ? "bg-gold text-gold-foreground border-gold shadow-gold" :
                    done ? "bg-gold/15 border-gold text-gold" : "border-border text-muted-foreground"
                  )}>
                    {done ? <Check className="w-4 h-4" /> : idx}
                  </div>
                  <span className={cn("hidden sm:inline uppercase tracking-[0.2em]", active ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  {idx < steps.length && <div className="flex-1 h-px bg-border" />}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxe max-w-4xl">
          {/* Step 1: choose service */}
          {step === 1 && (
            <div className="grid sm:grid-cols-3 gap-4 animate-fade-in">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setType(s.id); setPkgId(null); next(); }}
                  className={cn(
                    "glass-card rounded-sm p-7 text-left hover:border-gold/60 transition-all group",
                    type === s.id && "border-gold"
                  )}
                >
                  <s.icon className="w-7 h-7 text-gold mb-4" />
                  <div className="font-display text-2xl mb-1">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: pick package */}
          {step === 2 && type && (
            <div className="animate-fade-in space-y-4">
              {type === "hajj" && (
                <div className="glass-card rounded-sm p-7 border-gold/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl mb-1">{HAJJ_PACKAGE.title}</div>
                      <div className="text-sm text-muted-foreground">{HAJJ_PACKAGE.departRoute} · {formatDate(HAJJ_PACKAGE.departDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl text-gold">{formatNGN(HAJJ_PACKAGE.price)}</div>
                      <div className="text-xs text-muted-foreground">{HAJJ_PACKAGE.seatsLeft} seats left</div>
                    </div>
                  </div>
                </div>
              )}

              {type === "umrah" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {UMRAH_DEPARTURES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setPkgId(d.id)}
                      className={cn(
                        "glass-card rounded-sm p-5 text-left hover:border-gold/60 transition-all",
                        pkgId === d.id && "border-gold"
                      )}
                    >
                      <div className="font-display text-xl text-gold">{d.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">Depart {formatDate(d.depart)}</div>
                      <div className="text-xs text-muted-foreground">Return {formatDate(d.ret)}</div>
                      <div className="mt-3 text-sm">{formatNGN(UMRAH_PRICE)}</div>
                    </button>
                  ))}
                </div>
              )}

              {type === "study" && (
                <div className="glass-card rounded-sm p-7">
                  <div className="font-display text-2xl mb-2">Free Consultation</div>
                  <p className="text-sm text-muted-foreground">Tell us your details and our consultant will contact you to discuss programs, countries, and next steps.</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button
                  variant="gold"
                  onClick={next}
                  disabled={type === "umrah" && !pkgId}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: details */}
          {step === 3 && summary && (
            <div className="animate-fade-in grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-sm p-7 space-y-5">
                <div>
                  <Label htmlFor="fn">Full Name</Label>
                  <Input id="fn" value={details.fullName} onChange={(e) => setDetails({ ...details, fullName: e.target.value })} className="mt-2" />
                  {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="em">Email</Label>
                    <Input id="em" type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} className="mt-2" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="ph">Phone</Label>
                    <Input id="ph" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} className="mt-2" />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="nt">Notes (optional)</Label>
                  <Textarea id="nt" rows={4} value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} className="mt-2" />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button variant="gold" size="lg" onClick={submit}>Confirm Booking</Button>
                </div>
              </div>

              <aside className="glass-card rounded-sm p-7 h-fit border-gold/30">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Summary</div>
                <div className="font-display text-2xl mb-2">{summary.label}</div>
                <div className="text-sm text-muted-foreground mb-6">{summary.sub}</div>
                <div className="gold-divider mb-6" />
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-display text-xl text-gold">{summary.price ? formatNGN(summary.price) : "—"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">A consultant will follow up to confirm payment & next steps.</p>
              </aside>
            </div>
          )}

          {/* Step 4: confirmation */}
          {step === 4 && confirmedId && summary && (
            <div className="animate-fade-in glass-card rounded-sm p-10 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold flex items-center justify-center mx-auto mb-6">
                <Check className="w-7 h-7 text-gold" />
              </div>
              <div className="eyebrow mb-3 justify-center">Booking Confirmed</div>
              <h2 className="font-display text-4xl mb-3">Thank you, {details.fullName.split(" ")[0]}.</h2>
              <p className="text-muted-foreground mb-6">Your reservation has been received. Our team will reach out shortly with payment details and next steps.</p>

              <div className="bg-secondary/40 rounded-sm p-5 mb-6 inline-flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reference</span>
                <span className="font-display text-xl text-gold tabular-nums">{confirmedId}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(confirmedId); toast.success("Copied"); }}
                  className="text-muted-foreground hover:text-gold transition-colors"
                  aria-label="Copy reference"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm space-y-1 mb-8">
                <div><span className="text-muted-foreground">Service:</span> {summary.label}</div>
                <div><span className="text-muted-foreground">Amount:</span> {summary.price ? formatNGN(summary.price) : "Free consultation"}</div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="gold"><Link to="/">Back to Home</Link></Button>
                <Button asChild variant="outline"><Link to="/contact">Contact Us</Link></Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
