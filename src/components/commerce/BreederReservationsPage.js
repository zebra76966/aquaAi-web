import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
import { commerceFetch } from "./commerceApi";


const FILTERS = ["all", "quote_pending", "quote_received", "payment_pending", "ready_for_collection", "awaiting_dispatch", "disputed", "no_show", "completed"];


function defaultQuoteDraft(reservation) {
  const defaultType = reservation.pricing_mode === "quote_required"
    ? reservation.delivery_method === "delivery_quote" ? "fish_and_delivery" : "fish_only"
    : "delivery_only";
  return {
    quote_type: defaultType,
    fish_price: "",
    shipping_cost: "",
    estimated_dispatch_date: "",
    note: "",
    collection_code: reservation.collection_code || "",
    tracking_number: "",
    courier: "",
  };
}


export default function BreederReservationsPage() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState({ reservations: [], metrics: {}, species: [] });
  const [badgeState, setBadgeState] = useState({ feature_d_badges: [], feature_d_badge_progress: [] });
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
      setBadgeState({
        feature_d_badges: reservationsData.feature_d_badges || [],
        feature_d_badge_progress: reservationsData.feature_d_badge_progress || [],
      });
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

  const quoteDraftFor = (reservation) => quoteDrafts[reservation.id] || defaultQuoteDraft(reservation);

  const setQuoteDraft = (reservation, patch) => {
    const current = quoteDraftFor(reservation);
    setQuoteDrafts((existing) => ({
      ...existing,
      [reservation.id]: {
        ...current,
        ...patch,
      },
    }));
  };

  return (
    <CommerceShell
      title="Incoming Reservations"
      subtitle="Breeders manage Connect onboarding, licence verification, quotes, collection scans, dispatch, no-show handling, and earnings from one reservation operations surface."
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
              <h4>Feature D badges</h4>
              <FeatureDBadgeRow
                badges={badgeState.feature_d_badges}
                emptyLabel="Dispatch quickly, keep disputes low, and stay verified to unlock breeder commerce badges."
              />
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
                <p className="commerce-muted">Filter by status, answer structured quotes, scan collection codes, dispatch paid orders, and respond to disputes.</p>
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
                const quoteDraft = quoteDraftFor(reservation);
                const isQuoteRequired = reservation.pricing_mode === "quote_required";
                const showFishPrice = quoteDraft.quote_type === "fish_only" || quoteDraft.quote_type === "fish_and_delivery";
                const showDeliveryFields = quoteDraft.quote_type === "delivery_only" || quoteDraft.quote_type === "fish_and_delivery";
                const noShowAllowed = reservation.status === "ready_for_collection" && reservation.pickup_window_expires_at && new Date(reservation.pickup_window_expires_at).getTime() <= Date.now();
                return (
                  <article className="commerce-list-item" key={reservation.id}>
                    <header>
                      <div>
                        <h3>{reservation.species_name}</h3>
                        <p className="commerce-muted">
                          {reservation.reservation_code} · {reservation.buyer?.name || reservation.buyer?.username} · £{reservation.total_amount}
                        </p>
                        <p className="commerce-muted">
                          {reservation.pricing_mode.replaceAll("_", " ")} · {reservation.delivery_method}
                        </p>
                      </div>
                      <div className="commerce-pill-row">
                        <span className={`commerce-status ${["quote_pending", "payment_pending", "quote_received"].includes(reservation.status) ? "pending" : reservation.status === "disputed" ? "warning" : ""}`}>
                          {reservation.status.replaceAll("_", " ")}
                        </span>
                        <span className="commerce-tag">Payment {reservation.payment_status}</span>
                      </div>
                    </header>

                    {reservation.line_items?.length > 0 && (
                      <div className="commerce-inline-form">
                        <strong>Requested mix</strong>
                        <div className="commerce-list">
                          {reservation.line_items.map((item, index) => (
                            <div className="commerce-list-item" key={`${reservation.id}-line-${index}`}>
                              {(item.label || item.tier || "Item")} · Qty {item.quantity}
                              {item.unit_price ? ` · £${item.unit_price}` : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reservation.status === "quote_pending" && (
                      <div className="commerce-inline-form">
                        <div className="commerce-form-grid">
                          <label className="commerce-label">
                            Quote type
                            <select
                              className="commerce-select"
                              value={quoteDraft.quote_type}
                              onChange={(e) => setQuoteDraft(reservation, { quote_type: e.target.value })}
                            >
                              {!isQuoteRequired && <option value="delivery_only">Delivery only</option>}
                              {isQuoteRequired && reservation.delivery_method === "collect" && <option value="fish_only">Fish only</option>}
                              {isQuoteRequired && reservation.delivery_method === "delivery_quote" && <option value="fish_and_delivery">Fish and delivery</option>}
                            </select>
                          </label>
                          {showFishPrice && (
                            <label className="commerce-label">
                              Fish price
                              <input
                                className="commerce-input"
                                value={quoteDraft.fish_price}
                                onChange={(e) => setQuoteDraft(reservation, { fish_price: e.target.value })}
                              />
                            </label>
                          )}
                          {showDeliveryFields && (
                            <label className="commerce-label">
                              Shipping cost
                              <input
                                className="commerce-input"
                                value={quoteDraft.shipping_cost}
                                onChange={(e) => setQuoteDraft(reservation, { shipping_cost: e.target.value })}
                              />
                            </label>
                          )}
                          {showDeliveryFields && (
                            <label className="commerce-label">
                              Dispatch ETA
                              <input
                                type="date"
                                className="commerce-input"
                                value={quoteDraft.estimated_dispatch_date}
                                onChange={(e) => setQuoteDraft(reservation, { estimated_dispatch_date: e.target.value })}
                              />
                            </label>
                          )}
                          <label className="commerce-label">
                            Note
                            <textarea
                              className="commerce-textarea"
                              value={quoteDraft.note}
                              onChange={(e) => setQuoteDraft(reservation, { note: e.target.value })}
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
                      <div className="commerce-inline-form">
                        <div className="commerce-form-grid">
                          <label className="commerce-label">
                            Scan / enter collection code
                            <input
                              className="commerce-input"
                              value={quoteDraft.collection_code}
                              onChange={(e) => setQuoteDraft(reservation, { collection_code: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                          <button className="commerce-primary-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/collection/scan/`, { collection_code: quoteDraft.collection_code })}>
                            Confirm collection
                          </button>
                          {noShowAllowed && (
                            <button className="commerce-danger-btn" onClick={() => action(`/marketplace/reservations/${reservation.id}/no-show/`)}>
                              Mark no-show
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {reservation.status === "awaiting_dispatch" && (
                      <div className="commerce-inline-form">
                        <div className="commerce-form-grid">
                          <label className="commerce-label">
                            Tracking number
                            <input
                              className="commerce-input"
                              value={quoteDraft.tracking_number}
                              onChange={(e) => setQuoteDraft(reservation, { tracking_number: e.target.value })}
                            />
                          </label>
                          <label className="commerce-label">
                            Courier
                            <input
                              className="commerce-input"
                              value={quoteDraft.courier}
                              onChange={(e) => setQuoteDraft(reservation, { courier: e.target.value })}
                            />
                          </label>
                          <label className="commerce-label">
                            Note
                            <textarea
                              className="commerce-textarea"
                              value={quoteDraft.note}
                              onChange={(e) => setQuoteDraft(reservation, { note: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                          <button
                            className="commerce-primary-btn"
                            onClick={() =>
                              action(`/marketplace/reservations/${reservation.id}/dispatch/`, {
                                note: quoteDraft.note || "Packed and handed to courier.",
                                tracking_number: quoteDraft.tracking_number,
                                courier: quoteDraft.courier,
                              })
                            }
                          >
                            Mark dispatched
                          </button>
                        </div>
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
              {(page.species || []).filter((item) => item.listed_quantity > 0 && item.status !== "active").map((item) => (
                <div className="commerce-list-item" key={`relist-${item.id}`}>
                  <strong>{item.title}</strong>
                  <p className="commerce-muted">Stock recovered with {item.listed_quantity} units available.</p>
                  <button className="commerce-ghost-btn" onClick={() => action(`/marketplace/listings/${item.id}/relist/`, { listed_quantity: item.listed_quantity })}>
                    List on Marketplace
                  </button>
                </div>
              ))}
              {(page.low_stock_alerts || []).map((item) => (
                <div className="commerce-list-item" key={item.listing_id}>
                  <strong>{item.title}</strong>
                  <p className="commerce-muted">{item.listed_quantity} left (threshold {item.threshold})</p>
                  <button className="commerce-ghost-btn" onClick={() => action(`/marketplace/listings/${item.listing_id}/relist/`, { listed_quantity: Math.max(item.threshold + 3, 5) })}>
                    List on Marketplace
                  </button>
                </div>
              ))}
              {(page.low_stock_alerts || []).length === 0 && (page.species || []).filter((item) => item.listed_quantity > 0 && item.status !== "active").length === 0 && (
                <div className="commerce-empty">No stock actions right now.</div>
              )}
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
