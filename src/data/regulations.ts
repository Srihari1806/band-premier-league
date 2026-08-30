/**
 * The league rulebook — the financial regulations a production house signs up
 * to, and the two commercial modules that sit either side of them.
 *
 * The single most important idea in this file is that the league has TWO
 * separate money systems that must never be blended:
 *
 *   Module A — Live League.  Ticketed nights. Net gate splits 40/30/30 between
 *              band, production house and operator. This is the ONLY place the
 *              operator takes a share of performance income.
 *
 *   Module B — Independent Music.  Original songs and the catalogue they build.
 *              Splits 50/50 between the band and the production house that
 *              financed it. The operator takes NOTHING here, beyond a limited
 *              licence to use the music to promote the league.
 *
 * Everyone else on a record — composer, lyricist, session players, director,
 * editor — is a hired professional paid a fee from the band's creative
 * allocation. They are not inside the band's 50%. Where a larger name instead
 * negotiates backend participation, that is a disclosable arrangement between
 * the house and the creator, and it is recorded rather than assumed.
 *
 * All figures here are Season 1 planning regulations. They are meant to be
 * argued with and revised, which is why every one of them is a named constant
 * rather than a number buried in a component.
 */

import { inr } from "./economics";

/* ------------------------------------------------------------------ *
 * The two modules
 * ------------------------------------------------------------------ */

export interface RevenueModule {
  id: "live" | "music";
  name: string;
  scope: string;
  splits: { party: string; pct: number; accent: string }[];
  operatorTakes: boolean;
  operatorNote: string;
  monetises: string[];
}

export const REVENUE_MODULES: RevenueModule[] = [
  {
    id: "live",
    name: "Module A — Live League",
    scope:
      "Every ticketed night on the fixture calendar. The competition itself, and the only module where the league operator participates in performance income.",
    splits: [
      { party: "Band", pct: 40, accent: "bg-amber-400" },
      { party: "Production House", pct: 30, accent: "bg-blue-400" },
      { party: "League Operator", pct: 30, accent: "bg-primary" },
    ],
    operatorTakes: true,
    operatorNote:
      "The operator's 30% is not margin — it funds venues, crew, ticketing, the voting platform, marketing and the prize pool.",
    monetises: [
      "Ticket sales (net gate)",
      "Event sponsorship & stalls",
      "Venue and concourse commercial",
      "League media and broadcast rights",
      "Central league partnerships",
    ],
  },
  {
    id: "music",
    name: "Module B — Independent Music",
    scope:
      "Original songs, masters and music videos. This is the artist's career, not the competition — the league runs the stage, it does not own the songs played on it.",
    splits: [
      { party: "Band", pct: 50, accent: "bg-amber-400" },
      { party: "Production House", pct: 50, accent: "bg-blue-400" },
    ],
    operatorTakes: false,
    operatorNote:
      "The operator takes zero from song revenue. It holds only a limited licence to use the music to promote the league.",
    monetises: [
      "Streaming platforms",
      "YouTube monetisation",
      "Label and distribution deals",
      "Sync and brand placements",
      "The long-term catalogue",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * The acquisition auction
 * ------------------------------------------------------------------ */

export const AUCTION = {
  /** Total a house may commit across its whole roster. */
  purse: 1000000,
  bandsRequired: 4,
  minBid: 100000,
  /** Forces a portfolio: nobody sinks the purse into one act. */
  maxBid: 400000,
} as const;

/**
 * A higher acquisition valuation obliges a higher floor under the artist.
 * Everything else about the band's league opportunity stays identical — this
 * bracket is the ONLY thing an acquisition price is allowed to change.
 */
export interface GuaranteeBracket {
  label: string;
  min: number;
  max: number;
  guarantee: number;
}

export const GUARANTEE_BRACKETS: GuaranteeBracket[] = [
  { label: "Bracket A", min: 100000, max: 199999, guarantee: 50000 },
  { label: "Bracket B", min: 200000, max: 299999, guarantee: 75000 },
  { label: "Bracket C", min: 300000, max: 400000, guarantee: 100000 },
];

export function bracketFor(bid: number): GuaranteeBracket | null {
  if (bid <= 0) return null;
  return (
    GUARANTEE_BRACKETS.find((b) => bid >= b.min && bid <= b.max) ??
    (bid > AUCTION.maxBid ? GUARANTEE_BRACKETS[GUARANTEE_BRACKETS.length - 1] : null)
  );
}

export interface BidRow {
  bid: number;
  bracket: GuaranteeBracket | null;
  valid: boolean;
  issue?: string;
}

export interface PurseResult {
  rows: BidRow[];
  spent: number;
  remaining: number;
  guarantees: number;
  bandsBid: number;
  /** Rule violations across the whole roster. */
  errors: string[];
  valid: boolean;
}

export function evaluatePurse(bids: number[]): PurseResult {
  const rows: BidRow[] = bids.map((bid) => {
    let issue: string | undefined;
    if (bid < AUCTION.minBid) issue = `Below the ${inr(AUCTION.minBid)} floor`;
    else if (bid > AUCTION.maxBid) issue = `Over the ${inr(AUCTION.maxBid)} single-band cap`;
    return { bid, bracket: bracketFor(bid), valid: !issue, issue };
  });

  const spent = bids.reduce((s, b) => s + b, 0);
  const remaining = AUCTION.purse - spent;
  const errors: string[] = [];
  if (spent > AUCTION.purse) {
    errors.push(`Roster costs ${inr(spent)} — ${inr(-remaining)} over the ${inr(AUCTION.purse)} purse.`);
  }
  if (bids.length !== AUCTION.bandsRequired) {
    errors.push(`A house must finish with exactly ${AUCTION.bandsRequired} bands.`);
  }
  rows.forEach((r, i) => {
    if (r.issue) errors.push(`Band ${i + 1}: ${r.issue.toLowerCase()}.`);
  });

  return {
    rows,
    spent,
    remaining,
    guarantees: rows.reduce((s, r) => s + (r.bracket?.guarantee ?? 0), 0),
    bandsBid: bids.length,
    errors,
    valid: errors.length === 0,
  };
}

/** A sensible opening roster, inside every rule. */
export const DEFAULT_BIDS = [300000, 250000, 250000, 200000];

/* ------------------------------------------------------------------ *
 * Spending caps
 *
 * The creative allocation is a PER-BAND entitlement, not a house pot. That is
 * deliberate: a house pot would let a franchise starve three bands to gold-plate
 * one, and the whole competitive-fairness argument would collapse.
 * ------------------------------------------------------------------ */

export interface SpendCap {
  id: string;
  label: string;
  amount: number;
  basis: "per band" | "per house" | "central";
  rule: string;
}

export const SPEND_CAPS: SpendCap[] = [
  {
    id: "creative",
    label: "Creative Allocation",
    amount: 125000,
    basis: "per band",
    rule: "Equal for every band regardless of what it cost to acquire. Spend it across music, video, session players, writers and directors however the band and house see fit. Unused budget rolls forward to that band's next release — and can never be moved to a different band.",
  },
  {
    id: "marketing",
    label: "Marketing",
    amount: 200000,
    basis: "per house",
    rule: "Cash marketing spend across the whole roster. A house posting an artist on its own channels is owned media, not cash — it is tracked separately and does not consume this cap.",
  },
  {
    id: "mentor",
    label: "Mentor Fees",
    amount: 200000,
    basis: "per house",
    rule: "Mentors are drawn from a central approved list and matched by two-sided preference. A more famous mentor never earns a band a single point.",
  },
];

/**
 * What a signing fee actually buys, and who it goes to.
 *
 * The house's bid is not a cost it books and keeps — it is money that leaves
 * the house entirely. 70% is the artist's, paid on signing; 30% funds the
 * league that stages the season. There is no separate artist guarantee on top:
 * the signing share IS the floor under the artist, so a house carries one
 * obligation for a band rather than two.
 */
export const SIGNING_SPLIT = { artist: 70, league: 30 } as const;

export function signingSplitOf(bid: number) {
  const artist = Math.round(bid * (SIGNING_SPLIT.artist / 100));
  return { artist, league: bid - artist };
}

/**
 * Operator-funded pools. Deliberately NOT published as figures on the site —
 * they are the operator's own budget, not a production house obligation, and
 * showing them next to the house caps read as though a house had to fund them.
 * The prize SPLIT is still published, because that is a rule bands need.
 */
export const CENTRAL_POOLS: SpendCap[] = [
  {
    id: "prize",
    label: "Prize Pool",
    amount: 1000000,
    basis: "central",
    rule: "Ring-fenced by the operator. Split 70% to the band, 30% to the house that backed it.",
  },
  {
    id: "league-marketing",
    label: "League Marketing",
    amount: 1000000,
    basis: "central",
    rule: "The operator markets the league; houses market their artists. Two different jobs, two different budgets.",
  },
  {
    id: "celebrity",
    label: "League Celebrity Fund",
    amount: 1000000,
    basis: "central",
    rule: "Opening night, rivalry, eliminator and final appearances. Ideally sponsor-funded, which turns a cost line into sellable inventory.",
  },
];

export const PRIZE_SPLIT = { band: 70, productionHouse: 30 } as const;

/** Per-night spending ceilings by fixture type. Ceilings, not targets. */
export const EVENT_BUDGET_TIERS: { tier: string; cap: number }[] = [
  { tier: "Café / Pub", cap: 50000 },
  { tier: "Campus", cap: 100000 },
  { tier: "Standard concert", cap: 150000 },
  { tier: "House cross / rivalry", cap: 300000 },
  { tier: "Eliminator", cap: 400000 },
  { tier: "Grand final", cap: 750000 },
];

/* ------------------------------------------------------------------ *
 * Approval traffic light
 *
 * The operator checks compliance, never taste. It does not get an opinion on
 * whether a director is any good — only on whether the arrangement is
 * disclosed, funded from the right place, and unable to buy league points.
 * ------------------------------------------------------------------ */

export interface ApprovalRule {
  level: "green" | "yellow" | "red";
  label: string;
  trigger: string;
  requirement: string;
  accent: string;
}

export const APPROVAL_RULES: ApprovalRule[] = [
  {
    level: "green",
    label: "Standard",
    trigger: "Everything sits inside the band's creative allocation, paid as ordinary fees.",
    requirement: "No approval needed. Record the spend against the band and carry on.",
    accent: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  },
  {
    level: "yellow",
    label: "Overspend",
    trigger:
      "The house wants a bigger composer, director or crew than the allocation covers, and funds the excess itself.",
    requirement:
      "Notify the operator and get sign-off. The operator does not pay the excess, and it cannot be taken out of another band's allocation.",
    accent: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  },
  {
    level: "red",
    label: "Rights or Revenue Participation",
    trigger:
      "An outside creator takes a royalty, revenue share, backend, master or composition stake instead of — or on top of — a fee.",
    requirement:
      "Mandatory written agreement and disclosure before release. This goes on the central rights ledger so the league always knows who owns what and who gets paid what.",
    accent: "border-rose-500/30 bg-rose-500/5 text-rose-300",
  },
];

/** The line that everything above is ultimately protecting. */
export const FAIRNESS_RULE =
  "Money can buy a better record. It can never buy a point. Auction price, marketing spend, mentor fame and video budget are all invisible to the scoring system — points come only from the performance, the room, verified votes and an eligible original.";

/* ------------------------------------------------------------------ *
 * Roster rules
 * ------------------------------------------------------------------ */

export const ROSTER_RULES = {
  minMembers: 2,
  maxMembers: 5,
  maxSubstitutes: 2,
  soloAllowed: false,
} as const;

export const ROSTER_NOTES: { rule: string; detail: string }[] = [
  {
    rule: `${ROSTER_RULES.minMembers}–${ROSTER_RULES.maxMembers} core members`,
    detail:
      "Instrumentation is entirely open — vocals, strings, brass, percussion, electronics, whatever the act actually is. The cap is on registered performers, not on what they play.",
  },
  {
    rule: `Up to ${ROSTER_RULES.maxSubstitutes} registered substitutes`,
    detail:
      "Cover for injury or absence, not a way to quietly field a seven-piece. Only core members carry the band's identity.",
  },
  {
    rule: "No mid-season swaps",
    detail:
      "Changes only for injury, medical reasons or permanent withdrawal, and only with league approval. A band cannot trade out a member who is scoring badly.",
  },
  {
    rule: "Internal split agreed before the season",
    detail:
      "The band files how it divides its own money. Equal fifths or 30/20/20/15/15 — the league does not mind which, only that it is agreed in writing and fixed before a rupee moves.",
  },
  {
    rule: "Hired professionals are not band members",
    detail:
      "Session players, writers, producers and crew are paid fees from the creative allocation. They sit outside the band's share unless a disclosed backend deal says otherwise.",
  },
];

/* ------------------------------------------------------------------ *
 * Roll-ups
 * ------------------------------------------------------------------ */

export interface HouseCommitment {
  acquisition: number;
  guarantees: number;
  creative: number;
  marketing: number;
  mentor: number;
  total: number;
}

/** The maximum regulated envelope for one house — a ceiling, not a bill. */
export function houseCommitment(purseSpent: number, guarantees: number): HouseCommitment {
  const creative =
    (SPEND_CAPS.find((c) => c.id === "creative")?.amount ?? 0) * AUCTION.bandsRequired;
  const marketing = SPEND_CAPS.find((c) => c.id === "marketing")?.amount ?? 0;
  const mentor = SPEND_CAPS.find((c) => c.id === "mentor")?.amount ?? 0;
  return {
    acquisition: purseSpent,
    guarantees,
    creative,
    marketing,
    mentor,
    total: purseSpent + guarantees + creative + marketing + mentor,
  };
}
