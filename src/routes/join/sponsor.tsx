import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronLeft, CheckCircle, User, Phone, Mail, AlertCircle, Megaphone } from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/join/sponsor")({
  head: () => ({
    meta: [
      { title: "Sponsor Events — Kalakshetra" },
      {
        name: "description",
        content: "Sponsor events, venues, stages, or streams in Kalakshetra.",
      },
    ],
  }),
  component: SponsorOnboardingPage,
});

function SponsorOnboardingPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password?: string } | null>(
    null,
  );

  // State
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");
  const [audience, setAudience] = useState("");
  const [cities, setCities] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors: Record<string, string> = {};

    if (!companyName.trim()) stepErrors.companyName = "Company name is required.";
    if (!contactName.trim()) stepErrors.contactName = "Contact name is required.";
    if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
    if (!contactEmail.trim()) stepErrors.contactEmail = "Email is required.";

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitApplication("sponsor", {
        company_name: companyName,
        industry: industry || undefined,
        budget_range: budget || undefined,
        campaign_goals: goals || undefined,
        preferred_audience: audience || undefined,
        preferred_cities: cities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
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
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Proposal Received!</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Thank you for your interest in sponsoring Kalakshetra. Our sponsorship board will
                connect with you soon.
              </p>
            </div>
            {credentials && (
              <div className="max-w-md mx-auto bpl-card p-6 bg-primary/5 border border-primary/20 rounded-lg text-left space-y-4 my-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary-glow font-display">
                    Account Created Successfully
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Please save these login details. You will need them to access your dashboard and
                    update your profile.
                  </p>
                </div>
                <div className="space-y-2 bg-black/40 p-4 rounded border border-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
                      Username/ID:
                    </span>
                    <span className="font-mono text-white select-all font-bold">
                      {credentials.username}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
                      Password:
                    </span>
                    <span className="font-mono text-white select-all font-bold">
                      {credentials.password}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Username: ${credentials.username}\nPassword: ${credentials.password}`,
                    );
                    alert("Credentials copied to clipboard!");
                  }}
                  className="w-full py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-[11px] font-bold text-white uppercase tracking-wider transition"
                >
                  Copy Credentials
                </button>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/"
                className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">
                Kalakshetra Onboarding Hub
              </p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                Sponsorship Application
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Promote your brand across league match broadcasts, regional tours, and university
                campuses.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow flex items-center gap-1.5 font-bold">
                  <Megaphone size={18} /> Brand Sponsorship Proposal
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Company / Brand Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PepsiCo India"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-xs">{errors.companyName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Industry / Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beverages, FinTech"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Sponsorship Budget Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rs. 5L - 10L"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Preferred Campaign Cities (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, Mumbai"
                      value={cities}
                      onChange={(e) => setCities(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Sponsorship & Campaign Goals
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what your brand seeks to accomplish (brand awareness, student reach, offline activation)..."
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Target Audience Demographics
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. College students 18-25, indie music fans"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>
              </div>

              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">
                  Contact Details (Private)
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                    <User size={12} /> Contact Person Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-xs">{errors.contactName}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Phone size={12} /> Contact Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.contactPhone && (
                      <p className="text-red-500 text-xs">{errors.contactPhone}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Mail size={12} /> Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. partnerships@brand.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.contactEmail && (
                      <p className="text-red-500 text-xs">{errors.contactEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-950/40 border border-red-900 rounded-md text-red-400 text-xs">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Link
                  to="/join"
                  className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 text-white"
                >
                  <ChevronLeft size={16} /> Hub
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary btn-primary-hover px-8 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageShell>
  );
}
