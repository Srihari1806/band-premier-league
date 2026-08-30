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
  ShieldCheck,
  Info,
  CalendarDays,
  Ticket,
  GraduationCap,

  Repeat,
  CheckCircle2,
  Flag,
} from "lucide-react";
import {
  TOTAL_LEAGUE_NIGHTS,
  RELEASE_TOTALS,
  TOTAL_BANDS,
  SCHEDULE_TOTALS,
  OFF_LADDER_FORMATS,
  OFF_LADDER_TOTALS,
} from "@/data/national-season";
import { SCORED_FORMATS, FORMAT_MIX, venueOf } from "@/data/show-formats";
import {
  CAMPUS_PLANS,
  CAMPUS_TOTALS,
  CAMPUS_TIERS,
  CAMPUS_LOAD,
  CAMPUS_CLASH,
  FEST_CALENDAR,
  FEST_INTENSITY_META,
  CAMPUS_SELECTION_NOTE,
  CAMPUSES_PER_ZONE,
} from "@/data/campus-network";
import {
  BAYESIAN,
  BAYESIAN_EXAMPLES,
  CATALOGUE_SCALE,
  DIGITAL_REACH_SCALE,
  IP_INTEGRITY_RULES,
  ALR_SMOOTHING,
  ENGAGED_VIEW_THRESHOLD_PCT,
  SCORING_METRICS,
  POINTS_PER_FIXTURE,
  VICTORY_BONUS,
  MAX_POINTS_PER_FIXTURE,
  GATE_POINT_SCALE,
  TIE_BREAKERS,
  QUALIFICATION,
  STAGE_2_MATRIX,
  STAGE_2_STRUCTURE,
  STAGE_2_FINALS,
  STAGE_2_SEASON_FIXTURES,
  KNOCKOUT_ROUTE,
  SEASON_PHASES,
  SEASON_WEEKS,
  COMPETITIVE_WEEKS,
  ANNUAL_CYCLE_WEEKS,
  COMPETITION_WEEKENDS,
  NATIONAL_TOTAL_BANDS,
  NATIONAL_TOTAL_HOUSES,
  RELEASE_CYCLE,
  RELEASE_CYCLE_DAYS,
  RELEASE_ELIGIBILITY,
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
  { id: "live", label: "Live Performances", desc: "Compete across cafés, campuses and partner venues in your zone." },
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
              Season 1 opens across all of India at once. <strong>{ZONE_HUBS.length} regional
              leagues</strong> — AP/TS, Karnataka, Tamil Nadu, Kerala and North India — play the same{" "}
              <strong>{COMPETITION_WEEKENDS} weekends</strong> from 31 December to 12
              June, simultaneously, so no two zones ever compete for the same audience on the same
              night. Rather than chasing one-off gigs, a band enters a fixed calendar with a
              production house financing the work behind it.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {NATIONAL_TOTAL_HOUSES} production houses field {NATIONAL_TOTAL_BANDS} bands between
              them — {STAGE_2_MATRIX.houses} houses and {STAGE_2_MATRIX.totalBands} bands in every
              zone, with no zone larger than another. Every band plays the same{" "}
              {STAGE_2_MATRIX.showsPerBand} fixtures:{" "}
              {STAGE_2_STRUCTURE.ticketedSoloPerBand} ticketed nights,{" "}
              {STAGE_2_STRUCTURE.campusSoloPerBand} campus nights and{" "}
              {STAGE_2_STRUCTURE.intraHousePerBand} cross nights against its own stablemates. Points
              come from three things only, and the public decides all three: the room you fill, the
              votes you convert and the music you have released.
            </p>
            <div className="grid gap-4 sm:grid-cols-4 pt-4">
              {[
                { v: `${ZONE_HUBS.length} Leagues`, l: "Running In Parallel" },
                { v: `${NATIONAL_TOTAL_BANDS} Bands`, l: `${NATIONAL_TOTAL_HOUSES} Production Houses` },
                { v: `${TOTAL_LEAGUE_NIGHTS} Nights`, l: `${COMPETITION_WEEKENDS} Weekends, Dec–Jun` },
                { v: `Top ${STAGE_2_FINALS.finalists}`, l: "Qualify Per Zone" },
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
              Three metrics, ten points each — <strong>{POINTS_PER_FIXTURE} points every show</strong>,
              plus a {VICTORY_BONUS}-point victory bonus for the night's top scorer, so{" "}
              {MAX_POINTS_PER_FIXTURE} is the most any fixture can be worth. There is no jury. Every
              point comes from something the public does: turn up, vote, or listen to the record.
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

          <div className="grid gap-5 lg:grid-cols-3 mb-5">
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

            {/* Fan voting — Bayesian */}
            <div className="bpl-card p-6 text-left space-y-4 border-purple-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Vote size={14} className="text-purple-400" /> How Fan Points Are Weighted
              </h4>
              <div className="rounded-lg border border-purple-500/25 bg-purple-500/5 px-3 py-2.5 text-center">
                <p className="font-mono text-sm text-purple-200">
                  W = (v·R + m·C) &divide; (v + m)
                </p>
              </div>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <p>
                  <span className="font-mono font-bold text-white">v</span> — verified votes. Only
                  ticket-holders are prompted to rate.
                </p>
                <p>
                  <span className="font-mono font-bold text-white">R</span> — their average rating,
                  1 to {BAYESIAN.scaleMax}.
                </p>
                <p>
                  <span className="font-mono font-bold text-white">m</span> — vote threshold before
                  a score stabilises, currently {BAYESIAN.minVotes}.
                </p>
                <p>
                  <span className="font-mono font-bold text-white">C</span> — the league mean, the
                  baseline every band starts against: {BAYESIAN.leagueMean}.
                </p>
              </div>
              <div className="space-y-1.5 border-t border-border/40 pt-3">
                {BAYESIAN_EXAMPLES.map((e) => (
                  <div key={e.note} className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground leading-snug">
                      <span className="font-mono text-white">
                        {e.votes}&times;{e.rawAverage.toFixed(1)}
                      </span>{" "}
                      — {e.note}
                    </span>
                    <span className="text-xs font-bold text-purple-300 tabular-nums shrink-0">
                      {e.weighted.toFixed(2)} → {e.points}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                A raw average would let three friends rating 10/10 outrank a 9.1 from four hundred
                people. Weighting pulls a score toward the league mean until it has earned the right
                to be extreme.
              </p>
            </div>

            {/* Original IP — catalogue + reach */}
            <div className="bpl-card p-6 text-left space-y-4 border-cyan-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Disc3 size={14} className="text-cyan-400" /> How Original IP Splits
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Five points for shipping music, five for anyone actually listening. Follower counts
                are never used — they are the easiest number online to buy, and they let a band coast
                on a dead legacy audience.
              </p>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">
                  Catalogue released · 5 pts
                </p>
                {CATALOGUE_SCALE.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between gap-3 border border-border/40 rounded-lg px-3 py-1.5 bg-surface/30"
                  >
                    <span className="text-[11px] text-muted-foreground">{b.label}</span>
                    <span
                      className={`text-xs font-bold tabular-nums shrink-0 ${
                        b.points === 0 ? "text-rose-300" : "text-cyan-300"
                      }`}
                    >
                      {b.points}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">
                  Verified digital reach · 5 pts
                </p>
                <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 px-3 py-2 text-center">
                  <p className="font-mono text-[11px] text-cyan-200 leading-relaxed">
                    ALR = (active streamers + engaged viewers) &divide; (followers + {ALR_SMOOTHING})
                  </p>
                </div>
                {DIGITAL_REACH_SCALE.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-start justify-between gap-3 border border-border/40 rounded-lg px-3 py-1.5 bg-surface/30"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground leading-snug">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground/70 leading-snug">{b.growth}</p>
                    </div>
                    <span className="text-xs font-bold text-cyan-300 tabular-nums shrink-0">
                      {b.points}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                Engaged viewers means over {ENGAGED_VIEW_THRESHOLD_PCT}% average watch time, which
                automated clicks do not reach. The smoothing constant stops a five-follower account
                posting a perfect ratio off five streams.
              </p>
            </div>
          </div>

          {/* Integrity rules */}
          <div className="bpl-card p-5 border-amber-500/20 bg-amber-500/5 mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-3">
              <ShieldCheck size={14} className="text-amber-400" /> Keeping the Table Honest
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {IP_INTEGRITY_RULES.map((r) => (
                <div key={r.rule} className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-200">{r.rule}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
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
              Season 1 · Fixture Structure — Every Zone
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">The Match Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identical in all {ZONE_HUBS.length} leagues. Each zone runs{" "}
              {STAGE_2_MATRIX.houses} houses signing {STAGE_2_MATRIX.bandsPerHouse} bands —{" "}
              {STAGE_2_MATRIX.totalBands} bands per zone, {NATIONAL_TOTAL_BANDS} nationally — and
              every band anywhere plays the same {STAGE_2_MATRIX.showsPerBand} fixtures. Inside a
              house all {STAGE_2_MATRIX.crossPairsPerHouse} pairings meet exactly once. Because a
              cross night is one shared stage rather than two shows, a zone's{" "}
              {STAGE_2_MATRIX.totalBands * STAGE_2_MATRIX.showsPerBand} band appearances resolve
              into {STAGE_2_MATRIX.totalFixtures} live nights, and{" "}
              {TOTAL_LEAGUE_NIGHTS} across the country. Equal rosters mean the national table
              compares like with like without adjustment — the{" "}
              <Link to="/calendar" className="text-primary-glow font-semibold hover:underline">
                full 2027 calendar
              </Link>{" "}
              has every one of them dated.
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { v: NATIONAL_TOTAL_BANDS, l: "Bands Competing" },
              { v: STAGE_2_MATRIX.showsPerBand, l: "Fixtures Per Band" },
              { v: TOTAL_LEAGUE_NIGHTS, l: "League-Phase Nights" },
              { v: NATIONAL_TOTAL_HOUSES, l: "Production Houses" },
              { v: `${STAGE_2_MATRIX.showsPerBand * MAX_POINTS_PER_FIXTURE}`, l: "Max League Points" },
            ].map((s) => (
              <div key={s.l} className="border border-border/50 rounded-lg p-5 bg-surface/30 text-center">
                <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                  {s.v}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bpl-card p-5 border-primary/20 bg-primary/5 flex gap-3 text-left">
            <CalendarDays size={16} className="text-primary-glow shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-white">How this sits in the calendar.</span> The
              national scheduler solves for the {STAGE_2_MATRIX.individualShowsPerBand} individual
              fixtures — that is the number that has to fit {COMPETITION_WEEKENDS} weekends across
              five zones at once. Cross nights ride inside a house's own weekends, since both bands
              are already in town when their house is on. Whether a cross night consumes one of a
              band's eight slots or sits on top of them is still open, and it changes how many
              appearances a band actually makes: see the{" "}
              <Link to="/season" className="text-primary-glow font-semibold hover:underline">
                season page
              </Link>{" "}
              for the capacity working.
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="bpl-card p-5 border-amber-500/20 bg-amber-500/5 flex gap-3 text-left">
              <Swords size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-amber-200">Why cross nights matter:</span>{" "}
                sharing a stage means sharing the gate, so each act takes a half share of that night.
                What it buys is the room — two fanbases turn up instead of one, which is the fastest
                way to put a band's original music in front of people who have never heard it. The{" "}
                <Link to="/economics" className="text-amber-300 font-semibold hover:underline">
                  economics page
                </Link>{" "}
                models both sides of that trade.
              </p>
            </div>
            <div className="bpl-card p-5 border-cyan-500/20 bg-cyan-500/5 flex gap-3 text-left">
              <GraduationCap size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-cyan-200">
                  Why campus nights are counted separately:
                </span>{" "}
                the {STAGE_2_MATRIX.categories[1].fixtures} college fixtures are not there to make
                money. They are priced for reach, run through the student chapter network, and
                measured on votes, follows and turnout. A band that cannot fill a campus room will
                not fill a paying one either — which is exactly what makes them worth scoring.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3C-1: SHOW FORMATS */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Show Formats
            </h2>
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Forty-eight appearances, not forty-eight shows
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A fixture count says a band plays {FORMAT_MIX.totalPerBand} nights. It does not say
              what any of them are. Every band plays the same {FORMAT_MIX.showsPerBand}{" "}
              appearances across {COMPETITION_WEEKENDS} weeks, through the same rooms, so no band
              can be handed a softer season than its rivals. A versus night is two bands on one
              stage and a celebrity milestone is a whole zone roster on one, so the league stages
              considerably fewer nights than it delivers touchpoints — which is the difference
              between an operating plan and a wish.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {SCORED_FORMATS.map((f) => (
              <div
                key={f.id}
                className={`bpl-card p-4 space-y-2 border ${
                  f.id === "launch-night"
                    ? "border-amber-500/35 bg-amber-500/5"
                    : f.kind === "campus"
                      ? "border-emerald-500/25 bg-emerald-500/5"
                      : f.kind === "cross"
                        ? "border-fuchsia-500/25 bg-fuchsia-500/5"
                        : "border-border bg-surface/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white leading-tight">{f.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{venueOf(f.venue).name}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-border/70 bg-surface/60 text-muted-foreground shrink-0">
                    {f.perBand}×
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] tabular-nums">
                  <span className="text-white">
                    <span className="text-muted-foreground">Room </span>
                    {Math.round(f.capacityIdx * 100)}%
                  </span>
                  <span className="text-white">
                    <span className="text-muted-foreground">Ticket </span>
                    {Math.round(f.priceIdx * 100)}%
                  </span>
                  {f.actsOnStage > 1 && (
                    <span className="text-white">
                      <span className="text-muted-foreground">Bill </span>
                      {f.actsOnStage} acts
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.purpose}</p>
                <p className="text-[10px] text-muted-foreground/80 leading-snug border-t border-border/40 pt-1.5">
                  {f.ticketing}
                </p>
              </div>
            ))}
          </div>

          <div className="bpl-card p-5 border border-border bg-surface/40 mb-10 space-y-2">
            <h4 className="text-sm font-bold text-white">
              The ladder moves the audience around, not the audience size
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Room sizes are indexed so the average across the {FORMAT_MIX.soloPerBand} solo nights
              is exactly 100% — a cafe at {Math.round(SCORED_FORMATS[0].capacityIdx * 100)}% and an
              arena at{" "}
              {Math.round(
                (SCORED_FORMATS.find((f) => f.id === "arena-night")?.capacityIdx ?? 1) * 100,
              )}
              % average back to the same season attendance the flat model assumed. Ticket prices are
              not normalised, and they should not be: the arena is the biggest room on the ladder
              and one of the cheapest tickets on it, while the dearest ticket of the season is a
              seated room a fifth its size. Net effect on gate revenue is{" "}
              <span
                className={
                  FORMAT_MIX.grossIdx < 1
                    ? "text-amber-300 font-semibold"
                    : "text-emerald-300 font-semibold"
                }
              >
                {FORMAT_MIX.grossIdx < 1 ? "−" : "+"}
                {Math.abs((FORMAT_MIX.grossIdx - 1) * 100).toFixed(1)}%
              </span>{" "}
              against a season priced flat. That is what a ladder starting in a cafe costs, and it
              is worth paying — a band that only ever played 450-cap clubs would tell you nothing.
            </p>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Four more kinds of night, none of them scored
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The season opens on New Year&apos;s Eve with a launch night in every zone — every band
              on one stage with the press in the room, before a single point exists. That and the
              three below are real inventory and real reach, deliberately kept off the table: each
              is unequal in some way that would corrupt a ranking, so it earns money or coverage
              instead of points.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 mb-6">
            {OFF_LADDER_FORMATS.map((f) => (
              <div
                key={f.id}
                className="bpl-card p-5 border border-sky-500/25 bg-sky-500/5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white leading-tight">{f.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{venueOf(f.venue).name}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-sky-500/40 bg-sky-500/10 text-sky-300 shrink-0">
                    No points
                  </span>
                </div>
                <p className="text-lg font-display font-extrabold text-white tabular-nums leading-none">
                  {f.nationalNights}
                  <span className="text-[10px] font-sans font-normal text-muted-foreground ml-1.5">
                    nights a season
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.purpose}</p>
                <p className="text-[10px] text-muted-foreground/80 leading-snug">{f.ticketing}</p>
                <p className="text-[10px] leading-relaxed border-t border-sky-500/20 pt-1.5 text-sky-200/80">
                  <span className="font-semibold text-sky-300">Why no points: </span>
                  {f.whyUnscored}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bpl-card p-4 border border-border bg-surface/40">
              <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                {SCHEDULE_TOTALS.events.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-0.5">
                Scored fixtures
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-1">
                {FORMAT_MIX.commercialPerBand} commercial, {FORMAT_MIX.campusPerBand} campus and{" "}
                {FORMAT_MIX.crossPerBand} versus nights for each of {TOTAL_BANDS} bands.
              </p>
            </div>
            <div className="bpl-card p-4 border border-sky-500/25 bg-sky-500/5">
              <p className="text-2xl font-display font-extrabold text-sky-300 tabular-nums">
                {OFF_LADDER_TOTALS.total}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-0.5">
                Off-ladder nights
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-1">
{OFF_LADDER_TOTALS.launches} launch nights on 31 December,{" "}
                {OFF_LADDER_TOTALS.houseNights} house nights,{" "}
                {OFF_LADDER_TOTALS.festivalStages} festival stage-days carrying{" "}
                {OFF_LADDER_TOTALS.festivalAppearances} slots, and{" "}
                {OFF_LADDER_TOTALS.corporate} corporate shows — all dated.
              </p>
            </div>
            <div className="bpl-card p-4 border border-emerald-500/25 bg-emerald-500/5">
              <p className="text-2xl font-display font-extrabold text-emerald-300 tabular-nums">
                {OFF_LADDER_TOTALS.clashesWithFixtures}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-0.5">
                Clashes with a fixture
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-1">
                A band never takes two slots on the same day, and the generator asserts it
                across every one of the {SCHEDULE_TOTALS.appearances.toLocaleString("en-IN")}{" "}
                appearances rather than trusting the rule that produced them.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3C-2: ROAD TO THE FINAL */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Qualification & Knockout
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">Road to the Final</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The top quartile of {STAGE_2_MATRIX.totalBands} bands is {STAGE_2_FINALS.finalists}{" "}
              — seeded as one qualifier per production house, so no franchise is mathematically out
              of it before the cross phase ends. Those {STAGE_2_FINALS.finalists} then play a full
              round robin: {STAGE_2_FINALS.rivalryFixtures} nights,{" "}
              {STAGE_2_FINALS.rivalryPerFinalist} each.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { v: STAGE_2_FINALS.finalists, l: "Finalists", s: "One per house" },
              { v: STAGE_2_FINALS.rivalryFixtures, l: "Rivalry Nights", s: `${STAGE_2_FINALS.rivalryPerFinalist} per finalist` },
              { v: STAGE_2_FINALS.eliminatorFixtures, l: "Eliminator", s: "Rank 2 v Rank 3" },
              { v: STAGE_2_FINALS.grandFinalFixtures, l: "Grand Final", s: "One champion" },
            ].map((stat) => (
              <div
                key={stat.l}
                className="border border-border/50 rounded-lg p-5 bg-surface/30 text-center"
              >
                <p className="text-3xl font-display font-extrabold text-primary-glow tabular-nums">
                  {stat.v}
                </p>
                <p className="text-[10px] text-white uppercase font-bold mt-1">{stat.l}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.s}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {KNOCKOUT_ROUTE.map((step, idx) => (
              <motion.div
                key={step.stage}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`bpl-card p-6 text-left space-y-3 ${
                  idx === KNOCKOUT_ROUTE.length - 1
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  {idx === KNOCKOUT_ROUTE.length - 1 ? (
                    <Trophy size={14} className="text-amber-400" />
                  ) : (
                    <Flag size={14} className="text-primary-glow" />
                  )}
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    {step.stage}
                  </h4>
                </div>
                <p className="text-[10px] font-mono font-bold text-primary-glow uppercase tracking-wider">
                  {step.seeds}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 bpl-card p-5 border-primary/20 bg-primary/5 flex gap-3 text-left">
            <Trophy size={16} className="text-primary-glow shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-white">Two trophies, one season.</span> The
              knockout decides the champion band. Running alongside it, the{" "}
              <span className="text-primary-glow font-semibold">House Cup</span> goes to the
              production house whose {STAGE_2_MATRIX.bandsPerHouse} bands accumulate the most points
              between them. That is deliberate — it stops a franchise pouring everything into one act
              and writing off the other three, because the second trophy can only be won with the
              whole roster.
            </p>
          </div>
        </section>

        {/* SECTION 3D: REGIONAL EXPANSION */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Expansion Architecture
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              Five Leagues, One Championship
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ZONE_HUBS.length} regional leagues play the same weekends simultaneously and each
              sends its qualifiers up to a single national championship. Every regional league is a
              complete competition in its own right, so the format earns its way up market by market
              rather than launching nationally on day one.
            </p>
          </div>

          {/* Pyramid */}
          <div className="space-y-4 mb-10">
            {(["national", "state"] as const).map((tier) => {
              const tierZones = ZONES.filter((z) => z.tier === tier);
              const tierLabel =
                tier === "national" ? "Tier 1 · National Championship" : "Tier 2 · Regional Leagues";
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

        {/* SECTION 4B: CAMPUS NETWORK */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Campus Network
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              {CAMPUSES_PER_ZONE} campuses per zone, {CAMPUS_TOTALS.campuses} nationally
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The campus leg stages {CAMPUS_TOTALS.nights} campus events a season across{" "}
              {CAMPUS_TOTALS.campuses} campuses, carrying{" "}
              {(CAMPUS_TOTALS.nights * 4).toLocaleString("en-IN")} band appearances — four bands to
              a bill. Not every campus hosts every season, which is deliberate: a network you visit
              is worth more than a list you have signed.
            </p>
          </div>

          {/* Fest calendar vs the fixture calendar */}
          <div className="bpl-card p-6 mb-6 border-emerald-500/20 bg-emerald-500/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-3">
              <CalendarDays size={14} className="text-emerald-400" /> Campus Nights by Month
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {CAMPUS_LOAD.map((m) => {
                const meta = FEST_INTENSITY_META[m.intensity];
                const fest = FEST_CALENDAR.find((f) => f.month === m.month);
                return (
                  <div
                    key={m.month}
                    title={fest?.note}
                    className={`rounded-lg border p-2.5 text-center ${meta.accent}`}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-bold">{m.month}</p>
                    <p className="text-lg font-display font-extrabold text-white tabular-nums">
                      {m.nights}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider font-bold opacity-80">
                      {meta.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-emerald-200">
                The campus leg runs the whole season, not one quarter of it.
              </span>{" "}
              An earlier version crushed all {CAMPUS_CLASH.total} nights into January to March on
              the assumption of a school-style summer holiday. Colleges do not work that way — most
              run shorter breaks, many run summer terms, and June is intake and orientation, which
              is one of the better moments of the year to put a band in front of a room.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Fest season still gets the biggest night: every{" "}
              <span className="font-semibold text-white">Fest Main Stage</span> lands between
              January and March, when committees are actually booking headliners. The lighter
              formats carry the back half — battle rounds through the exam shoulder, and open quad
              sessions in May and June where the audience is a new intake looking for something to
              join. Which specific campus takes which date is still a booking decision made against
              that college&apos;s own calendar.
            </p>
          </div>

          {/* Slots per zone */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border-collapse min-w-[44rem]">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left">
                  <th className="py-2.5 px-3 font-bold text-primary-glow uppercase tracking-wider text-[10px]">Zone</th>
                  <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Campuses</th>
                  <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Nights</th>
                  <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {CAMPUS_PLANS.map((plan) => (
                  <tr key={plan.zone.slug} className="hover:bg-secondary/10 align-top">
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                      {plan.zone.shortName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-primary-glow tabular-nums">
                      {plan.totalSlots}
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground tabular-nums">
                      {plan.nightsNeeded}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {plan.allocations.map((a) => (
                          <span
                            key={a.location}
                            title={a.note}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              a.kind === "hub"
                                ? "border-border/60 bg-secondary/30 text-muted-foreground"
                                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                            }`}
                          >
                            {a.location} {a.slots}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tiers + selection */}
          <div className="grid gap-5 lg:grid-cols-3 mb-6">
            {CAMPUS_TIERS.map((tier) => (
              <div key={tier.id} className="bpl-card p-5 text-left space-y-3 border-border/40">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {tier.label}
                  </h4>
                  <span className="text-lg font-display font-extrabold text-primary-glow tabular-nums shrink-0">
                    {Math.round(CAMPUSES_PER_ZONE * tier.share)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {tier.footfall} · {tier.nightsEach}
                </p>
                <div className="space-y-1.5 border-t border-border/30 pt-2.5">
                  {tier.criteria.map((c) => (
                    <p
                      key={c}
                      className="text-[10px] text-muted-foreground leading-snug flex gap-1.5"
                    >
                      <span className="opacity-50">·</span>
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bpl-card p-5 border-amber-500/20 bg-amber-500/5 flex gap-3 text-left">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-amber-200">Selected on engagement, not prestige.</span>{" "}
                {CAMPUS_SELECTION_NOTE}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-white">Named campuses are not published here.</span>{" "}
                A college listed on this page would read as a signed partner, and none are — every
                campus is a target until a booking is agreed. Fest dates are shown as month-level
                windows for the same reason: exact 2027 dates for three hundred campuses do not
                exist yet, and a booking team planning against invented ones would be worse off than
                one planning against an honest range.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SEASON CALENDAR */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Schedule</h2>
            <h3 className="text-3xl font-display font-bold text-white">Season Calendar</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The league plays {COMPETITION_WEEKENDS} weekends between January and June, but the
              year does not stop there — {ANNUAL_CYCLE_WEEKS} weeks carry a band from the December
              draft through regional finals, the national championship and the festival circuit. The
              full national architecture, including the fixture capacity maths, is on the{" "}
              <Link to="/season" className="text-primary-glow font-semibold hover:underline">
                season page
              </Link>
              .
            </p>
          </div>

          {/* Proportional phase bar */}
          <div className="mb-8 hidden sm:flex h-3 w-full rounded-full overflow-hidden border border-border/50">
            {SEASON_PHASES.map((phase, idx) => (
              <div
                key={phase.phase}
                title={`${phase.title} — ${phase.weeks}`}
                style={{ width: `${(phase.weekCount / ANNUAL_CYCLE_WEEKS) * 100}%` }}
                className={
                  ["bg-slate-600", "bg-primary", "bg-cyan-500", "bg-purple-500", "bg-amber-500"][
                    idx % 5
                  ]
                }
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 text-left">
            {SEASON_PHASES.map((phase, idx) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bpl-card p-6 border-border/40 hover:border-primary/20 transition-all duration-300 relative"
              >
                <div className="absolute top-4 right-4 text-[9px] font-bold text-primary-glow uppercase tracking-widest">
                  {phase.weekCount}w
                </div>
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {phase.phase} · {phase.weeks}
                  </span>
                  <h4 className="font-bold text-sm text-white">{phase.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{phase.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 5B: ORIGINAL MUSIC RELEASE CYCLE */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Original IP
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              The {RELEASE_CYCLE_DAYS}-Day Production Cycle
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Writing, recording, shooting and marketing a release takes about{" "}
              {RELEASE_CYCLE_DAYS} days, which is why no band is asked to ship a song a month — that
              produces filler, not catalogue. Each band gets{" "}
              <strong>one league release inside the season</strong>, on its own week in the zone
              rotation, with the December pre-season and the July artist season either side of it.
              Across the country that is {RELEASE_TOTALS.perMonthNationally} releases a month, and inside any one house something out every fortnight.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            {RELEASE_CYCLE.map((stage, idx) => (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bpl-card p-5 border-border/40 text-left space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    {stage.weeks}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white">{stage.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{stage.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="bpl-card p-6 text-left space-y-4 border-cyan-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" /> What Counts as an Original
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The Original IP points are worth{" "}
                {SCORING_METRICS.find((metric) => metric.pillar === "output")?.maxPoints} a fixture,
                which is enough to be worth gaming. So eligibility is defined tightly rather than
                left to a judgment call on matchday.
              </p>
              <div className="space-y-2">
                {RELEASE_ELIGIBILITY.map((rule) => (
                  <div key={rule} className="flex gap-2.5 items-start">
                    <CheckCircle2 size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-snug">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bpl-card p-6 text-left space-y-4 border-primary/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Repeat size={14} className="text-primary-glow" /> Why Stagger the Releases
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                A hundred songs dropped across a season with no pacing compete with each other and
                vanish. A fixed 60-day cycle gives every release its own campaign window, its own
                fixture to launch into, and the league's channels behind it for that week.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { v: `${RELEASE_CYCLE_DAYS}d`, l: "Production cycle" },
                  { v: `${RELEASE_TOTALS.cycleDays}-day`, l: "Release cycle" },
                  { v: `${RELEASE_TOTALS.perBand}`, l: "Originals / band / season" },
                ].map((k) => (
                  <div key={k.l} className="border border-border/50 rounded-lg p-3 bg-surface/30">
                    <p className="text-lg font-display font-extrabold text-primary-glow tabular-nums">
                      {k.v}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold leading-tight mt-0.5">
                      {k.l}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                The fixture calendar and the release calendar are deliberately locked together: a
                song lands, the campaign runs, and the band walks on stage in front of a room that
                has already heard it.
              </p>
            </div>
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
