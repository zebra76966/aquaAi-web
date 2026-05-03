import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import { commerceFetch } from "./commerceApi";


const FILTERS = ["all", "quote_pending", "payment_pending", "ready_for_collection", "awaiting_dispatch", "disputed", "completed"];


export default function BreederReservationsPage() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState({ reservations: [], metrics: {}, species: [] });
  const [connectStatus, setConnectStatus] = useState(null);
  const [verification, setVerification] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [quoteDrafts, setQuoteDrafts] = useState({});
  const [disputeReplies, setDisputeReplies] = useState({});
  const [verificationDraft, setVerificationDraft] = useState({
    licence_number: "",
    issuing_authority: "",
    expiry_date: "",
  });

  const filteredReservations = useMemo(() => (
    filter === "all" ? page.reservations : page.reservations.filter((item) => item.status === filter)
  ), [filter, page.reservations]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [reservationsData, connectData, verificationData, earningsData, speciesData] = await Promise.all([
        commerceFetch("/marketplace/reservations/incoming/", token),
        commerceFetch("/marketplace/breeders/me/connect/", token),
        commerceFetch("/marketplace/breeders/me/verification/", token),
        commerceFetch("/marketplace/breeders/me/earnings/", token),
        commerceFetch("/marketplace/breeders/me/species/", token),
      ]);
      setPage(reservationsData);
      setConnectStatus(connectData.seller_profile);
      setVerification(verificationData.verification);
      setEarnings(earningsData);
      setError("");
      if (speciesData?.species) {
        setPage((current) => ({ ...current, species: speciesData.species, low_stock_alerts: speciesData.low_stock_alerts || [] }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [load, token]);

  const action = async (path, body) => {
    try {
      await commerceFetch(path, token, {
        method: "POST",
        body: JSON.stringify(body || {}),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const quoteDraftFor = (reservationId) => quoteDrafts[reservationId] || { shipping_cost: "", estimated_dispatch_date: "", note: "" };

  return (
    <CommerceShell
      title="Incoming Reservations"
      subtitle="Breeders manage Connect onboarding, licence verification, quote responses, fulfilment, stock health, and earnings from one reservation operations surface."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading breeder operations...</div>}
      {!loading && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--side">
            <h2>Unlock delivery sales</h2>
            <p className="commerce-muted">Breeders can start with collection-only sales, then turn on delivery quotes once Stripe Connect and licence review are complete.</p>
            <div className="commerce-stack">
              <div className={`commerce-status ${connectStatus?.stripe_connect_status === "active" ? "" : "pending"}`}>
                Connect {connectStatus?.stripe_connect_status || "not_started"}
              </div>
              <div className={`commerce-status ${verification?.status === "approved" ? "" : "pending"}`}>
                Licence {verification?.status || "not_submitted"}
              </div>
            </div>
            <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
              <button className="commerce-primary-btn" onClick={() => action("/marketplace/breeders/me/connect/", { complete_mock: true })}>
                Complete Stripe Connect
              </button>
            </div>

            <div className="commerce-inline-form">
              <h4>Licence upload</h4>
              <div className="commerce-form-grid">
                <label className="commerce-label">
                  Licence number
                  <input
                    className="commerce-input"
                    value={verificationDraft.licence_number}
                    onChange={(e) => setVerificationDraft((current) => ({ ...current, licence_number: e.target.value }))}
                  />
                </label>
                <label className="commerce-label">
                  Issuing authority
                  <input
                    className="commerce-input"
                    value={verificationDraft.issuing_authority}
                    onChange={(e) => setVerificationDraft((current) => ({ ...current, issuing_authority: e.target.value }))}
                  />
                </label>
                <label className="commerce-label">
                  Expiry date
                  <input
                    type="date"
                    className="commerce-input"
                    value={verificationDraft.expiry_date}
                    onChange={(e) => setVerificationDraft((current) => ({ ...current, expiry_date: e.target.value }))}
                  />
                </label>
              </div>
              <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                <button className="commerce-primary-btn" onClick={() => action("/marketplace/breeders/me/verification/", verificationDraft)}>
                  Submit licence
                </button>
              </div>
            </div>
          </section>

          <section className="commerce-card commerce-card--wide">
            <div className="commerce-section-title">
              <div>
                <h2>Incoming Reservations</h2>
                <p className="commerce-muted">Filter by status, answer quotes, confirm collection, dispatch paid delivery orders, and respond to disputes.</p>
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
                const quoteDraft = quoteDraftFor(reservation.id);
                return (
                  <article className="commerce-list-item" key={reservation.id}>
                    <header>
                      <div>
                        <h3>{reservation.species_name}</h3>
                        <p className="commerce-muted">
                          {reservation.reservation_code} · {reservation.buyer?.name || reservation.buyer?.username} · £{reservation.total_amount}
                        </p>
                      </div>
                      <div className="commerce-pill-row">
                        <span className={`commerce-status ${["quote_pending", "payment_pending"].includes(reservation.status) ? "pending" : reservation.status === "disputed" ? "warning" : ""}`}>
                          {reservation.status.replaceAll("_", " ")}
                        </span>
                        <span className="commerce-tag">{reservation.delivery_method}</span>
                      </div>
                    </header>

                    {reservation.status === "quote_pending" && (
                      <div className="commerce-inline-form">
                        <div className="commerce-form-grid">
                          <label className="commerce-label">
                            Shipping cost
                            <input
                              className="commerce-input"
                              value={quoteDraft.shipping_cost}
                              onChange={(e) => setQuoteDrafts((current) => ({ ...current, [reservation.id]: { ...quoteDraft, shipping_cost: e.target.value } }))}
                            />
                          </label>
                          <label className="commerce-label">
                            Dispatch ETA
                            <input
                              type="date"
                              className="commerce-input"
                              value={quoteDraft.estimated_dispatch_date}
                              onChange={(e) => setQuoteDrafts((current) => ({ ...current, [reservation.id]: { ...quoteDraft, estimated_dispatch_date: e.target.value } }))}
                            />
                          </label>
                          <label className="commerce-label">
                            Note
                            <textarea
                              className="commerce-textarea"
                              value={quoteDraft.note}
                              onChange={(e) => setQuoteDrafts((current) => ({ ...current, [reservation.id]: { ...quoteDraft, note: e.target.value } }))}
                            />
                          </label>
                        </div>
                        <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                          <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/quote/`, quoteDraft)}>
                            Submit quote
                          </button>
                        </div>
                      </div>
                    )}

                    {reservation.status === "ready_for_collection" && (
                      <div className="commerce-action-row">
                        <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/collection/ready/`)}>
                          Confirm collection ready
                        </button>
                      </div>
                    )}

                    {reservation.status === "awaiting_dispatch" && (
                      <div className="commerce-action-row">
                        <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/dispatch/`, { note: "Packed and handed to courier." })}>
                          Mark dispatched
                        </button>
                      </div>
                    )}

                    {reservation.latest_dispute && ["open", "breeder_responded"].includes(reservation.latest_dispute.status) && (
                      <div className="commerce-inline-form">
                        <p className="commerce-muted">{reservation.latest_dispute.description}</p>
                        <label className="commerce-label">
                          Response
                          <textarea
                            className="commerce-textarea"
                            value={disputeReplies[reservation.id] || ""}
                            onChange={(e) => setDisputeReplies((current) => ({ ...current, [reservation.id]: e.target.value }))}
                          />
                        </label>
                        <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                          <button
                            className="commerce-danger-btn"
                            onClick={() => action(`/marketplace/reservations/${reservation.id}/dispute/respond/`, { response: disputeReplies[reservation.id] || "" })}
                          >
                            Respond to dispute
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="commerce-card commerce-card--side">
            <h3>Stock dashboard updates</h3>
            <div className="commerce-list">
              {(page.low_stock_alerts || []).map((item) => (
                <div className="commerce-list-item" key={item.listing_id}>
                  <strong>{item.title}</strong>
                  <p className="commerce-muted">{item.listed_quantity} left (threshold {item.threshold})</p>
                  <button className="commerce-ghost-btn" onClick={() => action(`/marketplace/listings/${item.listing_id}/relist/`, { listed_quantity: Math.max(item.threshold + 3, 5) })}>
                    List on Marketplace
                  </button>
                </div>
              ))}
              {(page.low_stock_alerts || []).length === 0 && <div className="commerce-empty">No low-stock alerts right now.</div>}
            </div>
          </section>

          <section className="commerce-card commerce-card--wide">
            <h3>Earnings view</h3>
            <div className="commerce-stat-row">
              <div className="commerce-stat">
                <strong>£{earnings?.gross_total || "0.00"}</strong>
                <span className="commerce-muted">Gross sales</span>
              </div>
              <div className="commerce-stat">
                <strong>£{earnings?.commission_total || "0.00"}</strong>
                <span className="commerce-muted">Commission paid</span>
              </div>
              <div className="commerce-stat">
                <strong>£{earnings?.net_total || "0.00"}</strong>
                <span className="commerce-muted">Net payout</span>
              </div>
            </div>
            <p className="commerce-muted" style={{ marginTop: "1rem" }}>{earnings?.payout_schedule}</p>
          </section>
        </div>
      )}
    </CommerceShell>
  );
}
