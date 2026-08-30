import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from "react";
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
  Wallet,
  Filter,
  MapPin,
  ChevronUp,
  Gavel,
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
  OPERATIONS,
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
import {
  ASSUMPTIONS,
  ASSUMPTION_CATEGORIES,
  EVENT_PRESETS,
  EVENT_TIERS,
  SPONSOR_INVENTORY,
  HOUSE_INVESTMENT,
  HOUSE_INVESTMENT_PER_BAND,
  ARTIST_INDEX_PILLARS,
  DEFAULT_SPONSOR_ROI,
  computeEventPnL,
  computeSponsorRoi,
  computePortfolio,
  computeArtistIndex,
  PORTFOLIO_OUTCOMES,
  defaultEventInputs,
  sponsorInventoryValue,
  rateOf,
  varianceOf,
  formatRate,
  type EventInputs,
  type AssumptionOverrides,
  type SponsorRoiInputs,
} from "@/data/event-model";
import {
  REVENUE_MODULES,
  AUCTION,
  DEFAULT_BIDS,
  SPEND_CAPS,
  SIGNING_SPLIT,
  signingSplitOf,
  PRIZE_SPLIT,
  APPROVAL_RULES,
  ROSTER_NOTES,
  FAIRNESS_RULE,
  evaluatePurse,
  houseCommitment,
} from "@/data/regulations";
import {
  OPEN_DECISIONS,
  PRIZE_SHARE_OF_PROFIT,
  PROFIT_ALLOCATION,
  PROFIT_ROADMAP,
  allocateProfit,
} from "@/data/league-capital";
import {
  SEASONS,
  SLICEABLE_ZONES,
  FIXTURE_DIMS,
  DEFAULT_SELECTION,
  resolveScope,
  applyScope,
  scopedEventInputs,
  scopedSponsorInputs,
  scopeKey,
  type DimensionSelection,
  type Scope,
} from "@/data/dimensions";

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

/** One dimension of the slicer. Native select — six of these have to work on a phone. */
function DimSelect({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1 min-w-0">
      <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full rounded-md border border-border bg-background/70 px-2 py-1.5 text-xs font-semibold text-white focus:border-primary/60 focus:outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-background text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * A value the slicer decides. Shown in the same row as the sliders so the bar
 * reads consistently, but deliberately not a control — an input that cannot
 * change anything is worse than no input at all.
 */
function Derived({ label, value, from }: { label: string; value: string; from: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <span className="text-sm font-bold text-white tabular-nums">{value}</span>
      </div>
      <div className="h-[6px] rounded-full bg-secondary/50 border border-border/50" />
      <p className="text-[10px] text-muted-foreground leading-snug">
        <span className="text-primary-glow font-semibold">Set by slice</span> · {from}
      </p>
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

/* ------------------------------------------------------------------ *
 * Event economics — one night, costed line by line
 *
 * The season model above works in aggregate. This works in the only unit an
 * operator can actually control: a single room on a single night. Every cost
 * here is pulled from the shared assumption registry, so editing a rate in the
 * table below moves this P&L, every preset, and nothing else.
 * ------------------------------------------------------------------ */

function EventEconomics({ scope }: { scope: Scope }) {
  const [ev, setEv] = useState<EventInputs>(() => scopedEventInputs(scope));
  const [overrides, setOverrides] = useState<AssumptionOverrides>({});
  /**
   * What a line ACTUALLY cost once a night was settled. Kept separate from the
   * planning override on purpose: the live rate is what we expect to pay, this
   * is what we did pay, and the gap between them is the only honest read on
   * whether the planning assumptions are any good.
   */
  const [actuals, setActuals] = useState<AssumptionOverrides>({});
  const [registryOpen, setRegistryOpen] = useState(false);

  const e = useMemo(() => computeEventPnL(ev, overrides), [ev, overrides]);

  const selectPreset = (id: string) => setEv(defaultEventInputs(id));
  const dirtyRates = Object.keys(overrides).length;

  return (
    <>
      {/* ================= EVENT P&L ================= */}
      <section id="event" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 scroll-mt-24">
        <SectionHeading
          eyebrow="Event Economics"
          title="Does one night wash its own face?"
          sub={`${scope.breadcrumb[1]} · ${scope.city ? scope.city.city : "all cities"}. The room, the ticket and the cost stack are sized to the market in the slicer; every cost is pulled from the shared assumption registry. Change the format below to override the default room for this fixture type.`}
        />

        {/* Preset + tier selectors */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
            <Building2 size={12} className="text-primary-glow" /> Format
          </span>
          {EVENT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.blurb}
              onClick={() => selectPreset(p.id)}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                ev.presetId === p.id
                  ? "border-primary/60 bg-primary/15 text-primary-glow"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
            <Swords size={12} className="text-amber-300" /> Fixture tier
          </span>
          {EVENT_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              title={`${t.note} — production spend × ${t.multiplier}`}
              onClick={() => setEv((prev) => ({ ...prev, tierId: t.id }))}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                ev.tierId === t.id
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-amber-500/40"
              }`}
            >
              {t.label}
              {t.multiplier !== 1 && (
                <span className="ml-1 opacity-70 tabular-nums">{t.multiplier}×</span>
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-3xl">
          {e.preset.blurb}
        </p>

        {/* Event inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-3 mb-8 p-4 rounded-xl border border-border bg-surface/30">
          <Slider
            label="Venue capacity"
            value={ev.capacity}
            min={50}
            max={5000}
            step={50}
            onChange={(v) => setEv((p) => ({ ...p, capacity: v }))}
            format={(v) => `${v}`}
          />
          <Slider
            label="Ticket price"
            value={ev.ticketPrice}
            min={0}
            max={2000}
            step={10}
            onChange={(v) => setEv((p) => ({ ...p, ticketPrice: v }))}
            format={(v) => inr(v)}
          />
          <Slider
            label="Occupancy"
            value={ev.occupancyPct}
            min={0}
            max={100}
            step={1}
            onChange={(v) => setEv((p) => ({ ...p, occupancyPct: v }))}
            format={(v) => `${v}%`}
            hint={`${e.attendance} in the room`}
          />
          <Slider
            label="Stalls sold"
            value={ev.stalls}
            min={0}
            max={12}
            step={1}
            onChange={(v) => setEv((p) => ({ ...p, stalls: v }))}
            format={(v) => `${v}`}
          />
          <Slider
            label="Acts on the night"
            value={ev.acts}
            min={1}
            max={3}
            step={1}
            onChange={(v) => setEv((p) => ({ ...p, acts: v }))}
            format={(v) => (v === 1 ? "Solo" : `${v} acts`)}
            hint={`${inr(e.bandPerAct)} per band`}
          />
        </div>

        {/* Headline tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Stat
            icon={<Ticket size={13} />}
            value={inr(e.grossGate)}
            label="Gross Gate"
            hint={`${e.attendance} × ${inr(ev.ticketPrice)}`}
            accent="text-emerald-400"
          />
          <Stat
            icon={<Wallet size={13} />}
            value={inr(e.operatorRevenue)}
            label="Operator Revenue"
            hint="Gate share plus ancillary"
            accent="text-cyan-400"
          />
          <Stat
            icon={<Layers size={13} />}
            value={inr(e.costTotal)}
            label="Cost to Stage"
            hint={`${e.costLines.length} lines${e.tier.multiplier !== 1 ? ` at ${e.tier.multiplier}× tier` : ""}`}
            accent="text-amber-400"
          />
          <Stat
            icon={<TrendingUp size={13} />}
            value={inr(e.contribution)}
            label="Night Contribution"
            hint={
              e.contribution >= 0
                ? `${e.contributionMarginPct.toFixed(0)}% margin`
                : "Loss on the night"
            }
            accent={e.contribution >= 0 ? "text-emerald-400" : "text-rose-400"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Gate waterfall */}
          <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ticket size={14} className="text-emerald-400" /> Gate Waterfall
            </h3>
            <div className="space-y-2 text-xs">
              <Row label="Gross ticket revenue" value={inr(e.grossGate)} />
              <Row
                label={`Ticketing & payment (${rateOf("ticketing-fee", overrides)}%)`}
                value={`− ${inr(e.ticketingCost)}`}
                muted
              />
              <div className="border-t border-border/60 pt-2">
                <Row label="Net gate" value={inr(e.netGate)} bold />
              </div>
              <div className="pt-1 space-y-2">
                <Row
                  label={`Bands (${EVENT_SPLIT.bands}%)`}
                  value={inr(e.bandPool)}
                  muted
                  note={e.acts > 1 ? `${inr(e.bandPerAct)} each across ${e.acts} acts` : undefined}
                />
                <Row
                  label={`Production house (${EVENT_SPLIT.productionHouse}%)`}
                  value={inr(e.housePool)}
                  muted
                />
                <Row
                  label={`Operator (${EVENT_SPLIT.operator}%)`}
                  value={inr(e.operatorGateShare)}
                  bold
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              The band and house shares leave the building. Only the operator line is available to
              pay for the room, and it is the only gate line in the contribution below.
            </p>
          </div>

          {/* Ancillary */}
          <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone size={14} className="text-cyan-400" /> Beyond the Ticket
            </h3>
            <div className="space-y-2 text-xs">
              {e.ancillaryLines.map((l) => (
                <Row
                  key={l.label}
                  label={l.label}
                  value={inr(l.amount)}
                  note={l.detail}
                  muted={l.amount === 0}
                />
              ))}
              <div className="border-t border-border/60 pt-2">
                <Row label="Ancillary total" value={inr(e.ancillaryTotal)} bold />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              These sit outside the {EVENT_SPLIT.bands}/{EVENT_SPLIT.productionHouse}/
              {EVENT_SPLIT.operator} split entirely. On a small room they are frequently the
              difference between a night that works and one that does not.
            </p>
          </div>

          {/* Costs */}
          <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-amber-400" /> Cost to Stage
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Every line is editable. Typing here changes the underlying rate in the registry, so it
              moves every other event that uses it — not just this one.
            </p>
            <div className="space-y-2 text-xs max-h-[19rem] overflow-y-auto pr-1">
              {e.costLines.map((l) =>
                l.id ? (
                  <CostLine
                    key={l.id}
                    label={l.label}
                    rate={l.rawRate ?? 0}
                    amount={l.amount}
                    multiplier={e.tier.multiplier}
                    onChange={(v) => setOverrides((prev) => ({ ...prev, [l.id as string]: v }))}
                  />
                ) : (
                  <Row key={l.label} label={l.label} value={inr(l.amount)} muted={l.amount === 0} />
                ),
              )}
            </div>
            <div className="border-t border-border/60 pt-2">
              <Row label="Total cost" value={inr(e.costTotal)} bold />
            </div>
            <button
              type="button"
              onClick={() => setRegistryOpen((v) => !v)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/40 text-[11px] font-bold text-muted-foreground hover:text-white transition cursor-pointer"
            >
              <SlidersHorizontal size={11} />
              {registryOpen ? "Hide" : "Edit"} rate assumptions
              {dirtyRates > 0 && (
                <span className="text-primary-glow">
                  ({dirtyRates} changed)
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Contribution + break-even */}
        <div className="grid lg:grid-cols-2 gap-5 mt-5">
          <div
            className={`bpl-card p-6 border space-y-3 ${
              e.contribution >= 0
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <h3 className="text-sm font-bold text-white">The Night, End to End</h3>
            <div className="space-y-2 text-xs">
              <Row label="Operator gate share" value={inr(e.operatorGateShare)} muted />
              <Row label="Ancillary revenue" value={inr(e.ancillaryTotal)} muted />
              <div className="border-t border-border/60 pt-2">
                <Row label="Operator revenue" value={inr(e.operatorRevenue)} bold />
              </div>
              <Row label="Cost to stage" value={`− ${inr(e.costTotal)}`} muted />
              <div className="border-t border-border/60 pt-2">
                <Row
                  label="Event contribution"
                  value={inr(e.contribution)}
                  bold
                  accent={e.contribution >= 0 ? "text-emerald-300" : "text-rose-300"}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              Note what this figure is not: it is the operator's contribution, after the bands and
              their houses have already been paid in full. A night can be loss-making here and still
              have paid every musician who played it.
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-white">Who carries the staging cost:</span> the
              operator, out of its {EVENT_SPLIT.operator}% — not the production house. A house is
              liable for what it signed up to (acquisition, guarantees, creative, marketing, mentor),
              and never for an unlimited event loss because its band happened to be on that night.
              That envelope is modelled separately under{" "}
              <a href="#auction" className="text-primary-glow font-semibold hover:underline">
                the artist draft
              </a>
              .
            </p>
          </div>

          <div className="bpl-card p-6 border border-border bg-surface/40 space-y-4">
            <h3 className="text-sm font-bold text-white">Break-Even</h3>
            {e.breakEvenAttendance === 0 ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stalls and the event sponsor already cover the cost stack before a single ticket is
                sold. Every admission on this format is contribution.
              </p>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <p
                    className={`text-4xl font-display font-extrabold tabular-nums ${
                      e.breakEvenUnreachable ? "text-rose-400" : "text-white"
                    }`}
                  >
                    {e.breakEvenAttendance}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    paid admissions —{" "}
                    <span className="font-bold text-white tabular-nums">
                      {e.breakEvenOccupancyPct.toFixed(0)}%
                    </span>{" "}
                    of a {e.capacity}-cap room
                  </p>
                </div>
                {/* Fill bar with the break-even marker */}
                <div className="relative h-3 w-full rounded-full bg-secondary/60 overflow-hidden border border-border/60">
                  <div
                    className={`h-full ${
                      e.attendance >= e.breakEvenAttendance ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, e.occupancyPct)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white"
                    style={{ left: `${Math.min(100, e.breakEvenOccupancyPct)}%` }}
                    title={`Break-even at ${e.breakEvenAttendance}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>
                    Planned turnout: <span className="text-white font-bold">{e.attendance}</span>
                  </span>
                  <span>Break-even marker</span>
                </div>
                {e.breakEvenUnreachable ? (
                  <p className="text-[11px] text-rose-300 leading-relaxed border-t border-border/40 pt-3">
                    This room cannot break even even sold out. The fix is a sponsor on the night, a
                    cheaper production tier, or a higher ticket — not a bigger marketing push.
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    Break-even is what turns a booking decision into a number. If a room needs 82% to
                    clear and the band has never drawn past 60%, that fixture belongs in a smaller
                    venue.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/*
          The honest reading of the numbers above. A cafe night at the planning
          assumptions does not clear its own cost stack, and the page says so
          rather than papering over it with an optimistic stall rate.
        */}
        <div className="mt-5 bpl-card p-5 border border-border bg-surface/30 flex gap-3">
          <Info size={15} className="text-primary-glow shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-white">Why the calendar is mixed.</span> Not every
            fixture is supposed to make money on its own. At these assumptions a small ticketed room
            is thin or negative once the bands and their houses are paid, campus nights are bought
            reach rather than margin, and a grand final at {EVENT_TIERS[3].multiplier}× production is
            a deliberate loss-leader funded by central broadcast and title sponsorship. The season
            clears in aggregate, not fixture by fixture — which is exactly why the{" "}
            <a href="#league" className="text-primary-glow font-semibold hover:underline">
              league-wide view
            </a>{" "}
            is the one that decides whether the model works. Move the ticket price, drop a
            production tier, or attach a fixture sponsor above and watch which lever actually
            closes the gap.
          </p>
        </div>

        {/* ---- assumption registry ---- */}
        {registryOpen && (
          <div className="mt-6 bpl-card p-5 border border-border bg-surface/40 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Rate Assumption Registry</h3>
                <p className="text-[11px] text-muted-foreground max-w-2xl leading-relaxed">
                  Every cost and commercial rate in the model lives here once. <strong>Base</strong>{" "}
                  is the planning figure we started from, <strong>live</strong> is what the model is
                  using now. Change a live rate and every preset, every event and every roll-up above
                  moves with it.
                </p>
              </div>
              {dirtyRates > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setOverrides({});
                    setActuals({});
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition cursor-pointer shrink-0"
                >
                  <RotateCcw size={11} /> Reset rates
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[46rem]">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                      KPI
                    </th>
                    <th className="py-2 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">
                      Base
                    </th>
                    <th className="py-2 px-3 font-bold text-primary-glow uppercase tracking-wider text-[10px] text-right">
                      Live rate
                    </th>
                    <th className="py-2 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">
                      Actual paid
                    </th>
                    <th className="py-2 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">
                      Variance
                    </th>
                    <th className="py-2 pl-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ASSUMPTION_CATEGORIES.map((cat) => {
                    const rows = ASSUMPTIONS.filter((a) => a.category === cat);
                    if (rows.length === 0) return null;
                    return (
                      <Fragment key={cat}>
                        <tr>
                          <td
                            colSpan={6}
                            className="pt-4 pb-1 text-[10px] uppercase tracking-wider font-bold text-primary-glow"
                          >
                            {cat}
                          </td>
                        </tr>
                        {rows.map((a) => {
                          const live = rateOf(a.id, overrides);
                          const v = varianceOf(a.id, overrides);
                          const settled = actuals[a.id] ?? a.actual;
                          const settledDelta = settled === undefined ? 0 : settled - live;
                          const settledPct = live === 0 ? 0 : (settledDelta / live) * 100;
                          const inUse = e.preset.costIds.includes(a.id);
                          return (
                            <tr
                              key={a.id}
                              className={`border-b border-border/30 ${inUse ? "bg-primary/5" : ""}`}
                            >
                              <td className="py-1.5 pr-3">
                                <span className="text-white font-semibold">{a.kpi}</span>
                                {inUse && (
                                  <span className="ml-2 text-[9px] uppercase tracking-wider font-bold text-primary-glow">
                                    in this event
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-3 text-right text-muted-foreground tabular-nums">
                                {formatRate(a, a.base)}
                              </td>
                              <td className="py-1.5 px-3 text-right">
                                <input
                                  type="number"
                                  value={live}
                                  min={0}
                                  step={a.unit === "percent" ? 0.5 : 500}
                                  aria-label={`${a.kpi} live rate`}
                                  onChange={(ev2) =>
                                    setOverrides((prev) => ({
                                      ...prev,
                                      [a.id]: Math.max(0, Number(ev2.target.value) || 0),
                                    }))
                                  }
                                  className="w-24 rounded border border-border bg-background/70 px-2 py-1 text-right text-xs font-semibold text-white tabular-nums focus:border-primary/60 focus:outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-3 text-right">
                                <input
                                  type="number"
                                  value={actuals[a.id] ?? ""}
                                  min={0}
                                  step={a.unit === "percent" ? 0.5 : 500}
                                  placeholder="—"
                                  aria-label={`${a.kpi} actual paid`}
                                  onChange={(ev3) => {
                                    const raw = ev3.target.value;
                                    setActuals((prev) => {
                                      const next = { ...prev };
                                      if (raw === "") delete next[a.id];
                                      else next[a.id] = Math.max(0, Number(raw) || 0);
                                      return next;
                                    });
                                  }}
                                  className="w-24 rounded border border-border/60 bg-background/40 px-2 py-1 text-right text-xs font-semibold text-white tabular-nums placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
                                />
                              </td>
                              <td
                                className={`py-1.5 px-3 text-right tabular-nums font-semibold ${
                                  settled === undefined
                                    ? v.delta === 0
                                      ? "text-muted-foreground"
                                      : v.delta < 0
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                    : settledDelta === 0
                                      ? "text-muted-foreground"
                                      : settledDelta < 0
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }`}
                                title={
                                  settled === undefined
                                    ? "Live rate against the planning base"
                                    : "Actual paid against the live rate"
                                }
                              >
                                {settled === undefined
                                  ? v.delta === 0
                                    ? "—"
                                    : `${v.delta > 0 ? "+" : ""}${v.pct.toFixed(0)}%`
                                  : `${settledDelta > 0 ? "+" : ""}${settledPct.toFixed(0)}%`}
                              </td>
                              <td className="py-1.5 pl-3 text-muted-foreground text-[11px] leading-snug max-w-xs">
                                {a.note ?? ""}
                              </td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              Three columns, deliberately. <strong>Base</strong> is what we planned,{" "}
              <strong>live rate</strong> is the latest quote driving the model, and{" "}
              <strong>actual paid</strong> is what a settled night really cost. Variance reads
              live-against-base until an actual is entered, then switches to actual-against-live —
              green is under, red is over. Rows already carrying a negotiated rate — café hire,
              basic sound, ticketing — show that first gap out of the box. Fill the actual column
              in after a fixture settles and this stops being a projection.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

/**
 * An editable cost line. Edits the underlying RATE, not the tier-multiplied
 * amount, because the rate is the thing that lives in the registry and moves
 * every other event using it. Where a tier multiplier applies, both figures
 * are shown so it is obvious which one is being typed into.
 */
function CostLine({
  label,
  rate,
  amount,
  multiplier,
  onChange,
}: {
  label: string;
  rate: number;
  amount: number;
  multiplier: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground leading-snug min-w-0 flex-1">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {multiplier !== 1 && (
          <span className="text-[10px] text-muted-foreground tabular-nums">
            ×{multiplier} = {inr(amount)}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">₹</span>
        <input
          type="number"
          value={rate}
          min={0}
          step={500}
          aria-label={`${label} cost`}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-24 rounded border border-border bg-background/70 px-2 py-1 text-right text-xs font-semibold text-white tabular-nums focus:border-primary/60 focus:outline-none"
        />
      </div>
    </div>
  );
}

/** One label/value line in an event waterfall. */
function Row({
  label,
  value,
  note,
  bold,
  muted,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  bold?: boolean;
  muted?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p
          className={`${bold ? "font-bold text-white" : muted ? "text-muted-foreground" : "text-white"} leading-snug`}
        >
          {label}
        </p>
        {note && <p className="text-[10px] text-muted-foreground leading-snug">{note}</p>}
      </div>
      <span
        className={`tabular-nums shrink-0 ${accent ?? (bold ? "font-bold text-white" : "text-muted-foreground")}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Artist Index — who is becoming valuable, as opposed to who is winning
 * ------------------------------------------------------------------ */

const INDEX_DEFAULTS: Record<string, number> = {
  live: 82,
  audience: 74,
  ip: 78,
  fan: 71,
  commercial: 64,
};

function ArtistIndexCard() {
  const [scores, setScores] = useState<Record<string, number>>(INDEX_DEFAULTS);
  const index = computeArtistIndex(scores);

  return (
    <div className="bpl-card p-6 border border-border bg-surface/40 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" /> The Kalakshetra Artist Index
          </h3>
          <p className="text-[11px] text-muted-foreground max-w-xl leading-relaxed">
            The points table answers who is winning. This answers a different and commercially more
            useful question — who is becoming valuable. It is an intelligence metric only, and has no
            bearing on qualification.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-4xl font-display font-extrabold text-amber-300 tabular-nums">
            {index.toFixed(1)}
          </p>
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
            Index / 100
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-3">
        {ARTIST_INDEX_PILLARS.map((pillar) => (
          <div key={pillar.id} className="space-y-1.5">
            <Slider
              label={`${pillar.label} · ${pillar.weight}%`}
              value={scores[pillar.id] ?? 0}
              min={0}
              max={100}
              step={1}
              onChange={(v) => setScores((prev) => ({ ...prev, [pillar.id]: v }))}
              format={(v) => `${v}`}
              hint={pillar.basis}
            />
          </div>
        ))}
      </div>

      <div className="h-2 w-full rounded-full bg-secondary/60 overflow-hidden border border-border/60">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
          style={{ width: `${index}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sponsor economics — the deal seen from the brand's side of the table
 * ------------------------------------------------------------------ */

function SponsorEconomics({ scope, fixturesInScope }: { scope: Scope; fixturesInScope: number }) {
  const [si, setSi] = useState<SponsorRoiInputs>(() => scopedSponsorInputs(scope, fixturesInScope));
  const r = useMemo(() => computeSponsorRoi(si), [si]);
  const rateCard = sponsorInventoryValue();

  return (
    <section id="sponsor" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Sponsor Economics"
        title="What a brand actually gets for the money"
        sub={`A sponsor does not buy a logo on a banner — they buy reach at a cost per engagement they can compare against everything else in their media plan. Sized here to the ${fixturesInScope} ${fixturesInScope === 1 ? "night" : "nights"} inside ${scope.label}.`}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bpl-card p-5 border border-border bg-surface/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone size={14} className="text-amber-400" /> Deal Inputs
          </h3>
          <NumberField
            label="Sponsor spend"
            value={si.spend}
            step={50000}
            onChange={(v) => setSi((p) => ({ ...p, spend: v }))}
          />
          <Slider
            label="Fixtures sponsored"
            value={si.fixturesSponsored}
            min={1}
            max={202}
            step={1}
            onChange={(v) => setSi((p) => ({ ...p, fixturesSponsored: v }))}
            format={(v) => `${v}`}
          />
          <Slider
            label="Room size per fixture"
            value={si.attendancePerFixture}
            min={50}
            max={2000}
            step={10}
            onChange={(v) => setSi((p) => ({ ...p, attendancePerFixture: v }))}
            format={(v) => `${v}`}
          />
          <NumberField
            label="Digital reach per fixture"
            value={si.digitalReachPerFixture}
            step={5000}
            onChange={(v) => setSi((p) => ({ ...p, digitalReachPerFixture: v }))}
            hint="Across league, house and artist channels"
          />
          <Slider
            label="Engagement rate"
            value={si.engagementRatePct}
            min={0.5}
            max={15}
            step={0.1}
            onChange={(v) => setSi((p) => ({ ...p, engagementRatePct: v }))}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <Slider
            label="Benchmark CPM"
            value={si.benchmarkCpm}
            min={20}
            max={600}
            step={10}
            onChange={(v) => setSi((p) => ({ ...p, benchmarkCpm: v }))}
            format={(v) => inr(v)}
            hint="What comparable paid reach would cost per 1,000"
          />
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              icon={<Users size={13} />}
              value={numCompact(r.totalImpressions)}
              label="Total Reach"
              hint={`${numCompact(r.liveReach)} live · ${numCompact(r.digitalReach)} digital`}
              accent="text-cyan-400"
            />
            <Stat
              icon={<Sparkles size={13} />}
              value={numCompact(r.engagements)}
              label="Engagements"
              hint={`At ${si.engagementRatePct.toFixed(1)}% of reach`}
              accent="text-amber-400"
            />
            <Stat
              icon={<Wallet size={13} />}
              value={`₹${r.costPerEngagement.toFixed(1)}`}
              label="Cost / Engagement"
              hint={`CPM ${inr(Math.round(r.cpm))}`}
              accent="text-emerald-400"
            />
            <Stat
              icon={<TrendingUp size={13} />}
              value={`${r.mediaMultiple.toFixed(2)}×`}
              label="Media Multiple"
              hint={`${inrCompact(r.equivalentMediaValue)} equivalent value`}
              accent={r.mediaMultiple >= 1 ? "text-emerald-400" : "text-rose-400"}
            />
          </div>

          <div className="bpl-card p-4 border border-border bg-surface/30 flex gap-3">
            <Info size={14} className="text-primary-glow shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-white">Reading the media multiple.</span>{" "}
              {r.mediaMultiple >= 1
                ? `At these assumptions the deal returns ${r.mediaMultiple.toFixed(2)}× its cost in comparable paid reach alone — before any value is assigned to live presence, product sampling or artist association.`
                : `At these assumptions comparable paid reach would have cost ${inrCompact(r.equivalentMediaValue)} against a ${inrCompact(si.spend)} spend, so pure impressions do not cover the cheque on their own. That is the honest starting point, and it is where the rest of the case has to do the work: a brand in the room is sampling, not impressing, and a fixture partner gets an artist integration that no media buy sells.`}{" "}
              The lever that moves this fastest is digital reach per fixture, not the number of
              fixtures — drag both and watch which one actually shifts the multiple.
            </p>
          </div>

          <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
            <h3 className="text-sm font-bold text-white">Season Rate Card</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Sponsorship is finite inventory, not an open-ended ask. Sold out at indicative rates,
              one season's card is worth{" "}
              <span className="font-bold text-primary-glow">{inrCompact(rateCard)}</span> — but the
              structural point is that a title partner and forty fixture partners are different
              products, bought by different people, out of different budgets.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Role
                    </th>
                    <th className="py-2 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">
                      Slots
                    </th>
                    <th className="py-2 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">
                      Rate
                    </th>
                    <th className="py-2 pl-3 font-bold text-primary-glow uppercase tracking-wider text-[10px] text-right">
                      Card Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {SPONSOR_INVENTORY.map((slot) => (
                    <tr key={slot.role}>
                      <td className="py-2 pr-3 text-white font-semibold">{slot.role}</td>
                      <td className="py-2 px-3 text-center text-muted-foreground tabular-nums">
                        {slot.slots}
                      </td>
                      <td className="py-2 px-3 text-right text-muted-foreground tabular-nums">
                        {inr(slot.rate)}
                      </td>
                      <td className="py-2 pl-3 text-right text-white font-semibold tabular-nums">
                        {inrCompact(slot.slots * slot.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              Indicative planning rates for a Season I regional league, not signed deals. Reach and
              engagement figures above are assumptions until a season's worth of scan, entry and
              channel data replaces them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Two modules — the distinction the whole commercial model rests on
 * ------------------------------------------------------------------ */

function TwoModules() {
  return (
    <section id="modules" className="border-y border-border bg-surface/20 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Commercial Architecture"
          title="Two modules, and the operator is only in one of them"
          sub="The league runs the stage; it does not own the songs played on it. Blending those two things is the mistake that would make every production house walk away, so they are kept structurally separate."
        />

        <div className="grid lg:grid-cols-2 gap-5">
          {REVENUE_MODULES.map((mod) => (
            <div
              key={mod.id}
              className={`bpl-card p-6 space-y-5 border ${
                mod.operatorTakes ? "border-primary/25 bg-primary/5" : "border-blue-400/25 bg-blue-400/5"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {mod.operatorTakes ? (
                    <Ticket size={15} className="text-primary-glow" />
                  ) : (
                    <Music size={15} className="text-blue-400" />
                  )}
                  <h3 className="text-sm font-bold text-white">{mod.name}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.scope}</p>
              </div>

              {/* Split bar */}
              <div className="space-y-2">
                <div className="flex h-2.5 w-full rounded-full overflow-hidden border border-border/50">
                  {mod.splits.map((sp) => (
                    <div key={sp.party} className={sp.accent} style={{ width: `${sp.pct}%` }} />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {mod.splits.map((sp) => (
                    <div key={sp.party} className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">{sp.party}</span>
                      <span className="text-sm font-bold text-white tabular-nums">{sp.pct}%</span>
                    </div>
                  ))}
                  {!mod.operatorTakes && (
                    <div className="flex items-baseline justify-between gap-2 border-t border-border/40 pt-1.5">
                      <span className="text-[11px] font-semibold text-rose-300">League Operator</span>
                      <span className="text-sm font-bold text-rose-300 tabular-nums">0%</span>
                    </div>
                  )}
                </div>
              </div>

              <p
                className={`text-[10px] leading-relaxed border-t border-border/40 pt-3 ${
                  mod.operatorTakes ? "text-muted-foreground" : "text-blue-100/80"
                }`}
              >
                {mod.operatorNote}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {mod.monetises.map((x) => (
                  <span
                    key={x}
                    className="text-[9px] px-2 py-0.5 rounded-full border border-border/60 bg-secondary/30 text-muted-foreground"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 bpl-card p-5 border border-border bg-surface/30 flex gap-3">
          <Info size={15} className="text-primary-glow shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-white">Everyone else on a record is hired, not vested.</span>{" "}
            Composers, lyricists, session players, directors, editors and crew are paid a fee out of
            the band&apos;s creative allocation. They are not inside the band&apos;s 50%. Where a
            larger name negotiates backend participation instead of — or on top of — a fee, that is a
            deal between the house and the creator, and it has to be disclosed rather than assumed.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * The auction purse — a house building its roster inside the rules
 * ------------------------------------------------------------------ */

function AuctionPurse({ seasonReturn }: { seasonReturn: number }) {
  const [bids, setBids] = useState<number[]>(DEFAULT_BIDS);
  /** Caps are planning regulations, so they are editable like everything else. */
  const [capOverrides, setCapOverrides] = useState<Record<string, number>>({});
  const capOf = (id: string) =>
    capOverrides[id] ?? SPEND_CAPS.find((c) => c.id === id)?.amount ?? 0;

  const purse = useMemo(() => evaluatePurse(bids), [bids]);
  const commitment = useMemo(() => {
    const creative = capOf("creative") * AUCTION.bandsRequired;
    const marketing = capOf("marketing");
    const mentor = capOf("mentor");
    return {
      acquisition: purse.spent,
      guarantees: 0,
      creative,
      marketing,
      mentor,
      total: purse.spent + creative + marketing + mentor,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purse.spent, purse.guarantees, capOverrides]);

  const setBid = (i: number, v: number) =>
    setBids((prev) => prev.map((b, idx) => (idx === i ? Math.max(0, v) : b)));

  const spentPct = Math.min(100, (purse.spent / AUCTION.purse) * 100);

  // Both lenses read the SAME envelope, so the page can no longer state two
  // different totals for what a house spends in a season.
  const recoveryPct = commitment.total > 0 ? (seasonReturn / commitment.total) * 100 : 0;
  const perBandCapital = Math.round(commitment.total / AUCTION.bandsRequired);
  const portfolio = useMemo(
    () => computePortfolio(AUCTION.bandsRequired, perBandCapital),
    [perBandCapital],
  );

  return (
    <section id="auction" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Artist Draft"
        title={`A ${inrCompact(AUCTION.purse)} purse, ${AUCTION.bandsRequired} bands, sealed bids`}
        sub={`Each house gets the same purse and must finish with exactly ${AUCTION.bandsRequired} bands. A floor of ${inr(AUCTION.minBid)} stops token bids; a ceiling of ${inr(AUCTION.maxBid)} on any single band stops a house sinking everything into one act. Move the bids and watch the roster go legal or illegal.`}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Bid builder */}
        <div className="lg:col-span-3 bpl-card p-5 border border-border bg-surface/40 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gavel size={14} className="text-amber-400" /> Sealed Bids
            </h3>
            <button
              type="button"
              onClick={() => setBids(DEFAULT_BIDS)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition cursor-pointer"
            >
              <RotateCcw size={11} /> Reset roster
            </button>
          </div>

          <div className="space-y-3">
            {purse.rows.map((row, i) => (
              <div key={i} className="space-y-1.5">
                <Slider
                  label={`Band ${i + 1}`}
                  value={row.bid}
                  min={0}
                  max={500000}
                  step={10000}
                  onChange={(v) => setBid(i, v)}
                  format={(v) => inr(v)}
                />
                <div className="flex items-center justify-between gap-2">
                  {row.bracket ? (
                    <span className="text-[10px] text-muted-foreground">
                      {row.bracket.label} · guarantee{" "}
                      <span className="text-white font-semibold">{inr(row.bracket.guarantee)}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No valid bracket</span>
                  )}
                  {row.issue && (
                    <span className="text-[10px] font-semibold text-rose-300 flex items-center gap-1">
                      <AlertTriangle size={10} /> {row.issue}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Purse meter */}
          <div className="space-y-1.5 border-t border-border/50 pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Purse used</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  purse.remaining < 0 ? "text-rose-300" : "text-white"
                }`}
              >
                {inr(purse.spent)} / {inr(AUCTION.purse)}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary/60 overflow-hidden border border-border/60">
              <div
                className={`h-full ${purse.remaining < 0 ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {purse.remaining >= 0 ? (
                <>
                  <span className="text-white font-semibold">{inr(purse.remaining)}</span> unused —
                  and unused purse expires. It never becomes cash, or houses would simply underbid.
                </>
              ) : (
                <span className="text-rose-300 font-semibold">
                  {inr(-purse.remaining)} over the purse — this roster is not permitted.
                </span>
              )}
            </p>
          </div>

          {purse.errors.length > 0 && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 space-y-1">
              {purse.errors.map((e) => (
                <p key={e} className="text-[11px] text-rose-200 leading-snug flex gap-2">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  {e}
                </p>
              ))}
            </div>
          )}
          {purse.valid && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex gap-2">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-100/85 leading-snug">
                Legal roster. {AUCTION.bandsRequired} bands, every bid inside the floor and ceiling,{" "}
                {inr(purse.spent)} committed against the {inr(AUCTION.purse)} purse.
              </p>
            </div>
          )}
        </div>

        {/* Commitment + fairness */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bpl-card p-5 border border-cyan-500/25 bg-cyan-500/5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet size={14} className="text-cyan-400" /> Regulated Envelope
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This is the production house&apos;s money — everything it commits across a season. The
              caps are editable, because they are planning regulations rather than facts.
            </p>
            <div className="space-y-2 text-xs">
              <Row
                label="Acquisition (this roster)"
                value={inr(commitment.acquisition)}
                note="Set by the sealed bids"
                muted
              />
              <Row
                label={`Of which to the artists (${SIGNING_SPLIT.artist}%)`}
                value={inr(signingSplitOf(commitment.acquisition).artist)}
                note="Paid on signing — this is the floor under the band"
                muted
              />
              <Row
                label={`Of which to the league (${SIGNING_SPLIT.league}%)`}
                value={inr(signingSplitOf(commitment.acquisition).league)}
                note="Funds the season the house is buying into"
                muted
              />
              <CostLine
                label={`Creative allocation (per band × ${AUCTION.bandsRequired})`}
                rate={capOf("creative")}
                amount={commitment.creative}
                multiplier={AUCTION.bandsRequired}
                onChange={(v) => setCapOverrides((prev) => ({ ...prev, creative: v }))}
              />
              <CostLine
                label="Marketing cap"
                rate={capOf("marketing")}
                amount={commitment.marketing}
                multiplier={1}
                onChange={(v) => setCapOverrides((prev) => ({ ...prev, marketing: v }))}
              />
              <CostLine
                label="Mentor cap"
                rate={capOf("mentor")}
                amount={commitment.mentor}
                multiplier={1}
                onChange={(v) => setCapOverrides((prev) => ({ ...prev, mentor: v }))}
              />
              <div className="border-t border-border/60 pt-2">
                <Row
                  label="Maximum regulated commitment"
                  value={inr(commitment.total)}
                  bold
                  accent="text-cyan-300"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              A ceiling, not a bill. Only the acquisition purse and the artist guarantees are
              committed spend — the rest are caps a house may spend up to, and many will not.{" "}
              <span className="text-white font-semibold">
                Event staging cost is deliberately absent:
              </span>{" "}
              the operator carries that out of its {EVENT_SPLIT.operator}% of net gate, so a house is
              never exposed to an unlimited event loss.
            </p>
          </div>

          <div className="bpl-card p-5 border border-amber-500/25 bg-amber-500/5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-400" /> What a bid does not buy
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{FAIRNESS_RULE}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              A {inr(AUCTION.maxBid)} band and a {inr(AUCTION.minBid)} band get the same fixtures,
              the same creative allocation, the same mentor framework and the same scoring. The only
              thing the price changes is the floor under the artist.
            </p>
          </div>
        </div>
      </div>

      {/* Two lenses on the same envelope — one place, not two competing ones */}
      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <div className="bpl-card p-5 border border-emerald-500/25 bg-emerald-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Lens 1 — Cash, this season</h3>
          </div>
          <div className="space-y-2 text-xs">
            <Row label="Total committed (envelope above)" value={inr(commitment.total)} muted />
            <Row label="Season revenue share" value={inr(seasonReturn)} muted />
            <div className="border-t border-border/60 pt-2">
              <Row
                label="Capital recovered"
                value={`${recoveryPct.toFixed(0)}%`}
                bold
                accent={recoveryPct >= 100 ? "text-emerald-300" : "text-amber-300"}
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
            {recoveryPct >= 100
              ? "The season clears the full outlay before catalogue value is counted at all."
              : "The season does not clear the full outlay on its own — the honest position. The balance has to come from the catalogue, which keeps earning after the season ends, and from a second season where the purse is not paid again."}
          </p>
        </div>

        <div className="bpl-card p-5 border border-purple-500/25 bg-purple-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical size={14} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Lens 2 — The portfolio</h3>
          </div>
          <div className="rounded-lg border border-border/60 bg-surface/40 p-2.5">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-white">Not prize money.</span> These are
              illustrative lifetime returns on the capital placed behind each band — catalogue,
              touring and brand value over the life of the songs. Prize money is separate — an
              operator-funded pool, split {PRIZE_SPLIT.band}/{PRIZE_SPLIT.productionHouse} band to
              house.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Spread across the {AUCTION.bandsRequired}-band roster at{" "}
            {inr(perBandCapital)} committed per band. Most of the value sits in one position, and
            nobody can pick which one in advance.
          </p>
          <div className="space-y-1.5 text-xs">
            {portfolio.rows.map((r) => (
              <Row
                key={r.outcome.label}
                label={`${r.outcome.label} — ${r.outcome.returnMultiple}×`}
                value={inr(Math.round(r.returned))}
                note={r.outcome.detail}
                muted
              />
            ))}
            <div className="border-t border-border/60 pt-2">
              <Row
                label="Portfolio return on committed capital"
                value={`${portfolio.roiPct >= 0 ? "+" : ""}${portfolio.roiPct.toFixed(0)}%`}
                bold
                accent={portfolio.roiPct >= 0 ? "text-purple-300" : "text-rose-300"}
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
            Outcome multiples are modelled, not observed — they describe the shape of entertainment
            returns, not a forecast for any particular act.
          </p>
        </div>
      </div>

      {/* Creative allocation breakdown */}
      <div className="mt-5 bpl-card p-5 border border-border bg-surface/40 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 size={14} className="text-cyan-400" /> What the creative allocation buys
          </h3>
          <span className="text-sm font-bold text-primary-glow tabular-nums">
            {inr(HOUSE_INVESTMENT_PER_BAND)} / band
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          A breakdown of the allocation line in the envelope above — not a second budget. The house
          moves money between these however it wants; unused budget rolls forward to that band&apos;s
          next release and never to a different band.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {HOUSE_INVESTMENT.map((line) => (
            <div key={line.id} className="border border-border/50 rounded-lg p-3 bg-surface/30">
              <p className="text-sm font-display font-extrabold text-white tabular-nums">
                {inr(line.perBand)}
              </p>
              <p className="text-[10px] font-bold text-white mt-0.5">{line.label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-1">{line.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Caps + approvals */}
      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
          <h3 className="text-sm font-bold text-white">Spending Caps</h3>
          <div className="space-y-3">
            {SPEND_CAPS.map((cap) => (
              <div key={cap.id} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-white">{cap.label}</span>
                  <span className="text-xs font-bold text-primary-glow tabular-nums shrink-0">
                    {inr(cap.amount)}{" "}
                    <span className="text-[9px] uppercase text-muted-foreground font-semibold">
                      {cap.basis}
                    </span>
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{cap.rule}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 space-y-2">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              What the house does not fund
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Prize money, league marketing and guest-artist fees are the operator&apos;s budget,
              not a house obligation. None of them appear above because none of them are a call on
              a production house&apos;s money.
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Prize money splits{" "}
              <span className="font-semibold text-white">{PRIZE_SPLIT.band}% to the band</span> and{" "}
              {PRIZE_SPLIT.productionHouse}% to the house that backed it.
            </p>
          </div>
        </div>

        <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
          <h3 className="text-sm font-bold text-white">When the League Needs to Be Told</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The operator checks compliance, never taste. It has no opinion on whether a director is
            any good — only on whether the arrangement is disclosed, funded from the right place, and
            incapable of buying points.
          </p>
          <div className="space-y-2.5">
            {APPROVAL_RULES.map((rule) => (
              <div key={rule.level} className={`rounded-lg border p-3 space-y-1.5 ${rule.accent}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold">{rule.level}</span>
                  <span className="text-xs font-bold text-white">{rule.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{rule.trigger}</p>
                <p className="text-[10px] leading-relaxed font-semibold">{rule.requirement}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roster rules */}
      <div className="mt-5 bpl-card p-5 border border-border bg-surface/40 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users size={14} className="text-primary-glow" /> Roster Rules
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROSTER_NOTES.map((r) => (
            <div key={r.rule} className="space-y-1">
              <p className="text-xs font-bold text-white">{r.rule}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EconomicsPage() {
  /**
   * One global state object rather than twenty useState calls — the whole page
   * is a pure function of this, so any input can be moved live in a meeting and
   * every section re-derives together.
   */
  const [inputs, setInputs] = useState<EconomicsInputs>(DEFAULT_INPUTS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  /**
   * The slicer sits ON TOP of the sliders rather than replacing them: the
   * sliders set the base case, the slicer says which season, market, roster and
   * fixture type that base case is being asked about. `applyScope` folds the
   * two together into the one `EconomicsInputs` the engine has always taken, so
   * nothing downstream had to learn about dimensions.
   */
  const [dims, setDims] = useState<DimensionSelection>(DEFAULT_SELECTION);
  const scope = useMemo(() => resolveScope(dims), [dims]);
  const setDim = useCallback(
    (patchDims: Partial<DimensionSelection>) =>
      setDims((prev) => {
        const next = { ...prev, ...patchDims };
        // A city belongs to a zone; changing zone has to drop a stale city.
        if (patchDims.zoneSlug && patchDims.zoneSlug !== prev.zoneSlug) next.city = "all";
        return next;
      }),
    [],
  );
  const sliceKey = scopeKey(scope);

  /**
   * The control bar is pinned, which is what makes it useful — but at full
   * height it eats most of a laptop viewport once you are reading a section
   * further down. So it condenses to a single summary row on scroll, and
   * expands again either at the top of the page or on demand.
   */
  const [barPinnedOpen, setBarPinnedOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /*
   * A sentinel at the bottom of the hero rather than a scroll handler: it
   * reports the same thing without running work on every scroll frame, and it
   * does not care which element is actually doing the scrolling.
   */
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    const past = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 360) return true;
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (Number.isFinite(top) && top < 0) return true;
      }
      return false;
    };
    const update = () => setScrolled(past());
    update();

    // Both signals, because either can be unavailable: IntersectionObserver
    // needs the page to be painting, and a scroll listener needs the document
    // to be the thing that scrolls. Together they cover both.
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
        threshold: 0,
      });
      io.observe(el);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const barOpen = !scrolled || barPinnedOpen;

  const patch = useCallback(
    (p: Partial<EconomicsInputs>) => setInputs((prev) => ({ ...prev, ...p })),
    [],
  );

  /** What the engine actually sees: the slider base case, scoped. */
  const scopedInputs = useMemo(() => applyScope(inputs, scope), [inputs, scope]);
  const m = useMemo(() => computeEconomics(scopedInputs), [scopedInputs]);
  // Season 1 policy: prize is a share of profit, so it re-derives with the page.
  const allocation = useMemo(
    () => allocateProfit(m.operatorNet, PROFIT_ROADMAP[0], PRIZE_SPLIT.band),
    [m.operatorNet],
  );

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

          {/*
            Five views of the same data. The same season looks completely
            different depending on whose side of the table you are sitting on,
            and each of these answers a question a different stakeholder asks.
          */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { href: "#modules", label: "Modules", q: "Where does the operator take a share?" },
              { href: "#event", label: "Event", q: "Which nights make money?" },
              { href: "#auction", label: "Draft", q: "How is a roster bought?" },
              { href: "#house", label: "Franchise", q: "What is the return on a bid?" },
              { href: "#artist", label: "Artist", q: "What does a musician take home?" },
              { href: "#league", label: "League", q: "What does a season generate?" },
              { href: "#sponsor", label: "Sponsor", q: "What does a brand get back?" },
            ].map((v) => (
              <a
                key={v.href}
                href={v.href}
                title={v.q}
                className="px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-primary/50 transition"
              >
                {v.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sentinel: once this scrolls out of view the control bar condenses. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      {/* ================= GLOBAL INPUT BAR ================= */}
      {/*
        Pinned on desktop so an investor can move an input while looking at any
        section. Left unpinned on small screens — stacked, the controls run to
        well over half the viewport, which would leave almost no room to read.
      */}
      <section className="relative lg:sticky lg:top-16 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        {/* Condensed row — the whole slice in one line once you have scrolled past */}
        {!barOpen && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBarPinnedOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/40 bg-primary/10 text-[11px] font-bold text-primary-glow hover:bg-primary/20 transition cursor-pointer shrink-0"
            >
              <Filter size={11} /> Slice
              <ChevronDown size={11} />
            </button>
            <p className="text-[11px] text-muted-foreground truncate min-w-0 flex-1">
              {scope.breadcrumb.join(" · ")}
            </p>
            <span className="text-[10px] uppercase tracking-wider font-bold text-white tabular-nums shrink-0 hidden sm:block">
              {m.totalBands} {m.totalBands === 1 ? "band" : "bands"} · {m.totalFixtures}{" "}
              {m.totalFixtures === 1 ? "night" : "nights"} · {inrCompact(m.operatorNet)}
            </span>
          </div>
        )}

        <div className={`mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-4 ${barOpen ? "" : "hidden"}`}>
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
            {(!isDefault || !scope.isDefault) && (
              <button
                type="button"
                onClick={() => {
                  setInputs(DEFAULT_INPUTS);
                  setDims(DEFAULT_SELECTION);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
            {scrolled && (
              <button
                type="button"
                onClick={() => setBarPinnedOpen(false)}
                title="Collapse the control bar"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <ChevronUp size={12} /> Collapse
              </button>
            )}
          </div>

          {/* ---- Dimensional slicer ---- */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary-glow flex items-center gap-1.5">
                <Filter size={12} /> Slice
              </span>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                {scope.breadcrumb.map((crumb, idx) => (
                  <span key={crumb + idx} className="flex items-center gap-1">
                    {idx > 0 && <span className="opacity-40">/</span>}
                    <span className={idx === 0 ? "font-bold text-white" : ""}>{crumb}</span>
                  </span>
                ))}
              </div>
              <div className="flex-1" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground tabular-nums">
                {m.totalBands} {m.totalBands === 1 ? "band" : "bands"} · {m.totalFixtures}{" "}
                {m.totalFixtures === 1 ? "night" : "nights"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <DimSelect
                label="Season"
                value={dims.seasonId}
                options={SEASONS.map((x) => ({ id: x.id, label: x.label }))}
                onChange={(v) => setDim({ seasonId: v })}
              />
              <DimSelect
                label="Zone"
                value={dims.zoneSlug}
                options={SLICEABLE_ZONES.map((z) => ({ id: z.slug, label: z.shortName }))}
                onChange={(v) => setDim({ zoneSlug: v })}
              />
              <DimSelect
                label="City"
                icon={<MapPin size={9} />}
                value={dims.city}
                options={[
                  { id: "all", label: "All cities" },
                  ...scope.zone.hubCities.map((c) => ({ id: c.city, label: c.city })),
                ]}
                onChange={(v) => setDim({ city: v })}
              />
              <DimSelect
                label="House"
                value={dims.houseId}
                options={scope.houseOptions}
                onChange={(v) => setDim({ houseId: v })}
              />
              <DimSelect
                label="Band"
                value={dims.bandId}
                options={scope.bandOptions}
                onChange={(v) => setDim({ bandId: v })}
              />
              <DimSelect
                label="Fixture"
                value={dims.fixtureId}
                options={FIXTURE_DIMS.map((f) => ({ id: f.id, label: f.label }))}
                onChange={(v) => setDim({ fixtureId: v })}
              />
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-white">{scope.fixture.label}:</span>{" "}
              {scope.fixture.note}{" "}
              {scope.city
                ? `${scope.city.city} carries ${(scope.cityShare * 100).toFixed(0)}% of the zone calendar, at ${scope.city.priceIdx.toFixed(2)}× ticket price and ${scope.city.costIdx.toFixed(2)}× staging cost.`
                : `Averaged across ${scope.zone.hubCities.length} hub cities, weighted by each one's share of the calendar.`}{" "}
              {scope.season.id !== "s1" && scope.season.note}
            </p>
          </div>

          {/*
            Base parameters.

            Only the inputs the slicer does NOT already determine are sliders.
            Fixtures per band and the number of franchises are decided by the
            Fixture / House / Band dimensions above, so they appear here as
            read-outs rather than as controls that silently do nothing.
          */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-3">
            <Slider
              label="Ticket Price (base)"
              value={inputs.ticketPrice}
              min={99}
              max={1499}
              step={10}
              onChange={(v) => patch({ ticketPrice: v })}
              format={(v) => inr(v)}
              hint={
                scopedInputs.ticketPrice !== inputs.ticketPrice
                  ? `× ${scope.priceMult.toFixed(2)} market index = ${inr(scopedInputs.ticketPrice)} used`
                  : "Market index 1.00 — used as-is"
              }
            />
            <Slider
              label="Attendance (base, solo night)"
              value={inputs.attendance}
              min={40}
              max={1200}
              step={10}
              onChange={(v) => patch({ attendance: v })}
              format={(v) => `${v}`}
              hint={
                scopedInputs.attendance !== inputs.attendance
                  ? `× ${scope.attendanceMult.toFixed(2)} market index = ${scopedInputs.attendance} used`
                  : "Market index 1.00 — used as-is"
              }
            />
            <Derived
              label="Fixtures / Band"
              value={`${scopedInputs.showsPerBand}`}
              from={scope.fixture.label}
            />
            <Derived
              label="Houses · Bands each"
              value={`${scopedInputs.numFranchises} × ${scopedInputs.bandsPerFranchise}`}
              from={`${m.totalBands} bands in scope`}
            />
            <NumberField
              label="Winning Bid / Franchise"
              value={inputs.winningBid}
              step={10000}
              onChange={(v) => patch({ winningBid: v })}
              hint={
                scope.bidMult !== 1
                  ? `× ${scope.bidMult.toFixed(2)} at ${scope.season.label} = ${inr(scopedInputs.winningBid)}`
                  : "Used as-is at Season 1"
              }
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
                  label="Bands per house (base)"
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
                  hint={`= ${inr((scopedInputs.youtubeViewsAnnual / 1000) * inputs.youtubeRpm)} at current RPM`}
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
              {scopedInputs.attendance} to {m.sharedShow.attendance} — an extra{" "}
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
                <span className="font-bold text-white tabular-nums">
                  {scopedInputs.showsPerBand}
                </span>
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
                Cadence is an output, not a dial: {m.totalBands} bands × {scopedInputs.showsPerBand}{" "}
                appearances resolve to {m.totalFixtures} ticketed nights, because shared stages are
                counted once. Gate only — catalogue, licensing, broadcast, sponsorship and
                memberships sit outside this pool.
              </span>
            </p>
          </div>
        </div>
      </section>

      <TwoModules />

      <EventEconomics key={`ev-${sliceKey}`} scope={scope} />

      {/* ================= FRANCHISE RETURN ================= */}
      <section id="house" className="border-y border-border bg-surface/20 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Franchise Investment"
            title="What a production house puts in, and gets back in one season"
            sub={`One production house in ${scope.zone.shortName}, across a ${SEASON_STRUCTURE.seasonWeeks}-week season. Capital at risk is the winning bid; the event budget is carried by the title sponsor, so it is not franchise money. Every return line is tagged by how certain it is.`}
          />

          {/* The gate arithmetic, out loud. Everything below is downstream of it. */}
          <div className="bpl-card p-4 sm:p-5 border border-border bg-surface/50 mb-5 space-y-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Ticket size={14} className="text-primary-glow" /> Where the gate money comes from
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Everything in scope — {m.totalBands} {m.totalBands === 1 ? "band" : "bands"} in{" "}
                {scope.zone.shortName}. Every cell moves with the dimension bar.
              </p>
            </div>
            <div className="flex flex-wrap items-stretch gap-2">
              {[
                {
                  k: "Bands in scope",
                  v: m.totalBands.toLocaleString("en-IN"),
                  n: `${scopedInputs.numFranchises} ${scopedInputs.numFranchises === 1 ? "house" : "houses"} × ${scopedInputs.bandsPerFranchise} signed each`,
                },
                {
                  k: "Shows per band",
                  v: String(scopedInputs.showsPerBand),
                  n: `${m.soloShowsPerBand} solo + ${m.sharedShowsPerBand} versus`,
                },
                {
                  k: "Ticketed nights",
                  v: m.totalFixtures.toLocaleString("en-IN"),
                  n:
                    m.sharedShowsPerBand > 0
                      ? "a versus night is one shared stage"
                      : "one band a night, no shared stages",
                },
                {
                  k: "Seats sold",
                  v: numCompact(m.totalAdmissions),
                  n: `${scopedInputs.attendance} a solo night, ${m.sharedAttendance} co-headlined`,
                },
                {
                  k: "Ticket price",
                  v: inr(scopedInputs.ticketPrice),
                  n: `${scope.zone.shortName} market`,
                },
                {
                  k: "Venue mix",
                  v: `${(m.venueMixIdx * 100).toFixed(1)}%`,
                  n: "cafe to arena, not a flat room",
                },
              ].map((c, i) => (
                <div key={c.k} className="flex items-stretch gap-2">
                  {i > 0 && i !== 3 && (
                    <span className="self-center text-muted-foreground text-sm font-bold">×</span>
                  )}
                  {i === 3 && (
                    <span className="self-center text-muted-foreground text-sm font-bold">→</span>
                  )}
                  <div className="rounded-lg border border-border/70 bg-surface/60 px-3 py-2 min-w-[7.5rem]">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      {c.k}
                    </p>
                    <p className="text-lg font-display font-extrabold text-white tabular-nums leading-tight">
                      {c.v}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-snug">{c.n}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-stretch gap-2">
                <span className="self-center text-muted-foreground text-sm font-bold">=</span>
                <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 min-w-[8.5rem]">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-primary-glow">
                    Gross gate
                  </p>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums leading-tight">
                    {inrCompact(m.seasonGrossGatePool)}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-snug">
                    before platform fee &amp; tax
                  </p>
                </div>
              </div>
            </div>

            {/* Down from the whole scope to the one house the section is about. */}
            <div className="border-t border-border/40 pt-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                And down to one production house
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px]">
                <span className="rounded border border-border/60 bg-surface/50 px-2 py-1 text-white tabular-nums">
                  {inrCompact(m.seasonGrossGatePool)}{" "}
                  <span className="text-muted-foreground">gross</span>
                </span>
                <span className="text-muted-foreground">− {scopedInputs.ticketingCommissionPct}% platform &amp; GST →</span>
                <span className="rounded border border-border/60 bg-surface/50 px-2 py-1 text-white tabular-nums">
                  {inrCompact(m.seasonNetGatePool)}{" "}
                  <span className="text-muted-foreground">net</span>
                </span>
                <span className="text-muted-foreground">× {EVENT_SPLIT.productionHouse}% →</span>
                <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-white tabular-nums">
                  {inrCompact(m.seasonNetGatePool * (EVENT_SPLIT.productionHouse / 100))}{" "}
                  <span className="text-muted-foreground">to all houses</span>
                </span>
                <span className="text-muted-foreground">÷ {scopedInputs.numFranchises} →</span>
                <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-white font-bold tabular-nums">
                  {inr(m.phSeasonReturn[0].amount)}{" "}
                  <span className="text-muted-foreground font-normal">each</span>
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                That last figure is one house&apos;s {scopedInputs.bandsPerFranchise}{" "}
                {scopedInputs.bandsPerFranchise === 1 ? "band" : "bands"} playing{" "}
                {scopedInputs.showsPerBand} shows each — {m.phBandNightsSeason} appearances, on
                slightly fewer distinct nights because two of its bands share every versus stage. It
                is the Event Revenue Share the return table below opens with.
              </p>
            </div>
          </div>

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
                {inr(scopedInputs.winningBid)} in, {inr(m.phSeasonTotal)} back
              </p>
            </div>
          </div>

          <div className="grid gap-6">
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

      <AuctionPurse seasonReturn={m.phSeasonTotal} />


      {/* ================= ARTIST EARNINGS ================= */}
      <section id="artist" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 scroll-mt-24">
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

        <div className="mt-5">
          <ArtistIndexCard />
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
            Each side's season share is {inr(m.contentHalfPerSeason)} — the annual half divided
            across {SEASON_STRUCTURE.seasonsPerYear} seasons a year.
          </p>
        </div>
      </section>

      {/* ================= LEAGUE SEASON POSITION ================= */}
      <section id="league" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 scroll-mt-24">
        <SectionHeading
          eyebrow="League Season"
          title={`One season, ${m.totalFixtures} ticketed nights, whole ecosystem`}
          sub={`Everything moving through ${scope.zone.shortName} over a ${SEASON_STRUCTURE.seasonWeeks}-week season — ${scopedInputs.numFranchises} production houses, ${m.totalBands} bands — and separately what the operator keeps after running costs.`}
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
              {inrCompact(OPERATIONS.fixed)} of this is genuinely fixed — the central team,
              platform, brand campaign and corporate base. The other{" "}
              {inrCompact(OPERATIONS.variable)} scales with zones, nights, campuses and bands, so
              expansion is cheaper per unit but is never free. That works out at{" "}
              {inr(Math.round(OPERATIONS.perNight))} of central cost behind every night staged.
            </p>
          </div>
        </div>

        <div className="mt-6 bpl-card p-5 sm:p-6 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[11px] uppercase tracking-widest text-primary-glow font-bold">
              Operator Net Position — Per Season
            </p>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              {inrCompact(m.operatorGross)} gross less {inrCompact(m.operatorCostsTotal)} of
              operating cost.{" "}
              {m.operatorNet < 0 ? (
                <>
                  A first season on a fully-staffed cost base does not pay for itself out of the
                  gate, and pretending otherwise would just move the problem to March. Closing this
                  is a sponsorship and broadcast job, not a ticket-price one.
                </>
              ) : (
                <>
                  Most of the cost base is fixed, so adding zones and fixtures widens the margin
                  without a matching rise in central spend.
                </>
              )}
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

        {/* ---------------- CAPITAL ALLOCATION ---------------- */}
        <div className="mt-10 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold">
              Capital Allocation
            </p>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              What happens to the profit
            </h3>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Prize money is {PRIZE_SHARE_OF_PROFIT}% of what the league actually makes, not a fixed
              pool it owes whether or not it earned anything. A fixed pool is a liability in exactly
              the season the league can least afford one; a share of profit grows with the thing the
              bands helped build.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {allocation.slices.map((sl) => (
              <div
                key={sl.id}
                className={`bpl-card p-4 space-y-1.5 border ${
                  sl.id === "prize"
                    ? "border-amber-500/35 bg-amber-500/5"
                    : "border-border bg-surface/40"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-white">{sl.label}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground shrink-0">
                    {sl.pct}%
                  </span>
                </div>
                <p className="text-xl font-display font-extrabold text-white tabular-nums">
                  {m.operatorNet > 0 ? inrCompact(sl.amount) : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {PROFIT_ALLOCATION.find((a) => a.id === sl.id)?.purpose}
                </p>
              </div>
            ))}
          </div>

          {m.operatorNet <= 0 && (
            <div className="bpl-card p-4 border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <p className="text-xs font-bold text-amber-300">
                At these inputs the season makes no profit, so {PRIZE_SHARE_OF_PROFIT}% of it is
                nothing.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                That is the rule working correctly, not a modelling error — and it is precisely why
                seasons 1 and 2 need an announced prize floor funded from raised capital. The
                decision is listed below rather than hidden behind a more optimistic cost base.
              </p>
            </div>
          )}

          {/* Roadmap */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Five seasons of capital policy</h4>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[46rem] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Season", "Focus", "Zones", "Bands", "Prize", "Reinvest", "Reserve", "Distribute"].map(
                      (h) => (
                        <th
                          key={h}
                          className="py-2 pr-3 text-[9px] uppercase tracking-wider font-bold text-muted-foreground"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {PROFIT_ROADMAP.map((y) => (
                    <tr key={y.season} className="border-b border-border/40 align-top">
                      <td className="py-2.5 pr-3 text-xs font-bold text-white whitespace-nowrap">
                        S{y.season} · {y.year}
                      </td>
                      <td className="py-2.5 pr-3 text-[11px] text-white">
                        {y.label}
                        <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5 max-w-md">
                          {y.milestone}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground tabular-nums">{y.zones}</td>
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground tabular-nums">{y.bands}</td>
                      <td className="py-2.5 pr-3 text-xs font-bold text-amber-300 tabular-nums">{y.prize}%</td>
                      <td className="py-2.5 pr-3 text-xs text-white tabular-nums">{y.reinvest}%</td>
                      <td className="py-2.5 pr-3 text-xs text-white tabular-nums">{y.reserve}%</td>
                      <td className="py-2.5 pr-3 text-xs text-white tabular-nums">{y.distribute}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              The prize share never moves — that is the rule. What moves is the balance between
              building the league and taking money out of it, and the order matters: reserve first,
              then growth, then returns.
            </p>
          </div>

          {/* Open decisions */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white">What still has to be decided</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
                Every one of these carries a recommendation. An open question with no proposed
                answer is just a way of not deciding.
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {OPEN_DECISIONS.map((d) => (
                <div
                  key={d.id}
                  className={`bpl-card p-4 space-y-2 border ${
                    d.impact === "high"
                      ? "border-rose-500/25 bg-rose-500/5"
                      : "border-border bg-surface/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-white leading-snug">{d.question}</h5>
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-border/70 bg-surface/60 text-muted-foreground shrink-0">
                      {d.owner}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{d.why}</p>
                  <p className="text-[10px] leading-relaxed border-t border-border/40 pt-2">
                    <span className="font-semibold text-emerald-300">Recommendation: </span>
                    <span className="text-muted-foreground">{d.recommendation}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SponsorEconomics
        key={`sp-${sliceKey}`}
        scope={scope}
        fixturesInScope={m.totalFixtures}
      />

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
            {scopedInputs.showsPerBand} fixtures per band per season and {scopedInputs.numFranchises} production houses,
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
