import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Check, Globe, GraduationCap, MapPin, RefreshCw, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SocialShare from "@/components/SocialShare";
import { Button } from "@/components/ui/button";
import { getScholarships, type Scholarship } from "@/lib/schedules";
import studyAbroad from "@/assets/study-abroad.jpg";

export default function StudyOpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getScholarships();
        if (!mounted) return;
        setScholarship(data.find((s) => s.id === id) || null);
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

  if (!scholarship) {
    return (
      <Layout>
        <div className="container-luxe pt-40 pb-32 text-center">
          <h1 className="font-display text-4xl mb-4">Opportunity not found</h1>
          <Button asChild variant="outlineGold"><Link to="/study-abroad">Back to opportunities</Link></Button>
        </div>
      </Layout>
    );
  }

  const description = scholarship.description || `The ${scholarship.title} at ${scholarship.institution} offers an exceptional opportunity for Nigerian students to pursue world-class education in ${scholarship.location}. This award covers ${scholarship.amount} for a duration of ${scholarship.duration}.`;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={scholarship.imageUrl || studyAbroad} alt={scholarship.title} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/55 to-background/20" />
        </div>
        <div className="container-luxe relative">
          <button
            onClick={() => navigate("/study-abroad")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Opportunities
          </button>
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block bg-gold text-gold-foreground text-[10px] uppercase tracking-[0.24em] px-3 py-1.5 rounded-sm font-semibold mb-5">
              Study Opportunity
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              {scholarship.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/90">
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gold" /> {scholarship.institution}
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold" /> {scholarship.location}
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" /> {scholarship.duration}
              </span>
            </div>
            <div className="mt-8">
              <SocialShare
                title={scholarship.title}
                description={scholarship.description || `Discover this ${scholarship.duration} opportunity in ${scholarship.location}.`}
                url={`/scholarships/${scholarship.id}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content + sticky sidebar */}
      <section className="py-16">
        <div className="container-luxe grid lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-14">
            <div>
              <h2 className="font-display text-3xl text-gold mb-5">About This Opportunity</h2>
              <p className="text-foreground/85 leading-relaxed max-w-2xl whitespace-pre-wrap">{description}</p>
            </div>

            <div>
              <h2 className="font-display text-3xl text-gold mb-6">Key Highlights & Requirements</h2>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {scholarship.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-3xl text-gold mb-6">Application Support</h2>
              <p className="text-foreground/85 leading-relaxed max-w-2xl mb-8">
                Najma Global Journey provides comprehensive consulting for admissions and scholarship applications, including personal statement reviews, documentation guidance, and interview preparation.
              </p>
              <Button asChild variant="outlineGold">
                <Link to="/booking?type=study">Consult a Specialist</Link>
              </Button>
            </div>
          </div>

          {/* Sticky pricing/info sidebar */}
          <aside className="lg:sticky lg:top-32 self-start">
            <div className="glass-card rounded-sm p-7 border-gold/30">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Award Value</div>
              <div className="font-display text-4xl text-gold leading-tight mb-3">{scholarship.amount}</div>
              
              <div className="border-t border-border pt-5 mb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm font-medium">{scholarship.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{scholarship.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="text-sm font-medium text-right">{scholarship.institution}</span>
                </div>
              </div>

              <div className="border-t border-border pt-5 mb-8 text-center">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Application Deadline</div>
                <div className="font-display text-2xl text-foreground">{scholarship.deadline}</div>
              </div>

              {scholarship.link ? (
                <div className="space-y-3">
                  <Button asChild variant="gold" size="lg" className="w-full">
                    <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
                      Official Application <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button asChild variant="outlineGold" size="lg" className="w-full">
                    <Link to="/booking?type=study">Get Admissions Support</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="gold" size="lg" className="w-full">
                  <Link to="/booking?type=study">Apply via Najma</Link>
                </Button>
              )}
              
              <p className="text-[11px] text-center text-muted-foreground mt-4">
                Our consultants are available for personalized guidance.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
