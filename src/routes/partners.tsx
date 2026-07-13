import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import {
  Music,
  Building2,
  Factory,
  Star,
  HandHeart,
  GraduationCap,
  Camera,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — Choose your role — BPL" },
      {
        name: "description",
        content:
          "Join BPL as a band, venue, production house, sponsor, volunteer, college, media partner or influencer. Choose your role and apply.",
      },
      { property: "og:title", content: "Partners — Choose your role — BPL" },
      {
        property: "og:description",
        content: "Partner with BPL and be part of India's live music revolution.",
      },
    ],
  }),
  component: PartnersPage,
});

const ROLES = [
  { icon: Music, name: "Band" },
  { icon: Building2, name: "Venue" },
  { icon: Factory, name: "Production House" },
  { icon: Star, name: "Sponsor" },
  { icon: HandHeart, name: "Volunteer" },
  { icon: GraduationCap, name: "College" },
  { icon: Camera, name: "Media" },
  { icon: Sparkles, name: "Influencer" },
];

function PartnersPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Partner Page"
        title="Choose your role."
        subtitle="Partner with BPL and be a part of the music revolution."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
          {ROLES.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="bpl-card p-6 text-center group hover:border-primary transition"
            >
              <div className="mx-auto h-16 w-16 rounded-xl bg-primary/15 text-primary-glow flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
                <Icon size={28} />
              </div>
              <p className="mt-4 font-display font-semibold text-lg">{name}</p>
              <button className="mt-4 w-full rounded-md border border-primary/40 bg-primary/10 text-primary-glow px-3 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
