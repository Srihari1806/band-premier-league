/**
 * What it costs to run the league, and what happens to the profit.
 *
 * The old cost base was five flat lines totalling ₹7.7L for a whole season.
 * That is roughly one mid-sized event, not a national league staging 1,050
 * nights across five regions with 25 houses, 100 bands and 300 campuses. It
 * made the operator look structurally profitable by leaving out the org that
 * would have to exist for any of it to happen.
 *
 * This module replaces it with a cost base that SCALES with the structure —
 * per zone, per night, per campus, per band — so it cannot drift when the
 * league changes shape. Every rate carries a note saying what it is buying,
 * because these are planning assumptions meant to be replaced by real quotes.
 *
 * Rates are Indian market planning figures for 2027, not contracted numbers.
 */

import { NATIONAL_TOTAL_BANDS, NATIONAL_TOTAL_HOUSES, ZONES } from "./league-format";

const STATE_ZONES = ZONES.filter((z) => z.tier === "state").length;

export type CostBasis = "fixed" | "per zone" | "per night" | "per campus" | "per band";

export interface OperatingCostLine {
  id: string;
  category: string;
  label: string;
  /** The rate, in the unit named by `basis`. */
  rate: number;
  basis: CostBasis;
  note: string;
}

/**
 * The org chart, in money. A league that cannot staff itself does not run,
 * and every line here is something somebody has to be paid to do.
 */
export const OPERATING_COSTS: OperatingCostLine[] = [
  /* ---- People ---- */
  {
    id: "central-team",
    category: "People",
    label: "Central team",
    rate: 12000000,
    basis: "fixed",
    note: "Eight full-time roles: league head, competition and operations, commercial, marketing, content, finance, legal and compliance, and engineering. Indian salaries for people who have run something at this scale before.",
  },
  {
    id: "zone-staff",
    category: "People",
    label: "Zone lead + 2 coordinators",
    rate: 1700000,
    basis: "per zone",
    note: "Each regional league needs someone accountable for it full time, plus two coordinators who actually book rooms and chase settlements.",
  },
  {
    id: "campus-chapter",
    category: "People",
    label: "Campus chapter activation",
    rate: 10000,
    basis: "per campus",
    note: "Student ambassadors, a season stipend and activation budget per campus. Cheap per unit and the single highest-leverage line in the whole model.",
  },
  {
    id: "artist-services",
    category: "People",
    label: "Artist onboarding & services",
    rate: 6000,
    basis: "per band",
    note: "Contracting, payouts, splits administration and the support desk a band actually calls.",
  },

  /* ---- Technology ---- */
  {
    id: "platform",
    category: "Technology",
    label: "App & web platform",
    rate: 4500000,
    basis: "fixed",
    note: "Build amortised over the first seasons plus ongoing maintenance. The voting app is the product — it cannot be a side project.",
  },
  {
    id: "vote-integrity",
    category: "Technology",
    label: "Vote integrity & anti-fraud",
    rate: 1500000,
    basis: "fixed",
    note: "Device fingerprinting, ticket-verification binding and anomaly review. The scoring system is worthless the day it can be gamed.",
  },
  {
    id: "data-hosting",
    category: "Technology",
    label: "Data, hosting & analytics",
    rate: 900000,
    basis: "fixed",
    note: "Infrastructure, the standings pipeline and the reach data the Original IP metric is scored on.",
  },

  /* ---- Content ---- */
  {
    id: "content-central",
    category: "Content",
    label: "Central content & post",
    rate: 4200000,
    basis: "fixed",
    note: "Edit team and suite turning 1,050 nights of capture into a season. Per-night shooting is costed on the event, not here.",
  },
  {
    id: "distribution",
    category: "Content",
    label: "Streaming & distribution",
    rate: 1500000,
    basis: "fixed",
    note: "Delivery, encoding and platform fees for getting the season out. Not the same thing as broadcast rights income.",
  },

  /* ---- Marketing ---- */
  {
    id: "brand-national",
    category: "Marketing",
    label: "National brand campaign",
    rate: 6000000,
    basis: "fixed",
    note: "The campaign that makes the league a thing people have heard of. Season 1 is the most expensive it will ever be.",
  },
  {
    id: "zone-marketing",
    category: "Marketing",
    label: "Zone always-on digital",
    rate: 800000,
    basis: "per zone",
    note: "Regional social, local press and paid amplification in the languages each zone actually plays in.",
  },

  /* ---- Competition operations ---- */
  {
    id: "matchday-audit",
    category: "Competition Ops",
    label: "Match-day officiating & audit",
    rate: 2500,
    basis: "per night",
    note: "A league representative at every fixture verifying scanned attendance and settling the gate. This is what makes the gate metric a fact rather than a claim.",
  },
  {
    id: "ops-travel",
    category: "Competition Ops",
    label: "League travel to fixtures",
    rate: 1200,
    basis: "per night",
    note: "Getting that representative there. Per-night average across a season where most nights are in a hub city and some are not.",
  },
  {
    id: "zone-ops",
    category: "Competition Ops",
    label: "Zone office, travel & admin",
    rate: 400000,
    basis: "per zone",
    note: "A regional base, intercity travel for the zone team, and the paperwork five separate state jurisdictions generate.",
  },

  /* ---- Corporate ---- */
  {
    id: "legal-finance",
    category: "Corporate",
    label: "Legal, audit & compliance",
    rate: 2800000,
    basis: "fixed",
    note: "Band and house contracts, rights paperwork, statutory audit, GST across five states, and the IP registrations the catalogue depends on.",
  },
  {
    id: "insurance-annual",
    category: "Corporate",
    label: "Insurance (annual policies)",
    rate: 1200000,
    basis: "fixed",
    note: "Public liability and equipment cover written annually. The per-night share of this is what the event model carries.",
  },
  {
    id: "office-admin",
    category: "Corporate",
    label: "Office & administration",
    rate: 1800000,
    basis: "fixed",
    note: "Central office, software, accounting and the ordinary cost of a company existing.",
  },
];

export interface CostScale {
  zones: number;
  nights: number;
  campuses: number;
  bands: number;
  houses: number;
}

/** Multiplier for one cost line under a given league shape. */
export function unitsFor(basis: CostBasis, scale: CostScale): number {
  switch (basis) {
    case "per zone":
      return scale.zones;
    case "per night":
      return scale.nights;
    case "per campus":
      return scale.campuses;
    case "per band":
      return scale.bands;
    default:
      return 1;
  }
}

export interface CostedLine extends OperatingCostLine {
  units: number;
  amount: number;
}

export function costOperations(scale: CostScale): {
  lines: CostedLine[];
  byCategory: { category: string; amount: number; share: number }[];
  total: number;
  fixed: number;
  variable: number;
  perNight: number;
} {
  const lines: CostedLine[] = OPERATING_COSTS.map((l) => {
    const units = unitsFor(l.basis, scale);
    return { ...l, units, amount: l.rate * units };
  });
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const fixed = lines.filter((l) => l.basis === "fixed").reduce((s, l) => s + l.amount, 0);

  const cats = [...new Set(lines.map((l) => l.category))];
  const byCategory = cats
    .map((category) => {
      const amount = lines
        .filter((l) => l.category === category)
        .reduce((s, l) => s + l.amount, 0);
      return { category, amount, share: total === 0 ? 0 : (amount / total) * 100 };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    lines,
    byCategory,
    total,
    fixed,
    variable: total - fixed,
    perNight: scale.nights === 0 ? 0 : total / scale.nights,
  };
}

/* ------------------------------------------------------------------ *
 * What happens to the profit
 * ------------------------------------------------------------------ */

/**
 * Prize money is a share of profit, not a fixed pool.
 *
 * A fixed prize pool is a liability the league owes whether or not it earned
 * anything, and in a first season that is exactly when it can least afford it.
 * Taking it off profit instead means the prize grows with the league, and the
 * bands are paid out of something they demonstrably helped create.
 */
export const PRIZE_SHARE_OF_PROFIT = 25;

export interface ProfitSlice {
  id: string;
  label: string;
  pct: number;
  purpose: string;
  /** Locked by rule rather than open to a planning decision. */
  fixed: boolean;
}

/**
 * Season 1 allocation. Prize is fixed by rule at 25%; the rest is a
 * recommendation, and `PROFIT_ROADMAP` shows how it should move as the league
 * matures. Nothing is distributed to shareholders in season 1 on purpose — a
 * league that pays a dividend before it has a reserve is one bad season from
 * not existing.
 */
export const PROFIT_ALLOCATION: ProfitSlice[] = [
  {
    id: "prize",
    label: "Prize money",
    pct: PRIZE_SHARE_OF_PROFIT,
    purpose:
      "Paid to the winning bands and the houses that backed them, split 70/30. Funded from what the league actually made, so it can never sink the season that generated it.",
    fixed: true,
  },
  {
    id: "reinvest",
    label: "Reinvestment",
    pct: 55,
    purpose:
      "Next season's expansion — more campuses, more zones, platform, and the content spend that compounds. The largest slice for as long as the league is still growing into its market.",
    fixed: false,
  },
  {
    id: "reserve",
    label: "Reserve & contingency",
    pct: 20,
    purpose:
      "A buffer sized to survive a season that underperforms. Live events fail on weather, permissions and one cancelled headliner, and none of those are hypothetical.",
    fixed: false,
  },
  {
    id: "distribute",
    label: "Investor distribution",
    pct: 0,
    purpose:
      "Returned to shareholders. Deliberately zero in season 1 — see the roadmap for when this should start.",
    fixed: false,
  },
];

export interface RoadmapYear {
  season: number;
  year: number;
  label: string;
  zones: number;
  bands: number;
  /** Allocation of that season's profit, in the same order as PROFIT_ALLOCATION. */
  prize: number;
  reinvest: number;
  reserve: number;
  distribute: number;
  milestone: string;
}

/**
 * Five seasons of capital policy.
 *
 * The prize share never moves — that is the rule. What moves is the balance
 * between building the thing and taking money out of it, and the sequencing
 * matters: reserve first, then growth, then returns. A league that inverts
 * that order is optimising for the year it is in rather than the one after.
 */
export const PROFIT_ROADMAP: RoadmapYear[] = [
  {
    season: 1,
    year: 2027,
    label: "Prove the format",
    zones: 5,
    bands: 100,
    prize: 25,
    reinvest: 55,
    reserve: 20,
    distribute: 0,
    milestone:
      "Five leagues run to completion, 1,050 nights staged, and a table nobody disputes. No distribution: everything goes back in or into the buffer.",
  },
  {
    season: 2,
    year: 2028,
    label: "Deepen, don't widen",
    zones: 5,
    bands: 120,
    prize: 25,
    reinvest: 50,
    reserve: 15,
    distribute: 10,
    milestone:
      "Same five zones, more bands per house. The first distribution is small and symbolic — it proves the instrument pays, without starving the build.",
  },
  {
    season: 3,
    year: 2029,
    label: "Add zones",
    zones: 7,
    bands: 168,
    prize: 25,
    reinvest: 40,
    reserve: 10,
    distribute: 25,
    milestone:
      "Two new regional leagues on a proven playbook. Reserve steps down because there is now a season of real data behind the forecast.",
  },
  {
    season: 4,
    year: 2030,
    label: "Monetise the catalogue",
    zones: 8,
    bands: 192,
    prize: 25,
    reinvest: 30,
    reserve: 10,
    distribute: 35,
    milestone:
      "Four seasons of originals is a catalogue with its own income, independent of whether a season is running. Growth spend falls because the asset base carries more of the load.",
  },
  {
    season: 5,
    year: 2031,
    label: "Steady state",
    zones: 8,
    bands: 192,
    prize: 25,
    reinvest: 25,
    reserve: 10,
    distribute: 40,
    milestone:
      "The mature shape: a quarter to the bands, a quarter back into the league, and the balance to the people who funded it existing.",
  },
];

export interface ProfitSplitResult {
  profit: number;
  slices: { id: string; label: string; pct: number; amount: number }[];
  prize: number;
  /** Prize money onward to the band and to the house that backed it. */
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
  return {
    profit,
    slices,
    prize,
    prizeToBands,
    prizeToHouses: prize - prizeToBands,
  };
}

/** Every roadmap year's slices must still sum to 100. */
export const ROADMAP_RECONCILES = PROFIT_ROADMAP.every(
  (y) => y.prize + y.reinvest + y.reserve + y.distribute === 100,
);

/** The league shape season 1 actually runs at, for the default costing. */
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
  /** Why this is not something the model can settle on its own. */
  why: string;
  /** The answer to go with unless someone argues otherwise. */
  recommendation: string;
  owner: "Board" | "Operator" | "Commercial" | "Competition";
  impact: "high" | "medium";
}

/**
 * These are the live decisions behind this tab. Each one has a recommendation
 * rather than just a question — an open question with no proposed answer is a
 * way of not deciding.
 */
export const OPEN_DECISIONS: OpenDecision[] = [
  {
    id: "season1-funding",
    question: "Season 1 runs at a loss on a realistic cost base. Who funds it?",
    why: "Gate share and current sponsorship assumptions do not cover a cost base with a real central team, platform and five staffed zones. This is normal for a first season of a live-events business, but it has to be funded on purpose rather than discovered in March.",
    recommendation:
      "Fund it as seed capital against the equity options already modelled, not from production houses. Houses are buying a season, not underwriting the operator — asking them to cover the gap converts a franchise sale into a fundraise and prices out exactly the operators worth having.",
    owner: "Board",
    impact: "high",
  },
  {
    id: "prize-floor",
    question: "Prize money is 25% of profit. What is paid in a season with no profit?",
    why: "The 25%-of-profit rule is the right long-term instrument, but applied literally in season 1 it pays nothing — and a league that announces a championship with no prize does not sign the bands it needs.",
    recommendation:
      "Announce a guaranteed floor for seasons 1 and 2, funded from raised capital and disclosed as such. The rule becomes 'the greater of the floor or 25% of profit', which costs nothing once the league is profitable and is honest about where the money comes from before then.",
    owner: "Board",
    impact: "high",
  },
  {
    id: "residual-split",
    question: "After the 25% prize, how is the rest of profit divided?",
    why: "Only the prize share is fixed by rule. Reinvestment, reserve and distribution are a capital-allocation policy, and reasonable people will disagree about the balance.",
    recommendation:
      "Season 1 at 55% reinvestment, 20% reserve, 0% distribution, moving to 25/10/40 by season 5. Reserve before growth, growth before returns — a league that pays a dividend before it holds a buffer is one bad monsoon from not existing.",
    owner: "Board",
    impact: "high",
  },
  {
    id: "sponsorship-gap",
    question: "How much sponsorship has to be sold before the season is viable?",
    why: "The gap between operator revenue and the cost base is the real sponsorship target, and it should be a number the commercial team is held to rather than an aspiration.",
    recommendation:
      "Set the season-1 sponsorship target at the full operating gap plus a 20% margin for slippage, and treat it as a gate on committing to the fixture calendar. If it is not sold by the December auction, run four zones rather than five.",
    owner: "Commercial",
    impact: "high",
  },
  {
    id: "flat-bid",
    question: "Should the winning bid flex by zone?",
    why: "The bid is flat across all five leagues while the markets are not. A house in the strongest zone recovers substantially more of its capital from the gate than one in the weakest, for identical money.",
    recommendation:
      "Keep it flat for season 1 and publish the disparity rather than hide it. Flexing the bid in year one prices a market nobody has data on yet; after one season the gate figures are real and the brackets can be set on evidence.",
    owner: "Commercial",
    impact: "medium",
  },
  {
    id: "cafe-format",
    question: "The Café Set cannot break even at any occupancy. Keep it?",
    why: "It is the smallest room on the ladder and the cheapest ticket, so the night loses money even sold out. That is a deliberate choice or a mistake, and the model cannot tell which.",
    recommendation:
      "Keep it, and call it what it is: paid content acquisition. A full small room films better than a half-empty large one, it is the band's first night of the season, and the loss per night is smaller than the marketing cost of manufacturing the same footage. Revisit if the ladder ever needs to shed cost.",
    owner: "Competition",
    impact: "medium",
  },
  {
    id: "signing-revenue",
    question: "Does the league's 30% share of signing fees count as league revenue?",
    why: "It changes the profit the 25% prize is calculated on, so it cannot be left ambiguous.",
    recommendation:
      "Yes — count it as revenue in the season it is received. It is money the league earned for running the auction, and excluding it would understate profit in exactly the years the prize matters most.",
    owner: "Operator",
    impact: "medium",
  },
  {
    id: "reserve-target",
    question: "How large should the reserve get before distributions rise?",
    why: "The roadmap steps distribution up on a schedule, but a schedule is not a test — a bad season 2 should delay it.",
    recommendation:
      "Hold distributions flat until the reserve covers one full season's fixed cost base. That is the number that lets the league run a season it has not sold, which is the only insurance that matters.",
    owner: "Board",
    impact: "medium",
  },
];
