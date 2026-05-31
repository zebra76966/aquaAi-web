import "./AppDownloadSection.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiTrendingUp, FiCalendar, FiBell, FiShield } from "react-icons/fi";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { GiWaves } from "react-icons/gi";
import ReviewsBanner from "./ReviewsBanner";
import { motion } from "framer-motion";

const MINI_FEATURES = [
  { icon: MdOutlineQrCodeScanner, label: "Scan & Detect", body: "Identify fish issues instantly with AI" },
  { icon: FiTrendingUp, label: "AI Insights", body: "Get smart, actionable insights in seconds" },
  { icon: FiCalendar, label: "Personalised Care Plans", body: "Custom plans tailored to your tank" },
  { icon: FiBell, label: "Alerts & Reminders", body: "Stay ahead with real-time notifications" },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const slidePhone = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.9,
  },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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

/** Front phone — upright with scrolling screenshot */
function FrontPhone() {
  return (
    <div className="iphone-frame iphone-frame--front">
      {/* 1. Island */}

      {/* 3. Screen */}
      <div className="iphone-screen">
        {/* 2. Status bar */}
        <div className="iphone-statusbar">
          <span className="iphone-time">9:41</span>
          <div className="iphone-island" />
          <StatusIcons />
        </div>

        <div className="iphone-scroll-track">
          <img src="/appSS.png" alt="Aqua AI app" className="iphone-screenshot" draggable="false" />
        </div>
      </div>
      {/* 4. Home bar */}
      <div className="iphone-home-bar" />
    </div>
  );
}

/** Back phone — tilted, partially visible behind front */
function BackPhone() {
  return (
    <div className="iphone-frame iphone-frame--back">
      <div className="iphone-island iphone-island--small" />
      <div className="iphone-screen iphone-screen--back">
        <img src="/appSS.png" alt="" className="iphone-screenshot" draggable="false" style={{ opacity: 0.6 }} />
      </div>
      <div className="iphone-home-bar" />
    </div>
  );
}

function PhoneHero() {
  return (
    <div className="app-phones">
      <div className="app-phones-glow" />
      <div className="app-phones-glow app-phones-glow--2" />
      <BackPhone />
      <FrontPhone />
    </div>
  );
}

export default function AppDownloadSection() {
  return (
    <>
      <section className="app-dl-section" id="download">
        <img src="/pond.png" alt="" className="pond-bg opacity-50" aria-hidden="true" />

        <Container fluid="xl">
          <Row className="align-items-center gy-5">
            {/* Left copy */}
            <Col xs={12} lg={6}>
              <motion.div className="app-dl-copy" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: false }}>
                <p className="app-dl-eyebrow">Download the Aqua AI App</p>
                <h2 className="app-dl-title">
                  Smarter Aquarium
                  <br />
                  <span className="app-dl-accent">Care in Your Pocket</span>
                </h2>
                <div className="app-dl-waves">
                  <GiWaves />
                </div>
                <p className="app-dl-body">Monitor water quality, detect diseases early, get AI insights, and keep your fish healthy — anytime, anywhere.</p>

                <div className="app-dl-features">
                  {MINI_FEATURES.map(({ icon: Icon, label, body }) => (
                    <motion.div
                      key={label}
                      className="app-dl-feat"
                      variants={fadeUp}
                      whileHover={{
                        y: -6,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="app-dl-feat-icon">
                        <Icon />
                      </div>
                      <div>
                        <p className="app-dl-feat-label">{label}</p>
                        <p className="app-dl-feat-body">{body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="app-dl-heading-store">Download Aqua AI Now</div>
                <div className="app-dl-badges">
                  {/* Apple badge */}
                  <a href="#" className="app-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="app-badge-icon">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div>
                      <span className="app-badge-sub">Download on the</span>
                      <span className="app-badge-store">App Store</span>
                    </div>
                  </a>

                  {/* Google Play badge using IoLogoGooglePlaystore */}
                  <a href="#" className="app-badge">
                    <IoLogoGooglePlaystore className="app-badge-icon app-badge-icon--play" />
                    <div>
                      <span className="app-badge-sub">GET IT ON</span>
                      <span className="app-badge-store">Google Play</span>
                    </div>
                  </a>
                </div>
              </motion.div>
            </Col>

            {/* Right: phones */}
            <Col xs={12} lg={6} className="d-flex justify-content-center">
              <motion.div
                variants={slidePhone}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  },
                }}
              >
                <PhoneHero />
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
      <ReviewsBanner />
    </>
  );
}
