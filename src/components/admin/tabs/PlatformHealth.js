import React, { useState, useEffect, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiHeartPulseLine,
  RiRefreshLine,
  RiFlashlightLine,
  RiCalendarEventLine,
  RiDatabase2Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiShieldCheckLine,
  RiHandCoinLine,
  RiAlertLine,
  RiGroupLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiEqualizerLine,
  RiLineChartFill,
} from "react-icons/ri";
import { FiAlertCircle } from "react-icons/fi";
import { baseUrl } from "../../auth/config";

/* ── colour helpers ─────────────────────────── */
const hiColor = (v) => {
  if (v == null) return "var(--text-3)";
  if (v >= 80) return "var(--success)";
  if (v >= 70) return "#22d3ee";
  if (v >= 60) return "var(--warning)";
  return "var(--danger)";
};
const hiLabel = (v) => {
  if (v == null) return "—";
  if (v >= 80) return "Healthy";
  if (v >= 70) return "Good";
  if (v >= 60) return "Fair";
  return "Critical";
};
const hiBadge = (v) => {
  if (v >= 80) return "green";
  if (v >= 70) return "blue";
  if (v >= 60) return "yellow";
  return "red";
};
const fmtPct = (v, dec = 0) => (v != null ? `${(v * 100).toFixed(dec)}%` : "—");

/* ── Sparkline ──────────────────────────────── */
const Sparkline = ({ values, color }) => {
  if (!values || values.length < 2) return null;
  const W = 80,
    H = 28,
    min = Math.min(...values),
    max = Math.max(...values),
    range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * H}`).join(" ");
  const lastY = H - ((values[values.length - 1] - min) / range) * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 28, flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={W} cy={lastY} r="3" fill={color} />
    </svg>
  );
};

/* ── Animated metric bar ────────────────────── */
const MetricBar = ({ label, value, max, color, format, icon: Icon }) => {
  const w = Math.min(Math.max(((value ?? 0) / (max || 1)) * 100, 0), 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-2)" }}>
          {Icon && <Icon size={13} style={{ color, flexShrink: 0 }} />}
          {label}
        </div>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color }}>{format ? format(value) : (value ?? "—")}</span>
      </div>
      <div className="adm-bar-track">
        <motion.div className="adm-bar-fill" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ background: color }} />
      </div>
    </div>
  );
};

/* ── Delta chip ─────────────────────────────── */
const Delta = ({ prev, curr, invert = false }) => {
  if (prev == null || curr == null || Math.abs(curr - prev) < 0.001) return null;
  const diff = curr - prev;
  const positive = invert ? diff < 0 : diff > 0;
  const color = positive ? "var(--success)" : "var(--danger)";
  const Icon = diff > 0 ? RiArrowUpLine : RiArrowDownLine;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 10, color, marginLeft: 6 }}>
      <Icon size={10} />
      {Math.abs(diff).toFixed(2)}
    </span>
  );
};

/* ── KPI Card ───────────────────────────────── */
const KpiCard = ({ label, icon: Icon, iconColor, value, valueFmt, badge, badgeClass, prev, invert, sparkValues, delay }) => (
  <motion.div className="adm-stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <div className="adm-stat-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={13} style={{ color: iconColor }} />}
      {label}
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8, gap: 6 }}>
      <div>
        <div className="adm-stat-value" style={{ color: iconColor, lineHeight: 1 }}>
          {valueFmt ?? value}
          {prev != null && <Delta prev={prev} curr={typeof value === "number" ? value : null} invert={invert} />}
        </div>
        {badge && (
          <span className={`adm-badge ${badgeClass}`} style={{ marginTop: 6, display: "inline-flex" }}>
            {badge}
          </span>
        )}
      </div>
      {sparkValues && <Sparkline values={sparkValues} color={iconColor} />}
    </div>
  </motion.div>
);

/* ── Trust bucket bar ───────────────────────── */
const BucketBar = ({ label, value, total, color }) => {
  const w = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{ width: 48, fontSize: 11, color: "var(--text-3)", textAlign: "right", flexShrink: 0 }}>{label}</div>
      <div className="adm-bar-track" style={{ flex: 1 }}>
        <motion.div className="adm-bar-fill" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.8 }} style={{ background: color }} />
      </div>
      <div style={{ width: 26, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "var(--text-2)", textAlign: "right", flexShrink: 0 }}>{value}</div>
    </div>
  );
};

/* ── Churn risk bar ─────────────────────────── */
const ChurnBar = ({ label, pctVal, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
    <div style={{ width: 56, fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>{label}</div>
    <div className="adm-bar-track" style={{ flex: 1 }}>
      <motion.div className="adm-bar-fill" initial={{ width: 0 }} animate={{ width: `${Math.min((pctVal ?? 0) * 100, 100)}%` }} transition={{ duration: 0.8 }} style={{ background: color }} />
    </div>
    <div style={{ width: 38, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "var(--text-2)", textAlign: "right", flexShrink: 0 }}>{((pctVal ?? 0) * 100).toFixed(1)}%</div>
  </div>
);

const BUCKET_COLORS = { "0-20": "#ef4444", "20-40": "#f97316", "40-60": "#f59e0b", "60-80": "#22d3ee", "80-100": "#10b981" };
const CHURN_COLORS = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" };

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function PlatformHealth({ token }) {
  const [history, setHistory] = useState([]);
  const [computeResult, setComputeResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const [showCompute, setShowCompute] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  /* Fetch history ─ shape: { data: [{ snapshot_date, health_index, avg_trust_score, booking_completion_rate, dispute_rate }] } */
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${baseUrl}/intelligence/platform/health/history/`, { headers });
      const json = await res.json();
      const rows = json?.data ?? json?.results ?? json ?? [];
      const arr = Array.isArray(rows) ? [...rows] : [];
      arr.sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date)); // asc → sparkline trends left→right
      setHistory(arr);
    } catch {
      setError("Failed to load health history.");
    } finally {
      setLoadingHistory(false);
    }
  }, [token]); // eslint-disable-line

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /* Run compute ─ shape: { data: { snapshot_date, health_index, health_grade, trend, avg_trust_score,
       booking_completion_rate, dispute_rate, total_active_entities,
       trust_score_distribution: { buckets, sample_size, avg_trust },
       churn_risk_distribution: { critical_pct, high_pct, medium_pct, low_pct, sample_size } } } */
  const runCompute = async () => {
    setComputing(true);
    setError("");
    setComputeResult(null);
    setShowCompute(false);
    try {
      const res = await fetch(`${baseUrl}/intelligence/platform/health/compute/`, { method: "POST", headers });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Compute failed");
        return;
      }
      setComputeResult(json?.data ?? json);
      setShowCompute(true);
      fetchHistory();
    } catch {
      setError("Compute request failed.");
    } finally {
      setComputing(false);
    }
  };

  /* Derived */
  const latest = history[history.length - 1] ?? null;
  const prev = history[history.length - 2] ?? null;
  const hiVals = history.map((r) => r.health_index);
  const trVals = history.map((r) => r.avg_trust_score);
  const bkVals = history.map((r) => r.booking_completion_rate);
  const dsVals = history.map((r) => r.dispute_rate);

  const cr = computeResult;
  const trustDist = cr?.trust_score_distribution ?? cr?.health_signals?.trust_distribution ?? null;
  const churnDist = cr?.churn_risk_distribution ?? cr?.health_signals?.churn_risk_distribution ?? null;

  return (
    <div>
      {/* Header */}
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">Platform Health</h2>
          <p className="adm-tab-sub">Historical snapshots · trust scores · booking completion · dispute rates</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={runCompute} disabled={computing}>
          {computing ? (
            <>
              <div className="adm-spinner" style={{ width: 14, height: 14 }} />
              Computing…
            </>
          ) : (
            <>
              <RiFlashlightLine size={15} />
              Run Compute
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="adm-error-msg">
          <FiAlertCircle size={14} />
          {error}
        </div>
      )}

      {/* ── KPI cards (from history) ────────────── */}
      {!loadingHistory && history.length > 0 && (
        <Row className="g-3 mb-3">
          <Col xs={12} sm={6} xl={3}>
            <KpiCard
              delay={0}
              label="Health Index"
              icon={RiHeartPulseLine}
              iconColor={hiColor(latest?.health_index)}
              value={latest?.health_index}
              valueFmt={latest?.health_index?.toFixed(1)}
              badge={hiLabel(latest?.health_index)}
              badgeClass={hiBadge(latest?.health_index)}
              prev={prev?.health_index}
              sparkValues={hiVals}
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <KpiCard
              delay={0.05}
              label="Avg Trust Score"
              icon={RiShieldCheckLine}
              iconColor="#3b82f6"
              value={latest?.avg_trust_score}
              valueFmt={latest?.avg_trust_score?.toFixed(1)}
              badge="/ 100"
              badgeClass="blue"
              prev={prev?.avg_trust_score}
              sparkValues={trVals}
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <KpiCard
              delay={0.1}
              label="Booking Completion"
              icon={RiHandCoinLine}
              iconColor="var(--success)"
              value={latest?.booking_completion_rate}
              valueFmt={latest?.booking_completion_rate != null ? fmtPct(latest.booking_completion_rate) : "—"}
              badge="Completion"
              badgeClass="green"
              prev={prev?.booking_completion_rate}
              sparkValues={bkVals}
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <KpiCard
              delay={0.15}
              label="Dispute Rate"
              icon={RiAlertLine}
              iconColor="var(--danger)"
              value={latest?.dispute_rate}
              valueFmt={latest?.dispute_rate != null ? fmtPct(latest.dispute_rate, 1) : "—"}
              badge="Disputes"
              badgeClass="red"
              invert
              prev={prev?.dispute_rate}
              sparkValues={dsVals}
            />
          </Col>
        </Row>
      )}

      {loadingHistory && (
        <div className="adm-loading">
          <div className="adm-spinner" />
          Loading history…
        </div>
      )}

      {/* ── Compute result panel ─────────────────── */}
      <AnimatePresence>
        {showCompute && cr && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }} style={{ marginBottom: 20 }}>
            {/* gradient header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)",
                borderRadius: "16px 16px 0 0",
                padding: "14px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
                <RiCheckboxCircleLine size={18} />
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}>Compute Result — {cr.snapshot_date}</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                    Grade: <strong>{cr.health_grade}</strong>
                    &nbsp;·&nbsp;Trend: <strong style={{ textTransform: "capitalize" }}>{cr.trend}</strong>
                    &nbsp;·&nbsp;{cr.total_active_entities} active entities
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCompute(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RiCloseCircleLine size={16} />
              </button>
            </div>

            {/* body */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px" }}>
              <Row className="g-3">
                {/* Left — score ring + metric bars */}
                <Col xs={12} lg={4}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        flexShrink: 0,
                        border: `4px solid ${hiColor(cr.health_index)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 20,
                        fontWeight: 700,
                        color: hiColor(cr.health_index),
                      }}
                    >
                      {cr.health_index?.toFixed(1)}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", lineHeight: 1 }}>{cr.health_grade}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--success)", marginTop: 6 }}>
                        <RiLineChartFill size={13} style={{ textTransform: "capitalize" }} />
                        {cr.trend}
                      </div>
                    </div>
                  </div>
                  <MetricBar label="Avg Trust Score" value={cr.avg_trust_score} max={100} color="#3b82f6" icon={RiShieldCheckLine} format={(v) => v?.toFixed(1)} />
                  <MetricBar label="Booking Completion" value={(cr.booking_completion_rate ?? 0) * 100} max={100} color="var(--success)" icon={RiHandCoinLine} format={(v) => `${v?.toFixed(0)}%`} />
                  <MetricBar label="Dispute Rate" value={(cr.dispute_rate ?? 0) * 100} max={10} color="var(--danger)" icon={RiAlertLine} format={(v) => `${v?.toFixed(1)}%`} />
                </Col>

                {/* Mid — trust distribution */}
                <Col xs={12} sm={6} lg={4}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RiEqualizerLine size={13} />
                    Trust Distribution
                  </div>
                  {trustDist?.buckets ? (
                    <>
                      {Object.entries(trustDist.buckets).map(([range, count]) => (
                        <BucketBar key={range} label={range} value={count} total={trustDist.sample_size || 1} color={BUCKET_COLORS[range] ?? "var(--accent)"} />
                      ))}
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
                        {trustDist.sample_size} entities · avg {trustDist.avg_trust?.toFixed(1)}
                      </div>
                    </>
                  ) : (
                    <div className="adm-empty" style={{ padding: "12px 0" }}>
                      No distribution data
                    </div>
                  )}
                </Col>

                {/* Right — churn risk */}
                <Col xs={12} sm={6} lg={4}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RiGroupLine size={13} />
                    Churn Risk
                  </div>
                  {churnDist ? (
                    <>
                      <ChurnBar label="Critical" pctVal={churnDist.critical_pct} color={CHURN_COLORS.critical} />
                      <ChurnBar label="High" pctVal={churnDist.high_pct} color={CHURN_COLORS.high} />
                      <ChurnBar label="Medium" pctVal={churnDist.medium_pct} color={CHURN_COLORS.medium} />
                      <ChurnBar label="Low" pctVal={churnDist.low_pct} color={CHURN_COLORS.low} />
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>Sample: {churnDist.sample_size} entities</div>
                    </>
                  ) : (
                    <div className="adm-empty" style={{ padding: "12px 0" }}>
                      No churn data
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── History table ────────────────────────── */}
      <div className="adm-panel">
        <div className="adm-panel-title" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RiCalendarEventLine size={14} />
            Snapshot History
            <span className="adm-badge blue" style={{ fontSize: 10 }}>
              {history.length}
            </span>
          </span>
          <button className="adm-btn adm-btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={fetchHistory}>
            <RiRefreshLine size={12} />
            Refresh
          </button>
        </div>

        {loadingHistory ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            Loading…
          </div>
        ) : history.length === 0 ? (
          <div className="adm-empty">No snapshots yet. Run Compute to generate the first one.</div>
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Health Index</th>
                    <th>Trust Score</th>
                    <th>Booking Rate</th>
                    <th>Dispute Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((row, i) => {
                    const hi = row.health_index;
                    return (
                      <motion.tr key={row.snapshot_date ?? i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <td style={{ color: "var(--text-2)" }}>{row.snapshot_date ?? "—"}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: hiColor(hi) }}>{hi != null ? hi.toFixed(1) : "—"}</span>
                        </td>
                        <td>{row.avg_trust_score != null ? row.avg_trust_score.toFixed(1) : "—"}</td>
                        <td>
                          <span style={{ color: "var(--success)", fontWeight: 600 }}>{row.booking_completion_rate != null ? fmtPct(row.booking_completion_rate) : "—"}</span>
                        </td>
                        <td>
                          <span style={{ color: (row.dispute_rate ?? 0) > 0.03 ? "var(--danger)" : "var(--text-2)" }}>{row.dispute_rate != null ? fmtPct(row.dispute_rate, 1) : "—"}</span>
                        </td>
                        <td>
                          <span className={`adm-badge ${hiBadge(hi)}`}>{hiLabel(hi)}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sparklines summary row */}
            {history.length > 1 && (
              <div style={{ display: "flex", gap: 20, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
                {[
                  { label: "Health", values: hiVals, color: hiColor(latest?.health_index) },
                  { label: "Trust", values: trVals, color: "#3b82f6" },
                  { label: "Bookings", values: bkVals, color: "var(--success)" },
                  { label: "Disputes", values: dsVals, color: "var(--danger)" },
                ].map(({ label, values, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
                    <Sparkline values={values} color={color} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
