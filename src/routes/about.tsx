import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users,
  Building2,
  MapPin,
  Megaphone,
  Music,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  DollarSign,
  Tv,
  Calendar,
  Layers,
  ArrowDown,
  Target,
  FileMusic,
  HelpCircle,
  Handshake,
  Percent,
  CheckCircle2,
  Youtube,
  Radio,
  Lock,
  Globe,
  Wallet,
  Briefcase,
  RefreshCw,
  Landmark,
  Trophy,
} from "lucide-react";
import { SPONSOR_INVENTORY, SPONSOR_TIER_META, sponsorInventoryValue } from "@/data/event-model";
import { ZONE_HUBS, NATIONAL_TOTAL_HOUSES, NATIONAL_TOTAL_BANDS } from "@/data/league-format";
import { inr, inrCompact } from "@/data/economics";

const CAMPUS_STAGES = [
  {
    step: "01",
    title: "Campus Clubs Activate",
    desc: "A student ambassador is appointed per college and the campus music club becomes a local chapter — promoting fixtures, running watch parties and selling into their own year groups.",
  },
  {
    step: "02",
    title: "Colleges Compete",
    desc: "An inter-college table ranks campuses on tickets sold, turnout, shares and content views. The winning college hosts a live fixture on their own campus.",
  },
  {
    step: "03",
    title: "Circles Merge",
    desc: "Club-to-club rivalry turns into one connected inter-community circuit across cities — the audience stops being per-college and becomes regional.",
  },
  {
    step: "04",
    title: "Talent Registers",
    desc: "Musicians inside those circles — players, vocalists, producers, sound engineers, filmmakers — register on the platform and enter the ecosystem as artists, bands and crew.",
  },
];

const CAMPUS_FOOTPRINT = [
  { city: "Hyderabad", campuses: "5–10 campuses", ambassadors: "5–10 ambassadors" },
  { city: "Visakhapatnam", campuses: "3–5 campuses", ambassadors: "3–5 ambassadors" },
  { city: "Vijayawada", campuses: "2–4 campuses", ambassadors: "2–4 ambassadors" },
];

/**
 * Rights sit in two separate buckets and conflating them is the single most
 * expensive mistake this kind of league can make. The songs belong to the
 * people who made and financed them; the league footage belongs to the league.
 */
const RIGHTS_SPLIT = [
  {
    title: "Audio & Video IP",
    owner: "Artist 50% · Production House 50%",
    icon: Music,
    accent: "border-blue-400/25 bg-blue-400/5",
    text: "text-blue-400",
    detail:
      "Original songs, masters and music videos belong to the artist and the house that financed them. The house can release through its own channels or license onward to a label or distributor.",
    examples: ["Original singles & masters", "Music videos", "Streaming royalties", "Sync placements"],
  },
  {
    title: "League Footage",
    owner: "Kalakshetra (central)",
    icon: Tv,
    accent: "border-primary/25 bg-primary/5",
    text: "text-primary-glow",
    detail:
      "Concert and fixture footage is a central media right. A production house does not separately sell its band's match footage — the season is packaged and sold once, as one property.",
    examples: ["Fixture recordings", "Season highlight package", "Rivalry & finals films", "OTT / broadcast deal"],
  },
];

const CHANNEL_TIERS = [
  {
    tier: "League",
    name: "Kalakshetra Channel",
    icon: Trophy,
    accent: "text-primary-glow border-primary/25 bg-primary/5",
    owns: "Competition content",
    content: ["Fixture films & highlights", "Standings and matchday coverage", "Rivalry, eliminator, final", "Behind the scenes"],
  },
  {
    tier: "Franchise",
    name: "Production House Channel",
    icon: Building2,
    accent: "text-blue-400 border-blue-400/25 bg-blue-400/5",
    owns: "Artist catalogue it financed",
    content: ["Music videos & originals", "Studio and making-of content", "Artist interviews", "Roster promotion"],
  },
  {
    tier: "Artist",
    name: "The Band's Own Channel",
    icon: Music,
    accent: "text-amber-400 border-amber-400/25 bg-amber-400/5",
    owns: "The long-term relationship",
    content: ["Originals & acoustic versions", "Shorts, vlogs, live sessions", "Collaborations", "Direct fan community"],
  },
];

const PREMIERE_WINDOW = [
  { mark: "T–7", title: "Campaign Opens", detail: "Teasers, artwork reveal and the fixture tie-in announcement go live." },
  { mark: "T–1", title: "Exclusive First Window", detail: "A 24-hour exclusive premiere with one platform partner — a first-window licence, never a permanent assignment." },
  { mark: "T–0", title: "Global Release", detail: "The track goes wide across every platform, timed to land into a scheduled live fixture." },
];

/** What the operator's 30% of net gate actually funds. */
const OPERATOR_SPEND = [
  { label: "Event managers & on-ground crew", icon: Users },
  { label: "Venue acquisition & security coordination", icon: MapPin },
  { label: "Ticketing and league platform technology", icon: Layers },
  { label: "Fan voting & verification systems", icon: ShieldCheck },
  { label: "Season marketing & campus activation", icon: Megaphone },
  { label: "Prize pool & league administration", icon: Trophy },
];

/** Why a franchise signs four bands rather than betting everything on one. */
const PORTFOLIO_LOGIC = [
  { outcome: "Breakout", desc: "Catalogue travels past the league — sync, brand deals and booking value that outlive the season.", tone: "border-emerald-500/30 bg-emerald-500/5", label: "text-emerald-400" },
  { outcome: "Solid", desc: "Reliable gate, steady streaming, a fanbase worth touring into a second season.", tone: "border-cyan-500/25 bg-cyan-500/5", label: "text-cyan-400" },
  { outcome: "Developing", desc: "Recovers most of its cost and holds option value into the next cycle.", tone: "border-amber-500/25 bg-amber-500/5", label: "text-amber-400" },
  { outcome: "Writes Down", desc: "Does not find an audience. One position is written off — not the portfolio.", tone: "border-rose-500/25 bg-rose-500/5", label: "text-rose-400" },
];

const FLYWHEEL = [
  "Production house invests",
  "Artist develops & records",
  "Original + music video ships",
  "Live fixture sells tickets",
  "Fans vote, clips travel",
  "Points & standings move",
  "Streaming and following grow",
  "Bigger room next fixture",
  "Sponsor value rises",
  "More capital in",
];

/**
 * Chapter sizing as the league expands. AP/TS is the deep pilot; every
 * subsequent state opens at half the roster until it proves out.
 */
/** Derived from the shared zone table so it can never disagree with it. */
const EXPANSION_MARKETS = ZONE_HUBS.map((z) => ({
  market: z.name.replace(/ League$/, ""),
  houses: z.houses,
  bands: z.bandsPerHouse,
  languages: z.languages.join(", "),
  status: z.status,
}));


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Kalakshetra — India's Independent Music League" },
      {
        name: "description",
        content:
          "Kalakshetra connects artists, franchises, venues, and communities. Production houses invest in original music production, bands compete on a live points table, and we build long-term value.",
      },
    ],
  }),
  component: AboutPage,
});

const PROBLEMS = [
  {
    title: "Artist Opportunity Gap",
    desc: "Independent artists struggle to discover opportunities and find stable revenue streams.",
    icon: Music,
    color: "from-amber-500/20 to-amber-500/5",
    glow: "shadow-amber-500/10",
  },
  {
    title: "Talent Discovery",
    desc: "Production houses and labels struggle to discover vetted, high-quality independent talent.",
    icon: Building2,
    color: "from-blue-500/20 to-blue-500/5",
    glow: "shadow-blue-500/10",
  },
  {
    title: "Venue Consistency",
    desc: "Live music venues and cafes struggle to consistently book artists and fill seats on off-peak nights.",
    icon: MapPin,
    color: "from-purple-500/20 to-purple-500/5",
    glow: "shadow-purple-500/10",
  },
  {
    title: "Sponsor Activation",
    desc: "Brands and corporate sponsors struggle to directly engage local music communities and youth demographics.",
    icon: Megaphone,
    color: "from-rose-500/20 to-rose-500/5",
    glow: "shadow-rose-500/10",
  },
  {
    title: "Disconnected Silos",
    desc: "The entire live music ecosystem operates in disconnected segments, leaving value on the table.",
    icon: Layers,
    color: "from-emerald-500/20 to-emerald-500/5",
    glow: "shadow-emerald-500/10",
  },
];

const FLOW_NODES = [
  { id: "artists", label: "Artists & Bands", icon: Music, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { id: "houses", label: "Production Houses", icon: Building2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { id: "operator", label: "Kalakshetra Operator", icon: Sparkles, color: "text-primary-glow bg-primary/10 border-primary/20" },
  { id: "venues", label: "Venues · Sponsors · Events", icon: MapPin, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { id: "audience", label: "Audience & Fans", icon: Users, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
];

const TIMELINE_STEPS = [
  { title: "Artists & Bands Register", desc: "Build portfolios and enter the ecosystem database." },
  { title: "Production Houses Discover Talent", desc: "Scan the database to sign promising creators." },
  { title: "Investment & Partnership", desc: "Franchises invest in original music production based on the number of franchises and registered bands count to build their roster." },
  { title: "Music + Video Production", desc: "Produce high-quality original singles and music videos." },
  { title: "Live Shows", desc: "Perform live on tour across partner venues and cafe stages." },
  { title: "Season Points Table", desc: "Bands earn points from attendance, revenue, and verified votes." },
  { title: "Top 25% Qualify", desc: "The highest ranking acts secure their spot in the grand finals." },
  { title: "Kalakshetra League", desc: "Broadcasted final matches to determine the season champion." },
  { title: "Audience", desc: "Fans stream the music, attend the matches, and vote for winners." },
];

const PILOT_CITIES = [
  { name: "Hyderabad", status: "Launching Season I", desc: "Pilot cohort of 4 bands, 6 venues, and 24 live tournament shows." },
  { name: "Visakhapatnam", status: "Coming Soon", desc: "Expansion cohort scheduled for Season II qualifiers." },
  { name: "Vijayawada", status: "Coming Soon", desc: "Regional campus tournaments and cafe fixtures." },
];

const PARTICIPANTS = [
  { name: "Artists", desc: "Singers, songwriters, and instrumentalists.", link: "/onboarding", type: "artist" },
  { name: "Bands", desc: "Multi-member musical acts and touring lineups.", link: "/join/band", type: "band" },
  { name: "Production Houses", desc: "Labels, studios, and investor franchises.", link: "/join/production-house", type: "production_house" },
  { name: "Venues", desc: "Cafes, clubs, and performance spaces.", link: "/join/venue", type: "venue" },
  { name: "Sponsors", desc: "Brand partners seeking community engagement.", link: "/join/sponsor", type: "sponsor" },
  { name: "Event Managers", desc: "Logistics and on-ground match coordinators.", link: "/join/event-manager", type: "event_manager" },
];

function AboutPage() {
  const [activeExplainTab, setActiveExplainTab] = useState<
    "comparison" | "matrix" | "rights" | "venues" | "sponsors" | "pipeline"
  >("comparison");
  const finalistsPerMarket = 5;
  const totalRegionalFinalists = EXPANSION_MARKETS.length * finalistsPerMarket;
  const nationalBands = NATIONAL_TOTAL_BANDS;
  const nationalHouses = NATIONAL_TOTAL_HOUSES;
  const rateCardValue = sponsorInventoryValue();
  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/4 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/3 blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="relative pt-28 pb-20 px-4 text-center max-w-5xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary-glow text-[10px] uppercase font-bold tracking-widest">
              <Sparkles size={10} /> Pitch Deck
            </div>
            <h1 className="text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground">
              KALAKSHETRA
            </h1>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
              The Home of <span className="gradient-text">Independent Music</span>
            </h2>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              India's creator ecosystem connecting artists, production houses, venues, sponsors, event managers, and audiences through one unified music platform.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/onboarding"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white shadow-lg"
              >
                Join the Ecosystem <ArrowRight size={14} />
              </Link>
              <Link
                to="/league"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/80 backdrop-blur px-6 py-3 text-xs font-bold hover:bg-secondary transition text-white"
              >
                Explore League
              </Link>
            </div>
          </motion.div>
        </section>

        {/* SECTION 1: THE PROBLEM */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Problem</h2>
            <h3 className="text-3xl font-display font-bold text-white">Why the indie music scene is broken.</h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PROBLEMS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`bpl-card p-6 flex flex-col justify-between text-left border-border/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] shadow-md ${p.glow}`}
                >
                  <div className="space-y-4">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${p.color} border border-white/5 flex items-center justify-center text-white`}>
                      <Icon size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-white leading-tight">{p.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: OUR SOLUTION (DIAGRAM) */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Our Solution</h2>
            <h3 className="text-3xl font-display font-bold text-white">One Connected Ecosystem</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 items-center w-full max-w-4xl relative">
              {FLOW_NODES.map((node, index) => {
                const Icon = node.icon;
                return (
                  <div key={node.id} className="flex flex-col items-center relative group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-full p-5 rounded-xl border text-center flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-sm ${node.color} relative z-10`}
                    >
                      <Icon size={22} className="text-primary-glow" />
                      <span className="text-xs font-bold text-white">{node.label}</span>
                    </motion.div>
                    
                    {/* Node connector line */}
                    {index < FLOW_NODES.length - 1 && (
                      <>
                        {/* Desktop Line */}
                        <div className="hidden md:block absolute top-1/2 left-full w-full h-[2px] bg-gradient-to-r from-primary/30 to-primary/0 -translate-y-1/2 z-0" />
                        {/* Mobile Arrow */}
                        <div className="md:hidden mt-4 flex items-center justify-center">
                          <ArrowDown size={16} className="text-primary-glow animate-bounce" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW THE ECOSYSTEM WORKS (TIMELINE) */}
        <section className="py-20 px-4 max-w-3xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Execution Pipeline</h2>
            <h3 className="text-3xl font-display font-bold text-white">How the Ecosystem Works</h3>
          </div>

          <div className="relative border-l border-border/60 pl-6 space-y-8 text-left">
            {TIMELINE_STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative group"
              >
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full border border-primary bg-background flex items-center justify-center group-hover:bg-primary-glow transition-colors duration-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 group-hover:text-primary-glow transition-colors">
                    {step.title}
                    {idx === 2 && (
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                        Key Franchise Rule
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PILOT CITIES */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Launch Roadmap</h2>
            <h3 className="text-3xl font-display font-bold text-white">Pilot Cities & Roadmap</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PILOT_CITIES.map((c, idx) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className={`bpl-card p-8 text-left space-y-4 border-border/40 hover:border-primary/30 transition-all duration-300 ${
                  c.status.includes("Launching") ? "border-primary/25 bg-primary/3" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-display font-extrabold text-white">{c.name}</h4>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    c.status.includes("Launching") ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Target size={14} className="text-primary-glow animate-pulse" />
            Future Expansion cohorts coming soon for Season II.
          </div>
        </section>

        {/* SECTION 4B: CAMPUS / INTER-COLLEGE EXPANSION */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Later Expansion
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              College Clubs Are The Growth Engine
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The league does not scale by buying audiences. It scales by plugging into campus music
              clubs, letting those communities grow into each other, and turning the musicians
              inside them into the next season&apos;s roster.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {CAMPUS_STAGES.map((stage, idx) => (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className="bpl-card p-6 text-left space-y-3 border-border/40 hover:border-primary/30 transition-all duration-300 relative"
              >
                <span className="text-3xl font-display font-extrabold text-primary/20 leading-none">
                  {stage.step}
                </span>
                <h4 className="text-sm font-display font-bold text-white">{stage.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{stage.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
            {/* Footprint */}
            <div className="bpl-card p-6 border-border/40 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={15} className="text-primary-glow" /> Target Campus Footprint
              </h4>
              <div className="space-y-3">
                {CAMPUS_FOOTPRINT.map((f) => (
                  <div
                    key={f.city}
                    className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-semibold text-white">{f.city}</span>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{f.campuses}</span>
                      <span className="text-primary-glow font-semibold">{f.ambassadors}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Ambassadors earn per-show incentives against tickets sold, plus a season pass and
                merchandise. Specific campuses are confirmed ahead of each season rather than
                announced in advance.
              </p>
            </div>

            {/* Why it compounds */}
            <div className="bpl-card p-6 border-primary/25 bg-primary/5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone size={15} className="text-primary-glow" /> Why It Compounds
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A campus club is an audience and a talent pool at the same time. Every college the
                league activates brings both people who buy tickets and people who want to play —
                so audience growth and roster growth arrive together instead of costing separately.
              </p>
              <Link
                to="/join"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-glow hover:gap-2.5 transition-all"
              >
                Register your club or band <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5: PARTICIPANTS */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Ecosystem Roles</h2>
            <h3 className="text-3xl font-display font-bold text-white">Who Participates?</h3>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {PARTICIPANTS.map((p, idx) => (
              <Link
                key={p.name}
                to={p.link}
                search={p.type === "artist" || p.type === "band" ? { type: p.type } : undefined}
                className="bpl-card p-5 text-left flex flex-col justify-between hover:border-primary/40 hover:bg-secondary/20 transition-all duration-300 group cursor-pointer"
              >
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-white group-hover:text-primary-glow transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">{p.desc}</p>
                </div>
                <div className="mt-4 text-[9px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary-glow transition-colors flex items-center gap-1">
                  Onboard here <ArrowRight size={8} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* INTERACTIVE ECOSYSTEM COMPARISON SECTION */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Ecosystem Deep Dive</h2>
            <h3 className="text-3xl font-display font-bold text-white">How BPL Franchise Model Works</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Kalakshetra operates as an asset-light orchestration platform (like BCCI). We create demand, set rules, and coordinate stakeholders, while specialized partners provide venue operations, production, and marketing.
            </p>
          </div>

          {/* EXPLANATION TABS */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap border border-border rounded-lg overflow-hidden bg-secondary/20 backdrop-blur-sm">
              {[
                { id: "comparison", label: "League Model", icon: Layers },
                { id: "matrix", label: "Who Hires Whom", icon: Handshake },
                { id: "rights", label: "Rights & Media", icon: Lock },
                { id: "venues", label: "Venue Models", icon: Building2 },
                { id: "sponsors", label: "Sponsor Inventory", icon: Megaphone },
                { id: "pipeline", label: "Flow Map", icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveExplainTab(tab.id as any)}
                    className={`flex-1 min-w-[9rem] py-3 px-3 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border-r border-border last:border-0 ${
                      activeExplainTab === tab.id
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: IPL vs BPL */}
            {activeExplainTab === "comparison" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn border border-border bg-slate-950/40 backdrop-blur">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">
                    IPL vs BPL (Raaga of Kurukshetra) Comparison Structure
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    How the franchise music league maps directly onto a professional sports format.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">
                          IPL Counterpart
                        </th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">
                          Raaga of Kurukshetra Role
                        </th>
                        <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">
                          Core Responsibility
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {[
                        [
                          "BCCI",
                          "Kalakshetra (Operator)",
                          "Sets rules, runs fixtures. Gets sponsorship & ticket commission, spending on league prize pools, operations, and hiring event managers.",
                        ],
                        [
                          "Franchise Owner",
                          "Production House (Investor)",
                          "Acts as the artist investor. Decides whether to perform services in-house or outsource. Invests directly in catalog production and band marketing.",
                        ],
                        [
                          "Players",
                          "Bands / Solo Artists",
                          "The central talent. Retain a 40% live ticket revenue share and a 50% digital IP royalty share.",
                        ],
                        [
                          "Stadium",
                          "Venues / Cafés / Colleges",
                          "IPL cricket stadiums require massive upfront rentals. Kalakshetra cafés/venues host for free (for F&B sales) or use hybrid guarantee + share models.",
                        ],
                        [
                          "Broadcaster",
                          "YouTube & Audio Platforms",
                          "IPL sells satellite rights centrally. Production houses earn major revenues from YT/Spotify. Kalakshetra sells TV/OTT 'Tournament War' telecast rights.",
                        ],
                        [
                          "Sponsors",
                          "Brand Sponsors",
                          "Provide sponsorship capital. Divided between operators (for prize pool & operations) and event manager logistics funding.",
                        ],
                        [
                          "Fan Clubs",
                          "Outsourced Promoters",
                          "Campus & cafe promoter networks hired by Kalakshetra or Production Houses to drive ticket sales and local meetups.",
                        ],
                        [
                          "Event Operations",
                          "Contracted Event Managers",
                          "Hired & paid directly by Kalakshetra Operator (out of the 30% ticket share) to execute matching logistics, stage setup, and security.",
                        ],
                      ].map(([ipl, bpl, desc], idx) => (
                        <tr key={idx} className="hover:bg-secondary/10">
                          <td className="py-3 px-4 font-bold text-white font-display">{ipl}</td>
                          <td className="py-3 px-4 font-bold text-primary-glow">{bpl}</td>
                          <td className="py-3 px-4 text-muted-foreground leading-relaxed">
                            {desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HIRING MATRIX */}
            {activeExplainTab === "matrix" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn border border-border bg-slate-950/40 backdrop-blur">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">
                    Ecosystem Hiring Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Who contracts whom under Kalakshetra's decentralized, asset-light model.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">
                          Ecosystem Service
                        </th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow text-center uppercase tracking-wider">
                          Hired by Kalakshetra
                        </th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow text-center uppercase tracking-wider">
                          Hired by Production House
                        </th>
                        <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">
                          Operational Context
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {[
                        [
                          "Event Managers",
                          "✅ Primary (Contracted)",
                          "❌ Rare",
                          "Kalakshetra contracts managers to operate the tour matches cleanly on-site.",
                        ],
                        [
                          "Venues / Cafes",
                          "✅ Primary (Booked)",
                          "❌ Rare",
                          "Kalakshetra partners directly with cafes to secure local match stadiums.",
                        ],
                        [
                          "Media Partners",
                          "Optional",
                          "✅ Primary (Outsourced)",
                          "Production Houses hire videographers for official music videos & shoots.",
                        ],
                        [
                          "Photographers",
                          "Optional",
                          "✅ Primary (Outsourced)",
                          "Production Houses hire photographers for artist branding campaigns.",
                        ],
                        [
                          "Influencers",
                          "Optional",
                          "✅ Primary (Outsourced)",
                          "Production Houses pay influencers to promote their drafted bands.",
                        ],
                        [
                          "Campus Networks",
                          "✅ Yes (Qualifiers)",
                          "✅ Yes (Ticket Promos)",
                          "Both hire campus ambassadors to mobilize students for live fixtures.",
                        ],
                        [
                          "Cafe Communities",
                          "Optional",
                          "✅ Primary (Outsourced)",
                          "Production Houses hire local gathering networks for café fan promotions.",
                        ],
                        [
                          "Music Distributors",
                          "❌ No",
                          "✅ Primary (Outsourced)",
                          "Production Houses manage third-party distribution to release tracks.",
                        ],
                      ].map(([service, bpl, ph, desc], idx) => (
                        <tr key={idx} className="hover:bg-secondary/10">
                          <td className="py-3 px-4 font-bold text-white">{service}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-400">{bpl}</td>
                          <td className="py-3 px-4 text-center font-bold text-amber-400">{ph}</td>
                          <td className="py-3 px-4 text-muted-foreground leading-relaxed">
                            {desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RIGHTS & MEDIA */}
            {activeExplainTab === "rights" && (
              <div className="bpl-card p-6 md:p-8 space-y-8 text-left animate-fadeIn border border-border bg-slate-950/40 backdrop-blur">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">
                    Two Rights Buckets, Never Mixed
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    The songs belong to the people who made and financed them. The league footage
                    belongs to the league. Conflating the two is the most expensive mistake a music
                    league can make.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {RIGHTS_SPLIT.map((r) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.title} className={`p-5 border rounded-lg space-y-3 ${r.accent}`}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={r.text} />
                          <h4 className="text-sm font-bold text-white">{r.title}</h4>
                        </div>
                        <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${r.text}`}>
                          {r.owner}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {r.examples.map((e) => (
                            <span
                              key={e}
                              className="text-[9px] px-2 py-0.5 rounded-full border border-border/60 bg-secondary/30 text-muted-foreground"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-4 flex gap-3">
                  <ShieldCheck size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-amber-200">The practical rule:</span> a
                    production house is free to sell its band's song anywhere in the world. It is not
                    free to sell that band's Kalakshetra match footage — that sits in the central
                    season package, which is what makes the package worth buying at all.
                  </p>
                </div>

                {/* Channel tiers */}
                <div className="space-y-3 border-t border-border/40 pt-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Youtube size={15} className="text-primary-glow" /> Three Channels, Three Jobs
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      The league deliberately does not own every audience relationship. An artist who
                      leaves after two seasons should leave with a community that is genuinely theirs.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {CHANNEL_TIERS.map((c) => {
                      const Icon = c.icon;
                      return (
                        <div key={c.tier} className={`p-4 border rounded-lg space-y-2.5 ${c.accent}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                              {c.tier}
                            </span>
                            <Icon size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-white">{c.name}</h5>
                          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                            {c.owns}
                          </p>
                          <ul className="space-y-1 pt-1">
                            {c.content.map((line) => (
                              <li
                                key={line}
                                className="text-[10px] text-muted-foreground leading-snug flex gap-1.5"
                              >
                                <span className="opacity-50">·</span>
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Premiere window */}
                <div className="space-y-3 border-t border-border/40 pt-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Radio size={15} className="text-primary-glow" /> The Release Window
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Every original follows the same three-beat launch, so a release is an event
                      rather than an upload.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {PREMIERE_WINDOW.map((w) => (
                      <div
                        key={w.mark}
                        className="p-4 border border-border/60 bg-secondary/10 rounded-lg space-y-2"
                      >
                        <p className="text-lg font-display font-extrabold text-primary-glow font-mono">
                          {w.mark}
                        </p>
                        <h5 className="text-xs font-bold text-white">{w.title}</h5>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{w.detail}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    An exclusive window is only promised once a platform agreement actually exists —
                    it is a licence for a day, not ownership in perpetuity.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SPONSOR INVENTORY */}
            {activeExplainTab === "sponsors" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn border border-border bg-slate-950/40 backdrop-blur">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">
                    Sponsorship as Finite Inventory
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sponsorship is not one line on a deck — it is a rate card with a countable number
                    of slots. Listing it this way is what lets us see how much of a season is still
                    unsold.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">Role</th>
                        <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">Scope</th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider text-center">Slots</th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider text-right">Indicative Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {SPONSOR_INVENTORY.map((slot) => (
                        <tr key={slot.role} className="hover:bg-secondary/10">
                          <td className="py-3 px-4 align-top">
                            <p className="font-bold text-white">{slot.role}</p>
                            <span
                              className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full border ${SPONSOR_TIER_META[slot.tier].accent}`}
                            >
                              {SPONSOR_TIER_META[slot.tier].label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground leading-relaxed align-top">
                            {slot.scope}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-white tabular-nums align-top">
                            {slot.slots}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-primary-glow tabular-nums align-top">
                            {inr(slot.rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-primary/5">
                        <td className="py-3 px-4 font-bold text-white" colSpan={2}>
                          Full rate card, one season
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-white tabular-nums">
                          {SPONSOR_INVENTORY.reduce((sum, i) => sum + i.slots, 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-primary-glow tabular-nums">
                          {inrCompact(rateCardValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                  Rates are indicative planning figures for a Season I regional league, not signed
                  deals. The point of the table is the <strong className="text-white">structure</strong>{" "}
                  — a title partner and forty fixture partners are different products sold to
                  different budget holders, and a league that only sells the first one leaves most of
                  its inventory on the shelf. Sponsor-side returns are modelled on the{" "}
                  <Link to="/economics" className="text-primary-glow font-semibold hover:underline">
                    economics page
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* TAB CONTENT: VENUE OPTIONS */}
            {activeExplainTab === "venues" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn border border-border bg-slate-950/40 backdrop-blur">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">
                    Cafe / Venue Partnership Models
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cafes provide stages and seating. Kalakshetra secures stadium infrastructure under three alignment models.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="p-5 border border-border bg-secondary/10 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                        MODEL A
                      </span>
                      <DollarSign size={14} className="text-primary-glow" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Flat Venue Rental</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Kalakshetra pays a flat, fixed fee to rent the space upfront for the gig night. Cafe retains 100% of Food & Beverage revenues.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] font-mono font-bold text-primary-glow">
                        Example: Fixed ₹25,000 / Show
                      </p>
                    </div>
                  </div>

                  <div className="p-5 border border-border bg-secondary/10 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                        MODEL B
                      </span>
                      <Percent size={14} className="text-primary-glow" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Ticketing Revenue Share</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No upfront rental risk. The café receives a direct percentage commission of the live matchup gate ticket sales.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] font-mono font-bold text-primary-glow">
                        Example: 15% – 25% Ticket Sales
                      </p>
                    </div>
                  </div>

                  <div className="p-5 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary-glow">
                        MODEL C (Common)
                      </span>
                      <CheckCircle2 size={14} className="text-primary-glow" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Hybrid Guarantee</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      De-risks cafe venue hosts while aligning incentives. Kalakshetra pays a lower fixed base guarantee combined with a smaller ticket commission.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] font-mono font-bold text-primary-glow">
                        Example: ₹15,000 + 10% Ticket sales
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ECOSYSTEM PIPELINE GRAPH */}
            {activeExplainTab === "pipeline" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn border border-border bg-slate-950/40 backdrop-blur">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">
                    Ecosystem Hiring & Operational Flow
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Visual mapping of the platform coordination flows and outsourcing relationships.
                  </p>
                </div>

                <div className="border border-border/60 bg-secondary/10 rounded-lg p-6 space-y-8 max-w-2xl mx-auto text-center font-sans">
                  {/* Row 1 */}
                  <div>
                    <div className="inline-block bg-primary/20 border border-primary/40 text-primary-glow text-xs px-4 py-2 rounded-md font-bold uppercase tracking-wider">
                      Brand Sponsor
                    </div>
                    <div className="flex justify-center py-2">
                      <ArrowDown size={14} className="text-muted-foreground" />
                    </div>
                    <div className="inline-block bg-slate-900 border border-border text-white text-xs px-5 py-2.5 rounded-md font-bold uppercase tracking-widest font-mono">
                      Kalakshetra (Operator)
                    </div>
                  </div>

                  {/* Flow Splits */}
                  <div className="grid grid-cols-3 gap-2 max-w-md mx-auto relative">
                    <div className="border-l border-t border-border/80 h-6 absolute left-[16.6%] right-[50%] top-0"></div>
                    <div className="border-r border-t border-border/80 h-6 absolute left-[50%] right-[16.6%] top-0"></div>
                    <div className="border-l border-border/80 h-6 absolute left-[50%] top-0"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-[10px] font-semibold text-muted-foreground">
                    <div className="p-2 border border-border bg-secondary/20 rounded">
                      <p className="text-white">Event Manager</p>
                      <span className="text-[8px] text-primary-glow font-mono">(On-ground Ops)</span>
                    </div>
                    <div className="p-2 border border-border bg-secondary/20 rounded">
                      <p className="text-white">Venue Rental</p>
                      <span className="text-[8px] text-primary-glow font-mono">(Cafe / College)</span>
                    </div>
                    <div className="p-2 border border-border bg-secondary/20 rounded">
                      <p className="text-white">Prize Pool</p>
                      <span className="text-[8px] text-primary-glow font-mono">(Operations)</span>
                    </div>
                  </div>

                  <div className="flex justify-center py-2">
                    <ArrowDown size={14} className="text-muted-foreground animate-bounce" />
                  </div>

                  <div className="inline-block bg-primary/10 border border-primary/30 text-white text-xs px-5 py-3 rounded-lg font-bold uppercase tracking-wider">
                    🏆 LIVE MATCH EVENT 🏆
                  </div>

                  <div className="flex justify-center py-2">
                    <ArrowDown size={14} className="text-muted-foreground rotate-180" />
                  </div>

                  {/* Production House Inputs */}
                  <div className="border-t border-dashed border-border/60 pt-6">
                    <div className="inline-block bg-slate-900 border border-border text-white text-xs px-4 py-2 rounded-md font-bold uppercase tracking-wider">
                      Production House (Investor)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 max-w-md mx-auto text-[9px] text-muted-foreground">
                      <div className="p-1.5 border border-border/50 rounded bg-secondary/10">🎸 Band Co-Production</div>
                      <div className="p-1.5 border border-border/50 rounded bg-secondary/10">🎥 Media Partners</div>
                      <div className="p-1.5 border border-border/50 rounded bg-secondary/10">📢 Local Community</div>
                      <div className="p-1.5 border border-border/50 rounded bg-secondary/10">🤳 Influencer Promos</div>
                      <div className="p-1.5 border border-border/50 rounded bg-secondary/10">🎓 Campus Promoters</div>
                      <div className="p-1.5 border border-border/50 rounded bg-secondary/10">💿 Distro Partners</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5B: WHY A PRODUCTION HOUSE INVESTS */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              The Franchise Case
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              Why sign four bands instead of one?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A production house is not buying a shot at a trophy. It is taking four positions in a
              catalogue and holding them for a season. Entertainment returns are skewed — most of the
              value in any roster comes from one or two acts, and nobody can reliably pick which two
              in advance. Four positions is what makes that survivable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {PORTFOLIO_LOGIC.map((o, idx) => (
              <motion.div
                key={o.outcome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`p-5 border rounded-lg space-y-2 text-left ${o.tone}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${o.label}`}>
                    {o.outcome}
                  </h4>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    1 of 4
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{o.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="bpl-card p-6 text-left space-y-3 border-blue-400/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Briefcase size={14} className="text-blue-400" /> What the House Puts In
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Recording, song production, music videos, artist branding, photography, marketing,
                influencer seeding, distribution and day-to-day management — per band, per season.
                The house chooses how much of that to do in-house and how much to contract out.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                In return it holds 50% of the audio and video IP it financed, plus 30% of net gate on
                every night its bands play.
              </p>
              <Link
                to="/economics"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-300 hover:underline pt-1"
              >
                See the full investment and ROI model <ArrowRight size={12} />
              </Link>
            </div>

            <div className="bpl-card p-6 text-left space-y-3 border-primary/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Trophy size={14} className="text-primary-glow" /> Two Ways to Win
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                One trophy goes to the champion band. The other — the{" "}
                <span className="text-primary-glow font-semibold">House Cup</span> — goes to the
                production house whose four bands score the most points between them.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                That second trophy exists specifically to stop a franchise pouring everything into
                its strongest act and abandoning the other three. It can only be won with the whole
                roster, which is the same behaviour the portfolio logic already rewards.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5C: THE FLYWHEEL */}
        <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              The Compounding Loop
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">Why a season is worth more than a show</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A one-off gig ends when the room empties. A season loops — and every pass around the
              loop starts from a higher base than the last one.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2">
            {FLYWHEEL.map((step, idx) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="px-3 py-2 rounded-md border border-border/60 bg-secondary/20 text-[11px] font-semibold text-white">
                  {step}
                </span>
                {idx < FLYWHEEL.length - 1 && (
                  <ArrowRight size={12} className="text-primary-glow shrink-0" />
                )}
              </motion.div>
            ))}
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-primary-glow" />
              <span className="px-3 py-2 rounded-md border border-primary/30 bg-primary/10 text-[11px] font-bold text-primary-glow">
                Next season, larger
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 6: BUSINESS MODEL */}
        <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Economic Model</h2>
            <h3 className="text-3xl font-display font-bold text-white">Premium Revenue Splits</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Based on the number of franchises and registered bands, franchises invest directly in original music production to develop their roster. Here is how value flows:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            {/* Live Events */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Calendar size={18} />
                </div>
                <h4 className="text-lg font-bold text-white">Live Events</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ticket Revenue Splits</p>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">40% Share</span>
                    <span className="font-bold text-white">Artist</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: "40%" }} />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-muted-foreground">30% Share</span>
                    <span className="font-bold text-white">Franchise (Production House)</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: "30%" }} />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-muted-foreground">30% Share</span>
                    <span className="font-bold text-white">Kalakshetra</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "30%" }} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal border-t border-border/30 pt-4">
                Structured to secure artist livelihoods while keeping venues risk-free.
              </p>
            </div>

            {/* Audio Rights */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
                  <Music size={18} />
                </div>
                <h4 className="text-lg font-bold text-white">Audio Rights</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Streaming & Royalties</p>
                <div className="space-y-1 pt-2">
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    Spotify · Apple Music · JioSaavn · YouTube Music
                  </div>
                  <div className="flex justify-between items-center text-xs pt-4">
                    <span className="text-muted-foreground">50% Share</span>
                    <span className="font-bold text-white">Artist</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: "50%" }} />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-muted-foreground">50% Share</span>
                    <span className="font-bold text-white">Franchise (Production House)</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal border-t border-border/30 pt-4">
                Aligns investment with long-term digital IP catalogs.
              </p>
            </div>

            {/* Video & Brand Rights */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400">
                  <Tv size={18} />
                </div>
                <h4 className="text-lg font-bold text-white">Video & Media Rights</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">YouTube, Ads & Syncs</p>
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    YouTube · OTT · Brand Collaborations · Sync Licensing
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-muted-foreground">50% Share</span>
                    <span className="font-bold text-white">Artist</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: "50%" }} />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-muted-foreground">50% Share</span>
                    <span className="font-bold text-white">Franchise (Production House)</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal border-t border-border/30 pt-4">
                Secures sponsorship ROI and long-term catalog rights.
              </p>
            </div>
          </div>

          {/* What the operator's share actually funds */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="bpl-card p-6 border-primary/20 bg-primary/3 text-left space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Wallet size={16} className="text-primary-glow" />
                  What the Operator's 30% Pays For
                </h4>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  It is not margin. The operator share is the cost base that makes a fixture happen
                  at all, and every band on the calendar is carried by it.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {OPERATOR_SPEND.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-2.5 items-start">
                      <Icon size={13} className="text-primary-glow shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground leading-snug">{item.label}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                The per-night version of this — every venue, sound, lighting and crew line against
                the gate it has to cover — is modelled on the{" "}
                <Link to="/economics" className="text-primary-glow font-semibold hover:underline">
                  economics page
                </Link>
                .
              </p>
            </div>

            <div className="bpl-card p-6 border-border text-left space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Landmark size={16} className="text-amber-400" />
                  League-Level Revenue & Reinvestment
                </h4>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Broadcast rights, digital distribution, central advertising and title sponsorship
                  are collected centrally rather than fixture by fixture — a season sold once, as one
                  property.
                </p>
              </div>
              <div className="space-y-2.5">
                {[
                  { k: "Prize pool", v: "Ring-fenced, paid to the champion lineup" },
                  { k: "League operations", v: "Crew, production and the fixture calendar" },
                  { k: "Platform & data", v: "Ticketing, voting and the standings engine" },
                  { k: "Next-market expansion", v: "Opening the following zone chapter" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex justify-between gap-3 border-b border-border/30 pb-2 last:border-0"
                  >
                    <span className="text-[11px] font-bold text-white shrink-0">{row.k}</span>
                    <span className="text-[11px] text-muted-foreground text-right">{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6B: NATIONAL EXPANSION */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">
              Scaling the Playbook
            </h2>
            <h3 className="text-3xl font-display font-bold text-white">
              One market proved, then replicated
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AP/TS runs the deep roster because it is where the format is being proven. Every
              market after it opens at half that size and earns its way up — the same structure, the
              same scoring, a different language.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">Market</th>
                  <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider text-center">Houses</th>
                  <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider text-center">Bands / House</th>
                  <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider text-center">Bands</th>
                  <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">Languages</th>
                  <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {EXPANSION_MARKETS.map((mkt) => (
                  <tr key={mkt.market} className="hover:bg-secondary/10">
                    <td className="py-3 px-4 font-bold text-white">{mkt.market}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground tabular-nums">{mkt.houses}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground tabular-nums">{mkt.bands}</td>
                    <td className="py-3 px-4 text-center font-bold text-primary-glow tabular-nums">
                      {mkt.houses * mkt.bands}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{mkt.languages}</td>
                    <td className="py-3 px-4 text-muted-foreground">{mkt.status}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-primary/5">
                  <td className="py-3 px-4 font-bold text-white">
                    National footprint at full build
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-white tabular-nums">
                    {nationalHouses}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-4 text-center font-extrabold text-primary-glow tabular-nums">
                    {nationalBands}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground" colSpan={2}>
                    Nine languages, one competition structure
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { v: totalRegionalFinalists, l: "Regional finalists", s: `${finalistsPerMarket} from each market` },
              { v: "→ 10", l: "National qualifiers", s: "Cross-market playoff round" },
              { v: "→ 5", l: "National finalists", s: "Same round robin, one national stage" },
            ].map((k) => (
              <div key={k.l} className="border border-border/50 rounded-lg p-5 bg-surface/30 text-center">
                <p className="text-2xl font-display font-extrabold text-primary-glow tabular-nums">
                  {k.v}
                </p>
                <p className="text-[10px] text-white uppercase font-bold mt-1">{k.l}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.s}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bpl-card p-5 border-emerald-500/20 bg-emerald-500/5 flex gap-3 text-left">
            <Globe size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-emerald-200">Regional music, national discovery.</span>{" "}
              Nothing about the format asks a Malayalam band to sing in Hindi to be taken seriously.
              Each chapter runs in its own language and its own scene; the national stage is where
              those scenes meet, not where they get flattened into one.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-4 text-center max-w-4xl mx-auto z-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bpl-card p-12 space-y-6 border-primary/25 bg-gradient-to-br from-secondary/40 to-transparent"
          >
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white leading-tight">
              Building India's largest independent music ecosystem.
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Where talent meets opportunity and every live performance creates long-term value for artists, franchises, and communities.
            </p>
            <Link
              to="/onboarding"
              className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white shadow-lg"
            >
              Join Kalakshetra <ArrowRight size={14} />
            </Link>
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
}
