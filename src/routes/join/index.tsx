import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import { 
  Music, 
  User, 
  Building2, 
  Tv, 
  Megaphone, 
  Award, 
  Users, 
  Camera, 
  Mic, 
  GraduationCap, 
  CalendarRange, 
  Sparkles,
  Percent,
  MapPin,
  Ticket,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowDown,
  Info
} from "lucide-react";

export const Route = createFileRoute("/join/")({
  head: () => ({
    meta: [
      { title: "Join BPL — Onboarding Hub" },
      { name: "description", content: "Join India's First Franchise Music League. Choose your role: Artist, Venue, Sponsor, Production House, Volunteer, or Manager." },
    ],
  }),
  component: JoinHubPage,
});

const ROLES = [
  {
    title: "Band",
    description: "Apply as a full band lineup to compete in the league.",
    to: "/join/band",
    search: { type: "band" },
    icon: Music,
    badge: "Most Popular",
  },
  {
    title: "Solo Artist",
    description: "Apply as a solo musician, singer, or instrumentalist.",
    to: "/join/band",
    search: { type: "solo" },
    icon: User,
  },
  {
    title: "Venue / Cafe",
    description: "Partner with BPL to host live matches and tour gigs.",
    to: "/join/venue",
    icon: Building2,
  },
  {
    title: "Production House",
    description: "Invest in artist IP, support tours, and manage rights.",
    to: "/join/production-house",
    icon: Tv,
  },
  {
    title: "Sponsor",
    description: "Sponsor league franchises, stages, or stream broadcasts.",
    to: "/join/sponsor",
    icon: Megaphone,
  },
  {
    title: "Influencer",
    description: "Amplifying the league's noise and reviewing matches.",
    to: "/join/influencer",
    icon: Award,
  },
  {
    title: "Event Manager",
    description: "Manage match operations, execution, and security on-site.",
    to: "/join/event-manager",
    icon: CalendarRange,
  },
  {
    title: "Volunteer / Creative",
    description: "Get hands-on experience in videography, photography, or promotion.",
    to: "/join/volunteer",
    icon: Users,
  },
];

function JoinHubPage() {
  const [activePHBidTab, setActivePHBidTab] = useState<"A" | "B" | "C" | "D">("A");

  // Sample data from BPL 2.webp bidding section
  const BIDDING_QUOTES = {
    A: { name: "Tamada Media", quotes: ["₹8,00,000", "₹6,00,000", "₹7,50,000", "₹5,50,000"], wins: "Band 1" },
    B: { name: "Infinitum Network", quotes: ["₹7,00,000", "₹8,50,000", "₹8,50,000", "₹6,00,000"], wins: "Band 2" },
    C: { name: "Swipe Up Media", quotes: ["₹6,50,000", "₹6,00,000", "₹9,00,000", "₹7,00,000"], wins: "Band 3" },
    D: { name: "Independent Studio", quotes: ["₹5,50,000", "₹7,00,000", "₹6,00,000", "₹8,00,000"], wins: "Band 4" },
  };

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background/90 via-background/40 to-background">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow font-bold">Join the Music Revolution</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white">
            Join India's First Franchise Music League
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose how you want to become part of the BPL ecosystem. Select a role below to start your application process.
          </p>
        </div>
      </section>

      {/* Role Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Link 
                key={role.title} 
                to={role.to}
                search={role.search as any}
                className="bpl-card p-6 flex flex-col justify-between hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition duration-300 relative group cursor-pointer"
              >
                {role.badge && (
                  <span className="absolute top-3 right-3 text-[9px] uppercase tracking-widest bg-primary/20 text-primary-glow border border-primary/40 px-2 py-0.5 rounded font-bold">
                    {role.badge}
                  </span>
                )}
                
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon size={22} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-primary-glow transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-primary-glow group-hover:text-primary transition-colors">
                  Apply Now <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW BPL WORKS FLOWCHART SECTION */}
      <section className="border-t border-border bg-slate-950/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-glow font-bold">Ecosystem Model</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">How BPL Works</h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
              BPL is an IPL-style music league. Below is the structured flow of how bands draft, production houses invest, gigs monetize, and revenues payout.
            </p>
          </div>

          {/* SECTION 1: LEAGUE STRUCTURE & SECRET BIDDING */}
          <div className="bpl-card p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/65 pb-5 gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">PHASE 01</span>
                <h3 className="text-xl font-display font-bold text-white mt-1.5">1. League Structure & Secret Bidding</h3>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-md">
                Bands apply as franchise teams. Production houses submit secret bids to secure music and video rights for their chosen bands.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* 4 Bands Box */}
              <div className="lg:col-span-3 space-y-3">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">4 Bands (Teams)</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["Band 1", "Rock", "text-red-400 bg-red-950/20 border-red-900/40"],
                    ["Band 2", "Indie", "text-blue-400 bg-blue-950/20 border-blue-900/40"],
                    ["Band 3", "Pop", "text-purple-400 bg-purple-950/20 border-purple-900/40"],
                    ["Band 4", "Folk", "text-amber-400 bg-amber-950/20 border-amber-900/40"],
                  ].map(([b, g, c]) => (
                    <div key={b} className={`p-3 border rounded-lg text-center ${c}`}>
                      <Music size={14} className="mx-auto mb-1.5 opacity-80" />
                      <p className="text-xs font-bold">{b}</p>
                      <p className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5">{g}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bidding Arrow */}
              <div className="lg:col-span-1 flex lg:flex-col justify-center items-center gap-1 py-2">
                <div className="h-0.5 lg:h-12 w-8 lg:w-0.5 bg-gradient-to-r lg:bg-gradient-to-b from-primary/80 to-transparent" />
                <Sparkles size={16} className="text-primary-glow shrink-0" />
                <div className="h-0.5 lg:h-12 w-8 lg:w-0.5 bg-gradient-to-l lg:bg-gradient-to-t from-primary/80 to-transparent" />
              </div>

              {/* Secret Bidding Console */}
              <div className="lg:col-span-5 bpl-card bg-surface/30 p-5 space-y-4 border-dashed border-border/80">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Secret Bidding Draft (Simulation)</p>
                  <span className="text-[9px] bg-primary/20 text-primary-glow border border-primary/30 px-2 py-0.5 rounded font-mono font-bold">PROPOSAL STAGE</span>
                </div>
                
                {/* Tabs */}
                <div className="flex border border-border rounded overflow-hidden">
                  {(["A", "B", "C", "D"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePHBidTab(tab)}
                      className={`flex-1 py-1.5 text-[10px] font-bold transition-all ${
                        activePHBidTab === tab 
                          ? "bg-primary text-white" 
                          : "bg-secondary text-muted-foreground hover:text-white"
                      }`}
                    >
                      PH {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1.5">
                    <span>Quotes by {BIDDING_QUOTES[activePHBidTab].name}:</span>
                    <span className="text-primary-glow font-bold">Highest Bid Wins the Band</span>
                  </div>
                  {BIDDING_QUOTES[activePHBidTab].quotes.map((quote, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-border/20">
                      <span className="text-muted-foreground">Band {idx + 1} Quote:</span>
                      <span className="font-mono text-white font-bold">{quote}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-[10px] text-primary-glow font-bold flex items-center gap-1.5">
                    <Info size={12} />
                    <span>Projected Auction Win: {BIDDING_QUOTES[activePHBidTab].wins}</span>
                  </div>
                </div>
              </div>

              {/* Bidding Arrow 2 */}
              <div className="lg:col-span-1 flex lg:flex-col justify-center items-center gap-1 py-2">
                <div className="h-0.5 lg:h-12 w-8 lg:w-0.5 bg-gradient-to-r lg:bg-gradient-to-b from-primary/80 to-transparent" />
                <ArrowRight size={14} className="text-primary-glow shrink-0 hidden lg:block" />
                <ArrowDown size={14} className="text-primary-glow shrink-0 lg:hidden" />
                <div className="h-0.5 lg:h-12 w-8 lg:w-0.5 bg-gradient-to-l lg:bg-gradient-to-t from-primary/80 to-transparent" />
              </div>

              {/* Winners Grid */}
              <div className="lg:col-span-2 space-y-3">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Auction Winners</p>
                <div className="space-y-2 text-left">
                  {[
                    ["Band 1", "PH A", "₹8,00,000"],
                    ["Band 2", "PH B", "₹8,50,000"],
                    ["Band 3", "PH C", "₹9,00,000"],
                    ["Band 4", "PH D", "₹8,00,000"],
                  ].map(([b, ph, bid]) => (
                    <div key={b} className="p-2 border border-border bg-secondary/30 rounded flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">{b}</p>
                        <p className="text-[9px] text-primary-glow font-semibold mt-0.5">{ph}</p>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-muted-foreground">{bid}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCTION HOUSE INVESTMENT & RIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Box A: Investment Allocations */}
            <div className="bpl-card p-6 md:p-8 space-y-6 text-left">
              <div className="border-b border-border/65 pb-4">
                <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">PHASE 02</span>
                <h3 className="text-lg font-display font-bold text-white mt-1">2. Production House Investment</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The winning Production House finances the band's catalog production. Budget is divided into two distinct allocations:
              </p>

              <div className="space-y-4">
                {/* Category 1 */}
                <div className="flex gap-4 p-4 border border-border/80 bg-secondary/20 rounded-lg">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary-glow shrink-0 border border-primary/20">
                    <Mic size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Music Production (Studio Sessions)</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Includes recording studio access, instruments & tools, mixing & mastering fees, and digital music distribution setups.
                    </p>
                  </div>
                </div>

                {/* Category 2 */}
                <div className="flex gap-4 p-4 border border-border/80 bg-secondary/20 rounded-lg">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary-glow shrink-0 border border-primary/20">
                    <Camera size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Video Production (Music Video shoot)</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Includes storyboard conception, video shooting equipment, professional post-production editing, reels, and BTS content creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Box B: Winner Rights Ownership */}
            <div className="bpl-card p-6 md:p-8 space-y-6 text-left">
              <div className="border-b border-border/65 pb-4">
                <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">BENEFITS</span>
                <h3 className="text-lg font-display font-bold text-white mt-1">Rights Ownership & ROI</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In exchange for the catalog production investment, the winning production house secures shared rights ownership:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rights 1 */}
                <div className="p-4 border border-border bg-surface/30 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-primary-glow">1. Audio Rights (50%)</h4>
                  <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Music Distribution</li>
                    <li>Streaming Platforms</li>
                    <li>Publishing rights</li>
                  </ul>
                </div>

                {/* Rights 2 */}
                <div className="p-4 border border-border bg-surface/30 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-primary-glow">2. Video Rights (50%)</h4>
                  <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>YouTube monetization</li>
                    <li>Brand collaborations</li>
                    <li>Sync licensing</li>
                  </ul>
                </div>
              </div>

              {/* ROI Summary */}
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg flex items-center gap-3">
                <TrendingUp size={20} className="text-primary-glow shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Ecosystem Returns Model</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                    Secures 50% of audio/video digital content revenues + 40% of live gig payouts generated by the band.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: EVENT MANAGEMENT & TICKETING GIG CIRCUIT */}
          <div className="bpl-card p-6 md:p-8 space-y-8 text-left">
            <div className="border-b border-border/65 pb-5">
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">PHASE 03</span>
              <h3 className="text-xl font-display font-bold text-white mt-1.5">3. Live Tour Matchups & Ticket Partner</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Box 1: Title Sponsor */}
              <div className="p-5 border border-border bg-secondary/10 rounded-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-primary-glow" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Event Management (Title Sponsor)</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sponsors fund localized logistics, college qualifiers, stage operations, marketing campaigns, and artist travel expenses.
                  </p>
                </div>
                <ul className="text-[10px] text-muted-foreground space-y-1 border-t border-border/40 pt-3">
                  <li>• Title Sponsor Branding</li>
                  <li>• On-ground brand visibility</li>
                  <li>• 40% Live Ticket Revenue share</li>
                </ul>
              </div>

              {/* Box 2: Live Gigs (Match Stadium) */}
              <div className="p-5 border border-primary/20 bg-primary/5 rounded-lg space-y-4 flex flex-col justify-center text-center">
                <div className="space-y-2">
                  <MapPin size={24} className="text-primary-glow mx-auto" />
                  <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">LIVE SHOWS & EVENTS</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    The core matchup stadium. Weekend gig fixtures hosted across 6 partner cafes and rooftops.
                  </p>
                </div>
                <div className="border border-border/60 bg-slate-950/40 rounded py-2 px-3 inline-block mx-auto text-[10px] font-mono text-primary-glow">
                  Hyderabad Pilot: 24 Matches
                </div>
              </div>

              {/* Box 3: Ticket Mediator */}
              <div className="p-5 border border-border bg-secondary/10 rounded-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-primary-glow" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ticket Sales Partner (Growzery)</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Our digital mediator. Handles all booking widgets, attendee barcode generation, and F&B voucher validation checkouts.
                  </p>
                </div>
                <ul className="text-[10px] text-muted-foreground space-y-1 border-t border-border/40 pt-3">
                  <li>• Core platforms: Growzery, BMS, District</li>
                  <li>• commission payout per ticket sold</li>
                  <li>• Validates the ₹199 F&B entry hook</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 4 & 5: REVENUE SHARING MODELS */}
          <div className="bpl-card p-6 md:p-8 space-y-8 text-left">
            <div className="border-b border-border/65 pb-5">
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">PHASE 04</span>
              <h3 className="text-xl font-display font-bold text-white mt-1.5">4. Ecosystem Revenue Sharing Model</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Revenue Split */}
              <div className="p-5 border border-border bg-secondary/20 rounded-lg space-y-4">
                <p className="text-xs font-bold text-white uppercase tracking-wider">A. Event Revenue (Ticket Sales)</p>
                
                {/* Mini Visual Chart */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-amber-400 border-r-teal-400 flex items-center justify-center font-bold text-[10px] text-white font-mono">20%</div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary block"></span> Artists (40%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 block"></span> Title Sponsor (40%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 block"></span> BPL Operator (20%)</div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                  Ticketing payouts from gig passes are split transparently directly after show verification.
                </p>
              </div>

              {/* Audio Revenue Split */}
              <div className="p-5 border border-border bg-secondary/20 rounded-lg space-y-4">
                <p className="text-xs font-bold text-white uppercase tracking-wider">B. Audio Revenue (YT, Streaming)</p>
                
                {/* Mini Visual Chart */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-r-teal-400 flex items-center justify-center font-bold text-[10px] text-white font-mono">50%</div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary block"></span> Artists (50%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 block"></span> Production House (50%)</div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                  Revenues from Spotify, Apple Music, Gaana, Wynk, and Kavi Audio digital streaming platforms.
                </p>
              </div>

              {/* Video Revenue Split */}
              <div className="p-5 border border-border bg-secondary/20 rounded-lg space-y-4">
                <p className="text-xs font-bold text-white uppercase tracking-wider">C. Video & Sync Revenue</p>
                
                {/* Mini Visual Chart */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-r-teal-400 flex items-center justify-center font-bold text-[10px] text-white font-mono">50%</div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary block"></span> Artists (50%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 block"></span> Production House (50%)</div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                  Revenues from YouTube Ads, Instagram deals, brand collabs, sync licensing placements, and OTT platforms.
                </p>
              </div>
            </div>

            {/* Audio Release Partner */}
            <div className="p-4 border border-border bg-surface/30 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center text-primary-glow">
                  <Mic size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Audio Release Platform Partner: Kavi Audio</h4>
                  <p className="text-[10px] text-muted-foreground">Exclusivity release window partner for BPL original tracks.</p>
                </div>
              </div>
              <span className="text-[9px] bg-primary/20 text-primary-glow border border-primary/30 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">DIGITAL RELEASE</span>
            </div>
          </div>

          {/* SECTION 6: KEY ECOSYSTEM PARTNERS (SUPPORT SYSTEM) */}
          <div className="bpl-card p-6 md:p-8 space-y-6 text-left">
            <div className="border-b border-border/65 pb-4">
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">SUPPORT</span>
              <h3 className="text-lg font-display font-bold text-white mt-1">5. Key Ecosystem Partners & Support System</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                ["Student Tribe", "Campus Promoters", "Connects colleges, student ambassadors, Qualifiers, and crowd mobilization."],
                ["Communitie.in", "Cafes & Gatherers", "Cafe tie-ups, local community activations, cafe gig partnerships, local promoter marketing."],
                ["Flashoot", "Video Bloggers", "Behind the Scenes coverage, reels, short-form vlogs, and match promo filming."],
                ["Social Media", "City Influencers", "Instagram pages, local influencer reviews, trends, and content campaign pushes."],
                ["Event Managers", "Local Coordinators", "On-ground support, venue bookings, production management, and rental contracts."],
              ].map(([t, sub, desc], idx) => (
                <div key={idx} className="p-4 border border-border bg-secondary/20 rounded-lg space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{t}</h4>
                    <p className="text-[9px] text-primary-glow font-bold uppercase tracking-wider">{sub}</p>
                    <p className="text-[10px] text-muted-foreground leading-normal pt-1.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7, 8 & 9: CASH FLOW & PILOT ROADMAP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cash Flow Summary */}
            <div className="bpl-card p-6 md:p-8 space-y-5 text-left flex flex-col justify-between">
              <div>
                <div className="border-b border-border/65 pb-3.5">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">BUDGETS</span>
                  <h3 className="text-base font-display font-bold text-white mt-1">6. Cash Flow Projections (Example)</h3>
                </div>
                <div className="space-y-3.5 text-[11px] pt-4">
                  <div>
                    <div className="flex justify-between font-bold text-white">
                      <span>Production House Bid (Winner)</span>
                      <span className="font-mono text-primary-glow">₹5,20,000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground pl-3 text-[10px] mt-0.5">
                      <span>• Music Production Allocation</span>
                      <span className="font-mono">₹2,50,000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground pl-3 text-[10px]">
                      <span>• Video Production Allocation</span>
                      <span className="font-mono">₹2,70,000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-white">
                      <span>Event Sponsor Budget</span>
                      <span className="font-mono text-primary-glow">₹3,00,000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground pl-3 text-[10px] mt-0.5">
                      <span>• Marketing & Publicity</span>
                      <span className="font-mono">₹2,00,000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground pl-3 text-[10px]">
                      <span>• Travel & Logistics</span>
                      <span className="font-mono">₹1,00,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Pilot Budget</span>
                <span className="text-sm font-mono font-bold text-white">₹8,20,000</span>
              </div>
            </div>

            {/* Return Flow Summary */}
            <div className="bpl-card p-6 md:p-8 space-y-5 text-left flex flex-col justify-between">
              <div>
                <div className="border-b border-border/65 pb-3.5">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">RETURNS</span>
                  <h3 className="text-base font-display font-bold text-white mt-1">7. Return Flow Payout Structure</h3>
                </div>
                <div className="space-y-4 pt-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-white">A. Event Revenue Payouts</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Ticket revenues per show: Artists receive 40%, Title Sponsor 40%, and BPL Operator retains 20%.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-white">B. Digital Content Royalties</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Audio streams, YouTube Ads, brand sponsorships, and sync license rights are split 50% Artist / 50% Production House.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 text-[9px] uppercase tracking-wider font-bold text-primary-glow">
                * Fully documented & audited splits
              </div>
            </div>

            {/* League Growth Plan */}
            <div className="bpl-card p-6 md:p-8 space-y-5 text-left flex flex-col justify-between">
              <div>
                <div className="border-b border-border/65 pb-3.5">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">ROADMAP</span>
                  <h3 className="text-base font-display font-bold text-white mt-1">8. League Growth Plan</h3>
                </div>
                <ul className="space-y-2 text-[10px] text-muted-foreground pt-4 list-decimal list-inside leading-relaxed">
                  <li><strong className="text-white">Hyderabad Pilot:</strong> Validate 4 bands & 4 production houses.</li>
                  <li><strong className="text-white">Multi-City Expansion:</strong> Launch events across Bangalore, Mumbai, and Delhi.</li>
                  <li><strong className="text-white">Campus Integrations:</strong> Run qualifiers in college campuses.</li>
                  <li><strong className="text-white">Digital Scaling:</strong> License BPL tracks to OTT platforms and video games.</li>
                  <li><strong className="text-white">Original IP:</strong> Build long-term catalogs, rights, and merch value.</li>
                </ul>
              </div>

              <div className="border-t border-border pt-4 mt-4 text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                Phase 1 Pilot Validations
              </div>
            </div>

          </div>

          {/* Connective Footer Pipeline */}
          <div className="bpl-card p-5 bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10 rounded-lg text-center border border-border/80 max-w-4xl mx-auto space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-primary-glow font-bold">End-to-End Pipeline Summary</p>
            <div className="flex flex-wrap justify-center items-center gap-2 text-[9px] font-bold text-muted-foreground">
              <span>Bands Curated</span>
              <ArrowRight size={10} className="text-primary-glow shrink-0" />
              <span>Secret Bidding</span>
              <ArrowRight size={10} className="text-primary-glow shrink-0" />
              <span>PH Production Win</span>
              <ArrowRight size={10} className="text-primary-glow shrink-0" />
              <span>Event management Sponsor</span>
              <ArrowRight size={10} className="text-primary-glow shrink-0" />
              <span>Cafe Live Matchups</span>
              <ArrowRight size={10} className="text-primary-glow shrink-0" />
              <span>₹199 Pass + F&B Coupon</span>
              <ArrowRight size={10} className="text-primary-glow shrink-0" />
              <span>Revenue Distributed</span>
            </div>
          </div>

        </div>
      </section>
    </PageShell>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
