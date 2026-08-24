/**
 * Economics figures for the investor-facing breakdown.
 *
 * Every number here is taken from the BPL SRS v1.0 (Band Premier League),
 * with the source section noted so each figure stays auditable. These are
 * pilot-stage projections, not audited results — the page states that too.
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
 * SRS 8.1 — Event revenue flow (per show)
 * ------------------------------------------------------------------ */

/** Defaults the live calculator opens on — the SRS worked example. */
export const SHOW_BASELINE = {
  ticketPrice: 199,
  attendance: 150,
  platformCommissionPct: 10,
  showsPerMonth: 10,
} as const;

/**
    * Live-event split, applied to net revenue after platform commission.
    * Matches the split published on the About page. Event management is not a
    * fourth party — contracted event managers are paid out of the operator's
    * 30% share.
    */
export const EVENT_SPLIT = {
  bands: 40,
  productionHouse: 30,
  operator: 30,
} as const;

/** Audio/video IP split (SRS 7.1 / 8.2). */
export const CONTENT_SPLIT = {
  artists: 50,
  productionHouse: 50,
} as const;

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
  // three figures on screen always add back to netRevenue exactly. Splitting a
  // 30% share of an odd net lands on .5 and would otherwise drift by a rupee.
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

/* ------------------------------------------------------------------ *
 * SRS 8.2 — Content rights revenue (per band, annual estimate)
 * ------------------------------------------------------------------ */

export interface ContentStream {
  source: string;
  annual: number;
  note: string;
}

export const CONTENT_STREAMS: ContentStream[] = [
  { source: "YouTube Monetization", annual: 150000, note: "Ad revenue on show films and originals" },
  { source: "Spotify / Apple Music", annual: 80000, note: "Streaming royalties on original tracks" },
  { source: "JioSaavn / Gaana", annual: 50000, note: "Regional streaming platforms" },
  { source: "Exclusive Music Partner", annual: 60000, note: "Partner catalogue placement" },
  { source: "Brand Collabs / Sync", annual: 100000, note: "Ad and film sync placements" },
];

export const CONTENT_TOTAL = CONTENT_STREAMS.reduce((sum, s) => sum + s.annual, 0);

/* ------------------------------------------------------------------ *
 * SRS 8.3 — Production house investment and Year 1 ROI (pilot)
 * ------------------------------------------------------------------ */

export const PH_INVESTMENT = {
  winningBid: 520000,
  musicProduction: 250000,
  videoProduction: 270000,
  eventBudget: 300000,
  marketing: 200000,
  travelLogistics: 100000,
  totalEcosystemBudget: 820000,
} as const;

export const PH_RETURN = {
  contentYear1: 220000,
  /** 10 shows × the franchise's 30% of ₹26,865 net. */
  eventsYear1: 80595,
  totalYear1: 300595,
  eventShowsCounted: 10,
} as const;

/* ------------------------------------------------------------------ *
 * SRS 31.1 — Pilot season (Hyderabad, 3 months)
 * ------------------------------------------------------------------ */

export interface LineItem {
  label: string;
  amount: number;
  detail?: string;
}

export const PILOT_REVENUE: LineItem[] = [
  { label: "Ticket Sales", amount: 805950, detail: "30 shows × ₹26,865 net" },
  { label: "Production House Bids", amount: 2000000, detail: "4 bands, floor estimate" },
  { label: "Sponsorship", amount: 300000, detail: "Title + co-sponsors" },
  { label: "Membership Signups", amount: 59800, detail: "200 fans × ₹299" },
  { label: "Content Revenue", amount: 50000, detail: "Q1 estimate" },
];

export const PILOT_REVENUE_TOTAL = 3215750;

export const PILOT_OPERATOR_COSTS: LineItem[] = [
  { label: "Platform / Tech Setup", amount: 150000 },
  { label: "Marketing (Operator share)", amount: 80000 },
  { label: "Operations & Logistics", amount: 60000 },
  { label: "Legal + Contracts", amount: 50000 },
  { label: "Community Partner Fees", amount: 40000 },
];

export const PILOT_OPERATOR_COSTS_TOTAL = 380000;

/** What the operator itself takes home — a subset of ecosystem revenue. */
export const PILOT_OPERATOR_INCOME: LineItem[] = [
  { label: "Event Revenue", amount: 241785, detail: "30% of ₹8,05,950" },
  { label: "Sponsorship", amount: 150000, detail: "League operator share" },
  { label: "Membership Revenue", amount: 59800 },
];

export const PILOT_OPERATOR_GROSS = 451585;

/* ------------------------------------------------------------------ *
 * SRS 7.1 — Revenue streams and who they pay
 * ------------------------------------------------------------------ */

export interface RevenueStream {
  stream: string;
  source: string;
  beneficiaries: string;
}

export const REVENUE_STREAMS: RevenueStream[] = [
  { stream: "Event Ticket Sales", source: "Live show tickets via ticketing partners", beneficiaries: "Bands 40% · Production House 30% · Operator 30%" },
  { stream: "Audio Rights", source: "Spotify, JioSaavn, Gaana, Apple Music, exclusive music partner", beneficiaries: "Artists 50% · Production House 50%" },
  { stream: "Video Rights", source: "YouTube monetization, brand collabs, OTT sync", beneficiaries: "Artists 50% · Production House 50%" },
  { stream: "Sponsorship", source: "Title sponsors, co-sponsors, venue sponsors", beneficiaries: "Operator + Production Houses" },
  { stream: "Ticketing Commission", source: "Share of ticket sales via partner platforms", beneficiaries: "Ticketing partner" },
  { stream: "Membership Passes", source: "Recurring audience memberships", beneficiaries: "Operator" },
  { stream: "Merchandise", source: "Band merch at events", beneficiaries: "Bands + Operator" },
  { stream: "Brand Collaborations", source: "Youth brands, cafes, music gear", beneficiaries: "Bands + Operator" },
  { stream: "Sync Licensing", source: "Film and ad placements for original music", beneficiaries: "Artists 50% · Production House 50%" },
  { stream: "Content IP Licensing", source: "OTT / TV format licensing, future", beneficiaries: "Operator + Production Houses" },
];

/* ------------------------------------------------------------------ *
 * SRS 38 — Investor pitch points
 * ------------------------------------------------------------------ */

export interface PitchPoint {
  title: string;
  detail: string;
}

export const PITCH_POINTS: PitchPoint[] = [
  { title: "Proven Template", detail: "The franchise league model is battle-tested. BPL applies it to independent music — a large, underserved market with no structured incumbent." },
  { title: "Diversified Income", detail: "Tickets, content rights, sponsorship and memberships mean no single stream carries the business." },
  { title: "Compounding IP", detail: "Every season produces ownable audio and video catalogue that keeps earning after the show ends." },
  { title: "Network Effects", detail: "More bands drive more shows, which grow audiences, which lift sponsorship, which pulls in more production-house capital." },
  { title: "Low Competition", detail: "No structured franchise music ecosystem exists in India's regional markets today." },
  { title: "Scalable Playbook", detail: "The Hyderabad model replicates city by city on largely fixed central overhead." },
  { title: "Creator Economy Alignment", detail: "Sits across three fast-growing markets at once: live events, music streaming and the creator economy." },
];

/* ------------------------------------------------------------------ *
 * Partner architecture — role tiers, deliberately unnamed
 *
 * These describe the slots in the ecosystem rather than the companies
 * filling them, so the page can show the commercial structure without
 * disclosing partner identities.
 * ------------------------------------------------------------------ */

export type PartnerTier = "music" | "sponsor" | "platform" | "community";

export interface PartnerRole {
  role: string;
  scope: string;
  tier: PartnerTier;
}

export const PARTNER_ROLES: PartnerRole[] = [
  {
    role: "Exclusive Music Partner",
    scope: "Catalogue placement and audio distribution for every league original.",
    tier: "music",
  },
  {
    role: "Title Sponsor",
    scope: "Season naming rights across all shows, films and league branding.",
    tier: "sponsor",
  },
  {
    role: "Co-Sponsors",
    scope: "Category presence through the season with on-ground activation at shows.",
    tier: "sponsor",
  },
  {
    role: "Venue Sponsors",
    scope: "Host billing on the fixtures they carry, plus footfall from the league calendar.",
    tier: "sponsor",
  },
  {
    role: "Production Houses",
    scope: "Franchise investors financing music and video production for their signed band.",
    tier: "platform",
  },
  {
    role: "Ticketing Partner",
    scope: "Ticket sales, entry and settlement across the full fixture calendar.",
    tier: "platform",
  },
  {
    role: "Community Partners",
    scope: "Campus and city networks driving audience turnout show after show.",
    tier: "community",
  },
];
