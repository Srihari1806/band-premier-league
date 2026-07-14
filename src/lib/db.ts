import { createClient } from "@supabase/supabase-js";

export interface BandMember {
  name: string;
  role: string;
  photo?: string; // Base64
  instagram?: string;
  experience?: string;
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
  mission?: string;
  influences?: string;
  musical_style?: string;
  achievements?: string;
  performance_photos?: string[]; // Array of Base64
  members?: BandMember[];
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
      status: "pending",
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
      localStorage.removeItem("bpl_user_onboarded");
    }
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
};
