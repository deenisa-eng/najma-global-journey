import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Copy, GraduationCap, HeartPulse, Plane, Sparkles, Globe2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  BookingType,
  formatDate, formatNGN,
} from "@/data/packages";
import { getUmrahDepartures, getHajjPackage, getPackageTiers, getTravelDepartures, type PackageTier } from "@/lib/schedules";
import { cn } from "@/lib/utils";
import { automateBooking, type AutomationResponse } from "@/lib/amadeusAutomation";

const SERVICES: { id: BookingType; title: string; desc: string; icon: any }[] = [
  { id: "study", title: "Study Abroad", desc: "Admissions consulting & placement", icon: GraduationCap },
  { id: "medical", title: "Medical Tourism", desc: "International treatment planning & travel support", icon: HeartPulse },
  { id: "travel", title: "Business & Tourism", desc: "Visas for business, tourism, and family visits", icon: Globe2 },
  { id: "hajj", title: "Hajj", desc: "31-night premium pilgrimage", icon: Sparkles },
  { id: "umrah", title: "Umrah", desc: "Year-round departures", icon: Plane },
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
  const { user } = useAuth();
  
  // Separate state for each service type
  const [umrahDetails, setUmrahDetails] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [hajjDetails, setHajjDetails] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [travelDetails, setTravelDetails] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [studyDetails, setStudyDetails] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [medicalDetails, setMedicalDetails] = useState({ fullName: "", email: "", phone: "", notes: "" });
  
  // Separate selections for each service type
  const [umrahPkgId, setUmrahPkgId] = useState<string | null>(null);
  const [umrahDepartureId, setUmrahDepartureId] = useState<string | null>(null);
  const [travelPkgId, setTravelPkgId] = useState<string | null>(null);
  const [travelDepartureId, setTravelDepartureId] = useState<string | null>(null);
  const [hajjPkgId, setHajjPkgId] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [automation, setAutomation] = useState<AutomationResponse | null>(null);
  const [umrahDepartures, setUmrahDepartures] = useState<any[]>([]);
  const [travelDepartures, setTravelDepartures] = useState<any[]>([]);
  const [hajjPackage, setHajjPackage] = useState<any>(null);
  const [umrahTiers, setUmrahTiers] = useState<PackageTier[]>([]);
  const [travelTiers, setTravelTiers] = useState<PackageTier[]>([]);

  // Get current details based on booking type
  const details = (() => {
    switch (type) {
      case "umrah": return umrahDetails;
      case "hajj": return hajjDetails;
      case "travel": return travelDetails;
      case "study": return studyDetails;
      case "medical": return medicalDetails;
      default: return { fullName: "", email: "", phone: "", notes: "" };
    }
  })();

  // Set current details based on booking type
  const setDetails = (value: typeof umrahDetails | ((prev: typeof umrahDetails) => typeof umrahDetails)) => {
    const newValue = typeof value === "function" ? value(details) : value;
    switch (type) {
      case "umrah": return setUmrahDetails(newValue);
      case "hajj": return setHajjDetails(newValue);
      case "travel": return setTravelDetails(newValue);
      case "study": return setStudyDetails(newValue);
      case "medical": return setMedicalDetails(newValue);
    }
  };

  // Get current pkgId and selectedDepartureId based on booking type
  const pkgId = (() => {
    switch (type) {
      case "umrah": return umrahPkgId;
      case "travel": return travelPkgId;
      case "hajj": return hajjPkgId;
      default: return null;
    }
  })();

  const selectedDepartureId = (() => {
    switch (type) {
      case "umrah": return umrahDepartureId;
      case "travel": return travelDepartureId;
      default: return null;
    }
  })();

  // Set current pkgId based on booking type
  const setPkgId = (id: string | null) => {
    switch (type) {
      case "umrah": return setUmrahPkgId(id);
      case "travel": return setTravelPkgId(id);
      case "hajj": return setHajjPkgId(id);
    }
  };

  // Set current selectedDepartureId based on booking type
  const setSelectedDepartureId = (id: string | null) => {
    switch (type) {
      case "umrah": return setUmrahDepartureId(id);
      case "travel": return setTravelDepartureId(id);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setUmrahDetails((prev) => ({ ...prev, email: user.email }));
      setHajjDetails((prev) => ({ ...prev, email: user.email }));
      setTravelDetails((prev) => ({ ...prev, email: user.email }));
      setStudyDetails((prev) => ({ ...prev, email: user.email }));
      setMedicalDetails((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);


  // Prefill from query string
  useEffect(() => {
    let mounted = true;
    (async () => {
        const [d, h, umrahData, travelData, travelDeps] = await Promise.all([
          getUmrahDepartures(),
          getHajjPackage(),
          getPackageTiers("umrah"),
          getPackageTiers("travel"),
          getTravelDepartures(),
        ]);
      if (!mounted) return;
        setUmrahDepartures(d as any[]);
        setTravelDepartures(travelDeps as any[]);
      setHajjPackage(h as any);
      setUmrahTiers(umrahData);
      setTravelTiers(travelData);

      const t = params.get("type") as BookingType | null;
      const p = params.get("pkg");
      if (t && SERVICES.some((s) => s.id === t)) { setType(t); setStep(2); }
      if (p) {
        const tier = [...umrahData, ...travelData].find((x) => x.id === p);
        const departure = ([...(d as any), ...(travelDeps as any)] as any).find((x: any) => x.id === p);
        if (tier) setPkgId(p);
        else if (departure) setSelectedDepartureId(p);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter departures based on booking type
  const filteredDepartures = type === "umrah" ? umrahDepartures : type === "travel" ? travelDepartures : [];

  const selectedDeparture = selectedDepartureId
    ? filteredDepartures.find((x) => x.id === selectedDepartureId)
    : null;

  const summary = useMemo(() => {
    if (!type) return null;
    if (type === "hajj" && hajjPackage) return { label: hajjPackage.title, price: hajjPackage.price, sub: `${hajjPackage.departRoute} · ${formatDate(hajjPackage.departDate)}` };
    if (type === "umrah") {
      const t = umrahTiers.find((x) => x.id === pkgId);
      if (!t) return null;
      
      const departDate = selectedDeparture?.depart;
      const returnDate = selectedDeparture?.ret;
      
      return {
        label: `Umrah — ${t.tier} (${t.stars}★)`,
        price: t.price,
        sub: departDate 
          ? `${t.duration} · Depart ${formatDate(departDate)} · Return ${formatDate(returnDate!)}`
          : `${t.duration} · No departure window selected`,
      };
    }
    if (type === "travel") {
      const t = travelTiers.find((x) => x.id === pkgId);
      if (t) {
        return {
          label: `Travel — ${t.tier} (${t.stars}★)` ,
          price: t.price,
          sub: `${t.duration} · Visa support & trip planning`,
        };
      }
      return { label: "Business, Tourism & Visits", price: 0, sub: "Expert visa guidance and itinerary planning" };
    }
    if (type === "study") return { label: "Study Abroad Consultation", price: 0, sub: "Free initial consultation" };
    return { label: "Medical Tourism Consultation", price: 0, sub: "Case review and travel planning consultation" };
  }, [type, pkgId, selectedDepartureId, hajjPackage, selectedDeparture, umrahTiers, travelTiers]);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    const r = detailsSchema.safeParse(details);
    if (!r.success) {
      const f: Record<string, string> = {};
      r.error.issues.forEach((i) => { f[i.path[0] as string] = i.message; });
      setErrors(f);
      return;
    }
    setErrors({});
    if (!type || !summary) return;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          service_type: type,
          package_label: summary.label,
          amount: summary.price,
          contact_name: details.fullName,
          contact_email: details.email,
          contact_phone: details.phone,
          notes: details.notes || null,
          package_id: null,
          metadata: { type },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to create booking");
      }

      const packageMeta = type === "hajj" && hajjPackage
        ? { departDate: hajjPackage.departDate, returnDate: hajjPackage.returnDate }
        : type === "umrah"
          ? (() => {
              const t = umrahTiers.find((x) => x.id === pkgId);
              if (!t || !selectedDeparture) return undefined;
              return { departDate: selectedDeparture.depart, returnDate: selectedDeparture.ret };
            })()
          : undefined;

      const automationResult = await automateBooking({
        type,
        packageMeta,
        customer: {
          fullName: details.fullName,
          email: details.email,
          phone: details.phone,
        },
      });
      setAutomation(automationResult);
      setConfirmedId(result.booking.id);
      setStep(4);
      toast.success("Booking received", { description: `Reference ${result.booking.id}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Automation was not completed.";
      setAutomation({ automated: false, status: "error", error: message });
      toast.error(message);
    }
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
              {type === "hajj" && hajjPackage && (
                <div className="glass-card rounded-sm p-7 border-gold/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl mb-1">{hajjPackage.title}</div>
                      <div className="text-sm text-muted-foreground">{hajjPackage.departRoute} · {formatDate(hajjPackage.departDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl text-gold">{formatNGN(hajjPackage.price)}</div>
                      <div className="text-xs text-muted-foreground">{hajjPackage.seatsLeft} seats left</div>
                    </div>
                  </div>
                </div>
              )}

              {type === "umrah" && (
                <div className="space-y-6">
                  <div className="glass-card rounded-sm p-6 border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="font-display text-2xl">Choose your departure window</div>
                        <div className="text-sm text-muted-foreground">Select the date that suits your travel plan before choosing a tier.</div>
                      </div>
                      {selectedDeparture && (
                        <div className="rounded-full bg-gold/10 text-gold px-3 py-1 text-xs uppercase tracking-[0.22em]">
                          {selectedDeparture.label} · {formatDate(selectedDeparture.depart)}
                        </div>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {filteredDepartures.length === 0 ? (
                        <div className="sm:col-span-3 p-12 text-center text-muted-foreground border border-dashed rounded-sm">
                          No scheduled departures available. Please contact us for custom arrangements.
                        </div>
                      ) : (
                        filteredDepartures.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDepartureId(d.id)}
                            className={cn(
                              "glass-card rounded-sm p-4 text-left transition-all",
                              selectedDepartureId === d.id ? "border-gold bg-gold/10" : "border border-border hover:border-gold/60"
                            )}
                          >
                            <div className="font-display text-lg text-gold mb-2">{d.label}</div>
                            <div className="text-sm text-muted-foreground">Depart {formatDate(d.depart)}</div>
                            <div className="text-sm text-muted-foreground">Return {formatDate(d.ret)}</div>
                            <div className="mt-3 text-xs text-muted-foreground">{d.seatsLeft} seats left</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-display text-2xl">Select your desired package</div>
                        <div className="text-sm text-muted-foreground">Choose the comfort level that best suits your spiritual journey.</div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {umrahTiers.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setPkgId(t.id)}
                          className={cn(
                            "glass-card rounded-sm p-6 text-left hover:border-gold/60 transition-all",
                            pkgId === t.id ? "border-gold bg-gold/5 shadow-gold" : "border-border"
                          )}
                        >
                          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">{t.stars}★ · {t.duration}</div>
                          <div className="font-display text-2xl text-gold mb-1">{t.tier}</div>
                          <div className="font-display text-xl mb-4">{formatNGN(t.price)}</div>
                          <ul className="space-y-1">
                            {t.highlights.map((h) => (
                              <li key={h} className="text-xs text-muted-foreground flex items-start gap-2">
                                <Check className="w-3 h-3 text-gold mt-0.5 shrink-0" /> {h}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 text-xs text-muted-foreground">{t.totalSeats - t.seatsBooked} seats left</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {type === "study" && (
                <div className="glass-card rounded-sm p-7">
                  <div className="font-display text-2xl mb-2">Free Consultation</div>
                  <p className="text-sm text-muted-foreground">Tell us your details and our consultant will contact you to discuss programs, countries, and next steps.</p>
                </div>
              )}

              {type === "medical" && (
                <div className="glass-card rounded-sm p-7">
                  <div className="font-display text-2xl mb-2">Medical Travel Consultation</div>
                  <p className="text-sm text-muted-foreground">Share your case overview and preferred destination. Our advisor will guide treatment options, timelines, and travel logistics.</p>
                </div>
              )}

              {type === "travel" && (
                <div className="space-y-6">
                  <div className="glass-card rounded-sm p-7">
                    <div className="font-display text-2xl mb-2">Business & Tourism Visas</div>
                    <p className="text-sm text-muted-foreground">Travelling for business, a holiday, or visiting family? Our experts handle documentation and processing for major global destinations.</p>
                  </div>

                  <div className="glass-card rounded-sm p-6 border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="font-display text-2xl">Choose your departure window</div>
                        <div className="text-sm text-muted-foreground">Select the date that suits your travel plan before choosing a tier.</div>
                      </div>
                      {selectedDeparture && (
                        <div className="rounded-full bg-gold/10 text-gold px-3 py-1 text-xs uppercase tracking-[0.22em]">
                          {selectedDeparture.label} · {formatDate(selectedDeparture.depart)}
                        </div>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {filteredDepartures.length === 0 ? (
                        <div className="sm:col-span-3 p-12 text-center text-muted-foreground border border-dashed rounded-sm">
                          No scheduled departures available. Please contact us for custom arrangements.
                        </div>
                      ) : (
                        filteredDepartures.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDepartureId(d.id)}
                            className={cn(
                              "glass-card rounded-sm p-4 text-left transition-all",
                              selectedDepartureId === d.id ? "border-gold bg-gold/10" : "border border-border hover:border-gold/60"
                            )}
                          >
                            <div className="font-display text-lg text-gold mb-2">{d.label}</div>
                            <div className="text-sm text-muted-foreground">Depart {formatDate(d.depart)}</div>
                            <div className="text-sm text-muted-foreground">Return {formatDate(d.ret)}</div>
                            <div className="mt-3 text-xs text-muted-foreground">{d.seatsLeft} seats left</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {travelTiers.length > 0 ? (
                    <div className="space-y-6">
                      <div className="font-display text-2xl">Choose your travel tier</div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {travelTiers.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPkgId(t.id)}
                            className={cn(
                              "glass-card rounded-sm p-6 text-left hover:border-gold/60 transition-all",
                              pkgId === t.id ? "border-gold bg-gold/5 shadow-gold" : "border-border"
                            )}
                          >
                            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">{t.stars}★ · {t.duration}</div>
                            <div className="font-display text-2xl text-gold mb-1">{t.tier}</div>
                            <div className="font-display text-xl mb-4">{formatNGN(t.price)}</div>
                            <ul className="space-y-1">
                              {t.highlights.map((h) => (
                                <li key={h} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <Check className="w-3 h-3 text-gold mt-0.5 shrink-0" /> {h}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 text-xs text-muted-foreground">{t.totalSeats - t.seatsBooked} seats left</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button
                  variant="gold"
                  onClick={next}
                  disabled={(type === "umrah" || type === "travel") && (!pkgId || !selectedDepartureId)}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: details */}
          {step === 3 && summary && (
            <div className="animate-fade-in grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-sm p-5 sm:p-7 space-y-5">
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
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                  <Button variant="ghost" onClick={back} className="order-2 sm:order-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button variant="gold" size="lg" onClick={submit} className="order-1 sm:order-2 w-full sm:w-auto">Confirm Booking</Button>
                </div>
              </div>

              <aside className="glass-card rounded-sm p-6 sm:p-7 h-fit border-gold/30">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Summary</div>
                <div className="font-display text-2xl mb-2 leading-tight">{summary.label}</div>
                <div className="text-sm text-muted-foreground mb-6 leading-relaxed">{summary.sub}</div>
                <div className="gold-divider mb-6" />
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-display text-xl text-gold">{summary.price ? formatNGN(summary.price) : "—"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">A consultant will follow up to confirm payment & next steps.</p>
              </aside>
            </div>
          )}

          {/* Step 4: confirmation */}
          {step === 4 && confirmedId && summary && (
            <div className="animate-fade-in glass-card rounded-sm p-6 sm:p-10 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold flex items-center justify-center mx-auto mb-6">
                <Check className="w-7 h-7 text-gold" />
              </div>
              <div className="eyebrow mb-3 justify-center">Booking Confirmed</div>
              <h2 className="font-display text-3xl sm:text-4xl mb-3 px-2">Thank you, {details.fullName.split(" ")[0]}.</h2>
              <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed px-2">Your reservation has been received. Our team will reach out shortly with payment details and next steps.</p>

              <div className="bg-secondary/40 rounded-sm p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Reference</span>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl text-gold tabular-nums">{confirmedId}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(confirmedId); toast.success("Copied"); }}
                    className="text-muted-foreground hover:text-gold transition-colors p-1"
                    aria-label="Copy reference"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm space-y-2 mb-10 text-muted-foreground">
                <div className="flex flex-col sm:flex-row justify-between gap-1 border-b border-border/40 pb-2 sm:pb-1">
                  <span>Service:</span> 
                  <span className="text-foreground font-medium">{summary.label}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-1 border-b border-border/40 pb-2 sm:pb-1">
                  <span>Amount:</span> 
                  <span className="text-gold font-medium">{summary.price ? formatNGN(summary.price) : "Free consultation"}</span>
                </div>
                {automation?.status && (
                  <div className="flex flex-col sm:flex-row justify-between gap-1 border-b border-border/40 pb-2 sm:pb-1 text-[11px] uppercase tracking-tighter">
                    <span>Automation Status:</span>
                    <span className="text-foreground font-bold">
                      {automation.status === "quoted" ? "Quote Ready" : automation.status === "manual" ? "Queued for Admin" : "Contact Sales"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button asChild variant="gold" className="w-full sm:w-auto"><Link to="/">Back to Home</Link></Button>
                <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/contact">Contact Us</Link></Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
