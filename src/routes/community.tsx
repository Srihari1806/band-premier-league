import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import {
  GraduationCap,
  Coffee,
  MapPin,
  HandHeart,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Kalakshetra" },
      {
        name: "description",
        content:
          "Join the Kalakshetra community — student clubs, café circles, city ambassadors, and volunteers powering Season 1.",
      },
      { property: "og:title", content: "Community — Kalakshetra" },
      {
        property: "og:description",
        content: "The people who make Kalakshetra happen. Join before Season 1.",
      },
    ],
  }),
  component: CommunityPage,
});

const PILLARS = [
  {
    icon: GraduationCap,
    name: "Student Clubs",
    desc: "College music clubs that host watch parties, promote gigs, and bring campus crowds to shows.",
    cta: "Register your club",
  },
  {
    icon: Coffee,
    name: "Café Communities",
    desc: "Café and bar regulars who champion live indie nights and help fill partner venues.",
    cta: "Join a café circle",
  },
  {
    icon: MapPin,
    name: "City Ambassadors",
    desc: "On-the-ground reps who help grow Kalakshetra's presence in their city — first cohort forming now.",
    cta: "Become an ambassador",
  },
  {
    icon: HandHeart,
    name: "Volunteers",
    desc: "Creative crew, event staff, and social contributors who keep the show running behind the scenes.",
    cta: "Join as volunteer",
  },
];

const CHANNELS = [
  {
    icon: MessageCircle,
    name: "Discord",
    desc: "Real-time conversations — bands, fans, organisers in one server.",
    cta: "Join Discord",
  },
  {
    icon: Send,
    name: "WhatsApp Community",
    desc: "Quick updates, event alerts, and city-specific groups.",
    cta: "Join WhatsApp",
  },
];

function CommunityPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Community"
        title="Powered by people."
        subtitle="The clubs, cafés, ambassadors, and volunteers who make Kalakshetra happen. Season 1 community is forming now — be part of it from day one."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-12">
        {/* Community pillars */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-white">Get involved</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PILLARS.map(({ icon: Icon, name, desc, cta }) => (
              <div key={name} className="bpl-card p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/15 text-primary-glow flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  <Link
                    to="/join"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary-glow font-semibold hover:underline"
                  >
                    <Sparkles size={10} /> {cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Communication channels */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-white">Stay connected</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHANNELS.map(({ icon: Icon, name, desc, cta }) => (
              <div key={name} className="bpl-card p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/15 text-primary-glow flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  <button type="button" className="mt-2 text-xs text-primary-glow font-semibold hover:underline">
                    {cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season 1 CTA banner */}
        <div className="bpl-card p-10 text-center space-y-4 border-primary/20 bg-primary/5">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">
            Season 1 — now forming
          </p>
          <h2 className="text-2xl font-display font-bold text-white">
            Be part of it from the first show
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The community leaderboard, ambassador rankings, and season rewards kick in when Season 1 launches. Early members get founding-member status.
          </p>
          <Link
            to="/join"
            className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
          >
            <Sparkles size={14} /> Join Kalakshetra
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
