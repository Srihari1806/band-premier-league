import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  ArrowUpRight,
  Music2,
  LogOut,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "Venture Workspace | Kalakshetra" }] }),
  component: Workspace,
});
const events = [
  {
    name: "Chinni Viramam",
    city: "Hyderabad",
    capacity: 120,
    tickets: 96,
    price: 499,
    cost: 36000,
    stage: "Launch planning",
  },
  {
    name: "After Hours, Unplugged",
    city: "Bengaluru",
    capacity: 150,
    tickets: 108,
    price: 599,
    cost: 48000,
    stage: "Venue shortlist",
  },
  {
    name: "Coast & Chords",
    city: "Visakhapatnam",
    capacity: 100,
    tickets: 82,
    price: 399,
    cost: 27000,
    stage: "Audience research",
  },
];
const channels = [
  {
    name: "Instagram content",
    reach: 12000,
    visits: 960,
    tickets: 144,
    spend: 6000,
  },
  {
    name: "Campus ambassadors",
    reach: 4000,
    visits: 600,
    tickets: 90,
    spend: 3000,
  },
  {
    name: "Artist communities",
    reach: 2400,
    visits: 400,
    tickets: 52,
    spend: 1200,
  },
];
const sections = [
  "Overview",
  "Event operations",
  "Growth & GTM",
  "Analytics",
  "Product roadmap",
  "Ecosystem",
] as const;
type Section = (typeof sections)[number];
function Workspace() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("Overview");
  const [city, setCity] = useState("All cities");
  const [done, setDone] = useState<string[]>([]);
  const [demo, setDemo] = useState(false);
  // Demo access is separate from authentication and never grants account or operator privileges.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDemo(sessionStorage.getItem("kalakshetra_demo") === "true");
    setReady(true);
  }, []);
  if (loading || !ready) return <div className="p-12">Loading workspace…</div>;
  if (!session && !demo)
    return (
      <div className="showcase showcase-cta">
        <h1>Go backstage.</h1>
        <p>Sign in or choose the sample workspace to explore.</p>
        <Link to="/login" className="showcase-button">
          Continue to login
        </Link>
      </div>
    );
  const filtered = events.filter(
    (e) => city === "All cities" || e.city === city,
  );
  const revenue = filtered.reduce((a, e) => a + e.tickets * e.price, 0);
  const costs = filtered.reduce((a, e) => a + e.cost, 0);
  const tickets = filtered.reduce((a, e) => a + e.tickets, 0);
  const capacity = filtered.reduce((a, e) => a + e.capacity, 0);
  const money = (n: number) => "₹" + n.toLocaleString("en-IN");
  const exportData = () => {
    const csv = [
      "Event,City,Capacity,Simulated tickets,Price,Simulated revenue,Simulated cost",
      ...filtered.map((e) =>
        [
          e.name,
          e.city,
          e.capacity,
          e.tickets,
          e.price,
          e.tickets * e.price,
          e.cost,
        ].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "kalakshetra-simulated-events.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="showcase workspace">
      <aside className="workspace-sidebar">
        <Link to="/" className="showcase-brand">
          <Music2 /> kalakshetra
        </Link>
        <p className="showcase-eyebrow">VENTURE WORKSPACE</p>
        <nav>
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              aria-current={active === s ? "page" : undefined}
              className={active === s ? "active" : ""}
            >
              {s}
              <ArrowUpRight size={15} />
            </button>
          ))}
        </nav>
        <div className="workspace-person">
          <span className="showcase-avatar">SB</span>
          <div>
            <strong>Srihari Beesetti</strong>
            <small>Venture concept & product</small>
          </div>
        </div>
        <Link to="/dashboard" className="showcase-link">
          My account <ArrowUpRight size={15} />
        </Link>
        <button
          className="showcase-link"
          onClick={() => {
            sessionStorage.removeItem("kalakshetra_demo");
            navigate({ to: "/" });
          }}
        >
          <LogOut size={15} />
          Exit workspace
        </button>
      </aside>
      <main className="workspace-main">
        <header className="workspace-top">
          <Link to="/" className="showcase-link">
            <ArrowLeft size={15} /> Public showcase
          </Link>
          <span className="workspace-badge">SIMULATED PORTFOLIO DATA</span>
        </header>
        <div className="showcase-row">
          <div>
            <p className="showcase-eyebrow">
              KALAKSHETRA / {active.toUpperCase()}
            </p>
            <h1>
              {active === "Overview"
                ? "A little culture. A lot of moving parts."
                : active}
            </h1>
            <p className="workspace-muted">
              Plan the experience. Measure what matters. Make the next call.
            </p>
          </div>
          <button onClick={exportData} className="showcase-button">
            <Download size={16} />
            Export sample CSV
          </button>
        </div>
        <div className="workspace-notice">
          Demo environment · All attendance, revenue, conversion, and partner
          examples are fictional planning inputs. They are not evidence of
          delivered events or business results.
        </div>
        {(["Overview", "Analytics", "Event operations"] as Section[]).includes(
          active,
        ) && (
          <>
            <label className="workspace-filter">
              Scenario city{" "}
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {["All cities", ...events.map((e) => e.city)].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="workspace-kpis">
              {[
                [String(tickets), "Simulated tickets"],
                [
                  `${Math.round((tickets / capacity) * 100)}%`,
                  "Capacity utilization",
                ],
                [money(revenue), "Gross ticket revenue"],
                [money(revenue - costs), "Event contribution*"],
              ].map(([n, l]) => (
                <article key={l}>
                  <small>{l}</small>
                  <strong>{n}</strong>
                </article>
              ))}
            </div>
          </>
        )}
        {(active === "Overview" || active === "Event operations") && (
          <section className="workspace-panel">
            <div className="showcase-row">
              <h2>Event portfolio</h2>
              <span>3 planning scenarios</span>
            </div>
            <div className="workspace-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Experience</th>
                    <th>City</th>
                    <th>Stage</th>
                    <th>Tickets / capacity</th>
                    <th>Gross revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.name}>
                      <td>{e.name}</td>
                      <td>{e.city}</td>
                      <td>
                        <span className="workspace-badge">{e.stage}</span>
                      </td>
                      <td>
                        {e.tickets} / {e.capacity}
                      </td>
                      <td>{money(e.tickets * e.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {active === "Overview" && (
          <div className="workspace-columns">
            <section className="workspace-panel">
              <p className="showcase-eyebrow">NEXT DECISION</p>
              <h2>Validate demand before booking.</h2>
              <p>
                Run a city-specific waitlist experiment. Commit to a venue only
                after qualified interest and projected contribution clear the
                launch threshold.
              </p>
              <button
                className="showcase-link"
                onClick={() => setActive("Growth & GTM")}
              >
                Explore launch strategy <ArrowUpRight size={17} />
              </button>
            </section>
            <section className="workspace-panel">
              <p className="showcase-eyebrow">PRODUCT STRUCTURE</p>
              <h2>One ecosystem. Six workstreams.</h2>
              <p>
                Artist supply → venue matching → audience acquisition → event
                delivery → measurement → community retention.
              </p>
              <button
                className="showcase-link"
                onClick={() => setActive("Ecosystem")}
              >
                Explore the structure <ArrowUpRight size={17} />
              </button>
            </section>
          </div>
        )}
        {active === "Event operations" && (
          <section className="workspace-panel">
            <h2>Launch readiness checklist</h2>
            <p>
              {done.length} of 5 tasks complete · Changes last for this visit.
            </p>
            {[
              "Validate 50 qualified waitlist signups",
              "Shortlist venue and confirm technical rider",
              "Confirm artist availability and commercial terms",
              "Review budget and break-even attendance",
              "Prepare run-of-show and cancellation policy",
            ].map((task) => (
              <label className="workspace-task" key={task}>
                <input
                  type="checkbox"
                  checked={done.includes(task)}
                  onChange={() =>
                    setDone((d) =>
                      d.includes(task)
                        ? d.filter((t) => t !== task)
                        : [...d, task],
                    )
                  }
                />
                {task}
              </label>
            ))}
          </section>
        )}
        {active === "Growth & GTM" && (
          <>
            <div className="workspace-columns">
              {[
                [
                  "Audience",
                  "Telugu independent-music listeners, students, and young professionals seeking intimate live experiences.",
                ],
                [
                  "Launch thesis",
                  "Start with Hyderabad. Validate with artist-led content and campus waitlists before expanding to Bengaluru, Vizag, and Vijayawada.",
                ],
                [
                  "Experiment",
                  "Compare acoustic rehearsal clips with artist-story reels. Primary metric: qualified waitlist signups per ₹1,000 spent.",
                ],
                [
                  "Decision rule",
                  "Proceed at 50 qualified leads per city and acquisition cost below ₹75; otherwise revise positioning and rerun. These are proposed thresholds.",
                ],
              ].map(([t, p]) => (
                <section className="workspace-panel" key={t}>
                  <h2>{t}</h2>
                  <p>{p}</p>
                </section>
              ))}
            </div>
            <section className="workspace-panel">
              <h2>Illustrative acquisition funnel</h2>
              <div className="workspace-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Reach</th>
                      <th>Visits</th>
                      <th>Tickets</th>
                      <th>Visit → ticket</th>
                      <th>Cost / ticket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((c) => (
                      <tr key={c.name}>
                        <td>{c.name}</td>
                        <td>{c.reach.toLocaleString()}</td>
                        <td>{c.visits}</td>
                        <td>{c.tickets}</td>
                        <td>{((c.tickets / c.visits) * 100).toFixed(1)}%</td>
                        <td>{money(Math.round(c.spend / c.tickets))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Channel tickets sum to 286, matching the event scenarios.
                Attribution assumes one channel per ticket.
              </p>
            </section>
          </>
        )}
        {active === "Analytics" && (
          <section className="workspace-panel">
            <h2>Event economics</h2>
            {filtered.map((e) => (
              <div className="workspace-economics" key={e.name}>
                <div className="showcase-row">
                  <strong>{e.name}</strong>
                  <span>
                    {Math.round((e.tickets / e.capacity) * 100)}% filled
                  </span>
                </div>
                <progress
                  max={e.capacity}
                  value={e.tickets}
                  aria-label={`${e.name} capacity utilization`}
                />
                <p>
                  Break-even: {Math.ceil(e.cost / e.price)} tickets · Budget:{" "}
                  {money(e.cost)} · Contribution:{" "}
                  {money(e.tickets * e.price - e.cost)}
                </p>
              </div>
            ))}
            <p>
              *Contribution = gross ticket revenue − scenario event costs.
              Excludes taxes, refunds, payment fees, and overhead. Break-even
              assumes a fixed event budget and unchanged ticket price.
            </p>
          </section>
        )}
        {active === "Product roadmap" && (
          <div className="workspace-columns">
            {[
              [
                "Now / Validate",
                "P0 · Artist and venue discovery",
                "Interview artists and venue operators; validate willingness to pay and the booking workflow. Success: 10 interviews and 3 intent confirmations.",
              ],
              [
                "Next / Launch",
                "P1 · Event operating workspace",
                "Coordinate budgets, owners, run-of-show, and audience acquisition. Success: a pilot with complete cost and attendance capture.",
              ],
              [
                "Later / Retain",
                "P2 · Community & recommendations",
                "Test repeat-attendance journeys and personalized discovery after establishing a reliable event supply. Success: repeat booking within 60 days.",
              ],
            ].map(([phase, title, text]) => (
              <section className="workspace-panel" key={phase}>
                <p className="showcase-eyebrow">{phase}</p>
                <h2>{title}</h2>
                <p>{text}</p>
                <span className="workspace-badge">
                  Proposed · Not delivered
                </span>
              </section>
            ))}
          </div>
        )}
        {active === "Ecosystem" && (
          <div className="workspace-columns">
            {[
              {
                to: "/bands",
                title: "Artists & bands",
                text: "Discover the talent and artist registry.",
              },
              {
                to: "/venues",
                title: "Venue network",
                text: "Explore spaces and venue requirements.",
              },
              {
                to: "/league",
                title: "Band Premiere League",
                text: "Tournament structure, zones, and formats.",
              },
              {
                to: "/economics",
                title: "Business model",
                text: "Explore the existing economics and revenue structure.",
              },
              {
                to: "/season",
                title: "Season planning",
                text: "Season formats and rollout structure.",
              },
              {
                to: "/community",
                title: "Community",
                text: "The people and partners around the experience.",
              },
              {
                to: "/handbook",
                title: "Operating handbook",
                text: "Rules, governance, and delivery standards.",
              },
              {
                to: "/calendar",
                title: "Calendar",
                text: "Explore the scheduling structure.",
              },
            ].map((item) => (
              <Link to={item.to} key={item.to} className="workspace-panel">
                <ArrowUpRight />
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
