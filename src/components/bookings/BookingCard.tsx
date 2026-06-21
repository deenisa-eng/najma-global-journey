import {
  BookOpen, Calendar, Check, ChevronDown, ChevronUp, Clock, Copy,
  GraduationCap, HeartPulse, Mail, Phone, Plane, Sparkles, Trash2, User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNGN } from "@/data/packages";

export type BookingRecord = {
  id: string;
  service_type: string;
  package_label: string | null;
  amount: number;
  status: "pending" | "confirmed" | string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes?: string | null;
  created_at: string;
  metadata?: {
    departure?: {
      label: string;
      depart: string;
      ret: string;
    };
  } | null;
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  hajj: Sparkles,
  umrah: Plane,
  study: GraduationCap,
  medical: HeartPulse,
};

const SERVICE_LABELS: Record<string, string> = {
  hajj: "Hajj",
  umrah: "Umrah",
  study: "Study Abroad",
  medical: "Medical Tourism",
};

function StatusBadge({ status }: { status: string }) {
  const confirmed = status === "confirmed";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border font-medium",
      confirmed ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground bg-secondary/30"
    )}>
      {confirmed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {confirmed ? "Confirmed" : "Pending"}
    </span>
  );
}

type BookingCardProps = {
  booking: BookingRecord;
  expanded: boolean;
  onToggle: () => void;
  onConfirm?: () => void;
  onDelete?: () => void;
};

export function BookingCard({ booking: b, expanded, onToggle, onConfirm, onDelete }: BookingCardProps) {
  const Icon = SERVICE_ICONS[b.service_type] ?? BookOpen;

  return (
    <div className={cn("glass-card rounded-sm transition-all duration-300", expanded && "border-gold/40")}>
      <button className="w-full p-5 flex items-center gap-4 text-left" onClick={onToggle}>
        <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg leading-tight">
              {b.package_label ?? SERVICE_LABELS[b.service_type] ?? b.service_type}
            </span>
            <StatusBadge status={b.status} />
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {new Date(b.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg text-gold">{b.amount ? formatNGN(b.amount) : "—"}</div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto mt-1" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4 grid sm:grid-cols-2 gap-4 animate-fade-in">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-3.5 h-3.5 shrink-0" /> {b.contact_name}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {b.contact_email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" /> {b.contact_phone}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Booked {new Date(b.created_at).toLocaleString("en-NG")}
            </div>
            {b.metadata?.departure && (
              <div className="text-gold text-xs font-medium">
                {b.metadata.departure.label} — {new Date(b.metadata.departure.depart).toLocaleDateString("en-NG")}
              </div>
            )}
            {b.notes && (
              <div className="text-muted-foreground italic">"{b.notes}"</div>
            )}
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Ref:</span>
            <span className="font-mono text-xs text-gold">{b.id}</span>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(b.id); toast.success("Copied"); }}
              className="text-muted-foreground hover:text-gold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!onConfirm && !onDelete && b.status === "pending" && (
              <span className="ml-auto text-xs text-muted-foreground">
                Awaiting confirmation — our team will contact you shortly.
              </span>
            )}
            {(onConfirm || onDelete) && (
              <div className="ml-auto flex gap-2">
                {b.status === "pending" && onConfirm && (
                  <Button size="sm" variant="outlineGold" className="h-8 text-[10px]" onClick={onConfirm}>
                    Confirm
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="ghost" className="h-8 text-[10px] text-destructive hover:text-destructive" onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BookingFilters({
  value,
  onChange,
  pendingCount,
}: {
  value: "all" | "pending" | "confirmed";
  onChange: (value: "all" | "pending" | "confirmed") => void;
  pendingCount: number;
}) {
  return (
    <div className="flex gap-2">
      {(["all", "pending", "confirmed"] as const).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={cn(
            "px-4 py-1.5 text-xs uppercase tracking-[0.2em] rounded-sm border transition-all",
            value === f ? "bg-gold text-gold-foreground border-gold" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {f}
          {f === "pending" && pendingCount > 0 && (
            <span className="ml-1.5 bg-amber-400 text-background rounded-full w-4 h-4 inline-flex items-center justify-center text-[9px]">
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
