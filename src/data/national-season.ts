/**
 * The national season architecture.
 *
 * `league-format.ts` describes the AP/TS pilot in isolation. This describes the
 * full national build: five regional leagues running simultaneously, and the
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

/* ------------------------------------------------------------------ *
 * The five regional leagues
 * ------------------------------------------------------------------ */

export interface NationalZone {
  id: string;
  name: string;
  houses: number;
  bandsPerHouse: number;
  languages: string;
  note: string;
}

export const NATIONAL_ZONES: NationalZone[] = [
  {
    id: "ap-ts",
    name: "AP / Telangana",
    houses: 5,
    bandsPerHouse: 4,
    languages: "Telugu",
    note: "The deep roster. This is where the format was proven, so it carries twice the bands of any other zone.",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    houses: 5,
    bandsPerHouse: 2,
    languages: "Kannada",
    note: "India's densest indie and pub-gig market — the shortest path to a functioning live circuit.",
  },
  {
    id: "kerala",
    name: "Kerala",
    houses: 5,
    bandsPerHouse: 2,
    languages: "Malayalam",
    note: "Established festival and fusion audience already used to paying for live music.",
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    houses: 5,
    bandsPerHouse: 2,
    languages: "Tamil",
    note: "Deep live circuit and a college-band culture that feeds the campus leg directly.",
  },
  {
    id: "north",
    name: "North India",
    houses: 5,
    bandsPerHouse: 2,
    languages: "Hindi, Punjabi, Bengali, Assamese, Marathi",
    note: "Highest-CPM digital market and the sponsorship centre, entered once the format has a record.",
  },
];

export const TOTAL_HOUSES = NATIONAL_ZONES.reduce((s, z) => s + z.houses, 0);
export const TOTAL_BANDS = NATIONAL_ZONES.reduce((s, z) => s + z.houses * z.bandsPerHouse, 0);

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
