import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import najmaLogo from "@/assets/najma.png";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/study-abroad", label: "Study Abroad" },
  { to: "/travel-visas", label: "Travel & Visas" },
  { to: "/medical-tourism", label: "Medical Tourism" },
  { to: "/hajj", label: "Hajj" },
  { to: "/umrah", label: "Umrah" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

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
      <TopBar />
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

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to={isAdmin ? "/admin" : "/portal"}>
                  <User className="w-3.5 h-3.5" /> My Portal
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="default">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
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
            {user && (
              <Button asChild variant="outline" className="mt-2">
                <Link to={isAdmin ? "/admin" : "/portal"}>My Portal</Link>
              </Button>
            )}
            {user ? (
              <button onClick={signOut} className="py-3 px-4 text-base border-l-2 border-transparent text-muted-foreground hover:text-foreground flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Button asChild variant="outline" className="mt-2">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            <Button asChild variant="gold" className="mt-2">
              <Link to="/booking">Book Now</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
