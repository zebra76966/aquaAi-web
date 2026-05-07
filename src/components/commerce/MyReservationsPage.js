import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
import { commerceFetch } from "./commerceApi";


const DISPUTE_OPTIONS = [
  { value: "doa", label: "DOA" },
  { value: "wrong_species", label: "Wrong species" },
  { value: "late_delivery", label: "Late delivery" },
  { value: "disease", label: "Disease" },
  { value: "other", label: "Other" },
];


export default function MyReservationsPage() {
  const { token } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [badgeState, setBadgeState] = useState({ feature_d_badges: [], feature_d_badge_progress: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDisputeId, setActiveDisputeId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("doa");
  const [disputeDescription, setDisputeDescription] = useState("");

  const orderedReservations = useMemo(() => [...reservations].sort((a, b) => b.id - a.id), [reservations]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commerceFetch("/marketplace/reservations/mine/", token);
      setReservations(data.reservations || []);
      setBadgeState({
        feature_d_badges: data.feature_d_badges || [],
        feature_d_badge_progress: data.feature_d_badge_progress || [],
      });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      load();
    }
  }, [load, token]);

  const action = async (path, body) => {
    try {
      await commerceFetch(path, token, {
        method: "POST",
        body: JSON.stringify(body || {}),
      });
      setActiveDisputeId(null);
      setDisputeDescription("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <CommerceShell
      title="My Reservations"
      subtitle="The v4 buyer ledger tracks canonical breeder orders, dispatch, collection, receipt confirmation, and disputes without a separate quote workflow."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading reservations...</div>}
      {!loading && (
        <div className="commerce-list">
          <article className="commerce-card">
            <h2>Buyer Feature D badges</h2>
            <FeatureDBadgeRow
              badges={badgeState.feature_d_badges}
              emptyLabel="Complete breeder reservations cleanly to unlock buyer-side commerce badges."
            />
          </article>

          {orderedReservations.length === 0 && <div className="commerce-empty">No reservations yet.</div>}
          {orderedReservations.map((reservation) => (
            <article className="commerce-card" key={reservation.id}>
              <header className="commerce-section-title">
                <div>
                  <div className={`commerce-status ${["payment_pending", "awaiting_dispatch", "ready_for_collection"].includes(reservation.status) ? "pending" : reservation.status === "disputed" ? "warning" : ""}`}>
                    {reservation.status.replaceAll("_", " ")}
                  </div>
                  <h2>{reservation.species_name}</h2>
                  <p className="commerce-muted">
                    {reservation.reservation_code} · {reservation.delivery_method} · Payment {reservation.payment_status}
                  </p>
                  <p className="commerce-muted">
                    Subtotal £{reservation.subtotal} · Delivery £{reservation.delivery_cost} · Total £{reservation.total_amount}
                  </p>
                  {reservation.dispute_risk && (
                    <p className="commerce-muted">
                      Dispute risk {reservation.dispute_risk.risk_level} ({Math.round((reservation.dispute_risk.risk_score || 0) * 100)}%)
                    </p>
                  )}
                </div>
              </header>

              <div className="commerce-list">
                {(reservation.line_items || []).map((item, index) => (
                  <div className="commerce-list-item" key={`${reservation.id}-${index}`}>
                    <div>
                      <strong>{item.title || item.species_name}</strong>
                      <p className="commerce-muted">
                        Qty {item.quantity}
                        {item.size_tier ? ` · ${item.size_tier}` : ""}
                      </p>
                    </div>
                    <strong>£{item.line_total}</strong>
                  </div>
                ))}
              </div>

              {reservation.delivery_method === "collect" && reservation.collection_code && (
                <div className="commerce-inline-form">
                  <strong>Collection code</strong>
                  <p className="commerce-muted">{reservation.collection_code}</p>
                </div>
              )}

              {reservation.status === "dispatched" && (
                <div className="commerce-inline-form">
                  <strong>Tracking</strong>
                  <p className="commerce-muted">{reservation.courier} · {reservation.tracking_number}</p>
                </div>
              )}

              {reservation.latest_dispute && (
                <div className="commerce-inline-form">
                  <strong>Dispute</strong>
                  <p className="commerce-muted">
                    {reservation.latest_dispute.reason} · {reservation.latest_dispute.status}
                  </p>
                  {reservation.latest_dispute.breeder_response && <p><strong>Breeder:</strong> {reservation.latest_dispute.breeder_response}</p>}
                </div>
              )}

              <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
                {reservation.status === "ready_for_collection" && (
                  <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/collection/confirm/`, { collection_code: reservation.collection_code })}>
                    I&apos;ve collected it
                  </button>
                )}
                {reservation.status === "dispatched" && (
                  <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/receipt/confirm/`)}>
                    I&apos;ve received it
                  </button>
                )}
                {reservation.payment_status === "paid" && !["completed", "disputed", "no_show", "cancelled"].includes(reservation.status) && (
                  <button className="commerce-ghost-btn" onClick={() => setActiveDisputeId(activeDisputeId === reservation.id ? null : reservation.id)}>
                    Open dispute
                  </button>
                )}
              </div>

              {activeDisputeId === reservation.id && (
                <div className="commerce-inline-form">
                  <div className="commerce-form-grid">
                    <label className="commerce-label">
                      Reason
                      <select className="commerce-select" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}>
                        {DISPUTE_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="commerce-label">
                      Description
                      <textarea className="commerce-textarea" value={disputeDescription} onChange={(e) => setDisputeDescription(e.target.value)} />
                    </label>
                  </div>
                  <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                    <button
                      className="commerce-danger-btn"
                      onClick={() => action(`/marketplace/reservations/${reservation.id}/dispute/`, {
                        reason: disputeReason,
                        description: disputeDescription,
                      })}
                    >
                      Submit dispute
                    </button>
                    <button className="commerce-ghost-btn" onClick={() => setActiveDisputeId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </CommerceShell>
  );
}
