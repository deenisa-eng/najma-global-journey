import { AnchorHTMLAttributes, useMemo } from "react";
import { Facebook, Twitter, Linkedin, MessageSquare, Send, Mail, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
  compact?: boolean;
}

const getFullUrl = (url?: string) => {
  if (!url) {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  if (typeof window === "undefined") {
    return url;
  }

  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
};

const ShareLink = ({ href, label, icon: Icon, compact }: { href: string; label: string; icon: typeof Share2; compact?: boolean }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background/80 text-sm transition hover:bg-muted/80",
        compact ? "h-9 w-9 px-0" : "px-3 py-2"
      )}
      aria-label={`Share on ${label}`}
    >
      <Icon className={cn("w-4 h-4", compact ? "" : "mr-0")} />
      {!compact && label}
    </a>
  );
};

export default function SocialShare({ title, description, url, className, compact }: SocialShareProps) {
  const shareUrl = useMemo(() => getFullUrl(url), [url]);
  const text = description ? `${title} — ${description}` : title;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(shareUrl);

  const whatsappHref = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const telegramHref = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`;

  const supportNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    if (!supportNativeShare || !shareUrl) {
      return;
    }

    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
    } catch {
      // ignore share dismissal or errors
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {supportNativeShare ? (
        <button
          type="button"
          onClick={handleNativeShare}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background/80 px-3 py-2 text-sm transition hover:bg-muted/80",
            compact ? "h-9 w-9 px-0" : ""
          )}
          aria-label="Share this content"
        >
          <Share2 className="w-4 h-4" />
          {!compact && "Share"}
        </button>
      ) : null}

      <ShareLink href={whatsappHref} label="WhatsApp" icon={MessageSquare} compact={compact} />
      <ShareLink href={facebookHref} label="Facebook" icon={Facebook} compact={compact} />
      <ShareLink href={twitterHref} label="Twitter" icon={Twitter} compact={compact} />
      <ShareLink href={linkedinHref} label="LinkedIn" icon={Linkedin} compact={compact} />
      <ShareLink href={telegramHref} label="Telegram" icon={Send} compact={compact} />
      <ShareLink href={emailHref} label="Email" icon={Mail} compact={compact} />
    </div>
  );
}
