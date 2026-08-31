/**
 * Everything the league earns that is not a ticket, and how each pool divides.
 *
 * Five different splits apply here and they are different on purpose. A
 * catalogue is not a broadcast deal is not a sponsorship card is not a
 * membership pass, and quoting "the 40/30/30" at all of them is how a model
 * stops meaning anything.
 *
 * Per-band figures are stated per band and scaled by the roster; season-level
 * figures are stated for the season they belong to. Which is which is on every
 * line, because mixing the two is the easiest arithmetic error in the model to
 * make and the hardest to see.
 */

import { SPLITS } from "./economics";
import { seasonPlan, type SeasonPlan } from "./season-plan";

export type SplitName = keyof typeof SPLITS;

export interface RevenueLine {
  id: string;
  label: string;
  detail: string;
  /** "band" scales with the roster; "season" is already a season total. */
  basis: "band" | "season" | "house";
  amount: number;
  split: SplitName;
  certainty: "modelled" | "contract";
}

/* ------------------------------------------------------------------ *
 * Content — per band, per year, split 50/50 with the house
 * ------------------------------------------------------------------ */

export const CONTENT_LINES: RevenueLine[] = [
  {
    id: "youtube",
    label: "YouTube monetisation",
    detail: "48.8L monetised views a year at ₹50 RPM",
    basis: "band",
    amount: 244165,
    split: "content",
    certainty: "modelled",
  },
  {
    id: "platforms",
    label: "Music platforms",
    detail: "Streaming royalties across global and regional platforms",
    basis: "band",
    amount: 180000,
    split: "content",
    certainty: "modelled",
  },
  {
    id: "exclusive",
    label: "Exclusive music partner",
    detail: "First-window catalogue placement",
    basis: "band",
    amount: 90000,
    split: "content",
    certainty: "contract",
  },
  {
    id: "brand",
    label: "Sponsorships & brand collabs",
    detail: "Band-level sponsor deals and brand tie-ins",
    basis: "band",
    amount: 170000,
    split: "content",
    certainty: "contract",
  },
];

export const CONTENT_PER_BAND = CONTENT_LINES.reduce((s, l) => s + l.amount, 0);

/* ------------------------------------------------------------------ *
 * Season-level pools
 * ------------------------------------------------------------------ */

export const MEMBERSHIP = { price: 299, members: 500 };
export const MEMBERSHIP_REVENUE = MEMBERSHIP.price * MEMBERSHIP.members;

/** The sealed-bid cap a house commits to acquire its four bands. */
export const ACQUISITION_PER_HOUSE = 1000000;

export const SEASON_LINES: RevenueLine[] = [
  {
    id: "broadcast",
    label: "Broadcast rights — OTT deal",
    detail: "Season footage and originals, licensed to a streaming platform",
    basis: "season",
    amount: 20000000,
    split: "broadcast",
    certainty: "contract",
  },
  {
    id: "sponsorship",
    label: "League sponsorship card",
    detail: "Title, associate, category, zone, fixture and campus partners",
    basis: "season",
    amount: 12600000,
    split: "sponsorship",
    certainty: "contract",
  },
  {
    id: "membership",
    label: "Membership passes",
    detail: `${MEMBERSHIP.members} members at ₹${MEMBERSHIP.price}`,
    basis: "season",
    amount: MEMBERSHIP_REVENUE,
    split: "membership",
    certainty: "modelled",
  },
  {
    id: "acquisition",
    label: "Band acquisition",
    detail: "The sealed-bid purse each house commits, split with the artists",
    basis: "house",
    amount: ACQUISITION_PER_HOUSE,
    split: "acquisition",
    certainty: "contract",
  },
];

/* ------------------------------------------------------------------ *
 * The sponsorship card
 * ------------------------------------------------------------------ */

export interface SponsorSlot {
  role: string;
  slots: number;
  rate: number;
}

/**
 * Finite inventory, not an open-ended ask.
 *
 * The structural point is that a title partner and forty fixture partners are
 * different products, bought by different people, out of different budgets —
 * so "we need ₹1.26Cr of sponsorship" is one sentence describing six sales
 * jobs of very different difficulty.
 */
export const SPONSOR_CARD: SponsorSlot[] = [
  { role: "Title Partner", slots: 1, rate: 2500000 },
  { role: "Associate Partner", slots: 2, rate: 1000000 },
  { role: "Category Partner", slots: 6, rate: 500000 },
  { role: "Zone Partner", slots: 3, rate: 300000 },
  { role: "Fixture Partner", slots: 40, rate: 75000 },
  { role: "Campus Partner", slots: 2, rate: 600000 },
];

export const SPONSOR_CARD_VALUE = SPONSOR_CARD.reduce((s, r) => s + r.slots * r.rate, 0);

/* ------------------------------------------------------------------ *
 * Rolling it up for a season
 * ------------------------------------------------------------------ */

export interface RevenueShare {
  artist: number;
  productionHouse: number;
  operator: number;
}

export interface RolledLine extends RevenueLine {
  /** Season total after scaling by the roster. */
  total: number;
  share: RevenueShare;
}

function shareOf(total: number, split: SplitName): RevenueShare {
  const s = SPLITS[split];
  return {
    artist: Math.round((total * s.artist) / 100),
    productionHouse: Math.round((total * s.productionHouse) / 100),
    operator: Math.round((total * s.operator) / 100),
  };
}

export function rollUpRevenue(plan: SeasonPlan | string = "s1") {
  const p = typeof plan === "string" ? seasonPlan(plan) : plan;

  const scaleOf = (basis: RevenueLine["basis"]) =>
    basis === "band" ? p.bands : basis === "house" ? p.houses : 1;

  const lines: RolledLine[] = [...CONTENT_LINES, ...SEASON_LINES].map((l) => {
    const total = l.amount * scaleOf(l.basis);
    return { ...l, total, share: shareOf(total, l.split) };
  });

  const sum = (f: (l: RolledLine) => number) => lines.reduce((s, l) => s + f(l), 0);

  return {
    plan: p,
    lines,
    contentPerBand: CONTENT_PER_BAND,
    total: sum((l) => l.total),
    artist: sum((l) => l.share.artist),
    productionHouse: sum((l) => l.share.productionHouse),
    operator: sum((l) => l.share.operator),
    /** Card value must equal the sponsorship line, or one of them is stale. */
    sponsorCardReconciles:
      SPONSOR_CARD_VALUE === (SEASON_LINES.find((l) => l.id === "sponsorship")?.amount ?? 0),
  };
}
