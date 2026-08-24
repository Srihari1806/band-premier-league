import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  Ticket,
  Users,
  Building2,
  PieChart,
  Sparkles,
  Info,
  ArrowRight,
  RotateCcw,
  Layers,
  Tv,
  Music,
  Swords,
  Radio,
  ShieldCheck,
  FlaskConical,
  FileSignature,
  SlidersHorizontal,
  ChevronDown,
  Megaphone,
  AlertTriangle,
} from "lucide-react";
import {
  inr,
  inrCompact,
  numCompact,
  computeEconomics,
  DEFAULT_INPUTS,
  PRESETS,
  PLATFORM_UPSIDE_ON,
  ACTS_PER_SHARED_SHOW,
  SEASON_STRUCTURE,
  EVENT_SPLIT,
  CONTENT_SPLIT,
  CERTAINTY_META,
  REVENUE_STREAMS,
  RISK_REGISTER,
  PLATFORM_IDEAS,
  FUTURE_STREAMS,
  PARTNER_ROLES,
  PITCH_POINTS,
  type EconomicsInputs,
  type Certainty,
  type ShowEconomics,
} from "@/data/economics";

export const Route = createFileRoute("/economics")({
  head: () => ({
    meta: [
      { title: "Economics — Kalakshetra" },
      {
        name: "description",
        content:
          "A live model of the Kalakshetra league: move ticket price, attendance, fixtures or the franchise bid and watch per-show, artist, franchise and league-wide economics re-derive in front of you.",
      },
      { property: "og:title", content: "Economics — Kalakshetra" },
      {
        property: "og:description",
        content:
          "Transparent, fully interactive unit economics for bands, production houses and investors.",
      },
    ],
  }),
  component: EconomicsPage,
});

/* ------------------------------------------------------------------ *
 * Small building blocks
 * ------------------------------------------------------------------ */

function Stat({
  icon,
  value,
  label,
  hint,
  accent = "text-primary-glow",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="bpl-card p-4 border border-border/80 bg-surface/60 space-y-1">
      <div className={`flex items-center gap-1.5 ${accent}`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <p className="text-2xl font-display font-extrabold text-white tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <span className="text-sm font-bold text-primary-glow tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-primary cursor-pointer"
      />
      {hint && <p className="text-[10px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-muted-foreground block">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          aria-label={label}
          className="w-full rounded-md border border-border bg-background/70 px-2.5 py-1.5 text-sm font-semibold text-white tabular-nums focus:border-primary/60 focus:outline-none"
        />
        {suffix && <span className="text-[11px] text-muted-foreground shrink-0">{suffix}</span>}
      </div>
      {hint && <p className="text-[10px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

const CERTAINTY_STYLE: Record<Certainty, { chip: string; icon: React.ReactNode }> = {
  gate: {
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    icon: <ShieldCheck size={9} />,
  },
  contracted: {
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    icon: <FileSignature size={9} />,
  },
  modelled: {
    chip: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    icon: <FlaskConical size={9} />,
  },
};

/** Sensitivity marker — says whether a line is gate-guaranteed or upside. */
function CertaintyChip({ certainty }: { certainty: Certainty }) {
  const s = CERTAINTY_STYLE[certainty];
  const meta = CERTAINTY_META[certainty];
  return (
    <span
      title={meta.note}
      className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border shrink-0 ${s.chip}`}
    >
      {s.icon}
      {meta.short}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="space-y-2 mb-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{sub}</p>}
    </div>
  );
}

const TIER_STYLE: Record<string, { ring: string; text: string; chip: string; label: string }> = {
  music: { ring: "border-cyan-500/40", text: "text-cyan-300", chip: "bg-cyan-500/10 border-cyan-500/30", label: "Music" },
  sponsor: { ring: "border-amber-500/40", text: "text-amber-300", chip: "bg-amber-500/10 border-amber-500/30", label: "Sponsor" },
  platform: { ring: "border-purple-500/40", text: "text-purple-300", chip: "bg-purple-500/10 border-purple-500/30", label: "Platform" },
  community: { ring: "border-emerald-500/40", text: "text-emerald-300", chip: "bg-emerald-500/10 border-emerald-500/30", label: "Community" },
};

const RISK_STYLE: Record<string, string> = {
  high: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  moderate: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

/** One night's waterfall, used for both the solo and the versus format. */
function ShowCard({
  title,
  subtitle,
  show,
  accent,
  icon,
  perActLabel,
}: {
  title: string;
  subtitle: string;
  show: ShowEconomics;
  accent: string;
  icon: React.ReactNode;
  perActLabel: string;
}) {
  return (
    <div className={`bpl-card p-5 border ${accent} bg-surface/50 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            {icon} {title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground shrink-0">
          {show.attendance} in the room
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2 pt-1">
        <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
          Gross Gate
        </span>
        <span className="text-2xl font-display font-extrabold text-white tabular-nums">
          {inr(show.grossTicketRevenue)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs border-t border-border/60 pt-2.5">
        <span className="text-rose-300 flex items-center gap-1.5">
          <ArrowRight size={12} /> Ticketing commission
        </span>
        <span className="font-bold text-rose-300 tabular-nums">−{inr(show.platformCommission)}</span>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
        <span className="text-xs font-bold text-white">Net revenue to split</span>
        <span className="text-lg font-display font-extrabold text-emerald-400 tabular-nums">
          {inr(show.netRevenue)}
        </span>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-border/60">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${EVENT_SPLIT.bands}%` }} />
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${EVENT_SPLIT.productionHouse}%` }} />
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${EVENT_SPLIT.operator}%` }} />
      </div>

      <div className="space-y-2 pt-1 text-xs">
        <div className="flex justify-between items-baseline">
          <span className="text-amber-300 font-semibold">
            Band pool ({EVENT_SPLIT.bands}%)
          </span>
          <span className="font-bold text-white tabular-nums">{inr(show.bandPool)}</span>
        </div>
        <div className="flex justify-between items-baseline pl-3">
          <span className="text-muted-foreground">{perActLabel}</span>
          <span className="font-bold text-amber-300 tabular-nums">{inr(show.bandPerAct)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-cyan-300 font-semibold">
            Production house ({EVENT_SPLIT.productionHouse}%)
          </span>
          <span className="font-bold text-white tabular-nums">{inr(show.productionHousePerAct)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-purple-300 font-semibold">
            League operator ({EVENT_SPLIT.operator}%)
          </span>
          <span className="font-bold text-white tabular-nums">{inr(show.operatorShare)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

function EconomicsPage() {
  /**
   * One global state object rather than twenty useState calls — the whole page
   * is a pure function of this, so any input can be moved live in a meeting and
   * every section re-derives together.
   */
  const [inputs, setInputs] = useState<EconomicsInputs>(DEFAULT_INPUTS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const patch = useCallback(
    (p: Partial<EconomicsInputs>) => setInputs((prev) => ({ ...prev, ...p })),
    [],
  );

  const m = useMemo(() => computeEconomics(inputs), [inputs]);

  const activePreset = PRESETS.find((p) =>
    Object.entries(p.patch).every(
      ([k, v]) => inputs[k as keyof EconomicsInputs] === v,
    ),
  );

  const isDefault = useMemo(
    () => (Object.keys(DEFAULT_INPUTS) as (keyof EconomicsInputs)[]).every(
      (k) => inputs[k] === DEFAULT_INPUTS[k],
    ),
    [inputs],
  );

  const upsideOn = m.platformUpsideTotal > 0;
  const toggleUpside = () =>
    patch(
      upsideOn
        ? {
            inHouseTicketingPct: 0,
            ppvPrice: 0,
            ppvBuyersPerFixture: 0,
            merchAttachPct: 0,
            merchMargin: 0,
            fanPassPrice: 0,
            fanPassBuyersPerFixture: 0,
            sponsorPortalPerFixture: 0,
          }
        : PLATFORM_UPSIDE_ON,
    );

  return (
    <PageShell>
      {/* ================= HEAD BANNER ================= */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.22), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(249, 115, 22, 0.15), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12 space-y-6">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold tracking-wide">
              <TrendingUp size={14} />
              <span>Investor Briefing — Live Season Model</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Economics
              </span>{" "}
              of the League
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every figure on this page is derived, not typed in. Move a ticket price or a franchise
              bid in the bar below and the entire ecosystem — per show, per band, per franchise, per
              season — re-derives in front of you.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <Stat
              icon={<Ticket size={13} />}
              value={inr(m.soloShow.netRevenue)}
              label="Net Per Solo Show"
              hint={`After the ${inputs.ticketingCommissionPct}% ticketing cut`}
              accent="text-emerald-400"
            />
            <Stat
              icon={<Building2 size={13} />}
              value={`${m.phSeasonMultiple.toFixed(2)}×`}
              label="Franchise Return"
              hint={`${m.phGateBackedMultiple.toFixed(2)}× of it gate-backed`}
              accent="text-cyan-400"
            />
            <Stat
              icon={<Music size={13} />}
              value={inrCompact(m.artistPerMemberYear)}
              label="Per Musician / Yr"
              hint={`${SEASON_STRUCTURE.seasonsPerYear} seasons, ${inputs.bandMembers}-piece band`}
              accent="text-amber-400"
            />
            <Stat
              icon={<PieChart size={13} />}
              value={inrCompact(m.operatorNet)}
              label="Operator Surplus"
              hint={`${m.operatorMarginPct.toFixed(0)}% margin on ${inrCompact(m.operatorGross)} gross`}
              accent="text-purple-400"
            />
          </div>
        </div>
      </section>

      {/* ================= GLOBAL INPUT BAR ================= */}
      {/*
        Pinned on desktop so an investor can move an input while looking at any
        section. Left unpinned on small screens — stacked, the controls run to
        well over half the viewport, which would leave almost no room to read.
      */}
      <section className="relative lg:sticky lg:top-16 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-4">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
              <Layers size={12} className="text-primary-glow" /> Scenario
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                title={p.blurb}
                onClick={() => patch(p.patch)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                  activePreset?.id === p.id
                    ? "border-primary/60 bg-primary/15 text-primary-glow"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
            >
              <SlidersHorizontal size={11} /> Advanced inputs
              <ChevronDown size={11} className={advancedOpen ? "rotate-180 transition" : "transition"} />
            </button>
            {!isDefault && (
              <button
                type="button"
                onClick={() => setInputs(DEFAULT_INPUTS)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Base parameters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-3">
            <Slider
              label="Ticket Price"
              value={inputs.ticketPrice}
              min={99}
              max={1499}
              step={10}
              onChange={(v) => patch({ ticketPrice: v })}
              format={(v) => inr(v)}
            />
            <Slider
              label="Attendance (solo night)"
              value={inputs.attendance}
              min={40}
              max={1200}
              step={10}
              onChange={(v) => patch({ attendance: v })}
              format={(v) => `${v}`}
            />
            <Slider
              label="Fixtures / Band / Season"
              value={inputs.showsPerBand}
              min={4}
              max={24}
              step={1}
              onChange={(v) => patch({ showsPerBand: v })}
              format={(v) => `${v}`}
            />
            <Slider
              label="Franchises"
              value={inputs.numFranchises}
              min={2}
              max={12}
              step={1}
              onChange={(v) => patch({ numFranchises: v })}
              format={(v) => `${v}`}
            />
            <NumberField
              label="Winning Bid / Franchise"
              value={inputs.winningBid}
              step={10000}
              onChange={(v) => patch({ winningBid: v })}
              hint={`${m.totalBands} bands in the season`}
            />
          </div>

          {/* Advanced */}
          {advancedOpen && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-border/60">
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-primary-glow flex items-center gap-1.5">
                  <Swords size={11} /> Fixture Format
                </h4>
                <Slider
                  label="Solo showcases"
                  value={inputs.soloSharePct}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => patch({ soloSharePct: v })}
                  format={(v) => `${v}%`}
                  hint={`${m.soloShowsPerBand} solo · ${m.sharedShowsPerBand} versus nights`}
                />
                <Slider
                  label="Co-headline footfall uplift"
                  value={inputs.coHeadlineUplift}
                  min={1}
                  max={2.2}
                  step={0.05}
                  onChange={(v) => patch({ coHeadlineUplift: v })}
                  format={(v) => `${v.toFixed(2)}×`}
                  hint={`Versus night draws ${m.sharedShow.attendance}`}
                />
                <NumberField
                  label="Bands per production house"
                  value={inputs.bandsPerFranchise}
                  step={1}
                  min={1}
                  onChange={(v) => patch({ bandsPerFranchise: Math.max(1, v) })}
                />
                <NumberField
                  label="Band members"
                  value={inputs.bandMembers}
                  step={1}
                  min={1}
                  onChange={(v) => patch({ bandMembers: Math.max(1, v) })}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                  <FileSignature size={11} /> Contracted Rights
                </h4>
                <Slider
                  label="Ticketing commission"
                  value={inputs.ticketingCommissionPct}
                  min={0}
                  max={15}
                  step={0.5}
                  onChange={(v) => patch({ ticketingCommissionPct: v })}
                  format={(v) => `${v}%`}
                />
                <NumberField
                  label="Third-party licensing"
                  value={inputs.licensingRights}
                  onChange={(v) => patch({ licensingRights: v })}
                />
                <NumberField
                  label="Broadcast rights (franchise)"
                  value={inputs.broadcastRights}
                  onChange={(v) => patch({ broadcastRights: v })}
                />
                <NumberField
                  label="Sync & brand placements"
                  value={inputs.syncPlacements}
                  onChange={(v) => patch({ syncPlacements: v })}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-purple-300 flex items-center gap-1.5">
                  <FlaskConical size={11} /> Catalogue (per band / yr)
                </h4>
                <NumberField
                  label="YouTube views a year"
                  value={inputs.youtubeViewsAnnual}
                  step={100000}
                  onChange={(v) => patch({ youtubeViewsAnnual: v })}
                  hint={`= ${inr((inputs.youtubeViewsAnnual / 1000) * inputs.youtubeRpm)} at current RPM`}
                />
                <NumberField
                  label="YouTube RPM"
                  value={inputs.youtubeRpm}
                  step={5}
                  onChange={(v) => patch({ youtubeRpm: v })}
                  suffix="/1K"
                />
                <NumberField
                  label="Music platforms"
                  value={inputs.musicPlatformsAnnual}
                  onChange={(v) => patch({ musicPlatformsAnnual: v })}
                />
                <NumberField
                  label="Exclusive music partner"
                  value={inputs.exclusivePartnerAnnual}
                  onChange={(v) => patch({ exclusivePartnerAnnual: v })}
                />
                <NumberField
                  label="Band sponsorships"
                  value={inputs.bandSponsorshipAnnual}
                  onChange={(v) => patch({ bandSponsorshipAnnual: v })}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 flex items-center gap-1.5">
                  <Radio size={11} /> League Pools (per season)
                </h4>
                <NumberField
                  label="Broadcast rights (league)"
                  value={inputs.leagueBroadcastSeason}
                  onChange={(v) => patch({ leagueBroadcastSeason: v })}
                />
                <NumberField
                  label="Sponsorship"
                  value={inputs.leagueSponsorshipSeason}
                  onChange={(v) => patch({ leagueSponsorshipSeason: v })}
                />
                <NumberField
                  label="Members"
                  value={inputs.membersCount}
                  step={50}
                  onChange={(v) => patch({ membersCount: v })}
                />
                <NumberField
                  label="Membership price"
                  value={inputs.membershipPrice}
                  step={50}
                  onChange={(v) => patch({ membershipPrice: v })}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= UNIT ECONOMICS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Unit Economics"
          title="Two kinds of night, followed rupee by rupee"
          sub="A solo showcase is one band carrying a room on its own. A versus fixture is one ticketed night shared by two competing bands — the gate does not double, the split does. Both fanbases turn up, so the room is bigger, but each act takes home a half share of it."
        />

        <div className="grid lg:grid-cols-2 gap-5">
          <ShowCard
            title="Solo Showcase"
            subtitle="One band, one room, the whole band share"
            show={m.soloShow}
            accent="border-emerald-500/30"
            icon={<Music size={15} className="text-emerald-400" />}
            perActLabel="The band takes"
          />
          <ShowCard
            title="Versus Fixture"
            subtitle={`${ACTS_PER_SHARED_SHOW} rival bands, one shared night`}
            show={m.sharedShow}
            accent="border-amber-500/30"
            icon={<Swords size={15} className="text-amber-400" />}
            perActLabel="Each band takes"
          />
        </div>

        {/* The trade-off, stated plainly */}
        <div className="mt-5 grid lg:grid-cols-[1fr_320px] gap-5">
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Swords size={15} className="text-amber-400" /> What competing actually costs — and pays
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Competing against a rival band means sharing the stage, not doubling the calendar. On a
              versus night the {EVENT_SPLIT.bands}% band pool is split{" "}
              {ACTS_PER_SHARED_SHOW} ways, so each act is paid{" "}
              <span className="font-semibold text-white">{inr(m.sharedShow.bandPerAct)}</span> against{" "}
              <span className="font-semibold text-white">{inr(m.soloShow.bandPool)}</span> on a solo
              night. That is the cost.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              What it buys is the room. Two fanbases in one venue takes the draw from{" "}
              {inputs.attendance} to {m.sharedShow.attendance} — an extra{" "}
              <span className="font-semibold text-white">
                {numCompact(m.sharedNightExtraFootfall)} people
              </span>{" "}
              across a band's season who would otherwise never have heard it play. For a league whose
              job is putting original music in front of new audiences, that reach is the product; the
              gate is how it pays for itself.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                  Gate income, this mix
                </p>
                <p className="text-lg font-display font-extrabold text-white tabular-nums">
                  {inr(m.bandGateSeason)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                  If every night were solo
                </p>
                <p className="text-lg font-display font-extrabold text-muted-foreground tabular-nums">
                  {inr(m.bandGateSeasonAllSolo)}
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">
                  Reach bought
                </p>
                <p className="text-lg font-display font-extrabold text-amber-300 tabular-nums">
                  +{numCompact(m.sharedNightExtraFootfall)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              At a {inputs.coHeadlineUplift.toFixed(2)}× uplift a versus night pays each act{" "}
              {m.sharedShow.bandPerAct >= m.soloShow.bandPool ? "more" : "less"} than a solo night.
              The break-even uplift is {ACTS_PER_SHARED_SHOW.toFixed(2)}× — above that, sharing the
              stage is better business as well as better exposure.
            </p>
          </div>

          <div className="bpl-card p-5 border border-border/80 bg-surface/60 space-y-3 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers size={15} className="text-primary-glow" /> Season fixture mix
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fixtures per band</span>
                <span className="font-bold text-white tabular-nums">{inputs.showsPerBand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">Solo showcases</span>
                <span className="font-bold text-white tabular-nums">{m.soloShowsPerBand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-300">Versus fixtures</span>
                <span className="font-bold text-white tabular-nums">{m.sharedShowsPerBand}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Bands in the season</span>
                <span className="font-bold text-white tabular-nums">{m.totalBands}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticketed nights staged</span>
                <span className="font-bold text-white tabular-nums">{m.totalFixtures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total admissions</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {numCompact(m.totalAdmissions)}
                </span>
              </div>
            </div>

            {/* Run rate — the same calendar expressed as a cadence */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary-glow">
                Run Rate
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Shows per month</span>
                <span className="font-bold text-white tabular-nums">
                  {m.showsPerMonth.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Monthly net pool</span>
                <span className="font-bold text-white tabular-nums">{inr(m.monthlyNetGate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Annualised gate</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {inrCompact(m.annualNetGate)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Annual admissions</span>
                <span className="font-bold text-white tabular-nums">
                  {numCompact(m.annualAdmissions)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed flex gap-1.5 pt-3 border-t border-border/60">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Cadence is an output, not a dial: {m.totalBands} bands × {inputs.showsPerBand}{" "}
                appearances resolve to {m.totalFixtures} ticketed nights, because shared stages are
                counted once. Gate only — catalogue, licensing, broadcast, sponsorship and
                memberships sit outside this pool.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ================= FRANCHISE RETURN ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Franchise Investment"
            title="What a production house puts in, and gets back in one season"
            sub={`One franchise across a ${SEASON_STRUCTURE.monthsPerSeason}-month season. Capital at risk is the winning bid; the event budget is carried by the title sponsor, so it is not franchise money. Every return line is tagged by how certain it is.`}
          />

          {/* Gate-backed vs variable — the reframe */}
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div className="bpl-card p-4 border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck size={13} />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  Gate-Backed Return
                </span>
              </div>
              <p className="text-2xl font-display font-extrabold text-white tabular-nums">
                {inr(m.phGateBackedTotal)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {m.phGateBackedMultiple.toFixed(2)}× the bid — recovers{" "}
                {m.phCapitalRecoveredPct.toFixed(0)}% of capital from ticket sales alone
              </p>
            </div>
            <div className="bpl-card p-4 border border-amber-500/30 bg-amber-500/5 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300">
                <FileSignature size={13} />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  Variable IP Upside
                </span>
              </div>
              <p className="text-2xl font-display font-extrabold text-white tabular-nums">
                {inr(m.phVariableTotal)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {m.phVariablePct.toFixed(0)}% of the headline return — needs rights deals to land
              </p>
            </div>
            <div className="bpl-card p-4 border border-border/80 bg-surface/60 space-y-1">
              <div className="flex items-center gap-1.5 text-primary-glow">
                <TrendingUp size={13} />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  Combined Multiple
                </span>
              </div>
              <p className="text-2xl font-display font-extrabold text-white tabular-nums">
                {m.phSeasonMultiple.toFixed(2)}×
              </p>
              <p className="text-[11px] text-muted-foreground">
                {inr(inputs.winningBid)} in, {inr(m.phSeasonTotal)} back
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Building2 size={15} className="text-rose-400" /> Capital At Risk
              </h3>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-white font-semibold">Winning Bid</span>
                <span className="text-2xl font-display font-extrabold text-rose-300 tabular-nums">
                  {inr(inputs.winningBid)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Funds music and video production for the{" "}
                {inputs.bandsPerFranchise > 1
                  ? `${inputs.bandsPerFranchise} bands the house signs`
                  : "band the house signs"}
                , plus its own overhead. It is the only figure the franchise carries.
              </p>

              <div className="pt-3 border-t border-border/50 space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Funded separately by the title sponsor
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Event marketing, travel and on-ground logistics sit in the title sponsor's event
                  budget, not on the franchise's balance sheet. Contracted event managers are paid
                  out of the operator's {EVENT_SPLIT.operator}% rather than taking a fourth cut.
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Break-even
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  On gate alone the house recovers {m.phCapitalRecoveredPct.toFixed(0)}% of the bid
                  this season. The remaining{" "}
                  {inr(Math.max(0, inputs.winningBid - m.phGateBackedTotal))} has to come from rights
                  income — or from the second season, where the catalogue is already built and the
                  bid is not paid again.
                </p>
              </div>
            </div>

            <div className="bpl-card p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp size={15} className="text-emerald-400" /> Season Return
              </h3>

              <div className="space-y-3 text-sm">
                {m.phSeasonReturn.map((r) => (
                  <div key={r.label} className="space-y-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-white font-semibold flex items-center gap-1.5 flex-wrap">
                        {r.label} <CertaintyChip certainty={r.certainty} />
                      </span>
                      <span className="font-bold text-white tabular-nums shrink-0">
                        {inr(r.amount)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Total Return</span>
                <span className="text-2xl font-display font-extrabold text-emerald-400 tabular-nums">
                  {inr(m.phSeasonTotal)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-300/80">
                    Net Profit
                  </p>
                  <p
                    className={`text-lg font-display font-extrabold tabular-nums ${
                      m.phSeasonProfit < 0 ? "text-rose-300" : "text-white"
                    }`}
                  >
                    {m.phSeasonProfit < 0 ? "−" : ""}
                    {inr(Math.abs(m.phSeasonProfit))}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-300/80">
                    Return Multiple
                  </p>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">
                    {m.phSeasonMultiple.toFixed(2)}×
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-4">
            {(Object.keys(CERTAINTY_META) as Certainty[]).map((c) => (
              <div key={c} className="flex items-start gap-2 max-w-xs">
                <CertaintyChip certainty={c} />
                <p className="text-[10px] text-muted-foreground leading-snug">
                  <span className="font-semibold text-white">{CERTAINTY_META[c].label}.</span>{" "}
                  {CERTAINTY_META[c].note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ARTIST EARNINGS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Artist Earnings"
          title="What the musicians actually take home"
          sub={`The same season from the band's side — ${m.soloShowsPerBand} solo nights and ${m.sharedShowsPerBand} shared ones — then split across a ${inputs.bandMembers}-piece line-up.`}
        />

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
            <div className="space-y-3 text-sm">
              {m.artistSeasonReturn.map((r) => (
                <div key={r.label} className="space-y-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-white font-semibold flex items-center gap-1.5 flex-wrap">
                      {r.label} <CertaintyChip certainty={r.certainty} />
                    </span>
                    <span className="font-bold text-white tabular-nums shrink-0">
                      {inr(r.amount)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Band Total — One Season</span>
              <span className="text-2xl font-display font-extrabold text-amber-300 tabular-nums">
                {inr(m.artistSeasonTotal)}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">
                  Band / Year
                </p>
                <p className="text-base font-display font-extrabold text-white tabular-nums">
                  {inr(m.artistYearTotal)}
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">
                  Per Musician / Season
                </p>
                <p className="text-base font-display font-extrabold text-white tabular-nums">
                  {inr(m.artistPerMemberSeason)}
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">
                  Per Musician / Year
                </p>
                <p className="text-base font-display font-extrabold text-white tabular-nums">
                  {inr(m.artistPerMemberYear)}
                </p>
              </div>
            </div>
          </div>

          <div className="bpl-card p-5 border border-amber-500/30 bg-amber-500/5 space-y-3 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Megaphone size={15} className="text-amber-400" /> Why this is the point
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The league is a distribution engine before it is a competition. Its job is to put
              original music in front of people who have never heard it — {numCompact(m.totalAdmissions)}{" "}
              paying admissions across the season, plus everything the catalogue reaches afterwards.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An independent band playing one-off gigs is paid per night and owns nothing afterwards.
              Inside the league it gets a guaranteed fixture calendar, a financed recording it
              half-owns, and a share of every rupee that catalogue earns for as long as it exists.
            </p>
            <Link
              to="/join/band"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:gap-2.5 transition-all"
            >
              Register your band <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CONTENT RIGHTS ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Content Rights"
            title="The catalogue keeps earning after the lights go down"
            sub={`Annual estimate per band once a season's originals and show films are live, split ${CONTENT_SPLIT.artists}/${CONTENT_SPLIT.productionHouse} between the artist and the house that financed the recording. The YouTube line is driven by a view and RPM assumption you can move in the advanced inputs — it is the single largest source of variance on this page.`}
          />

          <div className="bpl-card border border-border/80 bg-surface/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="border-b border-border/80 text-left">
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Revenue Source
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-right">
                      Annual
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-amber-400 text-right">
                      Artist {CONTENT_SPLIT.artists}%
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-cyan-400 text-right">
                      Prod. House {CONTENT_SPLIT.productionHouse}%
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {m.contentStreams.map((s) => (
                    <tr key={s.source} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                          {s.source} <CertaintyChip certainty={s.certainty} />
                        </p>
                        <p className="text-[11px] text-muted-foreground">{s.note}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white tabular-nums">
                        {inr(s.annual)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-300 tabular-nums">
                        {inr(s.annual / 2)}
                      </td>
                      <td className="px-4 py-3 text-right text-cyan-300 tabular-nums">
                        {inr(s.annual / 2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/30">
                    <td className="px-4 py-3 font-bold text-white">Total</td>
                    <td className="px-4 py-3 text-right font-display font-extrabold text-emerald-400 tabular-nums">
                      {inr(m.contentTotal)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-300 tabular-nums">
                      {inr(m.contentHalfAnnual)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-300 tabular-nums">
                      {inr(m.contentHalfAnnual)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Each side's season share is {inr(m.contentHalfPerSeason)} — one third of the annual half,
            across {SEASON_STRUCTURE.seasonsPerYear} seasons a year.
          </p>
        </div>
      </section>

      {/* ================= LEAGUE SEASON POSITION ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="League Season"
          title={`One season, ${m.totalFixtures} ticketed nights, whole ecosystem`}
          sub={`Total value moving through the league across a ${SEASON_STRUCTURE.monthsPerSeason}-month season with ${inputs.numFranchises} franchises and ${m.totalBands} bands, and separately what the operator keeps after running costs.`}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Ecosystem Revenue
            </h3>
            {m.ecosystemRevenue.map((r) => (
              <div key={r.label} className="space-y-0.5">
                <div className="flex justify-between items-baseline text-sm gap-2">
                  <span className="text-white">{r.label}</span>
                  <span className="font-bold text-white tabular-nums shrink-0">{inr(r.amount)}</span>
                </div>
                {r.detail && <p className="text-[10px] text-muted-foreground">{r.detail}</p>}
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-xl font-display font-extrabold text-emerald-400 tabular-nums">
                {inr(m.ecosystemTotal)}
              </span>
            </div>
          </div>

          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-purple-400">
              Operator Income
            </h3>
            {m.operatorIncome.map((r) => (
              <div key={r.label} className="space-y-0.5">
                <div className="flex justify-between items-baseline text-sm gap-2">
                  <span className="text-white">{r.label}</span>
                  <span className="font-bold text-white tabular-nums shrink-0">{inr(r.amount)}</span>
                </div>
                {r.detail && <p className="text-[10px] text-muted-foreground">{r.detail}</p>}
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Gross</span>
              <span className="text-xl font-display font-extrabold text-purple-300 tabular-nums">
                {inr(m.operatorGross)}
              </span>
            </div>
          </div>

          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-rose-400">
              Operator Costs
            </h3>
            {m.operatorCosts.map((c) => (
              <div key={c.label} className="flex justify-between items-baseline text-sm gap-2">
                <span className="text-white">{c.label}</span>
                <span className="font-bold text-white tabular-nums shrink-0">{inr(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-xl font-display font-extrabold text-rose-300 tabular-nums">
                {inr(m.operatorCostsTotal)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
              Fixed for the season. It does not rise with fixture count, which is the whole scaling
              argument.
            </p>
          </div>
        </div>

        <div className="mt-6 bpl-card p-5 sm:p-6 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[11px] uppercase tracking-widest text-primary-glow font-bold">
              Operator Net Position — Per Season
            </p>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              {inr(m.operatorGross)} gross less {inr(m.operatorCostsTotal)} of operating cost. The
              cost base is mostly fixed, so adding franchises and fixtures widens the margin without
              a matching rise in central spend — which is what makes zone-by-zone expansion work.
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-3xl font-display font-extrabold text-white tabular-nums">
              {m.operatorNet < 0 ? "−" : "+"}
              {inr(Math.abs(m.operatorNet))}
            </p>
            <p
              className={`text-[11px] font-semibold mt-0.5 ${
                m.operatorNet < 0 ? "text-amber-300" : "text-emerald-300"
              }`}
            >
              {m.operatorNet < 0
                ? "Operating deficit at these inputs"
                : `Operating surplus · ${m.operatorMarginPct.toFixed(0)}% margin`}
            </p>
          </div>
        </div>
      </section>

      {/* ================= PLATFORM UPSIDE ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Platform Upside"
            title="What the website itself can earn"
            sub="Web-native revenue the platform captures directly, excluded from every figure above so the base case never leans on it. Switch it on to see what the same season looks like with the site monetised."
          />

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              type="button"
              onClick={toggleUpside}
              className={`px-4 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                upsideOn
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-white"
              }`}
            >
              {upsideOn ? "Platform streams on" : "Model these streams"}
            </button>
            {upsideOn && (
              <p className="text-xs text-muted-foreground">
                Adds{" "}
                <span className="font-bold text-emerald-300">{inr(m.platformUpsideTotal)}</span> a
                season — operator net would be{" "}
                <span className="font-bold text-white">
                  {inr(m.operatorNet + m.platformUpsideTotal)}
                </span>
                .
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {PLATFORM_IDEAS.map((idea) => (
                <div
                  key={idea.title}
                  className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-2 hover:border-primary/40 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-white text-sm">{idea.title}</h3>
                    <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary-glow shrink-0">
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{idea.detail}</p>
                </div>
              ))}
            </div>

            <div className="bpl-card p-5 border border-emerald-500/25 bg-emerald-500/5 space-y-3 h-fit">
              <h3 className="text-sm font-bold text-white">Modelled contribution</h3>
              {m.platformUpside.map((r) => (
                <div key={r.label} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-sm gap-2">
                    <span className={r.amount > 0 ? "text-white" : "text-muted-foreground"}>
                      {r.label}
                    </span>
                    <span
                      className={`font-bold tabular-nums shrink-0 ${
                        r.amount > 0 ? "text-white" : "text-muted-foreground"
                      }`}
                    >
                      {inr(r.amount)}
                    </span>
                  </div>
                  {r.detail && <p className="text-[10px] text-muted-foreground">{r.detail}</p>}
                </div>
              ))}
              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-display font-extrabold text-emerald-400 tabular-nums">
                  {inr(m.platformUpsideTotal)}
                </span>
              </div>

              {upsideOn && (
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <Slider
                    label="Tickets sold in-house"
                    value={inputs.inHouseTicketingPct}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(v) => patch({ inHouseTicketingPct: v })}
                    format={(v) => `${v}%`}
                  />
                  <Slider
                    label="PPV passes per fixture"
                    value={inputs.ppvBuyersPerFixture}
                    min={0}
                    max={2000}
                    step={25}
                    onChange={(v) => patch({ ppvBuyersPerFixture: v })}
                    format={(v) => `${v}`}
                  />
                  <Slider
                    label="Merch attach rate"
                    value={inputs.merchAttachPct}
                    min={0}
                    max={40}
                    step={1}
                    onChange={(v) => patch({ merchAttachPct: v })}
                    format={(v) => `${v}%`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= RISK REGISTER ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Assumption Risk"
          title="Where this model is most likely to be wrong"
          sub="A projection is only as good as its softest assumption. These are the four that carry the most weight, what the risk actually is, and what we would do about it."
        />

        <div className="bpl-card border border-border/80 bg-surface/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-border/80 text-left">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Assumption
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Assessment
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    What We Do About It
                  </th>
                </tr>
              </thead>
              <tbody>
                {RISK_REGISTER.map((r) => (
                  <tr key={r.assumption} className="border-b border-border/50 last:border-0 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{r.assumption}</p>
                      <p className="text-[11px] text-muted-foreground">{r.projection}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${RISK_STYLE[r.risk]}`}
                      >
                        <AlertTriangle size={9} /> {r.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground leading-relaxed max-w-sm">
                      {r.assessment}
                    </td>
                    <td className="px-4 py-3 text-xs text-primary-glow leading-relaxed max-w-sm">
                      {r.mitigation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= FUTURE REVENUE ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Future Revenue"
            title="Upside not counted in any number above"
            sub="Every figure on this page comes from gate, catalogue, sponsorship and memberships as they run today. These are the lines that open up as the format builds a track record — deliberately excluded from the projections."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {FUTURE_STREAMS.map((s) => (
              <div
                key={s.title}
                className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-2 hover:border-primary/40 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                    <Tv size={14} className="text-primary-glow shrink-0" /> {s.title}
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary-glow shrink-0">
                    {s.horizon}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REVENUE STREAMS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Revenue Architecture"
          title="Ten streams, each with a defined beneficiary"
          sub="No single line carries the business, and every participant knows their share before a season starts."
        />

        <div className="bpl-card border border-border/80 bg-surface/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border/80 text-left">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Stream
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Source
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Who It Pays
                  </th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_STREAMS.map((s) => (
                  <tr key={s.stream} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {s.stream}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{s.source}</td>
                    <td className="px-4 py-3 text-xs text-primary-glow font-medium whitespace-nowrap">
                      {s.beneficiaries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= PARTNER ROLES ================= */}
      <section className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Partner Architecture"
            title="The roles that sit around the league"
            sub="Each slot carries a defined commercial scope. Partner identities are held commercially and shared under discussion rather than published here."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNER_ROLES.map((p) => {
              const style = TIER_STYLE[p.tier];
              return (
                <div
                  key={p.role}
                  className={`bpl-card p-5 border ${style.ring} bg-surface/50 space-y-2 hover:-translate-y-0.5 transition`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-display font-bold text-sm ${style.text}`}>{p.role}</h3>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shrink-0 ${style.chip} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.scope}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= PITCH POINTS ================= */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading eyebrow="Investment Thesis" title="Why the structure compounds" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PITCH_POINTS.map((p, i) => (
              <div
                key={p.title}
                className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-2 hover:border-primary/50 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-md bg-primary/15 border border-primary/30 text-primary-glow text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="font-display font-bold text-white text-sm">{p.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bpl-card relative overflow-hidden p-8 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-purple-900/15 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary-glow font-bold">
                <Sparkles size={13} />
                <span>Backing the League</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Want the full operating model?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Season plans, zone expansion assumptions and the detailed cost base are available to
                production houses, sponsors and investors on request.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/partners"
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white hover:scale-105 transition"
              >
                <Building2 size={14} /> Partner With Us
              </Link>
              <Link
                to="/league"
                className="px-4 py-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-semibold text-white hover:bg-secondary transition"
              >
                How The League Works
              </Link>
            </div>
          </div>

          <p className="mt-8 text-[11px] text-muted-foreground/80 leading-relaxed max-w-4xl">
            <span className="font-semibold text-muted-foreground">Basis of preparation:</span> these
            are illustrative projections for a demonstration scenario, not audited results, a track
            record, or a guarantee of future performance. The page currently shows a{" "}
            {inr(inputs.ticketPrice)} ticket into a {inputs.attendance}-capacity room,{" "}
            {inputs.showsPerBand} fixtures per band per season and {inputs.numFranchises} franchises,
            with catalogue, licensing and broadcast figures modelled rather than contracted — the
            sensitivity markers show which is which. A versus fixture is one shared ticketed night
            and the gate is split between the acts on it. The{" "}
            {EVENT_SPLIT.bands}/{EVENT_SPLIT.productionHouse}/{EVENT_SPLIT.operator} split is held
            constant, and contracted event managers are paid from the operator&apos;s share rather
            than taking a fourth cut. Anyone evaluating an investment should work from the full
            operating model and its underlying contracts.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
