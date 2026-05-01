import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRadarLine, RiRefreshLine, RiFlashlightLine, RiSearchLine,
  RiUserLine, RiTimeLine, RiBuildingLine, RiArrowRightLine,
  RiCheckboxCircleLine, RiAlertLine, RiBarChartLine,
  RiShieldCheckLine, RiHeartPulseLine, RiMoneyDollarCircleLine,
  RiCloseCircleLine, RiLinkM, RiTestTubeLine,
} from "react-icons/ri";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { baseUrl } from "../../auth/config";

/* ── Session type config ─────────────────────────────── */
const SESSION_TYPES = {
  churn_analysis:   { label: "Churn Analysis",    icon: RiAlertLine,            color: "#f59e0b", badgeClass: "yellow" },
  trust_analysis:   { label: "Trust Analysis",    icon: RiShieldCheckLine,      color: "#3b82f6", badgeClass: "blue"   },
  pricing_analysis: { label: "Pricing Analysis",  icon: RiMoneyDollarCircleLine, color: "#10b981", badgeClass: "green"  },
  platform_health:  { label: "Platform Health",   icon: RiHeartPulseLine,       color: "#22d3ee", badgeClass: "blue"   },
  market_intel:     { label: "Market Intel",      icon: RiBarChartLine,         color: "#8b5cf6", badgeClass: "purple" },
};

const getTypeConfig = (type) =>
  SESSION_TYPES[type] ?? { label: type ?? "Unknown", icon: RiRadarLine, color: "var(--accent)", badgeClass: "blue" };

/* ── Risk level colour ───────────────────────────────── */
const riskColor = (lvl) => {
  if (!lvl) return "var(--text-3)";
  const l = lvl.toLowerCase();
  if (l === "high"   || l === "critical") return "var(--danger)";
  if (l === "medium" || l === "moderate") return "var(--warning)";
  return "var(--success)";
};
const riskBadge = (lvl) => {
  if (!lvl) return "blue";
  const l = lvl.toLowerCase();
  if (l === "high" || l === "critical") return "red";
  if (l === "medium" || l === "moderate") return "yellow";
  return "green";
};

/* ── Result renderer — per session_type ─────────────── */
const ResultDetail = ({ sessionType, result }) => {
  if (!result) return <div className="adm-empty" style={{ padding: "8px 0" }}>No result data</div>;

  const isTest = result._test;

  /* Churn analysis */
  if (sessionType === "churn_analysis") return (
    <div className="sess-result-grid">
      {isTest && <div className="sess-test-pill"><RiTestTubeLine size={10} />Test data</div>}
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Churn Probability</div>
        <div className="sess-kpi-value" style={{ color: riskColor(result.risk_level) }}>
          {result.churn_probability != null ? `${(result.churn_probability * 100).toFixed(0)}%` : "—"}
        </div>
      </div>
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Risk Level</div>
        <span className={`adm-badge ${riskBadge(result.risk_level)}`} style={{ marginTop: 4, display: "inline-flex" }}>
          {result.risk_level ?? "—"}
        </span>
      </div>
      {result.top_signals?.length > 0 && (
        <div className="sess-full-row">
          <div className="sess-kpi-label">Top Signals</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
            {result.top_signals.map((s) => (
              <span key={s} className="adm-badge purple" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>
                {s.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
      {result.recommended_actions?.length > 0 && (
        <div className="sess-full-row">
          <div className="sess-kpi-label">Recommended Actions</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
            {result.recommended_actions.map((a) => (
              <span key={a} className="adm-badge green" style={{ fontSize: 10 }}>
                {a.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* Trust analysis */
  if (sessionType === "trust_analysis") return (
    <div className="sess-result-grid">
      {isTest && <div className="sess-test-pill"><RiTestTubeLine size={10} />Test data</div>}
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Trust Score</div>
        <div className="sess-kpi-value" style={{ color: "#3b82f6" }}>
          {result.trust_score?.toFixed(1) ?? "—"}
        </div>
      </div>
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Tier</div>
        <span className="adm-badge blue" style={{ marginTop: 4, textTransform: "capitalize", display: "inline-flex" }}>
          {result.tier ?? "—"}
        </span>
      </div>
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Trajectory</div>
        <span className="adm-badge green" style={{ marginTop: 4, textTransform: "capitalize", display: "inline-flex" }}>
          {result.trajectory ?? "—"}
        </span>
      </div>
      {result.next_milestone && (
        <div className="sess-result-kpi">
          <div className="sess-kpi-label">Next Milestone</div>
          <div style={{ fontSize: 11, color: "var(--accent-2)", marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
            {result.next_milestone.replace(/_/g, " ")}
          </div>
        </div>
      )}
      {result.estimated_days != null && (
        <div className="sess-result-kpi">
          <div className="sess-kpi-label">Est. Days</div>
          <div className="sess-kpi-value" style={{ color: "var(--text)", fontSize: 18 }}>{result.estimated_days}</div>
        </div>
      )}
    </div>
  );

  /* Pricing analysis */
  if (sessionType === "pricing_analysis") return (
    <div className="sess-result-grid">
      {isTest && <div className="sess-test-pill"><RiTestTubeLine size={10} />Test data</div>}
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Revenue (30d)</div>
        <div className="sess-kpi-value" style={{ color: "var(--success)" }}>
          {result.current_revenue_30d != null ? `$${result.current_revenue_30d.toFixed(2)}` : "—"}
        </div>
      </div>
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Peer Comparison</div>
        <span className={`adm-badge ${result.peer_comparison?.includes("below") ? "red" : "green"}`}
          style={{ marginTop: 4, textTransform: "capitalize", display: "inline-flex" }}>
          {result.peer_comparison?.replace(/_/g, " ") ?? "—"}
        </span>
      </div>
      {result.recommended_increase && (
        <div className="sess-result-kpi">
          <div className="sess-kpi-label">Recommended Increase</div>
          <div className="sess-kpi-value" style={{ color: "#10b981", fontSize: 18 }}>{result.recommended_increase}</div>
        </div>
      )}
    </div>
  );

  /* Platform health */
  if (sessionType === "platform_health") return (
    <div className="sess-result-grid">
      {isTest && <div className="sess-test-pill"><RiTestTubeLine size={10} />Test data</div>}
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Health Index</div>
        <div className="sess-kpi-value" style={{ color: "#22d3ee" }}>
          {result.health_index?.toFixed(1) ?? "—"}
        </div>
      </div>
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Grade</div>
        <div className="sess-kpi-value" style={{ color: "var(--text)", fontSize: 20 }}>{result.grade ?? "—"}</div>
      </div>
      <div className="sess-result-kpi">
        <div className="sess-kpi-label">Trend</div>
        <span className="adm-badge green" style={{ marginTop: 4, textTransform: "capitalize", display: "inline-flex" }}>
          {result.trend ?? "—"}
        </span>
      </div>
    </div>
  );

  /* Generic fallback */
  return (
    <div className="sess-result-grid">
      {isTest && <div className="sess-test-pill"><RiTestTubeLine size={10} />Test data</div>}
      {Object.entries(result)
        .filter(([k]) => k !== "_test")
        .map(([k, v]) => (
          <div key={k} className="sess-result-kpi">
            <div className="sess-kpi-label">{k.replace(/_/g, " ")}</div>
            <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </div>
          </div>
        ))}
    </div>
  );
};

/* ── Session card (expanded view) ──────────────────── */
const SessionCard = ({ session, onClose }) => {
  const tc = getTypeConfig(session.session_type);
  const Icon = tc.icon;
  return (
    <motion.div
      className="sess-detail-card"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
    >
      {/* Card header */}
      <div className="sess-detail-header" style={{ borderLeftColor: tc.color }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div className="sess-type-icon" style={{ background: `${tc.color}22`, color: tc.color }}>
            <Icon size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)" }}>
              {tc.label}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>
              {session.id}
            </div>
          </div>
        </div>
        <button className="sess-close-btn" onClick={onClose}>
          <RiCloseCircleLine size={16} />
        </button>
      </div>

      {/* Meta row */}
      <div className="sess-meta-row">
        {[
          { icon: RiUserLine,     label: "Entity",   value: session.entity_id  ?? "—" },
          { icon: RiLinkM,        label: "Client",   value: session.client_id  ?? "—" },
          { icon: RiBuildingLine, label: "Industry", value: session.industry   ?? "—" },
          { icon: RiTimeLine,     label: "Created",  value: session.created_at ? new Date(session.created_at).toLocaleString() : "—" },
        ].map(({ icon: MIcon, label, value }) => (
          <div key={label} className="sess-meta-item">
            <MIcon size={11} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            <span className="sess-meta-label">{label}</span>
            <span className="sess-meta-value">{value}</span>
          </div>
        ))}
      </div>

      {/* Result */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>
          Result
        </div>
        <ResultDetail sessionType={session.session_type} result={session.result} />
      </div>
    </motion.div>
  );
};

/* ── Session row in list ───────────────────────────── */
const SessionRow = ({ session, index, isActive, onClick }) => {
  const tc = getTypeConfig(session.session_type);
  const Icon = tc.icon;
  const date = session.created_at ? new Date(session.created_at) : null;
  return (
    <motion.div
      className={`sess-row ${isActive ? "active" : ""}`}
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      style={{ "--row-color": tc.color }}
    >
      <div className="sess-row-icon" style={{ background: `${tc.color}18`, color: tc.color }}>
        <Icon size={14} />
      </div>
      <div className="sess-row-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
            {tc.label}
          </span>
          <span className={`adm-badge ${tc.badgeClass}`} style={{ fontSize: 9 }}>{session.session_type}</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>
            {session.id}
          </span>
          {session.entity_id && (
            <span style={{ fontSize: 10, color: "var(--text-3)" }}>
              {session.entity_id}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        {date && (
          <span style={{ fontSize: 10, color: "var(--text-3)" }}>
            {date.toLocaleDateString()}
          </span>
        )}
        <RiArrowRightLine size={13} style={{ color: isActive ? tc.color : "var(--text-3)" }} />
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export default function IntelligenceSessions({ token }) {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);   // full session object for detail view
  const [searchId, setSearchId] = useState("");
  const [running, setRunning]   = useState(false);
  const [runResult, setRunResult] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  /* Fetch all sessions — shape: { data: { sessions: [...], total, limit } } */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${baseUrl}/intelligence/sessions/`, { headers });
      const json = await res.json();
      // unwrap the actual sessions array from { data: { sessions: [] } }
      const arr = json?.data?.sessions ?? json?.data ?? json?.results ?? json ?? [];
      const tot = json?.data?.total   ?? arr.length;
      setSessions(Array.isArray(arr) ? arr : []);
      setTotal(tot);
    } catch { setError("Failed to load sessions."); }
    finally   { setLoading(false); }
  }, [token]); // eslint-disable-line

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  /* Fetch single session by id */
  const fetchById = async (id) => {
    const targetId = (id ?? searchId).trim();
    if (!targetId) return;
    try {
      const res  = await fetch(`${baseUrl}/intelligence/sessions/${targetId}`, { headers });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Session not found"); return; }
      setSelected(json?.data ?? json);
    } catch { setError("Lookup failed."); }
  };

  /* Run general intelligence */
  const runIntelligence = async () => {
    setRunning(true); setError(""); setRunResult(null);
    try {
      const res  = await fetch(`${baseUrl}/intelligence/run/`, { method: "POST", headers, body: JSON.stringify({}) });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Run failed"); return; }
      setRunResult(json?.data ?? json);
      fetchSessions();
    } catch { setError("Run request failed."); }
    finally   { setRunning(false); }
  };

  /* Filtered list from search */
  const filtered = searchId.trim()
    ? sessions.filter((s) =>
        s.id?.toLowerCase().includes(searchId.toLowerCase()) ||
        s.session_type?.toLowerCase().includes(searchId.toLowerCase()) ||
        s.entity_id?.toLowerCase().includes(searchId.toLowerCase())
      )
    : sessions;

  /* Type breakdown summary */
  const typeCount = sessions.reduce((acc, s) => {
    acc[s.session_type] = (acc[s.session_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">Intelligence Sessions</h2>
          <p className="adm-tab-sub">
            {total > 0 ? `${total} session${total !== 1 ? "s" : ""} · ` : ""}
            churn · trust · pricing · platform health analyses
          </p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={runIntelligence} disabled={running}>
          {running
            ? <><div className="adm-spinner" style={{ width: 14, height: 14 }} />Running…</>
            : <><RiFlashlightLine size={15} />Run Intelligence</>}
        </button>
      </div>

      {error && <div className="adm-error-msg"><FiAlertCircle size={14} />{error}</div>}

      {/* Run result banner */}
      <AnimatePresence>
        {runResult && (
          <motion.div className="adm-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 16, borderColor: "rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.04)" }}>
            <div className="adm-panel-title" style={{ color: "var(--success)" }}>
              <FiCheckCircle size={14} />Run Complete
            </div>
            <pre className="adm-json">{JSON.stringify(runResult, null, 2)}</pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Type summary pills */}
      {!loading && sessions.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {Object.entries(typeCount).map(([type, count]) => {
            const tc = getTypeConfig(type);
            const Icon = tc.icon;
            return (
              <div key={type} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20,
                background: `${tc.color}14`, border: `1px solid ${tc.color}30`,
                fontSize: 12, color: tc.color, fontWeight: 600,
              }}>
                <Icon size={12} />
                {tc.label}
                <span style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.8 }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <Row className="g-3">
        {/* ── Left: session list ──────────────────── */}
        <Col xs={12} lg={selected ? 5 : 12} xl={selected ? 4 : 12}>
          <div className="adm-panel" style={{ padding: 0, overflow: "hidden" }}>
            {/* Search bar */}
            <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <RiSearchLine size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                <input
                  className="adm-input"
                  placeholder="Filter by ID, type, entity…"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  style={{ paddingLeft: 36, fontSize: 12 }}
                />
              </div>
            </div>

            {/* List header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 8px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {filtered.length} session{filtered.length !== 1 ? "s" : ""}
              </span>
              <button className="adm-btn adm-btn-secondary" style={{ padding: "3px 8px", fontSize: 11 }} onClick={fetchSessions}>
                <RiRefreshLine size={12} />Refresh
              </button>
            </div>

            {/* Session rows */}
            <div style={{ maxHeight: 520, overflowY: "auto", padding: "0 8px 8px" }}>
              {loading ? (
                <div className="adm-loading"><div className="adm-spinner" /></div>
              ) : filtered.length === 0 ? (
                <div className="adm-empty">No sessions match your filter.</div>
              ) : (
                filtered.map((s, i) => (
                  <SessionRow
                    key={s.id ?? i}
                    session={s}
                    index={i}
                    isActive={selected?.id === s.id}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  />
                ))
              )}
            </div>
          </div>
        </Col>

        {/* ── Right: detail panel ─────────────────── */}
        <AnimatePresence>
          {selected && (
            <Col xs={12} lg={7} xl={8}>
              <SessionCard session={selected} onClose={() => setSelected(null)} />
            </Col>
          )}
        </AnimatePresence>
      </Row>

      {/* No-select hint */}
      {!loading && sessions.length > 0 && !selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--text-3)" }}>
          ← Click any session to inspect its result
        </motion.div>
      )}
    </div>
  );
}
