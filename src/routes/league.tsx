import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Music,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  Play,
  FileMusic,
  Users,
  Tv,
  Megaphone,
  Briefcase,
  Star,
  Award
} from "lucide-react";

export const Route = createFileRoute("/league")({
  head: () => ({
    meta: [
      { title: "Kalakshetra League — India's Premier Indie Music Championship" },
      {
        name: "description",
        content:
          "Raga of Kurukshetra (Raaga of Revenge) — Season I. Learn how points are scored, where prize pool money comes from, and why your band should compete.",
      },
    ],
  }),
  component: LeaguePage,
});

const JOURNEY_STEPS = [
  { id: "register", label: "Register Profile", desc: "Artists and bands register to signal eligibility." },
  { id: "partnership", label: "Franchise Partnership", desc: "Production houses bid and partner with registered bands." },
  { id: "music", label: "Original Music", desc: "Franchises invest in original music production." },
  { id: "live", label: "Live Performances", desc: "Compete across cafes, colleges, and pilot stages." },
  { id: "points", label: "Points Table", desc: "Accumulate scores from gigs, streams, and votes." },
  { id: "top25", label: "Top 25% Qualification", desc: "The top quartile advances to the grand finale." },
  { id: "finals", label: "League Finals", desc: "The ultimate clash for the national championship." },
  { id: "champion", label: "Champion Crowned", desc: "One champion takes home the legacy and prize pool." },
];

const POINTS_CARDS = [
  {
    title: "Live Shows (40%)",
    desc: "Attendance metrics, ticketing sales, and door count per gig. Validated through real ticket transactions.",
    icon: MapPin,
    color: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20",
  },
  {
    title: "Original Songs (30%)",
    desc: "Track releases and catalog value. Based on the number of franchises and registered bands, franchises invest in original production.",
    icon: FileMusic,
    color: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20",
  },
  {
    title: "Audience Engagement (30%)",
    desc: "Verified votes tied to ticket pass buyers. Each verified user account gets one vote per match to prevent botting.",
    icon: Users,
    color: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20",
  },
  {
    title: "League Challenges",
    desc: "Bonus points awarded for special collaborations, theme challenges, and acoustic battle stages throughout the season.",
    icon: Trophy,
    color: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20",
  },
  {
    title: "Overall Ranking",
    desc: "A live standings table updated automatically after every fixture. Formula and raw inputs are public to secure trust.",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
  },
];

const TIMELINE_STEPS = [
  { phase: "Phase 1", title: "Registration", dates: "Month 1", desc: "Band roster opens and qualification lists are finalized." },
  { phase: "Phase 2", title: "Production & Partnership", dates: "Month 2", desc: "Franchises select bands and produce original tracks." },
  { phase: "Phase 3", title: "League Season", dates: "Month 3-4", desc: "8-week tournament of live matches and weekly points updates." },
  { phase: "Phase 4", title: "Grand Finale", dates: "Month 4 End", desc: "The top 25% bands clash in a single-venue national broadcast." },
  { phase: "Phase 5", title: "Champion", dates: "Post-Season", desc: "Prize pool payout and tour contract activation." },
];

const ADVANTAGES = [
  { title: "Gain Production Support", desc: "Partner with established production franchises to record your tracks in professional studios.", icon: Briefcase },
  { title: "Perform Across Cities", desc: "Get slotted into official tour schedules with paid travel and secured venue bookings.", icon: MapPin },
  { title: "Build Your Fanbase", desc: "Leverage Kalakshetra's collective marketing and campus networks to grow your listeners.", icon: Users },
  { title: "Release Original Singles", desc: "Retain 50% lifetime digital content royalties under our pre-negotiated legal templates.", icon: Music },
  { title: "Win the Championship", desc: "Compete for the ultimate prize pool and secure your spot in independent music history.", icon: Trophy },
  { title: "Broadcast Exposure", desc: "Get featured on broadcast feeds, YouTube streaming events, and OTT coverage.", icon: Tv },
];

function LeaguePage() {
  return (
    <PageShell>
      <div className="bg-background text-white min-h-screen relative overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/3 blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-24 px-4 text-center max-w-5xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary-glow text-[10px] uppercase font-bold tracking-widest">
              <Star size={10} className="animate-spin-slow" /> KALAKSHETRA LEAGUE
            </div>
            <h1 className="text-xl font-bold uppercase tracking-[0.6em] text-muted-foreground">
              SEASON I
            </h1>
            <h2 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-none">
              RAGA OF <span className="gradient-text">KURUKSHETRA</span>
            </h2>
            <p className="text-sm md:text-base font-bold text-amber-500 uppercase tracking-[0.3em] mt-2">
              Raaga of Revenge
            </p>
            <p className="mt-8 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              India's flagship independent music championship. Where production houses invest in talent, bands compete on a transparent points table, and audiences decide the ultimate legacy.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/join/band"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white shadow-lg"
              >
                Register Your Band <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* SECTION 1: WHAT IS THE LEAGUE? */}
        <section className="py-20 px-4 max-w-4xl mx-auto relative z-10 border-t border-border/45">
          <div className="bpl-card p-8 md:p-12 space-y-6 border-primary/20 bg-primary/3 text-left">
            <h3 className="text-2xl font-display font-extrabold text-white">What is the League?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every season runs for approximately <strong>four months</strong>. Rather than performing one-off gigs, bands enter a structured league where production house franchises back their journey.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on the number of franchises and registered bands count, franchises invest directly in original music production. Bands perform live across cafe stages, colleges, and festivals, while earning points to scale the standings.
            </p>
            <div className="grid gap-4 sm:grid-cols-4 pt-4">
              {[
                { v: "4 Months", l: "Season Length" },
                { v: "Live Gigs", l: "Tour Matches" },
                { v: "Originals", l: "Music & Video IP" },
                { v: "Top 25%", l: "Finale Qualifier" },
              ].map((stat) => (
                <div key={stat.l} className="border border-border/50 rounded-lg p-4 bg-surface/30">
                  <p className="text-base font-bold text-primary-glow">{stat.v}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">{stat.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: LEAGUE JOURNEY (VERTICAL FLOW) */}
        <section className="py-20 px-4 max-w-2xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Pathway</h2>
            <h3 className="text-3xl font-display font-bold text-white">League Journey</h3>
          </div>

          <div className="relative border-l border-border/50 pl-6 space-y-8 text-left">
            {JOURNEY_STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="relative group"
              >
                {/* Node circle */}
                <div className="absolute -left-[30px] top-1 h-4.5 w-4.5 rounded-full border border-primary bg-background flex items-center justify-center group-hover:bg-primary-glow transition-colors duration-200">
                  <span className="text-[8px] font-bold text-primary-glow group-hover:text-background">{idx + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider group-hover:text-primary-glow transition-colors">
                    {step.label}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 3: POINTS SYSTEM */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Scoring System</h2>
            <h3 className="text-3xl font-display font-bold text-white">Points Dashboard</h3>
            <p className="text-xs text-muted-foreground">
              Standings are decided by a transparent, public formula. Here is how your band earns points:
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5 items-stretch">
            {POINTS_CARDS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`bpl-card p-6 flex flex-col justify-between text-left border hover:border-primary/40 transition-all duration-300 ${p.color}`}
                >
                  <div className="space-y-4">
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">{p.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: LEAGUE REVENUE INFOGRAPHIC */}
        <section className="py-20 px-4 max-w-5xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/20">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">Revenue Flow</h2>
            <h3 className="text-3xl font-display font-bold text-white">League Economics</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {/* Revenue Inflow */}
            <div className="bpl-card p-8 text-left space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">League Revenue Inflow</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Sourcing Value</p>
              </div>
              <div className="space-y-4 pt-2">
                {[
                  { n: "Broadcast Rights", desc: "Television and network streaming distribution fees." },
                  { n: "Digital Streaming", desc: "Subscriptions, ad revenue, and online ticket passes." },
                  { n: "YouTube Monetization", desc: "Official channel views, sponsor segments, and catalogs." },
                  { n: "Brand Sponsors", desc: "Title sponsors, stage partners, and commercial alignments." },
                  { n: "Advertising & Tickets", desc: "Local vendor ads and match passes sold at physical venues." },
                ].map((item, idx) => (
                  <div key={item.n} className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.n}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outflow / Allocation */}
            <div className="bpl-card p-8 text-left space-y-6 border-primary/20 bg-primary/3">
              <div>
                <h4 className="text-base font-bold text-white">Value Allocation</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Reinvestment Channels</p>
              </div>
              <div className="space-y-4 pt-2">
                {[
                  { n: "Grand Prize Pool", desc: "Ring-fenced prize funds paid to the winning band lineup." },
                  { n: "League Operations", desc: "Outsourced crew, live sound tech, and coordinate staff." },
                  { n: "Future Expansion", desc: "Marketing regional auditions and building new city cohorts." },
                ].map((item, idx) => (
                  <div key={item.n} className="flex gap-3">
                    <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.n}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4">
                <p className="text-[10px] text-muted-foreground leading-normal">
                  All inflow capital from league broadcasting and sponsors is reinvested directly back into the prize pool and scaling league operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SEASON TIMELINE */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Schedule</h2>
            <h3 className="text-3xl font-display font-bold text-white">Season Timeline</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 text-left">
            {TIMELINE_STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="bpl-card p-6 border-border/40 hover:border-primary/20 transition-all duration-300 relative"
              >
                <div className="absolute top-4 right-4 text-[9px] font-bold text-primary-glow uppercase tracking-widest">
                  {step.dates}
                </div>
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{step.phase}</span>
                  <h4 className="font-bold text-sm text-white">{step.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 6: WHY COMPETE? */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 border-t border-border/45 bg-slate-950/10">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Benefits</h2>
            <h3 className="text-3xl font-display font-bold text-white">Why Compete?</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <motion.div
                  key={adv.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className="bpl-card p-6 text-left flex gap-4 hover:border-primary/30 transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">{adv.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">{adv.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FINAL SECTION (CTA) */}
        <section className="py-24 px-4 text-center max-w-4xl mx-auto z-10 relative border-t border-border/45">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bpl-card p-12 space-y-6 border-primary/25 bg-gradient-to-br from-secondary/40 to-transparent"
          >
            <span className="text-[10px] font-bold text-primary-glow uppercase tracking-widest">Season I</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white leading-none">
              RAGA OF KURUKSHETRA
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em]">
              Raaga of Revenge
            </p>
            <div className="flex justify-center gap-6 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              <span>Top 25%</span>
              <span>•</span>
              <span>One Champion</span>
              <span>•</span>
              <span>One Stage</span>
              <span>•</span>
              <span>One Legacy</span>
            </div>
            <div className="pt-4">
              <Link
                to="/join/band"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white shadow-lg"
              >
                Register Your Band <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
}
