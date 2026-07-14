import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { db, type BandApplication } from "@/lib/db";
import { Search, MapPin, Sparkles, Filter, Music } from "lucide-react";

export const Route = createFileRoute("/bands")({
  head: () => ({
    meta: [
      { title: "Bands Directory — Kalakshetra" },
      {
        name: "description",
        content:
          "Discover indie bands on Kalakshetra. Explore members, bios, and gear rosters for every verified artist.",
      },
    ],
  }),
  component: BandsPage,
});

const GENRE_FILTERS = [
  "All",
  "Rock",
  "Indie",
  "Folk",
  "Metal",
  "Pop",
  "Alternative",
  "Hip-Hop",
  "Other",
];

function BandsPage() {
  const [rosterItems, setRosterItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      try {
        const bandsData = await db.getApprovedRecords("band");
        const artistsData = await db.getApprovedRecords("artist");

        // Normalize band records
        const bands = bandsData.map((b) => ({
          id: b.id,
          name: b.band_name || "Unnamed Band",
          type: "band",
          genre: b.genre || "Indie",
          city: b.home_city || "Unknown City",
          image: b.profile_image || "/images/placeholder-band.jpg",
        }));

        // Normalize solo artist records
        const artists = artistsData.map((a) => {
          const artistName = a.name || a.displayName || a.contact_name || "Solo Artist";
          const artistSkills = a.artistRoles && a.artistRoles.length > 0
            ? a.artistRoles.join(", ")
            : a.skills || "Solo Musician";
          const artistCity = a.homeCity || a.city || a.home_city || "Unknown City";
          const artistImage = a.profile_image || a.avatarUrl || "/images/placeholder-artist.jpg";

          return {
            id: a.id,
            name: artistName,
            type: "artist",
            genre: artistSkills,
            city: artistCity,
            image: artistImage,
          };
        });

        setRosterItems([...bands, ...artists]);
      } catch (err) {
        console.error("Failed to load roster items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, []);

  // Filter items based on search query and genre select
  const filteredRoster = rosterItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === "All" || item.genre.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  return (
    <PageShell>
      {/* Premium Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background/90 via-background/40 to-background">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow font-bold">
            Official Roster
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
            Kalakshetra Bands & Artists
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover verified indie bands, solo musicians, and creative members of the league
            roster.
          </p>
        </div>
      </section>

      {/* Directory Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface/30 border border-border p-4 rounded-lg">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name, city, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary text-white"
            />
          </div>

          {/* Genre Filters Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <Filter size={14} className="text-muted-foreground shrink-0 hidden sm:block" />
            {GENRE_FILTERS.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition shrink-0 cursor-pointer ${
                  selectedGenre === genre
                    ? "bg-primary border border-primary text-primary-foreground"
                    : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Roster Cards Directory */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRoster.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredRoster.map((item) => (
              <Link
                key={item.id}
                to="/bands/$bandId"
                params={{ bandId: item.id }}
                className="bpl-card p-5 text-center cursor-pointer hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition group block relative overflow-hidden"
              >
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                  <span className="text-[8px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                    Verified
                  </span>
                  <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold border ${
                    item.type === "band" 
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  }`}>
                    {item.type === "band" ? "Band" : "Solo"}
                  </span>
                </div>

                <div className="mx-auto h-24 w-24 rounded-full overflow-hidden border border-border group-hover:border-primary transition bg-slate-900 shadow-md">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-sm group-hover:text-primary-glow transition truncate text-white">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate uppercase tracking-wider text-[10px] font-bold text-primary-glow">
                  {item.genre}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate flex items-center justify-center gap-0.5 mt-1.5">
                  <MapPin size={10} /> {item.city}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 max-w-md mx-auto space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border border-border">
              <Music size={26} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">No Verified Artists Found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {rosterItems.length === 0
                  ? "There are no approved bands or artists in the league registry yet. Be the first to onboard!"
                  : "Try clearing your search filters to find members matching your preferences."}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/join"
                className="btn-primary btn-primary-hover px-5 py-2.5 rounded-md text-xs font-semibold"
              >
                Apply to Join
              </Link>
              {rosterItems.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGenre("All");
                  }}
                  className="px-5 py-2.5 rounded-md border border-border bg-surface text-xs text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bpl-card p-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}
