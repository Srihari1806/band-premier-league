import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { signInWithGoogle, signInWithOTP, signUpWithEmail, signInWithEmail } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Lock,
  Mail,
  Phone,
  Apple,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Music,
  User,
  Eye,
  EyeOff,
  Zap,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Kalakshetra" },
      { name: "description", content: "Access your Kalakshetra workspace. Sign in or create your account to join India's independent music ecosystem." },
    ],
  }),
  component: LoginPage,
});

type AuthMode = "signin" | "signup";
type AuthMethod = "email" | "magic" | "phone";

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isSupabaseConfigured } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<AuthMethod>("email");

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already authenticated, redirect
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

  const resetForm = () => {
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  // --- Google OAuth ---
  const handleGoogleAuth = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      if (isSupabaseConfigured) {
        await signInWithGoogle();
        // Redirect happens externally — browser navigates to Google
      } else {
        // Fallback: localStorage mock
        const mockEmail = "google_user@kalakshetra.in";
        let account;
        try {
          account = await db.loginAccount(mockEmail, "social123");
        } catch {
          account = await db.registerAccount(mockEmail, undefined, "social123");
        }
        if (account.workspaces?.length > 0) navigate({ to: "/dashboard" });
        else navigate({ to: "/onboarding" });
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  // --- Email + Password ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.trim()) throw new Error("Please enter your email address.");

      if (isSupabaseConfigured) {
        if (mode === "signup") {
          if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");
          if (password !== confirmPassword) throw new Error("Passwords do not match.");
          await signUpWithEmail(email, password, fullName);
          setSuccess("Account created! Check your inbox for a verification link, then sign in.");
          setMode("signin");
        } else {
          if (!password) throw new Error("Please enter your password.");
          const { session } = await signInWithEmail(email, password);
          if (session) {
            const account = db.linkSupabaseUserToAccount(
              session.user.email || email,
              session.user.user_metadata?.full_name || email.split("@")[0],
              session.user.id
            );
            if (account.workspaces?.length > 0) navigate({ to: "/dashboard" });
            else navigate({ to: "/onboarding" });
          }
        }
      } else {
        // localStorage fallback
        if (mode === "signup") {
          if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");
          if (password !== confirmPassword) throw new Error("Passwords do not match.");
          const account = await db.registerAccount(email, undefined, password);
          localStorage.setItem("bpl_current_account", JSON.stringify(account));
          navigate({ to: "/onboarding" });
        } else {
          let account;
          try {
            account = await db.loginAccount(email, password);
          } catch (loginErr: any) {
            if (loginErr.message?.includes("No account found") && password) {
              account = await db.registerAccount(email, undefined, password);
            } else throw loginErr;
          }
          if (account.workspaces?.length > 0) navigate({ to: "/dashboard" });
          else navigate({ to: "/onboarding" });
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- Magic Link ---
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email.trim()) throw new Error("Please enter your email address.");
      if (isSupabaseConfigured) {
        await signInWithOTP(email);
        setSuccess(`Magic link sent to ${email}. Check your inbox and click the link to sign in.`);
      } else {
        throw new Error("Magic link requires Supabase configuration.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  // --- Demo / Admin bypass ---
  const handleDemoLogin = async (asOrganizer: boolean) => {
    setError("");
    setLoading(true);
    try {
      if (asOrganizer) {
        const adminUser = (import.meta.env.VITE_ADMIN_USER as string) || "bploperator";
        const adminPass = (import.meta.env.VITE_ADMIN_PASS as string) || "bpladmin";
        await db.loginAccount(adminUser, adminPass);
        navigate({ to: "/dashboard" });
      } else {
        try { await db.registerAccount("demo@kalakshetra.in", "9999999999", "demo123"); } catch { /* already exists */ }
        const account = await db.loginAccount("demo@kalakshetra.in", "demo123");
        if (account.workspaces?.length > 0) navigate({ to: "/dashboard" });
        else navigate({ to: "/onboarding" });
      }
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
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
      {/* Glow layers */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/4 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="flex flex-col w-full items-center justify-center px-4 py-16 relative z-10">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 mb-10 group">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Music size={18} className="text-primary-glow" />
          </div>
          <span className="text-lg font-display font-bold text-white tracking-tight">Kalakshetra</span>
        </a>

        <div className="w-full max-w-[420px] space-y-5 animate-fade-in">
          {/* Heading */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              {mode === "signin" ? "Welcome back" : "Join the ecosystem"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "signin"
                ? "Sign in to your Kalakshetra workspace."
                : "Create your account to start your music journey."}
            </p>
          </div>

          {/* Sign In / Sign Up toggle */}
          <div className="flex bg-secondary/60 border border-border rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Main card */}
          <div className="bpl-card p-6 space-y-5">
            {/* Social auth */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-border bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-border/50 bg-white/3 text-muted-foreground text-xs font-semibold cursor-not-allowed opacity-50"
              >
                <Apple size={15} />
                Continue with Apple
                <span className="ml-auto text-[9px] bg-border/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Soon</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-border/60" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 border-t border-border/60" />
            </div>

            {/* Method tabs */}
            <div className="flex gap-1 text-[10px]">
              {(["email", "magic", "phone"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); setError(""); setSuccess(""); }}
                  className={`flex-1 py-1.5 rounded font-bold uppercase tracking-wider transition-all ${
                    method === m
                      ? "bg-primary/15 text-primary-glow border border-primary/30"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {m === "magic" ? "Magic Link" : m === "phone" ? "Phone OTP" : "Email"}
                </button>
              ))}
            </div>

            {/* Alert messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2 text-left">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-md p-3 text-xs flex gap-2 text-left">
                <CheckCircle size={14} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Email / Password form */}
            {method === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {mode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                      <input
                        type="text"
                        placeholder="Your artist / band name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                    <input
                      type="email"
                      placeholder="contact@bandname.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-white"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                      <input
                        type="password"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary btn-primary-hover py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Magic Link form */}
            {method === "magic" && (
              <form onSubmit={handleMagicLink} className="space-y-3.5">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-2 items-start text-xs text-muted-foreground">
                  <Zap size={13} className="text-primary-glow shrink-0 mt-0.5" />
                  <span>Enter your email and we'll send a magic link — no password needed.</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                    <input
                      type="email"
                      placeholder="contact@bandname.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !isSupabaseConfigured}
                  className="w-full btn-primary btn-primary-hover py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send Magic Link <Zap size={13} /></>
                  )}
                </button>
                {!isSupabaseConfigured && (
                  <p className="text-[10px] text-amber-400/80 text-center">Requires Supabase configuration.</p>
                )}
              </form>
            )}

            {/* Phone OTP (placeholder) */}
            {method === "phone" && (
              <div className="space-y-3.5">
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 flex gap-2 items-start text-xs text-amber-400/90">
                  <Phone size={13} className="shrink-0 mt-0.5" />
                  <span>Phone OTP authentication is coming soon. Please use Email or Google for now.</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <button disabled className="w-full py-2.5 rounded-lg text-xs font-bold bg-secondary border border-border text-muted-foreground cursor-not-allowed opacity-50">
                  Send OTP — Coming Soon
                </button>
              </div>
            )}

            {/* Switch mode nudge */}
            <p className="text-[11px] text-muted-foreground text-center">
              {mode === "signin" ? (
                <>
                  New to the league?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="text-primary-glow font-bold hover:underline">
                    Create your account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("signin")} className="text-primary-glow font-bold hover:underline">
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>

          {/* New to League / Onboard CTA */}
          <div className="bpl-card p-4 flex items-center justify-between gap-3 border-primary/20 bg-primary/5">
            <div className="text-xs">
              <p className="font-bold text-white">New to Kalakshetra?</p>
              <p className="text-muted-foreground text-[10px] mt-0.5">Register as Band, Artist, Venue and more.</p>
            </div>
            <Link
              to="/onboarding"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold transition"
            >
              <Sparkles size={11} />
              Onboard Here
            </Link>
          </div>

          {/* Sandbox / Demo */}
          <div className="space-y-2">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-border/40" />
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Ecosystem Sandbox</span>
              <div className="flex-1 border-t border-border/40" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin(false)}
                disabled={loading}
                className="bg-secondary/60 hover:bg-secondary border border-border text-white rounded-md py-2 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Sparkles size={10} className="text-primary-glow" /> Demo User
              </button>
              <button
                onClick={() => handleDemoLogin(true)}
                disabled={loading}
                className="bg-secondary/60 hover:bg-secondary border border-border text-white rounded-md py-2 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <UserCheck size={10} className="text-primary-glow" /> Organizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
