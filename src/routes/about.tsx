import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BPL" },
      {
        name: "description",
        content:
          "BPL is India's first and largest platform for indie bands. Our story, our mission and the team behind the league.",
      },
      { property: "og:title", content: "About — BPL" },
      {
        property: "og:description",
        content: "The story and mission behind the Bharat Premier League for indie bands.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About BPL"
        title="Built for the sound of a new India."
        subtitle="BPL is India's first and largest platform connecting indie bands, venues, production houses and fans."
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-6 text-muted-foreground">
        <p>
          We started BPL because India's indie music scene deserved more than one-off gigs and
          algorithmic scraps. It deserved a league — a stage, a season, a story worth following.
        </p>
        <p>
          Today BPL runs shows in 56 cities, works with 1,200+ bands and helps production houses
          discover, sign and back the next wave of Indian sound.
        </p>
        <p className="text-foreground font-medium">The stage is yours. The league is ours.</p>
      </div>
    </PageShell>
  );
}
