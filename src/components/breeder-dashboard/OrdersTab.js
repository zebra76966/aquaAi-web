import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw, FiPackage, FiTruck, FiAlertCircle, FiCheckCircle,
  FiClock, FiX, FiMapPin, FiNavigation, FiUser, FiChevronDown,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { baseUrl } from "../auth/config";

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
const fmtMoney = (v) => v != null ? `£${parseFloat(v).toFixed(2)}` : null;

const STATUS_META = {
  payment_pending:      { label: "Payment Pending",   color: "#f0a500", bg: "rgba(240,165,0,0.1)",    border: "rgba(240,165,0,0.3)" },
  confirmed:            { label: "Confirmed",          color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.3)" },
  reserved:             { label: "Reserved",           color: "#00d4ff", bg: "rgba(0,212,255,0.08)",   border: "rgba(0,212,255,0.25)" },
  ready_for_collection: { label: "Ready to Collect",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.3)" },
  awaiting_dispatch:    { label: "Awaiting Dispatch",  color: "#0ea5e9", bg: "rgba(14,165,233,0.1)",   border: "rgba(14,165,233,0.3)" },
  dispatched:           { label: "Dispatched",         color: "#0ea5e9", bg: "rgba(14,165,233,0.1)",   border: "rgba(14,165,233,0.3)" },
  replaced:             { label: "Replacement Sent",   color: "#7c3aed", bg: "rgba(124,58,237,0.1)",   border: "rgba(124,58,237,0.3)" },
  completed:            { label: "Completed",          color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" },
  cancelled:            { label: "Cancelled",          color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  disputed:             { label: "Disputed",           color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.35)" },
};
const getMeta = (s) => STATUS_META[s?.toLowerCase()] ?? { label: s ?? "Unknown", color: "#7a9ab0", bg: "rgba(0,0,0,0.1)", border: "rgba(255,255,255,0.1)" };

const CAN_MARK_READY   = new Set(["confirmed", "reserved", "payment_pending"]);
const CAN_DISPATCH     = new Set(["awaiting_dispatch"]);
const CAN_DISPUTE_RES  = new Set(["disputed"]);
const CAN_CANCEL       = new Set(["payment_pending", "ready_for_collection", "awaiting_dispatch"]);
const CAN_CONFIRM_PICKUP = new Set(["ready_for_collection"]);

/* ── Modal wrapper ── */
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="bd-modal-overlay" onClick={onClose}>
      <motion.div className="bd-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}>
        <div className="bd-modal-head">
          <h3>{title}</h3>
          <button className="bd-modal-close" onClick={onClose}><FiX /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

/* ── Order Card ── */
function OrderCard({ item, onAction, busy }) {
  const [expanded, setExpanded] = useState(false);
  const meta   = getMeta(item.status);
  const status = item.status?.toLowerCase() ?? "";
  const isCollect = item.delivery_method === "collect";
  const lineItems = item.line_items ?? [];
  const isBusy    = busy === item.id;
  const hasDispute = !!item.latest_dispute;

  const canMarkReady    = isCollect  && CAN_MARK_READY.has(status);
  const canConfirmPickup = isCollect && CAN_CONFIRM_PICKUP.has(status);
  const canDispatch     = !isCollect && CAN_DISPATCH.has(status);
  const canDisputeRes   = CAN_DISPUTE_RES.has(status);
  const canCancel       = CAN_CANCEL.has(status);

  const addr = item.shipping_address_snapshot;
  const addrStr = addr?.address ? [addr.address, addr.city, addr.postal_code].filter(Boolean).join(", ") : null;

  return (
    <motion.div className="ord-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header row */}
      <div className="ord-header" onClick={() => setExpanded(e => !e)} style={{ cursor: "pointer" }}>
        <div>
          <p className="ord-code">{item.reservation_code ?? `#${item.id}`}</p>
          {fmtDate(item.created_at) && <p className="ord-date">{fmtDate(item.created_at)}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ord-status-badge" style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
            {meta.label}
          </span>
          <FiChevronDown style={{ color: "#7a9ab0", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
        </div>
      </div>

      {/* Buyer + method always visible */}
      <div className="ord-buyer-row">
        <FiUser size={13} style={{ color: "#7a9ab0", flexShrink: 0 }} />
        <span className="ord-buyer-name">{item.buyer?.name ?? item.buyer?.username ?? "Customer"}</span>
        {item.buyer?.email && <span className="ord-buyer-email">{item.buyer.email}</span>}
        <span className={`ord-method-chip${isCollect ? " collect" : " delivery"}`}>
          {isCollect ? <MdStorefront size={11} /> : <FiTruck size={11} />}
          {isCollect ? "Collection" : "Delivery"}
        </span>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            {/* Dispute banner */}
            {hasDispute && (
              <div className="ord-dispute-banner">
                <FiAlertCircle size={15} />
                <div>
                  <p className="ord-dispute-title">Dispute Open — Response Required</p>
                  {item.latest_dispute?.reason && <p className="ord-dispute-reason">"{item.latest_dispute.reason}"</p>}
                  {item.latest_dispute?.description && <p className="ord-dispute-desc">{item.latest_dispute.description}</p>}
                </div>
              </div>
            )}

            {status === "replaced" && (
              <div className="ord-replaced-banner">
                <FiRefreshCw size={13} />
                <span>Replacement shipped. Awaiting buyer confirmation to release payment.</span>
              </div>
            )}

            {/* Line items */}
            {lineItems.length > 0 && (
              <div className="ord-items">
                {lineItems.map((li, i) => (
                  <div key={i} className="ord-item-row">
                    <span className="ord-item-name">{li.species_name || li.title}</span>
                    {li.size_tier && <span className="ord-size-pill">{li.size_tier}</span>}
                    <span className="ord-item-qty">× {li.quantity}</span>
                    <span className="ord-item-total">{fmtMoney(li.line_total)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price breakdown */}
            <div className="ord-price-block">
              {item.subtotal != null && <div className="ord-price-row"><span>Subtotal</span><span>{fmtMoney(item.subtotal)}</span></div>}
              {parseFloat(item.delivery_cost ?? 0) > 0 && <div className="ord-price-row"><span>Delivery</span><span>{fmtMoney(item.delivery_cost)}</span></div>}
              <div className="ord-price-divider" />
              <div className="ord-price-row ord-price-total"><span>Total</span><span>{fmtMoney(item.total_amount)}</span></div>
            </div>

            {/* Payout status */}
            {item.payout && (() => {
              const p = item.payout;
              const ps = (p.status ?? "").toLowerCase();
              const pc = ps === "released" ? "#22c55e" : ps === "held" ? "#f0a500" : ps === "failed" ? "#ef4444" : "#7a9ab0";
              const pt = ps === "released" ? "Payout Released" : ps === "held" ? "Payout on Hold" : ps === "failed" ? "Payout Failed" : "Payout Pending";
              return (
                <div className="ord-payout" style={{ borderColor: pc + "44", background: pc + "10" }}>
                  <FiCheckCircle color={pc} size={16} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: pc, fontWeight: 700, fontSize: 13 }}>{pt}</p>
                    {p.payout_amount != null && <p style={{ fontSize: 12, color: "#7a9ab0" }}>{fmtMoney(p.payout_amount)}</p>}
                  </div>
                </div>
              );
            })()}

            {/* Address / tracking */}
            {!isCollect && addrStr && (
              <div className="ord-address"><FiMapPin size={13} /><span>{addrStr}</span></div>
            )}
            {item.tracking_number && (
              <div className="ord-tracking"><FiNavigation size={13} /><span>{[item.courier, item.tracking_number].filter(Boolean).join(" · ")}</span></div>
            )}

            {/* Action buttons */}
            {canMarkReady && (
              <button className="ord-action-btn ord-action-btn--green" disabled={isBusy} onClick={() => onAction("mark_ready", item)}>
                {isBusy ? "…" : <><FiPackage size={14} /> Mark Ready for Collection</>}
              </button>
            )}
            {canConfirmPickup && (
              <button className="ord-action-btn ord-action-btn--green" disabled={isBusy} onClick={() => onAction("confirm_pickup", item)}>
                {isBusy ? "…" : "Confirm Pickup — Enter Code"}
              </button>
            )}
            {canDispatch && (
              <button className="ord-action-btn ord-action-btn--blue" disabled={isBusy} onClick={() => onAction("dispatch", item)}>
                {isBusy ? "…" : <><FiTruck size={14} /> Dispatch Order</>}
              </button>
            )}
            {canDisputeRes && (
              <button className="ord-action-btn ord-action-btn--red" disabled={isBusy} onClick={() => onAction("dispute", item)}>
                {isBusy ? "…" : "Respond to Dispute"}
              </button>
            )}
            {canCancel && (
              <button className="ord-action-btn ord-action-btn--ghost" disabled={isBusy} onClick={() => onAction("cancel", item)}>
                {isBusy ? "…" : <><FiX size={13} /> Cancel Order</>}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Tab ── */
export default function OrdersTab({ token }) {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRef]    = useState(false);
  const [busy, setBusy]         = useState(null);
  const [filter, setFilter]     = useState("all");
  const [error, setError]       = useState("");

  // OTP modal
  const [otpModal, setOtpModal] = useState(false);
  const [otpItem, setOtpItem]   = useState(null);
  const [otpCode, setOtpCode]   = useState("");
  const [otpBusy, setOtpBusy]   = useState(false);

  // Dispatch modal
  const [dispModal, setDispModal] = useState(false);
  const [dispItem, setDispItem]   = useState(null);
  const [tracking, setTracking]   = useState("");
  const [courier, setCourier]     = useState("");
  const [dispNote, setDispNote]   = useState("");
  const [dispBusy, setDispBusy]   = useState(false);

  // Dispute modal
  const [disModal, setDisModal]       = useState(false);
  const [disItem, setDisItem]         = useState(null);
  const [resType, setResType]         = useState("replace");
  const [disResponse, setDisResponse] = useState("");
  const [repTracking, setRepTracking] = useState("");
  const [repCourier, setRepCourier]   = useState("");
  const [disBusy, setDisBusy]         = useState(false);

  const h = { Authorization: `Bearer ${token}` };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${baseUrl}/marketplace/reservations/incoming/`, { headers: h });
      const json = await res.json();
      setOrders(Array.isArray(json?.data?.reservations) ? json.data.reservations : Array.isArray(json?.data) ? json.data : []);
    } catch { setError("Could not load orders."); }
    finally { setLoading(false); setRef(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleAction = (type, item) => {
    if (type === "mark_ready") {
      if (!window.confirm("Confirm this order is packed and ready for collection?")) return;
      setBusy(item.id);
      fetch(`${baseUrl}/marketplace/reservations/${item.id}/collection/ready/`, { method: "POST", headers: h })
        .then(r => r.ok ? load(true) : Promise.reject())
        .catch(() => setError("Failed to mark ready."))
        .finally(() => setBusy(null));
    } else if (type === "confirm_pickup") {
      setOtpItem(item); setOtpCode(""); setOtpModal(true);
    } else if (type === "dispatch") {
      setDispItem(item); setTracking(""); setCourier(""); setDispNote(""); setDispModal(true);
    } else if (type === "dispute") {
      setDisItem(item); setResType("replace"); setDisResponse(""); setRepTracking(""); setRepCourier(""); setDisModal(true);
    } else if (type === "cancel") {
      if (!window.confirm("Cancel this order? Payment will be voided and stock restored.")) return;
      setBusy(item.id);
      fetch(`${baseUrl}/marketplace/reservations/${item.id}/breeder-cancel/`, {
        method: "POST", headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by seller" }),
      }).then(r => r.ok ? load(true) : Promise.reject())
        .catch(() => setError("Failed to cancel."))
        .finally(() => setBusy(null));
    }
  };

  const handleOtp = async () => {
    if (!otpCode.trim()) return;
    setOtpBusy(true);
    try {
      const res = await fetch(`${baseUrl}/marketplace/reservations/${otpItem.id}/collection/confirm/`, {
        method: "POST", headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ collection_code: otpCode.trim().toUpperCase() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Invalid code.");
      setOtpModal(false); load(true);
    } catch (e) { setError(e.message); }
    finally { setOtpBusy(false); }
  };

  const handleDispatch = async () => {
    if (!tracking.trim() || !courier.trim()) { setError("Tracking number and courier are required."); return; }
    setDispBusy(true);
    try {
      const res = await fetch(`${baseUrl}/marketplace/reservations/${dispItem.id}/dispatch/`, {
        method: "POST", headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_number: tracking.trim(), courier: courier.trim(), courier_code: courier.trim().toUpperCase().slice(0,10), note: dispNote.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to dispatch.");
      setDispModal(false); load(true);
    } catch (e) { setError(e.message); }
    finally { setDispBusy(false); }
  };

  const handleDisputeRespond = async () => {
    if (!disResponse.trim()) { setError("Response message is required."); return; }
    if (resType === "replace" && (!repTracking.trim() || !repCourier.trim())) { setError("Tracking and courier required for replacement."); return; }
    setDisBusy(true);
    try {
      const res = await fetch(`${baseUrl}/marketplace/reservations/${disItem.id}/dispute/respond/`, {
        method: "POST", headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ resolution_type: resType, response: disResponse.trim(), tracking_number: repTracking.trim(), courier: repCourier.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to respond.");
      setDisModal(false); load(true);
    } catch (e) { setError(e.message); }
    finally { setDisBusy(false); }
  };

  const filtered = orders.filter(o => {
    if (filter === "collect")  return o.delivery_method === "collect";
    if (filter === "delivery") return o.delivery_method === "delivery";
    if (filter === "disputed") return o.status?.toLowerCase() === "disputed";
    return true;
  });

  const disputeCount = orders.filter(o => o.status?.toLowerCase() === "disputed").length;

  return (
    <div>
      {/* Toolbar */}
      <div className="ord-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h3 className="bd-list-title">Orders ({orders.length})</h3>
          {disputeCount > 0 && <span className="ord-dispute-badge">{disputeCount} dispute{disputeCount > 1 ? "s" : ""}</span>}
        </div>
        <button className="bd-toggle-btn" onClick={() => load()} disabled={loading} style={{ gap: 6 }}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="ord-filter-row">
        {[
          { key: "all",      label: "All" },
          { key: "collect",  label: "Collection" },
          { key: "delivery", label: "Delivery" },
          { key: "disputed", label: disputeCount > 0 ? `Disputes (${disputeCount})` : "Disputes" },
        ].map(f => (
          <button key={f.key}
            className={`ord-filter-btn${filter === f.key ? " active" : ""}${f.key === "disputed" && disputeCount > 0 ? " disputed" : ""}`}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="ord-error"><FiAlertCircle /> {error}</div>}

      {loading ? (
        <div className="bd-loading"><div className="bd-spinner" /><p>Loading orders…</p></div>
      ) : filtered.length === 0 ? (
        <div className="bd-empty-state"><FiPackage size={36} /><p>{filter === "disputed" ? "No open disputes — great!" : "No orders yet."}</p></div>
      ) : (
        <div className="ord-list">
          {filtered.map(item => (
            <OrderCard key={item.id} item={item} onAction={handleAction} busy={busy} />
          ))}
        </div>
      )}

      {/* OTP Modal */}
      <AnimatePresence>
        {otpModal && (
          <Modal show={otpModal} onClose={() => setOtpModal(false)} title="Confirm Pickup">
            <div className="bd-form">
              <p style={{ fontSize: 13, color: "#7a9ab0", marginBottom: 16 }}>
                Ask the buyer for their collection code and enter it below to confirm handover.<br />
                <strong style={{ color: "#e8f0fe" }}>{otpItem?.reservation_code}</strong>
              </p>
              <div className="bd-field">
                <label>Collection Code</label>
                <input value={otpCode} onChange={e => setOtpCode(e.target.value.toUpperCase())} placeholder="e.g. D27C74FB" style={{ textAlign: "center", letterSpacing: 4, fontSize: 20, fontWeight: 700 }} maxLength={12} />
              </div>
              <button className="bd-save-btn" onClick={handleOtp} disabled={otpBusy || !otpCode.trim()} style={{ background: "#22c55e", borderColor: "#22c55e" }}>
                {otpBusy ? "Confirming…" : "Confirm Pickup"}
              </button>
            </div>
          </Modal>
        )}

        {/* Dispatch Modal */}
        {dispModal && (
          <Modal show={dispModal} onClose={() => setDispModal(false)} title={`Dispatch — ${dispItem?.reservation_code}`}>
            <div className="bd-form">
              <div className="bd-field"><label>Tracking Number *</label><input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="e.g. RM123456789GB" /></div>
              <div className="bd-field"><label>Courier *</label><input value={courier} onChange={e => { setCourier(e.target.value); }} placeholder="e.g. Royal Mail, DPD, UPS" /></div>
              <div className="bd-field"><label>Note (optional)</label><textarea value={dispNote} onChange={e => setDispNote(e.target.value)} rows={2} placeholder="e.g. Fragile — handle with care" /></div>
              <button className="bd-save-btn" onClick={handleDispatch} disabled={dispBusy}>
                {dispBusy ? "Dispatching…" : <><FiTruck size={14} /> Confirm Dispatch</>}
              </button>
            </div>
          </Modal>
        )}

        {/* Dispute Modal */}
        {disModal && (
          <Modal show={disModal} onClose={() => setDisModal(false)} title={`Respond to Dispute — ${disItem?.reservation_code}`}>
            <div className="bd-form">
              {disItem?.latest_dispute && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Buyer's Complaint</p>
                  {disItem.latest_dispute.reason && <p style={{ color: "#f87171", fontWeight: 700, fontSize: 14 }}>{disItem.latest_dispute.reason}</p>}
                  {disItem.latest_dispute.description && <p style={{ color: "#fca5a5", fontSize: 13, lineHeight: 1.5 }}>{disItem.latest_dispute.description}</p>}
                </div>
              )}
              <div className="bd-field"><label>Resolution</label></div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {[{ key: "replace", label: "Send Replacement", color: "#7c3aed" }, { key: "refund", label: "Issue Refund", color: "#ef4444" }].map(opt => (
                  <button key={opt.key} type="button"
                    style={{ flex: 1, padding: "11px 8px", borderRadius: 12, border: `2px solid ${resType === opt.key ? opt.color : "rgba(255,255,255,0.1)"}`, background: resType === opt.key ? opt.color + "18" : "transparent", color: resType === opt.key ? opt.color : "#7a9ab0", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
                    onClick={() => setResType(opt.key)}>{opt.label}
                  </button>
                ))}
              </div>
              {resType === "replace" && <>
                <div className="bd-field"><label>Replacement Tracking *</label><input value={repTracking} onChange={e => setRepTracking(e.target.value)} /></div>
                <div className="bd-field"><label>Courier *</label><input value={repCourier} onChange={e => setRepCourier(e.target.value)} /></div>
              </>}
              <div className="bd-field"><label>Response Message *</label><textarea value={disResponse} onChange={e => setDisResponse(e.target.value)} rows={3} /></div>
              {resType === "refund" && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>⚠️ A full refund will be issued immediately. This cannot be undone.</p>}
              <button className="bd-save-btn" onClick={handleDisputeRespond} disabled={disBusy}
                style={{ background: resType === "refund" ? "#ef4444" : "#7c3aed", borderColor: resType === "refund" ? "#ef4444" : "#7c3aed" }}>
                {disBusy ? "Submitting…" : resType === "replace" ? "Confirm Replacement" : "Issue Refund"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
