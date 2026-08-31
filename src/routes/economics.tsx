import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import {
  Ticket, Users, Building2, PieChart, Sparkles, Music, Radio,
  Trophy, Wallet, Gavel, Landmark, CheckCircle2, AlertTriangle, Coins,
} from "lucide-react";
import { inr, inrCompact, SPLITS } from "@/data/economics";
import {
  ROSTER, ARTISTS_PER_BAND, ARTIST_SHARE_PCT,
  LIVE_ROWS, LIVE_PER_BAND, LIVE_SEASON_TOTAL, LIVE_APPEARANCES_PER_BAND,
  CONTENT_ROWS, CONTENT_PER_BAND, CONTENT_SEASON_TOTAL, CONTENT_SHARE_PER_BAND,
  BROADCAST, SPONSORSHIP, MEMBERSHIP_ROW, ACQUISITION,
  SPONSOR_CARD, SPONSOR_CARD_VALUE,
  DISTRIBUTION, DISTRIBUTION_TOTALS,
  CELEBRITY_ECONOMICS, CELEBRITY_BUDGET, CELEBRITY_BUDGET_TOTALS,
  CELEBRITY_SHOWS, CELEBRITY_SHOWS_PER_HOUSE,
  CELEBRITY_REVENUE_MIX, CELEBRITY_MIX_TOTAL, CELEBRITY_MIX_HEADROOM,
  CELEBRITY_MIX_HEADROOM_SEASON,
  BAND_INCOME, BAND_INCOME_TOTAL, ARTIST_INCOME_EACH,
  HOUSE_INFLOWS, HOUSE_OUTFLOWS, HOUSE_PL,
  CREATIVE_BREAKDOWN, CREATIVE_BREAKDOWN_TOTAL, SONGS_PER_ROSTER,
  OPERATOR_COSTS, OPERATOR_COSTS_TOTAL, OPERATOR_MANDATE,
  OPERATOR_INFLOWS, OPERATOR_OUTFLOWS, OPERATOR_PL,
  WINNER_PRIZE, BIG_PICTURE, RECONCILIATION, RECONCILES,
} from "@/data/season1";

export const Route = createFileRoute("/economics")({
  head: () => ({
    meta: [
      { title: "Economics — Kalakshetra" },
      {
        name: "description",
        content:
          "Season 1 economics: one production house, four bands and Svara Tribe as league operator. What the season earns, how it divides, and what each party is left holding.",
      },
      { property: "og:title", content: "Economics — Kalakshetra" },
      {
        property: "og:description",
        content:
          "The Season 1 projection in full — live events, catalogue, broadcast, sponsorship and the celebrity night, split three ways.",
      },
    ],
  }),
  component: EconomicsPage,
});

/* ------------------------------------------------------------------ *
 * Building blocks
 * ------------------------------------------------------------------ */

const SECTIONS = [
  { id: "splits", label: "The splits" },
  { id: "live", label: "Live season" },
  { id: "content", label: "Content" },
  { id: "league", label: "League deals" },
  { id: "celebrity", label: "Celebrity night" },
  { id: "distribution", label: "Distribution" },
  { id: "band", label: "The band" },
  { id: "house", label: "Production house" },
  { id: "operator", label: "Svara Tribe" },
  { id: "picture", label: "Side by side" },
];

function Stat({
  icon,
  value,
  label,
  hint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="bpl-card p-4 border border-border/80 bg-surface/60 space-y-1">
      <div className="flex items-center gap-1.5 text-primary-glow">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <p className="text-2xl font-display font-extrabold text-white tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

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

/** Tables are wide by nature — each one scrolls inside itself, never the page. */
function Scroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full min-w-[560px] text-left border-collapse">{children}</table>
    </div>
  );
}

const th =
  "text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-2 border-b border-border/60";
const td = "py-2 border-b border-border/25 text-xs text-white";
const tdNum = `${td} text-right tabular-nums font-semibold`;

function Line({ label, amount, detail, negative = false }: {
  label: string;
  amount: number;
  detail?: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-2 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[11px] text-white font-semibold">{label}</p>
        {detail && <p className="text-[10px] text-muted-foreground leading-snug">{detail}</p>}
      </div>
      <span
        className={`text-xs font-bold tabular-nums shrink-0 ${
          negative ? "text-rose-300" : "text-primary-glow"
        }`}
      >
        {negative ? "−" : ""}
        {inr(amount)}
      </span>
    </div>
  );
}

function Total({ label, amount, tone = "gold" }: {
  label: string;
  amount: number;
  tone?: "gold" | "green" | "rose";
}) {
  const colour =
    tone === "green" ? "text-emerald-300" : tone === "rose" ? "text-rose-300" : "text-primary-glow";
  return (
    <div className="flex items-baseline justify-between gap-3 pt-3 mt-1 border-t border-border">
      <p className="text-[11px] uppercase tracking-wider font-bold text-white">{label}</p>
      <span className={`text-lg font-display font-extrabold tabular-nums ${colour}`}>
        {inr(amount)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

function EconomicsPage() {
  const splitRows = [
    { name: "Live events", key: "live" as const, note: "Every ticketed and sponsored night the league stages." },
    { name: "Content", key: "content" as const, note: "Recordings and video. The operator takes nothing." },
    { name: "Broadcast", key: "broadcast" as const, note: "The OTT deal on season footage and originals." },
    { name: "Sponsorship", key: "sponsorship" as const, note: "The season card — title through fixture partners." },
    { name: "Membership", key: "membership" as const, note: "Fan passes. The operator's alone." },
    { name: "Celebrity night", key: "celebrity" as const, note: "Co-funded. The band carries none of the risk." },
    { name: "Acquisition", key: "acquisition" as const, note: "The signing fee, less the league's cut for running it." },
  ];

  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen">
        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--gradient-glow)" }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary-glow text-xs font-semibold">
              <PieChart size={14} />
              <span>
                Season 1 — {ROSTER.bands} bands · {ROSTER.houses} production houses · 1 operator
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Where every rupee <span className="gradient-text">goes</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              One season, priced at the rates the operating plan actually commits to. Not a
              calculator — there is nothing here to drag. Every figure below is derived from the
              base rates, so the totals cannot drift away from the lines that produce them.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto pt-4 text-left">
              <Stat
                icon={<Coins size={13} />}
                label="Season pool"
                value={inrCompact(DISTRIBUTION_TOTALS.pool)}
                hint="Everything the season earns before the celebrity night"
              />
              <Stat
                icon={<Users size={13} />}
                label="Per band"
                value={inrCompact(BAND_INCOME_TOTAL)}
                hint={`One of ${ROSTER.bands} — ${inr(ARTIST_INCOME_EACH)} to each of ${ARTISTS_PER_BAND} artists`}
              />
              <Stat
                icon={<Building2 size={13} />}
                label="House net"
                value={inrCompact(HOUSE_PL.net)}
                hint={`One of ${ROSTER.houses} — after ${inrCompact(HOUSE_PL.outflow)} committed`}
              />
              <Stat
                icon={<Landmark size={13} />}
                label="Operator surplus"
                value={inrCompact(OPERATOR_PL.surplus)}
                hint={`Before ${inrCompact(WINNER_PRIZE.total)} of prize money`}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-2.5 py-1 rounded-full border border-border bg-secondary/40 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-primary/50 transition"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 space-y-20">
          {/* ---------------- SPLITS ---------------- */}
          <section>
            <H
              id="splits"
              eyebrow="The rules"
              title="Seven splits, and they are different on purpose"
              sub="A live gate, a catalogue, a broadcast deal, a sponsorship card, a membership pass, a co-funded stadium show and a signing fee are not the same kind of money. Quoting one ratio at all of them is how a model stops meaning anything."
              icon={<PieChart size={13} />}
            />
            <Card>
              <Scroller>
                <thead>
                  <tr>
                    <th className={th}>Revenue</th>
                    <th className={`${th} text-right`}>Band</th>
                    <th className={`${th} text-right`}>Production house</th>
                    <th className={`${th} text-right`}>Svara Tribe</th>
                  </tr>
                </thead>
                <tbody>
                  {splitRows.map((r) => {
                    const s = SPLITS[r.key];
                    const cell = (v: number) => (v === 0 ? "—" : `${v}%`);
                    return (
                      <tr key={r.key}>
                        <td className={td}>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-[10px] text-muted-foreground">{r.note}</p>
                        </td>
                        <td className={tdNum}>{cell(s.artist)}</td>
                        <td className={tdNum}>{cell(s.productionHouse)}</td>
                        <td className={tdNum}>{cell(s.operator)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Scroller>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                A band is {ARTISTS_PER_BAND} artists, and the band's share divides evenly between
                them — {ARTIST_SHARE_PCT}% each — unless the group signed a different sheet before
                the draft.
              </p>
            </Card>
          </section>

          {/* ---------------- LIVE ---------------- */}
          <section>
            <H
              id="live"
              eyebrow="Module one"
              title={`${LIVE_APPEARANCES_PER_BAND} nights a band, priced night by night`}
              sub="The commercial night is the base every other format is quoted against: 250 tickets at ₹199. A cross night draws 1.5× that because two fanbases are in one room; a house night doubles it. Campus and festival nights carry no gate at all — they are bought by a college and a broadcaster."
              icon={<Ticket size={13} />}
            />
            <Card>
              <Scroller>
                <thead>
                  <tr>
                    <th className={th}>Format</th>
                    <th className={`${th} text-right`}>Per band</th>
                    <th className={`${th} text-right`}>Per night</th>
                    <th className={`${th} text-right`}>One band's season</th>
                    <th className={`${th} text-right`}>All {ROSTER.bands} bands</th>
                  </tr>
                </thead>
                <tbody>
                  {LIVE_ROWS.map((r) => (
                    <tr key={r.id}>
                      <td className={td}>
                        <p className="font-semibold">{r.label}</p>
                        <p className="text-[10px] text-muted-foreground">{r.basis}</p>
                      </td>
                      <td className={tdNum}>{r.perBand}</td>
                      <td className={tdNum}>
                        {r.valuePerAppearance === 0 ? "Free" : inr(r.valuePerAppearance)}
                      </td>
                      <td className={tdNum}>{inr(r.perBandTotal)}</td>
                      <td className={tdNum}>{inr(r.seasonTotal)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={`${td} font-bold`}>Total</td>
                    <td className={`${tdNum} text-primary-glow`}>{LIVE_APPEARANCES_PER_BAND}</td>
                    <td className={tdNum}>—</td>
                    <td className={`${tdNum} text-primary-glow`}>{inr(LIVE_PER_BAND)}</td>
                    <td className={`${tdNum} text-primary-glow`}>{inr(LIVE_SEASON_TOTAL)}</td>
                  </tr>
                </tbody>
              </Scroller>
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                {(["artist", "productionHouse", "operator"] as const).map((k, i) => (
                  <div key={k} className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      {["Bands 40%", "Production house 30%", "Svara Tribe 30%"][i]}
                    </p>
                    <p className="text-lg font-display font-extrabold text-white tabular-nums">
                      {inr(DISTRIBUTION[0].share[k])}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* ---------------- CONTENT ---------------- */}
          <section>
            <H
              id="content"
              eyebrow="Module two"
              title="The catalogue, split down the middle"
              sub="Recordings and video are the half of the business that keeps earning after the season ends. The house financed them and the band made them, so they divide 50/50 — and the operator takes none of it. Figures are per band, per year."
              icon={<Music size={13} />}
            />
            <Card>
              <Scroller>
                <thead>
                  <tr>
                    <th className={th}>Source</th>
                    <th className={`${th} text-right`}>Annual</th>
                    <th className={`${th} text-right`}>Band 50%</th>
                    <th className={`${th} text-right`}>House 50%</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTENT_ROWS.map((r) => (
                    <tr key={r.id}>
                      <td className={td}>
                        <p className="font-semibold">{r.label}</p>
                        <p className="text-[10px] text-muted-foreground">{r.detail}</p>
                      </td>
                      <td className={tdNum}>{inr(r.amount)}</td>
                      <td className={tdNum}>{inr(Math.round(r.amount / 2))}</td>
                      <td className={tdNum}>{inr(r.amount - Math.round(r.amount / 2))}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={`${td} font-bold`}>Per band</td>
                    <td className={`${tdNum} text-primary-glow`}>{inr(CONTENT_PER_BAND)}</td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inr(CONTENT_SHARE_PER_BAND.artist)}
                    </td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inr(CONTENT_SHARE_PER_BAND.productionHouse)}
                    </td>
                  </tr>
                </tbody>
              </Scroller>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                A house earns its half on every band it manages, so across{" "}
                {ROSTER.bandsPerHouse} bands the catalogue is worth{" "}
                {inr(CONTENT_SHARE_PER_BAND.productionHouse * ROSTER.bandsPerHouse)} to one house —
                against {inr(CONTENT_SEASON_TOTAL)} of catalogue income across all{" "}
                {ROSTER.bands} bands in the season.
              </p>
            </Card>
          </section>

          {/* ---------------- LEAGUE DEALS ---------------- */}
          <section>
            <H
              id="league"
              eyebrow="Central"
              title="Broadcast, sponsorship and membership"
              sub="Three deals the operator signs on behalf of the whole league. Broadcast and sponsorship reach the bands and the houses; the membership pass does not, because nobody but the operator sells it."
              icon={<Radio size={13} />}
            />
            <div className="grid lg:grid-cols-3 gap-4">
              {[BROADCAST, SPONSORSHIP, MEMBERSHIP_ROW].map((row) => (
                <Card key={row.id}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                      {row.label}
                    </p>
                    <p className="text-2xl font-display font-extrabold text-white tabular-nums">
                      {inrCompact(row.total)}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{row.detail}</p>
                  </div>
                  <div className="space-y-2 pt-1">
                    <Line
                      label={`Bands — ${SPLITS[row.split].artist}%`}
                      amount={row.share.artist}
                      detail={
                        row.share.artist > 0
                          ? `${inr(Math.round(row.share.artist / ROSTER.bands))} per band`
                          : "Not a band line"
                      }
                    />
                    <Line
                      label={`Production house — ${SPLITS[row.split].productionHouse}%`}
                      amount={row.share.productionHouse}
                    />
                    <Line
                      label={`Svara Tribe — ${SPLITS[row.split].operator}%`}
                      amount={row.share.operator}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                    The season rate card
                  </p>
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    Sponsorship is finite inventory, not an open-ended ask. Sold out at indicative
                    rates the card is worth {inrCompact(SPONSOR_CARD_VALUE)} — but a title partner
                    and forty fixture partners are different products, bought by different people
                    out of different budgets. That is six sales jobs, not one.
                  </p>
                </div>
              </div>
              <Scroller>
                <thead>
                  <tr>
                    <th className={th}>Role</th>
                    <th className={`${th} text-right`}>Slots</th>
                    <th className={`${th} text-right`}>Rate</th>
                    <th className={`${th} text-right`}>Card value</th>
                  </tr>
                </thead>
                <tbody>
                  {SPONSOR_CARD.map((s) => (
                    <tr key={s.role}>
                      <td className={`${td} font-semibold`}>{s.role}</td>
                      <td className={tdNum}>{s.slots}</td>
                      <td className={tdNum}>{inr(s.rate)}</td>
                      <td className={tdNum}>{inrCompact(s.slots * s.rate)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={`${td} font-bold`}>Sold out</td>
                    <td className={tdNum}>
                      {SPONSOR_CARD.reduce((s, r) => s + r.slots, 0)}
                    </td>
                    <td className={tdNum}>—</td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inrCompact(SPONSOR_CARD_VALUE)}
                    </td>
                  </tr>
                </tbody>
              </Scroller>
            </Card>
          </section>

          {/* ---------------- CELEBRITY ---------------- */}
          <section>
            <H
              id="celebrity"
              eyebrow="The marquee nights"
              title={`${CELEBRITY_SHOWS} nights, co-funded, and their own business`}
              sub="Every band headlines one. The celebrity night does not divide like anything else in the league: the band's house and the operator each put up half the build and each take half of what it clears, while the band is on the bill and paid for the season it is having rather than carrying crores of event risk."
              icon={<Sparkles size={13} />}
            />
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  Where the money comes from
                </p>
                <div className="space-y-2">
                  {CELEBRITY_REVENUE_MIX.map((l) => (
                    <Line key={l.label} label={l.label} amount={l.amount} />
                  ))}
                </div>
                <Total label="Itemised mix, one night" amount={CELEBRITY_MIX_TOTAL} />
                <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-300" />
                  <span>
                    Each night is modelled at {inrCompact(CELEBRITY_ECONOMICS.perShow.revenue)},
                    which is {inrCompact(CELEBRITY_MIX_HEADROOM)} above what the lines above add up
                    to. Across {CELEBRITY_SHOWS} nights that gap is{" "}
                    {inrCompact(CELEBRITY_MIX_HEADROOM_SEASON)}. It is stated here rather than
                    buried, because the{" "}
                    {inrCompact(CELEBRITY_ECONOMICS.perShow.profitShare)} of profit each side takes
                    from a night depends on closing it.
                  </span>
                </p>
              </Card>

              <div className="space-y-4">
                <Card>
                  <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                    The build — a Thaman-level headliner
                  </p>
                  <Scroller>
                    <thead>
                      <tr>
                        <th className={th}>Component</th>
                        <th className={`${th} text-right`}>Low</th>
                        <th className={`${th} text-right`}>Base</th>
                        <th className={`${th} text-right`}>High</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CELEBRITY_BUDGET.map((l) => (
                        <tr key={l.component}>
                          <td className={td}>{l.component}</td>
                          <td className={tdNum}>{inrCompact(l.conservative)}</td>
                          <td className={tdNum}>{inrCompact(l.base)}</td>
                          <td className={tdNum}>{inrCompact(l.high)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className={`${td} font-bold`}>Total</td>
                        <td className={tdNum}>
                          {inrCompact(CELEBRITY_BUDGET_TOTALS.conservative)}
                        </td>
                        <td className={`${tdNum} text-primary-glow`}>
                          {inrCompact(CELEBRITY_BUDGET_TOTALS.base)}
                        </td>
                        <td className={tdNum}>{inrCompact(CELEBRITY_BUDGET_TOTALS.high)}</td>
                      </tr>
                    </tbody>
                  </Scroller>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The base case carries the model. The high case costs more than the night is
                    projected to earn, which is the reason the celebrity show is funded separately
                    from the league and never out of the bands' pool.
                  </p>
                </Card>

                <Card>
                  <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                    How one night settles
                  </p>
                  <div className="space-y-2">
                    <Line
                      label="Revenue"
                      amount={CELEBRITY_ECONOMICS.perShow.revenue}
                      detail="Planning case for one show"
                    />
                    <Line
                      label="Build"
                      amount={CELEBRITY_ECONOMICS.perShow.cost}
                      detail="Base case from the budget above"
                      negative
                    />
                  </div>
                  <Total
                    label="Net contribution"
                    amount={CELEBRITY_ECONOMICS.perShow.profit}
                    tone="green"
                  />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { who: "The band's house", shows: CELEBRITY_SHOWS_PER_HOUSE, fund: CELEBRITY_ECONOMICS.capitalPerHouse, rev: CELEBRITY_ECONOMICS.revenuePerHouse, profit: CELEBRITY_ECONOMICS.profitPerHouse },
                      { who: "Svara Tribe", shows: CELEBRITY_SHOWS, fund: CELEBRITY_ECONOMICS.capitalOperator, rev: CELEBRITY_ECONOMICS.revenueOperator, profit: CELEBRITY_ECONOMICS.profitOperator },
                    ].map((p) => (
                      <div key={p.who} className="rounded-lg border border-border/60 bg-secondary/20 p-3 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {p.who}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Across {p.shows} {p.shows === 1 ? "night" : "nights"}
                        </p>
                        <p className="text-[11px] text-white">
                          Puts in <span className="font-bold tabular-nums">{inrCompact(p.fund)}</span>
                        </p>
                        <p className="text-[11px] text-white">
                          Takes back <span className="font-bold tabular-nums">{inrCompact(p.rev)}</span>
                        </p>
                        <p className="text-[11px] text-emerald-300 font-bold tabular-nums">
                          +{inrCompact(p.profit)} profit
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The artists take {inr(CELEBRITY_ECONOMICS.share.artist)} of this profit. They
                    are paid for the appearance and carry none of the downside.
                  </p>
                </Card>

                <Card>
                  <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                    The programme, all {CELEBRITY_SHOWS} nights
                  </p>
                  <div className="space-y-2">
                    <Line
                      label="Revenue"
                      amount={CELEBRITY_ECONOMICS.revenue}
                      detail={`${CELEBRITY_SHOWS} nights × ${inrCompact(CELEBRITY_ECONOMICS.perShow.revenue)}`}
                    />
                    <Line
                      label="Build"
                      amount={CELEBRITY_ECONOMICS.cost}
                      detail={`${CELEBRITY_SHOWS} nights × ${inrCompact(CELEBRITY_ECONOMICS.perShow.cost)}`}
                      negative
                    />
                  </div>
                  <Total label="Programme profit" amount={CELEBRITY_ECONOMICS.profit} tone="green" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-300" />
                    <span>
                      Read the capital, not just the profit. The celebrity programme is roughly ten
                      times the size of the rest of the league put together, and it needs{" "}
                      {inrCompact(CELEBRITY_ECONOMICS.cost)} of build against a season pool of{" "}
                      {inrCompact(DISTRIBUTION_TOTALS.pool)}. The operator alone underwrites{" "}
                      {inrCompact(CELEBRITY_ECONOMICS.capitalOperator)} of that — against a central
                      operating budget of {inrCompact(OPERATOR_COSTS_TOTAL)}. Financing it is a
                      separate question from whether it clears.
                    </span>
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* ---------------- DISTRIBUTION ---------------- */}
          <section>
            <H
              id="distribution"
              eyebrow="The whole season"
              title="One pool, three parties"
              sub="Every league revenue line, and what each party takes from it. The celebrity night is deliberately absent — it is co-funded, so folding it in here would put somebody else's capital into a pool the artists take 40% of."
              icon={<Coins size={13} />}
            />
            <Card>
              <Scroller>
                <thead>
                  <tr>
                    <th className={th}>Revenue</th>
                    <th className={`${th} text-right`}>Season</th>
                    <th className={`${th} text-right`}>Bands</th>
                    <th className={`${th} text-right`}>Production house</th>
                    <th className={`${th} text-right`}>Svara Tribe</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRIBUTION.map((d) => (
                    <tr key={d.category}>
                      <td className={td}>
                        <p className="font-semibold">{d.category}</p>
                        <p className="text-[10px] text-muted-foreground">{d.detail}</p>
                      </td>
                      <td className={tdNum}>{inr(d.total)}</td>
                      <td className={tdNum}>{d.share.artist ? inr(d.share.artist) : "—"}</td>
                      <td className={tdNum}>
                        {d.share.productionHouse ? inr(d.share.productionHouse) : "—"}
                      </td>
                      <td className={tdNum}>{d.share.operator ? inr(d.share.operator) : "—"}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={`${td} font-bold`}>Season pool</td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inr(DISTRIBUTION_TOTALS.pool)}
                    </td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inr(DISTRIBUTION_TOTALS.artist)}
                    </td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inr(DISTRIBUTION_TOTALS.productionHouse)}
                    </td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inr(DISTRIBUTION_TOTALS.operator)}
                    </td>
                  </tr>
                </tbody>
              </Scroller>
            </Card>
          </section>

          {/* ---------------- BAND ---------------- */}
          <section>
            <H
              id="band"
              eyebrow="Party one"
              title="What one band takes home"
              sub={`All ${ROSTER.bands} bands play the same season, so this is one of ${ROSTER.bands} identical positions. The league-level deals reach a band by dividing down: the OTT money is split across every house, then across every band it manages, then across the artists in it. The acquisition payment is the floor — it lands on signing, before a single ticket is sold.`}
              icon={<Users size={13} />}
            />
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <div className="space-y-2">
                  {BAND_INCOME.map((l) => (
                    <Line key={l.label} label={l.label} amount={l.amount} detail={l.detail} />
                  ))}
                </div>
                <Total label="One band, one season" amount={BAND_INCOME_TOTAL} tone="green" />
              </Card>
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  Per artist
                </p>
                <p className="text-3xl font-display font-extrabold text-white tabular-nums">
                  {inr(ARTIST_INCOME_EACH)}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A band is {ARTISTS_PER_BAND} people and the share divides evenly —{" "}
                  {ARTIST_SHARE_PCT}% each — unless the group signed a different split sheet before
                  the draft. Against a season in which the band pays for none of its own recording,
                  video, marketing or travel: all of that sits on the house.
                </p>
                <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Guaranteed on signing
                  </p>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">
                    {inr(Math.round(ACQUISITION.share.artist / ROSTER.bands))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {SPLITS.acquisition.artist}% of its house's {inrCompact(ACQUISITION.amount)}{" "}
                    purse, before the season starts
                  </p>
                </div>
              </Card>
            </div>
          </section>

          {/* ---------------- PRODUCTION HOUSE ---------------- */}
          <section>
            <H
              id="house"
              eyebrow="Party two"
              title="One production house, of five"
              sub={`Signs ${ROSTER.bandsPerHouse} bands, finances everything they make, funds half the build on the ${CELEBRITY_SHOWS_PER_HOUSE} celebrity nights its own bands headline, and carries the only real capital risk in the model. Every figure below is for one house — the league-level pools divided ${ROSTER.houses} ways.`}
              icon={<Building2 size={13} />}
            />
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  What comes in
                </p>
                <div className="space-y-2">
                  {HOUSE_INFLOWS.map((l) => (
                    <Line key={l.label} label={l.label} amount={l.amount} detail={l.detail} />
                  ))}
                </div>
                <Total label="Total inflow" amount={HOUSE_PL.inflow} />
              </Card>
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  What it commits
                </p>
                <div className="space-y-2">
                  {HOUSE_OUTFLOWS.map((l) => (
                    <Line
                      key={l.label}
                      label={l.label}
                      amount={l.amount}
                      detail={l.detail}
                      negative
                    />
                  ))}
                </div>
                <Total label="Total committed" amount={HOUSE_PL.outflow} tone="rose" />
              </Card>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <Stat
                icon={<Wallet size={13} />}
                label="Net position"
                value={inrCompact(HOUSE_PL.net)}
                hint="Inflow less everything committed"
              />
              <Stat
                icon={<Trophy size={13} />}
                label="Return on cost"
                value={`${HOUSE_PL.returnPct.toFixed(1)}%`}
                hint={`${HOUSE_PL.multiple.toFixed(2)}× back on what it put in`}
              />
              <Stat
                icon={<Gavel size={13} />}
                label="At risk"
                value={inrCompact(HOUSE_PL.outflow)}
                hint="Committed before the season returns a rupee"
              />
            </div>

            <Card className="mt-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  The creative allocation, per song
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
                  A breakdown of one line in the envelope above, not a second budget. The house
                  moves money between these however it likes; unused budget rolls forward to that
                  band's next release and never to a different band. Across the roster that is{" "}
                  {SONGS_PER_ROSTER} songs.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {CREATIVE_BREAKDOWN.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg border border-border/60 bg-secondary/20 p-3 space-y-1"
                  >
                    <p className="text-base font-display font-extrabold text-primary-glow tabular-nums">
                      {inr(c.amount)}
                    </p>
                    <p className="text-[11px] text-white font-semibold">{c.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{c.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sums to {inr(CREATIVE_BREAKDOWN_TOTAL)} per song per band — exactly the regulated
                creative cap, which is the point of showing it.
              </p>
            </Card>
          </section>

          {/* ---------------- OPERATOR ---------------- */}
          <section>
            <H
              id="operator"
              eyebrow="Party three"
              title="Svara Tribe, the league operator"
              sub="Runs the competition. Sets the standard, schedules it, audits it, and owns the league brand. Takes no share of the catalogue at all."
              icon={<Landmark size={13} />}
            />
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  What comes in
                </p>
                <div className="space-y-2">
                  {OPERATOR_INFLOWS.map((l) => (
                    <Line key={l.label} label={l.label} amount={l.amount} detail={l.detail} />
                  ))}
                </div>
                <Total label="Total inflow" amount={OPERATOR_PL.inflow} />
              </Card>
              <div className="space-y-4">
                <Card>
                  <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                    Central cost base
                  </p>
                  <div className="space-y-2">
                    {OPERATOR_COSTS.map((c) => (
                      <Line key={c.label} label={c.label} amount={c.amount} negative />
                    ))}
                  </div>
                  <Total label="Operating cost" amount={OPERATOR_COSTS_TOTAL} tone="rose" />
                </Card>
                <Card>
                  <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                    Plus the night it co-funds
                  </p>
                  <div className="space-y-2">
                    {OPERATOR_OUTFLOWS.map((l) => (
                      <Line
                        key={l.label}
                        label={l.label}
                        amount={l.amount}
                        detail={l.detail}
                        negative
                      />
                    ))}
                  </div>
                  <Total label="Total committed" amount={OPERATOR_PL.outflow} tone="rose" />
                </Card>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  What the operator is paying for
                </p>
                <ul className="space-y-1.5">
                  {OPERATOR_MANDATE.map((m) => (
                    <li key={m} className="flex gap-2 text-[11px] text-white">
                      <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-primary-glow" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <p className="text-[10px] uppercase tracking-wider text-primary-glow font-bold">
                  Surplus, and the prize that comes out of it
                </p>
                <p className="text-3xl font-display font-extrabold text-white tabular-nums">
                  {inr(OPERATOR_PL.surplus)}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A guaranteed floor for the winning band, plus a quarter of whatever the league
                  clears above it. The second half is what makes the prize a stake rather than a
                  cheque — the winner's upside moves with the league's.
                </p>
                <div className="space-y-2 pt-1">
                  <Line
                    label="Guaranteed to the winner"
                    amount={WINNER_PRIZE.guaranteed}
                    detail="Committed regardless of how the season trades"
                  />
                  <Line
                    label={`${WINNER_PRIZE.profitSharePct}% of post-cost profit`}
                    amount={WINNER_PRIZE.bonus}
                    detail={`${WINNER_PRIZE.profitSharePct}% of ${inr(WINNER_PRIZE.postCostProfit)}`}
                  />
                </div>
                <Total label="To the winning band" amount={WINNER_PRIZE.total} tone="green" />
                <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Svara Tribe retains
                  </p>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">
                    {inr(WINNER_PRIZE.operatorRetained)}
                  </p>
                </div>
              </Card>
            </div>
          </section>

          {/* ---------------- BIG PICTURE ---------------- */}
          <section>
            <H
              id="picture"
              eyebrow="Side by side"
              title="Three parties, three different bets"
              sub="The same season, read from each chair. They are not competing for one pot — each is paid for a different contribution and carries a different kind of risk."
              icon={<PieChart size={13} />}
            />
            <Card>
              <Scroller>
                <thead>
                  <tr>
                    <th className={th}></th>
                    <th className={`${th} text-right`}>Bands</th>
                    <th className={`${th} text-right`}>Production house</th>
                    <th className={`${th} text-right`}>Svara Tribe</th>
                  </tr>
                </thead>
                <tbody>
                  {BIG_PICTURE.map((r) => (
                    <tr key={r.label}>
                      <td className={`${td} font-semibold`}>{r.label}</td>
                      <td className={`${td} text-right`}>{r.artist}</td>
                      <td className={`${td} text-right`}>{r.productionHouse}</td>
                      <td className={`${td} text-right`}>{r.operator}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={`${td} font-bold`}>
                      Each takes
                      <p className="text-[10px] text-muted-foreground font-normal">
                        One band, one house, the operator
                      </p>
                    </td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inrCompact(BAND_INCOME_TOTAL)}
                    </td>
                    <td className={`${tdNum} text-primary-glow`}>{inrCompact(HOUSE_PL.net)}</td>
                    <td className={`${tdNum} text-primary-glow`}>
                      {inrCompact(WINNER_PRIZE.operatorRetained)}
                    </td>
                  </tr>
                </tbody>
              </Scroller>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All three are stated for a single party, not a season total: one band of{" "}
                {ROSTER.bands}, one house of {ROSTER.houses}, and the one operator. The band's
                figure is gross and carries no costs — it pays for none of its own recording,
                video, marketing or travel. The house and operator figures are net, after
                everything each committed and after the prize money leaves the operator.
              </p>
            </Card>
          </section>

          {/* ---------------- BASIS ---------------- */}
          <section>
            <Card>
              <div className="flex items-center gap-2">
                {RECONCILES ? (
                  <CheckCircle2 size={15} className="text-emerald-300" />
                ) : (
                  <AlertTriangle size={15} className="text-rose-300" />
                )}
                <p className="text-[11px] uppercase tracking-wider font-bold text-white">
                  {RECONCILES ? "The model reconciles" : "The model does not reconcile"}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {RECONCILIATION.map((r) => (
                  <div key={r.claim} className="flex gap-2 text-[11px]">
                    <CheckCircle2
                      size={12}
                      className={`shrink-0 mt-0.5 ${r.ok ? "text-emerald-300" : "text-rose-300"}`}
                    />
                    <span className={r.ok ? "text-muted-foreground" : "text-rose-300"}>
                      {r.claim}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                <span className="text-white font-semibold">Basis of preparation.</span> These are
                illustrative projections at the rates stated on this page, not audited results and
                not a forecast. The scale is Season 1 as the league defines it — {ROSTER.houses}{" "}
                production houses, {ROSTER.bandsPerHouse} bands each, {ROSTER.bands} bands in one
                zone. League-level deals are league-level: the OTT and sponsorship pools divide
                across every house and then across every band, so a per-band figure is always a
                share of one pot rather than a pot of its own. Broadcast and sponsorship are
                contracted values worth nothing until the contracts land; the catalogue lines are
                modelled from view and streaming assumptions; the gate lines move with price and
                attendance. The {CELEBRITY_SHOWS} celebrity nights are a separate, co-funded
                business at roughly ten times the scale of the league around them, and are shown
                separately for that reason.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
