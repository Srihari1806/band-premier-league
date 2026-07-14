import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { motion } from "framer-motion";
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
  HelpCircle
} from "lucide-react";

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

          {/* League Revenue Box */}
          <div className="mt-8 bpl-card p-6 border-primary/20 bg-primary/3 text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp size={16} className="text-primary-glow" />
              League Revenue & Reinvestment
            </h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              League-level revenues from <strong>Broadcast Rights, Digital Streaming, Advertising, and Sponsors</strong> are collected directly by the Kalakshetra Operator. We reinvest 100% of league-level revenues into prize pools, league on-ground operations, developer platform growth, and marketing future seasons to expand the audience.
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
