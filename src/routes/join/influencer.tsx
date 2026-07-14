import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronLeft, CheckCircle, User, Phone, Mail, AlertCircle, Instagram, Award } from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/join/influencer")({
  head: () => ({
    meta: [
      { title: "Apply as a Kalakshetra Influencer / Partner" },
      { name: "description", content: "Review events, create content, and amplify Kalakshetra noise." },
    ],
  }),
  component: InfluencerOnboardingPage,
});

function InfluencerOnboardingPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password?: string } | null>(null);

  // State
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [category, setCategory] = useState("");
  const [demographics, setDemographics] = useState("");
  const [campaigns, setCampaigns] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors: Record<string, string> = {};

    if (!name.trim()) stepErrors.name = "Full name is required.";
    if (!handle.trim()) stepErrors.handle = "Instagram handle is required.";
    if (!followers.trim()) stepErrors.followers = "Follower count is required.";
    if (!contactName.trim()) stepErrors.contactName = "Contact name is required.";
    if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
    if (!contactEmail.trim()) stepErrors.contactEmail = "Email is required.";

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitApplication("influencer", {
        name,
        instagram_handle: handle,
        follower_count: followers,
        engagement_rate: engagement || undefined,
        category: category || undefined,
        audience_demographics: demographics || undefined,
        past_campaigns: campaigns || undefined,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
      });
      if (result) {
        setCredentials({ username: result.username, password: result.password });
      }
      localStorage.setItem("bpl_user_onboarded", "true");
      setIsSubmitted(true);
    } catch (err) {
      const error = err as Error;
      setErrors({ submit: error.message || "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {isSubmitted ? (
          <div className="bpl-card p-12 text-center space-y-8 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary-glow border border-primary/30">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Application Received!</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Thank you for applying. Our marketing team will review your profile reach and contact you soon.
              </p>
            </div>
            {credentials && (
              <div className="max-w-md mx-auto bpl-card p-6 bg-primary/5 border border-primary/20 rounded-lg text-left space-y-4 my-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary-glow font-display">Account Created Successfully</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Please save these login details. You will need them to access your dashboard and update your profile.</p>
                </div>
                <div className="space-y-2 bg-black/40 p-4 rounded border border-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">Username/ID:</span>
                    <span className="font-mono text-white select-all font-bold">{credentials.username}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">Password:</span>
                    <span className="font-mono text-white select-all font-bold">{credentials.password}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Username: ${credentials.username}\nPassword: ${credentials.password}`);
                    alert("Credentials copied to clipboard!");
                  }}
                  className="w-full py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-[11px] font-bold text-white uppercase tracking-wider transition"
                >
                  Copy Credentials
                </button>
              </div>
            )}

            <div className="pt-2">
              <Link to="/" className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">Kalakshetra Onboarding Hub</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Influencer Onboarding</h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Partner with us to create matchday content, vlog gig tours, and review league matches.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow flex items-center gap-1.5 font-bold">
                  <Award size={18} /> Creator / Influencer Profile
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Creator Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tanmay Bhat"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Instagram size={13} /> Instagram Handle *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. @tanmaybhat"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.handle && <p className="text-red-500 text-xs">{errors.handle}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold font-bold">Follower Count *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50K or 1.2M"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.followers && <p className="text-red-500 text-xs">{errors.followers}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Engagement Rate (%)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4.8%"
                      value={engagement}
                      onChange={(e) => setEngagement(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Category / Niche</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Music vlog, comedy"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Audience Demographics</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 70% India, age range 18-24, major cities"
                    value={demographics}
                    onChange={(e) => setDemographics(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Past Brand Campaigns</label>
                  <textarea 
                    rows={2}
                    placeholder="List brief examples of past sponsors/campaigns you've executed..."
                    value={campaigns}
                    onChange={(e) => setCampaigns(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                  />
                </div>
              </div>

              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Contact Details (Private)</h2>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><User size={12} /> Contact Person Name *</label>
                  <input 
                    type="text" 
                    placeholder="Full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                  {errors.contactName && <p className="text-red-500 text-xs">{errors.contactName}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Phone size={12} /> Contact Phone *</label>
                    <input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.contactPhone && <p className="text-red-500 text-xs">{errors.contactPhone}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Mail size={12} /> Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="e.g. partnerships@creator.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.contactEmail && <p className="text-red-500 text-xs">{errors.contactEmail}</p>}
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-950/40 border border-red-900 rounded-md text-red-400 text-xs">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Link to="/join" className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 text-white">
                  <ChevronLeft size={16} /> Hub
                </Link>
                <button type="submit" disabled={isSubmitting} className="btn-primary btn-primary-hover px-8 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                  {isSubmitting ? "Submitting..." : "Submit Profile"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageShell>
  );
}
