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
  Tv,
  Music,
} from "lucide-react";
import {
  inr,
  inrCompact,
  computeShowEconomics,
  ASSUMPTIONS,
  SHOW_BASELINE,
  SEASON_STRUCTURE,
  SHOWS_PER_SEASON_LEAGUE,
  EVENT_SPLIT,
  CONTENT_SPLIT,
  CONTENT_STREAMS,
  CONTENT_TOTAL,
  CONTENT_HALF_ANNUAL,
  PH_INVESTMENT,
  PH_SEASON_RETURN,
  PH_SEASON_TOTAL,
  PH_SEASON_PROFIT,
  PH_SEASON_MULTIPLE,
  ARTIST_SEASON_RETURN,
  ARTIST_SEASON_TOTAL,
  ARTIST_YEAR_TOTAL,
  ARTIST_PER_MEMBER_SEASON,
  ARTIST_PER_MEMBER_YEAR,
  PILOT_REVENUE,
  PILOT_REVENUE_TOTAL,
  PILOT_OPERATOR_COSTS,
  PILOT_OPERATOR_COSTS_TOTAL,
  PILOT_OPERATOR_INCOME,
  PILOT_OPERATOR_GROSS,
  REVENUE_STREAMS,
  FUTURE_STREAMS,
  PARTNER_ROLES,
  PITCH_POINTS,
} from "@/data/economics";

export const Route = createFileRoute("/economics")({
  head: () => ({
    meta: [
      { title: "Economics — Kalakshetra" },
      {
        name: "description",
        content:
          "How money moves through the Kalakshetra league: per-show unit economics, what franchises and artists earn per season, broadcast and licensing upside, and the league's season position.",
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

/** Visual treatment per partner tier. */
const TIER_STYLE: Record<string, { ring: string; text: string; chip: string; label: string }> = {
  music: { ring: "border-cyan-500/40", text: "text-cyan-300", chip: "bg-cyan-500/10 border-cyan-500/30", label: "Music" },
  sponsor: { ring: "border-amber-500/40", text: "text-amber-300", chip: "bg-amber-500/10 border-amber-500/30", label: "Sponsor" },
  platform: { ring: "border-purple-500/40", text: "text-purple-300", chip: "bg-purple-500/10 border-purple-500/30", label: "Platform" },
  community: { ring: "border-emerald-500/40", text: "text-emerald-300", chip: "bg-emerald-500/10 border-emerald-500/30", label: "Community" },
};

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

  const operatorNet = PILOT_OPERATOR_GROSS - PILOT_OPERATOR_COSTS_TOTAL;
  const operatorMarginPct = (operatorNet / PILOT_OPERATOR_GROSS) * 100;

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
              <span>Investor Briefing — Season Model</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Economics
              </span>{" "}
              of the League
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every rupee that enters the ecosystem has a defined path. Here is how a ticket becomes
              artist income, what a franchise puts in and takes out across one season, and where the
              catalogue keeps paying long after the lights go down.
            </p>
          </div>

          {/* Headline economics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <Stat
              icon={<Ticket size={13} />}
              value={inr(show.netRevenue)}
              label="Net Per Show"
              hint={`After the ${SHOW_BASELINE.platformCommissionPct}% ticketing partner cut`}
              accent="text-emerald-400"
            />
            <Stat
              icon={<PieChart size={13} />}
              value={`${EVENT_SPLIT.bands}/${EVENT_SPLIT.productionHouse}/${EVENT_SPLIT.operator}`}
              label="Live Split"
              hint="Bands / Production House / Operator"
              accent="text-amber-400"
            />
            <Stat
              icon={<Building2 size={13} />}
              value={`${PH_SEASON_MULTIPLE.toFixed(2)}×`}
              label="Franchise Return"
              hint={`${inr(PH_INVESTMENT.winningBid)} in, ${inr(PH_SEASON_TOTAL)} back in one season`}
              accent="text-cyan-400"
            />
            <Stat
              icon={<Music size={13} />}
              value={inrCompact(ARTIST_PER_MEMBER_YEAR)}
              label="Per Musician / Yr"
              hint={`Across ${SEASON_STRUCTURE.seasonsPerYear} seasons, ${ASSUMPTIONS.bandMembers}-piece band`}
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
          sub={`Move the inputs to see how the model responds. Defaults are the league's operating assumptions — a ${inr(ASSUMPTIONS.ticketPrice)} ticket into a ${ASSUMPTIONS.attendance}-capacity room.`}
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

            <Slider label="Ticket Price" value={ticketPrice} min={99} max={1499} step={10} onChange={setTicketPrice} format={(v) => inr(v)} />
            <Slider label="Attendance" value={attendance} min={40} max={1200} step={10} onChange={setAttendance} format={(v) => `${v} people`} />
            <Slider label="Shows Per Month" value={showsPerMonth} min={2} max={30} step={1} onChange={setShowsPerMonth} format={(v) => `${v} shows`} />

            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Monthly net pool</span>
                <span className="font-bold text-white tabular-nums">{inr(show.netRevenue * showsPerMonth)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Annualised</span>
                <span className="font-bold text-emerald-400 tabular-nums">{inrCompact(show.netRevenue * showsPerMonth * 12)}</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed flex gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Gate only. Catalogue, licensing, broadcast, sponsorship and memberships sit outside
                this pool and are covered below.
              </span>
            </p>
          </div>

          {/* Waterfall */}
          <div className="space-y-4">
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Gross Gate</span>
                <span className="text-3xl font-display font-extrabold text-white tabular-nums">{inr(show.grossTicketRevenue)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {inr(ticketPrice)} × {attendance} tickets
              </p>

              <div className="flex items-center justify-between text-sm border-t border-border/60 pt-3">
                <span className="text-rose-300 flex items-center gap-1.5">
                  <ArrowRight size={13} /> Ticketing partner commission ({SHOW_BASELINE.platformCommissionPct}%)
                </span>
                <span className="font-bold text-rose-300 tabular-nums">−{inr(show.platformCommission)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Retained by the third-party ticketing platform that sells and settles the tickets. It
                leaves the pool before anyone in the league is paid.
              </p>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-sm font-bold text-white">Net revenue to split</span>
                <span className="text-xl font-display font-extrabold text-emerald-400 tabular-nums">{inr(show.netRevenue)}</span>
              </div>

              <div className="pt-1 space-y-2">
                <div className="flex h-3 w-full overflow-hidden rounded-full border border-border/60">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${EVENT_SPLIT.bands}%` }} />
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${EVENT_SPLIT.productionHouse}%` }} />
                  <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${EVENT_SPLIT.operator}%` }} />
                </div>
              </div>
            </div>

            {/* Three shares */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { who: "Bands", pct: EVENT_SPLIT.bands, amount: show.bandsShare, icon: <Users size={14} />, ring: "border-amber-500/40", text: "text-amber-300", note: "Paid to the performing act" },
                { who: "Production House", pct: EVENT_SPLIT.productionHouse, amount: show.productionHouseShare, icon: <Building2 size={14} />, ring: "border-cyan-500/40", text: "text-cyan-300", note: "Franchise that signed the band" },
                { who: "League Operator", pct: EVENT_SPLIT.operator, amount: show.operatorShare, icon: <Sparkles size={14} />, ring: "border-purple-500/40", text: "text-purple-300", note: "Platform, curation, event ops" },
              ].map((s) => (
                <div key={s.who} className={`bpl-card p-4 border ${s.ring} bg-surface/50 space-y-1.5`}>
                  <div className={`flex items-center gap-1.5 ${s.text}`}>
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-wider font-bold">{s.who}</span>
                  </div>
                  <p className="text-2xl font-display font-extrabold text-white tabular-nums">{inr(s.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">{s.pct}% of net · {s.note}</p>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    {inr(s.amount * showsPerMonth)} / month at {showsPerMonth} shows
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FRANCHISE RETURN ================= */}
      <section className="border-y border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <SectionHeading
            eyebrow="Franchise Investment"
            title="What a production house puts in, and gets back in one season"
            sub={`A single franchise across one ${SEASON_STRUCTURE.monthsPerSeason}-month season. Capital at risk is the winning bid; the event budget is carried by the title sponsor, so it is not franchise money.`}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Investment */}
            <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Building2 size={15} className="text-rose-400" /> Capital At Risk
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-white font-semibold">Winning Bid</span>
                  <span className="font-bold text-white tabular-nums">{inr(PH_INVESTMENT.winningBid)}</span>
                </div>
                <div className="flex justify-between text-xs pl-4 text-muted-foreground">
                  <span>→ Music Production</span>
                  <span className="tabular-nums">{inr(PH_INVESTMENT.musicProduction)}</span>
                </div>
                <div className="flex justify-between text-xs pl-4 text-muted-foreground">
                  <span>→ Video Production</span>
                  <span className="tabular-nums">{inr(PH_INVESTMENT.videoProduction)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Franchise Capital</span>
                <span className="text-2xl font-display font-extrabold text-rose-300 tabular-nums">{inr(PH_INVESTMENT.winningBid)}</span>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Funded separately by the title sponsor
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Event budget (marketing, travel, logistics)</span>
                  <span className="tabular-nums">{inr(PH_INVESTMENT.sponsorEventBudget)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Total ecosystem budget per band is {inr(PH_INVESTMENT.totalEcosystemBudget)}, but
                  the franchise only carries the bid.
                </p>
              </div>
            </div>

            {/* Return */}
            <div className="bpl-card p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp size={15} className="text-emerald-400" /> Season Return
              </h3>

              <div className="space-y-3 text-sm">
                {PH_SEASON_RETURN.map((r) => (
                  <div key={r.label} className="space-y-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-white font-semibold">{r.label}</span>
                      <span className="font-bold text-white tabular-nums shrink-0">{inr(r.amount)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="text-sm font-bold text-white">Total Return</span>
                <span className="text-2xl font-display font-extrabold text-emerald-400 tabular-nums">{inr(PH_SEASON_TOTAL)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-300/80">Net Profit</p>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">{inr(PH_SEASON_PROFIT)}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-300/80">Return Multiple</p>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">{PH_SEASON_MULTIPLE.toFixed(2)}×</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 bpl-card p-4 border border-amber-500/25 bg-amber-500/5 flex gap-2.5">
            <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-amber-200">What has to hold:</span> the franchise
              clears its bid in a single season only if the band plays its full{" "}
              {ASSUMPTIONS.showsPerBandPerSeason} fixtures into rooms near {ASSUMPTIONS.attendance}{" "}
              capacity at {inr(ASSUMPTIONS.ticketPrice)}, and the licensing and broadcast lines are
              contracted for the season rather than assumed. Gate alone returns{" "}
              {inr(PH_SEASON_RETURN[0].amount)} of the {inr(PH_SEASON_TOTAL)} — the rest depends on
              rights deals landing. Test attendance and those two contracts first.
            </p>
          </div>
        </div>
      </section>

      {/* ================= ARTIST EARNINGS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="Artist Earnings"
          title="What the musicians actually take home"
          sub={`The same season, seen from the band's side. Figures are for one band across one season, then split across a ${ASSUMPTIONS.bandMembers}-piece line-up.`}
        />

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-4">
            <div className="space-y-3 text-sm">
              {ARTIST_SEASON_RETURN.map((r) => (
                <div key={r.label} className="space-y-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-white font-semibold">{r.label}</span>
                    <span className="font-bold text-white tabular-nums shrink-0">{inr(r.amount)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Band Total — One Season</span>
              <span className="text-2xl font-display font-extrabold text-amber-300 tabular-nums">{inr(ARTIST_SEASON_TOTAL)}</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">Band / Year</p>
                <p className="text-base font-display font-extrabold text-white tabular-nums">{inr(ARTIST_YEAR_TOTAL)}</p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">Per Musician / Season</p>
                <p className="text-base font-display font-extrabold text-white tabular-nums">{inr(ARTIST_PER_MEMBER_SEASON)}</p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">Per Musician / Year</p>
                <p className="text-base font-display font-extrabold text-white tabular-nums">{inr(ARTIST_PER_MEMBER_YEAR)}</p>
              </div>
            </div>
          </div>

          <div className="bpl-card p-5 border border-amber-500/30 bg-amber-500/5 space-y-3 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Music size={15} className="text-amber-400" /> Why this is the point
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An independent band playing one-off gigs is paid per night and owns nothing afterwards.
              Inside the league a band gets a guaranteed fixture calendar, a financed recording it
              half-owns, and a share of every rupee that catalogue earns for as long as it exists.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              That is the difference between playing for a fee and building an asset — and it is why
              bands sign for a season rather than a night.
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
            sub={`Annual estimate per band once a season's originals and show films are live. Split ${CONTENT_SPLIT.artists}/${CONTENT_SPLIT.productionHouse} between the artist and the production house that financed the recording.`}
          />

          <div className="bpl-card border border-border/80 bg-surface/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-border/80 text-left">
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Revenue Source</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-right">Annual</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-amber-400 text-right">Artist {CONTENT_SPLIT.artists}%</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-cyan-400 text-right">Prod. House {CONTENT_SPLIT.productionHouse}%</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTENT_STREAMS.map((s) => (
                    <tr key={s.source} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{s.source}</p>
                        <p className="text-[11px] text-muted-foreground">{s.note}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white tabular-nums">{inr(s.annual)}</td>
                      <td className="px-4 py-3 text-right text-amber-300 tabular-nums">{inr(s.annual / 2)}</td>
                      <td className="px-4 py-3 text-right text-cyan-300 tabular-nums">{inr(s.annual / 2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/30">
                    <td className="px-4 py-3 font-bold text-white">Total</td>
                    <td className="px-4 py-3 text-right font-display font-extrabold text-emerald-400 tabular-nums">{inr(CONTENT_TOTAL)}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-300 tabular-nums">{inr(CONTENT_HALF_ANNUAL)}</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-300 tabular-nums">{inr(CONTENT_HALF_ANNUAL)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LEAGUE SEASON POSITION ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <SectionHeading
          eyebrow="League Season"
          title={`One season, ${SHOWS_PER_SEASON_LEAGUE} fixtures, whole ecosystem`}
          sub={`Total value moving through the league across a ${SEASON_STRUCTURE.monthsPerSeason}-month season with ${ASSUMPTIONS.bandsPerSeason} franchises, and separately what the operator keeps after running costs.`}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-emerald-400">Ecosystem Revenue</h3>
            {PILOT_REVENUE.map((r) => (
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
              <span className="text-xl font-display font-extrabold text-emerald-400 tabular-nums">{inr(PILOT_REVENUE_TOTAL)}</span>
            </div>
          </div>

          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-purple-400">Operator Income</h3>
            {PILOT_OPERATOR_INCOME.map((r) => (
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
              <span className="text-xl font-display font-extrabold text-purple-300 tabular-nums">{inr(PILOT_OPERATOR_GROSS)}</span>
            </div>
          </div>

          <div className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-rose-400">Operator Costs</h3>
            {PILOT_OPERATOR_COSTS.map((c) => (
              <div key={c.label} className="flex justify-between items-baseline text-sm gap-2">
                <span className="text-white">{c.label}</span>
                <span className="font-bold text-white tabular-nums shrink-0">{inr(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-xl font-display font-extrabold text-rose-300 tabular-nums">{inr(PILOT_OPERATOR_COSTS_TOTAL)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bpl-card p-5 sm:p-6 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[11px] uppercase tracking-widest text-primary-glow font-bold">Operator Net Position — Per Season</p>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              {inr(PILOT_OPERATOR_GROSS)} gross less {inr(PILOT_OPERATOR_COSTS_TOTAL)} of operating
              cost. The cost base is mostly fixed, so adding franchises and fixtures widens the
              margin without a matching rise in central spend — which is what makes city-by-city
              expansion work.
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-3xl font-display font-extrabold text-white tabular-nums">
              {operatorNet < 0 ? "−" : "+"}
              {inr(Math.abs(operatorNet))}
            </p>
            <p className={`text-[11px] font-semibold mt-0.5 ${operatorNet < 0 ? "text-amber-300" : "text-emerald-300"}`}>
              {operatorNet < 0 ? "Essentially break-even" : `Operating surplus · ${operatorMarginPct.toFixed(0)}% margin`}
            </p>
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
              <div key={s.title} className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-2 hover:border-primary/40 transition">
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
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Stream</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Source</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Who It Pays</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_STREAMS.map((s) => (
                  <tr key={s.stream} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{s.stream}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{s.source}</td>
                    <td className="px-4 py-3 text-xs text-primary-glow font-medium whitespace-nowrap">{s.beneficiaries}</td>
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
                <div key={p.role} className={`bpl-card p-5 border ${style.ring} bg-surface/50 space-y-2 hover:-translate-y-0.5 transition`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-display font-bold text-sm ${style.text}`}>{p.role}</h3>
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shrink-0 ${style.chip} ${style.text}`}>
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
              <div key={p.title} className="bpl-card p-5 border border-border/80 bg-surface/50 space-y-2 hover:border-primary/50 transition">
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
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Want the full operating model?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Season plans, city expansion assumptions and the detailed cost base are available to
                production houses, sponsors and investors on request.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/partners" className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white hover:scale-105 transition">
                <Building2 size={14} /> Partner With Us
              </Link>
              <Link to="/league" className="px-4 py-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-semibold text-white hover:bg-secondary transition">
                How The League Works
              </Link>
            </div>
          </div>

          {/* Basis of preparation */}
          <p className="mt-8 text-[11px] text-muted-foreground/80 leading-relaxed max-w-4xl">
            <span className="font-semibold text-muted-foreground">Basis of preparation:</span>{" "}
            these are illustrative projections for a demonstration scenario, not audited results, a
            track record, or a guarantee of future performance. They assume a{" "}
            {inr(ASSUMPTIONS.ticketPrice)} ticket into a {ASSUMPTIONS.attendance}-capacity room,{" "}
            {ASSUMPTIONS.showsPerBandPerSeason} fixtures per band per season and{" "}
            {ASSUMPTIONS.bandsPerSeason} franchises, with catalogue, licensing and broadcast figures
            modelled rather than contracted. The calculator changes only ticket price, attendance and
            show volume — the {SHOW_BASELINE.platformCommissionPct}% ticketing commission and the{" "}
            {EVENT_SPLIT.bands}/{EVENT_SPLIT.productionHouse}/{EVENT_SPLIT.operator} split are held
            constant, and contracted event managers are paid from the operator&apos;s share rather
            than taking a fourth cut. Anyone evaluating an investment should work from the full
            operating model and its underlying contracts.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
