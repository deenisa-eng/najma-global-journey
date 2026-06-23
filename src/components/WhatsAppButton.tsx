import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show once user scrolls past the hero / first viewport
      setVisible(window.scrollY > window.innerHeight * 0.85);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <a
      href="https://wa.me/2348167767271?text=Assalamu%20Alaikum%2C%20I%27m%20interested%20in%20Najma%20Global%20Tours%20services."
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-40 group transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-gold/30 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-gold shadow-gold transition-transform group-hover:scale-110">
        <MessageCircle className="w-6 h-6 text-gold-foreground" />
      </span>
    </a>
  );
}

