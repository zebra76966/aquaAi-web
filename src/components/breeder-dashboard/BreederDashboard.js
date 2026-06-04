import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/authcontext";
import { baseUrl } from "../auth/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFish,
  FaChartBar,
  FaBrain,
  FaUser,
  FaClock,
  FaHeart,
  FaSkull,
  FaStar,
  FaShieldAlt,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaLeaf,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBox,
  FaGlobe,
  FaInstagram,
  FaFacebook,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaSave,
  FaPlus,
  FaTrash,
  FaTimes,
  FaCamera,
  FaCopy,
  FaShare,
  FaSearch,
} from "react-icons/fa";
import { MdBusiness, MdScience } from "react-icons/md";
import "./BreederDashboard.css";
import OrdersTab from "./OrdersTab";
import ScheduleTab from "./ScheduleTab";

// ─── Helpers ─────────────────────────────────────────────────
const Spinner = () => <div className="bd-spinner" />;
const SpinnerSm = () => <div className="bd-spinner-sm" />;

const KpiCard = ({ label, value, icon, color }) => (
  <div className="bd-kpi">
    <span className="bd-kpi-icon" style={{ color }}>
      {icon}
    </span>
    <span className="bd-kpi-val">{value ?? "—"}</span>
    <span className="bd-kpi-label">{label}</span>
  </div>
);
const InsightRow = ({ text }) => (
  <div className="bd-insight-row">
    <FaLightbulb className="bd-insight-icon" />
    <p>{text}</p>
  </div>
);
const SectionHead = ({ icon, title }) => (
  <div className="bd-section-head">
    <span className="bd-section-icon">{icon}</span>
    <h3 className="bd-section-title">{title}</h3>
  </div>
);

// ═══════════════════════════════════════════════════════════
//  TAB: DASHBOARD (hub overview)
// ═══════════════════════════════════════════════════════════
function DashboardTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const profRes = await fetch(`${baseUrl}/breeders/profile/`, { headers: h });
      const profJson = await profRes.json();
      const uid = profJson?.data?.id;
      const [inqRes, availRes, anaRes] = await Promise.all([
        fetch(`${baseUrl}/breeders/inquiries/?status=pending`, { headers: h }),
        fetch(`${baseUrl}/breeders/availability/`, { headers: h }),
        uid ? fetch(`${baseUrl}/intelligence/dashboard/breeder/?entity_type=breeder&entity_id=${uid}`, { headers: h }) : Promise.resolve(null),
      ]);
      const inqJson = await inqRes.json().catch(() => ({}));
      const availJson = await availRes.json().catch(() => ({}));
      const anaJson = anaRes ? await anaRes.json().catch(() => null) : null;
      const today = new Date().toISOString().split("T")[0];
      const blocked = (availJson?.data || []).some((s) => s.start_time?.startsWith(today));
      setOverview({ pending: (inqJson?.data || []).length, species: (profJson?.data?.species || []).length, available: !blocked });
      setAnalytics(anaJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  if (loading)
    return (
      <div className="bd-loading">
        <Spinner />
        <p>Loading hub…</p>
      </div>
    );

  const kpi = analytics?.kpi;
  const aiInsights = analytics?.aiInsights || [];
  const stockStatus = analytics?.stockStatus;
  const cohort = analytics?.cohortBenchmark;
  const disputeRisk = analytics?.disputeRisk;
  const trends = analytics?.trends;

  return (
    <div>
      <div className="bd-stat-row">
        <div className="bd-stat">
          <span className="bd-stat-val">{overview?.pending ?? 0}</span>
          <span className="bd-stat-label">Pending Inquiries</span>
        </div>
        <div className="bd-stat">
          <span className="bd-stat-val">{overview?.species ?? 0}</span>
          <span className="bd-stat-label">Species Listed</span>
        </div>
        <div className={"bd-stat " + (overview?.available ? "bd-stat--ok" : "bd-stat--warn")}>
          <span className="bd-stat-val">{overview?.available ? "Open" : "Blocked"}</span>
          <span className="bd-stat-label">Today</span>
        </div>
      </div>

      {kpi && (
        <>
          <SectionHead icon={<FaChartBar />} title="Performance" />
          <div className="bd-kpi-grid">
            <KpiCard label="Sales" value={kpi.totalSales} icon={<FaBox />} color="#00f2ff" />
            <KpiCard label="Stock Sold" value={kpi.totalStockSold} icon={<FaFish />} color="#34d399" />
            <KpiCard label="Species" value={kpi.speciesCount} icon={<FaLeaf />} color="#a78bfa" />
            <KpiCard label="Avg Rating" value={kpi.avgRating || "—"} icon={<FaStar />} color="#fbbf24" />
            <KpiCard label="Healthy %" value={kpi.healthyStockRate != null ? kpi.healthyStockRate + "%" : "—"} icon={<FaHeart />} color="#f472b6" />
            <KpiCard label="Mortality %" value={kpi.mortalityRate != null ? kpi.mortalityRate + "%" : "—"} icon={<FaSkull />} color="#f87171" />
            <KpiCard label="Response" value={kpi.avgResponseHours != null ? kpi.avgResponseHours + "h" : "—"} icon={<FaClock />} color="#60a5fa" />
            <KpiCard label="Trust" value={kpi.localTrustScore || "—"} icon={<FaShieldAlt />} color="#4ade80" />
          </div>
          {trends && (
            <div className="bd-trends-row">
              {trends.salesChange != null && (
                <div className={"bd-trend-chip " + (trends.salesChange >= 0 ? "bd-trend--up" : "bd-trend--down")}>
                  {trends.salesChange >= 0 ? <FaArrowUp /> : <FaArrowDown />} Sales {trends.salesChange >= 0 ? "+" : ""}
                  {trends.salesChange}%
                </div>
              )}
              {trends.stockChange != null && (
                <div className={"bd-trend-chip " + (trends.stockChange >= 0 ? "bd-trend--up" : "bd-trend--down")}>
                  {trends.stockChange >= 0 ? <FaArrowUp /> : <FaArrowDown />} Stock {trends.stockChange >= 0 ? "+" : ""}
                  {trends.stockChange}%
                </div>
              )}
            </div>
          )}
        </>
      )}

      {stockStatus && (
        <div className="bd-card">
          <SectionHead icon={<FaBox />} title="Inventory Status" />
          <div className="bd-status-grid">
            {Object.entries(stockStatus).map(([k, v]) => (
              <div key={k} className="bd-status-pill">
                <span className="bd-status-val">{v}</span>
                <span className="bd-status-key">{k.replace(/([A-Z])/g, " $1")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cohort && (
        <div className="bd-card">
          <SectionHead icon={<FaTrophy />} title={`Tier — ${cohort.tier || ""}`} />
          <p className="bd-narrative">{cohort.narrative}</p>
        </div>
      )}

      {disputeRisk && (
        <div className={"bd-card bd-risk-card " + (disputeRisk.risk_level === "low" ? "bd-risk--low" : "bd-risk--high")}>
          <div className="bd-risk-header">
            {disputeRisk.risk_level === "low" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>Dispute Risk — {disputeRisk.risk_level?.toUpperCase()}</span>
          </div>
          <p className="bd-risk-msg">{disputeRisk.intervention_message}</p>
        </div>
      )}

      {aiInsights.length > 0 && (
        <div className="bd-ai-card">
          <div className="bd-ai-header">
            <FaBrain />
            <span>AI Insights</span>
          </div>
          {aiInsights.map((ins, i) => (
            <InsightRow key={i} text={ins} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  TAB: SPECIES  (updated — categories, bulk listing, stock pricing)
// ═══════════════════════════════════════════════════════════
const CAT_TABS = [
  { key: "all", label: "All" },
  { key: "freshwater_fish", label: "Freshwater" },
  { key: "marine_fish", label: "Marine" },
  { key: "pond_fish", label: "Pond" },
  { key: "marine_invertebrate", label: "Invertebrate" },
  { key: "aquarium_plant", label: "Plants" },
  { key: "others", label: "Others" },
];
const AVAIL_META = {
  available: { label: "In Stock", color: "#22c55e" },
  limited: { label: "Limited", color: "#f0a500" },
  out_of_stock: { label: "Out of Stock", color: "#ef4444" },
  unknown: { label: "No Stock", color: "#7a9ab0" },
};
const getAvail = (a) => AVAIL_META[a?.toLowerCase()] ?? AVAIL_META.unknown;

const BLANK_SPECIES = { name: "", scientific_name: "", category: "freshwater_fish", price_min: "", price_max: "", quantity: "", notes: "", available: true };

function SpeciesTab({ token }) {
  const [categoryMap, setCategoryMap] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK_SPECIES);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [saveError, setSaveError] = useState("");
  // Species search (same API as BreederApply)
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesList, setSpeciesList] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchCat, setSearchCat] = useState("freshwater_fish");
  const searchRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [listingId, setListingId] = useState(null); // toggling single listing

  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchSpecies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/breeders/species/`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setCategoryMap(json?.categories ?? json?.data?.categories ?? {});
      setSummary(json?.summary ?? json?.data?.summary ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  // Fetch from search-species API when modal is open
  useEffect(() => {
    if (!showModal) return;
    setLoadingSearch(true);
    fetch(`${baseUrl}/tanks/search-species/?category=${searchCat}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setSpeciesList(j.data || []))
      .catch(() => {})
      .finally(() => setLoadingSearch(false));
  }, [showModal, searchCat, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Flatten all species for display
  const allSpecies = Object.values(categoryMap).flat();
  const displayList = activeCat === "all" ? allSpecies : (categoryMap[activeCat] ?? []);

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK_SPECIES);
    setSaveError("");
    setSearchQuery("");
    setDropdownOpen(false);
    setShowModal(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.species_name || s.name || "",
      scientific_name: s.scientific_name || "",
      category: s.category || "freshwater_fish",
      price_min: s.price_min != null ? String(s.price_min) : s.stock?.price_min != null ? String(s.stock.price_min) : "",
      price_max: s.price_max != null ? String(s.price_max) : s.stock?.price_max != null ? String(s.stock.price_max) : "",
      quantity: s.quantity != null ? String(s.quantity) : s.stock?.quantity != null ? String(s.stock.quantity) : "",
      notes: s.stock?.notes || s.notes || "",
      species_id: s.species_id || null,
      available: s.availability !== "out_of_stock" && s.stock?.availability !== "out_of_stock",
    });
    setSaveError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setSaveError("Species name is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        name: form.name.trim(),
        scientific_name: form.scientific_name.trim(),
        category: form.category,
        price_min: form.price_min !== "" ? parseFloat(form.price_min) : null,
        price_max: form.price_max !== "" ? parseFloat(form.price_max) : null,
        quantity: form.quantity !== "" ? parseInt(form.quantity, 10) : null,
        notes: form.notes.trim(),
        species_id: form.species_id,
        available: form.available,
      };
      const url = editing ? `${baseUrl}/breeders/species/${editing.id}/update/` : `${baseUrl}/breeders/species/add/`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: h, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.message || "Failed to save.");
        return;
      }
      setShowModal(false);
      fetchSpecies();
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this species listing?")) return;
    setDeletingId(id);
    try {
      await fetch(`${baseUrl}/breeders/species/${id}/remove/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchSpecies();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle marketplace visibility for a single species
  const toggleListing = async (s) => {
    const stockId = s.stock?.id;
    if (!stockId) return;
    const visible = !s.is_visible_on_marketplace;
    setListingId(stockId);
    try {
      const res = await fetch(`${baseUrl}/marketplace/breeders/me/species/bulk-visibility/`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ stock_ids: [stockId], visible }),
      });
      if (!res.ok) throw new Error();
      fetchSpecies();
    } catch {
    } finally {
      setListingId(null);
    }
  };

  // Bulk marketplace visibility
  const bulkSetVisibility = async (visible) => {
    const stockIds = [...selectedIds];
    if (!stockIds.length) return;
    if (!window.confirm(`${visible ? "List" : "Delist"} ${stockIds.length} species ${visible ? "on" : "from"} the marketplace?`)) return;
    setBulkLoading(true);
    try {
      await fetch(`${baseUrl}/marketplace/breeders/me/species/bulk-visibility/`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ stock_ids: stockIds, visible }),
      });
      setSelectedIds(new Set());
      fetchSpecies();
    } catch {
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (s) => {
    if (!s.stock?.id) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(s.stock.id) ? next.delete(s.stock.id) : next.add(s.stock.id);
      return next;
    });
  };
  const selectAll = () => {
    const allIds = displayList.filter((s) => s.stock?.id).map((s) => s.stock.id);
    setSelectedIds((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
  };

  const selectedItems = displayList.filter((s) => selectedIds.has(s.stock?.id));
  const selectedListed = selectedItems.filter((s) => s.is_visible_on_marketplace).length;
  const selectedUnlisted = selectedItems.filter((s) => !s.is_visible_on_marketplace).length;

  if (loading)
    return (
      <div className="bd-loading">
        <Spinner />
      </div>
    );

  return (
    <div>
      {/* Summary bar */}
      {summary && (
        <div className="bd-stat-row" style={{ marginBottom: 16 }}>
          <div className="bd-stat">
            <span className="bd-stat-val">{summary.total_quantity ?? 0}</span>
            <span className="bd-stat-label">Total in Stock</span>
          </div>
          <div className="bd-stat">
            <span className="bd-stat-val">{summary.marketplace_listings_count ?? 0}</span>
            <span className="bd-stat-label">Listed</span>
          </div>
          <div className="bd-stat">
            <span className="bd-stat-val">{summary.available_species ?? 0}</span>
            <span className="bd-stat-label">Available</span>
          </div>
          <div className="bd-stat bd-stat--warn">
            <span className="bd-stat-val">{summary.out_of_stock_species ?? 0}</span>
            <span className="bd-stat-label">Out of Stock</span>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="ord-filter-row" style={{ marginBottom: 16 }}>
        {CAT_TABS.map((t) => (
          <button key={t.key} className={`ord-filter-btn${activeCat === t.key ? " active" : ""}`} onClick={() => setActiveCat(t.key)}>
            {t.label} {t.key !== "all" && categoryMap[t.key]?.length ? `(${categoryMap[t.key].length})` : ""}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="bd-list-header">
        <div>
          <h3 className="bd-list-title">Species ({displayList.length})</h3>
          <p className="bd-hint">Add species, set prices, and manage marketplace listing.</p>
        </div>
        <button className="bd-add-btn" onClick={openAdd}>
          <FaPlus /> Add Species
        </button>
      </div>

      {/* Bulk bar (shown when items selected) */}
      {selectedIds.size > 0 && (
        <div className="spc-bulk-bar">
          <button className="spc-bulk-sel-all" onClick={selectAll}>
            All ({displayList.filter((s) => s.stock?.id).length})
          </button>
          <span className="spc-bulk-count">{selectedIds.size} selected</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {selectedUnlisted > 0 && (
              <button className="spc-bulk-btn spc-bulk-btn--list" disabled={bulkLoading} onClick={() => bulkSetVisibility(true)}>
                {bulkLoading ? "…" : `List (${selectedUnlisted})`}
              </button>
            )}
            {selectedListed > 0 && (
              <button className="spc-bulk-btn spc-bulk-btn--delist" disabled={bulkLoading} onClick={() => bulkSetVisibility(false)}>
                {bulkLoading ? "…" : `Delist (${selectedListed})`}
              </button>
            )}
          </div>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="bd-empty-state">
          <FaFish />
          <p>No species in this category.</p>
          <button className="bd-add-btn" style={{ marginTop: 16 }} onClick={openAdd}>
            <FaPlus /> Add Species
          </button>
        </div>
      ) : (
        <div className="bd-species-list">
          {displayList.map((s, i) => {
            const avail = getAvail(s.availability);
            const isSelected = selectedIds.has(s.stock?.id);
            const isListed = !!s.is_visible_on_marketplace;
            const isToggling = listingId === s.stock?.id;
            return (
              <motion.div
                key={s.id || i}
                className={`bd-species-card${isSelected ? " spc-selected" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Checkbox for bulk */}
                {s.stock?.id && (
                  <div className={`spc-checkbox${isSelected ? " checked" : ""}`} onClick={() => toggleSelect(s)}>
                    {isSelected && <FaCheckCircle style={{ fontSize: 18, color: "#00d4ff" }} />}
                  </div>
                )}

                {s.image_url || s.metadata?.image_url ? (
                  <img src={s.image_url || s.metadata.image_url} alt={s.species_name} className="bd-species-img" />
                ) : (
                  <div className="bd-species-img-ph">
                    <FaFish />
                  </div>
                )}

                <div className="bd-species-info">
                  <p className="bd-species-name">{s.species_name || s.name || "Unknown"}</p>
                  <p className="bd-species-sci">{s.scientific_name || ""}</p>
                  <div className="bd-species-chips">
                    {(s.price_min || s.stock?.price_min) != null && (
                      <span className="bd-chip bd-chip--green">
                        £{s.price_min ?? s.stock.price_min}
                        {(s.price_max ?? s.stock?.price_max) ? ` – £${s.price_max ?? s.stock.price_max}` : ""}
                      </span>
                    )}
                    {(s.quantity ?? s.stock?.quantity) != null && <span className="bd-chip">Qty: {s.quantity ?? s.stock.quantity}</span>}
                    <span className="bd-chip" style={{ color: avail.color }}>
                      {avail.label}
                    </span>
                    {/* Marketplace listing toggle */}
                    {s.stock?.id && (
                      <button className={`spc-listing-btn${isListed ? " listed" : ""}`} onClick={() => toggleListing(s)} disabled={isToggling}>
                        {isToggling ? "…" : isListed ? "Listed ✓" : "List"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bd-species-actions">
                  <button className="bd-species-edit" onClick={() => openEdit(s)} aria-label="Edit">
                    <FaEdit />
                  </button>
                  <button className="bd-species-del" onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} aria-label="Delete">
                    {deletingId === s.id ? <SpinnerSm /> : <FaTrash />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="bd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="bd-modal" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="bd-modal-head">
                <h3>{editing ? "Edit Species" : "Add Species"}</h3>
                <button
                  className="bd-modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setSearchQuery("");
                    setDropdownOpen(false);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSave} className="bd-form">
                {/* Species search — same dropdown as BreederApply */}
                <div className="bd-field">
                  <label>{editing ? "Species" : "Search & Select Species *"}</label>
                  {editing ? (
                    /* When editing, show name as read-only + allow manual override */
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input value={form.name} readOnly className="bd-input-disabled" style={{ flex: 1 }} />
                      <input value={form.scientific_name} readOnly className="bd-input-disabled" style={{ flex: 1, fontSize: 12, color: "#7a9ab0" }} placeholder="Scientific name" />
                    </div>
                  ) : (
                    <div className="spc-search-wrap" ref={searchRef}>
                      {/* Category pills */}
                      <div className="spc-cat-pills">
                        {[
                          { key: "freshwater_fish", label: "Freshwater", icon: "🌿" },
                          { key: "marine_fish", label: "Saltwater", icon: "🌊" },
                          { key: "pond_fish", label: "Pond", icon: "🏞️" },
                          { key: "marine_invertebrate", label: "Invertebrate", icon: "🦀" },
                          { key: "aquarium_plant", label: "Plants", icon: "🌱" },
                        ].map((c) => (
                          <button
                            key={c.key}
                            type="button"
                            className={`spc-cat-pill${searchCat === c.key ? " active" : ""}`}
                            onClick={() => {
                              setSearchCat(c.key);
                              setSearchQuery("");
                              setDropdownOpen(false);
                            }}
                          >
                            {c.icon} {c.label}
                          </button>
                        ))}
                      </div>
                      {/* Search input */}
                      <div className="spc-search-input-wrap">
                        <FaSearch className="spc-search-icon" size={13} />
                        <input
                          className="bd-field input"
                          placeholder="Search species by name…"
                          value={searchQuery}
                          onFocus={() => setDropdownOpen(true)}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setDropdownOpen(true);
                          }}
                          style={{ paddingLeft: 32 }}
                        />
                      </div>
                      {/* Dropdown */}
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div className="spc-dropdown" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                            {loadingSearch ? (
                              <div className="spc-dropdown-state">
                                <div className="bd-spinner-sm" />
                              </div>
                            ) : speciesList
                                .filter((s) => {
                                  const q = searchQuery.toLowerCase();
                                  return !q || s.name?.toLowerCase().includes(q) || s.scientific_name?.toLowerCase().includes(q);
                                })
                                .slice(0, 14).length === 0 ? (
                              <div className="spc-dropdown-state">No species found</div>
                            ) : (
                              speciesList
                                .filter((s) => {
                                  const q = searchQuery.toLowerCase();
                                  return !q || s.name?.toLowerCase().includes(q) || s.scientific_name?.toLowerCase().includes(q);
                                })
                                .slice(0, 14)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="spc-dropdown-row"
                                    onClick={() => {
                                      setForm((f) => ({
                                        ...f,
                                        name: item.name || "",
                                        scientific_name: item.scientific_name || "",
                                        category: searchCat,
                                        species_id: item.id,
                                      }));
                                      setSearchQuery(item.name);
                                      setDropdownOpen(false);
                                    }}
                                  >
                                    {item.image_url ? <img src={item.image_url} alt={item.name} className="spc-dropdown-img" /> : <FaFish className="spc-dropdown-icon" />}
                                    <div>
                                      <div className="spc-dropdown-name">{item.name}</div>
                                      <div className="spc-dropdown-sci">{item.scientific_name}</div>
                                    </div>
                                    {form.name === item.name && <FaCheckCircle size={12} style={{ color: "#00d4ff", marginLeft: "auto" }} />}
                                  </div>
                                ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Show selected species name below */}
                      {form.name && (
                        <div className="spc-selected-tag">
                          <FaFish size={11} /> <strong>{form.name}</strong>
                          {form.scientific_name && <em style={{ color: "#7a9ab0", marginLeft: 6 }}>{form.scientific_name}</em>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Category (auto-set when selecting from dropdown; editable for manual overrides) */}
                <div className="bd-field">
                  <label>Category</label>
                  <select className="bd-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CAT_TABS.filter((t) => t.key !== "all").map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bd-form-grid">
                  <div className="bd-field">
                    <label>Min Price (£)</label>
                    <input type="number" step="0.01" min="0" value={form.price_min} onChange={(e) => setForm((f) => ({ ...f, price_min: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div className="bd-field">
                    <label>Max Price (£)</label>
                    <input type="number" step="0.01" min="0" value={form.price_max} onChange={(e) => setForm((f) => ({ ...f, price_max: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div className="bd-field">
                    <label>Quantity</label>
                    <input type="number" min="0" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="0" />
                  </div>
                </div>
                <div className="bd-field">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Care requirements, temperament, size, etc." />
                </div>
                <div className="bd-toggle-field">
                  <span>Available for sale</span>
                  <button type="button" className="bd-toggle-switch" onClick={() => setForm((f) => ({ ...f, available: !f.available }))}>
                    {form.available ? <FaToggleOn className="bd-toggle-on" /> : <FaToggleOff className="bd-toggle-off" />}
                  </button>
                </div>
                {saveError && <p className="bd-form-error">{saveError}</p>}
                <button type="submit" className="bd-save-btn" disabled={saving}>
                  {saving ? (
                    <SpinnerSm />
                  ) : editing ? (
                    <>
                      <FaSave /> Update Species
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add Species
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  TAB: ANALYTICS (standard + AI intelligence toggle)
// ═══════════════════════════════════════════════════════════
function AnalyticsTab({ token }) {
  const [mode, setMode] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [intel, setIntel] = useState(null);
  const [userId, setUserId] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const fetchBase = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const profRes = await fetch(`${baseUrl}/breeders/profile/`, { headers: h });
      const profJson = await profRes.json();
      const uid = profJson?.data?.id;
      setUserId(uid);
      if (uid) {
        const anaRes = await fetch(`${baseUrl}/intelligence/dashboard/breeder/?entity_type=breeder&entity_id=${uid}`, { headers: h });
        setData(await anaRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchIntel = useCallback(
    async (uid) => {
      if (!uid) return;
      setIntelLoading(true);
      const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const fw = async (url, method = "GET", body = null) => {
        try {
          const opts = { method, headers: h };
          if (body) opts.body = JSON.stringify(body);
          return await (await fetch(url, opts)).json();
        } catch {
          return null;
        }
      };
      const [score, digest, cohort, churn, pricing] = await Promise.all([
        fw(`${baseUrl}/intelligence/trust/breeder/${uid}/score`),
        fw(`${baseUrl}/intelligence/digest/breeder/${uid}/latest`),
        fw(`${baseUrl}/intelligence/cohort/breeder/${uid}`),
        fw(`${baseUrl}/intelligence/predict/churn/breeder/${uid}`),
        fw(`${baseUrl}/intelligence/pricing/${uid}`),
      ]);
      setIntel({ score, digest, cohort, churn, pricing });
      setIntelLoading(false);
    },
    [token],
  );

  useEffect(() => {
    fetchBase();
  }, [fetchBase]);
  useEffect(() => {
    if (mode === "intelligence" && userId && !intel) fetchIntel(userId);
  }, [mode, userId, intel, fetchIntel]);

  if (loading)
    return (
      <div className="bd-loading">
        <Spinner />
      </div>
    );

  const kpi = data?.kpi;
  const aiInsights = data?.aiInsights || [];
  const stockStatus = data?.stockStatus;
  const cohortData = data?.cohortBenchmark;

  return (
    <div>
      <div className="bd-toggle-row">
        <button className={"bd-toggle-btn " + (mode === "analytics" ? "bd-toggle-btn--active" : "")} onClick={() => setMode("analytics")}>
          <FaChartBar /> Analytics
        </button>
        <button className={"bd-toggle-btn " + (mode === "intelligence" ? "bd-toggle-btn--active" : "")} onClick={() => setMode("intelligence")}>
          <FaBrain /> AI Intelligence
        </button>
      </div>
      <AnimatePresence mode="wait">
        {mode === "analytics" && (
          <motion.div key="ana" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!data ? (
              <div className="bd-empty-state">
                <FaChartBar />
                <p>No analytics data yet.</p>
              </div>
            ) : (
              <>
                {kpi && (
                  <div className="bd-kpi-grid">
                    <KpiCard label="Sales" value={kpi.totalSales} icon={<FaBox />} color="#00f2ff" />
                    <KpiCard label="Stock Sold" value={kpi.totalStockSold} icon={<FaFish />} color="#34d399" />
                    <KpiCard label="Species" value={kpi.speciesCount} icon={<FaLeaf />} color="#a78bfa" />
                    <KpiCard label="Rating" value={kpi.avgRating || "—"} icon={<FaStar />} color="#fbbf24" />
                    <KpiCard label="Healthy %" value={kpi.healthyStockRate != null ? kpi.healthyStockRate + "%" : "—"} icon={<FaHeart />} color="#f472b6" />
                    <KpiCard label="Mortality %" value={kpi.mortalityRate != null ? kpi.mortalityRate + "%" : "—"} icon={<FaSkull />} color="#f87171" />
                    <KpiCard label="Response" value={kpi.avgResponseHours != null ? kpi.avgResponseHours + "h" : "—"} icon={<FaClock />} color="#60a5fa" />
                    <KpiCard label="Trust" value={kpi.localTrustScore || "—"} icon={<FaShieldAlt />} color="#4ade80" />
                  </div>
                )}
                {stockStatus && (
                  <div className="bd-card">
                    <SectionHead icon={<FaBox />} title="Inventory Status" />
                    <div className="bd-status-grid">
                      {Object.entries(stockStatus).map(([k, v]) => (
                        <div key={k} className="bd-status-pill">
                          <span className="bd-status-val">{v}</span>
                          <span className="bd-status-key">{k.replace(/([A-Z])/g, " $1")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cohortData && (
                  <div className="bd-card">
                    <SectionHead icon={<FaTrophy />} title={`Tier — ${cohortData.tier || ""}`} />
                    <p className="bd-narrative">{cohortData.narrative}</p>
                  </div>
                )}
                {aiInsights.length > 0 && (
                  <div className="bd-ai-card">
                    <div className="bd-ai-header">
                      <FaBrain />
                      <span>AI Insights</span>
                    </div>
                    {aiInsights.map((ins, i) => (
                      <InsightRow key={i} text={ins} />
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
        {mode === "intelligence" && (
          <motion.div key="intel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {intelLoading ? (
              <div className="bd-loading">
                <Spinner />
                <p>Loading AI Intelligence…</p>
              </div>
            ) : !intel ? (
              <div className="bd-empty-state">
                <FaBrain />
                <p>Intelligence data not available yet.</p>
              </div>
            ) : (
              <>
                {/* ── Trust Score — API: intel.score (no .data wrapper) ── */}
                {intel.score && !intel.score.error && (
                  <div className="bd-card">
                    <SectionHead icon={<FaShieldAlt />} title="Trust Score" />
                    <div className="bd-trust-row">
                      <div className="bd-trust-circle">
                        <span className="bd-trust-num">{intel.score.decay_adjusted_score ?? intel.score.raw_score ?? "—"}</span>
                        <span className="bd-trust-sub">pts</span>
                      </div>
                      <div>
                        {intel.score.tier && (
                          <p className="bd-trust-tier" style={{ textTransform: "capitalize" }}>
                            {intel.score.tier === "silver" ? "🥈" : intel.score.tier === "gold" ? "🥇" : intel.score.tier === "bronze" ? "🥉" : "⭐"} {intel.score.tier} Tier
                          </p>
                        )}
                        {intel.score.signal_count != null && <p style={{ fontSize: 12, color: "rgba(241,240,255,.4)", margin: "4px 0 0" }}>{intel.score.signal_count} signals recorded</p>}
                        {intel.score.top_contributing_factors?.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {intel.score.top_contributing_factors.map((f, i) => (
                              <span key={i} className="bd-chip" style={{ marginRight: 6 }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Cohort — API: intel.cohort (no .data wrapper) ── */}
                {intel.cohort && !intel.cohort.error && (
                  <div className="bd-card">
                    <SectionHead icon={<FaTrophy />} title={`Cohort Benchmark — ${intel.cohort.tier ? intel.cohort.tier.charAt(0).toUpperCase() + intel.cohort.tier.slice(1) : ""}`} />
                    {intel.cohort.narrative && <p className="bd-narrative">{intel.cohort.narrative}</p>}
                    {intel.cohort.metrics && (
                      <div className="bd-benchmark-row">
                        {intel.cohort.metrics.avg_review_rating != null && (
                          <div className="bd-benchmark-stat">
                            <span className="bd-b-val">{intel.cohort.metrics.avg_review_rating.percentile != null ? intel.cohort.metrics.avg_review_rating.percentile + "th" : "—"}</span>
                            <span className="bd-b-label">Review Percentile</span>
                          </div>
                        )}
                        {intel.cohort.metrics.inquiry_response_rate != null && (
                          <div className="bd-benchmark-stat">
                            <span className="bd-b-val">{intel.cohort.metrics.inquiry_response_rate.percentile != null ? intel.cohort.metrics.inquiry_response_rate.percentile + "th" : "—"}</span>
                            <span className="bd-b-label">Response Percentile</span>
                          </div>
                        )}
                        {intel.cohort.metrics.active_stock_count != null && (
                          <div className="bd-benchmark-stat">
                            <span className="bd-b-val">{intel.cohort.metrics.active_stock_count.value ?? "—"}</span>
                            <span className="bd-b-label">Active Stock</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Churn — API: intel.churn uses risk_level + retention_trigger_message ── */}
                {intel.churn && !intel.churn.error && (
                  <div className={"bd-card bd-risk-card " + (intel.churn.risk_level === "low" ? "bd-risk--low" : intel.churn.risk_level === "critical" ? "bd-risk--critical" : "bd-risk--high")}>
                    <div className="bd-risk-header">
                      {intel.churn.risk_level === "low" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      <span>Retention Risk — {intel.churn.risk_level?.toUpperCase()}</span>
                      {intel.churn.churn_probability != null && <span className="bd-risk-pct">{Math.round(intel.churn.churn_probability * 100)}%</span>}
                    </div>
                    {intel.churn.retention_trigger_message && <p className="bd-risk-msg">{intel.churn.retention_trigger_message}</p>}
                    <div className="bd-churn-meta">
                      {intel.churn.days_since_last_activity != null && (
                        <span className="bd-chip">Last active: {intel.churn.days_since_last_activity === 999 ? "No activity yet" : intel.churn.days_since_last_activity + "d ago"}</span>
                      )}
                      {intel.churn.recent_14d_activity_count != null && <span className="bd-chip">{intel.churn.recent_14d_activity_count} actions (14d)</span>}
                    </div>
                  </div>
                )}

                {/* ── Digest — show error gracefully ── */}
                {intel.digest && !intel.digest.error && (
                  <div className="bd-ai-card">
                    <div className="bd-ai-header">
                      <FaBrain />
                      <span>Intelligence Digest</span>
                    </div>
                    {intel.digest.insights?.map((ins, i) => <InsightRow key={i} text={ins} />) || intel.digest.summary ? (
                      <p className="bd-narrative">{intel.digest.summary}</p>
                    ) : (
                      <p className="bd-narrative" style={{ opacity: 0.5 }}>
                        No digest available yet.
                      </p>
                    )}
                  </div>
                )}

                {/* ── Pricing — show access_denied gracefully ── */}
                {intel.pricing && intel.pricing.status !== "access_denied" && !intel.pricing.error && (
                  <div className="bd-card">
                    <SectionHead icon={<FaStar />} title="Pricing Intelligence" />
                    <p className="bd-narrative">{intel.pricing.recommendation || intel.pricing.message}</p>
                  </div>
                )}

                {/* ── Fallback if all endpoints returned nothing useful ── */}
                {intel && !intel.score && !intel.cohort && !intel.churn && (
                  <div className="bd-empty-state">
                    <FaBrain />
                    <p>Activity needed to generate AI intelligence insights.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  TAB: PROFILE — full personal (matching user Profile.js) + business
// ═══════════════════════════════════════════════════════════
function ProfileTab({ token }) {
  const { logout, tier } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileMode, setProfileMode] = useState("personal");

  // ── Personal profile (same as user Profile.js) ──────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pState, setPState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [successPersonal, setSuccessPersonal] = useState(false);

  // ── Badges / Trust / Referral ────────────────────────────
  const [badges, setBadges] = useState([]);
  const [badgeDefs, setBadgeDefs] = useState([]);
  const [trust, setTrust] = useState(null);
  const [badgeLoading, setBadgeLoading] = useState(true);
  const [referralData, setReferralData] = useState({ available_credits: 0, my_referral_code: "" });
  const [codeCopied, setCodeCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // ── Business profile ─────────────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [policy, setPolicy] = useState("");
  const [autoAccept, setAutoAccept] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [successBusiness, setSuccessBusiness] = useState(false);
  const [activePersonalSection, setActivePersonalSection] = useState("profile");

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Fetch personal
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/user/profile/`, { headers: h });
        const json = await res.json();
        const d = json?.data || json;
        const parts = (d.name || "").trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        setEmail(d.email || "");
        setAddress(d.address || "");
        setCity(d.city || "");
        setPState(d.state || "");
        setCountry(d.country || "");
        setPostalCode(d.postal_code || "");
        if (d.profile_picture) setProfileImage(d.profile_picture);
        setReferralData({ available_credits: d.available_credits || 0, my_referral_code: d.my_referral_code || "" });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPersonal(false);
      }
    })();
    // Fetch badges
    (async () => {
      try {
        const [myRes, defsRes, trustRes] = await Promise.all([
          fetch(`${baseUrl}/badges/badges/me/`, { headers: h }),
          fetch(`${baseUrl}/badges/definitions/`, { headers: h }),
          fetch(`${baseUrl}/badges/trust-score/me/`, { headers: h }),
        ]);
        const [myJson, defsJson, trustJson] = await Promise.all([myRes.json(), defsRes.json(), trustRes.json()]);
        setBadges(myJson?.data?.recently_earned || []);
        setBadgeDefs(defsJson?.data || []);
        setTrust(trustJson?.data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setBadgeLoading(false);
      }
    })();
    // Fetch business
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/breeders/profile/`, { headers: h });
        const json = await res.json();
        const d = json?.data || json;
        if (d?.company_name) {
          setIsEdit(true);
          setCompanyName(d.company_name || "");
          setBio(d.bio || "");
          setWebsite(d.website || "");
          setInstagram(d.instagram || "");
          setFacebook(d.facebook || "");
          setPolicy(d.cancellation_policy || "");
          setAutoAccept(!!d.auto_accept);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingBusiness(false);
      }
    })();
  }, [token]);

  const savePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const fd = new FormData();
      fd.append("first_name", firstName);
      fd.append("last_name", lastName);
      fd.append("address", address);
      fd.append("city", city);
      fd.append("state", pState);
      fd.append("country", country);
      fd.append("postal_code", postalCode);
      const res = await fetch(`${baseUrl}/user/profile/update/`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) {
        setSuccessPersonal(true);
        setTimeout(() => setSuccessPersonal(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPersonal(false);
    }
  };

  const saveBusiness = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setSavingBusiness(true);
    try {
      const url = isEdit ? `${baseUrl}/breeders/profile/update/` : `${baseUrl}/breeders/apply/`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName, bio, website, instagram, facebook, cancellation_policy: policy, auto_accept: autoAccept }),
      });
      if (res.ok) {
        setSuccessBusiness(true);
        setTimeout(() => setSuccessBusiness(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralData.my_referral_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const latestBadge = badges[0];
  const resolvedBadge = latestBadge && badgeDefs.find((b) => b.badge_code === latestBadge.badge_code);
  const tierColor = trust?.trust_score?.tier_color || "#a78bfa";
  const tierIcon = trust?.trust_score?.tier_icon || "🥉";
  const trustPoints = trust?.trust_score?.trust_score;
  const tierName = trust?.trust_score?.regulatory_tier;

  return (
    <div>
      <div className="bd-toggle-row">
        <button className={"bd-toggle-btn " + (profileMode === "personal" ? "bd-toggle-btn--active" : "")} onClick={() => setProfileMode("personal")}>
          <FaUser /> Personal
        </button>
        <button className={"bd-toggle-btn " + (profileMode === "business" ? "bd-toggle-btn--active" : "")} onClick={() => setProfileMode("business")}>
          <MdBusiness /> Business
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── PERSONAL ── */}
        {profileMode === "personal" && (
          <motion.div key="personal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loadingPersonal ? (
              <div className="bd-loading">
                <Spinner />
              </div>
            ) : (
              <div className="bd-profile-layout">
                {/* Sidebar */}
                <aside className="bd-prof-sidebar">
                  <div className="bd-prof-avatar-wrap">
                    {profileImage ? <img src={profileImage} alt="Profile" className="bd-prof-avatar" /> : <div className="bd-prof-avatar-ph">{firstName ? firstName[0].toUpperCase() : "?"}</div>}
                  </div>
                  <p className="bd-prof-name">
                    {firstName} {lastName}
                  </p>
                  <p className="bd-prof-email">{email}</p>
                  {tier && (
                    <div className="bd-prof-tier-pill">
                      <span>✨</span>
                      <span>{tier}</span>
                    </div>
                  )}
                  {tierName && (
                    <div className="bd-prof-trust-card">
                      <span>{tierIcon}</span>
                      <div>
                        <p className="bd-prof-trust-tier" style={{ color: tierColor }}>
                          {tierName} Tier
                        </p>
                        {trustPoints != null && <p className="bd-prof-trust-pts">{trustPoints} trust points</p>}
                      </div>
                    </div>
                  )}
                  <nav className="bd-prof-nav">
                    {[
                      { key: "profile", label: "Profile", icon: "👤" },
                      { key: "badges", label: "Badges & Trust", icon: "🏅" },
                      { key: "referral", label: "Refer & Earn", icon: "🎁" },
                    ].map((s) => (
                      <button key={s.key} className={"bd-prof-nav-item " + (activePersonalSection === s.key ? "bd-prof-nav-active" : "")} onClick={() => setActivePersonalSection(s.key)}>
                        <span>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </nav>
                  <button className="bd-prof-logout-btn" onClick={() => setShowLogout(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Logout
                  </button>
                </aside>

                {/* Main */}
                <main className="bd-prof-main">
                  <AnimatePresence mode="wait">
                    {activePersonalSection === "profile" && (
                      <motion.div key="prof" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 className="bd-prof-section-title">Profile Information</h2>
                        <form onSubmit={savePersonal} className="bd-form">
                          <div className="bd-form-grid">
                            <div className="bd-field">
                              <label>First Name</label>
                              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className="bd-field">
                              <label>Last Name</label>
                              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                          </div>
                          <div className="bd-field">
                            <label>
                              Email <span className="bd-hint-label">(read-only)</span>
                            </label>
                            <input value={email} readOnly className="bd-input-disabled" />
                          </div>
                          <h3 className="bd-prof-subsection">Address</h3>
                          <div className="bd-field">
                            <label>Street Address</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Ocean Drive" />
                          </div>
                          <div className="bd-form-grid">
                            <div className="bd-field">
                              <label>City</label>
                              <input value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                            <div className="bd-field">
                              <label>State / Province</label>
                              <input value={pState} onChange={(e) => setPState(e.target.value)} />
                            </div>
                          </div>
                          <div className="bd-form-grid">
                            <div className="bd-field">
                              <label>Country</label>
                              <input value={country} onChange={(e) => setCountry(e.target.value)} />
                            </div>
                            <div className="bd-field">
                              <label>Postal Code</label>
                              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                            </div>
                          </div>
                          <button type="submit" className="bd-save-btn" disabled={savingPersonal}>
                            {savingPersonal ? (
                              <SpinnerSm />
                            ) : successPersonal ? (
                              <>
                                <FaCheckCircle /> Saved!
                              </>
                            ) : (
                              <>
                                <FaSave /> Save Changes
                              </>
                            )}
                          </button>
                        </form>
                      </motion.div>
                    )}
                    {activePersonalSection === "badges" && (
                      <motion.div key="badges" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 className="bd-prof-section-title">Badges & Trust Score</h2>
                        {badgeLoading ? (
                          <div className="bd-loading">
                            <Spinner />
                          </div>
                        ) : (
                          <>
                            {trust?.trust_score && (
                              <div className="bd-card" style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <span style={{ fontSize: 28 }}>{tierIcon}</span>
                                    <p className="bd-trust-tier" style={{ color: tierColor, margin: "4px 0 0" }}>
                                      {tierName} Tier
                                    </p>
                                  </div>
                                  <div className="bd-trust-circle">
                                    <span className="bd-trust-num" style={{ color: tierColor }}>
                                      {trustPoints}
                                    </span>
                                    <span className="bd-trust-sub">pts</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {resolvedBadge && (
                              <div className="bd-card" style={{ borderColor: resolvedBadge.color + "44", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
                                <span style={{ fontSize: 40 }}>{resolvedBadge.icon}</span>
                                <div>
                                  <p style={{ fontWeight: 700, color: "#f1f0ff", margin: "0 0 4px" }}>{resolvedBadge.name}</p>
                                  <p style={{ fontSize: 13, color: "rgba(241,240,255,.5)", margin: "0 0 8px" }}>{resolvedBadge.description}</p>
                                  {latestBadge?.earned_at && <p style={{ fontSize: 12, color: "rgba(241,240,255,.35)", margin: 0 }}>Earned {new Date(latestBadge.earned_at).toLocaleDateString()}</p>}
                                </div>
                              </div>
                            )}
                            {badges.length === 0 && !resolvedBadge && (
                              <div className="bd-empty-state">
                                <span style={{ fontSize: 40 }}>🏅</span>
                                <p>No badges earned yet.</p>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                    {activePersonalSection === "referral" && (
                      <motion.div key="ref" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 className="bd-prof-section-title">Refer & Earn</h2>
                        <div className="bd-card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                          <div style={{ textAlign: "center" }}>
                            <span style={{ fontSize: 36, fontWeight: 800, color: "#a78bfa", display: "block" }}>{referralData.available_credits}</span>
                            <span style={{ fontSize: 12, color: "rgba(241,240,255,.4)" }}>Credits</span>
                          </div>
                          <p style={{ fontSize: 13, color: "rgba(241,240,255,.55)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                            Share your referral code. When friends sign up, you both get discount credits on your next billing cycle!
                          </p>
                        </div>
                        <div className="bd-field" style={{ marginBottom: 16 }}>
                          <label>Your Referral Code</label>
                          <div style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1, background: "rgba(167,139,250,.08)", border: "1px solid rgba(167,139,250,.25)", borderRadius: 10, padding: "12px 16px" }}>
                              <span style={{ fontSize: 18, fontWeight: 800, color: "#a78bfa", letterSpacing: "0.08em" }}>{referralData.my_referral_code || "—"}</span>
                            </div>
                            <button className="bd-save-btn" onClick={handleCopy} style={{ padding: "10px 16px" }}>
                              <FaCopy /> {codeCopied ? "Copied!" : "Copy"}
                            </button>
                            {navigator.share && (
                              <button
                                className="bd-save-btn"
                                onClick={() => navigator.share({ text: `Use code ${referralData.my_referral_code} for a discount on AquaAI!` })}
                                style={{ padding: "10px 16px" }}
                              >
                                <FaShare />
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(241,240,255,.4)", display: "flex", alignItems: "center", gap: 8 }}>ℹ️ Credits applied automatically on your next billing cycle.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>
            )}

            {/* Logout confirm */}
            <AnimatePresence>
              {showLogout && (
                <motion.div className="bd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogout(false)}>
                  <motion.div
                    className="bd-modal"
                    style={{ maxWidth: 360, textAlign: "center" }}
                    initial={{ scale: 0.92 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.92 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#f1f0ff", margin: "0 0 8px" }}>Logout?</p>
                    <p style={{ fontSize: 14, color: "rgba(241,240,255,.5)", margin: "0 0 24px" }}>You'll need to sign in again to access your hub.</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="bd-toggle-btn" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>
                        Cancel
                      </button>
                      <button
                        className="bd-save-btn"
                        style={{ flex: 1, background: "rgba(248,113,113,.12)", borderColor: "rgba(248,113,113,.3)", color: "#f87171", justifyContent: "center" }}
                        onClick={() => {
                          logout();
                          navigate("/login");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── BUSINESS ── */}
        {profileMode === "business" && (
          <motion.div key="business" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="bd-prof-section-title">Business Profile</h2>
            {loadingBusiness ? (
              <div className="bd-loading">
                <Spinner />
              </div>
            ) : (
              <form onSubmit={saveBusiness} className="bd-form">
                <div className="bd-field">
                  <label>Company Name *</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div className="bd-field">
                  <label>Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                </div>
                <div className="bd-form-grid">
                  <div className="bd-field">
                    <label>
                      <FaGlobe /> Website
                    </label>
                    <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
                  </div>
                  <div className="bd-field">
                    <label>
                      <FaInstagram /> Instagram
                    </label>
                    <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
                  </div>
                  <div className="bd-field">
                    <label>
                      <FaFacebook /> Facebook
                    </label>
                    <input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                  </div>
                </div>
                <div className="bd-field">
                  <label>Cancellation Policy</label>
                  <textarea value={policy} onChange={(e) => setPolicy(e.target.value)} rows={2} />
                </div>
                <div className="bd-toggle-field">
                  <span>Auto-accept bookings</span>
                  <button type="button" className="bd-toggle-switch" onClick={() => setAutoAccept((v) => !v)}>
                    {autoAccept ? <FaToggleOn className="bd-toggle-on" /> : <FaToggleOff className="bd-toggle-off" />}
                  </button>
                </div>
                <button type="submit" className="bd-save-btn" disabled={savingBusiness}>
                  {savingBusiness ? (
                    <SpinnerSm />
                  ) : successBusiness ? (
                    <>
                      <FaCheckCircle /> Saved!
                    </>
                  ) : (
                    <>
                      <FaSave /> {isEdit ? "Update Business" : "Create Profile"}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOT — reads ?tab= from URL so FloatingNav can control it
// ═══════════════════════════════════════════════════════════
const TABS = [
  { key: "dashboard", label: "Hub", icon: <FaChartBar /> },
  { key: "species", label: "Species", icon: <MdScience /> },
  { key: "orders", label: "Orders", icon: <FaBox /> },
  { key: "schedule", label: "Schedule", icon: <FaClock /> },
  { key: "analytics", label: "Analytics", icon: <FaBrain /> },
  { key: "profile", label: "Profile", icon: <FaUser /> },
];

export default function BreederDashboard() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Read tab from URL query param; default to "dashboard"
  const params = new URLSearchParams(location.search);
  const tabFromUrl = params.get("tab");
  const activeTab = TABS.find((t) => t.key === tabFromUrl) ? tabFromUrl : "dashboard";

  const setActiveTab = (key) => {
    navigate(`/breeder-dashboard${key !== "dashboard" ? "?tab=" + key : ""}`, { replace: true });
  };

  return (
    <div className="bd-wrapper">
      <div className="bd-bg" />
      <div className="bd-container">
        <motion.header className="bd-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="bd-eyebrow">AquaAI Breeder</p>
            <h1 className="bd-title">Breeder Hub</h1>
            <p className="bd-subtitle">Manage your species, analytics, and business profile.</p>
          </div>
          <div className="bd-header-avatar">
            <FaFish />
          </div>
        </motion.header>

        <div className="bd-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={"bd-tab " + (activeTab === t.key ? "bd-tab--active" : "")} onClick={() => setActiveTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="bd-tab-content">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DashboardTab token={token} />
              </motion.div>
            )}
            {activeTab === "species" && (
              <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SpeciesTab token={token} />
              </motion.div>
            )}
            {activeTab === "orders" && (
              <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <OrdersTab token={token} />
              </motion.div>
            )}
            {activeTab === "schedule" && (
              <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ScheduleTab token={token} />
              </motion.div>
            )}
            {activeTab === "analytics" && (
              <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalyticsTab token={token} />
              </motion.div>
            )}
            {activeTab === "profile" && (
              <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileTab token={token} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
