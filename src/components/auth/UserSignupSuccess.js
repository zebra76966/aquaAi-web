/**
 * UserSignupSuccess.js
 *
 * Standalone page rendered at /user-signup/success.
 *
 * Reached after a regular (non-provider) account registers successfully.
 * We deliberately do NOT auto-login here — the person lands on this page,
 * sees a clear confirmation, and signs in themselves from a clean state.
 *
 * The AquaAI mobile app opens the sign-up form inside an in-app WebView and
 * watches every navigation for this exact URL. As soon as it sees it, the
 * app closes the WebView itself and shows its own native confirmation — so
 * this page mainly needs to exist (and say something sensible) for anyone
 * who lands on it in a normal browser, or if the app-side interception is
 * ever missed.
 */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import "./login.css";
import ThemeToggle from "../ThemeToggle";

// NOTE: adjust this to match whatever URL scheme the consumer AquaAI app is
// actually registered under (the provider app uses "aquaproviders://" — this
// assumes a parallel "aquaai://" scheme for the main app; update if different).
const APP_SCHEME = "aquaai://";
const AUTO_REDIRECT_SECONDS = 5;

export default function UserSignupSuccess() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);

  const openApp = useCallback(() => {
    window.location.href = APP_SCHEME;
  }, []);

  /* Auto-attempt to hand back off to the app after a short beat —
     harmless no-op if opened in a browser with no app installed. */
  useEffect(() => {
    if (secondsLeft <= 0) {
      openApp();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, openApp]);

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />
        <div className="auth-grid" />
      </div>

      <div className="auth-topbar">
        <div className="auth-logo-small" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img src="/favicon32.png" alt="AquaAI Logo" className="auth-logo-img" />
          <span>AquaAI</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-center">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="auth-card-header">
            <div className="auth-icon-wrap">
              <FiCheckCircle size={30} />
            </div>
            <h1 className="auth-title">Account Created</h1>
            <p className="auth-subtitle">Your AquaAI account is ready — sign in to get started.</p>
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)", marginTop: -8, marginBottom: 20 }}>Redirecting you back to the app in {secondsLeft}s…</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={openApp} className="auth-submit-btn">
              <span>Return to AquaAI App</span>
              <FiArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="auth-submit-btn"
              style={{ background: "transparent", border: "1.5px solid rgba(0,212,255,0.3)", color: "#00d4ff", boxShadow: "none" }}
            >
              <span>Continue to Sign In</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
