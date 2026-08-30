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
 *   SCORED    the twelve nights that decide the table. Every band plays the
 *             same twelve formats, so no band can be handed an easier season.
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
export type ShowKind = FixtureKind | "house" | "festival" | "corporate";

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
  "launch-night": 700,
  "arena-night": 1200,
  "fest-main-stage": 800,
  "campus-battle": 300,
  "quad-session": 250,
};

const SOLO_IDS = Object.keys(RAW_CAPACITY);
const MEAN_RAW = SOLO_IDS.reduce((s, id) => s + RAW_CAPACITY[id], 0) / SOLO_IDS.length;

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
    perBand: 1,
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
    perBand: 1,
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
    perBand: 1,
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
    perBand: 1,
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("unplugged"),
    priceIdx: 1.6,
    purpose:
      "Acoustic, seated, no backline. It strips out everything a loud room hides, which is exactly why it is scored — a band that can only work behind volume shows up here.",
    ticketing: "Highest ticket of the season, smallest room, seated only.",
  },
  {
    id: "launch-night",
    name: "Launch Night",
    kind: "commercial",
    venue: "auditorium",
    scored: true,
    perBand: 1,
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
    perBand: 1,
    actsOnStage: 1,
    capacityIdx: capacityIndexOf("arena-night"),
    priceIdx: 1.2,
    purpose:
      "The biggest room a league band plays before the play-offs, and the last scored commercial night of its season.",
    ticketing: "Tiered — front standing and general.",
  },
  {
    id: "fest-main-stage",
    name: "Fest Main Stage",
    kind: "campus",
    venue: "campus",
    scored: true,
    perBand: 1,
    actsOnStage: 1,
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
    perBand: 1,
    actsOnStage: 1,
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
    perBand: 1,
    actsOnStage: 1,
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
    perBand: 3,
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

export const HOUSE_NIGHTS_PER_HOUSE = 2;
export const FESTIVAL_STAGES_PER_ZONE = 2;
export const CORPORATE_SHOWS_PER_BAND = 1;

export function buildOffLadderFormats(
  houses: number,
  zones: number,
  bands: number,
): OffLadderFormat[] {
  return [
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
      nationalNights: houses * HOUSE_NIGHTS_PER_HOUSE,
      purpose:
        "Every band a production house signed, on one bill, under the house's own name. It is the only night the house sells itself rather than a band, and the only place a house brand can be built.",
      ticketing: "One ticket for the whole roster — four sets, one gate.",
      whyUnscored:
        "Four bands on a shared bill cannot be ranked against a band playing a solo night. Points here would reward roster size, not performance.",
    },
    {
      id: "festival-stage",
      name: "Festival Stage",
      kind: "festival",
      venue: "festival-ground",
      scored: false,
      perBand: 1,
      actsOnStage: 3,
      capacityIdx: 6,
      priceIdx: 0,
      nationalNights: zones * FESTIVAL_STAGES_PER_ZONE,
      purpose:
        "A league-curated stage inside an existing festival. The league supplies a programmed line-up, the festival supplies a crowd the league has not had to buy.",
      ticketing: "No league gate — the festival's own pass admits. Paid as a stage fee.",
      whyUnscored:
        "Only a handful of bands get a slot and the crowd is not the league's. Scoring it would hand points to whoever the promoter happened to pick.",
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
        "A closed room with an audience that did not choose to be there measures nothing the league is trying to measure.",
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
