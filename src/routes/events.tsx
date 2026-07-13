import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";
import bandImg from "@/assets/band-1.jpg";
import crowdImg from "@/assets/crowd.jpg";
import heroImg from "@/assets/hero-concert.jpg";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Kalakshetra" },
      {
        name: "description",
        content:
          "Book indie shows across India. Line-ups, venues, schedules, ticket tiers and live stats for every Kalakshetra event.",
      },
      { property: "og:title", content: "Events — Kalakshetra" },
      {
        property: "og:description",
        content: "The Kalakshetra live calendar — bookings, sponsors and live stats.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <PageShell>
      <section className="relative">
        <img src={heroImg} alt="Event poster" className="h-72 md:h-[380px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3">Live Show</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white">Kurukshetra Campus Clash</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> 12 OCT 2026 · 6:00 PM
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} /> AntiSOCIAL, Bangalore
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Bands">
            <div className="flex flex-wrap gap-4">
              {["The F16s", "Kryptos", "Blakc", "When Chai Met Toast"].map((n) => (
                <div key={n} className="flex items-center gap-3 bpl-card px-4 py-2.5">
                  <div className="h-9 w-9 rounded-full overflow-hidden border border-border">
                    <img src={bandImg} alt={n} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-sm font-medium">{n}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Schedule">
            <div className="divide-y divide-border">
              {[
                ["5:00 PM", "Doors Open"],
                ["6:00 PM", "The F16s"],
                ["7:00 PM", "Kryptos"],
                ["8:00 PM", "Aswekeepsearching"],
              ].map(([t, e]) => (
                <div key={t} className="flex items-center gap-6 py-3">
                  <p className="text-primary-glow font-semibold w-24">{t}</p>
                  <p>{e}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Sponsors">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["RedBull", "Jack & Jones", "boAt", "Monster"].map((s) => (
                <div key={s} className="bpl-card px-4 py-6 text-center font-display font-semibold">
                  {s}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Gallery">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[crowdImg, bandImg, crowdImg, bandImg].map((i, x) => (
                <img
                  key={x}
                  src={i}
                  alt="gallery"
                  loading="lazy"
                  className="aspect-square object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Tickets">
            <div className="space-y-3">
              {[
                ["Standard Pass", "₹199"],
                ["Premium Supporter Pass", "₹499"],
                ["Franchise VIP Pass", "₹999"],
              ].map(([n, p]) => (
                <div
                  key={n}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{n}</p>
                    {n === "Standard Pass" && (
                      <p className="text-[10px] text-primary-glow mt-0.5">* Includes complimentary ₹100 F&B food coupon</p>
                    )}
                  </div>
                  <p className="font-display font-bold text-lg">{p}</p>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground leading-normal pt-1">
                * All standard entry tickets are tied to our cafe-partner F&B voucher program. Support your local venues and bands directly.
              </p>
              <button className="btn-primary btn-primary-hover w-full rounded-md px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Ticket size={16} /> Book Tickets
              </button>
            </div>
          </Panel>

          <Panel title="Live Statistics">
            <div className="grid grid-cols-2 gap-3">
              <Stat v="812" l="Attendees" />
              <Stat v="1.2K" l="Live Views" />
              <Stat v="₹3.4L" l="Revenue" />
              <Stat v="98%" l="Capacity" />
            </div>
          </Panel>
        </aside>
      </div>
    </PageShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bpl-card p-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xl font-display font-bold gradient-text">{v}</p>
      <p className="text-xs text-muted-foreground">{l}</p>
    </div>
  );
}
