import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { 
  Percent, 
  Music, 
  Building2, 
  Tv, 
  Megaphone, 
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/league")({
  head: () => ({
    meta: [
      { title: "The League & Model — BPL" },
      {
        name: "description",
        content:
          "How BPL runs. Seasons, formats, cities and the 50/30/20 revenue splits powering the indie music ecosystem.",
      },
      { property: "og:title", content: "The League & Business Model — BPL" },
      { property: "og:description", content: "How the Bharat Premier League runs across India." },
    ],
  }),
  component: LeaguePage,
});

function LeaguePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="The League Circuit"
        title="One season. Twelve cities. One winner."
        subtitle="A structured competitive circuit for India's indie bands — with real production support, real venues and real audiences."
      />
      
      {/* 3 Step Timeline */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-6 md:grid-cols-3">
        {[
          [
            "01",
            "Qualifiers",
            "City-level auditions and campus rounds decide who enters the league.",
          ],
          [
            "02",
            "Season Matchups",
            "8-week circuit across partner cafes and venues with live shows and streaming coverage.",
          ],
          [
            "03",
            "League Finals",
            "Top bands battle at the BPL Grand Finale, backed by production houses and sponsors.",
          ],
        ].map(([n, t, d]) => (
          <div key={n} className="bpl-card p-6 text-left">
            <p className="text-4xl font-display font-bold gradient-text">{n}</p>
            <h3 className="mt-3 text-lg font-display font-semibold text-white">{t}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>

      {/* REVENUE SPLITS SECTION */}
      <section className="border-t border-border bg-slate-950/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">The Business Engine</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">How the Ecosystem Model Works</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              BPL shifts the music industry from sporadic promoter bookings to a franchise-backed sports league model. We enforce a transparent **50/30/20 revenue split** to ensure sustainable growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Split 1 */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                  <Percent size={22} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold text-white">50% Share</h3>
                  <p className="text-sm font-bold text-primary-glow mt-1">Direct to Bands</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bands receive a direct 50% split of ticket and pass sales. This matches them with recurring performance revenues, supported by franchise sponsors and production-house capital.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ecosystem Value: Live IP Retention</span>
              </div>
            </div>

            {/* Split 2 */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold text-white">30% Share</h3>
                  <p className="text-sm font-bold text-primary-glow mt-1">To Partner Venues</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Venues/Cafes receive a 30% ticket split to offset setup expenses. More importantly, BPL's ₹199 pass drives massive footfall, dramatically amplifying the venue's core Food & Beverage (F&B) sales.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ecosystem Value: Stadium Infrastructure</span>
              </div>
            </div>

            {/* Split 3 */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                  <Tv size={22} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold text-white">20% Share</h3>
                  <p className="text-sm font-bold text-primary-glow mt-1">To BPL Network</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  BPL retains 20% of ticketing, streaming rights splits, and franchise licensing fees. This capital manages the scoring software, marketing curation, and city qualifying stages.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ecosystem Value: League Operations</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section className="border-t border-border py-20 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-left space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary-glow font-bold">Launch Strategy</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">The Phase 1 Validation Pilot</h2>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              We believe in validating economic assumptions on the ground before national scaling. BPL is launching an initial **8-week proof-of-concept pilot in Hyderabad** to optimize ticketing splits, validate the ₹199 entry price hook, and capture real fan attendance data.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-primary-glow shrink-0 border border-border">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Single City Focus (Hyderabad)</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Operating within 6 curated partner cafes to run localized weekend tournaments.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-primary-glow shrink-0 border border-border">
                  <Music size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Targeted Roster (4 Bands)</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Rotating 4 selected pilot bands to validate repeat attendance and fan base crossover.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-primary-glow shrink-0 border border-border">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">24 Live Matches</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">A structured schedule designed to build steady weekend gig habits among local college communities.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link 
                to="/join"
                className="btn-primary btn-primary-hover inline-flex items-center gap-2 rounded-md px-5 py-3 text-xs font-semibold text-white"
              >
                Apply to Join the Pilot <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Pilot Target Stats Box */}
          <div className="bpl-card p-8 text-left space-y-6 bg-gradient-to-br from-secondary/50 to-transparent">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Hyderabad Pilot Economics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Modeled target projections per month.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-surface/30">
                <p className="text-xs text-muted-foreground font-semibold">Standard Pass</p>
                <p className="text-xl font-display font-bold text-primary-glow mt-1">₹199</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Includes ₹100 F&B coupon</p>
              </div>

              <div className="p-4 border border-border rounded-lg bg-surface/30">
                <p className="text-xs text-muted-foreground font-semibold">Passes Target</p>
                <p className="text-xl font-display font-bold text-primary-glow mt-1">200 / Month</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Fan membership target</p>
              </div>

              <div className="p-4 border border-border rounded-lg bg-surface/30">
                <p className="text-xs text-muted-foreground font-semibold">Ecosystem Revenue</p>
                <p className="text-xl font-display font-bold text-primary-glow mt-1">₹11.77 Lakhs</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Projected monthly total</p>
              </div>

              <div className="p-4 border border-border rounded-lg bg-surface/30">
                <p className="text-xs text-muted-foreground font-semibold">Operator Net Income</p>
                <p className="text-xl font-display font-bold text-primary-glow mt-1">₹4.55 Lakhs</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Net target after payouts</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex gap-2 text-primary-glow font-semibold text-xs items-center">
                <TrendingUp size={14} />
                <span>Verification Path</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                This Hyderabad proof-of-concept serves as our seed pitch metrics. It replaces nationwide assumptions with validated, local operational benchmarks to de-risk our later 12-city roll-out.
              </p>
            </div>
          </div>

        </div>
      </section>

    </PageShell>
  );
}
