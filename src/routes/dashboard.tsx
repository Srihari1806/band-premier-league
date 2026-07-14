import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState, useEffect, useRef } from "react";
import { db, WorkspaceItem, Message, Notification } from "@/lib/db";
import { isOperatorSessionActive, clearOperatorSession } from "@/lib/security";
import {
  User,
  MapPin,
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
  DollarSign,
  Lock,
  Building2,
  Tv,
  Megaphone,
  Award,
  Users,
  CalendarRange,
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
  Plus,
  Sparkles,
  Send,
  Check,
  Briefcase,
  LayoutDashboard,
  Settings,
  HelpCircle,
  X,
  Volume2,
  Music,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Workspace Dashboard — Kalakshetra" }],
  }),
  component: DashboardPage,
});

type DashboardTab =
  | "overview"
  | "profile"
  | "calendar"
  | "messages"
  | "curation"
  | "security";

function DashboardPage() {
  const navigate = useNavigate();

  // Session state
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Switcher and Header drop-down states
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Form states (re-used for profile edit)
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

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Chat & Messaging States
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Calendar states
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");

  // Curation Approvals (Organizer only)
  const [curationItems, setCurationItems] = useState<any[]>([]);

  // 1. Initial Load
  useEffect(() => {
    const account = db.getCurrentAccount();
    const user = db.getCurrentUser();
    const isAdminActive = isOperatorSessionActive();

    if (!account && !user && !isAdminActive) {
      navigate({ to: "/login" });
      return;
    }

    // Resolve unified account or mock admin account
    let resolvedAccount = account;
    let resolvedUser = user;

    if (isAdminActive && !account) {
      // Seed operator special account
      const operatorAccount = {
        id: "acc_operator",
        email: "admin@kalakshetra.in",
        workspaces: [
          {
            id: "work_operator",
            role: "admin",
            name: "Kalakshetra Organizer",
            status: "approved",
          },
        ],
        activeWorkspaceId: "work_operator",
        onboarded: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("bpl_current_account", JSON.stringify(operatorAccount));
      resolvedAccount = operatorAccount;
      resolvedUser = {
        id: "work_operator",
        role: "admin",
        email: "admin@kalakshetra.in",
        name: "Kalakshetra Organizer",
        status: "approved",
        username: "bploperator",
        accountId: "acc_operator",
        workspaces: operatorAccount.workspaces,
        activeWorkspaceId: "work_operator",
      };
    }

    setCurrentAccount(resolvedAccount);
    setCurrentUser(resolvedUser);

    if (resolvedUser) {
      setProfileData(resolvedUser.profileData || resolvedUser);
      setName(resolvedUser.name || "");
      setTagline(resolvedUser.profileData?.tagline || resolvedUser.tagline || "");
      setBio(resolvedUser.profileData?.bio || resolvedUser.profileData?.company_profile || resolvedUser.bio || "");
      setCity(resolvedUser.profileData?.home_city || resolvedUser.profileData?.address || resolvedUser.city || "");
      setGenre(resolvedUser.profileData?.genre || "");
      setFeeRange(resolvedUser.profileData?.fee_range || resolvedUser.profileData?.pricing || "");

      // Load mock calendar events
      const mockEvents = [
        {
          id: 1,
          title: "Kalakshetra Showcase Hold",
          date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0],
          time: "19:00",
          location: "Hylife Cafe, Hyderabad",
          status: "confirmed",
        },
        {
          id: 2,
          title: "Tour Match #4",
          date: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString().split("T")[0],
          time: "18:30",
          location: "The Oak Tavern, Bangalore",
          status: "tentative",
        },
      ];
      setCalendarEvents(mockEvents);

      // Load curation applicants (For Organizer role)
      if (resolvedUser.role === "admin") {
        const allApplicants: any[] = [];
        ["band", "venue", "production_house", "sponsor", "influencer", "volunteer", "event_manager"].forEach(
          (role) => {
            const records = JSON.parse(localStorage.getItem(`bpl_${role}_applications`) || "[]");
            records.forEach((r: any) => {
              allApplicants.push({ ...r, applicantRole: role });
            });
          },
        );
        setCurationItems(allApplicants.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }

      // Load notifications
      const notifs = db.getNotifications();
      // If notifications are empty, add a default welcoming one
      if (notifs.length === 0) {
        db.addNotification(
          "Welcome to Kalakshetra Workspace!",
          "Manage your bookings, switch profiles, and communicate with partners directly from this panel.",
          "system",
        );
        setNotifications(db.getNotifications());
      } else {
        setNotifications(notifs);
      }
    }

    setLoading(false);
  }, [navigate]);

  // Load chat channels and active messages
  useEffect(() => {
    if (!currentUser) return;

    // Load active messaging channels (other profiles in the registry)
    const bandRecords = JSON.parse(localStorage.getItem("bpl_band_applications") || "[]");
    const venueRecords = JSON.parse(localStorage.getItem("bpl_venue_applications") || "[]");
    const phRecords = JSON.parse(localStorage.getItem("bpl_production_house_applications") || "[]");

    const resolvedChannels: any[] = [];

    // Add Kalakshetra Operations Admin as channel for regular members
    if (currentUser.role !== "admin") {
      resolvedChannels.push({
        id: "work_operator",
        name: "Kalakshetra Operations",
        role: "operator",
        avatarIcon: ShieldAlert,
      });
    }

    bandRecords.forEach((b: any) => {
      if (b.id !== currentUser.id) {
        resolvedChannels.push({ id: b.id, name: b.band_name, role: "band", avatarIcon: Music });
      }
    });

    venueRecords.forEach((v: any) => {
      if (v.id !== currentUser.id) {
        resolvedChannels.push({ id: v.id, name: v.venue_name, role: "venue", avatarIcon: Building2 });
      }
    });

    phRecords.forEach((p: any) => {
      if (p.id !== currentUser.id) {
        resolvedChannels.push({ id: p.id, name: p.company_name, role: "production_house", avatarIcon: Tv });
      }
    });

    setChannels(resolvedChannels);

    if (resolvedChannels.length > 0 && !activeChannelId) {
      setActiveChannelId(resolvedChannels[0].id);
    }
  }, [currentUser, activeChannelId]);

  // Handle loading messages for selected channel
  useEffect(() => {
    if (!currentUser || !activeChannelId) return;

    const loadMessages = () => {
      const allMsgs = db.getMessages(currentUser.id);
      // Filter message logs specific to this selected channel
      const filtered = allMsgs.filter(
        (m) =>
          (m.fromId === currentUser.id && m.toId === activeChannelId) ||
          (m.fromId === activeChannelId && m.toId === currentUser.id),
      );
      setChatMessages(filtered);
    };

    loadMessages();

    // Auto poll for new messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, activeChannelId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !currentUser || !activeChannelId) return;

    const newMsg = db.sendMessage(currentUser.id, activeChannelId, newMessageText);
    setChatMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");
  };

  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const newEv = {
      id: Date.now(),
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime || "12:00",
      location: newEventLocation || "Virtual / Online",
      status: "confirmed",
    };

    setCalendarEvents((prev) => [...prev, newEv]);
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventLocation("");
  };

  const handleCurationApproval = (applicantRole: string, applicantId: string, approve: boolean) => {
    const key = `bpl_${applicantRole}_applications`;
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = records.findIndex((r: any) => r.id === applicantId);
    if (idx !== -1) {
      records[idx].status = approve ? "approved" : "rejected";
      localStorage.setItem(key, JSON.stringify(records));

      // Update in curationItems state list
      setCurationItems((prev) =>
        prev.map((item) =>
          item.id === applicantId ? { ...item, status: approve ? "approved" : "rejected" } : item,
        ),
      );

      // Send alert notification to the user account
      const applicantMail = records[idx].contact_email;
      const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]");
      const userAcc = accounts.find((a: any) => a.email.toLowerCase() === applicantMail.toLowerCase());
      if (userAcc) {
        // Add workspace automatically to their workspaces if approved
        if (approve) {
          const workspaceName = records[idx].band_name || records[idx].venue_name || records[idx].company_name || records[idx].name;
          db.addWorkspaceToAccount(userAcc.id, applicantRole, applicantId, workspaceName);
        }
      }
    }
  };

  const handleWorkspaceSwitch = (workspaceId: string) => {
    db.switchWorkspace(workspaceId);
    setIsSwitcherOpen(false);
    window.location.reload();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedFields: any = {};
      if (currentUser.role === "band" || currentUser.role === "solo") {
        updatedFields.band_name = name;
        updatedFields.bio = bio;
        updatedFields.home_city = city;
        updatedFields.genre = genre;
        updatedFields.fee_range = feeRange;
      } else if (currentUser.role === "venue") {
        updatedFields.venue_name = name;
        updatedFields.address = city;
        updatedFields.pricing = feeRange;
      } else {
        updatedFields.company_name = name;
        updatedFields.company_profile = bio;
      }

      if (currentUser.role === "admin") {
        setSuccess("Organizer settings updated successfully (in-memory demo)!");
        setSaving(false);
        return;
      }

      await db.updateProfile(currentUser.role, currentUser.id, updatedFields);
      setSuccess("Workspace details updated successfully!");
      // Reload session
      const freshUser = db.getCurrentUser();
      setCurrentUser(freshUser);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSecurityError("");
    setSecuritySuccess("");

    if (newPassword.length < 6) {
      setSecurityError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      if (currentUser.role === "admin") {
        setSecurityError("Organizer credentials cannot be changed from User Dashboard.");
        setUpdatingPassword(false);
        return;
      }

      await db.updatePassword(currentUser.role, currentUser.id, currentPassword, newPassword);
      setSecuritySuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorObj = err as Error;
      setSecurityError(errorObj.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    if (currentUser?.role === "admin") {
      clearOperatorSession();
    }
    db.logoutUser();
    navigate({ to: "/login" });
    window.location.reload();
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading Kalakshetra workspace...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Calculate profile completeness score
  const getCompletenessScore = () => {
    if (currentUser?.role === "admin") return 100;
    let score = 30; // base score for registered
    if (name) score += 20;
    if (city) score += 15;
    if (bio) score += 20;
    if (feeRange || genre) score += 15;
    return Math.min(score, 100);
  };

  const completeness = getCompletenessScore();

  // Role labels
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "band":
        return { text: "Band", color: "text-amber-400 bg-amber-500/10 border-amber-500/25", icon: Music };
      case "solo":
        return { text: "Solo Artist", color: "text-pink-400 bg-pink-500/10 border-pink-500/25", icon: User };
      case "venue":
        return { text: "Venue", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", icon: Building2 };
      case "production_house":
        return { text: "Label", color: "text-teal-400 bg-teal-500/10 border-teal-500/25", icon: Tv };
      case "sponsor":
        return { text: "Sponsor", color: "text-blue-400 bg-blue-500/10 border-blue-500/25", icon: Megaphone };
      case "influencer":
        return { text: "Influencer", color: "text-rose-400 bg-rose-500/10 border-rose-500/25", icon: Award };
      case "volunteer":
        return { text: "Creative Crew", color: "text-purple-400 bg-purple-500/10 border-purple-500/25", icon: Users };
      case "event_manager":
        return { text: "Event Manager", color: "text-green-400 bg-green-500/10 border-green-500/25", icon: CalendarRange };
      case "admin":
        return { text: "Organizer", color: "text-primary-glow bg-primary/10 border-primary/20", icon: ShieldAlert };
      default:
        return { text: "Member", color: "text-gray-400 bg-gray-500/10 border-gray-500/25", icon: User };
    }
  };

  const activeRoleBadge = getRoleBadge(currentUser?.role || "user");
  const ActiveRoleIcon = activeRoleBadge.icon;

  return (
    <PageShell>
      <div className="flex min-h-screen bg-background relative">
        {/* BACKGROUND GLOW */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        {/* 1. LEFT SIDEBAR */}
        <aside className="w-64 border-r border-border bg-slate-950 flex flex-col justify-between shrink-0 hidden md:flex relative z-20">
          <div className="flex flex-col flex-1">
            {/* Notion Switcher Container */}
            <div className="p-4 border-b border-border relative">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="w-full flex items-center justify-between gap-2 p-2 bg-secondary/60 hover:bg-secondary rounded-lg border border-border text-left transition select-none cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="p-1.5 rounded bg-primary/15 text-primary-glow shrink-0">
                    <ActiveRoleIcon size={14} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{currentUser?.name || "Active Workspace"}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      {activeRoleBadge.text}
                    </p>
                  </div>
                </div>
                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
              </button>

              {/* NOTION DROPDOWN SWITCHER */}
              {isSwitcherOpen && (
                <div className="absolute top-full left-4 right-4 mt-1 bg-slate-900 border border-border rounded-lg shadow-xl py-2 z-50 animate-fade-in text-left">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground px-3 py-1.5 tracking-wider">
                    Switch Workspace
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 px-1.5">
                    {currentAccount?.workspaces.map((w: WorkspaceItem) => {
                      const wBadge = getRoleBadge(w.role);
                      const WIcon = wBadge.icon;
                      return (
                        <button
                          key={w.id}
                          onClick={() => handleWorkspaceSwitch(w.id)}
                          className={`w-full flex items-center justify-between p-2 rounded hover:bg-secondary transition text-left cursor-pointer ${
                            w.id === currentUser?.id ? "bg-primary/5 border border-primary/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="p-1 rounded bg-secondary text-muted-foreground">
                              <WIcon size={12} />
                            </div>
                            <span className="text-xs font-semibold text-white truncate">{w.name}</span>
                          </div>
                          {w.id === currentUser?.id && (
                            <Check size={12} className="text-primary-glow shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border mt-2 pt-2 px-1.5">
                    <Link
                      to="/onboarding"
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-secondary text-xs text-primary-glow font-bold transition text-left"
                      onClick={() => setIsSwitcherOpen(false)}
                    >
                      <Plus size={12} />
                      Register New Role
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-red-500/10 text-xs text-red-400 font-semibold transition text-left cursor-pointer mt-1"
                    >
                      <LogOut size={12} />
                      Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Side Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1.5 text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground px-2 block mb-2">
                Workspace Menu
              </span>

              {/* DASHBOARD OVERVIEW */}
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <LayoutDashboard size={14} /> Workspace Dashboard
              </button>

              {/* CURATION APPROVALS (Organizer only) */}
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("curation")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "curation"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Briefcase size={14} /> Curation Approvals
                </button>
              )}

              {/* WORKSPACE PROFILE EDIT */}
              {currentUser?.role !== "admin" && (
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "profile"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <User size={14} /> Profile Workspace
                </button>
              )}

              {/* WORKSPACE CALENDAR */}
              <button
                onClick={() => setActiveTab("calendar")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "calendar"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Calendar size={14} /> Schedule & Calendar
              </button>

              {/* WORKSPACE CHAT MESSAGES */}
              <button
                onClick={() => setActiveTab("messages")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "messages"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <MessageSquare size={14} /> Messaging Hub
              </button>

              {/* WORKSPACE SECURITY */}
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "security"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Lock size={14} /> Account Settings
              </button>
            </nav>
          </div>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-border bg-slate-950/80 text-left">
            <div className="flex items-center gap-2 truncate">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-border flex items-center justify-center text-xs text-primary-glow font-bold shrink-0">
                {currentUser?.name?.substring(0, 1).toUpperCase() || "K"}
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-white truncate">{currentUser?.email}</p>
                <p className="text-[9px] text-muted-foreground">Kalakshetra Member</p>
              </div>
            </div>
          </div>
        </aside>

        {/* 2. MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER */}
          <header className="h-16 border-b border-border bg-slate-950/40 backdrop-blur-md px-6 flex justify-between items-center z-10 shrink-0">
            {/* Left header segment (search / title) */}
            <div className="flex items-center gap-3">
              <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${activeRoleBadge.color}`}>
                {activeRoleBadge.text} Space
              </span>
            </div>

            {/* Right header actions */}
            <div className="flex items-center gap-4">
              {/* Shortcut Calendar */}
              <button
                onClick={() => setActiveTab("calendar")}
                className="text-muted-foreground hover:text-primary-glow transition cursor-pointer"
                title="Workspace Calendar"
              >
                <Calendar size={18} />
              </button>

              {/* Shortcut Messages */}
              <button
                onClick={() => setActiveTab("messages")}
                className="text-muted-foreground hover:text-primary-glow transition cursor-pointer"
                title="Workspace Messages"
              >
                <MessageSquare size={18} />
              </button>

              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="text-muted-foreground hover:text-primary-glow transition relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary shadow-glow" />
                  )}
                </button>

                {/* NOTIFICATIONS PANEL */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-border rounded-lg shadow-xl overflow-hidden z-50 text-left animate-fade-in">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                      <span className="text-xs font-bold text-white">System Alerts</span>
                      <button
                        onClick={() => {
                          db.markNotificationsAsRead();
                          setNotifications(db.getNotifications());
                        }}
                        className="text-[10px] font-bold text-primary-glow hover:underline cursor-pointer"
                      >
                        Clear Indicators
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">No current notifications.</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-3 text-left space-y-1 ${!n.read ? "bg-primary/5" : ""}`}>
                            <div className="flex justify-between items-start text-xs font-bold text-white">
                              <span>{n.title}</span>
                              <span className="text-[8px] text-muted-foreground font-normal">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-normal">{n.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded border border-red-500/20 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </header>

          {/* MAIN PAGE WRAPPER */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Top Stats Banner */}
                  <div className="bpl-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-primary/20 text-primary-glow px-2.5 py-1 rounded-full border border-primary/25">
                          Workspace Active
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full border border-green-500/25 flex items-center gap-1">
                          <CheckCircle size={10} /> {completeness}% Complete
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                        {currentUser?.name} Dashboard
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Your workspace registry ID: <span className="font-mono text-primary-glow select-all">{currentUser?.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dashboard Widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Completeness score widget */}
                    <div className="bpl-card p-6 text-left space-y-4">
                      <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground tracking-wider">
                        <span>Profile Quality</span>
                        <span className="text-primary-glow">{completeness}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                          style={{ width: `${completeness}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Add social links, performance media, logo, and fee ranges to push your profile discovery rating to 100%.
                      </p>
                    </div>

                    {/* Stats Widget 2 */}
                    <div className="bpl-card p-6 text-left space-y-3">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Calendar Shows & Holds
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-display font-bold text-white">
                          {calendarEvents.length}
                        </span>
                        <span className="text-xs text-green-400 font-semibold">Active Holds</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Review contract schedules or negotiate dates directly from the calendar panel.
                      </p>
                    </div>

                    {/* Stats Widget 3 */}
                    <div className="bpl-card p-6 text-left space-y-3">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Direct Inbound Leads
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-display font-bold text-white">0</span>
                        <span className="text-xs text-muted-foreground font-semibold">No New Inquiries</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Other members can contact you using the internal messaging hub.
                      </p>
                    </div>
                  </div>

                  {/* Dashboard layout blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Activity Feed */}
                    <div className="bpl-card p-6 text-left space-y-4">
                      <h3 className="text-sm font-semibold text-white font-display">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-xs">
                          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary-glow">
                            <Sparkles size={11} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Workspace Initialized</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Your dashboard configurations are active.</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary-glow">
                            <CheckCircle size={11} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Instant Curation Verified</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Profile directory publishing status set to approved.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Guide Card */}
                    <div className="bpl-card p-6 text-left space-y-4 bg-primary/5 border-primary/25">
                      <h3 className="text-sm font-semibold text-primary-glow font-display">Workspace Switcher Guide</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Kalakshetra supports managing multiple roles under one email login. To switch to a different workspace (e.g. Band ↔ Venue) or add a new role, click the dropdown switcher in the top-left corner of the sidebar!
                      </p>
                      <button
                        onClick={() => setIsSwitcherOpen(true)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider hover:underline"
                      >
                        Try Switching <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE EDIT */}
              {activeTab === "profile" && (
                <div className="bpl-card p-8 text-left space-y-6 animate-fade-in">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-bold text-white font-display">Profile Workspace Details</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update the public description and catalog statistics for this registry item.
                    </p>
                  </div>

                  {success && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-md p-3 text-xs flex gap-2">
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Display Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          City / Operating Base *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Tagline / Short description
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                        placeholder="e.g. India's loudest progressive metal ensemble"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Biography / Company Overview
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary h-28 resize-none"
                        placeholder="Tell the community about your journey, history, and achievements..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentUser?.role === "band" || currentUser?.role === "solo" ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Musical Genre *
                          </label>
                          <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                            placeholder="e.g. Rock, Folk, Electronic"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {currentUser?.role === "venue" ? "Capacity Charge" : "Standard Gig/Project Fee"}
                        </label>
                        <input
                          type="text"
                          value={feeRange}
                          onChange={(e) => setFeeRange(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          placeholder="e.g. ₹25,000 - ₹40,000 per gig"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary btn-primary-hover px-6 py-2.5 rounded-md text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? "Saving Workspace..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: CALENDAR */}
              {activeTab === "calendar" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
                  {/* Calendar schedule view */}
                  <div className="lg:col-span-2 bpl-card p-6 space-y-6">
                    <div className="border-b border-border pb-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-semibold text-white font-display">Workspace Calendar</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Manage live tour booking dates.</p>
                      </div>
                    </div>

                    {/* Calendar grid rendering */}
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="font-bold text-muted-foreground uppercase text-[9px] py-1 border-b border-border/40">
                          {d}
                        </div>
                      ))}
                      {/* Render dummy calendar days (from 1 to 28) */}
                      {Array.from({ length: 28 }, (_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `2026-07-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                        const eventsOnDay = calendarEvents.filter((e) => e.date === dateStr);

                        return (
                          <div
                            key={dayNum}
                            className={`min-h-16 p-1 bg-secondary/20 border border-border/30 rounded flex flex-col justify-between text-left group ${
                              eventsOnDay.length > 0 ? "bg-primary/5 border-primary/20" : ""
                            }`}
                          >
                            <span className="text-[9px] font-bold text-muted-foreground">{dayNum}</span>
                            <div className="space-y-0.5 mt-1 overflow-hidden">
                              {eventsOnDay.map((e) => (
                                <div
                                  key={e.id}
                                  className="text-[8px] leading-tight px-1 py-0.5 rounded truncate font-semibold bg-primary text-primary-foreground select-none"
                                  title={`${e.title} at ${e.location}`}
                                >
                                  {e.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Events List */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-white">Upcoming Events List</h4>
                      {calendarEvents.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">No events on your calendar.</p>
                      ) : (
                        <div className="space-y-2">
                          {calendarEvents.map((e) => (
                            <div key={e.id} className="p-3 bg-secondary/35 border border-border rounded-lg flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-white">{e.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                                  <span>{e.date} @ {e.time}</span>
                                  <span>•</span>
                                  <span>{e.location}</span>
                                </p>
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-primary-glow px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                                {e.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Event Form Panel */}
                  <div className="bpl-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white font-display">Add Workspace Event</h3>
                    <form onSubmit={handleAddCalendarEvent} className="space-y-3 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Event Title *</label>
                        <input
                          type="text"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          className="w-full bg-secondary border border-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          placeholder="e.g. Gig Hold / Tour Stop"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Date *</label>
                        <input
                          type="date"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="w-full bg-secondary border border-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Time</label>
                        <input
                          type="time"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="w-full bg-secondary border border-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Location</label>
                        <input
                          type="text"
                          value={newEventLocation}
                          onChange={(e) => setNewEventLocation(e.target.value)}
                          className="w-full bg-secondary border border-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          placeholder="Venue or virtual link"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-primary hover:bg-primary-glow border border-primary text-primary-foreground text-xs font-bold rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus size={12} /> Add Event
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: CHAT MESSAGES */}
              {activeTab === "messages" && (
                <div className="grid grid-cols-1 md:grid-cols-3 bpl-card min-h-[500px] overflow-hidden animate-fade-in text-left">
                  {/* Channels Sidebar List */}
                  <div className="md:col-span-1 border-r border-border bg-slate-950/40 flex flex-col">
                    <div className="p-3 border-b border-border text-xs font-bold text-white uppercase tracking-wider bg-surface/30">
                      Chat Channels
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[450px]">
                      {channels.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">No channels found.</div>
                      ) : (
                        channels.map((chan) => {
                          const Icon = chan.avatarIcon || User;
                          return (
                            <button
                              key={chan.id}
                              onClick={() => setActiveChannelId(chan.id)}
                              className={`w-full flex items-center gap-2.5 p-3 text-left transition ${
                                activeChannelId === chan.id
                                  ? "bg-primary/10 border-l-2 border-primary text-white"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                              }`}
                            >
                              <div className="p-1.5 rounded bg-secondary text-primary-glow shrink-0">
                                <Icon size={12} />
                              </div>
                              <div className="truncate text-xs">
                                <p className="font-bold truncate text-white">{chan.name}</p>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                                  {chan.role}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Message conversation area */}
                  <div className="md:col-span-2 flex flex-col justify-between h-[500px]">
                    {/* Header of conversation */}
                    <div className="p-3 border-b border-border flex items-center gap-2 text-xs bg-surface/20">
                      <span className="font-bold text-white">
                        {channels.find((c) => c.id === activeChannelId)?.name || "Select Channel"}
                      </span>
                    </div>

                    {/* Messages logs */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/15 max-h-[380px]">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        chatMessages.map((m) => {
                          const isMe = m.fromId === currentUser.id;
                          return (
                            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[70%] p-3 rounded-lg text-xs leading-normal ${
                                  isMe ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary text-white border border-border"
                                }`}
                              >
                                <p>{m.text}</p>
                                <span className={`text-[8px] block mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Message send form */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-slate-950 flex gap-2">
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Type message here..."
                        className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs focus:outline-none text-white focus:border-primary"
                        required
                      />
                      <button
                        type="submit"
                        className="p-2 bg-primary hover:bg-primary-glow border border-primary text-primary-foreground rounded shrink-0 flex items-center justify-center transition cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 5: CURATION APPROVALS (Organizer only) */}
              {activeTab === "curation" && currentUser?.role === "admin" && (
                <div className="bpl-card p-6 space-y-6 animate-fade-in text-left">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Curation Applications Log</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Review registered ecosystem workspace details and confirm publishing approvals.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-secondary/40 text-muted-foreground uppercase text-[9px] tracking-wider border-b border-border">
                        <tr>
                          <th className="p-3">Applicant Space</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Registered At</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {curationItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                              No registrations logged in local storage.
                            </td>
                          </tr>
                        ) : (
                          curationItems.map((item) => {
                            const badge = getRoleBadge(item.applicantRole);
                            return (
                              <tr key={item.id} className="hover:bg-secondary/10">
                                <td className="p-3 font-semibold text-white">
                                  {item.band_name || item.venue_name || item.company_name || item.name || "N/A"}
                                </td>
                                <td className="p-3">
                                  <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}>
                                    {badge.text}
                                  </span>
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {item.contact_email || item.contact_phone || "N/A"}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                                      item.status === "approved"
                                        ? "bg-green-500/10 text-green-400"
                                        : item.status === "rejected"
                                          ? "bg-red-500/10 text-red-400"
                                          : "bg-yellow-500/10 text-yellow-400"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right space-x-1 shrink-0">
                                  {item.status !== "approved" && (
                                    <button
                                      onClick={() => handleCurationApproval(item.applicantRole, item.id, true)}
                                      className="bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-bold px-2.5 py-1 rounded text-[9px] uppercase cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {item.status !== "rejected" && (
                                    <button
                                      onClick={() => handleCurationApproval(item.applicantRole, item.id, false)}
                                      className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold px-2.5 py-1 rounded text-[9px] uppercase cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY / PASSWORD RESET */}
              {activeTab === "security" && (
                <div className="bpl-card p-8 text-left space-y-6 animate-fade-in">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-bold text-white font-display">Account Security Settings</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Change your passwords and verify your login credentials.
                    </p>
                  </div>

                  {securitySuccess && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-md p-3 text-xs flex gap-2">
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{securitySuccess}</span>
                    </div>
                  )}

                  {securityError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{securityError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-semibold max-w-sm">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Current Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-muted-foreground" size={12} />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-muted-foreground" size={12} />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-muted-foreground" size={12} />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="btn-primary btn-primary-hover px-6 py-2.5 rounded-md text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={14} />
                      {updatingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageShell>
  );
}
