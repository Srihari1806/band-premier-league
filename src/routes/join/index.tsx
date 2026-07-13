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
  Sparkles
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
