import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  Ticket,
  Users,
  Disc3,
  Building2,
  Wallet,
  PieChart,
  Sparkles,
  Info,
  ArrowRight,
  RotateCcw,
  Layers,
} from "lucide-react";
import {
  inr,
  inrCompact,
  computeShowEconomics,
  SHOW_BASELINE,
  EVENT_SPLIT,
  CONTENT_SPLIT,
  CONTENT_STREAMS,
  CONTENT_TOTAL,
  PH_INVESTMENT,
  PH_RETURN,
  PILOT_REVENUE,
  PILOT_REVENUE_TOTAL,
  PILOT_OPERATOR_COSTS,
  PILOT_OPERATOR_COSTS_TOTAL,
  PILOT_OPERATOR_INCOME,
  PILOT_OPERATOR_GROSS,
  REVENUE_STREAMS,
  PITCH_POINTS,
} from "@/data/economics";

export const Route = createFileRoute("/economics")({
  head: () => ({
    meta: [
      { title: "Economics — Kalakshetra" },
      {
        name: "description",
        content:
          "How money moves through the Kalakshetra league: per-show unit economics, content rights splits, production house ROI and the pilot season model.",
      },
      { property: "og:title", content: "Economics — Kalakshetra" },
      {
        property: "og:description",
        content:
          "Transparent unit economics for bands, production houses and investors — with a live per-show calculator.",
      },
    ],
  }),
  component: EconomicsPage,
});

/** Headline tile used across the page. */
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

/** Labelled slider for the live model. */
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
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
    </div>
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
      {sub && <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{sub}</p>}
    </div>
  );
}

function EconomicsPage() {
  const [ticketPrice, setTicketPrice] = useState<number>(SHOW_BASELINE.ticketPrice);
  const [attendance, setAttendance] = useState<number>(SHOW_BASELINE.attendance);
  const [showsPerMonth, setShowsPerMonth] = useState<number>(SHOW_BASELINE.showsPerMonth);

  const show = useMemo(
    () => computeShowEconomics(ticketPrice, attendance, SHOW_BASELINE.platformCommissionPct),
    [ticketPrice, attendance],
  );

  const isBaseline =
    ticketPrice === SHOW_BASELINE.ticketPrice &&
    attendance === SHOW_BASELINE.attendance &&
    showsPerMonth === SHOW_BASELINE.showsPerMonth;

  const resetModel = () => {
    setTicketPrice(SHOW_BASELINE.ticketPrice);
    setAttendance(SHOW_BASELINE.attendance);
    setShowsPerMonth(SHOW_BASELINE.showsPerMonth);
  };

  // Production house Year 1 recovery against what they put in.
  const phRecoveryPct = (PH_RETURN.totalYear1 / PH_INVESTMENT.totalEcosystemBudget) * 100;
  const operatorNet = PILOT_OPERATOR_GROSS - PILOT_OPERATOR_COSTS_TOTAL;

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

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-14 space-y-6">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold tracking-wide">
              <TrendingUp size={14} />
              <span>Investor Briefing — Pilot Season Model</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Economics
              </span>{" "}
              of the League
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every rupee that enters the ecosystem has a defined path. Here is exactly how a
              ticket becomes artist income, how production houses recover their bid, and what the
              pilot season is modelled to return.
            </p>
          </div>

          {/* Headline economics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <Stat
              icon={<Ticket size={13} />}
              value={inr(show.netRevenue)}
              label="Net Per Show"
              hint={`After ${SHOW_BASELINE.platformCommissionPct}% platform commission`}
              accent="text-emerald-400"
            />
            <Stat
              icon={<PieChart size={13} />}
              value={`${EVENT_SPLIT.bands}/${EVENT_SPLIT.eventManagement}/${EVENT_SPLIT.operator}`}
              label="Live Split"
              hint="Bands / Event Mgmt / Operator"
              accent="text-amber-400"
            />
            <Stat
              icon={<Disc3 size={13} />}
              value={inrCompact(CONTENT_TOTAL)}
              label="Content / Band / Yr"
              hint={`Split ${CONTENT_SPLIT.artists}/${CONTENT_SPLIT.productionHouse} artist to production house`}
              accent="text-cyan-400"
            />
            <Stat
              icon={<Wallet size={13} />}
              value={inrCompact(PILOT_REVENUE_TOTAL)}
              label="Pilot Season Rev"
              hint="Hyderabad, 3 months, ecosystem-wide"
              accent="text-purple-400"
            />
          </div>
        </div>
      </section>

      {/* ================= LIVE UNIT ECONOMICS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Unit Economics"
          title="One show, followed rupee by rupee"
          sub="Move the inputs to see how the model responds. Defaults are the pilot assumptions from the operating plan — a ₹199 ticket to a 150-capacity room."
        />

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Controls */}
          <div className="bpl-card p-5 border border-border/80 bg-surface/60 space-y-5 h-fit">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers size={15} className="text-primary-glow" /> Model Inputs
              </h3>
              {!isBaseline && (
                <button
                  type="button"
                  onClick={resetModel}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition cursor-pointer"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>

            <Slider
              label="Ticket Price"
              value={ticketPrice}
              min={99}
              max={999}
              step={10}
              onChange={setTicketPrice}
              format={(v) => inr(v)}
            />
            <Slider
              label="Attendance"
              value={attendance}
              min={40}
              max={600}
              step={10}
              onChange={setAttendance}
              format={(v) => `${v} people`}
            />
            <Slider
              label="Shows Per Month"
              value={showsPerMonth}
              min={2}
              max={30}
              step={1}
              onChange={setShowsPerMonth}
              format={(v) => `${v} shows`}
            />

            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Monthly net pool</span>
                <span className="font-bold text-white tabular-nums">
                  {inr(show.netRevenue * showsPerMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Annualised</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {inrCompact(show.netRevenue * showsPerMonth * 12)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed flex gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Ticket revenue only. Sponsorship, memberships and content rights sit outside this
                pool and are covered below.
              </span>
            </p>
          </div>

          {/* Waterfall */}
          <div className="space-y-4">
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  Gross Gate
                </span>
                <span className="text-3xl font-display font-extrabold text-white tabular-nums">
                  {inr(show.grossTicketRevenue)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {inr(ticketPrice)} × {attendance} tickets
              </p>

              <div className="flex items-center justify-between text-sm border-t border-border/60 pt-3">
                <span className="text-rose-300 flex items-center gap-1.5">
                  <ArrowRight size={13} /> Platform commission (
                  {SHOW_BASELINE.platformCommissionPct}%)
                </span>
                <span className="font-bold text-rose-300 tabular-nums">
                  −{inr(show.platformCommission)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-sm font-bold text-white">Net revenue to split</span>
                <span className="text-xl font-display font-extrabold text-emerald-400 tabular-nums">
                  {inr(show.netRevenue)}
                </span>
              </div>

              {/* Split bar */}
              <div className="pt-1 space-y-2">
                <div className="flex h-3 w-full overflow-hidden rounded-full border border-border/60">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${EVENT_SPLIT.bands}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${EVENT_SPLIT.eventManagement}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-purple-500 to-fuchsia-500"
                    style={{ width: `${EVENT_SPLIT.operator}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Three shares */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  who: "Bands",
                  pct: EVENT_SPLIT.bands,
                  amount: show.bandsShare,
                  icon: <Users size={14} />,
                  ring: "border-amber-500/40",
                  text: "text-amber-300",
                  note: "Paid to the performing act",
                },
                {
                  who: "Event Management",
                  pct: EVENT_SPLIT.eventManagement,
                  amount: show.eventManagementShare,
                  icon: <Building2 size={14} />,
                  ring: "border-cyan-500/40",
                  text: "text-cyan-300",
                  note: "Venue, production, staffing",
                },
                {
                  who: "League Operator",
                  pct: EVENT_SPLIT.operator,
                  amount: show.operatorShare,
                  icon: <Sparkles size={14} />,
                  ring: "border-purple-500/40",
                  text: "text-purple-300",
                  note: "Platform, curation, growth",
                },
              ].map((s) => (
                <div
                  key={s.who}
                  className={`bpl-card p-4 border ${s.ring} bg-surface/50 space-y-1.5`}
                >
                  <div className={`flex items-center gap-1.5 ${s.text}`}>
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-wider font-bold">{s.who}</span>
                  </div>
                  <p className="text-2xl font-display font-extrabold text-white tabular-nums">
                    {inr(s.amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.pct}% of net · {s.note}
                  </p>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    {inr(s.amount * showsPerMonth)} / month at {showsPerMonth} shows
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT RIGHTS ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Content Rights"
            title="The catalogue keeps earning after the lights go down"
            sub={`Annual estimate per band once a season's originals and show films are live. Split ${CONTENT_SPLIT.artists}/${CONTENT_SPLIT.productionHouse} between the artist and the production house that financed the recording.`}
          />

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="bpl-card border border-border/80 bg-surface/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
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
                    {CONTENT_STREAMS.map((s) => (
                      <tr key={s.source} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{s.source}</p>
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
                        {inr(CONTENT_TOTAL)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-300 tabular-nums">
                        {inr(CONTENT_TOTAL / 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-cyan-300 tabular-nums">
                        {inr(CONTENT_TOTAL / 2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bpl-card p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-3 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Disc3 size={15} className="text-emerald-400" /> Why this line matters
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ticket income stops when the show ends. Rights income does not. Each season adds a
                permanent catalogue layer that keeps paying in later years, so band two of a
                three-season artist is earning from seasons one and two at once.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is the line that turns a live-events business into an asset business — and the
                reason production houses can underwrite a bid at all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTION HOUSE ROI ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Franchise Investment"
          title="What a production house puts in, and gets back"
          sub="Worked example for a single franchise in the pilot season, at the modelled bid level."
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Investment */}
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Building2 size={15} className="text-rose-400" /> Capital Deployed
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-white font-semibold">Winning Bid</span>
                <span className="font-bold text-white tabular-nums">
                  {inr(PH_INVESTMENT.winningBid)}
                </span>
              </div>
              <div className="flex justify-between text-xs pl-4 text-muted-foreground">
                <span>→ Music Production</span>
                <span className="tabular-nums">{inr(PH_INVESTMENT.musicProduction)}</span>
              </div>
              <div className="flex justify-between text-xs pl-4 text-muted-foreground">
                <span>→ Video Production</span>
                <span className="tabular-nums">{inr(PH_INVESTMENT.videoProduction)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-border/50">
                <span className="text-white font-semibold">Event Budget</span>
                <span className="font-bold text-white tabular-nums">
                  {inr(PH_INVESTMENT.eventBudget)}
                </span>
              </div>
              <div className="flex justify-between text-xs pl-4 text-muted-foreground">
                <span>→ Marketing &amp; Publicity</span>
                <span className="tabular-nums">{inr(PH_INVESTMENT.marketing)}</span>
              </div>
              <div className="flex justify-between text-xs pl-4 text-muted-foreground">
                <span>→ Travel &amp; Logistics</span>
                <span className="tabular-nums">{inr(PH_INVESTMENT.travelLogistics)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Total Deployed</span>
              <span className="text-2xl font-display font-extrabold text-rose-300 tabular-nums">
                {inr(PH_INVESTMENT.totalEcosystemBudget)}
              </span>
            </div>
          </div>

          {/* Return */}
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp size={15} className="text-emerald-400" /> Year 1 Return
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-white font-semibold">Content Rights Share</span>
                <span className="font-bold text-white tabular-nums">
                  {inr(PH_RETURN.contentYear1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-4">
                {CONTENT_SPLIT.productionHouse}% of {inr(CONTENT_TOTAL)} catalogue revenue
              </p>

              <div className="flex justify-between items-baseline pt-2 border-t border-border/50">
                <span className="text-white font-semibold">Event Revenue Share</span>
                <span className="font-bold text-white tabular-nums">
                  {inr(PH_RETURN.eventsYear1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-4">
                Across {PH_RETURN.eventShowsCounted} shows in the season
              </p>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Total Year 1</span>
              <span className="text-2xl font-display font-extrabold text-emerald-400 tabular-nums">
                {inr(PH_RETURN.totalYear1)}
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary/50 border border-border/60">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${Math.min(phRecoveryPct, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-bold text-emerald-300">
                  {phRecoveryPct.toFixed(0)}% of capital recovered in year one.
                </span>{" "}
                The balance is carried by the catalogue, which keeps earning in years two and three
                against no further production spend.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 bpl-card p-4 border border-amber-500/25 bg-amber-500/5 flex gap-2.5">
          <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-amber-200">Read this honestly:</span> a franchise
            does not break even in year one on these assumptions. The model recovers roughly{" "}
            {phRecoveryPct.toFixed(0)}% of deployed capital in season one and depends on catalogue
            revenue persisting across later seasons to clear the balance. Investors should test that
            persistence assumption before anything else.
          </p>
        </div>
      </section>

      {/* ================= PILOT SEASON P&L ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Pilot Season"
            title="Hyderabad, three months, whole ecosystem"
            sub="Total value moving through the league during the pilot, and separately what the operator itself keeps after running costs."
          />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Ecosystem revenue */}
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                Ecosystem Revenue
              </h3>
              {PILOT_REVENUE.map((r) => (
                <div key={r.label} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-white">{r.label}</span>
                    <span className="font-bold text-white tabular-nums">{inr(r.amount)}</span>
                  </div>
                  {r.detail && (
                    <p className="text-[10px] text-muted-foreground">{r.detail}</p>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-display font-extrabold text-emerald-400 tabular-nums">
                  {inr(PILOT_REVENUE_TOTAL)}
                </span>
              </div>
            </div>

            {/* Operator income */}
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-purple-400">
                Operator Income
              </h3>
              {PILOT_OPERATOR_INCOME.map((r) => (
                <div key={r.label} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-white">{r.label}</span>
                    <span className="font-bold text-white tabular-nums">{inr(r.amount)}</span>
                  </div>
                  {r.detail && (
                    <p className="text-[10px] text-muted-foreground">{r.detail}</p>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Gross</span>
                <span className="text-xl font-display font-extrabold text-purple-300 tabular-nums">
                  {inr(PILOT_OPERATOR_GROSS)}
                </span>
              </div>
            </div>

            {/* Operator costs */}
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-rose-400">
                Operator Costs
              </h3>
              {PILOT_OPERATOR_COSTS.map((c) => (
                <div key={c.label} className="flex justify-between items-baseline text-sm">
                  <span className="text-white">{c.label}</span>
                  <span className="font-bold text-white tabular-nums">{inr(c.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-display font-extrabold text-rose-300 tabular-nums">
                  {inr(PILOT_OPERATOR_COSTS_TOTAL)}
                </span>
              </div>
            </div>
          </div>

          {/* Net position */}
          <div className="mt-6 bpl-card p-5 sm:p-6 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-[11px] uppercase tracking-widest text-primary-glow font-bold">
                Operator Net Position — Pilot
              </p>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                {inr(PILOT_OPERATOR_GROSS)} gross less {inr(PILOT_OPERATOR_COSTS_TOTAL)} of
                operating cost. The pilot is built to prove the format and seed the catalogue, not
                to return a margin — margin arrives in year two on 8+ bands and 20+ shows a month,
                against largely the same central overhead.
              </p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-3xl font-display font-extrabold text-white tabular-nums">
                {operatorNet < 0 ? "−" : "+"}
                {inr(Math.abs(operatorNet))}
              </p>
              <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                Essentially break-even
              </p>
            </div>
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

      {/* ================= PITCH POINTS ================= */}
      <section className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Investment Thesis"
            title="Why the structure compounds"
          />

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

          {/* CTA */}
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
                Season plans, city expansion assumptions and the detailed cost base are available to
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

          {/* Basis of preparation */}
          <p className="mt-8 text-[11px] text-muted-foreground/80 leading-relaxed max-w-4xl">
            <span className="font-semibold text-muted-foreground">Basis of preparation:</span>{" "}
            figures are pilot-stage projections drawn from the league operating plan, not audited
            results or a guarantee of future performance. Ticket, attendance and rights estimates
            assume the Hyderabad pilot configuration; production house bid levels are modelled, not
            contracted. The calculator above changes only ticket price, attendance and show volume —
            all other assumptions, including the {SHOW_BASELINE.platformCommissionPct}% platform
            commission and the {EVENT_SPLIT.bands}/{EVENT_SPLIT.eventManagement}/
            {EVENT_SPLIT.operator} split, are held constant.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
