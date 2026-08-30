/**
 * The economics simulator — the front door to /economics.
 *
 * Three views over one set of assumptions: ONE BAND, ONE PRODUCTION HOUSE,
 * WHOLE LEAGUE. Move any slider and all three re-derive, because the questions
 * people actually arrive with ("if the room is half empty do I lose money?")
 * should be one drag away rather than a spreadsheet exercise.
 *
 * The detailed model is untouched and still lives below, under Advanced.
 */

import { useMemo, useState } from "react";
import {
  Sliders,
  Music2,
  Building2,
  Globe2,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronDown,
  Users,
  Ticket,
} from "lucide-react";
import { inr, inrCompact, EVENT_SPLIT, CONTENT_SPLIT } from "@/data/economics";
import {
  DEFAULT_SIM,
  EVENT_TYPES,
  PRESETS,
  VERDICT_META,
  applyPreset,
  breakEven,
  computeBand,
  computeEvent,
  computeHouse,
  computeLeague,
  findings,
  leagueConfig,
  songRevenue,
  type EventType,
  type PresetId,
  type SimInputs,
  type Verdict,
} from "@/data/simulator";

/* ------------------------------------------------------------------ *
 * Small primitives
 * ------------------------------------------------------------------ */

function Verdict({ v, className = "" }: { v: Verdict; className?: string }) {
  const m = VERDICT_META[v];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${m.tone} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function Big({
  value,
  label,
  hint,
  tone = "text-white",
}: {
  value: string;
  label: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className={`text-2xl sm:text-3xl font-display font-extrabold tabular-nums ${tone}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-1">{label}</p>
      {hint && <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{hint}</p>}
    </div>
  );
}

function Line({
  label,
  amount,
  note,
  negative,
  bold,
}: {
  label: string;
  amount: number;
  note?: string;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <div className="min-w-0">
        <p className={`text-[11px] leading-snug ${bold ? "font-bold text-white" : "text-white"}`}>
          {negative && <span className="text-muted-foreground mr-1">less</span>}
          {label}
        </p>
        {note && <p className="text-[10px] text-muted-foreground leading-snug">{note}</p>}
      </div>
      <span
        className={`tabular-nums shrink-0 ${
          bold ? "text-sm font-display font-extrabold text-white" : "text-[11px] font-semibold text-white"
        }`}
      >
        {negative ? "−" : ""}
        {inr(Math.abs(amount))}
      </span>
    </div>
  );
}

function Knob({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  money,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  money?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] font-bold text-white tabular-nums">
          {money ? inr(value) : value.toLocaleString("en-IN")}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary-glow,#e0b64c)] cursor-pointer"
      />
    </label>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/60 bg-surface/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 cursor-pointer"
      >
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-3 pb-3 space-y-1">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The simulator
 * ------------------------------------------------------------------ */

type ViewId = "band" | "house" | "league";

export function Simulator() {
  const [i, setI] = useState<SimInputs>(DEFAULT_SIM);
  const [preset, setPreset] = useState<PresetId>("base");
  const [view, setView] = useState<ViewId>("band");
  const [eventType, setEventType] = useState<EventType>("commercial");

  const set = (patch: Partial<SimInputs>) => {
    setI((prev) => ({ ...prev, ...patch }));
    setPreset("base");
  };
  const selectPreset = (id: PresetId) => {
    setI(applyPreset(id));
    setPreset(id);
  };

  const cfg = useMemo(() => leagueConfig(), []);
  const ev = useMemo(() => computeEvent(eventType, i), [eventType, i]);
  const band = useMemo(() => computeBand(i), [i]);
  const house = useMemo(() => computeHouse(i, cfg.bandsPerHouse), [i, cfg.bandsPerHouse]);
  const league = useMemo(() => computeLeague(i, cfg), [i, cfg]);
  const be = useMemo(() => breakEven(i), [i]);
  const notes = useMemo(() => findings(i, cfg), [i, cfg]);

  const commercial = useMemo(() => computeEvent("commercial", i), [i]);

  return (
    <section className="border-b border-border bg-gradient-to-b from-surface/40 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-6">
        {/* ---------------- header ---------------- */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
            <Sliders size={13} /> Economics Simulator
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Change one assumption. See what it does to everybody.
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            The same numbers, followed all the way through: one night in a café, one band&apos;s
            season, one production house&apos;s roster, and the league as a whole. Nothing here is
            tuned to show a profit — at the base case a house does not recover its investment in a
            single season, and the page says so rather than hiding it.
          </p>
        </div>

        {/* ---------------- presets ---------------- */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mr-1">
            Scenario
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.note}
              onClick={() => selectPreset(p.id)}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                preset === p.id
                  ? "border-primary/60 bg-primary/15 text-primary-glow"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
              }`}
            >
              {p.label}
            </button>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">
            {PRESETS.find((p) => p.id === preset)?.note}
          </span>
        </div>

        {/* ---------------- base assumptions ---------------- */}
        <div className="bpl-card p-4 sm:p-5 border border-border bg-surface/50 space-y-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-white">Base assumptions — one commercial night</h3>
            <p className="text-[10px] text-muted-foreground">
              Planning figures, not guarantees. Everything below re-derives as you move them.
            </p>
          </div>
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
            <p className="text-[11px] text-white leading-relaxed">
              <span className="font-bold">One city a week.</span> A zone activates a single city at
              a time — Friday and Sunday are paid shows, Saturday is campus, house, festival or a
              celebrity night — then the league moves on. Over {i.seasonWeeks} weeks that is a
              tour of the zone&apos;s hubs rather than three cities running at once, which is what
              makes it possible to run with one ops team per zone.
            </p>
          </div>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            <Knob label="Venue capacity" value={i.venueCapacity} min={100} max={2000} step={10} onChange={(v) => set({ venueCapacity: v })} />
            <Knob label="Ticket price" value={i.ticketPrice} min={199} max={999} step={10} money onChange={(v) => set({ ticketPrice: v })} />
            <Knob label="Occupancy" value={i.occupancyPct} min={30} max={100} suffix="%" onChange={(v) => set({ occupancyPct: v })} />
            <Knob label="Event sponsor" value={i.eventSponsor} min={0} max={200000} step={2500} money onChange={(v) => set({ eventSponsor: v })} />
            <Knob label="Stalls" value={i.stalls} min={0} max={20} onChange={(v) => set({ stalls: v })} />
            <Knob label="Stall price" value={i.stallPrice} min={0} max={25000} step={500} money onChange={(v) => set({ stallPrice: v })} />
            <Knob label="Event operating cost" value={i.eventCost} min={5000} max={100000} step={1000} money onChange={(v) => set({ eventCost: v })} />
            <Knob label="Ticketing deduction" value={i.ticketingPct} min={0} max={15} suffix="%" onChange={(v) => set({ ticketingPct: v })} />
          </div>
        </div>

        {/* ---------------- what the model is betting on ---------------- */}
        {notes.length > 0 && (
          <div className="grid gap-2 lg:grid-cols-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`rounded-lg border p-3 flex gap-2.5 ${
                  n.severity === "warn"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border/60 bg-surface/30"
                }`}
              >
                {n.severity === "warn" ? (
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white leading-snug">{n.headline}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                    {n.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- one event ---------------- */}
        <div className="bpl-card p-4 sm:p-5 border border-border bg-surface/40 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
              <Ticket size={12} className="text-primary-glow" /> One night
            </span>
            {EVENT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.blurb}
                onClick={() => setEventType(t.id)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                  eventType === t.id
                    ? "border-primary/60 bg-primary/15 text-primary-glow"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {EVENT_TYPES.find((t) => t.id === eventType)?.blurb}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Big value={inr(ev.totalRevenue)} label="Total event revenue" hint={ev.netGate > 0 ? (ev.gateNote ?? `${ev.attendees} in at ${inr(ev.ticketPrice)}`) : "No gate on this format"} />
            <Big value={inr(ev.cost)} label="Event cost" tone="text-rose-300" />
            <Big
              value={`${ev.contribution < 0 ? "−" : ""}${inr(Math.abs(ev.contribution))}`}
              label="Event contribution"
              tone={ev.contribution < 0 ? "text-rose-300" : "text-emerald-300"}
            />
            <div className="rounded-xl border border-border bg-surface/40 p-4 flex flex-col justify-center gap-2">
              <Verdict v={ev.verdict} />
              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                {ev.revenuePerAttendee > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    <span className="text-white font-semibold tabular-nums">
                      {inr(ev.revenuePerAttendee)}
                    </span>{" "}
                    per attendee
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  <span
                    className={`font-semibold tabular-nums ${
                      ev.sponsorshipCushionPct >= 40 ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {ev.sponsorshipCushionPct.toFixed(0)}%
                  </span>{" "}
                  of cost covered before a ticket sells
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span
                    className={`font-semibold tabular-nums ${
                      ev.marginPct < 0 ? "text-rose-300" : "text-white"
                    }`}
                  >
                    {ev.marginPct.toFixed(0)}%
                  </span>{" "}
                  margin, all-in
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Operator keeps{" "}
                <span className={ev.operatorResult < 0 ? "text-rose-300 font-semibold" : "text-white font-semibold"}>
                  {ev.operatorResult < 0 ? "−" : ""}
                  {inr(Math.abs(ev.operatorResult))}
                </span>{" "}
                after its share and the cost.
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {ev.netGate > 0 && (
              <Details title="Gate waterfall">
                <Line label="Gross gate" amount={ev.grossGate} note={`${ev.attendees} × ${inr(ev.ticketPrice)}`} />
                <Line label={`Ticketing (${i.ticketingPct}%)`} amount={ev.ticketingFee} negative />
                <Line label="Net gate" amount={ev.netGate} bold />
                {!!ev.feeOffTop && (
                  <>
                    <Line label="Guest fee, recovered first" amount={ev.feeOffTop} negative />
                    <Line label="Splits on" amount={ev.splitBase ?? ev.netGate} bold />
                  </>
                )}
                <Line label={`Bands (${EVENT_SPLIT.bands}%)`} amount={ev.bandPool} note={ev.acts > 1 ? `${inr(ev.bandPerAct)} each across ${ev.acts} acts` : undefined} />
                <Line label={`Production house (${EVENT_SPLIT.productionHouse}%)`} amount={ev.housePool} />
                <Line label={`League operator (${EVENT_SPLIT.operator}%)`} amount={ev.operatorGatePool} />
              </Details>
            )}
            <Details title="Beyond the ticket">
              {ev.ancillary.map((a) => (
                <Line key={a.label} label={a.label} amount={a.amount} />
              ))}
              <Line label="Ancillary total" amount={ev.ancillaryTotal} bold />
            </Details>
            <Details title="Cost to stage">
              {ev.costLines.map((c) => (
                <Line key={c.label} label={c.label} amount={c.amount} />
              ))}
              <Line label="Total cost" amount={ev.cost} bold />
            </Details>
          </div>

          {/* break-even, commercial only */}
          {eventType === "commercial" && (
            <div className="rounded-lg border border-border/60 bg-surface/30 p-3 space-y-2.5">
              <h4 className="text-[11px] font-bold text-white">Where the night stops working</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">
                    {be.coveredBySponsor ? "0%" : `${be.occupancyPct.toFixed(0)}%`}
                  </p>
                  <p className="text-[9px] text-muted-foreground">break-even occupancy</p>
                </div>
                <div>
                  <p className="text-lg font-display font-extrabold text-amber-300 tabular-nums">
                    {be.noSponsorReachable ? `${be.occupancyNoSponsorPct.toFixed(0)}%` : "not reachable"}
                  </p>
                  <p className="text-[9px] text-muted-foreground">if the sponsor falls through</p>
                </div>
                <div>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">
                    {inr(be.ticketPrice)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">break-even ticket at {i.occupancyPct}%</p>
                </div>
                <div>
                  <p className="text-lg font-display font-extrabold text-white tabular-nums">
                    {inr(be.sponsor)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">sponsor needed to cover the room</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {be.ladder.map((l) => (
                  <div
                    key={l.occPct}
                    className={`rounded border px-2 py-1 ${VERDICT_META[l.verdict].tone}`}
                    title={`Operator keeps ${inr(l.operatorResult)}`}
                  >
                    <span className="text-[10px] font-bold tabular-nums">{l.occPct}%</span>
                    <span className="text-[9px] ml-1.5 tabular-nums opacity-80">
                      {l.operatorResult < 0 ? "−" : ""}
                      {inrCompact(Math.abs(l.operatorResult))}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Each block is the operator&apos;s position at that occupancy, after its{" "}
                {EVENT_SPLIT.operator}% of the gate, the sponsor and the stalls, less the cost of the
                room.
              </p>
            </div>
          )}
        </div>

        {/* ---------------- view switch ---------------- */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "band", label: "One Band", icon: <Music2 size={13} /> },
              { id: "house", label: "One Production House", icon: <Building2 size={13} /> },
              { id: "league", label: "Whole League", icon: <Globe2 size={13} /> },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                view === v.id
                  ? "border-primary/60 bg-primary/15 text-primary-glow"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
              }`}
            >
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>

        {/* ================= BAND ================= */}
        {view === "band" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Big value={inrCompact(band.totalEarnings)} label="Band earnings" hint="Across the whole season" tone="text-primary-glow" />
              <Big value={inrCompact(band.perMember)} label="Average per member" hint={`Illustrative equal split across ${i.bandMembers}`} />
              <Big value={inrCompact(band.liveEarnings)} label="Live earnings" />
              <Big value={inrCompact(band.musicEarnings)} label="Music earnings" />
              <Big value={inrCompact(band.sponsorOther)} label="Sponsor / other" />
            </div>

            <div className="bpl-card p-4 border border-border bg-surface/40 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  {band.totalTouchpoints} season appearances — not{" "}
                  {band.totalTouchpoints} shows
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A versus night is two bands on one stage, a house night is four, and a festival
                  bill carries ten. So {band.totalTouchpoints} appearances resolve into roughly{" "}
                  <span className="font-semibold text-white">
                    {band.physicalEvents.toFixed(0)} physical events
                  </span>{" "}
                  for this band. Quoting the first number as if it were the second is the
                  difference between a plan you can run and one you cannot.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {band.touchpoints.map((t) => (
                  <div key={t.label} className="rounded-lg border border-border/70 bg-surface/50 px-3 py-2">
                    <p className="text-lg font-display font-extrabold text-white tabular-nums leading-none">
                      {t.count}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.label}</p>
                    {t.acts > 1 && (
                      <p className="text-[9px] text-primary-glow/80 tabular-nums">
                        {t.acts} on the bill
                      </p>
                    )}
                  </div>
                ))}
                <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 px-3 py-2">
                  <p className="text-lg font-display font-extrabold text-fuchsia-300 tabular-nums leading-none">
                    {band.songs}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Original releases</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="bpl-card p-4 border border-border bg-surface/40 space-y-2">
                <h4 className="text-xs font-bold text-white">What the band earns</h4>
                {band.revenue.map((r) => (
                  <Line key={r.label} label={r.label} amount={r.amount} note={r.note} />
                ))}
                <div className="border-t border-border/50 pt-2">
                  <Line label="Total band earnings" amount={band.totalEarnings} bold />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Not a salary. This is what the band earns as a business across the season, before
                  its own costs, and the per-member figure is an illustrative equal split rather
                  than a wage.
                </p>
              </div>

              <div className="bpl-card p-4 border border-cyan-500/25 bg-cyan-500/5 space-y-2">
                <h4 className="text-xs font-bold text-white">
                  What the production house put in for this band
                </h4>
                {band.investment.map((x) => (
                  <Line key={x.label} label={x.label} amount={x.amount} />
                ))}
                <div className="border-t border-border/50 pt-2">
                  <Line label="Total invested" amount={band.investmentTotal} bold />
                  <Line label="House gets back from this band" amount={band.houseFromBand} bold />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Verdict v={band.verdict} />
                  <span className="text-[11px] text-muted-foreground">
                    {band.houseRoiPct >= 0 ? "+" : ""}
                    {band.houseRoiPct.toFixed(0)}% in season one
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The band does not fund itself — the house does. It half-owns the catalogue beyond
                  this season, which is where the rest of the case sits.
                </p>
              </div>
            </div>

            <Details title="Music maths">
              <Line label={`YouTube (${i.youtubeViews.toLocaleString("en-IN")} views at ${inr(i.youtubeRpm)} RPM)`} amount={Math.round((i.youtubeViews / 1000) * i.youtubeRpm)} />
              <Line label={`Streaming (${i.streamingPlays.toLocaleString("en-IN")} plays at ₹${i.streamingRate})`} amount={Math.round(i.streamingPlays * i.streamingRate)} />
              <Line label="Per song" amount={songRevenue(i)} bold />
              <Line label={`Across ${i.songs} originals`} amount={songRevenue(i) * i.songs} bold />
              <Line label={`Band share (${CONTENT_SPLIT.artists}%)`} amount={band.musicEarnings} />
              <Line label={`House share (${CONTENT_SPLIT.productionHouse}%)`} amount={band.houseMusicShare} />
            </Details>
          </div>
        )}

        {/* ================= HOUSE ================= */}
        {view === "house" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Big value={inrCompact(house.investmentTotal)} label="Total investment" hint={`${house.bandsPerHouse} bands`} tone="text-cyan-300" />
              <Big value={inrCompact(house.revenueTotal)} label="Total revenue" />
              <Big
                value={`${house.profit < 0 ? "−" : ""}${inrCompact(Math.abs(house.profit))}`}
                label={house.profit < 0 ? "Shortfall" : "Surplus"}
                tone={house.profit < 0 ? "text-rose-300" : "text-emerald-300"}
              />
              <div className="rounded-xl border border-border bg-surface/40 p-4 flex flex-col justify-center gap-2">
                <p className="text-2xl font-display font-extrabold tabular-nums text-white">
                  {house.roiPct >= 0 ? "+" : ""}
                  {house.roiPct.toFixed(0)}%
                </p>
                <Verdict v={house.verdict} />
              </div>
            </div>

            <div className="bpl-card p-4 border border-border bg-surface/40 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">
                  Four bands, and they are never identical
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The whole point of a roster is that one band can carry the others. Draw is the
                  lever — a band that fills a room is worth more than one playing to a third of it.
                </p>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[34rem] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {["Band", "Draw", "Invested", "Returned", "Profit", "ROI", ""].map((h) => (
                        <th key={h} className="py-2 pr-3 text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {house.bands.map((r) => (
                      <tr key={r.band} className="border-b border-border/40">
                        <td className="py-2 pr-3 text-xs font-bold text-white">Band {r.band}</td>
                        <td className="py-2 pr-3 text-[11px] text-muted-foreground tabular-nums">{r.drawMult}×</td>
                        <td className="py-2 pr-3 text-[11px] text-white tabular-nums">{inrCompact(r.investment)}</td>
                        <td className="py-2 pr-3 text-[11px] text-white tabular-nums">{inrCompact(r.revenue)}</td>
                        <td className={`py-2 pr-3 text-[11px] tabular-nums ${r.profit < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                          {r.profit < 0 ? "−" : ""}
                          {inrCompact(Math.abs(r.profit))}
                        </td>
                        <td className="py-2 pr-3 text-[11px] text-white tabular-nums">
                          {r.roiPct >= 0 ? "+" : ""}
                          {r.roiPct.toFixed(0)}%
                        </td>
                        <td className="py-2 pr-3"><Verdict v={r.verdict} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="bpl-card p-4 border border-cyan-500/25 bg-cyan-500/5 space-y-2">
                <h4 className="text-xs font-bold text-white">Core investment</h4>
                {house.investment.map((x) => (
                  <Line key={x.label} label={x.label} amount={x.amount} />
                ))}
                <div className="border-t border-border/50 pt-2">
                  <Line label="Total" amount={house.investmentTotal} bold />
                </div>
              </div>
              <div className="bpl-card p-4 border border-border bg-surface/40 space-y-2">
                <h4 className="text-xs font-bold text-white">Revenue</h4>
                {house.revenue.map((x) => (
                  <Line key={x.label} label={x.label} amount={x.amount} />
                ))}
                <div className="border-t border-border/50 pt-2">
                  <Line label="Total" amount={house.revenueTotal} bold />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-surface/30 p-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-white">What a house does not pay for.</span>{" "}
                Venues, league event operations, league technology, legal, central media and the
                prize pool are the operator&apos;s. A house funds acquisition, music, video, artist
                marketing, travel, freight and accommodation for its own roster — and nothing twice.
              </p>
            </div>
          </div>
        )}

        {/* ================= LEAGUE ================= */}
        {view === "league" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Big value={inrCompact(league.revenueTotal)} label="League revenue" hint={`${cfg.zones} zones · ${cfg.houses} houses · ${cfg.bands} bands · one city a week`} tone="text-primary-glow" />
              <Big value={inrCompact(league.centralCost)} label="Central operating cost" tone="text-rose-300" hint="The nine operating buckets" />
              <Big
                value={inrCompact(league.prizePool)}
                label="Prize pool"
                tone="text-amber-300"
                hint={
                  league.prizeDrivenBy === "share"
                    ? `${inrCompact(league.prizeFloor)} floor, beaten by the 25% profit share`
                    : `The announced ${inrCompact(league.prizeFloor)} floor — the profit share would only pay ${inrCompact(league.prizeShare)}`
                }
              />
              <div className="rounded-xl border border-border bg-surface/40 p-4 flex flex-col justify-center gap-2">
                <p className={`text-2xl font-display font-extrabold tabular-nums ${league.operatingSurplus < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                  {league.operatingSurplus < 0 ? "−" : ""}
                  {inrCompact(Math.abs(league.operatingSurplus))}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-white">
                  Operating surplus
                </p>
                <div className="flex items-center gap-2">
                  <Verdict v={league.verdict} />
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {league.marginPct.toFixed(0)}% margin
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="bpl-card p-4 border border-border bg-surface/40 space-y-2">
                <h4 className="text-xs font-bold text-white">Revenue streams</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  League-level sponsorship, event-level sponsorship and artist sponsorship are three
                  different things and are never added together. Event sponsors sit inside the live
                  line; artist sponsorship belongs to the band and does not appear here at all.
                </p>
                {league.revenue.map((r) => (
                  <Line key={r.label} label={r.label} amount={r.amount} />
                ))}
                <div className="border-t border-border/50 pt-2">
                  <Line label="Total league revenue" amount={league.revenueTotal} bold />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bpl-card p-4 border border-border bg-surface/40 space-y-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Where the live money comes from</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-white">
                        {league.appearances.toLocaleString("en-IN")} band appearances
                      </span>{" "}
                      across{" "}
                      <span className="font-semibold text-white">
                        {league.physicalEvents.toLocaleString("en-IN")} physical events
                      </span>{" "}
                      — the league stages far fewer nights than it delivers artist touchpoints.
                    </p>
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <table className="w-full min-w-[26rem] text-left border-collapse">
                      <tbody>
                        {league.nights.map((n) => (
                          <tr key={n.label} className="border-b border-border/40">
                            <td className="py-1.5 pr-3 text-[11px] text-white">{n.label}</td>
                            <td className="py-1.5 pr-3 text-[11px] text-muted-foreground tabular-nums">{n.count.toLocaleString("en-IN")} nights</td>
                            <td className={`py-1.5 pr-3 text-[11px] tabular-nums ${n.perNight < 0 ? "text-rose-300" : "text-muted-foreground"}`}>
                              {n.perNight < 0 ? "−" : ""}
                              {inr(Math.abs(n.perNight))} each
                            </td>
                            <td className={`py-1.5 text-[11px] font-semibold tabular-nums text-right ${n.total < 0 ? "text-rose-300" : "text-white"}`}>
                              {n.total < 0 ? "−" : ""}
                              {inrCompact(Math.abs(n.total))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bpl-card p-4 border border-border bg-surface/40 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users size={13} className="text-primary-glow" /> Membership
                  </h4>
                  <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                    <Knob label="Membership price" value={i.membershipPrice} min={99} max={999} step={10} money onChange={(v) => set({ membershipPrice: v })} />
                    <Knob label="Members" value={i.membershipCount} min={0} max={100000} step={100} onChange={(v) => set({ membershipCount: v })} />
                  </div>
                  <Line label="Membership revenue" amount={league.membershipRevenue} bold note="Separate from ticketing — early access, member content, voting and exclusive events." />
                </div>
              </div>
            </div>

            <Details title="Central operating cost — every line editable">
              <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 pt-1">
                <Knob label="Central operating cost" value={i.centralOperatingCost} min={2000000} max={30000000} step={100000} money onChange={(v) => set({ centralOperatingCost: v })} />
                <Knob label="Prize pool" value={i.prizePool} min={0} max={10000000} step={100000} money onChange={(v) => set({ prizePool: v })} />
                <Knob label="Title sponsor" value={i.titleSponsor} min={0} max={30000000} step={250000} money onChange={(v) => set({ titleSponsor: v })} />
                <Knob label="Associate sponsors" value={i.associateSponsors} min={0} max={20000000} step={250000} money onChange={(v) => set({ associateSponsors: v })} />
                <Knob label="Media & broadcast" value={i.mediaRights} min={0} max={20000000} step={250000} money onChange={(v) => set({ mediaRights: v })} />
                <Knob label="League licensing" value={i.leagueLicensing} min={0} max={10000000} step={100000} money onChange={(v) => set({ leagueLicensing: v })} />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed pt-2">
                The prize pool is counted once, here, and is not inside the operating cost. Music
                production, artist videos, artist marketing, band travel and accommodation are the
                production house&apos;s and never appear in this total.
              </p>
            </Details>
          </div>
        )}

        {/* ---------------- money flow ---------------- */}
        <div className="grid gap-3 lg:grid-cols-3">
          {[
            {
              title: "Live",
              steps: ["Fan", "Ticket", "Net gate"],
              split: [
                `${EVENT_SPLIT.bands}% Band`,
                `${EVENT_SPLIT.productionHouse}% Production House`,
                `${EVENT_SPLIT.operator}% Kalakshetra`,
              ],
              accent: "border-emerald-500/25 bg-emerald-500/5",
            },
            {
              title: "Music",
              steps: ["Song", "YouTube · streaming · licensing"],
              split: [`${CONTENT_SPLIT.artists}% Band`, `${CONTENT_SPLIT.productionHouse}% Production House`],
              accent: "border-fuchsia-500/25 bg-fuchsia-500/5",
            },
            {
              title: "League",
              steps: ["Sponsors · membership · media · licensing · event income", "Kalakshetra"],
              split: ["Central operations, media, technology, marketing, legal", "Prize pool", "Operating surplus"],
              accent: "border-primary/25 bg-primary/5",
            },
          ].map((f) => (
            <div key={f.title} className={`bpl-card p-4 border space-y-2 ${f.accent}`}>
              <h4 className="text-xs font-bold text-white">{f.title}</h4>
              <div className="space-y-1">
                {f.steps.map((st) => (
                  <p key={st} className="text-[11px] text-muted-foreground leading-snug">
                    {st}
                    <span className="block text-muted-foreground/50">↓</span>
                  </p>
                ))}
                {f.split.map((sp) => (
                  <p key={sp} className="text-[11px] font-semibold text-white leading-snug">
                    {sp}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface/30 p-3">
          <TrendingUp size={14} className="text-primary-glow shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-white">One night, all the way up.</span> At the base
            case a commercial night turns over {inr(commercial.totalRevenue)} against{" "}
            {inr(commercial.cost)} of cost. Multiply that across {cfg.bands} bands and it becomes the
            live line in the league view; take {EVENT_SPLIT.bands}% of it and it becomes the band&apos;s
            income. Every figure on this page is the same arithmetic seen from a different height —
            and the detailed model underneath is unchanged.
          </p>
        </div>
      </div>
    </section>
  );
}
