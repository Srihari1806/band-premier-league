import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import { db } from "@/lib/db";
import { 
  Lock, 
  Mail, 
  Phone, 
  Chrome, 
  Instagram, 
  Facebook, 
  ArrowRight, 
  AlertCircle, 
  Music, 
  Building2, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Band Premier League" },
      { name: "description", content: "Access your BPL dashboard. Manage your music catalog, update availability, and track curation stages." },
    ],
  }),
  component: LoginPage,
});

type LoginRole = "band" | "venue" | "production_house" | "sponsor" | "operator";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<LoginRole>("band");
  
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
      if (role === "operator") {
        if (email.trim() === "bplcreator" && password === "bpladmin") {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("bpl_admin_auth", "true");
            localStorage.setItem("bpl_user_onboarded", "true");
          }
          navigate({ to: "/admin/applications" });
          return;
        } else {
          throw new Error("Invalid operator credentials.");
        }
      }

      const inputVal = authMethod === "email" ? email : phone;
      if (!inputVal.trim()) {
        throw new Error(`Please enter your registered ${authMethod === "email" ? "email address" : "phone number"}`);
      }

      // Check registration
      await db.loginUser(inputVal, role);
      
      // Redirect
      navigate({ to: "/dashboard" });
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (role === "operator") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("bpl_admin_auth", "true");
          localStorage.setItem("bpl_user_onboarded", "true");
        }
        navigate({ to: "/admin/applications" });
        return;
      }

      await db.loginDemoUser(role);
      navigate({ to: "/dashboard" });
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
    // Social accounts simulate success by logging in a demo record
    setTimeout(async () => {
      try {
        await db.loginDemoUser(role);
        navigate({ to: "/dashboard" });
      } catch (err) {
        const errorObj = err as Error;
        setError(errorObj.message || `${platformName} connection failed.`);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <PageShell>
      <div className="min-h-[85vh] flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-primary-glow/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
          
          <div className="text-center space-y-2">
            <Link to="/join" className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary-glow transition mb-2">
              <ArrowLeft size={10} /> Back to Join Hub
            </Link>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              BPL Member Portal
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Select your league profile role to manage your details.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="bpl-card p-1 flex justify-between gap-1 overflow-x-auto text-[10px] uppercase font-bold tracking-wider">
            {(["band", "venue", "production_house", "operator"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setError("");
                  if (r === "operator") {
                    setAuthMethod("email");
                  }
                }}
                className={`flex-1 py-2 px-2.5 rounded-md text-center transition cursor-pointer whitespace-nowrap ${
                  role === r
                    ? "bg-primary text-primary-foreground font-bold shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "production_house" ? "Label" : r}
              </button>
            ))}
          </div>

          <div className="bpl-card p-8 space-y-6">
            
            {/* Operator info badge */}
            {role === "operator" ? (
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex gap-2.5 text-left text-[11px] text-muted-foreground leading-normal">
                <ShieldCheck size={16} className="text-primary-glow shrink-0 mt-0.5" />
                <p>
                  Organizer login for reviewing curation lists, approving candidates, and managing match fixtures.
                </p>
              </div>
            ) : (
              /* Auth Method Toggle (Only for non-operators) */
              <div className="flex border-b border-border text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMethod("email")}
                  className={`flex-1 pb-2 font-semibold text-center border-b-2 transition ${
                    authMethod === "email" ? "border-primary text-primary-glow" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("phone")}
                  className={`flex-1 pb-2 font-semibold text-center border-b-2 transition ${
                    authMethod === "phone" ? "border-primary text-primary-glow" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("social")}
                  className={`flex-1 pb-2 font-semibold text-center border-b-2 transition ${
                    authMethod === "social" ? "border-primary text-primary-glow" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Social Sign-in
                </button>
              </div>
            )}

            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-xs flex gap-2 text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* FORM VIEW */}
            {authMethod !== "social" || role === "operator" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                {role === "operator" ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Login ID *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-muted-foreground" size={14} />
                      <input
                        type="text"
                        placeholder="Enter admin username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        required
                      />
                    </div>
                  </div>
                ) : authMethod === "email" ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address *</label>
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
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Phone Number *</label>
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
                      <button type="button" className="text-[10px] font-bold text-primary-glow hover:underline">
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
                  className="w-full btn-primary btn-primary-hover py-3 rounded-md text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "Login to Portal"}
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
                  Connect with Google
                </button>
                <button
                  onClick={() => handleSocialMockLogin("Instagram")}
                  disabled={loading}
                  className="w-full border border-border bg-secondary hover:bg-slate-800 text-white rounded-md py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  <Instagram size={16} className="text-pink-400" />
                  Connect with Instagram
                </button>
                <button
                  onClick={() => handleSocialMockLogin("Facebook")}
                  disabled={loading}
                  className="w-full border border-border bg-secondary hover:bg-slate-800 text-white rounded-md py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  <Facebook size={16} className="text-blue-500" />
                  Connect with Facebook
                </button>
              </div>
            )}

            {/* DEMO ACC BYPASS */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute w-full border-t border-border" />
              <span className="relative z-10 px-3 bg-slate-950 text-[10px] text-muted-foreground uppercase font-bold">Curation Test</span>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-primary/10 border border-primary/20 text-primary-glow hover:bg-primary/20 rounded-md py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
            >
              <Sparkles size={14} />
              Quick Demo Bypass ({role === "operator" ? "Operator" : `Review ${role}`})
            </button>

            {role !== "operator" && (
              <p className="text-[10px] text-muted-foreground text-center">
                New to the league?{" "}
                <Link to="/join" className="text-primary-glow font-bold hover:underline">
                  Onboard here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
