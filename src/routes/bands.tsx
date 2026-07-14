import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Search, MapPin, Music, MessageCircle, X, Send, User, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/bands")({
  head: () => ({
    meta: [
      { title: "Bands & Artists Directory — Kalakshetra" },
      {
        name: "description",
        content:
          "Discover indie bands and solo artists on Kalakshetra. Explore bios, releases, and connect via DM.",
      },
    ],
  }),
  component: BandsPage,
});

type TabType = "all" | "band" | "artist";

function BandsPage() {
  const { session } = useAuth();
  const [rosterItems, setRosterItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // DM modal state
  const [dmTarget, setDmTarget] = useState<any | null>(null);
  const [dmMessage, setDmMessage] = useState("");
  const [dmSending, setDmSending] = useState(false);
  const [dmSuccess, setDmSuccess] = useState(false);

  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      try {
        const [bandsData, artistsData] = await Promise.all([
          db.getApprovedRecords("band"),
          db.getApprovedRecords("artist"),
        ]);

        const bands = bandsData.map((b) => ({
          id: b.id,
          name: b.band_name || "Unnamed Band",
          type: "band" as const,
          genre: b.genre || "Indie",
          city: b.home_city || "Unknown City",
          image: b.profile_image || "",
          contact_email: b.contact_email || "",
          contact_name: b.contact_name || b.band_name,
        }));

        const artists = artistsData.map((a) => ({
          id: a.id,
          name: a.name || a.band_name || a.contact_name || "Solo Artist",
          type: "artist" as const,
          genre: Array.isArray(a.roles) && a.roles.length > 0
            ? a.roles.join(", ")
            : Array.isArray(a.artistRoles) && a.artistRoles.length > 0
              ? a.artistRoles.join(", ")
              : a.skills || "Solo Musician",
          city: a.home_city || a.homeCity || a.city || "Unknown City",
          image: a.profile_image || a.avatarUrl || "",
          contact_email: a.contact_email || "",
          contact_name: a.contact_name || a.name,
        }));

        setRosterItems([...bands, ...artists]);
      } catch (err) {
        console.error("Failed to load roster", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, []);

  const filteredRoster = rosterItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.genre.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const bandsCount = rosterItems.filter((i) => i.type === "band").length;
  const artistsCount = rosterItems.filter((i) => i.type === "artist").length;

  const handleDMSend = async () => {
    if (!dmMessage.trim() || !dmTarget) return;
    setDmSending(true);
    try {
      const senderId = session?.user?.id || "guest";
      const senderName = session?.user?.user_metadata?.full_name || session?.user?.email || "Visitor";
      const senderEmail = session?.user?.email || "";
      await db.sendDM(senderId, senderName, senderEmail, dmTarget.id, dmTarget.name, dmMessage.trim());
      setDmSuccess(true);
      setDmMessage("");
      setTimeout(() => {
        setDmTarget(null);
        setDmSuccess(false);
      }, 2500);
    } catch (e) {
      console.error("DM send failed", e);
    } finally {
      setDmSending(false);
    }
  };

  return (
    <PageShell>
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow font-bold">Official Roster</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
            Bands & Solo Artists
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover verified indie bands and solo musicians. Click a card to view their full profile, or send them a DM to connect.
          </p>
        </div>
      </section>

      {/* Tab + Search Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-2">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-secondary/40 border border-border rounded-lg">
            {(["all", "band", "artist"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {tab === "all" ? `All (${rosterItems.length})` : tab === "band" ? `Bands (${bandsCount})` : `Solo Artists (${artistsCount})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search by name, city, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary text-white"
            />
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-24">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRoster.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredRoster.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  to="/bands/$bandId"
                  params={{ bandId: item.id }}
                  className="bpl-card p-5 text-center cursor-pointer hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition block relative overflow-hidden"
                >
                  {/* Badges */}
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

                  {/* Avatar */}
                  <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border border-border group-hover:border-primary transition bg-slate-900 shadow-md">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {item.type === "band" ? <Users size={28} className="text-muted-foreground" /> : <User size={28} className="text-muted-foreground" />}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-sm group-hover:text-primary-glow transition truncate text-white">{item.name}</h3>
                  <p className="text-[10px] text-primary-glow font-bold mt-0.5 truncate uppercase tracking-wider">{item.genre}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate flex items-center justify-center gap-0.5 mt-1">
                    <MapPin size={9} /> {item.city}
                  </p>
                </Link>

                {/* DM Button — only for solo artists */}
                {item.type === "artist" && (
                  <button
                    onClick={() => { setDmTarget(item); setDmSuccess(false); setDmMessage(""); }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-lg cursor-pointer whitespace-nowrap"
                    title="Send DM"
                  >
                    <MessageCircle size={11} /> DM
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 max-w-md mx-auto space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border border-border">
              <Music size={26} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">No Results Found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {rosterItems.length === 0
                  ? "No approved bands or solo artists yet. Be the first to register!"
                  : "Try a different search or tab filter."}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Link to="/join" className="btn-primary btn-primary-hover px-5 py-2.5 rounded-md text-xs font-semibold">
                Join the Roster
              </Link>
              {(searchQuery || activeTab !== "all") && (
                <button
                  onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                  className="px-5 py-2.5 rounded-md border border-border bg-surface text-xs text-white cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* DM Modal */}
      {dmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDmTarget(null); }}
        >
          <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User size={18} className="text-primary-glow" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{dmTarget.name}</p>
                  <p className="text-[10px] text-muted-foreground">Solo Artist · {dmTarget.city}</p>
                </div>
              </div>
              <button onClick={() => setDmTarget(null)} className="text-muted-foreground hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {dmSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Send size={20} className="text-emerald-400" />
                  </div>
                  <p className="font-bold text-white">Message Sent!</p>
                  <p className="text-xs text-muted-foreground">
                    {dmTarget.name} will receive your message in their dashboard.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Send a direct message to <span className="text-white font-semibold">{dmTarget.name}</span>. Keep it professional — introduce yourself and your purpose.
                  </p>
                  <textarea
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    placeholder={`Hi ${dmTarget.name}, I'm reaching out because...`}
                    rows={5}
                    maxLength={500}
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{dmMessage.length}/500</span>
                    <button
                      onClick={handleDMSend}
                      disabled={!dmMessage.trim() || dmSending}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 hover:bg-primary/90 transition cursor-pointer"
                    >
                      {dmSending ? (
                        <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Send Message
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
