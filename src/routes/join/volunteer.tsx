import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  ChevronLeft,
  CheckCircle,
  User,
  Phone,
  Mail,
  AlertCircle,
  Camera,
  Sparkles,
  Upload,
} from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/join/volunteer")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      role: (search.role as string) || "volunteer",
    };
  },
  component: VolunteerPage,
});

const ROLE_LABELS: Record<string, string> = {
  volunteer: "Ambassador / Volunteer",
  producer: "Music Producer",
  videographer: "Videographer",
  photographer: "Photographer",
  podcast: "Podcast Partner",
  college: "College Partner",
};

function VolunteerPage() {
  const { role } = Route.useSearch();
  const roleLabel = ROLE_LABELS[role] || "Volunteer / Creative Partner";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password?: string } | null>(
    null,
  );

  // State
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState("");
  const [photo, setPhoto] = useState("");

  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount (Autosave)
  useEffect(() => {
    const draft = localStorage.getItem(`bpl_draft_volunteer_${role}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.name) setName(parsed.name);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.city) setCity(parsed.city);
        if (parsed.availability) setAvailability(parsed.availability);
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.interests) setInterests(parsed.interests);
        if (parsed.photo) setPhoto(parsed.photo);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
      } catch (e) {
        console.warn("Failed to load draft", e);
      }
    }
  }, [role]);

  // Autosave
  useEffect(() => {
    if (isSubmitted) return;
    const saveDraft = () => {
      const stateObj = {
        name,
        skills,
        city,
        availability,
        experience,
        interests,
        photo,
        contactPhone,
        contactEmail,
      };
      localStorage.setItem(`bpl_draft_volunteer_${role}`, JSON.stringify(stateObj));
    };
    saveDraft();
  }, [
    name,
    skills,
    city,
    availability,
    experience,
    interests,
    photo,
    contactPhone,
    contactEmail,
    isSubmitted,
    role,
  ]);

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

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const b64 = await handleImageFile(file);
        setPhoto(b64);
        setErrors((prev) => ({ ...prev, photo: "" }));
      } catch (err) {
        const error = err as Error;
        setErrors((prev) => ({ ...prev, photo: error.message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors: Record<string, string> = {};

    if (!name.trim()) stepErrors.name = "Full name is required.";
    if (!city.trim()) stepErrors.city = "Home city is required.";
    if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
    if (!contactEmail.trim()) stepErrors.contactEmail = "Email is required.";

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitApplication("volunteer", {
        name,
        role_type: role,
        skills: skills || undefined,
        city,
        availability: availability || undefined,
        experience: experience || undefined,
        interests: interests || undefined,
        photo: photo || undefined,
        contact_phone: contactPhone,
        contact_email: contactEmail,
      });

      if (result) {
        setCredentials({ username: result.username, password: result.password });
      }

      localStorage.removeItem(`bpl_draft_volunteer_${role}`);
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
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Application Logged!</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Thank you for applying as a {roleLabel}. Our recruitment and curation coordinators
                will connect with you via email soon.
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
                to="/join"
                className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold"
              >
                Back to Hub
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
                Apply as a {roleLabel}
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Fill out the application. Your progress is autosaved.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Card */}
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow flex items-center gap-1.5 font-bold">
                  <Sparkles size={18} /> Partner Profile
                </h2>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-800 border border-border flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {photo ? (
                      <img src={photo} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User size={24} className="text-muted-foreground" />
                    )}
                    <button
                      type="button"
                      onClick={() => photoRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold"
                    >
                      PHOTO
                    </button>
                    <input
                      type="file"
                      ref={photoRef}
                      accept="image/*"
                      onChange={onPhotoChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">{name || "Your Name"}</h3>
                    <p className="text-xs text-muted-foreground">Profile Avatar / Headshot</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                    {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Skills / Specialties
                    </label>
                    <input
                      type="text"
                      placeholder={
                        role === "producer"
                          ? "e.g. Mixing, Logic Pro, Mastering"
                          : "e.g. Photography, Lightroom, Social"
                      }
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Weekly Availability
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Weekends only, 10 hours/week"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Experience Details / Portfolio Links
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe past gigs, link to Behance/SoundCloud/Instagram, or mention student clubs..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Why do you want to join Kalakshetra?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell us what excites you about the franchise music league..."
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="bpl-card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">
                  Contact Details (Private)
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Phone size={12} /> Phone Number *
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
                      placeholder="e.g. rahul@gmail.com"
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
