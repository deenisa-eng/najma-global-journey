const STATS = [
  { value: "4.9/5", label: "Average rating" },
  { value: "2,400+", label: "Happy travellers" },
  { value: "12+", label: "Countries served" },
  { value: "100%", label: "Visa success rate" },
];

export default function StatsStrip() {
  return (
    <section className="py-16 border-y border-border/60 bg-gradient-navy">
      <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="font-display text-4xl sm:text-5xl text-gold mb-2">{s.value}</div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
