import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import { db } from "@/lib/db";
import {
  Lock,
  Mail,
  Phone,
  Chrome,
  Apple,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Kalakshetra" },
      {
        name: "description",
        content:
          "Access your Kalakshetra account. Manage your music catalog, update availability, and track curation stages.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  // Input fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "social">("email");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const inputVal = authMethod === "email" ? email : phone;
      if (!inputVal.trim()) {
        throw new Error(`Please enter your login email or phone number`);
      }

      // 1. Authenticate the unified account
      let account;
      try {
        // Try logging in
        account = await db.loginAccount(inputVal, password);
      } catch (loginErr: any) {
        // If account not found and it's email format, automatically register them!
        // This simplifies the "first login" flow for any email entered by the user
        if (loginErr.message.includes("No account found") && authMethod === "email" && password) {
          account = await db.registerAccount(inputVal, undefined, password);
        } else {
          throw loginErr;
        }
      }

      // 2. Redirect based on onboarding status
      if (account.id === "acc_operator" || (account.workspaces && account.workspaces.length > 0)) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (asOrganizer: boolean) => {
    setError("");
    setLoading(true);
    try {
      if (asOrganizer) {
        // Operator bypass
        const adminUser = (import.meta.env.VITE_ADMIN_USER as string) || "bploperator";
        const adminPass = (import.meta.env.VITE_ADMIN_PASS as string) || "bpladmin";
        await db.loginAccount(adminUser, adminPass);
        navigate({ to: "/dashboard" });
      } else {
        // Standard user bypass
        try {
          await db.registerAccount("demo@kalakshetra.in", "9999999999", "demo123");
        } catch (e) {
          // Ignore if already registered
        }
        const account = await db.loginAccount("demo@kalakshetra.in", "demo123");
        
        if (account.workspaces && account.workspaces.length > 0) {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/onboarding" });
        }
      }
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMockLogin = async (platformName: string) => {
    setError("");
    setLoading(true);
    // Simulate social authentication
    setTimeout(async () => {
      try {
        const mockEmail = `social_${platformName.toLowerCase()}_user@kalakshetra.in`;
        let account;
        try {
          account = await db.loginAccount(mockEmail, "social123");
        } catch (e) {
          account = await db.registerAccount(mockEmail, undefined, "social123");
        }
        
        if (account.workspaces && account.workspaces.length > 0) {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/onboarding" });
        }
      } catch (err) {
        const errorObj = err as Error;
        setError(errorObj.message || `${platformName} connection failed.`);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <PageShell>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[420px] space-y-8 animate-fade-in relative z-10">
          <div className="text-center space-y-2">
            <Link
              to="/join"
              className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary-glow transition mb-2"
            >
              <ArrowLeft size={10} /> Back to Join Hub
            </Link>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Kalakshetra Member Portal
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Enter your credentials to manage your platform workspaces.
            </p>
          </div>

          <div className="bpl-card p-8 space-y-6">
            {/* Auth Method Toggle */}
            <div className="flex border-b border-border text-xs">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 pb-2 font-semibold text-center border-b-2 transition ${
                  authMethod === "email"
                    ? "border-primary text-primary-glow"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 pb-2 font-semibold text-center border-b-2 transition ${
                  authMethod === "phone"
                    ? "border-primary text-primary-glow"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("social")}
                className={`flex-1 pb-2 font-semibold text-center border-b-2 transition ${
                  authMethod === "social"
                    ? "border-primary text-primary-glow"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Social Login
              </button>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2 text-left animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* FORM VIEW */}
            {authMethod !== "social" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                {authMethod === "email" ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-muted-foreground" size={14} />
                      <input
                        type="email"
                        placeholder="e.g. contact@bandname.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-muted-foreground" size={14} />
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {authMethod === "phone" ? "OTP Passcode *" : "Password *"}
                    </label>
                    {authMethod === "phone" && (
                      <button
                        type="button"
                        onClick={() => alert("Verification code sent to: " + phone)}
                        className="text-[10px] font-bold text-primary-glow hover:underline cursor-pointer"
                      >
                        Send OTP
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-muted-foreground" size={14} />
                    <input
                      type="password"
                      placeholder={authMethod === "phone" ? "Enter 6-digit OTP code" : "••••••••"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary btn-primary-hover py-3 rounded-md text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  {loading ? "Authenticating..." : "Continue"}
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              /* SOCIAL SIGN IN */
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialMockLogin("Google")}
                  disabled={loading}
                  className="w-full border border-border bg-secondary hover:bg-slate-800 text-white rounded-md py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  <Chrome size={16} className="text-red-400" />
                  Continue with Google
                </button>
                <button
                  onClick={() => handleSocialMockLogin("Apple")}
                  disabled={loading}
                  className="w-full border border-border bg-secondary hover:bg-slate-800 text-white rounded-md py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  <Apple size={16} className="text-white" />
                  Continue with Apple
                </button>
              </div>
            )}

            {/* DEMO ACC BYPASS */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute w-full border-t border-border" />
              <span className="relative z-10 px-3 bg-slate-950 text-[10px] text-muted-foreground uppercase font-bold">
                Ecosystem Sandbox
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin(false)}
                disabled={loading}
                className="bg-secondary hover:bg-slate-800 border border-border text-white rounded-md py-2.5 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Sparkles size={11} className="text-primary-glow" />
                Demo User
              </button>
              <button
                onClick={() => handleDemoLogin(true)}
                disabled={loading}
                className="bg-secondary hover:bg-slate-800 border border-border text-white rounded-md py-2.5 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <UserCheck size={11} className="text-primary-glow" />
                Organizer (Admin)
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              New to the league?{" "}
              <Link to="/join" className="text-primary-glow font-bold hover:underline">
                Onboard here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
