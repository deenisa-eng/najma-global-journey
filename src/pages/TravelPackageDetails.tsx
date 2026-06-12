import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Check, Crown, Gem, MapPin, RefreshCw, Star, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SocialShare from "@/components/SocialShare";
import { Button } from "@/components/ui/button";
import { formatDate, formatNGN } from "@/data/packages";
import { getPackageTiers, getTravelDepartures, type PackageTier } from "@/lib/schedules";
import plane from "@/assets/travel-visas.jpg";

const TIER_ICON: Record<string, any> = { Economy: Star, Luxury: Gem, Premium: Crown };

export default function TravelPackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tier, setTier] = useState<PackageTier | null>(null);
  const [departures, setDepartures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [tiers, deps] = await Promise.all([getPackageTiers("travel"), getTravelDepartures()]);
        if (!mounted) return;
        setTier(tiers.find((t) => t.id === id) || null);
        setDepartures(deps);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const next = useMemo(() => {
    const now = Date.now();
    return departures.find((d) => new Date(d.depart).getTime() >= now) || departures[0];
  }, [departures]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-40 pb-32 text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-gold/40 mb-4" />
          <p className="text-muted-foreground">Loading package…</p>
        </div>
      </Layout>
    );
  }

  if (!tier) {
    return (
      <Layout>
        <div className="container-luxe pt-40 pb-32 text-center">
          <h1 className="font-display text-4xl mb-4">Package not found</h1>
          <Button asChild variant="outlineGold"><Link to="/travel-visas">Back to travel packages</Link></Button>
        </div>
      </Layout>
    );
  }

  const img = tier.imageUrl || plane;
  const pct = Math.round((tier.seatsBooked / tier.totalSeats) * 100);
  const left = tier.totalSeats - tier.seatsBooked;
  const deposit = Math.round(tier.price * 0.4);
  const description = tier.description || `Our ${tier.tier} travel package is tailored to make your visa, travel, and itinerary planning easy and reliable.`;
  const Icon = TIER_ICON[tier.tier] || Star;

  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={img} alt={`Travel ${tier.tier}`} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/55 to-background/20" />
        </div>
        <div className="container-luxe relative">
          <button
            onClick={() => navigate("/travel-visas")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Packages
          </button>
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block bg-gold text-gold-foreground text-[10px] uppercase tracking-[0.24em] px-3 py-1.5 rounded-sm font-semibold mb-5">
              Travel
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              {tier.tier}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/90">
              <span className="inline-flex items-center gap-2">
                <Star className="w-4 h-4 text-gold fill-gold" /> {tier.stars} Star
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" /> {tier.duration}
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" /> Global destinations
              </span>
            </div>
            <div className="mt-8">
              <SocialShare
                title={`${tier.tier} Travel Package`}
                description={description}
                url={`/packages/travel/${tier.id}`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-luxe grid lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-14">
            <div>
              <h2 className="font-display text-3xl text-gold mb-5">About This Package</h2>
              <p className="text-foreground/85 leading-relaxed max-w-2xl whitespace-pre-wrap">{description}</p>
            </div>

            <div>
              <h2 className="font-display text-3xl text-gold mb-6">What's Included</h2>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {tier.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {next && (
              <div>
                <h2 className="font-display text-3xl text-gold mb-6">Schedule</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-sm p-6 text-center">
                    <Calendar className="w-6 h-6 text-gold mx-auto mb-3" />
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Departure</div>
                    <div className="font-display text-xl">{formatDate(next.depart)}</div>
                  </div>
                  <div className="glass-card rounded-sm p-6 text-center">
                    <Calendar className="w-6 h-6 text-gold mx-auto mb-3" />
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Return</div>
                    <div className="font-display text-xl">{formatDate(next.ret)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-32 self-start">
            <div className="glass-card rounded-sm p-7 border-gold/30">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Total Price</div>
              <div className="font-display text-5xl text-gold leading-none mb-3">{formatNGN(tier.price)}</div>
              <div className="text-xs text-muted-foreground mb-6">
                Required Deposit: <span className="text-foreground/90">{formatNGN(deposit)}</span>
              </div>

              <div className="border-t border-border pt-5 mb-5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">{tier.duration}</span>
              </div>

              <div className="border-t border-border pt-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Availability</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gold">
                    <Users className="w-3.5 h-3.5" /> {left} spots left
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                  <div className="h-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {tier.seatsBooked} of {tier.totalSeats} seats booked
                </div>
              </div>

              <Button asChild variant="gold" size="lg" className="w-full">
                <Link to={`/booking?type=travel&pkg=${tier.id}`}>Book Now</Link>
              </Button>
              <p className="text-[11px] text-center text-muted-foreground mt-4">
                Need help? Contact us on WhatsApp for assistance.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
