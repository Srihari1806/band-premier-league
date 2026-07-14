import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/db";
import {
  signInWithOTP,
  sendSignupOTP,
  verifyEmailOTP,
  upsertProfile,
  getProfile,
  signInWithGoogle
} from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Mail,
  User,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Music,
  Zap,
  ArrowLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up / Sign In — Kalakshetra" },
      {
        name: "description",
        content: "Join India's independent music ecosystem. Sign up or log in to your Kalakshetra account.",
      },
    ],
  }),
  component: UnifiedSignupPage,
});

type TabMode = "signin" | "signup";
type StepMode = "details" | "otp";

function UnifiedSignupPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isSupabaseConfigured } = useAuth();

  // Navigation tabs
  const [tab, setTab] = useState<TabMode>("signin");
  const [step, setStep] = useState<StepMode>("details");

  // Form Fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [otpToken, setOtpToken] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Timer for Resend
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (authLoading) return;
    if (isSupabaseConfigured && session) {
      handleRedirectAfterAuth(session.user.id, session.user.email || "");
    }
  }, [session, authLoading, isSupabaseConfigured]);

  // Resend Timer logic
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  const startCooldown = () => {
    setCooldown(30);
  };

  // Pre-fill / Redirect Helper
  const handleRedirectAfterAuth = async (userId: string, userEmail: string) => {
    try {
      const profile = await getProfile(userId);
      // Link user to local storage db context
      const account = db.linkSupabaseUserToAccount(
        userEmail,
        profile?.full_name || userEmail.split("@")[0],
        userId
      );

      // If user has onboarding completed or has a role / active workspace, send to dashboard
      if (profile?.role || (account.workspaces && account.workspaces.length > 0)) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      console.error("Redirect check failed", err);
      navigate({ to: "/onboarding" });
    }
  };

  // Google OAuth
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      if (isSupabaseConfigured) {
        await signInWithGoogle();
      } else {
        // Mock fallback
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

  // +91 Validation helper
  const validatePhone = (num: string): string => {
    const cleanNum = num.replace(/\s+/g, "");
    if (!cleanNum.startsWith("+91")) {
      throw new Error("Phone number must start with +91 country code.");
    }
    const suffix = cleanNum.substring(3);
    if (!/^\d{10}$/.test(suffix)) {
      throw new Error("Phone number must have exactly 10 digits after +91.");
    }
    return cleanNum;
  };

  // Step 1: Submit email/details to receive OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email.trim()) throw new Error("Please enter your email address.");

      if (!isSupabaseConfigured) {
        // Fallback Mock Logic
        setSuccess(`[Mock] OTP code sent to ${email}. Check your logs!`);
        setStep("otp");
        startCooldown();
        setLoading(false);
        return;
      }

      if (tab === "signup") {
        if (!fullName.trim()) throw new Error("Full name is required.");
        if (!phone.trim()) throw new Error("Phone number is required.");
        if (!city.trim()) throw new Error("City is required.");
        
        // Validate phone
        validatePhone(phone);

        // Call Supabase OTP signup
        await sendSignupOTP(email);
        setSuccess(`Verification code sent to ${email}.`);
        setStep("otp");
        startCooldown();
      } else {
        // Sign In OTP call
        await signInWithOTP(email);
        setSuccess(`Sign-in verification code sent to ${email}.`);
        setStep("otp");
        startCooldown();
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!otpToken || otpToken.length < 6) {
        throw new Error("Please enter the 6-digit verification code.");
      }

      if (!isSupabaseConfigured) {
        // Mock success fallback
        const mockUserId = "mock_user_" + Math.random().toString(36).substr(2, 9);
        const account = db.linkSupabaseUserToAccount(email, fullName || email.split("@")[0], mockUserId);
        navigate({ to: "/onboarding" });
        setLoading(false);
        return;
      }

      const verifyData = await verifyEmailOTP(email, otpToken);
      const user = verifyData.user;

      if (!user) {
        throw new Error("Verification failed. Invalid or expired code.");
      }

      // If they just signed up, create their profiles row
      if (tab === "signup") {
        await upsertProfile(user.id, {
          full_name: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          role: null, // nullable - NOT set at signup
        });
      }

      setSuccess("Account verified successfully!");
      
      // Perform redirect checks
      await handleRedirectAfterAuth(user.id, user.email || email);
    } catch (err: any) {
      setError(err.message || "OTP verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger
  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setSuccess("");
    try {
      if (tab === "signup") {
        await sendSignupOTP(email);
      } else {
        await signInWithOTP(email);
      }
      setSuccess("A new verification code has been sent.");
      startCooldown();
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
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
        <Link to="/" className="flex items-center gap-2 mb-10 group">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Music size={18} className="text-primary-glow" />
          </div>
          <span className="text-lg font-display font-bold text-white tracking-tight">Kalakshetra</span>
        </Link>

        <div className="w-full max-w-[420px] space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              {step === "details" ? (tab === "signin" ? "Welcome back" : "Create your account") : "Verify your email"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {step === "details"
                ? (tab === "signin" ? "Sign in using passwordless Email OTP" : "Join India's creator music ecosystem")
                : `Enter the 6-digit verification code sent to ${email}`}
            </p>
          </div>

          {/* Tab Selector — Only shown on details step */}
          {step === "details" && (
            <div className="flex bg-secondary/60 border border-border rounded-lg p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  tab === "signin"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  tab === "signup"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bpl-card p-6 space-y-5">
            {/* Feedback Alerts */}
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

            {/* STEP 1: Details Entry */}
            {step === "details" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Social Login option */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
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
                </div>

                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 border-t border-border/60" />
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">or email verification</span>
                  <div className="flex-1 border-t border-border/60" />
                </div>

                {/* Signup Fields */}
                {tab === "signup" && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                        <input
                          type="text"
                          placeholder="Your real name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                          required
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">City *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email (Always shown) */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                    <input
                      type="email"
                      placeholder="contact@yourname.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary btn-primary-hover py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {tab === "signup" ? "Get Verification Code" : "Send Sign-in Code"}
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP Verification Form */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">6-digit Verification Code *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={13} />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary tracking-[0.4em] text-center font-bold font-mono transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary btn-primary-hover py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify Code & Login</>
                  )}
                </button>

                {/* Resend and Back Buttons */}
                <div className="flex justify-between items-center text-[10px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setOtpToken("");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-muted-foreground hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft size={10} /> Back to details
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0}
                    className={`font-bold transition ${
                      cooldown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary-glow hover:underline"
                    }`}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Security / Privacy notice */}
          <div className="bpl-card p-4 border-primary/10 bg-primary/3 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-primary-glow shrink-0 mt-0.5" />
            <div className="text-[10px] text-muted-foreground leading-normal">
              Kalakshetra operates passwordless authentication using secure Supabase OTP protocol. We will never share your email, phone, or city publicly until your onboarding role application is submitted and approved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
