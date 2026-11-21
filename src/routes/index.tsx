import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Music2,
  BarChart3,
  Target,
  Layers,
  MapPin,
} from "lucide-react";
import hero from "@/assets/hero-concert.jpg";
import crowd from "@/assets/crowd.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalakshetra | Culture meets execution" },
      {
        name: "description",
        content:
          "An independent music venture and event operating system by Srihari Beesetti. Explore the product, launch strategy and illustrative event analytics.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="showcase">
      <header className="showcase-nav">
        <Link to="/" className="showcase-brand">
          <Music2 size={23} /> kalakshetra<span>®</span>
        </Link>
        <nav>
          <a href="#venture">The venture</a>
          <a href="#work">Selected work</a>
          <a href="#approach">Approach</a>
        </nav>
        <Link to="/login" className="showcase-link">
          Enter workspace <ArrowUpRight size={17} />
        </Link>
      </header>
      <main>
        <section
          className="showcase-hero"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(12,15,14,.94),rgba(12,15,14,.28)),url(${hero})`,
          }}
        >
          <div className="showcase-hero-copy">
            <p className="showcase-eyebrow">
              INDEPENDENT MUSIC. INTENTIONAL EXPERIENCES.
            </p>
            <h1>
              Good music.
              <br />
              Great company.
              <br />
              <em>Built to connect.</em>
            </h1>
            <p>
              A home for independent artists, intimate gigs, and the people who
              make them happen. From the first idea to the last encore.
            </p>
            <div className="showcase-actions">
              <Link to="/login" className="showcase-button">
                Explore the workspace <ArrowRight size={18} />
              </Link>
              <a href="#work" className="showcase-link">
                See the concept <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="showcase-credit">
              <span className="showcase-avatar">SB</span>
              <span>
                A venture concept by <strong>Srihari Beesetti</strong>
                <small>
                  Product thinking × go-to-market × event operations
                </small>
              </span>
            </div>
          </div>
          <div className="showcase-stamp">
            CULTURE
            <br />
            MEETS
            <br />
            <strong>EXECUTION ↗</strong>
          </div>
        </section>
        <section id="venture" className="showcase-section">
          <div className="showcase-section-title">
            <p className="showcase-eyebrow">01 / THE BIG PICTURE</p>
            <h2>
              The stage is only
              <br />
              half the story.
            </h2>
            <p>
              Kalakshetra brings discovery, artist coordination, venue
              partnerships, ticketing plans, and measurement into one operating
              model.
            </p>
          </div>
          <div className="showcase-metrics">
            {[
              ["4", "city launch thesis"],
              ["3", "event concepts"],
              ["6", "operating workstreams"],
              ["1", "connected workspace"],
            ].map(([n, l]) => (
              <div key={l}>
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <p className="showcase-note">
            Portfolio prototype · Illustrative scenarios and simulated numbers
            throughout. No completed events, commercial results, or partnerships
            are claimed.
          </p>
        </section>
        <section id="work" className="showcase-section">
          <div className="showcase-row">
            <div>
              <p className="showcase-eyebrow">02 / SELECTED EVENT CONCEPTS</p>
              <h2>Small stages. Big feelings.</h2>
            </div>
            <Link to="/login" className="showcase-link">
              Open event plans <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="showcase-event-grid">
            {[
              {
                name: "Chinni Viramam",
                city: "Hyderabad",
                type: "An intimate Telugu acoustic evening",
                image: hero,
              },
              {
                name: "After Hours, Unplugged",
                city: "Bengaluru",
                type: "Independent voices. A listening-room format.",
                image: crowd,
              },
              {
                name: "Coast & Chords",
                city: "Visakhapatnam",
                type: "A coastal community music concept",
                image: hero,
              },
            ].map((e, i) => (
              <Link to="/login" className="showcase-event" key={e.name}>
                <div
                  className="showcase-event-image"
                  style={{
                    backgroundImage: `url(${e.image})`,
                    backgroundPosition: i === 2 ? "right center" : "center",
                  }}
                >
                  <span>CONCEPT / 0{i + 1}</span>
                  <ArrowUpRight />
                </div>
                <p>
                  <MapPin size={13} />
                  {e.city}
                  <span>Planning scenario</span>
                </p>
                <h3>{e.name}</h3>
                <small>{e.type}</small>
              </Link>
            ))}
          </div>
        </section>
        <section id="approach" className="showcase-section showcase-approach">
          <div>
            <p className="showcase-eyebrow">03 / BEHIND THE EXPERIENCE</p>
            <h2>
              Creative instinct.
              <br />
              <em>Operational discipline.</em>
            </h2>
            <p>
              Explore how an idea becomes a launch plan, how acquisition is
              measured, and how the product supports the people doing the work.
            </p>
          </div>
          <div className="showcase-capabilities">
            {[
              {
                icon: Target,
                title: "Go-to-market",
                text: "Audience segments, channel experiments, city rollout, and a measurable ticket acquisition funnel.",
              },
              {
                icon: BarChart3,
                title: "Analytics & economics",
                text: "Attendance, channel conversion, contribution margin, and event-level decisions.",
              },
              {
                icon: Layers,
                title: "Product & operations",
                text: "Stakeholder journeys, prioritized roadmap, event checklists, and a connected ecosystem.",
              },
            ].map((c) => (
              <article key={c.title}>
                <c.icon size={22} />
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="showcase-cta">
          <p className="showcase-eyebrow">GO BACKSTAGE</p>
          <h2>See how it all comes together.</h2>
          <p>
            Explore the event plans, growth experiments, analytics, and the
            wider Kalakshetra structure.
          </p>
          <Link to="/login" className="showcase-button">
            Enter the workspace <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="showcase-footer">
        <strong>kalakshetra®</strong>
        <span>Built with intent by Srihari Beesetti.</span>
        <span>Portfolio concept · Demo data</span>
      </footer>
    </div>
  );
}
