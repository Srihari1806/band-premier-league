/**
 * Show formats — what each night on the calendar actually is.
 *
 * The schedule knew a night was "commercial", "campus" or "cross". That is
 * enough to count fixtures and nothing else: it cannot tell you what room the
 * band walks into, what a ticket costs, or why the night exists. This module
 * is the named catalogue those three words were standing in for.
 *
 * Two tiers, and the distinction matters:
 *
 *   SCORED    the eighteen nights that decide the table. Every band plays the
 *             same formats in the same proportions, so no band can be handed
 *             an easier season than its rivals.
 *   OFF-LADDER  house nights, festival stages and corporate bookings. Real
 *             revenue and real reach, but no points — they are not equal
 *             across bands, so they must never touch the standings.
 *
 * Capacity indices are NORMALISED: the seat-weighted mean across the nine solo
 * formats is exactly 1.0, so the venue ladder redistributes an audience rather
 * than inventing one. The base attendance input still means what it says — the
 * average room across a season. Price indices are deliberately NOT normalised,
 * because the ladder's real shape is that the biggest rooms carry the cheapest
 * tickets; see FORMAT_MIX.grossIdx for what that costs.
 */

import type { FixtureKind } from "./league-format";

/** Where a night happens. Classes, not named venues — those are signed later. */
export type VenueClass =
  | "cafe"
  | "pub"
  | "club"
  | "listening-room"
  | "auditorium"
  | "arena"
  | "campus"
  | "festival-ground"
  | "private";

export interface VenueProfile {
  id: VenueClass;
  name: string;
  /** Rooms of this class the league needs to have relationships with. */
  note: string;
}

export const VENUE_CLASSES: VenueProfile[] = [
  { id: "cafe", name: "Café", note: "80–150 standing. Weeknight-friendly, no backline, lowest cost to stage." },
  { id: "pub", name: "Pub / Brewery", note: "200–300. The circuit's workhorse room — already programmes live music." },
  { id: "club", name: "Club / Live House", note: "400–500. Proper PA and lights, late slot, drinks-led economics." },
  { id: "listening-room", name: "Listening Room", note: "150–250 seated. Silent-room policy, acoustic only." },
  { id: "auditorium", name: "Auditorium", note: "600–900 seated. Ticketed properly, filmed properly." },
  { id: "arena", name: "Amphitheatre / Ground", note: "1,000–1,500. Open air, weekend only, needs permissions." },
  { id: "campus", name: "Campus", note: "Varies by college — main stage, an OAT, or a quad." },
  { id: "festival-ground", name: "Festival Ground", note: "A stage inside somebody else's festival, on their footfall." },
  { id: "private", name: "Private / Corporate", note: "Closed door. No public gate at all — the buyer pays a fee." },
];

export function venueOf(id: VenueClass): VenueProfile {
  return VENUE_CLASSES.find((v) => v.id === id) ?? VENUE_CLASSES[0];
}

/** Off-ladder nights are not fixtures, so they need their own kinds. */
export type ShowKind = FixtureKind | "house" | "festival" | "corporate" | "launch" | "celebrity";

export interface ShowFormat {
  id: string;
  /** What it is called on a poster. */
  name: string;
  kind: ShowKind;
  venue: VenueClass;
  /** Does the night carry the 33 points? */
  scored: boolean;
  /** Nights of this format one band plays per season. */
  perBand: number;
  /** Bands sharing the bill. */
  actsOnStage: number;
  /** Room size relative to the base attendance input. Normalised — see below. */
  capacityIdx: number;
  /** Ticket price relative to the base ticket input. */
  priceIdx: number;
  /** One line on why this night is on the calendar at all. */
  purpose: string;
  /** How the audience gets in. */
  ticketing: string;
}

/*
 * Raw room sizes, before normalisation. These are the numbers to argue with —
 * everything downstream is derived from them.
 */
const RAW_CAPACITY: Record<string, number> = {
  "cafe-set": 100,
  "pub-night": 250,
  "club-headline": 450,
  unplugged: 200,
  "launch-night": 1500,
  "arena-night": 1200,
  "fest-main-stage": 800,
  "campus-battle": 300,
  "quad-session": 250,
};

/**
 * Nights of each format one band plays in a season. THE single owner.
 *
 * Every format literal below reads its `perBand` from here, and so does the
 * weighting that normalises the capacity indices. They used to be two lists,
 * and the moment the celebrity night went from three a band to one they
 * disagreed — `perBand` said 1, the weights still said 3, and
 * `FORMAT_MIX.seatsNeutral` quietly became false while every gate figure in
 * economics.ts took a 7% haircut that never surfaced as an error.
 *
 * The literals cannot read this off SCORED_FORMATS instead: `capacityIndexOf`
 * is called while that array is still being constructed, so the weights have
 * to exist first. One map above both is the way out.
 */
const PER_BAND: Record<string, number> = {
  "cafe-set": 5,
  "pub-night": 5,
  "club-headline": 5,
  unplugged: 4,
  /** One per band, so all 100 bands get the platform exactly once. */
  "launch-night": 1,
  "arena-night": 5,
  "fest-main-stage": 4,
  "campus-battle": 3,
  "quad-session": 3,
  "versus-night": 6,
};

/**
 * Bands sharing one DATED bill, by kind — the other single owner.
 *
 * This is the appearances-versus-events distinction: six versus appearances
 * are three physical nights, a festival stage-day is ten acts on one bill, and
 * a celebrity night is one band with one guest. `national-season.ts` dates the
 * nights and `simulator.ts` prices them; both import this rather than keeping
 * a copy, which is how /economics came to publish 5 celebrity nights against
 * the schedule's 100.
 *
 * `ShowFormat.actsOnStage` reads this rather than restating it. They were
 * allowed to differ once, on the theory that a campus format is "a solo set
 * the league happens to bundle" — but the schedule puts four bands on every
 * campus event, so a solo set is not what it is. The economics believed the
 * abstraction and priced 400 solo campus nights that do not exist, paying one
 * band a whole gate that four of them share.
 */
/**
 * A campus night is ONE band, not a house.
 *
 * It was four — a house taking its whole roster to a college — which made 10
 * campus appearances a band into 2.5 events and a season of 50 nights. But a
 * band operates its own ten campus shows: the campus leg is how a band builds
 * an audience, and four bands sharing one room is four bands splitting one.
 */
export const ACTS_PER_BILL: Record<string, number> = {
  commercial: 1,
  cross: 2,
  campus: 1,
  house: 4,
  festival: 10,
  celebrity: 1,
  launch: 20,
};

/**
 * Rooms a band plays across the season, weighted by how often it plays each.
 *
 * An unweighted mean was right when every format was played the same number of
 * times. It stopped being right the moment the ladder went to 5 cafe nights and
 * 4 unplugged ones — the mean has to follow the season a band actually plays,
 * or the "seats are neutral" guarantee quietly becomes false.
 */
const SOLO_IDS = Object.keys(RAW_CAPACITY);
const WEIGHT_TOTAL = SOLO_IDS.reduce((s, id) => s + (PER_BAND[id] ?? 1), 0);
const MEAN_RAW =
  SOLO_IDS.reduce((s, id) => s + RAW_CAPACITY[id] * (PER_BAND[id] ?? 1), 0) / WEIGHT_TOTAL;

/** Room size as a multiple of the season's average room. Mean is exactly 1.0. */
export function capacityIndexOf(id: string): number {
  const raw = RAW_CAPACITY[id];
  return raw === undefined ? 1 : raw / MEAN_RAW;
}

/** Typical head count at a format, given the scoped base attendance. */
export function seatsAt(formatId: string, baseAttendance: number): number {
  return Math.round(capacityIndexOf(formatId) * baseAttendance);
}

/* ------------------------------------------------------------------ */
/* The twelve scored nights                                            */
/* ------------------------------------------------------------------ */

export const SCORED_FORMATS: ShowFormat[] = [
  {
    id: "cafe-set",
    name: "Café Set",
    kind: "commercial",
    venue: "cafe",
    scored: true,
    perBand: PER_BAND["cafe-set"],
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("cafe-set"),
    priceIdx: 0.6,
    purpose:
      "The band's first night of the season, in the smallest room it will play. Cheap to stage, easy to sell out, and a full café films better than a half-empty club.",
    ticketing: "Low ticket, walk-ins allowed.",
  },
  {
    id: "pub-night",
    name: "Pub Night",
    kind: "commercial",
    venue: "pub",
    scored: true,
    perBand: PER_BAND["pub-night"],
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("pub-night"),
    priceIdx: 0.9,
    purpose:
      "The circuit's default night. Rooms that already programme live music, already hold a licence, and already have a crowd on a Friday.",
    ticketing: "Standard ticket, cover redeemable at the bar.",
  },
  {
    id: "club-headline",
    name: "Club Headline",
    kind: "commercial",
    venue: "club",
    scored: true,
    perBand: PER_BAND["club-headline"],
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("club-headline"),
    priceIdx: 1.1,
    purpose:
      "First night the band headlines a room with a real PA and a real lighting rig. The step up from playing to a room that came for the venue.",
    ticketing: "Standard ticket, late slot.",
  },
  {
    id: "unplugged",
    name: "Unplugged Night",
    kind: "commercial",
    venue: "listening-room",
    scored: true,
    perBand: PER_BAND["unplugged"],
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("unplugged"),
    priceIdx: 1.6,
    purpose:
      "Acoustic, seated, no backline. It strips out everything a loud room hides, which is exactly why it is scored — a band that can only work behind volume shows up here.",
    ticketing: "Highest ticket of the season, smallest room, seated only.",
  },
  {
    id: "launch-night",
    name: "Celebrity Night",
    kind: "celebrity",
    // The guest fills a bigger room than the band can carry alone, which is
    // the whole reason the night is worth a guest fee.
    venue: "arena",
    scored: true,
    perBand: PER_BAND["launch-night"],
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("launch-night"),
    priceIdx: 1.5,
    purpose:
      "The band's original is already out — this is its live premiere, with an established guest artist on the bill. It is the first commercial night after the band's own release week, so the song arrives with the room already knowing it. One per band, so every band gets the platform exactly once.",
    ticketing: "Premium ticket, guest artist named on the bill.",
  },
  {
    id: "arena-night",
    name: "Arena Night",
    kind: "commercial",
    venue: "arena",
    scored: true,
    perBand: PER_BAND["arena-night"],
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("arena-night"),
    priceIdx: 1.2,
    purpose:
      "The biggest room a band carries on its own name, and the last scored commercial night of its season. Only the celebrity night puts it in front of more people, and that room belongs to the guest.",
    ticketing: "Tiered — front standing and general.",
  },
  {
    id: "fest-main-stage",
    name: "Fest Main Stage",
    kind: "campus",
    venue: "campus",
    scored: true,
    perBand: PER_BAND["fest-main-stage"],
    actsOnStage: ACTS_PER_BILL.campus,
    capacityIdx: capacityIndexOf("fest-main-stage"),
    priceIdx: 0.5,
    purpose:
      "A slot on a college's own annual fest, on its own dates. The league brings a booked act, the campus brings the crowd.",
    ticketing: "Bundled into the fest pass; the league takes a fixed slot fee.",
  },
  {
    id: "campus-battle",
    name: "Campus Battle Round",
    kind: "campus",
    venue: "campus",
    scored: true,
    perBand: PER_BAND["campus-battle"],
    actsOnStage: ACTS_PER_BILL.campus,
    capacityIdx: capacityIndexOf("campus-battle"),
    priceIdx: 0.4,
    purpose:
      "Played into a hall that has been listening to campus bands all day. The hardest crowd of the season to win on merit, which is what the fan vote is measuring.",
    ticketing: "Student ticket.",
  },
  {
    id: "quad-session",
    name: "Open Quad Session",
    kind: "campus",
    venue: "campus",
    scored: true,
    perBand: PER_BAND["quad-session"],
    actsOnStage: ACTS_PER_BILL.campus,
    capacityIdx: capacityIndexOf("quad-session"),
    priceIdx: 0.3,
    purpose:
      "Daylight, open ground, no ticket barrier. The cheapest night the league stages and the one that recruits next season's audience.",
    ticketing: "Free entry, registered — the gate here is data, not money.",
  },
  {
    id: "versus-night",
    name: "Versus Night",
    kind: "cross",
    venue: "auditorium",
    scored: true,
    perBand: PER_BAND["versus-night"],
    actsOnStage: 2,
    capacityIdx: 1,
    priceIdx: 1.25,
    purpose:
      "Two bands from the same house, same night, same room, same crowd. The only nights where the comparison is direct and nobody can blame the venue.",
    ticketing: "Co-headline ticket, split gate.",
  },
];

/* ------------------------------------------------------------------ */
/* Off the ladder — real revenue, no points                            */
/* ------------------------------------------------------------------ */

export interface OffLadderFormat extends ShowFormat {
  /** Nights of this format staged nationally across one season. */
  nationalNights: number;
  /** Why it cannot be scored. */
  whyUnscored: string;
}

export const HOUSE_NIGHTS_PER_BAND = 2;
export const CORPORATE_SHOWS_PER_BAND = 3;
export const FESTIVAL_SLOTS_PER_BAND = 3;
/** Acts sharing one festival day. A stage-day, not a single slot. */
export const FESTIVAL_ACTS_PER_STAGE = 10;

/** A house night puts the whole roster on one bill, so it is one night for four bands. */
export const HOUSE_NIGHTS_PER_HOUSE = HOUSE_NIGHTS_PER_BAND;

export function buildOffLadderFormats(
  houses: number,
  zones: number,
  bands: number,
): OffLadderFormat[] {
  return [
    {
      id: "league-launch",
      name: "League Launch",
      kind: "launch",
      venue: "auditorium",
      scored: false,
      perBand: 1,
      actsOnStage: 20,
      capacityIdx: 4,
      priceIdx: 0,
      nationalNights: zones,
      purpose:
        "New Year's Eve, one night per zone, every band in that league on the same stage with the press in the room. It is the only night of the season where the whole roster is introduced at once, and the only one whose job is to make the league exist in public before a single point is scored.",
      ticketing: "Invitation and press. No public gate — the return is coverage, not takings.",
      whyUnscored:
        "Nothing is being judged. Twenty bands sharing an introduction cannot be ranked against each other, and scoring the season's launch would mean the table started before the competition did.",
    },
    {
      id: "house-night",
      name: "House Night",
      kind: "house",
      venue: "arena",
      scored: false,
      perBand: HOUSE_NIGHTS_PER_HOUSE,
      actsOnStage: 4,
      capacityIdx: 3.2,
      priceIdx: 1.3,
      nationalNights: houses * HOUSE_NIGHTS_PER_BAND,
      purpose:
        "Every band a production house signed, on one bill, under the house's own name. It is the only night the house sells itself rather than a band, and the only place a house brand can be built.",
      ticketing: "One ticket for the whole roster — four sets, one gate.",
      whyUnscored:
        "Every band plays exactly two, so these are equal — but four bands on one bill cannot be ranked against a band carrying a solo night. Points here would measure the roster, not the band.",
    },
    {
      id: "festival-stage",
      name: "Festival Stage",
      kind: "festival",
      venue: "festival-ground",
      scored: false,
      perBand: FESTIVAL_SLOTS_PER_BAND,
      actsOnStage: FESTIVAL_ACTS_PER_STAGE,
      capacityIdx: 6,
      priceIdx: 0,
      nationalNights: Math.round((bands * FESTIVAL_SLOTS_PER_BAND) / FESTIVAL_ACTS_PER_STAGE),
      purpose:
        "A league-curated stage-day inside an existing festival — ten acts across one bill. The league supplies a programmed line-up, the festival supplies a crowd the league has not had to buy.",
      ticketing: "No league gate — the festival's own pass admits. Paid as a stage fee.",
      whyUnscored:
        "The crowd is not the league's and the room is not comparable to any other night. Scoring it would measure the festival's draw rather than the band's.",
    },
    {
      id: "corporate-show",
      name: "Corporate Show",
      kind: "corporate",
      venue: "private",
      scored: false,
      perBand: CORPORATE_SHOWS_PER_BAND,
      actsOnStage: 1,
      capacityIdx: 1.5,
      priceIdx: 0,
      nationalNights: bands * CORPORATE_SHOWS_PER_BAND,
      purpose:
        "A private booking — an office party, a product launch, a wedding season slot. The band is paid a flat fee and the league takes a booking margin.",
      ticketing: "No public ticket. Flat fee, invoiced.",
      whyUnscored:
        "A closed room has no public gate to scan and no crowd that chose to be there, so two of the three scoring metrics have nothing to read.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Derived checks                                                      */
/* ------------------------------------------------------------------ */

export const COMMERCIAL_FORMATS = SCORED_FORMATS.filter((f) => f.kind === "commercial");
export const CAMPUS_FORMATS = SCORED_FORMATS.filter((f) => f.kind === "campus");
export const CROSS_FORMATS = SCORED_FORMATS.filter((f) => f.kind === "cross");
/** The nine solo formats, in the order a band plays them. */
export const SOLO_FORMATS = SCORED_FORMATS.filter((f) => f.kind !== "cross");

export function formatOf(id: string): ShowFormat | undefined {
  return SCORED_FORMATS.find((f) => f.id === id);
}

const sumPerBand = (list: ShowFormat[]) => list.reduce((s, f) => s + f.perBand, 0);

/**
 * The mix, and what it does to the season's money. `seatIdx` must be 1.0 —
 * that is the normalisation. `grossIdx` is free to move, and the gap between
 * them is the venue ladder's actual effect on revenue.
 */
/** Off-ladder nights every band plays, on top of the scored ladder. */
export const OFF_LADDER_PER_BAND =
  HOUSE_NIGHTS_PER_BAND + CORPORATE_SHOWS_PER_BAND + FESTIVAL_SLOTS_PER_BAND;

export const FORMAT_MIX = (() => {
  const solo = SOLO_FORMATS;
  const seatIdx = solo.reduce((s, f) => s + f.capacityIdx * f.perBand, 0) / sumPerBand(solo);
  const grossIdx =
    solo.reduce((s, f) => s + f.capacityIdx * f.priceIdx * f.perBand, 0) / sumPerBand(solo);
  return {
    commercialPerBand: sumPerBand(COMMERCIAL_FORMATS),
    campusPerBand: sumPerBand(CAMPUS_FORMATS),
    crossPerBand: sumPerBand(CROSS_FORMATS),
    soloPerBand: sumPerBand(solo),
    totalPerBand: sumPerBand(SCORED_FORMATS),
    /** Scored ladder plus the off-ladder nights — a band's whole season. */
    /** Appearances in the 24-week season. The Dec launch sits outside it. */
    showsPerBand: sumPerBand(SCORED_FORMATS) + OFF_LADDER_PER_BAND,
    celebrityPerBand: sumPerBand(SCORED_FORMATS.filter((f) => f.kind === "celebrity")),
    offLadderPerBand: OFF_LADDER_PER_BAND,
    /** Seat-weighted mean room size. Normalised to 1. */
    seatIdx,
    /** Seat-weighted mean revenue per solo night, against a flat-priced season. */
    grossIdx,
    /** True when the ladder moves seats but not the seat count. */
    seatsNeutral: Math.abs(seatIdx - 1) < 1e-9,
  };
})();

/** Distinct venue classes the league has to have relationships with. */
export const VENUES_IN_USE = [...new Set(SCORED_FORMATS.map((f) => f.venue))];
