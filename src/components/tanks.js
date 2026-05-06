import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaTrash, FaFish, FaSearch, FaWater,
  FaThermometerHalf, FaExclamationTriangle, FaEye,
  FaBolt, FaCheckCircle, FaTint, FaFlask,
} from "react-icons/fa";
import { MdOutlineWaterDrop } from "react-icons/md";
import { AuthContext } from "./auth/authcontext";
import { baseUrl } from "./auth/config";
import "./tanks.css";
import { useNavigate } from "react-router-dom";

const WATER_TYPE_CONFIG = {
  "fresh water": { label: "Freshwater", color: "#2dd4bf", glow: "rgba(45,212,191,0.15)" },
  "salt water":  { label: "Saltwater",  color: "#38bdf8", glow: "rgba(56,189,248,0.15)" },
  "brackish water": { label: "Brackish", color: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
};

function ParamBadge({ icon, value, label, color, warn }) {
  return (
    <div className={"hb-param" + (warn ? " hb-param--warn" : "")}>
      <span className="hb-param-icon" style={{ color }}>{icon}</span>
      <span className="hb-param-val">{value ?? "—"}</span>
      <span className="hb-param-key">{label}</span>
    </div>
  );
}

function TankCard({ tank, isActive, onActivate, onDelete, onView }) {
  const p = tank.waterParams || {};
  const typeKey = tank.waterType || "fresh water";
  const typeConf = WATER_TYPE_CONFIG[typeKey] || WATER_TYPE_CONFIG["fresh water"];

  const ammoniaDanger = p.estimated_ammonia_ppm > 0.5;
  const phWarn = p.estimated_ph && (p.estimated_ph < 6.5 || p.estimated_ph > 8.5);
  const hasAlert = ammoniaDanger || phWarn;

  return (
    <motion.article
      className={"hb-card" + (isActive ? " hb-card--active" : "") + (hasAlert ? " hb-card--alert" : "")}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      style={{ "--accent": typeConf.color, "--glow": typeConf.glow }}
    >
      {/* Active top bar */}
      {isActive && <div className="hb-active-bar" />}

      {/* Hero image */}
      <div className="hb-hero" onClick={onView}>
        {tank.image
          ? <img src={tank.image} alt={tank.name} className="hb-hero-img" />
          : (
            <div className="hb-hero-placeholder">
              <FaFish />
            </div>
          )
        }
        <div className="hb-hero-overlay" />

        {/* Badges on top of image */}
        <div className="hb-hero-badges">
          <span className="hb-type-pill" style={{ color: typeConf.color, background: typeConf.glow }}>
            <FaWater /> {typeConf.label}
          </span>
          {isActive && (
            <span className="hb-live-pill">
              <span className="hb-live-dot" />LIVE
            </span>
          )}
          {hasAlert && (
            <span className="hb-alert-pill">
              <FaExclamationTriangle /> Alert
            </span>
          )}
        </div>

        {/* Size chip bottom-right */}
        <span className="hb-size-chip">{tank.size}</span>
      </div>

      {/* Body */}
      <div className="hb-body">
        <div className="hb-title-row">
          <h3 className="hb-name">{tank.name}</h3>
          <button className="hb-icon-btn" onClick={onView} title="View details" aria-label="View tank details">
            <FaEye />
          </button>
        </div>

        {/* Water params */}
        <div className="hb-params">
          <ParamBadge
            icon={<FaThermometerHalf />}
            value={p.temperature != null ? p.temperature + "°" : null}
            label="Temp"
            color="#f87171"
          />
          <ParamBadge
            icon={<MdOutlineWaterDrop />}
            value={p.estimated_ph}
            label="pH"
            color="#60a5fa"
            warn={phWarn}
          />
          <ParamBadge
            icon={<FaFlask />}
            value={p.estimated_ammonia_ppm != null ? p.estimated_ammonia_ppm : null}
            label="NH₃"
            color="#fb923c"
            warn={ammoniaDanger}
          />
          <ParamBadge
            icon={<FaTint />}
            value={p.estimated_nitrate_ppm != null ? p.estimated_nitrate_ppm : null}
            label="NO₃"
            color="#34d399"
          />
        </div>

        {/* Footer actions */}
        <div className="hb-footer">
          <button
            className={"hb-activate-btn" + (isActive ? " hb-activate-btn--active" : "")}
            onClick={onActivate}
          >
            {isActive
              ? <><FaCheckCircle /> Dashboard</>
              : <><FaBolt /> Activate</>
            }
          </button>
          <button className="hb-delete-btn" onClick={onDelete} aria-label="Delete tank">
            <FaTrash />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Tanks() {
  const { token, logout, activeTankId, activateTank, permissions } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tanksData, setTanksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTanks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/tanks/get-tanks/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (response.ok && result.data.tanks) {
        setTanksData(
          result.data.tanks.map((tank) => ({
            id: tank.id,
            name: tank.name,
            waterType: tank.tank_type.toLowerCase() + " water",
            size: `${tank.size} ${tank.size_unit}`,
            image: tank.image_url || null,
            waterParams: tank?.latest_water_parameters || {},
          })),
        );
      } else if (response.status === 401) logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => { fetchTanks(); }, [fetchTanks]);

  const handleDeleteTank = async () => {
    if (!selectedTank) return;
    setDeleting(true);
    try {
      const response = await fetch(`${baseUrl}/tanks/tank/delete/${selectedTank.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setTanksData((prev) => prev.filter((t) => t.id !== selectedTank.id));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredTanks = tanksData.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const atLimit = tanksData.length >= (permissions?.max_habitats || 99);

  return (
    <div className="hb-wrapper">
      {/* Subtle background grid */}
      <div className="hb-grid-bg" />

      <div className="hb-container">
        {/* Header */}
        <motion.header
          className="hb-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p className="hb-eyebrow">AquaAI</p>
            <h1 className="hb-title">Habitats</h1>
            <p className="hb-subtitle">
              {loading ? "Loading…" : `${tanksData.length} aquatic system${tanksData.length !== 1 ? "s" : ""} under monitoring`}
            </p>
          </div>

          <div className="hb-header-right">
            <div className="hb-search">
              <FaSearch className="hb-search-icon" />
              <input
                type="text"
                placeholder="Search habitats…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="hb-search-input"
              />
            </div>

            <button
              className={"hb-add-btn" + (atLimit ? " hb-add-btn--disabled" : "")}
              disabled={atLimit}
              title={atLimit ? "Habitat limit reached" : "Add new tank"}
            >
              <FaPlus />
              <span>{atLimit ? "Limit reached" : "New Habitat"}</span>
            </button>
          </div>
        </motion.header>

        {/* Cards grid */}
        {loading ? (
          <div className="hb-loading">
            <div className="hb-spinner" />
            <p>Fetching habitats…</p>
          </div>
        ) : filteredTanks.length === 0 ? (
          <div className="hb-empty">
            <FaFish className="hb-empty-icon" />
            <p>{searchText ? "No habitats match your search." : "No habitats yet. Add your first tank to get started."}</p>
          </div>
        ) : (
          <div className="hb-grid">
            <AnimatePresence>
              {filteredTanks.map((tank) => (
                <TankCard
                  key={tank.id}
                  tank={tank}
                  isActive={tank.id === activeTankId}
                  onActivate={() => tank.id === activeTankId ? navigate("/dashboard") : activateTank(tank.id)}
                  onDelete={() => { setSelectedTank(tank); setShowDeleteModal(true); }}
                  onView={() => navigate(`/tanks/${tank.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="hb-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="hb-modal"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hb-modal-icon">
                <FaTrash />
              </div>
              <h3 className="hb-modal-title">Delete Habitat</h3>
              <p className="hb-modal-body">
                Are you sure you want to permanently delete <strong>{selectedTank?.name}</strong>?
                This will remove all associated data and cannot be undone.
              </p>
              <div className="hb-modal-actions">
                <button className="hb-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="hb-modal-confirm" onClick={handleDeleteTank} disabled={deleting}>
                  {deleting ? <span className="hb-spinner-sm" /> : <><FaTrash /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
