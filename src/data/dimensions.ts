/**
 * The dimensional slicer.
 *
 * `economics.ts` models a season. This decides WHICH season is being modelled:
 * which year, which zone, which city, whose roster, and which kind of night.
 *
 * The rule that makes this trustworthy is that a dimension never sets a figure
 * directly. It resolves to a `Scope` — a set of multipliers and counts — which
 * is then folded into the existing `EconomicsInputs` by `applyScope()`. The
 * economics engine is untouched and stays the single source of every number, so
 * slicing cannot invent a result the base model would not have produced.
 *
 * What the slicer is NOT: a report of what happened. There are no per-band
 * results in here and there must not be. Selecting "House II · Band 3" scopes a
 * projection to one roster slot; it does not claim that band earned anything.
 */

import {
  STAGE_2_MATRIX,
  STAGE_2_FINALS,
  ZONES,
  zoneIndex,
  type HubCity,
  type Zone,
} from "./league-format";
import type { EconomicsInputs } from "./economics";
import { DEFAULT_INPUTS } from "./economics";
import {
  DEFAULT_SPONSOR_ROI,
  defaultEventInputs,
  type EventInputs,
  type SponsorRoiInputs,
} from "./event-model";

/* ------------------------------------------------------------------ *
 * Season
 * ------------------------------------------------------------------ */

export interface SeasonDim {
  id: string;
  label: string;
  note: string;
  priceGrowth: number;
  attendanceGrowth: number;
  reachGrowth: number;
  sponsorGrowth: number;
  /** Franchise bid multiplier — a proven format bids up. */
  bidGrowth: number;
}

export const SEASONS: SeasonDim[] = [
  {
    id: "s1",
    label: "Season 1",
    note: "Launch year. Unproven format, the market exactly as it is today.",
    priceGrowth: 1,
    attendanceGrowth: 1,
    reachGrowth: 1,
    sponsorGrowth: 1,
    bidGrowth: 1,
  },
  {
    id: "s2",
    label: "Season 2",
    note: "Format has a track record, a returning roster and a back catalogue pulling people in.",
    priceGrowth: 1.15,
    attendanceGrowth: 1.25,
    reachGrowth: 1.6,
    sponsorGrowth: 1.4,
    bidGrowth: 1.3,
  },
  {
    id: "s3",
    label: "Season 3",
    note: "An established property. Prices hold, rooms are bigger, brands renew rather than trial.",
    priceGrowth: 1.35,
    attendanceGrowth: 1.55,
    reachGrowth: 2.4,
    sponsorGrowth: 2,
    bidGrowth: 1.75,
  },
];

/* ------------------------------------------------------------------ *
 * Fixture type
 *
 * Each entry pins the per-band fixture count, how many acts share the night,
 * and which rooms that format actually plays. `soloSharePct` falls straight out
 * of the category, which is why the fixture mix never has to be set by hand.
 * ------------------------------------------------------------------ */

export interface FixtureDim {
  id: string;
  label: string;
  note: string;
  showsPerBand: number;
  actsPerFixture: number;
  soloSharePct: number;
  /** Override the band pool — the finals stages are not open to every band. */
  bandsOverride?: number;
  /** Default room and production tier for this format. */
  presetId: string;
  tierId: string;
}

const CAT = STAGE_2_MATRIX.categories;

/** Solo fixtures every band plays, identical in every zone. */
const INDIVIDUAL_PER_BAND = STAGE_2_MATRIX.individualShowsPerBand;

export const FIXTURE_DIMS: FixtureDim[] = [
  {
    id: "all",
    label: "All fixtures",
    note: "The whole league phase — every ticketed, campus and cross night.",
    showsPerBand: STAGE_2_MATRIX.showsPerBand,
    actsPerFixture: 1,
    soloSharePct: Math.round(
      (STAGE_2_MATRIX.individualShowsPerBand / STAGE_2_MATRIX.showsPerBand) * 100,
    ),
    presetId: "cafe",
    tierId: "individual",
  },
  {
    id: "commercial",
    label: "Commercial showcase",
    note: "Full-price ticketed nights. The band carries the room alone.",
    showsPerBand: CAT[0].showsPerBand,
    actsPerFixture: 1,
    soloSharePct: 100,
    presetId: "cafe",
    tierId: "individual",
  },
  {
    id: "campus",
    label: "Campus circuit",
    note: "College nights priced for reach rather than margin.",
    showsPerBand: CAT[1].showsPerBand,
    actsPerFixture: 1,
    soloSharePct: 100,
    presetId: "college",
    tierId: "individual",
  },
  {
    id: "cross",
    label: "House cross night",
    note: "Two stablemates share one stage, and one gate.",
    showsPerBand: CAT[2].showsPerBand,
    actsPerFixture: 2,
    soloSharePct: 0,
    presetId: "auditorium",
    tierId: "rivalry",
  },
  {
    id: "rivalry",
    label: "Finalist rivalry",
    note: `Round robin among the ${STAGE_2_FINALS.finalists} qualifiers only.`,
    showsPerBand: STAGE_2_FINALS.rivalryPerFinalist,
    actsPerFixture: 2,
    soloSharePct: 0,
    bandsOverride: STAGE_2_FINALS.finalists,
    presetId: "auditorium",
    tierId: "eliminator",
  },
  {
    id: "finals",
    label: "Eliminator & final",
    note: "Two nights, four band appearances, one champion.",
    showsPerBand: 1,
    actsPerFixture: 2,
    soloSharePct: 0,
    bandsOverride: 4,
    presetId: "marquee",
    tierId: "final",
  },
];

/* ------------------------------------------------------------------ *
 * Houses and band slots
 *
 * Roman-numeral house slots and numbered band slots, deliberately generic.
 * These are positions in a structure, not real acts — see the note at the top.
 * ------------------------------------------------------------------ */

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export interface HouseDim {
  id: string;
  label: string;
}

export function housesFor(zone: Zone): HouseDim[] {
  return [
    { id: "all", label: "All houses" },
    ...Array.from({ length: zone.houses }, (_, i) => ({
      id: `house-${i + 1}`,
      label: `House ${ROMAN[i] ?? i + 1}`,
    })),
  ];
}

export const HOUSES: HouseDim[] = housesFor(
  ZONES.reduce((a, b) => (b.houses > a.houses ? b : a)),
);

/**
 * Band slots depend on the zone in view: AP/TS houses sign four bands, every
 * other regional league signs two. Offering four slots in Karnataka would let
 * the slicer scope to a band that does not exist.
 */
export function bandSlotsFor(zone: Zone): HouseDim[] {
  return [
    { id: "all", label: "All bands" },
    ...Array.from({ length: zone.bandsPerHouse }, (_, i) => ({
      id: `band-${i + 1}`,
      label: `Band ${i + 1}`,
    })),
  ];
}

/** Widest possible slot list, for callers that need every option up front. */
export const BAND_SLOTS: HouseDim[] = bandSlotsFor(
  ZONES.reduce((a, b) => (b.bandsPerHouse > a.bandsPerHouse ? b : a)),
);

/* ------------------------------------------------------------------ *
 * Selection and resolved scope
 * ------------------------------------------------------------------ */

export interface DimensionSelection {
  seasonId: string;
  zoneSlug: string;
  /** Hub city name, or "all". */
  city: string;
  houseId: string;
  bandId: string;
  fixtureId: string;
}

/** Slug for the national roll-up — every league at once. */
export const ALL_ZONES = "all-india";

/**
 * A synthetic zone standing for the whole country: every house, every band,
 * and a market index averaged across all five leagues weighted by their hub
 * cities. Without it the slicer could never show more than one zone, so the
 * economics page could never show the national figure at all.
 */
export const NATIONAL_ZONE: Zone = {
  slug: ALL_ZONES,
  name: "All India",
  shortName: "All India",
  tier: "state",
  houses: ZONES.filter((z) => z.tier === "state").reduce((s, z) => s + z.houses, 0),
  bandsPerHouse: ZONES.find((z) => z.tier === "state")?.bandsPerHouse ?? 4,
  status: "Season 1 · live",
  headline: "Every regional league at once.",
  languages: ["Pan-India"],
  hubCities: ZONES.filter((z) => z.tier === "state").flatMap((z) =>
    z.hubCities.map((c) => ({
      ...c,
      // Re-weight so shares still sum to 1 across the whole country.
      fixtureShare: c.fixtureShare / ZONES.filter((x) => x.tier === "state").length,
    })),
  ),
  strategy:
    "The national roll-up. Every figure here is the sum of the five regional leagues rather than a separate model.",
  campusChapters: ZONES.filter((z) => z.tier === "state").reduce(
    (s, z) => s + z.campusChapters,
    0,
  ),
  accent: "amber",
};

export const DEFAULT_SELECTION: DimensionSelection = {
  seasonId: "s1",
  // Opens on the national picture; drill into a league from there.
  zoneSlug: ALL_ZONES,
  city: "all",
  houseId: "all",
  bandId: "all",
  fixtureId: "all",
};

export interface Scope {
  selection: DimensionSelection;
  season: SeasonDim;
  zone: Zone;
  /** The selected city, or null when the whole zone is in view. */
  city: HubCity | null;
  fixture: FixtureDim;
  house: HouseDim;
  band: HouseDim;

  /* Resolved market multipliers */
  priceMult: number;
  attendanceMult: number;
  costMult: number;
  reachMult: number;
  sponsorMult: number;
  bidMult: number;

  /* Resolved counts */
  houses: number;
  bandsPerHouse: number;
  totalBands: number;
  showsPerBand: number;
  /** Share of the zone calendar the selected city carries. 1 when "all". */
  cityShare: number;
  /** Solo share of this zone's fixture mix, after the cross count is resolved. */
  soloSharePct: number;
  /** Cross nights a band plays here — bandsPerHouse minus one. */
  crossPerBand: number;

  /* Option lists valid for the selected zone */
  houseOptions: HouseDim[];
  bandOptions: HouseDim[];

  /* Presentation */
  label: string;
  breadcrumb: string[];
  isDefault: boolean;
}

export function zoneOf(slug: string): Zone {
  if (slug === ALL_ZONES) return NATIONAL_ZONE;
  return ZONES.find((z) => z.slug === slug) ?? ZONES[ZONES.length - 1];
}

/**
 * Zones a user can slice by. The national tier is one night, not a league, so
 * it is excluded. Every league is the same size, so the order is just the
 * order they were founded in.
 */
export const SLICEABLE_ZONES: Zone[] = [
  NATIONAL_ZONE,
  ...ZONES.filter((z) => z.tier === "state"),
];

/**
 * Mean of each league's own price x capacity index. Used to keep the national
 * roll-up equal to the five leagues added together (see resolveScope).
 */
function meanZoneProduct(): number {
  const states = ZONES.filter((z) => z.tier === "state");
  if (states.length === 0) return 1;
  return (
    states.reduce(
      (sum, z) =>
        sum + zoneIndex(z.hubCities, "priceIdx") * zoneIndex(z.hubCities, "capacityIdx"),
      0,
    ) / states.length
  );
}

export function resolveScope(sel: DimensionSelection): Scope {
  const season = SEASONS.find((s) => s.id === sel.seasonId) ?? SEASONS[0];
  const zone = zoneOf(sel.zoneSlug);
  const city = sel.city === "all" ? null : (zone.hubCities.find((c) => c.city === sel.city) ?? null);
  const fixture = FIXTURE_DIMS.find((f) => f.id === sel.fixtureId) ?? FIXTURE_DIMS[0];
  const zoneHouses = housesFor(zone);
  const house = zoneHouses.find((h) => h.id === sel.houseId) ?? zoneHouses[0];
  const zoneBandSlots = bandSlotsFor(zone);
  const band = zoneBandSlots.find((b) => b.id === sel.bandId) ?? zoneBandSlots[0];

  // A city uses its own indices; the whole zone uses the share-weighted average
  // of its cities, so "All cities" is never an invented number.
  const isNational = zone.slug === ALL_ZONES && !city;
  const priceIdx = city ? city.priceIdx : zoneIndex(zone.hubCities, "priceIdx");
  // Gate revenue is price x capacity, and the average of five products is not
  // the product of two averages. Averaging both indices naively left All India
  // reading ~1% under the sum of the five leagues, which is exactly the kind of
  // number that does not reconcile when someone adds the leagues up by hand.
  // So nationally the capacity index is solved for: it is whatever makes
  // price x capacity equal the mean of the five leagues' own products.
  const capacityIdx = city
    ? city.capacityIdx
    : isNational
      ? meanZoneProduct() / Math.max(0.0001, priceIdx)
      : zoneIndex(zone.hubCities, "capacityIdx");
  const costIdx = city ? city.costIdx : zoneIndex(zone.hubCities, "costIdx");
  const reachIdx = city ? city.reachIdx : zoneIndex(zone.hubCities, "reachIdx");
  const cityShare = city ? city.fixtureShare : 1;

  // The roster comes from the SELECTED zone. Reading it from AP/TS meant every
  // zone reported a 20-band league, which is only true of AP/TS.
  let houses = house.id === "all" ? zone.houses : 1;
  let bandsPerHouse = band.id === "all" ? zone.bandsPerHouse : 1;
  let totalBands = houses * bandsPerHouse;

  /*
   * The finals are not a houses-x-roster grid. Qualification is one seat per
   * production house, so in those stages a house fields exactly one band and
   * the field is capped by however many seats the stage has. Modelling it as
   * `houses x bandsPerHouse` instead would round 4 bands across 5 houses back
   * up to 5, and the fixture count would come out wrong.
   */
  if (fixture.bandsOverride !== undefined) {
    bandsPerHouse = 1;
    houses = Math.max(1, Math.min(houses, fixture.bandsOverride));
    totalBands = houses;
  }

  /*
   * Cross nights are pairings inside a house, so a two-band house gives each
   * band ONE cross night and a four-band house gives three. Reading the count
   * off AP/TS meant every zone was credited with three, which inflated both
   * the fixture list and the points available outside AP/TS.
   */
  const crossPerBand = Math.max(0, zone.bandsPerHouse - 1);
  let zoneShowsPerBand = fixture.showsPerBand;
  let zoneSoloSharePct = fixture.soloSharePct;
  if (fixture.id === "all") {
    zoneShowsPerBand = INDIVIDUAL_PER_BAND + crossPerBand;
    zoneSoloSharePct = Math.round((INDIVIDUAL_PER_BAND / zoneShowsPerBand) * 100);
  } else if (fixture.id === "cross") {
    zoneShowsPerBand = crossPerBand;
  }

  // Scoping to one city scopes the number of nights played there, not the roster.
  const showsPerBand = Math.max(1, Math.round(zoneShowsPerBand * cityShare));

  const breadcrumb = [
    season.label,
    zone.shortName,
    city ? city.city : "All cities",
    house.id === "all" ? "All houses" : house.label,
    band.id === "all" ? "All bands" : band.label,
    fixture.label,
  ];

  const isDefault =
    sel.seasonId === DEFAULT_SELECTION.seasonId &&
    sel.zoneSlug === DEFAULT_SELECTION.zoneSlug &&
    sel.city === DEFAULT_SELECTION.city &&
    sel.houseId === DEFAULT_SELECTION.houseId &&
    sel.bandId === DEFAULT_SELECTION.bandId &&
    sel.fixtureId === DEFAULT_SELECTION.fixtureId;

  return {
    selection: sel,
    season,
    zone,
    city,
    fixture,
    house,
    band,

    priceMult: priceIdx * season.priceGrowth,
    attendanceMult: capacityIdx * season.attendanceGrowth,
    costMult: costIdx,
    reachMult: reachIdx * season.reachGrowth,
    sponsorMult: season.sponsorGrowth * (city ? city.reachIdx : reachIdx),
    bidMult: season.bidGrowth,

    houses,
    bandsPerHouse,
    totalBands,
    houseOptions: zoneHouses,
    bandOptions: zoneBandSlots,
    showsPerBand,
    cityShare,

    soloSharePct: zoneSoloSharePct,
    crossPerBand,
    label: `${zone.shortName} · ${city ? city.city : "all cities"} · ${fixture.label.toLowerCase()}`,
    breadcrumb,
    isDefault,
  };
}

/* ------------------------------------------------------------------ *
 * Folding the scope into each model's inputs
 * ------------------------------------------------------------------ */

/**
 * The scope is applied ON TOP of whatever the sliders say, so the two controls
 * compose: the sliders set the base case, the slicer says where and when.
 */
export function applyScope(base: EconomicsInputs, scope: Scope): EconomicsInputs {
  return {
    ...base,
    ticketPrice: Math.round(base.ticketPrice * scope.priceMult),
    attendance: Math.max(10, Math.round(base.attendance * scope.attendanceMult)),
    showsPerBand: scope.showsPerBand,
    soloSharePct: scope.soloSharePct,
    numFranchises: scope.houses,
    bandsPerFranchise: scope.bandsPerHouse,
    winningBid: Math.round(base.winningBid * scope.bidMult),
    leagueBroadcastSeason: Math.round(base.leagueBroadcastSeason * scope.sponsorMult),
    leagueSponsorshipSeason: Math.round(base.leagueSponsorshipSeason * scope.sponsorMult),
    youtubeViewsAnnual: Math.round(base.youtubeViewsAnnual * scope.reachMult),
  };
}

/** Event defaults for the room the selected fixture type actually plays. */
export function scopedEventInputs(scope: Scope): EventInputs {
  const base = defaultEventInputs(scope.fixture.presetId);
  return {
    ...base,
    tierId: scope.fixture.tierId,
    capacity: Math.max(50, Math.round(base.capacity * scope.attendanceMult)),
    ticketPrice: Math.round(base.ticketPrice * scope.priceMult),
    acts: scope.fixture.actsPerFixture,
  };
}

/**
 * Sponsor deal sized to the fixtures and reach actually inside the scope.
 *
 * The spend has to be pro-rated by how many nights the slice contains, not
 * just by the market. Holding a full-season fee against a two-night slice
 * would make every narrow slice look like a terrible deal for the brand, which
 * is an artefact of the slicing rather than anything real.
 */
export function scopedSponsorInputs(scope: Scope, fixturesInScope: number): SponsorRoiInputs {
  const nights = Math.max(1, Math.round(fixturesInScope));
  const sizeRatio = nights / DEFAULT_SPONSOR_ROI.fixturesSponsored;
  return {
    ...DEFAULT_SPONSOR_ROI,
    fixturesSponsored: nights,
    attendancePerFixture: Math.max(
      20,
      Math.round(DEFAULT_SPONSOR_ROI.attendancePerFixture * scope.attendanceMult),
    ),
    digitalReachPerFixture: Math.round(
      DEFAULT_SPONSOR_ROI.digitalReachPerFixture * scope.reachMult,
    ),
    spend: Math.max(
      25000,
      Math.round((DEFAULT_SPONSOR_ROI.spend * sizeRatio * scope.sponsorMult) / 1000) * 1000,
    ),
  };
}

/** A string that changes whenever the scope does — used to reset local state. */
export function scopeKey(scope: Scope): string {
  const s = scope.selection;
  return [s.seasonId, s.zoneSlug, s.city, s.houseId, s.bandId, s.fixtureId].join("|");
}

/** The unsliced baseline, for "what does the slice do to the number" comparisons. */
export const BASELINE_SCOPE = resolveScope(DEFAULT_SELECTION);
export const BASELINE_INPUTS = applyScope(DEFAULT_INPUTS, BASELINE_SCOPE);
