/**
 * PasswordResetVerify.js
 * Mounted at /resetpw/verify/:token
 *
 * Flow:
 *  1. On mount — verify the token with GET /api/v1/user/password-reset/verify/?reset_token=<token>
 *  2. If valid  — show "New Password" form
 *  3. On submit — POST /api/v1/user/password-reset/submit/
 *  4. Success   — redirect to /login
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { baseUrl } from "./config";
import "./PasswordResetVerify.css";

export default function PasswordResetVerify() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  /* Verify token on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/user/password-reset/verify/?reset_token=${encodeURIComponent(token)}`);
        setTokenValid(res.ok);
        if (!res.ok) setError("This reset link is invalid or has expired. Please request a new one.");
      } catch {
        setTokenValid(false);
        setError("Could not verify your reset link. Please try again.");
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/user/password-reset/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: token, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to reset password.");
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Password strength ── */
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f0a500", "#00d4ff", "#22c55e"][strength];

  return (
    <div className="prv-page">
      <div className="prv-bg">
        <div className="prv-orb prv-orb-a" />
        <div className="prv-orb prv-orb-b" />
        <div className="prv-grid" />
      </div>

      <div className="prv-center">
        <motion.div className="prv-card" initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          {/* Logo */}
          <div className="prv-logo-row">
            <img src="/favicon32.png" alt="AquaAI" className="prv-logo" />
            <span className="prv-logo-name">AquaAI</span>
          </div>

          {/* ── Loading ── */}
          {verifying && (
            <div className="prv-state">
              <FiLoader className="prv-spinner" size={32} />
              <p>Verifying your reset link…</p>
            </div>
          )}

          {/* ── Invalid token ── */}
          {!verifying && !tokenValid && (
            <div className="prv-state prv-state--error">
              <FiAlertCircle size={40} style={{ color: "#ef4444" }} />
              <h2>Link Expired</h2>
              <p>{error}</p>
              <a href="/forgot-password" className="prv-btn prv-btn--primary">
                Request New Link
              </a>
            </div>
          )}

          {/* ── Success ── */}
          {done && (
            <motion.div className="prv-state prv-state--success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <FiCheckCircle size={48} style={{ color: "#22c55e" }} />
              <h2>Password Updated!</h2>
              <p>Your password has been changed successfully. Redirecting you to login…</p>
            </motion.div>
          )}

          {/* ── New password form ── */}
          {!verifying && tokenValid && !done && (
            <>
              <div className="prv-header">
                <h2 className="prv-title">Set New Password</h2>
                <p className="prv-subtitle">Choose a strong password — at least 8 characters with uppercase and a number.</p>
              </div>

              {error && (
                <div className="prv-alert">
                  <FiAlertCircle size={14} /> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="prv-form">
                {/* New password */}
                <div className="prv-field">
                  <label>New Password</label>
                  <div className="prv-input-wrap">
                    <FiLock className="prv-input-icon" />
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" required />
                    <button type="button" className="prv-eye" onClick={() => setShowPw((v) => !v)}>
                      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="prv-strength">
                      <div className="prv-strength-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="prv-strength-seg" style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.08)" }} />
                        ))}
                      </div>
                      <span style={{ color: strengthColor, fontSize: 12, fontWeight: 600 }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="prv-field">
                  <label>Confirm Password</label>
                  <div className="prv-input-wrap">
                    <FiLock className="prv-input-icon" />
                    <input type={showCf ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" required />
                    <button type="button" className="prv-eye" onClick={() => setShowCf((v) => !v)}>
                      {showCf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {confirm && password !== confirm && <p className="prv-mismatch">Passwords do not match</p>}
                  {confirm && password === confirm && confirm.length > 0 && (
                    <p className="prv-match">
                      <FiCheckCircle size={12} /> Passwords match
                    </p>
                  )}
                </div>

                <button type="submit" className="prv-btn prv-btn--primary" disabled={submitting}>
                  {submitting ? "Updating…" : "Set New Password"}
                </button>
              </form>
            </>
          )}

          <div className="prv-back">
            <a href="/login">← Back to Login</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
