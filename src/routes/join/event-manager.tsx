import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronLeft, CheckCircle, User, Phone, Mail, AlertCircle, CalendarRange } from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/join/event-manager")({
  head: () => ({
    meta: [
      { title: "Register as Event Manager partner — Kalakshetra" },
      { name: "description", content: "Apply to manage on-site gig logistics, security, and match setup." },
    ],
  }),
  component: EventManagerPage,
});

function EventManagerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State
  const [companyName, setCompanyName] = useState("");
  const [cities, setCities] = useState("");
  const [pastEvents, setPastEvents] = useState("");
  const [teamSize, setTeamSize] = useState("");
  
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors: Record<string, string> = {};

    if (!companyName.trim()) stepErrors.companyName = "Company/Individual name is required.";
    if (!contactName.trim()) stepErrors.contactName = "Contact name is required.";
    if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
    if (!contactEmail.trim()) stepErrors.contactEmail = "Email is required.";

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await db.submitApplication("event_manager", {
        company_name: companyName,
        cities: cities.split(",").map(c => c.trim()).filter(Boolean),
        past_events: pastEvents || undefined,
        team_size: teamSize || undefined,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
      });

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
              <p className="text-sm text-muted-foreground">
                Thank you for applying. Kalakshetra Operations coordinators will review your execution experience.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/join" className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold">
                Back to Hub
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">Kalakshetra Onboarding Hub</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Event Manager Partner</h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Apply to manage on-site logistics, ticketing setups, security operations, and stage production.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Card */}
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow flex items-center gap-1.5 font-bold">
                  <CalendarRange size={18} /> Company / Agency Profile
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Company / Individual Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apex Event Solutions"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Operational Cities (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pune, Mumbai"
                      value={cities}
                      onChange={(e) => setCities(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Core Team Size</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15 core members, 50 volunteers"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Past Events Handled</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide names or scale of gigs/festivals managed (e.g. NH7 Pune gate management, college fests)..."
                    value={pastEvents}
                    onChange={(e) => setPastEvents(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                  />
                </div>
              </div>

              {/* Contacts */}
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
                      placeholder="e.g. operations@apex.com"
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
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </PageShell>
  );
}
