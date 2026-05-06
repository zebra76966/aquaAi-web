import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/authcontext";
import { baseUrl } from "./auth/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaEdit, FaClock, FaFish, FaTools, FaBoxOpen,
  FaChartLine, FaShoppingCart, FaLink, FaTrash, FaExternalLinkAlt,
  FaFlask, FaThermometerHalf, FaExclamationTriangle, FaCheckCircle,
  FaInfoCircle, FaShieldAlt, FaSyringe, FaCalendarAlt, FaFireAlt,
  FaTint, FaBoxes, FaBolt, FaIndustry, FaBarcode,
  FaArrowUp, FaArrowDown, FaMinus, FaTag, FaLeaf, FaWater,
} from "react-icons/fa";
import { MdScience, MdOutlineWaterDrop } from "react-icons/md";
import "./TankDetail.css";

const METRICS = [
  { key: "temperature", label: "Temperature", unit: "°C", color: "#e63946", icon: <FaThermometerHalf /> },
  { key: "estimated_ph", label: "pH", unit: "", color: "#457b9d", icon: <MdScience /> },
  { key: "estimated_ammonia_ppm", label: "Ammonia", unit: "ppm", color: "#e76f51", icon: <FaFlask /> },
  { key: "estimated_nitrate_ppm", label: "Nitrate", unit: "ppm", color: "#2a9d8f", icon: <MdOutlineWaterDrop /> },
  { key: "estimated_nitrite_ppm", label: "Nitrite", unit: "ppm", color: "#f4a261", icon: <FaTint /> },
  { key: "estimated_oxygen_mgL", label: "Oxygen", unit: "mg/L", color: "#00b4d8", icon: <FaLeaf /> },
];

const CATEGORY_COLORS = {
  ALKALINITY: { color: "#8ac926", bg: "rgba(138,201,38,0.12)" },
  PH: { color: "#457b9d", bg: "rgba(69,123,157,0.12)" },
  NITRATE: { color: "#2a9d8f", bg: "rgba(42,157,143,0.12)" },
  NITRITE: { color: "#f4a261", bg: "rgba(244,162,97,0.12)" },
  AMMONIA: { color: "#e76f51", bg: "rgba(231,111,81,0.12)" },
  TEMPERATURE: { color: "#e63946", bg: "rgba(230,57,70,0.12)" },
  OXYGEN: { color: "#00b4d8", bg: "rgba(0,180,216,0.12)" },
  DEFAULT: { color: "#00f2ff", bg: "rgba(0,242,255,0.1)" },
};

const PRIORITY_CONFIG = {
  HIGH: { color: "#e63946", icon: <FaBolt />, label: "High Priority" },
  MEDIUM: { color: "#f4a261", icon: <FaFireAlt />, label: "Medium Priority" },
  LOW: { color: "#2a9d8f", icon: <FaCheckCircle />, label: "Low Priority" },
};

function ProductCard({ p, onDelete, deleting }) {
  const [expanded, setExpanded] = useState(false);

  const pct = p.percentage_left ?? p.volume_summary?.percentage_left ?? 100;
  const isLow = p.is_low ?? p.volume_summary?.is_low ?? false;
  const vol = p.volume_summary;
  const dosage = p.dosage_history?.current_dosage;
  const priority = dosage?.priority ? PRIORITY_CONFIG[dosage.priority] : null;
  const cats = p.product_categories || [];
  const catStyle = cats.length ? (CATEGORY_COLORS[cats[0]] || CATEGORY_COLORS.DEFAULT) : CATEGORY_COLORS.DEFAULT;

  const barColor = isLow ? "#e63946" : pct > 50 ? "#00f2ff" : "#f4a261";

  const nextDose = p.dosage_history?.next_dose_date;
  const daysUntilDose = nextDose
    ? Math.ceil((new Date(nextDose) - new Date()) / 86400000)
    : null;

  return (
    <motion.div
      className={"prd-card" + (isLow ? " prd-card--low" : "")}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="prd-top">
        {p.product_image ? (
          <img src={p.product_image} alt={p.product_name} className="prd-img" />
        ) : (
          <div className="prd-img-placeholder"><FaBoxOpen /></div>
        )}

        <div className="prd-header">
          {cats.length > 0 && (
            <div className="prd-cats">
              {cats.map((c) => {
                const cs = CATEGORY_COLORS[c] || CATEGORY_COLORS.DEFAULT;
                return (
                  <span key={c} className="prd-cat-chip" style={{ color: cs.color, background: cs.bg }}>
                    <FaTag /> {c}
                  </span>
                );
              })}
            </div>
          )}

          <h3 className="prd-name">{p.product_name}</h3>

          <div className="prd-pkg-row">
            <span className="prd-pkg-chip">
              <FaBoxes /> {p.package_display || (p.package_value + " " + p.package_unit)}
            </span>
            {p.is_owned && (
              <span className="prd-owned-chip"><FaCheckCircle /> Owned</span>
            )}
          </div>
        </div>

        <button
          className="prd-delete-btn"
          onClick={() => onDelete(p.id)}
          disabled={deleting}
          aria-label="Remove product"
        >
          {deleting ? <span className="td-spinner-sm" /> : <FaTrash />}
        </button>
      </div>

      <div className="prd-volume-section">
        <div className="prd-vol-header">
          <span className="prd-vol-label">
            {isLow
              ? <><FaExclamationTriangle style={{ color: "#e63946" }} /> Running low</>
              : <><FaWater style={{ color: barColor }} /> Volume remaining</>
            }
          </span>
          <span className="prd-vol-pct" style={{ color: barColor }}>{pct}%</span>
        </div>
        <div className="prd-bar-track">
          <div
            className="prd-bar-fill"
            style={{ width: (Math.max(pct, 2) + "%"), background: ("linear-gradient(90deg, " + barColor + "99, " + barColor + ")") }}
          />
        </div>
        {vol && (
          <div className="prd-vol-stats">
            <span><FaBoxOpen /> {vol.current} left</span>
            <span><FaMinus /> {vol.used} used</span>
            <span><FaBoxes /> {vol.package} total</span>
          </div>
        )}
      </div>

      {dosage && (
        <div className="prd-dosage-row" style={{ borderColor: (priority ? priority.color + "44" : "rgba(255,255,255,0.1)") }}>
          <div className="prd-dosage-main">
            <span className="prd-dosage-icon" style={{ color: priority ? priority.color : "#00f2ff" }}>
              {priority ? priority.icon : <FaSyringe />}
            </span>
            <div>
              <p className="prd-dosage-label">Next dose</p>
              <p className="prd-dosage-amount" style={{ color: priority ? priority.color : "#00f2ff" }}>
                {dosage.dosage_amount} {dosage.dosage_unit}
                <span className="prd-dosage-freq"> every {dosage.frequency_days}d</span>
              </p>
            </div>
          </div>
          {daysUntilDose !== null && (
            <div className="prd-dose-due" style={{
              background: daysUntilDose <= 0 ? "rgba(230,57,70,0.12)" : "rgba(255,255,255,0.05)",
              color: daysUntilDose <= 0 ? "#e63946" : "rgba(226,232,240,0.55)",
            }}>
              <FaCalendarAlt />
              {daysUntilDose <= 0 ? "Due now" : ("In " + daysUntilDose + "d")}
            </div>
          )}
        </div>
      )}

      <button className="prd-expand-btn" onClick={() => setExpanded(function(v) { return !v; })}>
        <FaInfoCircle />
        {expanded ? "Hide details" : "View details"}
        <span className={"prd-expand-arrow" + (expanded ? " prd-arrow-up" : "")}>▾</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="prd-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {dosage && dosage.reason && (
              <div className="prd-detail-block prd-detail-reason">
                <div className="prd-detail-block-header">
                  <FaSyringe style={{ color: priority ? priority.color : "#00f2ff" }} />
                  <span>Dosage Rationale</span>
                  {priority && (
                    <span className="prd-priority-chip" style={{ color: priority.color, background: priority.color + "18" }}>
                      {priority.icon} {priority.label}
                    </span>
                  )}
                </div>
                <p className="prd-detail-text">{dosage.reason}</p>
              </div>
            )}

            {p.guidelines && (
              <>
                {p.guidelines.parameter_observation && (
                  <div className="prd-detail-block">
                    <div className="prd-detail-block-header"><FaChartLine style={{ color: "#00f2ff" }} /><span>Parameter Observation</span></div>
                    <p className="prd-detail-text">{p.guidelines.parameter_observation}</p>
                  </div>
                )}
                {p.guidelines.safety_warnings && (
                  <div className="prd-detail-block prd-detail-warn">
                    <div className="prd-detail-block-header"><FaShieldAlt style={{ color: "#f4a261" }} /><span>Safety Warnings</span></div>
                    <p className="prd-detail-text">{p.guidelines.safety_warnings}</p>
                  </div>
                )}
                {p.guidelines.depletion_timeline && (
                  <div className="prd-detail-block">
                    <div className="prd-detail-block-header"><FaClock style={{ color: "#8ac926" }} /><span>Depletion Timeline</span></div>
                    <p className="prd-detail-text">{p.guidelines.depletion_timeline}</p>
                  </div>
                )}
              </>
            )}

            <div className="prd-stats-row">
              <div className="prd-stat">
                <FaCalendarAlt className="prd-stat-icon" />
                <span className="prd-stat-val">{p.dosage_history ? p.dosage_history.total_doses_used : 0}</span>
                <span className="prd-stat-label">Doses used</span>
              </div>
              <div className="prd-stat">
                <FaCheckCircle className="prd-stat-icon" style={{ color: "#2a9d8f" }} />
                <span className="prd-stat-val">{dosage ? dosage.confidence : "—"}</span>
                <span className="prd-stat-label">Confidence</span>
              </div>
              {p.dosage_history && p.dosage_history.last_dose_date && (
                <div className="prd-stat">
                  <FaClock className="prd-stat-icon" />
                  <span className="prd-stat-val">{new Date(p.dosage_history.last_dose_date).toLocaleDateString()}</span>
                  <span className="prd-stat-label">Last dose</span>
                </div>
              )}
            </div>

            {p.affiliate_url && (
              <a href={p.affiliate_url} target="_blank" rel="noreferrer" className="prd-buy-btn">
                <FaShoppingCart /> Buy product <FaExternalLinkAlt style={{ fontSize: 11 }} />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TankDetail() {
  const { tankId } = useParams();
  const { token, permissions } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tank, setTank] = useState(null);
  const [species, setSpecies] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [tankProducts, setTankProducts] = useState([]);
  const [waterHistory, setWaterHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("species");
  const [activeMetric, setActiveMetric] = useState(METRICS[0]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: "", tank_type: "FRESH", size: "", size_unit: "L", notes: "" });
  const [updateLoading, setUpdateLoading] = useState(false);

  const [waterForm, setWaterForm] = useState({
    temperature: "", estimated_ph: "", estimated_ammonia_ppm: "",
    estimated_nitrate_ppm: "", estimated_nitrite_ppm: ""
  });
  const [waterUpdateLoading, setWaterUpdateLoading] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);

  const [deletingProductId, setDeletingProductId] = useState(null);
  const [selectedFish, setSelectedFish] = useState(null);
  const [fishModal, setFishModal] = useState(false);

  const fetchTankData = useCallback(async () => {
    if (!token || !tankId) return;
    setLoading(true);
    try {
      const headers = { Authorization: "Bearer " + token };
      const [tankRes, speciesRes] = await Promise.all([
        fetch(baseUrl + "/tanks/tank/" + tankId + "/", { headers }),
        fetch(baseUrl + "/tanks/" + tankId + "/species/", { headers }),
      ]);
      const tankJson = await tankRes.json();
      const speciesJson = await speciesRes.json();
      setTank(tankJson.data);
      setSpecies(speciesJson.species || []);
      if (tankJson.data) {
        setUpdateForm({
          name: tankJson.data.name || "",
          tank_type: tankJson.data.tank_type || "FRESH",
          size: String(tankJson.data.size || ""),
          size_unit: tankJson.data.size_unit || "L",
          notes: tankJson.data.notes || "",
        });
      }
    } catch (err) {
      console.error("Tank fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, tankId]);

  const fetchEquipments = useCallback(async () => {
    if (!token || !tankId) return;
    setEquipmentLoading(true);
    try {
      const res = await fetch(baseUrl + "/tanks/" + tankId + "/equipments/", {
        headers: { Authorization: "Bearer " + token },
      });
      const json = await res.json();
      setEquipments(json.data || []);
    } catch (err) { console.error(err); } finally { setEquipmentLoading(false); }
  }, [token, tankId]);

  const fetchTankProducts = useCallback(async () => {
    if (!token || !tankId) return;
    setProductsLoading(true);
    try {
      const res = await fetch(baseUrl + "/tanks/" + tankId + "/products/", {
        headers: { Authorization: "Bearer " + token },
      });
      const json = await res.json();
      setTankProducts(Array.isArray(json.data && json.data.results) ? json.data.results : (json.data ? (Array.isArray(json.data) ? json.data : []) : []));
    } catch (err) { console.error(err); } finally { setProductsLoading(false); }
  }, [token, tankId]);

  const fetchWaterHistory = useCallback(async () => {
    if (!token || !tankId) return;
    try {
      const res = await fetch(baseUrl + "/tanks/" + tankId + "/water-parameters/history/", {
        headers: { Authorization: "Bearer " + token },
      });
      const json = await res.json();
      setWaterHistory((json.data && json.data.parameters) || []);
    } catch (err) { console.error(err); }
  }, [token, tankId]);

  useEffect(() => { fetchTankData(); fetchWaterHistory(); }, [fetchTankData, fetchWaterHistory]);
  useEffect(() => {
    if (activeTab === "equipment") fetchEquipments();
    if (activeTab === "products") fetchTankProducts();
  }, [activeTab, fetchEquipments, fetchTankProducts]);

  const handleImportProduct = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportError("");
    try {
      const res = await fetch(baseUrl + "/tanks/" + tankId + "/products/import/", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ product_url: importUrl.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json && json.message ? json.message : "Failed to import");
      setImportSuccess(true);
      setImportUrl("");
      fetchTankProducts();
      setTimeout(function() { setShowImportModal(false); setImportSuccess(false); }, 1800);
    } catch (err) { setImportError(err.message); } finally { setImportLoading(false); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Remove this product from the tank?")) return;
    setDeletingProductId(productId);
    try {
      await fetch(baseUrl + "/tanks/" + tankId + "/products/" + productId + "/delete/", {
        method: "DELETE", headers: { Authorization: "Bearer " + token },
      });
      setTankProducts(function(prev) { return prev.filter(function(p) { return p.id !== productId; }); });
    } catch (err) { console.error(err); } finally { setDeletingProductId(null); }
  };

  const handleUpdateTank = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await fetch(baseUrl + "/tanks/tank/update/" + tankId + "/", {
        method: "PUT",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({}, updateForm, { size: parseFloat(updateForm.size) })),
      });
      if (res.ok) { setShowUpdateModal(false); fetchTankData(); }
    } catch (err) { console.error(err); } finally { setUpdateLoading(false); }
  };

  const handleUpdateWater = async (e) => {
    e.preventDefault();
    setWaterUpdateLoading(true);
    try {
      const body = {};
      Object.entries(waterForm).forEach(function(entry) { if (entry[1] !== "") body[entry[0]] = parseFloat(entry[1]); });
      const res = await fetch(baseUrl + "/tanks/" + tankId + "/water-parameters/", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowWaterModal(false); fetchTankData(); fetchWaterHistory(); }
    } catch (err) { console.error(err); } finally { setWaterUpdateLoading(false); }
  };

  const chartData = waterHistory
    .filter(function(h) { return h && h[activeMetric.key] != null && !isNaN(h[activeMetric.key]); })
    .map(function(h) { return { x: new Date(h.scanned_at), y: Number(h[activeMetric.key]) }; })
    .reverse();
  const chartMin = chartData.length ? Math.min.apply(null, chartData.map(function(d) { return d.y; })) : 0;
  const chartMax = chartData.length ? Math.max.apply(null, chartData.map(function(d) { return d.y; })) : 1;
  const chartRange = chartMax - chartMin || 1;

  const TABS = [
    { key: "species", label: "Species", count: species.length, icon: <FaFish /> },
    { key: "equipment", label: "Equipment", count: equipments.length, icon: <FaTools /> },
    { key: "products", label: "Products", count: tankProducts.length, icon: <FaBoxOpen /> },
    { key: "water", label: "Water History", count: null, icon: <FaChartLine /> },
  ];

  if (loading) return (
    <div className="td-wrapper">
      <div className="td-loader"><div className="td-spinner" /><p>Loading tank data…</p></div>
    </div>
  );

  if (!tank) return (
    <div className="td-wrapper">
      <div className="td-loader">
        <p style={{ color: "#e63946" }}>Failed to load tank.</p>
        <button className="td-back-btn" onClick={function() { navigate("/tanks"); }}>← Back to Tanks</button>
      </div>
    </div>
  );

  return (
    <div className="td-wrapper">
      <div className="td-bg-mesh" />

      <div className="td-header">
        <button className="td-back-btn" onClick={function() { navigate("/tanks"); }}>
          <FaArrowLeft /> Tanks
        </button>

        <div className="td-header-main">
          <div className="td-tank-info">
            {tank.image_url && <img src={tank.image_url} alt={tank.name} className="td-tank-thumb" />}
            <div>
              <h1 className="td-tank-name">{tank.name}</h1>
              <div className="td-tank-meta">
                <span className={"td-type-badge td-type-" + (tank.tank_type ? tank.tank_type.toLowerCase() : "")}>
                  <FaFish />
                  {tank.tank_type === "FRESH" ? "Freshwater" : tank.tank_type === "SALT" ? "Saltwater" : "Brackish"}
                </span>
                <span className="td-size-chip">{tank.size} {tank.size_unit}</span>
                {tank.notes && <span className="td-notes-chip" title={tank.notes}><FaInfoCircle /> Notes</span>}
              </div>
            </div>
          </div>
          <div className="td-header-actions">
            <button className="td-action-btn td-btn-secondary" onClick={function() { setShowWaterModal(true); }}>
              <MdOutlineWaterDrop /> Update Water
            </button>
            <button className="td-action-btn td-btn-primary" onClick={function() { setShowUpdateModal(true); }}>
              <FaEdit /> Edit Tank
            </button>
          </div>
        </div>

        {tank.latest_water_parameters && (
          <div className="td-params-row">
            {METRICS.filter(function(m) { return tank.latest_water_parameters[m.key] != null; }).map(function(m) {
              return (
                <div key={m.key} className="td-param-chip">
                  <span className="td-param-icon" style={{ color: m.color }}>{m.icon}</span>
                  <span className="td-param-val" style={{ color: m.color }}>{tank.latest_water_parameters[m.key]}{m.unit}</span>
                  <span className="td-param-label">{m.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="td-tabs">
        {TABS.map(function(t) {
          return (
            <button key={t.key} className={"td-tab" + (activeTab === t.key ? " td-tab-active" : "")} onClick={function() { setActiveTab(t.key); }}>
              <span className="td-tab-icon">{t.icon}</span>
              {t.label}
              {t.count != null && <span className="td-tab-count">{t.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="td-content">
        <AnimatePresence mode="wait">

          {activeTab === "species" && (
            <motion.div key="species" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {species.length === 0 ? (
                <div className="td-empty">
                  <div className="td-empty-icon"><FaFish /></div>
                  <p>No species added yet.</p>
                  <p className="td-empty-sub">Use the AquaAI mobile app to scan and add fish to this tank.</p>
                </div>
              ) : (
                <div className="td-species-grid">
                  {species.map(function(item, i) {
                    return (
                      <motion.div key={item.id || i} className="td-species-card"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={function() { setSelectedFish(item); setFishModal(true); }}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.metadata && item.metadata.species_name} className="td-species-img" />
                          : <div className="td-species-img-placeholder"><FaFish /></div>
                        }
                        <div className="td-species-info">
                          <p className="td-species-name">{(item.metadata && item.metadata.species_name) || item.class_name || "Unknown"}</p>
                          <p className="td-species-sci">{item.metadata && item.metadata.species_Nomenclature}</p>
                          <div className="td-species-meta">
                            {item.quantity && <span className="td-qty-badge">×{item.quantity}</span>}
                            {item.compatibility && item.compatibility.is_compatible === false && (
                              <span className="td-compat-warn"><FaExclamationTriangle /> Issues</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "equipment" && (
            <motion.div key="equip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {equipmentLoading ? (
                <div className="td-loading-row"><div className="td-spinner" /></div>
              ) : equipments.length === 0 ? (
                <div className="td-empty">
                  <div className="td-empty-icon"><FaTools /></div>
                  <p>No equipment added yet.</p>
                  <p className="td-empty-sub">Add filters, heaters, and pumps via the mobile app.</p>
                </div>
              ) : (
                <div className="td-equip-list">
                  {equipments.map(function(eq, i) {
                    return (
                      <motion.div key={eq.id || i} className="td-equip-card"
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        {eq.image_url && <img src={eq.image_url} alt={eq.equipment_name} className="td-equip-img" />}
                        <div className="td-equip-info">
                          <p className="td-equip-name">{eq.equipment_name}</p>
                          <p className="td-equip-type">{eq.equipment_type}</p>
                          <div className="td-equip-chips">
                            {eq.brand && <span className="td-chip"><FaIndustry /> {eq.brand}</span>}
                            {eq.wattage && <span className="td-chip"><FaBolt /> {eq.wattage}</span>}
                            {eq.model_number && <span className="td-chip"><FaBarcode /> {eq.model_number}</span>}
                          </div>
                          {eq.notes && <p className="td-equip-notes">{eq.notes}</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "products" && (
            <motion.div key="prods" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="td-products-header">
                <div>
                  <p className="td-products-title">Tank Products</p>
                  <p className="td-products-sub">
                    {tankProducts.length > 0
                      ? tankProducts.length + " product" + (tankProducts.length > 1 ? "s" : "") + " tracked · AI dosage recommendations active"
                      : "Add products to track dosage and get AI recommendations"}
                  </p>
                </div>
                <button className="td-action-btn td-btn-primary" onClick={function() { setShowImportModal(true); }}>
                  <FaLink /> Add via Link
                </button>
              </div>

              {productsLoading ? (
                <div className="td-loading-row"><div className="td-spinner" /></div>
              ) : tankProducts.length === 0 ? (
                <div className="td-empty">
                  <div className="td-empty-icon"><FaShoppingCart /></div>
                  <p>No products tracked yet.</p>
                  <p className="td-empty-sub">Paste an Amazon or retailer link — AquaAI will import the product and generate AI dosage recommendations for your tank.</p>
                  <button className="td-action-btn td-btn-primary" style={{ marginTop: 20 }} onClick={function() { setShowImportModal(true); }}>
                    <FaLink /> Add Product via Link
                  </button>
                </div>
              ) : (
                <div className="td-products-list">
                  {tankProducts.map(function(p, i) {
                    return <ProductCard key={p.id || i} p={p} onDelete={handleDeleteProduct} deleting={deletingProductId === p.id} />;
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "water" && (
            <motion.div key="water" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="td-metric-selector">
                {METRICS.map(function(m) {
                  return (
                    <button key={m.key}
                      className={"td-metric-btn" + (activeMetric.key === m.key ? " td-metric-active" : "")}
                      style={activeMetric.key === m.key ? { borderColor: m.color, color: m.color, background: m.color + "14" } : {}}
                      onClick={function() { setActiveMetric(m); }}>
                      <span style={{ fontSize: 13 }}>{m.icon}</span> {m.label}
                    </button>
                  );
                })}
              </div>

              {chartData.length === 0 ? (
                <div className="td-empty">
                  <div className="td-empty-icon"><FaChartLine /></div>
                  <p>No history for {activeMetric.label} yet.</p>
                  <p className="td-empty-sub">Scan water parameters to start tracking trends.</p>
                </div>
              ) : (
                <div className="td-chart-wrap">
                  <div className="td-chart-header">
                    <h3 className="td-chart-title" style={{ color: activeMetric.color }}>
                      {activeMetric.icon} {activeMetric.label}
                    </h3>
                    <div className="td-chart-stats">
                      <span><FaArrowDown style={{ color: "#2a9d8f" }} /> {Math.min.apply(null, chartData.map(function(d){return d.y;})).toFixed(2)}</span>
                      <span><FaArrowUp style={{ color: "#e63946" }} /> {Math.max.apply(null, chartData.map(function(d){return d.y;})).toFixed(2)}</span>
                      <span><FaMinus style={{ color: "#00f2ff" }} /> {(chartData.reduce(function(a,b){return a+b.y;},0)/chartData.length).toFixed(2)} avg</span>
                    </div>
                  </div>
                  <div className="td-chart-svg-wrap">
                    <svg viewBox={"0 0 " + (chartData.length * 40) + " 160"} className="td-chart-svg" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeMetric.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={activeMetric.color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polyline
                        points={chartData.map(function(d,i){return (i*40+20)+","+(140-((d.y-chartMin)/chartRange)*120);}).join(" ")}
                        fill="none" stroke={activeMetric.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                      <polygon
                        points={chartData.map(function(d,i){return (i*40+20)+","+(140-((d.y-chartMin)/chartRange)*120);}).concat([(chartData.length-1)*40+20+",140","20,140"]).join(" ")}
                        fill="url(#chartGrad)"
                      />
                      {chartData.map(function(d,i){
                        return <circle key={i} cx={i*40+20} cy={140-((d.y-chartMin)/chartRange)*120} r="4" fill={activeMetric.color} opacity="0.8" />;
                      })}
                    </svg>
                  </div>
                  <div className="td-chart-labels">
                    {chartData.filter(function(_,i){return i===0||i===chartData.length-1||i%Math.ceil(chartData.length/5)===0;}).map(function(d,i){
                      return <span key={i} className="td-chart-label">{new Date(d.x).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</span>;
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fish Modal */}
      <AnimatePresence>
        {fishModal && selectedFish && (
          <motion.div className="td-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={function(){setFishModal(false);}}>
            <motion.div className="td-modal" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={function(e){e.stopPropagation();}}>
              <button className="td-modal-close" onClick={function(){setFishModal(false);}}><FaArrowLeft style={{ fontSize: 13 }} /></button>
              {selectedFish.image_url && <img src={selectedFish.image_url} alt="" className="td-modal-fish-img" />}
              <h2 className="td-modal-title">{(selectedFish.metadata && selectedFish.metadata.species_name) || "Unknown Species"}</h2>
              <p className="td-modal-sci">{selectedFish.metadata && selectedFish.metadata.species_Nomenclature}</p>
              {selectedFish.compatibility && selectedFish.compatibility.issues && selectedFish.compatibility.issues.length > 0 && (
                <div className="td-modal-compat-issues">
                  <h4><FaExclamationTriangle /> Compatibility Issues</h4>
                  {selectedFish.compatibility.issues.map(function(iss,i){return <p key={i} className="td-compat-issue-item">{iss}</p>;})}
                </div>
              )}
              {selectedFish.quantity && <p className="td-modal-qty"><FaFish /> Quantity: {selectedFish.quantity}</p>}
              {selectedFish.notes && <p className="td-modal-notes">{selectedFish.notes}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div className="td-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={function(){setShowImportModal(false);}}>
            <motion.div className="td-modal td-modal-form" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={function(e){e.stopPropagation();}}>
              <button className="td-modal-close" onClick={function(){setShowImportModal(false);}}><FaArrowLeft style={{ fontSize: 13 }} /></button>
              <h2 className="td-modal-title"><FaLink style={{ fontSize: 18, color: "#00f2ff" }} /> Add Product via Link</h2>
              <p className="td-modal-sub">Paste a product URL from Amazon or any retailer. AquaAI will automatically scrape and generate personalised dosage recommendations for your tank.</p>
              {importSuccess ? (
                <div className="td-import-success"><FaCheckCircle style={{ color: "#2a9d8f", marginRight: 8 }} /> Product imported successfully!</div>
              ) : (
                <form onSubmit={handleImportProduct}>
                  <input className="td-form-input" type="url" placeholder="https://www.amazon.com/product..." value={importUrl} onChange={function(e){setImportUrl(e.target.value);}} required />
                  {importError && <p className="td-form-error"><FaExclamationTriangle /> {importError}</p>}
                  <button type="submit" className="td-action-btn td-btn-primary td-btn-full" disabled={importLoading}>
                    {importLoading ? <><span className="td-spinner-sm" /> Importing…</> : <><FaLink /> Import Product</>}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Tank Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div className="td-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={function(){setShowUpdateModal(false);}}>
            <motion.div className="td-modal td-modal-form" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={function(e){e.stopPropagation();}}>
              <button className="td-modal-close" onClick={function(){setShowUpdateModal(false);}}><FaArrowLeft style={{ fontSize: 13 }} /></button>
              <h2 className="td-modal-title"><FaEdit style={{ fontSize: 18, color: "#00f2ff" }} /> Edit Tank</h2>
              <form onSubmit={handleUpdateTank}>
                <label className="td-form-label">Tank Name</label>
                <input className="td-form-input" value={updateForm.name} onChange={function(e){setUpdateForm(Object.assign({},updateForm,{name:e.target.value}));}} />
                <label className="td-form-label">Tank Type</label>
                <select className="td-form-input" value={updateForm.tank_type} onChange={function(e){setUpdateForm(Object.assign({},updateForm,{tank_type:e.target.value}));}}>
                  <option value="FRESH">Freshwater</option>
                  <option value="SALT">Saltwater</option>
                  <option value="BRACKISH">Brackish</option>
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label className="td-form-label">Size</label>
                    <input className="td-form-input" type="number" value={updateForm.size} onChange={function(e){setUpdateForm(Object.assign({},updateForm,{size:e.target.value}));}} />
                  </div>
                  <div style={{ width: 80 }}>
                    <label className="td-form-label">Unit</label>
                    <select className="td-form-input" value={updateForm.size_unit} onChange={function(e){setUpdateForm(Object.assign({},updateForm,{size_unit:e.target.value}));}}>
                      <option value="L">L</option>
                      <option value="G">G</option>
                    </select>
                  </div>
                </div>
                <label className="td-form-label">Notes</label>
                <textarea className="td-form-input td-form-textarea" value={updateForm.notes} onChange={function(e){setUpdateForm(Object.assign({},updateForm,{notes:e.target.value}));}} />
                <button type="submit" className="td-action-btn td-btn-primary td-btn-full" disabled={updateLoading}>
                  {updateLoading ? <span className="td-spinner-sm" /> : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water Modal */}
      <AnimatePresence>
        {showWaterModal && (
          <motion.div className="td-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={function(){setShowWaterModal(false);}}>
            <motion.div className="td-modal td-modal-form" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={function(e){e.stopPropagation();}}>
              <button className="td-modal-close" onClick={function(){setShowWaterModal(false);}}><FaArrowLeft style={{ fontSize: 13 }} /></button>
              <h2 className="td-modal-title"><MdOutlineWaterDrop style={{ fontSize: 20, color: "#00f2ff" }} /> Update Water Parameters</h2>
              <form onSubmit={handleUpdateWater}>
                {METRICS.map(function(m){
                  return (
                    <div key={m.key}>
                      <label className="td-form-label"><span style={{ color: m.color, marginRight: 6 }}>{m.icon}</span>{m.label}{m.unit ? " (" + m.unit + ")" : ""}</label>
                      <input className="td-form-input" type="number" step="0.01" placeholder={"Enter " + m.label.toLowerCase()} value={waterForm[m.key] || ""} onChange={function(e){setUpdateForm !== null && setWaterForm(Object.assign({}, waterForm, {[m.key]: e.target.value}));}} />
                    </div>
                  );
                })}
                <button type="submit" className="td-action-btn td-btn-primary td-btn-full" disabled={waterUpdateLoading}>
                  {waterUpdateLoading ? <span className="td-spinner-sm" /> : "Update Parameters"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
