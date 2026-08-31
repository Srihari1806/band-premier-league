/**
 * The money primitives every other model reads.
 *
 * This file owns the two things that must never exist in two places — how a
 * rupee is written, and how a rupee is divided — and nothing else.
 * `season1.ts` builds the Season 1 projection on top of it; `league-revenue.ts`,
 * `event-model.ts` and `regulations.ts` read the splits and the formatters
 * from here.
 *
 * It deliberately imports nothing from the rest of `data/`, and that is
 * structural rather than stylistic. `league-revenue.ts` imports `SPLITS` from
 * this module, so the moment this module imports it back, whichever of the two
 * loads first leaves the other holding consts that are still in their temporal
 * dead zone. That is the reason the season model lives in its own file instead
 * of here, where a previous version of it sat.
 */

/**
 * Indian-format rupee string, e.g. 805950 -> "₹8,05,950".
 *
 * The sign goes OUTSIDE the symbol. "−₹17,598" is a negative amount of
 * money; "₹-17,598" is a typo, and this model produces negative numbers
 * often enough (a house's cost stack, a night that lost money) for that to
 * matter.
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
 * Keeps a decimal below 10K so small counts do not collapse to a meaningless
 * "1K".
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
 * The splits
 * ------------------------------------------------------------------ */

/**
 * Every split the league runs, in one table.
 *
 * There are seven, and they are different on purpose — a live gate, a
 * catalogue, a broadcast deal, a sponsorship card, a membership pass, a
 * co-funded stadium show and a signing fee are not the same kind of money and
 * do not divide the same way. Keeping them apart is what stops "the 40/30/30"
 * being quoted at things it was never about.
 *
 * Percentages, and each row sums to 100.
 */
export const SPLITS = {
  /** Ticketed and sponsored nights the league stages itself. */
  live: { artist: 40, productionHouse: 30, operator: 30 },
  /** Recordings and video. The operator takes nothing. */
  content: { artist: 50, productionHouse: 50, operator: 0 },
  /** OTT and broadcast rights. */
  broadcast: { artist: 30, productionHouse: 30, operator: 40 },
  /** The season sponsorship card. */
  sponsorship: { artist: 30, productionHouse: 30, operator: 40 },
  /** Membership passes are the operator's alone. */
  membership: { artist: 0, productionHouse: 0, operator: 100 },
  /**
   * The celebrity show is co-funded and the artist takes none of the profit.
   *
   * The house and the operator each put up half the build and each take half
   * of what it clears. The band is on the bill and paid for the season it is
   * having; it is not carrying half a crore of event risk.
   */
  celebrity: { artist: 0, productionHouse: 50, operator: 50 },
  /** The signing fee: the artist's, less the league's cut for running it. */
  acquisition: { artist: 70, productionHouse: 0, operator: 30 },
} as const;

export type SplitName = keyof typeof SPLITS;

/** Live-event split of net gate, under the names the older pages use for it. */
export const EVENT_SPLIT = {
  bands: SPLITS.live.artist,
  productionHouse: SPLITS.live.productionHouse,
  operator: SPLITS.live.operator,
} as const;

/** Audio/video IP split between the artist and the house that financed it. */
export const CONTENT_SPLIT = {
  artists: SPLITS.content.artist,
  productionHouse: SPLITS.content.productionHouse,
} as const;

export interface RevenueShare {
  artist: number;
  productionHouse: number;
  operator: number;
}

/**
 * Divide a pool three ways under a named split.
 *
 * The first two shares are rounded and the operator takes the remainder, so the
 * three figures on screen always add back to the pool exactly. Rounding all
 * three independently leaves a rupee or two unaccounted for, which is invisible
 * on one line and embarrassing on a totals row.
 */
export function divide(total: number, split: SplitName): RevenueShare {
  const s = SPLITS[split];
  const artist = Math.round((total * s.artist) / 100);
  const productionHouse = Math.round((total * s.productionHouse) / 100);
  return { artist, productionHouse, operator: total - artist - productionHouse };
}
