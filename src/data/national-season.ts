/**
 * The national season architecture.
 *
 * `league-format.ts` holds the zone table and the AP/TS fixture mix. This is the
 * national build: five regional leagues running simultaneously from Season 1, and the
 * annual cycle that carries an artist through the eight months when the league
 * is not playing.
 *
 * The important thing here is the CAPACITY ENGINE. A season plan that cannot
 * physically stage its own fixture list is worthless, so `zoneCapacity()`
 * checks the calendar against the fixture requirement rather than asserting
 * that it works. It is what surfaced the shortfall documented below.
 *
 * Deliberately NOT in this file: hand-keyed weekend dates. The structure is
 * fixed; the actual fixture matrix has to come from a scheduler that knows
 * about venue availability, travel, college calendars, regional holidays and
 * broadcast clashes. What is modelled here is the shape that scheduler has to
 * satisfy.
 */

import {
  ZONE_HUBS,
  NATIONAL_TOTAL_HOUSES,
  NATIONAL_TOTAL_BANDS,
  type Zone,
} from "./league-format";

/* ------------------------------------------------------------------ *
 * The five regional leagues
 * ------------------------------------------------------------------ */

/**
 * A regional league. This is now an alias of the zone definition in
 * `league-format.ts` rather than a second list — the site was publishing two
 * different zone taxonomies and two different band counts before they were
 * merged.
 */
export type NationalZone = Zone;

/** The five regional leagues, straight from the shared zone table. */
export const NATIONAL_ZONES: NationalZone[] = ZONE_HUBS;

export const TOTAL_HOUSES = NATIONAL_TOTAL_HOUSES;
export const TOTAL_BANDS = NATIONAL_TOTAL_BANDS;

/** Individual (solo) fixtures every band plays, in every zone. */
export const INDIVIDUAL_FIXTURES_PER_BAND = 9;
/** Alias used by the schedule generator. */
export const SOLO_FIXTURES_PER_BAND = INDIVIDUAL_FIXTURES_PER_BAND;

export const TOTAL_INDIVIDUAL_FIXTURES = TOTAL_BANDS * INDIVIDUAL_FIXTURES_PER_BAND;

/* ------------------------------------------------------------------ *
 * The regular-season calendar
 * ------------------------------------------------------------------ */

export const SEASON_START_ISO = "2027-01-23";
export const COMPETITION_WEEKENDS = 20;
/** Index (0-based) of the weekend held back as a recovery / content window. */
export const RECOVERY_WEEKEND_INDEX = 9;
export const TOTAL_CALENDAR_WEEKENDS = COMPETITION_WEEKENDS + 1;

/** Minimum days between a band's own official fixtures. */
export const MIN_REST_DAYS = 14;

export interface SeasonWeekend {
  index: number;
  /** Competition number, or null for the recovery weekend. */
  number: number | null;
  date: Date;
  label: string;
  isRecovery: boolean;
  /** Overlaps the listed IPL window — a discovery opportunity, not a clash to flee. */
  iplOverlap: boolean;
}

/**
 * IPL 2027 as currently listed. Treated as a content and discovery window
 * rather than something to schedule around — but flagged, because broadcast
 * fixtures move and the biggest league nights should not sit on the heaviest
 * cricket nights.
 */
export const IPL_WINDOW = {
  startIso: "2027-03-10",
  endIso: "2027-05-15",
  caveat:
    "Listed 2027 IPL window. Broadcast schedules move — treat this as a planning overlay to re-check, never as a fixed constraint.",
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

const FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/**
 * The calendar is generated from one start date rather than typed out, so
 * moving the season is a one-line change instead of re-keying 21 dates.
 */
export function buildSeasonCalendar(startIso = SEASON_START_ISO): SeasonWeekend[] {
  const start = new Date(`${startIso}T00:00:00Z`);
  const iplStart = new Date(`${IPL_WINDOW.startIso}T00:00:00Z`);
  const iplEnd = new Date(`${IPL_WINDOW.endIso}T00:00:00Z`);

  let competitionNumber = 0;
  return Array.from({ length: TOTAL_CALENDAR_WEEKENDS }, (_, i) => {
    const date = addDays(start, i * 7);
    const isRecovery = i === RECOVERY_WEEKEND_INDEX;
    if (!isRecovery) competitionNumber += 1;
    return {
      index: i,
      number: isRecovery ? null : competitionNumber,
      date,
      label: FMT.format(date),
      isRecovery,
      iplOverlap: date >= iplStart && date <= iplEnd,
    };
  });
}

export const SEASON_CALENDAR = buildSeasonCalendar();
export const SEASON_END_LABEL = SEASON_CALENDAR[SEASON_CALENDAR.length - 1].label;

/* ------------------------------------------------------------------ *
 * Capacity — does the calendar actually fit the fixture list?
 * ------------------------------------------------------------------ */

export interface ZoneCapacity {
  zone: NationalZone;
  bands: number;
  /** Official individual fixtures this zone must stage across the season. */
  fixturesNeeded: number;
  /** House weekends each house must be allocated. */
  houseWindowsPerHouse: number;
  /** Concurrent house windows the zone must run each weekend. */
  windowsPerWeekend: number;
  /** Fixtures staged per weekend at that window count. */
  fixturesPerWeekend: number;
  /** What a single house window per weekend would actually deliver. */
  servedBySingleWindow: number;
  shortfallAtSingleWindow: number;
  /** Cross nights: pairings inside each house, counted once per shared stage. */
  crossNights: number;
  crossPerBand: number;
}

export function zoneCapacity(
  zone: NationalZone,
  weekends = COMPETITION_WEEKENDS,
  fixturesPerBand = INDIVIDUAL_FIXTURES_PER_BAND,
): ZoneCapacity {
  const bands = zone.houses * zone.bandsPerHouse;
  const fixturesNeeded = bands * fixturesPerBand;

  // Each house window stages every one of that house's bands once, so a band
  // gets exactly one fixture per window its house is allocated.
  const houseWindowsPerHouse = fixturesPerBand;
  const windowsPerWeekend = (zone.houses * houseWindowsPerHouse) / weekends;
  const fixturesPerWeekend = windowsPerWeekend * zone.bandsPerHouse;

  const servedBySingleWindow = weekends * zone.bandsPerHouse;

  // Every pair of bands inside a house meets once; two acts share the night.
  const pairsPerHouse = (zone.bandsPerHouse * (zone.bandsPerHouse - 1)) / 2;
  const crossNights = zone.houses * pairsPerHouse;

  return {
    zone,
    bands,
    fixturesNeeded,
    houseWindowsPerHouse,
    windowsPerWeekend,
    fixturesPerWeekend,
    servedBySingleWindow,
    shortfallAtSingleWindow: fixturesNeeded - servedBySingleWindow,
    crossNights,
    crossPerBand: zone.bandsPerHouse - 1,
  };
}

export const ZONE_CAPACITY = NATIONAL_ZONES.map((z) => zoneCapacity(z));

export const NATIONAL_CAPACITY = {
  fixturesNeeded: ZONE_CAPACITY.reduce((s, c) => s + c.fixturesNeeded, 0),
  fixturesPerWeekend: ZONE_CAPACITY.reduce((s, c) => s + c.fixturesPerWeekend, 0),
  windowsPerWeekend: ZONE_CAPACITY.reduce((s, c) => s + c.windowsPerWeekend, 0),
  servedBySingleWindow: ZONE_CAPACITY.reduce((s, c) => s + c.servedBySingleWindow, 0),
  shortfallAtSingleWindow: ZONE_CAPACITY.reduce((s, c) => s + c.shortfallAtSingleWindow, 0),
  crossNights: ZONE_CAPACITY.reduce((s, c) => s + c.crossNights, 0),
};

export const TOTAL_LEAGUE_NIGHTS =
  NATIONAL_CAPACITY.fixturesNeeded + NATIONAL_CAPACITY.crossNights;

/** Average days between a band's fixtures at this calendar density. */
export const AVERAGE_REST_DAYS =
  (COMPETITION_WEEKENDS / INDIVIDUAL_FIXTURES_PER_BAND) * 7;

/* ------------------------------------------------------------------ *
 * Illustrative fixture stagger
 *
 * Not a schedule — a demonstration that the constraint set is satisfiable.
 * Bands are offset from one another so the calendar reads as a real fixture
 * list rather than the same weekend repeated.
 * ------------------------------------------------------------------ */

export function generateBandFixtures(
  bandIndex: number,
  weekends = COMPETITION_WEEKENDS,
  fixtures = INDIVIDUAL_FIXTURES_PER_BAND,
): number[] {
  const stride = weekends / fixtures;
  const offset = bandIndex % Math.max(1, Math.floor(stride) + 1);
  const out: number[] = [];
  for (let i = 0; i < fixtures; i += 1) {
    const w = Math.min(weekends - 1, Math.round(offset + i * stride));
    out.push(w);
  }
  return out;
}

/** Smallest gap in a generated pattern, in days — for validating the rest rule. */
export function minGapDays(weekendIndices: number[]): number {
  let min = Infinity;
  for (let i = 1; i < weekendIndices.length; i += 1) {
    min = Math.min(min, (weekendIndices[i] - weekendIndices[i - 1]) * 7);
  }
  return Number.isFinite(min) ? min : 0;
}

/* ------------------------------------------------------------------ *
 * Release calendar
 * ------------------------------------------------------------------ */

export interface ReleaseWindow {
  id: string;
  label: string;
  window: string;
  eligible: boolean;
  rationale: string;
}

export const RELEASE_WINDOWS: ReleaseWindow[] = [
  {
    id: "r1",
    label: "Original 1",
    window: "15–22 Jan",
    eligible: true,
    rationale: "Lands before the league gets serious, so a band arrives at its first fixture with something new to play.",
  },
  {
    id: "r2",
    label: "Original 2",
    window: "12–19 Mar",
    eligible: true,
    rationale: "Drops into the opening of the cricket window, when the country's attention is already on live entertainment.",
  },
  {
    id: "r3",
    label: "Original 3",
    window: "7–14 May",
    eligible: true,
    rationale: "Lands as the cricket window closes and attention moves on, just as the league runs into its closing weekends.",
  },
  {
    id: "r4",
    label: "Original 4",
    window: "Jul–Aug",
    eligible: false,
    rationale: "Post-season development. Commercially valuable, but outside the league window so it earns no Original IP points.",
  },
];

/* ------------------------------------------------------------------ *
 * The annual cycle
 *
 * The league runs six months. The artist does not stop for the other six, and
 * calling that stretch an "off-season" would describe an events company rather
 * than an artist ecosystem.
 * ------------------------------------------------------------------ */

export interface CyclePhase {
  id: string;
  period: string;
  name: string;
  months: number;
  detail: string;
  revenue: string;
  accent: string;
}

export const ANNUAL_CYCLE: CyclePhase[] = [
  {
    id: "league",
    period: "Jan – Jun",
    name: "Regional Leagues",
    months: 6,
    detail: `Five regional leagues run simultaneously across ${COMPETITION_WEEKENDS} competition weekends. Gate, fan voting and the points table.`,
    revenue: "Ticketing · event sponsorship · league media",
    accent: "bg-primary",
  },
  {
    id: "finals",
    period: "July",
    name: "Regional Finals & Development",
    months: 1,
    detail:
      "Each zone crowns its champions and sends its qualifiers up. Post-season shows are commercial gigs, not fixtures — no points attached.",
    revenue: "Finals gate · season documentary · post-season shows",
    accent: "bg-cyan-500",
  },
  {
    id: "national",
    period: "Aug – Oct",
    name: "National Championship",
    months: 3,
    detail:
      "The qualifiers from all five zones meet. Deliberately placed here so it never overlaps the next regional season.",
    revenue: "Broadcast package · national sponsorship · finals gate",
    accent: "bg-purple-500",
  },
  {
    id: "tour",
    period: "November",
    name: "Tours & Festival Circuit",
    months: 1,
    detail:
      "College fests, city tours, brand events and the festival season. The league acts as a booking network rather than a competition.",
    revenue: "Booking fees · festival slots · brand events",
    accent: "bg-amber-500",
  },
  {
    id: "auction",
    period: "December",
    name: "Auction & Pre-Season",
    months: 1,
    detail:
      "The artist draft, contracting and pre-production for the season that opens in January.",
    revenue: "Franchise fees · pre-season partnerships",
    accent: "bg-slate-600",
  },
];

export const ARTIST_SEASON_NOTE =
  "July to December is not an off-season. The league is one of two modules; the music module runs all twelve months, and an artist who vanishes for half the year has no audience left to come back to.";

/* ------------------------------------------------------------------ *
 * National qualification ladder
 * ------------------------------------------------------------------ */

export interface LadderStage {
  stage: string;
  bands: number;
  when: string;
  detail: string;
}

/** Top 5 per zone, not one champion per zone. */
export const QUALIFIERS_PER_ZONE = 5;

export const NATIONAL_LADDER: LadderStage[] = [
  {
    stage: "Regional qualifiers",
    bands: NATIONAL_ZONES.length * QUALIFIERS_PER_ZONE,
    when: "July",
    detail: `Top ${QUALIFIERS_PER_ZONE} from each of the ${NATIONAL_ZONES.length} zones. Sending only one champion per zone would throw away ${TOTAL_BANDS - NATIONAL_ZONES.length} bands in a single step.`,
  },
  {
    stage: "National qualifiers",
    bands: 10,
    when: "August – September",
    detail: "Cross-zone fixtures cut the field to ten. First time a Kerala band meets a North India band on points.",
  },
  {
    stage: "National finalists",
    bands: 5,
    when: "October",
    detail: "Full round robin among the five, same scoring as the regional phase.",
  },
  {
    stage: "National Final",
    bands: 2,
    when: "Late October",
    detail: "One night, one champion, packaged as the broadcast centrepiece of the year.",
  },
];

/* ------------------------------------------------------------------ *
 * Release rotation
 *
 * Two rules drive it: a band waits a full cycle between its own releases, and
 * the houses rotate so no two consecutive releases come from the same stable.
 *
 * Those two rules turn out to be the same rule seen from different ends. A
 * four-band house at a 60-day band cycle releases every 60/4 = 15 days exactly,
 * which is why the 15-day house cadence and the two-month band gap agree
 * without anything having to be forced.
 * ------------------------------------------------------------------ */

export const BAND_RELEASE_CYCLE_DAYS = 60;

export interface ReleaseCadence {
  zone: NationalZone;
  bands: number;
  /** Days between one band's own releases. */
  bandCycleDays: number;
  /** Days between releases from any single house. */
  houseCadenceDays: number;
  /** Days between releases anywhere in the zone. */
  zoneCadenceDays: number;
  perWeek: number;
}

export function releaseCadence(
  zone: NationalZone,
  cycleDays = BAND_RELEASE_CYCLE_DAYS,
): ReleaseCadence {
  const bands = zone.houses * zone.bandsPerHouse;
  const zoneCadenceDays = cycleDays / bands;
  return {
    zone,
    bands,
    bandCycleDays: cycleDays,
    houseCadenceDays: cycleDays / zone.bandsPerHouse,
    zoneCadenceDays,
    perWeek: 7 / zoneCadenceDays,
  };
}

export const RELEASE_CADENCE = NATIONAL_ZONES.map((z) => releaseCadence(z));

export const NATIONAL_RELEASE_CADENCE = {
  bands: TOTAL_BANDS,
  everyDays: BAND_RELEASE_CYCLE_DAYS / TOTAL_BANDS,
  perWeek: (7 * TOTAL_BANDS) / BAND_RELEASE_CYCLE_DAYS,
};

export interface RotationSlot {
  day: number;
  houseNumber: number;
  bandNumber: number;
  label: string;
}

/**
 * One full cycle of a zone's rotation. Houses are interleaved rather than run
 * back to back, so consecutive releases never come from the same house.
 */
export function buildReleaseRotation(
  zone: NationalZone,
  cycleDays = BAND_RELEASE_CYCLE_DAYS,
): RotationSlot[] {
  const bands = zone.houses * zone.bandsPerHouse;
  const step = cycleDays / bands;
  const slots: RotationSlot[] = [];
  for (let i = 0; i < bands; i += 1) {
    // Cycle the house on every slot and advance the band only after a full
    // pass, so the rotation reads H1B1, H2B1, H3B1 … then H1B2, H2B2 …
    const houseNumber = (i % zone.houses) + 1;
    const bandNumber = Math.floor(i / zone.houses) + 1;
    slots.push({
      day: Math.round(i * step),
      houseNumber,
      bandNumber,
      label: `H${houseNumber}·B${bandNumber}`,
    });
  }
  return slots;
}

/* ------------------------------------------------------------------ *
 * The full 2027 fixture schedule
 *
 * Generated from the structure, so it cannot disagree with the capacity
 * engine — the totals are checked against it.
 *
 * Three rules the layout has to satisfy, and each one shaped it:
 *
 *   1. A band never plays twice on the same DAY. It may play twice in a
 *      weekend — its own night and a cross night — which is what lets nine
 *      solo fixtures and three cross nights fit into nine house windows. But
 *      two shows in one afternoon and evening is not a schedule, it is a
 *      mistake, so the day layout below is fixed rather than derived from a
 *      slot counter.
 *   2. Commercial nights spread evenly across a zone's hub cities, rotating
 *      the surplus between bands so no band gets a better draw than another.
 *   3. Campus nights are NOT assigned a hub city. The campus is chosen per
 *      band and locked later, so the schedule says so instead of inventing one.
 * ------------------------------------------------------------------ */

export type EventKind = "commercial" | "campus" | "cross";

export interface ScheduledEvent {
  id: string;
  weekendIndex: number;
  competitionNumber: number;
  date: Date;
  dateLabel: string;
  weekday: string;
  slot: string;
  zoneSlug: string;
  zoneName: string;
  houseNumber: number;
  /** Band numbers within the house. Two of them on a cross night. */
  bands: number[];
  kind: EventKind;
  city: string;
  iplOverlap: boolean;
}

const DAY_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const WEEKDAY_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/** Campus venues are per band and settled later, never a hub city. */
export const CAMPUS_VENUE_LABEL = "Campus · TBC";

/** House windows a band needs — one solo fixture each. */
export const WINDOWS_PER_HOUSE = SOLO_FIXTURES_PER_BAND;

/** Windows carrying a cross night, spread across the season rather than bunched. */
export const CROSS_WINDOWS = [2, 5, 8];

/** Earliest windows are campus, so they land inside Jan-Mar fest season. */
export const CAMPUS_WINDOWS = 4;

/**
 * One day layout for a house weekend, fixed so no band appears twice in a day.
 *
 * On a cross window a house stages six events across Friday to Sunday:
 * two a day, and every band's solo night falls on a different day from its
 * cross night. Verified in `auditSchedule()`.
 */
interface DaySlot {
  /** Days from the weekend's Saturday. */
  offset: number;
  slot: string;
}

const DAYS: DaySlot[] = [
  { offset: -1, slot: "Fri night" },
  { offset: 0, slot: "Sat matinee" },
  { offset: 0, slot: "Sat night" },
  { offset: 1, slot: "Sun matinee" },
  { offset: 1, slot: "Sun night" },
];

/** Distinct pairings inside a house, in a stable order. */
export function housePairings(bands: number): number[][] {
  const out: number[][] = [];
  for (let a = 1; a <= bands; a += 1) {
    for (let b = a + 1; b <= bands; b += 1) out.push([a, b]);
  }
  return out;
}

/**
 * Cross rounds: each round pairs every band exactly once, so a round can be
 * staged in a single weekend without anyone playing two cross nights.
 */
export function crossRounds(bands: number): number[][][] {
  if (bands < 2) return [];
  const rounds: number[][][] = [];
  const fixed = 1;
  let rotating = Array.from({ length: bands - 1 }, (_, i) => i + 2);
  for (let r = 0; r < bands - 1; r += 1) {
    const order = [fixed, ...rotating];
    const round: number[][] = [];
    for (let i = 0; i < bands / 2; i += 1) {
      round.push([order[i], order[bands - 1 - i]]);
    }
    rounds.push(round);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }
  return rounds;
}

/**
 * Which weekends each house is active. Windows are spread as evenly as the
 * calendar allows rather than clustered.
 */
export function houseWindows(zone: NationalZone): Record<number, number[]> {
  const competition = SEASON_CALENDAR.filter((w) => !w.isRecovery);
  const windows: Record<number, number[]> = {};
  for (let h = 1; h <= zone.houses; h += 1) windows[h] = [];

  // Total window-slots to place, dealt round-robin across houses so each gets
  // exactly WINDOWS_PER_HOUSE and no weekend is overloaded.
  const totalSlots = zone.houses * WINDOWS_PER_HOUSE;
  for (let i = 0; i < totalSlots; i += 1) {
    const house = (i % zone.houses) + 1;
    const weekend = competition[Math.floor((i * competition.length) / totalSlots)];
    windows[house].push(weekend.index);
  }
  for (let h = 1; h <= zone.houses; h += 1) windows[h].sort((a, b) => a - b);
  return windows;
}

/**
 * Commercial cities for one band, rotated so the surplus moves between bands.
 * Five nights rarely divide evenly into a zone's hub count, so the offset
 * shifts per band and nobody is permanently handed the smaller market.
 */
function commercialCities(zone: NationalZone, bandKey: number, count: number): string[] {
  const cities = zone.hubCities.map((c) => c.city);
  return Array.from(
    { length: count },
    (_, i) => cities[(i + bandKey) % cities.length],
  );
}

export function buildFullSchedule(): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const byIndex = new Map(SEASON_CALENDAR.map((w) => [w.index, w]));

  NATIONAL_ZONES.forEach((zone) => {
    const rounds = crossRounds(zone.bandsPerHouse);
    const windows = houseWindows(zone);

    Object.entries(windows).forEach(([houseKey, weekendIndices]) => {
      const houseNumber = Number(houseKey);

      // Each band's commercial cities for the season, rotated per band.
      const cityPlan: Record<number, string[]> = {};
      for (let b = 1; b <= zone.bandsPerHouse; b += 1) {
        cityPlan[b] = commercialCities(zone, houseNumber + b, SOLO_FIXTURES_PER_BAND);
      }
      const commercialSeen: Record<number, number> = {};

      weekendIndices.forEach((weekendIndex, j) => {
        const weekend = byIndex.get(weekendIndex);
        if (!weekend || weekend.number === null) return;

        /*
         * Campus nights go EARLY, commercial nights late.
         *
         * Alternating the two spread campus evenly across the season and put
         * half of them in April and May — exam season and summer vacation,
         * when a campus has no audience to play to. Indian fest season runs
         * January to March, so the campus leg is front-loaded into it and the
         * ticketed circuit takes the back half, where it does not care what
         * the academic calendar is doing.
         */
        const kind: EventKind = j < CAMPUS_WINDOWS ? "campus" : "commercial";
        const crossRoundIndex = CROSS_WINDOWS.indexOf(j);
        const round = crossRoundIndex >= 0 ? rounds[crossRoundIndex % rounds.length] : null;

        const push = (
          dayIndex: number,
          bands: number[],
          eventKind: EventKind,
          city: string,
          idSuffix: string,
        ) => {
          const day = DAYS[dayIndex];
          const date = addDays(weekend.date, day.offset);
          events.push({
            id: `${zone.slug}-h${houseNumber}-w${weekend.number}-${idSuffix}`,
            weekendIndex,
            competitionNumber: weekend.number as number,
            date,
            dateLabel: DAY_FMT.format(date),
            weekday: WEEKDAY_FMT.format(date),
            slot: day.slot,
            zoneSlug: zone.slug,
            zoneName: zone.shortName,
            houseNumber,
            bands,
            kind: eventKind,
            city,
            iplOverlap: weekend.iplOverlap,
          });
        };

        const soloCity = (band: number) => {
          if (kind === "campus") return CAMPUS_VENUE_LABEL;
          const n = commercialSeen[band] ?? 0;
          commercialSeen[band] = n + 1;
          return cityPlan[band][n % cityPlan[band].length];
        };

        if (!round) {
          // No cross night: solos spread across the three days.
          for (let b = 1; b <= zone.bandsPerHouse; b += 1) {
            const dayIndex = [0, 1, 3, 2, 4][(b - 1) % 5];
            push(dayIndex, [b], kind, soloCity(b), `b${b}`);
          }
          return;
        }

        /*
         * Cross window. Fixed layout so every band's solo and cross land on
         * different days:
         *   Fri  — solo A1, solo B1
         *   Sat  — cross (A1 v A2), solo B2
         *   Sun  — cross (B1 v B2), solo A2
         * where (A1,A2) and (B1,B2) are the round's two pairings.
         */
        const [pairA, pairB] = [round[0], round[1] ?? round[0]];
        const [a1, a2] = pairA;
        const [b1, b2] = pairB;

        push(0, [a1], kind, soloCity(a1), `b${a1}`);
        if (b1 !== a1) push(0, [b1], kind, soloCity(b1), `b${b1}`);
        push(2, pairA, "cross", zone.hubCities[0].city, `xA`);
        if (b2 !== a1 && b2 !== b1) push(1, [b2], kind, soloCity(b2), `b${b2}`);
        push(4, pairB, "cross", zone.hubCities[0].city, `xB`);
        if (a2 !== a1 && a2 !== b1 && a2 !== b2) push(3, [a2], kind, soloCity(a2), `b${a2}`);
      });
    });
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const FULL_SCHEDULE = buildFullSchedule();

export interface ScheduleTotals {
  events: number;
  commercial: number;
  campus: number;
  cross: number;
  individual: number;
  /** Does the generated schedule match what the capacity engine requires? */
  reconciles: boolean;
  /** Any band appearing twice on one calendar day — must always be zero. */
  sameDayClashes: number;
}

/** Counts a band playing twice in one day, which the layout must never produce. */
export function sameDayClashes(events = FULL_SCHEDULE): number {
  const seen = new Map<string, number>();
  events.forEach((e) => {
    e.bands.forEach((b) => {
      const key = `${e.zoneSlug}-h${e.houseNumber}-b${b}-${e.date.toISOString().slice(0, 10)}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    });
  });
  return [...seen.values()].filter((n) => n > 1).length;
}

export function scheduleTotals(events = FULL_SCHEDULE): ScheduleTotals {
  const commercial = events.filter((e) => e.kind === "commercial").length;
  const campus = events.filter((e) => e.kind === "campus").length;
  const cross = events.filter((e) => e.kind === "cross").length;
  const clashes = sameDayClashes(events);
  return {
    events: events.length,
    commercial,
    campus,
    cross,
    individual: commercial + campus,
    reconciles:
      commercial + campus === NATIONAL_CAPACITY.fixturesNeeded &&
      cross === NATIONAL_CAPACITY.crossNights &&
      clashes === 0,
    sameDayClashes: clashes,
  };
}

export const SCHEDULE_TOTALS = scheduleTotals();

/* ------------------------------------------------------------------ *
 * Release schedule
 *
 * Every band ships three league-eligible originals across the season, on its
 * own 60-day cycle, with start dates staggered so the league publishes
 * continuously while no band is overloaded.
 *
 * Releases are titled by number, never invented song names — the same rule the
 * fixtures and standings follow.
 * ------------------------------------------------------------------ */

/**
 * One release per zone per week — five a week nationally.
 *
 * A 60-day band cycle across 100 bands produced a release a day, which is not
 * a release calendar so much as a queue: every drop competing with the one
 * before it for the same attention. Pacing it at one per zone per week gives
 * each band a week the league can actually push behind, and the season's 21
 * weeks fit a zone's 20 bands exactly, with a spare.
 *
 * Houses rotate so no two consecutive weeks in a zone come from the same
 * stable, and every band gets precisely one in-season release.
 */
export const RELEASES_PER_ZONE_PER_WEEK = 1;
export const RELEASES_PER_BAND = 1;

export interface ReleaseEvent {
  id: string;
  date: Date;
  dateLabel: string;
  /** Season week, 1-indexed. */
  week: number;
  zoneSlug: string;
  zoneName: string;
  houseNumber: number;
  band: number;
  number: number;
  label: string;
}

export function buildReleaseSchedule(): ReleaseEvent[] {
  const out: ReleaseEvent[] = [];

  NATIONAL_ZONES.forEach((zone) => {
    const bandsInZone = zone.houses * zone.bandsPerHouse;
    for (let w = 0; w < bandsInZone; w += 1) {
      const weekend = SEASON_CALENDAR[Math.min(w, SEASON_CALENDAR.length - 1)];
      // Friday of that week — the release lands before the weekend's fixtures.
      const date = addDays(weekend.date, -1);
      const houseNumber = (w % zone.houses) + 1;
      const band = Math.floor(w / zone.houses) + 1;
      out.push({
        id: `${zone.slug}-rel-w${w + 1}`,
        date,
        dateLabel: DAY_FMT.format(date),
        week: w + 1,
        zoneSlug: zone.slug,
        zoneName: zone.shortName,
        houseNumber,
        band,
        number: 1,
        label: "Original",
      });
    }
  });

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const RELEASE_SCHEDULE = buildReleaseSchedule();

export const RELEASE_TOTALS = {
  releases: RELEASE_SCHEDULE.length,
  perBand: RELEASES_PER_BAND,
  perZonePerWeek: RELEASES_PER_ZONE_PER_WEEK,
  perWeekNationally: NATIONAL_ZONES.length * RELEASES_PER_ZONE_PER_WEEK,
  expected: TOTAL_BANDS * RELEASES_PER_BAND,
  reconciles: RELEASE_SCHEDULE.length === TOTAL_BANDS * RELEASES_PER_BAND,
};

/** Releases falling on a given calendar day, for the schedule view. */
export function releasesOn(dateLabel: string): ReleaseEvent[] {
  return RELEASE_SCHEDULE.filter((r) => r.dateLabel === dateLabel);
}
