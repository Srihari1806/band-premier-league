/**
 * What it costs to run the league, who pays for what, and where the profit goes.
 *
 * Two rewrites got this wrong before landing here. The first was a ₹7.7L stub
 * that could not have run a district tournament. The second overcorrected to a
 * ₹6.13Cr base by staffing the operator as though it executed events itself —
 * five permanent zone teams, an in-house media unit, and a campus network it
 * had already been given by a partner.
 *
 * The operating principle that fixes both: the operator pays for RUNNING THE
 * COMPETITION, not for developing artists or executing shows. Anything the
 * venue, the production house or the community partner already pays for, the
 * operator does not pay for again. Asset-light throughout — no owned sound,
 * lighting, staging, transport or campus network. Those are contracted or
 * partnered against a published league specification.
 *
 * Costs are planning RANGES, not point estimates, because that is what an
 * unbuilt season honestly has. `POSITION` picks where in the range the model
 * sits; nothing downstream hardcodes a figure.
 */

import { NATIONAL_TOTAL_BANDS, NATIONAL_TOTAL_HOUSES, ZONES } from "./league-format";

const STATE_ZONES = ZONES.filter((z) => z.tier === "state").length;

/* ------------------------------------------------------------------ *
 * The ten buckets
 * ------------------------------------------------------------------ */

export interface CostBucket {
  n: number;
  id: string;
  label: string;
  covers: string;
  /** Season-1 planning range, in rupees. */
  low: number;
  high: number;
  /**
   * False for the prize pool: it is cash the league must hold, but it is not a
   * cost of operating. Keeping the two apart is what lets the dashboard show
   * operating cost and total cash requirement as different numbers.
   */
  operating: boolean;
  /** True where the cost genuinely scales with fixtures rather than sitting flat. */
  perNightDriven?: boolean;
  note: string;
}

export const COST_BUCKETS: CostBucket[] = [
  {
    n: 1,
    id: "core-team",
    label: "Core Team Salaries",
    covers: "Founder, operations, partnerships, finance/admin, product, creative",
    low: 1200000,
    high: 2000000,
    operating: true,
    note: "Six roles, lean by design. Regional coordinators sit in Event Operations on contract rather than here — a permanent five-zone payroll is the fastest way to turn a seasonal business into a year-round burn rate.",
  },
  {
    n: 2,
    id: "event-ops",
    label: "Event Operations",
    covers: "Central event coordination, supervisors, travel, regional coordinators",
    low: 800000,
    high: 1500000,
    operating: true,
    perNightDriven: true,
    note: "One regional operations lead per zone on contract during the active season, plus central supervision and the travel to be present. The operator sets the standard and audits it; the production house and venue execute against it.",
  },
  {
    n: 3,
    id: "technology",
    label: "Technology / Platform",
    covers: "Website, app, servers, voting, dashboards, ticket integration",
    low: 500000,
    high: 1000000,
    operating: true,
    note: "A serious season-1 platform, not a brochure site: public fixtures, standings, profiles and voting, plus internal dashboards for houses, bands, events, ticket settlement, vote audit, sponsors, rights and budgets. Ticketing rails are integrated, never rebuilt.",
  },
  {
    n: 4,
    id: "marketing",
    label: "Marketing & Brand",
    covers: "Digital campaigns, creatives, PR, launch",
    low: 800000,
    high: 1500000,
    operating: true,
    note: "League-level only — why anyone should care that the league exists. Artist marketing is the production house's line and is not duplicated here. Campus network, artist-generated content and partner media carry a large share of reach at no incremental cost.",
  },
  {
    n: 5,
    id: "legal",
    label: "Legal / IP / Compliance",
    covers: "Contracts, trademark, copyright, CA/CS/lawyer",
    low: 300000,
    high: 600000,
    operating: true,
    note: "House and artist agreements, venue and sponsor contracts, media rights, music licensing, IP registration, voting and contest rules, privacy and tax structure. The one bucket where underspending creates liabilities rather than savings.",
  },
  {
    n: 6,
    id: "community-partner",
    label: "Community Partner",
    covers: "Community and campus network contribution",
    low: 300000,
    high: 800000,
    operating: true,
    note: "A contribution to the partner network that already reaches the campuses, rather than the cost of building a parallel one. The clearest case in the model of not paying twice.",
  },
  {
    n: 7,
    id: "central-media",
    label: "Central Media Production",
    covers: "League footage, editing, highlights, interviews",
    low: 500000,
    high: 1000000,
    operating: true,
    perNightDriven: true,
    note: "League content only — match capture, highlights, standings, interviews, behind the scenes, finals and the season documentary. Artist music videos belong to the production house. Local production partners shoot to a standard league specification instead of a travelling in-house crew.",
  },
  {
    n: 8,
    id: "celebrity",
    label: "Central Celebrity & League Activities",
    covers: "Mentor launch, finals, league-level appearances",
    low: 500000,
    high: 1500000,
    operating: true,
    note: "Negotiated as annual associations with defined appearances and content, not per-appearance fees. A mentor association is mostly digital — intro video, song and rehearsal feedback, social collaboration — with selected mentors physically present on signature nights.",
  },
  {
    n: 9,
    id: "prize",
    label: "Prize Pool",
    covers: "Regional + national awards",
    low: 1000000,
    high: 2000000,
    operating: false,
    note: "Held apart from operating cost. This range is the announced FLOOR the league commits to; once profitable the payout becomes the greater of this or the profit share.",
  },
  {
    n: 10,
    id: "contingency",
    label: "Contingency / Insurance",
    covers: "Unexpected operational expenses",
    low: 500000,
    high: 1000000,
    operating: true,
    note: "Venue cancellation, weather, equipment failure, artist or celebrity illness, refunds, travel and technical failure. Live entertainment produces all of these every season; a budget without this line is a forecast.",
  },
];

/** Where in the planning range the model currently sits. */
export type Position = "low" | "mid" | "high";

export const POSITION: Position = "mid";

export function amountAt(b: CostBucket, position: Position = POSITION): number {
  if (position === "low") return b.low;
  if (position === "high") return b.high;
  return Math.round((b.low + b.high) / 2);
}

/** Contingency should land inside this band of the operating buckets it protects. */
export const CONTINGENCY_TARGET = { minPct: 10, maxPct: 15 } as const;

export interface CostedBucket extends CostBucket {
  amount: number;
}

export interface CostScale {
  zones: number;
  nights: number;
  campuses: number;
  bands: number;
  houses: number;
}

export interface OperationsResult {
  buckets: CostedBucket[];
  /** Buckets 1–8 and 10 — everything that is a cost of operating. */
  operating: number;
  /** Bucket 9. Cash the league must hold, but not an operating cost. */
  prize: number;
  /** operating + prize. The number a funder is actually asked for. */
  cashRequirement: number;
  low: number;
  high: number;
  contingencyPct: number;
  contingencyInBand: boolean;
  /** Operating cost divided by nights — an allocation, NOT a staging cost. */
  perNight: number;
  /** The part that genuinely scales with fixtures. */
  perNightIncurred: number;
  perNightAllocatedOverhead: number;
  byCategory: { category: string; amount: number; share: number }[];
}

export function costOperations(
  scale: CostScale,
  position: Position = POSITION,
): OperationsResult {
  const buckets: CostedBucket[] = COST_BUCKETS.map((b) => ({
    ...b,
    amount: amountAt(b, position),
  }));

  const operating = buckets.filter((b) => b.operating).reduce((s, b) => s + b.amount, 0);
  const prize = buckets.filter((b) => !b.operating).reduce((s, b) => s + b.amount, 0);

  const contingency = buckets.find((b) => b.id === "contingency")?.amount ?? 0;
  const protectedBase = operating - contingency;
  const contingencyPct = protectedBase === 0 ? 0 : (contingency / protectedBase) * 100;

  // Only the fixture-driven buckets are caused by staging one more night.
  const perNightBase = buckets
    .filter((b) => b.perNightDriven)
    .reduce((s, b) => s + b.amount, 0);
  const perNight = scale.nights === 0 ? 0 : operating / scale.nights;
  const perNightIncurred = scale.nights === 0 ? 0 : perNightBase / scale.nights;

  return {
    buckets,
    operating,
    prize,
    cashRequirement: operating + prize,
    low: COST_BUCKETS.reduce((s, b) => s + b.low, 0),
    high: COST_BUCKETS.reduce((s, b) => s + b.high, 0),
    contingencyPct,
    contingencyInBand:
      contingencyPct >= CONTINGENCY_TARGET.minPct && contingencyPct <= CONTINGENCY_TARGET.maxPct,
    perNight,
    perNightIncurred,
    perNightAllocatedOverhead: perNight - perNightIncurred,
    byCategory: buckets
      .filter((b) => b.operating)
      .map((b) => ({
        category: b.label,
        amount: b.amount,
        share: operating === 0 ? 0 : (b.amount / operating) * 100,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}

/* ------------------------------------------------------------------ *
 * The team behind bucket 1
 * ------------------------------------------------------------------ */

export interface Role {
  title: string;
  monthlyLow: number;
  monthlyHigh: number;
  note: string;
}

export const CORE_ROLES: Role[] = [
  { title: "Founder / CEO", monthlyLow: 75000, monthlyHigh: 100000, note: "League direction, partnerships, fundraising." },
  { title: "COO / Head of Operations", monthlyLow: 75000, monthlyHigh: 125000, note: "The season actually happening — the most load-bearing hire in the model." },
  { title: "Head of Partnerships & Sponsorship", monthlyLow: 60000, monthlyHigh: 100000, note: "Carries the revenue target that closes the season-1 gap." },
  { title: "Product / Tech", monthlyLow: 50000, monthlyHigh: 100000, note: "Platform, voting integrity and the internal dashboards." },
  { title: "Finance / Admin", monthlyLow: 35000, monthlyHigh: 60000, note: "Settlements, compliance and payouts across five states." },
  { title: "Creative / Content", monthlyLow: 40000, monthlyHigh: 75000, note: "League brand and the central content standard." },
];

export const REGIONAL_OPS = {
  leadsPerZone: 1,
  zones: STATE_ZONES,
  monthlyLow: 30000,
  monthlyHigh: 60000,
  /** On contract during the active season rather than permanent payroll. */
  activeMonths: 6,
  covers: [
    "Houses",
    "Venues",
    "Events",
    "Ticketing",
    "College network",
    "Local vendors",
    "Schedules",
    "Compliance",
  ],
};

export const CORE_TEAM_MONTHLY = {
  low: CORE_ROLES.reduce((s, r) => s + r.monthlyLow, 0),
  high: CORE_ROLES.reduce((s, r) => s + r.monthlyHigh, 0),
};

export function coreTeamOver(months: number) {
  return { low: CORE_TEAM_MONTHLY.low * months, high: CORE_TEAM_MONTHLY.high * months };
}

export const REGIONAL_OPS_SEASON = {
  low: REGIONAL_OPS.monthlyLow * REGIONAL_OPS.zones * REGIONAL_OPS.activeMonths,
  high: REGIONAL_OPS.monthlyHigh * REGIONAL_OPS.zones * REGIONAL_OPS.activeMonths,
};

/**
 * How many months of the six named roles the bucket-1 range actually buys.
 * Surfaced rather than smoothed over: the artist cycle runs twelve months, so
 * a team funded for four is a real planning gap, not a rounding difference.
 */
export const CORE_TEAM_MONTHS_FUNDED = {
  atLow: COST_BUCKETS[0].low / CORE_TEAM_MONTHLY.low,
  atHigh: COST_BUCKETS[0].high / CORE_TEAM_MONTHLY.high,
};

/* ------------------------------------------------------------------ *
 * Who pays for what
 * ------------------------------------------------------------------ */

export type CostOwner =
  | "League operator"
  | "Production house"
  | "Venue / event budget"
  | "Community partner"
  | "Ticketing partner";

export interface OwnershipRow {
  owner: CostOwner;
  items: string[];
  principle: string;
}

export const COST_OWNERSHIP: OwnershipRow[] = [
  {
    owner: "League operator",
    items: [
      "Core team & regional coordination",
      "Technology and platform",
      "League marketing & brand",
      "Legal, IP and compliance",
      "League media — highlights, standings, documentary",
      "Competition standards, scheduling and audit",
      "Prize pool",
    ],
    principle:
      "Runs the competition. Sets the standard, schedules it, audits it, and owns the league brand.",
  },
  {
    owner: "Production house",
    items: [
      "Artist acquisition",
      "Music production",
      "Music videos",
      "Artist marketing",
      "Band travel, freight and accommodation",
      "Mentor extras beyond the league association",
    ],
    principle: "Develops artists. Its roster, its investment, its logistics.",
  },
  {
    owner: "Venue / event budget",
    items: [
      "Venue infrastructure",
      "Sound, lighting, stage and backline",
      "Security and crew",
      "Permits, medical standby and site clear-up",
    ],
    principle:
      "Executes the night to the league's published specification. Contracted locally, never owned.",
  },
  {
    owner: "Community partner",
    items: ["Campus network and chapters", "Student ambassadors", "On-campus activation"],
    principle: "The network already exists. The league contributes to it rather than rebuilding it.",
  },
  {
    owner: "Ticketing partner",
    items: ["Ticketing infrastructure", "Payment rails and settlement"],
    principle: "Integrated, not rebuilt. The league takes a commission share, not a platform build.",
  },
];

export interface NoDoublePayRule {
  alreadyPaidBy: string;
  item: string;
  soOperatorDoesNot: string;
}

/** The single biggest cost-saving principle: do not pay twice. */
export const NO_DOUBLE_PAY: NoDoublePayRule[] = [
  {
    alreadyPaidBy: "Production house",
    item: "Artist marketing",
    soOperatorDoesNot: "market individual artists — only the league",
  },
  {
    alreadyPaidBy: "Production house",
    item: "Music videos",
    soOperatorDoesNot: "fund artist music videos, only league content",
  },
  {
    alreadyPaidBy: "Venue",
    item: "Basic sound and infrastructure",
    soOperatorDoesNot: "hire a second PA unless the specification requires it",
  },
  {
    alreadyPaidBy: "Community partner",
    item: "Campus network",
    soOperatorDoesNot: "build a parallel campus organisation",
  },
  {
    alreadyPaidBy: "Ticketing partner",
    item: "Ticket and payment infrastructure",
    soOperatorDoesNot: "build its own payment stack",
  },
];

/**
 * What the operating base deliberately excludes, and who carries it instead.
 * Stated because any per-night figure invites being read as a staging cost.
 */
export const COST_EXCLUSIONS: { item: string; borneBy: string; where: string }[] = [
  {
    item: "Venue hire, sound, lighting, stage and backline",
    borneBy: "The venue and the event budget",
    where: "Costed per night in the event model, never in the central base.",
  },
  {
    item: "Band travel, freight, accommodation and per diems",
    borneBy: "The production house that signed the band",
    where: "Its roster, its logistics — the league does not move other people's bands.",
  },
  {
    item: "Permits, security, medical standby and site clear-up",
    borneBy: "The event budget for that night",
    where: "Scales with room size, so it belongs on the fixture rather than head office.",
  },
  {
    item: "Artist music, videos and artist-level marketing",
    borneBy: "The production house",
    where: "The creative allocation and marketing cap in the house regulations.",
  },
];

/* ------------------------------------------------------------------ *
 * The waterfall
 * ------------------------------------------------------------------ */

/** Domestic corporate rate under the concessional regime, inclusive of cess. */
export const TAX_RATE_PCT = 25;

export interface WaterfallStep {
  id: string;
  label: string;
  amount: number;
  kind: "revenue" | "cost" | "subtotal" | "result";
  note: string;
}

export function leagueWaterfall(args: {
  operatorRevenue: number;
  directEventCostToOperator: number;
  centralOperating: number;
  prizePool: number;
  taxRatePct?: number;
}): { steps: WaterfallStep[]; ebitda: number; pbt: number; netProfit: number; tax: number } {
  const {
    operatorRevenue,
    directEventCostToOperator,
    centralOperating,
    prizePool,
    taxRatePct = TAX_RATE_PCT,
  } = args;

  const regionalContribution = operatorRevenue - directEventCostToOperator;
  const ebitda = regionalContribution - centralOperating;
  const pbt = ebitda - prizePool;
  const tax = pbt > 0 ? Math.round((pbt * taxRatePct) / 100) : 0;
  const netProfit = pbt - tax;

  const steps: WaterfallStep[] = [
    {
      id: "revenue",
      label: "Operator revenue",
      amount: operatorRevenue,
      kind: "revenue",
      note: "Gate share, sponsorship, broadcast and membership across the scope.",
    },
    {
      id: "direct",
      label: "Direct event cost to operator",
      amount: -directEventCostToOperator,
      kind: "cost",
      note:
        directEventCostToOperator === 0
          ? "Zero by design — venue, production and band logistics are carried by the venue, the event budget and the production houses."
          : "The share of night-level cost the operator carries rather than the event budget.",
    },
    {
      id: "regional",
      label: "Regional contribution",
      amount: regionalContribution,
      kind: "subtotal",
      note: "What the events throw off before head office.",
    },
    {
      id: "central",
      label: "League central cost",
      amount: -centralOperating,
      kind: "cost",
      note: "The nine operating buckets. Prize pool is taken separately, next.",
    },
    {
      id: "ebitda",
      label: "League EBITDA",
      amount: ebitda,
      kind: "subtotal",
      note: "Operating result before the competition's own prize commitment.",
    },
    {
      id: "prize",
      label: "Prize pool",
      amount: -prizePool,
      kind: "cost",
      note: "The announced floor. Shown apart from operating cost on purpose.",
    },
    {
      id: "pbt",
      label: "Profit before tax",
      amount: pbt,
      kind: "subtotal",
      note: "What the season made after everything it committed to.",
    },
    {
      id: "tax",
      label: `Tax at ${taxRatePct}%`,
      amount: -tax,
      kind: "cost",
      note: pbt > 0 ? "Domestic corporate rate." : "No tax on a loss.",
    },
    {
      id: "net",
      label: "Net profit",
      amount: netProfit,
      kind: "result",
      note: "The number the allocation policy divides.",
    },
  ];

  return { steps, ebitda, pbt, netProfit, tax };
}

/* ------------------------------------------------------------------ *
 * Where the profit goes
 * ------------------------------------------------------------------ */

/** Prize money above the announced floor is a share of profit, not a fixed pool. */
export const PRIZE_SHARE_OF_PROFIT = 25;

export interface ProfitSlice {
  id: string;
  label: string;
  pct: number;
  purpose: string;
  fixed: boolean;
}

export const PROFIT_ALLOCATION: ProfitSlice[] = [
  {
    id: "prize",
    label: "Prize money (above floor)",
    pct: PRIZE_SHARE_OF_PROFIT,
    purpose:
      "Bands are paid the greater of the announced floor or this share of profit, split 70/30 with the house that backed them. The floor is already taken in the waterfall above, so this is the upside on top of it.",
    fixed: true,
  },
  {
    id: "reinvest",
    label: "Reinvestment",
    pct: 55,
    purpose:
      "Next season's expansion — more campuses, more zones, platform and content. The largest slice for as long as the league is still growing into its market.",
    fixed: false,
  },
  {
    id: "reserve",
    label: "Reserve",
    pct: 20,
    purpose:
      "Buffer against a season that underperforms, held across seasons. Distinct from the in-season contingency in bucket 10, which absorbs a bad month inside a good season.",
    fixed: false,
  },
  {
    id: "distribute",
    label: "Investor distribution",
    pct: 0,
    purpose:
      "Returned to shareholders. Zero in season 1 on purpose — a league that pays a dividend before it holds a reserve is one bad season from not existing.",
    fixed: false,
  },
];

export interface RoadmapYear {
  season: number;
  year: number;
  label: string;
  zones: number;
  bands: number;
  prize: number;
  reinvest: number;
  reserve: number;
  distribute: number;
  milestone: string;
}

export const PROFIT_ROADMAP: RoadmapYear[] = [
  {
    season: 1, year: 2027, label: "Prove the format", zones: 5, bands: 100,
    prize: 25, reinvest: 55, reserve: 20, distribute: 0,
    milestone: "Five leagues run to completion, 1,050 nights staged, and a table nobody disputes. No distribution: everything goes back in or into the buffer.",
  },
  {
    season: 2, year: 2028, label: "Deepen, don't widen", zones: 5, bands: 120,
    prize: 25, reinvest: 50, reserve: 15, distribute: 10,
    milestone: "Same five zones, more bands per house. The first distribution is small and symbolic — it proves the instrument pays without starving the build.",
  },
  {
    season: 3, year: 2029, label: "Add zones", zones: 7, bands: 168,
    prize: 25, reinvest: 40, reserve: 10, distribute: 25,
    milestone: "Two new regional leagues on a proven playbook. Reserve steps down because there is now a season of real data behind the forecast.",
  },
  {
    season: 4, year: 2030, label: "Monetise the catalogue", zones: 8, bands: 192,
    prize: 25, reinvest: 30, reserve: 10, distribute: 35,
    milestone: "Four seasons of originals is a catalogue with income independent of whether a season is running. Growth spend falls because the asset base carries more of the load.",
  },
  {
    season: 5, year: 2031, label: "Steady state", zones: 8, bands: 192,
    prize: 25, reinvest: 25, reserve: 10, distribute: 40,
    milestone: "The mature shape: a quarter to the bands, a quarter back into the league, and the balance to the people who funded it existing.",
  },
];

export interface ProfitSplitResult {
  profit: number;
  slices: { id: string; label: string; pct: number; amount: number }[];
  prize: number;
  prizeToBands: number;
  prizeToHouses: number;
}

export function allocateProfit(
  profit: number,
  year: RoadmapYear = PROFIT_ROADMAP[0],
  bandSplitPct = 70,
): ProfitSplitResult {
  const pos = Math.max(0, profit);
  const map: Record<string, number> = {
    prize: year.prize,
    reinvest: year.reinvest,
    reserve: year.reserve,
    distribute: year.distribute,
  };
  const slices = PROFIT_ALLOCATION.map((s) => ({
    id: s.id,
    label: s.label,
    pct: map[s.id] ?? s.pct,
    amount: Math.round((pos * (map[s.id] ?? s.pct)) / 100),
  }));
  const prize = slices.find((s) => s.id === "prize")?.amount ?? 0;
  const prizeToBands = Math.round((prize * bandSplitPct) / 100);
  return { profit, slices, prize, prizeToBands, prizeToHouses: prize - prizeToBands };
}

export const ROADMAP_RECONCILES = PROFIT_ROADMAP.every(
  (y) => y.prize + y.reinvest + y.reserve + y.distribute === 100,
);

export const SEASON_1_SCALE: CostScale = {
  zones: STATE_ZONES,
  nights: 1050,
  campuses: 300,
  bands: NATIONAL_TOTAL_BANDS,
  houses: NATIONAL_TOTAL_HOUSES,
};

/* ------------------------------------------------------------------ *
 * What still has to be decided
 * ------------------------------------------------------------------ */

export interface OpenDecision {
  id: string;
  question: string;
  why: string;
  recommendation: string;
  owner: "Board" | "Operator" | "Commercial" | "Competition";
  impact: "high" | "medium";
}

export const OPEN_DECISIONS: OpenDecision[] = [
  {
    id: "team-months",
    question: "Is the core team paid for the season or for the year?",
    why: "The bucket-1 range buys roughly three to four months of the six named roles at their stated salaries. But the artist cycle runs all twelve months — releases, development and the December auction all sit outside the season — so a team funded only for the season is not a core team.",
    recommendation:
      "Fund the founder, COO and finance/admin for twelve months and the rest from pre-season through finals. That lands above the bucket-1 range, and the range should move rather than the staffing. This is the line where underfunding shows up as a season that does not happen.",
    owner: "Board",
    impact: "high",
  },
  {
    id: "season1-funding",
    question: "Season 1 does not cover its cash requirement. Who funds the gap?",
    why: "Operating cost plus the prize floor is the real ask, and gate share alone does not reach it in a first season. Normal for live events, but it has to be funded on purpose rather than discovered in March.",
    recommendation:
      "Fund it as seed capital against the equity options already modelled, not from production houses. Houses are buying a season, not underwriting the operator — asking them to cover the gap turns a franchise sale into a fundraise and prices out the operators worth having.",
    owner: "Board",
    impact: "high",
  },
  {
    id: "sponsorship-gap",
    question: "How much sponsorship has to be sold before the season is committed?",
    why: "The gap between operator revenue and the cash requirement is the real commercial target, and it should be a number someone is held to rather than an aspiration.",
    recommendation:
      "Set the target at the full gap plus 20% for slippage, and treat it as a gate on committing the fixture calendar. If it is not sold by the December auction, run four zones rather than five.",
    owner: "Commercial",
    impact: "high",
  },
  {
    id: "prize-floor",
    question: "Is the prize pool a floor, a share of profit, or both?",
    why: "A fixed pool is a liability in the season the league can least afford one; a pure profit share pays nothing in a year with no profit, which does not sign bands.",
    recommendation:
      "Both, as 'the greater of'. Announce the floor from the prize bucket, funded from raised capital in seasons 1 and 2, and pay the profit share instead once it exceeds the floor. Costs nothing extra when profitable and is honest about the source before then.",
    owner: "Board",
    impact: "high",
  },
  {
    id: "celebrity-structure",
    question: "How are mentor and celebrity associations contracted?",
    why: "Per-appearance fees across a hundred bands is the line that can quietly double the budget, and it buys the least per rupee.",
    recommendation:
      "Annual association per mentor with a defined content and appearance schedule, negotiated centrally in bulk. Most of the value is digital — intro video, song and rehearsal feedback, social collaboration — with physical attendance reserved for signature nights.",
    owner: "Commercial",
    impact: "medium",
  },
  {
    id: "regional-permanence",
    question: "Are regional operations leads contract or permanent?",
    why: "Five permanent regional hires is the fastest way to turn a seasonal business into a year-round burn rate, but contract leads walk away with the local relationships at the end of every season.",
    recommendation:
      "Contract for season 1, with a retainer through the artist season for the two strongest zones. Convert to permanent only where a zone's own contribution covers the role.",
    owner: "Operator",
    impact: "medium",
  },
  {
    id: "flat-bid",
    question: "Should the winning bid flex by zone?",
    why: "The bid is flat across five leagues while the markets are not. A house in the strongest zone recovers substantially more of its capital from the gate than one in the weakest, for identical money.",
    recommendation:
      "Keep it flat for season 1 and publish the disparity rather than hide it. Flexing in year one prices a market nobody has data on; after one season the gate figures are real and brackets can be set on evidence.",
    owner: "Commercial",
    impact: "medium",
  },
  {
    id: "cafe-format",
    question: "The Café Set cannot break even at any occupancy. Keep it?",
    why: "Smallest room, cheapest ticket, so the night loses money even sold out. That is either a deliberate choice or a mistake, and the model cannot tell which.",
    recommendation:
      "Keep it, and call it paid content acquisition. A full small room films better than a half-empty large one, it is the band's first night of the season, and the loss is smaller than manufacturing the same footage. Revisit if the ladder ever needs to shed cost.",
    owner: "Competition",
    impact: "medium",
  },
];
