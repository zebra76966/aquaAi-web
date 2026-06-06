/**
 * AccountDangerZone.js
 * Drop into any ProfileTab — handles:
 *   - Reset Password (sends email with link)
 *   - Deactivate Account (POST /user/deactivate/)
 *     with a 10-second countdown confirm button
 */
import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiLock, FiTrash2, FiX, FiMail, FiCheckCircle } from "react-icons/fi";
import { AuthContext } from "./authcontext";
import { baseUrl } from "./config";
import "./AccountDangerZone.css";

/* ── Deactivate modal with 10s countdown ── */
function DeactivateModal({ onClose, token, onDeactivated }) {
  const [countdown, setCountdown] = useState(10);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleConfirm = async () => {
    setConfirming(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/user/deactivate/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to deactivate account.");
      onDeactivated();
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    }
  };

  return (
    <motion.div className="adz-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="adz-modal" initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 24 }} onClick={(e) => e.stopPropagation()}>
        <button className="adz-modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="adz-modal-icon adz-modal-icon--danger">
          <FiAlertTriangle size={28} />
        </div>

        <h3 className="adz-modal-title">Deactivate Account</h3>

        <div className="adz-warning-box">
          <p className="adz-warning-head">⚠️ This action is irreversible</p>
          <ul className="adz-warning-list">
            <li>Your account will be permanently deactivated</li>
            <li>All your data, habitats, and history will be removed</li>
            <li>Any active subscriptions will be cancelled</li>
            <li>You will not be able to recover this account</li>
          </ul>
        </div>

        {error && (
          <div className="adz-error">
            <FiAlertTriangle size={13} /> {error}
          </div>
        )}

        <div className="adz-modal-actions">
          <button className="adz-btn adz-btn--ghost" onClick={onClose}>
            Cancel — Keep My Account
          </button>

          <button className="adz-btn adz-btn--danger" disabled={countdown > 0 || confirming} onClick={handleConfirm}>
            {confirming ? "Deactivating…" : countdown > 0 ? `I understand — Deactivate (${countdown}s)` : "I understand — Deactivate Account"}
            {countdown > 0 && !confirming && (
              <div className="adz-countdown-ring">
                <svg viewBox="0 0 36 36" className="adz-ring-svg">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${((10 - countdown) / 10) * 87.96} 87.96`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                    style={{ transition: "stroke-dasharray 0.9s linear" }}
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main component ── */
export default function AccountDangerZone({ token, userEmail, onLogout }) {
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [deactivated, setDeactivated] = useState(false);

  const handleRequestReset = async () => {
    if (!userEmail) {
      setResetError("No email found on your account.");
      return;
    }
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch(`${baseUrl}/user/password-reset/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to send reset email.");
      setResetSent(true);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeactivated = () => {
    setShowDeactivate(false);
    setDeactivated(true);
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 2500);
  };

  if (deactivated) {
    return (
      <div className="adz-section">
        <motion.div className="adz-deactivated" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <FiCheckCircle size={36} style={{ color: "#22c55e" }} />
          <h4>Account Deactivated</h4>
          <p>Your account has been deactivated. Signing you out…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="adz-section">
        <div className="adz-section-head">
          <FiAlertTriangle size={16} className="adz-section-icon" />
          <h4 className="adz-section-title">Account Settings</h4>
        </div>

        {/* Reset Password */}
        <div className="adz-row">
          <div className="adz-row-info">
            <div className="adz-row-icon adz-row-icon--cyan">
              <FiLock size={16} />
            </div>
            <div>
              <p className="adz-row-label">Reset Password</p>
              <p className="adz-row-desc">{resetSent ? "✓ Reset link sent — check your inbox." : "Send a password reset link to your registered email."}</p>
              {resetError && <p className="adz-row-error">{resetError}</p>}
            </div>
          </div>
          {!resetSent && (
            <button className="adz-btn adz-btn--cyan" onClick={handleRequestReset} disabled={resetLoading}>
              {resetLoading ? (
                "Sending…"
              ) : (
                <>
                  <FiMail size={13} /> Send Reset Email
                </>
              )}
            </button>
          )}
          {resetSent && (
            <div className="adz-sent-badge">
              <FiCheckCircle size={13} /> Sent
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="adz-divider" />

        {/* Deactivate */}
        <div className="adz-row">
          <div className="adz-row-info">
            <div className="adz-row-icon adz-row-icon--red">
              <FiTrash2 size={16} />
            </div>
            <div>
              <p className="adz-row-label adz-row-label--danger">Deactivate Account</p>
              <p className="adz-row-desc">Permanently deactivate your account. This action cannot be undone.</p>
            </div>
          </div>
          <button className="adz-btn adz-btn--red-outline" onClick={() => setShowDeactivate(true)}>
            <FiTrash2 size={13} /> Deactivate
          </button>
        </div>
      </div>

      <AnimatePresence>{showDeactivate && <DeactivateModal token={token} onClose={() => setShowDeactivate(false)} onDeactivated={handleDeactivated} />}</AnimatePresence>
    </>
  );
}
