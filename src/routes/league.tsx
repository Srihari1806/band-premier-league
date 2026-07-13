import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";

export const Route = createFileRoute("/league")({
  head: () => ({
    meta: [
      { title: "The League — BPL" },
      {
        name: "description",
        content:
          "How BPL runs. Seasons, formats, cities and how bands, venues and production houses climb the league.",
      },
      { property: "og:title", content: "The League — BPL" },
      { property: "og:description", content: "How the Bharat Premier League runs across India." },
    ],
  }),
  component: LeaguePage,
});

function LeaguePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="The League"
        title="One season. Twelve cities. One winner."
        subtitle="A structured competitive circuit for India's indie bands — with real production support, real venues and real audiences."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-6 md:grid-cols-3">
        {[
          [
            "01",
            "Qualifiers",
            "City-level auditions and campus rounds decide who enters the league.",
          ],
          [
            "02",
            "Season",
            "16-week circuit across 12 cities with live shows and streaming coverage.",
          ],
          [
            "03",
            "Finals",
            "Top bands battle at the BPL Season Final, backed by production houses and sponsors.",
          ],
        ].map(([n, t, d]) => (
          <div key={n} className="bpl-card p-6">
            <p className="text-4xl font-display font-bold gradient-text">{n}</p>
            <h3 className="mt-3 text-xl font-display font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
