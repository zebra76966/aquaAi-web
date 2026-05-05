import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
import { commerceFetch } from "./commerceApi";


const DISPUTE_OPTIONS = [
  { value: "doa", label: "DOA" },
  { value: "wrong_species", label: "Wrong species" },
  { value: "late_delivery", label: "Late delivery" },
  { value: "disease_introduction", label: "Disease introduction" },
  { value: "other", label: "Other" },
];


function reservationModeLabel(reservation) {
  if (reservation.pricing_mode === "quote_required") return "Quote required";
  if (reservation.pricing_mode === "tiered") return "Tiered";
  return "Single fixed";
}


export default function MyReservationsPage() {
  const { token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const highlightedId = Number(searchParams.get("highlight"));
  const [reservations, setReservations] = useState([]);
  const [badgeState, setBadgeState] = useState({ feature_d_badges: [], feature_d_badge_progress: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDisputeId, setActiveDisputeId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("doa");
  const [disputeDescription, setDisputeDescription] = useState("");

  const orderedReservations = useMemo(() => {
    if (!highlightedId) return reservations;
    return [...reservations].sort((a, b) => (a.id === highlightedId ? -1 : b.id === highlightedId ? 1 : 0));
  }, [highlightedId, reservations]);

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
    if (token) load();
  }, [load, token]);

  const act = async (reservationId, path, body, isForm = false) => {
    try {
      await commerceFetch(path, token, {
        method: "POST",
        body: isForm ? body : JSON.stringify(body || {}),
      });
      if (path.endsWith("/dispute/")) {
        setActiveDisputeId(null);
        setDisputeDescription("");
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <CommerceShell
      title="My Reservations"
      subtitle="Buyers can track quotes, pay in full, present collection QR codes, confirm delivery receipt, and manage disputes from one reservation ledger."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading reservations...</div>}
      {!loading && (
        <div className="commerce-list">
          <article className="commerce-card">
            <h2>Buyer Feature D badges</h2>
            <p className="commerce-muted">Reservation reliability and clean purchase history now feed buyer-side commerce badges that can be surfaced in mobile profile and reservation screens.</p>
            <FeatureDBadgeRow
              badges={badgeState.feature_d_badges}
              emptyLabel="Complete successful reservation purchases without raising disputes to unlock buyer commerce badges."
            />
          </article>
          {orderedReservations.length === 0 && <div className="commerce-empty">No reservations yet. Start from a breeder listing detail or species page.</div>}
          {orderedReservations.map((reservation) => (
            <article className="commerce-card" key={reservation.id} style={reservation.id === highlightedId ? { borderColor: "rgba(20, 209, 255, 0.52)" } : {}}>
              <header className="commerce-section-title">
                <div>
                  <div className={`commerce-status ${["quote_pending", "payment_pending", "quote_received"].includes(reservation.status) ? "pending" : reservation.status === "disputed" ? "warning" : ""}`}>
                    {reservation.status.replaceAll("_", " ")}
                  </div>
                  <h2>{reservation.species_name}</h2>
                  <p className="commerce-muted">
                    {reservation.reservation_code} · {reservation.delivery_method === "collect" ? "Collection" : "Delivery"} · {reservationModeLabel(reservation)}
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
                <div className="commerce-pill-row">
                  <span className="commerce-tag">Payment {reservation.payment_status}</span>
                  {reservation.active_quote && <span className="commerce-tag">Quote expires {new Date(reservation.active_quote.expires_at).toLocaleString()}</span>}
                </div>
              </header>

              {reservation.line_items?.length > 0 && (
                <div className="commerce-inline-form">
                  <strong>Line items</strong>
                  <div className="commerce-list">
                    {reservation.line_items.map((item, index) => (
                      <div className="commerce-list-item" key={`${reservation.id}-line-${index}`}>
                        {(item.label || item.tier || "Item")} · Qty {item.quantity}
                        {item.unit_price ? ` · £${item.unit_price}` : " · price to be quoted"}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reservation.active_quote && (
                <div className="commerce-list-item">
                  <strong>Quote details</strong>
                  <p className="commerce-muted">
                    {reservation.active_quote.quote_type.replaceAll("_", " ")} · Fish £{reservation.active_quote.fish_price} · Shipping £{reservation.active_quote.delivery_cost} · Total £{reservation.active_quote.total_amount}
                  </p>
                  {reservation.active_quote.estimated_dispatch_date && (
                    <p className="commerce-muted">Dispatch ETA {reservation.active_quote.estimated_dispatch_date}</p>
                  )}
                  {reservation.active_quote.note && <p>{reservation.active_quote.note}</p>}
                </div>
              )}

              <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
                {reservation.status === "quote_received" && (
                  <>
                    <button className="commerce-primary-btn" onClick={() => act(reservation.id, `/marketplace/reservations/${reservation.id}/quote/accept/`)}>
                      Accept quote
                    </button>
                    <button className="commerce-danger-btn" onClick={() => act(reservation.id, `/marketplace/reservations/${reservation.id}/quote/decline/`)}>
                      Decline
                    </button>
                  </>
                )}

                {reservation.status === "payment_pending" && (
                  <>
                    {reservation.payment_session_url && (
                      <a className="commerce-ghost-btn" href={reservation.payment_session_url} target="_blank" rel="noreferrer">
                        Open Stripe checkout
                      </a>
                    )}
                    <button className="commerce-primary-btn" onClick={() => act(reservation.id, `/marketplace/reservations/${reservation.id}/checkout/complete/`)}>
                      Simulate successful payment
                    </button>
                  </>
                )}

                {reservation.status === "dispatched" && (
                  <button className="commerce-primary-btn" onClick={() => act(reservation.id, `/marketplace/reservations/${reservation.id}/receipt/confirm/`)}>
                    I&apos;ve received it
                  </button>
                )}

                {reservation.payment_status === "paid" && !["disputed", "cancelled", "no_show"].includes(reservation.status) && (
                  <button className="commerce-ghost-btn" onClick={() => setActiveDisputeId(activeDisputeId === reservation.id ? null : reservation.id)}>
                    Open dispute
                  </button>
                )}
              </div>

              {reservation.collection_code && reservation.status === "ready_for_collection" && (
                <div className="commerce-inline-form">
                  <strong>Collection QR fallback</strong>
                  <p className="commerce-muted">Show this code to the breeder for scanning: {reservation.collection_code}</p>
                  {reservation.pickup_window_expires_at && (
                    <p className="commerce-muted">Pickup window ends {new Date(reservation.pickup_window_expires_at).toLocaleString()}</p>
                  )}
                </div>
              )}

              {reservation.status === "no_show" && (
                <div className="commerce-inline-form">
                  <strong>No-show processed</strong>
                  <p className="commerce-muted">
                    Refund issued minus no-show fee of £{reservation.no_show_fee}.
                  </p>
                </div>
              )}

              {reservation.latest_dispute && (
                <div className="commerce-inline-form">
                  <strong>Dispute status</strong>
                  <p className="commerce-muted">
                    {reservation.latest_dispute.reason} · {reservation.latest_dispute.status}
                  </p>
                  {reservation.latest_dispute.breeder_response && <p><strong>Breeder:</strong> {reservation.latest_dispute.breeder_response}</p>}
                  {reservation.latest_dispute.resolution_summary && <p><strong>Resolution:</strong> {reservation.latest_dispute.resolution_summary}</p>}
                </div>
              )}

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
                      <textarea
                        className="commerce-textarea"
                        placeholder="What happened?"
                        value={disputeDescription}
                        onChange={(e) => setDisputeDescription(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                    <button
                      className="commerce-danger-btn"
                      onClick={() =>
                        act(reservation.id, `/marketplace/reservations/${reservation.id}/dispute/`, {
                          reason: disputeReason,
                          description: disputeDescription,
                        })
                      }
                    >
                      Submit dispute
                    </button>
                    <button className="commerce-ghost-btn" onClick={() => setActiveDisputeId(null)}>
                      Cancel
                    </button>
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
