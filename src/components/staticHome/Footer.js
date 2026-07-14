import "./Footer.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState } from "react";
import { FiInstagram, FiYoutube, FiFacebook, FiTwitter, FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";

const NAV_COLS = [
  // {
  //   heading: "Product",
  //   links: [
  //     { label: "Features", href: "#" },
  //     { label: "Care Plans", href: "#" },
  //     { label: "Detection", href: "#" },
  //     { label: "Insights", href: "#" },
  //   ],
  // },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Guides", href: "#", internal: true, link: "/guides" },
      { label: "FAQs", href: "#", internal: true, link: "/faqs" },
      { label: "Support", href: "#", internal: true, link: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      // { label: "About Us", href: "#" },
      { label: "Terms of Service", href: "/policies/aquaai_terms_and_conditions.html", external: true },
      { label: "Refund Policy", href: "/policies/aquaai_refund_policy.html", external: true },
      { label: "Marketplace Policy", href: "/policies/aquaai_marketplace_policy.html", external: true },
      { label: "Cookies & Data Policy", href: "/policies/cookies_and_data_policy.html", external: true },
      // { label: "Data Processing Agreement", href: "/policies/aquaai_data_processing_agreement.html", external: true },
      { label: "Contact", href: "/contact", internal: true, link: "/contact" },
    ],
  },
];

const SOCIALS = [
  { icon: <FiInstagram />, label: "Instagram" },
  { icon: <FiYoutube />, label: "YouTube" },
  { icon: <FiFacebook />, label: "Facebook" },
  { icon: <FiTwitter />, label: "Twitter" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handlePolicyClick = (e, href, external) => {
    if (external) {
      e.preventDefault();
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <footer className="footer">
      <img src="/pond.png" alt="" className="footer-pond" />
      <Container fluid="xl">
        <Row className="footer-row gy-5">
          {/* ── Brand col ── */}
          <Col xs={12} md={3}>
            <div className="footer-brand">
              <div className="footer-logo">
                <span>AQUA AI®</span>
              </div>
              <p className="footer-tagline">
                AI-powered care for your aquarium.
                <br />
                Smarter insights, healthier fish,
                <br />
                happier you.
              </p>
            </div>
          </Col>

          {/* ── Nav cols ── */}
          {NAV_COLS.map((col) => (
            <Col key={col.heading} xs={6} md={2}>
              <h4 className="footer-col-heading">{col.heading}</h4>
              <ul className="footer-links">
                {col.links.map(({ label, href, external, internal, link }) => (
                  <li key={label}>
                    {internal ? (
                      <Link to={link} className="footer-link">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="footer-link" onClick={(e) => handlePolicyClick(e, href, external)}>
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Col>
          ))}

          {/* ── Newsletter col ── */}
          <Col xs={12} md={3}>
            <h4 className="footer-col-heading">Stay Updated</h4>
            <p className="footer-newsletter-body">
              Get the latest tips and updates
              <br />
              for your aquarium.
            </p>

            <div className="footer-email-wrap">
              <input type="email" className="footer-email-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="footer-email-btn" aria-label="Subscribe">
                <FiSend />
              </button>
            </div>

            <div className="footer-socials">
              {SOCIALS.map(({ icon, label }) => (
                <a key={label} href="#" className="footer-social-btn" aria-label={label}>
                  {icon}
                </a>
              ))}
            </div>
          </Col>
        </Row>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} AQUA AI®. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
