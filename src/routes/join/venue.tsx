import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { 
  Building2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Camera,
  Upload,
  User,
  Phone,
  Mail,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/join/venue")({
  head: () => ({
    meta: [
      { title: "Partner Venue Onboarding — BPL" },
      { name: "description", content: "Register your venue or cafe as an official BPL live tour partner." },
    ],
  }),
  component: VenueOnboardingPage,
});

function VenueOnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  // Step 1: Identity
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  // Step 2: Type & Size
  const [type, setType] = useState("cafe"); // cafe, pub, restaurant, college, open-air, indoor
  const [capacity, setCapacity] = useState("");
  const [stageSize, setStageSize] = useState("");

  // Step 3: Facilities
  const [parking, setParking] = useState(false);
  const [greenRoom, setGreenRoom] = useState(false);
  const [lighting, setLighting] = useState(false);
  const [sound, setSound] = useState(false);
  const [power, setPower] = useState(false);
  const [food, setFood] = useState(false);
  const [bar, setBar] = useState(false);
  const [facilityDetails, setFacilityDetails] = useState("");

  // Step 4: Gallery
  const [images, setImages] = useState<string[]>([]);

  // Step 5: Availability & Terms
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [preferredGenres, setPreferredGenres] = useState("");
  const [pricing, setPricing] = useState("");

  // Step 6: Contact
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount (Autosave)
  useEffect(() => {
    const draft = localStorage.getItem("bpl_draft_venue");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.venueName) setVenueName(parsed.venueName);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.mapsLink) setMapsLink(parsed.mapsLink);
        if (parsed.ownerName) setOwnerName(parsed.ownerName);
        if (parsed.logoImage) setLogoImage(parsed.logoImage);
        if (parsed.bannerImage) setBannerImage(parsed.bannerImage);
        if (parsed.type) setType(parsed.type);
        if (parsed.capacity) setCapacity(parsed.capacity);
        if (parsed.stageSize) setStageSize(parsed.stageSize);
        if (parsed.parking) setParking(parsed.parking);
        if (parsed.greenRoom) setGreenRoom(parsed.greenRoom);
        if (parsed.lighting) setLighting(parsed.lighting);
        if (parsed.sound) setSound(parsed.sound);
        if (parsed.power) setPower(parsed.power);
        if (parsed.food) setFood(parsed.food);
        if (parsed.bar) setBar(parsed.bar);
        if (parsed.facilityDetails) setFacilityDetails(parsed.facilityDetails);
        if (parsed.images) setImages(parsed.images);
        if (parsed.availableDays) setAvailableDays(parsed.availableDays);
        if (parsed.preferredGenres) setPreferredGenres(parsed.preferredGenres);
        if (parsed.pricing) setPricing(parsed.pricing);
        if (parsed.contactName) setContactName(parsed.contactName);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.termsAccepted) setTermsAccepted(parsed.termsAccepted);
        if (parsed.step) setStep(parsed.step);
      } catch (e) {
        console.warn("Failed to load venue draft", e);
      }
    }
  }, []);

  // Autosave
  useEffect(() => {
    if (isSubmitted) return;
    const saveDraft = () => {
      const stateObj = {
        venueName, address, mapsLink, ownerName, logoImage, bannerImage, type, capacity, stageSize,
        parking, greenRoom, lighting, sound, power, food, bar, facilityDetails, images,
        availableDays, preferredGenres, pricing, contactName, contactPhone, contactEmail, termsAccepted, step
      };
      localStorage.setItem("bpl_draft_venue", JSON.stringify(stateObj));
    };
    saveDraft();
  }, [
    venueName, address, mapsLink, ownerName, logoImage, bannerImage, type, capacity, stageSize,
    parking, greenRoom, lighting, sound, power, food, bar, facilityDetails, images,
    availableDays, preferredGenres, pricing, contactName, contactPhone, contactEmail, termsAccepted, step, isSubmitted
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, isSubmitted]);

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

  const onGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 8 - images.length;
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
      setImages((prev) => [...prev, ...newPhotos]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Validations per step
  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!venueName.trim()) stepErrors.venueName = "Venue name is required.";
      if (!address.trim()) stepErrors.address = "Address is required.";
      if (!ownerName.trim()) stepErrors.ownerName = "Owner name is required.";
      if (!bannerImage) stepErrors.banner = "Cover banner image is required.";
    }

    if (currentStep === 2) {
      if (!capacity.trim()) stepErrors.capacity = "Capacity range is required.";
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
      await db.submitApplication("venue", {
        venue_name: venueName,
        address: address,
        maps_link: mapsLink || undefined,
        owner_name: ownerName,
        logo_image: logoImage || undefined,
        banner_image: bannerImage,
        type: type,
        capacity: capacity,
        stage_size: stageSize || undefined,
        facilities: {
          parking,
          green_room: greenRoom,
          lighting,
          sound,
          power,
          food,
          bar,
          details: facilityDetails || undefined
        },
        images: images,
        availability: {
          days: availableDays,
          preferred_genres: preferredGenres || undefined
        },
        pricing: pricing || undefined,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
      });

      localStorage.removeItem("bpl_draft_venue");
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
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Venue Application Submitted!</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Thank you for applying. BPL Operations team will review your application details.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-surface/50 border border-border p-6 rounded-lg text-left space-y-4">
              {[
                { label: "Application Received", desc: "Files and photos saved to BPL venue database.", done: true },
                { label: "Staff Inspection", desc: "Verifying address, capacity range, and venue specs.", done: false },
                { label: "Technical Curation", desc: "Verifying sound, lighting system capacity, and riders.", done: false },
                { label: "League Licensing", desc: "Generating tour partnership agreement and licensing code.", done: false },
              ].map((stage, idx) => (
                <div key={stage.label} className="flex gap-4 relative">
                  {idx < 3 && (
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
              <Link to="/venues" className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold">
                Explore Venues
              </Link>
              <Link to="/" className="px-6 py-3 rounded-md border border-border bg-surface hover:text-primary-glow transition text-sm">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">BPL Onboarding Hub</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Venue Partner Onboarding</h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Register your venue to host official live gigs and matches. Autosaves progress.
              </p>
            </div>

            {/* Wizard Dots */}
            <div className="flex items-center justify-between px-2">
              {[
                { number: 1, label: "Identity" },
                { number: 2, label: "Size" },
                { number: 3, label: "Facilities" },
                { number: 4, label: "Gallery" },
                { number: 5, label: "Availability" },
                { number: 6, label: "Contact" },
              ].map((s, idx) => (
                <div key={s.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1 relative z-10 mx-auto">
                    <button 
                      type="button"
                      onClick={() => {
                        if (s.number < step) setStep(s.number);
                        else if (s.number > step) {
                          let valid = true;
                          for (let i = step; i < s.number; i++) {
                            if (!validateStep(i)) { valid = false; break; }
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Banner & Logo Preview */}
                  <div className="bpl-card overflow-hidden">
                    <div className="p-4 border-b border-border bg-surface/30">
                      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Venue Profile Preview</h2>
                    </div>

                    <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center border-b border-border">
                      {bannerImage ? (
                        <img src={bannerImage} alt="Banner" className="h-full w-full object-cover" />
                      ) : (
                        <p className="text-xs text-muted-foreground font-bold">No cover image uploaded</p>
                      )}
                      <button 
                        type="button"
                        onClick={() => bannerRef.current?.click()}
                        className="absolute top-3 right-3 z-30 bg-black/75 hover:bg-black/90 text-white rounded px-3 py-1.5 text-xs border border-white/10"
                      >
                        Upload Cover
                      </button>
                      <input type="file" ref={bannerRef} accept="image/*" onChange={onBannerChange} className="hidden" />
                    </div>

                    <div className="px-6 pb-6 relative">
                      <div className="flex items-end gap-4 -mt-10 relative z-20">
                        <div className="h-16 w-16 rounded bg-slate-800 border-2 border-background flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                          {logoImage ? (
                            <img src={logoImage} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <Building2 size={24} className="text-muted-foreground" />
                          )}
                          <button 
                            type="button"
                            onClick={() => logoRef.current?.click()}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px]"
                          >
                            Logo
                          </button>
                          <input type="file" ref={logoRef} accept="image/*" onChange={onLogoChange} className="hidden" />
                        </div>
                        <div className="mb-1">
                          <h3 className="font-semibold text-base text-white">{venueName || "Venue Name"}</h3>
                          <p className="text-xs text-muted-foreground"><MapPin size={11} className="inline mr-1" /> {address || "Venue Address"}</p>
                        </div>
                      </div>
                      {errors.banner && <p className="text-red-500 text-xs mt-2">{errors.banner}</p>}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="bpl-card p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Venue Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Hard Rock Cafe"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                        {errors.venueName && <p className="text-red-500 text-xs">{errors.venueName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Owner / Operator Name *</label>
                        <input 
                          type="text" 
                          placeholder="Legal entity or person name"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                        {errors.ownerName && <p className="text-red-500 text-xs">{errors.ownerName}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Street Address *</label>
                      <input 
                        type="text" 
                        placeholder="Complete location address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                      />
                      {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Google Maps Pin URL</label>
                      <input 
                        type="url" 
                        placeholder="https://maps.app.goo.gl/..."
                        value={mapsLink}
                        onChange={(e) => setMapsLink(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={handleNext} className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                      Next: Size & Type <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TYPE & SIZE */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Type & Size</h2>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Venue Type *</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        >
                          <option value="cafe" className="bg-background">Cafe / Lounge</option>
                          <option value="pub" className="bg-background">Pub / Bar / Club</option>
                          <option value="restaurant" className="bg-background">Restaurant</option>
                          <option value="college" className="bg-background">College Auditorium/Ground</option>
                          <option value="open-air" className="bg-background">Open-Air Amphitheater</option>
                          <option value="indoor" className="bg-background">Indoor Warehouse / Concert Hall</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Capacity (Pax) *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 500-600 Pax"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                        {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Stage Size (ft)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 30 x 18 ft"
                          value={stageSize}
                          onChange={(e) => setStageSize(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={handlePrev} className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 cursor-pointer">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                      Next: Facilities <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FACILITIES */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Available Facilities</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      {[
                        { label: "Parking Space", val: parking, set: setParking },
                        { label: "Artist Green Room", val: greenRoom, set: setGreenRoom },
                        { label: "Pro Lighting Rig", val: lighting, set: setLighting },
                        { label: "PA / Sound System", val: sound, set: setSound },
                        { label: "Backup Generator", val: power, set: setPower },
                        { label: "Food Catering", val: food, set: setFood },
                        { label: "Alcohol Bar License", val: bar, set: setBar },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center gap-2.5 bg-secondary/30 border border-border/80 p-3 rounded hover:border-primary/20 transition">
                          <input 
                            type="checkbox" 
                            id={f.label} 
                            checked={f.val} 
                            onChange={(e) => f.set(e.target.checked)}
                            className="h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary cursor-pointer"
                          />
                          <label htmlFor={f.label} className="text-xs text-white/90 select-none cursor-pointer">{f.label}</label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Additional Sound / Light / Tech Specs</label>
                      <textarea 
                        rows={3}
                        placeholder="Provide details about sound brand, monitor mixes, lighting board model..."
                        value={facilityDetails}
                        onChange={(e) => setFacilityDetails(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={handlePrev} className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 cursor-pointer">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                      Next: Photo Gallery <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: GALLERY */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <h2 className="font-display font-semibold text-lg text-primary-glow">Venue Gallery Photos</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Upload photos of the stage, bar, facade (max 8).</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => galleryRef.current?.click()}
                        disabled={images.length >= 8}
                        className="bg-primary/10 hover:bg-primary/20 disabled:opacity-50 border border-primary/30 text-primary-glow text-xs rounded px-3 py-1.5 flex items-center gap-1 transition cursor-pointer"
                      >
                        Upload Photos
                      </button>
                      <input type="file" ref={galleryRef} accept="image/*" multiple onChange={onGalleryChange} className="hidden" />
                    </div>

                    {errors.gallery && <p className="text-red-500 text-xs">{errors.gallery}</p>}

                    {images.length === 0 ? (
                      <div onClick={() => galleryRef.current?.click()} className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-surface/5 hover:bg-surface/10 cursor-pointer transition flex flex-col items-center justify-center gap-2">
                        <Camera size={24} />
                        <p className="text-xs font-semibold text-white">Click to upload stage/interior photos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((photo, idx) => (
                          <div key={idx} className="bpl-card overflow-hidden aspect-square relative group">
                            <img src={photo} alt={`Venue ${idx + 1}`} className="h-full w-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer transition"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={handlePrev} className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 cursor-pointer">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                      Next: Terms & Dates <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: AVAILABILITY & PRICING */}
              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <h2 className="font-display font-semibold text-lg border-b border-border pb-2 text-primary-glow">Availability & Terms</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Pricing / Revenue terms */}
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pricing / Revenue Share Model</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Fixed rate or 70/30 ticket split"
                          value={pricing}
                          onChange={(e) => setPricing(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                      </div>

                      {/* Preferred genres */}
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Preferred Music Genres</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rock, Indie, Acoustic, Metal"
                          value={preferredGenres}
                          onChange={(e) => setPreferredGenres(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                      </div>
                    </div>

                    {/* Days available */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Preferred Gig Days</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                          const active = availableDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                                active 
                                  ? "bg-primary border-primary text-primary-foreground" 
                                  : "border-border bg-secondary/40 text-muted-foreground"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={handlePrev} className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 cursor-pointer">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn-primary btn-primary-hover px-6 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                      Next: Contact details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: CONTACT DETAILS */}
              {step === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bpl-card p-6 space-y-4">
                    <div>
                      <h2 className="font-display font-semibold text-lg text-primary-glow">Contact Details (Private)</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Visible only to BPL booking curators.</p>
                    </div>
                    <div className="border-b border-border" />

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><User size={12} /> Contact Person Name *</label>
                      <input 
                        type="text" 
                        placeholder="Booking Manager name"
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
                          placeholder="e.g. venues@yourcafe.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
                        />
                        {errors.contactEmail && <p className="text-red-500 text-xs">{errors.contactEmail}</p>}
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="space-y-3 pt-4">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="venueTerms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 h-4 w-4 border-border rounded bg-secondary text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="venueTerms" className="text-xs text-muted-foreground leading-normal select-none cursor-pointer">
                          I agree to register this venue in BPL's catalog. I confirm all provided specifications are true and available.
                        </label>
                      </div>
                      {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-red-950/40 border border-red-900 rounded-md text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={16} /> {errors.submit}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={handlePrev} className="px-5 py-2.5 rounded border border-border bg-surface text-sm flex items-center gap-1 cursor-pointer">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary btn-primary-hover px-8 py-3 rounded-md text-sm font-semibold flex items-center gap-1 cursor-pointer">
                      {isSubmitting ? "Submitting..." : "Submit Venue Partner"}
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
