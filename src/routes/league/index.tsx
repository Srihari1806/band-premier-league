import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Trophy,
  Music,
  MapPin,
  ArrowRight,
  Users,
  Tv,
  Briefcase,
  Star,
  Gavel,
  Vote,
  Disc3,
  Swords,
  Network,
  ChevronRight,
  Ticket,
} from "lucide-react";
import {
  SCORING_METRICS,
  POINTS_PER_FIXTURE,
  VICTORY_BONUS,
  MAX_POINTS_PER_FIXTURE,
  GATE_POINT_SCALE,
  TIE_BREAKERS,
  QUALIFICATION,
  STAGE_2_MATRIX,
  ZONES,
  ZONE_HUBS,
  standingsForZone,
  totalPoints,
  qualifyingCount,
} from "@/data/league-format";

export const Route = createFileRoute("/league/")({
  head: () => ({
    meta: [
      { title: "Kalakshetra League — India's Premier Indie Music Championship" },
      {
        name: "description",
        content:
          "Raga of Kurukshetra (Raaga of Revenge) — Season I. Learn how points are scored, where prize pool money comes from, and why your band should compete.",
      },
    ],
  }),
  component: LeaguePage,
});

const JOURNEY_STEPS = [
  { id: "register", label: "Register Profile", desc: "Artists and bands register to signal eligibility." },
  { id: "partnership", label: "Franchise Partnership", desc: "Production houses bid and partner with registered bands." },
  { id: "music", label: "Original Music", desc: "Franchises invest in original music production." },
  { id: "live", label: "Live Performances", desc: "Compete across cafes, colleges, and pilot stages." },
  { id: "points", label: "Points Table", desc: "Accumulate scores from gigs, streams, and votes." },
  { id: "top25", label: "Top 25% Qualification", desc: "The top quartile advances to the grand finale." },
  { id: "finals", label: "League Finals", desc: "The ultimate clash for the national championship." },
  { id: "champion", label: "Champion Crowned", desc: "One champion takes home the legacy and prize pool." },
];

/** Visual treatment per scoring pillar, keyed to SCORING_METRICS. */
const PILLAR_STYLE: Record<
  string,
  { icon: typeof Gavel; color: string; text: string; bar: string }
> = {
  performance: {
    icon: Gavel,
    color: "border-amber-500/25 bg-amber-500/5",
    text: "text-amber-400",
    bar: "bg-amber-400",
  },
  commercial: {
    icon: Ticket,
    color: "border-emerald-500/25 bg-emerald-500/5",
    text: "text-emerald-400",
    bar: "bg-emerald-400",
  },
  engagement: {
    icon: Vote,
    color: "border-purple-500/25 bg-purple-500/5",
    text: "text-purple-400",
    bar: "bg-purple-400",
  },
  output: {
    icon: Disc3,
    color: "border-cyan-500/25 bg-cyan-500/5",
    text: "text-cyan-400",
    bar: "bg-cyan-400",
  },
};

const ZONE_ACCENT: Record<string, { border: string; text: string; chip: string }> = {
  amber: { border: "border-amber-500/30", text: "text-amber-300", chip: "bg-amber-500/10 border-amber-500/30" },
  emerald: { border: "border-emerald-500/30", text: "text-emerald-300", chip: "bg-emerald-500/10 border-emerald-500/30" },
  purple: { border: "border-purple-500/30", text: "text-purple-300", chip: "bg-purple-500/10 border-purple-500/30" },
  cyan: { border: "border-cyan-500/30", text: "text-cyan-300", chip: "bg-cyan-500/10 border-cyan-500/30" },
};

const TIMELINE_STEPS = [
  { phase: "Phase 1", title: "Registration", dates: "Month 1", desc: "Band roster opens and qualification lists are finalized." },
  { phase: "Phase 2", title: "Production & Partnership", dates: "Month 2", desc: "Franchises select bands and produce original tracks." },
  { phase: "Phase 3", title: "League Season", dates: "Month 3-4", desc: "8-week tournament of live matches and weekly points updates." },
  { phase: "Phase 4", title: "Grand Finale", dates: "Month 4 End", desc: "The top 25% bands clash in a single-venue national broadcast." },
  { phase: "Phase 5", title: "Champion", dates: "Post-Season", desc: "Prize pool payout and tour contract activation." },
];

const ADVANTAGES = [
  { title: "Gain Production Support", desc: "Partner with established production franchises to record your tracks in professional studios.", icon: Briefcase },
  { title: "Perform Across Cities", desc: "Get slotted into official tour schedules with paid travel and secured venue bookings.", icon: MapPin },
  { title: "Build Your Fanbase", desc: "Leverage Kalakshetra's collective marketing and campus networks to grow your listeners.", icon: Users },
  { title: "Release Original Singles", desc: "Retain 50% lifetime digital content royalties under our pre-negotiated legal templates.", icon: Music },
  { title: "Win the Championship", desc: "Compete for the ultimate prize pool and secure your spot in independent music history.", icon: Trophy },
  { title: "Broadcast Exposure", desc: "Get featured on broadcast feeds, YouTube streaming events, and OTT coverage.", icon: Tv },
];

function LeaguePage() {
  const [activeZone, setActiveZone] = useState<string>("ap-ts");
  const activeZoneMeta = ZONES.find((z) => z.slug === activeZone);
  const standings = standingsForZone(activeZone);
  const cutoff = qualifyingCount(standings.length);

  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen relative overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/3 blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-24 px-4 text-center max-w-5xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary-glow text-[10px] uppercase font-bold tracking-widest">
              <Star size={10} className="animate-spin-slow" /> KALAKSHETRA LEAGUE
            </div>
            <h1 className="text-xl font-bold uppercase tracking-[0.6em] text-muted-foreground">
              SEASON I
            </h1>
            <h2 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-none">
              RAGA OF <span className="gradient-text">KURUKSHETRA</span>
            </h2>
            <p className="text-sm md:text-base font-bold text-amber-500 uppercase tracking-[0.3em] mt-2">
              Raaga of Revenge
            </p>
            <p className="mt-8 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              India's flagship independent music championship. Where production houses invest in talent, bands compete on a transparent points table, and audiences decide the ultimate legacy.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/join/band"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white shadow-lg"
              >
                Register Your Band <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* SECTION 1: WHAT IS THE LEAGUE? */}
        <section className="py-20 px-4 max-w-4xl mx-auto relative z-10 border-t border-border/45">
          <div className="bpl-card p-8 md:p-12 space-y-6 border-primary/20 bg-primary/3 text-left">
            <h3 className="text-2xl font-display font-extrabold text-white">What is the League?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every season runs for approximately <strong>four months</strong>. Rather than performing one-off gigs, bands enter a structured league where production house franchises back their journey.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on the number of franchises and registered bands count, franchises invest directly in original music production. Bands perform live across cafe stages, colleges, and festivals, while earning points to scale the standings.
            </p>
            <div className="grid gap-4 sm:grid-cols-4 pt-4">
              {[
                { v: "4 Months", l: "Season Length" },
                { v: "Live Gigs", l: "Tour Matches" },
                { v: "Originals", l: "Music & Video IP" },
                { v: "Top 25%", l: "Finale Qualifier" },
              ].map((stat) => (
                <div key={stat.l} className="border border-border/50 rounded-lg p-4 bg-surface/30">
                  <p className="text-base font-bold text-primary-glow">{stat.v}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">{stat.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: LEAGUE JOURNEY (VERTICAL FLOW) */}
        <section className="py-20 px-4 max-w-2xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Pathway</h2>
            <h3 className="text-3xl font-display font-bold text-white">League Journey</h3>
          </div>

          <div className="relative border-l border-border/50 pl-6 space-y-8 text-left">
            {JOURNEY_STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="relative group"
              >
                {/* Node circle */}
                <div className="absolute -left-[30px] top-1 h-4.5 w-4.5 rounded-full border border-primary bg-background flex items-center justify-center group-hover:bg-primary-glow transition-colors duration-200">
                  <span className="text-[8px] font-bold text-primary-glow group-hover:text-background">{idx + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider group-hover:text-primary-glow transition-colors">
                    {step.label}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 3: POINTS SYSTEM */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Scoring System</h2>
            <h3 className="text-3xl font-display font-bold text-white">
              {MAX_POINTS_PER_FIXTURE} Points On The Table, Every Fixture
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standings are decided by a public formula that balances three things a band has to get
              right at once: the performance itself, the room it can fill, and the audience it brings
              with it. {POINTS_PER_FIXTURE} points are scored on the night, with a{" "}
              {VICTORY_BONUS}-point victory bonus for the highest scorer of the fixture.
            </p>
          </div>

          {/* Metric breakdown */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch mb-8">
            {SCORING_METRICS.map((metric, idx) => {
              const style = PILLAR_STYLE[metric.pillar];
              const Icon = style.icon;
              return (
                <motion.div
                  key={metric.metric}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className={`bpl-card p-6 flex flex-col text-left border hover:border-primary/40 transition-all duration-300 ${style.color}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon size={18} className={style.text} />
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-display font-extrabold ${style.text} tabular-nums`}>
                        {metric.maxPoints}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                        max pts
                      </p>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-2">
                    {metric.metric}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{metric.basis}</p>
                  <div className="mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full ${style.bar}`}
                      style={{ width: `${(metric.maxPoints / POINTS_PER_FIXTURE) * 100}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* Gate scale */}
            <div className="bpl-card p-6 text-left space-y-4 border-emerald-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Ticket size={14} className="text-emerald-400" /> How Gate Points Scale
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Measured as the share of venue capacity actually filled, so a sold-out small room
                scores the same as a sold-out large one. No band is punished for the venue it drew.
              </p>
              <div className="space-y-2">
                {GATE_POINT_SCALE.map((band) => (
                  <div
                    key={band.label}
                    className="flex items-center justify-between gap-3 border border-border/40 rounded-lg px-3 py-2 bg-surface/30"
                  >
                    <span className="text-[11px] text-muted-foreground">{band.label}</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums shrink-0">
                      {band.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tie-breakers */}
            <div className="bpl-card p-6 text-left space-y-4 border-amber-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Swords size={14} className="text-amber-400" /> Tie-Breaker Hierarchy
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Applied in strict order. Every input is already published on the standings table, so
                a tie never gets resolved behind closed doors.
              </p>
              <div className="space-y-3">
                {TIE_BREAKERS.map((tb, idx) => (
                  <div key={tb} className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug pt-1">{tb}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualification */}
            <div className="bpl-card p-6 text-left space-y-4 border-primary/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Trophy size={14} className="text-primary-glow" /> Qualification
              </h4>
              <div className="space-y-3">
                {QUALIFICATION.map((q, idx) => (
                  <div key={q.stage} className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">{q.stage}</p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{q.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3B: LIVE POINTS TABLE */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Standings</h2>
            <h3 className="text-3xl font-display font-bold text-white">League Points Table</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Updated after every fixture, with each scoring input broken out so the total can always
              be checked against its parts. Switch zones to see how each regional table runs.
            </p>
          </div>

          {/* Regional selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {ZONE_HUBS.map((zone) => (
              <button
                key={zone.slug}
                type="button"
                onClick={() => setActiveZone(zone.slug)}
                className={`px-4 py-2 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                  activeZone === zone.slug
                    ? "border-primary/60 bg-primary/15 text-primary-glow"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
                }`}
              >
                {zone.shortName}
              </button>
            ))}
          </div>

          {activeZoneMeta && (
            <p className="text-center text-[11px] text-muted-foreground mb-6">
              <span className="font-bold text-white">{activeZoneMeta.name}</span> ·{" "}
              {activeZoneMeta.status} · {activeZoneMeta.headline}
            </p>
          )}

          <div className="bpl-card border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border/60 text-left bg-surface/40">
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">#</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Band</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">House</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-right">MP</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-amber-400 text-right">Jury</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-emerald-400 text-right">Gate</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-purple-400 text-right">Votes</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-cyan-400 text-right">IP</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-rose-400 text-right">Bonus</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-white text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, idx) => {
                    const qualified = idx < cutoff;
                    return (
                      <tr
                        key={row.band}
                        className={`border-b border-border/40 last:border-0 ${
                          qualified ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
                              qualified
                                ? "bg-primary/20 border border-primary/40 text-primary-glow"
                                : "bg-secondary/40 border border-border/50 text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white text-xs whitespace-nowrap">
                          {row.band}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                          {row.house}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground tabular-nums">
                          {row.played}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-amber-300 tabular-nums">
                          {row.juryPoints}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-emerald-300 tabular-nums">
                          {row.gatePoints}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-purple-300 tabular-nums">
                          {row.fanPoints}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-cyan-300 tabular-nums">
                          {row.releasePoints}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[11px] text-rose-300 tabular-nums">
                          {row.victoryBonus}
                        </td>
                        <td className="px-3 py-2.5 text-right font-display font-extrabold text-white tabular-nums">
                          {totalPoints(row)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/30 border border-primary/50" />
              Highlighted rows are inside the top 25% and qualify for the grand finals.
            </p>
            {activeZoneMeta && (
              <Link
                to="/league/$zone"
                params={{ zone: activeZoneMeta.slug }}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-glow hover:gap-2.5 transition-all"
              >
                {activeZoneMeta.shortName} hub <ChevronRight size={12} />
              </Link>
            )}
          </div>

          <p className="mt-4 text-[10px] text-muted-foreground/70 leading-relaxed max-w-3xl">
            Sample standings shown to demonstrate the table format. Band and house slots are
            placeholders, not results for any real act — live standings publish once the season opens.
          </p>
        </section>

        {/* SECTION 3C: MATCH MATRIX */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Stage 2 · AP/TS Regional League
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">The Match Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {STAGE_2_MATRIX.houses} production houses own {STAGE_2_MATRIX.bandsPerHouse} bands each
              — {STAGE_2_MATRIX.totalBands} bands playing {STAGE_2_MATRIX.showsPerBand} fixtures apiece
              across a two-month run. Those band appearances resolve into{" "}
              {STAGE_2_MATRIX.totalFixtures} actual ticketed nights, because a rivalry fixture is one
              shared stage rather than two separate shows.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 mb-8">
            {STAGE_2_MATRIX.categories.map((cat, idx) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="bpl-card p-6 text-left space-y-4 border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    {cat.category}
                  </h4>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-border/60 bg-surface/50 text-muted-foreground shrink-0">
                    {cat.actsPerFixture === 1 ? "1 act" : `${cat.actsPerFixture} acts`}
                  </span>
                </div>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-3xl font-display font-extrabold text-primary-glow tabular-nums">
                      {cat.showsPerBand}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      shows / band
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-display font-extrabold text-white tabular-nums">
                      {cat.fixtures}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      fixtures
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.purpose}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: STAGE_2_MATRIX.totalBands, l: "Bands Competing" },
              { v: STAGE_2_MATRIX.showsPerBand, l: "Fixtures Per Band" },
              { v: STAGE_2_MATRIX.totalFixtures, l: "Live Shows Staged" },
              { v: `${STAGE_2_MATRIX.showsPerBand * MAX_POINTS_PER_FIXTURE}`, l: "Max Season Points" },
            ].map((s) => (
              <div key={s.l} className="border border-border/50 rounded-lg p-5 bg-surface/30 text-center">
                <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                  {s.v}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bpl-card p-5 border-amber-500/20 bg-amber-500/5 flex gap-3 text-left">
            <Swords size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-amber-200">Why rivalry nights matter:</span>{" "}
              competing against another band means sharing one stage and one gate, so each act takes
              a half share of that night. What it buys is the room — two fanbases turn up instead of
              one, which is the fastest way to put a band's original music in front of people who
              have never heard it. The{" "}
              <Link to="/economics" className="text-amber-300 font-semibold hover:underline">
                economics page
              </Link>{" "}
              models both sides of that trade.
            </p>
          </div>
        </section>

        {/* SECTION 3D: REGIONAL EXPANSION */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Expansion Architecture
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">A Three-Tier Pyramid</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              State chapters feed zone leagues, zone leagues feed a national championship. Each tier
              is a complete league in its own right, so the format earns its way up rather than
              launching nationally on day one.
            </p>
          </div>

          {/* Pyramid */}
          <div className="space-y-4 mb-10">
            {(["national", "zone", "state"] as const).map((tier) => {
              const tierZones = ZONES.filter((z) => z.tier === tier);
              const tierLabel =
                tier === "national" ? "Tier 1 · National" : tier === "zone" ? "Tier 2 · Zonal" : "Tier 3 · State";
              return (
                <div key={tier} className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-center">
                    {tierLabel}
                  </p>
                  <div
                    className={`grid gap-4 ${
                      tierZones.length === 1
                        ? "max-w-md mx-auto"
                        : tierZones.length === 2
                          ? "sm:grid-cols-2 max-w-3xl mx-auto"
                          : "sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {tierZones.map((zone) => {
                      const accent = ZONE_ACCENT[zone.accent];
                      const inner = (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-display font-bold text-sm ${accent.text}`}>
                              {zone.name}
                            </h4>
                            <span
                              className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shrink-0 ${accent.chip} ${accent.text}`}
                            >
                              {zone.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {zone.headline}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {zone.languages.map((l) => (
                              <span
                                key={l}
                                className="text-[9px] font-semibold px-2 py-0.5 rounded border border-border/60 bg-surface/40 text-muted-foreground"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                          {zone.tier !== "national" && (
                            <p className="text-[10px] font-bold text-primary-glow inline-flex items-center gap-1 pt-1">
                              {zone.hubCities.length} hub cities · {zone.campusChapters} campus chapters
                              <ChevronRight size={11} />
                            </p>
                          )}
                        </>
                      );
                      return zone.tier === "national" ? (
                        <div
                          key={zone.slug}
                          className={`bpl-card p-5 text-left space-y-2 border ${accent.border}`}
                        >
                          {inner}
                        </div>
                      ) : (
                        <Link
                          key={zone.slug}
                          to="/league/$zone"
                          params={{ zone: zone.slug }}
                          className={`bpl-card p-5 text-left space-y-2 border ${accent.border} hover:-translate-y-0.5 transition block`}
                        >
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bpl-card p-6 border-primary/20 bg-primary/3 text-left flex gap-3">
            <Network size={18} className="text-primary-glow shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                How A Band Moves Up
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Win your state chapter and you represent it at the zonal finals. Finish top two in
                your zone and you are at the national championship. Every step up is a bigger room, a
                wider broadcast and a larger catalogue audience — the competition is the ladder, but
                the reach is the prize.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: LEAGUE REVENUE INFOGRAPHIC */}
        <section className="py-20 px-4 max-w-5xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Revenue Flow</h2>
            <h3 className="text-3xl font-display font-bold text-white">League Economics</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {/* Revenue Inflow */}
            <div className="bpl-card p-8 text-left space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">League Revenue Inflow</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Sourcing Value</p>
              </div>
              <div className="space-y-4 pt-2">
                {[
                  { n: "Broadcast Rights", desc: "Television and network streaming distribution fees." },
                  { n: "Digital Streaming", desc: "Subscriptions, ad revenue, and online ticket passes." },
                  { n: "YouTube Monetization", desc: "Official channel views, sponsor segments, and catalogs." },
                  { n: "Brand Sponsors", desc: "Title sponsors, stage partners, and commercial alignments." },
                  { n: "Advertising & Tickets", desc: "Local vendor ads and match passes sold at physical venues." },
                ].map((item, idx) => (
                  <div key={item.n} className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.n}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outflow / Allocation */}
            <div className="bpl-card p-8 text-left space-y-6 border-primary/20 bg-primary/3">
              <div>
                <h4 className="text-base font-bold text-white">Value Allocation</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Reinvestment Channels</p>
              </div>
              <div className="space-y-4 pt-2">
                {[
                  { n: "Grand Prize Pool", desc: "Ring-fenced prize funds paid to the winning band lineup." },
                  { n: "League Operations", desc: "Outsourced crew, live sound tech, and coordinate staff." },
                  { n: "Future Expansion", desc: "Marketing regional auditions and building new city cohorts." },
                ].map((item, idx) => (
                  <div key={item.n} className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.n}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4">
                <p className="text-[10px] text-muted-foreground leading-normal">
                  All inflow capital from league broadcasting and sponsors is reinvested directly back into the prize pool and scaling league operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SEASON TIMELINE */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Schedule</h2>
            <h3 className="text-3xl font-display font-bold text-white">Season Timeline</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 text-left">
            {TIMELINE_STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="bpl-card p-6 border-border/40 hover:border-primary/20 transition-all duration-300 relative"
              >
                <div className="absolute top-4 right-4 text-[9px] font-bold text-primary-glow uppercase tracking-widest">
                  {step.dates}
                </div>
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{step.phase}</span>
                  <h4 className="font-bold text-sm text-white">{step.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 6: WHY COMPETE? */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Benefits</h2>
            <h3 className="text-3xl font-display font-bold text-white">Why Compete?</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <motion.div
                  key={adv.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className="bpl-card p-6 text-left flex gap-4 hover:border-primary/30 transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">{adv.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">{adv.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FINAL SECTION (CTA) */}
        <section className="py-24 px-4 text-center max-w-4xl mx-auto z-10 relative border-t border-border/45">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bpl-card p-12 space-y-6 border-primary/25 bg-gradient-to-br from-secondary/40 to-transparent"
          >
            <span className="text-[10px] font-bold text-primary-glow uppercase tracking-widest">Season I</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white leading-none">
              RAGA OF KURUKSHETRA
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em]">
              Raaga of Revenge
            </p>
            <div className="flex justify-center gap-6 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              <span>Top 25%</span>
              <span>•</span>
              <span>One Champion</span>
              <span>•</span>
              <span>One Stage</span>
              <span>•</span>
              <span>One Legacy</span>
            </div>
            <div className="pt-4">
              <Link
                to="/join/band"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white shadow-lg"
              >
                Register Your Band <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
}
