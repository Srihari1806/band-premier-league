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
  CalendarRange, 
  Sparkles,
  Percent,
  MapPin,
  Ticket,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowDown,
  Info,
  Layers,
  Handshake,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

export const Route = createFileRoute("/join/")({
  head: () => ({
    meta: [
      { title: "Join Kalakshetra — Onboarding Hub" },
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
    description: "Partner with Kalakshetra to host live matches and tour gigs.",
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
  const [activeExplainTab, setActiveExplainTab] = useState<"comparison" | "matrix" | "venues" | "cashflows" | "pipeline">("comparison");

  // Generalized mock data from BPL 2.webp bidding section
  const BIDDING_QUOTES = {
    A: { name: "Franchise Investor A", quotes: ["₹8,00,000", "₹6,00,000", "₹7,50,000", "₹5,50,000"], wins: "Band 1" },
    B: { name: "Franchise Investor B", quotes: ["₹7,0,000", "₹8,50,000", "₹8,50,000", "₹6,00,000"], wins: "Band 2" },
    C: { name: "Franchise Investor C", quotes: ["₹6,50,000", "₹6,00,000", "₹9,00,000", "₹7,00,000"], wins: "Band 3" },
    D: { name: "Franchise Investor D", quotes: ["₹5,50,000", "₹7,00,000", "₹6,00,000", "₹8,00,000"], wins: "Band 4" },
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
            Choose how you want to become part of the Kalakshetra ecosystem. Select a role below to start your application process.
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
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">How Kalakshetra Works</h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Kalakshetra operates as an asset-light orchestration platform. We create demand, set rules, and coordinate stakeholders, while specialized partners provide venue operations, production, and marketing.
            </p>
          </div>

          {/* ASSET-LIGHT EXPLANATION TABS */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap border border-border rounded-lg overflow-hidden bg-secondary/20">
              {[
                { id: "comparison", label: "IPL vs Raaga of Kurukshetra Model", icon: Layers },
                { id: "matrix", label: "Who Can Hire Whom", icon: Handshake },
                { id: "venues", label: "Venue Options (A, B, C)", icon: Building2 },
                { id: "cashflows", label: "Inflows & Outflows", icon: DollarSign },
                { id: "pipeline", label: "Ecosystem Flow Map", icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveExplainTab(tab.id as any)}
                    className={`flex-1 py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 border-r border-border last:border-0 ${
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
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">IPL vs Raaga of Kurukshetra Comparison Structure</h3>
                  <p className="text-xs text-muted-foreground">How the franchise music league maps directly onto a professional sports format.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">IPL Counterpart</th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">Raaga of Kurukshetra Role</th>
                        <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">Core Responsibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {[
                        ["BCCI", "Kalakshetra (Operator)", "Sets rules, runs fixtures. Gets sponsorship & ticket commission, spending on league prize pools, operations, and hiring event managers."],
                        ["Franchise Owner", "Production House", "Acts as the artist investor. Decides whether to perform services in-house or outsource. Invests directly in catalog production and band marketing."],
                        ["Players", "Bands / Solo Artists", "The central talent. Retain a 40% live ticket revenue share and a 50% digital IP royalty share."],
                        ["Stadium", "Venues / Cafés / Colleges", "IPL cricket stadiums require massive upfront rentals. Kalakshetra cafés/venues often host for free (for F&B sales) or use hybrid guarantee + share models."],
                        ["Broadcaster", "YouTube & Audio Platforms", "IPL sells satellite rights centrally. Production houses earn major revenues from YT/Spotify. If hit, Kalakshetra sells TV 'Tournament War' telecast rights."],
                        ["Sponsors", "Brand Sponsors", "Provide sponsorship capital. Divided between operators (for prize pool & operations) and event manager logistics funding."],
                        ["Fan Clubs", "Outsourced Promoters", "Campus & cafe promoter networks hired by Kalakshetra or Production Houses to drive ticket sales and local meetups."],
                        ["Event Operations", "Contracted Event Managers", "Hired & paid directly by Kalakshetra Operator (out of the 30% ticket share) to execute matching logistics, stage setup, and security."],
                      ].map(([ipl, bpl, desc], idx) => (
                        <tr key={idx} className="hover:bg-secondary/10">
                          <td className="py-3 px-4 font-bold text-white font-display">{ipl}</td>
                          <td className="py-3 px-4 font-bold text-primary-glow">{bpl}</td>
                          <td className="py-3 px-4 text-muted-foreground leading-relaxed">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HIRING MATRIX */}
            {activeExplainTab === "matrix" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">Ecosystem Hiring Matrix</h3>
                  <p className="text-xs text-muted-foreground">Who contracts whom under Kalakshetra's decentralized, asset-light model.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="py-2.5 px-4 font-bold text-primary-glow uppercase tracking-wider">Ecosystem Service</th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow text-center uppercase tracking-wider">Hired by Kalakshetra</th>
                        <th className="py-2.5 px-4 font-bold text-primary-glow text-center uppercase tracking-wider">Hired by Production House</th>
                        <th className="py-2.5 px-4 font-bold text-muted-foreground uppercase tracking-wider">Operational Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {[
                        ["Event Managers", "✅ Primary (Contracted)", "❌ Rare", "Kalakshetra contracts managers to operate the tour matches cleanly on-site."],
                        ["Venues / Cafes", "✅ Primary (Booked)", "❌ Rare", "Kalakshetra partners directly with cafes to secure local match stadiums."],
                        ["Media Partners", "Optional", "✅ Primary (Outsourced)", "Production Houses hire videographers for official music videos & shoots."],
                        ["Photographers", "Optional", "✅ Primary (Outsourced)", "Production Houses hire photographers for artist branding campaigns."],
                        ["Influencers", "Optional", "✅ Primary (Outsourced)", "Production Houses pay influencers to promote their drafted bands."],
                        ["Campus Networks", "✅ Yes (Qualifiers)", "✅ Yes (Ticket Promos)", "Both hire campus ambassadors to mobilize students for live fixtures."],
                        ["Cafe Communities", "Optional", "✅ Primary (Outsourced)", "Production Houses hire local gathering networks for café fan promotions."],
                        ["Music Distributors", "❌ No", "✅ Primary (Outsourced)", "Production Houses manage third-party distribution to release tracks."],
                      ].map(([service, bpl, ph, desc], idx) => (
                        <tr key={idx} className="hover:bg-secondary/10">
                          <td className="py-3 px-4 font-bold text-white">{service}</td>
                          <td className="py-3 px-4 text-center font-bold">{bpl}</td>
                          <td className="py-3 px-4 text-center font-bold">{ph}</td>
                          <td className="py-3 px-4 text-muted-foreground leading-relaxed">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VENUE OPTIONS */}
            {activeExplainTab === "venues" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">Cafe / Venue Partnership Models</h3>
                  <p className="text-xs text-muted-foreground">Cafes provide stages and seating. Kalakshetra secures stadium infrastructure under three alignment models.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="p-5 border border-border bg-secondary/10 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">MODEL A</span>
                      <DollarSign size={14} className="text-primary-glow" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Flat Venue Rental</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Kalakshetra pays a flat, fixed fee to rent the space upfront for the gig night. Cafe retains 100% of Food & Beverage revenues.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] font-mono font-bold text-primary-glow">Example: Fixed ₹25,000 / Show</p>
                    </div>
                  </div>

                  <div className="p-5 border border-border bg-secondary/10 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">MODEL B</span>
                      <Percent size={14} className="text-primary-glow" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Ticketing Revenue Share</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No upfront rental risk. The café receives a direct percentage commission of the live matchup gate ticket sales.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] font-mono font-bold text-primary-glow">Example: 15% – 25% Ticket Sales</p>
                    </div>
                  </div>

                  <div className="p-5 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary-glow">MODEL C (Common)</span>
                      <CheckCircle2 size={14} className="text-primary-glow" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Hybrid Guarantee</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      De-risks cafe venue hosts while aligning incentives. Kalakshetra pays a lower fixed base guarantee combined with a smaller ticket commission.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] font-mono font-bold text-primary-glow">Example: ₹15,000 + 10% Ticket sales</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INFLOWS & OUTFLOWS */}
            {activeExplainTab === "cashflows" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">Ecosystem Capital Flow Grid (Inflows vs Outflows)</h3>
                  <p className="text-xs text-muted-foreground">Detailed breakdown of where bands, investors, and operators earn money and where they invest it.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  
                  {/* Bands Column */}
                  <div className="p-5 border border-border bg-secondary/15 rounded-lg space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary block"></span> Bands / Solo Artists</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-primary-glow">💰 Inflows (Earnings)</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                            <li>40% Live ticket split per show</li>
                            <li>50% Audio streaming split (Spotify, Wynk)</li>
                            <li>50% YouTube ad revenue & sync licensing</li>
                            <li>Direct merch sales & barters</li>
                          </ul>
                        </div>
                        <div className="space-y-1 pt-2">
                          <p className="text-[10px] uppercase font-bold text-red-400">💸 Outflows (Investments)</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Band gear & instrument upgrades</li>
                            <li>Rehearsal space rentals</li>
                            <li>Solo artist personal logistics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Production Investors Column */}
                  <div className="p-5 border border-border bg-secondary/15 rounded-lg space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 block"></span> Production Investors</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-primary-glow">💰 Inflows (Earnings)</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                            <li>30% Live ticketing commission split</li>
                            <li>50% Audio streaming master royalties</li>
                            <li>50% Video views, brand deals & ads</li>
                            <li>Bespoke sponsor band integration fees</li>
                          </ul>
                        </div>
                        <div className="space-y-1 pt-2">
                          <p className="text-[10px] uppercase font-bold text-red-400">💸 Outflows (Investments)</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Studio recording, mixing & mastering</li>
                            <li>Video production, camera crew & editing</li>
                            <li>Band marketing, promo campaigns, and ads</li>
                            <li>Outsourcing campus/cafe promoters</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kalakshetra Operator Column */}
                  <div className="p-5 border border-primary/20 bg-primary/5 rounded-lg space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 block"></span> Kalakshetra Operator</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-primary-glow">💰 Inflows (Earnings)</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                            <li>30% Live matchup gate ticket split</li>
                            <li>Brand sponsorships & naming rights</li>
                            <li>Future TV/OTT telecast rights (Tournament War)</li>
                            <li>Ticketing platform partner commission</li>
                          </ul>
                        </div>
                        <div className="space-y-1 pt-2">
                          <p className="text-[10px] uppercase font-bold text-red-400">💸 Outflows (Investments)</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Contracting Event Managers (on-ground ops)</li>
                            <li>Tournament prize pool & champion awards</li>
                            <li>Café hybrid rental base guarantee payouts</li>
                            <li>Tournament scoring, tech & app maintenance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: ECOSYSTEM PIPELINE GRAPH */}
            {activeExplainTab === "pipeline" && (
              <div className="bpl-card p-6 md:p-8 space-y-6 text-left animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white">Ecosystem Hiring & Operational Flow</h3>
                  <p className="text-xs text-muted-foreground">Visual mapping of the platform coordination flows and outsourcing relationships.</p>
                </div>
                
                {/* Visual Flow diagram */}
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

          {/* SECTION 1: LEAGUE STRUCTURE & SECRET BIDDING (Detailed flowchart content) */}
          <div className="bpl-card p-6 md:p-8 space-y-8 text-left">
            <div className="border-b border-border/65 pb-5">
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">PHASE 02</span>
              <h3 className="text-xl font-display font-bold text-white mt-1.5">2. Bidding & Production House Investment</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Box A: Sealed Bidding */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">The Sealed Bidding Process</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  BPL releases band profiles, stats, and genre tracks to registered Franchise Investors. Each Production House submits sealed bids detailing their co-production allocations.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 border border-border bg-secondary/20 rounded flex justify-between">
                    <span className="text-muted-foreground">Franchise Investor A winning bid:</span>
                    <span className="font-mono text-white font-bold">Band 1 (₹8,00,000)</span>
                  </div>
                  <div className="p-3 border border-border bg-secondary/20 rounded flex justify-between">
                    <span className="text-muted-foreground">Franchise Investor B winning bid:</span>
                    <span className="font-mono text-white font-bold">Band 2 (₹8,50,000)</span>
                  </div>
                  <div className="p-3 border border-border bg-secondary/20 rounded flex justify-between">
                    <span className="text-muted-foreground">Franchise Investor C winning bid:</span>
                    <span className="font-mono text-white font-bold">Band 3 (₹9,00,000)</span>
                  </div>
                  <div className="p-3 border border-border bg-secondary/20 rounded flex justify-between">
                    <span className="text-muted-foreground">Franchise Investor D winning bid:</span>
                    <span className="font-mono text-white font-bold">Band 4 (₹8,00,000)</span>
                  </div>
                </div>
              </div>

              {/* Box B: Production Outsourcing */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Production Outsourcing Model</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Winning Production Houses act as the band's financial backer. They are free to execute video production, social media promotions, and campus distributions using their own teams or outsource to Kalakshetra-approved ecosystem partners:
                </p>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-muted-foreground">
                  <div className="p-3 border border-border bg-surface/30 rounded-lg">
                    <span className="font-bold text-white block mb-0.5">Media & Video Partners</span>
                    Hired to shoot music videos, reels, and BTS aftermovies.
                  </div>
                  <div className="p-3 border border-border bg-surface/30 rounded-lg">
                    <span className="font-bold text-white block mb-0.5">Local Communities</span>
                    Hired for cafe gig activations and local meetup marketing.
                  </div>
                  <div className="p-3 border border-border bg-surface/30 rounded-lg">
                    <span className="font-bold text-white block mb-0.5">Campus Network</span>
                    Hired for college promos, ambassadors, and qualifiers.
                  </div>
                  <div className="p-3 border border-border bg-surface/30 rounded-lg">
                    <span className="font-bold text-white block mb-0.5">Third-Party Distro</span>
                    Hired to release tracks on Spotify, Apple Music, etc.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: REVENUE SPLIT GRAPHICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            
            {/* Live Show Ticket Splits */}
            <div className="bpl-card p-6 md:p-8 space-y-6">
              <div className="border-b border-border/65 pb-4">
                <h3 className="text-lg font-display font-bold text-white">Live Event Ticketing splits</h3>
                <p className="text-xs text-muted-foreground">Audited event payouts processed immediately after live shows.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary block"></span> Bands / Solo Artists</span>
                  <span className="font-mono text-primary-glow font-bold">40% Share</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "40%" }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 block"></span> Production House (Investor)</span>
                  <span className="font-mono text-teal-400 font-bold">30% Share</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: "30%" }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 block"></span> Kalakshetra Operator</span>
                  <span className="font-mono text-amber-400 font-bold">30% Share</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>
            </div>

            {/* Digital Content Royalty Splits */}
            <div className="bpl-card p-6 md:p-8 space-y-6">
              <div className="border-b border-border/65 pb-4">
                <h3 className="text-lg font-display font-bold text-white">Digital Content Payouts</h3>
                <p className="text-xs text-muted-foreground">Long-term IP royalties earned from audio releases, YT views, and sponsorships.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary block"></span> Bands / Solo Artists</span>
                  <span className="font-mono text-primary-glow font-bold">50% Share</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "50%" }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 block"></span> Production House (Franchise Investor)</span>
                  <span className="font-mono text-teal-400 font-bold">50% Share</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground pt-1.5">
                * Content royalties are released co-equally (50/50) between the artists and the production house co-investors.
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
