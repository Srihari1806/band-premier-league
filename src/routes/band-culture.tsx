import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Music,
  ExternalLink,
  Instagram,
  Sparkles,
  Copy,
  Check,
  Flame,
  Radio,
  Share2,
  Users,
  Compass,
  Filter,
  X,
  Zap,
} from "lucide-react";
import { AP_TS_BANDS, ApTsBand } from "@/data/apTsBands";

export const Route = createFileRoute("/band-culture")({
  head: () => ({
    meta: [
      { title: "AP & TS Band Culture — Kalakshetra" },
      {
        name: "description",
        content:
          "Explore the vibrant live band culture of Andhra Pradesh and Telangana. Discover 35+ indie bands, fusion outfits, acoustic collectives, and music clubs.",
      },
      { property: "og:title", content: "AP & TS Band Culture — Kalakshetra" },
      {
        property: "og:description",
        content:
          "The definitive directory of bands, music clubs, and live music pioneers shaping the Telugu band scene.",
      },
    ],
  }),
  component: BandCulturePage,
});

type CategoryFilter = "all" | "band" | "unplugged" | "club" | "curator";
type RegionFilter = "all" | "Hyderabad / TS" | "Visakhapatnam / AP" | "Pan AP & TS" | "International";

/**
 * Band profile photo pulled from the band's Instagram DP (mirrored under
 * /public/bands). Falls back to the Music glyph when a band has no photo yet
 * or the file fails to load.
 */
function BandAvatar({
  band,
  sizeClass,
  iconSize,
  className = "",
}: {
  band: ApTsBand;
  sizeClass: string;
  iconSize: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(band.imageUrl) && !failed;

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden bg-background/90 flex items-center justify-center shadow-xl ${className}`}
    >
      {showPhoto ? (
        <img
          src={band.imageUrl}
          alt={`${band.name} profile photo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Music size={iconSize} className="text-primary-glow" />
      )}
    </div>
  );
}

function BandCulturePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>("all");
  const [activeModalBand, setActiveModalBand] = useState<ApTsBand | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBands = useMemo(() => {
    return AP_TS_BANDS.filter((band) => {
      const matchesCategory =
        selectedCategory === "all" || band.category === selectedCategory;
      const matchesRegion =
        selectedRegion === "all" ||
        (selectedRegion === "Hyderabad / TS" && band.region === "Hyderabad / TS") ||
        (selectedRegion === "Visakhapatnam / AP" && band.region === "Visakhapatnam / AP") ||
        (selectedRegion === "Pan AP & TS" && (band.region === "Pan AP & TS" || band.region === "Andhra Pradesh" || band.region === "Telangana")) ||
        (selectedRegion === "International" && band.region === "International");

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        band.name.toLowerCase().includes(query) ||
        band.handle.toLowerCase().includes(query) ||
        band.genre.toLowerCase().includes(query) ||
        band.location.toLowerCase().includes(query) ||
        band.bio.toLowerCase().includes(query) ||
        band.highlight.toLowerCase().includes(query) ||
        band.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedRegion]);

  const handleCopyHandle = (e: React.MouseEvent, band: ApTsBand) => {
    e.stopPropagation();
    navigator.clipboard.writeText(band.instagramUrl);
    setCopiedId(band.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (band: ApTsBand) => {
    if (navigator.share) {
      navigator
        .share({
          title: `${band.name} | AP & TS Band Culture on Kalakshetra`,
          text: `Check out ${band.name} (${band.handle}) on Kalakshetra Band Culture!`,
          url: band.instagramUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(band.instagramUrl);
      setCopiedId(band.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const categoryCounts = useMemo(() => {
    return {
      all: AP_TS_BANDS.length,
      band: AP_TS_BANDS.filter((b) => b.category === "band").length,
      unplugged: AP_TS_BANDS.filter((b) => b.category === "unplugged").length,
      club: AP_TS_BANDS.filter((b) => b.category === "club").length,
      curator: AP_TS_BANDS.filter((b) => b.category === "curator").length,
    };
  }, []);

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-radial-gradient">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.25), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(168, 85, 247, 0.15), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-14 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary-glow text-xs font-semibold tracking-wide">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            <span>AP & TS Live Music Movement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Band Culture in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">AP & TS</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From iconic trailblazers packing arena stages to vibrant campus bands, beachside jam hubs, and indie fusion pioneers — explore the people powering the regional live band revolution.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface/70 border border-border">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{AP_TS_BANDS.length}</span>
              <span className="text-muted-foreground">Bands & Hubs</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface/70 border border-border">
              <Compass size={14} className="text-cyan-400" />
              <span className="text-muted-foreground">Telangana & Andhra Pradesh</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface/70 border border-border">
              <Instagram size={14} className="text-pink-400" />
              <span className="text-muted-foreground">Verified Instagram Profiles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="sticky top-16 z-30 backdrop-blur-xl bg-background/85 border-b border-border/80 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-surface/60 border border-border rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                All ({categoryCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("band")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "band"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                Live Bands ({categoryCounts.band})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("unplugged")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "unplugged"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                Acoustic & Unplugged ({categoryCounts.unplugged})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("club")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "club"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                Music Clubs & Hubs ({categoryCounts.club})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("curator")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "curator"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                Curators & Hype ({categoryCounts.curator})
              </button>
            </div>

            {/* Region & Search */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-center">
              {/* Region Selector */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto bg-surface border border-border rounded-lg px-2.5 py-1.5">
                <MapPin size={13} className="text-primary-glow shrink-0" />
                <select
                  aria-label="Filter by region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as RegionFilter)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-2"
                >
                  <option value="all" className="bg-surface text-white">All Regions</option>
                  <option value="Hyderabad / TS" className="bg-surface text-white">Hyderabad / TS</option>
                  <option value="Visakhapatnam / AP" className="bg-surface text-white">Visakhapatnam / AP</option>
                  <option value="Pan AP & TS" className="bg-surface text-white">Pan AP & TS</option>
                  <option value="International" className="bg-surface text-white">International</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search bands, genre, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-primary text-white placeholder:text-muted-foreground/60 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 pb-24">
        {/* Results Counter / Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="text-white font-bold">{filteredBands.length}</span> profile cards
            {searchQuery && (
              <span> matching &ldquo;<span className="text-primary-glow">{searchQuery}</span>&rdquo;</span>
            )}
          </p>

          {(searchQuery || selectedCategory !== "all" || selectedRegion !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedRegion("all");
              }}
              className="text-xs text-primary-glow hover:underline flex items-center gap-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredBands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBands.map((band) => {
              const isCopied = copiedId === band.id;

              return (
                <div
                  key={band.id}
                  onClick={() => setActiveModalBand(band)}
                  className="bpl-card group relative flex flex-col justify-between overflow-hidden border border-border/80 bg-surface/50 hover:bg-surface hover:border-primary/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  {/* Card Visual Header with Accent Gradient */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-900 border-b border-border/50 flex items-center justify-center">
                    <div
                      className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-gradient-to-br ${band.accentColor}`}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />

                    {/* Category & Region Pill Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
                        {band.categoryLabel}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="text-[9px] tracking-wide font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md shadow-sm">
                        <Instagram size={10} /> Verified
                      </span>
                    </div>

                    {/* Band Visual / Avatar Circle */}
                    <BandAvatar
                      band={band}
                      sizeClass="h-26 w-26"
                      iconSize={40}
                      className="relative z-10 ring-[3px] ring-white/30 ring-offset-2 ring-offset-slate-900/60 group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Name & Handle */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="font-display font-bold text-base text-white group-hover:text-primary-glow transition truncate">
                            {band.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                            {band.handle}
                          </p>
                        </div>
                      </div>

                      {/* Genre & Location */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-primary-glow uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          {band.genre}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/40">
                          <MapPin size={9} /> {band.location}
                        </span>
                      </div>

                      {/* Highlight Badge */}
                      <p className="text-[11px] font-medium text-amber-300/90 flex items-center gap-1 pt-0.5">
                        <Zap size={11} className="text-amber-400 shrink-0" />
                        <span className="truncate">{band.highlight}</span>
                      </p>

                      {/* Bio snippet */}
                      <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed pt-1">
                        {band.bio}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {band.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] text-muted-foreground/80 bg-secondary/30 border border-border/50 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                      <a
                        href={band.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition shadow-md shadow-pink-600/10"
                      >
                        <Instagram size={13} />
                        <span>Instagram</span>
                        <ExternalLink size={11} className="opacity-80" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => handleCopyHandle(e, band)}
                        title="Copy profile link"
                        className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-white hover:border-primary/50 transition cursor-pointer shrink-0"
                      >
                        {isCopied ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 max-w-md mx-auto space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground border border-border">
              <Filter size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Profiles Found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We couldn&apos;t find any band matching your search criteria. Try a different keyword or reset filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedRegion("all");
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Join the Movement Banner */}
        <div className="mt-16 bpl-card relative overflow-hidden p-8 sm:p-10 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-purple-900/15 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary-glow font-bold">
              <Sparkles size={13} />
              <span>Are you an AP/TS Band or Creator?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Get Your Band Featured on Kalakshetra
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Register your band to receive gig bookings, connect with venue owners across Andhra Pradesh and Telangana, and participate in Season 1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/join/band"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white hover:scale-105 transition"
            >
              <Users size={14} /> Register Your Band
            </Link>
            <Link
              to="/bands"
              className="px-4 py-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-semibold text-white hover:bg-secondary transition"
            >
              View Official Roster
            </Link>
          </div>
        </div>
      </section>

      {/* Band Profile Modal */}
      {activeModalBand && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalBand(null);
          }}
        >
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header Cover */}
            <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center border-b border-border">
              <div
                className={`absolute inset-0 opacity-50 bg-gradient-to-br ${activeModalBand.accentColor}`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />

              <button
                type="button"
                onClick={() => setActiveModalBand(null)}
                aria-label="Close modal"
                className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                <BandAvatar
                  key={activeModalBand.id}
                  band={activeModalBand}
                  sizeClass="h-28 w-28"
                  iconSize={44}
                  className="ring-[3px] ring-white/35 ring-offset-2 ring-offset-slate-900/60"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary-glow border border-primary/30">
                    {activeModalBand.categoryLabel}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Instagram size={10} /> Active on Instagram
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-white pt-1">
                  {activeModalBand.name}
                </h2>
                <p className="text-xs font-mono text-muted-foreground">{activeModalBand.handle}</p>
                <p className="text-xs text-primary-glow font-bold uppercase tracking-wider pt-0.5">
                  {activeModalBand.genre}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin size={11} /> {activeModalBand.location}
                </p>
              </div>

              {/* Bio & Highlight */}
              <div className="bg-secondary/40 border border-border/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Zap size={14} className="text-amber-400" />
                  <span>{activeModalBand.highlight}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeModalBand.bio}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Tags & Vibe</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalBand.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={activeModalBand.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white text-xs font-bold hover:opacity-95 transition shadow-lg shadow-pink-600/20"
                >
                  <Instagram size={15} />
                  <span>Open Instagram</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={() => handleShare(activeModalBand)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary border border-border text-white text-xs font-bold hover:bg-secondary/80 transition cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Share Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
