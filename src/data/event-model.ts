/**
 * The planning layer beneath the season model.
 *
 * `economics.ts` answers "what does a season generate?". This file answers the
 * question underneath it: "what does one night actually cost to stage, and does
 * that night wash its own face?"
 *
 * The design rule is that NO cost is written twice. Every rupee of production
 * cost lives once in `ASSUMPTIONS`, and an event preset is nothing but a list
 * of assumption ids. Renegotiate the sound quote in one place and every event,
 * every preset and every season roll-up moves with it.
 *
 * Three columns per assumption, deliberately:
 *   base    — the planning number we started from
 *   current — the latest negotiated or verified quote
 *   actual  — what was really paid once the night was settled
 *
 * That is what turns this from a pitch calculator into something that can be
 * checked against reality after the fact. Until a vendor quote exists, `current`
 * and `actual` stay undefined and the base number carries the model.
 */

import { EVENT_SPLIT, inr } from "./economics";

/* ------------------------------------------------------------------ *
 * The central assumption registry
 * ------------------------------------------------------------------ */

export type AssumptionCategory =
  | "Venue"
  | "Production"
  | "Crew & Safety"
  | "Content"
  | "Travel & Logistics"
  | "Marketing"
  | "Commercial"
  | "Ticketing";

/** Rupees per event, or a percentage of the line it applies to. */
export type AssumptionUnit = "event" | "percent" | "stall" | "head";

export interface Assumption {
  id: string;
  category: AssumptionCategory;
  kpi: string;
  /** The original planning figure. */
  base: number;
  /** Latest negotiated or verified figure, once one exists. */
  current?: number;
  /** What was actually paid or earned, once a night has settled. */
  actual?: number;
  unit: AssumptionUnit;
  note?: string;
}

/**
 * Market-rate starting points for the AP/TS circuit. These are planning
 * assumptions, not contracted rates — they are meant to be replaced by real
 * quotes, which is exactly what the `current` and `actual` columns are for.
 */
export const ASSUMPTIONS: Assumption[] = [
  /* ---- Venue ---- */
  { id: "venue-cafe", category: "Venue", kpi: "Café / Pub hire", base: 15000, current: 12000, unit: "event", note: "Room hire for a weeknight slot; the venue keeps its own F&B upside." },
  { id: "venue-college", category: "Venue", kpi: "College auditorium", base: 10000, unit: "event", note: "Campus rate through the student chapter, usually the cheapest room on the circuit." },
  { id: "venue-auditorium", category: "Venue", kpi: "Auditorium", base: 40000, unit: "event", note: "Seated 400–800 cap room with house sound and lighting rig." },
  { id: "venue-outdoor", category: "Venue", kpi: "Small outdoor ground", base: 50000, unit: "event", note: "Open ground or lawn; everything on top of the hire has to be trucked in." },

  /* ---- Production ---- */
  { id: "sound-basic", category: "Production", kpi: "Sound — basic", base: 10000, current: 8000, unit: "event", note: "Small PA and monitors for a café-scale room." },
  { id: "sound-standard", category: "Production", kpi: "Sound — standard", base: 25000, unit: "event", note: "Line array, desk and an engineer for a 300–600 cap room." },
  { id: "sound-large", category: "Production", kpi: "Sound — large", base: 50000, unit: "event", note: "Full FOH and monitor world for a headline or final night." },
  { id: "light-basic", category: "Production", kpi: "Lighting — basic", base: 5000, unit: "event" },
  { id: "light-standard", category: "Production", kpi: "Lighting — standard", base: 15000, unit: "event" },
  { id: "light-large", category: "Production", kpi: "Lighting — large", base: 30000, unit: "event", note: "Moving heads, haze and an operator — the broadcast look." },
  { id: "stage-temp", category: "Production", kpi: "Temporary stage", base: 15000, unit: "event" },
  { id: "stage-large", category: "Production", kpi: "Large stage & rigging", base: 30000, unit: "event" },
  { id: "backline-basic", category: "Production", kpi: "Backline — basic", base: 10000, unit: "event", note: "Drum kit, amps and DI boxes." },
  { id: "backline-standard", category: "Production", kpi: "Backline — standard", base: 20000, unit: "event" },
  { id: "backline-premium", category: "Production", kpi: "Backline — premium", base: 25000, unit: "event" },

  /* ---- Crew & safety ---- */
  { id: "crew-coordinator", category: "Crew & Safety", kpi: "Event coordinator", base: 7500, unit: "event", note: "One on-ground coordinator running load-in, doors and settlement." },
  { id: "crew-full", category: "Crew & Safety", kpi: "Full crew & stage management", base: 25000, unit: "event" },
  { id: "security-none", category: "Crew & Safety", kpi: "Security — standard night", base: 0, unit: "event", note: "Café and campus rooms use venue staff; no separate line." },
  { id: "security-large", category: "Crew & Safety", kpi: "Security — large event", base: 15000, unit: "event" },
  { id: "permits", category: "Crew & Safety", kpi: "Permits, NOC & music licence", base: 15000, unit: "event", note: "Police permission, fire NOC where required, and the PPL/IPRS public performance licence. Non-negotiable on a public ticketed night and routinely forgotten in first-year budgets." },
  { id: "permits-venue", category: "Crew & Safety", kpi: "Permits — covered by venue", base: 0, unit: "event", note: "A room that already programmes live music holds its own PPL/IPRS licence, and a college clears its own on-campus permission. Carried at zero deliberately — it is a real cost, just not the league's." },
  { id: "insurance-event", category: "Crew & Safety", kpi: "Gear & public liability cover", base: 2500, unit: "event", note: "Per-night share of an annual policy. Cheaper annually than per event, but it has to be costed somewhere." },
  { id: "power-genset", category: "Crew & Safety", kpi: "Generator & power backup", base: 22000, unit: "event", note: "Outdoor grounds only. A silent DG plus distribution — the single largest line an open-air night adds." },
  { id: "medical-standby", category: "Crew & Safety", kpi: "Ambulance & medical standby", base: 7000, unit: "event", note: "Required by most municipal permissions above roughly 1,000 head." },
  { id: "cleaning-waste", category: "Crew & Safety", kpi: "Cleaning & waste removal", base: 6000, unit: "event", note: "Post-show clear-up. Usually a condition of getting the ground or campus again next season." },

  /* ---- Content ---- */
  { id: "photo", category: "Content", kpi: "Photographer", base: 5000, unit: "event" },
  { id: "video-reels", category: "Content", kpi: "Video / reels package", base: 7500, unit: "event", note: "Vertical cutdowns for the fixture's social campaign." },
  { id: "video-multicam", category: "Content", kpi: "Multi-camera recording", base: 20000, unit: "event", note: "The footage that feeds the central league media package." },

  /* ---- Talent & travel ---- */
  { id: "travel-local", category: "Travel & Logistics", kpi: "Local artist travel", base: 3000, unit: "event" },
  { id: "travel-interstate", category: "Travel & Logistics", kpi: "Interstate artist travel", base: 10000, unit: "event" },
  { id: "celebrity-travel", category: "Travel & Logistics", kpi: "Celebrity travel & hospitality", base: 25000, unit: "event" },
  { id: "celebrity-fee", category: "Travel & Logistics", kpi: "Celebrity performance fee", base: 100000, unit: "event", note: "Only on marquee nights, and only against a sponsor that funds it." },
  { id: "freight-backline", category: "Travel & Logistics", kpi: "Backline & gear freight", base: 6000, unit: "event", note: "Tempo or small truck for drums, amps and cases, intra-city with a driver and two loaders." },
  { id: "freight-production", category: "Travel & Logistics", kpi: "Stage & production freight", base: 18000, unit: "event", note: "Truck for stage decks, rigging and the larger PA. Interstate runs cost roughly double." },
  { id: "artist-stay", category: "Travel & Logistics", kpi: "Artist accommodation", base: 9000, unit: "event", note: "Twin-sharing for a 5-piece band plus a tour manager on an away night. Zero when the band is playing its home city." },
  { id: "crew-stay", category: "Travel & Logistics", kpi: "Crew stay & per diems", base: 5000, unit: "event", note: "Touring crew beds and food allowance. Local hires are day-rate only and do not carry this." },
  { id: "ground-transport", category: "Travel & Logistics", kpi: "Local ground transport", base: 3500, unit: "event", note: "Airport and station runs, load-in shuttles, and the cab nobody plans for at 2am." },
  { id: "catering", category: "Travel & Logistics", kpi: "Artist & crew catering", base: 4000, unit: "event", note: "Green room and crew meals from load-in to load-out. Contractual on most riders." },

  /* ---- Marketing ---- */
  { id: "marketing-local", category: "Marketing", kpi: "Marketing — local", base: 10000, unit: "event" },
  { id: "marketing-standard", category: "Marketing", kpi: "Marketing — standard", base: 20000, unit: "event" },
  { id: "marketing-major", category: "Marketing", kpi: "Marketing — major event", base: 50000, unit: "event" },

  /* ---- Commercial (revenue-side assumptions) ---- */
  { id: "stall-small", category: "Commercial", kpi: "Stall — small room", base: 5000, unit: "stall", note: "A local brand table at a cafe-scale night. Nowhere near the rate a campus or arena concourse commands." },
  { id: "stall-basic", category: "Commercial", kpi: "Stall — basic", base: 20000, unit: "stall", note: "Brand or vendor stall in a campus or auditorium concourse for one night." },
  { id: "stall-premium", category: "Commercial", kpi: "Stall — premium", base: 40000, unit: "stall" },
  { id: "fnb-spend", category: "Commercial", kpi: "F&B spend per head", base: 250, unit: "head" },
  { id: "fnb-commission", category: "Commercial", kpi: "F&B commission to league", base: 15, unit: "percent", note: "Only under revenue-share venue deals; zero on a flat-rental night." },
  { id: "merch-conversion", category: "Commercial", kpi: "Merch conversion rate", base: 8, unit: "percent" },
  { id: "merch-spend", category: "Commercial", kpi: "Average merch spend", base: 699, unit: "head" },
  { id: "merch-commission", category: "Commercial", kpi: "Merch commission to league", base: 15, unit: "percent" },
  { id: "sponsor-event", category: "Commercial", kpi: "Event sponsor fee", base: 75000, unit: "event" },
  { id: "sponsor-basic", category: "Commercial", kpi: "Local sponsor fee", base: 50000, unit: "event" },

  /* ---- Ticketing ---- */
  { id: "ticketing-fee", category: "Ticketing", kpi: "Ticketing & payment cost", base: 3, current: 3, unit: "percent", note: "Own-platform checkout via a payment gateway. Third-party marketplaces run far higher." },
];

export const ASSUMPTION_CATEGORIES: AssumptionCategory[] = [
  "Venue",
  "Production",
  "Crew & Safety",
  "Content",
  "Travel & Logistics",
  "Marketing",
  "Commercial",
  "Ticketing",
];

const ASSUMPTION_INDEX: Record<string, Assumption> = Object.fromEntries(
  ASSUMPTIONS.map((a) => [a.id, a]),
);

export function getAssumption(id: string): Assumption | undefined {
  return ASSUMPTION_INDEX[id];
}

/** Overrides the page holds in state, keyed by assumption id. */
export type AssumptionOverrides = Record<string, number>;

/**
 * The figure the model should use right now: a live override first, then the
 * negotiated rate, then the original planning base.
 */
export function rateOf(id: string, overrides: AssumptionOverrides = {}): number {
  if (overrides[id] !== undefined) return overrides[id];
  const a = ASSUMPTION_INDEX[id];
  if (!a) return 0;
  return a.current ?? a.base;
}

/** Signed variance of the live rate against the original planning base. */
export function varianceOf(id: string, overrides: AssumptionOverrides = {}) {
  const a = ASSUMPTION_INDEX[id];
  if (!a) return { delta: 0, pct: 0 };
  const live = rateOf(id, overrides);
  const delta = live - a.base;
  return { delta, pct: a.base === 0 ? 0 : (delta / a.base) * 100 };
}

export function formatRate(a: Assumption, value: number): string {
  return a.unit === "percent" ? `${value}%` : inr(value);
}

/* ------------------------------------------------------------------ *
 * Event presets — a cost stack expressed as a list of assumption ids
 * ------------------------------------------------------------------ */

export interface EventPreset {
  id: string;
  label: string;
  blurb: string;
  capacity: number;
  ticketPrice: number;
  /** Planning fill rate for this room type. */
  occupancyPct: number;
  /** Assumption ids that make up the cost stack. */
  costIds: string[];
  stalls: number;
  stallRateId: string;
  sponsorId: string | null;
  /** Whether the venue deal gives the league a cut of F&B. */
  fnbShare: boolean;
}

export const EVENT_PRESETS: EventPreset[] = [
  {
    id: "cafe",
    label: "Café / Pub Night",
    blurb: "The workhorse fixture. Small room, low cost stack, and the format that has to work before anything else does.",
    capacity: 300,
    ticketPrice: 299,
    occupancyPct: 75,
    costIds: ["venue-cafe", "sound-basic", "light-basic", "backline-basic", "crew-coordinator", "security-none", "photo", "marketing-local", "ground-transport", "insurance-event", "permits-venue"],
    stalls: 2,
    stallRateId: "stall-small",
    sponsorId: null,
    fnbShare: true,
  },
  {
    id: "college",
    label: "Campus Night",
    blurb: "Run through the student chapter. Priced for reach — the return is voters and followers, not gate margin.",
    capacity: 600,
    ticketPrice: 149,
    occupancyPct: 85,
    costIds: ["venue-college", "sound-standard", "light-standard", "stage-temp", "backline-basic", "crew-coordinator", "security-none", "photo", "video-reels", "marketing-local", "freight-backline", "ground-transport", "catering", "insurance-event", "permits-venue"],
    stalls: 3,
    stallRateId: "stall-basic",
    sponsorId: "sponsor-basic",
    fnbShare: false,
  },
  {
    id: "auditorium",
    label: "Auditorium Fixture",
    blurb: "A seated ticketed room for a rivalry night, where two fanbases justify the bigger production spend.",
    capacity: 800,
    ticketPrice: 499,
    occupancyPct: 78,
    costIds: ["venue-auditorium", "sound-standard", "light-standard", "stage-temp", "backline-standard", "crew-coordinator", "security-large", "photo", "video-multicam", "travel-local", "marketing-standard", "freight-backline", "artist-stay", "crew-stay", "ground-transport", "catering", "permits", "insurance-event", "cleaning-waste"],
    stalls: 4,
    stallRateId: "stall-basic",
    sponsorId: "sponsor-event",
    fnbShare: true,
  },
  {
    id: "marquee",
    label: "Marquee / Final",
    blurb: "The broadcast centrepiece — outdoor ground, full production, a guest headliner funded against a sponsor.",
    capacity: 2000,
    ticketPrice: 799,
    occupancyPct: 80,
    costIds: ["venue-outdoor", "sound-large", "light-large", "stage-large", "backline-premium", "crew-full", "security-large", "photo", "video-multicam", "celebrity-travel", "marketing-major", "freight-production", "travel-interstate", "artist-stay", "crew-stay", "ground-transport", "catering", "permits", "insurance-event", "power-genset", "medical-standby", "cleaning-waste"],
    stalls: 6,
    stallRateId: "stall-premium",
    sponsorId: "sponsor-event",
    fnbShare: true,
  },
];

/**
 * Fixture tier multiplier on the production spend. A grand final is the same
 * room type as a rivalry night but is not the same build.
 */
export interface EventTier {
  id: string;
  label: string;
  multiplier: number;
  note: string;
}

export const EVENT_TIERS: EventTier[] = [
  { id: "individual", label: "Individual", multiplier: 1, note: "Standard league fixture" },
  { id: "rivalry", label: "Rivalry", multiplier: 1.25, note: "Two fanbases, bigger build" },
  { id: "eliminator", label: "Eliminator", multiplier: 1.5, note: "Knockout night" },
  { id: "final", label: "Grand Final", multiplier: 3, note: "Broadcast centrepiece" },
];

/* ------------------------------------------------------------------ *
 * The event P&L
 * ------------------------------------------------------------------ */

export interface EventLine {
  label: string;
  amount: number;
  detail?: string;
  /** Assumption id behind a cost line, so the UI can edit it in place. */
  id?: string;
  /** The rate before the fixture-tier multiplier is applied. */
  rawRate?: number;
}

export interface EventInputs {
  presetId: string;
  tierId: string;
  capacity: number;
  ticketPrice: number;
  occupancyPct: number;
  stalls: number;
  /** How many bands share the night — the gate splits between them. */
  acts: number;
}

export interface EventPnL {
  preset: EventPreset;
  tier: EventTier;
  capacity: number;
  attendance: number;
  occupancyPct: number;
  acts: number;

  /* Gate */
  grossGate: number;
  ticketingCost: number;
  netGate: number;
  bandPool: number;
  bandPerAct: number;
  housePool: number;
  operatorGateShare: number;

  /* Ancillary — these sit outside the 40/30/30 and accrue to the operator */
  ancillaryLines: EventLine[];
  ancillaryTotal: number;

  /* The operator's view of the night */
  operatorRevenue: number;
  costLines: EventLine[];
  costTotal: number;
  contribution: number;
  contributionMarginPct: number;

  /** Paid admissions needed for the operator to break even on the night. */
  breakEvenAttendance: number;
  breakEvenOccupancyPct: number;
  /** True when the room is not big enough to break even even when sold out. */
  breakEvenUnreachable: boolean;
}

export function computeEventPnL(
  inputs: EventInputs,
  overrides: AssumptionOverrides = {},
): EventPnL {
  const preset = EVENT_PRESETS.find((p) => p.id === inputs.presetId) ?? EVENT_PRESETS[0];
  const tier = EVENT_TIERS.find((t) => t.id === inputs.tierId) ?? EVENT_TIERS[0];

  const capacity = Math.max(1, Math.round(inputs.capacity));
  const occupancyPct = Math.min(100, Math.max(0, inputs.occupancyPct));
  const attendance = Math.round(capacity * (occupancyPct / 100));
  const acts = Math.max(1, Math.round(inputs.acts));

  /* ---- gate ---- */
  const ticketingPct = rateOf("ticketing-fee", overrides);
  const grossGate = inputs.ticketPrice * attendance;
  const ticketingCost = Math.round(grossGate * (ticketingPct / 100));
  const netGate = grossGate - ticketingCost;

  const bandPool = Math.round(netGate * (EVENT_SPLIT.bands / 100));
  const housePool = Math.round(netGate * (EVENT_SPLIT.productionHouse / 100));
  const operatorGateShare = netGate - bandPool - housePool;

  /* ---- ancillary ---- */
  const stallRate = rateOf(preset.stallRateId, overrides);
  const stallRevenue = Math.round(stallRate * Math.max(0, inputs.stalls));

  const fnbPerHead = rateOf("fnb-spend", overrides);
  const fnbCommission = preset.fnbShare ? rateOf("fnb-commission", overrides) : 0;
  const fnbRevenue = Math.round(attendance * fnbPerHead * (fnbCommission / 100));

  const merchRevenue = Math.round(
    attendance *
      (rateOf("merch-conversion", overrides) / 100) *
      rateOf("merch-spend", overrides) *
      (rateOf("merch-commission", overrides) / 100),
  );

  const sponsorRevenue = preset.sponsorId ? Math.round(rateOf(preset.sponsorId, overrides)) : 0;

  const ancillaryLines: EventLine[] = [
    {
      label: "Stalls & Concourse",
      amount: stallRevenue,
      detail: `${inputs.stalls} × ${inr(stallRate)}`,
    },
    {
      label: "F&B Commission",
      amount: fnbRevenue,
      detail: preset.fnbShare
        ? `${fnbCommission}% of ${inr(fnbPerHead)}/head across ${attendance}`
        : "Flat-rental night — venue keeps F&B",
    },
    {
      label: "Merchandise Commission",
      amount: merchRevenue,
      detail: `${rateOf("merch-conversion", overrides)}% attach × ${inr(rateOf("merch-spend", overrides))}`,
    },
    {
      label: "Event Sponsor",
      amount: sponsorRevenue,
      detail: preset.sponsorId ? "Night-level brand partner" : "No sponsor attached to this format",
    },
  ];
  const ancillaryTotal = ancillaryLines.reduce((s, l) => s + l.amount, 0);

  /* ---- costs ---- */
  const costLines: EventLine[] = preset.costIds.map((id) => {
    const a = ASSUMPTION_INDEX[id];
    const raw = rateOf(id, overrides);
    const amount = Math.round(raw * tier.multiplier);
    return {
      id,
      rawRate: raw,
      label: a ? a.kpi : id,
      amount,
      detail:
        tier.multiplier === 1
          ? a?.note
          : `${inr(raw)} × ${tier.multiplier}× ${tier.label.toLowerCase()} tier`,
    };
  });
  const costTotal = costLines.reduce((s, l) => s + l.amount, 0);

  const operatorRevenue = operatorGateShare + ancillaryTotal;
  const contribution = operatorRevenue - costTotal;

  /* ---- break-even -----------------------------------------------------
   * Per admission the operator nets its gate share plus the per-head
   * ancillary lines. Fixed lines (stalls, sponsor) offset the cost base
   * before a single ticket is counted.
   */
  const operatorGatePerHead =
    inputs.ticketPrice * (1 - ticketingPct / 100) * (EVENT_SPLIT.operator / 100);
  const ancillaryPerHead =
    fnbPerHead * (fnbCommission / 100) +
    (rateOf("merch-conversion", overrides) / 100) *
      rateOf("merch-spend", overrides) *
      (rateOf("merch-commission", overrides) / 100);
  const perHead = operatorGatePerHead + ancillaryPerHead;
  const fixedOffset = stallRevenue + sponsorRevenue;
  const netFixed = costTotal - fixedOffset;

  const breakEvenAttendance = netFixed <= 0 ? 0 : perHead > 0 ? Math.ceil(netFixed / perHead) : Infinity;
  const breakEvenUnreachable = !Number.isFinite(breakEvenAttendance) || breakEvenAttendance > capacity;

  return {
    preset,
    tier,
    capacity,
    attendance,
    occupancyPct,
    acts,
    grossGate,
    ticketingCost,
    netGate,
    bandPool,
    bandPerAct: Math.round(bandPool / acts),
    housePool,
    operatorGateShare,
    ancillaryLines,
    ancillaryTotal,
    operatorRevenue,
    costLines,
    costTotal,
    contribution,
    contributionMarginPct: operatorRevenue > 0 ? (contribution / operatorRevenue) * 100 : 0,
    breakEvenAttendance: Number.isFinite(breakEvenAttendance) ? breakEvenAttendance : capacity,
    // NOT clamped to 100. A format that needs 119% of the room is a different
    // problem from one that needs exactly a sellout, and the page has to be
    // able to say so.
    breakEvenOccupancyPct: Number.isFinite(breakEvenAttendance)
      ? (breakEvenAttendance / capacity) * 100
      : 100,
    breakEvenUnreachable,
  };
}

export function defaultEventInputs(presetId = "cafe"): EventInputs {
  const p = EVENT_PRESETS.find((x) => x.id === presetId) ?? EVENT_PRESETS[0];
  return {
    presetId: p.id,
    tierId: "individual",
    capacity: p.capacity,
    ticketPrice: p.ticketPrice,
    occupancyPct: p.occupancyPct,
    stalls: p.stalls,
    acts: 1,
  };
}

/* ------------------------------------------------------------------ *
 * Sponsorship inventory
 *
 * Sponsorship is not one line on a pitch deck — it is a rate card with a
 * finite number of slots. Listing it as inventory is what lets an operator
 * see how much of the season is still unsold.
 * ------------------------------------------------------------------ */

export type SponsorTier = "title" | "associate" | "category" | "zone" | "fixture" | "campus";

export interface SponsorSlot {
  tier: SponsorTier;
  role: string;
  scope: string;
  /** Slots available across one season. */
  slots: number;
  /** Indicative season rate per slot. */
  rate: number;
}

export const SPONSOR_INVENTORY: SponsorSlot[] = [
  { tier: "title", role: "Title Partner", scope: "Season naming rights across every fixture, film and league asset.", slots: 1, rate: 2500000 },
  { tier: "associate", role: "Associate Partner", scope: "Presenting billing on the season and the finals package.", slots: 2, rate: 1000000 },
  { tier: "category", role: "Category Partner", scope: "Exclusive rights in one category — audio, beverage, fashion, fintech, mobility, telecom.", slots: 6, rate: 500000 },
  { tier: "zone", role: "Zone Partner", scope: "Naming rights for one regional hub's fixture block.", slots: 3, rate: 300000 },
  { tier: "fixture", role: "Fixture Partner", scope: "Single-night branding, stall presence and artist integration.", slots: 40, rate: 75000 },
  { tier: "campus", role: "Campus Partner", scope: "The full campus circuit — a student audience product distinct from the ticketed rooms.", slots: 2, rate: 600000 },
];

export const SPONSOR_TIER_META: Record<SponsorTier, { label: string; accent: string }> = {
  title: { label: "Season-wide", accent: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  associate: { label: "Season-wide", accent: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  category: { label: "Category", accent: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" },
  zone: { label: "Regional", accent: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  fixture: { label: "Per night", accent: "text-purple-300 border-purple-500/30 bg-purple-500/10" },
  campus: { label: "Campus", accent: "text-rose-300 border-rose-500/30 bg-rose-500/10" },
};

/** Full season rate card value if every slot sold at the indicative rate. */
export function sponsorInventoryValue(inventory: SponsorSlot[] = SPONSOR_INVENTORY): number {
  return inventory.reduce((s, i) => s + i.slots * i.rate, 0);
}

/* ------------------------------------------------------------------ *
 * Sponsor ROI — the sponsor's own view of the deal
 * ------------------------------------------------------------------ */

export interface SponsorRoiInputs {
  spend: number;
  fixturesSponsored: number;
  attendancePerFixture: number;
  /** Digital reach per fixture across league, house and artist channels. */
  digitalReachPerFixture: number;
  /** Share of reached users who engage — scan, click, enter, follow. */
  engagementRatePct: number;
  /** What comparable paid reach would have cost, per 1,000 impressions. */
  benchmarkCpm: number;
}

export interface SponsorRoi {
  inputs: SponsorRoiInputs;
  liveReach: number;
  digitalReach: number;
  totalImpressions: number;
  engagements: number;
  costPerEngagement: number;
  cpm: number;
  /** What the same impressions would have cost at the benchmark rate. */
  equivalentMediaValue: number;
  /** Media value delivered per rupee spent. */
  mediaMultiple: number;
}

/**
 * Anchored to a real slot on the rate card — one Category Partner at
 * ₹5L, present across roughly a third of the season's fixtures. Picking a
 * named deal rather than round numbers keeps the output interpretable.
 */
export const DEFAULT_SPONSOR_ROI: SponsorRoiInputs = {
  spend: 500000,
  fixturesSponsored: 60,
  attendancePerFixture: 280,
  digitalReachPerFixture: 45000,
  engagementRatePct: 4.2,
  benchmarkCpm: 180,
};

export function computeSponsorRoi(inputs: SponsorRoiInputs): SponsorRoi {
  const liveReach = inputs.fixturesSponsored * inputs.attendancePerFixture;
  const digitalReach = inputs.fixturesSponsored * inputs.digitalReachPerFixture;
  const totalImpressions = liveReach + digitalReach;
  const engagements = Math.round(totalImpressions * (inputs.engagementRatePct / 100));
  const equivalentMediaValue = Math.round((totalImpressions / 1000) * inputs.benchmarkCpm);
  return {
    inputs,
    liveReach,
    digitalReach,
    totalImpressions,
    engagements,
    costPerEngagement: engagements > 0 ? inputs.spend / engagements : 0,
    cpm: totalImpressions > 0 ? (inputs.spend / totalImpressions) * 1000 : 0,
    equivalentMediaValue,
    mediaMultiple: inputs.spend > 0 ? equivalentMediaValue / inputs.spend : 0,
  };
}

/* ------------------------------------------------------------------ *
 * Production house investment — the cost side of a franchise
 *
 * The league page shows what a house EARNS. Without what it SPENDS on artist
 * development, the return multiple is not a real number.
 * ------------------------------------------------------------------ */

export interface HouseInvestmentLine {
  id: string;
  label: string;
  /** Per band, per season. */
  perBand: number;
  detail: string;
}

/**
 * This is the BREAKDOWN OF THE CREATIVE ALLOCATION, not a second budget.
 *
 * It used to be a parallel per-band investment list that added up to a
 * different total than the regulated envelope, so the page showed a house
 * spending two different amounts on the same season. These lines now sum to
 * exactly the per-band creative allocation in `regulations.ts`, and everything
 * outside that allocation — acquisition, guarantees, marketing, mentor — is
 * counted once, in the envelope.
 */
export const HOUSE_INVESTMENT: HouseInvestmentLine[] = [
  { id: "song", label: "Music Production", perBand: 50000, detail: "Composer, producer, studio, session players, mixing and mastering." },
  { id: "video", label: "Music Video", perBand: 50000, detail: "Director, shoot, edit and grade for each release the band ships." },
  { id: "artwork", label: "Artwork & Distribution", perBand: 10000, detail: "Cover art, metadata, distributor fees and publishing registration." },
  { id: "content", label: "Photography & Content", perBand: 10000, detail: "Press shots, visual identity and release assets." },
  { id: "contingency", label: "Contingency", perBand: 5000, detail: "Held back within the band's own allocation — it never moves to another band." },
];

export const HOUSE_INVESTMENT_PER_BAND = HOUSE_INVESTMENT.reduce((s, l) => s + l.perBand, 0);

/**
 * Portfolio outcomes across a house's roster. The point a franchise investor
 * needs to see is that they are not betting on one band — they are holding
 * four positions, and the distribution is skewed.
 */
export interface PortfolioOutcome {
  label: string;
  share: number;
  returnMultiple: number;
  detail: string;
}

export const PORTFOLIO_OUTCOMES: PortfolioOutcome[] = [
  { label: "Breakout", share: 1, returnMultiple: 3.2, detail: "Catalogue travels beyond the league — sync, brand deals, booking value that outlives the season." },
  { label: "Solid", share: 1, returnMultiple: 1.4, detail: "Reliable gate, steady streaming, a fanbase worth touring into next season." },
  { label: "Developing", share: 1, returnMultiple: 0.7, detail: "Recovers most of its cost, holds option value into a second season." },
  { label: "Underperforms", share: 1, returnMultiple: 0.25, detail: "Does not find an audience. The position is written down, not the portfolio." },
];

export interface PortfolioResult {
  bands: number;
  investedPerBand: number;
  totalInvested: number;
  totalReturn: number;
  netProfit: number;
  roiPct: number;
  rows: { outcome: PortfolioOutcome; bands: number; invested: number; returned: number }[];
}

export function computePortfolio(
  bands: number,
  investedPerBand: number,
  outcomes: PortfolioOutcome[] = PORTFOLIO_OUTCOMES,
): PortfolioResult {
  const shareTotal = outcomes.reduce((s, o) => s + o.share, 0) || 1;
  const rows = outcomes.map((outcome) => {
    const n = (bands * outcome.share) / shareTotal;
    const invested = n * investedPerBand;
    return { outcome, bands: n, invested, returned: invested * outcome.returnMultiple };
  });
  const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
  const totalReturn = rows.reduce((s, r) => s + r.returned, 0);
  return {
    bands,
    investedPerBand,
    totalInvested,
    totalReturn,
    netProfit: totalReturn - totalInvested,
    roiPct: totalInvested > 0 ? ((totalReturn - totalInvested) / totalInvested) * 100 : 0,
    rows,
  };
}

/* ------------------------------------------------------------------ *
 * The Kalakshetra Artist Index
 *
 * The points table answers "who is winning". This answers a different and
 * commercially more useful question: "who is becoming valuable". It is a
 * secondary intelligence metric and has no bearing on qualification.
 * ------------------------------------------------------------------ */

export interface IndexPillar {
  id: string;
  label: string;
  weight: number;
  basis: string;
}

export const ARTIST_INDEX_PILLARS: IndexPillar[] = [
  { id: "live", label: "Live Performance", weight: 40, basis: "Jury scores and set consistency across the fixture calendar." },
  { id: "audience", label: "Audience Pull", weight: 20, basis: "Capacity fill, repeat attendance and gate revenue per night." },
  { id: "ip", label: "Music & IP", weight: 20, basis: "Originals shipped, streams, saves and playlist placement." },
  { id: "fan", label: "Fan Engagement", weight: 10, basis: "Verified votes, follower growth and content engagement rate." },
  { id: "commercial", label: "Commercial Value", weight: 10, basis: "Brand deals, booking rate and sponsorship interest." },
];

/** Weighted 0–100 index from per-pillar 0–100 scores. */
export function computeArtistIndex(scores: Record<string, number>): number {
  const total = ARTIST_INDEX_PILLARS.reduce((s, p) => s + p.weight, 0) || 1;
  const weighted = ARTIST_INDEX_PILLARS.reduce(
    (s, p) => s + (scores[p.id] ?? 0) * p.weight,
    0,
  );
  return weighted / total;
}
