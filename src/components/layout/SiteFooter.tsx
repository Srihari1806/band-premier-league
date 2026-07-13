import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl">
            <div className="h-8 w-8 rounded-md overflow-hidden bg-background/50 flex items-center justify-center p-0.5 border border-primary/20">
              <img src={logoImg} alt="Kalakshetra Logo" className="h-full w-full object-contain" />
            </div>
            Kalakshetra
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
            The Home of Independent Music.<br />
            Raagam · Taalam · Pallavi
          </p>
        </div>
        
        <FooterCol
          title="Explore"
          links={[
            ["Home", "/"],
            ["Events", "/events"],
            ["Bands", "/bands"],
            ["Venues", "/venues"],
            ["League", "/league"],
          ]}
        />
        
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Join & Media</h4>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/join/band" className="text-sm text-muted-foreground hover:text-foreground">
                For Bands
              </Link>
            </li>
            <li>
              <Link to="/join/venue" className="text-sm text-muted-foreground hover:text-foreground">
                For Venues
              </Link>
            </li>
            <li>
              <Link to="/join/sponsor" className="text-sm text-muted-foreground hover:text-foreground">
                For Partners
              </Link>
            </li>
            <li>
              <Link to="/media" className="text-sm text-muted-foreground hover:text-foreground">
                Media Kit
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Kalakshetra. All rights reserved.</p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Facebook size={16} />
            <Twitter size={16} />
            <Instagram size={16} />
            <Youtube size={16} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2">
        {links.map(([l, h]) => (
          <li key={l}>
            <Link to={h} className="text-sm text-muted-foreground hover:text-foreground">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
