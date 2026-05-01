import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { RiMagicLine, RiPlayLine } from "react-icons/ri";
import { FiAlertCircle } from "react-icons/fi";
import { baseUrl } from "../../auth/config";

const SCENARIOS = [
  "ammonia_spike_intervention","ph_correction",
  "temperature_stabilisation","bioload_reduction","lighting_adjustment",
];

export default function Counterfactual({ token }) {
  const [entityId, setEntityId] = useState("");
  const [entityType, setEntityType] = useState("user");
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [customScenario, setCustomScenario] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const run = async () => {
    if (!entityId.trim()) { setError("Entity ID is required"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${baseUrl}/intelligence/platform/counterfactual/`, {
        method: "POST", headers,
        body: JSON.stringify({ entity_id: entityId, entity_type: entityType, scenario: useCustom ? customScenario : scenario }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Counterfactual failed"); return; }
      setResult(json?.data || json);
    } catch { setError("Request failed."); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">Counterfactual Analysis</h2>
          <p className="adm-tab-sub">Simulate "what if" intervention scenarios for any entity</p>
        </div>
      </div>

      {error && <div className="adm-error-msg"><FiAlertCircle size={14} />{error}</div>}

      <Row className="g-3">
        <Col xs={12} lg={5}>
          <div className="adm-panel">
            <div className="adm-panel-title"><RiMagicLine size={14} />Scenario Config</div>

            <div className="adm-form-group">
              <label className="adm-form-label">Entity ID (UUID)</label>
              <input className="adm-input" placeholder="e.g. 5e56bddd-..." value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Entity Type</label>
              <select className="adm-input" value={entityType} onChange={(e) => setEntityType(e.target.value)}>
                <option value="user">User</option>
                <option value="tank">Tank</option>
                <option value="breeder">Breeder</option>
              </select>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Scenario Mode</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button className={`adm-btn ${!useCustom ? "adm-btn-primary" : "adm-btn-secondary"}`} style={{ flex: 1 }} onClick={() => setUseCustom(false)}>Preset</button>
                <button className={`adm-btn ${useCustom ? "adm-btn-primary" : "adm-btn-secondary"}`} style={{ flex: 1 }} onClick={() => setUseCustom(true)}>Custom</button>
              </div>
              {useCustom
                ? <input className="adm-input" placeholder="Enter scenario key" value={customScenario} onChange={(e) => setCustomScenario(e.target.value)} />
                : <select className="adm-input" value={scenario} onChange={(e) => setScenario(e.target.value)}>
                    {SCENARIOS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
              }
            </div>

            <button className="adm-btn adm-btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={run} disabled={loading}>
              {loading
                ? <><div className="adm-spinner" style={{ width: 14, height: 14 }} />Running…</>
                : <><RiPlayLine size={15} />Run Counterfactual</>}
            </button>
          </div>
        </Col>

        <Col xs={12} lg={7}>
          <div className="adm-panel" style={{ minHeight: 260 }}>
            <div className="adm-panel-title">Results</div>
            {loading && <div className="adm-loading"><div className="adm-spinner" />Computing…</div>}
            {!result && !loading && <div className="adm-empty">Configure and run a scenario to see results.</div>}
            {result && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {typeof result === "object" && (
                  <div className="adm-stat-row" style={{ marginBottom: 14 }}>
                    {Object.entries(result).filter(([, v]) => typeof v === "number" || typeof v === "string").slice(0, 4).map(([k, v]) => (
                      <div key={k} className="adm-stat-card">
                        <div className="adm-stat-label">{k.replace(/_/g, " ")}</div>
                        <div className="adm-stat-value" style={{ fontSize: 14 }}>{String(v)}</div>
                      </div>
                    ))}
                  </div>
                )}
                <pre className="adm-json">{JSON.stringify(result, null, 2)}</pre>
              </motion.div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
