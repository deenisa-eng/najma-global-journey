import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Briefcase, Camera, Users, ShieldCheck, Star, RefreshCw, Crown, Gem } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SocialShare from "@/components/SocialShare";
import { Button } from "@/components/ui/button";
import { formatNGN } from "@/data/packages";
import { getPackageTiers, getTravelDepartures, type PackageTier } from "@/lib/schedules";
import plane from "@/assets/travel-visas.jpg";

const travelTypes = [
  {
    icon: Briefcase,
    title: "Business Travel",
    desc: "Seamless visa processing and travel arrangements for conferences, trade fairs, and corporate meetings."
  },
  {
    icon: Camera,
    title: "Global Tourism",
    desc: "Explore the world with curated holiday packages and visa support for the UK, USA, Europe, and beyond."
  },
  {
    icon: Users,
    title: "Visiting Relations",
    desc: "Reunite with family and friends abroad with expert guidance on invitation-based visitor visa applications."
  }
];

const highlights = [
  "Comprehensive documentation review",
  "Interview preparation and coaching",
  "Flight and hotel reservation support",
  "Travel insurance advisory",
  "Personalized travel itineraries"
];

const TIER_ICON: Record<string, any> = { Economy: Star, Luxury: Gem, Premium: Crown };

export default function TravelVisas() {
  const [tiers, setTiers] = useState<PackageTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [departures, setDepartures] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [data, deps] = await Promise.all([getPackageTiers("travel"), getTravelDepartures()]);
        if (!mounted) return;
        setTiers(data);
        setDepartures(deps);
      } catch (err) {
        console.error("Error loading travel tiers:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={plane} alt="Global travel and tourism" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/60" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="eyebrow mb-5">Global Travel & Visas</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              The world is open. <span className="text-gold italic">We have the key.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Whether you are travelling for business, pleasure, or to visit loved ones, we provide end-to-end visa and travel support to ensure your journey is successful.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Travel Packages */}
      <section className="py-16">
        <div className="container-luxe">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-10 h-10 animate-spin mx-auto text-gold/40 mb-4" />
              <p className="text-muted-foreground">Loading travel packages...</p>
            </div>
          ) : tiers.length === 0 ? null : (
            <>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="eyebrow mb-3">Featured Packages</div>
                  <h2 className="font-display text-4xl">Travel Tiers & Visas.</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {tiers.map((t) => {
                  const Icon = TIER_ICON[t.tier] || Star;
                  const pct = Math.round((t.seatsBooked / t.totalSeats) * 100);
                  const left = t.totalSeats - t.seatsBooked;
                  const featured = t.isFeatured;
                  return (
                    <div
                      key={t.id}
                      className={`relative glass-card rounded-sm overflow-hidden flex flex-col transition-all duration-500 hover:border-gold/60 ${featured ? "border-gold/50 shadow-gold" : ""}`}
                    >
                      {/* Image header */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={t.imageUrl || plane}
                          alt={`Travel ${t.tier} package`}
                          loading="lazy"
                          className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                        {/* Top badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-gold text-gold-foreground text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-sm font-semibold">
                            Travel
                          </span>
                          <span className="bg-background/70 backdrop-blur-sm border border-border text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-sm">
                            {t.tier}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/70 backdrop-blur-sm border border-gold/30 px-2.5 py-1.5 rounded-sm">
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          <span className="text-[10px] font-semibold tracking-wider">{t.stars}-STAR</span>
                        </div>

                        {featured && (
                          <div className="absolute top-16 left-4 bg-gradient-gold text-gold-foreground text-[10px] uppercase tracking-[0.24em] px-3 py-1 rounded-sm font-semibold">
                            Most Booked
                          </div>
                        )}

                        {/* Price overlay bottom-left */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="font-display text-3xl text-gold leading-tight">{formatNGN(t.price)}</div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">per person</div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <div className="font-display text-xl leading-none">{t.tier}</div>
                            <div className="text-xs text-muted-foreground mt-1">{t.duration}</div>
                          </div>
                        </div>

                        <ul className="space-y-2 text-sm mb-5 flex-1">
                          {t.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                              <span className="text-foreground/90">{h}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mb-5">
                          <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                            <span>{left} seats left</span>
                            <span className="text-gold">{t.seatsBooked}/{t.totalSeats} booked</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <Button asChild variant={featured ? "gold" : "outlineGold"} className="mt-auto w-full">
                          <Link to={`/packages/travel/${t.id}`}>View Details <ArrowRight className="w-4 h-4" /></Link>
                        </Button>

                        <div className="mt-4">
                          <SocialShare
                            title={`${t.tier} Travel Package`}
                            description={`Explore our ${t.tier} travel package with ${t.duration}.`}
                            url={`/packages/travel/${t.id}`}
                            compact
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Schedule - Travel departures */}
      <section className="py-20 bg-gradient-navy">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="eyebrow mb-3">Departures</div>
              <h2 className="font-display text-4xl sm:text-5xl">Choose your departure window.</h2>
            </div>
          </div>

          <div className="hidden md:block glass-card rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border">
                  <th className="px-6 py-5">Window</th>
                  <th className="px-6 py-5">Departure</th>
                  <th className="px-6 py-5">Return</th>
                  <th className="px-6 py-5">From</th>
                  <th className="px-6 py-5">Seats</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody>
                {departures.map((d) => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-5 font-display text-lg text-gold">{d.label}</td>
                    <td className="px-6 py-5 text-sm">{new Date(d.depart).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-sm">{new Date(d.ret).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-sm font-medium">{d.departureCity}</td>
                    <td className="px-6 py-5 text-sm">
                      <span className={d.seatsLeft <= 5 ? "text-gold" : "text-muted-foreground"}>{d.seatsLeft} left</span>
                    </td>
                    <td className="px-6 py-5">
                      <Button asChild variant="outlineGold" size="sm">
                        <Link to={`/booking?type=travel&pkg=${d.id}`}>Book <ArrowRight className="w-3 h-3" /></Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid gap-4">
            {departures.map((d) => (
              <div key={d.id} className="glass-card rounded-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-display text-2xl text-gold">{d.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{d.seatsLeft} seats left</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Depart</span><span>{new Date(d.depart).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Return</span><span>{new Date(d.ret).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="text-gold">{d.departureCity}</span></div>
                </div>
                <Button asChild variant="gold" className="w-full">
                  <Link to={`/booking?type=travel&pkg=${d.id}`}>Book This Departure</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="eyebrow mb-3">Our Services</div>
              <h2 className="font-display text-4xl sm:text-5xl">Travel with confidence.</h2>
            </div>
            <p className="text-muted-foreground max-w-sm">Specialized visa advisory and travel planning for Nigerians exploring the globe.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {travelTypes.map((item) => (
              <div key={item.title} className="glass-card rounded-sm p-7 hover:border-gold/50 transition-all duration-500 group">
                <item.icon className="w-7 h-7 text-gold mb-4" />
                <h3 className="font-display text-2xl mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-navy">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="eyebrow mb-4">Why Choose Najma</div>
            <h2 className="font-display text-4xl sm:text-5xl mb-6">Expertise you can rely on.</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Visa applications can be complex. Our experienced consultants stay updated on the latest requirements and regulations to maximize your chances of approval.
            </p>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold flex items-center justify-center">
                    <Check className="w-3 h-3 text-gold" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-sm p-8">
            <div className="eyebrow mb-3">Start Your Application</div>
            <h3 className="font-display text-3xl mb-3">Ready to travel?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Tell us your destination and purpose of travel. A consultant will review your case and provide a detailed roadmap for your visa application.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="gold" size="lg">
                <Link to="/booking?type=travel">Start a Request <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Speak to Expert</Link>
              </Button>
            </div>
            <div className="mt-8 pt-6 border-t border-border/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                Disclaimer: Najma Global provide advisory services only and do not guarantee visa issuance. Final decisions are made by relevant embassies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
