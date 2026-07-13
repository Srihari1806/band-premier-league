import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Play, Ticket, MapPin, ArrowRight, Music, Users, Building2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { db, type BandApplication, type LeagueStats } from "@/lib/db";
import { isOperatorSessionActive } from "@/lib/security";
import heroImg from "@/assets/hero-concert.jpg";
import crowdImg from "@/assets/crowd.jpg";
import bandImg from "@/assets/band-1.jpg";
import venueImg from "@/assets/venue-1.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BPL — The stage is yours. The league is ours." },
      {
        name: "description",
        content:
          "India's biggest platform for indie bands. Discover shows, venues, production houses and the community fueling live music.",
      },
      { property: "og:title", content: "BPL — Bharat Premier League for Indie Bands" },
      {
        property: "og:description",
        content: "Shows, bands, venues, analytics and community — all in one league.",
      },
    ],
  }),
  component: Home,
});

const EVENTS = [
  { title: "BPL Campus Clash", date: "12 OCT 2026", city: "Bangalore", img: crowdImg },
  { title: "Indie Night Live", date: "18 OCT 2026", city: "Mumbai", img: bandImg },
  { title: "Echoes of Earth", date: "26 OCT 2026", city: "Delhi", img: heroImg },
  { title: "Amplify Sessions", date: "02 NOV 2026", city: "Hyderabad", img: crowdImg },
];

const STATIC_BANDS = [
  { name: "The F16s", genre: "Rock" },
  { name: "Kryptos", genre: "Metal" },
  { name: "Paper Plane", genre: "Indie" },
  { name: "When Chai Met Toast", genre: "Folk Rock" },
  { name: "Blakc", genre: "Alternative" },
];

const HOUSES = ["Kraftworks", "antiSOCIAL", "Red Wolf", "OLIVE TREE", "SoA"];

const VENUES = [
  { name: "AntiSOCIAL", city: "Mumbai", pax: "600 Pax", img: venueImg },
  { name: "Hard Rock Cafe", city: "Bangalore", pax: "500 Pax", img: venueImg },
  { name: "BlueFROG", city: "Delhi", pax: "700 Pax", img: venueImg },
  { name: "FANDOM", city: "Hyderabad", pax: "600 Pax", img: venueImg },
];

const SONGS = [
  { name: "Runaway", artist: "The F16s", genre: "Rock", len: "03:45" },
  { name: "Kehna Tha", artist: "Paper Plane", genre: "Indie", len: "04:12" },
  { name: "Zinda", artist: "Kryptos", genre: "Metal", len: "04:40" },
  { name: "Safarnama", artist: "When Chai Met Toast", genre: "Folk", len: "03:58" },
];

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
      setIsLogged(db.getCurrentUser() !== null || localStorage.getItem("bpl_user_onboarded") === "true");
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
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight max-w-3xl text-white">
            THE STAGE IS YOURS.
            <br />
            THE LEAGUE IS <span className="gradient-text">OURS.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            India&apos;s biggest platform for indie bands.
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
                  <Sparkles size={16} /> JOIN THE LEAGUE
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
              <Play size={16} /> EXPLORE BPL MODEL
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT IS BPL */}
      <Section>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3">
              What is BPL?
            </p>
            <h2 className="text-4xl font-display font-bold text-white">A league built for indie music.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              BPL is India&apos;s first and largest platform connecting indie bands, venues,
              production houses and fans. We power live music through events, support, and real
              opportunities.
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

      {/* FEATURED BANDS */}
      <Section title="Featured Bands" ctaTo="/bands">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {/* Dynamic Approved Bands */}
          {dynBands.slice(0, 5).map((b) => (
            <Link 
              key={b.id} 
              to="/bands/$bandId" 
              params={{ bandId: b.id }}
              className="text-center group block"
            >
              <div className="mx-auto h-28 w-28 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition bg-surface">
                <img
                  src={b.profile_image}
                  alt={b.band_name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 font-semibold truncate px-2 text-white">{b.band_name}</p>
              <p className="text-xs text-muted-foreground truncate">{b.genre}</p>
            </Link>
          ))}
          {/* Static Bands Fallback */}
          {dynBands.length < 5 &&
            STATIC_BANDS.slice(0, 5 - dynBands.length).map((b) => (
              <Link key={b.name} to="/bands" className="text-center group block animate-fade-in">
                <div className="mx-auto h-28 w-28 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition">
                  <img
                    src={bandImg}
                    alt={b.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-3 font-semibold text-white">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.genre}</p>
              </Link>
            ))}
        </div>
      </Section>

      {/* PRODUCTION HOUSES */}
      <Section title="Partner Production Houses" ctaTo="/production-houses">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {HOUSES.map((h) => (
            <div
              key={h}
              className="bpl-card px-6 py-8 flex items-center justify-center font-display font-bold text-lg tracking-wide text-white"
            >
              {h}
            </div>
          ))}
        </div>
      </Section>

      {/* VENUES */}
      <Section title="Venues" ctaTo="/venues">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VENUES.map((v) => (
            <Link key={v.name} to="/venues" className="group bpl-card overflow-hidden block">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={v.img}
                  alt={v.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-left">
                <h3 className="font-semibold text-white truncate">{v.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin size={12} /> {v.city} · {v.pax}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* LATEST SONGS */}
      <Section title="Latest Songs" ctaTo="/media">
        <div className="bpl-card divide-y divide-border">
          {SONGS.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4 p-4 text-left">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-sm font-semibold text-white">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.artist} · {s.genre}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{s.len}</p>
              <button className="text-primary-glow cursor-pointer">
                <Play size={18} />
              </button>
            </div>
          ))}
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

      {/* COMMUNITY */}
      <Section title="Community" ctaTo="/community">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, v: "2,500+", l: "Student Clubs" },
            { icon: Music, v: "350+", l: "Cafe Communities" },
            { icon: MapPin, v: "120+", l: "City Ambassadors" },
            { icon: Sparkles, v: "1,200+", l: "Volunteers" },
          ].map(({ icon: Icon, v, l }) => (
            <div key={l} className="bpl-card p-6 flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary-glow">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/community"
            className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
          >
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
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Become a Partner</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm">
            Join hands with BPL and be a part of India&apos;s live music revolution.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              to="/join"
              className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
            >
              <Ticket size={16} /> Choose Your Role
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
