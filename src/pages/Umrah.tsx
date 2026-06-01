import { Link } from "react-router-dom";
import { ArrowRight, Check, Plane } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { UMRAH_DEPARTURES, UMRAH_INCLUSIONS, UMRAH_PRICE, formatDate, formatNGN } from "@/data/packages";
import madinah from "@/assets/madinah.jpg";

export default function Umrah() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={madinah} alt="Prophet's Mosque, Madinah" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/30 to-background/10" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="eyebrow mb-5">Umrah 2026 · Year-Round Departures</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              The lesser pilgrimage. <span className="text-gold italic">Greater serenity.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Choose from six curated departure windows across 2026 — every package fully inclusive at <span className="text-gold font-medium">{formatNGN(UMRAH_PRICE)}</span>.
            </p>
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
              <h2 className="font-display text-4xl sm:text-5xl">Choose your departure.</h2>
            </div>
            <div className="text-sm text-muted-foreground">All departures from <span className="text-foreground">Kano (KAN) → Jeddah (JED)</span></div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block glass-card rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border">
                  <th className="px-6 py-5">Window</th>
                  <th className="px-6 py-5">Departure</th>
                  <th className="px-6 py-5">Return</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Seats</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody>
                {UMRAH_DEPARTURES.map((d) => (
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

          {/* Mobile cards */}
          <div className="md:hidden grid gap-4">
            {UMRAH_DEPARTURES.map((d) => (
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
                  <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="text-gold">{formatNGN(UMRAH_PRICE)}</span></div>
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
