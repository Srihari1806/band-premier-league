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
  User,
  Tv,
  Megaphone,
  Award,
  CalendarRange,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db, type BandApplication } from "@/lib/db";
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

// No static/fabricated band, venue, or production-house data.
// The homepage shows only dynamically approved records from the registry.

type CommunityTab = "band" | "artist" | "venue" | "production_house" | "influencer" | "event_manager" | "sponsor" | "volunteer";

const COMMUNITY_TABS: { key: CommunityTab; label: string; icon: any; color: string }[] = [
  { key: "band",            label: "Bands",            icon: Music,        color: "blue" },
  { key: "artist",          label: "Solo Artists",     icon: User,         color: "purple" },
  { key: "venue",           label: "Venues",           icon: MapPin,       color: "amber" },
  { key: "production_house",label: "Production Houses",icon: Tv,           color: "cyan" },
  { key: "influencer",      label: "Influencers",      icon: Megaphone,    color: "pink" },
  { key: "event_manager",   label: "Event Managers",   icon: CalendarRange,color: "orange" },
  { key: "sponsor",         label: "Sponsors",         icon: Award,        color: "emerald" },
  { key: "volunteer",       label: "Volunteers",       icon: Users,        color: "violet" },
];

const COLOR_MAP: Record<string, string> = {
  blue:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  purple:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  amber:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
  cyan:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  pink:    "bg-pink-500/15 text-pink-400 border-pink-500/30",
  orange:  "bg-orange-500/15 text-orange-400 border-orange-500/30",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  violet:  "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

function Home() {
  const [dynBands, setDynBands] = useState<BandApplication[]>([]);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [communityTab, setCommunityTab] = useState<CommunityTab>("band");
  const [communityData, setCommunityData] = useState<Record<string, any[]>>({});
  const [communityLoading, setCommunityLoading] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
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

  // Load community data when tab changes
  useEffect(() => {
    if (communityData[communityTab] !== undefined) return;
    setCommunityLoading(true);
    db.getApprovedRecords(communityTab).then((data) => {
      setCommunityData((prev) => ({ ...prev, [communityTab]: data }));
      setCommunityLoading(false);
    }).catch(() => setCommunityLoading(false));
  }, [communityTab]);

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
        <div className="bpl-card p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Music size={24} className="text-primary-glow" />
          </div>
          <p className="font-semibold text-white">No events yet — but the first one's being planned</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            We're yet to host our first memorable event. Season 1 gigs are being lined up — stay tuned for the announcement.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary text-white text-xs font-semibold transition"
          >
            Get notified
          </Link>
        </div>
      </Section>

      {/* COMMUNITY DIRECTORY — unified tabbed section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-glow font-bold mb-1">Who's Here</p>
            <h2 className="text-3xl font-display font-bold tracking-tight text-white">Our Community</h2>
          </div>
          <Link
            to="/bands"
            className="text-xs uppercase tracking-widest text-primary-glow hover:text-primary flex items-center gap-1 font-semibold"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tab pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {COMMUNITY_TABS.map((t) => {
            const Icon = t.icon;
            const active = communityTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setCommunityTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 transition border cursor-pointer ${
                  active
                    ? "bg-primary border-primary text-primary-foreground shadow"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-white"
                }`}
              >
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {communityLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (communityData[communityTab] || []).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(communityData[communityTab] || []).slice(0, 10).map((item: any) => {
              const tab = COMMUNITY_TABS.find((t) => t.key === communityTab)!;
              const Icon = tab.icon;
              const displayName =
                item.band_name || item.name || item.venue_name ||
                item.company_name || item.contact_name || "Member";
              const displaySub =
                item.genre || item.type || item.city || item.address ||
                item.role_type || item.industry || tab.label;
              const image = item.profile_image || item.logo_image || item.avatarUrl || "";
              const linkId = item.id;
              const isArtistOrBand = communityTab === "band" || communityTab === "artist";
              return (
                <div key={item.id} className="text-center group block">
                  {isArtistOrBand ? (
                    <Link to="/bands/$bandId" params={{ bandId: linkId }} className="block">
                      <div className={`mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition bg-slate-900`}>
                        {image ? (
                          <img src={image} alt={displayName} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Icon size={24} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2.5 font-semibold text-xs truncate px-1 text-white group-hover:text-primary-glow transition">{displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{displaySub}</p>
                    </Link>
                  ) : (
                    <div className="block cursor-default">
                      <div className={`mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-slate-900 flex items-center justify-center`}>
                        {image ? (
                          <img src={image} alt={displayName} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <Icon size={24} className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-2.5 font-semibold text-xs truncate px-1 text-white">{displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{displaySub}</p>
                    </div>
                  )}
                  {/* Role badge */}
                  <span className={`mt-1.5 inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${COLOR_MAP[tab.color]}`}>
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bpl-card p-10 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              {(() => { const tab = COMMUNITY_TABS.find((t) => t.key === communityTab)!; const Icon = tab.icon; return <Icon size={24} className="text-primary-glow" />; })()}
            </div>
            <p className="font-semibold text-white">
              No {COMMUNITY_TABS.find((t) => t.key === communityTab)?.label} registered yet
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Be among the first to join the Kalakshetra ecosystem in this category.
            </p>
            <Link
              to="/join"
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition"
            >
              <Sparkles size={12} /> Register Now
            </Link>
          </div>
        )}
      </section>

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
