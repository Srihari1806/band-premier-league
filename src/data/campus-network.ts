/**
 * The campus network — where the campus leg of the league actually plays.
 *
 * WHAT THIS DOES NOT DO, deliberately: name colleges or state their 2027 fest
 * dates. Two reasons, and both matter.
 *
 * First, this site refers to target colleges by role rather than by name,
 * because a named institution on a public page reads as a signed partner and
 * none of them are. Second, nobody has reliable 2027 fest dates for three
 * hundred campuses — inventing them would put fabricated claims about real
 * institutions on the web, and the booking team would then plan against them.
 *
 * What it DOES do is the part that is genuinely knowable now: how many
 * campuses each zone needs, how they should be distributed between hub cities
 * and satellite towns, what to select them on, and — the useful finding — when
 * the Indian fest calendar actually supports a campus night, checked against
 * the league's own schedule.
 */

import {
  NATIONAL_ZONES,
  FULL_SCHEDULE,
  scheduleFor,
  type ScheduledEvent,
  type NationalZone,
} from "./national-season";
import { seasonPlan } from "./season-plan";

/** Campus slots each zone should line up. */
export const CAMPUSES_PER_ZONE = 60;

/** Share of slots in the zone's hub cities; the rest are satellite towns. */
const HUB_SHARE = 0.7;

/* ------------------------------------------------------------------ *
 * Tiers
 * ------------------------------------------------------------------ */

export interface CampusTier {
  id: string;
  label: string;
  share: number;
  footfall: string;
  nightsEach: string;
  criteria: string[];
}

export const CAMPUS_TIERS: CampusTier[] = [
  {
    id: "flagship",
    label: "Flagship fest campus",
    share: 0.15,
    footfall: "5,000+ across the fest",
    nightsEach: "2 nights a season",
    criteria: [
      "Multi-day cultural fest with an existing main-stage slot",
      "Ticketed or pass-gated entry the league can settle against",
      "Student body large enough to fill a room without external marketing",
      "Committee that has run a paid headline act before",
    ],
  },
  {
    id: "major",
    label: "Major campus",
    share: 0.35,
    footfall: "1,500 – 5,000",
    nightsEach: "1–2 nights",
    criteria: [
      "Annual fest with a music night already in the format",
      "Active music or cultural society to co-promote",
      "Auditorium or open-air ground of 400+ capacity",
    ],
  },
  {
    id: "standard",
    label: "Standard campus",
    share: 0.5,
    footfall: "400 – 1,500",
    nightsEach: "1 night",
    criteria: [
      "Willing to host on a non-fest weekend",
      "Student ambassador in place before the fixture is confirmed",
      "Reachable inside a day's travel from a hub city",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Fest calendar
 *
 * Month-level, because that much is broadly stable across Indian academic
 * calendars. Exact dates are not, and are not claimed here.
 * ------------------------------------------------------------------ */

export type FestIntensity = "peak" | "high" | "moderate" | "low" | "closed";

export interface FestMonth {
  month: string;
  intensity: FestIntensity;
  note: string;
}

/**
 * The college year, not the school year.
 *
 * An earlier version of this treated May and June as dead on the assumption of
 * a long school-style summer holiday. Colleges do not work that way: most
 * professional campuses run shorter breaks, many run summer terms, and June is
 * intake and orientation season — one of the better moments of the year to put
 * a band in front of a room full of people who have just arrived.
 *
 * Fest season is still the peak and nothing here pretends otherwise. What
 * changed is that the shoulder months are viable rather than closed, which is
 * what lets the campus leg run the full season instead of being crushed into
 * a quarter of it.
 */
export const FEST_CALENDAR: FestMonth[] = [
  { month: "Jan", intensity: "high", note: "Spring fest season opens; committees are booking headliners." },
  { month: "Feb", intensity: "peak", note: "The densest fest month in the Indian college year." },
  { month: "Mar", intensity: "high", note: "Fests continue until end-semester exams start to bite." },
  { month: "Apr", intensity: "moderate", note: "Early April still carries fests; the back half runs into exams. Bookable, with the date chosen around the campus's own calendar." },
  { month: "May", intensity: "moderate", note: "Exams then a short break. Campuses that run summer terms stay live, and those are the ones to book here." },
  { month: "Jun", intensity: "high", note: "New intake and orientation. A fresh audience that has just arrived and is looking for something to join." },
];

export const FEST_INTENSITY_META: Record<
  FestIntensity,
  { label: string; accent: string; viable: boolean }
> = {
  peak: { label: "Peak", accent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300", viable: true },
  high: { label: "High", accent: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300", viable: true },
  moderate: { label: "Moderate", accent: "border-blue-500/40 bg-blue-500/10 text-blue-300", viable: true },
  low: { label: "Low", accent: "border-amber-500/40 bg-amber-500/10 text-amber-300", viable: false },
  closed: { label: "Closed", accent: "border-rose-500/40 bg-rose-500/10 text-rose-300", viable: false },
};

/* ------------------------------------------------------------------ *
 * Slot distribution
 * ------------------------------------------------------------------ */

export interface CampusAllocation {
  location: string;
  kind: "hub" | "satellite";
  slots: number;
  note: string;
}

export interface ZoneCampusPlan {
  zone: NationalZone;
  totalSlots: number;
  /** Campus nights this zone must actually stage. */
  nightsNeeded: number;
  nightsPerCampus: number;
  allocations: CampusAllocation[];
  tierCounts: { tier: CampusTier; count: number }[];
}

export function campusPlan(
  zone: NationalZone,
  schedule: ScheduledEvent[] = FULL_SCHEDULE,
): ZoneCampusPlan {
  const bands = zone.houses * zone.bandsPerHouse;
  const nightsNeeded = schedule.filter(
    (e) => e.zoneSlug === zone.slug && e.kind === "campus",
  ).length;

  const hubSlots = Math.round(CAMPUSES_PER_ZONE * HUB_SHARE);
  const satelliteSlots = CAMPUSES_PER_ZONE - hubSlots;

  const shareTotal = zone.hubCities.reduce((s, c) => s + c.fixtureShare, 0) || 1;
  const allocations: CampusAllocation[] = zone.hubCities.map((c) => ({
    location: c.city,
    kind: "hub" as const,
    slots: Math.max(1, Math.round((hubSlots * c.fixtureShare) / shareTotal)),
    note: "Hub city — campuses already inside the fixture footprint",
  }));

  allocations.push({
    location: "Satellite towns",
    kind: "satellite",
    slots: satelliteSlots,
    note: "Outside the hub cities. Campus nights are bought reach, so they should go where the ticketed circuit does not already reach.",
  });

  const tierCounts = CAMPUS_TIERS.map((tier) => ({
    tier,
    count: Math.round(CAMPUSES_PER_ZONE * tier.share),
  }));

  return {
    zone,
    totalSlots: allocations.reduce((s, a) => s + a.slots, 0),
    nightsNeeded,
    nightsPerCampus: nightsNeeded / CAMPUSES_PER_ZONE,
    allocations,
    tierCounts,
  };
}

export const CAMPUS_PLANS = NATIONAL_ZONES.map((z) => campusPlan(z));

/**
 * The campus network for one season.
 *
 * Season 1 runs one zone, so it is 60 campuses and one zone's nights — not the
 * national 300. A page showing the national network under a season-1 heading
 * is describing a partnership footprint the launch year does not have.
 */
export function campusPlansFor(seasonId: string): ZoneCampusPlan[] {
  const slugs = seasonPlan(seasonId).zoneSlugs;
  const schedule = scheduleFor(seasonId);
  return NATIONAL_ZONES.filter((z) => slugs.includes(z.slug)).map((z) =>
    campusPlan(z, schedule),
  );
}

export function campusTotalsFor(seasonId: string) {
  const plans = campusPlansFor(seasonId);
  return {
    campuses: plans.reduce((s, p) => s + p.totalSlots, 0),
    nights: plans.reduce((s, p) => s + p.nightsNeeded, 0),
    perZone: CAMPUSES_PER_ZONE,
    zones: plans.length,
  };
}

export const CAMPUS_TOTALS = campusTotalsFor("s2");

/* ------------------------------------------------------------------ *
 * The finding: does the fixture calendar sit inside fest season?
 * ------------------------------------------------------------------ */

export interface CampusMonthLoad {
  month: string;
  nights: number;
  intensity: FestIntensity;
  viable: boolean;
}

/** Campus nights the schedule actually places in each month. */
export function campusLoadByMonth(
  schedule: ScheduledEvent[] = FULL_SCHEDULE,
): CampusMonthLoad[] {
  return FEST_CALENDAR.map((f) => {
    const nights = schedule.filter(
      (e) => e.kind === "campus" && e.dateLabel.includes(f.month),
    ).length;
    return {
      month: f.month,
      nights,
      intensity: f.intensity,
      viable: FEST_INTENSITY_META[f.intensity].viable,
    };
  });
}

export const CAMPUS_LOAD = campusLoadByMonth();

export function campusLoadFor(seasonId: string): CampusMonthLoad[] {
  return campusLoadByMonth(scheduleFor(seasonId));
}

export function campusClashFor(seasonId: string) {
  const load = campusLoadFor(seasonId);
  return {
    total: load.reduce((s, m) => s + m.nights, 0),
    inSeason: load.filter((m) => m.viable).reduce((s, m) => s + m.nights, 0),
    offSeason: load.filter((m) => !m.viable).reduce((s, m) => s + m.nights, 0),
  };
}

export const CAMPUS_CLASH = campusClashFor("s2");

export const CAMPUS_SELECTION_NOTE =
  "Campuses are selected on engagement rather than prestige: an active music society, a committee that has booked a paid act before, and a student ambassador in place before the fixture is confirmed. A large college with a dormant cultural body is a worse night than a small one with a live scene.";
