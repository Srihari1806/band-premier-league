import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "kala_auth_session",
        },
      })
    : null;

export async function signInWithGoogle() {
  if (!supabase) throw new Error("Supabase not configured – add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env");
  const isLocal = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1");
  const redirectTo = isLocal
    ? `${window.location.origin}/auth/callback`
    : "https://band-premier-league.vercel.app/auth/callback";
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, queryParams: { prompt: "select_account" } },
  });
  if (error) throw error;
}

export async function signInWithOTP(email: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName || "" },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function sendSignupOTP(email: string) {
  if (!supabase) throw new Error("Supabase not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env");
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailOTP(email: string, token: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: "email",
  });
  if (error) throw error;
  return data;
}

export interface ProfileData {
  full_name: string;
  phone?: string;
  city?: string;
  role?: string | null;
}

export async function upsertProfile(userId: string, profile: ProfileData) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    ...profile,
  });
  if (error) throw error;
}

export async function getProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as {
    id: string;
    full_name: string;
    phone: string | null;
    city: string | null;
    role: string | null;
    created_at: string;
  } | null;
}
