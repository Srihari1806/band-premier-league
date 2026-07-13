import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="inline-block h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary-glow" />
            BPL
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            India&apos;s biggest platform for indie bands. The stage is yours. The league is ours.
          </p>
        </div>
        <FooterCol
          title="Explore"
          links={[
            ["Home", "/"],
            ["Events", "/events"],
            ["Bands", "/bands"],
            ["Venues", "/venues"],
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            ["For Bands", "/partners"],
            ["For Venues", "/partners"],
            ["For Partners", "/partners"],
            ["Media Kit", "/media"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Terms", "/about"],
            ["Privacy", "/about"],
            ["Cookies", "/about"],
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 BPL. All rights reserved.</p>
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
