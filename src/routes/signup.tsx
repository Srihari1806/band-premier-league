import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { signInWithGoogle, upsertProfile, getProfile } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { Music, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign In — Kalakshetra" },
      {
        name: "description",
        content: "Sign in to Kalakshetra with your Google account.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isSupabaseConfigured } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect already-authenticated users
  useEffect(() => {
    if (authLoading) return;
    if (isSupabaseConfigured && session) {
      const account = db.getCurrentAccount();
      if ((account?.workspaces?.length ?? 0) > 0) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/onboarding" });
      }
    }
  }, [session, authLoading, isSupabaseConfigured, navigate]);

  const handleGoogleSignIn = async () => {
    setError("");
    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
      );
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogle();
      // Browser navigates to Google — control returns via /auth/callback
    } catch (e: any) {
      setError(e.message || "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/4 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="flex flex-col w-full items-center justify-center px-4 py-16 relative z-10">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 mb-10 group">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Music size={18} className="text-primary-glow" />
          </div>
          <span className="text-lg font-display font-bold text-white tracking-tight">
            Kalakshetra
          </span>
        </a>

        <div className="w-full max-w-[380px] space-y-5 animate-fade-in">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              Join the ecosystem
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in or create your free account to join India's independent
              music league.
            </p>
          </div>

          {/* Card */}
          <div className="bpl-card p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2 text-left">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-border bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              By continuing, you agree to Kalakshetra's terms. Your account is
              created automatically on first sign-in.
            </p>
          </div>

          {/* Ecosystem nudge */}
          <div className="bpl-card p-4 border-primary/15 bg-primary/5 space-y-1">
            <p className="text-xs font-semibold text-white">
              New to Kalakshetra?
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              After signing in you'll choose your role — Band, Artist, Venue,
              Production House, and more. Applications are reviewed before you
              go live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
