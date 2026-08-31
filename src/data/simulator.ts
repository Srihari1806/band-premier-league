/**
 * The economics simulator.
 *
 * One set of assumptions, four levels of consequence:
 *
 *   ONE EVENT  →  ONE BAND  →  ONE PRODUCTION HOUSE  →  THE WHOLE LEAGUE
 *
 * Everything here is a pure function of `SimInputs`. Move a slider and every
 * level re-derives, which is the entire point — the question a reader actually
 * has is "if the room is half empty, do I lose money?", and that should be one
 * drag away rather than a spreadsheet exercise.
 *
 * The defaults are deliberately small. A 200-cap room at ₹299 is a café or a
 * pub, and the model is supposed to demonstrate that the league works on rooms
 * that already exist rather than on stadium economics. Nothing here is tuned to
 * produce a profit; several of these levels lose money at the base case, and
 * the page says so.
 *
 * This does NOT replace the detailed model in economics.ts — that still drives
 * the advanced view, the auction, rights and scaling. This is the front door.
 */

import { NATIONAL_TOTAL_BANDS, NATIONAL_TOTAL_HOUSES, ZONES } from "./league-format";
import {
  EVENT_SPLIT,
  CONTENT_SPLIT,
  SEASON_MIX,
  rollUpSeason,
  type EconomicsInputs,
} from "./economics";
import { COST_BUCKETS, amountAt } from "./league-capital";
import { ACTS_PER_BILL } from "./show-formats";

/* ------------------------------------------------------------------ *
 * Inputs
 * ------------------------------------------------------------------ */

export interface SimInputs {
  /* ---- the base commercial event ---- */
  venueCapacity: number;
  ticketPrice: number;
  occupancyPct: number;
  eventSponsor: number;
  stalls: number;
  stallPrice: number;
  eventCost: number;
  ticketingPct: number;

  /* ---- season shape, per band ---- */
  seasonWeeks: number;
  /** The operating rule: a zone activates one city a week. */
  citiesPerWeek: number;
  commercialShows: number;
  crossNights: number;
  houseNights: number;
  campusShows: number;
  festivals: number;
  corporateShows: number;
  celebrityShows: number;
  songs: number;

  /* ---- how the bigger rooms differ ---- */
  crossCapacityMult: number;
  houseCapacityMult: number;

  /* ---- campus ---- */
  campusSponsor: number;
  campusActivation: number;
  campusCost: number;

  /* ---- festival ---- */
  festivalSponsor: number;
  festivalActivation: number;
  festivalRegistrationValue: number;
  festivalCost: number;

  /* ---- celebrity / mentor night ---- */
  celebrityCapacity: number;
  celebrityTicketPrice: number;
  /** Share of the room sold as premium seats. */
  celebrityVipSharePct: number;
  celebrityVipPrice: number;
  celebritySponsor: number;
  /** Commission on third-party food and beverage inside the venue. */
  celebrityFnbPerHead: number;
  celebrityFnbCommissionPct: number;
  celebrityMerchPerHead: number;
  /**
   * Whether the guest fee comes off the gate BEFORE the 40/30/30 split.
   *
   * This is the difference between the promoter model and ours. A promoter
   * keeps the gate and pays the artist a fee; our operator pays every cost and
   * keeps 30%. On an ordinary night that is fine — the costs are small. On a
   * night carrying a guest fee it inverts the economics, and the operator
   * loses money on a show that made a profit.
   */
  celebrityFeeOffTheTop: boolean;
  celebrityFee: number;
  celebrityTravel: number;
  celebrityAccommodation: number;
  celebrityHospitality: number;
  celebritySecurity: number;
  celebrityProduction: number;
  celebrityMarketing: number;

  /* ---- what the house puts into one band ---- */
  bandAcquisition: number;
  musicPerSong: number;
  videoPerSong: number;
  bandTravel: number;

  /* ---- music income, per song ---- */
  youtubeViews: number;
  youtubeRpm: number;
  streamingPlays: number;
  streamingRate: number;

  /* ---- other artist income, per band per season ---- */
  artistSponsorship: number;
  bandMembers: number;

  /* ---- league level ---- */
  titleSponsor: number;
  associateSponsors: number;
  mediaRights: number;
  leagueLicensing: number;
  membershipPrice: number;
  membershipCount: number;
  prizePool: number;
  /** Central operating cost. Defaults to the ten-bucket midpoint. */
  centralOperatingCost: number;
}

/** The ten-bucket operating base, at its planning midpoint. */
export const CENTRAL_COST_DEFAULT = COST_BUCKETS.filter((b) => b.operating).reduce(
  (s, b) => s + amountAt(b, "mid"),
  0,
);

export const PRIZE_POOL_DEFAULT = COST_BUCKETS.filter((b) => !b.operating).reduce(
  (s, b) => s + amountAt(b, "mid"),
  0,
);

/**
 * The announced prize floor: what the league commits to before it knows what
 * it earned.
 *
 * Sized against the CONSERVATIVE season, not the base case, because a prize
 * pool is a promise that cannot be withdrawn. At ₹2.72Cr of revenue against a
 * ₹81.5L cost base, ₹75L still leaves the league solvent; ₹2Cr would put it
 * ₹9.58L under, and a league that cannot pay its announced prize has a much
 * bigger problem than a thin surplus.
 */
export const PRIZE_FLOOR = 7500000;

/** Prize money above the floor is a share of profit — see PRIZE_SHARE_OF_PROFIT. */
export const PRIZE_PROFIT_SHARE_PCT = 25;

/**
 * What the league actually pays: the greater of the announced floor or the
 * profit share. Costs nothing extra in a good season and is honest about the
 * source in a bad one.
 */
export function prizePayable(revenue: number, centralCost: number, floor = PRIZE_FLOOR): {
  floor: number;
  share: number;
  payable: number;
  drivenBy: "floor" | "share";
} {
  const profitBeforePrize = Math.max(0, revenue - centralCost);
  const share = Math.round((profitBeforePrize * PRIZE_PROFIT_SHARE_PCT) / 100);
  const payable = Math.max(floor, share);
  return { floor, share, payable, drivenBy: share > floor ? "share" : "floor" };
}

/**
 * Base case. Small rooms, modest sponsors, realistic costs.
 *
 * These are planning assumptions, not guarantees, and they are chosen to be
 * defensible rather than flattering.
 */
export const DEFAULT_SIM: SimInputs = {
  venueCapacity: 200,
  ticketPrice: 299,
  occupancyPct: 70,
  eventSponsor: 15000,
  stalls: 2,
  stallPrice: 3000,
  eventCost: 14000,
  ticketingPct: 5,

  // 24 weeks, one city a week. Friday and Sunday are the revenue engine and
  // Saturday is the ecosystem. 24 + 6 + 10 + 2 + 3 + 1 = 46 appearances.
  seasonWeeks: 24,
  citiesPerWeek: 1,
  commercialShows: 24,
  crossNights: 6,
  houseNights: 2,
  campusShows: 10,
  festivals: 3,
  corporateShows: 3,
  celebrityShows: 1,
  songs: 3,

  crossCapacityMult: 1.5,
  houseCapacityMult: 2,

  campusSponsor: 50000,
  campusActivation: 15000,
  campusCost: 25000,

  festivalSponsor: 150000,
  festivalActivation: 50000,
  festivalRegistrationValue: 25000,
  festivalCost: 90000,

  // A proper city celebrity night, priced on the promoter blueprint: a premium
  // tier alongside general admission, sponsorship covering ~40% of the cost
  // before a ticket sells, and F&B and merch as real revenue layers.
  celebrityCapacity: 1500,
  celebrityTicketPrice: 999,
  celebrityVipSharePct: 20,
  celebrityVipPrice: 2999,
  celebritySponsor: 800000,
  celebrityFnbPerHead: 250,
  celebrityFnbCommissionPct: 25,
  celebrityMerchPerHead: 90,
  celebrityFeeOffTheTop: true,
  celebrityFee: 500000,
  celebrityTravel: 150000,
  celebrityAccommodation: 60000,
  celebrityHospitality: 40000,
  celebritySecurity: 100000,
  celebrityProduction: 400000,
  celebrityMarketing: 250000,

  bandAcquisition: 200000,
  musicPerSong: 100000,
  videoPerSong: 100000,
  bandTravel: 150000,

  youtubeViews: 200000,
  youtubeRpm: 40,
  streamingPlays: 150000,
  streamingRate: 0.15,

  artistSponsorship: 100000,
  bandMembers: 5,

  titleSponsor: 5000000,
  associateSponsors: 2500000,
  mediaRights: 2500000,
  leagueLicensing: 800000,
  membershipPrice: 299,
  membershipCount: 500,
  prizePool: PRIZE_FLOOR,
  centralOperatingCost: CENTRAL_COST_DEFAULT,
};

/* ------------------------------------------------------------------ *
 * Verdict — the same four words everywhere
 * ------------------------------------------------------------------ */

export type Verdict = "loss" | "break-even" | "viable" | "strong";

export const VERDICT_META: Record<Verdict, { label: string; tone: string; dot: string }> = {
  loss: { label: "Loss", tone: "text-rose-300 border-rose-500/40 bg-rose-500/10", dot: "bg-rose-400" },
  "break-even": {
    label: "Break-even",
    tone: "text-amber-300 border-amber-500/40 bg-amber-500/10",
    dot: "bg-amber-400",
  },
  viable: {
    label: "Viable",
    tone: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  strong: {
    label: "Strong",
    tone: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
    dot: "bg-cyan-400",
  },
};

/**
 * Margin bands. Break-even is a window rather than a point, because a model
 * that calls +₹200 on ₹40,000 a "profit" is not telling anyone the truth.
 */
export function verdictFor(revenue: number, cost: number): Verdict {
  if (revenue <= 0 && cost <= 0) return "break-even";
  const margin = revenue === 0 ? -1 : (revenue - cost) / Math.abs(revenue);
  if (margin < -0.02) return "loss";
  if (margin <= 0.05) return "break-even";
  if (margin <= 0.25) return "viable";
  return "strong";
}

/* ------------------------------------------------------------------ *
 * One event
 * ------------------------------------------------------------------ */

export type EventType = "commercial" | "cross" | "house" | "campus" | "festival" | "celebrity";

export const EVENT_TYPES: { id: EventType; label: string; blurb: string; acts: number }[] = [
  { id: "commercial", label: "Commercial", blurb: "The workhorse night. A café, pub or club room the band carries alone.", acts: 1 },
  { id: "cross", label: "Cross Night", blurb: "Two bands from the same house, one stage, one gate.", acts: 2 },
  { id: "house", label: "House Night", blurb: "All four bands of a production house on one bill.", acts: 4 },
  { id: "campus", label: "Campus", blurb: "Sponsorship and audience acquisition, not gate margin.", acts: 1 },
  { id: "festival", label: "Festival", blurb: "Somebody else's crowd. Paid as a stage fee, not a gate.", acts: 1 },
  { id: "celebrity", label: "Celebrity / Mentor", blurb: "A guest headliner. Its own P&L, and its costs stay in it.", acts: 1 },
];

export interface EventResult {
  type: EventType;
  label: string;
  acts: number;
  /* gate */
  capacity: number;
  attendees: number;
  ticketPrice: number;
  grossGate: number;
  ticketingFee: number;
  netGate: number;
  bandPool: number;
  bandPerAct: number;
  housePool: number;
  operatorGatePool: number;
  /* everything that is not a ticket */
  ancillary: { label: string; amount: number }[];
  ancillaryTotal: number;
  /* the night as a whole */
  totalRevenue: number;
  cost: number;
  contribution: number;
  /** What the OPERATOR keeps: its gate share plus ancillary, less the cost. */
  operatorResult: number;
  verdict: Verdict;
  costLines: { label: string; amount: number }[];
  /**
   * Revenue per attendee — everything the night earns divided by heads in the
   * room, not just the ticket. Promoters plan on this rather than ticket price
   * because the ticket is only the access layer; the sponsor, the stalls, the
   * bar and the merch are what actually pay for the room.
   */
  revenuePerAttendee: number;
  /**
   * Share of the night's cost already covered by sponsorship before a single
   * ticket sells. Large-scale promoters target 40–50% here; below that the
   * night is a bet on the door.
   */
  sponsorshipCushionPct: number;
  /**
   * Contribution as a share of what the night took — the promoter's own
   * yardstick, on an all-in cost base. Every cost the night carries is inside
   * it, including any guest fee that was recovered off the gate rather than
   * paid out of the operator's share.
   */
  marginPct: number;
  /**
   * What the 40/30/30 actually runs on. The net gate everywhere except a
   * celebrity night, where the guest fee is recovered first.
   */
  splitBase?: number;
  /** Guest fee recovered off the gate before the split. Celebrity nights only. */
  feeOffTop?: number;
  /**
   * How the room was actually sold, where one ticket price does not describe
   * it. A celebrity night is tiered, so "1,050 in at 999" would be false for
   * a fifth of the room and would understate the gate.
   */
  gateNote?: string;
}

/**
 * The two numbers a promoter judges a night by, added to every event type.
 *
 * Ticket price tells you almost nothing on its own. Revenue per attendee and
 * the sponsorship cushion tell you whether the night stands up.
 */
function promoterMetrics(totalRevenue: number, attendees: number, sponsorish: number, cost: number) {
  return {
    revenuePerAttendee: attendees > 0 ? Math.round(totalRevenue / attendees) : 0,
    sponsorshipCushionPct: cost > 0 ? (sponsorish / cost) * 100 : 0,
    marginPct: totalRevenue > 0 ? ((totalRevenue - cost) / totalRevenue) * 100 : 0,
  };
}

function gateOf(capacity: number, price: number, occPct: number, ticketingPct: number) {
  const attendees = Math.round(capacity * (occPct / 100));
  const grossGate = Math.round(attendees * price);
  const ticketingFee = Math.round(grossGate * (ticketingPct / 100));
  return { attendees, grossGate, ticketingFee, netGate: grossGate - ticketingFee };
}

export function computeEvent(type: EventType, i: SimInputs): EventResult {
  const meta = EVENT_TYPES.find((e) => e.id === type) ?? EVENT_TYPES[0];
  const stallIncome = i.stalls * i.stallPrice;

  // ---- rooms that are simply bigger versions of the commercial night
  if (type === "commercial" || type === "cross" || type === "house") {
    const mult =
      type === "cross" ? i.crossCapacityMult : type === "house" ? i.houseCapacityMult : 1;
    const capacity = Math.round(i.venueCapacity * mult);
    const g = gateOf(capacity, i.ticketPrice, i.occupancyPct, i.ticketingPct);
    const bandPool = Math.round(g.netGate * (EVENT_SPLIT.bands / 100));
    const housePool = Math.round(g.netGate * (EVENT_SPLIT.productionHouse / 100));
    const operatorGatePool = g.netGate - bandPool - housePool;

    // A bigger room costs more to stage, but not proportionally — the room
    // hire and crew scale, the coordinator and the marketing largely do not.
    const cost = Math.round(i.eventCost * (1 + (mult - 1) * 0.7));
    const ancillary = [
      { label: "Event sponsor", amount: i.eventSponsor },
      { label: `Stalls (${i.stalls} × ${i.stallPrice})`, amount: stallIncome },
    ];
    const ancillaryTotal = ancillary.reduce((s, a) => s + a.amount, 0);
    const totalRevenue = g.netGate + ancillaryTotal;

    return {
      type,
      label: meta.label,
      acts: meta.acts,
      capacity,
      ...g,
      ticketPrice: i.ticketPrice,
      bandPool,
      bandPerAct: Math.round(bandPool / meta.acts),
      housePool,
      operatorGatePool,
      ancillary,
      ancillaryTotal,
      totalRevenue,
      cost,
      contribution: totalRevenue - cost,
      operatorResult: operatorGatePool + ancillaryTotal - cost,
      verdict: verdictFor(totalRevenue, cost),
      costLines: [{ label: "Event operating cost", amount: cost }],
      ...promoterMetrics(totalRevenue, g.attendees, i.eventSponsor, cost),
    };
  }

  // ---- campus: no gate assumption at all
  if (type === "campus") {
    const ancillary = [
      { label: "Campus sponsor", amount: i.campusSponsor },
      { label: "Brand activation", amount: i.campusActivation },
      { label: `Stalls (${i.stalls} × ${i.stallPrice})`, amount: stallIncome },
    ];
    const ancillaryTotal = ancillary.reduce((s, a) => s + a.amount, 0);
    return {
      type,
      label: meta.label,
      acts: 1,
      capacity: i.venueCapacity,
      attendees: 0,
      ticketPrice: 0,
      grossGate: 0,
      ticketingFee: 0,
      netGate: 0,
      bandPool: 0,
      bandPerAct: 0,
      housePool: 0,
      operatorGatePool: 0,
      ancillary,
      ancillaryTotal,
      totalRevenue: ancillaryTotal,
      cost: i.campusCost,
      contribution: ancillaryTotal - i.campusCost,
      operatorResult: ancillaryTotal - i.campusCost,
      verdict: verdictFor(ancillaryTotal, i.campusCost),
      costLines: [{ label: "Campus event cost", amount: i.campusCost }],
      ...promoterMetrics(ancillaryTotal, 0, i.campusSponsor + i.campusActivation, i.campusCost),
    };
  }

  // ---- festival: a stage fee and what the footfall is worth
  if (type === "festival") {
    const ancillary = [
      { label: "Festival sponsor", amount: i.festivalSponsor },
      { label: "Brand activation", amount: i.festivalActivation },
      { label: "Registrations / acquisition value", amount: i.festivalRegistrationValue },
      { label: `Stalls (${i.stalls} × ${i.stallPrice})`, amount: stallIncome },
    ];
    const ancillaryTotal = ancillary.reduce((s, a) => s + a.amount, 0);
    return {
      type,
      label: meta.label,
      acts: 1,
      capacity: 0,
      attendees: 0,
      ticketPrice: 0,
      grossGate: 0,
      ticketingFee: 0,
      netGate: 0,
      bandPool: 0,
      bandPerAct: 0,
      housePool: 0,
      operatorGatePool: 0,
      ancillary,
      ancillaryTotal,
      totalRevenue: ancillaryTotal,
      cost: i.festivalCost,
      contribution: ancillaryTotal - i.festivalCost,
      operatorResult: ancillaryTotal - i.festivalCost,
      verdict: verdictFor(ancillaryTotal, i.festivalCost),
      costLines: [{ label: "Festival stage cost", amount: i.festivalCost }],
      ...promoterMetrics(ancillaryTotal, 0, i.festivalSponsor + i.festivalActivation, i.festivalCost),
    };
  }

  // ---- celebrity: separate P&L, and the fee stays inside it
  /*
   * A celebrity night, built on the promoter revenue architecture rather than
   * on one ticket price.
   *
   * The blueprint that framework comes from layers a stadium show as general
   * admission, a premium tier, sponsorship taken before the on-sale, and a cut
   * of food and merch. Scaled to a 1,500-cap city room the same layers apply,
   * and the layering is the reason the night carries a guest fee at all.
   */
  const celAttendees = Math.round(i.celebrityCapacity * (i.occupancyPct / 100));
  const vipSeats = Math.round(celAttendees * (i.celebrityVipSharePct / 100));
  const generalSeats = celAttendees - vipSeats;
  const grossGate = Math.round(generalSeats * i.celebrityTicketPrice + vipSeats * i.celebrityVipPrice);
  const ticketingFee = Math.round(grossGate * (i.ticketingPct / 100));
  const netGateRaw = grossGate - ticketingFee;

  /*
   * The guest fee comes off the top.
   *
   * Split the gate first and the operator pays a five-lakh fee out of a 30%
   * share — it loses money on a night that made a profit, which is exactly
   * what the promoter model avoids by keeping the gate and paying a fee. Taken
   * off the top, everybody splits what the night actually cleared.
   *
   * It changes WHAT IS SPLIT, not what the night cost. The fee stays a cost
   * line at its full value and `splitBase` is what the 40/30/30 runs on —
   * netting it out of revenue instead reports a margin on money the night
   * never kept, and leaves the same card carrying two different cost bases.
   */
  const feeOffTop = i.celebrityFeeOffTheTop ? Math.min(netGateRaw, i.celebrityFee) : 0;
  const splitBase = netGateRaw - feeOffTop;

  const bandPool = Math.round(splitBase * (EVENT_SPLIT.bands / 100));
  const housePool = Math.round(splitBase * (EVENT_SPLIT.productionHouse / 100));
  const operatorGatePool = splitBase - bandPool - housePool;

  const fnb = Math.round(
    celAttendees * i.celebrityFnbPerHead * (i.celebrityFnbCommissionPct / 100),
  );
  const merch = Math.round(celAttendees * i.celebrityMerchPerHead);
  const ancillary = [
    { label: "Event sponsor", amount: i.celebritySponsor },
    { label: `F&B commission (${i.celebrityFnbCommissionPct}% of ${inrLocal(i.celebrityFnbPerHead)}/head)`, amount: fnb },
    { label: "Merchandise", amount: merch },
    { label: `Stalls (${i.stalls} × ${i.stallPrice})`, amount: stallIncome },
  ];
  const ancillaryTotal = ancillary.reduce((s, a) => s + a.amount, 0);

  const costLines = [
    {
      label: i.celebrityFeeOffTheTop ? "Celebrity fee (recovered off the gate)" : "Celebrity fee",
      amount: i.celebrityFee,
    },
    { label: "Travel", amount: i.celebrityTravel },
    { label: "Accommodation", amount: i.celebrityAccommodation },
    { label: "Hospitality", amount: i.celebrityHospitality },
    { label: "Security", amount: i.celebritySecurity },
    { label: "Additional production", amount: i.celebrityProduction },
    { label: "Marketing", amount: i.celebrityMarketing },
  ];
  const cost = costLines.reduce((s, c) => s + c.amount, 0);
  const g = {
    attendees: celAttendees,
    grossGate,
    ticketingFee,
    netGate: netGateRaw,
  };
  const totalRevenue = g.netGate + ancillaryTotal;

  return {
    type: "celebrity",
    label: meta.label,
    acts: 1,
    capacity: i.celebrityCapacity,
    ...g,
    ticketPrice: i.celebrityTicketPrice,
    bandPool,
    bandPerAct: bandPool,
    housePool,
    operatorGatePool,
    ancillary,
    ancillaryTotal,
    totalRevenue,
    cost,
    contribution: totalRevenue - cost,
    /*
     * The operator does not pay the fee twice. Whatever came off the gate has
     * already left the pool it takes its 30% of, so only the balance of the
     * cost stack lands on the operator.
     */
    operatorResult: operatorGatePool + ancillaryTotal - (cost - feeOffTop),
    verdict: verdictFor(totalRevenue, cost),
    costLines,
    splitBase,
    feeOffTop,
    gateNote: `${generalSeats.toLocaleString("en-IN")} at ${inrLocal(
      i.celebrityTicketPrice,
    )} + ${vipSeats.toLocaleString("en-IN")} premium at ${inrLocal(i.celebrityVipPrice)}`,
    ...promoterMetrics(totalRevenue, g.attendees, i.celebritySponsor, cost),
  };
}

/* ------------------------------------------------------------------ *
 * Break-even — the three questions worth asking about a room
 * ------------------------------------------------------------------ */

export interface BreakEven {
  /** Occupancy at which a commercial night covers its cost. */
  occupancyPct: number;
  occupancyReachable: boolean;
  /**
   * The same number with the sponsor removed.
   *
   * At the base case the sponsor alone more than covers the room, so break-even
   * occupancy is zero — true, and useless as a planning figure. The question
   * worth answering is what happens when the sponsor does not land, and that is
   * this number.
   */
  occupancyNoSponsorPct: number;
  noSponsorReachable: boolean;
  /** Ticket price that covers cost at the current occupancy. */
  ticketPrice: number;
  /** Sponsor needed to cover the gap at the current price and occupancy. */
  sponsor: number;
  /** True when the night is already covered before a single ticket is sold. */
  coveredBySponsor: boolean;
  /** Occupancy ladder, so the reader can see where the cliff is. */
  ladder: { occPct: number; contribution: number; operatorResult: number; verdict: Verdict }[];
}

export function breakEven(i: SimInputs): BreakEven {
  const stallIncome = i.stalls * i.stallPrice;
  const nonGate = i.eventSponsor + stallIncome;
  const perHeadNet = i.ticketPrice * (1 - i.ticketingPct / 100);

  // Attendees needed so netGate + nonGate = cost
  const needed = Math.max(0, i.eventCost - nonGate) / Math.max(1, perHeadNet);
  const occ = (needed / Math.max(1, i.venueCapacity)) * 100;

  const attendeesNow = Math.round(i.venueCapacity * (i.occupancyPct / 100));
  const priceNeeded =
    attendeesNow === 0
      ? 0
      : Math.max(0, i.eventCost - nonGate) / (attendeesNow * (1 - i.ticketingPct / 100));

  const netGateNow = Math.round(attendeesNow * perHeadNet);
  const sponsorNeeded = Math.max(0, i.eventCost - netGateNow - stallIncome);

  const ladder = [30, 40, 50, 60, 70, 80, 90, 100].map((occPct) => {
    const r = computeEvent("commercial", { ...i, occupancyPct: occPct });
    return {
      occPct,
      contribution: r.contribution,
      operatorResult: r.operatorResult,
      verdict: verdictFor(r.operatorGatePool + r.ancillaryTotal, r.cost),
    };
  });

  // The same sum with the sponsor taken away.
  const neededNoSponsor = Math.max(0, i.eventCost - stallIncome) / Math.max(1, perHeadNet);
  const occNoSponsor = (neededNoSponsor / Math.max(1, i.venueCapacity)) * 100;

  return {
    occupancyPct: occ,
    occupancyReachable: occ <= 100,
    occupancyNoSponsorPct: occNoSponsor,
    noSponsorReachable: occNoSponsor <= 100,
    ticketPrice: Math.round(priceNeeded),
    sponsor: Math.round(sponsorNeeded),
    coveredBySponsor: occ <= 0,
    ladder,
  };
}

/* ------------------------------------------------------------------ *
 * One band, one season
 * ------------------------------------------------------------------ */

/**
 * Bands sharing one bill, by format.
 *
 * Re-exported, not restated. This module prices the nights and
 * `national-season.ts` dates them; when each kept its own copy of the table
 * they drifted, and /economics published 5 celebrity nights against the
 * schedule's 100. `ACTS_PER_BILL` in show-formats.ts is the only owner.
 */
export const ACTS_ON_BILL = ACTS_PER_BILL;

export interface BandResult {
  touchpoints: { label: string; count: number; acts: number; events: number }[];
  totalTouchpoints: number;
  /** Physical events those appearances resolve into, for one band's share. */
  physicalEvents: number;
  songs: number;

  /* what the house put in */
  investment: { label: string; amount: number }[];
  investmentTotal: number;

  /* what the band earns */
  liveEarnings: number;
  musicEarnings: number;
  sponsorOther: number;
  totalEarnings: number;
  perMember: number;
  revenue: { label: string; amount: number; note: string }[];

  /* what the HOUSE earns from this one band */
  houseLiveShare: number;
  houseMusicShare: number;
  houseFromBand: number;
  houseRoiPct: number;
  verdict: Verdict;
}

/** Revenue one song generates, before any split. */
export function songRevenue(i: SimInputs): number {
  const youtube = (i.youtubeViews / 1000) * i.youtubeRpm;
  const streaming = i.streamingPlays * i.streamingRate;
  return Math.round(youtube + streaming);
}

/**
 * The simulator's inputs, expressed as the shared engine's inputs.
 *
 * Both views used to carry their own arithmetic and disagreed by roughly a
 * factor of two on gate, league revenue and what a house gets back. There is
 * one engine now; this is the adapter onto it.
 */
export function asEconomicsInputs(i: SimInputs, bands: number, bandsPerHouse: number): EconomicsInputs {
  return {
    ticketPrice: i.ticketPrice,
    attendance: Math.round(i.venueCapacity * (i.occupancyPct / 100)),
    ticketingCommissionPct: i.ticketingPct,
    numFranchises: Math.max(1, Math.round(bands / Math.max(1, bandsPerHouse))),
    bandsPerFranchise: bandsPerHouse,
  } as EconomicsInputs;
}

/** The season mix, with the simulator's editable counts folded in. */
export function simSeasonMix(i: SimInputs) {
  const byId: Record<string, number> = {
    commercial: i.commercialShows,
    cross: i.crossNights,
    campus: i.campusShows,
    house: i.houseNights,
    festival: i.festivals,
    corporate: i.corporateShows,
    celebrity: i.celebrityShows,
  };
  return SEASON_MIX.map((m) => ({ ...m, perBand: byId[m.id] ?? m.perBand }));
}

export function computeBand(i: SimInputs): BandResult {
  const commercial = computeEvent("commercial", i);
  const cross = computeEvent("cross", i);
  const house = computeEvent("house", i);
  const campus = computeEvent("campus", i);
  const festival = computeEvent("festival", i);
  const celebrity = computeEvent("celebrity", i);

  // Read off the shared season mix rather than restated — this list had
  // already fallen behind by one format, reporting 46 appearances against a
  // season of 49.
  const touchpoints = simSeasonMix(i).map((m) => ({
    label: m.label,
    count: m.perBand,
    acts: m.actsOnBill,
    events: m.perBand / Math.max(1, m.actsOnBill),
  }));
  const totalTouchpoints = touchpoints.reduce((s, t) => s + t.count, 0);
  const physicalEvents = touchpoints.reduce((s, t) => s + t.events, 0);

  /*
   * Live income comes from the shared season engine.
   *
   * It used to be summed here from the per-event P&Ls, which is a second way
   * of computing the same thing — and the two answers were 8.27L and 11.40L
   * for the same band. The per-event figures still drive the event selector;
   * the season total is computed once, in economics.ts.
   */
  const cfgBands = 100;
  const shared = rollUpSeason(asEconomicsInputs(i, cfgBands, 4), simSeasonMix(i));
  const liveEarnings = shared.bandLiveSeason;

  // ---- music: 50/50 with the house
  const catalogueRevenue = songRevenue(i) * i.songs;
  const musicEarnings = Math.round(catalogueRevenue * (CONTENT_SPLIT.artists / 100));
  const houseMusicShare = catalogueRevenue - musicEarnings;

  // ---- campus and festival carry no gate for the band; they are the house's
  // and the operator's line. The band's income from them is its sponsorship.
  const sponsorOther = i.artistSponsorship;

  const totalEarnings = liveEarnings + musicEarnings + sponsorOther;

  const investment = [
    { label: "Band acquisition", amount: i.bandAcquisition },
    { label: `Music (${i.songs} × ${i.musicPerSong})`, amount: i.musicPerSong * i.songs },
    { label: `Video (${i.songs} × ${i.videoPerSong})`, amount: i.videoPerSong * i.songs },
    { label: "Travel & logistics", amount: i.bandTravel },
  ];
  const investmentTotal = investment.reduce((s, x) => s + x.amount, 0);

  const houseLiveShare =
    commercial.housePool * i.commercialShows +
    Math.round(cross.housePool / cross.acts) * i.crossNights +
    Math.round(house.housePool / house.acts) * i.houseNights +
    celebrity.housePool * i.celebrityShows;

  const houseFromBand = houseLiveShare + houseMusicShare;

  return {
    touchpoints,
    totalTouchpoints,
    physicalEvents,
    songs: i.songs,
    investment,
    investmentTotal,
    liveEarnings,
    musicEarnings,
    sponsorOther,
    totalEarnings,
    perMember: Math.round(totalEarnings / Math.max(1, i.bandMembers)),
    revenue: [
      { label: "Live performance", amount: liveEarnings, note: `${EVENT_SPLIT.bands}% of net gate across ${i.commercialShows + i.crossNights + i.houseNights + i.celebrityShows} ticketed nights` },
      { label: "Music & streaming", amount: musicEarnings, note: `${CONTENT_SPLIT.artists}% of ${i.songs} originals` },
      { label: "Artist sponsorship", amount: sponsorOther, note: "Band-specific deals, outside the league splits" },
    ],
    houseLiveShare,
    houseMusicShare,
    houseFromBand,
    houseRoiPct: investmentTotal === 0 ? 0 : ((houseFromBand - investmentTotal) / investmentTotal) * 100,
    verdict: verdictFor(houseFromBand, investmentTotal),
  };
}

/* ------------------------------------------------------------------ *
 * One production house — four bands, and they are not identical
 * ------------------------------------------------------------------ */

/**
 * Performance spread across a roster.
 *
 * Four identical bands is the one thing a portfolio never is. These multipliers
 * are applied to the audience each band draws, which is the honest lever: a
 * band that sells out is worth more than one playing to a third-full room, and
 * the point of a four-band roster is that one of them can carry the others.
 */
export const ROSTER_SPREAD = [1.45, 1.0, 0.8, 0.55];

export interface HouseBandRow {
  band: number;
  drawMult: number;
  investment: number;
  revenue: number;
  profit: number;
  roiPct: number;
  verdict: Verdict;
}

export interface HouseResult {
  bands: HouseBandRow[];
  investment: { label: string; amount: number }[];
  investmentTotal: number;
  revenue: { label: string; amount: number }[];
  revenueTotal: number;
  profit: number;
  roiPct: number;
  verdict: Verdict;
  bandsPerHouse: number;
}

export function computeHouse(i: SimInputs, bandsPerHouse = 4): HouseResult {
  const rows: HouseBandRow[] = [];
  let liveTotal = 0;
  let musicTotal = 0;

  for (let b = 0; b < bandsPerHouse; b += 1) {
    const drawMult = ROSTER_SPREAD[b % ROSTER_SPREAD.length];
    const scaled: SimInputs = {
      ...i,
      occupancyPct: Math.min(100, i.occupancyPct * drawMult),
      youtubeViews: Math.round(i.youtubeViews * drawMult),
      streamingPlays: Math.round(i.streamingPlays * drawMult),
    };
    const band = computeBand(scaled);
    liveTotal += band.houseLiveShare;
    musicTotal += band.houseMusicShare;
    rows.push({
      band: b + 1,
      drawMult,
      investment: band.investmentTotal,
      revenue: band.houseFromBand,
      profit: band.houseFromBand - band.investmentTotal,
      roiPct: band.houseRoiPct,
      verdict: band.verdict,
    });
  }

  const investment = [
    { label: `Band acquisition (${bandsPerHouse} × ${i.bandAcquisition})`, amount: i.bandAcquisition * bandsPerHouse },
    {
      label: `Music & video (${bandsPerHouse} × ${i.songs} songs)`,
      amount: (i.musicPerSong + i.videoPerSong) * i.songs * bandsPerHouse,
    },
    { label: `Travel & logistics (${bandsPerHouse} × ${i.bandTravel})`, amount: i.bandTravel * bandsPerHouse },
  ];
  const investmentTotal = investment.reduce((s, x) => s + x.amount, 0);

  const revenue = [
    { label: `Live share (${EVENT_SPLIT.productionHouse}% of net gate)`, amount: liveTotal },
    { label: `Music & IP (${CONTENT_SPLIT.productionHouse}% of catalogue)`, amount: musicTotal },
  ];
  const revenueTotal = revenue.reduce((s, x) => s + x.amount, 0);

  return {
    bands: rows,
    investment,
    investmentTotal,
    revenue,
    revenueTotal,
    profit: revenueTotal - investmentTotal,
    roiPct: investmentTotal === 0 ? 0 : ((revenueTotal - investmentTotal) / investmentTotal) * 100,
    verdict: verdictFor(revenueTotal, investmentTotal),
    bandsPerHouse,
  };
}

/* ------------------------------------------------------------------ *
 * The whole league
 * ------------------------------------------------------------------ */

export interface LeagueConfig {
  zones: number;
  houses: number;
  bandsPerHouse: number;
  bands: number;
}

/** Read the live league configuration rather than hardcoding a roster. */
export function leagueConfig(): LeagueConfig {
  const states = ZONES.filter((z) => z.tier === "state");
  const bandsPerHouse = states[0]?.bandsPerHouse ?? 4;
  return {
    zones: states.length,
    houses: NATIONAL_TOTAL_HOUSES,
    bandsPerHouse,
    bands: NATIONAL_TOTAL_BANDS,
  };
}

export interface LeagueResult {
  config: LeagueConfig;
  nights: { label: string; count: number; appearances: number; perNight: number; total: number }[];
  nightsTotal: number;
  /** Physical events the league actually stages. */
  physicalEvents: number;
  /** Band appearances across those events. Always the larger number. */
  appearances: number;
  revenue: { label: string; amount: number; group: "live" | "league" | "member" }[];
  revenueTotal: number;
  membershipRevenue: number;
  centralCost: number;
  prizePool: number;
  /** The announced commitment. */
  prizeFloor: number;
  /** 25% of profit before prize. */
  prizeShare: number;
  prizeDrivenBy: "floor" | "share";
  operatingSurplus: number;
  marginPct: number;
  verdict: Verdict;
}

export function computeLeague(i: SimInputs, cfg = leagueConfig()): LeagueResult {
  const bands = cfg.bands;
  const houses = cfg.houses;

  const commercial = computeEvent("commercial", i);
  const cross = computeEvent("cross", i);
  const house = computeEvent("house", i);
  const campus = computeEvent("campus", i);
  const festival = computeEvent("festival", i);
  const celebrity = computeEvent("celebrity", i);

  // Nights, not appearances — a cross night is one stage for two bands, a
  // house night one stage for the whole roster, a festival day one bill.
  // A celebrity night is the exception that is NOT shared: one band, one
  // guest, one night, so 100 appearances are 100 nights.
  const nightCounts = [
    { label: "Commercial", app: bands * i.commercialShows, acts: ACTS_ON_BILL.commercial, ev: commercial },
    { label: "Cross nights", app: bands * i.crossNights, acts: ACTS_ON_BILL.cross, ev: cross },
    { label: "Campus", app: bands * i.campusShows, acts: ACTS_ON_BILL.campus, ev: campus },
    { label: "House nights", app: houses * i.houseNights * cfg.bandsPerHouse, acts: ACTS_ON_BILL.house, ev: house },
    { label: "Festivals", app: bands * i.festivals, acts: ACTS_ON_BILL.festival, ev: festival },
    { label: "Celebrity nights", app: bands * i.celebrityShows, acts: ACTS_ON_BILL.celebrity, ev: celebrity },
  ].map((n) => ({ ...n, count: Math.round(n.app / n.acts) }));

  const nights = nightCounts.map((n) => ({
    label: n.label,
    count: n.count,
    appearances: n.app,
    perNight: n.ev.operatorResult,
    total: n.ev.operatorResult * n.count,
  }));
  const nightsTotal = nights.reduce((s, n) => s + n.total, 0);
  const liveEventIncome = nights.reduce((s, n) => s + n.total, 0);

  const membershipRevenue = i.membershipPrice * i.membershipCount;

  const revenue: LeagueResult["revenue"] = [
    { label: "Live event share (operator, net of event costs)", amount: liveEventIncome, group: "live" },
    { label: "League title sponsor", amount: i.titleSponsor, group: "league" },
    { label: "Associate sponsors", amount: i.associateSponsors, group: "league" },
    { label: "Media & broadcast rights", amount: i.mediaRights, group: "league" },
    { label: "League licensing", amount: i.leagueLicensing, group: "league" },
    { label: `Membership (${i.membershipCount.toLocaleString("en-IN")} × ${i.membershipPrice})`, amount: membershipRevenue, group: "member" },
  ];
  const revenueTotal = revenue.reduce((s, r) => s + r.amount, 0);
  // The greater of the announced floor and the profit share, not whichever
  // number happens to be in the input.
  const prize = prizePayable(revenueTotal, i.centralOperatingCost, i.prizePool);
  const totalCost = i.centralOperatingCost + prize.payable;

  return {
    config: cfg,
    nights,
    nightsTotal,
    physicalEvents: nights.reduce((s, n) => s + n.count, 0),
    appearances: nights.reduce((s, n) => s + n.appearances, 0),
    revenue,
    revenueTotal,
    membershipRevenue,
    centralCost: i.centralOperatingCost,
    prizePool: prize.payable,
    prizeFloor: prize.floor,
    prizeShare: prize.share,
    prizeDrivenBy: prize.drivenBy,
    operatingSurplus: revenueTotal - totalCost,
    marginPct: revenueTotal === 0 ? 0 : ((revenueTotal - totalCost) / revenueTotal) * 100,
    verdict: verdictFor(revenueTotal, totalCost),
  };
}

/* ------------------------------------------------------------------ *
 * What the model is really betting on
 * ------------------------------------------------------------------ */

export interface Finding {
  id: string;
  severity: "warn" | "note";
  headline: string;
  detail: string;
}

/**
 * The load-bearing assumptions, surfaced rather than buried.
 *
 * A simulator that only ever shows a surplus is a brochure. These are computed
 * from the current inputs, so they appear when they are true and disappear when
 * the user moves a slider that fixes them.
 */
export function findings(i: SimInputs, cfg = leagueConfig()): Finding[] {
  const out: Finding[] = [];
  const celeb = computeEvent("celebrity", i);
  const campus = computeEvent("campus", i);
  const be = breakEven(i);

  if (celeb.operatorResult < 0) {
    out.push({
      id: "celebrity-split",
      severity: "warn",
      headline: "The operator pays the whole guest fee but takes 30% of the gate",
      detail: `A celebrity night costs ${inrLocal(celeb.cost)} to stage and the band and house take ${
        100 - EVENT_SPLIT.operator
      }% of the net gate before the operator sees any of it — so the operator is ${inrLocal(
        Math.abs(celeb.operatorResult),
      )} down on every one. The fix is the "fee off the top" switch — recover the guest fee from the gate before the 40/30/30, the way a promoter keeps the gate and pays the artist a fee. Across ${
        Math.round((cfg.bands * i.celebrityShows) / ACTS_ON_BILL.celebrity)
      } of them that is the difference between a surplus and a hole.`,
    });
  }

  /*
   * One per band means 100 of them, and 100 is a different proposition to 15.
   *
   * This is now the largest single line in the league view, and it rests on two
   * things the model cannot conjure: a sponsor for every night and a guest
   * artist for every night. Both are per-night deals, not one contract.
   */
  const celebNights = Math.round((cfg.bands * i.celebrityShows) / ACTS_ON_BILL.celebrity);
  const celebSponsorTotal = i.celebritySponsor * celebNights;
  if (celebNights > 0 && celebSponsorTotal > 10000000) {
    out.push({
      id: "celebrity-scale",
      severity: "warn",
      headline: `${celebNights} celebrity nights need ${inrLocal(celebSponsorTotal)} of sponsorship and ${celebNights} guest artists`,
      detail: `One celebrity night per band is ${celebNights} nights nationally, each modelled with a ${inrLocal(
        i.celebritySponsor,
      )} sponsor covering ${celeb.sponsorshipCushionPct.toFixed(
        0,
      )}% of its cost and a ${inrLocal(
        i.celebrityFee,
      )} guest fee. They contribute ${inrLocal(
        celeb.operatorResult * celebNights,
      )} to the operator — the largest line in the league view — and every rupee of it is ${celebNights} separate bookings and ${celebNights} separate sponsor conversations. Booking availability, not money, is the binding constraint here.`,
    });
  }

  const campusSponsorTotal = i.campusSponsor * cfg.bands * i.campusShows;
  if (campusSponsorTotal > 10000000) {
    out.push({
      id: "campus-sponsorship",
      severity: "warn",
      headline: `${inrLocal(campusSponsorTotal)} of campus sponsorship has to be sold`,
      detail: `Every one of the ${
        cfg.bands * i.campusShows
      } campus nights is modelled with a ${inrLocal(
        i.campusSponsor,
      )} sponsor behind it. ${
        campusSponsorTotal >= celebSponsorTotal
          ? "That is the single largest assumption in the league view"
          : `That sits behind the ${inrLocal(celebSponsorTotal)} of celebrity sponsorship as the second largest assumption in the league view`
      }, and it is ${cfg.bands * i.campusShows} separate conversations, not one deal.`,
    });
  }

  if (be.coveredBySponsor) {
    out.push({
      id: "sponsor-covers-room",
      severity: "note",
      headline: "The sponsor covers the room before a ticket is sold",
      detail: `At ${inrLocal(i.eventSponsor)} sponsor and ${inrLocal(
        i.stalls * i.stallPrice,
      )} of stalls against a ${inrLocal(
        i.eventCost,
      )} cost, break-even occupancy is zero. Without the sponsor it is ${be.occupancyNoSponsorPct.toFixed(
        0,
      )}% — which is the number worth planning against.`,
    });
  }

  const houseResult = computeHouse(i);
  if (houseResult.profit < 0) {
    out.push({
      id: "house-loss",
      severity: "warn",
      headline: "A production house does not recover its investment in one season",
      detail: `${inrLocal(houseResult.investmentTotal)} in, ${inrLocal(
        houseResult.revenueTotal,
      )} back. The house is buying a catalogue it half-owns beyond this season and a roster it can sell on, so a single-season ROI is not the whole case — but at these assumptions the first season does not pay for itself.`,
    });
  }

  return out;
}

/** Local compact formatter, so this module does not depend on the page. */
function inrLocal(v: number): string {
  const a = Math.abs(v);
  if (a >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (a >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (a >= 1000) return `₹${Math.round(v).toLocaleString("en-IN")}`;
  return `₹${Math.round(v)}`;
}

/* ------------------------------------------------------------------ *
 * Scenario presets
 * ------------------------------------------------------------------ */

export type PresetId = "conservative" | "base" | "strong";

export const PRESETS: { id: PresetId; label: string; note: string; patch: Partial<SimInputs> }[] = [
  {
    id: "conservative",
    label: "Conservative",
    note: "Half-full rooms, cheaper tickets, sponsors who have not signed yet, and streaming that never takes off.",
    patch: {
      occupancyPct: 50,
      ticketPrice: 249,
      eventSponsor: 7500,
      campusSponsor: 25000,
      festivalSponsor: 75000,
      youtubeViews: 75000,
      streamingPlays: 50000,
      artistSponsorship: 40000,
      titleSponsor: 2500000,
      associateSponsors: 1000000,
      mediaRights: 750000,
      leagueLicensing: 300000,
      membershipCount: 250,
    },
  },
  { id: "base", label: "Base Case", note: "The default planning assumptions. Small rooms, modest sponsors, realistic costs.", patch: {} },
  {
    id: "strong",
    label: "Strong",
    note: "Rooms mostly full, a ticket the market bears, sponsors renewed, and a catalogue that travels. Not a fantasy — a good season.",
    patch: {
      occupancyPct: 85,
      ticketPrice: 399,
      eventSponsor: 30000,
      campusSponsor: 85000,
      festivalSponsor: 250000,
      youtubeViews: 500000,
      streamingPlays: 400000,
      artistSponsorship: 250000,
      titleSponsor: 9000000,
      associateSponsors: 4500000,
      mediaRights: 5000000,
      leagueLicensing: 1500000,
      membershipCount: 3000,
    },
  },
];

export function applyPreset(id: PresetId): SimInputs {
  const p = PRESETS.find((x) => x.id === id);
  return { ...DEFAULT_SIM, ...(p ? p.patch : {}) };
}
