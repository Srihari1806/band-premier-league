import { createFileRoute, Link } from "@tanstack/react-router";
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
  DollarSign
} from "lucide-react";
import { db, type BandMember } from "@/lib/db";

export const Route = createFileRoute("/join/band")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || "band",
    };
  },
  component: BandOnboardingPage,
});

const GENRES = [
  "Rock",
  "Indie",
  "Folk",
  "Metal",
  "Pop",
  "Alternative",
  "Hip-Hop",
  "Other"
];

function BandOnboardingPage() {
  const { type } = Route.useSearch();
  const isSolo = type === "solo";

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [bandName, setBandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [genre, setGenre] = useState("Rock");
  const [customGenre, setCustomGenre] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [formedYear, setFormedYear] = useState("");
  const [languages, setLanguages] = useState("");
  const [originalCovers, setOriginalCovers] = useState("Originals");
  
  // Step 2: Story
  const [bio, setBio] = useState("");
  const [mission, setMission] = useState("");
  const [influences, setInfluences] = useState("");
  const [musicalStyle, setMusicalStyle] = useState("");
  const [achievements, setAchievements] = useState("");

  // Step 3: Lineup
  const [members, setMembers] = useState<BandMember[]>([]);

  // Images
  const [bannerImage, setBannerImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [performancePhotos, setPerformancePhotos] = useState<string[]>([]);
  
  // Step 4: Music
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [saavnUrl, setSaavnUrl] = useState("");
  const [appleUrl, setAppleUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [demoTrack, setDemoTrack] = useState(""); // Base64
  
  // Step 5: Performance
  const [stageRider, setStageRider] = useState(""); // Tech rider specs
  const [technicalRequirements, setTechnicalRequirements] = useState("");
  const [preferredCities, setPreferredCities] = useState("");
  const [feeRange, setFeeRange] = useState("");
  const [availabilityCalendar, setAvailabilityCalendar] = useState<string[]>([]);

  // Step 6: Contact
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [managerName, setManagerName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Inline Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File Input Refs
  const bannerRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const demoRef = useRef<HTMLInputElement>(null);
  const memberPhotoRefs = useRef<Record<number, HTMLInputElement>>({});

  // 1. Load Draft from LocalStorage on mount (Autosave feature)
  useEffect(() => {
    const draft = localStorage.getItem(`bpl_draft_${type}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.bandName) setBandName(parsed.bandName);
        if (parsed.tagline) setTagline(parsed.tagline);
        if (parsed.genre) setGenre(parsed.genre);
        if (parsed.customGenre) setCustomGenre(parsed.customGenre);
        if (parsed.homeCity) setHomeCity(parsed.homeCity);
        if (parsed.formedYear) setFormedYear(parsed.formedYear);
        if (parsed.languages) setLanguages(parsed.languages);
        if (parsed.originalCovers) setOriginalCovers(parsed.originalCovers);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.mission) setMission(parsed.mission);
        if (parsed.influences) setInfluences(parsed.influences);
        if (parsed.musicalStyle) setMusicalStyle(parsed.musicalStyle);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.bannerImage) setBannerImage(parsed.bannerImage);
        if (parsed.profileImage) setProfileImage(parsed.profileImage);
        if (parsed.performancePhotos) setPerformancePhotos(parsed.performancePhotos);
        if (parsed.instagramUrl) setInstagramUrl(parsed.instagramUrl);
        if (parsed.youtubeUrl) setYoutubeUrl(parsed.youtubeUrl);
        if (parsed.spotifyUrl) setSpotifyUrl(parsed.spotifyUrl);
        if (parsed.saavnUrl) setSaavnUrl(parsed.saavnUrl);
        if (parsed.appleUrl) setAppleUrl(parsed.appleUrl);
        if (parsed.websiteUrl) setWebsiteUrl(parsed.websiteUrl);
        if (parsed.demoTrack) setDemoTrack(parsed.demoTrack);
        if (parsed.stageRider) setStageRider(parsed.stageRider);
        if (parsed.technicalRequirements) setTechnicalRequirements(parsed.technicalRequirements);
        if (parsed.preferredCities) setPreferredCities(parsed.preferredCities);
        if (parsed.feeRange) setFeeRange(parsed.feeRange);
        if (parsed.availabilityCalendar) setAvailabilityCalendar(parsed.availabilityCalendar);
        if (parsed.contactName) setContactName(parsed.contactName);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.managerName) setManagerName(parsed.managerName);
        if (parsed.termsAccepted) setTermsAccepted(parsed.termsAccepted);
        if (parsed.step) setStep(parsed.step);
      } catch (e) {
        console.warn("Failed to load draft from localStorage", e);
      }
    }
  }, [type]);

  // 2. Autosave values on changes
  useEffect(() => {
    if (isSubmitted) return;
    const saveDraft = () => {
      const stateObj = {
        bandName, tagline, genre, customGenre, homeCity, formedYear, languages, originalCovers,
        bio, mission, influences, musicalStyle, achievements, members, bannerImage, profileImage,
        performancePhotos, instagramUrl, youtubeUrl, spotifyUrl, saavnUrl, appleUrl, websiteUrl,
        demoTrack, stageRider, technicalRequirements, preferredCities, feeRange, availabilityCalendar,
        contactName, contactPhone, contactEmail, managerName, termsAccepted, step
      };
      localStorage.setItem(`bpl_draft_${type}`, JSON.stringify(stateObj));
    };
    saveDraft();
  }, [
    bandName, tagline, genre, customGenre, homeCity, formedYear, languages, originalCovers,
    bio, mission, influences, musicalStyle, achievements, members, bannerImage, profileImage,
    performancePhotos, instagramUrl, youtubeUrl, spotifyUrl, saavnUrl, appleUrl, websiteUrl,
    demoTrack, stageRider, technicalRequirements, preferredCities, feeRange, availabilityCalendar,
    contactName, contactPhone, contactEmail, managerName, termsAccepted, step, isSubmitted, type
  ]);

  // Auto-scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, isSubmitted]);

  // Calculate Profile Completion Percentage
  const calculateCompletion = () => {
    let fields = [
      bannerImage, profileImage, bandName, homeCity, bio, instagramUrl, contactName, contactPhone, contactEmail, termsAccepted
    ];
    let filled = fields.filter(f => !!f).length;
    let total = fields.length;

    // Check optional but key fields for extra %
    if (members.length > 0) filled += 1;
    total += 1;
    if (performancePhotos.length > 0) filled += 1;
    total += 1;
    if (spotifyUrl || youtubeUrl) filled += 1;
    total += 1;

    return Math.min(Math.round((filled / total) * 100), 100);
  };

  const profileCompletion = calculateCompletion();

  // Image base64 converter helper
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

  const onBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const b64 = await handleImageFile(file);
        setBannerImage(b64);
        setErrors((prev) => ({ ...prev, banner: "" }));
      } catch (err) {
        const error = err as Error;
        setErrors((prev) => ({ ...prev, banner: error.message }));
      }
    }
  };

  const onProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const b64 = await handleImageFile(file);
        setProfileImage(b64);
        setErrors((prev) => ({ ...prev, profile: "" }));
      } catch (err) {
        const error = err as Error;
        setErrors((prev) => ({ ...prev, profile: error.message }));
      }
    }
  };

  const onGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 8 - performancePhotos.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      
      const newPhotos: string[] = [];
      for (const file of filesToUpload) {
        try {
          const b64 = await handleImageFile(file);
          newPhotos.push(b64);
        } catch (err) {
          const error = err as Error;
          setErrors((prev) => ({ ...prev, gallery: `Some images failed: ${error.message}` }));
        }
      }
      setPerformancePhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const onDemoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, demo: "Audio demo must be under 5MB" }));
        return;
      }
      try {
        const b64 = await handleImageFile(file);
        setDemoTrack(b64);
        setErrors((prev) => ({ ...prev, demo: "" }));
      } catch (err) {
        const error = err as Error;
        setErrors((prev) => ({ ...prev, demo: error.message }));
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setPerformancePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderGalleryImage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === performancePhotos.length - 1) return;

    const newPhotos = [...performancePhotos];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;

    setPerformancePhotos(newPhotos);
  };

  // Team Members
  const addMember = () => {
    setMembers((prev) => [...prev, { name: "", role: "", photo: "", instagram: "", experience: "" }]);
  };

  const updateMember = (index: number, key: keyof BandMember, value: string) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const onMemberPhotoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const b64 = await handleImageFile(file);
        updateMember(index, "photo", b64);
      } catch (err) {
        const error = err as Error;
        alert(`Failed to upload photo: ${error.message}`);
      }
    }
  };

  // Calendar toggle
  const toggleCalendarDate = (dateStr: string) => {
    setAvailabilityCalendar(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr]
    );
  };

  // Validations per step
  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!bannerImage) stepErrors.banner = "Cover banner image is required.";
      if (!profileImage) stepErrors.profile = "Profile avatar photo is required.";
      if (!bandName.trim()) stepErrors.bandName = `${isSolo ? "Artist" : "Band"} name is required.`;
      if (!homeCity.trim()) stepErrors.homeCity = "Home city is required.";
      if (genre === "Other" && !customGenre.trim()) {
        stepErrors.customGenre = "Please specify your genre.";
      }
      if (formedYear && (isNaN(Number(formedYear)) || Number(formedYear) < 1900 || Number(formedYear) > new Date().getFullYear())) {
        stepErrors.formedYear = "Please enter a valid year.";
      }
    }

    if (currentStep === 2) {
      if (!bio.trim()) {
        stepErrors.bio = "A short bio is required.";
      } else if (bio.length > 300) {
        stepErrors.bio = "Bio cannot exceed 300 characters.";
      }
    }

    if (currentStep === 4) {
      if (!instagramUrl.trim()) {
        stepErrors.instagram = "Instagram link is required.";
      } else if (!instagramUrl.toLowerCase().includes("instagram.com")) {
        stepErrors.instagram = "Must be a valid Instagram URL (e.g. instagram.com/profile).";
      }

      if (youtubeUrl.trim() && !youtubeUrl.toLowerCase().includes("youtube.com") && !youtubeUrl.toLowerCase().includes("youtu.be")) {
        stepErrors.youtube = "Must be a valid YouTube URL.";
      }
    }

    if (currentStep === 6) {
      if (!contactName.trim()) stepErrors.contactName = "Primary contact name is required.";
      if (!contactPhone.trim()) stepErrors.contactPhone = "Phone number is required.";
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!contactEmail.trim()) {
        stepErrors.contactEmail = "Contact email is required.";
      } else if (!emailRegex.test(contactEmail)) {
        stepErrors.contactEmail = "Please enter a valid email address.";
      }

      if (!termsAccepted) {
        stepErrors.terms = "You must accept the terms to submit.";
      }
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
      await db.submitApplication("band", {
        band_name: bandName,
        tagline: tagline || undefined,
        genre: genre,
        custom_genre: genre === "Other" ? customGenre : undefined,
        home_city: homeCity,
        formed_year: formedYear ? Number(formedYear) : undefined,
        languages: languages || undefined,
        original_covers: originalCovers,
        bio: bio,
        mission: mission || undefined,
        influences: influences || undefined,
        musical_style: musicalStyle || undefined,
        achievements: achievements || undefined,
        banner_image: bannerImage,
        profile_image: profileImage,
        performance_photos: performancePhotos,
        members: members,
        instagram_url: instagramUrl,
        youtube_url: youtubeUrl || undefined,
        spotify_url: spotifyUrl || undefined,
        saavn_url: saavnUrl || undefined,
        apple_url: appleUrl || undefined,
        website_url: websiteUrl || undefined,
        demo_track: demoTrack || undefined,
        stage_rider: stageRider || undefined,
        technical_requirements: technicalRequirements || undefined,
        preferred_cities: preferredCities || undefined,
        fee_range: feeRange || undefined,
        availability_calendar: availabilityCalendar,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        manager_name: managerName || undefined,
      });

      // Clear draft on successful submit
      localStorage.removeItem(`bpl_draft_${type}`);
      localStorage.setItem("bpl_user_onboarded", "true");
      setIsSubmitted(true);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setErrors({ submit: error.message || "An error occurred while submitting." });
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
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Application Submitted!</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Your application has been logged and is pending league approval. Review stages:
              </p>
            </div>

            {/* Review Stages Timeline */}
            <div className="max-w-md mx-auto bg-surface/50 border border-border p-6 rounded-lg text-left space-y-4">
              {[
                { label: "Application Submitted", desc: "Your files have been saved to the Kalakshetra registry.", done: true },
                { label: "Verification", desc: "Kalakshetra staff checks links and contact credentials.", done: false },
                { label: "Evaluation & Selection", desc: "Review of musical style, demo performance video and bio details.", done: false },
                { label: "League Approval", desc: "Kalakshetra operations team formally signs off on registry entry.", done: false },
                { label: "Official Registration", desc: "Kalakshetra ID created and profile published live on the directory.", done: false },
              ].map((stage, idx) => (
                <div key={stage.label} className="flex gap-4 relative">
                  {idx < 4 && (
                    <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-8px)] bg-border" />
                  )}
                  <div className={`h-6 w-6 rounded-full shrink-0 border flex items-center justify-center text-xs font-semibold ${
                    stage.done 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-surface border-border text-muted-foreground"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${stage.done ? "text-primary-glow" : "text-white/80"}`}>{stage.label}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Link to="/bands" className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold">
                Explore Directory
              </Link>
              <Link to="/" className="px-6 py-3 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-2 relative">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">Kalakshetra Onboarding Hub</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                {isSolo ? "Solo Artist" : "Band"} Onboarding
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Set up your professional profile. Progress is automatically saved as you type.
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
              {[
                { number: 1, label: "Identity" },
                { number: 2, label: "Story" },
                { number: 3, label: "Lineup" },
                { number: 4, label: "Music" },
                { number: 5, label: "Gig Info" },
                { number: 6, label: "Contact" },
              ].map((s, idx) => (
                <div key={s.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1 relative z-10 mx-auto">
                    <button 
                      type="button"
                      onClick={() => {
                        // Allow skipping backwards freely, but validate going forwards
                        if (s.number < step) {
                          setStep(s.number);
                        } else if (s.number > step) {
                          // Try to validate current step before letting them jump forward
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
                    <span className={`text-[9px] uppercase tracking-wider font-semibold ${step >= s.number ? "text-primary-glow" : "text-muted-foreground"}`}>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: IDENTITY (Twitter-style Layout) */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Banner & Profile Setup preview */}
                  <div className="bpl-card overflow-hidden">
                    <div className="p-4 border-b border-border bg-surface/30">
                      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Social Layout Preview (Twitter Style)</h2>
                    </div>

                    {/* Cover Banner */}
                    <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden flex items-center justify-center border-b border-border">
                      {bannerImage ? (
                        <img src={bannerImage} alt="Banner Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center p-6 text-muted-foreground">
                          <p className="text-xs font-bold">No cover image uploaded</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">Recommended size: 1500 x 500 (3:1)</p>
                        </div>
                      )}
                      
                      <button 
                        type="button"
                        onClick={() => bannerRef.current?.click()}
                        className="absolute top-3 right-3 z-30 bg-black/75 hover:bg-black/90 text-white rounded-md px-3 py-1.5 text-xs flex items-center gap-1.5 border border-white/10 transition"
                      >
                        <Camera size={12} /> Upload Cover
                      </button>
                      <input 
                        type="file" 
                        ref={bannerRef}
                        accept="image/*" 
                        onChange={onBannerChange} 
                        className="hidden" 
                      />
                    </div>

                    {/* Circular Avatar overlapping cover */}
                    <div className="px-6 pb-6 relative">
                      <div className="flex items-end gap-4 -mt-10 sm:-mt-14 relative z-20">
                        <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full overflow-hidden border-4 border-background bg-slate-800 relative group flex items-center justify-center shrink-0 shadow-lg">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile Preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-muted-foreground text-center">
                              <Camera size={20} className="mx-auto" />
                            </div>
                          )}
                          <button 
                            type="button"
                            onClick={() => profileRef.current?.click()}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition rounded-full"
                          >
                            <Upload size={14} />
                          </button>
                          <input 
                            type="file" 
                            ref={profileRef}
                            accept="image/*" 
                            onChange={onProfileChange} 
                            className="hidden" 
                          />
                        </div>
                        <div className="mb-2 min-w-0">
                          <h3 className="font-semibold text-lg text-white truncate">{bandName || "Artist / Band Name"}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {genre === "Other" && customGenre ? customGenre : genre} · {homeCity || "Home City"}
                          </p>
                          {tagline && <p className="text-[11px] text-primary-glow italic mt-0.5 truncate">"{tagline}"</p>}
                        </div>
                      </div>
                      
                      {/* Errors for images */}
                      {errors.banner && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.banner}</p>}
                      {errors.profile && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.profile}</p>}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Basic Details</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Band/Artist Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="bandName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{isSolo ? "Artist Name" : "Band Name"} *</label>
                        <input 
                          type="text" 
                          id="bandName"
                          placeholder={isSolo ? "e.g. Ritviz" : "e.g. Parvaaz"}
                          value={bandName}
                          onChange={(e) => setBandName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                        {errors.bandName && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.bandName}</p>}
                      </div>

                      {/* Tagline */}
                      <div className="space-y-1.5">
                        <label htmlFor="tagline" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">One-line Tagline</label>
                        <input 
                          type="text" 
                          id="tagline"
                          placeholder="e.g. Ambient electronic folk from Pune"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Genre */}
                      <div className="space-y-1.5">
                        <label htmlFor="genre" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Primary Genre *</label>
                        <select
                          id="genre"
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        >
                          {GENRES.map((g) => (
                            <option key={g} value={g} className="bg-background">{g}</option>
                          ))}
                        </select>
                      </div>

                      {/* Custom Genre */}
                      {genre === "Other" && (
                        <div className="space-y-1.5">
                          <label htmlFor="customGenre" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Specify Genre *</label>
                          <input 
                            type="text" 
                            id="customGenre"
                            placeholder="e.g. Synth-wave / Shoegaze"
                            value={customGenre}
                            onChange={(e) => setCustomGenre(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                          />
                          {errors.customGenre && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.customGenre}</p>}
                        </div>
                      )}

                      {/* Home City */}
                      <div className="space-y-1.5">
                        <label htmlFor="homeCity" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Home City *</label>
                        <input 
                          type="text" 
                          id="homeCity"
                          placeholder="e.g. Pune"
                          value={homeCity}
                          onChange={(e) => setHomeCity(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                        {errors.homeCity && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.homeCity}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Formation Year */}
                      <div className="space-y-1.5">
                        <label htmlFor="formedYear" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Formation Year</label>
                        <input 
                          type="number" 
                          id="formedYear"
                          placeholder="e.g. 2019"
                          value={formedYear}
                          onChange={(e) => setFormedYear(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                        {errors.formedYear && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.formedYear}</p>}
                      </div>

                      {/* Languages */}
                      <div className="space-y-1.5">
                        <label htmlFor="languages" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Languages of Music</label>
                        <input 
                          type="text" 
                          id="languages"
                          placeholder="e.g. Hindi, English"
                          value={languages}
                          onChange={(e) => setLanguages(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>

                      {/* Originals / Covers */}
                      <div className="space-y-1.5">
                        <label htmlFor="originalCovers" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Repertoire Type</label>
                        <select
                          id="originalCovers"
                          value={originalCovers}
                          onChange={(e) => setOriginalCovers(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        >
                          <option value="Originals" className="bg-background">Originals Only</option>
                          <option value="Covers" className="bg-background">Covers Only</option>
                          <option value="Both" className="bg-background">Both Originals & Covers</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Next: Band Story <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: STORY */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Our Story</h2>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Short Profile Bio *</label>
                        <span className={`text-[10px] ${bio.length > 300 ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                          {bio.length} / 300
                        </span>
                      </div>
                      <textarea 
                        id="bio"
                        rows={3}
                        maxLength={300}
                        placeholder="Write a short summary profile bio (max 300 characters)..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white resize-none"
                      />
                      {errors.bio && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.bio}</p>}
                    </div>

                    {/* Mission / Goal */}
                    <div className="space-y-1.5">
                      <label htmlFor="mission" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Band Mission / Vision</label>
                      <textarea 
                        id="mission"
                        rows={2}
                        placeholder="What drives your band? What are your career aspirations?"
                        value={mission}
                        onChange={(e) => setMission(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white resize-none"
                      />
                    </div>

                    {/* Musical Style & Influences */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="influences" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Key Influences</label>
                        <input 
                          type="text" 
                          id="influences"
                          placeholder="e.g. Pink Floyd, AR Rahman, Coldplay"
                          value={influences}
                          onChange={(e) => setInfluences(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="style" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Describe Musical Style</label>
                        <input 
                          type="text" 
                          id="style"
                          placeholder="e.g. Atmospheric, synth-heavy, lyrical"
                          value={musicalStyle}
                          onChange={(e) => setMusicalStyle(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-1.5">
                      <label htmlFor="achievements" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Key Achievements / Milestones</label>
                      <textarea 
                        id="achievements"
                        rows={2}
                        placeholder="e.g. Released debut album, won Hornbill Rock Contest, opened for NH7..."
                        value={achievements}
                        onChange={(e) => setAchievements(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Next: Lineup <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: MEMBERS */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <h2 className="font-display font-semibold text-lg text-primary-glow">Band Lineup / Members</h2>
                        <p className="text-xs text-muted-foreground">List the official members in your lineup.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={addMember}
                        className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary-glow text-xs rounded-md px-3 py-1.5 flex items-center gap-1 font-medium transition cursor-pointer"
                      >
                        <Plus size={14} /> Add Member
                      </button>
                    </div>

                    {members.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground space-y-2 border border-dashed border-border rounded-lg bg-surface/10">
                        <p className="text-sm">No members added yet.</p>
                        <p className="text-xs text-muted-foreground/60">Include roles (e.g. Lead Vocals, Bass) and Instagram profile links.</p>
                        <button
                          type="button"
                          onClick={addMember}
                          className="text-xs text-primary-glow underline font-medium cursor-pointer"
                        >
                          Add your first member card
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {members.map((m, idx) => (
                          <div key={idx} className="bpl-card p-4 space-y-3 relative group bg-surface/30 border-border/80 hover:border-primary/40 transition">
                            <button
                              type="button"
                              onClick={() => removeMember(idx)}
                              className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-red-500 transition cursor-pointer"
                              aria-label="Remove member"
                            >
                              <Trash size={14} />
                            </button>

                            <div className="flex gap-3">
                              {/* Member Circular Photo */}
                              <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-800 border border-border relative flex items-center justify-center shrink-0">
                                {m.photo ? (
                                  <img src={m.photo} alt="Member" className="h-full w-full object-cover" />
                                ) : (
                                  <Camera size={16} className="text-muted-foreground" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => memberPhotoRefs.current[idx]?.click()}
                                  className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition text-[9px] font-bold"
                                >
                                  EDIT
                                </button>
                                <input
                                  type="file"
                                  ref={(el) => {
                                    if (el) memberPhotoRefs.current[idx] = el;
                                  }}
                                  accept="image/*"
                                  onChange={(e) => onMemberPhotoChange(idx, e)}
                                  className="hidden"
                                />
                              </div>
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  value={m.name}
                                  onChange={(e) => updateMember(idx, "name", e.target.value)}
                                  className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary transition text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Role / Instrument (e.g. Drums)"
                                  value={m.role}
                                  onChange={(e) => updateMember(idx, "role", e.target.value)}
                                  className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary transition text-white"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Insta username"
                                    value={m.instagram || ""}
                                    onChange={(e) => updateMember(idx, "instagram", e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-[10px] focus:outline-none focus:border-primary transition text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Exp (e.g. 4 years)"
                                    value={m.experience || ""}
                                    onChange={(e) => updateMember(idx, "experience", e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-[10px] focus:outline-none focus:border-primary transition text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Next: Music Links <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: MUSIC & LINKS */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Music & Media Handles</h2>

                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <label htmlFor="instagramUrl" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Instagram size={13} /> Instagram Profile Link *
                      </label>
                      <input 
                        type="url" 
                        id="instagramUrl"
                        placeholder="https://www.instagram.com/bandname"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                      />
                      {errors.instagram && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.instagram}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Youtube */}
                      <div className="space-y-1.5">
                        <label htmlFor="youtubeUrl" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Youtube size={13} /> YouTube URL
                        </label>
                        <input 
                          type="url" 
                          id="youtubeUrl"
                          placeholder="https://www.youtube.com/c/bandname"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                        {errors.youtube && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.youtube}</p>}
                      </div>

                      {/* Spotify */}
                      <div className="space-y-1.5">
                        <label htmlFor="spotifyUrl" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Music size={13} /> Spotify Artist URL
                        </label>
                        <input 
                          type="url" 
                          id="spotifyUrl"
                          placeholder="https://open.spotify.com/artist/..."
                          value={spotifyUrl}
                          onChange={(e) => setSpotifyUrl(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Apple Music */}
                      <div className="space-y-1.5">
                        <label htmlFor="appleUrl" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Music size={13} /> Apple Music URL
                        </label>
                        <input 
                          type="url" 
                          id="appleUrl"
                          placeholder="https://music.apple.com/artist/..."
                          value={appleUrl}
                          onChange={(e) => setAppleUrl(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>

                      {/* JioSaavn */}
                      <div className="space-y-1.5">
                        <label htmlFor="saavnUrl" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Music size={13} /> JioSaavn URL
                        </label>
                        <input 
                          type="url" 
                          id="saavnUrl"
                          placeholder="https://www.jiosaavn.com/artist/..."
                          value={saavnUrl}
                          onChange={(e) => setSaavnUrl(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Website */}
                      <div className="space-y-1.5">
                        <label htmlFor="websiteUrl" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Official Website</label>
                        <input 
                          type="url" 
                          id="websiteUrl"
                          placeholder="https://www.yourband.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>

                      {/* Audio Demo Track (Upload) */}
                      <div className="space-y-1.5">
                        <label htmlFor="demoFile" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                          Upload Demo Track (MP3/WAV)
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => demoRef.current?.click()}
                            className="bg-secondary hover:bg-surface border border-border rounded-md px-4 py-2.5 text-xs text-white flex items-center gap-2 cursor-pointer transition"
                          >
                            <Upload size={14} /> {demoTrack ? "Replace Audio" : "Upload File"}
                          </button>
                          {demoTrack && (
                            <span className="text-[10px] text-primary-glow font-semibold flex items-center gap-1">
                              <CheckCircle size={10} /> Audio Loaded
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          id="demoFile"
                          ref={demoRef}
                          accept="audio/*"
                          onChange={onDemoChange}
                          className="hidden"
                        />
                        {errors.demo && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.demo}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Next: Gig / Booking Info <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: PERFORMANCE & BOOKING DETAILS */}
              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Performance Gallery */}
                  <div className="bpl-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <h2 className="font-display font-semibold text-lg text-primary-glow">Live Performance Photos</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Upload live gig or performance photos (max 8).</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => galleryRef.current?.click()}
                        disabled={performancePhotos.length >= 8}
                        className="bg-primary/10 hover:bg-primary/20 disabled:opacity-50 border border-primary/30 text-primary-glow text-xs rounded-md px-3 py-1.5 flex items-center gap-1 font-medium transition cursor-pointer"
                      >
                        <Plus size={14} /> Upload Images
                      </button>
                      <input
                        type="file"
                        ref={galleryRef}
                        accept="image/*"
                        multiple
                        onChange={onGalleryChange}
                        className="hidden"
                      />
                    </div>

                    {errors.gallery && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.gallery}</p>}

                    {performancePhotos.length === 0 ? (
                      <div 
                        onClick={() => galleryRef.current?.click()}
                        className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-surface/5 hover:bg-surface/10 transition cursor-pointer flex flex-col items-center justify-center gap-3"
                      >
                        <Camera size={28} className="text-muted-foreground/50" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white">Click to upload gig photos</p>
                          <p className="text-[10px] text-muted-foreground/60">Supports PNG, JPG (Max 2MB)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {performancePhotos.map((photo, idx) => (
                          <div key={idx} className="bpl-card overflow-hidden aspect-square relative group border-border">
                            <img src={photo} alt={`Performance ${idx + 1}`} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(idx)}
                                  className="text-red-400 hover:text-red-500 p-1 cursor-pointer"
                                  title="Delete photo"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                              <div className="flex justify-between items-center gap-1 bg-black/50 rounded p-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => reorderGalleryImage(idx, "up")}
                                  className="text-white hover:text-primary-glow disabled:opacity-40 text-[9px] font-bold flex-1 text-center cursor-pointer"
                                >
                                  L
                                </button>
                                <span className="text-[9px] text-white/80 font-bold px-1">{idx + 1}</span>
                                <button
                                  type="button"
                                  disabled={idx === performancePhotos.length - 1}
                                  onClick={() => reorderGalleryImage(idx, "down")}
                                  className="text-white hover:text-primary-glow disabled:opacity-40 text-[9px] font-bold flex-1 text-center cursor-pointer"
                                >
                                  R
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rider & Pricing */}
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Stage & Technical Requirements</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Tech Rider Details */}
                      <div className="space-y-1.5">
                        <label htmlFor="stageRider" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Stage Rider Summary</label>
                        <textarea 
                          id="stageRider"
                          rows={3}
                          placeholder="e.g. 4 Vocal mics, 2 Guitar amps, 1 Bass DI, drum kit setup..."
                          value={stageRider}
                          onChange={(e) => setStageRider(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white resize-none"
                        />
                      </div>

                      {/* Technical requirements details */}
                      <div className="space-y-1.5">
                        <label htmlFor="tech" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Technical requirements / Audio channels</label>
                        <textarea 
                          id="tech"
                          rows={3}
                          placeholder="List any complex equipment, monitors count, sub-mix details..."
                          value={technicalRequirements}
                          onChange={(e) => setTechnicalRequirements(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Preferred Cities */}
                      <div className="space-y-1.5">
                        <label htmlFor="prefCities" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Preferred Gig Cities</label>
                        <input 
                          type="text" 
                          id="prefCities"
                          placeholder="e.g. Pune, Mumbai, Bangalore"
                          value={preferredCities}
                          onChange={(e) => setPreferredCities(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>

                      {/* Fee range */}
                      <div className="space-y-1.5">
                        <label htmlFor="fee" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><DollarSign size={13} /> Preferred Fee Range per Gig</label>
                        <input 
                          type="text" 
                          id="fee"
                          placeholder="e.g. Rs. 40,000 - 60,000"
                          value={feeRange}
                          onChange={(e) => setFeeRange(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                      </div>
                    </div>

                    {/* Simple Availability Calendar */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Availability Calendar (Select dates you are available this month)</label>
                      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase font-semibold text-muted-foreground tracking-wider pt-2">
                        {"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",").map(d => (
                          <div key={d} className="py-1">{d}</div>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
                          const dateStr = `2026-07-${n.toString().padStart(2, '0')}`;
                          const selected = availabilityCalendar.includes(dateStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => toggleCalendarDate(dateStr)}
                              className={`aspect-square rounded-md border flex items-center justify-center font-bold transition cursor-pointer ${
                                selected 
                                  ? "bg-primary border-primary text-primary-foreground shadow-glow" 
                                  : "border-border hover:border-primary/40 text-white/90 bg-secondary/50"
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Next: Contact details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: CONTACT (Private Info) */}
              {step === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <div>
                      <h2 className="font-display font-semibold text-lg text-primary-glow">Contact Details (Private)</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">This information is only visible to Kalakshetra staff curators.</p>
                    </div>
                    <div className="border-b border-border" />

                    {/* Primary contact */}
                    <div className="space-y-1.5">
                      <label htmlFor="contactName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><User size={13} /> Primary Contact Name *</label>
                      <input 
                        type="text" 
                        id="contactName"
                        placeholder="Manager or Band Spokesperson name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                      />
                      {errors.contactName && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.contactName}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label htmlFor="contactPhone" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Phone size={13} /> Phone Number *</label>
                        <input 
                          type="tel" 
                          id="contactPhone"
                          placeholder="+91 XXXXX XXXXX"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                        {errors.contactPhone && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.contactPhone}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label htmlFor="contactEmail" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Mail size={13} /> Email Address *</label>
                        <input 
                          type="email" 
                          id="contactEmail"
                          placeholder="e.g. booking@yourband.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                        />
                        {errors.contactEmail && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.contactEmail}</p>}
                      </div>
                    </div>

                    {/* Manager Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="managerName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Manager Name (Optional)</label>
                      <input 
                        type="text" 
                        id="managerName"
                        placeholder="e.g. Aaditya Roy"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition text-white"
                      />
                    </div>

                    {/* Terms */}
                    <div className="space-y-3 pt-4">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 h-4 w-4 border-border rounded bg-secondary text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal select-none cursor-pointer">
                          I agree to Kalakshetra's evaluation rules. I understand that submitting does not guarantee catalog registration and is subject to curation review.
                        </label>
                      </div>
                      {errors.terms && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.terms}</p>}
                    </div>

                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-red-950/40 border border-red-900 rounded-md text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={16} /> {errors.submit}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary btn-primary-hover px-8 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}
      </div>
    </PageShell>
  );
}
