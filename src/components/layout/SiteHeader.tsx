import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logoImg from "@/assets/logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/league", label: "League" },
  { to: "/bands", label: "Bands" },
  { to: "/join", label: "Join BPL" },
  { to: "/events", label: "Events" },
  { to: "/venues", label: "Venues" },
  { to: "/production-houses", label: "Production Houses" },
  { to: "/media", label: "Media" },
  { to: "/community", label: "Community" },
  { to: "/analytics", label: "Analytics" },
  { to: "/partners", label: "Partners" },
  { to: "/about", label: "About" },
] as const;

import { db } from "@/lib/db";
import { isOperatorSessionActive } from "@/lib/security";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnboarded(localStorage.getItem("bpl_user_onboarded") === "true");
      setIsAdmin(isOperatorSessionActive() || window.location.pathname.startsWith("/admin"));
      setUser(db.getCurrentUser());
    }
  }, []);

  const visibleNav = user || onboarded
    ? [
        ...NAV,
        { to: "/dashboard", label: "Dashboard" }
      ]
    : [
        { to: "/join", label: "Join BPL" },
        { to: "/login", label: "Login" },
        ...(isAdmin ? [{ to: "/admin/applications", label: "Operator Panel" }] : [])
      ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl group">
          <div className="h-9 w-9 rounded-lg overflow-hidden border border-primary/20 bg-background/50 flex items-center justify-center p-1 shadow-md shadow-primary/5 group-hover:border-primary/50 group-hover:shadow-glow transition-all duration-300">
            <img src={logoImg} alt="BPL Logo" className="h-full w-full object-contain" />
          </div>
          <span className="tracking-tight text-white group-hover:text-primary-glow transition-colors">BPL</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {visibleNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          className="lg:hidden text-foreground"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-4 py-3 flex flex-col">
            {visibleNav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
