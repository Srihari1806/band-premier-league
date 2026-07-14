import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { MapPin, TrendingUp, Users, Sparkles } from "lucide-react";
import crowdImg from "@/assets/crowd.jpg";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Venues — Kalakshetra" },
      {
        name: "description",
        content:
          "Partner venues for Kalakshetra Season 1 — cafes, pubs, and live music spaces hosting the indie league across India.",
      },
      { property: "og:title", content: "Venues — Kalakshetra" },
      {
        property: "og:description",
        content: "Be the room where indie music happens. Partner with Kalakshetra for Season 1.",
      },
    ],
  }),
  component: VenuesPage,
});

function VenuesPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative">
        <img
          src={crowdImg}
          alt="Live venue crowd"
          className="h-64 md:h-[340px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-2">Season 1</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white">
            Venue Partners
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Empty state */}
          <div className="bpl-card p-14 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <MapPin size={28} className="text-primary-glow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-white">
                No venues listed yet
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                We're scouting cafes and live music spaces for Season 1. Partner venues get revenue splits, co-branding, and a permanent slot in the league fixture calendar.
              </p>
            </div>
            <Link
              to="/join"
              className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              <Sparkles size={14} /> Register Your Venue
            </Link>
          </div>

          {/* What venue partnership means */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white">
              What venue partnership means
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: TrendingUp,
                  title: "Revenue splits",
                  desc: "Earn a share of ticket revenue for every show hosted at your space. No upfront fees.",
                },
                {
                  icon: Users,
                  title: "Built-in audience",
                  desc: "Kalakshetra promotes every gig to its fan base — you get footfall, not just a booking.",
                },
                {
                  icon: MapPin,
                  title: "League fixture slot",
                  desc: "Partner venues are locked into the Season 1 calendar — recurring shows, not one-offs.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bpl-card p-5 space-y-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon size={16} className="text-primary-glow" />
                  </div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar CTA */}
        <aside>
          <div className="bpl-card p-6 sticky top-24 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Partner with us
            </p>
            <h3 className="text-xl font-display font-bold text-white">List your venue</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cafes, pubs, campus stages, and auditoriums are all welcome. Season 1 slots are limited — early partners get priority in the fixture draw.
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                "Revenue share on every show",
                "Co-branding and social promotion",
                "Priority in Season 1 fixture draw",
                "Dedicated Kalakshetra venue page",
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-primary-glow mt-0.5">✓</span>
                  {pt}
                </li>
              ))}
            </ul>
            <Link
              to="/join"
              className="btn-primary btn-primary-hover mt-2 w-full rounded-md px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Sparkles size={14} /> Apply as Venue Partner
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
