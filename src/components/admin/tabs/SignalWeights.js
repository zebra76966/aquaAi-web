import React, { useState, useEffect, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { RiScalesLine, RiSendPlaneLine } from "react-icons/ri";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { baseUrl } from "../../auth/config";

const SIGNAL_TYPES = ["analysis_feedback", "recommendation_feedback"];

export default function SignalWeights({ token }) {
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fbSignal, setFbSignal] = useState("analysis_feedback");
  const [fbCorrect, setFbCorrect] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fbResult, setFbResult] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchWeights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/intelligence/platform/signal-weights/`, { headers });
      const json = await res.json();
      setWeights(json?.data || json);
    } catch { setError("Failed to load signal weights."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchWeights(); }, [fetchWeights]);

  const submitFeedback = async () => {
    setSubmitting(true); setFbResult(null);
    try {
      const res = await fetch(`${baseUrl}/intelligence/platform/signal-feedback/`, {
        method: "POST", headers,
        body: JSON.stringify({ signal_type: fbSignal, prediction_correct: fbCorrect }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Feedback failed"); return; }
      setFbResult(json);
      fetchWeights();
    } catch { setError("Feedback request failed."); }
    finally { setSubmitting(false); }
  };

  const weightEntries = weights
    ? Object.entries(weights).filter(([, v]) => typeof v === "number" || typeof v === "object")
    : [];

  return (
    <div>
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">Signal Weights</h2>
          <p className="adm-tab-sub">Adaptive signal weights and prediction feedback</p>
        </div>
      </div>

      {error && <div className="adm-error-msg"><FiAlertCircle size={14} />{error}</div>}

      <Row className="g-3">
        <Col xs={12} lg={7}>
          <div className="adm-panel" style={{ height: "100%" }}>
            <div className="adm-panel-title"><RiScalesLine size={14} />Current Weights</div>
            {loading ? (
              <div className="adm-loading"><div className="adm-spinner" /></div>
            ) : weightEntries.length === 0 ? (
              <div className="adm-empty">No weights data available.</div>
            ) : (
              <>
                {weightEntries.map(([key, val], i) => {
                  const nv = typeof val === "number" ? val : val?.weight ?? 0;
                  const pct = Math.min(nv * 100, 100);
                  const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--info)" : "var(--accent)";
                  return (
                    <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="adm-bar-wrap">
                        <div className="adm-bar-label">{key.replace(/_/g, " ")}</div>
                        <div className="adm-bar-track">
                          <motion.div className="adm-bar-fill"
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                            style={{ background: color }}
                          />
                        </div>
                        <div className="adm-bar-val">{nv.toFixed(3)}</div>
                      </div>
                    </motion.div>
                  );
                })}
                <details style={{ marginTop: 16 }}>
                  <summary>Raw JSON</summary>
                  <pre className="adm-json" style={{ marginTop: 8 }}>{JSON.stringify(weights, null, 2)}</pre>
                </details>
              </>
            )}
          </div>
        </Col>

        <Col xs={12} lg={5}>
          <div className="adm-panel">
            <div className="adm-panel-title"><RiSendPlaneLine size={14} />Signal Feedback</div>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>
              Submit prediction feedback to update adaptive weights in real time.
            </p>

            <div className="adm-form-group">
              <label className="adm-form-label">Signal Type</label>
              <select className="adm-input" value={fbSignal} onChange={(e) => setFbSignal(e.target.value)}>
                {SIGNAL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Prediction Correct?</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[true, false].map((v) => (
                  <button key={String(v)}
                    className={`adm-btn ${fbCorrect === v ? "adm-btn-primary" : "adm-btn-secondary"}`}
                    onClick={() => setFbCorrect(v)}
                    style={{ flex: 1 }}
                  >
                    {v ? "✓ Correct" : "✗ Incorrect"}
                  </button>
                ))}
              </div>
            </div>

            <button className="adm-btn adm-btn-primary" style={{ width: "100%", marginTop: 4 }}
              onClick={submitFeedback} disabled={submitting}>
              {submitting
                ? <><div className="adm-spinner" style={{ width: 14, height: 14 }} />Submitting…</>
                : <><RiSendPlaneLine size={14} />Submit Feedback</>}
            </button>

            {fbResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--success)", marginBottom: 8 }}>
                  <FiCheckCircle />Feedback recorded
                </div>
                <pre className="adm-json">{JSON.stringify(fbResult, null, 2)}</pre>
              </motion.div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
