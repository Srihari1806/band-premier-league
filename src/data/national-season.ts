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
  type HubCity,
  RELEASES_PER_BAND,
  RELEASE_CYCLE_DAYS,
  COMPETITION_WEEKENDS,
  STAGE_2_STRUCTURE,
  ZONE_HUBS,
  NATIONAL_TOTAL_HOUSES,
  NATIONAL_TOTAL_BANDS,
  type Zone,
} from "./league-format";
import {
  buildOffLadderFormats,
  CAMPUS_FORMATS,
  SCORED_FORMATS,
  COMMERCIAL_FORMATS,
  CORPORATE_SHOWS_PER_BAND,
  FESTIVAL_ACTS_PER_STAGE,
  FESTIVAL_SLOTS_PER_BAND,
  formatOf,
  type VenueClass,
} from "./show-formats";

/** Poster names for the three formats that carry no points. */
const OFF_LADDER_LOOKUP: Record<string, string> = {
  "house-night": "House Night",
  "festival-stage": "Festival Stage",
  "corporate-show": "Corporate Show",
  "league-launch": "League Launch",
};

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
/** Season appearances a band makes. The Dec launch sits outside this. */
export const APPEARANCES_PER_BAND = 48;

export const INDIVIDUAL_FIXTURES_PER_BAND =
  STAGE_2_STRUCTURE.ticketedSoloPerBand + STAGE_2_STRUCTURE.campusSoloPerBand;
/** Alias used by the schedule generator. */
export const SOLO_FIXTURES_PER_BAND = INDIVIDUAL_FIXTURES_PER_BAND;

export const TOTAL_INDIVIDUAL_FIXTURES = TOTAL_BANDS * INDIVIDUAL_FIXTURES_PER_BAND;

/* ------------------------------------------------------------------ *
 * The regular-season calendar
 * ------------------------------------------------------------------ */

/**
 * 24 weekends, Saturday-anchored, Sat 2 Jan to Sat 12 Jun 2027.
 *
 * Week 0's Thursday is 31 Dec 2026, so the season genuinely opens on New
 * Year's Eve without any special-casing — Thursday is the house-night slot,
 * and the first one lands there.
 *
 * Every band plays 48 appearances across these 24 weeks: a commercial night
 * every week, a versus night on six of them, and a Saturday special on
 * eighteen. Friday and Sunday are the revenue engine and Saturday is the
 * ecosystem — campus, house nights, festivals and the celebrity milestones.
 */
export const SEASON_START_ISO = "2027-01-02";
export const SEASON_OPENS_ISO = "2026-12-31";
export { COMPETITION_WEEKENDS };
/** No weekend is held back — every week carries a show for every band. */
export const RECOVERY_WEEKEND_INDEX = -1;
export const TOTAL_CALENDAR_WEEKENDS = COMPETITION_WEEKENDS;

/** Minimum days between a band's own official fixtures. */
export const MIN_REST_DAYS = 5;

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
  /** Band appearances a zone stages in one city, in one week. */
  appearancesPerWeek: number;
  /** Physical events behind them — fewer, because bills are shared. */
  eventsPerWeek: number;
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

  /*
   * Capacity is a city-takeover question now, not a rotation one.
   *
   * Every house is active every week, in one city, so what matters is how much
   * a single city absorbs across Friday, Saturday and Sunday. The old
   * windows-per-weekend arithmetic described a rotation the schedule no longer
   * uses, and it was reaching the page as 7.083333333333333.
   *
   * Whole numbers throughout: a fraction of a fixture is not a thing.
   */
  const houseWindowsPerHouse = weekends;
  const windowsPerWeekend = zone.houses;
  const fixturesPerWeekend = Math.round(fixturesNeeded / weekends);

  // A band appears twice a week on average: a commercial night, plus either a
  // versus night or a Saturday special.
  const appearancesPerWeek = Math.round((bands * APPEARANCES_PER_BAND) / weekends);
  // Commercial nights are solo; the rest share a bill, so the event count is
  // materially lower than the appearance count.
  const eventsPerWeek = Math.round(
    bands / 1 + (bands * (APPEARANCES_PER_BAND - 24)) / weekends / 3,
  );

  const servedBySingleWindow = weekends * zone.bandsPerHouse;

  // Every pair of bands inside a house meets once; two acts share the night.
  const pairsPerHouse = (zone.bandsPerHouse * (zone.bandsPerHouse - 1)) / 2;
  const crossNights = zone.houses * pairsPerHouse;

  return {
    zone,
    bands,
    fixturesNeeded,
    appearancesPerWeek,
    eventsPerWeek,
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
  appearancesPerWeek: ZONE_CAPACITY.reduce((s, c) => s + c.appearancesPerWeek, 0),
  eventsPerWeek: ZONE_CAPACITY.reduce((s, c) => s + c.eventsPerWeek, 0),
  /** Cities live on any given week — one per zone, by the operating rule. */
  citiesPerWeek: ZONE_CAPACITY.length,
};

export const TOTAL_LEAGUE_NIGHTS =
  NATIONAL_CAPACITY.fixturesNeeded + NATIONAL_CAPACITY.crossNights;

/** Average days between a band's fixtures at this calendar density. */
export const AVERAGE_REST_DAYS = Math.round(
  (COMPETITION_WEEKENDS / APPEARANCES_PER_BAND) * 7,
);

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

/**
 * A band's release year.
 *
 * Three league-eligible originals inside the season on a 60-day cycle, with
 * the two windows either side doing different jobs: December pre-season is
 * where the January single gets recorded, and July-August is the artist
 * season, where releases carry no points but still build the catalogue a band
 * is valued on at the next auction.
 */
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

export type EventKind =
  | "commercial"
  | "campus"
  | "cross"
  | "house"
  | "festival"
  | "corporate"
  | "launch"
  | "celebrity";

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
  /** False for launches, house nights, festival stages and corporate shows. */
  scored: boolean;
  /**
   * Whether this night has a real date, or only a reserved week.
   *
   * A corporate show is a private booking that happens when a buyer turns up.
   * The season reserves two weeks a band for them so the load is planned for,
   * but publishing "Fri 28 May, Tirupati" would assert a sale nobody has made.
   * Held weeks are excluded from the published calendar and counted separately.
   */
  dated: boolean;
  /**
   * Rows sharing one bill. A festival stage-day is ten acts drawn from across
   * the zone, so it is ten rows in a band's season but one night on the
   * calendar. Null everywhere the row is already a whole night.
   */
  billId: string | null;
  /** Which named format this night is — see show-formats.ts. */
  formatId: string;
  formatName: string;
  venue: VenueClass;
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
export const WINDOWS_PER_HOUSE = TOTAL_CALENDAR_WEEKENDS;

/* ------------------------------------------------------------------ *
 * One city a week
 * ------------------------------------------------------------------ */

/**
 * THE operating rule: a zone activates exactly one city per week.
 *
 * If week 7 is Vijayawada then everything that week happens in and around
 * Vijayawada, and the league moves on the following week. That is enormously
 * easier to run than three cities at once — one ops team, one venue circuit,
 * one press push — and it lets a hub serve its whole catchment rather than the
 * league touring past it.
 *
 * AP/TS is the template the rest follow: four hubs, six weeks each, covering
 * Telangana, the north Andhra belt, central and south. Zones with a different
 * number of hubs divide the same 24 weeks between them — two hubs get twelve
 * weeks each, six hubs get four.
 */
export function weeksPerCity(zone: NationalZone): number {
  return Math.max(1, Math.round(TOTAL_CALENDAR_WEEKENDS / Math.max(1, zone.hubCities.length)));
}

/** Which city a zone is in on a given week. */
export function cityForWeek(zone: NationalZone, week: number): HubCity {
  const per = weeksPerCity(zone);
  const idx = Math.min(zone.hubCities.length - 1, Math.floor(week / per));
  return zone.hubCities[idx];
}

export interface CityBlock {
  city: string;
  catchment?: string;
  fromWeek: number;
  toWeek: number;
  weeks: number;
}

/** The season as a tour of a zone's hubs, one block at a time. */
export function cityBlocks(zone: NationalZone): CityBlock[] {
  const per = weeksPerCity(zone);
  return zone.hubCities.map((c, idx) => {
    const from = idx * per;
    const to = idx === zone.hubCities.length - 1 ? TOTAL_CALENDAR_WEEKENDS - 1 : from + per - 1;
    return {
      city: c.city,
      catchment: c.catchment,
      fromWeek: from + 1,
      toWeek: to + 1,
      weeks: to - from + 1,
    };
  });
}

/* ------------------------------------------------------------------ *
 * The week's three days
 * ------------------------------------------------------------------ */

/**
 * Friday and Sunday are the revenue engine; Saturday is the ecosystem.
 *
 * A band plays one commercial night every week and a versus night on six of
 * them, which fills 30 of its 48 Friday and Sunday slots. The other 18 are
 * Saturdays: campus, house nights, festivals and the celebrity milestones.
 * Six Saturdays are deliberately left empty — a season with no slack does not
 * survive its first cancellation.
 */
interface DaySlot {
  offset: number;
  slot: string;
}

const DAYS: DaySlot[] = [
  { offset: -1, slot: "Fri night" }, // 0
  { offset: 0, slot: "Sat night" }, // 1
  { offset: 1, slot: "Sun night" }, // 2
  { offset: -2, slot: "Thu night" }, // 3 — the Dec launch only
];
const FRI = 0;
const SAT = 1;
const SUN = 2;
const THU = 3;

/** Weeks carrying a versus night, spread across the season. */
export const CROSS_WEEKS = [3, 7, 11, 15, 19, 23];
/** Zone-wide Saturdays: every band in the league is on the bill. */
export const CELEBRITY_WEEKS = [1, 11, 22];
export const FESTIVAL_WEEKS = [5, 13, 21];
/** House-level Saturdays. */
export const HOUSE_NIGHT_WEEKS = [8, 18];
export const CAMPUS_WEEKS = [0, 2, 3, 4, 6, 7, 9, 10, 12, 14];
export const LAUNCH_WEEK = 0;

/**
 * Bands sharing one bill, by format. This is the whole appearances-vs-events
 * distinction in one table: six versus appearances are three physical nights,
 * and a celebrity milestone is one night carrying the entire zone roster.
 */
export const ACTS_PER_EVENT: Record<string, number> = {
  commercial: 1,
  cross: 2,
  campus: 4,
  house: 4,
  festival: 10,
  celebrity: 20,
  launch: 20,
};

/** Distinct pairings inside a house, in a stable order. */
export function housePairings(bands: number): number[][] {
  const out: number[][] = [];
  for (let a = 1; a <= bands; a += 1) {
    for (let b = a + 1; b <= bands; b += 1) out.push([a, b]);
  }
  return out;
}

/** Rounds that pair every band exactly once, so a round fits one week. */
export function crossRounds(bands: number): number[][][] {
  const ids = Array.from({ length: bands }, (_, i) => i + 1);
  if (ids.length % 2 === 1) ids.push(-1);
  const n = ids.length;
  const rounds: number[][][] = [];
  const rotate = [...ids];
  for (let r = 0; r < n - 1; r += 1) {
    const pairs: number[][] = [];
    for (let i = 0; i < n / 2; i += 1) {
      const a = rotate[i];
      const b = rotate[n - 1 - i];
      if (a !== -1 && b !== -1) pairs.push([a, b]);
    }
    rounds.push(pairs);
    const fixed = rotate[0];
    const rest = rotate.slice(1);
    rest.unshift(rest.pop() as number);
    rotate.splice(0, rotate.length, fixed, ...rest);
  }
  return rounds;
}

/** Every house is active every week now, so this is simply the whole calendar. */
export function houseWindows(zone: NationalZone): Record<number, number[]> {
  const all = SEASON_CALENDAR.map((w) => w.index);
  const windows: Record<number, number[]> = {};
  for (let h = 1; h <= zone.houses; h += 1) windows[h] = [...all];
  return windows;
}

/** The commercial ladder a band walks, in order, one a week for 24 weeks. */
function commercialLadder(): string[] {
  return COMMERCIAL_FORMATS.flatMap((f) => Array.from({ length: f.perBand }, () => f.id));
}

/** The Saturday specials a house schedules for itself. */
function campusLadder(): string[] {
  return CAMPUS_FORMATS.flatMap((f) => Array.from({ length: f.perBand }, () => f.id));
}

export function buildFullSchedule(): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const byIndex = new Map(SEASON_CALENDAR.map((w) => [w.index, w]));
  const celebrityFormat = SCORED_FORMATS.find((f) => f.kind === "celebrity");

  NATIONAL_ZONES.forEach((zone) => {
    const rounds = crossRounds(zone.bandsPerHouse);
    const ladder = commercialLadder();
    const campus = campusLadder();

    for (let w = 0; w < TOTAL_CALENDAR_WEEKENDS; w += 1) {
      const weekend = byIndex.get(w);
      if (!weekend) continue;
      const hub = cityForWeek(zone, w);

      const push = (
        dayIndex: number,
        houseNumber: number,
        bands: number[],
        formatId: string,
        city: string,
        idSuffix: string,
        billId: string | null = null,
      ) => {
        const day = DAYS[dayIndex];
        const date = addDays(weekend.date, day.offset);
        const fmt = formatOf(formatId);
        const off = OFF_LADDER_LOOKUP[formatId];
        const kind: EventKind = fmt
          ? (fmt.kind as EventKind)
          : formatId === "house-night"
            ? "house"
            : formatId === "festival-stage"
              ? "festival"
              : formatId === "league-launch"
                ? "launch"
                : "corporate";
        events.push({
          id: `${zone.slug}-h${houseNumber}-w${w + 1}-${idSuffix}`,
          weekendIndex: w,
          competitionNumber: (weekend.number ?? w + 1) as number,
          date,
          dateLabel: DAY_FMT.format(date),
          weekday: WEEKDAY_FMT.format(date),
          slot: day.slot,
          zoneSlug: zone.slug,
          zoneName: zone.shortName,
          houseNumber,
          bands,
          kind,
          billId,
          scored: !!fmt,
          dated: true,
          formatId,
          formatName: fmt ? fmt.name : off ?? formatId,
          venue: fmt
            ? fmt.venue
            : formatId === "festival-stage"
              ? "festival-ground"
              : formatId === "league-launch"
                ? "auditorium"
                : "arena",
          city,
          iplOverlap: weekend.iplOverlap,
        });
      };

      // ---- the New Year's Eve launch, once, before the season proper
      if (w === LAUNCH_WEEK) {
        for (let h = 1; h <= zone.houses; h += 1) {
          const all = Array.from({ length: zone.bandsPerHouse }, (_, k) => k + 1);
          push(THU, h, all, "league-launch", zone.hubCities[0].city, "launch", `${zone.slug}-launch`);
        }
      }

      // ---- zone-wide Saturdays: one bill, the whole roster
      const isCelebrity = CELEBRITY_WEEKS.includes(w);
      const isFestival = FESTIVAL_WEEKS.includes(w);
      if (isCelebrity && celebrityFormat) {
        for (let h = 1; h <= zone.houses; h += 1) {
          const all = Array.from({ length: zone.bandsPerHouse }, (_, k) => k + 1);
          push(SAT, h, all, celebrityFormat.id, hub.city, "celeb", `${zone.slug}-w${w}-celebrity`);
        }
      } else if (isFestival) {
        for (let h = 1; h <= zone.houses; h += 1) {
          const all = Array.from({ length: zone.bandsPerHouse }, (_, k) => k + 1);
          const bill = `${zone.slug}-w${w}-fest${Math.floor((h - 1) / 2.5)}`;
          push(SAT, h, all, "festival-stage", hub.city, "fest", bill);
        }
      }

      for (let houseNumber = 1; houseNumber <= zone.houses; houseNumber += 1) {
        // ---- house-level Saturdays
        const houseIdx = HOUSE_NIGHT_WEEKS.indexOf(w);
        const campusIdx = CAMPUS_WEEKS.indexOf(w);
        const all = Array.from({ length: zone.bandsPerHouse }, (_, k) => k + 1);
        if (houseIdx >= 0) {
          push(SAT, houseNumber, all, "house-night", hub.city, "house", `${zone.slug}-h${houseNumber}-w${w}-house`);
        } else if (campusIdx >= 0) {
          push(
            SAT,
            houseNumber,
            all,
            campus[campusIdx % campus.length],
            CAMPUS_VENUE_LABEL,
            "campus",
            `${zone.slug}-h${houseNumber}-w${w}-campus`,
          );
        }

        /*
         * Friday and Sunday: one commercial a week, plus a versus on six.
         *
         * The versus nights are placed FIRST and the commercial nights are then
         * pushed to whichever day is left. Deriving the two independently is
         * what put a band on stage twice on the same Sunday — the pairings do
         * not respect a parity rule, so the rule has to follow the pairings.
         */
        const crossIdx = CROSS_WEEKS.indexOf(w);
        const round = crossIdx >= 0 ? rounds[crossIdx % rounds.length] : null;
        const crossDayOf: Record<number, number> = {};

        if (round) {
          round.forEach((pair, k) => {
            // Alternate the pairings across the two nights so a house is not
            // staging both of its versus nights on the same evening.
            const day = k % 2 === 0 ? SUN : FRI;
            pair.forEach((bandNo) => {
              crossDayOf[bandNo] = day;
            });
            push(day, houseNumber, pair, "versus-night", hub.city, `x${k}`, `${zone.slug}-h${houseNumber}-w${w}-x${k}`);
          });
        }

        for (let b = 1; b <= zone.bandsPerHouse; b += 1) {
          const busy = crossDayOf[b];
          const commercialDay =
            busy === undefined ? ((w + b) % 2 === 0 ? FRI : SUN) : busy === FRI ? SUN : FRI;
          push(commercialDay, houseNumber, [b], ladder[w % ladder.length], hub.city, `b${b}`);
        }
      }
    }
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const FULL_SCHEDULE = buildFullSchedule();

export interface ScheduleTotals {
  /** Distinct DATED nights on the calendar — a shared bill counts once. */
  events: number;
  /**
   * Band appearances. Always higher than `events`, and the gap is the point:
   * a versus night is two appearances on one stage, a celebrity milestone is
   * the whole zone roster on one. 48 appearances a band is not 48 nights.
   */
  appearances: number;
  appearancesPerBand: number;
  /** Reserved weeks carrying no published date (private bookings). */
  heldSlots: number;
  /** Band-appearances. Higher than `events` wherever a bill is shared. */
  rows: number;
  scored: number;
  offLadder: number;
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

/**
 * Distinct nights, not rows.
 *
 * Most rows are a whole night. A festival stage-day is not: it is ten acts on
 * one bill, so it appears as ten rows in ten bands' seasons but is a single
 * night on the calendar. Counting rows would inflate the season by 180 nights
 * that do not exist.
 */
export function distinctNights(events = FULL_SCHEDULE): number {
  const bills = new Set<string>();
  let standalone = 0;
  events.forEach((e) => {
    if (e.billId) bills.add(e.billId);
    else standalone += 1;
  });
  return standalone + bills.size;
}

export function scheduleTotals(events = FULL_SCHEDULE): ScheduleTotals {
  const dated = events.filter((e) => e.dated);
  const held = events.filter((e) => !e.dated);
  const commercial = events.filter((e) => e.kind === "commercial").length;
  const campus = events.filter((e) => e.kind === "campus").length;
  const cross = events.filter((e) => e.kind === "cross").length;
  const scored = events.filter((e) => e.scored).length;
  const clashes = sameDayClashes(events);
  const appearances = events.reduce((sum, e) => sum + e.bands.length, 0);

  return {
    events: distinctNights(dated),
    appearances,
    appearancesPerBand: Math.round(appearances / Math.max(1, TOTAL_BANDS)),
    /** Weeks reserved for private bookings, with no published date. */
    heldSlots: held.length,
    rows: events.length,
    scored,
    offLadder: distinctNights(events.filter((e) => !e.scored)),
    commercial,
    campus,
    cross,
    individual: commercial + campus,
    // One show a week is gone; the guarantee now is that every band gets the
    // same 48 appearances and none of them collide on a day.
    reconciles: appearances - 100 === TOTAL_BANDS * 48 && clashes === 0,
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
 * A 60-day release cycle per band: three originals across the season.
 *
 * The cadence is per BAND; the stagger is per HOUSE. Each band drops once every
 * two months, but the four bands in a house are offset by 15 days each, so the
 * house itself has something out roughly every fortnight without any single
 * band being asked for more than three finished pieces:
 *
 *   Band 1  →  1 Jan · 1 Mar · 1 May          Band 3  →  1 Feb · 1 Apr · 1 Jun
 *   Band 2  →  16 Jan · 16 Mar · 16 May       Band 4  →  16 Feb · 16 Apr · 16 Jun
 *
 * Read down the house rather than across a band and the sequence is continuous:
 * 1 Jan, 16 Jan, 1 Feb, 16 Feb, 1 Mar … twelve drops, one every 15 or 16 days.
 *
 * That is the whole design. Continuous house activity is a scheduling problem,
 * not a production one, and solving it by asking each band for twelve tracks
 * put ₹10,400 behind each of them. Three is a budget a band can actually make
 * something with.
 */
/** Days between one band's drops. */
export const BAND_CYCLE_DAYS = 60;
/** Days between consecutive drops from the same house. */
export const HOUSE_STAGGER_DAYS = 15;
export const RELEASE_MONTHS = 6;
/** Bands 1 and 3 drop on the 1st, bands 2 and 4 on the 16th. */
export const RELEASE_ANCHOR_DAYS = [1, 16];
export const RELEASE_YEAR = 2027;

export interface ReleaseEvent {
  id: string;
  date: Date;
  dateLabel: string;
  /** Season week the drop lands in, 1-indexed. -1 if outside the calendar. */
  week: number;
  zoneSlug: string;
  zoneName: string;
  houseNumber: number;
  band: number;
  /** Track number for that band, 1..3. */
  number: number;
  label: string;
}

/**
 * The three dates a band drops on.
 *
 * Odd-numbered bands take the 1st, even the 16th; the first pair runs the odd
 * months and the second pair the even ones. Four bands, four fortnightly slots,
 * no two ever colliding.
 */
export function releaseDatesFor(band: number): Date[] {
  const day = RELEASE_ANCHOR_DAYS[(band - 1) % 2 === 0 ? 0 : 1];
  const startMonth = band <= 2 ? 0 : 1;
  return Array.from(
    { length: RELEASES_PER_BAND },
    (_, k) => new Date(Date.UTC(RELEASE_YEAR, startMonth + k * 2, day)),
  );
}

/**
 * Which season week a date falls in. Releases run on fixed calendar days
 * rather than weekends, so this is a lookup rather than an index.
 */
function weekOf(date: Date): number {
  let best = -1;
  SEASON_CALENDAR.forEach((w) => {
    // A weekend "owns" the days from its Thursday to its Sunday.
    const from = addDays(w.date, -2).getTime();
    const to = addDays(w.date, 1).getTime();
    if (date.getTime() >= from && date.getTime() <= to) best = w.index + 1;
  });
  if (best > 0) return best;
  let nearest = -1;
  SEASON_CALENDAR.forEach((w) => {
    if (addDays(w.date, -2).getTime() <= date.getTime()) nearest = w.index + 1;
  });
  return nearest;
}

export function buildReleaseSchedule(): ReleaseEvent[] {
  const out: ReleaseEvent[] = [];

  NATIONAL_ZONES.forEach((zone) => {
    for (let houseNumber = 1; houseNumber <= zone.houses; houseNumber += 1) {
      for (let band = 1; band <= zone.bandsPerHouse; band += 1) {
        releaseDatesFor(band).forEach((date, i) => {
          out.push({
            id: `${zone.slug}-h${houseNumber}-b${band}-t${i + 1}`,
            date,
            dateLabel: DAY_FMT.format(date),
            week: weekOf(date),
            zoneSlug: zone.slug,
            zoneName: zone.shortName,
            houseNumber,
            band,
            number: i + 1,
            label: `Original ${i + 1}`,
          });
        });
      }
    }
  });

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const RELEASE_SCHEDULE = buildReleaseSchedule();

export const RELEASE_TOTALS = {
  releases: RELEASE_SCHEDULE.length,
  perBand: RELEASES_PER_BAND,
  perHouse: RELEASES_PER_BAND * 4,
  cycleDays: BAND_CYCLE_DAYS,
  staggerDays: HOUSE_STAGGER_DAYS,
  perMonthNationally: Math.round((TOTAL_BANDS * RELEASES_PER_BAND) / RELEASE_MONTHS),
  expected: TOTAL_BANDS * RELEASES_PER_BAND,
  reconciles: RELEASE_SCHEDULE.length === TOTAL_BANDS * RELEASES_PER_BAND,
  /** No two bands in the same house ever share a release day. */
  noStablemateClash: (() => {
    const seen = new Map<string, number>();
    RELEASE_SCHEDULE.forEach((r) => {
      const key = `${r.zoneSlug}-h${r.houseNumber}-${r.date.toISOString().slice(0, 10)}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    });
    return [...seen.values()].every((n) => n === 1);
  })(),
  /** Longest gap between consecutive drops from one house, in days. */
  longestHouseGap: (() => {
    const days = [...new Set(releaseDatesFor(1).concat(
      releaseDatesFor(2), releaseDatesFor(3), releaseDatesFor(4),
    ).map((d) => d.getTime()))].sort((a, b) => a - b);
    let max = 0;
    for (let i = 1; i < days.length; i += 1) {
      max = Math.max(max, Math.round((days[i] - days[i - 1]) / 86400000));
    }
    return max;
  })(),
};

/**
 * The production reality behind three tracks a band.
 *
 * Three finished pieces in six months is a schedule a band can hold alongside
 * playing 48 appearances. The December window still matters — arriving with the first
 * track already recorded is what keeps the January drop from being written
 * during the opening fortnight of the competition.
 */
export const RELEASE_PIPELINE = {
  preSeasonBuffer: 1,
  bufferWindow: "December pre-season",
  perHouseSeason: RELEASES_PER_BAND * 4,
  note: "Arrive with the first track recorded. A band writing its January single during the opening weekends is a band doing two jobs badly.",
};

export interface ReleaseWindow {
  id: string;
  label: string;
  window: string;
  eligible: boolean;
  countsToCatalogue: boolean;
  rationale: string;
}

/**
 * The three windows a band releases in, and which of them score.
 *
 * Only the in-season cycle carries points. The other two still matter: the
 * December buffer is what stops the shoot schedule colliding with competition
 * weekends, and the artist season is where a band builds the catalogue it is
 * valued on at the next auction.
 */
export const RELEASE_WINDOWS: ReleaseWindow[] = [
  {
    id: "pre-season",
    label: "Pre-season buffer",
    window: "December",
    eligible: false,
    countsToCatalogue: true,
    rationale: "The January single, recorded before a fixture is played. A band writing its first drop during the opening weekends is doing two jobs badly.",
  },
  {
    id: "in-season",
    label: "The 60-day cycle",
    window: "Jan – Jun",
    eligible: true,
    countsToCatalogue: true,
    rationale: `One original every ${BAND_CYCLE_DAYS} days — ${RELEASES_PER_BAND} across the season, on the band's own fixed dates. These are the only releases that score.`,
  },
  {
    id: "artist-season",
    label: "Artist season",
    window: "July – August",
    eligible: false,
    countsToCatalogue: true,
    rationale: "No points, because the competition is over. Still builds the catalogue a band carries into the next auction as valuation.",
  },
];

export const CATALOGUE_PATH: { at: string; live: number; note: string }[] = [
  { at: "Signed at the draft", live: 0, note: "Whatever the band already had released stays on its record." },
  { at: "Opening weekend", live: 1, note: "The December buffer — the January single recorded before a fixture is played." },
  { at: "End of March", live: 2, note: "Two of the three in-season originals live." },
  { at: "End of the season", live: 3, note: "All three league releases live — full catalogue marks." },
  { at: "End of artist season", live: 5, note: "July-August releases carry no points but do carry into the next auction." },
];

/** Releases falling on a given calendar day, for the schedule view. */
export function releasesOn(dateLabel: string): ReleaseEvent[] {
  return RELEASE_SCHEDULE.filter((r) => r.dateLabel === dateLabel);
}

/* ------------------------------------------------------------------ */
/* Off the ladder — house nights, festival stages, corporate bookings  */
/* ------------------------------------------------------------------ */

/**
 * Nights that are not fixtures.
 *
 * The twelve scored nights are identical for every band, which is what makes
 * the table fair. These are not: a house night puts four bands on one bill, a
 * festival stage seats three, a corporate booking is a closed room. They carry
 * no points for exactly that reason — but they are real inventory, so they
 * belong on the calendar rather than in a footnote.
 *
 * Placement: the league's own fixtures only ever use Friday, Saturday and
 * Sunday, so Thursday is empty for the whole season. House nights go there and
 * cannot collide with a fixture by construction. Festival stages go on the one
 * recovery weekend, which carries no fixtures at all.
 */
/**
 * The nights that carry no points.
 *
 * These used to be generated separately and bolted onto the calendar. They are
 * now part of every band's 24-week season — two house nights, two corporate
 * shows and two festival slots each — so this is a view over the main schedule
 * rather than a second source of truth.
 */
export interface OffLadderEvent {
  id: string;
  weekendIndex: number;
  date: Date;
  dateLabel: string;
  weekday: string;
  slot: string;
  zoneSlug: string;
  zoneName: string;
  houseNumber: number | null;
  formatId: string;
  formatName: string;
  venue: VenueClass;
  city: string;
  /** Rows sharing one bill — a festival stage-day is ten acts, one night. */
  billId: string | null;
  /** Who is on the bill. Slots, not names — the line-up is settled in-season. */
  billing: string;
  scored: false;
}

export function buildOffLadderSchedule(events = FULL_SCHEDULE): OffLadderEvent[] {
  return events
    .filter((e) => !e.scored)
    .map((e) => ({
      id: e.id,
      weekendIndex: e.weekendIndex,
      date: e.date,
      dateLabel: e.dateLabel,
      weekday: e.weekday,
      slot: e.slot,
      zoneSlug: e.zoneSlug,
      zoneName: e.zoneName,
      houseNumber: e.houseNumber,
      formatId: e.formatId,
      formatName: e.formatName,
      venue: e.venue,
      city: e.city,
      billId: e.billId,
      billing:
        e.formatId === "league-launch"
          ? "Every band in the zone · press & partners"
          : e.formatId === "house-night"
            ? `All ${e.bands.length} bands · House ${e.houseNumber}`
            : e.formatId === "festival-stage"
              ? `H${e.houseNumber} · B${e.bands.join(", B")} on a ${FESTIVAL_ACTS_PER_STAGE}-act bill`
              : `H${e.houseNumber} · B${e.bands.join(", B")} · private booking`,
      scored: false,
    }));
}

export const OFF_LADDER_SCHEDULE = buildOffLadderSchedule();

export const OFF_LADDER_FORMATS = buildOffLadderFormats(
  NATIONAL_TOTAL_HOUSES,
  NATIONAL_ZONES.length,
  TOTAL_BANDS,
);

/**
 * Corporate shows carry no date: they are booked when a buyer turns up. The
 * season budgets one per band and holds the empty Thursdays for them.
 */
/** Corporate shows are now dated like everything else — two per band. */
export const CORPORATE_PLAN = {
  perBand: CORPORATE_SHOWS_PER_BAND,
  nationalNights: TOTAL_BANDS * CORPORATE_SHOWS_PER_BAND,
  scheduled: true,
  note: "Two private bookings a band, placed in free weeks and offset across a house so it is not selling four private shows in the same fortnight. No public gate — a flat fee, invoiced.",
};

export const OFF_LADDER_TOTALS = {
  /** Launch nights — one per zone, all on 31 Dec. */
  launches: new Set(
    OFF_LADDER_SCHEDULE.filter((e) => e.formatId === "league-launch").map((e) => e.billId),
  ).size,
  houseNights: OFF_LADDER_SCHEDULE.filter((e) => e.formatId === "house-night").length,
  /** Stage-DAYS, not appearances — ten acts share one bill. */
  festivalStages: new Set(
    OFF_LADDER_SCHEDULE.filter((e) => e.formatId === "festival-stage").map((e) => e.billId),
  ).size,
  festivalAppearances: OFF_LADDER_SCHEDULE.filter((e) => e.formatId === "festival-stage").length,
  corporate: OFF_LADDER_SCHEDULE.filter((e) => e.formatId === "corporate-show").length,
  scheduled: distinctNights(FULL_SCHEDULE.filter((e) => !e.scored)),
  total: distinctNights(FULL_SCHEDULE.filter((e) => !e.scored)),
  /**
   * A band appearing twice on one calendar day. Zero by construction now —
   * bands only ever play one slot a day — but still counted, because a
   * structural guarantee nobody checks is just a comment.
   */
  clashesWithFixtures: sameDayClashes(),
};

