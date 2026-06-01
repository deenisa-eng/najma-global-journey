import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plane, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { value: "umrah", label: "Umrah 2026" },
  { value: "hajj", label: "Hajj 2026" },
  { value: "study", label: "Study Abroad" },
  { value: "medical", label: "Medical Tourism" },
];

const MONTHS = [
  "January", "February", "March (Ramadan)", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function QuickSearch() {
  const navigate = useNavigate();
  const [service, setService] = useState("umrah");
  const [month, setMonth] = useState("");
  const [persons, setPersons] = useState(1);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams({ type: service, month, persons: String(persons) });
    navigate(`/booking?${q.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="glass-card rounded-sm p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.8fr_auto] gap-3 items-end shadow-elegant"
    >
      <Field icon={Plane} label="Service">
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full bg-transparent text-sm font-medium focus:outline-none"
        >
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
          ))}
        </select>
      </Field>

      <Field icon={Calendar} label="Departure month">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full bg-transparent text-sm font-medium focus:outline-none"
        >
          <option value="" className="bg-background">Any month</option>
          {MONTHS.map((m) => (
            <option key={m} value={m} className="bg-background">{m} 2026</option>
          ))}
        </select>
      </Field>

      <Field icon={Users} label="Persons">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPersons((p) => Math.max(1, p - 1))} className="text-gold hover:text-gold-soft w-6 h-6 leading-none">−</button>
          <span className="text-sm font-medium">{persons}</span>
          <button type="button" onClick={() => setPersons((p) => Math.min(20, p + 1))} className="text-gold hover:text-gold-soft w-6 h-6 leading-none">+</button>
        </div>
      </Field>

      <Button type="submit" variant="gold" size="lg" className="w-full lg:w-auto">
        <Search className="w-4 h-4" /> Search
      </Button>
    </form>
  );
}

function Field({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 rounded-sm border border-border bg-background/40">
      <Icon className="w-4 h-4 text-gold shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-0.5">{label}</div>
        {children}
      </div>
    </label>
  );
}
