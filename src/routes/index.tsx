import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import {
  Play,
  MapPin,
  ArrowRight,
  Music,
  Users,
  Building2,
  Sparkles,
  Music2,
  Drum,
  Mic,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db, type BandApplication, type LeagueStats } from "@/lib/db";
import { isOperatorSessionActive } from "@/lib/security";
import heroImg from "@/assets/hero-concert.jpg";
import crowdImg from "@/assets/crowd.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalakshetra — The Home of Independent Music" },
      {
        name: "description",
        content:
          "Kalakshetra is the ultimate home of independent music, connecting artists, venues, and communities. Discover shows, bands, and the tournament fueling live music.",
      },
      { property: "og:title", content: "Kalakshetra — The Home of Independent Music" },
      {
        property: "og:description",
        content:
          "Shows, bands, venues, and community — all under the Raaga of Kurukshetra tournament.",
      },
    ],
  }),
  component: Home,
});

const EVENTS = [
  { title: "Kurukshetra Campus Clash", date: "12 OCT 2026", city: "Bangalore", img: crowdImg },
  { title: "Indie Night Live", date: "18 OCT 2026", city: "Mumbai", img: heroImg },
  { title: "Echoes of Earth", date: "26 OCT 2026", city: "Delhi", img: heroImg },
  { title: "Amplify Sessions", date: "02 NOV 2026", city: "Hyderabad", img: crowdImg },
];

// No static/fabricated band, venue, or production-house data.
// The homepage shows only dynamically approved records from the registry.

function Home() {
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [dynBands, setDynBands] = useState<BandApplication[]>([]);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const currentStats = await db.getStats();
        setStats(currentStats);

        const approved = await db.getApprovedRecords("band");
        setDynBands(approved);
      } catch (err) {
        console.error("Error loading home page data", err);
      }
    };
    loadHomeData();

    if (typeof window !== "undefined") {
      setIsLogged(
        db.getCurrentUser() !== null || localStorage.getItem("bpl_user_onboarded") === "true",
      );
      setIsAdmin(isOperatorSessionActive());
    }
  }, []);

  // Format stats for rendering
  const statsList = stats
    ? [
        { v: stats.total_shows, l: "Shows (8 Weeks)" },
        { v: stats.bands, l: "Pilot Bands" },
        { v: stats.cities, l: "Pilot Venues" },
        { v: stats.attendance, l: "Attendees / Show" },
        { v: stats.revenue, l: "Projected Revenue" },
        { v: stats.streaming, l: "Fan Pass Targets" },
      ]
    : [
        { v: "24", l: "Shows (8 Weeks)" },
        { v: "4", l: "Pilot Bands" },
        { v: "6", l: "Pilot Venues" },
        { v: "100", l: "Attendees / Show" },
        { v: "₹11.77L", l: "Projected Revenue" },
        { v: "200", l: "Fan Pass Targets" },
      ];

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Indie concert stage"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-28 md:py-40 text-left">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight max-w-4xl text-white">
            RAAGAM. TAALAM.
            <br />
            <span className="gradient-text">PALLAVI.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Kalakshetra — The Home of Independent Music.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {isAdmin ? (
              <Link
                to="/admin/applications"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
              >
                <Sparkles size={16} /> GO TO OPERATOR PANEL
              </Link>
            ) : isLogged ? (
              <Link
                to="/dashboard"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
              >
                <Sparkles size={16} /> GO TO DASHBOARD
              </Link>
            ) : (
              <>
                <Link
                  to="/join"
                  className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
                >
                  <Sparkles size={16} /> JOIN THE MOVEMENT
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 text-primary-glow hover:bg-primary/20 px-6 py-3 text-sm font-semibold transition"
                >
                  <Users size={16} /> ACCOUNT LOGIN
                </Link>
              </>
            )}
            <Link
              to="/league"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background/50 backdrop-blur px-6 py-3 text-sm font-semibold text-white hover:bg-secondary/40 transition cursor-pointer"
            >
              <Play size={16} /> RAAGA OF KURUKSHETRA
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT IS KALAKSHETRA */}
      <Section>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3">
              What is Kalakshetra?
            </p>
            <h2 className="text-4xl font-display font-bold text-white">
              The home of independent music.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              Kalakshetra is India&apos;s premier platform connecting indie bands, venues,
              production houses, and communities. We fuel the live music ecosystem through our grand
              tournament segment — <strong>Raaga of Kurukshetra (Raaga of Revenge)</strong> —
              providing real stages, production backing, and dedicated audiences.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-primary-glow font-medium text-xs hover:underline"
            >
              Know more <ArrowRight size={16} />
            </Link>
          </div>
          <img
            src={crowdImg}
            alt="Crowd"
            width={1600}
            height={900}
            loading="lazy"
            className="rounded-xl border border-border"
          />
        </div>
      </Section>

      {/* PHILOSOPHY SECTION */}
      <Section>
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">
            Our Foundation
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Ragam · Talam · Pallavi
          </h2>
          <p className="text-xs text-muted-foreground">
            The core elements of music re-imagined for the modern independent artist and community.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Raagam */}
          <div className="bpl-card p-8 text-left space-y-4 hover:border-[oklch(0.78_0.16_80/0.5)] hover:shadow-[0_10px_30px_-10px_oklch(0.78_0.16_80/0.2)] transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-[oklch(0.78_0.16_80/0.1)] border border-[oklch(0.78_0.16_80/0.2)] flex items-center justify-center text-[oklch(0.78_0.16_80)]">
              <Music2 size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Raagam</h3>
              <p className="text-xs text-[oklch(0.78_0.16_80)] font-semibold mt-0.5">
                The Sound of Dreams
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every artist starts with a dream and a unique voice. Raagam represents the melodies,
              the creative spark, and the creative expression that define an independent band's
              sonic identity.
            </p>
          </div>

          {/* Taalam */}
          <div className="bpl-card p-8 text-left space-y-4 hover:border-[oklch(0.60_0.22_25/0.5)] hover:shadow-[0_10px_30px_-10px_oklch(0.60_0.22_25/0.2)] transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-[oklch(0.60_0.22_25/0.1)] border border-[oklch(0.60_0.22_25/0.2)] flex items-center justify-center text-[oklch(0.60_0.22_25)]">
              <Drum size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Taalam</h3>
              <p className="text-xs text-[oklch(0.60_0.22_25)] font-semibold mt-0.5">
                The Beat of Community
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Music is nothing without its rhythm and listeners. Taalam represents the heartbeat of
              the community — the venues, cafes, organizers, and fans that keep the independent
              movement in sync and alive.
            </p>
          </div>

          {/* Pallavi */}
          <div className="bpl-card p-8 text-left space-y-4 hover:border-[oklch(0.62_0.22_290/0.5)] hover:shadow-[0_10px_30px_-10px_oklch(0.62_0.22_290/0.2)] transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-[oklch(0.62_0.22_290/0.1)] border border-[oklch(0.62_0.22_290/0.2)] flex items-center justify-center text-[oklch(0.62_0.22_290)]">
              <Mic size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Pallavi</h3>
              <p className="text-xs text-[oklch(0.62_0.22_290)] font-semibold mt-0.5">
                The Start of Every Artist
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The first verse that launches a thousand songs. Pallavi represents the ultimate
              platform — structured competitive tournaments, gigs, and professional support that
              launch bands from garage practice to national stages.
            </p>
          </div>
        </div>
      </Section>

      {/* UPCOMING EVENTS */}
      <Section title="Upcoming Events" ctaTo="/events">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((e) => (
            <Link key={e.title} to="/events" className="group bpl-card overflow-hidden block">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={e.img}
                  alt={e.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-left">
                <h3 className="font-semibold text-white truncate">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {e.date} · {e.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* FEATURED BANDS — only real approved registrations */}
      <Section title="Featured Bands" ctaTo="/bands">
        {dynBands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {dynBands.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                to="/bands/$bandId"
                params={{ bandId: b.id }}
                className="text-center group block"
              >
                <div className="mx-auto h-28 w-28 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition bg-surface">
                  <img src={b.profile_image} alt={b.band_name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 font-semibold truncate px-2 text-white">{b.band_name}</p>
                <p className="text-xs text-muted-foreground truncate">{b.genre}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bpl-card p-10 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Music size={24} className="text-primary-glow" />
            </div>
            <p className="font-semibold text-white">Season 1 bands announcing soon</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We're onboarding our first cohort of independent bands ahead of the Hyderabad pilot. Applications are open — yours could be one of the first four.
            </p>
            <Link to="/join" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition">
              <Sparkles size={12} /> Apply as a Band
            </Link>
          </div>
        )}
      </Section>

      {/* PRODUCTION HOUSES — Season 1 call for bids */}
      <Section title="Production Partners" ctaTo="/production-houses">
        <div className="bpl-card p-10 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Building2 size={24} className="text-primary-glow" />
          </div>
          <p className="font-semibold text-white">Production house bids open — Season 1</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Production houses bid to back bands for the full season — not just a single show. Invest in music, share in the revenue. Bidding opens before the Hyderabad pilot.
          </p>
          <Link to="/join" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition">
            <Sparkles size={12} /> Register as a Production House
          </Link>
        </div>
      </Section>

      {/* VENUES — Season 1 call for partners */}
      <Section title="Pilot Venues" ctaTo="/venues">
        <div className="bpl-card p-10 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <MapPin size={24} className="text-primary-glow" />
          </div>
          <p className="font-semibold text-white">Targeting 6 pilot venues — Hyderabad first</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            We're onboarding cafes and live music venues to host official Kalakshetra gigs. Partner venues get revenue splits, co-branding, and a permanent spot in the league fixture list.
          </p>
          <Link to="/join" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition">
            <Sparkles size={12} /> Register Your Venue
          </Link>
        </div>
      </Section>

      {/* MEDIA — placeholder until real releases are submitted */}
      <Section title="Music & Media" ctaTo="/media">
        <div className="bpl-card p-10 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Play size={24} className="text-primary-glow" />
          </div>
          <p className="font-semibold text-white">Original releases coming with Season 1</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Artist and band releases will appear here as they're added through the platform. Register your profile to submit your catalogue.
          </p>
          <Link to="/join" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary text-white text-xs font-semibold transition">
            Add Your Music
          </Link>
        </div>
      </Section>

      {/* HYDERABAD PILOT TARGETS */}
      <Section title="Hyderabad Pilot Targets">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsList.map((s) => (
            <div key={s.l} className="bpl-card p-6 text-center">
              <p className="text-3xl font-display font-bold gradient-text">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* COMMUNITY — Season 2 targets, clearly framed as goals */}
      <Section title="Community Targets — Season 2" ctaTo="/community">
        <div className="mb-4 px-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold tracking-widest">
            <Sparkles size={9} /> These are Season 2 growth targets, not current numbers
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, v: "2,500", l: "Student Clubs by Season 2", sub: "Starting with 3 pilot colleges" },
            { icon: Music, v: "350", l: "Cafe Communities by Season 2", sub: "Partnering 6 pilot venues first" },
            { icon: MapPin, v: "120", l: "City Ambassadors by Season 2", sub: "Hyderabad ambassador cohort open" },
            { icon: Sparkles, v: "1,200", l: "Volunteers by Season 2", sub: "Creative crew applications open" },
          ].map(({ icon: Icon, v, l, sub }) => (
            <div key={l} className="bpl-card p-6 flex items-start gap-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary-glow shrink-0 mt-0.5">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-white">{v}</p>
                <p className="text-xs text-muted-foreground font-medium">{l}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/community" className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold">
            Join the Movement
          </Link>
        </div>
      </Section>

      {/* BECOME A PARTNER */}
      <section className="relative mt-20">
        <img
          src={crowdImg}
          alt="Crowd"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Become a Partner
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm">
            Join hands with Kalakshetra and be a part of India&apos;s live music revolution.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              to="/join"
              className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
            >
              <Sparkles size={16} /> Choose Your Role
            </Link>
            <Link
              to="/join"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background/50 backdrop-blur px-6 py-3 text-sm font-semibold hover:bg-background/80 transition text-white"
            >
              <Users size={16} /> Apply to Join
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Section({
  title,
  ctaTo,
  children,
}: {
  title?: string;
  ctaTo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      {title && (
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-display font-bold tracking-tight text-white">{title}</h2>
          {ctaTo && (
            <Link
              to={ctaTo}
              className="text-xs uppercase tracking-widest text-primary-glow hover:text-primary flex items-center gap-1 font-semibold"
            >
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
