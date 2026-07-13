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
      { title: "The League & Model — Raaga of Kurukshetra" },
      {
        name: "description",
        content:
          "How Raaga of Kurukshetra runs. Seasons, formats, cities and the 40/30/30 revenue splits powering the indie music ecosystem.",
      },
      { property: "og:title", content: "Raaga of Kurukshetra — League & Model" },
      { property: "og:description", content: "How the Raaga of Kurukshetra tournament runs across India." },
    ],
  }),
  component: LeaguePage,
});

function LeaguePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Raaga of Kurukshetra (Raaga of Revenge)"
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
            "Top bands battle at the Raaga of Kurukshetra Grand Finale, backed by production houses and sponsors.",
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
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">How Payouts Work</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kalakshetra acts as an asset-light coordinator. We enforce a transparent **40/30/30 event payout structure** and a **50/50 digital content royalty split** to align investor and artist incentives.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Split 1 */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                  <Music size={22} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold text-white">40% Share</h3>
                  <p className="text-sm font-bold text-primary-glow mt-1">To Artists (Live Events)</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bands receive a direct 40% split of ticket pass sales per show. They also retain a 50% share of all digital music stream and video monetization royalties.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ecosystem Value: Artist Livelihood</span>
              </div>
            </div>

            {/* Split 2 */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                  <Tv size={22} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold text-white">30% Share</h3>
                  <p className="text-sm font-bold text-primary-glow mt-1">To Production House (Investor)</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The band's investing Production House receives a 30% ticketing split per show. This aligns their incentives directly with the live performance success of their drafted roster.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ecosystem Value: Franchise ROI</span>
              </div>
            </div>

            {/* Split 3 */}
            <div className="bpl-card p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-glow">
                  <Percent size={22} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold text-white">30% Share</h3>
                  <p className="text-sm font-bold text-primary-glow mt-1">To Kalakshetra Operator</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kalakshetra retains 30% of ticket pass sales. This commission covers tournament operations, prize pools, software license fees, and outsourcing on-ground event coordinators.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ecosystem Value: Tournament Operations</span>
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
              We believe in validating economic assumptions on the ground before national scaling. Kalakshetra is launching an initial **8-week proof-of-concept pilot in Hyderabad** to optimize ticketing splits, validate the ₹199 entry price hook, and capture real fan attendance data.
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
                This Hyderabad proof-of-concept serves as our seed pitch metrics. It replaces nationwide assumptions with validated, local operational benchmarks.
              </p>
            </div>
          </div>

        </div>
      </section>

    </PageShell>
  );
}
