import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  Instagram,
  Youtube,
  Music,
  Plus,
  Trash,
  Upload,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  ArrowRight,
  Globe,
  Award,
  Sparkles,
  Link2
} from "lucide-react";
import { db } from "@/lib/db";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/join/band")({
  validateSearch: (search: Record<string, unknown>): { type?: string } => {
    return {
      type: (search.type as string) || "band",
    };
  },
  component: BandOnboardingPage,
});

const GENRES = ["Rock", "Indie", "Folk", "Metal", "Pop", "Alternative", "Hip-Hop", "Other"];

const PROFESSIONAL_ROLES = [
  "Singer", "Songwriter", "Lyricist", "Composer", "Music Producer", "DJ", "Rapper", "Beatboxer",
  "Guitarist", "Bass Guitarist", "Keyboardist", "Pianist", "Drummer", "Violinist", "Flautist", "Saxophonist",
  "Percussionist", "Classical Vocalist", "Instrumentalist", "Sound Engineer", "Live Audio Engineer",
  "Mixing Engineer", "Mastering Engineer", "Arranger", "Sound Designer", "Music Director",
  "Music Video Director", "Photographer", "Videographer", "Artist Manager", "Booking Manager", "Tour Manager"
];

function BandOnboardingPage() {
  const navigate = useNavigate();
  const { type } = Route.useSearch();
  const { profile } = useProfile();
  const isArtist = type === "artist";

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Identity States
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [bio, setBio] = useState("");
  
  // Band specific states
  const [genre, setGenre] = useState("Rock");
  const [customGenre, setCustomGenre] = useState("");
  const [formedYear, setFormedYear] = useState("");
  const [originalCovers, setOriginalCovers] = useState("Originals");

  // Artist specific states
  const [artistRoles, setArtistRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  
  // Artist Timeline
  const [timeline, setTimeline] = useState<{ year: number; event: string }[]>([]);
  const [tempYear, setTempYear] = useState("");
  const [tempEvent, setTempEvent] = useState("");

  // Artist Releases
  const [releases, setReleases] = useState<{ title: string; year: string; link?: string }[]>([]);
  const [tempReleaseTitle, setTempReleaseTitle] = useState("");
  const [tempReleaseYear, setTempReleaseYear] = useState("");

  // Common Media States
  const [profileImage, setProfileImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [demoVideo, setDemoVideo] = useState("");

  // Common Links
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [saavnUrl, setSaavnUrl] = useState("");
  const [appleUrl, setAppleUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Common Gig Info
  const [preferredCities, setPreferredCities] = useState("");
  const [feeRange, setFeeRange] = useState("");

  // Common Contact Info
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Error logging
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "profile" | "banner" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === "profile") {
        setProfileImage(base64String);
      } else if (target === "banner") {
        setBannerImage(base64String);
      } else if (target === "gallery") {
        setGallery((prev) => [...prev, base64String]);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const currentAccount = db.getCurrentAccount();
    if (!currentAccount) {
      navigate({ to: "/login" });
      return;
    }
    setContactEmail(currentAccount.email);
  }, [navigate]);

  // Pre-fill contact fields from the Supabase profile (users with no role yet)
  useEffect(() => {
    if (!profile) return;
    if (profile.full_name && !contactName) setContactName(profile.full_name);
    if (profile.phone && !contactPhone) setContactPhone(profile.phone);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem(`bpl_draft_${type}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.homeCity) setHomeCity(parsed.homeCity);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.genre) setGenre(parsed.genre);
        if (parsed.customGenre) setCustomGenre(parsed.customGenre);
        if (parsed.formedYear) setFormedYear(parsed.formedYear);
        if (parsed.originalCovers) setOriginalCovers(parsed.originalCovers);
        if (parsed.artistRoles) setArtistRoles(parsed.artistRoles);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.timeline) setTimeline(parsed.timeline);
        if (parsed.releases) setReleases(parsed.releases);
        if (parsed.profileImage) setProfileImage(parsed.profileImage);
        if (parsed.bannerImage) setBannerImage(parsed.bannerImage);
        if (parsed.gallery) setGallery(parsed.gallery);
        if (parsed.demoVideo) setDemoVideo(parsed.demoVideo);
        if (parsed.instagramUrl) setInstagramUrl(parsed.instagramUrl);
        if (parsed.youtubeUrl) setYoutubeUrl(parsed.youtubeUrl);
        if (parsed.spotifyUrl) setSpotifyUrl(parsed.spotifyUrl);
        if (parsed.saavnUrl) setSaavnUrl(parsed.saavnUrl);
        if (parsed.appleUrl) setAppleUrl(parsed.appleUrl);
        if (parsed.websiteUrl) setWebsiteUrl(parsed.websiteUrl);
        if (parsed.preferredCities) setPreferredCities(parsed.preferredCities);
        if (parsed.feeRange) setFeeRange(parsed.feeRange);
        if (parsed.contactName) setContactName(parsed.contactName);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
      } catch (e) {
        console.warn("Failed to load onboarding draft", e);
      }
    }
  }, [type]);

  // Autosave
  useEffect(() => {
    const data = {
      displayName,
      username,
      homeCity,
      bio,
      genre,
      customGenre,
      formedYear,
      originalCovers,
      artistRoles,
      skills,
      timeline,
      releases,
      profileImage,
      bannerImage,
      gallery,
      demoVideo,
      instagramUrl,
      youtubeUrl,
      spotifyUrl,
      saavnUrl,
      appleUrl,
      websiteUrl,
      preferredCities,
      feeRange,
      contactName,
      contactPhone
    };
    localStorage.setItem(`bpl_draft_${type}`, JSON.stringify(data));
  }, [
    displayName, username, homeCity, bio, genre, customGenre, formedYear, originalCovers,
    artistRoles, skills, timeline, releases, profileImage, bannerImage, gallery, demoVideo,
    instagramUrl, youtubeUrl, spotifyUrl, saavnUrl, appleUrl, websiteUrl, preferredCities,
    feeRange, contactName, contactPhone, type
  ]);

  const validateStep = (currentStep: number) => {
    const stepErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!displayName.trim()) stepErrors.displayName = `${isArtist ? "Artist" : "Band"} name is required.`;
      if (!homeCity.trim()) stepErrors.homeCity = "Home City is required.";
      if (isArtist && !username.trim()) stepErrors.username = "Username is required.";
    }
    if (currentStep === 2 && isArtist) {
      if (artistRoles.length === 0) stepErrors.artistRoles = "Please select at least one role.";
    }
    if (currentStep === 6) {
      if (!contactName.trim()) stepErrors.contactName = "Contact Name is required.";
      if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
      if (!contactEmail.trim()) stepErrors.contactEmail = "Email is required.";
      if (!termsAccepted) stepErrors.terms = "Please accept the terms and conditions.";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    try {
      const currentAccount = db.getCurrentAccount();
      if (!currentAccount) throw new Error("Please log in first.");

      let result;
      if (isArtist) {
        // Register Artist Portfolio Profile
        result = await db.submitApplication("artist", {
          name: displayName,
          username: username.toLowerCase().trim(),
          contact_email: contactEmail,
          contact_phone: contactPhone,
          about: bio,
          home_city: homeCity,
          roles: artistRoles,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
          releases,
          timeline,
          profile_image: profileImage,
          banner_image: bannerImage,
          gallery,
          videos: demoVideo ? [demoVideo] : [],
          social_links: {
            instagram: instagramUrl || undefined,
            spotify: spotifyUrl || undefined,
            youtube: youtubeUrl || undefined,
            saavn: saavnUrl || undefined,
            apple: appleUrl || undefined,
            website: websiteUrl || undefined
          },
          fee_range: feeRange || undefined,
          preferred_cities: preferredCities || undefined
        });

        if (result) {
          db.addWorkspaceToAccount(currentAccount.id, "artist", result.id, displayName);
        }
      } else {
        // Register Band Organization
        result = await db.submitApplication("band", {
          band_name: displayName,
          genre,
          custom_genre: genre === "Other" ? customGenre : undefined,
          home_city: homeCity,
          formed_year: formedYear ? Number(formedYear) : undefined,
          bio,
          tagline: displayName || undefined,
          original_covers: originalCovers,
          banner_image: bannerImage,
          profile_image: profileImage,
          owners: [currentAccount.id], // Register user as Owner of this Band organization
          members: [], // Members added later via invites
          instagram_url: instagramUrl,
          youtube_url: youtubeUrl || undefined,
          spotify_url: spotifyUrl || undefined,
          saavn_url: saavnUrl || undefined,
          apple_url: appleUrl || undefined,
          website_url: websiteUrl || undefined,
          demo_track: demoVideo || undefined,
          preferred_cities: preferredCities || undefined,
          fee_range: feeRange || undefined,
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail
        });

        if (result) {
          db.addWorkspaceToAccount(currentAccount.id, "band", result.id, displayName);
        }
      }

      localStorage.removeItem(`bpl_draft_${type}`);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message || "Failed to submit onboarding form." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wizardSteps = isArtist
    ? [
        { number: 1, label: "Identity" },
        { number: 2, label: "Roles" },
        { number: 3, label: "Media" },
        { number: 4, label: "Portfolio" },
        { number: 5, label: "Touring" },
        { number: 6, label: "Contact" },
      ]
    : [
        { number: 1, label: "Identity" },
        { number: 2, label: "Story" },
        { number: 3, label: "Ownership" },
        { number: 4, label: "Links" },
        { number: 5, label: "Gig Info" },
        { number: 6, label: "Contact" },
      ];

  const profileCompletion = Math.floor((step / 6) * 100);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {isSubmitted ? (
          <div className="bpl-card p-12 text-center space-y-8 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary-glow border border-primary/30">
              <CheckCircle size={40} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                Workspace Created!
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Your new {isArtist ? "Artist Profile" : "Band Organization"} workspace has been successfully registered and is now live.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Link
                to="/dashboard"
                className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 relative">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">
                Kalakshetra Onboarding Hub
              </p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                {isArtist ? "Artist Portfolio" : "Band Organization"} Onboarding
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Set up your professional workspace. Progress is automatically saved as you type.
              </p>

              {/* Profile Completion Bar */}
              <div className="max-w-xs mx-auto pt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <span>Profile Completion</span>
                  <span className="text-primary-glow">{profileCompletion}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Progress Wizard Dots */}
            <div className="flex items-center justify-between px-2">
              {wizardSteps.map((s, idx) => (
                <div key={s.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1 relative z-10 mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (s.number < step) {
                          setStep(s.number);
                        } else if (s.number > step) {
                          let valid = true;
                          for (let i = step; i < s.number; i++) {
                            if (!validateStep(i)) {
                              valid = false;
                              break;
                            }
                          }
                          if (valid) setStep(s.number);
                        }
                      }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs border transition-all cursor-pointer ${
                        step === s.number
                          ? "bg-primary border-primary text-primary-foreground shadow-glow"
                          : step > s.number
                            ? "bg-primary/20 border-primary/40 text-primary-glow hover:bg-primary/30"
                            : "bg-surface border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.number}
                    </button>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold ${step >= s.number ? "text-primary-glow" : "text-muted-foreground"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < 5 && (
                    <div className="flex-1 h-[1px] -mt-4 bg-border hidden sm:block mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Wizard Form container */}
            <div className="bpl-card p-8 min-h-[350px] relative text-left">
              {errors.submit && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3.5 text-xs flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-semibold text-white font-display">Step 1: Workspace Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {isArtist ? "Artist / Stage Name" : "Band Name"} *
                      </label>
                      <input
                        type="text"
                        placeholder={isArtist ? "e.g. Rahul Sen" : "e.g. Band OG"}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                      />
                      {errors.displayName && <p className="text-[10px] text-red-400 font-bold">{errors.displayName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {isArtist ? "Username *" : "Home City *"}
                      </label>
                      {isArtist ? (
                        <input
                          type="text"
                          placeholder="e.g. rahul_music"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={homeCity}
                          onChange={(e) => setHomeCity(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      )}
                      {isArtist && errors.username && <p className="text-[10px] text-red-400 font-bold">{errors.username}</p>}
                      {!isArtist && errors.homeCity && <p className="text-[10px] text-red-400 font-bold">{errors.homeCity}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isArtist ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Home City *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kolkata"
                          value={homeCity}
                          onChange={(e) => setHomeCity(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                        />
                        {errors.homeCity && <p className="text-[10px] text-red-400 font-bold">{errors.homeCity}</p>}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Primary Genre *
                          </label>
                          <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                          >
                            {GENRES.map((g) => (
                              <option key={g} value={g} className="bg-slate-900">{g}</option>
                            ))}
                          </select>
                        </div>
                        {genre === "Other" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Specify Genre *
                            </label>
                            <input
                              type="text"
                              value={customGenre}
                              onChange={(e) => setCustomGenre(e.target.value)}
                              className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                              required
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Workspace Biography / Pitch
                    </label>
                    <textarea
                      placeholder={isArtist ? "Tell the community about your musical background, skills, and timeline achievements..." : "Brief summary of the band's philosophy, origin story, and lineup goals..."}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary h-24 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: STORY (BANDS) / ROLES (ARTISTS) */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  {isArtist ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white font-display">Step 2: Professional Roles *</h3>
                        <p className="text-[10px] text-muted-foreground">Select one or multiple roles in the music ecosystem.</p>
                        {errors.artistRoles && <p className="text-[10px] text-red-400 font-bold">{errors.artistRoles}</p>}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-2 border border-border/20 p-2 rounded-lg bg-black/15">
                        {PROFESSIONAL_ROLES.map((roleName) => {
                          const checked = artistRoles.includes(roleName);
                          return (
                            <label
                              key={roleName}
                              className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer transition select-none ${
                                checked
                                  ? "bg-primary/10 border-primary text-primary-glow font-bold"
                                  : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    setArtistRoles((prev) => prev.filter((r) => r !== roleName));
                                  } else {
                                    setArtistRoles((prev) => [...prev, roleName]);
                                  }
                                }}
                              />
                              <span className="text-[10px]">{roleName}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Core Technical Skills (Comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ableton Live, Logic Pro, Hindustani classical training"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white font-display">Step 2: Band Story & Context</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Formed Year
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 2024"
                            value={formedYear}
                            onChange={(e) => setFormedYear(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Performance Type
                          </label>
                          <select
                            value={originalCovers}
                            onChange={(e) => setOriginalCovers(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="Originals" className="bg-slate-900">Originals only</option>
                            <option value="Covers" className="bg-slate-900">Covers only</option>
                            <option value="Both" className="bg-slate-900">Both Originals & Covers</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: MEDIA (ARTISTS) / OWNERSHIP CONTEXT (BANDS) */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  {isArtist ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white font-display">Step 3: Profile Media</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Profile photo */}
                        <div className="space-y-2 border border-border/40 p-4 rounded-lg bg-secondary/10 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Profile Avatar</span>
                          <div className="mx-auto h-20 w-20 rounded-full bg-slate-800 border border-border overflow-hidden flex items-center justify-center relative">
                            {profileImage ? (
                              <img src={profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                            ) : (
                              <User size={30} className="text-muted-foreground" />
                            )}
                          </div>
                          <label className="inline-flex items-center gap-1 bg-secondary border border-border px-3 py-1.5 rounded text-[10px] font-bold text-white uppercase hover:bg-slate-800 transition cursor-pointer">
                            <Upload size={10} /> Choose Avatar
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} className="hidden" />
                          </label>
                        </div>

                        {/* Banner photo */}
                        <div className="space-y-2 border border-border/40 p-4 rounded-lg bg-secondary/10 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Banner Image</span>
                          <div className="mx-auto h-20 w-full bg-slate-800 border border-border overflow-hidden flex items-center justify-center relative rounded">
                            {bannerImage ? (
                              <img src={bannerImage} alt="Banner preview" className="h-full w-full object-cover" />
                            ) : (
                              <Camera size={30} className="text-muted-foreground" />
                            )}
                          </div>
                          <label className="inline-flex items-center gap-1 bg-secondary border border-border px-3 py-1.5 rounded text-[10px] font-bold text-white uppercase hover:bg-slate-800 transition cursor-pointer">
                            <Upload size={10} /> Choose Banner
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "banner")} className="hidden" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Demo Performance Video (YouTube URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={demoVideo}
                          onChange={(e) => setDemoVideo(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white font-display">Step 3: Organization Ownership</h3>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          By completing this onboarding, you will be registered as the primary **Owner** of this Band organization.
                        </p>
                        <div className="flex items-start gap-2.5 text-xs text-primary-glow font-semibold">
                          <CheckCircle size={16} className="shrink-0 mt-0.5" />
                          <span>Owners can invite members, assign position titles (drums, vocal, founder), and manage public releases.</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 border border-border/40 p-4 rounded-lg bg-secondary/10 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Band Logo</span>
                          <div className="mx-auto h-20 w-20 rounded-full bg-slate-800 border border-border overflow-hidden flex items-center justify-center relative">
                            {profileImage ? (
                              <img src={profileImage} alt="Logo preview" className="h-full w-full object-cover" />
                            ) : (
                              <User size={30} className="text-muted-foreground" />
                            )}
                          </div>
                          <label className="inline-flex items-center gap-1 bg-secondary border border-border px-3 py-1.5 rounded text-[10px] font-bold text-white uppercase hover:bg-slate-800 transition cursor-pointer">
                            <Upload size={10} /> Choose Logo
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} className="hidden" />
                          </label>
                        </div>
                        <div className="space-y-2 border border-border/40 p-4 rounded-lg bg-secondary/10 text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Band Cover Banner</span>
                          <div className="mx-auto h-20 w-full bg-slate-800 border border-border overflow-hidden flex items-center justify-center relative rounded">
                            {bannerImage ? (
                              <img src={bannerImage} alt="Banner preview" className="h-full w-full object-cover" />
                            ) : (
                              <Camera size={30} className="text-muted-foreground" />
                            )}
                          </div>
                          <label className="inline-flex items-center gap-1 bg-secondary border border-border px-3 py-1.5 rounded text-[10px] font-bold text-white uppercase hover:bg-slate-800 transition cursor-pointer">
                            <Upload size={10} /> Choose Banner
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "banner")} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: PORTFOLIO (ARTISTS) / LINKS (BANDS) */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  {isArtist ? (
                    <div className="space-y-4">
                      {/* Releases Section */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-semibold text-white font-display block">Music Releases Catalog</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end bg-secondary/20 p-3 border border-border rounded">
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider text-muted-foreground">Release Title</label>
                            <input
                              type="text"
                              value={tempReleaseTitle}
                              onChange={(e) => setTempReleaseTitle(e.target.value)}
                              className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider text-muted-foreground">Year</label>
                            <input
                              type="text"
                              value={tempReleaseYear}
                              onChange={(e) => setTempReleaseYear(e.target.value)}
                              className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (tempReleaseTitle.trim() && tempReleaseYear.trim()) {
                                setReleases((prev) => [...prev, { title: tempReleaseTitle.trim(), year: tempReleaseYear.trim() }]);
                                setTempReleaseTitle("");
                                setTempReleaseYear("");
                              }
                            }}
                            className="py-1 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white rounded text-[10px] font-bold uppercase transition"
                          >
                            Add Release
                          </button>
                        </div>
                        {releases.length > 0 && (
                          <div className="space-y-1 max-h-[80px] overflow-y-auto">
                            {releases.map((rel, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-secondary/40 p-2 border border-border rounded text-[11px]">
                                <span className="text-white">{rel.title} <span className="text-muted-foreground">({rel.year})</span></span>
                                <button type="button" onClick={() => setReleases((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 text-[10px] hover:underline">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timeline Section */}
                      <div className="space-y-2.5 border-t border-border/40 pt-4">
                        <span className="text-xs font-semibold text-white font-display block">Timeline Milestones</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end bg-secondary/20 p-3 border border-border rounded">
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider text-muted-foreground">Year</label>
                            <input
                              type="number"
                              value={tempYear}
                              onChange={(e) => setTempYear(e.target.value)}
                              className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1 col-span-1 sm:col-span-2">
                            <label className="text-[8px] uppercase tracking-wider text-muted-foreground">Milestone Event</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tempEvent}
                                onChange={(e) => setTempEvent(e.target.value)}
                                className="flex-1 bg-secondary border border-border rounded px-2 py-1 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempYear.trim() && tempEvent.trim()) {
                                    setTimeline((prev) => [...prev, { year: Number(tempYear), event: tempEvent.trim() }].sort((a,b)=>a.year - b.year));
                                    setTempYear("");
                                    setTempEvent("");
                                  }
                                }}
                                className="px-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white rounded text-[10px] font-bold uppercase transition"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                        {timeline.length > 0 && (
                          <div className="space-y-1 max-h-[80px] overflow-y-auto">
                            {timeline.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-secondary/40 p-2 border border-border rounded text-[11px]">
                                <span className="text-white"><span className="text-primary-glow font-bold">{item.year}</span> {item.event}</span>
                                <button type="button" onClick={() => setTimeline((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 text-[10px] hover:underline">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white font-display">Step 4: Social Links</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                            <Instagram size={12} className="text-pink-400" /> Instagram URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://instagram.com/..."
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                            <Globe size={12} className="text-blue-400" /> Spotify Artist link
                          </label>
                          <input
                            type="url"
                            placeholder="https://open.spotify.com/artist/..."
                            value={spotifyUrl}
                            onChange={(e) => setSpotifyUrl(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: TOURING (ARTISTS) / GIG INFO (BANDS) */}
              {step === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-semibold text-white font-display">Step 5: Touring Specs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Preferred Cities of Operation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, Bangalore, Pune"
                        value={preferredCities}
                        onChange={(e) => setPreferredCities(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {isArtist ? "Standard Per-Gig Fee" : "Expected Booking Fee"}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹15,000 - ₹25,000 per show"
                        value={feeRange}
                        onChange={(e) => setFeeRange(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: CONTACT & AGREEMENT */}
              {step === 6 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-semibold text-white font-display">Step 6: Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Who should bookers ask for?"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                      {errors.contactName && <p className="text-[10px] text-red-400 font-bold">{errors.contactName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="WhatsApp number preferred"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                      {errors.contactPhone && <p className="text-[10px] text-red-400 font-bold">{errors.contactPhone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Public Curation Email *
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                    {errors.contactEmail && <p className="text-[10px] text-red-400 font-bold">{errors.contactEmail}</p>}
                  </div>

                  <div className="p-4 bg-secondary/15 rounded-lg border border-border flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-3.5 w-3.5 border-border rounded bg-secondary text-primary"
                    />
                    <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-normal">
                      I agree that my details will be stored in the Kalakshetra directory and made discoverable to other ecosystem organizers.
                    </label>
                  </div>
                  {errors.terms && <p className="text-[10px] text-red-400 font-bold">{errors.terms}</p>}
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="mt-8 pt-4 border-t border-border/40 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-border bg-secondary hover:bg-slate-800 text-white rounded text-xs font-bold uppercase transition cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 px-5 py-2 bg-primary hover:bg-primary-glow border border-primary text-primary-foreground rounded text-xs font-bold uppercase transition cursor-pointer"
                  >
                    Continue <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-glow border border-primary text-primary-foreground rounded text-xs font-bold uppercase transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Onboarding..." : "Complete & Publish"} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
