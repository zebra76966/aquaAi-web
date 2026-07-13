/**
 * ProviderApplicationSuccess.js
 *
 * Standalone page rendered at /providers/application/success.
 *
 * The AquaAI Providers mobile app opens the breeder/consultant signup
 * form inside an in-app WebView and watches every navigation for this
 * exact URL. As soon as it sees it, the app closes the WebView itself
 * and shows its own native confirmation — so this page mainly needs to
 * exist (and say something sensible) for anyone who lands on it in a
 * normal browser, or if the app-side interception is ever missed.
 */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import "../breeder/BreederApply.css";

const PROVIDER_APP_SCHEME = "aquaproviders://";
const AUTO_REDIRECT_SECONDS = 5;

export default function ProviderApplicationSuccess() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);

  const openApp = useCallback(() => {
    window.location.href = PROVIDER_APP_SCHEME;
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
    <div className="br-page">
      <div className="br-bg">
        <div className="br-blob br-blob-a" />
        <div className="br-blob br-blob-b" />
      </div>

      <motion.div className="br-success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <div className="br-success-ring">
          <FaCheckCircle size={44} />
        </div>
        <h2>Application Received</h2>
        <p style={{ marginBottom: 10, color: "#7a9ab0" }}>
          Application received. Your credentials will now be checked and verified — keep an eye on your inbox, you'll hear from us within the hour.
        </p>
        <p style={{ marginBottom: 28, color: "#4f6478", fontSize: 13 }}>Redirecting you back to the app in {secondsLeft}s…</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <button
            onClick={openApp}
            style={{
              padding: "13px",
              borderRadius: "100px",
              background: "#00d4ff",
              border: "none",
              color: "#08091a",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Return to Aqua Providers App
          </button>
          <button
            onClick={() => navigate("/provider-status")}
            style={{
              padding: "13px",
              borderRadius: "100px",
              background: "transparent",
              border: "1.5px solid rgba(0,212,255,0.3)",
              color: "#00d4ff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            View Application Status
          </button>
        </div>
      </motion.div>
    </div>
  );
}
