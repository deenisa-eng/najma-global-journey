import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plane, GraduationCap, HeartPulse, Sparkles, MapPin, ArrowRight, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getPackageTiers, getScholarships, getMedicalAffiliations, type PackageTier, type Scholarship, type MedicalAffiliation } from "@/lib/schedules";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "umrah" | "travel" | "study" | "medical";
  location: string;
  link: string;
};

export default function QuickSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allData, setAllData] = useState<{
    umrah: PackageTier[];
    travel: PackageTier[];
    study: Scholarship[];
    medical: MedicalAffiliation[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [umrah, travel, study, medical] = await Promise.all([
          getPackageTiers("umrah"),
          getPackageTiers("travel"),
          getScholarships(),
          getMedicalAffiliations()
        ]);
        setAllData({ umrah, travel, study, medical });
      } catch (err) {
        console.error("QuickSearch data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && !allData) {
      fetchData();
    }
  }, [isOpen, allData]);

  useEffect(() => {
    if (!allData || !query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const res: SearchResult[] = [];

    allData.umrah.forEach(t => {
      if (t.tier.toLowerCase().includes(q) || "umrah".includes(q)) {
        res.push({ id: t.id, title: `${t.tier} Umrah`, subtitle: t.duration, type: "umrah", location: "Mecca & Medina", link: `/packages/umrah/${t.id}` });
      }
    });

    allData.travel.forEach(t => {
      if (t.tier.toLowerCase().includes(q) || "travel".includes(q)) {
        res.push({ id: t.id, title: `${t.tier} Travel`, subtitle: t.duration, type: "travel", location: "Global Destinations", link: `/packages/travel/${t.id}` });
      }
    });

    allData.study.forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.institution.toLowerCase().includes(q) || "study".includes(q)) {
        res.push({ id: s.id, title: s.title, subtitle: s.institution, type: "study", location: s.location, link: `/scholarships/${s.id}` });
      }
    });

    allData.medical.forEach(m => {
      if (m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) || "medical".includes(q)) {
        res.push({ id: m.id, title: m.name, subtitle: m.specialties.join(", "), type: "medical", location: m.location, link: `/medical-tourism` });
      }
    });

    setResults(res.slice(0, 8));
  }, [query, allData]);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className={cn(
        "glass-card rounded-xl transition-all duration-300 overflow-hidden shadow-elegant border-gold/20",
        isOpen ? "ring-2 ring-gold/30" : "hover:border-gold/40"
      )}>
        <div className="relative flex items-center px-4 py-2">
          <Search className="w-5 h-5 text-gold shrink-0 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-lg py-3 placeholder:text-muted-foreground outline-none"
            placeholder="Search for Umrah, Travel, Study or Medical Care..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
          {isOpen && (
            <button 
              onClick={() => { setIsOpen(false); setQuery(""); }}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gold/40 mb-3" />
                <p className="text-sm text-muted-foreground">Searching Najma database...</p>
              </div>
            ) : query.trim() === "" ? (
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 font-bold">Recommended Services</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <QuickLink icon={Sparkles} label="Umrah Tiers" onClick={() => { navigate("/umrah"); setIsOpen(false); }} />
                  <QuickLink icon={Plane} label="Travel & Visas" onClick={() => { navigate("/travel-visas"); setIsOpen(false); }} />
                  <QuickLink icon={GraduationCap} label="Study Opportunities" onClick={() => { navigate("/study-abroad"); setIsOpen(false); }} />
                  <QuickLink icon={HeartPulse} label="Medical Tourism" onClick={() => { navigate("/medical-tourism"); setIsOpen(false); }} />
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((res) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    onClick={() => { navigate(res.link); setIsOpen(false); setQuery(""); }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gold/5 transition-colors group text-left border-b border-border/40 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                      <ResultIcon type={res.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-lg group-hover:text-gold transition-colors truncate">{res.title}</h4>
                        <span className="text-[10px] uppercase tracking-widest text-gold font-bold px-2 py-1 bg-gold/10 rounded">
                          {res.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="truncate">{res.subtitle}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <MapPin className="w-3 h-3" /> {res.location}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-all translate-x-0 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">No matches found for "{query}"</p>
                <Button variant="link" className="text-gold mt-2" onClick={() => setQuery("")}>Clear search</Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1] bg-background/20 backdrop-blur-[2px]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function QuickLink({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background/40 hover:border-gold/50 hover:bg-gold/5 transition-all group text-left"
    >
      <Icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  switch (type) {
    case "umrah": return <Sparkles className="w-5 h-5 text-gold" />;
    case "travel": return <Plane className="w-5 h-5 text-gold" />;
    case "study": return <GraduationCap className="w-5 h-5 text-gold" />;
    case "medical": return <HeartPulse className="w-5 h-5 text-gold" />;
    default: return <Search className="w-5 h-5 text-gold" />;
  }
}
