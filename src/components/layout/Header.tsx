import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import najmaLogo from "@/assets/najma.png";
import TopBar from "@/components/layout/TopBar";

const links = [
  { to: "/", label: "Home" },
  { to: "/study-abroad", label: "Study Abroad" },
  { to: "/medical-tourism", label: "Medical Tourism" },
  { to: "/hajj", label: "Hajj 2026" },
  { to: "/umrah", label: "Umrah 2026" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled || open
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent"
      )}
    >
      <div className="container-luxe flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={najmaLogo}
            alt="Najma Global logo"
            className="w-16 h-16 object-contain transition-transform group-hover:rotate-12 bg-white/90 rounded-full p-1"
          />
          <div className="leading-tight">
            <div className="font-display text-xl text-foreground">Najma <span className="text-gold">Global</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Tours & Consulting</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "luxe-link text-sm tracking-wide transition-colors",
                  isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="gold" size="default">
            <Link to="/booking">Book Now</Link>
          </Button>
        </div>

        <button
          className="lg:hidden text-foreground p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="container-luxe py-6 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "py-3 px-4 text-base border-l-2 transition-colors",
                    isActive
                      ? "border-gold text-gold bg-gold/5"
                      : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Button asChild variant="gold" className="mt-4">
              <Link to="/booking">Book Now</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
