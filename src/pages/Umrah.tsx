import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Plane, Star, Crown, Gem, RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { UMRAH_INCLUSIONS, UMRAH_PRICE, formatDate, formatNGN } from "@/data/packages";
import { getUmrahDepartures, getUmrahTiers, type UmrahDeparture, type UmrahTier } from "@/lib/schedules";
import madinah from "@/assets/madinah.jpg";
import umrahPremium from "@/assets/umrah-premium.jpg";
import umrahLuxury from "@/assets/umrah-luxury.jpg";
import umrahEconomy from "@/assets/umrah-economy.jpg";

const TIER_ICON: Record<string, any> = { Economy: Star, Luxury: Gem, Premium: Crown };
const TIER_IMAGE: Record<string, string> = {
  Premium: umrahPremium,
  Luxury: umrahLuxury,
  Economy: umrahEconomy,
};

export default function Umrah() {
  const [departures, setDepartures] = useState<UmrahDeparture[]>([]);
  const [tiers, setTiers] = useState<UmrahTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [d, t] = await Promise.all([getUmrahDepartures(), getUmrahTiers()]);
        if (!mounted) return;
        setDepartures(d);
        setTiers(t);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const yearLabel = departures[0] ? new Date(departures[0].depart).getFullYear() : new Date().getFullYear();
  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={madinah} alt="Prophet's Mosque, Madinah" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/40 to-background/10" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="eyebrow mb-5">Umrah {yearLabel} · Year-Round Departures</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              The lesser pilgrimage. <span className="text-gold italic">Greater serenity.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Choose a tier that fits your journey — every package fully inclusive, from visa to ziyarah.
            </p>
          </div>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-16">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="eyebrow mb-3">Featured Packages</div>
              <h2 className="font-display text-4xl">Choose your comfort.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 py-20 text-center">
                <RefreshCw className="w-10 h-10 animate-spin mx-auto text-gold/40 mb-4" />
                <p className="text-muted-foreground">Loading premium packages...</p>
              </div>
            ) : tiers.length === 0 ? (
              <div className="col-span-3 py-20 text-center glass-card rounded-sm border-dashed">
                <p className="text-muted-foreground">No Umrah tiers currently configured. Please check back later.</p>
              </div>
            ) : (
              tiers.map((t) => {
                const Icon = TIER_ICON[t.tier] || Star;
                const pct = Math.round((t.seatsBooked / t.totalSeats) * 100);
                const left = t.totalSeats - t.seatsBooked;
                const featured = t.isFeatured;
                const img = t.imageUrl || TIER_IMAGE[t.tier] || madinah;
                return (
                  <div
                    key={t.id}
                    className={`relative glass-card rounded-sm overflow-hidden flex flex-col transition-all duration-500 hover:border-gold/60 ${featured ? "border-gold/50 shadow-gold" : ""}`}
                  >
                    {/* Image header */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={img}
                        alt={`Umrah ${t.tier} package`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                      {/* Top badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-gold text-gold-foreground text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-sm font-semibold">
                          Umrah
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
                        <Link to={`/packages/umrah/${t.id}`}>View Details <ArrowRight className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section className="py-16">
        <div className="container-luxe">
          <div className="glass-card rounded-sm p-8 sm:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="eyebrow mb-3">Every package includes</div>
                <h2 className="font-display text-3xl sm:text-4xl">Four pillars of effortless travel.</h2>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {UMRAH_INCLUSIONS.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 bg-gradient-navy">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="eyebrow mb-3">2026 Schedule</div>
              <h2 className="font-display text-4xl sm:text-5xl">Choose your departure window.</h2>
            </div>
            <div className="text-sm text-muted-foreground">All departures from <span className="text-foreground">Kano (KAN) → Jeddah (JED)</span></div>
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
                    <td className="px-6 py-5 text-sm">{formatDate(d.depart)}</td>
                    <td className="px-6 py-5 text-sm">{formatDate(d.ret)}</td>
                    <td className="px-6 py-5 text-sm font-medium">{formatNGN(UMRAH_PRICE)}</td>
                    <td className="px-6 py-5 text-sm">
                      <span className={d.seatsLeft <= 5 ? "text-gold" : "text-muted-foreground"}>{d.seatsLeft} left</span>
                    </td>
                    <td className="px-6 py-5">
                      <Button asChild variant="outlineGold" size="sm">
                        <Link to={`/booking?type=umrah&pkg=${d.id}`}>Book <ArrowRight className="w-3 h-3" /></Link>
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
                  <Plane className="w-5 h-5 text-gold" />
                </div>
                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Depart</span><span>{formatDate(d.depart)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Return</span><span>{formatDate(d.ret)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="text-gold">{formatNGN(UMRAH_PRICE)}</span></div>
                </div>
                <Button asChild variant="gold" className="w-full">
                  <Link to={`/booking?type=umrah&pkg=${d.id}`}>Book This Departure</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
