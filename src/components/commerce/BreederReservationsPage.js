import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
import { commerceFetch } from "./commerceApi";


const FILTERS = ["all", "payment_pending", "ready_for_collection", "awaiting_dispatch", "dispatched", "disputed", "no_show", "completed"];
const formatCategory = (category) => (category || "uncategorised").replaceAll("_", " ");


export default function BreederReservationsPage() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState({ reservations: [], metrics: {} });
  const [speciesPage, setSpeciesPage] = useState(null);
  const [shippingProfile, setShippingProfile] = useState(null);
  const [connectStatus, setConnectStatus] = useState(null);
  const [verification, setVerification] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [trackingDrafts, setTrackingDrafts] = useState({});
  const [holidayMessage, setHolidayMessage] = useState("");
  const [disputeReplies, setDisputeReplies] = useState({});

  const filteredReservations = useMemo(
    () => (filter === "all" ? page.reservations : page.reservations.filter((item) => item.status === filter)),
    [filter, page.reservations],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [reservationsData, speciesData, shippingData, connectData, verificationData, earningsData] = await Promise.all([
        commerceFetch("/marketplace/reservations/incoming/", token),
        commerceFetch("/marketplace/breeders/me/species/", token),
        commerceFetch("/marketplace/breeders/me/shipping-profile/", token),
        commerceFetch("/marketplace/breeders/me/connect/", token),
        commerceFetch("/marketplace/breeders/me/verification/", token),
        commerceFetch("/marketplace/breeders/me/earnings/", token),
      ]);
      setPage(reservationsData);
      setSpeciesPage(speciesData);
      setShippingProfile(shippingData.shipping_profile);
      setHolidayMessage(shippingData.shipping_profile?.holiday_message || "");
      setConnectStatus(connectData.seller_profile);
      setVerification(verificationData.verification);
      setEarnings(earningsData);
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

  const action = async (path, body, method = "POST") => {
    try {
      await commerceFetch(path, token, {
        method,
        body: JSON.stringify(body || {}),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleHolidayMode = async () => {
    await action("/marketplace/breeders/me/shipping-profile/", {
      holiday_mode_enabled: !shippingProfile?.holiday_mode_enabled,
      holiday_message: holidayMessage,
    }, "PATCH");
  };

  const listAllVisible = async (visible) => {
    await action("/marketplace/breeders/me/species/bulk-visibility/", { visible }, "PATCH");
  };

  return (
    <CommerceShell
      title="Breeder Operations"
      subtitle="Providers manage stock visibility, holiday mode, opening times, tracking entry, verification, and every incoming breeder reservation from one v4 commerce surface."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading breeder operations...</div>}
      {!loading && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--side">
            <h2>Breeder controls</h2>
            <div className="commerce-stack">
              <div className={`commerce-status ${connectStatus?.payouts_enabled ? "" : "pending"}`}>
                Stripe Connect {connectStatus?.stripe_connect_status || "not_started"}
              </div>
              <div className={`commerce-status ${verification?.status === "approved" ? "" : "pending"}`}>
                Licence {verification?.status || "not_submitted"}
              </div>
            </div>
            <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
              <button className="commerce-primary-btn" onClick={() => action("/marketplace/breeders/me/connect/")}>
                Open Stripe Connect
              </button>
            </div>
            <div className="commerce-inline-form">
              <h4>Feature D badges</h4>
              <FeatureDBadgeRow
                badges={page.feature_d_badges || []}
                emptyLabel="Stay verified, keep disputes low, and dispatch quickly to unlock breeder badges."
              />
            </div>
            <div className="commerce-inline-form">
              <h4>Holiday mode</h4>
              <textarea
                className="commerce-textarea"
                value={holidayMessage}
                onChange={(e) => setHolidayMessage(e.target.value)}
                placeholder="Tell buyers when checkout will reopen."
              />
              <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                <button className="commerce-primary-btn" onClick={toggleHolidayMode}>
                  {shippingProfile?.holiday_mode_enabled ? "Disable holiday mode" : "Enable holiday mode"}
                </button>
              </div>
            </div>
            <div className="commerce-inline-form">
              <h4>Bulk visibility</h4>
              <div className="commerce-action-row">
                <button className="commerce-primary-btn" onClick={() => listAllVisible(true)}>List all</button>
                <button className="commerce-ghost-btn" onClick={() => listAllVisible(false)}>Hide all</button>
              </div>
            </div>
            <div className="commerce-inline-form">
              <h4>Earnings</h4>
              <p><strong>Gross £{earnings?.gross_volume || "0.00"}</strong></p>
              <p className="commerce-muted">Net £{earnings?.net_earnings || "0.00"} after fees</p>
            </div>
          </section>

          <section className="commerce-card commerce-card--wide">
            <div className="commerce-section-title">
              <div>
                <h2>Incoming reservations</h2>
                <p className="commerce-muted">Tracking number entry is surfaced from the first dispatch action and the same reservation states are shared with the buyer app.</p>
              </div>
              <label className="commerce-label" style={{ minWidth: "220px" }}>
                Filter
                <select className="commerce-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  {FILTERS.map((item) => (
                    <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="commerce-list">
              {filteredReservations.length === 0 && <div className="commerce-empty">No reservations in this view.</div>}
              {filteredReservations.map((reservation) => {
                const tracking = trackingDrafts[reservation.id] || { tracking_number: "", courier: "" };
                return (
                  <article className="commerce-list-item" key={reservation.id}>
                    <header>
                      <div>
                        <h3>{reservation.species_name}</h3>
                        <p className="commerce-muted">
                          {reservation.reservation_code} · {reservation.buyer?.name || reservation.buyer?.username} · £{reservation.total_amount}
                        </p>
                        {reservation.dispute_risk && (
                          <p className="commerce-muted">
                            Dispute risk {reservation.dispute_risk.risk_level} ({Math.round((reservation.dispute_risk.risk_score || 0) * 100)}%)
                          </p>
                        )}
                      </div>
                      <span className={`commerce-status ${["payment_pending", "ready_for_collection", "awaiting_dispatch"].includes(reservation.status) ? "pending" : reservation.status === "disputed" ? "warning" : ""}`}>
                        {reservation.status.replaceAll("_", " ")}
                      </span>
                    </header>

                    <div className="commerce-list">
                      {(reservation.line_items || []).map((item, index) => (
                        <div className="commerce-list-item" key={`${reservation.id}-${index}`}>
                          <span>{item.title || item.species_name}</span>
                          <span>Qty {item.quantity}{item.size_tier ? ` · ${item.size_tier}` : ""}</span>
                        </div>
                      ))}
                    </div>

                    {reservation.status === "ready_for_collection" && (
                      <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                        <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/collection/confirm/`, { collection_code: reservation.collection_code })}>
                          Confirm collection
                        </button>
                        <button className="commerce-danger-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/no-show/`)}>
                          Mark no-show
                        </button>
                      </div>
                    )}

                    {reservation.status === "awaiting_dispatch" && (
                      <div className="commerce-inline-form">
                        <div className="commerce-form-grid">
                          <label className="commerce-label">
                            Tracking number
                            <input
                              className="commerce-input"
                              value={tracking.tracking_number}
                              onChange={(e) => setTrackingDrafts((current) => ({ ...current, [reservation.id]: { ...tracking, tracking_number: e.target.value } }))}
                            />
                          </label>
                          <label className="commerce-label">
                            Courier
                            <input
                              className="commerce-input"
                              value={tracking.courier}
                              onChange={(e) => setTrackingDrafts((current) => ({ ...current, [reservation.id]: { ...tracking, courier: e.target.value } }))}
                            />
                          </label>
                        </div>
                        <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                          <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/dispatch/`, tracking)}>
                            Mark dispatched
                          </button>
                        </div>
                      </div>
                    )}

                    {reservation.payment_status === "paid" && reservation.delivery_method === "collect" && reservation.status !== "ready_for_collection" && (
                      <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                        <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/collection/ready/`)}>
                          Mark ready for collection
                        </button>
                      </div>
                    )}

                    {reservation.latest_dispute && (
                      <div className="commerce-inline-form">
                        <strong>Dispute response</strong>
                        <p className="commerce-muted">{reservation.latest_dispute.reason}</p>
                        <textarea
                          className="commerce-textarea"
                          value={disputeReplies[reservation.id] || ""}
                          onChange={(e) => setDisputeReplies((current) => ({ ...current, [reservation.id]: e.target.value }))}
                          placeholder="Respond to the buyer evidence here."
                        />
                        <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                          <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/dispute/respond/`, { response: disputeReplies[reservation.id] || "" })}>
                            Submit response
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="commerce-card">
            <h2>Stock dashboard</h2>
            <div className="commerce-list">
              {(speciesPage?.species || []).map((stock) => (
                <div className="commerce-list-item" key={stock.id}>
                  <div>
                    <strong>{stock.title}</strong>
                    <p className="commerce-muted">{stock.quantity} in stock · {formatCategory(stock.category)}</p>
                  </div>
                  <span className={`commerce-status ${stock.is_visible_on_marketplace ? "" : "pending"}`}>
                    {stock.is_visible_on_marketplace ? "Listed" : "Hidden"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </CommerceShell>
  );
}
