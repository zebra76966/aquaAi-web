/**
 * AccountDangerZone.js
 * Drop into any ProfileTab — handles:
 *   - Reset Password (sends email with link)
 *   - Delete Account (DELETE /user/account/delete/)
 *     with a 10-second countdown confirm step, followed by a
 *     password confirmation step, then logs the user out.
 */
import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiLock, FiTrash2, FiX, FiMail, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { AuthContext } from "./authcontext";
import { baseUrl } from "./config";
import "./AccountDangerZone.css";

/* ── Delete Account modal: 10s countdown → password confirm ── */
function DeleteAccountModal({ onClose, token, onDeleted }) {
  const [step, setStep] = useState("warning"); // "warning" | "password"
  const [countdown, setCountdown] = useState(10);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (step !== "warning") return;
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
  }, [step]);

  const handleConfirm = async () => {
    if (!password) {
      setError("Please enter your password to continue.");
      return;
    }
    setConfirming(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/user/account/delete/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || json.detail || "Failed to delete account. Please check your password and try again.");
      onDeleted();
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

        <h3 className="adz-modal-title">Delete Account</h3>

        {step === "warning" ? (
          <>
            <div className="adz-warning-box">
              <p className="adz-warning-head">⚠️ This action can't be reverted</p>
              <ul className="adz-warning-list">
                <li>Your account will be permanently deleted</li>
                <li>All your data, habitats, and history will be lost</li>
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

              <button className="adz-btn adz-btn--danger" disabled={countdown > 0} onClick={() => setStep("password")}>
                {countdown > 0 ? `I understand — Delete (${countdown}s)` : "I understand — Delete Account"}
                {countdown > 0 && (
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
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 16 }}>For your security, confirm your password to permanently delete your account.</p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                border: "1.5px solid rgba(239,68,68,0.3)",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: error ? 8 : 16,
                background: "rgba(239,68,68,0.04)",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Password"
                autoComplete="current-password"
                disabled={confirming}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "inherit",
                  fontSize: 14,
                }}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#94a3b8", padding: 0 }}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {error && (
              <div className="adz-error">
                <FiAlertTriangle size={13} /> {error}
              </div>
            )}

            <div className="adz-modal-actions">
              <button className="adz-btn adz-btn--ghost" onClick={onClose} disabled={confirming}>
                Cancel — Keep My Account
              </button>

              <button className="adz-btn adz-btn--danger" disabled={confirming} onClick={handleConfirm}>
                {confirming ? "Deleting…" : "Permanently Delete Account"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Main component ── */
export default function AccountDangerZone({ token, userEmail, onLogout }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [deleted, setDeleted] = useState(false);

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

  const handleDeleted = () => {
    setShowDeleteModal(false);
    setDeleted(true);
    // Log the user out on success — give the confirmation a brief beat
    // to render before pulling the session out from under them.
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 1500);
  };

  if (deleted) {
    return (
      <div className="adz-section">
        <motion.div className="adz-deactivated" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <FiCheckCircle size={36} style={{ color: "#22c55e" }} />
          <h4>Account Deleted</h4>
          <p>Your account has been permanently deleted. Signing you out…</p>
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

        {/* Delete */}
        <div className="adz-row">
          <div className="adz-row-info">
            <div className="adz-row-icon adz-row-icon--red">
              <FiTrash2 size={16} />
            </div>
            <div>
              <p className="adz-row-label adz-row-label--danger">Delete Account</p>
              <p className="adz-row-desc">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
          </div>
          <button className="adz-btn adz-btn--red-outline" onClick={() => setShowDeleteModal(true)}>
            <FiTrash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <AnimatePresence>{showDeleteModal && <DeleteAccountModal token={token} onClose={() => setShowDeleteModal(false)} onDeleted={handleDeleted} />}</AnimatePresence>
    </>
  );
}
