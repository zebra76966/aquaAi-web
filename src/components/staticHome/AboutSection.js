import "./AboutSection.css";

function StatusIcons() {
  return (
    <div className="iphone-statusbar-icons">
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

function IPhoneMockup() {
  return (
    <div className="iphone-frame">
      {/* 1. Dynamic Island — sits in the frame above the screen */}

      {/* 3. Screen — clipped scroll window */}
      <div className="iphone-screen">
        <div className="iphone-statusbar">
          <span className="iphone-time">9:41</span>
          <div className="iphone-island" />
          <StatusIcons />
        </div>
        <div className="iphone-scroll-track">
          <img src="/appSS.png" alt="Aqua AI app screenshot" className="iphone-screenshot" draggable="false" />
        </div>
      </div>

      {/* 4. Home indicator bar — below screen */}
      <div className="iphone-home-bar" />
    </div>
  );
}

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-inner">
        <div className="about-copy">
          <p className="about-eyebrow">What is Aqua AI?</p>
          <h2 className="about-title">
            The Smartest Way to
            <br />
            <span className="about-accent">Manage Your Aquarium</span>
          </h2>
          <p className="about-body">
            Aqua AI is an AI-powered aquarium and pond management platform built for hobbyists, breeders, and aquatic professionals. From species identification across a database of 20,000+ species to
            real-time disease detection — every feature is designed to keep your habitat thriving.
          </p>
          <p className="about-body">
            Our water intelligence engine interprets your test strip readings and flags risks before they become problems. AI care plans adapt to your specific fish, tank size, and water chemistry —
            personalised to you, not generic advice.
          </p>
          <p className="about-body">
            Connect with verified breeders to source new stock, book certified aquatic consultants, and buy or sell in our peer-to-peer marketplace. Every interaction teaches the system. Every data
            point makes recommendations smarter.
          </p>
          <div className="about-pills">
            {["Species ID", "Disease Detection", "Water Intelligence", "Marketplace", "Consultant Booking"].map((t) => (
              <span key={t} className="about-pill">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="about-mockup">
          <div className="mockup-glow mockup-glow--1" />
          <div className="mockup-glow mockup-glow--2" />
          <IPhoneMockup />
        </div>
      </div>
    </section>
  );
}
