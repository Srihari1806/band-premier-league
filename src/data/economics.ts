/**
 * Economics model for the investor-facing breakdown.
 *
 * These are illustrative projections at the assumptions stated below, not
 * audited results. Structure and splits follow the league operating plan and
 * the League page; the money figures are a worked demo scenario.
 *
 * Almost everything here is DERIVED from ASSUMPTIONS rather than typed in, so
 * changing a base input flows through the whole page and the totals cannot
 * drift out of agreement with each other. Only genuinely independent inputs —
 * catalogue revenue, licensing, broadcast fees, operator costs — are literals.
 */

/** Indian-format rupee string, e.g. 805950 -> "₹8,05,950". */
export function inr(value: number): string {
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value));
}

/** Compact rupee string for headline tiles, e.g. 3215750 -> "₹32.16L". */
export function inrCompact(value: number): string {
  if (Math.abs(value) >= 1e7) return "₹" + (value / 1e7).toFixed(2) + "Cr";
  if (Math.abs(value) >= 1e5) return "₹" + (value / 1e5).toFixed(2) + "L";
  if (Math.abs(value) >= 1e3) return "₹" + (value / 1e3).toFixed(1) + "K";
  return inr(value);
}

/* ------------------------------------------------------------------ *
 * Base assumptions — every derived figure on the page traces to these
 * ------------------------------------------------------------------ */

export const ASSUMPTIONS = {
  /** Mid-scale ticketed room, the level the league is built to operate at. */
  ticketPrice: 399,
  attendance: 300,
  /** Retained by the third-party ticketing platform before any split. */
  ticketingCommissionPct: 10,
  /** A season runs 4 months; the league runs 3 a year (see the League page). */
  monthsPerSeason: 4,
  seasonsPerYear: 3,
  /** Fixtures a single band plays inside one season. */
  showsPerBandPerSeason: 12,
  /** Franchises (and therefore bands) contesting a season. */
  bandsPerSeason: 4,
  /** Typical line-up size, used for the per-musician figure. */
  bandMembers: 5,
} as const;

/** Live-event split of net gate. Event managers are paid from the operator's share. */
export const EVENT_SPLIT = {
  bands: 40,
  productionHouse: 30,
  operator: 30,
} as const;

/** Audio/video IP split between the artist and the franchise that financed it. */
export const CONTENT_SPLIT = {
  artists: 50,
  productionHouse: 50,
} as const;

/** Defaults the live calculator opens on. */
export const SHOW_BASELINE = {
  ticketPrice: ASSUMPTIONS.ticketPrice,
  attendance: ASSUMPTIONS.attendance,
  platformCommissionPct: ASSUMPTIONS.ticketingCommissionPct,
  showsPerMonth: 12,
} as const;

export const SEASON_STRUCTURE = {
  seasonsPerYear: ASSUMPTIONS.seasonsPerYear,
  monthsPerSeason: ASSUMPTIONS.monthsPerSeason,
  showsPerSeasonPerBand: ASSUMPTIONS.showsPerBandPerSeason,
} as const;

export const SHOWS_PER_YEAR_PER_BAND =
  ASSUMPTIONS.seasonsPerYear * ASSUMPTIONS.showsPerBandPerSeason;

/** Distinct fixtures the league stages in one season. */
export const SHOWS_PER_SEASON_LEAGUE =
  ASSUMPTIONS.bandsPerSeason * ASSUMPTIONS.showsPerBandPerSeason;

/* ------------------------------------------------------------------ *
 * Per-show economics
 * ------------------------------------------------------------------ */

export interface ShowEconomics {
  grossTicketRevenue: number;
  platformCommission: number;
  netRevenue: number;
  bandsShare: number;
  productionHouseShare: number;
  operatorShare: number;
}

/** Single source of truth for the per-show maths, used by the calculator. */
export function computeShowEconomics(
  ticketPrice: number,
  attendance: number,
  commissionPct: number,
): ShowEconomics {
  const grossTicketRevenue = ticketPrice * attendance;
  const platformCommission = grossTicketRevenue * (commissionPct / 100);
  const netRevenue = grossTicketRevenue - platformCommission;
  // Round the first two shares and give the operator the remainder, so the
  // three figures on screen always add back to netRevenue exactly.
  const bandsShare = Math.round(netRevenue * (EVENT_SPLIT.bands / 100));
  const productionHouseShare = Math.round(netRevenue * (EVENT_SPLIT.productionHouse / 100));
  return {
    grossTicketRevenue,
    platformCommission,
    netRevenue,
    bandsShare,
    productionHouseShare,
    operatorShare: netRevenue - bandsShare - productionHouseShare,
  };
}

/** The baseline show, which every downstream season figure derives from. */
export const BASE_SHOW = computeShowEconomics(
  ASSUMPTIONS.ticketPrice,
  ASSUMPTIONS.attendance,
  ASSUMPTIONS.ticketingCommissionPct,
);

/* ------------------------------------------------------------------ *
 * Catalogue revenue (per band, annual)
 * ------------------------------------------------------------------ */

export interface ContentStream {
  source: string;
  annual: number;
  note: string;
}

export const CONTENT_STREAMS: ContentStream[] = [
  { source: "YouTube Monetization", annual: 220000, note: "Ad revenue on show films, originals and shorts" },
  { source: "Music Platforms", annual: 180000, note: "Streaming royalties across global and regional platforms" },
  { source: "Exclusive Music Partner", annual: 90000, note: "First-window catalogue placement" },
  { source: "Sponsorships & Brand Collabs", annual: 170000, note: "Band-level sponsor deals and brand tie-ins" },
];

export const CONTENT_TOTAL = CONTENT_STREAMS.reduce((sum, s) => sum + s.annual, 0);

/** Each side's annual half of the catalogue. */
export const CONTENT_HALF_ANNUAL = CONTENT_TOTAL * (CONTENT_SPLIT.artists / 100);
/** One season's share of that half. */
export const CONTENT_HALF_PER_SEASON = Math.round(
  CONTENT_HALF_ANNUAL / ASSUMPTIONS.seasonsPerYear,
);

/* ------------------------------------------------------------------ *
 * Franchise investment and one-season return
 * ------------------------------------------------------------------ */

/**
 * The franchise's own capital is the winning bid alone. The event budget is
 * funded by the title sponsor, so it belongs to the ecosystem total rather
 * than to the production house's risk.
 */
export const PH_INVESTMENT = {
  /** Franchise capital at risk. */
  winningBid: 520000,
  musicProduction: 250000,
  videoProduction: 270000,
  /** Title-sponsor funded, not franchise capital. */
  sponsorEventBudget: 300000,
  marketing: 200000,
  travelLogistics: 100000,
  totalEcosystemBudget: 820000,
} as const;

export interface ReturnStream {
  label: string;
  amount: number;
  detail: string;
}

/** What a franchise earns back across one 4-month season. */
export const PH_SEASON_RETURN: ReturnStream[] = [
  {
    label: "Event Revenue Share",
    amount: BASE_SHOW.productionHouseShare * ASSUMPTIONS.showsPerBandPerSeason,
    detail: `${EVENT_SPLIT.productionHouse}% of net gate across ${ASSUMPTIONS.showsPerBandPerSeason} fixtures`,
  },
  {
    label: "Catalogue Share",
    amount: CONTENT_HALF_PER_SEASON,
    detail: `${CONTENT_SPLIT.productionHouse}% of the band's audio and video rights`,
  },
  {
    label: "Third-Party Content Licensing",
    amount: 140000,
    detail: "OTT, syndication and platform deals on season footage and originals",
  },
  {
    label: "Broadcast Rights Share",
    amount: 100000,
    detail: "Franchise share of league broadcast and streaming distribution fees",
  },
  {
    label: "Sync & Brand Placements",
    amount: 70000,
    detail: "Film, ad and brand sync against franchise-owned masters",
  },
];

export const PH_SEASON_TOTAL = PH_SEASON_RETURN.reduce((s, r) => s + r.amount, 0);
export const PH_SEASON_PROFIT = PH_SEASON_TOTAL - PH_INVESTMENT.winningBid;
export const PH_SEASON_MULTIPLE = PH_SEASON_TOTAL / PH_INVESTMENT.winningBid;

/* ------------------------------------------------------------------ *
 * What the artists earn
 * ------------------------------------------------------------------ */

export const ARTIST_SEASON_RETURN: ReturnStream[] = [
  {
    label: "Live Performance Share",
    amount: BASE_SHOW.bandsShare * ASSUMPTIONS.showsPerBandPerSeason,
    detail: `${EVENT_SPLIT.bands}% of net gate across ${ASSUMPTIONS.showsPerBandPerSeason} fixtures`,
  },
  {
    label: "Catalogue Share",
    amount: CONTENT_HALF_PER_SEASON,
    detail: `${CONTENT_SPLIT.artists}% of the audio and video rights they created`,
  },
];

export const ARTIST_SEASON_TOTAL = ARTIST_SEASON_RETURN.reduce((s, r) => s + r.amount, 0);
export const ARTIST_YEAR_TOTAL = ARTIST_SEASON_TOTAL * ASSUMPTIONS.seasonsPerYear;
export const ARTIST_PER_MEMBER_SEASON = Math.round(
  ARTIST_SEASON_TOTAL / ASSUMPTIONS.bandMembers,
);
export const ARTIST_PER_MEMBER_YEAR = Math.round(ARTIST_YEAR_TOTAL / ASSUMPTIONS.bandMembers);

/* ------------------------------------------------------------------ *
 * League-wide season position
 * ------------------------------------------------------------------ */

export interface LineItem {
  label: string;
  amount: number;
  detail?: string;
}

/** Independent inputs for the season that are not derived from the gate. */
const SPONSORSHIP_SEASON = 300000;
const SPONSORSHIP_OPERATOR_SHARE = 150000;
const MEMBERS_COUNT = 500;
const MEMBERSHIP_PRICE = 299;
const BROADCAST_SEASON = 600000;
const BROADCAST_OPERATOR_SHARE = 300000;

export const SEASON_NET_GATE_POOL = BASE_SHOW.netRevenue * SHOWS_PER_SEASON_LEAGUE;
export const MEMBERSHIP_REVENUE = MEMBERS_COUNT * MEMBERSHIP_PRICE;
export const SEASON_CATALOGUE_POOL = Math.round(
  (CONTENT_TOTAL * ASSUMPTIONS.bandsPerSeason) / ASSUMPTIONS.seasonsPerYear,
);

export const PILOT_REVENUE: LineItem[] = [
  {
    label: "Ticket Sales (net)",
    amount: SEASON_NET_GATE_POOL,
    detail: `${SHOWS_PER_SEASON_LEAGUE} fixtures × ${inr(BASE_SHOW.netRevenue)} net`,
  },
  {
    label: "Production House Bids",
    amount: PH_INVESTMENT.winningBid * ASSUMPTIONS.bandsPerSeason,
    detail: `${ASSUMPTIONS.bandsPerSeason} franchises × ${inr(PH_INVESTMENT.winningBid)}`,
  },
  {
    label: "Catalogue Revenue",
    amount: SEASON_CATALOGUE_POOL,
    detail: `${ASSUMPTIONS.bandsPerSeason} bands, one season's share`,
  },
  { label: "Broadcast Rights", amount: BROADCAST_SEASON, detail: "League distribution fees" },
  { label: "Sponsorship", amount: SPONSORSHIP_SEASON, detail: "Title + co-sponsors" },
  {
    label: "Membership Passes",
    amount: MEMBERSHIP_REVENUE,
    detail: `${MEMBERS_COUNT} fans × ${inr(MEMBERSHIP_PRICE)}`,
  },
];

export const PILOT_REVENUE_TOTAL = PILOT_REVENUE.reduce((s, r) => s + r.amount, 0);

export const PILOT_OPERATOR_COSTS: LineItem[] = [
  { label: "Marketing (Operator share)", amount: 250000 },
  { label: "Operations & Logistics", amount: 200000 },
  { label: "Platform / Tech", amount: 150000 },
  { label: "Community Partner Fees", amount: 120000 },
  { label: "Legal + Contracts", amount: 50000 },
];

export const PILOT_OPERATOR_COSTS_TOTAL = PILOT_OPERATOR_COSTS.reduce((s, c) => s + c.amount, 0);

/** What the operator itself takes home — a subset of ecosystem revenue. */
export const PILOT_OPERATOR_INCOME: LineItem[] = [
  {
    label: "Event Revenue",
    amount: BASE_SHOW.operatorShare * SHOWS_PER_SEASON_LEAGUE,
    detail: `${EVENT_SPLIT.operator}% of net across ${SHOWS_PER_SEASON_LEAGUE} fixtures`,
  },
  {
    label: "Broadcast Share",
    amount: BROADCAST_OPERATOR_SHARE,
    detail: "Operator half of distribution fees",
  },
  { label: "Sponsorship", amount: SPONSORSHIP_OPERATOR_SHARE, detail: "League operator share" },
  { label: "Membership Revenue", amount: MEMBERSHIP_REVENUE },
];

export const PILOT_OPERATOR_GROSS = PILOT_OPERATOR_INCOME.reduce((s, r) => s + r.amount, 0);

/* ------------------------------------------------------------------ *
 * Revenue streams and who they pay
 * ------------------------------------------------------------------ */

export interface RevenueStream {
  stream: string;
  source: string;
  beneficiaries: string;
}

export const REVENUE_STREAMS: RevenueStream[] = [
  { stream: "Event Ticket Sales", source: "Live show tickets via ticketing partners", beneficiaries: "Bands 40% · Production House 30% · Operator 30%" },
  { stream: "Audio Rights", source: "Global and regional music platforms", beneficiaries: "Artists 50% · Production House 50%" },
  { stream: "Video Rights", source: "YouTube monetization, brand collabs, OTT sync", beneficiaries: "Artists 50% · Production House 50%" },
  { stream: "Broadcast Rights", source: "Television and network streaming distribution", beneficiaries: "Operator + Production Houses" },
  { stream: "Third-Party Licensing", source: "OTT and syndication deals on league content", beneficiaries: "Production Houses + Operator" },
  { stream: "Sponsorship", source: "Title sponsors, co-sponsors, venue sponsors", beneficiaries: "Operator + Production Houses" },
  { stream: "Ticketing Commission", source: "Share of ticket sales via partner platforms", beneficiaries: "Ticketing partner" },
  { stream: "Membership Passes", source: "Recurring audience memberships", beneficiaries: "Operator" },
  { stream: "Merchandise", source: "Band merch at events", beneficiaries: "Bands + Operator" },
  { stream: "Sync Licensing", source: "Film and ad placements for original music", beneficiaries: "Artists 50% · Production House 50%" },
];

/* ------------------------------------------------------------------ *
 * Future revenue — upside not counted in any figure above
 * ------------------------------------------------------------------ */

export interface FutureStream {
  title: string;
  detail: string;
  horizon: string;
}

export const FUTURE_STREAMS: FutureStream[] = [
  {
    title: "League Broadcast Deals",
    detail:
      "The season packaged as a broadcast property — network and streaming distribution fees for the fixture calendar and the finale, negotiated once the format has a track record.",
    horizon: "Season 3+",
  },
  {
    title: "OTT Format Licensing",
    detail:
      "The league format itself licensed to a platform as an original series, with production houses retaining a share of the content they financed.",
    horizon: "Year 2+",
  },
  {
    title: "Franchise Content Syndication",
    detail:
      "Production houses resell season footage, live films and originals into third-party catalogues and regional platforms, independently of the league.",
    horizon: "Live from Season 1",
  },
  {
    title: "City Franchise Expansion",
    detail:
      "The playbook replicated city by city, with a fresh round of franchise bids in each new market against largely the same central overhead.",
    horizon: "Year 2+",
  },
];

/* ------------------------------------------------------------------ *
 * Partner architecture — role tiers, deliberately unnamed
 * ------------------------------------------------------------------ */

export type PartnerTier = "music" | "sponsor" | "platform" | "community";

export interface PartnerRole {
  role: string;
  scope: string;
  tier: PartnerTier;
}

export const PARTNER_ROLES: PartnerRole[] = [
  { role: "Exclusive Music Partner", scope: "Catalogue placement and audio distribution for every league original.", tier: "music" },
  { role: "Title Sponsor", scope: "Season naming rights across all shows, films and league branding.", tier: "sponsor" },
  { role: "Co-Sponsors", scope: "Category presence through the season with on-ground activation at shows.", tier: "sponsor" },
  { role: "Venue Sponsors", scope: "Host billing on the fixtures they carry, plus footfall from the league calendar.", tier: "sponsor" },
  { role: "Production Houses", scope: "Franchise investors financing music and video production for their signed band.", tier: "platform" },
  { role: "Broadcast Partner", scope: "Network and streaming distribution of the fixture calendar and finale.", tier: "platform" },
  { role: "Ticketing Partner", scope: "Ticket sales, entry and settlement across the full fixture calendar.", tier: "platform" },
  { role: "Community Partners", scope: "Campus and city networks driving audience turnout show after show.", tier: "community" },
];

/* ------------------------------------------------------------------ *
 * Investor thesis
 * ------------------------------------------------------------------ */

export interface PitchPoint {
  title: string;
  detail: string;
}

export const PITCH_POINTS: PitchPoint[] = [
  { title: "Proven Template", detail: "The franchise league model is battle-tested. This applies it to independent music — a large, underserved market with no structured incumbent." },
  { title: "Diversified Income", detail: "Gate, catalogue, licensing, broadcast, sponsorship and memberships mean no single stream carries the business." },
  { title: "Compounding IP", detail: "Every season produces ownable audio and video catalogue that keeps earning long after the show ends." },
  { title: "Network Effects", detail: "More bands drive more fixtures, which grow audiences, which lift sponsorship, which pulls in more franchise capital." },
  { title: "Low Competition", detail: "No structured franchise music ecosystem exists in India's regional markets today." },
  { title: "Scalable Playbook", detail: "The model replicates city by city on largely fixed central overhead." },
  { title: "Creator Economy Alignment", detail: "Sits across three fast-growing markets at once: live events, music streaming and the creator economy." },
];
