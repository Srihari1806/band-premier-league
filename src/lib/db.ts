import { createClient } from "@supabase/supabase-js";

export interface BandMember {
  name: string;
  role: string;
  photo?: string; // Base64
  instagram?: string;
  experience?: string;
}

export interface ArtistApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  name: string;
  username: string;
  contact_email: string;
  contact_phone: string;
  about: string;
  tagline?: string;
  home_city: string;
  roles: string[];
  skills?: string[];
  releases?: { title: string; year: string; link?: string }[];
  performances?: { event: string; year: string; location?: string }[];
  awards?: { title: string; year: string }[];
  timeline?: { year: number; event: string }[];
  gallery?: string[];
  videos?: string[];
  social_links?: { instagram?: string; spotify?: string; youtube?: string; saavn?: string; apple?: string; website?: string };
}

export interface BandApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  band_name: string;
  genre: string;
  custom_genre?: string;
  home_city: string;
  formed_year?: number;
  bio: string;
  banner_image: string; // Base64
  profile_image: string; // Base64
  tagline?: string;
  languages?: string;
  original_covers?: string; // Originals, Covers, Both
  members?: { artistId: string; name: string; username: string; position: string }[];
  owners: string[]; // List of user account IDs
  instagram_url: string;
  youtube_url?: string;
  spotify_url?: string;
  saavn_url?: string;
  apple_url?: string;
  website_url?: string;
  demo_track?: string; // Base64 or audio link
  stage_rider?: string; // Stage rider text or Base64
  technical_requirements?: string;
  preferred_cities?: string;
  fee_range?: string;
  availability_calendar?: string[]; // Array of ISO dates
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  manager_name?: string;
}

export interface BandInvitation {
  id: string;
  bandId: string;
  bandName: string;
  artistId: string;
  artistName: string;
  position: string;
  status: "pending" | "accepted" | "declined";
  timestamp: string;
}

export interface VenueApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  venue_name: string;
  address: string;
  maps_link?: string;
  owner_name: string;
  type: string; // cafe, pub, restaurant, college, open-air, indoor
  capacity: string;
  stage_size?: string;
  facilities: {
    parking?: boolean;
    green_room?: boolean;
    lighting?: boolean;
    sound?: boolean;
    power?: boolean;
    food?: boolean;
    bar?: boolean;
    details?: string;
  };
  images?: string[]; // Array of Base64
  availability?: string[]; // Preferred days or genres
  pricing?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface ProductionHouseApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  company_name: string;
  logo_image?: string; // Base64
  banner_image?: string; // Base64
  company_profile: string;
  genres_of_interest?: string[];
  investment_capacity?: string;
  past_artists?: string[];
  portfolio_links?: string[];
  website_url?: string;
  instagram_url?: string;
  cities_of_operation?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface SponsorApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  company_name: string;
  industry?: string;
  budget_range?: string;
  campaign_goals?: string;
  preferred_audience?: string;
  preferred_cities?: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface InfluencerApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  name: string;
  instagram_handle: string;
  follower_count: string;
  engagement_rate?: string;
  category?: string;
  audience_demographics?: string;
  past_campaigns?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface VolunteerApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  name: string;
  role_type: string; // volunteer, producer, videographer, photographer, podcast, college
  skills?: string;
  city: string;
  availability?: string;
  experience?: string;
  interests?: string;
  photo?: string; // Base64
  contact_phone: string;
  contact_email: string;
}

export interface EventManagerApplication {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "needs_changes";
  company_name: string;
  cities?: string[];
  past_events?: string;
  team_size?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface LeagueStats {
  total_shows: string;
  bands: string;
  cities: string;
  attendance: string;
  revenue: string;
  streaming: string;
  followers?: string;
}

// 1. Supabase Initialization
const getEnvVar = (key: string): string => {
  if (typeof window !== "undefined") {
    const winEnv = (window as unknown as { _env_?: Record<string, string> })._env_;
    if (winEnv && winEnv[key]) return winEnv[key];
  }
  return (import.meta.env[key] as string) || "";
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY");

export interface WorkspaceItem {
  id: string;
  role: string;
  name: string;
  status: string;
}

export interface UserAccount {
  id: string;
  email: string;
  phone?: string;
  password?: string;
  workspaces: WorkspaceItem[];
  activeWorkspaceId?: string;
  onboarded: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type?: string;
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (supabase) {
  console.log("Supabase client initialized successfully.");
} else {
  console.log("Supabase client not configured. Using localStorage fallback.");
}

// 2. Default Local Mock Data
const DEFAULT_STATS: LeagueStats = {
  total_shows: "24",
  bands: "4",
  cities: "6",
  attendance: "100",
  revenue: "₹11.77L",
  streaming: "200",
  followers: "5K+",
};

// Helper to initialize local storage data if empty
function initLocalStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem("bpl_stats_initialized")) {
    localStorage.setItem("bpl_stats", JSON.stringify(DEFAULT_STATS));
    localStorage.setItem("bpl_stats_initialized", "true");
  }

  // Init application arrays if they don't exist
  const roles = [
    "band",
    "artist",
    "venue",
    "production_house",
    "sponsor",
    "influencer",
    "volunteer",
    "event_manager",
  ];

  roles.forEach((role) => {
    const key = `bpl_${role}_applications`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });

  if (!localStorage.getItem("bpl_accounts")) {
    localStorage.setItem("bpl_accounts", JSON.stringify([]));
  }
  if (!localStorage.getItem("bpl_messages")) {
    localStorage.setItem("bpl_messages", JSON.stringify([]));
  }
  if (!localStorage.getItem("bpl_notifications")) {
    localStorage.setItem("bpl_notifications", JSON.stringify([]));
  }
  if (!localStorage.getItem("bpl_band_invitations")) {
    localStorage.setItem("bpl_band_invitations", JSON.stringify([]));
  }
}

// Initialize LocalStorage structures
if (typeof window !== "undefined") {
  initLocalStorage();
}

// Helper to map roles to tables / localStorage keys
const getStorageKey = (role: string) => `bpl_${role}_applications`;
const getTableName = (role: string) => `${role}_applications`;

// 3. Database Unified Wrapper APIs
export const db = {
  // --- Unified Application Submission ---
  async submitApplication(role: string, data: any): Promise<any> {
    const cleanRole = role.replace("-", "_").replace(" ", "_");
    const uniqueUsername = `kala_${cleanRole}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate temporary 8-character password: kp_xxxxxx
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randStr = "";
    for (let i = 0; i < 6; i++) {
      randStr += chars[Math.floor(Math.random() * chars.length)];
    }
    const tempPassword = `kp_${randStr}`;

    const newApp = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      status: "approved",
      username: uniqueUsername,
      password: tempPassword,
    };

    if (supabase) {
      const { data: dbData, error } = await supabase
        .from(getTableName(role))
        .insert([newApp])
        .select()
        .single();
      if (error) {
        console.warn(`Supabase insert failed for ${role}, using localStorage fallback`, error);
        return this.saveToLocal(role, newApp);
      }
      return dbData;
    } else {
      return this.saveToLocal(role, newApp);
    }
  },

  saveToLocal(role: string, app: any) {
    if (typeof window === "undefined") return app;
    const key = getStorageKey(role);
    const apps = JSON.parse(localStorage.getItem(key) || "[]");
    apps.push(app);
    localStorage.setItem(key, JSON.stringify(apps));
    return app;
  },

  // --- Unified Application Retrieval for Admin (No filters, password protected page) ---
  async getApplications(role: string): Promise<any[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from(getTableName(role))
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn(`Supabase fetch failed for ${role}, using localStorage fallback`, error);
        return this.getLocalApplications(role);
      }
      return data || [];
    } else {
      return this.getLocalApplications(role);
    }
  },

  getLocalApplications(role: string): any[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(getStorageKey(role)) || "[]");
  },

  // --- Unified Application Status Update (Admin) ---
  async updateApplicationStatus(
    role: string,
    id: string,
    status: "pending" | "approved" | "rejected" | "needs_changes",
  ): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from(getTableName(role)).update({ status }).eq("id", id);
      if (error) {
        console.warn(`Supabase update failed for ${role}, using localStorage fallback`, error);
        this.updateLocalStatus(role, id, status);
      }
    } else {
      this.updateLocalStatus(role, id, status);
    }
  },

  updateLocalStatus(role: string, id: string, status: string) {
    if (typeof window === "undefined") return;
    const key = getStorageKey(role);
    const apps = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedApps = apps.map((app: any) => (app.id === id ? { ...app, status } : app));
    localStorage.setItem(key, JSON.stringify(updatedApps));
  },

  // --- Public APIs: Query Level Security Enforced (Only Approved entries) ---
  async getApprovedRecords(role: string): Promise<any[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from(getTableName(role))
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn(
          `Supabase query failed for approved ${role}, using localStorage fallback`,
          error,
        );
        return this.getLocalApprovedRecords(role);
      }
      return data || [];
    } else {
      return this.getLocalApprovedRecords(role);
    }
  },

  getLocalApprovedRecords(role: string): any[] {
    if (typeof window === "undefined") return [];
    const apps = JSON.parse(localStorage.getItem(getStorageKey(role)) || "[]");
    return apps.filter((app: any) => app.status === "approved");
  },

  // --- Dynamic Single Item Retrieval: Query Level Security Enforced ---
  async getApprovedRecordById(role: string, id: string): Promise<any | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from(getTableName(role))
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (error) {
        console.warn(
          `Supabase query by ID failed for approved ${role}, using localStorage fallback`,
          error,
        );
        return this.getLocalApprovedRecordById(role, id);
      }
      return data || null;
    } else {
      return this.getLocalApprovedRecordById(role, id);
    }
  },

  getLocalApprovedRecordById(role: string, id: string): any | null {
    if (typeof window === "undefined") return null;
    const apps = JSON.parse(localStorage.getItem(getStorageKey(role)) || "[]");
    const record = apps.find((app: any) => app.id === id);
    // Enforce API-level security: do not return if it exists but is not approved
    if (record && record.status === "approved") {
      return record;
    }
    return null;
  },

  async getRecordById(role: string, id: string): Promise<any | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from(getTableName(role))
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.warn(`Supabase query failed for ${role} by id, using localStorage fallback`, error);
        return this.getLocalRecordById(role, id);
      }
      return data || null;
    } else {
      return this.getLocalRecordById(role, id);
    }
  },

  getLocalRecordById(role: string, id: string): any | null {
    if (typeof window === "undefined") return null;
    const apps = JSON.parse(localStorage.getItem(getStorageKey(role)) || "[]");
    return apps.find((app: any) => app.id === id) || null;
  },

  // --- Stats / Numbers ---
  async getStats(): Promise<LeagueStats> {
    if (supabase) {
      const { data, error } = await supabase
        .from("league_stats")
        .select("*")
        .eq("id", "current_season")
        .maybeSingle();
      if (error || !data) {
        return JSON.parse(
          localStorage.getItem("bpl_stats") || JSON.stringify(DEFAULT_STATS),
        ) as LeagueStats;
      }
      return data as LeagueStats;
    } else {
      if (typeof window === "undefined") return DEFAULT_STATS;
      return JSON.parse(
        localStorage.getItem("bpl_stats") || JSON.stringify(DEFAULT_STATS),
      ) as LeagueStats;
    }
  },

  async updateStats(stats: LeagueStats): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from("league_stats")
        .upsert({ id: "current_season", ...stats });
      if (error) throw error;
    } else {
      localStorage.setItem("bpl_stats", JSON.stringify(stats));
    }
  },

  // --- Clear / Reset Utility (DANGER: Deletes all application records) ---
  async clearAllData(): Promise<void> {
    if (supabase) {
      const roles = [
        "band",
        "venue",
        "production_house",
        "sponsor",
        "influencer",
        "volunteer",
        "event_manager",
      ];
      for (const role of roles) {
        try {
          await supabase
            .from(getTableName(role))
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        } catch (e) {
          console.warn(`Failed to clear table ${getTableName(role)} in Supabase`, e);
        }
      }

      const zeroStats: LeagueStats = {
        total_shows: "0",
        bands: "0",
        cities: "0",
        attendance: "0",
        revenue: "₹0",
        streaming: "0",
        followers: "0",
      };

      await supabase.from("league_stats").upsert({ id: "current_season", ...zeroStats });
    }

    if (typeof window !== "undefined") {
      const roles = [
        "band",
        "venue",
        "production_house",
        "sponsor",
        "influencer",
        "volunteer",
        "event_manager",
      ];
      roles.forEach((role) => {
        localStorage.setItem(getStorageKey(role), JSON.stringify([]));
        localStorage.removeItem(`bpl_draft_${role}`); // Clear drafts too
      });
      localStorage.removeItem("bpl_user_onboarded");

      const zeroStats: LeagueStats = {
        total_shows: "0",
        bands: "0",
        cities: "0",
        attendance: "0",
        revenue: "₹0",
        streaming: "0",
        followers: "0",
      };
      localStorage.setItem("bpl_stats", JSON.stringify(zeroStats));
      localStorage.setItem("bpl_stats_initialized", "true");
    }
  },

  getCurrentUser(): any | null {
    if (typeof window === "undefined") return null;
    
    const accountSession = localStorage.getItem("bpl_current_account");
    if (accountSession) {
      const account = JSON.parse(accountSession) as UserAccount;
      if (account.activeWorkspaceId) {
        const workspace = account.workspaces.find((w) => w.id === account.activeWorkspaceId);
        if (workspace) {
          const resolvedRole = workspace.role === "band_member" ? "band" : workspace.role;
          const key = getStorageKey(resolvedRole);
          const records = JSON.parse(localStorage.getItem(key) || "[]");
          const profile = records.find((r: any) => r.id === workspace.id) || {};
          
          return {
            id: workspace.id,
            role: workspace.role,
            email: account.email,
            name:
              profile.band_name ||
              profile.venue_name ||
              profile.company_name ||
              profile.name ||
              workspace.name,
            status: profile.status || "approved",
            username: profile.username || workspace.id,
            accountId: account.id,
            workspaces: account.workspaces,
            activeWorkspaceId: account.activeWorkspaceId,
            profileData: profile,
          };
        }
      }
      
      return {
        id: account.id,
        role: "user",
        email: account.email,
        name: "Member",
        status: "approved",
        accountId: account.id,
        workspaces: account.workspaces,
        activeWorkspaceId: undefined,
      };
    }
    
    const session = localStorage.getItem("bpl_current_user");
    return session ? JSON.parse(session) : null;
  },

  async loginUser(loginId: string, passwordText: string, role: string): Promise<any> {
    if (typeof window === "undefined") return null;
    const searchVal = loginId.trim().toLowerCase();

    if (supabase) {
      try {
        const tableName = getTableName(role);
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .or(
            `contact_email.ilike.${searchVal},username.ilike.${searchVal},contact_phone.ilike.${searchVal}`,
          )
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          throw new Error(`No registered profile found with ID/Email/Phone: ${loginId}`);
        }

        const recordPassword = data.password || "kala123";
        if (recordPassword !== passwordText) {
          throw new Error("Incorrect password.");
        }

        const user = {
          id: data.id,
          role,
          email: data.contact_email,
          name: data.band_name || data.venue_name || data.company_name || data.name || "User",
          status: data.status,
          username: data.username || loginId,
        };
        localStorage.setItem("bpl_user_onboarded", "true");
        localStorage.setItem("bpl_current_user", JSON.stringify(user));
        return user;
      } catch (err) {
        console.warn(`Supabase login failed for ${role}, using localStorage fallback`, err);
        return this.loginLocalUser(searchVal, passwordText, role);
      }
    } else {
      return this.loginLocalUser(searchVal, passwordText, role);
    }
  },

  loginLocalUser(searchVal: string, passwordText: string, role: string) {
    const key = getStorageKey(role);
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    const record = records.find(
      (r: any) =>
        r.username?.toLowerCase() === searchVal ||
        r.contact_email?.toLowerCase() === searchVal ||
        r.contact_phone?.toLowerCase() === searchVal,
    );
    if (!record) {
      throw new Error(`No registered profile found with ID/Email/Phone: ${searchVal}`);
    }

    const recordPassword = record.password || "kala123";
    if (recordPassword !== passwordText) {
      throw new Error("Incorrect password.");
    }

    const user = {
      id: record.id,
      role,
      email: record.contact_email,
      name: record.band_name || record.venue_name || record.company_name || record.name || "User",
      status: record.status,
      username: record.username || searchVal,
    };
    localStorage.setItem("bpl_user_onboarded", "true");
    localStorage.setItem("bpl_current_user", JSON.stringify(user));
    return user;
  },

  async loginDemoUser(role: string): Promise<any> {
    if (typeof window === "undefined") return null;
    const key = getStorageKey(role);
    let records = [];
    if (!supabase) {
      records = JSON.parse(localStorage.getItem(key) || "[]");
    }
    let record = records[0];
    if (!record) {
      const demoId = "demo-id-" + Math.random().toString(36).substring(2, 9);
      record = {
        id: demoId,
        status: "approved",
        contact_email: "demo@bpl.in",
        contact_name: "Demo Operator",
        contact_phone: "9999999999",
      };
      if (role === "band") {
        record.band_name = "The Demo Band";
        record.genre = "Rock";
        record.home_city = "Mumbai";
        record.bio = "A showcase rock band from BPL.";
        record.members = [{ name: "Demo Lead", role: "Vocalist" }];
      } else if (role === "venue") {
        record.venue_name = "The Demo Lounge";
        record.address = "123 Bandra, Mumbai";
        record.capacity = "100-300";
        record.facilities = { parking: true, lighting: true, sound: true };
      } else {
        record.company_name = "Demo Ventures";
        record.company_profile = "A BPL league backer.";
      }
      if (!supabase) {
        records.push(record);
        localStorage.setItem(key, JSON.stringify(records));
      }
    }
    const user = {
      id: record.id,
      role,
      email: record.contact_email || "demo@bpl.in",
      name:
        record.band_name || record.venue_name || record.company_name || record.name || "Demo User",
      status: record.status || "approved",
    };
    localStorage.setItem("bpl_user_onboarded", "true");
    localStorage.setItem("bpl_current_user", JSON.stringify(user));
    return user;
  },

  logoutUser() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bpl_current_user");
      localStorage.removeItem("bpl_current_account");
      localStorage.removeItem("bpl_user_onboarded");
      sessionStorage.removeItem("bpl_admin_auth");
    }
  },

  getCurrentAccount(): UserAccount | null {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem("bpl_current_account");
    return session ? JSON.parse(session) : null;
  },

  async registerAccount(email: string, phone?: string, password?: string): Promise<UserAccount> {
    if (typeof window === "undefined") throw new Error("Browser environment required");
    
    const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]");
    const exists = accounts.some((a: any) => a.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("An account with this email already exists.");
    }
    
    const newAccount: UserAccount = {
      id: "acc_" + Math.random().toString(36).substring(2, 11),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      password,
      workspaces: [],
      onboarded: false,
      createdAt: new Date().toISOString(),
    };
    
    accounts.push(newAccount);
    localStorage.setItem("bpl_accounts", JSON.stringify(accounts));
    localStorage.setItem("bpl_current_account", JSON.stringify(newAccount));
    return newAccount;
  },

  async loginAccount(loginId: string, passwordText?: string): Promise<UserAccount> {
    if (typeof window === "undefined") throw new Error("Browser environment required");
    
    const searchVal = loginId.trim().toLowerCase();
    
    const adminUser = (import.meta.env.VITE_ADMIN_USER as string) || "bploperator";
    const adminPass = (import.meta.env.VITE_ADMIN_PASS as string) || "bpladmin";
    if (searchVal === adminUser.toLowerCase() && passwordText === adminPass) {
      const operatorAccount: UserAccount = {
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
      
      sessionStorage.setItem("bpl_admin_auth", "true");
      localStorage.setItem("bpl_current_account", JSON.stringify(operatorAccount));
      localStorage.setItem("bpl_user_onboarded", "true");
      return operatorAccount;
    }
    
    const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]") as UserAccount[];
    const account = accounts.find(
      (a) => a.email.toLowerCase() === searchVal || (a.phone && a.phone === searchVal),
    );
    
    if (!account) {
      throw new Error("No account found with this Email / Phone.");
    }
    
    if (passwordText && account.password && account.password !== passwordText) {
      throw new Error("Incorrect password.");
    }
    
    if (account.workspaces.length > 0 && !account.activeWorkspaceId) {
      account.activeWorkspaceId = account.workspaces[0].id;
    }
    
    localStorage.setItem("bpl_current_account", JSON.stringify(account));
    if (account.onboarded) {
      localStorage.setItem("bpl_user_onboarded", "true");
    }
    
    return account;
  },

  addWorkspaceToAccount(userId: string, role: string, profileId: string, name: string) {
    if (typeof window === "undefined") return;
    
    const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]") as UserAccount[];
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx !== -1) {
      const account = accounts[idx];
      
      if (!account.workspaces.some((w) => w.id === profileId)) {
        account.workspaces.push({
          id: profileId,
          role,
          name,
          status: "approved",
        });
      }
      
      account.activeWorkspaceId = profileId;
      account.onboarded = true;
      
      accounts[idx] = account;
      localStorage.setItem("bpl_accounts", JSON.stringify(accounts));
      localStorage.setItem("bpl_current_account", JSON.stringify(account));
      localStorage.setItem("bpl_user_onboarded", "true");
    }
  },

  switchWorkspace(workspaceId: string) {
    if (typeof window === "undefined") return;
    
    const current = localStorage.getItem("bpl_current_account");
    if (current) {
      const account = JSON.parse(current) as UserAccount;
      if (account.workspaces.some((w) => w.id === workspaceId) || workspaceId === "work_operator") {
        account.activeWorkspaceId = workspaceId;
        
        localStorage.setItem("bpl_current_account", JSON.stringify(account));
        
        if (account.id !== "acc_operator") {
          const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]") as UserAccount[];
          const idx = accounts.findIndex((a) => a.id === account.id);
          if (idx !== -1) {
            accounts[idx].activeWorkspaceId = workspaceId;
            localStorage.setItem("bpl_accounts", JSON.stringify(accounts));
          }
        }
      }
    }
  },

  getMessages(workspaceId: string): Message[] {
    if (typeof window === "undefined") return [];
    const allMessages = JSON.parse(localStorage.getItem("bpl_messages") || "[]") as Message[];
    return allMessages.filter((m) => m.fromId === workspaceId || m.toId === workspaceId);
  },
  
  sendMessage(fromId: string, toId: string, text: string): Message {
    if (typeof window === "undefined") throw new Error("Browser environment required");
    
    const allMessages = JSON.parse(localStorage.getItem("bpl_messages") || "[]") as Message[];
    const newMessage: Message = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      fromId,
      toId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    
    allMessages.push(newMessage);
    localStorage.setItem("bpl_messages", JSON.stringify(allMessages));
    return newMessage;
  },

  getNotifications(): Notification[] {
    if (typeof window === "undefined") return [];
    const currentAccount = localStorage.getItem("bpl_current_account");
    if (!currentAccount) return [];
    const account = JSON.parse(currentAccount) as UserAccount;
    
    const allNotifications = JSON.parse(localStorage.getItem("bpl_notifications") || "[]") as Notification[];
    return allNotifications.filter((n) => n.userId === account.id);
  },
  
  addNotification(title: string, body: string, type?: string) {
    if (typeof window === "undefined") return;
    const currentAccount = localStorage.getItem("bpl_current_account");
    if (!currentAccount) return;
    const account = JSON.parse(currentAccount) as UserAccount;
    
    const allNotifications = JSON.parse(localStorage.getItem("bpl_notifications") || "[]") as Notification[];
    const newNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substring(2, 11),
      userId: account.id,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };
    
    allNotifications.unshift(newNotif);
    localStorage.setItem("bpl_notifications", JSON.stringify(allNotifications));
  },
  
  markNotificationsAsRead() {
    if (typeof window === "undefined") return;
    const currentAccount = localStorage.getItem("bpl_current_account");
    if (!currentAccount) return;
    const account = JSON.parse(currentAccount) as UserAccount;
    
    const allNotifications = JSON.parse(localStorage.getItem("bpl_notifications") || "[]") as Notification[];
    allNotifications.forEach((n) => {
      if (n.userId === account.id) {
        n.read = true;
      }
    });
    localStorage.setItem("bpl_notifications", JSON.stringify(allNotifications));
  },


  async updateProfile(role: string, id: string, updatedFields: any): Promise<void> {
    if (supabase) {
      const tableName = getTableName(role);
      const { error } = await supabase.from(tableName).update(updatedFields).eq("id", id);
      if (error) throw error;
    } else {
      const key = getStorageKey(role);
      const records = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = records.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...updatedFields };
        localStorage.setItem(key, JSON.stringify(records));
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === id) {
          currentUser.name =
            updatedFields.band_name ||
            updatedFields.venue_name ||
            updatedFields.company_name ||
            updatedFields.name ||
            currentUser.name;
          localStorage.setItem("bpl_current_user", JSON.stringify(currentUser));
        }
      } else {
        throw new Error("Profile record not found.");
      }
    }
  },

  async updatePassword(
    role: string,
    id: string,
    currentPasswordText: string,
    newPasswordText: string,
  ): Promise<void> {
    if (supabase) {
      try {
        const tableName = getTableName(role);
        const { data, error: fetchErr } = await supabase
          .from(tableName)
          .select("password")
          .eq("id", id)
          .maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!data) throw new Error("Profile record not found.");

        const activePassword = data.password || "kala123";
        if (activePassword !== currentPasswordText) {
          throw new Error("Current password does not match.");
        }

        const { error: updateErr } = await supabase
          .from(tableName)
          .update({ password: newPasswordText })
          .eq("id", id);
        if (updateErr) throw updateErr;
      } catch (err) {
        console.warn(`Supabase updatePassword failed, using localStorage fallback`, err);
        this.updateLocalPassword(role, id, currentPasswordText, newPasswordText);
      }
    } else {
      this.updateLocalPassword(role, id, currentPasswordText, newPasswordText);
    }
  },

  updateLocalPassword(
    role: string,
    id: string,
    currentPasswordText: string,
    newPasswordText: string,
  ) {
    const key = getStorageKey(role);
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = records.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new Error("Profile record not found.");

    const activePassword = records[idx].password || "kala123";
    if (activePassword !== currentPasswordText) {
      throw new Error("Current password does not match.");
    }

    records[idx].password = newPasswordText;
    localStorage.setItem(key, JSON.stringify(records));
  },

  searchArtists(query: string): any[] {
    if (typeof window === "undefined") return [];
    const artists = JSON.parse(localStorage.getItem("bpl_artist_applications") || "[]");
    const searchVal = query.trim().toLowerCase();
    if (!searchVal) return [];
    return artists.filter((a: any) => 
      (a.name && a.name.toLowerCase().includes(searchVal)) ||
      (a.username && a.username.toLowerCase().includes(searchVal)) ||
      (a.contact_email && a.contact_email.toLowerCase().includes(searchVal)) ||
      (a.contact_phone && a.contact_phone.includes(searchVal))
    );
  },

  sendBandInvitation(bandId: string, artistId: string, position: string) {
    if (typeof window === "undefined") return;
    const invites = JSON.parse(localStorage.getItem("bpl_band_invitations") || "[]");
    
    const bands = JSON.parse(localStorage.getItem("bpl_band_applications") || "[]");
    const artists = JSON.parse(localStorage.getItem("bpl_artist_applications") || "[]");
    const band = bands.find((b: any) => b.id === bandId);
    const artist = artists.find((a: any) => a.id === artistId);
    if (!band || !artist) throw new Error("Band or Artist not found.");

    if (invites.some((i: any) => i.bandId === bandId && i.artistId === artistId && i.status === "pending")) {
      throw new Error("An invitation is already pending for this artist.");
    }

    const newInvite: BandInvitation = {
      id: "inv_" + Math.random().toString(36).substring(2, 11),
      bandId,
      bandName: band.band_name || band.name,
      artistId,
      artistName: artist.name || artist.band_name,
      position,
      status: "pending",
      timestamp: new Date().toISOString()
    };

    invites.push(newInvite);
    localStorage.setItem("bpl_band_invitations", JSON.stringify(invites));

    const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]");
    const artistAccount = accounts.find((a: any) => a.email.toLowerCase() === artist.contact_email.toLowerCase());
    if (artistAccount) {
      const allNotifs = JSON.parse(localStorage.getItem("bpl_notifications") || "[]");
      const newNotif = {
        id: "notif_" + Math.random().toString(36).substring(2, 11),
        userId: artistAccount.id,
        title: "Band Invitation",
        body: `${band.band_name} invited you to join as ${position}.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "invite"
      };
      allNotifs.unshift(newNotif);
      localStorage.setItem("bpl_notifications", JSON.stringify(allNotifs));
    }
  },

  respondToInvitation(inviteId: string, accept: boolean) {
    if (typeof window === "undefined") return;
    const invites = JSON.parse(localStorage.getItem("bpl_band_invitations") || "[]");
    const idx = invites.findIndex((i: any) => i.id === inviteId);
    if (idx === -1) return;

    const invite = invites[idx];
    invite.status = accept ? "accepted" : "declined";
    invites[idx] = invite;
    localStorage.setItem("bpl_band_invitations", JSON.stringify(invites));

    if (accept) {
      const bands = JSON.parse(localStorage.getItem("bpl_band_applications") || "[]");
      const bIdx = bands.findIndex((b: any) => b.id === invite.bandId);
      if (bIdx !== -1) {
        const band = bands[bIdx];
        if (!band.members) band.members = [];
        
        if (!band.members.some((m: any) => m.artistId === invite.artistId)) {
          const artists = JSON.parse(localStorage.getItem("bpl_artist_applications") || "[]");
          const artist = artists.find((a: any) => a.id === invite.artistId);
          
          band.members.push({
            artistId: invite.artistId,
            name: invite.artistName,
            username: artist?.username || invite.artistId,
            position: invite.position
          });
        }
        bands[bIdx] = band;
        localStorage.setItem("bpl_band_applications", JSON.stringify(bands));

        const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]");
        const artists = JSON.parse(localStorage.getItem("bpl_artist_applications") || "[]");
        const artist = artists.find((a: any) => a.id === invite.artistId);
        if (artist) {
          const userAccIdx = accounts.findIndex((a: any) => a.email.toLowerCase() === artist.contact_email.toLowerCase());
          if (userAccIdx !== -1) {
            const account = accounts[userAccIdx];
            if (!account.workspaces.some((w: any) => w.id === invite.bandId)) {
              account.workspaces.push({
                id: invite.bandId,
                role: "band_member",
                name: invite.bandName,
                status: "approved"
              });
              accounts[userAccIdx] = account;
              localStorage.setItem("bpl_accounts", JSON.stringify(accounts));
              
              const curr = localStorage.getItem("bpl_current_account");
              if (curr) {
                const currAcc = JSON.parse(curr);
                if (currAcc.id === account.id) {
                  localStorage.setItem("bpl_current_account", JSON.stringify(account));
                }
              }
            }
          }
        }
      }
    }
  },

  removeBandMember(bandId: string, artistId: string) {
    if (typeof window === "undefined") return;
    const bands = JSON.parse(localStorage.getItem("bpl_band_applications") || "[]");
    const bIdx = bands.findIndex((b: any) => b.id === bandId);
    if (bIdx !== -1) {
      const band = bands[bIdx];
      if (band.members) {
        band.members = band.members.filter((m: any) => m.artistId !== artistId);
      }
      bands[bIdx] = band;
      localStorage.setItem("bpl_band_applications", JSON.stringify(bands));
    }

    const artists = JSON.parse(localStorage.getItem("bpl_artist_applications") || "[]");
    const artist = artists.find((a: any) => a.id === artistId);
    if (artist) {
      const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]");
      const uIdx = accounts.findIndex((a: any) => a.email.toLowerCase() === artist.contact_email.toLowerCase());
      if (uIdx !== -1) {
        const account = accounts[uIdx];
        account.workspaces = account.workspaces.filter((w: any) => w.id !== bandId);
        
        if (account.activeWorkspaceId === bandId) {
          const artistWorkspace = account.workspaces.find((w: any) => w.role === "artist");
          account.activeWorkspaceId = artistWorkspace ? artistWorkspace.id : undefined;
        }

        accounts[uIdx] = account;
        localStorage.setItem("bpl_accounts", JSON.stringify(accounts));

        const curr = localStorage.getItem("bpl_current_account");
        if (curr) {
          const currAcc = JSON.parse(curr);
          if (currAcc.id === account.id) {
            localStorage.setItem("bpl_current_account", JSON.stringify(account));
          }
        }
      }
    }
  },

  updateMemberPosition(bandId: string, artistId: string, position: string) {
    if (typeof window === "undefined") return;
    const bands = JSON.parse(localStorage.getItem("bpl_band_applications") || "[]");
    const bIdx = bands.findIndex((b: any) => b.id === bandId);
    if (bIdx !== -1) {
      const band = bands[bIdx];
      if (band.members) {
        const mIdx = band.members.findIndex((m: any) => m.artistId === artistId);
        if (mIdx !== -1) {
          band.members[mIdx].position = position;
        }
      }
      bands[bIdx] = band;
      localStorage.setItem("bpl_band_applications", JSON.stringify(bands));
    }
  },

  getArtistBands(artistId: string): any[] {
    if (typeof window === "undefined") return [];
    const bands = JSON.parse(localStorage.getItem("bpl_band_applications") || "[]");
    return bands.filter((b: any) => 
      b.members && b.members.some((m: any) => m.artistId === artistId)
    );
  },

  getPendingInvitations(artistId: string): any[] {
    if (typeof window === "undefined") return [];
    const invites = JSON.parse(localStorage.getItem("bpl_band_invitations") || "[]");
    return invites.filter((i: any) => i.artistId === artistId && i.status === "pending");
  },

  /**
   * Links a Supabase-authenticated user (OAuth or magic-link) to the
   * localStorage account system. Finds an existing account by email, or
   * creates a fresh one. Sets it as the active session account.
   */
  linkSupabaseUserToAccount(email: string, name: string, supabaseUserId: string): UserAccount {
    if (typeof window === "undefined") {
      return {
        id: supabaseUserId,
        email,
        workspaces: [],
        onboarded: false,
        createdAt: new Date().toISOString(),
      };
    }

    const accounts = JSON.parse(localStorage.getItem("bpl_accounts") || "[]") as UserAccount[];
    let account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() || (a as any).supabaseId === supabaseUserId,
    );

    if (!account) {
      // First time this Supabase user logs in — create account entry
      account = {
        id: "acc_" + supabaseUserId.replace(/-/g, "").substring(0, 12),
        email: email.trim().toLowerCase(),
        workspaces: [],
        onboarded: false,
        createdAt: new Date().toISOString(),
      };
      (account as any).supabaseId = supabaseUserId;
      (account as any).displayName = name;
      accounts.push(account);
      localStorage.setItem("bpl_accounts", JSON.stringify(accounts));
    } else {
      // Update supabaseId if it changed (e.g. email match without ID)
      if (!(account as any).supabaseId) {
        (account as any).supabaseId = supabaseUserId;
        (account as any).displayName = name;
        const idx = accounts.findIndex((a) => a.id === account!.id);
        if (idx !== -1) {
          accounts[idx] = account;
          localStorage.setItem("bpl_accounts", JSON.stringify(accounts));
        }
      }
      // Auto-select first workspace if none active
      if (!account.activeWorkspaceId && account.workspaces.length > 0) {
        account.activeWorkspaceId = account.workspaces[0].id;
      }
    }

    // Set as current active account in session
    localStorage.setItem("bpl_current_account", JSON.stringify(account));
    if (account.onboarded) {
      localStorage.setItem("bpl_user_onboarded", "true");
    }

    return account;
  },
};
