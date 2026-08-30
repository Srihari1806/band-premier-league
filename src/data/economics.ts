/**
 * Economics engine for the investor-facing breakdown.
 *
 * These are illustrative projections at the inputs stated below, not audited
 * results. Structure and splits follow the league operating plan and the
 * League page; the money figures are a worked demo scenario.
 *
 * NOTHING here is a hardcoded output. `computeEconomics(inputs)` is a pure
 * function: every figure the page renders — per show, per band, per franchise,
 * per season, league-wide — derives from one `EconomicsInputs` object. Move an
 * input in an investor meeting and the whole page re-derives, so the totals can
 * never drift out of agreement with each other.
 *
 * The one structural subtlety worth reading before editing: a "versus" fixture
 * is ONE ticketed night shared by competing acts. The gate is split between
 * them, so a shared night pays each band less than a solo night — but it pulls
 * both fanbases into the room, so the room is bigger. Both effects are modelled
 * via `soloSharePct` and `coHeadlineUplift`.
 */

import { SEASON_WEEKS, SEASONS_PER_YEAR, RELEASES_PER_BAND } from "./league-format";
import { FORMAT_MIX } from "./show-formats";
import { costOperations, SEASON_1_SCALE } from "./league-capital";
import { SPEND_CAPS } from "./regulations";

/**
 * Indian-format rupee string, e.g. 805950 -> "₹8,05,950".
 *
 * The sign goes OUTSIDE the symbol. "−₹17,598" is a negative amount of
 * money; "₹-17,598" is a typo, and this model produces negative numbers
 * often enough (a loss-making fixture) for that to matter.
 */
export function inr(value: number): string {
  const rounded = Math.round(value);
  const body = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(rounded),
  );
  return (rounded < 0 ? "−₹" : "₹") + body;
}

/** Compact rupee string for headline tiles, e.g. 3215750 -> "₹32.16L". */
export function inrCompact(value: number): string {
  const sign = value < 0 ? "−₹" : "₹";
  const abs = Math.abs(value);
  if (abs < 1000) return inr(value);

  /*
   * Pick the unit AFTER rounding, not before.
   *
   * Rounding second produced "100.0K" for 99,978 and "100.00L" for 9,999,999 —
   * both correct arithmetic and both units nobody uses. Promote whenever the
   * rounded figure has reached the next unit.
   */
  const units: { div: number; suffix: string; dp: number }[] = [
    { div: 1e3, suffix: "K", dp: 1 },
    { div: 1e5, suffix: "L", dp: 2 },
    { div: 1e7, suffix: "Cr", dp: 2 },
  ];

  let chosen = units[0];
  for (const u of units) if (abs >= u.div) chosen = u;

  const idx = units.indexOf(chosen);
  const rounded = (abs / chosen.div).toFixed(chosen.dp);
  const next = units[idx + 1];
  if (next && Number(rounded) * chosen.div >= next.div) {
    return sign + (abs / next.div).toFixed(next.dp) + next.suffix;
  }
  return sign + rounded + chosen.suffix;
}


/**
 * Compact plain-number string, e.g. 4400000 -> "44.0L".
 *
 * Keeps a decimal below 10K so small counts (an extra 1,260 people in the room
 * across a season) do not collapse to a meaningless "1K".
 */
export function numCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return (value / 1e7).toFixed(2) + "Cr";
  if (abs >= 1e5) return (value / 1e5).toFixed(1) + "L";
  if (abs >= 1e4) return (value / 1e3).toFixed(0) + "K";
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + "K";
  return String(Math.round(value));
}

/* ------------------------------------------------------------------ *
 * Fixed structure — league rules, not user-adjustable
 * ------------------------------------------------------------------ */

/** Live-event split of net gate. Event managers are paid from the operator's share. */
export const EVENT_SPLIT = { bands: 40, productionHouse: 30, operator: 30 } as const;

/** Audio/video IP split between the artist and the franchise that financed it. */
export const CONTENT_SPLIT = { artists: 50, productionHouse: 50 } as const;

/**
 * Season length is NOT an independent number here — it is derived from the
 * published fixture calendar on the League page. A 23-week season cannot also
 * be a 4-month season run three times a year, and the two pages drifting apart
 * on that point is exactly the kind of error this model exists to prevent.
 */
const WEEKS_PER_MONTH = 52 / 12;
export const SEASON_STRUCTURE = {
  seasonWeeks: SEASON_WEEKS,
  // Stated, not divided out of 52: the league plays one regular season a year
  // and spends the other half of the calendar on finals, touring and the draft.
  seasonsPerYear: SEASONS_PER_YEAR,
  monthsPerSeason: SEASON_WEEKS / WEEKS_PER_MONTH,
};

/** Operator's half of the league-level broadcast and sponsorship pools. */
const OPERATOR_RIGHTS_SHARE_PCT = 50;

/**
 * Central cost base for one season, derived from `league-capital.ts` rather
 * than typed here.
 *
 * This used to be five flat lines totalling ₹7.7L — about one mid-sized event,
 * standing in for the cost of running a national league. It made the operator
 * look structurally profitable by omitting the organisation that would have to
 * exist for any of it to happen. It now scales with zones, nights, campuses
 * and bands, so it cannot drift when the league changes shape.
 */
export const OPERATIONS = costOperations(SEASON_1_SCALE);

export const OPERATOR_COSTS: { label: string; amount: number }[] =
  OPERATIONS.byCategory.map((c) => ({ label: c.category, amount: c.amount }));

/** Operating cost only. The prize pool is a separate cash commitment. */
export const OPERATOR_COSTS_TOTAL = OPERATIONS.operating;

/** Acts sharing one versus night. Two is the format; named rather than magic. */
export const ACTS_PER_SHARED_SHOW = 2;

/**
 * Acts sharing a bill on the SELECTED format.
 *
 * The constant above is the versus-night default and was applied to every
 * shared format, so a house night — four bands on one stage — was counted as
 * two events per pair rather than one per roster. `applyScope` overrides it
 * from the format the slicer is actually on.
 */

/* ------------------------------------------------------------------ *
 * Inputs — everything the page can move
 * ------------------------------------------------------------------ */

export interface EconomicsInputs {
  /* Base parameters */
  ticketPrice: number;
  /** Draw for a SOLO showcase. A shared night applies coHeadlineUplift to this. */
  attendance: number;
  /** Fixtures a single band plays inside one season. */
  showsPerBand: number;
  numFranchises: number;
  /** Bands signed per production house. Four, in every zone. */
  bandsPerFranchise: number;
  winningBid: number;
  bandMembers: number;

  /* Fixture format mix */
  /** Share of a band's fixtures that are solo showcases; the rest are versus nights. */
  soloSharePct: number;
  /** Acts sharing a bill on the selected format. Defaults to the versus night's two. */
  actsPerSharedShow?: number;
  /** Footfall multiplier on a shared night — two fanbases in one room. */
  coHeadlineUplift: number;

  /* Contracted inputs, per franchise per season */
  ticketingCommissionPct: number;
  licensingRights: number;
  broadcastRights: number;
  syncPlacements: number;

  /* Catalogue, per band per year */
  youtubeViewsAnnual: number;
  /** Revenue per 1,000 monetised views, in rupees. */
  youtubeRpm: number;
  musicPlatformsAnnual: number;
  exclusivePartnerAnnual: number;
  bandSponsorshipAnnual: number;

  /* League-level pools, per season */
  leagueBroadcastSeason: number;
  leagueSponsorshipSeason: number;
  membersCount: number;
  membershipPrice: number;

  /* Platform upside — web-native streams, excluded from the base case */
  inHouseTicketingPct: number;
  ppvPrice: number;
  ppvBuyersPerFixture: number;
  merchAttachPct: number;
  merchMargin: number;
  fanPassPrice: number;
  fanPassBuyersPerFixture: number;
  sponsorPortalPerFixture: number;
}

export const DEFAULT_INPUTS: EconomicsInputs = {
  ticketPrice: 250,
  attendance: 200,
  // The SCORED ladder only: 11 commercial + 4 campus + 3 versus. House nights,
  // corporate shows and festival stages are real income but sit outside the
  // gate split, so folding them in here would overstate ticket revenue.
  showsPerBand: 18,
  numFranchises: 25,
  bandsPerFranchise: 4,
  winningBid: 1000000,
  bandMembers: 5,

  soloSharePct: 83,
  coHeadlineUplift: 1.6,

  ticketingCommissionPct: 10,
  licensingRights: 140000,
  broadcastRights: 100000,
  syncPlacements: 70000,

  youtubeViewsAnnual: 4400000,
  youtubeRpm: 50,
  musicPlatformsAnnual: 180000,
  exclusivePartnerAnnual: 90000,
  bandSponsorshipAnnual: 170000,

  leagueBroadcastSeason: 600000,
  leagueSponsorshipSeason: 300000,
  membersCount: 500,
  membershipPrice: 299,

  inHouseTicketingPct: 0,
  ppvPrice: 0,
  ppvBuyersPerFixture: 0,
  merchAttachPct: 0,
  merchMargin: 0,
  fanPassPrice: 0,
  fanPassBuyersPerFixture: 0,
  sponsorPortalPerFixture: 0,
};

/** Sensible "switch the web-native streams on" values for the upside panel. */
export const PLATFORM_UPSIDE_ON: Partial<EconomicsInputs> = {
  inHouseTicketingPct: 60,
  ppvPrice: 99,
  ppvBuyersPerFixture: 150,
  merchAttachPct: 8,
  merchMargin: 250,
  fanPassPrice: 49,
  fanPassBuyersPerFixture: 120,
  sponsorPortalPerFixture: 15000,
};

/* ------------------------------------------------------------------ *
 * Scenario presets for live investor discussion
 * ------------------------------------------------------------------ */

export interface Preset {
  id: string;
  label: string;
  blurb: string;
  patch: Partial<EconomicsInputs>;
}

export const PRESETS: Preset[] = [
  {
    id: "conservative",
    label: "Conservative",
    blurb: "Independent-band pricing into a smaller room — the level a new format actually opens at.",
    patch: { soloSharePct: 40, ticketPrice: 249, attendance: 200, showsPerBand: 10, numFranchises: 4, bandsPerFranchise: 1, winningBid: 1000000 },
  },
  {
    id: "base",
    label: "Base Case",
    blurb: "The league's operating plan: a mid-scale ticketed room across a full fixture calendar.",
    patch: { soloSharePct: 38, ticketPrice: 399, attendance: 300, showsPerBand: 12, numFranchises: 4, bandsPerFranchise: 1, winningBid: 1000000 },
  },
  {
    id: "bull",
    label: "Bull Case",
    blurb: "Format has traction — bigger rooms, higher yield, a wider franchise field.",
    patch: { soloSharePct: 36, ticketPrice: 599, attendance: 500, showsPerBand: 14, numFranchises: 6, bandsPerFranchise: 1, winningBid: 1200000 },
  },
  {
    id: "regional",
    label: "Stage 2 · AP/TS",
    blurb: "The full regional league: 5 production houses, 4 bands each, 11 fixtures per band — 8 solo nights plus 3 house cross nights.",
    patch: { ticketPrice: 299, attendance: 250, showsPerBand: 11, soloSharePct: 73, numFranchises: 5, bandsPerFranchise: 4, winningBid: 1000000 },
  },
];

/* ------------------------------------------------------------------ *
 * Per-show economics
 * ------------------------------------------------------------------ */

export interface ShowEconomics {
  acts: number;
  attendance: number;
  grossTicketRevenue: number;
  platformCommission: number;
  netRevenue: number;
  /** 40% of net, for ALL acts on the night combined. */
  bandPool: number;
  /** What one act on that night is paid. */
  bandPerAct: number;
  /** 30% of net, across all production houses represented. */
  productionHousePool: number;
  /** What one act's house is paid for that night. */
  productionHousePerAct: number;
  operatorShare: number;
}

/**
 * Single source of truth for the per-night maths.
 *
 * `acts` is how many bands share the night. The gate does not grow with the act
 * count — the split does. The caller passes the attendance that format draws.
 */
export function computeShowEconomics(
  ticketPrice: number,
  attendance: number,
  commissionPct: number,
  acts: number = 1,
): ShowEconomics {
  const safeActs = Math.max(1, Math.round(acts));
  const grossTicketRevenue = ticketPrice * attendance;
  const platformCommission = grossTicketRevenue * (commissionPct / 100);
  const netRevenue = grossTicketRevenue - platformCommission;
  // Round the first two pools and give the operator the remainder, so the three
  // figures on screen always add back to netRevenue exactly.
  const bandPool = Math.round(netRevenue * (EVENT_SPLIT.bands / 100));
  const productionHousePool = Math.round(netRevenue * (EVENT_SPLIT.productionHouse / 100));
  return {
    acts: safeActs,
    attendance,
    grossTicketRevenue,
    platformCommission,
    netRevenue,
    bandPool,
    bandPerAct: bandPool / safeActs,
    productionHousePool,
    productionHousePerAct: productionHousePool / safeActs,
    operatorShare: netRevenue - bandPool - productionHousePool,
  };
}

/* ------------------------------------------------------------------ *
 * Sensitivity markers
 * ------------------------------------------------------------------ */

/** How certain a line of income is — drives the markers next to every figure. */
export type Certainty = "gate" | "contracted" | "modelled";

export const CERTAINTY_META: Record<Certainty, { label: string; short: string; note: string }> = {
  gate: {
    label: "Gate-backed",
    short: "Gate",
    note: "Earned from tickets the league sells itself. Moves only with price and attendance.",
  },
  contracted: {
    label: "Contracted upside",
    short: "Contract",
    note: "Requires a signed counterparty deal. Worth zero until that contract lands.",
  },
  modelled: {
    label: "Modelled upside",
    short: "Modelled",
    note: "Platform-dependent and variable. Estimated from view and streaming assumptions.",
  },
};

export interface ReturnStream {
  label: string;
  amount: number;
  detail: string;
  certainty: Certainty;
}

export interface LineItem {
  label: string;
  amount: number;
  detail?: string;
}

export interface ContentStream {
  source: string;
  annual: number;
  note: string;
  certainty: Certainty;
}

/* ------------------------------------------------------------------ *
 * The engine
 * ------------------------------------------------------------------ */

export interface EconomicsModel {
  inputs: EconomicsInputs;

  /* Fixture mix */
  soloShowsPerBand: number;
  sharedShowsPerBand: number;
  soloShow: ShowEconomics;
  sharedShow: ShowEconomics;
  totalBands: number;
  soloFixtures: number;
  sharedFixtures: number;
  totalFixtures: number;
  totalAdmissions: number;
  showsPerYearPerBand: number;

  /* Run rate — the same season expressed as a cadence */
  /** Ticketed nights the league stages per month. */
  showsPerMonth: number;
  monthlyNetGate: number;
  annualNetGate: number;
  annualAdmissions: number;
  annualEcosystemTotal: number;

  /* Catalogue, per band */
  contentStreams: ContentStream[];
  contentTotal: number;
  contentHalfAnnual: number;
  contentHalfPerSeason: number;

  /* Band */
  bandGateSeason: number;
  artistSeasonReturn: ReturnStream[];
  artistSeasonTotal: number;
  artistYearTotal: number;
  artistPerMemberSeason: number;
  artistPerMemberYear: number;
  /** What the band would earn if every fixture were a solo showcase. */
  bandGateSeasonAllSolo: number;
  /** Extra people in the room across the season because nights are shared. */
  sharedNightExtraFootfall: number;

  /* Franchise */
  phGatePerBandSeason: number;
  phSeasonReturn: ReturnStream[];
  phSeasonTotal: number;
  phSeasonProfit: number;
  phSeasonMultiple: number;
  /** What the venue ladder does to solo-night revenue vs a flat-priced season. */
  venueMixIdx: number;
  /** Everything a house commits: the bid plus every regulated cap. */
  phTotalCommitment: number;
  /** Season return against the FULL commitment, not just the bid. */
  phCommitmentMultiple: number;
  /** Head count on a co-headlined night — a bigger room, split two ways. */
  sharedAttendance: number;
  /** Seats sold across every night one production house's bands play. */
  phSeatsSeason: number;
  /** Those seats at the scoped ticket price, before platform fee and tax. */
  phGrossGateSeason: number;
  /**
   * Band-appearances one house sells across the season: shows per band x bands
   * signed. NOT distinct nights — two of its bands share a versus stage, so the
   * house stages fewer nights than it sells appearances.
   */
  phBandNightsSeason: number;
  phGateBackedTotal: number;
  phGateBackedMultiple: number;
  phVariableTotal: number;
  phVariablePct: number;
  phCapitalRecoveredPct: number;

  /* League season */
  seasonNetGatePool: number;
  seasonGrossGatePool: number;
  seasonCataloguePool: number;
  membershipRevenue: number;
  bidsPool: number;
  ecosystemRevenue: LineItem[];
  ecosystemTotal: number;
  operatorIncome: LineItem[];
  operatorGross: number;
  operatorCosts: { label: string; amount: number }[];
  operatorCostsTotal: number;
  operatorNet: number;
  operatorMarginPct: number;

  /* Platform upside — excluded from every figure above */
  platformUpside: LineItem[];
  platformUpsideTotal: number;
}

export function computeEconomics(inputs: EconomicsInputs): EconomicsModel {
  const {
    ticketPrice,
    attendance,
    showsPerBand,
    numFranchises,
    bandsPerFranchise,
    winningBid,
    bandMembers,
    soloSharePct,
    coHeadlineUplift,
    ticketingCommissionPct,
  } = inputs;

  /* ---- fixture mix -------------------------------------------------- */
  const soloShowsPerBand = Math.min(
    showsPerBand,
    Math.max(0, Math.round((showsPerBand * soloSharePct) / 100)),
  );
  const sharedShowsPerBand = showsPerBand - soloShowsPerBand;

  const sharedAttendance = Math.round(attendance * coHeadlineUplift);

  /*
   * The venue ladder's effect on revenue, applied once.
   *
   * A band's nine solo nights are not nine identical rooms — they run from a
   * cafe to an arena, and price moves the opposite way to capacity. Room sizes
   * are normalised so the season's seat count is unchanged, but the negative
   * correlation between size and ticket means the mix earns slightly less than
   * a flat-priced season would. Folding it in here keeps every downstream solo
   * figure consistent instead of scattering the multiplier around the engine.
   */
  const venueMixIdx = FORMAT_MIX.grossIdx;
  const soloShow = computeShowEconomics(
    ticketPrice * venueMixIdx,
    attendance,
    ticketingCommissionPct,
    1,
  );
  const sharedShow = computeShowEconomics(
    ticketPrice,
    sharedAttendance,
    ticketingCommissionPct,
    ACTS_PER_SHARED_SHOW,
  );

  const totalBands = Math.max(1, numFranchises * bandsPerFranchise);
  const soloFixtures = totalBands * soloShowsPerBand;
  // One ticketed event shared by however many acts THIS format puts on a bill.
  const actsShared = Math.max(1, inputs.actsPerSharedShow ?? ACTS_PER_SHARED_SHOW);
  const sharedFixtures = Math.round((totalBands * sharedShowsPerBand) / actsShared);
  const totalFixtures = soloFixtures + sharedFixtures;
  const totalAdmissions = soloFixtures * attendance + sharedFixtures * sharedAttendance;

  /* ---- catalogue, per band per year ---------------------------------- */
  const youtubeAnnual = Math.round((inputs.youtubeViewsAnnual / 1000) * inputs.youtubeRpm);
  const contentStreams: ContentStream[] = [
    {
      source: "YouTube Monetization",
      annual: youtubeAnnual,
      note: `${numCompact(inputs.youtubeViewsAnnual)} monetised views a year at ${inr(inputs.youtubeRpm)} RPM`,
      certainty: "modelled",
    },
    {
      source: "Music Platforms",
      annual: inputs.musicPlatformsAnnual,
      note: "Streaming royalties across global and regional platforms",
      certainty: "modelled",
    },
    {
      source: "Exclusive Music Partner",
      annual: inputs.exclusivePartnerAnnual,
      note: "First-window catalogue placement",
      certainty: "contracted",
    },
    {
      source: "Sponsorships & Brand Collabs",
      annual: inputs.bandSponsorshipAnnual,
      note: "Band-level sponsor deals and brand tie-ins",
      certainty: "contracted",
    },
  ];
  const contentTotal = contentStreams.reduce((s, c) => s + c.annual, 0);
  const contentHalfAnnual = contentTotal * (CONTENT_SPLIT.artists / 100);
  const contentHalfPerSeason = Math.round(contentHalfAnnual / SEASON_STRUCTURE.seasonsPerYear);

  /* ---- what one band earns off the gate ------------------------------ */
  const bandGateSeason = Math.round(
    soloShowsPerBand * soloShow.bandPool + sharedShowsPerBand * sharedShow.bandPerAct,
  );
  const bandGateSeasonAllSolo = soloShow.bandPool * showsPerBand;
  const sharedNightExtraFootfall = sharedShowsPerBand * (sharedAttendance - attendance);

  /*
   * Licensing, broadcast and sync are split 50/50 with the artists, exactly
   * like the catalogue. They are earned against masters and footage the bands
   * performed on, so the house financing them does not make them the house's
   * alone. `rightsPoolPerHouse` is the whole pot before either side takes its
   * half; the artists' half is then divided across the bands on the roster.
   */
  const rightsPoolPerHouse =
    inputs.licensingRights + inputs.broadcastRights + inputs.syncPlacements;
  const houseRightsShare = CONTENT_SPLIT.productionHouse / 100;
  const artistRightsPerBand = Math.round(
    (rightsPoolPerHouse * (CONTENT_SPLIT.artists / 100)) / Math.max(1, bandsPerFranchise),
  );

  const artistSeasonReturn: ReturnStream[] = [
    {
      label: "Live Performance Share",
      amount: bandGateSeason,
      detail:
        sharedShowsPerBand > 0
          ? `${EVENT_SPLIT.bands}% of net on ${soloShowsPerBand} solo ${soloShowsPerBand === 1 ? "night" : "nights"}, split with the rival act on ${sharedShowsPerBand} versus ${sharedShowsPerBand === 1 ? "night" : "nights"}`
          : `${EVENT_SPLIT.bands}% of net gate across ${showsPerBand} solo fixtures`,
      certainty: "gate",
    },
    {
      label: "Catalogue Share",
      amount: contentHalfPerSeason,
      detail: `${CONTENT_SPLIT.artists}% of the audio and video rights they created`,
      certainty: "modelled",
    },
    {
      label: "Licensing, Broadcast & Sync Share",
      amount: artistRightsPerBand,
      detail: `${CONTENT_SPLIT.artists}% of the house's ${inr(rightsPoolPerHouse)} rights income, split across its ${bandsPerFranchise} ${bandsPerFranchise === 1 ? "band" : "bands"}`,
      certainty: "contracted",
    },
  ];
  const artistSeasonTotal = artistSeasonReturn.reduce((s, r) => s + r.amount, 0);
  const artistYearTotal = artistSeasonTotal * SEASON_STRUCTURE.seasonsPerYear;

  /* ---- what one franchise earns -------------------------------------- */
  const phGatePerBandSeason = Math.round(
    soloShowsPerBand * soloShow.productionHousePool +
      sharedShowsPerBand * sharedShow.productionHousePerAct,
  );

  // The gate arithmetic the page shows out loud: seats x price x every night
  // this house's bands are on stage. A shared night is co-headlined, so the
  // house books its half of a bigger room rather than a whole small one.
  const phBandNightsSeason = showsPerBand * bandsPerFranchise;
  const phSeatsSeason = Math.round(
    (soloShowsPerBand * attendance + sharedShowsPerBand * (sharedAttendance / 2)) *
      bandsPerFranchise,
  );
  const phGrossGateSeason = Math.round(phSeatsSeason * ticketPrice * venueMixIdx);

  const phSeasonReturn: ReturnStream[] = [
    {
      label: "Event Revenue Share",
      amount: phGatePerBandSeason * bandsPerFranchise,
      detail: `${EVENT_SPLIT.productionHouse}% of net gate — ${bandsPerFranchise} ${bandsPerFranchise === 1 ? "band" : "bands"} × ${showsPerBand} shows = ${phBandNightsSeason} appearances, ${phSeatsSeason.toLocaleString("en-IN")} seats at ${inr(ticketPrice)}`,
      certainty: "gate",
    },
    {
      label: "Catalogue Share",
      amount: contentHalfPerSeason * bandsPerFranchise,
      detail: `${CONTENT_SPLIT.productionHouse}% of the audio and video rights it financed`,
      certainty: "modelled",
    },
    {
      label: "Third-Party Content Licensing",
      amount: Math.round(inputs.licensingRights * houseRightsShare),
      detail: `OTT, syndication and platform deals on season footage and originals — the house's ${CONTENT_SPLIT.productionHouse}% of ${inr(inputs.licensingRights)}`,
      certainty: "contracted",
    },
    {
      label: "Broadcast Rights Share",
      amount: Math.round(inputs.broadcastRights * houseRightsShare),
      detail: `Franchise share of league broadcast and streaming distribution fees — the house's ${CONTENT_SPLIT.productionHouse}% of ${inr(inputs.broadcastRights)}`,
      certainty: "contracted",
    },
    {
      label: "Sync & Brand Placements",
      amount: Math.round(inputs.syncPlacements * houseRightsShare),
      detail: `Film, ad and brand sync against franchise-owned masters — the house's ${CONTENT_SPLIT.productionHouse}% of ${inr(inputs.syncPlacements)}`,
      certainty: "contracted",
    },
  ];

  const phSeasonTotal = phSeasonReturn.reduce((s, r) => s + r.amount, 0);

  /*
   * The honest denominator.
   *
   * A return multiple against the winning bid alone flatters the house: the
   * bid is one line of what it signs up for. Creative allocation and song
   * marketing are quoted per song and land on every original the whole roster
   * ships, and the mentor association is a house-level fee. Against all of it
   * the picture is very different, and the page shows both rather than the
   * kinder one.
   */
  const songsPerRoster = RELEASES_PER_BAND * bandsPerFranchise;
  const phTotalCommitment =
    winningBid +
    SPEND_CAPS.reduce(
      (sum, c) => sum + (c.basis === "per song" ? c.amount * songsPerRoster : c.amount),
      0,
    );
  const phGateBackedTotal = phSeasonReturn
    .filter((r) => r.certainty === "gate")
    .reduce((s, r) => s + r.amount, 0);
  const phVariableTotal = phSeasonTotal - phGateBackedTotal;

  /* ---- league season -------------------------------------------------- */
  const seasonNetGatePool =
    soloFixtures * soloShow.netRevenue + sharedFixtures * sharedShow.netRevenue;
  const seasonGrossGatePool =
    soloFixtures * soloShow.grossTicketRevenue + sharedFixtures * sharedShow.grossTicketRevenue;
  const seasonCataloguePool = Math.round(
    (contentTotal * totalBands) / SEASON_STRUCTURE.seasonsPerYear,
  );
  const membershipRevenue = inputs.membersCount * inputs.membershipPrice;
  const bidsPool = winningBid * numFranchises;
  const operatorGateIncome =
    soloFixtures * soloShow.operatorShare + sharedFixtures * sharedShow.operatorShare;
  const broadcastOperatorShare = Math.round(
    inputs.leagueBroadcastSeason * (OPERATOR_RIGHTS_SHARE_PCT / 100),
  );
  const sponsorshipOperatorShare = Math.round(
    inputs.leagueSponsorshipSeason * (OPERATOR_RIGHTS_SHARE_PCT / 100),
  );

  const ecosystemRevenue: LineItem[] = [
    {
      label: "Ticket Sales (net)",
      amount: seasonNetGatePool,
      detail: `${totalFixtures} fixtures — ${soloFixtures} solo, ${sharedFixtures} versus`,
    },
    {
      label: "Production House Bids",
      amount: bidsPool,
      detail: `${numFranchises} franchises × ${inr(winningBid)}`,
    },
    {
      label: "Catalogue Revenue",
      amount: seasonCataloguePool,
      detail: `${totalBands} bands, one season's share`,
    },
    {
      label: "Broadcast Rights",
      amount: inputs.leagueBroadcastSeason,
      detail: "League distribution fees",
    },
    {
      label: "Sponsorship",
      amount: inputs.leagueSponsorshipSeason,
      detail: "Title + co-sponsors",
    },
    {
      label: "Membership Passes",
      amount: membershipRevenue,
      detail: `${inputs.membersCount} fans × ${inr(inputs.membershipPrice)}`,
    },
  ];

  const operatorIncome: LineItem[] = [
    {
      label: "Event Revenue",
      amount: operatorGateIncome,
      detail: `${EVENT_SPLIT.operator}% of net across ${totalFixtures} fixtures`,
    },
    {
      label: "Broadcast Share",
      amount: broadcastOperatorShare,
      detail: "Operator half of distribution fees",
    },
    { label: "Sponsorship", amount: sponsorshipOperatorShare, detail: "League operator share" },
    { label: "Membership Revenue", amount: membershipRevenue },
  ];
  const operatorGross = operatorIncome.reduce((s, r) => s + r.amount, 0);
  const operatorNet = operatorGross - OPERATOR_COSTS_TOTAL;

  /* ---- platform upside, deliberately outside everything above ---------- */
  const retainedTicketing = Math.round(
    seasonGrossGatePool * (ticketingCommissionPct / 100) * (inputs.inHouseTicketingPct / 100),
  );
  const ppvRevenue = Math.round(inputs.ppvPrice * inputs.ppvBuyersPerFixture * totalFixtures);
  const merchRevenue = Math.round(
    totalAdmissions * (inputs.merchAttachPct / 100) * inputs.merchMargin,
  );
  const fanPassRevenue = Math.round(
    inputs.fanPassPrice * inputs.fanPassBuyersPerFixture * totalFixtures,
  );
  const sponsorPortalRevenue = Math.round(inputs.sponsorPortalPerFixture * totalFixtures);

  const platformUpside: LineItem[] = [
    {
      label: "Retained Ticketing Margin",
      amount: retainedTicketing,
      detail: `${inputs.inHouseTicketingPct}% of tickets sold in-house — the ${ticketingCommissionPct}% fee stays in the league`,
    },
    {
      label: "Livestream / PPV Passes",
      amount: ppvRevenue,
      detail: `${inputs.ppvBuyersPerFixture} passes per fixture × ${inr(inputs.ppvPrice)}`,
    },
    {
      label: "Merch Pre-Orders at Checkout",
      amount: merchRevenue,
      detail: `${inputs.merchAttachPct}% of ${numCompact(totalAdmissions)} admissions × ${inr(inputs.merchMargin)} margin`,
    },
    {
      label: "Fan Pass & Paid Voting",
      amount: fanPassRevenue,
      detail: `${inputs.fanPassBuyersPerFixture} fans per fixture × ${inr(inputs.fanPassPrice)}`,
    },
    {
      label: "Micro-Sponsorship Portal",
      amount: sponsorPortalRevenue,
      detail: `Local brands bidding per fixture × ${totalFixtures} fixtures`,
    },
  ];
  const platformUpsideTotal = platformUpside.reduce((s, r) => s + r.amount, 0);

  return {
    inputs,

    soloShowsPerBand,
    sharedShowsPerBand,
    soloShow,
    sharedShow,
    totalBands,
    soloFixtures,
    sharedFixtures,
    totalFixtures,
    totalAdmissions,
    showsPerYearPerBand: showsPerBand * SEASON_STRUCTURE.seasonsPerYear,

    // Cadence is derived from the fixture calendar, not set independently —
    // shows per month is an OUTPUT of how many bands play how many fixtures.
    showsPerMonth: totalFixtures / SEASON_STRUCTURE.monthsPerSeason,
    monthlyNetGate: seasonNetGatePool / SEASON_STRUCTURE.monthsPerSeason,
    annualNetGate: seasonNetGatePool * SEASON_STRUCTURE.seasonsPerYear,
    annualAdmissions: totalAdmissions * SEASON_STRUCTURE.seasonsPerYear,
    annualEcosystemTotal:
      ecosystemRevenue.reduce((s, r) => s + r.amount, 0) * SEASON_STRUCTURE.seasonsPerYear,

    contentStreams,
    contentTotal,
    contentHalfAnnual,
    contentHalfPerSeason,

    bandGateSeason,
    artistSeasonReturn,
    artistSeasonTotal,
    artistYearTotal,
    artistPerMemberSeason: Math.round(artistSeasonTotal / Math.max(1, bandMembers)),
    artistPerMemberYear: Math.round(artistYearTotal / Math.max(1, bandMembers)),
    bandGateSeasonAllSolo,
    sharedNightExtraFootfall,

    phGatePerBandSeason,
    phSeasonReturn,
    phSeasonTotal,
    phSeasonProfit: phSeasonTotal - winningBid,
    phSeasonMultiple: phSeasonTotal / Math.max(1, winningBid),
    venueMixIdx,
    phTotalCommitment,
    phCommitmentMultiple: phSeasonTotal / Math.max(1, phTotalCommitment),
    sharedAttendance,
    phSeatsSeason,
    phGrossGateSeason,
    phBandNightsSeason,
    phGateBackedTotal,
    phGateBackedMultiple: phGateBackedTotal / Math.max(1, winningBid),
    phVariableTotal,
    phVariablePct: phSeasonTotal > 0 ? (phVariableTotal / phSeasonTotal) * 100 : 0,
    phCapitalRecoveredPct: (phGateBackedTotal / Math.max(1, winningBid)) * 100,

    seasonNetGatePool,
    seasonGrossGatePool,
    seasonCataloguePool,
    membershipRevenue,
    bidsPool,
    ecosystemRevenue,
    ecosystemTotal: ecosystemRevenue.reduce((s, r) => s + r.amount, 0),
    operatorIncome,
    operatorGross,
    operatorCosts: OPERATOR_COSTS,
    operatorCostsTotal: OPERATOR_COSTS_TOTAL,
    operatorNet,
    operatorMarginPct: operatorGross > 0 ? (operatorNet / operatorGross) * 100 : 0,

    platformUpside,
    platformUpsideTotal,
  };
}

/** The scenario the page opens on. */
export const BASE_MODEL = computeEconomics(DEFAULT_INPUTS);

/* ------------------------------------------------------------------ *
 * Static narrative content
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
  { stream: "Merchandise", source: "Band merch at events and at ticket checkout", beneficiaries: "Bands + Operator" },
  { stream: "Sync Licensing", source: "Film and ad placements for original music", beneficiaries: "Artists 50% · Production House 50%" },
];

/**
 * The assumption risk register. This is the honest counterweight to the model —
 * it names where the projection is most likely to be wrong and what to do about
 * it, rather than leaving an investor to find the soft spots themselves.
 */
export interface RiskRow {
  assumption: string;
  projection: string;
  risk: "moderate" | "high" | "low";
  assessment: string;
  mitigation: string;
}

export const RISK_REGISTER: RiskRow[] = [
  {
    assumption: "Ticket Price & Gate",
    projection: "₹399 into a 300-capacity room",
    risk: "moderate",
    assessment:
      "Independent-band ticketing in Tier 1 and Tier 2 Indian cities often caps at ₹199–₹299 without an established headliner on the bill.",
    mitigation:
      "Run dual-tier pricing — early bird ₹249, regular ₹399 — and test merch-inclusive bundles before committing to a single price.",
  },
  {
    assumption: "Franchise Return Multiple",
    projection: "Return on the winning bid inside one season",
    risk: "high",
    assessment:
      "Only the event revenue line is gate-backed. The majority of the modelled return leans on licensing, broadcast and sync contracts that are not yet signed.",
    mitigation:
      "Quote gate-backed return and contracted upside as two separate numbers — which is how this page now presents them — and sign at least one rights deal before the bid round.",
  },
  {
    assumption: "Catalogue & YouTube IP",
    projection: "Annual streaming and AdSense per band",
    risk: "high",
    assessment:
      "The YouTube line needs roughly 4–5 million targeted views per band per year at typical Indian RPMs. That is a real audience, not a rounding error.",
    mitigation:
      "Partner with a digital distributor for upfront advance guarantees, so a share of catalogue income is contracted rather than view-dependent.",
  },
  {
    assumption: "Ticketing Partner Commission",
    projection: "10% of gross to the platform",
    risk: "low",
    assessment: "Accurate. This is the standard rate for third-party ticketing platforms in India.",
    mitigation:
      "Direct ticketing on our own platform recovers this fee as league margin — modelled in the platform upside panel below.",
  },
];

/** Web-native revenue the site itself can capture. Not in any figure above. */
export interface PlatformIdea {
  title: string;
  detail: string;
  status: string;
}

export const PLATFORM_IDEAS: PlatformIdea[] = [
  {
    title: "In-House Ticketing & Checkout",
    detail:
      "Sell tickets directly on the platform instead of routing every fixture through a third party. The commission that currently leaves the pool becomes league margin, and the buyer relationship stays with us.",
    status: "Recovers the ticketing fee",
  },
  {
    title: "Micro-Sponsorship & Venue Portal",
    detail:
      "An automated portal where local brands and venue owners bid for fixture hosting or stage naming rights, without a sales call for every small deal.",
    status: "New operator line",
  },
  {
    title: "Livestream & PPV Passes",
    detail:
      "A paywalled stream for fans outside the host city. The room has a capacity ceiling; the stream does not, which is what makes a fixture calendar scale past its venues.",
    status: "Breaks the capacity ceiling",
  },
  {
    title: "Merch Pre-Orders at Checkout",
    detail:
      "Band merchandise offered inside the ticket purchase flow, so cash arrives before show night rather than depending on a queue at a table.",
    status: "Pre-show cash flow",
  },
  {
    title: "Fan Pass & Paid Voting",
    detail:
      "Paid fan passes carry verified votes during the match window, plus badge access and behind-the-scenes content. Monetises engagement that the points table already depends on.",
    status: "Ties revenue to engagement",
  },
];

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
    title: "Zonal & National Expansion",
    detail:
      "The playbook replicated zone by zone, with a fresh round of franchise bids in each new market against largely the same central overhead.",
    horizon: "Year 2+",
  },
];

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
  { role: "Production Houses", scope: "Franchise investors financing music and video production for their signed bands.", tier: "platform" },
  { role: "Broadcast Partner", scope: "Network and streaming distribution of the fixture calendar and finale.", tier: "platform" },
  { role: "Ticketing Partner", scope: "Ticket sales, entry and settlement across the full fixture calendar.", tier: "platform" },
  { role: "Community Partners", scope: "Campus and city networks driving audience turnout show after show.", tier: "community" },
];

export interface PitchPoint {
  title: string;
  detail: string;
}

export const PITCH_POINTS: PitchPoint[] = [
  { title: "Proven Template", detail: "The franchise league model is battle-tested. This applies it to independent music — a large, underserved market with no structured incumbent." },
  { title: "A Distribution Engine", detail: "The league exists to put original music in front of mass audiences. Every fixture is a release event with a paying room already in it." },
  { title: "Diversified Income", detail: "Gate, catalogue, licensing, broadcast, sponsorship and memberships mean no single stream carries the business." },
  { title: "Compounding IP", detail: "Every season produces ownable audio and video catalogue that keeps earning long after the show ends." },
  { title: "Network Effects", detail: "More bands drive more fixtures, which grow audiences, which lift sponsorship, which pulls in more franchise capital." },
  { title: "Low Competition", detail: "No structured franchise music ecosystem exists in India's regional markets today." },
  { title: "Scalable Playbook", detail: "The model replicates city by city and zone by zone on largely fixed central overhead." },
];
