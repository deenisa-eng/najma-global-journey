import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import najmaLogo from "@/assets/najma.png";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/useAuth";

const serviceLinks = [
  { to: "/study-abroad", label: "Study Abroad" },
  { to: "/travel-visas", label: "Travel & Visas" },
  { to: "/medical-tourism", label: "Medical Tourism" },
  { to: "/hajj", label: "Hajj" },
  { to: "/umrah", label: "Umrah" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isServiceActive = serviceLinks.some((l) => location.pathname === l.to);

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

        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src={najmaLogo}
            alt="Najma Global logo"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform group-hover:rotate-12 bg-white/90 rounded-full p-1"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-lg sm:text-xl text-foreground">Najma <span className="text-gold">Global</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Tours & Consulting</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                "luxe-link text-sm tracking-wide transition-colors",
                isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
              )
            }
          >
            Home
          </NavLink>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicesOpen((v) => !v)}
              onMouseEnter={() => setServicesOpen(true)}
              className={cn(
                "luxe-link text-sm tracking-wide transition-colors flex items-center gap-1.5",
                isServiceActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
              )}
            >
              Services
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  servicesOpen && "rotate-180"
                )}
              />
            </button>

            {servicesOpen && (
              <div
                onMouseLeave={() => setServicesOpen(false)}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56 animate-scale-in"
              >
                <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-sm shadow-elegant overflow-hidden">
                  {serviceLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          "block px-5 py-3 text-sm transition-colors border-b border-border/30 last:border-b-0",
                          isActive
                            ? "text-gold bg-gold/5"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/30"
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn(
                "luxe-link text-sm tracking-wide transition-colors",
                isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
              )
            }
          >
            Contact
          </NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to={isAdmin ? "/admin" : "/portal"}>
                  <User className="w-3.5 h-3.5" /> Portal
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          <Button asChild variant="gold" size="sm">
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
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "py-3 px-4 text-base border-l-2 transition-colors",
                  isActive
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                )
              }
            >
              Home
            </NavLink>

            <div>
              <button
                onClick={() => setMobileServicesOpen((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between py-3 px-4 text-base border-l-2 transition-colors",
                  isServiceActive
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                )}
              >
                <span>Services</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    mobileServicesOpen && "rotate-180"
                  )}
                />
              </button>
              {mobileServicesOpen && (
                <div className="ml-4 border-l border-gold/20">
                  {serviceLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          "block py-2.5 px-4 text-sm transition-colors",
                          isActive ? "text-gold" : "text-foreground/70 hover:text-foreground"
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                cn(
                  "py-3 px-4 text-base border-l-2 transition-colors",
                  isActive
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                )
              }
            >
              Contact
            </NavLink>

            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to={isAdmin ? "/admin" : "/portal"}>
                      <User className="w-4 h-4" /> My Portal
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
              <Button asChild variant="gold" className="w-full">
                <Link to="/booking">Book Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
