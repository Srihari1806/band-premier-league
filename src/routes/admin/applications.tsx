import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { 
  db, 
  type BandApplication, 
  type VenueApplication,
  type ProductionHouseApplication,
  type SponsorApplication,
  type InfluencerApplication,
  type VolunteerApplication,
  type EventManagerApplication
} from "@/lib/db";
import { 
  Check, 
  X, 
  Eye, 
  Trash2, 
  ShieldAlert, 
  Instagram, 
  Youtube, 
  Music, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Building,
  Tv,
  Megaphone,
  Award,
  Users,
  CalendarRange,
  Globe,
  Plus,
  Lock,
  ChevronRight,
  FileText
} from "lucide-react";

export const Route = createFileRoute("/admin/applications")({
  head: () => ({
    meta: [
      { title: "Operator Registry Dashboard — BPL" },
    ],
  }),
  component: AdminApplicationsPage,
});

type RoleTab = "band" | "venue" | "production_house" | "sponsor" | "influencer" | "volunteer" | "event_manager";

const ROLE_LABELS: Record<RoleTab, string> = {
  band: "Bands / Artists",
  venue: "Venues / Cafes",
  production_house: "Production Houses",
  sponsor: "Sponsors",
  influencer: "Influencers",
  volunteer: "Volunteers / Creatives",
  event_manager: "Event Managers",
};

function AdminApplicationsPage() {
  // Password Gate State
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState("");

  // Data States
  const [activeTab, setActiveTab] = useState<RoleTab>("band");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Load password bypass state if already entered in session
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("bpl_admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === "bplcreator" && password === "bpladmin") {
      setIsAuthenticated(true);
      setPassError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("bpl_admin_auth", "true");
      }
    } else {
      setPassError("Invalid Operator Login ID or Password");
    }
  };

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await db.getApplications(activeTab);
      setApplications(data);
      setSelectedApp(null);
    } catch (e) {
      console.error("Failed to load applications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, isAuthenticated]);

  const handleStatusUpdate = async (id: string, status: "pending" | "approved" | "rejected" | "needs_changes") => {
    try {
      await db.updateApplicationStatus(activeTab, id, status);
      // Update local state
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
      alert(`Status updated to: ${status}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you absolutely sure you want to clear ALL data? This deletes all applications across all tables, all local drafts, and resets season statistics. This action is irreversible!")) {
      try {
        await db.clearAllData();
        await loadData();
        setSelectedApp(null);
        alert("Database cleared and reset successfully.");
      } catch (err) {
        console.error(err);
        alert("Failed to clear database.");
      }
    }
  };

  const filteredApps = applications.filter(app => app.status === statusFilter);

  // Render Password Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
          <div className="bpl-card p-8 w-full max-w-md space-y-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-glow border border-primary/20">
              <Lock size={20} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-display font-bold text-white">Operator Access Gate</h1>
              <p className="text-xs text-muted-foreground">Enter password to manage BPL onboarding applications.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Login ID *</label>
                <input 
                  type="text"
                  placeholder="Enter login ID (e.g. bplcreator)"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white mb-2"
                />
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Admin Password *</label>
                <input 
                  type="password"
                  placeholder="Enter operator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                />
                {passError && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {passError}</p>}
                <p className="text-[9px] text-muted-foreground/60 mt-1.5">Note: Default credentials are <code className="text-primary-glow font-bold">bplcreator</code> / <code className="text-primary-glow font-bold">bpladmin</code></p>
              </div>
              <button 
                type="submit" 
                className="w-full btn-primary btn-primary-hover py-2.5 rounded-md text-xs font-semibold text-white cursor-pointer"
              >
                Authenticate Operator
              </button>
            </form>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold flex items-center gap-1">
              <ShieldAlert size={14} /> Operator Control Panel
            </p>
            <h1 className="text-3xl font-display font-bold mt-1">Registry Applications</h1>
            <p className="text-sm text-muted-foreground">
              Review partner profiles, manage approval states, and wipe out BPL mock databases.
            </p>
          </div>
          
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-400 text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 size={14} /> Clear All Registry & Stats
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar Navigation (Tabs) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold pl-1">Role Registry</h3>
            <div className="flex flex-col bg-secondary/30 p-1.5 rounded-lg border border-border space-y-1">
              {(Object.keys(ROLE_LABELS) as RoleTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full py-2.5 px-4 text-xs font-semibold rounded-md text-left transition ${
                    activeTab === tab 
                      ? "bg-primary text-primary-foreground shadow shadow-glow" 
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  {ROLE_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>

          {/* Center Column: List of Applications for current Role */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Status Filter Tab Buttons */}
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              {["pending", "approved", "rejected", "needs_changes"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 py-1.5 text-[9px] uppercase tracking-wider font-bold rounded transition ${
                    statusFilter === f 
                      ? "bg-primary/20 border border-primary/30 text-primary-glow" 
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* List box */}
            <div className="bpl-card p-3 space-y-2 max-h-[500px] overflow-y-auto">
              <p className="text-[10px] uppercase font-bold text-muted-foreground pl-1 tracking-wider">
                {ROLE_LABELS[activeTab]} ({filteredApps.length})
              </p>
              
              {loading ? (
                <p className="text-center py-6 text-xs text-muted-foreground">Loading applications...</p>
              ) : filteredApps.length === 0 ? (
                <p className="text-center py-12 text-xs text-muted-foreground">No {statusFilter} records.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {filteredApps.map((app) => (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className={`py-3 flex items-center justify-between cursor-pointer group transition px-2 rounded-md ${
                        selectedApp?.id === app.id ? "bg-primary/15 border border-primary/20" : "hover:bg-surface-elevated border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-white group-hover:text-primary-glow transition truncate">
                          {app.band_name || app.venue_name || app.company_name || app.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5 truncate">
                          {app.home_city || app.city || app.address || app.role_type || activeTab}
                        </p>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile Detail Evaluator Panel */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <div className="bpl-card overflow-hidden animate-fade-in border-border bg-surface/30">
                
                {/* Header banner style details */}
                <div className="bg-secondary/40 p-6 border-b border-border space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                        selectedApp.status === "approved" 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                          : selectedApp.status === "rejected"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : selectedApp.status === "needs_changes"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>
                        {selectedApp.status.toUpperCase()}
                      </span>
                      
                      <h2 className="text-2xl font-display font-bold text-white mt-2">
                        {selectedApp.band_name || selectedApp.venue_name || selectedApp.company_name || selectedApp.name}
                      </h2>
                      
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Role: <span className="text-primary-glow font-semibold capitalize">{activeTab.replace("_", " ")}</span> {selectedApp.role_type ? `(${selectedApp.role_type})` : ""}
                      </p>
                    </div>

                    <div className="text-[10px] text-muted-foreground text-left sm:text-right">
                      <p>Submitted: {new Date(selectedApp.created_at).toLocaleDateString()}</p>
                      <p className="font-mono mt-1 text-[9px]">ID: {selectedApp.id}</p>
                    </div>
                  </div>
                </div>

                {/* Details Contents depending on activeTab */}
                <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                  
                  {/* --- BAND DETAIL --- */}
                  {activeTab === "band" && (
                    <div className="space-y-4 text-xs">
                      {/* Image Preview */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider mb-1">Avatar Preview</p>
                          <img src={selectedApp.profile_image} className="h-16 w-16 rounded-full border border-border object-cover bg-slate-900" />
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider mb-1">Banner Preview</p>
                          <img src={selectedApp.banner_image} className="h-16 w-full rounded border border-border object-cover bg-slate-900" />
                        </div>
                      </div>

                      <div className="border-t border-border pt-3 grid grid-cols-2 gap-3 text-white/90">
                        <div><span className="text-muted-foreground">Genre:</span> {selectedApp.genre} {selectedApp.custom_genre ? `(${selectedApp.custom_genre})` : ""}</div>
                        <div><span className="text-muted-foreground">City:</span> {selectedApp.home_city}</div>
                        <div><span className="text-muted-foreground">Formed:</span> {selectedApp.formed_year || "Unknown"}</div>
                        <div><span className="text-muted-foreground">Originals/Covers:</span> {selectedApp.original_covers}</div>
                        <div><span className="text-muted-foreground">Languages:</span> {selectedApp.languages || "N/A"}</div>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-muted-foreground font-bold">Bio:</p>
                        <p className="mt-1 text-white leading-relaxed italic">"{selectedApp.bio}"</p>
                      </div>

                      {selectedApp.mission && (
                        <div>
                          <p className="text-muted-foreground font-bold">Mission:</p>
                          <p className="mt-1 text-white leading-relaxed">{selectedApp.mission}</p>
                        </div>
                      )}

                      {/* Lineup */}
                      {selectedApp.members && selectedApp.members.length > 0 && (
                        <div className="border-t border-border pt-3">
                          <p className="text-muted-foreground font-bold mb-1.5">Lineup / Members:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedApp.members.map((m: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 p-1.5 bg-secondary/35 rounded border border-border">
                                <img src={m.photo || bandImg} className="h-8 w-8 rounded-full object-cover shrink-0 bg-slate-800" />
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{m.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{m.role} {m.experience ? `(${m.experience})` : ""}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Music Demo */}
                      {selectedApp.demo_track && (
                        <div className="border-t border-border pt-3">
                          <p className="text-muted-foreground font-bold mb-1.5">Demo Track:</p>
                          <audio src={selectedApp.demo_track} controls className="w-full max-w-sm h-8" />
                        </div>
                      )}

                      {/* Social handles links */}
                      <div className="border-t border-border pt-3 space-y-1">
                        <p className="text-muted-foreground font-bold mb-1">Public Links:</p>
                        <a href={selectedApp.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-glow hover:underline">
                          <Instagram size={12} /> Instagram Profile <Globe size={10} />
                        </a>
                        {selectedApp.youtube_url && (
                          <a href={selectedApp.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-glow hover:underline">
                            <Youtube size={12} /> YouTube Link <Globe size={10} />
                          </a>
                        )}
                        {selectedApp.spotify_url && (
                          <a href={selectedApp.spotify_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-glow hover:underline">
                            <Music size={12} /> Spotify Link <Globe size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- VENUE DETAIL --- */}
                  {activeTab === "venue" && (
                    <div className="space-y-4 text-xs text-white/95">
                      <div className="grid grid-cols-2 gap-3 border-b border-border pb-3">
                        <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{selectedApp.type}</span></div>
                        <div><span className="text-muted-foreground">Capacity:</span> {selectedApp.capacity}</div>
                        <div><span className="text-muted-foreground">Stage Size:</span> {selectedApp.stage_size || "N/A"}</div>
                        <div><span className="text-muted-foreground">Owner:</span> {selectedApp.owner_name}</div>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-bold">Street Address:</span>
                        <p className="mt-1">{selectedApp.address}</p>
                        {selectedApp.maps_link && (
                          <a href={selectedApp.maps_link} target="_blank" rel="noopener noreferrer" className="text-primary-glow hover:underline block mt-1">
                            View on Google Maps <Globe size={10} className="inline ml-0.5" />
                          </a>
                        )}
                      </div>

                      {/* Facilities */}
                      <div className="border-t border-border pt-3">
                        <span className="text-muted-foreground font-bold mb-1.5 block">Facilities:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(selectedApp.facilities || {}).map(([key, val]) => {
                            if (key === "details" || !val) return null;
                            return (
                              <span key={key} className="bg-secondary px-2 py-0.5 rounded border border-border text-[9px] uppercase tracking-wider">
                                {key.replace("_", " ")}
                              </span>
                            );
                          })}
                        </div>
                        {selectedApp.facilities?.details && (
                          <p className="mt-2 text-muted-foreground bg-secondary/30 p-2 rounded border border-border">{selectedApp.facilities.details}</p>
                        )}
                      </div>

                      {/* Pricing Availability */}
                      <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-muted-foreground font-bold">Pricing/Rev Terms:</span>
                          <p className="mt-0.5">{selectedApp.pricing || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-bold">Days Available:</span>
                          <p className="mt-0.5">{selectedApp.availability?.days?.join(", ") || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- PRODUCTION HOUSE --- */}
                  {activeTab === "production_house" && (
                    <div className="space-y-4 text-xs text-white/95">
                      <div>
                        <span className="text-muted-foreground font-bold">Company Profile:</span>
                        <p className="mt-1 leading-relaxed">{selectedApp.company_profile}</p>
                      </div>

                      <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
                        <div><span className="text-muted-foreground">Investment Cap:</span> {selectedApp.investment_capacity || "N/A"}</div>
                        <div><span className="text-muted-foreground">Operating Cities:</span> {selectedApp.cities_of_operation || "N/A"}</div>
                        <div><span className="text-muted-foreground">Genres:</span> {selectedApp.genres_of_interest?.join(", ") || "N/A"}</div>
                      </div>

                      {selectedApp.past_artists && selectedApp.past_artists.length > 0 && (
                        <div className="border-t border-border pt-3">
                          <span className="text-muted-foreground font-bold">Past Artists Worked With:</span>
                          <p className="mt-0.5">{selectedApp.past_artists.join(", ")}</p>
                        </div>
                      )}
                      
                      {(selectedApp.website_url || selectedApp.instagram_url) && (
                        <div className="border-t border-border pt-3 space-y-1">
                          <span className="text-muted-foreground font-bold block mb-1">Company Links:</span>
                          {selectedApp.website_url && <a href={selectedApp.website_url} target="_blank" rel="noopener noreferrer" className="text-primary-glow hover:underline block"><Globe size={11} className="inline mr-1" /> Website</a>}
                          {selectedApp.instagram_url && <a href={selectedApp.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary-glow hover:underline block"><Instagram size={11} className="inline mr-1" /> Instagram</a>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- SPONSOR --- */}
                  {activeTab === "sponsor" && (
                    <div className="space-y-4 text-xs text-white/95">
                      <div className="grid grid-cols-2 gap-3 border-b border-border pb-3">
                        <div><span className="text-muted-foreground">Industry:</span> {selectedApp.industry || "N/A"}</div>
                        <div><span className="text-muted-foreground">Budget:</span> {selectedApp.budget_range || "N/A"}</div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground font-bold">Campaign Goals:</span>
                        <p className="mt-1 leading-relaxed">{selectedApp.campaign_goals || "N/A"}</p>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-bold">Target Audience:</span>
                        <p className="mt-1 leading-relaxed">{selectedApp.preferred_audience || "N/A"}</p>
                      </div>

                      {selectedApp.preferred_cities && selectedApp.preferred_cities.length > 0 && (
                        <div>
                          <span className="text-muted-foreground font-bold">Preferred Cities:</span>
                          <p className="mt-0.5">{selectedApp.preferred_cities.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- INFLUENCER --- */}
                  {activeTab === "influencer" && (
                    <div className="space-y-4 text-xs text-white/95">
                      <div className="grid grid-cols-2 gap-3 border-b border-border pb-3">
                        <div><span className="text-muted-foreground">Instagram:</span> <a href={`https://instagram.com/${selectedApp.instagram_handle.replace("@", "")}`} target="_blank" className="text-primary-glow hover:underline">@{selectedApp.instagram_handle.replace("@", "")}</a></div>
                        <div><span className="text-muted-foreground">Followers:</span> {selectedApp.follower_count}</div>
                        <div><span className="text-muted-foreground">Engagement Rate:</span> {selectedApp.engagement_rate || "N/A"}</div>
                        <div><span className="text-muted-foreground">Category:</span> {selectedApp.category || "N/A"}</div>
                      </div>

                      {selectedApp.audience_demographics && (
                        <div>
                          <span className="text-muted-foreground font-bold">Audience Demographics:</span>
                          <p className="mt-0.5">{selectedApp.audience_demographics}</p>
                        </div>
                      )}

                      {selectedApp.past_campaigns && (
                        <div>
                          <span className="text-muted-foreground font-bold">Past Campaigns:</span>
                          <p className="mt-1 leading-relaxed bg-secondary/30 p-2 rounded border border-border">{selectedApp.past_campaigns}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- VOLUNTEER / CREATIVE --- */}
                  {activeTab === "volunteer" && (
                    <div className="space-y-4 text-xs text-white/95">
                      {selectedApp.photo && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider mb-1">Creative Headshot</p>
                          <img src={selectedApp.photo} className="h-16 w-16 rounded border border-border object-cover bg-slate-900" />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 border-b border-border pb-3">
                        <div><span className="text-muted-foreground">Role Type:</span> <span className="capitalize text-primary-glow font-semibold">{selectedApp.role_type}</span></div>
                        <div><span className="text-muted-foreground">Operating City:</span> {selectedApp.city}</div>
                        <div><span className="text-muted-foreground">Availability:</span> {selectedApp.availability || "N/A"}</div>
                      </div>

                      {selectedApp.skills && (
                        <div>
                          <span className="text-muted-foreground font-bold">Skills / Tech Stack:</span>
                          <p className="mt-0.5 text-white">{selectedApp.skills}</p>
                        </div>
                      )}

                      {selectedApp.experience && (
                        <div>
                          <span className="text-muted-foreground font-bold">Experience / Portfolio:</span>
                          <p className="mt-1 leading-relaxed bg-secondary/30 p-2 rounded border border-border">{selectedApp.experience}</p>
                        </div>
                      )}

                      {selectedApp.interests && (
                        <div>
                          <span className="text-muted-foreground font-bold">Why BPL Interests Them:</span>
                          <p className="mt-1 leading-relaxed italic">"{selectedApp.interests}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- EVENT MANAGER --- */}
                  {activeTab === "event_manager" && (
                    <div className="space-y-4 text-xs text-white/95">
                      <div className="grid grid-cols-2 gap-3 border-b border-border pb-3">
                        <div><span className="text-muted-foreground">Core Team Size:</span> {selectedApp.team_size || "N/A"}</div>
                        <div><span className="text-muted-foreground">Execution Cities:</span> {selectedApp.cities?.join(", ") || "N/A"}</div>
                      </div>

                      {selectedApp.past_events && (
                        <div>
                          <span className="text-muted-foreground font-bold">Past Gigs managed:</span>
                          <p className="mt-1 leading-relaxed bg-secondary/30 p-2 rounded border border-border">{selectedApp.past_events}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unified Contact info details */}
                  <div className="border-t border-border pt-4">
                    <p className="text-red-400 font-bold uppercase tracking-wider text-[10px] mb-2">Private Contacts (Operator view only)</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground bg-secondary/20 p-3 rounded border border-border">
                      <div><span className="text-white/60">Primary Contact:</span> {selectedApp.contact_name || selectedApp.name}</div>
                      {selectedApp.manager_name && <div><span className="text-white/60">Manager Name:</span> {selectedApp.manager_name}</div>}
                      <div><span className="text-white/60">Phone:</span> {selectedApp.contact_phone}</div>
                      <div><span className="text-white/60">Email:</span> {selectedApp.contact_email}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="border-t border-border pt-4 flex flex-wrap gap-2 justify-end">
                    
                    {selectedApp.status !== "approved" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedApp.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Check size={13} /> Approve Application
                      </button>
                    )}
                    
                    {selectedApp.status !== "needs_changes" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedApp.id, "needs_changes")}
                        className="bg-purple-900/60 hover:bg-purple-800 border border-purple-800 text-purple-300 rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <FileText size={13} /> Request Changes
                      </button>
                    )}

                    {selectedApp.status !== "rejected" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedApp.id, "rejected")}
                        className="bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 rounded-md px-4 py-2 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <X size={13} /> Reject
                      </button>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              <div className="bpl-card p-12 text-center text-muted-foreground border-dashed border-border/80">
                < Eye size={36} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold">No Application Selected</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Select an application from the role list to evaluate its specifications.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </PageShell>
  );
}
