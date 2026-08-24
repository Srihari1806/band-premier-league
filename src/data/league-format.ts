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
  soloPerBand: number;
  intraHousePerBand: number;
  interHousePerBand: number;
}

/** Stage 2 — the 2-month AP/TS regional league. */
export const STAGE_2_STRUCTURE: MatrixStructure = {
  houses: 5,
  bandsPerHouse: 4,
  soloPerBand: 3,
  intraHousePerBand: 2,
  interHousePerBand: 3,
};

export interface MatrixCategory {
  category: string;
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
  showsPerBand: number;
  categories: MatrixCategory[];
  totalFixtures: number;
}

export function computeMatchMatrix(s: MatrixStructure): MatchMatrix {
  const totalBands = s.houses * s.bandsPerHouse;
  const categories: MatrixCategory[] = [
    {
      category: "Solo Showcase",
      showsPerBand: s.soloPerBand,
      // One band, one night — no sharing.
      fixtures: totalBands * s.soloPerBand,
      actsPerFixture: 1,
      purpose:
        "Standalone concert nights at partner venues. The band carries the room alone, builds its own core fanbase and tests original material.",
    },
    {
      category: "Intra-House Derby",
      showsPerBand: s.intraHousePerBand,
      // Two bands from the same house share the night.
      fixtures: Math.round((totalBands * s.intraHousePerBand) / 2),
      actsPerFixture: 2,
      purpose:
        "Bands signed to the same production house face each other to settle the top house seed. The house keeps the full franchise share either way.",
    },
    {
      category: "Inter-House Rivalry",
      showsPerBand: s.interHousePerBand,
      // Two bands from rival houses share the night.
      fixtures: Math.round((totalBands * s.interHousePerBand) / 2),
      actsPerFixture: 2,
      purpose:
        "Direct match-ups against rival house bands across regional hub venues. Two fanbases in one room — the biggest draw on the calendar.",
    },
  ];
  return {
    houses: s.houses,
    bandsPerHouse: s.bandsPerHouse,
    totalBands,
    showsPerBand: s.soloPerBand + s.intraHousePerBand + s.interHousePerBand,
    categories,
    totalFixtures: categories.reduce((sum, c) => sum + c.fixtures, 0),
  };
}

export const STAGE_2_MATRIX = computeMatchMatrix(STAGE_2_STRUCTURE);

/* ------------------------------------------------------------------ *
 * Zone architecture — the three-tier pyramid
 * ------------------------------------------------------------------ */

export type ZoneTier = "national" | "zone" | "state";

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
  hubCities: { city: string; state: string; note: string }[];
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
    hubCities: [{ city: "Rotating host", state: "National", note: "Single-venue broadcast finale" }],
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
      { city: "Chennai", state: "Tamil Nadu", note: "Deep live circuit and college-band culture" },
      { city: "Coimbatore", state: "Tamil Nadu", note: "Strong regional touring stop" },
      { city: "Bengaluru", state: "Karnataka", note: "India's densest indie and pub-gig market" },
      { city: "Mysuru", state: "Karnataka", note: "Campus-heavy secondary hub" },
      { city: "Kochi", state: "Kerala", note: "Established festival and fusion audience" },
      { city: "Trivandrum", state: "Kerala", note: "Emerging original-music scene" },
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
      },
      { city: "Mumbai", state: "Maharashtra", note: "Label, sync and OTT decision-makers" },
      { city: "Pune", state: "Maharashtra", note: "Large student audience, active gig scene" },
      { city: "Kolkata", state: "West Bengal", note: "Long-standing band culture" },
      { city: "Guwahati", state: "Assam", note: "North-East rock and metal heartland" },
      { city: "Chandigarh", state: "Punjab", note: "Punjabi-language crossover audience" },
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
      { city: "Hyderabad", state: "Telangana", note: "Primary hub — venues, studios and production base" },
      { city: "Visakhapatnam", state: "Andhra Pradesh", note: "Coastal hub with a strong college circuit" },
      { city: "Vijayawada", state: "Andhra Pradesh", note: "Central AP fixture stop" },
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
