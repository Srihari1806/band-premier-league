import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Calendar, Bell, Music, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-concert.jpg";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Kalakshetra" },
      {
        name: "description",
        content:
          "Kalakshetra live events — Season 1 shows being planned across India. Register to get notified when tickets go live.",
      },
      { property: "og:title", content: "Events — Kalakshetra" },
      {
        property: "og:description",
        content: "Season 1 gigs are being planned. Be the first to know.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative">
        <img
          src={heroImg}
          alt="Live concert"
          className="h-64 md:h-[340px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-2">Season 1</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white">
            Upcoming Events
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 space-y-12">
        {/* Empty state */}
        <div className="bpl-card p-16 text-center space-y-5 max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Calendar size={28} className="text-primary-glow" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-white">
              No events scheduled yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We're yet to host our first show. Season 1 gigs are being lined up across India — the calendar opens when the first band and venue slots are confirmed.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/join"
              className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              <Sparkles size={14} /> Apply as a Band
            </Link>
            <Link
              to="/join"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/30 hover:bg-secondary/50 text-white px-5 py-2.5 text-sm font-semibold transition"
            >
              <Bell size={14} /> Get Notified
            </Link>
          </div>
        </div>

        {/* What to expect */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-white text-center">
            What a Kalakshetra show looks like
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Music,
                title: "Live indie acts",
                desc: "Original music only. Every set is a league fixture — bands earn points, rankings, and production backing.",
              },
              {
                icon: Calendar,
                title: "Fixed ticket tiers",
                desc: "Standard, Premium, and Franchise VIP passes. Standard tickets include a café F&B voucher at partner venues.",
              },
              {
                icon: Bell,
                title: "Fan pass ecosystem",
                desc: "Season passes let fans follow their favourite bands across the full league calendar — not just one night.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bpl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon size={18} className="text-primary-glow" />
                </div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
