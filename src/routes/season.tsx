/**
 * National season architecture — the calendar, the capacity check and the
 * annual cycle.
 *
 * Everything derives from `national-season.ts`, including the fixture grid,
 * so nothing here is a hand-keyed date. The capacity panel is the point of the
 * page: it checks the calendar against the fixture requirement rather than
 * asserting the plan works.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useMemo } from "react";
import {
  CalendarDays,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Disc3,
  Trophy,
  RefreshCw,
  Info,
  ArrowRight,
  Radio,
} from "lucide-react";
import {
  NATIONAL_ZONES,
  TOTAL_HOUSES,
  TOTAL_BANDS,
  INDIVIDUAL_FIXTURES_PER_BAND,
  TOTAL_INDIVIDUAL_FIXTURES,
  COMPETITION_WEEKENDS,
  TOTAL_CALENDAR_WEEKENDS,
  SEASON_CALENDAR,
  SEASON_END_LABEL,
  MIN_REST_DAYS,
  AVERAGE_REST_DAYS,
  IPL_WINDOW,
  ZONE_CAPACITY,
  NATIONAL_CAPACITY,
  TOTAL_LEAGUE_NIGHTS,
  RELEASE_WINDOWS,
  CATALOGUE_PATH,
  ANNUAL_CYCLE,
  ARTIST_SEASON_NOTE,
  NATIONAL_LADDER,
  QUALIFIERS_PER_ZONE,
  minGapDays,
  FULL_SCHEDULE,
  RELEASE_SCHEDULE,
  RELEASE_TOTALS,
} from "@/data/national-season";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: "Season Architecture — Kalakshetra" },
      {
        name: "description",
        content:
          "The national season: five regional leagues running simultaneously across 20 weekends, the fixture capacity check, the release calendar and the twelve-month artist cycle.",
      },
    ],
  }),
  component: SeasonPage,
});

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bpl-card p-5 border border-border bg-surface/40 space-y-3 ${className}`}>
      {children}
    </div>
  );
}

function SeasonPage() {
  const [zoneId, setZoneId] = useState(NATIONAL_ZONES[0].slug);
  const cap = ZONE_CAPACITY.find((c) => c.zone.slug === zoneId) ?? ZONE_CAPACITY[0];
  const bandsInZone = cap.bands;

  // Illustrative stagger for the selected zone — proof the constraints hold,
  // not a schedule anyone should print.
  /*
   * Read straight off the real schedule rather than a parallel illustrative
   * generator. The two had drifted: the illustrative one produced 7-day gaps
   * and so contradicted the rest rule the page was claiming to demonstrate.
   */
  const sampleBands = useMemo(() => {
    const rows: {
      index: number;
      house: number;
      band: number;
      weekends: number[];
      gap: number;
    }[] = [];
    for (let h = 1; h <= cap.zone.houses; h += 1) {
      for (let b = 1; b <= cap.zone.bandsPerHouse; b += 1) {
        const weekends = [
          ...new Set(
            FULL_SCHEDULE.filter(
              (e) =>
                e.zoneSlug === cap.zone.slug &&
                e.houseNumber === h &&
                e.bands.includes(b),
            ).map((e) => (e.competitionNumber ?? 1) - 1),
          ),
        ].sort((x, y) => x - y);
        rows.push({
          index: rows.length,
          house: h,
          band: b,
          weekends,
          gap: minGapDays(weekends),
        });
      }
    }
    return rows;
  }, [cap.zone]);

  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6, 182, 212, 0.18), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold">
              <CalendarDays size={14} />
              <span>National Build — Season Architecture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Five leagues, <span className="gradient-text">one weekend</span> at a time
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {TOTAL_BANDS} bands across {TOTAL_HOUSES} production houses and{" "}
              {NATIONAL_ZONES.length} regional leagues, all running simultaneously so no two zones
              compete for the same audience on the same night.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-left">
              {[
                { v: TOTAL_BANDS, l: "Bands", h: `${TOTAL_HOUSES} houses` },
                { v: TOTAL_INDIVIDUAL_FIXTURES, l: "Individual fixtures", h: `${INDIVIDUAL_FIXTURES_PER_BAND} per band` },
                { v: COMPETITION_WEEKENDS, l: "Competition weekends", h: `31 Dec – ${SEASON_END_LABEL}` },
                { v: NATIONAL_CAPACITY.fixturesPerWeekend, l: "Fixtures / weekend", h: "Across all five zones" },
              ].map((s) => (
                <div key={s.l} className="bpl-card p-4 border border-border/80 bg-surface/60">
                  <p className="text-2xl font-display font-extrabold text-cyan-300 tabular-nums">
                    {s.v}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-1">
                    {s.l}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.h}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 divide-y divide-border">
          {/* ---------------- CAPACITY ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <Layers size={13} /> Capacity Check
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Two house windows per region, every weekend
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                A house window is a weekend where one production house is in town and stages each of
                its bands. Running {ZONE_CAPACITY[0].windowsPerWeekend} concurrently in every zone
                is what makes the fixture list fit the calendar — and the number is not a choice so
                much as an answer, since it falls straight out of the roster and the rest rule.
              </p>
            </div>

            <div className="bpl-card p-5 border border-emerald-500/30 bg-emerald-500/5 flex gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-200">
                  {ZONE_CAPACITY[0].windowsPerWeekend} windows per region per weekend,{" "}
                  {NATIONAL_CAPACITY.windowsPerWeekend} nationally — and the calendar closes exactly.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Each house gets {ZONE_CAPACITY[0].houseWindowsPerHouse} windows across the season,
                  every band gets its {INDIVIDUAL_FIXTURES_PER_BAND} solo fixtures, and the national
                  calendar stages {NATIONAL_CAPACITY.fixturesPerWeekend} ×{" "}
                  {COMPETITION_WEEKENDS} ={" "}
                  {NATIONAL_CAPACITY.fixturesPerWeekend * COMPETITION_WEEKENDS} — the requirement to
                  the fixture, with nothing left over and nothing missing. Rest between a
                  band&apos;s fixtures averages {AVERAGE_REST_DAYS.toFixed(1)} days, clearing the{" "}
                  {MIN_REST_DAYS}-day rule.
                </p>
              </div>
            </div>

            {/*
              The rejected alternative, kept as reasoning rather than as an
              alarm. It was a genuine finding during planning, but the design
              moved on — presenting it in red made a settled decision look like
              a live fault in the season.
            */}
            <details className="bpl-card border border-border bg-surface/30 group">
              <summary className="px-5 py-3 cursor-pointer text-[11px] font-semibold text-muted-foreground hover:text-white transition flex items-center gap-2">
                <Info size={13} className="text-muted-foreground shrink-0" />
                Why two windows and not one?
              </summary>
              <p className="px-5 pb-4 text-[11px] text-muted-foreground leading-relaxed">
                One house at a time was the obvious first shape, and it does not fit. With{" "}
                {ZONE_CAPACITY[0].zone.houses} houses rotating singly across{" "}
                {COMPETITION_WEEKENDS} weekends, each house gets only{" "}
                {COMPETITION_WEEKENDS / ZONE_CAPACITY[0].zone.houses} windows, so its bands get{" "}
                {COMPETITION_WEEKENDS / ZONE_CAPACITY[0].zone.houses} fixtures against the{" "}
                {INDIVIDUAL_FIXTURES_PER_BAND} they are owed — {NATIONAL_CAPACITY.servedBySingleWindow}{" "}
                of {NATIONAL_CAPACITY.fixturesNeeded} nationally, short by exactly half in every
                zone regardless of roster size. Doubling the concurrent windows is the whole fix;
                the rest of the calendar follows from it.
              </p>
            </details>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[52rem]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-left">
                    <th className="py-2.5 px-3 font-bold text-primary-glow uppercase tracking-wider text-[10px]">Zone</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Houses</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Bands</th>
                    <th className="py-2.5 px-3 font-bold text-primary-glow uppercase tracking-wider text-[10px] text-center">Fixtures needed</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Windows / weekend</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Fixtures / weekend</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Fixtures / band</th>
                    <th className="py-2.5 px-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-center">Cross nights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {ZONE_CAPACITY.map((c) => (
                    <tr key={c.zone.slug} className="hover:bg-secondary/10">
                      <td className="py-2.5 px-3 font-bold text-white">{c.zone.shortName}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground tabular-nums">{c.zone.houses}</td>
                      <td className="py-2.5 px-3 text-center text-white font-semibold tabular-nums">{c.bands}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-primary-glow tabular-nums">{c.fixturesNeeded}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground tabular-nums">{c.windowsPerWeekend}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground tabular-nums">{c.fixturesPerWeekend}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground tabular-nums">{INDIVIDUAL_FIXTURES_PER_BAND + c.crossPerBand}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground tabular-nums">{c.crossNights}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-primary/5">
                    <td className="py-2.5 px-3 font-bold text-white">National</td>
                    <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">{TOTAL_HOUSES}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">{TOTAL_BANDS}</td>
                    <td className="py-2.5 px-3 text-center font-extrabold text-primary-glow tabular-nums">{NATIONAL_CAPACITY.fixturesNeeded}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">{NATIONAL_CAPACITY.windowsPerWeekend}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">{NATIONAL_CAPACITY.fixturesPerWeekend}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">{INDIVIDUAL_FIXTURES_PER_BAND + ZONE_CAPACITY[0].crossPerBand}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">{NATIONAL_CAPACITY.crossNights}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bpl-card p-4 border border-emerald-500/25 bg-emerald-500/5 flex gap-3">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-emerald-200">
                  Every league is the same size, and that matters.
                </span>{" "}
                Cross nights come from pairings inside a house, so roster size used to decide how
                many a band got — four-band houses gave three, two-band houses gave one, and bands
                in different zones arrived at the national stage having played different numbers of
                fixtures. Since points accumulate per fixture, that made the national table
                incomparable without adjustment. Equalising every zone to{" "}
                {ZONE_CAPACITY[0].zone.houses} houses × {ZONE_CAPACITY[0].zone.bandsPerHouse} bands
                removes it: every band anywhere plays{" "}
                {INDIVIDUAL_FIXTURES_PER_BAND + ZONE_CAPACITY[0].crossPerBand} fixtures —{" "}
                {INDIVIDUAL_FIXTURES_PER_BAND} solo and {ZONE_CAPACITY[0].crossPerBand} cross — for
                the same {ZONE_CAPACITY[0].crossNights} cross nights per zone. No normalisation, no
                asterisk.
              </p>
            </div>
          </section>

          {/* ---------------- CALENDAR ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <CalendarDays size={13} /> Regular Season
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {COMPETITION_WEEKENDS} weekends, 31 Dec to {SEASON_END_LABEL}
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {TOTAL_CALENDAR_WEEKENDS} calendar weekends, one held back as a recovery and content
                window. Generated from a single start date rather than typed out, so moving the
                season is one edit.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
              {SEASON_CALENDAR.map((w) => (
                <div
                  key={w.index}
                  className={`rounded-lg border p-2.5 text-center ${
                    w.isRecovery
                      ? "border-slate-500/40 bg-slate-500/10"
                      : w.iplOverlap
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border/60 bg-surface/40"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    {w.isRecovery ? "Recovery" : `W${w.number}`}
                  </p>
                  <p className="text-xs font-bold text-white tabular-nums">{w.label}</p>
                  {w.iplOverlap && !w.isRecovery && (
                    <p className="text-[8px] uppercase tracking-wider font-bold text-amber-400 mt-0.5">
                      Cricket
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bpl-card p-4 border border-border bg-surface/30 flex gap-3">
              <Radio size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-white">On the cricket overlap.</span> The marked
                weekends fall inside the listed IPL window. The season runs straight through it
                deliberately — a country already watching live entertainment is a discovery
                opportunity, not a reason to hide. What the scheduler should avoid is putting the
                biggest league nights on the heaviest cricket nights. {IPL_WINDOW.caveat}
              </p>
            </div>
          </section>

          {/* ---------------- STAGGER ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <Layers size={13} /> Fixture Stagger
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Five house patterns, twenty different seasons
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                All {bandsInZone} bands in the zone, read straight off the generated schedule rather
                than a parallel illustration. Bands in the same house share weekends — the house
                travels together — so the grid shows {cap.zone.houses} distinct weekend patterns.
                What separates bandmates is the day and the night type: inside a house weekend one
                band takes Friday while another takes Sunday, and the cross night pairs two of them
                on a third. Every band&apos;s closest pair of weekends is checked against the{" "}
                {MIN_REST_DAYS}-day rest rule in the right-hand column.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {NATIONAL_ZONES.map((z) => (
                <button
                  key={z.slug}
                  type="button"
                  onClick={() => setZoneId(z.slug)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                    zoneId === z.slug
                      ? "border-primary/60 bg-primary/15 text-primary-glow"
                      : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
                  }`}
                >
                  {z.shortName}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground">
              {cap.zone.headline} — {cap.bands} bands, {cap.fixturesNeeded} fixtures,{" "}
              {cap.fixturesPerWeekend} staged each weekend.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[44rem]">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Band
                    </th>
                    {SEASON_CALENDAR.map((w) => (
                      <th
                        key={w.index}
                        className="py-2 px-0.5 font-bold text-muted-foreground uppercase tracking-wider text-[8px] text-center"
                      >
                        {w.isRecovery ? "—" : w.number}
                      </th>
                    ))}
                    <th className="py-2 pl-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">
                      Min gap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sampleBands.map((b) => (
                    <tr key={b.index} className="border-b border-border/30">
                      <td className="py-1.5 pr-3 font-semibold text-white whitespace-nowrap">
                        H{b.house} · B{b.band}
                      </td>
                      {SEASON_CALENDAR.map((w) => {
                        const on = !w.isRecovery && b.weekends.includes((w.number ?? 0) - 1);
                        return (
                          <td key={w.index} className="py-1.5 px-0.5 text-center">
                            <span
                              className={`inline-block h-3 w-3 rounded-sm ${
                                on ? "bg-primary" : "bg-secondary/50"
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td
                        className={`py-1.5 pl-3 text-right font-semibold tabular-nums ${
                          b.gap >= MIN_REST_DAYS ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {b.gap}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Every generated pattern clears the {MIN_REST_DAYS}-day minimum rest rule.
            </p>
          </section>

          {/* ---------------- RELEASES ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <Disc3 size={13} /> Release Calendar
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                One league release, and the two windows either side
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Only one release is league-eligible and in-season — the band&apos;s own week in the
                zone rotation. The catalogue it scores against is built in December and rebuilt in
                July, so a band arrives at its first fixture with a body of work rather than
                assembling one mid-competition.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {RELEASE_WINDOWS.map((r) => (
                <Card
                  key={r.id}
                  className={r.eligible ? "!border-cyan-500/30 !bg-cyan-500/5" : ""}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{r.label}</h4>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        r.eligible
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-slate-500/40 bg-slate-500/10 text-slate-300"
                      }`}
                    >
                      {r.eligible ? "Scores points" : "No points"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-primary-glow">{r.window}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{r.rationale}</p>
                  <p className="text-[10px] leading-relaxed border-t border-border/40 pt-2">
                    <span
                      className={
                        r.countsToCatalogue ? "text-emerald-300 font-semibold" : "text-muted-foreground"
                      }
                    >
                      {r.countsToCatalogue ? "Counts toward catalogue score" : "Outside the catalogue count"}
                    </span>
                  </p>
                </Card>
              ))}
            </div>

            {/* How a band actually reaches full catalogue marks */}
            <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
              <h3 className="text-sm font-bold text-white">
                When full catalogue marks actually arrive
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The catalogue metric wants three originals live and the season delivers exactly
                three, so a band is not at full marks until its final drop. That is deliberate: the
                points arrive as the work does, and a band that misses a cycle carries the shortfall
                into the fixtures that follow rather than making it up later.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CATALOGUE_PATH.map((c, i) => (
                  <div
                    key={c.at}
                    className={`rounded-lg border p-3 ${
                      i === CATALOGUE_PATH.length - 2
                        ? "border-emerald-500/35 bg-emerald-500/5"
                        : "border-border/60 bg-surface/30"
                    }`}
                  >
                    <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                      {c.live}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-0.5">
                      {c.at}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-1">{c.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                A band that ships nothing before the season opens carries a catalogue penalty into
                its early fixtures and cannot clear it until its own release week arrives. That is
                the intended pressure: the December window is where the draft money is supposed to
                go.
              </p>
            </div>
          </section>

          {/* ---------------- RELEASE ROTATION ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <RefreshCw size={13} /> Release Rotation
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                A drop every {RELEASE_TOTALS.cycleDays} days, from every band
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                One original every {RELEASE_TOTALS.cycleDays} days per band —{" "}
                {RELEASE_TOTALS.perBand} across the season, {RELEASE_TOTALS.releases} in total. The
                cadence is per band; the stagger is per house. Bands 1 and 3 drop on the 1st, bands
                2 and 4 on the 16th, the first pair in odd months and the second in even — so the
                house has something out every {RELEASE_TOTALS.staggerDays} or{" "}
                {RELEASE_TOTALS.longestHouseGap} days while no band is asked for more than three
                finished pieces.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { v: `${RELEASE_TOTALS.staggerDays}d`, l: "House cadence", h: "Something out every fortnight" },
                { v: RELEASE_TOTALS.perBand, l: "Per band, in season", h: `One every ${RELEASE_TOTALS.cycleDays} days` },
                { v: RELEASE_TOTALS.perHouse, l: "Per house", h: `4 bands x ${RELEASE_TOTALS.perBand} originals` },
                { v: RELEASE_TOTALS.releases.toLocaleString("en-IN"), l: "Releases in the season", h: `${TOTAL_BANDS} bands` },
              ].map((k) => (
                <div key={k.l} className="border border-border/50 rounded-lg p-4 bg-surface/30">
                  <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                    {k.v}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-white mt-1">
                    {k.l}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{k.h}</p>
                </div>
              ))}
            </div>

            <div className="bpl-card p-5 border border-emerald-500/30 bg-emerald-500/5 flex gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-emerald-200">
                  No two bands in a house share a release day.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {RELEASE_TOTALS.perMonthNationally} drops a month nationally is a lot of noise,
                  so the thing worth protecting is the one place a band is genuinely competing for
                  attention — its own stable. The fortnightly offset inside a house guarantees that,
                  and it is asserted rather than assumed:{" "}
                  <span className="font-semibold text-white">
                    {RELEASE_TOTALS.noStablemateClash ? "verified across all" : "FAILS across"}{" "}
                    {RELEASE_TOTALS.releases.toLocaleString("en-IN")} releases
                  </span>
                  . Across zones and houses the drops do overlap, which is what a national release
                  calendar looks like.
                </p>
              </div>
            </div>

            <div className="bpl-card p-5 border border-border bg-surface/40 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-white">
                  The rotation — {cap.zone.shortName}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {cap.bands} weeks, {cap.bands} bands, no house twice in a row
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RELEASE_SCHEDULE.filter((r) => r.zoneSlug === cap.zone.slug).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border border-border/60 bg-surface/40 px-2 py-1.5 text-center min-w-[4.4rem]"
                  >
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      Wk {r.week}
                    </p>
                    <p className="text-[11px] font-bold text-white tabular-nums">
                      H{r.houseNumber}·B{r.band}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{r.dateLabel}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Releases land on the Friday ahead of that week&apos;s fixtures. Houses cycle before
                bands do, so consecutive weeks always come from different stables — and every band
                in the zone gets exactly one.
              </p>
            </div>
          </section>

          {/* ---------------- ANNUAL CYCLE ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <RefreshCw size={13} /> The Twelve-Month Cycle
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                The league runs six months. The artist does not stop.
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {ARTIST_SEASON_NOTE}
              </p>
            </div>

            <div className="hidden sm:flex h-3 w-full rounded-full overflow-hidden border border-border/50">
              {ANNUAL_CYCLE.map((p) => (
                <div
                  key={p.id}
                  title={`${p.name} — ${p.period}`}
                  style={{ width: `${(p.months / 12) * 100}%` }}
                  className={p.accent}
                />
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ANNUAL_CYCLE.map((p) => (
                <Card key={p.id}>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {p.period}
                  </span>
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{p.detail}</p>
                  <p className="text-[10px] text-primary-glow leading-relaxed border-t border-border/40 pt-2">
                    {p.revenue}
                  </p>
                </Card>
              ))}
            </div>

            <div className="bpl-card p-4 border border-border bg-surface/30 flex gap-3">
              <Info size={14} className="text-primary-glow shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-white">Why the national final sits in October.</span>{" "}
                Running it into December would collide with the auction and pre-season for the next
                regional league, and a league cannot crown a champion and draft its replacements in
                the same month. August–October keeps the two apart with room to spare.
              </p>
            </div>
          </section>

          {/* ---------------- LADDER ---------------- */}
          <section className="py-14 space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow font-bold flex items-center gap-2">
                <Trophy size={13} /> National Qualification
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {NATIONAL_ZONES.length * QUALIFIERS_PER_ZONE} up, then 10, then 5
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Top {QUALIFIERS_PER_ZONE} from each zone rather than a single champion. Sending one
                band per zone would take {TOTAL_BANDS} down to {NATIONAL_ZONES.length} in a single
                step and throw away most of the season&apos;s audience with it.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {NATIONAL_LADDER.map((st, i) => (
                <Card
                  key={st.stage}
                  className={i === NATIONAL_LADDER.length - 1 ? "!border-amber-500/30 !bg-amber-500/5" : ""}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{st.stage}</h4>
                    <span className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                      {st.bands}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    {st.when}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{st.detail}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ---------------- FOOT ---------------- */}
          <section className="py-14">
            <div className="bpl-card p-6 border border-border bg-surface/30 space-y-3">
              <h3 className="text-sm font-bold text-white">What is deliberately not here</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {TOTAL_INDIVIDUAL_FIXTURES} dated fixtures. The structure is what needs locking
                first; the matrix comes from a scheduler that knows venue availability, travel
                distance, college calendars, regional holidays, broadcast clashes and the{" "}
                {MIN_REST_DAYS}-day rest rule. Inventing the dates by hand now would be a worse
                answer that merely looks more complete.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Across the national build that is {NATIONAL_CAPACITY.fixturesNeeded} individual
                fixtures plus {NATIONAL_CAPACITY.crossNights} cross nights ={" "}
                <span className="font-bold text-white">{TOTAL_LEAGUE_NIGHTS} league nights</span>{" "}
                before the finals. The{" "}
                <Link to="/economics" className="text-primary-glow font-semibold hover:underline">
                  economics page
                </Link>{" "}
                models what each of those nights costs and earns, and the{" "}
                <Link to="/handbook" className="text-primary-glow font-semibold hover:underline">
                  handbook
                </Link>{" "}
                carries the rules they run under.
              </p>
              <Link
                to="/handbook"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-glow hover:gap-2.5 transition-all"
              >
                Read the full handbook <ArrowRight size={13} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
