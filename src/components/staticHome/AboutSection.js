import "./AboutSection.css";
import { FiAlertCircle, FiDroplet, FiShoppingCart, FiCalendar, FiUsers } from "react-icons/fi";
import { FaFish } from "react-icons/fa";
/* Feature pills that orbit the phone */
const PILLS = [
  { icon: FaFish, label: "Species ID", side: "left", top: "18%" },
  { icon: FiAlertCircle, label: "Disease Detection", side: "left", top: "42%" },
  { icon: FiDroplet, label: "Water Intelligence", side: "left", top: "66%" },
  { icon: FiShoppingCart, label: "Marketplace", side: "right", top: "24%" },
  { icon: FiCalendar, label: "Consultant Booking", side: "right", top: "50%" },
  { icon: FiUsers, label: "Breeder Network", side: "right", top: "74%" },
];

/* Status icons for the phone statusbar */
function StatusIcons() {
  return (
    <div className="ab-statusbar-icons">
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
        <path d="M8 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
        <path d="M2.5 4.5a7.9 7.9 0 0 1 11 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M4.5 6.5a5 5 0 0 1 7 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      </svg>
      <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
        <rect x="0.5" y="0.5" width="21" height="10" rx="3.5" stroke="currentColor" strokeOpacity="0.4" />
        <rect x="2" y="2" width="15" height="7" rx="2" fill="currentColor" />
        <path d="M23 3.5v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-inner">
        {/* ── Heading ── */}
        <div className="about-header">
          <p className="about-eyebrow">What is AQUA AI®?</p>
          <h2 className="about-title">
            The Smartest Way to
            <br />
            <span className="about-accent">Manage Your Aquarium</span>
          </h2>
        </div>

        {/* ── Phone + floating pills ── */}
        <div className="about-visual">
          {/* Left pills */}
          {PILLS.filter((p) => p.side === "left").map((pill) => (
            <div key={pill.label} className="about-pill about-pill--left" style={{ top: pill.top }}>
              <div className="about-pill-inner">
                <div className="about-pill-icon">
                  <pill.icon size={16} />
                </div>
                <span>{pill.label}</span>
              </div>
              {/* Dotted connector line */}
              <div className="about-connector about-connector--left" />
              {/* Dot at phone end */}
              <div className="about-dot" />
            </div>
          ))}

          {/* Centre: iPhone */}
          <div className="about-phone-wrap">
            {/* Glow */}
            <div className="about-phone-glow" />
            <div className="about-phone-glow about-phone-glow--2" />

            <div className="ab-iphone">
              <div className="ab-screen">
                <div className="ab-statusbar">
                  <span className="ab-time">9:41</span>
                  <div className="ab-island" />
                  <StatusIcons />
                </div>

                <div className="ab-scroll-track">
                  <img src="/appSS.png" alt="AQUA AI® app" className="ab-screenshot" draggable="false" />
                </div>
              </div>
              <div className="ab-home-bar" />
            </div>
          </div>

          {/* Right pills */}
          {PILLS.filter((p) => p.side === "right").map((pill) => (
            <div key={pill.label} className="about-pill about-pill--right" style={{ top: pill.top }}>
              {/* Dot at phone end */}
              <div className="about-dot" />
              {/* Dotted connector */}
              <div className="about-connector about-connector--right" />
              <div className="about-pill-inner">
                <div className="about-pill-icon">
                  <pill.icon size={16} />
                </div>
                <span>{pill.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Body copy below ── */}
        <div className="about-copy">
          <p className="about-body">
            AQUA AI® is an intelligent aquarium and pond management platform that combines artificial intelligence with real-world aquatic expertise to transform how people care for aquatic life.
          </p>
          <p className="about-body">
            At its core, AQUA AI® gives hobbyists the tools that were previously only available to professionals. Scan your tank to identify species from a database of over 20,000. Detect disease
            early through AI-powered image analysis. Monitor water quality with intelligent interpretation that doesn't just show you numbers — it tells you what they mean and what to do next. Every
            habitat gets a personalised care plan that adapts as conditions change.
          </p>
          <p className="about-body">
            But AQUA AI® is more than a monitoring tool. Our marketplace connects the entire aquatics community in one trusted ecosystem. Breeders list and sell livestock directly to hobbyists with
            full order management, delivery tracking, and quality assurance built in. Consultants offer their professional services through an integrated booking system with in-app communication and
            verified trust scoring. Hobbyists can browse, buy, book, and learn — all in one place.
          </p>

          <p className="about-body">
            Behind everything is an intelligence layer that learns from every interaction. The more the community uses the platform, the smarter the recommendations become — healthier habitats, better
            breeding outcomes, stronger businesses, and a more connected aquatics community.{" "}
          </p>

          <p className="about-body">AQUA AI® is a product of Humara, a Tech company building intelligent platforms that elevate industries through data, AI, and community.</p>
        </div>
      </div>
    </section>
  );
}
