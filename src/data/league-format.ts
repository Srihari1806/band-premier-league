/**
 * Competition format: how a fixture is scored, how bands qualify, how the
 * regional match matrix is built, and how the league tiers up from a state
 * chapter to a national championship.
 *
 * Like the economics model, the counts here are DERIVED. `computeMatchMatrix`
 * takes the house and band structure and returns the fixture breakdown, so the
 * published schedule cannot contradict itself when the structure changes.
 *
 * A note that matters for reading the numbers: a "versus" fixture is one
 * ticketed night shared by two competing bands, not two separate shows. That is
 * why the inter-house and intra-house fixture counts are halved — and why the
 * economics page splits the gate on those nights.
 */

/* ------------------------------------------------------------------ *
 * Fixture scoring
 * ------------------------------------------------------------------ */

export interface ScoringMetric {
  metric: string;
  maxPoints: number;
  basis: string;
  /** Which side of the league the metric measures. */
  pillar: "performance" | "commercial" | "engagement" | "output";
}

export const SCORING_METRICS: ScoringMetric[] = [
  {
    metric: "Live Performance (Jury)",
    maxPoints: 10,
    basis: "Scored on originality, stage presence, vocal and instrumental tightness, and arrangement.",
    pillar: "performance",
  },
  {
    metric: "Ticket Sales / Gate Turnout",
    maxPoints: 10,
    basis: "Scaled on the share of venue capacity actually filled, validated against ticket settlement.",
    pillar: "commercial",
  },
  {
    metric: "Fan Voting (App + Web)",
    maxPoints: 5,
    basis: "Verified accounts only, one vote per user, inside the 24-hour match window.",
    pillar: "engagement",
  },
  {
    metric: "Original IP Release Drop",
    maxPoints: 5,
    basis: "Bonus for releasing an original single or video before the fixture matchday.",
    pillar: "output",
  },
];

export const POINTS_PER_FIXTURE = SCORING_METRICS.reduce((s, m) => s + m.maxPoints, 0);

/** Awarded to the highest-scoring band of the fixture night. */
export const VICTORY_BONUS = 3;

export const MAX_POINTS_PER_FIXTURE = POINTS_PER_FIXTURE + VICTORY_BONUS;

/** Gate points scale by how full the room was. */
export interface GateBand {
  label: string;
  minPct: number;
  points: number;
}

export const GATE_POINT_SCALE: GateBand[] = [
  { label: "90% capacity and above", minPct: 90, points: 10 },
  { label: "75% – 89% capacity", minPct: 75, points: 7 },
  { label: "50% – 74% capacity", minPct: 50, points: 4 },
  { label: "Below 50% capacity", minPct: 0, points: 1 },
];

/** Gate points for a given fill rate, using the published scale. */
export function gatePointsFor(fillPct: number): number {
  const band = GATE_POINT_SCALE.find((b) => fillPct >= b.minPct);
  return band ? band.points : 0;
}

export const TIE_BREAKERS: string[] = [
  "Head-to-head record between the tied bands",
  "Total net ticket revenue generated across the season",
  "Cumulative verified fan votes",
];

export interface QualificationStep {
  stage: string;
  detail: string;
}

export const QUALIFICATION: QualificationStep[] = [
  {
    stage: "League Phase",
    detail: "Every band plays its full fixture calendar against competing franchises across the zone.",
  },
  {
    stage: "Top 25% Rule",
    detail: "The top quartile of the leaderboard qualifies automatically for the grand finals.",
  },
  {
    stage: "House Trophy",
    detail: "The production house whose bands accumulate the highest collective points takes the House Cup.",
  },
  {
    stage: "Zonal Advancement",
    detail: "Top finishers and the leading house represent the state at the zonal finals.",
  },
];

/* ------------------------------------------------------------------ *
 * Match matrix
 * ------------------------------------------------------------------ */

export interface MatrixStructure {
  houses: number;
  bandsPerHouse: number;
  /** Ticketed standalone nights per band — the commercial circuit. */
  ticketedSoloPerBand: number;
  /** Campus nights per band — run for reach and voting, not gate. */
  campusSoloPerBand: number;
  /** Cross nights against a stablemate from the same house. */
  intraHousePerBand: number;
}

/** Stage 2 — the AP/TS regional league. */
export const STAGE_2_STRUCTURE: MatrixStructure = {
  houses: 5,
  bandsPerHouse: 4,
  ticketedSoloPerBand: 5,
  campusSoloPerBand: 3,
  intraHousePerBand: 3,
};

export type FixtureKind = "commercial" | "campus" | "cross";

export interface MatrixCategory {
  category: string;
  kind: FixtureKind;
  showsPerBand: number;
  fixtures: number;
  /** Bands sharing one ticketed night in this category. */
  actsPerFixture: number;
  purpose: string;
}

export interface MatchMatrix {
  houses: number;
  bandsPerHouse: number;
  totalBands: number;
  /** Solo nights a band plays — commercial plus campus. */
  individualShowsPerBand: number;
  showsPerBand: number;
  categories: MatrixCategory[];
  /** Distinct pairings inside one house: bandsPerHouse choose 2. */
  crossPairsPerHouse: number;
  totalFixtures: number;
}

/** n choose 2 — the number of distinct pairings in a pool of n. */
export function pairingsOf(n: number): number {
  return Math.max(0, (n * (n - 1)) / 2);
}

export function computeMatchMatrix(s: MatrixStructure): MatchMatrix {
  const totalBands = s.houses * s.bandsPerHouse;
  const categories: MatrixCategory[] = [
    {
      category: "Commercial Showcase",
      kind: "commercial",
      showsPerBand: s.ticketedSoloPerBand,
      // One band, one night — no sharing.
      fixtures: totalBands * s.ticketedSoloPerBand,
      actsPerFixture: 1,
      purpose:
        "Full-price ticketed nights at partner venues. The band carries the room alone — this is where gate revenue, gate points and a paying fanbase are actually built.",
    },
    {
      category: "Campus Circuit",
      kind: "campus",
      showsPerBand: s.campusSoloPerBand,
      fixtures: totalBands * s.campusSoloPerBand,
      actsPerFixture: 1,
      purpose:
        "College nights run through the student chapter network. Priced for reach rather than margin — they exist to turn students into voters, followers and future ticket buyers.",
    },
    {
      category: "House Cross Night",
      kind: "cross",
      showsPerBand: s.intraHousePerBand,
      // Two bands from the same house share one night.
      fixtures: Math.round((totalBands * s.intraHousePerBand) / 2),
      actsPerFixture: 2,
      purpose:
        "Every pair of bands inside a house meets once — mashups, collaborations and head-to-head sets. The house keeps its full franchise share either way, so it is a cross-audience play rather than a cannibalisation risk.",
    },
  ];
  return {
    houses: s.houses,
    bandsPerHouse: s.bandsPerHouse,
    totalBands,
    individualShowsPerBand: s.ticketedSoloPerBand + s.campusSoloPerBand,
    showsPerBand: s.ticketedSoloPerBand + s.campusSoloPerBand + s.intraHousePerBand,
    categories,
    crossPairsPerHouse: pairingsOf(s.bandsPerHouse),
    totalFixtures: categories.reduce((sum, c) => sum + c.fixtures, 0),
  };
}

export const STAGE_2_MATRIX = computeMatchMatrix(STAGE_2_STRUCTURE);

/* ------------------------------------------------------------------ *
 * Finals — from the league phase to one champion
 *
 * The qualifying rule is the top quartile of the table, which in a 20-band
 * season comes to 5 bands. The league seeds that as one qualifier per
 * production house, so every franchise still has something to play for in
 * the closing weeks.
 * ------------------------------------------------------------------ */

export interface FinalsStructure {
  finalists: number;
  /** Round robin among finalists: finalists choose 2. */
  rivalryFixtures: number;
  rivalryPerFinalist: number;
  eliminatorFixtures: number;
  grandFinalFixtures: number;
  totalFinalsFixtures: number;
}

export function computeFinals(finalists: number): FinalsStructure {
  const rivalryFixtures = pairingsOf(finalists);
  return {
    finalists,
    rivalryFixtures,
    rivalryPerFinalist: Math.max(0, finalists - 1),
    eliminatorFixtures: 1,
    grandFinalFixtures: 1,
    totalFinalsFixtures: rivalryFixtures + 2,
  };
}

/** Finalists = the top quartile of the league table, one seat per house. */
export const STAGE_2_FINALS = computeFinals(qualifyingCount(STAGE_2_MATRIX.totalBands));

/** Every live night in a full season, league phase through the grand final. */
export const STAGE_2_SEASON_FIXTURES =
  STAGE_2_MATRIX.totalFixtures + STAGE_2_FINALS.totalFinalsFixtures;

export interface KnockoutStep {
  stage: string;
  seeds: string;
  detail: string;
}

export const KNOCKOUT_ROUTE: KnockoutStep[] = [
  {
    stage: "Rivalry Round",
    seeds: `All ${STAGE_2_FINALS.finalists} finalists`,
    detail: `Every finalist meets every other finalist once — ${STAGE_2_FINALS.rivalryFixtures} nights, ${STAGE_2_FINALS.rivalryPerFinalist} apiece. Points carry the same weight as the league phase, so the table reorders on merit rather than reputation.`,
  },
  {
    stage: "Direct Entry",
    seeds: "Rank 1",
    detail:
      "The band topping the rivalry table goes straight to the grand final and sits out the eliminator. Finishing first is worth a week of rest and a night off the road.",
  },
  {
    stage: "Eliminator",
    seeds: "Rank 2 v Rank 3",
    detail:
      "One shared night, winner takes the second grand-final slot. The loser finishes third for the season.",
  },
  {
    stage: "Grand Final",
    seeds: "Rank 1 v Eliminator winner",
    detail:
      "A single-venue, broadcast-packaged final. Ranks 4 and 5 are eliminated on standings — no play-off, the table decides.",
  },
];

/* ------------------------------------------------------------------ *
 * Season calendar
 * ------------------------------------------------------------------ */

export interface SeasonPhase {
  phase: string;
  title: string;
  weeks: string;
  weekCount: number;
  detail: string;
}

export const SEASON_PHASES: SeasonPhase[] = [
  {
    phase: "Phase 0",
    title: "Onboarding & Pre-Production",
    weeks: "Weeks 1–3",
    weekCount: 3,
    detail:
      "Franchise draft, band contracts, rehearsal blocks and the first writing sessions. No fixtures and no points — the season is being loaded, not played.",
  },
  {
    phase: "Phase 1",
    title: "Individual Circuit",
    weeks: "Weeks 4–15",
    weekCount: 12,
    detail: `The bulk of the calendar. Each band plays its ${STAGE_2_MATRIX.individualShowsPerBand} solo nights — ${STAGE_2_STRUCTURE.ticketedSoloPerBand} ticketed, ${STAGE_2_STRUCTURE.campusSoloPerBand} campus — across the regional hubs while originals drop on a rolling schedule.`,
  },
  {
    phase: "Phase 2",
    title: "House Cross Phase",
    weeks: "Weeks 16–19",
    weekCount: 4,
    detail: `Every pairing inside every house — ${STAGE_2_MATRIX.crossPairsPerHouse} nights per house, ${STAGE_2_MATRIX.categories[2].fixtures} in total. Collaborations and mashups, with the House Cup decided on cumulative points.`,
  },
  {
    phase: "Phase 3",
    title: "Finalist Rivalry",
    weeks: "Weeks 20–22",
    weekCount: 3,
    detail: `The ${STAGE_2_FINALS.finalists} qualifiers play a full round robin — ${STAGE_2_FINALS.rivalryFixtures} nights that set the knockout seeding.`,
  },
  {
    phase: "Phase 4",
    title: "Eliminator & Grand Final",
    weeks: "Week 23",
    weekCount: 1,
    detail:
      "Two nights, one champion. Packaged as the season's broadcast centrepiece rather than as just another fixture.",
  },
];

export const SEASON_WEEKS = SEASON_PHASES.reduce((s, p) => s + p.weekCount, 0);
/** Competitive weeks only — everything after onboarding. */
export const COMPETITIVE_WEEKS = SEASON_WEEKS - SEASON_PHASES[0].weekCount;

/* ------------------------------------------------------------------ *
 * Original music release cycle
 *
 * A band cannot write, record, shoot and market a single every month. The
 * league runs a 60-day cycle per band and staggers the start dates, so the
 * ecosystem publishes continuously while no individual band is overloaded.
 * ------------------------------------------------------------------ */

export interface ReleaseStage {
  weeks: string;
  title: string;
  detail: string;
}

export const RELEASE_CYCLE_DAYS = 60;

export const RELEASE_CYCLE: ReleaseStage[] = [
  {
    weeks: "Weeks 1–2",
    title: "Write & Arrange",
    detail: "Composition, lyric passes and arrangement locked with the house's producer.",
  },
  {
    weeks: "Weeks 3–4",
    title: "Record, Mix & Master",
    detail: "Studio time financed by the production house; masters delivered ready for distribution.",
  },
  {
    weeks: "Week 5",
    title: "Music Video",
    detail: "Shoot and edit — the asset that carries the release on YouTube and social.",
  },
  {
    weeks: "Week 6",
    title: "Artwork & Distribution",
    detail: "Cover art, credits, metadata and delivery to the distributor ahead of the release date.",
  },
  {
    weeks: "Weeks 7–8",
    title: "Promotion & Fixture Tie-In",
    detail: "The campaign runs into a scheduled fixture, so the live room doubles as the launch event.",
  },
];

/**
 * Eligibility for the Original IP points. A release has to be a real
 * commercial release, not an upload timed to game the table.
 */
export const RELEASE_ELIGIBILITY: string[] = [
  "Original composition — no covers, no re-uploads of prior catalogue",
  "Full credits filed for writers, performers and producers",
  "Commercial release through a recognised distributor",
  "Official audio or music video published, not a rehearsal clip",
  "Live on platforms at least 7 days before the fixture matchday",
];

/** Days between releases across the league when bands stagger their cycles. */
export function releaseCadenceDays(totalBands: number, cycleDays = RELEASE_CYCLE_DAYS): number {
  return cycleDays / Math.max(1, totalBands);
}

/** Originals one band can realistically ship inside a season of this length. */
export function releasesPerSeason(seasonWeeks: number, cycleDays = RELEASE_CYCLE_DAYS): number {
  return Math.floor((seasonWeeks * 7) / cycleDays);
}

/* ------------------------------------------------------------------ *
 * Zone architecture — the three-tier pyramid
 * ------------------------------------------------------------------ */

export type ZoneTier = "national" | "zone" | "state";

/**
 * A hub city carries its own market weights, because "the economics of a
 * fixture" is not one number nationally — a Bengaluru room prices, fills and
 * costs differently from a Vijayawada one.
 *
 * The four indices are relative to a notional baseline of 1.0 (roughly a
 * mid-market Tier-2 room). `fixtureShare` is that city's slice of its zone's
 * fixture calendar and sums to 1 across the zone, which is what lets the
 * economics slicer scope a season down to a single market without
 * double-counting nights.
 */
export interface HubCity {
  city: string;
  state: string;
  note: string;
  /** This city's share of the zone's fixture calendar. Sums to 1 per zone. */
  fixtureShare: number;
  /** Ticket price the market bears. */
  priceIdx: number;
  /** Typical room size. */
  capacityIdx: number;
  /** Cost of staging a night here. */
  costIdx: number;
  /** How far content from this market travels digitally. */
  reachIdx: number;
}

/** Share-weighted average of one index across a zone's cities. */
export function zoneIndex(
  cities: HubCity[],
  key: "priceIdx" | "capacityIdx" | "costIdx" | "reachIdx",
): number {
  const total = cities.reduce((sum, c) => sum + c.fixtureShare, 0);
  if (total === 0) return 1;
  return cities.reduce((sum, c) => sum + c[key] * c.fixtureShare, 0) / total;
}

export interface Zone {
  /** URL slug — /league/<slug> for the tier-2 hubs. */
  slug: string;
  name: string;
  shortName: string;
  tier: ZoneTier;
  /** Slug of the zone this feeds into, if any. */
  feedsInto?: string;
  status: string;
  headline: string;
  languages: string[];
  hubCities: HubCity[];
  strategy: string;
  campusChapters: number;
  accent: string;
}

export const ZONES: Zone[] = [
  {
    slug: "national",
    name: "Kalakshetra National Championship",
    shortName: "National",
    tier: "national",
    status: "Year 2+",
    headline: "The top two bands from every zone meet on one stage.",
    languages: ["Pan-India"],
    hubCities: [
      {
        city: "Rotating host",
        state: "National",
        note: "Single-venue broadcast finale",
        fixtureShare: 1,
        priceIdx: 1.6,
        capacityIdx: 2.2,
        costIdx: 1.9,
        reachIdx: 2.2,
      },
    ],
    strategy:
      "One national final, broadcast as a property in its own right. Zone champions arrive with a season of catalogue and a proven live draw behind them.",
    campusChapters: 0,
    accent: "amber",
  },
  {
    slug: "south-zone",
    name: "South Zone League",
    shortName: "South Zone",
    tier: "zone",
    feedsInto: "national",
    status: "Year 1, Stage 3",
    headline: "State winners from across the South meet in cross-state fixtures.",
    languages: ["Telugu", "Tamil", "Kannada", "Malayalam"],
    hubCities: [
      { city: "Bengaluru", state: "Karnataka", note: "India's densest indie and pub-gig market", fixtureShare: 0.28, priceIdx: 1.35, capacityIdx: 1.35, costIdx: 1.3, reachIdx: 1.45 },
      { city: "Chennai", state: "Tamil Nadu", note: "Deep live circuit and college-band culture", fixtureShare: 0.24, priceIdx: 1.2, capacityIdx: 1.3, costIdx: 1.2, reachIdx: 1.25 },
      { city: "Kochi", state: "Kerala", note: "Established festival and fusion audience", fixtureShare: 0.16, priceIdx: 1.05, capacityIdx: 1.0, costIdx: 1.02, reachIdx: 1.0 },
      { city: "Coimbatore", state: "Tamil Nadu", note: "Strong regional touring stop", fixtureShare: 0.12, priceIdx: 0.88, capacityIdx: 0.85, costIdx: 0.9, reachIdx: 0.8 },
      { city: "Mysuru", state: "Karnataka", note: "Campus-heavy secondary hub", fixtureShare: 0.1, priceIdx: 0.85, capacityIdx: 0.8, costIdx: 0.85, reachIdx: 0.72 },
      { city: "Trivandrum", state: "Kerala", note: "Emerging original-music scene", fixtureShare: 0.1, priceIdx: 0.9, capacityIdx: 0.85, costIdx: 0.9, reachIdx: 0.82 },
    ],
    strategy:
      "Capitalise on the live music, pub and indie culture already running in Bengaluru and Chennai. Cross-state fixtures — a Hyderabad franchise against a Bengaluru franchise — turn a state league into a regional rivalry with two fanbases per night.",
    campusChapters: 40,
    accent: "emerald",
  },
  {
    slug: "north-belt",
    name: "North Belt League",
    shortName: "North Belt",
    tier: "zone",
    feedsInto: "national",
    status: "Year 2",
    headline: "The Hindi belt, entered once the format has a track record.",
    languages: ["Hindi", "Bhojpuri", "Punjabi", "Bengali"],
    hubCities: [
      {
        city: "Delhi NCR",
        state: "Delhi · Haryana · UP",
        note: "National brand and sponsorship centre, with venue density in Gurgaon and the campus belt and production base in Noida",
        fixtureShare: 0.26,
        priceIdx: 1.4,
        capacityIdx: 1.4,
        costIdx: 1.35,
        reachIdx: 1.55,
      },
      { city: "Mumbai", state: "Maharashtra", note: "Label, sync and OTT decision-makers", fixtureShare: 0.24, priceIdx: 1.5, capacityIdx: 1.35, costIdx: 1.45, reachIdx: 1.6 },
      { city: "Pune", state: "Maharashtra", note: "Large student audience, active gig scene", fixtureShare: 0.16, priceIdx: 1.1, capacityIdx: 1.1, costIdx: 1.1, reachIdx: 1.1 },
      { city: "Kolkata", state: "West Bengal", note: "Long-standing band culture", fixtureShare: 0.14, priceIdx: 0.95, capacityIdx: 1.05, costIdx: 0.98, reachIdx: 1.0 },
      { city: "Guwahati", state: "Assam", note: "North-East rock and metal heartland", fixtureShare: 0.1, priceIdx: 0.85, capacityIdx: 0.9, costIdx: 0.92, reachIdx: 0.85 },
      { city: "Chandigarh", state: "Punjab", note: "Punjabi-language crossover audience", fixtureShare: 0.1, priceIdx: 1.0, capacityIdx: 0.95, costIdx: 1.0, reachIdx: 0.95 },
    ],
    strategy:
      "Target high-CPM digital markets. The Hindi belt brings larger streaming numbers per release, national brand sponsorship budgets and the OTT buyers who matter for broadcast — which is why it comes after the format is proven, not before.",
    campusChapters: 55,
    accent: "purple",
  },
  {
    slug: "ap-ts",
    name: "AP / TS State League",
    shortName: "AP / TS",
    tier: "state",
    feedsInto: "south-zone",
    status: "Pilot — live now",
    headline: "The proof-of-concept market where the format is being built.",
    languages: ["Telugu"],
    hubCities: [
      { city: "Hyderabad", state: "Telangana", note: "Primary hub — venues, studios and production base", fixtureShare: 0.4, priceIdx: 1.15, capacityIdx: 1.3, costIdx: 1.15, reachIdx: 1.3 },
      { city: "Visakhapatnam", state: "Andhra Pradesh", note: "Coastal hub with a strong college circuit", fixtureShare: 0.25, priceIdx: 0.92, capacityIdx: 0.9, costIdx: 0.92, reachIdx: 0.88 },
      { city: "Vijayawada", state: "Andhra Pradesh", note: "Central AP fixture stop", fixtureShare: 0.2, priceIdx: 0.82, capacityIdx: 0.8, costIdx: 0.85, reachIdx: 0.75 },
      { city: "Tirupati", state: "Andhra Pradesh", note: "South Andhra hub — temple-town footfall and a young campus base", fixtureShare: 0.15, priceIdx: 0.75, capacityIdx: 0.72, costIdx: 0.8, reachIdx: 0.65 },
    ],
    strategy:
      "Prove the unit economics and the fixture format in one language market before spending a rupee on a second. Telugu indie, classical-pop fusion and rock sit alongside a campus network that can be relied on for turnout show after show.",
    campusChapters: 15,
    accent: "cyan",
  },
];

/**
 * Zones that have their own hub page, live pilot first — the AP/TS chapter is
 * the one actually running, so it leads the selector rather than trailing it.
 */
export const ZONE_HUBS = ZONES.filter((z) => z.tier !== "national").sort(
  (a, b) => (a.tier === "state" ? 0 : 1) - (b.tier === "state" ? 0 : 1),
);

export function getZone(slug: string): Zone | undefined {
  return ZONES.find((z) => z.slug === slug);
}

/* ------------------------------------------------------------------ *
 * Illustrative standings
 *
 * Synthetic slot names on purpose — these demonstrate the table format and are
 * not a record of any real band's results.
 * ------------------------------------------------------------------ */

export interface StandingRow {
  position: number;
  band: string;
  house: string;
  zone: string;
  played: number;
  juryPoints: number;
  gatePoints: number;
  fanPoints: number;
  releasePoints: number;
  victoryBonus: number;
}

export function totalPoints(r: StandingRow): number {
  return r.juryPoints + r.gatePoints + r.fanPoints + r.releasePoints + r.victoryBonus;
}

export const SAMPLE_STANDINGS: StandingRow[] = [
  { position: 1, band: "Band A", house: "House I", zone: "ap-ts", played: 8, juryPoints: 68, gatePoints: 71, fanPoints: 34, releasePoints: 30, victoryBonus: 12 },
  { position: 2, band: "Band B", house: "House III", zone: "ap-ts", played: 8, juryPoints: 71, gatePoints: 62, fanPoints: 31, releasePoints: 25, victoryBonus: 9 },
  { position: 3, band: "Band C", house: "House II", zone: "ap-ts", played: 8, juryPoints: 63, gatePoints: 64, fanPoints: 36, releasePoints: 25, victoryBonus: 6 },
  { position: 4, band: "Band D", house: "House I", zone: "ap-ts", played: 8, juryPoints: 66, gatePoints: 57, fanPoints: 28, releasePoints: 30, victoryBonus: 6 },
  { position: 5, band: "Band E", house: "House IV", zone: "ap-ts", played: 8, juryPoints: 59, gatePoints: 58, fanPoints: 30, releasePoints: 20, victoryBonus: 3 },
  { position: 6, band: "Band F", house: "House V", zone: "ap-ts", played: 8, juryPoints: 61, gatePoints: 49, fanPoints: 26, releasePoints: 20, victoryBonus: 3 },
  { position: 7, band: "Band G", house: "House III", zone: "ap-ts", played: 8, juryPoints: 54, gatePoints: 52, fanPoints: 24, releasePoints: 15, victoryBonus: 0 },
  { position: 8, band: "Band H", house: "House II", zone: "ap-ts", played: 8, juryPoints: 52, gatePoints: 44, fanPoints: 22, releasePoints: 15, victoryBonus: 0 },

  { position: 1, band: "Band J", house: "House VI", zone: "south-zone", played: 6, juryPoints: 52, gatePoints: 55, fanPoints: 27, releasePoints: 25, victoryBonus: 9 },
  { position: 2, band: "Band K", house: "House VII", zone: "south-zone", played: 6, juryPoints: 55, gatePoints: 48, fanPoints: 25, releasePoints: 20, victoryBonus: 6 },
  { position: 3, band: "Band L", house: "House VIII", zone: "south-zone", played: 6, juryPoints: 49, gatePoints: 50, fanPoints: 28, releasePoints: 15, victoryBonus: 6 },
  { position: 4, band: "Band M", house: "House VI", zone: "south-zone", played: 6, juryPoints: 47, gatePoints: 46, fanPoints: 21, releasePoints: 20, victoryBonus: 3 },
  { position: 5, band: "Band N", house: "House IX", zone: "south-zone", played: 6, juryPoints: 44, gatePoints: 41, fanPoints: 19, releasePoints: 15, victoryBonus: 0 },

  { position: 1, band: "Band P", house: "House X", zone: "north-belt", played: 4, juryPoints: 35, gatePoints: 37, fanPoints: 18, releasePoints: 15, victoryBonus: 6 },
  { position: 2, band: "Band Q", house: "House XI", zone: "north-belt", played: 4, juryPoints: 36, gatePoints: 32, fanPoints: 17, releasePoints: 15, victoryBonus: 3 },
  { position: 3, band: "Band R", house: "House XII", zone: "north-belt", played: 4, juryPoints: 32, gatePoints: 34, fanPoints: 16, releasePoints: 10, victoryBonus: 3 },
  { position: 4, band: "Band S", house: "House X", zone: "north-belt", played: 4, juryPoints: 30, gatePoints: 29, fanPoints: 14, releasePoints: 10, victoryBonus: 0 },
];

export function standingsForZone(zoneSlug: string): StandingRow[] {
  return SAMPLE_STANDINGS.filter((r) => r.zone === zoneSlug).sort(
    (a, b) => totalPoints(b) - totalPoints(a),
  );
}

/** Bands that make the top-quartile cut in a given table. */
export function qualifyingCount(rows: number): number {
  return Math.max(1, Math.ceil(rows * 0.25));
}
