import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Check, ExternalLink, Globe, HeartPulse, MapPin, RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SocialShare from "@/components/SocialShare";
import { Button } from "@/components/ui/button";
import { getMedicalAffiliations, type MedicalAffiliation } from "@/lib/schedules";
import medicalApollo from "@/assets/medical-apollo.jpg";
import medicalKings from "@/assets/medical-kings.jpg";
import medicalTourism from "@/assets/medical-tourism.jpg";

function resolveImage(m: MedicalAffiliation): string {
  if (m.name?.toLowerCase().includes("apollo")) return medicalApollo;
  if (m.name?.toLowerCase().includes("king")) return medicalKings;
  return m.imageUrl || medicalTourism;
}

export default function MedicalCenterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [center, setCenter] = useState<MedicalAffiliation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getMedicalAffiliations();
        if (!mounted) return;
        setCenter(data.find((m) => m.id === id) || null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-40 pb-32 text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-gold/40 mb-4" />
          <p className="text-muted-foreground">Loading details…</p>
        </div>
      </Layout>
    );
  }

  if (!center) {
    return (
      <Layout>
        <div className="container-luxe pt-40 pb-32 text-center">
          <h1 className="font-display text-4xl mb-4">Center not found</h1>
          <Button asChild variant="outlineGold">
            <Link to="/medical-tourism">Back to Medical Tourism</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const description =
    center.description ||
    `${center.name} is a world-class healthcare institution based in ${center.location}, offering expert medical care across a range of specialties. Najma Global Journey partners with ${center.name} to provide Nigerian patients with trusted referrals, seamless coordination, and end-to-end support.`;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={resolveImage(center)}
            alt={center.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/55 to-background/20" />
        </div>
        <div className="container-luxe relative">
          <button
            onClick={() => navigate("/medical-tourism")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Centers
          </button>
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block bg-gold text-gold-foreground text-[10px] uppercase tracking-[0.24em] px-3 py-1.5 rounded-sm font-semibold mb-5">
              Medical Center
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              {center.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/90">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" /> {center.location}
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-gold" /> {center.specialties.length} Specialties
              </span>
            </div>
            <div className="mt-8">
              <SocialShare
                title={center.name}
                description={`Access world-class care at ${center.name} in ${center.location} through Najma Global Journey.`}
                url={`/medical-centers/${center.id}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content + sidebar */}
      <section className="py-16">
        <div className="container-luxe grid lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-14">
            <div>
              <h2 className="font-display text-3xl text-gold mb-5">About This Center</h2>
              <p className="text-foreground/85 leading-relaxed max-w-2xl whitespace-pre-wrap">{description}</p>
            </div>

            <div>
              <h2 className="font-display text-3xl text-gold mb-6">Areas of Specialisation</h2>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {center.specialties.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </span>
                    <span className="text-foreground/90">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-3xl text-gold mb-6">Our Support</h2>
              <p className="text-foreground/85 leading-relaxed max-w-2xl mb-8">
                Najma Global Journey provides complete coordination for patients travelling to {center.name} — from initial consultation and documentation to travel logistics and post-treatment follow-up.
              </p>
              <Button asChild variant="outlineGold">
                <Link to="/booking?type=medical">Book a Consultation <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-32 self-start">
            <div className="glass-card rounded-sm p-7 border-gold/30">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-gold shrink-0" />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Partner Hospital</div>
                  <div className="font-display text-xl leading-tight">{center.name}</div>
                </div>
              </div>

              <div className="border-t border-border pt-5 mb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm font-medium text-right">{center.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Specialties</span>
                  <span className="text-sm font-medium">{center.specialties.length}</span>
                </div>
                {center.isFeatured && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gold border border-gold/30 px-2 py-0.5 rounded">
                      Featured Partner
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button asChild variant="gold" size="lg" className="w-full">
                  <Link to="/booking?type=medical">
                    Enquire About Care <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                {center.link && (
                  <Button asChild variant="outlineGold" size="lg" className="w-full">
                    <a href={center.link} target="_blank" rel="noopener noreferrer">
                      Visit Hospital <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>

              <p className="text-[11px] text-center text-muted-foreground mt-4">
                Our team will guide you through the entire medical travel process.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
