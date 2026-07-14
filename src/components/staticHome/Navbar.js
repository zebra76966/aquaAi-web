import "./Navbar.css";
import { useState } from "react";
import { FiMenu, FiX, FiArrowRight, FiDownload } from "react-icons/fi";
import { GiWaves } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Features", sub: "Explore what AQUA AI® can do", type: "internal", to: "/features" },
  { label: "How It Works", sub: "Step-by-step walkthrough", type: "internal", to: "/how-it-works" },
  { label: "Pricing", sub: "Plans for every aquarist", type: "internal", to: "/pricing" },
  { label: "User Guides /FAQs", sub: "Get the most from the app", type: "internal", to: "/faqs" },
  { label: "Contact Us", sub: "We're here to help", type: "internal", to: "/contact" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Fixed bar ── */}
      <nav className={`navbar${open ? " navbar--open" : ""}`}>
        <div className="navbar-inner w-100">
          {/* Logo */}
          <a href="/" className="navbar-logo" onClick={close}>
            <img src="/favicon32.png" alt="AQUA AI® Logo" className="navbar-logo-img" />

            <span>AQUA AI®</span>
          </a>

          <Link to="/download" className="navbar-download d-none d-lg-inline" onClick={close}>
            <FiDownload className="navbar-download-icon" />
            Download App
          </Link>

          {/* Right side: Download + Menu */}
          <div className="navbar-right">
            <Link to="/login" className="navbar-download d-none d-lg-inline" onClick={close}>
              Welcome Back
            </Link>
            <button
              className="nav-footer-btn nav-footer-btn--outline d-none d-lg-inline"
              onClick={() => {
                navigate("/register");
                close();
              }}
            >
              Join US
            </button>

            <Link to="/download" className="navbar-download d-inline d-lg-none" onClick={close}>
              <FiDownload className="navbar-download-icon" />
              Download
            </Link>

            <button className="navbar-menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
              <span className="navbar-menu-label">MENU</span>
              <div className="navbar-menu-circle">{open ? <FiX /> : <FiMenu />}</div>
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-overlay${open ? " nav-overlay--open" : ""}`} aria-hidden={!open}>
        {/* Decorative background elements */}
        <div className="nav-overlay-glow nav-overlay-glow--1" />
        <div className="nav-overlay-glow nav-overlay-glow--2" />

        <div className="nav-overlay-inner">
          <ul className="nav-overlay-links">
            {NAV_LINKS.map(({ label, sub, type, to }, i) => (
              <li key={label} className="nav-overlay-item" style={{ "--i": i }}>
                {type === "internal" ? (
                  <Link to={to} className="nav-overlay-link" onClick={close}>
                    <span className="nav-ol-num">0{i + 1}</span>
                    <span className="nav-ol-content">
                      <span className="nav-ol-label">{label}</span>
                      <span className="nav-ol-sub">{sub}</span>
                    </span>
                    <FiArrowRight className="nav-ol-arrow" />
                  </Link>
                ) : (
                  <a href={`#${label.toLowerCase().replace(/ /g, "-")}`} className="nav-overlay-link" onClick={close}>
                    <span className="nav-ol-num">0{i + 1}</span>
                    <span className="nav-ol-content">
                      <span className="nav-ol-label">{label}</span>
                      <span className="nav-ol-sub">{sub}</span>
                    </span>
                    <FiArrowRight className="nav-ol-arrow" />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Bottom strip */}
          <div className="nav-overlay-footer">
            <div className="nav-overlay-brand">
              <GiWaves className="nav-footer-wave" />
              <span>AI-powered aquarium management</span>
            </div>
            <div className="nav-footer-ctas">
              <button
                className="nav-footer-btn nav-footer-btn--outline"
                onClick={() => {
                  navigate("/login");
                  close();
                }}
              >
                Login
              </button>
              <button
                className="nav-footer-btn nav-footer-btn--filled"
                onClick={() => {
                  navigate("/register");
                  close();
                }}
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
