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
 * Deliberately NOT in this file: 480 invented weekend dates. The structure is
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
export const INDIVIDUAL_FIXTURES_PER_BAND = 8;

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
 * Every event in the regular season, dated and slotted. Generated from the
 * structure rather than typed out, so it can never disagree with the capacity
 * engine above — the totals it produces are checked against it.
 *
 * How a house weekend actually works: the house is in town for three days, so
 * it stages each of its bands once and, on the weekends where a pairing is
 * due, one shared cross night in the Saturday headline slot. A band can play
 * twice in a weekend — its own night and a cross night — which is what makes
 * eight individual fixtures and three cross nights fit into eight windows.
 * ------------------------------------------------------------------ */

export type EventKind = "commercial" | "campus" | "cross";

export interface ScheduleSlot {
  label: string;
  /** Days from the weekend's Saturday. */
  offset: number;
}

/** Five slots across Friday to Sunday — the shape of a house weekend. */
export const SLOTS: ScheduleSlot[] = [
  { label: "Fri night", offset: -1 },
  { label: "Sat matinee", offset: 0 },
  { label: "Sat night", offset: 0 },
  { label: "Sun matinee", offset: 1 },
  { label: "Sun night", offset: 1 },
];

/** The marquee slot, reserved for a cross night when one is due. */
const HEADLINE_SLOT = 2;

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

/** Distinct pairings inside a house, in a stable order. */
export function housePairings(bands: number): number[][] {
  const out: number[][] = [];
  for (let a = 1; a <= bands; a += 1) {
    for (let b = a + 1; b <= bands; b += 1) out.push([a, b]);
  }
  return out;
}

/** Cities repeated in proportion to their share of the zone calendar. */
function cityBag(zone: NationalZone): string[] {
  const bag: string[] = [];
  zone.hubCities.forEach((c) => {
    const n = Math.max(1, Math.round(c.fixtureShare * 20));
    for (let i = 0; i < n; i += 1) bag.push(c.city);
  });
  return bag.length > 0 ? bag : ["TBC"];
}

/**
 * Which weekends each house is active. Two houses run concurrently per zone
 * per weekend, interleaved so a house never plays two weekends back to back
 * more often than the rotation requires.
 */
export function houseWindows(zone: NationalZone): Record<number, number[]> {
  const windows: Record<number, number[]> = {};
  for (let h = 1; h <= zone.houses; h += 1) windows[h] = [];
  const competition = SEASON_CALENDAR.filter((w) => !w.isRecovery);
  competition.forEach((w, i) => {
    const a = ((2 * i) % zone.houses) + 1;
    const b = ((2 * i + 1) % zone.houses) + 1;
    windows[a].push(w.index);
    windows[b].push(w.index);
  });
  return windows;
}

export function buildFullSchedule(): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const byIndex = new Map(SEASON_CALENDAR.map((w) => [w.index, w]));

  NATIONAL_ZONES.forEach((zone) => {
    const bag = cityBag(zone);
    const pairings = housePairings(zone.bandsPerHouse);
    const windows = houseWindows(zone);

    Object.entries(windows).forEach(([houseKey, weekendIndices]) => {
      const houseNumber = Number(houseKey);
      weekendIndices.forEach((weekendIndex, j) => {
        const weekend = byIndex.get(weekendIndex);
        if (!weekend || weekend.number === null) return;

        // A cross night is due on this window if a pairing is still unplayed.
        const pairing = j < pairings.length ? pairings[j] : null;

        // Individual nights first, then the cross night takes the headline slot.
        const slotOrder = SLOTS.map((_, i) => i).filter(
          (i) => !(pairing && i === HEADLINE_SLOT),
        );

        for (let band = 1; band <= zone.bandsPerHouse; band += 1) {
          const slotIndex = slotOrder[(band - 1) % slotOrder.length];
          const slot = SLOTS[slotIndex];
          const date = addDays(weekend.date, slot.offset);
          events.push({
            id: `${zone.slug}-h${houseNumber}-w${weekend.number}-b${band}`,
            weekendIndex,
            competitionNumber: weekend.number,
            date,
            dateLabel: DAY_FMT.format(date),
            weekday: WEEKDAY_FMT.format(date),
            slot: slot.label,
            zoneSlug: zone.slug,
            zoneName: zone.shortName,
            houseNumber,
            bands: [band],
            // Five commercial nights then three campus nights, per band.
            kind: j < 5 ? "commercial" : "campus",
            city: bag[(weekendIndex * 3 + houseNumber + band) % bag.length],
            iplOverlap: weekend.iplOverlap,
          });
        }

        if (pairing) {
          const slot = SLOTS[HEADLINE_SLOT];
          const date = addDays(weekend.date, slot.offset);
          events.push({
            id: `${zone.slug}-h${houseNumber}-w${weekend.number}-cross`,
            weekendIndex,
            competitionNumber: weekend.number,
            date,
            dateLabel: DAY_FMT.format(date),
            weekday: WEEKDAY_FMT.format(date),
            slot: slot.label,
            zoneSlug: zone.slug,
            zoneName: zone.shortName,
            houseNumber,
            bands: pairing,
            kind: "cross",
            city: bag[(weekendIndex + houseNumber) % bag.length],
            iplOverlap: weekend.iplOverlap,
          });
        }
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
}

export function scheduleTotals(events = FULL_SCHEDULE): ScheduleTotals {
  const commercial = events.filter((e) => e.kind === "commercial").length;
  const campus = events.filter((e) => e.kind === "campus").length;
  const cross = events.filter((e) => e.kind === "cross").length;
  return {
    events: events.length,
    commercial,
    campus,
    cross,
    individual: commercial + campus,
    reconciles:
      commercial + campus === NATIONAL_CAPACITY.fixturesNeeded &&
      cross === NATIONAL_CAPACITY.crossNights,
  };
}

export const SCHEDULE_TOTALS = scheduleTotals();
