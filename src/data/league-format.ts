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

/**
 * Three metrics, ten points each, thirty on the night.
 *
 * The jury line was removed deliberately: this is a public-driven league, so
 * every point now comes from something the audience does — turn up, vote, or
 * stream the record. Nothing is decided by a panel.
 */
export const SCORING_METRICS: ScoringMetric[] = [
  {
    metric: "Ticket Sales / Gate Turnout",
    maxPoints: 10,
    basis:
      "Scaled on the share of venue capacity actually filled, from scanned entries rather than tickets sold.",
    pillar: "commercial",
  },
  {
    metric: "Fan Voting (App + Web)",
    maxPoints: 10,
    basis:
      "A Bayesian average of ticket-verified ratings, so a handful of perfect scores cannot outrank a large honest sample. One vote per verified account, inside the 24-hour match window.",
    pillar: "engagement",
  },
  {
    metric: "Original IP Reach",
    maxPoints: 10,
    basis:
      "Five points for the catalogue actually shipped, five for verified digital reach. Scored on active listeners and growth rather than follower counts, which are the easiest number online to buy.",
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

/**
 * Fan points, 1-10, on a Bayesian average.
 *
 *     W = (v*R + m*C) / (v + m)
 *
 * A raw average punishes and rewards small samples wildly: one 10/10 from three
 * people would outrank 9.1 from four hundred. The Bayesian form pulls a rating
 * toward the league mean until enough verified votes exist to move it, so a
 * score only becomes extreme when it has earned the right to be.
 *
 * Only ticket-verified accounts are prompted to rate, one vote each, inside the
 * 24-hour match window.
 */
export const BAYESIAN = {
  /** m — votes required before a score stabilises and stops being pulled to the mean. */
  minVotes: 50,
  /** C — the league-wide mean rating, the baseline a new band starts against. */
  leagueMean: 7.2,
  /** Rating scale the audience votes on. */
  scaleMin: 1,
  scaleMax: 10,
} as const;

/** Weighted rating W for v verified votes averaging R. */
export function bayesianRating(
  votes: number,
  rawAverage: number,
  m: number = BAYESIAN.minVotes,
  C: number = BAYESIAN.leagueMean,
): number {
  const v = Math.max(0, votes);
  return (v * rawAverage + m * C) / (v + m);
}

/** Fan points are the weighted rating, rounded and floored at 1. */
export function fanPointsFor(votes: number, rawAverage: number): number {
  const w = bayesianRating(votes, rawAverage);
  return Math.min(BAYESIAN.scaleMax, Math.max(1, Math.round(w)));
}

/** Worked rows for the page, showing how the sample size pulls a score. */
export interface BayesianExample {
  votes: number;
  rawAverage: number;
  weighted: number;
  points: number;
  note: string;
}

export const BAYESIAN_EXAMPLES: BayesianExample[] = [
  { votes: 3, rawAverage: 10, weighted: 0, points: 0, note: "Three friends rating 10/10 barely moves it" },
  { votes: 40, rawAverage: 9.2, weighted: 0, points: 0, note: "A strong night, still short of the threshold" },
  { votes: 220, rawAverage: 9.1, weighted: 0, points: 0, note: "Past the threshold, the real score stands" },
  { votes: 300, rawAverage: 4.0, weighted: 0, points: 0, note: "A poor night, equally hard to hide" },
].map((e) => ({
  ...e,
  weighted: Math.round(bayesianRating(e.votes, e.rawAverage) * 100) / 100,
  points: fanPointsFor(e.votes, e.rawAverage),
}));

/**
 * Original IP, 10 points, split so neither half can be gamed alone.
 *
 *   Catalogue Release Count  (5) — did you actually ship music?
 *   Verified Digital Reach   (5) — is anyone actually listening?
 *
 * Raw follower counts are deliberately not used anywhere. They are the easiest
 * number on the internet to buy, and they let a band coast on a dead legacy
 * audience. Reach is scored on the share of an audience that is ACTIVE and on
 * how fast it is growing, so a small band with real listeners beats a large
 * one with an inert follower base.
 */
export interface ReleaseBand {
  releases: number;
  label: string;
  points: number;
}

export const CATALOGUE_SCALE: ReleaseBand[] = [
  { releases: 3, label: "3 or more originals live", points: 5 },
  { releases: 2, label: "2 originals live", points: 3 },
  { releases: 1, label: "1 original live", points: 2 },
  { releases: 0, label: "Nothing released yet", points: 0 },
];

export function cataloguePointsFor(releasesLive: number): number {
  const band = CATALOGUE_SCALE.find((b) => releasesLive >= b.releases);
  return band ? band.points : 0;
}

/**
 * Active Listener Rate.
 *
 *     ALR = (monthly active streamers + engaged video viewers) / (followers + m)
 *
 * The smoothing constant stops a brand-new account with five followers and five
 * streams from posting a perfect ratio.
 */
export const ALR_SMOOTHING = 1000;

export function activeListenerRate(
  monthlyActiveStreamers: number,
  engagedVideoViewers: number,
  totalFollowers: number,
  m: number = ALR_SMOOTHING,
): number {
  return (monthlyActiveStreamers + engagedVideoViewers) / (totalFollowers + m);
}

export interface ReachBand {
  label: string;
  minAlrPct: number;
  growth: string;
  points: number;
}

export const DIGITAL_REACH_SCALE: ReachBand[] = [
  { label: "High \u2014 over 40% active", minAlrPct: 40, growth: "Over 15% new-listener growth", points: 5 },
  { label: "Good \u2014 25\u201339% active", minAlrPct: 25, growth: "10\u201315% growth", points: 4 },
  { label: "Moderate \u2014 15\u201324% active", minAlrPct: 15, growth: "5\u20139% growth", points: 3 },
  { label: "Low \u2014 5\u201314% active", minAlrPct: 5, growth: "Under 5% growth", points: 2 },
  { label: "Inactive or inauthentic \u2014 under 5%", minAlrPct: 0, growth: "Flat or negative", points: 1 },
];

export function digitalReachPointsFor(alrPct: number): number {
  const band = DIGITAL_REACH_SCALE.find((b) => alrPct >= b.minAlrPct);
  return band ? band.points : 1;
}

export function originalIpPointsFor(releasesLive: number, alrPct: number): number {
  return cataloguePointsFor(releasesLive) + digitalReachPointsFor(alrPct);
}

/** The three rules that keep the metric honest. */
export const IP_INTEGRITY_RULES: { rule: string; detail: string }[] = [
  {
    rule: "Distributor-API direct sync",
    detail:
      "Figures are pulled straight from Spotify for Artists, YouTube Content ID and Apple Music. Self-reported screenshots and manual uploads are never accepted.",
  },
  {
    rule: "7-day pre-fixture cutoff",
    detail:
      "Only originals live on platforms at least seven days before matchday count, so nobody drops a spam track the morning of a gig to claim points.",
  },
  {
    rule: "Spike penalty",
    detail:
      "A follower jump over 300% in 48 hours without a matching rise in verified listen-through is flagged and capped at zero for that fixture window, pending audit.",
  },
];

/** Engaged views only: over 60% average watch time, which bot clicks do not reach. */
export const ENGAGED_VIEW_THRESHOLD_PCT = 60;

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

/**
 * Roster shape per regional league — the single source of truth for how many
 * houses and bands each zone fields. Everything downstream (the match matrix,
 * the national capacity engine, the economics slicer, the expansion table on
 * the About page) reads these numbers instead of restating them, which is what
 * stopped the site publishing two different band counts.
 */
export const ZONE_ROSTERS: Record<string, { houses: number; bandsPerHouse: number }> = {
  // Every league is the same shape: 5 houses x 4 bands = 20 bands per zone,
  // 100 nationally. Equal rosters mean equal fixtures and equal cross nights,
  // so the national table compares like with like without adjustment.
  "ap-ts": { houses: 5, bandsPerHouse: 4 },
  karnataka: { houses: 5, bandsPerHouse: 4 },
  "tamil-nadu": { houses: 5, bandsPerHouse: 4 },
  kerala: { houses: 5, bandsPerHouse: 4 },
  north: { houses: 5, bandsPerHouse: 4 },
};

/** The fixture mix, identical in every zone. */
export const STAGE_2_STRUCTURE: MatrixStructure = {
  houses: ZONE_ROSTERS["ap-ts"].houses,
  bandsPerHouse: ZONE_ROSTERS["ap-ts"].bandsPerHouse,
  ticketedSoloPerBand: 5,
  campusSoloPerBand: 4,
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

/** Competition weekends in the regular season, shared by every zone. */
export const COMPETITION_WEEKENDS = 20;

/**
 * The calendar is now the NATIONAL one. AP/TS is a zone inside it, not a season
 * of its own — all five regional leagues run the same weekends simultaneously,
 * so a separate 23-week pilot calendar would have contradicted the national
 * build the moment both were on the site. Full architecture on /season.
 */
export const SEASON_PHASES: SeasonPhase[] = [
  {
    phase: "Phase 0",
    title: "Draft & Pre-Season",
    weeks: "December",
    weekCount: 4,
    detail:
      "The artist draft, contracting, rehearsal blocks and the first writing sessions. No fixtures and no points \u2014 the season is being loaded, not played.",
  },
  {
    phase: "Phase 1",
    title: "Regular Season",
    weeks: "23 Jan \u2013 12 Jun",
    weekCount: 21,
    detail: `${COMPETITION_WEEKENDS} competition weekends plus one recovery weekend. Each band plays its ${STAGE_2_MATRIX.individualShowsPerBand} individual fixtures inside its house's own weekends, with originals dropping on a rolling schedule.`,
  },
  {
    phase: "Phase 2",
    title: "Regional Finals",
    weeks: "July",
    weekCount: 4,
    detail: `Each zone crowns its champion and sends its top ${5} up. Post-season shows run alongside as commercial gigs rather than fixtures.`,
  },
  {
    phase: "Phase 3",
    title: "National Championship",
    weeks: "Aug \u2013 Oct",
    weekCount: 13,
    detail:
      "Qualifiers from all five zones meet: 25 down to 10, then 5, then the final. Deliberately placed here so it never collides with the next season's draft.",
  },
  {
    phase: "Phase 4",
    title: "Tours & Festival Circuit",
    weeks: "November",
    weekCount: 4,
    detail:
      "College fests, city tours, brand events and the festival season. The league acts as a booking network, not a competition \u2014 the artist year does not stop when the league does.",
  },
];

export const SEASON_WEEKS = SEASON_PHASES[1].weekCount;
/** Competitive weeks only \u2014 the regular season, excluding the draft window. */
export const COMPETITIVE_WEEKS = SEASON_WEEKS;
/** The whole annual cycle, draft through festival circuit. */
export const ANNUAL_CYCLE_WEEKS = SEASON_PHASES.reduce((s, p) => s + p.weekCount, 0);
/** One league season per year. It is an annual competition, not a rolling one. */
export const SEASONS_PER_YEAR = 1;

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
  /** Production houses in this regional league. */
  houses: number;
  /** Bands each house signs here. Four, in every zone — the leagues are equal. */
  bandsPerHouse: number;
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
    houses: 0,
    bandsPerHouse: 0,
    status: "Season 1 · Aug–Oct",
    headline: "The qualifiers from all five regional leagues meet.",
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
      "One national championship, broadcast as a property in its own right. Zone qualifiers arrive with a full season of catalogue and a proven live draw behind them.",
    campusChapters: 0,
    accent: "amber",
  },
  {
    slug: "ap-ts",
    name: "AP / Telangana League",
    shortName: "AP / TS",
    tier: "state",
    feedsInto: "national",
    houses: ZONE_ROSTERS["ap-ts"].houses,
    bandsPerHouse: ZONE_ROSTERS["ap-ts"].bandsPerHouse,
    status: "Season 1 · live",
    headline: "Where the format was designed, and the first league to fill a roster.",
    languages: ["Telugu"],
    hubCities: [
      { city: "Hyderabad", state: "Telangana", note: "Primary hub — venues, studios and production base", fixtureShare: 0.4, priceIdx: 1.15, capacityIdx: 1.3, costIdx: 1.15, reachIdx: 1.3 },
      { city: "Visakhapatnam", state: "Andhra Pradesh", note: "Coastal hub with a strong college circuit", fixtureShare: 0.25, priceIdx: 0.92, capacityIdx: 0.9, costIdx: 0.92, reachIdx: 0.88 },
      { city: "Vijayawada", state: "Andhra Pradesh", note: "Central AP fixture stop", fixtureShare: 0.2, priceIdx: 0.82, capacityIdx: 0.8, costIdx: 0.85, reachIdx: 0.75 },
      { city: "Tirupati", state: "Andhra Pradesh", note: "South Andhra hub — temple-town footfall and a young campus base", fixtureShare: 0.15, priceIdx: 0.75, capacityIdx: 0.72, costIdx: 0.8, reachIdx: 0.65 },
    ],
    strategy:
      "Where the format was designed. Season 1 opens here alongside the other four leagues rather than ahead of them, and at the same roster size.",
    campusChapters: 15,
    accent: "cyan",
  },
  {
    slug: "karnataka",
    name: "Karnataka League",
    shortName: "Karnataka",
    tier: "state",
    feedsInto: "national",
    houses: ZONE_ROSTERS.karnataka.houses,
    bandsPerHouse: ZONE_ROSTERS.karnataka.bandsPerHouse,
    status: "Season 1 · live",
    headline: "India's densest indie and pub-gig market.",
    languages: ["Kannada"],
    hubCities: [
      { city: "Bengaluru", state: "Karnataka", note: "The country's deepest live circuit — a functioning scene to plug into rather than build", fixtureShare: 0.72, priceIdx: 1.35, capacityIdx: 1.35, costIdx: 1.3, reachIdx: 1.45 },
      { city: "Mysuru", state: "Karnataka", note: "Campus-heavy secondary hub", fixtureShare: 0.28, priceIdx: 0.85, capacityIdx: 0.8, costIdx: 0.85, reachIdx: 0.72 },
    ],
    strategy:
      "The shortest path to a working live circuit anywhere in the country. Bengaluru already has the venues, the audience and the habit of paying for a ticket.",
    campusChapters: 12,
    accent: "emerald",
  },
  {
    slug: "tamil-nadu",
    name: "Tamil Nadu League",
    shortName: "Tamil Nadu",
    tier: "state",
    feedsInto: "national",
    houses: ZONE_ROSTERS["tamil-nadu"].houses,
    bandsPerHouse: ZONE_ROSTERS["tamil-nadu"].bandsPerHouse,
    status: "Season 1 · live",
    headline: "Deep live circuit and a college-band culture that feeds the campus leg directly.",
    languages: ["Tamil"],
    hubCities: [
      { city: "Chennai", state: "Tamil Nadu", note: "Deep live circuit and college-band culture", fixtureShare: 0.67, priceIdx: 1.2, capacityIdx: 1.3, costIdx: 1.2, reachIdx: 1.25 },
      { city: "Coimbatore", state: "Tamil Nadu", note: "Strong regional touring stop", fixtureShare: 0.33, priceIdx: 0.88, capacityIdx: 0.85, costIdx: 0.9, reachIdx: 0.8 },
    ],
    strategy:
      "The campus circuit here is already organised around inter-college competition, which is the behaviour the league depends on rather than one it has to teach.",
    campusChapters: 14,
    accent: "purple",
  },
  {
    slug: "kerala",
    name: "Kerala League",
    shortName: "Kerala",
    tier: "state",
    feedsInto: "national",
    houses: ZONE_ROSTERS.kerala.houses,
    bandsPerHouse: ZONE_ROSTERS.kerala.bandsPerHouse,
    status: "Season 1 · live",
    headline: "Established festival and fusion audience.",
    languages: ["Malayalam"],
    hubCities: [
      { city: "Kochi", state: "Kerala", note: "Established festival and fusion audience", fixtureShare: 0.62, priceIdx: 1.05, capacityIdx: 1.0, costIdx: 1.02, reachIdx: 1.0 },
      { city: "Trivandrum", state: "Kerala", note: "Emerging original-music scene", fixtureShare: 0.38, priceIdx: 0.9, capacityIdx: 0.85, costIdx: 0.9, reachIdx: 0.82 },
    ],
    strategy:
      "A market already used to paying for live music at festivals. The league is offering a season rather than a weekend, which is the part that is new here.",
    campusChapters: 10,
    accent: "emerald",
  },
  {
    slug: "north",
    name: "North India League",
    shortName: "North India",
    tier: "state",
    feedsInto: "national",
    houses: ZONE_ROSTERS.north.houses,
    bandsPerHouse: ZONE_ROSTERS.north.bandsPerHouse,
    status: "Season 1 · live",
    headline: "Highest-CPM digital market and the sponsorship centre.",
    languages: ["Hindi", "Punjabi", "Bengali", "Assamese", "Marathi"],
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
      "Larger streaming numbers per release, national sponsorship budgets and the OTT buyers who matter for broadcast. The widest language spread of any zone.",
    campusChapters: 25,
    accent: "purple",
  },
];

/**
 * The five regional leagues, each with its own hub page. The national tier is
 * a championship rather than a league, so it has no hub of its own.
 *
 * This replaced an older three-tier pyramid (AP/TS feeding a South Zone
 * feeding a national final). That taxonomy contradicted the national plan the
 * moment both were on the site: South Zone has been split into its three real
 * markets, and North Belt is now North India.
 */
export const ZONE_HUBS = ZONES.filter((z) => z.tier === "state");

/** Bands fielded by one regional league. */
export function zoneBands(z: Zone): number {
  return z.houses * z.bandsPerHouse;
}

export const NATIONAL_TOTAL_HOUSES = ZONE_HUBS.reduce((sum, z) => sum + z.houses, 0);
export const NATIONAL_TOTAL_BANDS = ZONE_HUBS.reduce((sum, z) => sum + zoneBands(z), 0);

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
  gatePoints: number;
  fanPoints: number;
  releasePoints: number;
  victoryBonus: number;
}

export function totalPoints(r: StandingRow): number {
  return r.gatePoints + r.fanPoints + r.releasePoints + r.victoryBonus;
}

const BAND_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const HOUSE_NUMERALS = ["I", "II", "III", "IV", "V"];

/**
 * Synthetic standings, generated per zone rather than hand-written.
 *
 * Generating them means the table always matches the roster the zone actually
 * fields — an earlier hardcoded list still referenced zones that no longer
 * exist, so two of the three tabs rendered empty. Points decay with position so
 * the table reads plausibly; none of it is a record of anything.
 */
function buildSampleStandings(): StandingRow[] {
  const rows: StandingRow[] = [];
  ZONE_HUBS.forEach((zone, zoneIdx) => {
    const bands = Math.min(zoneBands(zone), 8);
    const played = zone.slug === "ap-ts" ? 8 : 6;
    for (let i = 0; i < bands; i += 1) {
      const decay = 1 - i * 0.075;
      rows.push({
        position: i + 1,
        band: `Band ${BAND_LETTERS[(zoneIdx * 8 + i) % BAND_LETTERS.length]}`,
        house: `House ${HOUSE_NUMERALS[i % zone.houses]}`,
        zone: zone.slug,
        played,
        gatePoints: Math.round(played * 8.4 * decay),
        fanPoints: Math.round(played * 8.1 * decay),
        releasePoints: Math.round(played * 7.4 * decay),
        victoryBonus: Math.max(0, (bands - i - 3)) * 3,
      });
    }
  });
  return rows;
}

export const SAMPLE_STANDINGS: StandingRow[] = buildSampleStandings();

export function standingsForZone(zoneSlug: string): StandingRow[] {
  return SAMPLE_STANDINGS.filter((r) => r.zone === zoneSlug).sort(
    (a, b) => totalPoints(b) - totalPoints(a),
  );
}

/** Bands that make the top-quartile cut in a given table. */
export function qualifyingCount(rows: number): number {
  return Math.max(1, Math.ceil(rows * 0.25));
}
