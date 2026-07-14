import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import {
  Trophy,
  TrendingUp,
  Users,
  ShieldCheck,
  Music,
  Sparkles,
  ArrowRight,
  BarChart3,
  Shuffle,
  DollarSign,
  Target,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kalakshetra" },
      {
        name: "description",
        content:
          "Kalakshetra is a season-long artist development league — not a booking platform. Production houses invest in bands, a live points table drives competition, and artists can merge into entirely new acts.",
      },
      { property: "og:title", content: "About — Kalakshetra" },
      {
        property: "og:description",
        content:
          "A talent development league for independent music. Season-long investment, a real competition with standings, artist recombination, and built-in financial protection.",
      },
    ],
  }),
  component: AboutPage,
});

const DIFFERENTIATORS = [
  {
    icon: Trophy,
    title: "Season-long investment",
    body:
      "Production houses don't book a single show — they bid to back bands for the entire season. Investment in music production, video content, and audience-building. In return, they share in the revenue those bands generate through ticket sales, streams, and fan growth.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    icon: BarChart3,
    title: "A real competition with standings",
    body:
      "Bands compete on a live points table — built from audience turnout, engagement, and verified votes. At the end of the season, top-performing bands compete for a final prize pool decided by the audience they built themselves. The scoring formula is public. Everything is transparent.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: Shuffle,
    title: "Artist recombination",
    body:
      "Individual artists can be matched and merged into entirely new bands — a singer, a guitarist, and a drummer who've never played together, brought into one act through the league itself. Fully opt-in. Some of the season's most exciting acts may not exist yet.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    icon: ShieldCheck,
    title: "Built-in financial protection",
    body:
      "Every stakeholder operates in a structured, ROI-protected model with transparent revenue splits agreed before the season starts. We built the systems so no one loses money by trusting the league, and no one can game their way to the top of the table.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
];

const MECHANICS = [
  {
    icon: BarChart3,
    title: "Points Table — How It Works",
    items: [
      "Scoring formula is public: 40% attendance, 30% revenue, 30% verified votes.",
      "Votes are tied to verified ticket purchases — one vote per verified account per show.",
      "Raw vote count alone is never the deciding factor; it must cost something real to cast.",
      "All score inputs trace back to actual payment processor records, not self-reported numbers.",
    ],
  },
  {
    icon: DollarSign,
    title: "Prize Pool — Where It Comes From",
    items: [
      "A defined cut of event revenue per show goes into a ring-fenced prize pool account.",
      "Sponsor contributions are tracked separately and transparently alongside event revenue.",
      "Pool funds are held in a dedicated account, separate from operating revenue.",
      "The full structure is disclosed before Season 1 begins — no surprises at the final.",
    ],
  },
  {
    icon: Shuffle,
    title: "Artist Merging — How It's Protected",
    items: [
      "Fully opt-in. Artists list instruments, genres, and availability; express interest; the league facilitates.",
      "No league-assigned pairings — an artist never gets placed in a band they didn't agree to join.",
      "Merged bands start fresh on the points table — no inherited points from member solo performances.",
      "Prevents gaming: merging with a strong performer doesn't buy standing.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Anti-Cheating Framework",
    items: [
      "Fake ticket sales (inflating attendance scores) → all sales go through the payment processor; no self-reporting.",
      "Vote manipulation → votes are tied to verified phone accounts with purchase history.",
      "Venue-band collusion to fake attendance → cross-verified with independent door count and revenue data.",
      "Every score input must trace to a real, verifiable transaction.",
    ],
  },
];

function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-500/4 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/8 text-primary-glow text-[10px] uppercase font-bold tracking-widest">
            <Sparkles size={10} /> About Kalakshetra
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">
            Built for the sound{" "}
            <span className="gradient-text">of a new India.</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kalakshetra isn't just a stage-booking platform — it's a season-long artist development league.
          </p>
        </div>
      </section>

      {/* Core Statement */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="bpl-card p-8 md:p-12 space-y-5 border-primary/20 bg-primary/3 text-left">
          <div className="flex items-center gap-2 text-primary-glow text-xs font-bold uppercase tracking-widest">
            <Music size={14} />
            The Idea
          </div>
          <p className="text-white text-lg leading-relaxed font-medium">
            Every season, production houses bid to back bands — not just for a single show, but to invest in their music, their video content, and their growth across the season. In return, production houses share in the revenue those bands generate through ticket sales, streams, and audience growth.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Bands compete on a live <strong className="text-white">points table</strong> — built from audience turnout, engagement, and votes — not just prize money. At the end of the season, top-performing bands compete for a <strong className="text-white">final prize pool</strong>, decided by the audience they built themselves.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kalakshetra also creates something no other platform does: <strong className="text-white">individual artists can be matched and merged into entirely new bands</strong> — a singer, a guitarist, and a drummer who've never played together, brought into one act through the league itself. Some of the season's most exciting acts may not exist yet.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every stakeholder — bands, production houses, venues, organisers — operates in a structured, ROI-protected model, with transparent revenue splits agreed before the season starts. We built the systems so no one loses money by trusting the league, and no one can game their way to the top of the table.
          </p>
        </div>
      </section>

      {/* Four Differentiators */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">What Makes Us Different</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Four things no booking platform does.
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            These four structural differences are what make Kalakshetra a league, not a marketplace.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {DIFFERENTIATORS.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className={`bpl-card p-7 text-left space-y-4 hover:border-primary/40 transition-all duration-300 ${d.border}`}
              >
                <div className={`h-12 w-12 rounded-lg ${d.bg} border ${d.border} flex items-center justify-center ${d.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{d.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{d.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">Our Foundation</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Ragam · Talam · Pallavi</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The three core elements of Indian classical music, re-imagined for the modern independent artist.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Raagam",
              sub: "The Sound of Dreams",
              body: "Every artist starts with a dream and a unique voice. Raagam represents the melodies, the creative spark, and the sonic identity that define an independent act.",
              color: "text-amber-400",
              bg: "bg-amber-400/10",
              border: "border-amber-400/20",
            },
            {
              title: "Taalam",
              sub: "The Beat of Community",
              body: "Music is nothing without listeners. Taalam is the heartbeat of the community — venues, cafes, organisers, and fans that keep the independent movement alive.",
              color: "text-rose-400",
              bg: "bg-rose-400/10",
              border: "border-rose-400/20",
            },
            {
              title: "Pallavi",
              sub: "The Start of Every Artist",
              body: "The first verse that launches a thousand songs. Pallavi is the ultimate platform — structured competition, production backing, and real stages that launch bands from garage to national.",
              color: "text-purple-400",
              bg: "bg-purple-400/10",
              border: "border-purple-400/20",
            },
          ].map((p) => (
            <div key={p.title} className={`bpl-card p-8 text-left space-y-4 hover:border-primary/40 transition-all duration-300 ${p.border}`}>
              <div className={`h-12 w-12 rounded-lg ${p.bg} border ${p.border} flex items-center justify-center`}>
                <Music size={22} className={p.color} />
              </div>
              <div>
                <h3 className={`text-2xl font-display font-bold text-white`}>{p.title}</h3>
                <p className={`text-xs font-semibold mt-0.5 ${p.color}`}>{p.sub}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mechanics Deep Dive */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">How It Actually Works</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            The mechanics, in plain language.
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Transparency is not a promise — it's a structural requirement. Here's exactly how each mechanic operates.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {MECHANICS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="bpl-card p-7 text-left space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-white text-base">{m.title}</h3>
                </div>
                <ul className="space-y-3">
                  {m.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <div className="h-4 w-4 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary-glow shrink-0 mt-0.5 text-[9px] font-bold">
                        {i + 1}
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Season 1 — Current State */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="bpl-card p-8 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Target size={18} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white">Where we are right now — Season 1 pilot</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We're in the Hyderabad pilot phase — targeting 4 bands, 6 venues, 24 shows over 8 weeks, with ₹11.77L in projected revenue. Applications for bands, artists, venues, and production houses are open. The community numbers shown elsewhere on this site (2,500 student clubs, etc.) are Season 2 growth targets, not current headcounts.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every partner we list on this site is a real registered entity. Every stat we show as current is verified. If something says "target" or "pilot," that's exactly what it means.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center">
        <div className="bpl-card p-12 space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Ready to join the league?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Register as a Band, Artist, Venue, Production House, or Creative Crew and be part of building India's first independent music league.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/onboarding"
              className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
            >
              <Sparkles size={16} /> Join Kalakshetra
            </Link>
            <Link
              to="/league"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition"
            >
              <TrendingUp size={16} /> View the League
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
