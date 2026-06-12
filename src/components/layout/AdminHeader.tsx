import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, Calendar, Sparkles, MessageSquare, Settings, GraduationCap, HeartPulse, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import najmaLogo from "@/assets/najma.png";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const managementLinks = [
  { to: "/admin/departures", label: "Departures", icon: Calendar },
  { to: "/admin/tiers", label: "Tiers", icon: Sparkles },
  { to: "/admin/study-opportunities", label: "Study Opportunities", icon: GraduationCap },
  { to: "/admin/medical-affiliations", label: "Medical Affiliations", icon: HeartPulse },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const isManagementActive = (pathname: string) =>
  managementLinks.some((l) => pathname === l.to);

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mgmtOpen, setMgmtOpen] = useState(false);
  const [mobileMgmtOpen, setMobileMgmtOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("contact_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel("unread-inquiries")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_inquiries" },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setMgmtOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMgmtOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="font-display text-lg sm:text-xl text-foreground">Najma <span className="text-gold">Admin</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Management Portal</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              cn(
                "luxe-link text-sm tracking-wide transition-colors",
                isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
              )
            }
          >
            Dashboard
          </NavLink>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMgmtOpen((v) => !v)}
              onMouseEnter={() => setMgmtOpen(true)}
              className={cn(
                "luxe-link text-sm tracking-wide transition-colors flex items-center gap-1.5",
                isManagementActive(location.pathname) ? "text-gold" : "text-foreground/80 hover:text-foreground"
              )}
            >
              Management
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  mgmtOpen && "rotate-180"
                )}
              />
            </button>

            {mgmtOpen && (
              <div
                onMouseLeave={() => setMgmtOpen(false)}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56 animate-scale-in"
              >
                <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-sm shadow-elegant overflow-hidden">
                  {managementLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-5 py-3 text-sm transition-colors border-b border-border/30 last:border-b-0",
                          isActive
                            ? "text-gold bg-gold/5"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/30"
                        )
                      }
                    >
                      <l.icon className="w-4 h-4 shrink-0" />
                      <span>{l.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) =>
              cn(
                "luxe-link text-sm tracking-wide transition-colors flex items-center gap-2",
                isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
              )
            }
          >
            Inquiries
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[1.2rem] text-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/">View Site</Link>
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
              to="/admin"
              end
              className={({ isActive }) =>
                cn(
                  "py-3 px-4 text-base border-l-2 transition-colors flex items-center gap-3",
                  isActive
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                )
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </NavLink>

            <div>
              <button
                onClick={() => setMobileMgmtOpen((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between py-3 px-4 text-base border-l-2 transition-colors",
                  isManagementActive(location.pathname)
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                )}
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Management
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    mobileMgmtOpen && "rotate-180"
                  )}
                />
              </button>
              {mobileMgmtOpen && (
                <div className="ml-4 border-l border-gold/20">
                  {managementLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 py-2.5 px-4 text-sm transition-colors",
                          isActive ? "text-gold" : "text-foreground/70 hover:text-foreground"
                        )
                      }
                    >
                      <l.icon className="w-4 h-4" />
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/admin/inquiries"
              className={({ isActive }) =>
                cn(
                  "py-3 px-4 text-base border-l-2 transition-colors flex items-center gap-3",
                  isActive
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-foreground/80 hover:text-foreground hover:border-border"
                )
              }
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              Inquiries
            </NavLink>

            <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2">
              <Button variant="outline" onClick={signOut} className="justify-start">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/">View Site</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
