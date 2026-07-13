import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ExternalLink, TrendingUp } from "lucide-react";
import bandImg from "@/assets/band-1.jpg";
import crowdImg from "@/assets/crowd.jpg";

export const Route = createFileRoute("/production-houses")({
  head: () => ({
    meta: [
      { title: "Production Houses — BPL" },
      {
        name: "description",
        content:
          "Meet the production houses backing India's indie music. Artists invested, rights portfolios, bids and ROI, all in one place.",
      },
      { property: "og:title", content: "Production Houses — BPL" },
      {
        property: "og:description",
        content: "Full-service production partners powering the league.",
      },
    ],
  }),
  component: ProductionPage,
});

function ProductionPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="bpl-card p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="h-24 w-24 rounded-xl bg-black flex items-center justify-center font-display font-bold text-lg tracking-wider">
              KRAFTWORKS
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold">Kraftworks</h1>
              <p className="text-muted-foreground mt-1">Empowering Artists. Building Legacies.</p>
              <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Founded</p>
                  <p className="font-medium">2018</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">HQ</p>
                  <p className="font-medium">Mumbai</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Focus</p>
                  <p className="font-medium">Indie · Rock · Alternative</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary btn-primary-hover rounded-md px-5 py-2.5 text-sm font-semibold">
                Follow
              </button>
              <a
                href="#"
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm flex items-center gap-2"
              >
                kraftworks.co.in <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* About */}
        <Panel className="mt-6" title="About">
          <p className="text-muted-foreground">
            Kraftworks is a full-service music production and management company working with indie
            artists across India — bridging discovery, production, and distribution for the next
            generation of live music.
          </p>
        </Panel>

        {/* Artists invested */}
        <Panel className="mt-6" title="Artists Invested">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["The F16s", "Kryptos", "Aswekeepsearching", "Blakc"].map((n) => (
              <div key={n} className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border border-border">
                  <img src={bandImg} alt={n} className="h-full w-full object-cover" />
                </div>
                <p className="mt-2 text-sm font-medium">{n}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Rights portfolio */}
        <Panel className="mt-6" title="Rights Portfolio">
          <div className="grid grid-cols-3 gap-4">
            <Kpi v="120+" l="Tracks" />
            <Kpi v="45+" l="Artists" />
            <Kpi v="8" l="Languages" />
          </div>
        </Panel>

        {/* Upcoming bids */}
        <Panel className="mt-6" title="Upcoming Bids">
          <div className="divide-y divide-border">
            {[
              ["Indie Tour — North India", "Bidding ends in 2 days"],
              ["Campus Circuit '25", "Bidding ends in 5 days"],
            ].map(([a, b]) => (
              <div key={a} className="py-3 flex items-center justify-between">
                <p className="font-medium">{a}</p>
                <p className="text-xs text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* ROI */}
        <Panel className="mt-6" title="ROI (Last 12 Months)">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-5xl font-display font-bold gradient-text">32%</p>
              <p className="text-xs text-muted-foreground mt-1">Average ROI</p>
            </div>
            <TrendingUp className="text-primary-glow" size={64} />
          </div>
        </Panel>

        {/* Media */}
        <Panel className="mt-6" title="Media">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[bandImg, crowdImg, bandImg, crowdImg].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="media"
                loading="lazy"
                className="aspect-square object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        </Panel>

        {/* Contact */}
        <Panel className="mt-6" title="Contact">
          <p className="text-sm text-muted-foreground">
            connect@kraftworks.co.in · +91 98765 43210
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bpl-card p-6 ${className}`}>
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Kpi({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <p className="text-2xl font-display font-bold gradient-text">{v}</p>
      <p className="text-xs text-muted-foreground mt-1">{l}</p>
    </div>
  );
}
