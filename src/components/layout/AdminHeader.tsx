import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import najmaLogo from "@/assets/najma.png";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/departures", label: "Departures" },
  { to: "/admin/tiers", label: "Tiers" },
  { to: "/admin/inquiries", label: "Inquiries", badge: true },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

    // Set up real-time subscription for new inquiries
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
            <div className="font-display text-xl text-foreground">Najma <span className="text-gold">Admin</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Management Portal</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {adminLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "luxe-link text-sm tracking-wide transition-colors flex items-center gap-1.5",
                  isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
                )
              }
            >
              {l.label}
              {l.badge && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[1.2rem] text-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              View Site
            </Link>
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
            {adminLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/admin"}
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
                  <l.icon className="w-5 h-5" />
                  {l.badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {l.label}
              </NavLink>
            ))}
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
