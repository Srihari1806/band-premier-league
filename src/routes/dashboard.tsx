import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { 
  User, 
  MapPin, 
  Tag, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  LogOut, 
  Save, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sliders,
  DollarSign
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BPL Member Portal" },
    ],
  }),
  component: DashboardPage,
});

type DashboardTab = "profile" | "availability" | "curation";

function DashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("profile");

  // Form states
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [feeRange, setFeeRange] = useState("");
  
  // Feedback states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user) {
      // Not logged in, redirect to login
      navigate({ to: "/login" });
      return;
    }
    setCurrentUser(user);
    loadProfile(user);
  }, [navigate]);

  const loadProfile = async (user: any) => {
    try {
      setLoading(true);
      
      // Query profile details
      let details: any = null;
      if (user.role === "band") {
        details = await db.getApprovedRecordById("band", user.id);
        if (!details) {
          // If not approved yet, read raw local storage record
          const key = "bpl_band_applications";
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          details = list.find((item: any) => item.id === user.id);
        }
      } else if (user.role === "venue") {
        details = await db.getApprovedRecordById("venue", user.id);
        if (!details) {
          const key = "bpl_venue_applications";
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          details = list.find((item: any) => item.id === user.id);
        }
      } else {
        // Production house or others
        const key = `bpl_${user.role}_applications`;
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        details = list.find((item: any) => item.id === user.id);
      }

      if (details) {
        setProfileData(details);
        setName(details.band_name || details.venue_name || details.company_name || details.name || "");
        setTagline(details.tagline || "");
        setBio(details.bio || details.company_profile || "");
        setCity(details.home_city || details.address || details.cities_of_operation || details.city || "");
        setGenre(details.genre || "");
        setCustomGenre(details.custom_genre || "");
        setFeeRange(details.fee_range || details.pricing || details.budget_range || "");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updatedFields: any = {};
      if (currentUser.role === "band") {
        updatedFields.band_name = name;
        updatedFields.tagline = tagline;
        updatedFields.bio = bio;
        updatedFields.home_city = city;
        updatedFields.genre = genre;
        updatedFields.custom_genre = customGenre;
        updatedFields.fee_range = feeRange;
      } else if (currentUser.role === "venue") {
        updatedFields.venue_name = name;
        updatedFields.address = city;
        updatedFields.pricing = feeRange;
      } else {
        updatedFields.company_name = name;
        updatedFields.company_profile = bio;
      }

      await db.updateProfile(currentUser.role, currentUser.id, updatedFields);
      setSuccess("Profile settings updated successfully!");
      // Reload session name
      const freshUser = db.getCurrentUser();
      setCurrentUser(freshUser);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    db.logoutUser();
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-[70vh] flex items-center justify-center bg-background">
          <div className="space-y-4 text-center">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading your BPL Dashboard...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const roleLabel = currentUser?.role === "production_house" ? "Label Partner" : currentUser?.role || "Member";
  const profileStatus = profileData?.status || currentUser?.status || "pending";

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 relative overflow-hidden">
        
        {/* Decorative grids */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="space-y-8 animate-fade-in relative z-10">
          
          {/* Header Banner */}
          <div className="bpl-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-bold bg-primary/20 text-primary-glow px-2.5 py-1 rounded-full border border-primary/25">
                  BPL {roleLabel}
                </span>
                {profileStatus === "approved" ? (
                  <span className="text-[9px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full border border-green-500/25 flex items-center gap-1">
                    <CheckCircle size={10} /> Active Member
                  </span>
                ) : profileStatus === "needs_changes" ? (
                  <span className="text-[9px] uppercase tracking-widest font-bold bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-500/25 flex items-center gap-1">
                    <ShieldAlert size={10} /> Action Required
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-widest font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/25 flex items-center gap-1">
                    <Clock size={10} /> Pending Curation
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                {name || "Your Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground max-w-xl">
                {tagline || "Manage your settings, configure availability calendar, and coordinate show bookings."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2.5 w-full md:w-auto">
              {currentUser?.role === "band" && profileStatus === "approved" && (
                <Link
                  to={`/bands/${currentUser.id}`}
                  className="flex-1 md:flex-none border border-border bg-secondary hover:bg-slate-800 text-white rounded-md px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  View Profile <ExternalLink size={12} />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex-1 md:flex-none bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-md px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Logout <LogOut size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bpl-card overflow-hidden">
                <div className="p-4 border-b border-border bg-surface/30 text-left">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Dashboard Settings</span>
                </div>
                <div className="p-2 flex flex-col gap-1.5">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full py-2.5 px-3.5 rounded-md text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      activeTab === "profile" 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <User size={14} /> Profile Settings
                    </span>
                    <ChevronRight size={12} />
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("availability")}
                    className={`w-full py-2.5 px-3.5 rounded-md text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      activeTab === "availability" 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Calendar size={14} /> Tour & Calendars
                    </span>
                    <ChevronRight size={12} />
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("curation")}
                    className={`w-full py-2.5 px-3.5 rounded-md text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      activeTab === "curation" 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sliders size={14} /> Curation Stages
                    </span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Status Notice */}
              <div className="bpl-card p-4 space-y-2 text-left">
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">League Status</span>
                {profileStatus === "approved" ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Your profile is <span className="text-green-400 font-bold">Approved</span> and indexed live on BPL databases. Venues can book you for matches.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Your application is currently <span className="text-primary-glow font-bold">Pending Review</span> by the curator board. Updates will appear in the Curation tab.
                  </p>
                )}
              </div>
            </div>

            {/* Dashboard Content Area */}
            <div className="lg:col-span-3">
              
              {/* TAB 1: PROFILE SETTINGS */}
              {activeTab === "profile" && (
                <div className="bpl-card p-8 space-y-6">
                  <div className="border-b border-border pb-4 text-left">
                    <h2 className="text-lg font-display font-bold text-white">Profile Details</h2>
                    <p className="text-xs text-muted-foreground">Configure public details displayed to recruiters and league curators.</p>
                  </div>

                  {/* Feedback */}
                  {success && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-md p-3 text-xs flex gap-2 text-left">
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2 text-left">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {currentUser?.role === "band" ? "Band / Artist Name" : currentUser?.role === "venue" ? "Venue Name" : "Company Name"}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                          required
                        />
                      </div>

                      {currentUser?.role === "band" && (
                        <>
                          <div className="space-y-1.5 col-span-1 md:col-span-2">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tagline / Motto</label>
                            <input
                              type="text"
                              value={tagline}
                              onChange={(e) => setTagline(e.target.value)}
                              placeholder="e.g. Bringing high-energy indie rock to BPL matches"
                              className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Primary Genre</label>
                            <select
                              value={genre}
                              onChange={(e) => setGenre(e.target.value)}
                              className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                            >
                              {["Rock", "Indie", "Folk", "Metal", "Pop", "Alternative", "Hip-Hop", "Other"].map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>

                          {genre === "Other" && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Custom Genre</label>
                              <input
                                type="text"
                                value={customGenre}
                                onChange={(e) => setCustomGenre(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {currentUser?.role === "venue" ? "Physical Address" : "Home City / Operation Area"}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-muted-foreground" size={14} />
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Description / Biography</label>
                        <textarea
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary btn-primary-hover px-6 py-2.5 rounded-md text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save size={14} />
                        {saving ? "Saving Changes..." : "Save Settings"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: AVAILABILITY & CALENDARS */}
              {activeTab === "availability" && (
                <div className="bpl-card p-8 space-y-6">
                  <div className="border-b border-border pb-4 text-left">
                    <h2 className="text-lg font-display font-bold text-white">Availability & Gig Parameters</h2>
                    <p className="text-xs text-muted-foreground">Manage your booking parameters, tour ranges, and calendar slots.</p>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {currentUser?.role === "band" 
                            ? "Performance Fee Range (per show)" 
                            : currentUser?.role === "venue" 
                              ? "Average Rental / Ticketing Share" 
                              : "Sponsorship / Investment Budget"}
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 text-muted-foreground" size={14} />
                          <input
                            type="text"
                            value={feeRange}
                            onChange={(e) => setFeeRange(e.target.value)}
                            placeholder="e.g. ₹50,000 - ₹80,000"
                            className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tour Status</label>
                        <select className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white">
                          <option>Open for Match Bookings</option>
                          <option>Currently in League Offseason</option>
                          <option>Fully Booked / Tour Active</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Availability Calendar</label>
                        <div className="bg-secondary/40 border border-border p-4 rounded-lg flex flex-wrap gap-2 text-xs">
                          {["Jul 15", "Jul 16", "Jul 18", "Jul 20", "Jul 22", "Jul 25", "Jul 27", "Jul 29", "Aug 01"].map(date => (
                            <span key={date} className="bg-primary/10 border border-primary/20 text-primary-glow font-bold rounded-md px-3 py-1.5 flex items-center gap-1.5">
                              <Calendar size={12} /> {date}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Calendar dates show active tour slots open for bookings in BPL franchises.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary btn-primary-hover px-6 py-2.5 rounded-md text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save size={14} />
                        {saving ? "Saving Calendar..." : "Update Availability"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: CURATION STATUS */}
              {activeTab === "curation" && (
                <div className="bpl-card p-8 space-y-6">
                  <div className="border-b border-border pb-4 text-left">
                    <h2 className="text-lg font-display font-bold text-white">Application Verification Stages</h2>
                    <p className="text-xs text-muted-foreground">Track your evaluation stages by the curator board.</p>
                  </div>

                  <div className="space-y-6 text-left max-w-md">
                    {[
                      { label: "Onboarding Submission", desc: "Profile files and bio cataloged successfully.", done: true },
                      { label: "Curation & Credential Verification", desc: "Verifying links, stage riders, and performance gallery.", done: profileStatus === "approved" || profileStatus === "needs_changes" },
                      { label: "Licensing Board Approval", desc: "Evaluating roster placement and league match scheduling.", done: profileStatus === "approved" },
                      { label: "League Live Indexing", desc: "Approved and visible in public catalogs.", done: profileStatus === "approved" },
                    ].map((stage, idx) => (
                      <div key={stage.label} className="flex gap-4 relative">
                        {idx < 3 && (
                          <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-8px)] bg-border" />
                        )}
                        <div className={`h-6 w-6 rounded-full shrink-0 border flex items-center justify-center text-xs font-semibold ${
                          stage.done 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "bg-surface border-border text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${stage.done ? "text-primary-glow" : "text-white/80"}`}>{stage.label}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{stage.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {profileStatus !== "approved" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-4 flex gap-3 text-left text-xs text-muted-foreground leading-normal mt-4">
                      <Clock size={18} className="text-primary-glow shrink-0" />
                      <div>
                        <h4 className="font-bold text-white mb-0.5">Under Review</h4>
                        <p>
                          Our review board evaluates profiles every 24-48 hours. If there are any updates or missing credentials required, you will see instructions here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
