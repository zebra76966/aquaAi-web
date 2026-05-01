import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { RiUserStarLine, RiSearchLine } from "react-icons/ri";
import { FiAlertCircle } from "react-icons/fi";
import { baseUrl } from "../../auth/config";

export default function UserIntelligence({ token }) {
  const [userId, setUserId] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchUser = async () => {
    if (!userId.trim()) { setError("Enter a User ID"); return; }
    setLoading(true); setError(""); setProfileData(null); setMetricsData(null);
    try {
      const [pr, mr] = await Promise.all([
        fetch(`${baseUrl}/intelligence/aquaai/user/${userId}/profile/`, { headers }),
        fetch(`${baseUrl}/intelligence/aquaai/user/${userId}/metrics/`, { headers }),
      ]);
      const pj = await pr.json();
      const mj = await mr.json();
      if (!pr.ok && !mr.ok) { setError(pj.message || "User not found"); return; }
      setProfileData(pj?.data || pj);
      setMetricsData(mj?.data || mj);
    } catch { setError("Request failed."); }
    finally { setLoading(false); }
  };

  const ScalarCards = ({ data }) => {
    const entries = typeof data === "object" && data
      ? Object.entries(data).filter(([, v]) => typeof v === "number" || typeof v === "string").slice(0, 6)
      : [];
    return entries.length > 0 ? (
      <div className="adm-stat-row" style={{ marginBottom: 14 }}>
        {entries.map(([k, v]) => (
          <div key={k} className="adm-stat-card">
            <div className="adm-stat-label">{k.replace(/_/g, " ")}</div>
            <div className="adm-stat-value" style={{ fontSize: typeof v === "number" && v > 9999 ? 14 : 18 }}>
              {typeof v === "number" ? v.toLocaleString() : String(v)}
            </div>
          </div>
        ))}
      </div>
    ) : null;
  };

  return (
    <div>
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">User Intelligence</h2>
          <p className="adm-tab-sub">AI-generated profile and engagement metrics for any user</p>
        </div>
      </div>

      {error && <div className="adm-error-msg"><FiAlertCircle size={14} />{error}</div>}

      <div className="adm-panel" style={{ marginBottom: 20 }}>
        <div className="adm-panel-title"><RiUserStarLine size={14} />Lookup User</div>
        <Row className="g-2 align-items-end">
          <Col xs={12} md={8}>
            <input className="adm-input" placeholder="User UUID e.g. 5e56bddd-14e4-48bb-b0a5-6e0690d2de90"
              value={userId} onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUser()} />
          </Col>
          <Col xs={12} md={4}>
            <button className="adm-btn adm-btn-primary" style={{ width: "100%" }} onClick={fetchUser} disabled={loading}>
              {loading ? <><div className="adm-spinner" style={{ width: 14, height: 14 }} />Loading…</> : <><RiSearchLine size={14} />Fetch</>}
            </button>
          </Col>
        </Row>
      </div>

      {loading && <div className="adm-loading"><div className="adm-spinner" />Fetching user intelligence…</div>}

      <AnimatePresence>
        {profileData && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Row className="g-3">
              <Col xs={12} lg={6}>
                <div className="adm-panel">
                  <div className="adm-panel-title"><RiUserStarLine size={14} />Intelligence Profile</div>
                  <ScalarCards data={profileData} />
                  {profileData && typeof profileData === "object" &&
                    Object.entries(profileData).filter(([, v]) => typeof v === "object" && v !== null).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>
                          {k.replace(/_/g, " ")}
                        </div>
                        {!Array.isArray(v) && <ScalarCards data={v} />}
                      </div>
                    ))
                  }
                  <details><summary>Raw Profile JSON</summary>
                    <pre className="adm-json" style={{ marginTop: 8 }}>{JSON.stringify(profileData, null, 2)}</pre>
                  </details>
                </div>
              </Col>
              {metricsData && (
                <Col xs={12} lg={6}>
                  <div className="adm-panel">
                    <div className="adm-panel-title">Metrics</div>
                    <ScalarCards data={metricsData} />
                    <details><summary>Raw Metrics JSON</summary>
                      <pre className="adm-json" style={{ marginTop: 8 }}>{JSON.stringify(metricsData, null, 2)}</pre>
                    </details>
                  </div>
                </Col>
              )}
            </Row>
          </motion.div>
        )}
      </AnimatePresence>

      {!profileData && !loading && <div className="adm-empty">Enter a User UUID above to load their intelligence data.</div>}
    </div>
  );
}
