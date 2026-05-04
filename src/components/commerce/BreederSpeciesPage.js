import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
import { commerceFetch } from "./commerceApi";


function defaultDraft(item) {
  return {
    delivery_method: item.supports_collection ? "collect" : "delivery_quote",
    quantity: 1,
    buyer_note: "",
    tier_counts: { S: 0, M: 0, L: 0 },
  };
}


export default function BreederSpeciesPage() {
  const { token } = useContext(AuthContext);
  const { sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get("listing_id");
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeListingId, setActiveListingId] = useState(listingId ? Number(listingId) : null);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [createdReservation, setCreatedReservation] = useState(null);

  const highlightedListing = useMemo(
    () => page?.species?.find((item) => Number(item.id) === Number(activeListingId)) || null,
    [activeListingId, page],
  );

  const draftFor = useCallback((item) => (
    drafts[item.id] || defaultDraft(item)
  ), [drafts]);

  const updateDraft = useCallback((item, patch) => {
    const current = drafts[item.id] || defaultDraft(item);
    setDrafts((existing) => ({
      ...existing,
      [item.id]: {
        ...current,
        ...patch,
      },
    }));
  }, [drafts]);

  const tierLineItems = useCallback((item, draft) => (
    Object.entries(draft.tier_counts || {})
      .map(([tier, quantity]) => ({ tier, quantity: Number(quantity) || 0 }))
      .filter((entry) => entry.quantity > 0 && item.tier_prices?.[entry.tier])
  ), []);

  const tierSubtotal = useCallback((item, draft) => (
    tierLineItems(item, draft).reduce(
      (sum, entry) => sum + entry.quantity * Number(item.tier_prices?.[entry.tier] || 0),
      0,
    )
  ), [tierLineItems]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commerceFetch(`/marketplace/breeders/${sellerId}/species/`, token);
      setPage(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sellerId, token]);

  useEffect(() => {
    if (token) {
      load();
    }
  }, [load, token]);

  const reserveListing = async (item) => {
    const draft = draftFor(item);
    try {
      setBusyId(item.id);
      const payload = {
        delivery_method: draft.delivery_method,
        buyer_note: draft.buyer_note,
      };
      if (item.pricing_mode === "tiered") {
        const line_items = tierLineItems(item, draft);
        if (line_items.length === 0) {
          throw new Error("Choose at least one size before reserving.");
        }
        payload.line_items = line_items;
        payload.quantity = line_items.reduce((sum, entry) => sum + entry.quantity, 0);
      } else {
        payload.quantity = Math.max(1, Number(draft.quantity) || 1);
      }
      const data = await commerceFetch(`/marketplace/listings/${item.id}/reserve/`, token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCreatedReservation(data.reservation);
      setDrafts((existing) => ({
        ...existing,
        [item.id]: defaultDraft(item),
      }));
      if (data.reservation?.delivery_method === "collect") {
        navigate(`/reservations?highlight=${data.reservation.id}`);
      } else {
        await load();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <CommerceShell
      title="Breeder Profile Species Page"
      subtitle="This is now the primary transaction surface for breeder stock. Buyers can reserve fixed stock, build S/M/L carts, or request breeder quotes from one catalogue."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {createdReservation && (
        <div className="commerce-alert">
          Reservation {createdReservation.reservation_code} created with status <strong>{createdReservation.status}</strong>.
          {createdReservation.payment_session_url
            ? " Continue into the Stripe sheet from My Reservations."
            : " The breeder now needs to answer with a structured quote."}
        </div>
      )}
      {loading && <div className="commerce-empty">Loading breeder inventory...</div>}
      {!loading && page && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--side">
            <h2>{page.seller_profile?.name || page.seller_profile?.username}</h2>
            <p className="commerce-muted">Buyer-facing breeder profile with collection, delivery verification, and stock visibility.</p>
            <div className="commerce-stat-row">
              <div className="commerce-stat">
                <strong>{page.seller_profile?.rating ?? 0}</strong>
                <span className="commerce-muted">Seller rating</span>
              </div>
              <div className="commerce-stat">
                <strong>{page.seller_profile?.reviews_count ?? 0}</strong>
                <span className="commerce-muted">Reviews</span>
              </div>
            </div>
            <div className="commerce-stack" style={{ marginTop: "1rem" }}>
              <div className={`commerce-status ${page.seller_profile?.stripe_connect_status === "active" ? "" : "pending"}`}>
                Stripe Connect {page.seller_profile?.stripe_connect_status}
              </div>
              <div className={`commerce-status ${page.seller_profile?.verification?.status === "approved" ? "" : "pending"}`}>
                Delivery verification {page.seller_profile?.verification?.status || "not_submitted"}
              </div>
            </div>
            <div className="commerce-inline-form">
              <h4>Feature D badges</h4>
              <FeatureDBadgeRow
                badges={page.seller_profile?.feature_d_badges || []}
                emptyLabel="This breeder has not unlocked any Feature D commerce badges yet."
              />
            </div>
            {page.low_stock_alerts?.length > 0 && (
              <div className="commerce-inline-form">
                <h4>Low stock alerts</h4>
                <div className="commerce-list">
                  {page.low_stock_alerts.map((item) => (
                    <div className="commerce-list-item" key={item.listing_id}>
                      {item.title}: {item.listed_quantity} remaining
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="commerce-card commerce-card--wide">
            <div className="commerce-section-title">
              <h2>Species currently available</h2>
              <div className="commerce-pill-row">
                <span className="commerce-tag">Choose a listing</span>
                <span className="commerce-tag">Single fixed, tiered, or quote-required</span>
              </div>
            </div>
            <div className="commerce-list">
              {page.species?.map((item) => {
                const draft = draftFor(item);
                return (
                  <article className="commerce-list-item" key={item.id}>
                    <header>
                      <div>
                        <h3>{item.title}</h3>
                        <p className="commerce-muted">
                          {item.species_name} · {item.display_price === "Quote on request" ? item.display_price : `£${item.display_price}`} · {item.listed_quantity} in stock
                        </p>
                        {item.bid_conversion_banner && <p className="commerce-muted">{item.bid_conversion_banner}</p>}
                      </div>
                      <div className="commerce-action-row">
                        <span className="commerce-status">{item.status}</span>
                        <button className="commerce-ghost-btn" onClick={() => setActiveListingId(item.id)}>
                          {item.reserve_button_label || "Reserve"}
                        </button>
                      </div>
                    </header>
                    {Number(activeListingId) === Number(item.id) && (
                      <div className="commerce-inline-form">
                        {item.pricing_mode === "tiered" && (
                          <div className="commerce-form-grid">
                            {["S", "M", "L"].map((tier) => (
                              <label className="commerce-label" key={tier}>
                                {tier === "S" ? "Small" : tier === "M" ? "Medium" : "Large"} (£{item.tier_prices?.[tier] || "0.00"})
                                <div className="commerce-action-row">
                                  <button
                                    className="commerce-ghost-btn"
                                    type="button"
                                    onClick={() =>
                                      updateDraft(item, {
                                        tier_counts: {
                                          ...(draft.tier_counts || {}),
                                          [tier]: Math.max(0, (draft.tier_counts?.[tier] || 0) - 1),
                                        },
                                      })
                                    }
                                  >
                                    -
                                  </button>
                                  <strong>{draft.tier_counts?.[tier] || 0}</strong>
                                  <button
                                    className="commerce-ghost-btn"
                                    type="button"
                                    onClick={() =>
                                      updateDraft(item, {
                                        tier_counts: {
                                          ...(draft.tier_counts || {}),
                                          [tier]: (draft.tier_counts?.[tier] || 0) + 1,
                                        },
                                      })
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </label>
                            ))}
                            <div className="commerce-stat">
                              <strong>£{tierSubtotal(item, draft).toFixed(2)}</strong>
                              <span className="commerce-muted">Tiered subtotal</span>
                            </div>
                          </div>
                        )}

                        <div className="commerce-form-grid">
                          {item.pricing_mode !== "tiered" && (
                            <label className="commerce-label">
                              Quantity
                              <input
                                type="number"
                                min="1"
                                className="commerce-input"
                                value={draft.quantity}
                                onChange={(e) => updateDraft(item, { quantity: e.target.value })}
                              />
                            </label>
                          )}
                          <label className="commerce-label">
                            Delivery option
                            <select
                              className="commerce-select"
                              value={draft.delivery_method}
                              onChange={(e) => updateDraft(item, { delivery_method: e.target.value })}
                            >
                              {item.supports_collection && <option value="collect">Collect</option>}
                              {item.supports_delivery_quote && <option value="delivery_quote">Request Delivery Quote</option>}
                            </select>
                          </label>
                          <label className="commerce-label">
                            Buyer note
                            <textarea
                              className="commerce-textarea"
                              placeholder={item.pricing_mode === "quote_required" ? "Preference notes, size requests, or specimen guidance" : "Preferred pickup slot, habitat notes, or delivery constraints"}
                              value={draft.buyer_note}
                              onChange={(e) => updateDraft(item, { buyer_note: e.target.value })}
                            />
                          </label>
                        </div>
                        {item.pricing_mode === "quote_required" && (
                          <p className="commerce-muted">
                            Quote-required livestock skips fixed pricing. The breeder will select the fish and send a structured quote before payment.
                          </p>
                        )}
                        <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                          <button className="commerce-primary-btn" disabled={busyId === item.id} onClick={() => reserveListing(item)}>
                            {busyId === item.id
                              ? "Creating..."
                              : item.pricing_mode === "quote_required"
                                ? "Request Quote"
                                : draft.delivery_method === "collect"
                                  ? "Reserve for Collection"
                                  : "Request Delivery Quote"}
                          </button>
                          <button className="commerce-ghost-btn" onClick={() => setActiveListingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {highlightedListing && (
            <section className="commerce-card">
              <h3>Transaction routing preview</h3>
              <p className="commerce-muted">
                Marketplace listing <strong>{highlightedListing.title}</strong> hands the buyer off here rather than running a one-click checkout directly on the listing detail page.
              </p>
            </section>
          )}
        </div>
      )}
    </CommerceShell>
  );
}
