import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import najmaLogo from "@/assets/najma.png";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-gradient-navy mt-24">
      <div className="container-luxe py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 max-w-sm">
          <div className="flex items-center gap-3 mb-5">
            <img src={najmaLogo} alt="Najma Global logo" className="w-10 h-10 object-contain" />
            <div className="font-display text-2xl">Najma <span className="text-gold">Global</span></div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A premier travel & education consultancy curating sacred journeys and global academic opportunities for discerning travellers across Nigeria.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-5">Explore</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/study-abroad" className="hover:text-gold transition-colors">Study Abroad</Link></li>
            <li><Link to="/medical-tourism" className="hover:text-gold transition-colors">Medical Tourism</Link></li>
            <li><Link to="/hajj" className="hover:text-gold transition-colors">Hajj 2026</Link></li>
            <li><Link to="/umrah" className="hover:text-gold transition-colors">Umrah 2026</Link></li>
            <li><Link to="/booking" className="hover:text-gold transition-colors">Book a Service</Link></li>
            <li><Link to="/admin" className="hover:text-gold transition-colors">Admin</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-5">Contact</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" /> 0816 776 7271</li>
            <li className="flex gap-3"><Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" /> info@najmaglobaltours.com</li>
            <li className="flex gap-3"><MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" /> Tafawa Balewa Road, CBD Abuja</li>
            <li className="flex gap-3"><Instagram className="w-4 h-4 text-gold mt-0.5 shrink-0" /> @najmaglobaltours</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-luxe py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Najma Global Tours & Consulting Ltd. All rights reserved.</div>
          <div className="tracking-[0.2em] uppercase">Crafted with care · Abuja, Nigeria</div>
        </div>
      </div>
    </footer>
  );
}
