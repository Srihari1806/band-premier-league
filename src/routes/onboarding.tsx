import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { upsertProfile } from "@/lib/supabase";

import {
  Music,
  User,
  Building2,
  Tv,
  Megaphone,
  Award,
  Users,
  CalendarRange,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  SkipForward
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Select Role — Kalakshetra" },
      {
        name: "description",
        content: "Choose your role to join the Kalakshetra independent music ecosystem.",
      },
    ],
  }),
  component: OnboardingSelectionPage,
});

const ROLE_CARDS = [
  {
    role: "band",
    title: "Band",
    description: "Form or register a multi-member band lineup to tour and compete.",
    icon: Music,
    to: "/join/band",
    search: { type: "band" },
    badge: "Compete & Tour",
  },
  {
    role: "artist",
    title: "Artist",
    description: "Register your individual professional music profile and portfolio.",
    icon: User,
    to: "/join/band",
    search: { type: "artist" },
    badge: "Portfolio & Network",
  },
  {
    role: "venue",
    title: "Venue / Cafe",
    description: "Host official gigs, tour shows, and partner for revenue splits.",
    icon: Building2,
    to: "/join/venue",
    search: {},
    badge: "Host Tour Matches",
  },
  {
    role: "production_house",
    title: "Label / Production House",
    description: "Support artist production, buy bidding stakes, and manage catalogs.",
    icon: Tv,
    to: "/join/production-house",
    search: {},
    badge: "Invest in IP",
  },
  {
    role: "sponsor",
    title: "Sponsor",
    description: "Fund franchises, sponsor match stages, or advertise in streams.",
    icon: Megaphone,
    to: "/join/sponsor",
    search: {},
    badge: "Corporate Partner",
  },
  {
    role: "influencer",
    title: "Influencer / Media",
    description: "Review gigs, create vlogs, and amplify platform promotions.",
    icon: Award,
    to: "/join/influencer",
    search: {},
    badge: "Content Creator",
  },
  {
    role: "volunteer",
    title: "Creative Crew",
    description: "Work as an independent photographer, sound tech, or ambassador.",
    icon: Users,
    to: "/join/volunteer",
    search: { role: "volunteer" },
    badge: "Freelance / Crew",
  },
  {
    role: "event_manager",
    title: "Event Manager",
    description: "Manage local on-site gig logistics, security, and match setup.",
    icon: CalendarRange,
    to: "/join/event-manager",
    search: {},
    badge: "Ecosystem Operations",
  },
];

function OnboardingSelectionPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isSupabaseConfigured } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    // Wait for Supabase auth to resolve
    if (isSupabaseConfigured && authLoading) return;

    if (isSupabaseConfigured && !session) {
      navigate({ to: "/login" });
      return;
    }

    const currentAccount = db.getCurrentAccount();
    if (!isSupabaseConfigured && !currentAccount) {
      navigate({ to: "/login" });
      return;
    }
    setAccount(currentAccount);
  }, [navigate, authLoading, session, isSupabaseConfigured]);

  const handleSelectRole = async (card: typeof ROLE_CARDS[0]) => {
    if (saving) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured && session) {
        // Save role in Supabase profiles (non-blocking, fire and forget)
        upsertProfile(session.user.id, {
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
          role: card.role,
        }).catch(() => {});
      }

      
      // Update local storage role
      const currentAccount = db.getCurrentAccount();
      if (currentAccount) {
        currentAccount.onboarded = true;
        localStorage.setItem("bpl_current_account", JSON.stringify(currentAccount));
        localStorage.setItem("bpl_user_onboarded", "true");
      }

      // Navigate to the role's application form
      navigate({
        to: card.to as any,
        search: card.search as any,
      });
    } catch (err) {
      console.error("Failed to select role", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Mark as onboarded locally to let them access dashboard
    const currentAccount = db.getCurrentAccount();
    if (currentAccount) {
      currentAccount.onboarded = true;
      localStorage.setItem("bpl_current_account", JSON.stringify(currentAccount));
      localStorage.setItem("bpl_user_onboarded", "true");
    }
    navigate({ to: "/dashboard" });
  };

  // Only block render while auth is still resolving — profile fetch is non-critical
  if (!account || (isSupabaseConfigured && authLoading)) {

    return (
      <PageShell>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    );
  }

  const hasWorkspaces = account.workspaces && account.workspaces.length > 0;

  return (
    <PageShell>
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center px-4 py-16">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl w-full text-center space-y-12 relative z-10 animate-fade-in">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary-glow text-[10px] uppercase font-bold tracking-widest mx-auto">
              <Sparkles size={10} /> Account Setup
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              Welcome to <span className="gradient-text">Kalakshetra</span>
            </h1>
            <p className="text-sm text-primary-glow/80 uppercase font-semibold tracking-widest max-w-md mx-auto">
              The Home of Independent Music
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-normal">
              Choose how you'd like to participate in the ecosystem. You can register multiple roles under one account.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.role}
                  disabled={saving}
                  onClick={() => handleSelectRole(card)}
                  className="bpl-card p-5 hover:border-primary/40 hover:bg-secondary/40 transition-all duration-300 group flex flex-col justify-between cursor-pointer w-full text-left disabled:opacity-50"
                >
                  <div className="space-y-4 w-full">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary-glow group-hover:scale-105 transition-transform duration-300">
                        <Icon size={20} />
                      </div>
                      {card.badge && (
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary border border-border px-2 py-0.5 rounded">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-white group-hover:text-primary-glow transition-colors duration-200">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-normal line-clamp-3">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary-glow transition-colors duration-200 w-full">
                    Register Role <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer controls & Skip for now */}
          <div className="flex flex-col items-center gap-3 pt-6 border-t border-border/30 max-w-md mx-auto text-xs text-muted-foreground leading-relaxed">
            <button
              onClick={handleSkip}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-secondary/40 hover:bg-secondary text-white font-bold transition text-xs cursor-pointer"
            >
              <SkipForward size={12} />
              Skip for now
            </button>
            <p className="flex items-center gap-1.5 mt-2">
              <ShieldCheck size={14} className="text-primary-glow" /> Users can manage multiple roles and workspaces from their dashboard.
            </p>
            {hasWorkspaces && (
              <Link
                to="/dashboard"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary hover:bg-slate-800 border border-border text-white text-xs font-semibold transition"
              >
                <LayoutDashboard size={12} /> Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
