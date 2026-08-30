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
 * Every band plays 24 shows across these 24 weeks, which is exactly one show
 * a week. That is not a coincidence to be tidied away later: it is what makes
 * a same-day double-booking structurally impossible rather than merely
 * checked for.
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

/**
 * A band's release year.
 *
 * Only ONE release is league-eligible and in-season — the band's assigned week
 * in the zone rotation. That is deliberate: pacing at one per zone per week is
 * what gives each release a week the league can push behind.
 *
 * Which raises the obvious question the catalogue metric asks: how does a band
 * have three originals live if it only ships one during the season? From the
 * two windows either side. December pre-season is where the draft money goes
 * into recording, and July-August is the artist season. A band arrives at its
 * first fixture with a catalogue rather than building one mid-competition.
 */
export interface ReleaseWindow {
  id: string;
  label: string;
  window: string;
  eligible: boolean;
  countsToCatalogue: boolean;
  rationale: string;
}

export const RELEASE_WINDOWS: ReleaseWindow[] = [
  {
    id: "pre",
    label: "Pre-season recording",
    window: "December",
    eligible: false,
    countsToCatalogue: true,
    rationale:
      "Straight after the draft, financed by the house. Earns no fixture points, but it is live before the season opens — so it counts toward the catalogue score from matchday one.",
  },
  {
    id: "season",
    label: "The league release",
    window: "The band's assigned week, Jan–Jun",
    eligible: true,
    countsToCatalogue: true,
    rationale:
      "One per band, on the Friday before that week's fixtures. The zone releases one a week and the houses rotate, so the band gets the league's channels behind it rather than a slot in a queue.",
  },
  {
    id: "post",
    label: "Artist season",
    window: "July – August",
    eligible: false,
    countsToCatalogue: true,
    rationale:
      "The league has stopped; the artist has not. Commercially the most valuable window of the year, and it builds the catalogue a band carries into the next auction.",
  },
];

/**
 * Catalogue reconciliation — the honest version.
 *
 * Three originals live scores the full 5 catalogue points. Only one of them
 * comes from the season itself, so a band needs the pre-season release plus
 * either prior catalogue or a second December track to be at full marks on
 * opening weekend.
 */
export const CATALOGUE_PATH: { at: string; live: number; note: string }[] = [
  { at: "Signed at the draft", live: 0, note: "Whatever the band already had released stays on its record." },
  { at: "Opening weekend", live: 2, note: "Pre-season recording plus existing catalogue." },
  { at: "After its league release", live: 3, note: "Full catalogue marks for the rest of the season." },
  { at: "End of artist season", live: 4, note: "Carried into the next auction as valuation." },
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

export type EventKind =
  | "commercial"
  | "campus"
  | "cross"
  | "house"
  | "festival"
  | "corporate"
  | "launch";

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
  /** False for house nights, festival stages and corporate shows. */
  scored: boolean;
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

/**
 * Weeks a house spends on each shared format. Every band in the house is on
 * stage together on these, so they are house-level decisions rather than
 * band-level ones.
 *
 * Cross weeks are spread across the season; house nights sit early and late so
 * the house sells its roster once before the table matters and once after.
 */
export const CROSS_WEEKS = [5, 12, 19];
/** Moved off week 0 — that Thursday belongs to the launch. */
export const HOUSE_NIGHT_WEEKS = [3, 20];

/**
 * The league launch: Thu 31 Dec 2026, the Thursday of week 1.
 *
 * One per zone, every band in that league on the same stage with the press in
 * the room. It sits OUTSIDE the 24-show season rather than consuming a slot —
 * a band launches on the Thursday and plays its first fixture that weekend,
 * which is what a launch is for.
 */
export const LAUNCH_WEEK = 0;
/** Zone-wide festival days — every band in the zone plays one of these weeks. */
export const FESTIVAL_WEEKS = [9, 16];

/** Campus nights stay inside Jan–Mar fest season: weeks 0–13. */
export const CAMPUS_WINDOW_END = 13;

interface DaySlot {
  /** Days from the week's Saturday. */
  offset: number;
  slot: string;
}

/**
 * Six slots a week. A band uses exactly one of them, so a same-day clash is
 * impossible by construction rather than by audit.
 */
const DAYS: DaySlot[] = [
  { offset: -2, slot: "Thu night" },
  { offset: -1, slot: "Fri night" },
  { offset: 0, slot: "Sat matinee" },
  { offset: 0, slot: "Sat night" },
  { offset: 1, slot: "Sun matinee" },
  { offset: 1, slot: "Sun night" },
];

const THU = 0;

/** Distinct pairings inside a house, in a stable order. */
export function housePairings(bands: number): number[][] {
  const out: number[][] = [];
  for (let a = 1; a <= bands; a += 1) {
    for (let b = a + 1; b <= bands; b += 1) out.push([a, b]);
  }
  return out;
}

/**
 * Cross rounds: each round pairs every band exactly once, so a whole round
 * fits in one week without anyone playing two versus nights.
 */
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

/**
 * Every house is active every week now, so there is no window rotation left to
 * compute. Kept because the capacity view and the calendar filters still ask
 * which weekends a house appears on — which is all of them.
 */
export function houseWindows(zone: NationalZone): Record<number, number[]> {
  const all = SEASON_CALENDAR.map((w) => w.index);
  const windows: Record<number, number[]> = {};
  for (let h = 1; h <= zone.houses; h += 1) windows[h] = [...all];
  return windows;
}

/**
 * Commercial cities rotate per band so nobody is permanently handed the
 * smaller market, and every band plays each hub the same number of times.
 */
function commercialCities(zone: NationalZone, bandKey: number, count: number): string[] {
  const cities = zone.hubCities.map((c) => c.city);
  return Array.from({ length: count }, (_, i) => cities[(i + bandKey) % cities.length]);
}

/**
 * A band's 24 weeks, in order.
 *
 * The shared weeks are fixed first — cross, house night, festival — because
 * they involve other bands. Everything left is the band's own: campus nights
 * front-loaded into fest season, the launch night placed after its release,
 * and the commercial ladder filling the rest.
 */
function bandSeasonPlan(zone: NationalZone, houseNumber: number, band: number): string[] {
  const weeks: (string | null)[] = Array.from({ length: TOTAL_CALENDAR_WEEKENDS }, () => null);

  CROSS_WEEKS.forEach((w) => {
    if (w < weeks.length) weeks[w] = "versus-night";
  });
  HOUSE_NIGHT_WEEKS.forEach((w) => {
    if (w < weeks.length) weeks[w] = "house-night";
  });
  FESTIVAL_WEEKS.forEach((w) => {
    if (w < weeks.length) weeks[w] = "festival-stage";
  });

  // Campus nights take the earliest free weeks so they land in fest season.
  const campusIds = CAMPUS_FORMATS.flatMap((f) => Array.from({ length: f.perBand }, () => f.id));
  for (let w = 0; w < weeks.length && campusIds.length > 0; w += 1) {
    if (weeks[w] === null && w <= CAMPUS_WINDOW_END) weeks[w] = campusIds.shift() as string;
  }

  // Launch night: the first free week on or after the band's own release week.
  const releaseWeek = releaseWeekIndexFor(zone.houses, houseNumber, band);
  for (let w = Math.min(releaseWeek, weeks.length - 1); w < weeks.length; w += 1) {
    if (weeks[w] === null) {
      weeks[w] = "launch-night";
      break;
    }
  }
  if (!weeks.includes("launch-night")) {
    for (let w = weeks.length - 1; w >= 0; w -= 1) {
      if (weeks[w] === null) {
        weeks[w] = "launch-night";
        break;
      }
    }
  }

  // Corporate bookings take two mid-season free weeks, offset per band so a
  // house is not selling four private shows in the same fortnight.
  let corporatePlaced = 0;
  const corporateStart = 6 + ((band - 1) % 4);
  for (let i = 0; i < weeks.length && corporatePlaced < CORPORATE_SHOWS_PER_BAND; i += 1) {
    const w = (corporateStart + i * 5) % weeks.length;
    if (weeks[w] === null) {
      weeks[w] = "corporate-show";
      corporatePlaced += 1;
    }
  }
  for (let w = 0; w < weeks.length && corporatePlaced < CORPORATE_SHOWS_PER_BAND; w += 1) {
    if (weeks[w] === null) {
      weeks[w] = "corporate-show";
      corporatePlaced += 1;
    }
  }

  // Whatever is left runs the commercial ladder, rooms growing through the season.
  const ladder = COMMERCIAL_LADDER_FORMATS.flatMap((f) =>
    Array.from({ length: f.perBand }, () => f.id),
  );
  let li = 0;
  for (let w = 0; w < weeks.length; w += 1) {
    if (weeks[w] === null) weeks[w] = ladder[li++ % ladder.length];
  }

  return weeks as string[];
}

/** The commercial formats a band ladders through, launch night excluded. */
const COMMERCIAL_LADDER_FORMATS = COMMERCIAL_FORMATS.filter((f) => f.id !== "launch-night");

/**
 * Which day of the week a band plays.
 *
 * Shared formats are pinned so everyone on the bill lands on the same night;
 * solo nights are spread across the remaining slots by band and week so a
 * house is not stacking four of its bands onto one Saturday.
 */
function daySlotFor(formatId: string, band: number, week: number): number {
  if (formatId === "house-night") return THU;
  if (formatId === "festival-stage") return 3; // Sat night
  if (formatId === "versus-night") return band % 2 === 1 ? 3 : 5; // Sat / Sun night
  if (formatId === "corporate-show") return 1; // Fri night

  // The final week stops on Saturday so the season ends on 12 Jun rather than
  // spilling into the 13th. Four bands, four non-Sunday slots — it fits exactly.
  if (week === TOTAL_CALENDAR_WEEKENDS - 1) return (band - 1) % 4;
  return 1 + ((band + week) % 5);
}

export function buildFullSchedule(): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const byIndex = new Map(SEASON_CALENDAR.map((w) => [w.index, w]));

  NATIONAL_ZONES.forEach((zone) => {
    const rounds = crossRounds(zone.bandsPerHouse);

    for (let houseNumber = 1; houseNumber <= zone.houses; houseNumber += 1) {
      const plans: Record<number, string[]> = {};
      const cityPlan: Record<number, string[]> = {};
      for (let b = 1; b <= zone.bandsPerHouse; b += 1) {
        plans[b] = bandSeasonPlan(zone, houseNumber, b);
        cityPlan[b] = commercialCities(zone, houseNumber + b, TOTAL_CALENDAR_WEEKENDS);
      }
      const commercialSeen: Record<number, number> = {};

      for (let w = 0; w < TOTAL_CALENDAR_WEEKENDS; w += 1) {
        const weekend = byIndex.get(w);
        if (!weekend) continue;

        const push = (
          dayIndex: number,
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
            formatId,
            formatName: fmt ? fmt.name : off ?? formatId,
            venue: fmt
              ? fmt.venue
              : formatId === "corporate-show"
                ? "private"
                : formatId === "festival-stage"
                  ? "festival-ground"
                  : formatId === "league-launch"
                    ? "auditorium"
                    : "arena",
            city,
            iplOverlap: weekend.iplOverlap,
          });
        };

        // ---- league launch: Thu 31 Dec, whole zone on one bill, press in.
        // Emitted per house but sharing a zone-wide bill id, so it reads as one
        // night on the calendar and one appearance in every band's season.
        if (w === LAUNCH_WEEK) {
          const all = Array.from({ length: zone.bandsPerHouse }, (_, i) => i + 1);
          push(
            THU,
            all,
            "league-launch",
            zone.hubCities[0].city,
            "launch",
            `${zone.slug}-launch`,
          );
        }

        // ---- house night: the whole roster, one bill, Thursday
        if (plans[1][w] === "house-night") {
          const all = Array.from({ length: zone.bandsPerHouse }, (_, i) => i + 1);
          // Spread by HOUSE, not by week — five house nights on one Thursday
          // all landing in the same city would be five shows competing with
          // each other for the same crowd.
          const cityIdx =
            (houseNumber - 1 + HOUSE_NIGHT_WEEKS.indexOf(w)) % zone.hubCities.length;
          push(THU, all, "house-night", zone.hubCities[cityIdx].city, "house");
          continue;
        }

        // ---- versus week: one full round of pairings
        if (plans[1][w] === "versus-night") {
          const round = rounds[CROSS_WEEKS.indexOf(w) % rounds.length];
          round.forEach((pair, i) => {
            push(i === 0 ? 3 : 5, pair, "versus-night", zone.hubCities[0].city, `x${i}`);
          });
          continue;
        }

        // ---- everything else is per band
        for (let b = 1; b <= zone.bandsPerHouse; b += 1) {
          const formatId = plans[b][w];
          if (!formatId) continue;
          let city: string;
          if (formatId === "festival-stage") {
            city = zone.hubCities[FESTIVAL_WEEKS.indexOf(w) % zone.hubCities.length].city;
          } else if (CAMPUS_FORMATS.some((f) => f.id === formatId)) {
            city = CAMPUS_VENUE_LABEL;
          } else if (formatId === "corporate-show") {
            city = cityPlan[b][w % cityPlan[b].length];
          } else {
            const n = commercialSeen[b] ?? 0;
            commercialSeen[b] = n + 1;
            city = cityPlan[b][n % cityPlan[b].length];
          }
          // A festival stage-day is one bill of ten acts drawn from the whole
          // zone, so every band on it shares a bill id and it counts once.
          const bill =
            formatId === "festival-stage"
              ? `${zone.slug}-w${w}-stage${Math.floor(
                  (((houseNumber - 1) * zone.bandsPerHouse + (b - 1)) % (zone.houses * zone.bandsPerHouse)) /
                    FESTIVAL_ACTS_PER_STAGE,
                )}`
              : null;
          push(daySlotFor(formatId, b, w), [b], formatId, city, `b${b}`, bill);
        }
      }
    }
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const FULL_SCHEDULE = buildFullSchedule();

export interface ScheduleTotals {
  /** Distinct nights on the calendar — a shared bill counts once. */
  events: number;
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
  const commercial = events.filter((e) => e.kind === "commercial").length;
  const campus = events.filter((e) => e.kind === "campus").length;
  const cross = events.filter((e) => e.kind === "cross").length;
  const scored = events.filter((e) => e.scored).length;
  const clashes = sameDayClashes(events);
  return {
    events: distinctNights(events),
    rows: events.length,
    scored,
    offLadder: distinctNights(events.filter((e) => !e.scored)),
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

/**
 * Which week of the season a band releases in. The rotation walks houses first
 * so no two consecutive weeks in a zone come from the same stable; inverting it
 * lets the schedule place a band's Launch Night after its song is actually out.
 */
export function releaseWeekIndexFor(houses: number, houseNumber: number, band: number): number {
  return (band - 1) * houses + (houseNumber - 1);
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
      // Invariant: releaseWeekIndexFor is the inverse of the two lines above.
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
   * every band plays exactly one show a week — but still counted, because a
   * structural guarantee nobody checks is just a comment.
   */
  clashesWithFixtures: sameDayClashes(),
};

