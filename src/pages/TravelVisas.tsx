import { Link } from "react-router-dom";
import { ArrowRight, Check, Globe2, Briefcase, Camera, Users, ShieldCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import plane from "@/assets/plane.jpg";

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

export default function TravelVisas() {
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
