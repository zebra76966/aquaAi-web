/**
 * VerifyEmail.js
 *
 * Rendered at /verify-email/:token
 *
 * The link sent in the verification email points here with the token as
 * the last path segment (e.g. /verify-email/72fb4dd6-a391-4818-8b20-b6ada5584e8e).
 * On mount we POST that token to /user/auth/verify-email/, then redirect to
 * /login on success.
 */
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "react-bootstrap";
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import "./login.css";
import ThemeToggle from "../ThemeToggle";
import { baseUrl } from "./config";

const AUTO_REDIRECT_SECONDS = 3;

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setError("This verification link is missing a token.");
      return;
    }
    setStatus("verifying");
    setError("");
    try {
      const res = await fetch(`${baseUrl}/user/auth/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || json?.status !== "success") {
        setStatus("error");
        setError(json?.message || "This verification link is invalid or has expired.");
        return;
      }

      setEmail(json?.data?.email || "");
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError("Something went wrong while verifying your email. Please try again.");
    }
  }, [token]);

  useEffect(() => {
    verify();
  }, [verify]);

  /* Auto-redirect to login a few seconds after a successful verification */
  useEffect(() => {
    if (status !== "success") return;
    if (secondsLeft <= 0) {
      navigate("/login");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [status, secondsLeft, navigate]);

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
          {status === "verifying" && (
            <>
              <div className="auth-card-header">
                <div className="auth-icon-wrap">
                  <Spinner animation="border" size="sm" />
                </div>
                <h1 className="auth-title">Verifying your email…</h1>
                <p className="auth-subtitle">Just a moment while we confirm your address.</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="auth-card-header">
                <div className="auth-icon-wrap">
                  <FiCheckCircle size={30} />
                </div>
                <h1 className="auth-title">Email Verified</h1>
                <p className="auth-subtitle">{email ? `${email} is now confirmed.` : "Your email address is now confirmed."}</p>
              </div>

              <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)", marginTop: -8, marginBottom: 20 }}>Redirecting you to sign in in {secondsLeft}s…</p>

              <button onClick={() => navigate("/login")} className="auth-submit-btn">
                <span>Continue to Sign In</span>
                <FiArrowRight size={16} />
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="auth-card-header">
                <div className="auth-icon-wrap" style={{ color: "#ef4444" }}>
                  <FiAlertCircle size={30} />
                </div>
                <h1 className="auth-title">Verification Failed</h1>
                <p className="auth-subtitle">{error}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={verify} className="auth-submit-btn">
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="auth-submit-btn"
                  style={{ background: "transparent", border: "1.5px solid rgba(0,212,255,0.3)", color: "#00d4ff", boxShadow: "none" }}
                >
                  <span>Go to Sign In</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
