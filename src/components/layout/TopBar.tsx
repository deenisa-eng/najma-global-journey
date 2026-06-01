import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Sun } from "lucide-react";

// Approximate Hijri date converter (Umm al-Qura algorithm — close enough for display)
function toHijri(date: Date) {
  const months = [
    "Muharram", "Safar", "Rabi' I", "Rabi' II", "Jumada I", "Jumada II",
    "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
  ];
  try {
    const fmt = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      day: "numeric", month: "numeric", year: "numeric",
    }).formatToParts(date);
    const d = fmt.find((p) => p.type === "day")?.value ?? "";
    const m = Number(fmt.find((p) => p.type === "month")?.value ?? 1);
    const y = fmt.find((p) => p.type === "year")?.value?.replace(/\D/g, "") ?? "";
    return `${d} ${months[m - 1]} ${y}`;
  } catch {
    return "";
  }
}

export default function TopBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const makkahTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh", hour12: false,
  }).format(now);

  const hijri = toHijri(now);

  return (
    <div className="hidden md:block border-b border-gold/15 bg-[hsl(218_60%_6%)]/90 backdrop-blur-md text-[11px] tracking-[0.18em] uppercase">
      <div className="container-luxe flex items-center justify-between h-9 text-muted-foreground">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><Sun className="w-3 h-3 text-gold" /> 34°C</span>
          <span className="flex items-center gap-2"><CalendarDays className="w-3 h-3 text-gold" /> {hijri}</span>
          <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-gold" /> {makkahTime} Makkah</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-gold" /> Abuja · Nigeria</span>
          <a href="tel:+2348167767271" className="hover:text-gold transition-colors">+234 816 776 7271</a>
        </div>
      </div>
    </div>
  );
}
