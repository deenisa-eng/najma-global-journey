import { Link } from "react-router-dom";
import { Plane, ArrowRight, Check, Clock, Building2, Banknote } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import Countdown from "@/components/Countdown";
import { HAJJ_PACKAGE, formatNGN, formatDate } from "@/data/packages";
import heroKaaba from "@/assets/hero-kaaba.jpg";

export default function Hajj() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroKaaba} alt="The Holy Kaaba" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/30 to-background/10" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="eyebrow mb-5">Hajj 2026 · Limited Seats</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              The pilgrimage <span className="text-gold italic">of a lifetime.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-10">
              An immersive 31-night journey from Kano to the Holy Cities — every flight, visa and meal taken care of, so you can focus on your devotion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="gold" size="lg">
                <Link to={`/booking?type=hajj`}>Book Your Seat <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Speak to Consultant</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-16">
        <div className="container-luxe">
          <div className="glass-card rounded-sm p-8 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="eyebrow mb-3"><Clock className="w-3 h-3" /> Departure Countdown</div>
                <h2 className="font-display text-3xl sm:text-4xl">Time until takeoff from Kano.</h2>
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">
                Departing {formatDate(HAJJ_PACKAGE.departDate)}
              </div>
            </div>
            <Countdown target={HAJJ_PACKAGE.departDate} />
          </div>
        </div>
      </section>

      {/* Package details */}
      <section className="py-20 bg-gradient-navy">
        <div className="container-luxe grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="eyebrow mb-3">The Package</div>
              <h2 className="font-display text-4xl sm:text-5xl mb-4">Hajj 2026 — Premium Pilgrimage</h2>
              <p className="text-muted-foreground leading-relaxed">
                A fully-inclusive package designed for comfort, security and spiritual focus. Travel with an experienced group leader and certified Saudi operators.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-sm p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Departure</div>
                <div className="font-display text-2xl text-gold">{HAJJ_PACKAGE.departRoute}</div>
                <div className="text-sm mt-1">{formatDate(HAJJ_PACKAGE.departDate)}</div>
              </div>
              <div className="glass-card rounded-sm p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Return</div>
                <div className="font-display text-2xl text-gold">{HAJJ_PACKAGE.returnRoute}</div>
                <div className="text-sm mt-1">{formatDate(HAJJ_PACKAGE.returnDate)}</div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl mb-4">What's included</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {HAJJ_PACKAGE.inclusions.map((inc) => (
                  <li key={inc} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-sm p-6 border-gold/40">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-gold/15 border border-gold/40 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-display text-xl mb-2">Payment Instructions</h4>
                  <p className="text-sm text-muted-foreground mb-3">Secure your seat with a 50% deposit. Full payment due 60 days before departure.</p>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Bank:</span> Zenith Bank</div>
                    <div><span className="text-muted-foreground">Account Name:</span> Najma Global Tours & Consulting Ltd</div>
                    <div><span className="text-muted-foreground">Account No:</span> 1234567890</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price card */}
          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="glass-card rounded-sm p-8 border-gold/40 shadow-elegant">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">All-inclusive from</div>
              <div className="font-display text-5xl text-gold mb-1">{formatNGN(HAJJ_PACKAGE.price)}</div>
              <div className="text-sm text-muted-foreground mb-6">per pilgrim</div>

              <div className="gold-divider my-6" />

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm">Seats remaining</span>
                <span className="font-display text-xl text-gold">{HAJJ_PACKAGE.seatsLeft}</span>
              </div>

              <Button asChild variant="gold" size="lg" className="w-full mb-3">
                <Link to={`/booking?type=hajj`}>Reserve My Seat</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Ask a Question</Link>
              </Button>

              <div className="mt-6 flex items-start gap-3 text-xs text-muted-foreground">
                <Building2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>Limited seats — historically sold out 4 months before departure.</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
