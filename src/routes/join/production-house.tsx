import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { 
  Building, 
  MapPin, 
  ChevronLeft, 
  CheckCircle,
  Camera,
  Upload,
  User,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/join/production-house")({
  head: () => ({
    meta: [
      { title: "Production House Onboarding — Kalakshetra" },
      { name: "description", content: "Apply to become a partner production house in Kalakshetra." },
    ],
  }),
  component: ProductionHousePage,
});

function ProductionHousePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [companyName, setCompanyName] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");
  const [genres, setGenres] = useState("");
  const [investment, setInvestment] = useState("");
  const [pastArtists, setPastArtists] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [cities, setCities] = useState("");
  
  // Contact
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [logoImage, setLogoImage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error("File size must be under 2MB"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const b64 = await handleImageFile(file);
        setLogoImage(b64);
        setErrors((prev) => ({ ...prev, logo: "" }));
      } catch (err) {
        const error = err as Error;
        setErrors((prev) => ({ ...prev, logo: error.message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors: Record<string, string> = {};

    if (!companyName.trim()) stepErrors.companyName = "Company name is required.";
    if (!companyProfile.trim()) stepErrors.companyProfile = "Company profile is required.";
    if (!contactName.trim()) stepErrors.contactName = "Primary contact name is required.";
    if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
    if (!contactEmail.trim()) stepErrors.contactEmail = "Email is required.";

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await db.submitApplication("production_house", {
        company_name: companyName,
        logo_image: logoImage || undefined,
        company_profile: companyProfile,
        genres_of_interest: genres.split(",").map(g => g.trim()).filter(Boolean),
        investment_capacity: investment || undefined,
        past_artists: pastArtists.split(",").map(a => a.trim()).filter(Boolean),
        portfolio_links: portfolio.split(",").map(p => p.trim()).filter(Boolean),
        website_url: website || undefined,
        instagram_url: instagram || undefined,
        cities_of_operation: cities || undefined,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
      });

      localStorage.setItem("bpl_user_onboarded", "true");
      setIsSubmitted(true);
    } catch (err) {
      const error = err as Error;
      console.error(error);
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
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Proposal Submitted!</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Your partnership proposal has been submitted. Our franchise board will review the profile.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Link to="/production-houses" className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold">
                Explore Partners
              </Link>
              <Link to="/" className="px-6 py-3 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">Kalakshetra Onboarding Hub</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Production House Partnership</h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Apply to manage artist rights, sponsor matches, and invest in local artist catalogs.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Card */}
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow font-bold">Company Profile</h2>
                
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded bg-slate-800 border border-border flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {logoImage ? (
                      <img src={logoImage} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Building size={24} className="text-muted-foreground" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => logoRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold"
                    >
                      LOGO
                    </button>
                    <input type="file" ref={logoRef} accept="image/*" onChange={onLogoChange} className="hidden" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">{companyName || "Company Name"}</h3>
                    <p className="text-xs text-muted-foreground">Logotype / Brand Emblem</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Production House / Label Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Red Wolf Records"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                  {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Company Profile / Bio *</label>
                  <textarea 
                    rows={4}
                    placeholder="Summarize your company's focus, achievements, catalogue size..."
                    value={companyProfile}
                    onChange={(e) => setCompanyProfile(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                  />
                  {errors.companyProfile && <p className="text-red-500 text-xs">{errors.companyProfile}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Genres of Interest (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rock, Indie Pop, Metal"
                      value={genres}
                      onChange={(e) => setGenres(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Investment Capacity Range (Annual)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rs. 10L - 25L"
                      value={investment}
                      onChange={(e) => setInvestment(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Past Artists Worked With (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Local Train, Seedhe Maut"
                    value={pastArtists}
                    onChange={(e) => setPastArtists(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Portfolio Links (comma-separated URLs)</label>
                  <input 
                    type="text" 
                    placeholder="https://youtube.com/showreel, https://soundcloud.com/catalog"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Website</label>
                    <input 
                      type="url" 
                      placeholder="https://www.company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Instagram URL</label>
                    <input 
                      type="url" 
                      placeholder="https://instagram.com/company"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cities of Operation</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai, Delhi"
                      value={cities}
                      onChange={(e) => setCities(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Contact Details (Private)</h2>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><User size={12} /> Contact Person Name *</label>
                  <input 
                    type="text" 
                    placeholder="Representative name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                  />
                  {errors.contactName && <p className="text-red-500 text-xs">{errors.contactName}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Phone size={12} /> Phone Number *</label>
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
                      placeholder="e.g. connect@company.com"
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
