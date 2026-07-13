import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — BPL" },
      {
        name: "description",
        content:
          "The data no event company has. Shows, bands, cities, attendance, revenue, streams and top performers across the BPL league.",
      },
      { property: "og:title", content: "Analytics — BPL" },
      {
        property: "og:description",
        content: "Live analytics dashboard for India's indie music scene.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const KPIS = [
  { v: "24", l: "Shows (8 Weeks Pilot)", delta: "Target" },
  { v: "4", l: "Pilot Bands", delta: "Target" },
  { v: "6", l: "Pilot Venues", delta: "Target" },
  { v: "100", l: "Attendees / Show", delta: "Target" },
  { v: "₹11.77L", l: "Ecosystem Revenue", delta: "Projected" },
  { v: "200", l: "Fan Pass Targets", delta: "Target" },
  { v: "₹4.55L", l: "Operator Net Income", delta: "Projected" },
];

function AnalyticsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Analytics"
        title="This is to your advantage."
        subtitle="Target projections for the Hyderabad Phase 1 Pilot. Data modeling for India's upcoming music league."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.l} className="bpl-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{k.l}</p>
              <p className="mt-2 text-3xl font-display font-bold">{k.v}</p>
              <p className="text-xs text-primary-glow mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> {k.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="bpl-card p-6">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Growth Overview
          </h2>
          <div className="h-56 rounded-lg border border-border bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
            <svg
              viewBox="0 0 400 200"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.22 315)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="oklch(0.72 0.22 315)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 L40,130 L80,140 L120,100 L160,110 L200,70 L240,80 L280,50 L320,60 L360,30 L400,40 L400,200 L0,200 Z"
                fill="url(#g)"
              />
              <path
                d="M0,150 L40,130 L80,140 L120,100 L160,110 L200,70 L240,80 L280,50 L320,60 L360,30 L400,40"
                fill="none"
                stroke="oklch(0.72 0.22 315)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <TopList
            title="Top Bands"
            items={["The F16s", "Kryptos", "When Chai Met Toast", "Aswekeepsearching", "Blakc"]}
          />
          <TopList
            title="Top Venues"
            items={[
              "BlueFROG · Delhi",
              "AntiSOCIAL · Mumbai",
              "Hard Rock Cafe · Bangalore",
              "FANDOM · Hyderabad",
              "Piano Man · Delhi",
            ]}
          />
          <TopList
            title="Top Production Houses"
            items={["Kraftworks · Mumbai", "antiSOCIAL", "Red Wolf", "Olive Tree", "SoA"]}
          />
        </div>
      </div>
    </PageShell>
  );
}

function TopList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bpl-card p-6">
      <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">{title}</h3>
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={it} className="flex items-center gap-3">
            <span className="text-primary-glow font-display font-bold w-5">{i + 1}</span>
            <span className="text-sm">{it}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
