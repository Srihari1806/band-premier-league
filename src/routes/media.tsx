import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Play } from "lucide-react";
import bandImg from "@/assets/band-1.jpg";
import crowdImg from "@/assets/crowd.jpg";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media — BPL" },
      {
        name: "description",
        content:
          "Latest songs, videos, press and the BPL media kit — everything you need to cover India's indie scene.",
      },
      { property: "og:title", content: "Media — BPL" },
      { property: "og:description", content: "Songs, videos and press from the league." },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Media" title="Songs, videos and stories from the league." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-10">
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Latest Songs</h2>
          <div className="bpl-card divide-y divide-border">
            {[
              ["Runaway", "The F16s", "03:45"],
              ["Kehna Tha", "Paper Plane", "04:12"],
              ["Zinda", "Kryptos", "04:40"],
              ["Safarnama", "When Chai Met Toast", "03:58"],
              ["Neon Sky", "Blakc", "04:05"],
            ].map(([n, a, l], i) => (
              <div key={n} className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{n}</p>
                  <p className="text-xs text-muted-foreground">{a}</p>
                </div>
                <p className="text-xs text-muted-foreground">{l}</p>
                <button className="text-primary-glow">
                  <Play size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Videos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[bandImg, crowdImg, bandImg, crowdImg, bandImg, crowdImg].map((img, i) => (
              <div
                key={i}
                className="relative aspect-video overflow-hidden rounded-lg border border-border"
              >
                <img src={img} alt="video" loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                  <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                    <Play size={22} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
