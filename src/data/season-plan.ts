/**
 * What each season actually is.
 *
 * Season 1 is AP/TS only — five production houses, twenty bands, one zone. The
 * national shape arrives in season 2. Every page that counts bands, houses,
 * zones or nights reads this rather than assuming the national roster, because
 * a launch season that claims a hundred bands is describing a plan, not a
 * season.
 *
 * The distinction matters commercially as much as structurally: the season-1
 * sponsorship card, cost base and prize pool are all sized against twenty
 * bands in one state, and quoting national figures against a single-zone
 * launch is how a plan stops being believable.
 */

import { ZONES, type Zone } from "./league-format";

export type SeasonId = "s1" | "s2";

export interface SeasonPlan {
  id: SeasonId;
  label: string;
  /** The year the regular season runs in. */
  year: number;
  /** Zone slugs live this season. */
  zoneSlugs: string[];
  housesPerZone: number;
  bandsPerHouse: number;
  zones: number;
  houses: number;
  bands: number;
  headline: string;
  note: string;
}

const AP_TS = "ap-ts";

function build(
  id: SeasonId,
  label: string,
  year: number,
  zoneSlugs: string[],
  headline: string,
  note: string,
): SeasonPlan {
  const housesPerZone = 5;
  const bandsPerHouse = 4;
  return {
    id,
    label,
    year,
    zoneSlugs,
    housesPerZone,
    bandsPerHouse,
    zones: zoneSlugs.length,
    houses: zoneSlugs.length * housesPerZone,
    bands: zoneSlugs.length * housesPerZone * bandsPerHouse,
    headline,
    note,
  };
}

const STATE_ZONE_SLUGS = ZONES.filter((z) => z.tier === "state").map((z) => z.slug);

export const SEASON_PLANS: SeasonPlan[] = [
  build(
    "s1",
    "Season 1",
    2027,
    [AP_TS],
    "One state, twenty bands",
    "AP/TS only. Five production houses, four bands each. One zone is enough to prove the format works, and small enough that every assumption in the model gets tested against a real result rather than an average of five.",
  ),
  build(
    "s2",
    "Season 2",
    2028,
    STATE_ZONE_SLUGS,
    "Five leagues, a hundred bands",
    "The national shape: five regional leagues running simultaneously, twenty-five houses, a hundred bands. Everything the first season proved, at five times the scale, with a back catalogue and a returning roster behind it.",
  ),
];

export const SEASON_1 = SEASON_PLANS[0];
export const SEASON_2 = SEASON_PLANS[1];

export function seasonPlan(id: string): SeasonPlan {
  return SEASON_PLANS.find((s) => s.id === id) ?? SEASON_1;
}

/** The zones live in a given season. */
export function zonesForSeason(id: string): Zone[] {
  const plan = seasonPlan(id);
  return ZONES.filter((z) => plan.zoneSlugs.includes(z.slug));
}

/** True when a zone plays in that season. */
export function zoneInSeason(zoneSlug: string, id: string): boolean {
  return seasonPlan(id).zoneSlugs.includes(zoneSlug);
}

/**
 * Scale factor between a season and the national roster.
 *
 * Season-level money — sponsorship, broadcast, membership, the central cost
 * base — is quoted for the season it belongs to. This is what lets a figure
 * sized for twenty bands be read against a hundred without restating it.
 */
export function seasonScale(id: string): number {
  return seasonPlan(id).bands / SEASON_2.bands;
}
