import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, HeartPulse, MapPin, Plane, ShieldCheck, Sparkles, Globe2, Wallet } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import heroKaaba from "@/assets/hero-kaaba.jpg";
import madinah from "@/assets/madinah.jpg";
import studyAbroad from "@/assets/study-abroad.jpg";
import plane from "@/assets/plane.jpg";

const offerings = [
  {
    tag: "01 — Education",
    title: "Study Abroad",
    desc: "Curated admissions to globally accredited universities across medicine, engineering, AI and business.",
    image: studyAbroad,
    to: "/study-abroad",
  },
  {
    tag: "02 — Pilgrimage",
    title: "Hajj 2026",
    desc: "A premium 31-night pilgrimage from Kano to the Holy Cities, fully inclusive of visa, flights & accommodation.",
    image: heroKaaba,
    to: "/hajj",
  },
  {
    tag: "03 — Sacred Travel",
    title: "Umrah 2026",
    desc: "Year-round Umrah departures with elegant accommodation in Makkah & Madinah.",
    image: madinah,
    to: "/umrah",
  },
  {
    tag: "04 — Healthcare",
    title: "Medical Tourism",
    desc: "Coordinated international treatment journeys with hospital matching and end-to-end travel support.",
    image: plane,
    to: "/medical-tourism",
  },
];

const values = [
  { icon: Wallet, title: "Affordable Excellence", desc: "Premium service at a fair price — transparent pricing with no hidden fees." },
  { icon: GraduationCap, title: "Quality Education", desc: "Partnered with accredited universities and verified Saudi tour operators." },
  { icon: Globe2, title: "Global Opportunities", desc: "Open doors across 12+ countries with personalised consulting." },
  { icon: ShieldCheck, title: "Trusted by Hundreds", desc: "Years of safely guiding pilgrims and students from Nigeria to the world." },
];

const Index = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={heroKaaba}
            alt="The Holy Kaaba in Mecca at golden hour"
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/30 to-transparent" />
        </div>

        <div className="container-luxe relative z-10 py-20">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="eyebrow mb-6">
              <span className="w-8 h-px bg-gold" /> Najma Global Tours & Consulting
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Sacred journeys.<br />
              <span className="text-gold italic">Global futures.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
              From the courtyards of Makkah to the lecture halls of London — we craft transformative travel and education experiences for the next generation of Nigerian leaders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="gold" size="lg">
                <Link to="/booking">Book Your Journey <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/study-abroad">Explore Programs</Link>
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
            {[
              { label: "Study Abroad", to: "/study-abroad", icon: GraduationCap },
              { label: "Medical Tourism", to: "/medical-tourism", icon: HeartPulse },
              { label: "Hajj 2026 Tickets", to: "/hajj", icon: Sparkles },
              { label: "Umrah 2026 Packages", to: "/umrah", icon: Plane },
            ].map((q) => (
              <Link
                key={q.label}
                to={q.to}
                className="glass-card rounded-sm px-5 py-4 flex items-center justify-between group hover:border-gold/60 transition-all"
              >
                <span className="flex items-center gap-3 text-sm">
                  <q.icon className="w-4 h-4 text-gold" />
                  {q.label}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 sm:py-32">
        <div className="container-luxe">
          <div className="max-w-2xl mb-16">
            <div className="eyebrow mb-4">Why Najma</div>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight">
              An uncompromising standard for every traveller and student.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="glass-card rounded-sm p-7 hover:border-gold/50 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <v.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-2xl mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFERINGS */}
      <section className="py-24 sm:py-32 bg-gradient-navy">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <div className="eyebrow mb-4">Our Offerings</div>
              <h2 className="font-display text-4xl sm:text-5xl">Four pathways, one promise.</h2>
            </div>
            <p className="text-muted-foreground max-w-md">
              Every package is hand-curated. Every detail accounted for. Choose the journey that calls you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {offerings.map((o, i) => (
              <Link
                to={o.to}
                key={o.title}
                className="group relative overflow-hidden rounded-sm border border-border hover:border-gold/60 transition-all duration-700"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={o.image}
                    alt={o.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-gold mb-3">{o.tag}</div>
                  <h3 className="font-display text-3xl mb-3">{o.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{o.desc}</p>
                  <div className="inline-flex items-center gap-2 text-sm text-gold luxe-link">
                    Discover <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 sm:py-32">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="eyebrow mb-4 justify-center">Words from our travellers</div>
            <h2 className="font-display text-4xl sm:text-5xl">Stories woven in trust.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q: "Najma made my Umrah seamless from start to finish. Every detail was thought of — I just had to focus on worship.", a: "Hajiya Aisha B.", r: "Umrah 2024" },
              { q: "I'm now studying Medicine in Cyprus thanks to Najma. They walked with me through every document.", a: "Yusuf I.", r: "Medical Student" },
              { q: "Professional, transparent, and warm. The Hajj group felt like family. I'd recommend without hesitation.", a: "Alhaji Musa K.", r: "Hajj 2024" },
            ].map((t) => (
              <figure key={t.a} className="glass-card rounded-sm p-8">
                <div className="text-gold text-3xl font-display mb-4">"</div>
                <blockquote className="text-foreground/90 leading-relaxed mb-6 italic">{t.q}</blockquote>
                <figcaption>
                  <div className="font-medium">{t.a}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{t.r}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={plane} alt="" className="w-full h-full object-cover opacity-70" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/30 to-background/10" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">Ready to begin?</div>
            <h2 className="font-display text-4xl sm:text-6xl mb-6 leading-tight">
              Your journey deserves <span className="text-gold italic">a guide.</span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Speak with our consultants today. We'll walk you through every option, every visa, every flight.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="gold" size="lg"><Link to="/booking">Start a Booking</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/contact">Talk to Us</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
