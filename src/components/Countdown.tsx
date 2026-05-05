import { useEffect, useState } from "react";

interface Parts { days: number; hours: number; minutes: number; seconds: number; }

function diff(target: Date): Parts {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function Countdown({ target }: { target: string }) {
  const date = new Date(target);
  const [parts, setParts] = useState<Parts>(diff(date));

  useEffect(() => {
    const i = setInterval(() => setParts(diff(date)), 1000);
    return () => clearInterval(i);
  }, [target]);

  const items: [string, number][] = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Minutes", parts.minutes],
    ["Seconds", parts.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {items.map(([label, value]) => (
        <div key={label} className="glass-card rounded-sm py-5 text-center">
          <div className="font-display text-3xl sm:text-5xl text-gold tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
