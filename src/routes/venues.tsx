import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Users, Speaker, Ruler, Phone, Mail, MapPin } from "lucide-react";
import venueImg from "@/assets/venue-1.jpg";
import crowdImg from "@/assets/crowd.jpg";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Venues — BPL" },
      {
        name: "description",
        content:
          "Browse partner venues across India. Capacity, stage, sound, past events and availability — book and apply as a venue partner.",
      },
      { property: "og:title", content: "Venues — BPL" },
      { property: "og:description", content: "The rooms where indie music happens." },
    ],
  }),
  component: VenuesPage,
});

function VenuesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-3">
          <img
            src={venueImg}
            alt="Venue"
            className="md:col-span-2 h-72 md:h-[420px] w-full object-cover rounded-xl border border-border"
          />
          <div className="grid gap-3">
            <img
              src={crowdImg}
              alt="Venue"
              className="h-full w-full object-cover rounded-xl border border-border"
              loading="lazy"
            />
            <img
              src={venueImg}
              alt="Venue"
              className="h-full w-full object-cover rounded-xl border border-border"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-lg bg-black flex items-center justify-center font-display font-bold">
                BLUE
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">BlueFROG</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={14} /> Delhi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Spec icon={Users} label="Capacity" value="700 Pax" />
              <Spec icon={Ruler} label="Stage" value="40 × 24 ft" />
              <Spec icon={Speaker} label="Sound" value="L-Acoustics" />
            </div>

            <Panel title="Past Events">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[crowdImg, venueImg, crowdImg, venueImg].map((i, x) => (
                  <img
                    key={x}
                    src={i}
                    alt="past"
                    loading="lazy"
                    className="aspect-square object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            </Panel>

            <Panel title="Availability — July 2025">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",").map((d) => (
                  <div key={d} className="py-2 text-muted-foreground uppercase tracking-wider">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
                  const busy = [12, 18, 22, 27].includes(n);
                  return (
                    <div
                      key={n}
                      className={`aspect-square rounded-md flex items-center justify-center ${busy ? "bg-primary/20 text-primary-glow border border-primary/40" : "border border-border"}`}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Contact">
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} /> +91 98765 43210
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} /> bookings@bluefrog.co.in
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} /> BlueFROG, Hauz Khas Village, New Delhi — 110016
                </p>
              </div>
            </Panel>
          </div>

          <aside className="space-y-4">
            <div className="bpl-card p-6 sticky top-24">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Partner with us
              </p>
              <h3 className="mt-1 text-xl font-display font-bold">List your venue</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get discovered by 1,200+ indie bands and dozens of production houses.
              </p>
              <button className="btn-primary btn-primary-hover mt-5 w-full rounded-md px-5 py-3 text-sm font-semibold">
                Apply as Venue Partner
              </button>
            </div>
          </aside>
        </div>
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
function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bpl-card p-4">
      <div className="text-primary-glow">
        <Icon size={20} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
