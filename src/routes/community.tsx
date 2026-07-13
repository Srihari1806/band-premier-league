import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import {
  GraduationCap,
  Coffee,
  MapPin,
  HandHeart,
  MessageCircle,
  Send,
  Trophy,
} from "lucide-react";
import bandImg from "@/assets/band-1.jpg";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — BPL" },
      {
        name: "description",
        content:
          "The people powering the league. Student clubs, cafe communities, city ambassadors, volunteers, Discord, WhatsApp and the leaderboard.",
      },
      { property: "og:title", content: "Community — BPL" },
      { property: "og:description", content: "Join 3,000+ music fans across India." },
    ],
  }),
  component: CommunityPage,
});

const GROUPS = [
  { icon: GraduationCap, name: "Student Clubs", desc: "Connect with 2,500+ college music clubs" },
  { icon: Coffee, name: "Cafe Communities", desc: "Engage with 350+ cafe music communities" },
  { icon: MapPin, name: "City Ambassadors", desc: "120+ ambassadors across 25+ cities" },
  { icon: HandHeart, name: "Volunteers", desc: "Join 1,200+ volunteers across India" },
  { icon: MessageCircle, name: "Discord", desc: "Join our Discord server" },
  { icon: Send, name: "WhatsApp", desc: "Join our WhatsApp Community" },
];

function CommunityPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Community"
        title="Powered by people."
        subtitle="The clubs, cafes, ambassadors and volunteers who make BPL happen."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          {GROUPS.map(({ icon: Icon, name, desc }) => (
            <div key={name} className="bpl-card p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/15 text-primary-glow flex items-center justify-center">
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button className="text-xs uppercase tracking-widest text-primary-glow">Join</button>
            </div>
          ))}
        </div>

        <div className="bpl-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Trophy className="text-primary-glow" size={22} />
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
              Leaderboard — Top Contributors This Season
            </h2>
          </div>
          <div className="divide-y divide-border">
            {[
              ["Aarav", "Bangalore", "2,340"],
              ["Riya", "Mumbai", "2,105"],
              ["Kabir", "Delhi", "1,988"],
              ["Zara", "Hyderabad", "1,760"],
            ].map(([n, c, p], i) => (
              <div key={n} className="flex items-center gap-4 py-3">
                <p className="w-6 text-muted-foreground">#{i + 1}</p>
                <div className="h-10 w-10 rounded-full overflow-hidden border border-border">
                  <img src={bandImg} alt={n} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{n}</p>
                  <p className="text-xs text-muted-foreground">{c}</p>
                </div>
                <p className="font-display font-bold gradient-text">{p} pts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
