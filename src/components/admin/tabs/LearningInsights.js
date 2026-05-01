import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { RiBrainLine, RiSearchLine } from "react-icons/ri";
import { FiAlertCircle } from "react-icons/fi";
import { baseUrl } from "../../auth/config";

export default function LearningInsights({ token }) {
  const [entityId, setEntityId] = useState("");
  const [entityType, setEntityType] = useState("user");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetch_ = async () => {
    if (!entityId.trim()) { setError("Entity ID is required"); return; }
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`${baseUrl}/intelligence/platform/learning-insights/`, { method: "GET", headers });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Failed to fetch insights"); return; }
      setData(json?.data || json);
    } catch { setError("Request failed."); }
    finally { setLoading(false); }
  };

  const scalarEntries = data && typeof data === "object" && !Array.isArray(data)
    ? Object.entries(data).filter(([, v]) => typeof v === "number" || typeof v === "string").slice(0, 6)
    : [];

  return (
    <div>
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">Learning Insights</h2>
          <p className="adm-tab-sub">Inspect what the platform has learned about any entity</p>
        </div>
      </div>

      {error && <div className="adm-error-msg"><FiAlertCircle size={14} />{error}</div>}

      <div className="adm-panel" style={{ marginBottom: 20 }}>
        <div className="adm-panel-title"><RiSearchLine size={14} />Query Entity</div>
        <Row className="g-2 align-items-end">
          <Col xs={12} md={6}>
            <label className="adm-form-label">Entity ID (UUID)</label>
            <input className="adm-input" placeholder="e.g. 5e56bddd-14e4-48bb-b0a5-6e0690d2de90"
              value={entityId} onChange={(e) => setEntityId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetch_()} />
          </Col>
          <Col xs={6} md={3}>
            <label className="adm-form-label">Entity Type</label>
            <select className="adm-input" value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              <option value="user">User</option>
              <option value="tank">Tank</option>
              <option value="breeder">Breeder</option>
            </select>
          </Col>
          <Col xs={6} md={3}>
            <button className="adm-btn adm-btn-primary" style={{ width: "100%" }} onClick={fetch_} disabled={loading}>
              {loading ? <><div className="adm-spinner" style={{ width: 14, height: 14 }} />Fetching…</> : <><RiSearchLine size={14} />Fetch</>}
            </button>
          </Col>
        </Row>
      </div>

      {loading && <div className="adm-loading"><div className="adm-spinner" />Fetching insights…</div>}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {scalarEntries.length > 0 && (
            <div className="adm-stat-row" style={{ marginBottom: 16 }}>
              {scalarEntries.map(([k, v]) => (
                <div key={k} className="adm-stat-card">
                  <div className="adm-stat-label">{k.replace(/_/g, " ")}</div>
                  <div className="adm-stat-value" style={{ fontSize: 15 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          <div className="adm-panel">
            <div className="adm-panel-title"><RiBrainLine size={14} />Full Insights</div>
            <pre className="adm-json">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </motion.div>
      )}

      {!data && !loading && <div className="adm-empty">Enter an entity ID above and fetch insights.</div>}
    </div>
  );
}
