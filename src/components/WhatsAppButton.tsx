import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2348167767271?text=Assalamu%20Alaikum%2C%20I%27m%20interested%20in%20Najma%20Global%20Tours%20services."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 group"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-gold/30 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-gold shadow-gold transition-transform group-hover:scale-110">
        <MessageCircle className="w-6 h-6 text-gold-foreground" />
      </span>
    </a>
  );
}
