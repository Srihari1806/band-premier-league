import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kalakshetra" },
      {
        name: "description",
        content:
          "Kalakshetra is the ultimate home of independent music, connecting artists, venues, and communities. Discover our story and mission.",
      },
      { property: "og:title", content: "About — Kalakshetra" },
      {
        property: "og:description",
        content: "The story and mission behind Kalakshetra — the home of independent music.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About Kalakshetra"
        title="Built for the sound of a new India."
        subtitle="Kalakshetra is the ultimate home of independent music, connecting indie bands, venues, production houses, and communities."
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-6 text-muted-foreground">
        <p>
          We started Kalakshetra because India's indie music scene deserved more than one-off gigs
          and algorithmic scraps. It deserved a home—a stage, a structured philosophy (Ragam · Talam
          · Pallavi), and a grand arena worth following.
        </p>
        <p>
          Today Kalakshetra runs shows, coordinates with hundreds of independent bands, and helps
          production houses discover, sign, and back the next wave of Indian sound through our
          tournament segment, Raaga of Kurukshetra.
        </p>
        <p className="text-foreground font-medium">The Home of Independent Music.</p>
      </div>
    </PageShell>
  );
}
