import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Trophy,
  Users,
  Building2,
  GraduationCap,
  Languages,
  ChevronRight,
  Target,
  Music,
} from "lucide-react";
import {
  ZONES,
  ZONE_HUBS,
  getZone,
  standingsForZone,
  totalPoints,
  qualifyingCount,
  MAX_POINTS_PER_FIXTURE,
} from "@/data/league-format";

export const Route = createFileRoute("/league/$zone")({
  loader: ({ params }) => {
    const zone = getZone(params.zone);
    if (!zone || zone.tier === "national") throw notFound();
    return { zone };
  },
  head: ({ loaderData }) => {
    const zone = loaderData?.zone;
    return {
      meta: [
        { title: zone ? `${zone.name} — Kalakshetra` : "League Zone — Kalakshetra" },
        {
          name: "description",
          content: zone
            ? `${zone.name}: ${zone.headline} Hub cities, campus chapters, standings and how bands and venues join.`
            : "Kalakshetra league zone.",
        },
      ],
    };
  },
  notFoundComponent: ZoneNotFound,
  component: ZonePage,
});

const ACCENT: Record<
  string,
  { text: string; border: string; chip: string; glow: string; bar: string }
> = {
  emerald: {
    text: "text-emerald-300",
    border: "border-emerald-500/30",
    chip: "bg-emerald-500/10 border-emerald-500/30",
    glow: "rgba(16, 185, 129, 0.22)",
    bar: "from-emerald-400 to-teal-300",
  },
  purple: {
    text: "text-purple-300",
    border: "border-purple-500/30",
    chip: "bg-purple-500/10 border-purple-500/30",
    glow: "rgba(168, 85, 247, 0.22)",
    bar: "from-purple-400 to-fuchsia-300",
  },
  cyan: {
    text: "text-cyan-300",
    border: "border-cyan-500/30",
    chip: "bg-cyan-500/10 border-cyan-500/30",
    glow: "rgba(34, 211, 238, 0.22)",
    bar: "from-cyan-400 to-sky-300",
  },
  amber: {
    text: "text-amber-300",
    border: "border-amber-500/30",
    chip: "bg-amber-500/10 border-amber-500/30",
    glow: "rgba(245, 158, 11, 0.22)",
    bar: "from-amber-400 to-orange-300",
  },
};

function ZoneNotFound() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-28 text-center space-y-5">
        <h1 className="text-3xl font-display font-extrabold text-white">Zone not found</h1>
        <p className="text-sm text-muted-foreground">
          That league zone does not exist yet. Here is where the league is currently running:
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {ZONE_HUBS.map((z) => (
            <Link
              key={z.slug}
              to="/league/$zone"
              params={{ zone: z.slug }}
              className="px-4 py-2 rounded-lg border border-border bg-secondary/40 text-xs font-bold text-white hover:border-primary/40 transition"
            >
              {z.name}
            </Link>
          ))}
        </div>
        <Link
          to="/league"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-glow hover:gap-2.5 transition-all pt-2"
        >
          Back to the league <ArrowRight size={12} />
        </Link>
      </section>
    </PageShell>
  );
}

function ZonePage() {
  const { zone } = Route.useLoaderData();
  const accent = ACCENT[zone.accent] ?? ACCENT.cyan;
  const standings = standingsForZone(zone.slug);
  const cutoff = qualifyingCount(standings.length);
  const feedsInto = zone.feedsInto ? ZONES.find((z) => z.slug === zone.feedsInto) : undefined;
  const feeders = ZONES.filter((z) => z.feedsInto === zone.slug);

  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen relative overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[180px] pointer-events-none" />

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${accent.glow}, transparent 70%)`,
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-14">
            <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6">
              <Link to="/league" className="hover:text-white transition">
                League
              </Link>
              <ChevronRight size={11} />
              <span className="text-white font-semibold">{zone.shortName}</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5 max-w-3xl"
            >
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${accent.chip} ${accent.text}`}
              >
                <MapPin size={13} />
                <span>{zone.status}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
                {zone.name}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {zone.headline}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {zone.languages.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-border/60 bg-surface/40 text-muted-foreground"
                  >
                    <Languages size={11} /> {l}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-10">
              {[
                { icon: <MapPin size={13} />, v: String(zone.hubCities.length), l: "Hub Cities" },
                { icon: <GraduationCap size={13} />, v: String(zone.campusChapters), l: "Campus Chapters" },
                { icon: <Languages size={13} />, v: String(zone.languages.length), l: "Language Markets" },
                {
                  icon: <Trophy size={13} />,
                  v: feedsInto ? feedsInto.shortName : "National",
                  l: "Advances To",
                },
              ].map((s) => (
                <div key={s.l} className="bpl-card p-4 border border-border/80 bg-surface/60 space-y-1">
                  <div className={`flex items-center gap-1.5 ${accent.text}`}>
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-wider font-bold">{s.l}</span>
                  </div>
                  <p className="text-2xl font-display font-extrabold text-white">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STRATEGY */}
        <section className="py-16 px-4 max-w-5xl mx-auto relative z-10">
          <div className={`bpl-card p-8 space-y-4 border ${accent.border} bg-surface/30 text-left`}>
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold flex items-center gap-2">
              <Target size={13} /> Market Strategy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{zone.strategy}</p>
            {feeders.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
                  Feeder chapters
                </p>
                <div className="flex flex-wrap gap-2">
                  {feeders.map((f) => (
                    <Link
                      key={f.slug}
                      to="/league/$zone"
                      params={{ zone: f.slug }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-white hover:border-primary/40 transition"
                    >
                      {f.name} <ChevronRight size={11} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* HUB CITIES */}
        <section className="py-16 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              The Circuit
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">Hub Cities</h3>
            <p className="text-xs text-muted-foreground">
              Fixtures rotate across these markets, so a season builds an audience in every one of
              them rather than a single home crowd.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {zone.hubCities.map((city, idx) => (
              <motion.div
                key={`${city.city}-${city.state}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="bpl-card p-5 text-left space-y-2 border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-display font-bold text-white text-sm">{city.city}</h4>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-border/60 bg-surface/50 text-muted-foreground shrink-0">
                    {city.state}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{city.note}</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-[10px] text-muted-foreground/70 text-center max-w-2xl mx-auto leading-relaxed">
            Campus reach is expressed as {zone.campusChapters} chapters across these cities. Partner
            institutions are held commercially and named under discussion rather than published here.
          </p>
        </section>

        {/* STANDINGS */}
        {standings.length > 0 && (
          <section className="py-16 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
                Standings
              </h2>
              <h3 className="text-3xl font-display font-bold text-white">{zone.shortName} Table</h3>
              <p className="text-xs text-muted-foreground">
                {MAX_POINTS_PER_FIXTURE} points available per fixture. The top quartile qualifies.
              </p>
            </div>

            <div className="bpl-card border border-border/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border/60 text-left bg-surface/40">
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">#</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Band</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">House</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-right">MP</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-emerald-400 text-right">Gate</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-purple-400 text-right">Votes</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-cyan-400 text-right">IP</th>
                      <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-white text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, idx) => (
                      <tr
                        key={row.band}
                        className={`border-b border-border/40 last:border-0 ${idx < cutoff ? "bg-primary/5" : ""}`}
                      >
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
                              idx < cutoff
                                ? "bg-primary/20 border border-primary/40 text-primary-glow"
                                : "bg-secondary/40 border border-border/50 text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white text-xs whitespace-nowrap">{row.band}</td>
                        <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.house}</td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground tabular-nums">{row.played}</td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-emerald-300 tabular-nums">{row.gatePoints}</td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-purple-300 tabular-nums">{row.fanPoints}</td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-cyan-300 tabular-nums">{row.releasePoints}</td>
                        <td className="px-3 py-2.5 text-right font-display font-extrabold text-white tabular-nums">
                          {totalPoints(row)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-muted-foreground/70 leading-relaxed max-w-3xl">
              Sample standings shown to demonstrate the table format. Band and house slots are
              placeholders, not results for any real act — live standings publish once the season
              opens.
            </p>
          </section>
        )}

        {/* REGISTRATION CTA */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Get Involved
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              Bring {zone.shortName} Into The League
            </h3>
            <p className="text-xs text-muted-foreground">
              Registrations are open across every hub city in this zone.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                to: "/join/band" as const,
                icon: Music,
                title: "Register Your Band",
                desc: "Signal eligibility for the fixture calendar and the franchise bid round.",
              },
              {
                to: "/join/venue" as const,
                icon: Building2,
                title: "Register A Venue",
                desc: "Host fixtures in your city and take the footfall the league calendar brings.",
              },
              {
                to: "/join/production-house" as const,
                icon: Trophy,
                title: "Bid As A House",
                desc: "Back bands in this zone, finance their originals and own half the catalogue.",
              },
              {
                to: "/join/volunteer" as const,
                icon: Users,
                title: "Join The Crew",
                desc: "Campus chapters and on-ground crew run the shows in every hub city.",
              },
            ].map((cta, idx) => {
              const Icon = cta.icon;
              return (
                <motion.div
                  key={cta.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.07 }}
                >
                  <Link
                    to={cta.to}
                    className="bpl-card p-6 text-left space-y-3 border-border/40 hover:border-primary/40 transition-all block h-full"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                      {cta.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{cta.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-glow">
                      Apply <ArrowRight size={11} />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* OTHER ZONES */}
        <section className="py-16 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold text-center mb-8">
            Other Zones
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {ZONE_HUBS.filter((z) => z.slug !== zone.slug).map((z) => (
              <Link
                key={z.slug}
                to="/league/$zone"
                params={{ zone: z.slug }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-bold text-white hover:border-primary/40 transition"
              >
                {z.name}
                <span className="text-[10px] font-semibold text-muted-foreground">{z.status}</span>
                <ChevronRight size={12} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
