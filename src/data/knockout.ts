/**
 * Season 1's road to the final.
 *
 * Twenty bands, four groups of five, and then a bracket. The knockout rounds
 * are national television with the audience voting live during the show —
 * which is the whole reason the format has a knockout at all. A league table
 * settles who is best over a season; a live televised elimination is what
 * makes anyone watch it happen.
 *
 * The group draw has one rule and it does real work: no two bands from the
 * same production house share a group. Five houses, five bands to a group,
 * one from each. A house's own bands therefore cannot knock each other out
 * before the quarterfinals, and no group can be stacked by whoever drafted
 * best in December.
 */

import { SEASON_1 } from "./season-plan";

export const GROUPS = ["A", "B", "C", "D"] as const;
export type GroupName = (typeof GROUPS)[number];

/** Bands per group, and how many go through. */
export const BANDS_PER_GROUP = 5;
export const QUALIFY_PER_GROUP = 2;

export interface GroupSlot {
  group: GroupName;
  /** Which house this slot is drawn from, 1-indexed. */
  house: number;
  /** The band's slot within that house, 1-indexed. */
  band: number;
  label: string;
}

/**
 * The draw.
 *
 * Group k takes band k from every house, so each group has one band from each
 * of the five and no house meets itself before the quarterfinals. With four
 * groups and four bands to a house the mapping is exact — nobody is left over
 * and nothing needs a tie-break.
 */
export function drawGroups(
  houses = SEASON_1.housesPerZone,
  bandsPerHouse = SEASON_1.bandsPerHouse,
): GroupSlot[] {
  const out: GroupSlot[] = [];
  GROUPS.forEach((group, gi) => {
    for (let house = 1; house <= houses; house += 1) {
      const band = (gi % bandsPerHouse) + 1;
      out.push({ group, house, band, label: `H${house} · B${band}` });
    }
  });
  return out;
}

export const GROUP_DRAW = drawGroups();

/** Round-robin inside one group: everyone plays everyone once. */
export function groupFixtures(size = BANDS_PER_GROUP): number {
  return (size * (size - 1)) / 2;
}

export const GROUP_STAGE = {
  groups: GROUPS.length,
  bandsPerGroup: BANDS_PER_GROUP,
  fixturesPerGroup: groupFixtures(),
  /** Matches each band plays in its group. */
  matchesPerBand: BANDS_PER_GROUP - 1,
  totalFixtures: GROUPS.length * groupFixtures(),
  qualifiers: GROUPS.length * QUALIFY_PER_GROUP,
};

/* ------------------------------------------------------------------ *
 * The bracket
 * ------------------------------------------------------------------ */

export interface KnockoutTie {
  id: string;
  round: "Quarterfinal" | "Semifinal" | "Final";
  label: string;
  /** Slot names, never band names — the draw is decided by the table. */
  home: string;
  away: string;
  note: string;
}

/**
 * Quarterfinals cross the groups deliberately: a group winner never meets the
 * runner-up from its own group, so topping a group is worth something beyond
 * qualifying.
 */
export const QUARTERFINALS: KnockoutTie[] = [
  { id: "qf1", round: "Quarterfinal", label: "QF1", home: "Group A winner", away: "Group B runner-up", note: "" },
  { id: "qf2", round: "Quarterfinal", label: "QF2", home: "Group B winner", away: "Group A runner-up", note: "" },
  { id: "qf3", round: "Quarterfinal", label: "QF3", home: "Group C winner", away: "Group D runner-up", note: "" },
  { id: "qf4", round: "Quarterfinal", label: "QF4", home: "Group D winner", away: "Group C runner-up", note: "" },
];

export const SEMIFINALS: KnockoutTie[] = [
  { id: "sf1", round: "Semifinal", label: "SF1", home: "QF1 winner", away: "QF3 winner", note: "" },
  { id: "sf2", round: "Semifinal", label: "SF2", home: "QF2 winner", away: "QF4 winner", note: "" },
];

export const FINAL: KnockoutTie = {
  id: "final",
  round: "Final",
  label: "Final",
  home: "SF1 winner",
  away: "SF2 winner",
  note: "",
};

export const BRACKET: KnockoutTie[] = [...QUARTERFINALS, ...SEMIFINALS, FINAL];

/* ------------------------------------------------------------------ *
 * What it takes to stage
 * ------------------------------------------------------------------ */

/**
 * The knockout is broadcast, not toured.
 *
 * Seven nights, each one a live television show with the audience voting
 * during it. That is a different production from a league fixture and a
 * different cost line — it is why the knockout has its own budget rather than
 * being averaged into the season's per-night figures.
 */
export const KNOCKOUT_STAGING = {
  quarterfinals: QUARTERFINALS.length,
  semifinals: SEMIFINALS.length,
  final: 1,
  nights: BRACKET.length,
  broadcast: true,
  liveVoting: true,
  note: "Every knockout night is a national broadcast with live audience voting during the show. The league table decides who is on it; the room and the phones decide who goes through.",
};

/** Bands still involved at each stage, for the ladder on the page. */
export const KNOCKOUT_LADDER = [
  { stage: "Group stage", bands: SEASON_1.bands, detail: `${GROUPS.length} groups of ${BANDS_PER_GROUP}, one band per house in each` },
  { stage: "Quarterfinals", bands: GROUP_STAGE.qualifiers, detail: `Top ${QUALIFY_PER_GROUP} from each group, drawn across groups` },
  { stage: "Semifinals", bands: 4, detail: "Quarterfinal winners" },
  { stage: "Final", bands: 2, detail: "One night, one champion" },
];

/** Every group must hold one band from each house, or the draw rule is broken. */
export const DRAW_RECONCILES = GROUPS.every((g) => {
  const inGroup = GROUP_DRAW.filter((s) => s.group === g);
  const houses = new Set(inGroup.map((s) => s.house));
  return inGroup.length === BANDS_PER_GROUP && houses.size === BANDS_PER_GROUP;
});
