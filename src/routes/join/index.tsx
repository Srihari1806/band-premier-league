import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
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
  Briefcase,
  Sparkles,
  ArrowDown,
  Percent,
  MapPin,
  Ticket
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
    title: "Music Producer",
    description: "Produce official league tracks and studio sessions.",
    to: "/join/volunteer",
    search: { role: "producer" },
    icon: Sparkles,
  },
  {
    title: "Videographer",
    description: "Capture music videos, match reels, and documentary films.",
    to: "/join/volunteer",
    search: { role: "videographer" },
    icon: Tv,
  },
  {
    title: "Photographer",
    description: "Shoot official match photography and press campaigns.",
    to: "/join/volunteer",
    search: { role: "photographer" },
    icon: Camera,
  },
  {
    title: "Podcast Partner",
    description: "Host match analysis, interview artists, and run podcasts.",
    to: "/join/volunteer",
    search: { role: "podcast" },
    icon: Mic,
  },
  {
    title: "College Partner",
    description: "Bring BPL Campus Clash and regional stages to your college.",
    to: "/join/volunteer",
    search: { role: "college" },
    icon: GraduationCap,
  },
  {
    title: "Sponsor",
    description: "Sponsor league franchises, stages, or stream broadcasts.",
    to: "/join/sponsor",
    icon: Megaphone,
  },
  {
    title: "Volunteer",
    description: "Get hands-on experience in festival and gig operations.",
    to: "/join/volunteer",
    search: { role: "volunteer" },
    icon: Users,
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
];

function JoinHubPage() {
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
                  Apply Now <ArrowRightIcon className="ml-1 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW BPL WORKS FLOWCHART */}
      <section className="border-t border-border bg-slate-950/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Pipeline</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">How BPL Works Flowchart</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Before you onboard, trace the full operational pipeline of the league — from initial application to transparent revenue payouts.
            </p>
          </div>

          {/* Grid Layout of Pipeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bpl-card p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary-glow/30 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded border border-primary/20">STEP 01</span>
                  <Users className="text-muted-foreground" size={16} />
                </div>
                <h4 className="text-base font-display font-bold text-white">Onboarding & Curation</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bands, cafes, sponsors, and videographers submit applications. Approved profiles are registered into the league draft pool.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bpl-card p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary-glow/30 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded border border-primary/20">STEP 02</span>
                  <Sparkles className="text-muted-foreground" size={16} />
                </div>
                <h4 className="text-base font-display font-bold text-white">Sealed Bidding Draft</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Production Houses review the draft pool and submit secret bids. The highest bidder secures co-production and IP rights for that band.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bpl-card p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary-glow/30 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded border border-primary/20">STEP 03</span>
                  <Tv className="text-muted-foreground" size={16} />
                </div>
                <h4 className="text-base font-display font-bold text-white">Studio & Video Production</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Winning franchises fund studio recordings, professional mixing/mastering, and music video shoots to build the band's catalog.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bpl-card p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary-glow/30 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded border border-primary/20">STEP 04</span>
                  <MapPin className="text-muted-foreground" size={16} />
                </div>
                <h4 className="text-base font-display font-bold text-white">Cafe Tour Matchups</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bands perform live matches rotating across 6 partner cafes and local rooftop stages. 24 tour gigs scheduled over 8 weeks.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bpl-card p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary-glow/30 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded border border-primary/20">STEP 05</span>
                  <Ticket className="text-muted-foreground" size={16} />
                </div>
                <h4 className="text-base font-display font-bold text-white">₹199 Pass + F&B Coupon</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Fans purchase ₹199 gig passes. To support partner cafes and maximize attendance, passes include a complimentary ₹100 F&B food coupon.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bpl-card p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary-glow/30 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded border border-primary/20">STEP 06</span>
                  <Percent className="text-muted-foreground" size={16} />
                </div>
                <h4 className="text-base font-display font-bold text-white">Ecosystem Revenue Split</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Event payouts split: 50% direct to Bands, 30% to Cafe Venues, 20% to BPL. Digital content royalties split 50/50 between Artist & Franchise.
                </p>
              </div>
            </div>

          </div>

          {/* Connective Flow Visual Map */}
          <div className="bpl-card p-8 bg-gradient-to-br from-secondary/40 to-transparent space-y-6 text-left max-w-4xl mx-auto border border-border/80">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span>Ecosystem Revenue Splits</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-surface/30 border border-border">
                <p className="text-xs uppercase font-bold text-muted-foreground">Bands / Artists</p>
                <p className="text-3xl font-display font-bold text-primary-glow mt-1">50%</p>
                <p className="text-[10px] text-muted-foreground mt-1">Direct ticketing split + 50% digital IP royalty</p>
              </div>
              <div className="p-4 rounded-lg bg-surface/30 border border-border">
                <p className="text-xs uppercase font-bold text-muted-foreground">Cafes / Venues</p>
                <p className="text-3xl font-display font-bold text-primary-glow mt-1">30%</p>
                <p className="text-[10px] text-muted-foreground mt-1">Ticketing commission + 100% amplified F&B sales</p>
              </div>
              <div className="p-4 rounded-lg bg-surface/30 border border-border">
                <p className="text-xs uppercase font-bold text-muted-foreground">BPL League Network</p>
                <p className="text-3xl font-display font-bold text-primary-glow mt-1">20%</p>
                <p className="text-[10px] text-muted-foreground mt-1">Manages scoreboards, qualifiers, tech, licensing</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              * Live Event splits follow the verified BPL pilot economics format. Music & video distribution rights splits are shared co-equally (50/50) between artists and investing production houses as original catalogs are published.
            </p>
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
