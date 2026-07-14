import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { db } from "@/lib/db";
import { isOperatorSessionActive, clearOperatorSession } from "@/lib/security";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/league", label: "League" },
  { to: "/bands", label: "Bands" },
  { to: "/events", label: "Events" },
  { to: "/venues", label: "Venues" },
  { to: "/about", label: "About" },
  { to: "/community", label: "Community" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasAccount = db.getCurrentAccount() !== null;
      setOnboarded(localStorage.getItem("bpl_user_onboarded") === "true" || hasAccount);
      setIsAdmin(isOperatorSessionActive() || window.location.pathname.startsWith("/admin"));
      setUser(db.getCurrentUser());
    }
  }, [location.pathname]);

  const handleLogout = () => {
    if (isAdmin) {
      clearOperatorSession();
    }
    db.logoutUser();
    localStorage.removeItem("bpl_user_onboarded");
    setOnboarded(false);
    setIsAdmin(false);
    setUser(null);
    navigate({ to: "/" });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl group">
          <div className="h-9 w-9 rounded-lg overflow-hidden border border-primary/20 bg-background/50 flex items-center justify-center p-1 shadow-md shadow-primary/5 group-hover:border-primary/50 group-hover:shadow-glow transition-all duration-300">
            <img src={logoImg} alt="Kalakshetra Logo" className="h-full w-full object-contain" />
          </div>
          <span className="tracking-tight text-white group-hover:text-primary-glow transition-colors">
            Kalakshetra
          </span>
        </Link>

        {/* Center: Standard Navigation Links (Accessible to everyone) */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm text-foreground font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions / CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin/applications"
              className="px-3.5 py-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
            >
              Operator Panel
            </Link>
          )}

          {user || onboarded ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-1.5 rounded-md border border-primary/20 bg-primary/10 text-primary-glow text-xs font-semibold hover:bg-primary/25 transition-all flex items-center gap-1.5"
              >
                <UserIcon size={12} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to={"/signup" as any}
                className="px-4 py-1.5 rounded-md border border-border bg-secondary/35 text-white text-xs font-semibold hover:bg-secondary/60 hover:border-muted transition-all"
              >
                Login
              </Link>
              <Link
                to="/join"
                className="btn-primary inline-flex items-center rounded-md px-4 py-1.5 text-xs font-semibold text-white hover:scale-105 active:scale-95 transition-all"
              >
                Join Kalakshetra
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-fadeIn">
          <div className="px-4 py-4 flex flex-col gap-4">
            {/* Nav links */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground px-2">
                Navigation
              </span>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-2 py-1.5 text-sm text-muted-foreground hover:text-white rounded hover:bg-secondary/20 transition-all"
                  activeProps={{
                    className:
                      "px-2 py-1.5 text-sm text-white font-semibold bg-secondary/30 rounded",
                  }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
              {isAdmin && (
                <Link
                  to="/admin/applications"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-semibold"
                >
                  Operator Panel
                </Link>
              )}

              {user || onboarded ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="w-full text-center py-2 rounded-md border border-primary/20 bg-primary/10 text-primary-glow text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <UserIcon size={12} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2 rounded-md border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={12} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to={"/signup" as any}
                    onClick={() => setOpen(false)}
                    className="text-center py-2 rounded-md border border-border bg-secondary/35 text-white text-xs font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/join"
                    onClick={() => setOpen(false)}
                    className="btn-primary text-center py-2 rounded-md text-xs font-semibold text-white"
                  >
                    Join Kalakshetra
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
