import { Link } from "react-router-dom";
import { ArrowRight, Check, HeartPulse, ShieldPlus, Stethoscope, Building2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import plane from "@/assets/plane.jpg";

const benefits = [
  "Pre-travel medical coordination",
  "Hospital and specialist matching",
  "Visa and travel documentation support",
  "Flight and accommodation planning",
  "On-ground assistance and follow-up care",
];

export default function MedicalTourism() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={plane} alt="International medical travel" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/60" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="eyebrow mb-5">Medical Tourism</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              Trusted care, <span className="text-gold italic">beyond borders.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              We help patients and families access quality treatment abroad with coordinated support from consultation to recovery.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="eyebrow mb-3">What We Handle</div>
              <h2 className="font-display text-4xl sm:text-5xl">A guided medical travel experience.</h2>
            </div>
            <p className="text-muted-foreground max-w-sm">Personalized support for individuals seeking specialist care in trusted international centers.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Stethoscope, title: "Specialist Access", desc: "Connect with verified consultants and hospitals for your case." },
              { icon: HeartPulse, title: "Treatment Planning", desc: "Get clear treatment pathways, estimated timelines, and guidance." },
              { icon: Building2, title: "Hospital Matching", desc: "Choose hospitals based on quality, budget, and location preferences." },
              { icon: ShieldPlus, title: "End-to-End Support", desc: "Receive coordinated travel, logistics, and post-treatment follow-up." },
            ].map((item) => (
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
            <h2 className="font-display text-4xl sm:text-5xl mb-6">Care coordination you can trust.</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We reduce the stress of international treatment by managing the details and helping you make informed decisions at every stage.
            </p>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold flex items-center justify-center">
                    <Check className="w-3 h-3 text-gold" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-sm p-8">
            <div className="eyebrow mb-3">Start Your Request</div>
            <h3 className="font-display text-3xl mb-3">Speak to a Medical Travel Advisor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Tell us your treatment goals and preferred destination. Our team will contact you with next steps.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="gold" size="lg">
                <Link to="/booking?type=medical">Book Consultation <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
