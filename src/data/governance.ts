/**
 * Rights, governance and the things that go wrong.
 *
 * The competition format lives in `league-format.ts`, the money in
 * `economics.ts` / `event-model.ts` / `regulations.ts`. This file holds the
 * part a production house's lawyer reads: who owns what, what happens when a
 * venue cancels, how long an artist is tied up for, and which questions are
 * still genuinely open.
 *
 * IMPORTANT: this is a commercial framework for discussion, not legal drafting.
 * Indian copyright, performer rights, GST and contract law all need a real
 * entertainment lawyer and CA before any of it becomes an enforceable
 * agreement. That caveat is published on the page too, not just here.
 */

/* ------------------------------------------------------------------ *
 * Rights ownership
 * ------------------------------------------------------------------ */

export interface RightsRow {
  asset: string;
  owner: string;
  artistPosition: string;
  operatorPosition: string;
  note: string;
}

export const RIGHTS_MATRIX: RightsRow[] = [
  {
    asset: "Master recording",
    owner: "Production House",
    artistPosition: "Agreed master royalty / revenue share",
    operatorPosition: "Limited promotional licence",
    note: "Applies to songs the house financed. A track licensed in from elsewhere follows its own agreement.",
  },
  {
    asset: "Composition (song-writing)",
    owner: "The actual writers",
    artistPosition: "Their documented share of the split sheet",
    operatorPosition: "None",
    note: "Master is not composition. Paying for a recording does not buy the underlying song — a mistake worth several lawsuits if it is left vague.",
  },
  {
    asset: "Music video",
    owner: "Production House",
    artistPosition: "Per artist agreement",
    operatorPosition: "League / broadcast licence",
    note: "Commissioned asset. Creator credits and any third-party rights survive it.",
  },
  {
    asset: "League fixture footage",
    owner: "League Operator",
    artistPosition: "Usage rights for own promotion",
    operatorPosition: "Full ownership",
    note: "Central media right. A house cannot separately sell its band's match footage — that is what makes the season package worth buying at all.",
  },
  {
    asset: "Pre-existing catalogue",
    owner: "Artist",
    artistPosition: "Unchanged",
    operatorPosition: "None",
    note: "Anything the band made before the league stays entirely theirs. The draft buys forward participation, not a back catalogue.",
  },
  {
    asset: "Band name & identity",
    owner: "Artist",
    artistPosition: "Retained",
    operatorPosition: "Licence for league use",
    note: "The house represents the act for a term; it does not acquire the act.",
  },
];

/** Composition ownership is a per-song split sheet, never a fixed house rule. */
export const SPLIT_SHEET_RULE =
  "Every release files a split sheet before it goes live: composition shares must total 100% and name every writer. The league does not set the percentages — a composer and lyricist can agree 50/50, 60/40 or anything else — it only requires that they are agreed and documented before a rupee moves.";

/* ------------------------------------------------------------------ *
 * Contract term and artist mobility
 * ------------------------------------------------------------------ */

export interface TermRule {
  question: string;
  answer: string;
  detail: string;
}

export const TERM_RULES: TermRule[] = [
  {
    question: "How long does the house's agreement run?",
    answer: "One season + a defined exploitation window",
    detail:
      "Roughly a 12-month league and development term, plus an agreed exclusive window on the IP the house financed. Deliberately short — a multi-year blanket lock-in on an emerging artist is the fastest way to make good acts refuse to enter.",
  },
  {
    question: "Can an artist leave after winning?",
    answer: "Yes, once the term expires",
    detail:
      "Winning does not extend anyone's contract. Outstanding obligations survive — a master the house paid for stays the house's — but the artist is not property.",
  },
  {
    question: "Can a house transfer a band to another house?",
    answer: "Not mid-season; after, only with consent",
    detail:
      "During the season, only with operator approval. Afterwards it requires the artist's agreement, preserved IP obligations and disclosed terms. Nobody gets traded without being asked.",
  },
  {
    question: "What if a band breaks out?",
    answer: "Buyout mechanism",
    detail:
      "A label or third party can acquire the house's remaining contractual rights on an agreed formula — outstanding investment plus a premium. The house is not wiped out by success it paid for, and the artist is not trapped by it.",
  },
  {
    question: "Can an artist sign with a label independently?",
    answer: "After the term, freely",
    detail:
      "During an exclusive term, not for conflicting rights without consent. Which is another argument for keeping the term short.",
  },
  {
    question: "What happens when the season ends?",
    answer: "Competition rights end; contracts continue only where they say so",
    detail:
      "League participation stops. Legitimately acquired IP rights continue for their agreed period. There is no automatic renewal and no perpetual retention.",
  },
];

/* ------------------------------------------------------------------ *
 * When things go wrong
 * ------------------------------------------------------------------ */

export interface Contingency {
  scenario: string;
  ruling: string;
  detail: string;
}

export const CONTINGENCIES: Contingency[] = [
  {
    scenario: "A venue cancels",
    ruling: "Replace, then reschedule",
    detail:
      "Operator runs a replacement protocol — same city, comparable capacity, comparable technical spec and ticket price. If no room can be found the fixture is rescheduled and tickets transfer or refund. No band loses points for a venue's failure.",
  },
  {
    scenario: "A mentor or celebrity cancels",
    ruling: "No points effect, ever",
    detail:
      "Celebrity participation is never a competitive requirement. The operator substitutes, reschedules, converts to a digital session or drops the appearance. A band cannot be punished for someone else's diary.",
  },
  {
    scenario: "An artist refuses to perform",
    ruling: "Depends entirely on why",
    detail:
      "Medical, force majeure or a genuine contractual dispute carries no penalty. An unjustified refusal escalates: warning, then penalty, then forfeited points, then suspension. A house must not be able to manufacture a withdrawal to manipulate the table.",
  },
  {
    scenario: "A production house withdraws",
    ruling: "It cannot simply abandon four bands",
    detail:
      "Pre-season, the purse commitment is forfeit. Mid-season, the operator can appoint replacement management, transfer operational responsibility, protect the artists' IP and complete the fixtures. Material breach can terminate the franchise.",
  },
  {
    scenario: "Fan votes look manipulated",
    ruling: "Invalidated under published rules",
    detail:
      "Verified accounts, one vote per user per fixture, a fixed window, device and duplicate detection, immutable logs and an audit trail. The operator can void demonstrably fraudulent votes — but only under rules published in advance.",
  },
  {
    scenario: "Ticket numbers are disputed",
    ruling: "Scanned entries, not tickets sold",
    detail:
      "Gate points use verified scanned attendance over certified venue capacity. Buying 500 tickets does not put 500 people in the room, and only the second one counts.",
  },
  {
    scenario: "An event loses money",
    ruling: "The operator carries league event economics",
    detail:
      "Within the approved event budget, the operator carries it. The house carries its own artist and development obligations, the venue its own commercial risk. A house never becomes liable for unlimited event losses because its band happened to be playing.",
  },
];

/* ------------------------------------------------------------------ *
 * Venture funding structures
 *
 * Deliberately expressed as STRUCTURES rather than as a named counterparty.
 * Naming a backing partner on a public page — alongside the equity you intend
 * to concede — is a negotiating position published to the person you are
 * negotiating with. The site-wide convention of naming partners by role
 * applies here more than anywhere.
 * ------------------------------------------------------------------ */

export interface FundingOption {
  id: string;
  name: string;
  equity: string;
  summary: string;
  partnerGets: string[];
  founderKeeps: string;
  tradeoff: string;
  recommended?: boolean;
}

export const FUNDING_OPTIONS: FundingOption[] = [
  {
    id: "a",
    name: "Option A — Strategic backing, no equity",
    equity: "0%",
    summary:
      "The partner provides capital and ecosystem support in exchange for status, branding and a revenue share on agreed activities — not ownership.",
    partnerGets: [
      "Founding partner billing",
      "Branding across the league",
      "Revenue share on agreed activity",
      "First-right on future partnerships",
    ],
    founderKeeps: "100%",
    tradeoff:
      "Safest on the cap table, but a partner with no ownership is a partner with less reason to keep showing up in year two.",
  },
  {
    id: "b",
    name: "Option B — Backing plus equity",
    equity: "5–10%",
    summary:
      "A cash investment at an agreed valuation. Straightforward, but it hands over the stake on day one regardless of what actually gets delivered.",
    partnerGets: ["Equity stake", "Board or observer rights", "Full partner status"],
    founderKeeps: "90–95%",
    tradeoff:
      "If the cash is modest and the founder brings the IP, concept and product, the honest number is nearer the bottom of that range than the top.",
  },
  {
    id: "c",
    name: "Option C — Milestone-earned equity",
    equity: "Up to 5%, in tranches",
    summary:
      "Equity vests against delivery rather than intent: partnership and launch support, campuses activated, season launched, sponsor revenue generated.",
    partnerGets: [
      "2% — partnership and launch support",
      "1% — campus network activated",
      "1% — Season 1 delivered",
      "1% — sponsor revenue target hit",
    ],
    founderKeeps: "95%+",
    tradeoff:
      "Strongest structure of the three: the partner is paid for outcomes, and nothing is conceded for a promise.",
    recommended: true,
  },
];

export interface FundAllocation {
  line: string;
  amount: number;
  note: string;
}

/** Illustrative deployment of a ₹30L backing round. */
export const FUND_ALLOCATION: FundAllocation[] = [
  { line: "Working capital", amount: 500000, note: "Runway through the season's cash-flow troughs" },
  { line: "Technology & platform", amount: 500000, note: "Ticketing, voting, standings, the economics layer" },
  { line: "League setup", amount: 500000, note: "Fixtures, venue contracting, operations" },
  { line: "Marketing", amount: 400000, note: "League launch and season campaign" },
  { line: "Business development", amount: 300000, note: "Sponsor and production-house acquisition" },
  { line: "Legal & IP", amount: 300000, note: "Contracts, rights framework, entity work" },
  { line: "Contingency", amount: 300000, note: "The line every plan needs and most omit" },
  { line: "Content", amount: 200000, note: "League content and season films" },
];

export const FUND_TOTAL = FUND_ALLOCATION.reduce((s, f) => s + f.amount, 0);

export const FOUNDER_COMP = {
  monthlySalaryLow: 50000,
  monthlySalaryHigh: 75000,
  principle:
    "Three separate things, deliberately not blended: a salary for the work being done now, equity for having created the company, and a bonus only against agreed milestones.",
  warning:
    "The operator's 30% of net gate belongs to the company, not to the founder. It pays operations, staff, technology, marketing, events and salary. Whatever survives that is company profit — which is what makes the equity worth holding in the first place.",
};

/* ------------------------------------------------------------------ *
 * Still open
 *
 * Publishing the unresolved questions is not a weakness. Anyone serious will
 * ask them within ten minutes, and having them listed says they have been
 * thought about rather than missed.
 * ------------------------------------------------------------------ */

export interface OpenQuestion {
  area: string;
  question: string;
  status: "decided" | "leaning" | "open";
  position: string;
}

export const OPEN_QUESTIONS: OpenQuestion[] = [
  {
    area: "Creative budget",
    question: "Is the creative allocation a per-band entitlement or a house pot?",
    status: "leaning",
    position:
      "Built as a ₹1.25L per-band entitlement, because a house pot lets a franchise starve three bands to gold-plate one and the fairness argument collapses. An earlier draft had it as a ₹5L house pot — this is the live contradiction to settle first.",
  },
  {
    area: "Roster",
    question: "Are solo artists admitted?",
    status: "leaning",
    position:
      "No, for Season 1 — the property is a band league. A solo division is a later expansion, not a Season 1 compromise.",
  },
  {
    area: "Acquisition fee",
    question: "How does the winning bid split between artist and league?",
    status: "open",
    position:
      "The artist must visibly receive a defined portion, or the draft reads as the house paying the operator for a person. Needs contract and tax advice before a number is published.",
  },
  {
    area: "Tax",
    question: "Who bears GST, TDS and withholding across the splits?",
    status: "open",
    position:
      "Depends on transaction structure. A CA has to settle this before the 40/30/30 can be quoted as net-in-hand to anybody.",
  },
  {
    area: "Net gate",
    question: "Exactly which deductions come off before the split?",
    status: "leaning",
    position:
      "Ticketing and payment fees, refunds and applicable taxes. The precise definition needs to be written into the commercial agreement rather than assumed.",
  },
  {
    area: "Prize money",
    question: "Is 70/30 band/house the right split?",
    status: "leaning",
    position:
      "Rewards the artists while acknowledging the house's investment. Worth testing against what houses will actually accept.",
  },
  {
    area: "Mentors",
    question: "Who pays, and how are mentors matched?",
    status: "leaning",
    position:
      "House-funded within a ₹2L cap, matched by two-sided preference from a central approved list. Operator funds only league-level appearances.",
  },
  {
    area: "Sponsorship",
    question: "Who owns an artist-specific sponsor deal?",
    status: "leaning",
    position:
      "Artist and house per the artist agreement — but if the operator sourced it, a facilitation commission applies. Needs a written origination rule.",
  },
];

export const STATUS_META: Record<OpenQuestion["status"], { label: string; accent: string }> = {
  decided: { label: "Decided", accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  leaning: { label: "Working position", accent: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  open: { label: "Unresolved", accent: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
};

export const BASIS_OF_PREPARATION =
  "This handbook is a commercial framework written to be argued with, not a legal document and not a record of results. Every figure is a Season 1 planning assumption; every rule is a proposal. Indian copyright, performer rights, GST and contract law need a qualified entertainment lawyer and a CA before any of it becomes enforceable. Nothing here reports what any real band, house, partner or sponsor has earned or agreed.";
