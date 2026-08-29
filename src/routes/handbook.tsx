/**
 * The complete operating model on one page.
 *
 * This is the reference document: format, money, rights, governance, funding
 * and the questions still open. Everything is pulled from the shared data
 * modules rather than retyped, so the handbook cannot drift away from what the
 * League and Economics pages publish — edit a constant and it moves here too.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import {
  BookOpen,
  Trophy,
  Ticket,
  Music,
  Gavel,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Landmark,
  HelpCircle,
  Users,
  Calendar,
  Disc3,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  SCORING_METRICS,
  POINTS_PER_FIXTURE,
  VICTORY_BONUS,
  MAX_POINTS_PER_FIXTURE,
  GATE_POINT_SCALE,
  TIE_BREAKERS,
  STAGE_2_MATRIX,
  STAGE_2_STRUCTURE,
  STAGE_2_FINALS,
  STAGE_2_SEASON_FIXTURES,
  NATIONAL_TOTAL_BANDS,
  NATIONAL_TOTAL_HOUSES,
  ZONE_HUBS,
  KNOCKOUT_ROUTE,
  SEASON_PHASES,
  SEASON_WEEKS,
  COMPETITIVE_WEEKS,
  RELEASE_CYCLE,
  RELEASE_CYCLE_DAYS,
  RELEASE_ELIGIBILITY,
} from "@/data/league-format";
import { inr, inrCompact, EVENT_SPLIT, CONTENT_SPLIT } from "@/data/economics";
import {
  REVENUE_MODULES,
  AUCTION,
  GUARANTEE_BRACKETS,
  SPEND_CAPS,
  CENTRAL_POOLS,
  PRIZE_SPLIT,
  EVENT_BUDGET_TIERS,
  APPROVAL_RULES,
  ROSTER_NOTES,
  FAIRNESS_RULE,
} from "@/data/regulations";
import {
  RIGHTS_MATRIX,
  SPLIT_SHEET_RULE,
  TERM_RULES,
  CONTINGENCIES,
  FUNDING_OPTIONS,
  FUND_ALLOCATION,
  FUND_TOTAL,
  FOUNDER_COMP,
  OPEN_QUESTIONS,
  STATUS_META,
  BASIS_OF_PREPARATION,
} from "@/data/governance";
import { SPONSOR_INVENTORY, sponsorInventoryValue } from "@/data/event-model";

export const Route = createFileRoute("/handbook")({
  head: () => ({
    meta: [
      { title: "League Handbook — Kalakshetra" },
      {
        name: "description",
        content:
          "The complete Kalakshetra operating model in one reference: competition format, the two commercial modules, the artist draft, spending caps, rights and governance, and the questions still open.",
      },
    ],
  }),
  component: HandbookPage,
});

const SECTIONS = [
  { id: "modules", label: "Two Modules", icon: Scale },
  { id: "format", label: "Format", icon: Trophy },
  { id: "scoring", label: "Scoring", icon: Ticket },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "music", label: "Original Music", icon: Disc3 },
  { id: "draft", label: "Artist Draft", icon: Gavel },
  { id: "caps", label: "Caps & Pools", icon: Landmark },
  { id: "roster", label: "Roster", icon: Users },
  { id: "rights", label: "Rights & IP", icon: ShieldCheck },
  { id: "governance", label: "Governance", icon: AlertTriangle },
  { id: "funding", label: "Venture & Funding", icon: Landmark },
  { id: "open", label: "Still Open", icon: HelpCircle },
];

function H({
  id,
  eyebrow,
  title,
  sub,
  icon,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div id={id} className="space-y-2 mb-6 scroll-mt-24">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
        {icon}
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{sub}</p>}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bpl-card p-5 border border-border bg-surface/40 space-y-3 ${className}`}>
      {children}
    </div>
  );
}

function KV({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-2 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[11px] text-white font-semibold">{k}</p>
        {note && <p className="text-[10px] text-muted-foreground leading-snug">{note}</p>}
      </div>
      <span className="text-xs font-bold text-primary-glow tabular-nums shrink-0">{v}</span>
    </div>
  );
}

function HandbookPage() {
  const [openQ, setOpenQ] = useState<string | null>(null);
  const rateCard = sponsorInventoryValue();

  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen">
        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.18), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary-glow text-xs font-semibold">
              <BookOpen size={14} />
              <span>Working Reference — Season 1</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
              The League <span className="gradient-text">Handbook</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The whole operating model in one place — format, money, rights, governance and the
              questions still unresolved. Written to be argued with and revised, not admired.
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-2.5 py-1 rounded-full border border-border bg-secondary/40 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-primary/50 transition"
                >
                  {sec.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 divide-y divide-border">
          {/* ---------------- TWO MODULES ---------------- */}
          <section className="py-14">
            <H
              id="modules"
              eyebrow="Commercial Architecture"
              title="Two modules, and the operator is only in one"
              sub="The single most important distinction in the model. The league runs the stage; it does not own the songs played on it."
              icon={<Scale size={13} />}
            />
            <div className="grid lg:grid-cols-2 gap-5">
              {REVENUE_MODULES.map((mod) => (
                <Card
                  key={mod.id}
                  className={mod.operatorTakes ? "!border-primary/25 !bg-primary/5" : "!border-blue-400/25 !bg-blue-400/5"}
                >
                  <div className="flex items-center gap-2">
                    {mod.operatorTakes ? (
                      <Ticket size={15} className="text-primary-glow" />
                    ) : (
                      <Music size={15} className="text-blue-400" />
                    )}
                    <h3 className="text-sm font-bold text-white">{mod.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.scope}</p>
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
                  <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {mod.operatorNote}
                  </p>
                </Card>
              ))}
            </div>
            <div className="mt-5 bpl-card p-5 border border-border bg-surface/30 flex gap-3">
              <Info size={15} className="text-primary-glow shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-white">Hired, not vested.</span> Composers,
                lyricists, session players, directors, editors and crew are paid a fee from the
                band&apos;s creative allocation. They sit outside the band&apos;s{" "}
                {CONTENT_SPLIT.artists}%. Where a bigger name takes backend participation instead of
                a fee, it is a house-to-creator deal that must be disclosed.
              </p>
            </div>
          </section>

          {/* ---------------- FORMAT ---------------- */}
          <section className="py-14">
            <H
              id="format"
              eyebrow="Competition"
              title={`${NATIONAL_TOTAL_BANDS} bands, ${ZONE_HUBS.length} regional leagues`}
              sub={`${NATIONAL_TOTAL_HOUSES} production houses nationally, and every league is the same shape: ${STAGE_2_MATRIX.houses} houses × ${STAGE_2_MATRIX.bandsPerHouse} bands = ${STAGE_2_MATRIX.totalBands} per zone. Every band anywhere plays the same ${STAGE_2_MATRIX.showsPerBand} fixtures, resolving into ${STAGE_2_MATRIX.totalFixtures} nights per zone — a cross night is one shared stage rather than two shows. Equal rosters mean the national table needs no adjustment.`}
              icon={<Trophy size={13} />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
              {[
                { v: NATIONAL_TOTAL_BANDS, l: "Bands · national" },
                { v: NATIONAL_TOTAL_HOUSES, l: "Houses · national" },
                { v: STAGE_2_MATRIX.showsPerBand, l: "Fixtures / band · AP-TS" },
                { v: STAGE_2_SEASON_FIXTURES, l: "Nights incl. finals · AP-TS" },
              ].map((s) => (
                <div key={s.l} className="border border-border/50 rounded-lg p-4 bg-surface/30 text-center">
                  <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                    {s.v}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-5">
              {STAGE_2_MATRIX.categories.map((cat) => (
                <Card key={cat.category}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      {cat.category}
                    </h4>
                    <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-border/60 bg-surface/50 text-muted-foreground shrink-0">
                      {cat.actsPerFixture === 1 ? "1 act" : `${cat.actsPerFixture} acts`}
                    </span>
                  </div>
                  <div className="flex items-end gap-6">
                    <div>
                      <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                        {cat.showsPerBand}
                      </p>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold">/ band</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-extrabold text-white tabular-nums">
                        {cat.fixtures}
                      </p>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold">nights</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{cat.purpose}</p>
                </Card>
              ))}
            </div>

            <Card>
              <h4 className="text-sm font-bold text-white">Road to the Final</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Top quartile of {STAGE_2_MATRIX.totalBands} is {STAGE_2_FINALS.finalists}, seeded one
                per house. Full round robin of {STAGE_2_FINALS.rivalryFixtures} nights, then knockout.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {KNOCKOUT_ROUTE.map((k) => (
                  <div key={k.stage} className="border border-border/50 rounded-lg p-3 bg-surface/30">
                    <p className="text-[11px] font-bold text-white">{k.stage}</p>
                    <p className="text-[9px] font-mono font-bold text-primary-glow uppercase tracking-wider mt-0.5">
                      {k.seeds}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-1.5">{k.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                Running alongside it, the <span className="text-primary-glow font-semibold">House Cup</span>{" "}
                goes to the house whose {STAGE_2_MATRIX.bandsPerHouse} bands score most between them —
                so a franchise cannot win by backing one act and abandoning three.
              </p>
            </Card>
          </section>

          {/* ---------------- SCORING ---------------- */}
          <section className="py-14">
            <H
              id="scoring"
              eyebrow="Scoring"
              title={`${MAX_POINTS_PER_FIXTURE} points a fixture, all of them public`}
              sub={`${POINTS_PER_FIXTURE} scored on the night plus a ${VICTORY_BONUS}-point victory bonus for the top scorer. Nothing subjective happens off-camera.`}
              icon={<Ticket size={13} />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
              {SCORING_METRICS.map((mt) => (
                <Card key={mt.metric}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
                      {mt.metric}
                    </h4>
                    <span className="text-xl font-display font-extrabold text-primary-glow tabular-nums shrink-0">
                      {mt.maxPoints}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{mt.basis}</p>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Gate Scale</h4>
                <div className="space-y-1.5">
                  {GATE_POINT_SCALE.map((b) => (
                    <KV key={b.label} k={b.label} v={`${b.points} pts`} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Share of capacity filled, from scanned entries — not tickets sold.
                </p>
              </Card>
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Tie-Breakers</h4>
                <div className="space-y-2">
                  {TIE_BREAKERS.map((tb, i) => (
                    <div key={tb} className="flex gap-2.5">
                      <span className="h-5 w-5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-snug">{tb}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="!border-amber-500/25 !bg-amber-500/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldCheck size={13} className="text-amber-400" /> The Fairness Rule
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{FAIRNESS_RULE}</p>
              </Card>
            </div>
          </section>

          {/* ---------------- CALENDAR ---------------- */}
          <section className="py-14">
            <H
              id="calendar"
              eyebrow="Season Calendar"
              title={`${SEASON_WEEKS} weeks, ${COMPETITIVE_WEEKS} of them competitive`}
              sub="The first three weeks are onboarding and pre-production, because a band that has not rehearsed or written anything has nothing to compete with."
              icon={<Calendar size={13} />}
            />
            <div className="mb-5 hidden sm:flex h-3 w-full rounded-full overflow-hidden border border-border/50">
              {SEASON_PHASES.map((ph, i) => (
                <div
                  key={ph.phase}
                  title={`${ph.title} — ${ph.weeks}`}
                  style={{ width: `${(ph.weekCount / SEASON_WEEKS) * 100}%` }}
                  className={["bg-slate-600", "bg-primary", "bg-cyan-500", "bg-purple-500", "bg-amber-500"][i % 5]}
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {SEASON_PHASES.map((ph) => (
                <Card key={ph.phase}>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {ph.phase} · {ph.weeks}
                  </span>
                  <h4 className="text-xs font-bold text-white">{ph.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ph.detail}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ---------------- ORIGINAL MUSIC ---------------- */}
          <section className="py-14">
            <H
              id="music"
              eyebrow="Original IP"
              title={`The ${RELEASE_CYCLE_DAYS}-day production cycle`}
              sub={`Producing a release takes roughly ${RELEASE_CYCLE_DAYS} days end to end. Each band ships one league-eligible original inside the season, on its own week in the zone rotation, with the December pre-season and July artist season either side. Nationally that paces at one release per zone per week.`}
              icon={<Disc3 size={13} />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-5">
              {RELEASE_CYCLE.map((st, i) => (
                <Card key={st.title}>
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      {st.weeks}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{st.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{st.detail}</p>
                </Card>
              ))}
            </div>
            <Card className="!border-cyan-500/25">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                What counts as a league-eligible original
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {RELEASE_ELIGIBILITY.map((r) => (
                  <div key={r} className="flex gap-2 items-start">
                    <ShieldCheck size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-snug">{r}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                Every band gets the same number of eligible release slots. A house cannot outspend
                the field into extra Original IP points by shipping twenty tracks.
              </p>
            </Card>
          </section>

          {/* ---------------- DRAFT ---------------- */}
          <section className="py-14">
            <H
              id="draft"
              eyebrow="Artist Draft"
              title={`A ${inrCompact(AUCTION.purse)} purse, ${AUCTION.bandsRequired} bands, sealed bids`}
              sub={`Floor of ${inr(AUCTION.minBid)} stops token bids; a ${inr(AUCTION.maxBid)} ceiling on any single band forces a portfolio. Unused purse expires — it never becomes cash, or houses would simply underbid.`}
              icon={<Gavel size={13} />}
            />
            <div className="grid gap-4 md:grid-cols-2 mb-5">
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Draft Rules</h4>
                <div className="space-y-1.5">
                  <KV k="Acquisition purse" v={inr(AUCTION.purse)} note="Per house, per season" />
                  <KV k="Bands required" v={`Exactly ${AUCTION.bandsRequired}`} />
                  <KV k="Minimum bid" v={inr(AUCTION.minBid)} />
                  <KV k="Maximum single bid" v={inr(AUCTION.maxBid)} note="Forces diversification" />
                  <KV k="Bidding" v="Sealed" note="Highest valid bid wins, deducted immediately" />
                </div>
              </Card>
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Guarantee Brackets
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The only thing an acquisition price is allowed to change. Everything else about a
                  band&apos;s league opportunity is identical.
                </p>
                <div className="space-y-1.5">
                  {GUARANTEE_BRACKETS.map((b) => (
                    <KV
                      key={b.label}
                      k={b.label}
                      note={`${inr(b.min)} – ${inr(b.max)}`}
                      v={inr(b.guarantee)}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  A floor, not a ceiling — live, catalogue and prize income all sit on top.
                </p>
              </Card>
            </div>
            <div className="bpl-card p-5 border border-primary/25 bg-primary/5 flex gap-3">
              <Gavel size={15} className="text-primary-glow shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-white">What the fee actually buys:</span> the
                right to represent the artist in the league for the term, develop them, participate
                in their commercial ecosystem and hold the IP the house financed. It does not buy the
                person, their future career, or their pre-existing catalogue. The{" "}
                <Link to="/economics" className="text-primary-glow font-semibold hover:underline">
                  economics page
                </Link>{" "}
                has a live purse builder that validates a roster against every rule above.
              </p>
            </div>
          </section>

          {/* ---------------- CAPS ---------------- */}
          <section className="py-14">
            <H
              id="caps"
              eyebrow="Financial Regulation"
              title="Spending caps and central pools"
              sub="The creative allocation is a per-band entitlement, not a house pot — a pot would let a franchise starve three bands to gold-plate one, and the fairness argument would collapse."
              icon={<Landmark size={13} />}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">House Caps</h4>
                <div className="space-y-2.5">
                  {SPEND_CAPS.map((c) => (
                    <div key={c.id} className="border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-bold text-white">{c.label}</span>
                        <span className="text-[11px] font-bold text-primary-glow tabular-nums shrink-0">
                          {inr(c.amount)}{" "}
                          <span className="text-[9px] uppercase text-muted-foreground">{c.basis}</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{c.rule}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Central Pools
                </h4>
                <div className="space-y-2.5">
                  {CENTRAL_POOLS.map((c) => (
                    <div key={c.id} className="border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-bold text-white">{c.label}</span>
                        <span className="text-[11px] font-bold text-primary-glow tabular-nums shrink-0">
                          {inr(c.amount)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{c.rule}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                  Prize money splits {PRIZE_SPLIT.band}% band / {PRIZE_SPLIT.productionHouse}% house.
                </p>
              </Card>
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Event Budget Ceilings
                </h4>
                <div className="space-y-1.5">
                  {EVENT_BUDGET_TIERS.map((t) => (
                    <KV key={t.tier} k={t.tier} v={inr(t.cap)} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Ceilings, not targets. A café that already has a PA and lighting costs a fraction
                  of its cap.
                </p>
              </Card>
            </div>

            <div className="mt-5">
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  When the league has to be told
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The operator checks compliance, never taste. It has no opinion on whether a
                  director is any good.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {APPROVAL_RULES.map((r) => (
                    <div key={r.level} className={`rounded-lg border p-3 space-y-1.5 ${r.accent}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold">{r.level}</span>
                        <span className="text-xs font-bold text-white">{r.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{r.trigger}</p>
                      <p className="text-[10px] leading-relaxed font-semibold">{r.requirement}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* ---------------- ROSTER ---------------- */}
          <section className="py-14">
            <H
              id="roster"
              eyebrow="Roster"
              title="Who counts as the band"
              sub="The registered members are the artist participants. Everyone else on a project is a hired professional."
              icon={<Users size={13} />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ROSTER_NOTES.map((r) => (
                <Card key={r.rule}>
                  <h4 className="text-xs font-bold text-white">{r.rule}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{r.detail}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ---------------- RIGHTS ---------------- */}
          <section className="py-14">
            <H
              id="rights"
              eyebrow="Rights & IP"
              title="Who owns what"
              sub="Master is not composition, and league footage is neither. Keeping the three apart is what makes the model survive contact with a lawyer."
              icon={<ShieldCheck size={13} />}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[46rem]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-left">
                    <th className="py-2.5 px-3 font-bold text-primary-glow uppercase tracking-wider text-[10px]">Asset</th>
                    <th className="py-2.5 px-3 font-bold text-primary-glow uppercase tracking-wider text-[10px]">Owner</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Artist position</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Operator position</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {RIGHTS_MATRIX.map((r) => (
                    <tr key={r.asset} className="hover:bg-secondary/10 align-top">
                      <td className="py-2.5 px-3 font-bold text-white">{r.asset}</td>
                      <td className="py-2.5 px-3 font-semibold text-primary-glow">{r.owner}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.artistPosition}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.operatorPosition}</td>
                      <td className="py-2.5 px-3 text-muted-foreground leading-snug">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 bpl-card p-4 border border-border bg-surface/30 flex gap-3">
              <Info size={14} className="text-primary-glow shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{SPLIT_SHEET_RULE}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {TERM_RULES.map((t) => (
                <Card key={t.question}>
                  <p className="text-[11px] font-bold text-white">{t.question}</p>
                  <p className="text-xs font-bold text-primary-glow">{t.answer}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t.detail}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ---------------- GOVERNANCE ---------------- */}
          <section className="py-14">
            <H
              id="governance"
              eyebrow="Governance"
              title="What happens when it goes wrong"
              sub="Every one of these gets asked in the first meeting. Having an answer is most of the difference between a business and an interesting idea."
              icon={<AlertTriangle size={13} />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CONTINGENCIES.map((c) => (
                <Card key={c.scenario}>
                  <h4 className="text-xs font-bold text-white">{c.scenario}</h4>
                  <p className="text-[11px] font-bold text-primary-glow">{c.ruling}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{c.detail}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ---------------- FUNDING ---------------- */}
          <section className="py-14">
            <H
              id="funding"
              eyebrow="Venture & Funding"
              title="How the operator itself is capitalised"
              sub="Separate from league economics entirely. This is about the company that runs the league, not the money moving through it."
              icon={<Landmark size={13} />}
            />

            <div className="bpl-card p-4 border border-amber-500/30 bg-amber-500/5 flex gap-3 mb-5">
              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-100/85 leading-relaxed">
                <span className="font-semibold text-amber-200">Note on naming.</span> Backing
                partners are described by role here, in line with how every partner, sponsor and
                college appears across this site. Publishing a named counterparty next to the equity
                you are prepared to concede would put your negotiating position in front of the
                person you are negotiating with — this page is on the public web.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 mb-5">
              {FUNDING_OPTIONS.map((o) => (
                <Card
                  key={o.id}
                  className={o.recommended ? "!border-emerald-500/30 !bg-emerald-500/5" : ""}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{o.name}</h4>
                    {o.recommended && (
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shrink-0">
                        Preferred
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div>
                      <p className="text-lg font-display font-extrabold text-primary-glow">{o.equity}</p>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold">to partner</p>
                    </div>
                    <div>
                      <p className="text-lg font-display font-extrabold text-white">{o.founderKeeps}</p>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold">founder keeps</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{o.summary}</p>
                  <ul className="space-y-1">
                    {o.partnerGets.map((g) => (
                      <li key={g} className="text-[10px] text-muted-foreground leading-snug flex gap-1.5">
                        <span className="opacity-50">·</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                    <span className="font-semibold text-white">Trade-off:</span> {o.tradeoff}
                  </p>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Use of Funds
                  </h4>
                  <span className="text-sm font-bold text-primary-glow tabular-nums">
                    {inrCompact(FUND_TOTAL)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Illustrative deployment of a backing round.
                </p>
                <div className="space-y-1.5">
                  {FUND_ALLOCATION.map((f) => (
                    <KV key={f.line} k={f.line} v={inr(f.amount)} note={f.note} />
                  ))}
                </div>
              </Card>
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Founder Compensation
                </h4>
                <div className="space-y-1.5">
                  <KV
                    k="Salary"
                    v={`${inr(FOUNDER_COMP.monthlySalaryLow)}–${inr(FOUNDER_COMP.monthlySalaryHigh)}`}
                    note="Per month, first funded year"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {FOUNDER_COMP.principle}
                </p>
                <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3">
                  <p className="text-[10px] text-rose-100/85 leading-relaxed">
                    <span className="font-semibold text-rose-200">Do not blend these.</span>{" "}
                    {FOUNDER_COMP.warning}
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Card>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Sponsorship Rate Card
                  </h4>
                  <span className="text-sm font-bold text-primary-glow tabular-nums">
                    {inrCompact(rateCard)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Finite inventory, sold out at indicative rates. A title partner and forty fixture
                  partners are different products bought by different budget holders.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                  {SPONSOR_INVENTORY.map((sl) => (
                    <KV
                      key={sl.role}
                      k={sl.role}
                      v={inr(sl.rate)}
                      note={`${sl.slots} slot${sl.slots === 1 ? "" : "s"}`}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* ---------------- OPEN QUESTIONS ---------------- */}
          <section className="py-14">
            <H
              id="open"
              eyebrow="Unresolved"
              title="What still has to be decided"
              sub="Publishing the open questions is not a weakness. Anyone serious asks them inside ten minutes, and a list says they were thought about rather than missed."
              icon={<HelpCircle size={13} />}
            />
            <div className="space-y-2">
              {OPEN_QUESTIONS.map((q) => {
                const meta = STATUS_META[q.status];
                const isOpen = openQ === q.question;
                return (
                  <div
                    key={q.question}
                    className="border border-border rounded-lg bg-surface/30 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenQ(isOpen ? null : q.question)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/20 transition cursor-pointer"
                    >
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shrink-0 ${meta.accent}`}
                      >
                        {meta.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                          {q.area}
                        </p>
                        <p className="text-xs font-semibold text-white leading-snug">{q.question}</p>
                      </div>
                      <ArrowRight
                        size={13}
                        className={`text-muted-foreground shrink-0 transition ${isOpen ? "rotate-90" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed px-4 pb-4 border-t border-border/40 pt-3">
                        {q.position}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------------- BASIS ---------------- */}
          <section className="py-14">
            <div className="bpl-card p-6 border border-border bg-surface/30 flex gap-3">
              <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Basis of preparation</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {BASIS_OF_PREPARATION}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Live splits used throughout: {EVENT_SPLIT.bands}/{EVENT_SPLIT.productionHouse}/
                  {EVENT_SPLIT.operator} on net gate, {CONTENT_SPLIT.artists}/
                  {CONTENT_SPLIT.productionHouse} on music. The{" "}
                  <Link to="/economics" className="text-primary-glow font-semibold hover:underline">
                    economics page
                  </Link>{" "}
                  models all of it interactively; the{" "}
                  <Link to="/league" className="text-primary-glow font-semibold hover:underline">
                    league page
                  </Link>{" "}
                  publishes the competition format.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
