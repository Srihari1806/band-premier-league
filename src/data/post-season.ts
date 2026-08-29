/**
 * July to December — regional finals, the national championship, and the
 * months that carry an artist to the next draft.
 *
 * Nobody is named. Every participant is a SLOT: "AP/TS #3", "Group B winner",
 * "QF2 winner", "Rank 2". That is deliberate and permanent — the bracket
 * describes how a band arrives at a night, never who. Printing invented band
 * names against dated fixtures would be publishing a fabricated result for
 * real acts, and the standings elsewhere on this site follow the same rule.
 */

import {
  ZONE_HUBS,
  type Zone,
} from "./league-format";

export const QUALIFIERS_PER_ZONE = 5;

/* ------------------------------------------------------------------ *
 * Weekend calendar for the back half of the year
 * ------------------------------------------------------------------ */

function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

const DAY_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const WEEKEND_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** Saturdays from the first post-season weekend to the end of the year. */
function saturdaysBetween(startIso: string, endIso: string): Date[] {
  const out: Date[] = [];
  let d = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  while (d <= end) {
    out.push(new Date(d.getTime()));
    d = addDays(d, 7);
  }
  return out;
}

const JULY = saturdaysBetween("2027-07-03", "2027-07-31");
const GROUPS = saturdaysBetween("2027-08-07", "2027-09-25");
const OCTOBER = saturdaysBetween("2027-10-02", "2027-10-30");
const NOVEMBER = saturdaysBetween("2027-11-06", "2027-11-27");
const DECEMBER = saturdaysBetween("2027-12-04", "2027-12-25");

/* ------------------------------------------------------------------ *
 * Stages
 * ------------------------------------------------------------------ */

export type PostStage =
  | "regional-final"
  | "group"
  | "quarter"
  | "finalist-rr"
  | "eliminator"
  | "grand-final";

export interface StageMeta {
  id: PostStage;
  name: string;
  window: string;
  detail: string;
  accent: string;
}

export const POST_STAGES: StageMeta[] = [
  {
    id: "regional-final",
    name: "Regional Finals",
    window: "July",
    detail: `The top ${QUALIFIERS_PER_ZONE} of each regular season play a full round robin. It crowns a Regional Champion and seeds all ${QUALIFIERS_PER_ZONE} for the national draw — nobody is eliminated here.`,
    accent: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  },
  {
    id: "group",
    name: "National Group Stage",
    window: "August – September",
    detail:
      "Five groups of five, one band from each zone in every group, so a Kerala act meets a North India act from the first night. Round robin inside the group; top two advance.",
    accent: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  },
  {
    id: "quarter",
    name: "Quarter-Finals",
    window: "Early October",
    detail:
      "Ten survivors, five head-to-head nights. Group winners are drawn against runners-up from a different group.",
    accent: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  },
  {
    id: "finalist-rr",
    name: "Finalist Round Robin",
    window: "Mid October",
    detail:
      "The last five meet each other once. The table it produces decides who skips the eliminator entirely.",
    accent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  {
    id: "eliminator",
    name: "Eliminator",
    window: "Late October",
    detail: "Rank 2 against Rank 3 for the second grand-final seat. Ranks 4 and 5 go out on the table.",
    accent: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  {
    id: "grand-final",
    name: "Grand Final",
    window: "End October",
    detail: "Rank 1 against the eliminator winner. One night, one champion, one broadcast.",
    accent: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  },
];

export const GROUP_LETTERS = ["A", "B", "C", "D", "E"];

/* ------------------------------------------------------------------ *
 * Fixtures
 * ------------------------------------------------------------------ */

export interface PostSeasonEvent {
  id: string;
  stage: PostStage;
  stageName: string;
  date: Date;
  dateLabel: string;
  weekendLabel: string;
  month: string;
  /** Slot labels, never band names. */
  sideA: string;
  sideB: string;
  context: string;
  city: string;
}

/** Round-robin pairings for n slots. */
function roundRobin(n: number): number[][] {
  const out: number[][] = [];
  for (let a = 1; a <= n; a += 1) for (let b = a + 1; b <= n; b += 1) out.push([a, b]);
  return out;
}

/**
 * Spread `count` fixtures evenly across the given weekends, returning the date
 * for each. Nights land on Friday, Saturday or Sunday of that weekend.
 */
function spread(count: number, weekends: Date[]): Date[] {
  const dayOffsets = [-1, 0, 1];
  const perWeekend = Math.ceil(count / weekends.length);
  const dates: Date[] = [];
  for (let i = 0; i < count; i += 1) {
    const w = Math.min(weekends.length - 1, Math.floor(i / perWeekend));
    const offset = dayOffsets[i % dayOffsets.length];
    dates.push(addDays(weekends[w], offset));
  }
  return dates;
}

function evt(
  id: string,
  stage: StageMeta,
  date: Date,
  sideA: string,
  sideB: string,
  context: string,
  city: string,
): PostSeasonEvent {
  return {
    id,
    stage: stage.id,
    stageName: stage.name,
    date,
    dateLabel: DAY_FMT.format(date),
    weekendLabel: WEEKEND_FMT.format(date),
    month: date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }),
    sideA,
    sideB,
    context,
    city,
  };
}

const stageBy = (id: PostStage) => POST_STAGES.find((s) => s.id === id)!;

/** A zone's lead hub, used as the default host for its own finals. */
function hubOf(z: Zone, i: number): string {
  return z.hubCities[i % z.hubCities.length].city;
}

export function buildPostSeason(): PostSeasonEvent[] {
  const events: PostSeasonEvent[] = [];

  /* ---- July: five regional finals, run in parallel ---- */
  const rrPairs = roundRobin(QUALIFIERS_PER_ZONE);
  ZONE_HUBS.forEach((zone) => {
    const dates = spread(rrPairs.length, JULY);
    rrPairs.forEach(([a, b], i) => {
      events.push(
        evt(
          `rf-${zone.slug}-${i}`,
          stageBy("regional-final"),
          dates[i],
          `${zone.shortName} #${a}`,
          `${zone.shortName} #${b}`,
          `${zone.shortName} Regional Final`,
          hubOf(zone, i),
        ),
      );
    });
  });

  /* ---- Aug–Sep: five groups of five, one band per zone in each ---- */
  const groupPairs = roundRobin(QUALIFIERS_PER_ZONE);
  GROUP_LETTERS.forEach((letter, g) => {
    const dates = spread(groupPairs.length, GROUPS);
    // Snake seeding: group g takes seed ((g + zoneIndex) % 5) + 1 from each zone,
    // so no group is all top seeds and every group has one band per zone.
    const members = ZONE_HUBS.map((z, zi) => `${z.shortName} #${((g + zi) % QUALIFIERS_PER_ZONE) + 1}`);
    groupPairs.forEach(([a, b], i) => {
      events.push(
        evt(
          `grp-${letter}-${i}`,
          stageBy("group"),
          dates[i],
          members[a - 1],
          members[b - 1],
          `Group ${letter}`,
          hubOf(ZONE_HUBS[(g + i) % ZONE_HUBS.length], i),
        ),
      );
    });
  });

  /* ---- Early Oct: quarter-finals, winners drawn against other groups ---- */
  const qfWeekends = OCTOBER.slice(0, 2);
  const qfDates = spread(5, qfWeekends);
  GROUP_LETTERS.forEach((letter, i) => {
    const opponent = GROUP_LETTERS[(i + 1) % GROUP_LETTERS.length];
    events.push(
      evt(
        `qf-${i + 1}`,
        stageBy("quarter"),
        qfDates[i],
        `Group ${letter} winner`,
        `Group ${opponent} runner-up`,
        `Quarter-Final ${i + 1}`,
        hubOf(ZONE_HUBS[i % ZONE_HUBS.length], i),
      ),
    );
  });

  /* ---- Mid Oct: the last five meet each other once ---- */
  const rrWeekends = OCTOBER.slice(2, 4);
  const finalPairs = roundRobin(5);
  const rrDates = spread(finalPairs.length, rrWeekends);
  finalPairs.forEach(([a, b], i) => {
    events.push(
      evt(
        `nrr-${i}`,
        stageBy("finalist-rr"),
        rrDates[i],
        `QF${a} winner`,
        `QF${b} winner`,
        "Finalist Round Robin",
        hubOf(ZONE_HUBS[i % ZONE_HUBS.length], i + 1),
      ),
    );
  });

  /* ---- Late Oct: eliminator, then the final ---- */
  const closing = OCTOBER[OCTOBER.length - 1];
  events.push(
    evt(
      "eliminator",
      stageBy("eliminator"),
      addDays(closing, -1),
      "Rank 2",
      "Rank 3",
      "Eliminator — winner takes the second final seat",
      "National host city",
    ),
  );
  events.push(
    evt(
      "grand-final",
      stageBy("grand-final"),
      addDays(closing, 1),
      "Rank 1",
      "Eliminator winner",
      "Grand Final — National Champion",
      "National host city",
    ),
  );

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const POST_SEASON = buildPostSeason();

/* ------------------------------------------------------------------ *
 * November and December are not fixtures
 * ------------------------------------------------------------------ */

export interface OffStageBlock {
  window: string;
  title: string;
  detail: string;
  items: string[];
}

export const CLOSING_BLOCKS: OffStageBlock[] = [
  {
    window: `November · ${NOVEMBER.length} weekends`,
    title: "Tours & Festival Circuit",
    detail:
      "Not fixtures and not scored. The league acts as a booking network while the audience built over the season is still warm.",
    items: [
      "College and university festival slots",
      "City tours for the national finalists",
      "Brand and corporate events",
      "Year-end festival billings",
      "Post-season films and season documentary",
    ],
  },
  {
    window: `December · ${DECEMBER.length} weekends`,
    title: "Auction & Pre-Season",
    detail:
      "The next season is loaded here: sealed bids, contracting, and the first writing sessions before January.",
    items: [
      "Artist draft — sealed bids against the purse",
      "Contracting and guarantee brackets",
      "Mentor matching from the approved list",
      "Rehearsal blocks and first writing sessions",
      "Fixture release for the new season",
    ],
  },
];

export interface PostSeasonTotals {
  events: number;
  regionalFinals: number;
  groupStage: number;
  knockout: number;
  reconciles: boolean;
}

export function postSeasonTotals(events = POST_SEASON): PostSeasonTotals {
  const count = (s: PostStage) => events.filter((e) => e.stage === s).length;
  const regionalFinals = count("regional-final");
  const groupStage = count("group");
  const knockout = count("quarter") + count("finalist-rr") + count("eliminator") + count("grand-final");
  return {
    events: events.length,
    regionalFinals,
    groupStage,
    knockout,
    // 5 zones x C(5,2), 5 groups x C(5,2), then 5 + 10 + 1 + 1.
    reconciles:
      regionalFinals === ZONE_HUBS.length * 10 && groupStage === 5 * 10 && knockout === 17,
  };
}

export const POST_SEASON_TOTALS = postSeasonTotals();

/** Bands still involved at each step, for the ladder display. */
export const LADDER = [
  { stage: "Regular season", bands: 60, note: "Five regional leagues, Jan–Jun" },
  { stage: "Regional finals", bands: ZONE_HUBS.length * QUALIFIERS_PER_ZONE, note: "Top 5 per zone, July" },
  { stage: "Group stage", bands: ZONE_HUBS.length * QUALIFIERS_PER_ZONE, note: "5 groups of 5, Aug–Sep" },
  { stage: "Quarter-finals", bands: 10, note: "Top 2 per group, October" },
  { stage: "Finalist round robin", bands: 5, note: "QF winners" },
  { stage: "Grand Final", bands: 2, note: "Rank 1 v eliminator winner" },
];
