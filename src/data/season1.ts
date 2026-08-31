/**
 * Season 1, as three parties: the artists, the production house, and Svara
 * Tribe as league operator.
 *
 * This is a STATIC projection of one stated season, not a calculator. The page
 * that used to sit on /economics let a reader move a dozen sliders and watch
 * every number in the model move with them, which is a fine thing to build and
 * the wrong thing to publish — it invited an investor to discover a scenario
 * rather than read the plan. What is left is the plan: one set of inputs, at
 * the rates the operating brief actually commits to.
 *
 * NOTHING below is a hand-typed total. Every figure derives from the base rates
 * in the block marked "the stated inputs", so a total cannot drift away from
 * the lines above it — which is exactly what had happened to the version this
 * replaces, where the artists' live-event share had been copied from the
 * catalogue line and was understating a band's season by ₹3.06L.
 *
 * The scale is `season-plan.ts`'s Season 1 read straight: FIVE production
 * houses, FOUR bands each, twenty bands in the AP/TS zone. The league-level
 * deals are league-level — the ₹2Cr OTT deal divides across all five houses and
 * all twenty bands, not across one roster — and a per-house or per-band figure
 * is always that pool divided down, never a pool of its own.
 *
 * Read the basis on every figure below. Three of them are in play and mixing
 * them is the easiest error in the model to make: SEASON (the whole league),
 * PER HOUSE (one of five) and PER BAND (one of twenty). `BAND_INCOME` and the
 * production-house P&L are stated per band and per house respectively; the
 * distribution table and the operator are stated for the season.
 */

import { RELEASES_PER_BAND, SEASON_WEEKS } from "./league-format";
import { divide, SPLITS, type RevenueShare, type SplitName } from "./economics";
import {
  CONTENT_LINES,
  CONTENT_PER_BAND,
  SEASON_LINES,
  SPONSOR_CARD,
  SPONSOR_CARD_VALUE,
  scaleOf,
  type RevenueLine,
} from "./league-revenue";
import { SPEND_CAPS } from "./regulations";
import { SEASON_1 } from "./season-plan";
import { ACTS_PER_BILL } from "./show-formats";

/* ------------------------------------------------------------------ *
 * The roster
 * ------------------------------------------------------------------ */

/**
 * Season 1 as `season-plan.ts` defines it — five houses, four bands each,
 * twenty bands in one zone — with five artists inside every band.
 *
 * Read from that module rather than restated, so this page cannot drift from
 * the season every other page on the site describes.
 */
export const ROSTER = SEASON_1;

/** A band is a group, and the group splits its share evenly. */
export const ARTISTS_PER_BAND = 5;
export const ARTIST_SHARE_PCT = 100 / ARTISTS_PER_BAND;

/* ------------------------------------------------------------------ *
 * The stated inputs — every rate the season is priced at
 * ------------------------------------------------------------------ */

/** Commercial night: 250 tickets at ₹199. The base every other gate references. */
export const COMMERCIAL_GATE = { tickets: 250, price: 199 };
/** Corporate show: free to attend on a ₹99 access pass, 200 in the room. */
export const CORPORATE_GATE = { tickets: 200, price: 99 };
/** A campus night is bought by the college, not the crowd. */
export const CAMPUS_SPONSOR = 50000;
/** A festival slot is a television booking, paid as a fee. */
export const FESTIVAL_FEE = 25000;
/** Cross and house nights are the commercial night, bigger. */
export const CROSS_MULTIPLE = 1.5;
export const HOUSE_MULTIPLE = 2;

/** What one commercial night puts through the door. */
export const COMMERCIAL_VALUE = COMMERCIAL_GATE.tickets * COMMERCIAL_GATE.price;

/** Travel, freight and accommodation, per band per active week. */
export const TRAVEL_PER_BAND_WEEK = 50000;

/* ------------------------------------------------------------------ *
 * The live season, format by format
 * ------------------------------------------------------------------ */

export interface LiveFormat {
  id: string;
  label: string;
  /** Appearances one band makes in this format across the season. */
  perBand: number;
  /** What one appearance is worth, before the split. */
  valuePerAppearance: number;
  /** How that figure is arrived at, in words. */
  basis: string;
}

/**
 * The season one band plays, and what each night is worth to the pool.
 *
 * 24 + 10 + 6 + 2 + 3 + 3 + 1 = 49 appearances, plus the celebrity night, which
 * is co-funded and sits outside this table because it does not divide 40/30/30.
 */
export const LIVE_FORMATS: LiveFormat[] = [
  {
    id: "commercial",
    label: "Commercial shows",
    perBand: 24,
    valuePerAppearance: COMMERCIAL_VALUE,
    basis: `${COMMERCIAL_GATE.tickets} tickets × ₹${COMMERCIAL_GATE.price}`,
  },
  {
    id: "campus",
    label: "Campus shows",
    perBand: 10,
    valuePerAppearance: CAMPUS_SPONSOR,
    basis: "Bought by the college — sponsorship, no gate",
  },
  {
    id: "cross",
    label: "Cross nights",
    perBand: 6,
    valuePerAppearance: COMMERCIAL_VALUE * CROSS_MULTIPLE,
    basis: `${CROSS_MULTIPLE}× the commercial gate — two fanbases in one room`,
  },
  {
    id: "house",
    label: "House nights",
    perBand: 2,
    valuePerAppearance: COMMERCIAL_VALUE * HOUSE_MULTIPLE,
    basis: `${HOUSE_MULTIPLE}× the commercial gate — the whole roster on one bill`,
  },
  {
    id: "festival",
    label: "Festival (TV)",
    perBand: 3,
    valuePerAppearance: FESTIVAL_FEE,
    basis: "A television booking, paid as a flat remuneration",
  },
  {
    id: "corporate",
    label: "Corporate shows",
    perBand: 3,
    valuePerAppearance: CORPORATE_GATE.tickets * CORPORATE_GATE.price,
    basis: `Free entry on a ₹${CORPORATE_GATE.price} pass, ${CORPORATE_GATE.tickets} in`,
  },
  {
    id: "launch",
    label: "League launch",
    perBand: 1,
    valuePerAppearance: 0,
    basis: "Free — the season opener is a marketing spend, not a gate",
  },
];

export interface LiveFormatRow extends LiveFormat {
  /** This format's contribution to one band's season. */
  perBandTotal: number;
  /** The same across the whole roster. */
  seasonTotal: number;
  share: RevenueShare;
}

export const LIVE_ROWS: LiveFormatRow[] = LIVE_FORMATS.map((f) => {
  const perBandTotal = f.perBand * f.valuePerAppearance;
  const seasonTotal = perBandTotal * ROSTER.bands;
  return { ...f, perBandTotal, seasonTotal, share: divide(seasonTotal, "live") };
});

export const LIVE_APPEARANCES_PER_BAND = LIVE_FORMATS.reduce((s, f) => s + f.perBand, 0);
export const LIVE_PER_BAND = LIVE_ROWS.reduce((s, r) => s + r.perBandTotal, 0);
export const LIVE_SEASON_TOTAL = LIVE_ROWS.reduce((s, r) => s + r.seasonTotal, 0);

/* ------------------------------------------------------------------ *
 * The celebrity night — co-funded, and its own business
 * ------------------------------------------------------------------ */

/**
 * One marquee night per band — twenty of them across the season — each funded
 * half by the band's house and half by the operator, with the profit divided
 * the same way and none of it reaching the band.
 *
 * Every band headlines exactly one, which is why the count is derived from the
 * roster and `ACTS_PER_BILL` rather than typed: a celebrity bill carries one
 * league band plus the guest, so twenty bands are twenty separate nights. That
 * is the same rule `show-formats.ts` and the national schedule use, so the
 * three cannot disagree about how many nights exist.
 *
 * The per-show arithmetic is the operating brief's: a ₹3.8Cr build against ₹5Cr
 * of revenue, so each side puts in ₹1.9Cr, takes back ₹2.5Cr and clears ₹0.6Cr.
 *
 * The programme is an order of magnitude larger than the rest of the league and
 * that is not a rounding artefact — twenty nights at this scale need ₹76Cr of
 * build, against a league that otherwise turns over about a tenth of that. It is
 * kept out of the season pool for exactly that reason, and `capitalPerHouse` and
 * `capitalOperator` state the commitment plainly instead of leaving it to be
 * inferred from a profit line.
 */
export const CELEBRITY = {
  showsPerBand: 1,
  revenuePerShow: 50000000,
  costPerShow: 38000000,
};

/** Twenty bands, one night each, one band to a bill. */
export const CELEBRITY_SHOWS = Math.round(
  (ROSTER.bands * CELEBRITY.showsPerBand) / (ACTS_PER_BILL.celebrity ?? 1),
);

/** A house funds the nights its OWN bands headline — four of the twenty. */
export const CELEBRITY_SHOWS_PER_HOUSE = Math.round(CELEBRITY_SHOWS / ROSTER.houses);

const celebRevenue = CELEBRITY_SHOWS * CELEBRITY.revenuePerShow;
const celebCost = CELEBRITY_SHOWS * CELEBRITY.costPerShow;
const halfOf = (n: number) => Math.round(n / 2);

export const CELEBRITY_ECONOMICS = {
  shows: CELEBRITY_SHOWS,
  showsPerHouse: CELEBRITY_SHOWS_PER_HOUSE,
  revenue: celebRevenue,
  cost: celebCost,
  profit: celebRevenue - celebCost,

  /** One night, which is the unit the budget and the revenue mix describe. */
  perShow: {
    revenue: CELEBRITY.revenuePerShow,
    cost: CELEBRITY.costPerShow,
    profit: CELEBRITY.revenuePerShow - CELEBRITY.costPerShow,
    funding: halfOf(CELEBRITY.costPerShow),
    revenueShare: halfOf(CELEBRITY.revenuePerShow),
    profitShare: halfOf(CELEBRITY.revenuePerShow - CELEBRITY.costPerShow),
  },

  /** What ONE house carries: half the build on its own four nights. */
  capitalPerHouse: CELEBRITY_SHOWS_PER_HOUSE * halfOf(CELEBRITY.costPerShow),
  revenuePerHouse: CELEBRITY_SHOWS_PER_HOUSE * halfOf(CELEBRITY.revenuePerShow),
  profitPerHouse:
    CELEBRITY_SHOWS_PER_HOUSE * halfOf(CELEBRITY.revenuePerShow - CELEBRITY.costPerShow),

  /** What the operator carries: half the build on all twenty. */
  capitalOperator: CELEBRITY_SHOWS * halfOf(CELEBRITY.costPerShow),
  revenueOperator: CELEBRITY_SHOWS * halfOf(CELEBRITY.revenuePerShow),
  profitOperator: CELEBRITY_SHOWS * halfOf(CELEBRITY.revenuePerShow - CELEBRITY.costPerShow),

  share: divide(celebRevenue - celebCost, "celebrity"),
};

/** The planning budget for a Thaman-level headliner, low to high. */
export interface CelebrityBudgetLine {
  component: string;
  conservative: number;
  base: number;
  high: number;
}

export const CELEBRITY_BUDGET: CelebrityBudgetLine[] = [
  { component: "Celebrity remuneration", conservative: 15000000, base: 20000000, high: 30000000 },
  { component: "Troupe logistics & hospitality", conservative: 3000000, base: 4500000, high: 6000000 },
  { component: "A/V + stage production", conservative: 4000000, base: 7000000, high: 10000000 },
  { component: "Venue + permissions", conservative: 1500000, base: 3000000, high: 5000000 },
  { component: "Marketing + on-ground ops", conservative: 2000000, base: 3500000, high: 5000000 },
];

export const CELEBRITY_BUDGET_TOTALS = {
  conservative: CELEBRITY_BUDGET.reduce((s, l) => s + l.conservative, 0),
  base: CELEBRITY_BUDGET.reduce((s, l) => s + l.base, 0),
  high: CELEBRITY_BUDGET.reduce((s, l) => s + l.high, 0),
};

/** Where the celebrity night's revenue comes from. */
export const CELEBRITY_REVENUE_MIX: { label: string; amount: number }[] = [
  { label: "Tickets", amount: 14900000 },
  { label: "VIP", amount: 7500000 },
  { label: "Title sponsor", amount: 12500000 },
  { label: "Associate sponsors", amount: 5000000 },
  { label: "F&B", amount: 2000000 },
  { label: "Merchandise", amount: 1500000 },
  { label: "Activations", amount: 1500000 },
  { label: "Other", amount: 500000 },
];

export const CELEBRITY_MIX_TOTAL = CELEBRITY_REVENUE_MIX.reduce((s, l) => s + l.amount, 0);

/**
 * The gap between the itemised mix and the planning case, for ONE night.
 *
 * The brief quotes the night at ₹5Cr and the itemised lines land short of that.
 * Stating the difference is the point — it is the headroom the ₹5Cr case needs
 * to find, and burying it would make the ₹0.6Cr of profit on each side look
 * more certain than it is. Across twenty nights the same gap is twenty times
 * the size, which is why it is worth naming rather than rounding away.
 */
export const CELEBRITY_MIX_HEADROOM = CELEBRITY.revenuePerShow - CELEBRITY_MIX_TOTAL;
export const CELEBRITY_MIX_HEADROOM_SEASON = CELEBRITY_MIX_HEADROOM * CELEBRITY_SHOWS;

/* ------------------------------------------------------------------ *
 * The non-ticket pools, read off their single owner
 * ------------------------------------------------------------------ */

/**
 * Content, broadcast, sponsorship, membership and the signing fee, scaled to
 * this roster.
 *
 * The amounts live in `league-revenue.ts` and are read from there rather than
 * restated, so the sponsorship card and the sponsorship line cannot disagree.
 */
export interface PoolLine {
  id: string;
  label: string;
  detail: string;
  /** Per band, per house or per season — what `amount` is quoted against. */
  basis: RevenueLine["basis"];
  amount: number;
  total: number;
  split: SplitName;
  share: RevenueShare;
}

const rollLine = (l: RevenueLine): PoolLine => {
  const total = l.amount * scaleOf(l.basis, ROSTER);
  return { ...l, total, share: divide(total, l.split) };
};

/** The four catalogue lines, per band per year. */
export const CONTENT_ROWS: PoolLine[] = CONTENT_LINES.map(rollLine);
export const CONTENT_SEASON_TOTAL = CONTENT_ROWS.reduce((s, r) => s + r.total, 0);
export const CONTENT_SHARE_PER_BAND = divide(CONTENT_PER_BAND, "content");

/** Broadcast, sponsorship, membership and acquisition. */
export const SEASON_ROWS: PoolLine[] = SEASON_LINES.map(rollLine);

const seasonRow = (id: string) => SEASON_ROWS.find((r) => r.id === id)!;

export const BROADCAST = seasonRow("broadcast");
export const SPONSORSHIP = seasonRow("sponsorship");
export const MEMBERSHIP_ROW = seasonRow("membership");
export const ACQUISITION = seasonRow("acquisition");

export { SPONSOR_CARD, SPONSOR_CARD_VALUE, CONTENT_PER_BAND };

/* ------------------------------------------------------------------ *
 * The season pool, and how it divides
 * ------------------------------------------------------------------ */

export interface DistributionRow {
  category: string;
  detail: string;
  total: number;
  share: RevenueShare;
}

/**
 * The whole season in six rows.
 *
 * Live is the 49-appearance ladder above; content is the catalogue across four
 * bands; the rest are league-level deals. The celebrity night is deliberately
 * absent — it is co-funded and does not divide this way, so folding it in here
 * would put ₹5Cr of somebody else's capital into a pool the artists take 40% of.
 */
export const DISTRIBUTION: DistributionRow[] = [
  {
    category: "Live events",
    detail: `${LIVE_APPEARANCES_PER_BAND} appearances per band across ${LIVE_FORMATS.length} formats`,
    total: LIVE_SEASON_TOTAL,
    share: divide(LIVE_SEASON_TOTAL, "live"),
  },
  {
    category: "Content",
    detail: `Catalogue and video across ${ROSTER.bands} bands — the operator takes none of it`,
    total: CONTENT_SEASON_TOTAL,
    share: divide(CONTENT_SEASON_TOTAL, "content"),
  },
  {
    category: "Broadcast",
    detail: BROADCAST.detail,
    total: BROADCAST.total,
    share: BROADCAST.share,
  },
  {
    category: "Sponsorship",
    detail: SPONSORSHIP.detail,
    total: SPONSORSHIP.total,
    share: SPONSORSHIP.share,
  },
  {
    category: "Membership",
    detail: MEMBERSHIP_ROW.detail,
    total: MEMBERSHIP_ROW.total,
    share: MEMBERSHIP_ROW.share,
  },
  {
    category: "Acquisition",
    detail: "The sealed-bid purse, paid by the house to the artists and the league",
    total: ACQUISITION.total,
    share: ACQUISITION.share,
  },
];

/** Look a category up by name — the row order is presentation, not structure. */
export const distRow = (category: string): DistributionRow =>
  DISTRIBUTION.find((r) => r.category === category)!;

export const LIVE_SHARE = distRow("Live events").share;
export const CONTENT_SHARE = distRow("Content").share;

export const DISTRIBUTION_TOTALS = {
  pool: DISTRIBUTION.reduce((s, r) => s + r.total, 0),
  artist: DISTRIBUTION.reduce((s, r) => s + r.share.artist, 0),
  productionHouse: DISTRIBUTION.reduce((s, r) => s + r.share.productionHouse, 0),
  operator: DISTRIBUTION.reduce((s, r) => s + r.share.operator, 0),
};

/* ------------------------------------------------------------------ *
 * Party 1 — the artists
 * ------------------------------------------------------------------ */

export interface IncomeLine {
  label: string;
  amount: number;
  detail: string;
}

const perBand = (n: number) => Math.round(n / ROSTER.bands);

/** What ONE band takes home across the season. */
export const BAND_INCOME: IncomeLine[] = [
  {
    label: "Acquisition payment",
    amount: perBand(ACQUISITION.share.artist),
    detail: `${SPLITS.acquisition.artist}% of the purse, paid on signing — the floor under the band`,
  },
  {
    label: "Live events",
    amount: perBand(LIVE_SHARE.artist),
    detail: `${SPLITS.live.artist}% of the pool across ${LIVE_APPEARANCES_PER_BAND} appearances`,
  },
  {
    label: "Content revenue",
    amount: CONTENT_SHARE_PER_BAND.artist,
    detail: "50% of the catalogue the band recorded",
  },
  {
    label: "Broadcast share",
    amount: perBand(BROADCAST.share.artist),
    detail: `The bands' 30% of the ₹2Cr OTT deal, split ${ROSTER.bands} ways`,
  },
  {
    label: "Sponsorship share",
    amount: perBand(SPONSORSHIP.share.artist),
    detail: `The bands' 30% of the ₹1.26Cr card, split ${ROSTER.bands} ways`,
  },
];

export const BAND_INCOME_TOTAL = BAND_INCOME.reduce((s, l) => s + l.amount, 0);
export const ARTIST_INCOME_EACH = Math.round(BAND_INCOME_TOTAL / ARTISTS_PER_BAND);

/* ------------------------------------------------------------------ *
 * Party 2 — the production house
 * ------------------------------------------------------------------ */

const capAmount = (id: string) => SPEND_CAPS.find((c) => c.id === id)?.amount ?? 0;

/** Songs the house finances across its whole roster. */
export const SONGS_PER_ROSTER = RELEASES_PER_BAND * ROSTER.bandsPerHouse;

/** One of five. Every league-level pool is the houses' share divided down. */
const perHouse = (n: number) => Math.round(n / ROSTER.houses);

export const HOUSE_INFLOWS: IncomeLine[] = [
  {
    label: "Live events",
    amount: perHouse(LIVE_SHARE.productionHouse),
    detail: `${SPLITS.live.productionHouse}% of the live pool, across the ${ROSTER.bandsPerHouse} bands it signed`,
  },
  {
    label: "Content revenue",
    amount: perHouse(CONTENT_SHARE.productionHouse),
    detail: `${SPLITS.content.productionHouse}% of the catalogue it financed, across ${ROSTER.bandsPerHouse} bands`,
  },
  {
    label: "Broadcast share",
    amount: perHouse(BROADCAST.share.productionHouse),
    detail: `The houses' ${SPLITS.broadcast.productionHouse}% of the OTT deal, split ${ROSTER.houses} ways`,
  },
  {
    label: "Sponsorship share",
    amount: perHouse(SPONSORSHIP.share.productionHouse),
    detail: `The houses' ${SPLITS.sponsorship.productionHouse}% of the season card, split ${ROSTER.houses} ways`,
  },
  {
    label: "Celebrity nights",
    amount: CELEBRITY_ECONOMICS.revenuePerHouse,
    detail: `Half the revenue on the ${CELEBRITY_SHOWS_PER_HOUSE} nights its own bands headline`,
  },
];

export const HOUSE_OUTFLOWS: IncomeLine[] = [
  {
    label: "Band acquisition",
    amount: ACQUISITION.amount,
    detail: `The sealed-bid cap for all ${ROSTER.bandsPerHouse} bands`,
  },
  {
    label: "Creative allocation",
    amount: capAmount("creative") * SONGS_PER_ROSTER,
    detail: `₹1.25L per song × ${RELEASES_PER_BAND} releases × ${ROSTER.bandsPerHouse} bands`,
  },
  {
    label: "Song marketing",
    amount: capAmount("marketing") * SONGS_PER_ROSTER,
    detail: `₹75K per song × ${SONGS_PER_ROSTER} songs — cash promotion only`,
  },
  {
    label: "Travel & logistics",
    amount: TRAVEL_PER_BAND_WEEK * SEASON_WEEKS * ROSTER.bandsPerHouse,
    detail: `₹50K per band per week × ${SEASON_WEEKS} weeks × ${ROSTER.bandsPerHouse} bands`,
  },
  {
    label: "Celebrity night funding",
    amount: CELEBRITY_ECONOMICS.capitalPerHouse,
    detail: `Half the build on ${CELEBRITY_SHOWS_PER_HOUSE} nights — the largest cheque a house writes`,
  },
];

export const HOUSE_PL = (() => {
  const inflow = HOUSE_INFLOWS.reduce((s, l) => s + l.amount, 0);
  const outflow = HOUSE_OUTFLOWS.reduce((s, l) => s + l.amount, 0);
  return {
    inflow,
    outflow,
    net: inflow - outflow,
    returnPct: outflow > 0 ? ((inflow - outflow) / outflow) * 100 : 0,
    multiple: outflow > 0 ? inflow / outflow : 0,
  };
})();

/** The creative allocation, broken down per song. Not a second budget. */
export const CREATIVE_BREAKDOWN: { label: string; amount: number; detail: string }[] = [
  { label: "Music production", amount: 50000, detail: "Composer, producer, studio, session players, mixing and mastering." },
  { label: "Music video", amount: 50000, detail: "Director, shoot, edit and grade for each release the band ships." },
  { label: "Artwork & distribution", amount: 10000, detail: "Cover art, metadata, distributor fees and publishing registration." },
  { label: "Photography & content", amount: 10000, detail: "Press shots, visual identity and release assets." },
  { label: "Contingency", amount: 5000, detail: "Held back within the band's own allocation — it never moves to another band." },
];

export const CREATIVE_BREAKDOWN_TOTAL = CREATIVE_BREAKDOWN.reduce((s, l) => s + l.amount, 0);

/* ------------------------------------------------------------------ *
 * Party 3 — Svara Tribe, the league operator
 * ------------------------------------------------------------------ */

/** The central cost of running one season. */
export const OPERATOR_COSTS: { label: string; amount: number }[] = [
  { label: "Core team salaries", amount: 1600000 },
  { label: "Event operations", amount: 1150000 },
  { label: "Marketing & brand", amount: 1150000 },
  { label: "Technology / platform", amount: 750000 },
  { label: "Central media production", amount: 750000 },
  { label: "Contingency / insurance", amount: 750000 },
  { label: "Community partner", amount: 550000 },
  { label: "Legal / IP / compliance", amount: 450000 },
];

export const OPERATOR_COSTS_TOTAL = OPERATOR_COSTS.reduce((s, c) => s + c.amount, 0);

/** What the operator does for it. */
export const OPERATOR_MANDATE = [
  "Core team & regional coordination",
  "Technology and platform",
  "League marketing & brand",
  "Legal, IP and compliance",
  "League media — highlights, standings, documentary",
  "Competition standards, scheduling and audit",
  "Prize pool",
];

export const OPERATOR_INFLOWS: IncomeLine[] = [
  {
    label: "Live events",
    amount: LIVE_SHARE.operator,
    detail: `${SPLITS.live.operator}% of the live pool across ${LIVE_APPEARANCES_PER_BAND * ROSTER.bands} appearances`,
  },
  {
    label: "Broadcast share",
    amount: BROADCAST.share.operator,
    detail: "The operator's 40% of the ₹2Cr OTT deal",
  },
  {
    label: "Sponsorship share",
    amount: SPONSORSHIP.share.operator,
    detail: "The operator's 40% of the ₹1.26Cr season card",
  },
  {
    label: "Membership passes",
    amount: MEMBERSHIP_ROW.share.operator,
    detail: "The operator's alone — 500 passes at ₹299",
  },
  {
    label: "Acquisition cut",
    amount: ACQUISITION.share.operator,
    detail: "30% of the signing purse, funding the season the house is buying into",
  },
  {
    label: "Celebrity nights",
    amount: CELEBRITY_ECONOMICS.revenueOperator,
    detail: `Half the revenue on all ${CELEBRITY_SHOWS} nights`,
  },
];

export const OPERATOR_OUTFLOWS: IncomeLine[] = [
  {
    label: "Central operating cost",
    amount: OPERATOR_COSTS_TOTAL,
    detail: `${OPERATOR_COSTS.length} cost centres — team, ops, marketing, tech, media, legal`,
  },
  {
    label: "Celebrity night funding",
    amount: CELEBRITY_ECONOMICS.capitalOperator,
    detail: `Half the build on all ${CELEBRITY_SHOWS} nights — the operator co-funds every one`,
  },
];

export const OPERATOR_PL = (() => {
  const inflow = OPERATOR_INFLOWS.reduce((s, l) => s + l.amount, 0);
  const outflow = OPERATOR_OUTFLOWS.reduce((s, l) => s + l.amount, 0);
  return { inflow, outflow, surplus: inflow - outflow };
})();

/* ------------------------------------------------------------------ *
 * The prize
 * ------------------------------------------------------------------ */

/**
 * A guaranteed floor, plus a quarter of whatever the league clears above it.
 *
 * The second half is what makes the prize a stake rather than a cheque: the
 * winning band's upside moves with the league's, so a better season is worth
 * more to them than a better negotiation.
 */
export const WINNER_PRIZE = (() => {
  const guaranteed = 7500000;
  const postCostProfit = OPERATOR_PL.surplus - guaranteed;
  const profitSharePct = 25;
  const bonus = Math.round(postCostProfit * (profitSharePct / 100));
  return {
    guaranteed,
    postCostProfit,
    profitSharePct,
    bonus,
    total: guaranteed + bonus,
    operatorRetained: OPERATOR_PL.surplus - (guaranteed + bonus),
  };
})();

/* ------------------------------------------------------------------ *
 * The three parties, side by side
 * ------------------------------------------------------------------ */

export interface BigPictureRow {
  label: string;
  artist: string;
  productionHouse: string;
  operator: string;
}

export const BIG_PICTURE: BigPictureRow[] = [
  { label: "How many", artist: `${ROSTER.bands} bands`, productionHouse: `${ROSTER.houses} houses`, operator: "1 operator" },
  { label: "Holds", artist: `${ARTISTS_PER_BAND} artists each`, productionHouse: `${ROSTER.bandsPerHouse} bands each`, operator: "The competition" },
  { label: "Live events", artist: "40%", productionHouse: "30%", operator: "30%" },
  { label: "Content", artist: "50%", productionHouse: "50%", operator: "—" },
  { label: "Broadcast", artist: "30%", productionHouse: "30%", operator: "40%" },
  { label: "Sponsorship", artist: "30%", productionHouse: "30%", operator: "40%" },
  { label: "Membership", artist: "—", productionHouse: "—", operator: "100%" },
  { label: "Acquisition", artist: "70%", productionHouse: "Pays it", operator: "30%" },
  { label: "Celebrity nights", artist: "—", productionHouse: `Funds 50% of ${CELEBRITY_SHOWS_PER_HOUSE}`, operator: `Funds 50% of all ${CELEBRITY_SHOWS}` },
  { label: "Puts in", artist: "Talent and IP", productionHouse: "Capital and A&R", operator: "The league itself" },
  { label: "Carries", artist: "Career risk", productionHouse: "Capital risk", operator: "Central and event risk" },
  { label: "Plays for", artist: "A catalogue and a career", productionHouse: "Artist IP and event profit", operator: "League IP and scale" },
];

/* ------------------------------------------------------------------ *
 * Self-check
 * ------------------------------------------------------------------ */

/**
 * The arithmetic that must hold, checked rather than asserted in a comment.
 *
 * Rendered on the page. A projection that quietly stops adding up is worse than
 * one that is obviously wrong, because only the second kind gets fixed.
 */
export const RECONCILIATION = [
  {
    claim: "The three shares add back to the season pool",
    left: DISTRIBUTION_TOTALS.artist + DISTRIBUTION_TOTALS.productionHouse + DISTRIBUTION_TOTALS.operator,
    right: DISTRIBUTION_TOTALS.pool,
  },
  {
    claim: "The sponsorship card sells for the sponsorship line",
    left: SPONSOR_CARD_VALUE,
    right: SPONSORSHIP.total,
  },
  {
    claim: "The celebrity budget's base case is one night's build",
    left: CELEBRITY_BUDGET_TOTALS.base,
    right: CELEBRITY_ECONOMICS.perShow.cost,
  },
  {
    claim: `Every band headlines one celebrity night — ${CELEBRITY_SHOWS} in all`,
    left: CELEBRITY_SHOWS,
    right: ROSTER.bands,
  },
  {
    claim: "The houses' celebrity capital plus the operator's is the whole build",
    left: CELEBRITY_ECONOMICS.capitalPerHouse * ROSTER.houses + CELEBRITY_ECONOMICS.capitalOperator,
    right: CELEBRITY_ECONOMICS.cost,
  },
  {
    claim: "The creative breakdown sums to the regulated allocation",
    left: CREATIVE_BREAKDOWN_TOTAL,
    right: capAmount("creative"),
  },
  {
    claim: `One band's live share × ${ROSTER.bands} is the bands' live pool`,
    left: BAND_INCOME.find((l) => l.label === "Live events")!.amount * ROSTER.bands,
    right: LIVE_SHARE.artist,
  },
  {
    claim: "The live formats sum to the live line in the distribution",
    left: LIVE_ROWS.reduce((s, r) => s + r.seasonTotal, 0),
    right: distRow("Live events").total,
  },
].map((r) => ({ ...r, ok: r.left === r.right }));

export const RECONCILES = RECONCILIATION.every((r) => r.ok);
