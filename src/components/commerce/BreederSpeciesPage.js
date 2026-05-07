import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
import { commerceFetch } from "./commerceApi";


function defaultDraft(stock) {
  return {
    quantity: 1,
    tierCounts: { S: 0, M: 0, L: 0 },
  };
}


export default function BreederSpeciesPage() {
  const { token } = useContext(AuthContext);
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [basket, setBasket] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyStockId, setBusyStockId] = useState("");
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [conflictState, setConflictState] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [speciesData, basketData] = await Promise.all([
        commerceFetch(`/marketplace/breeders/${sellerId}/species/`, token),
        commerceFetch("/marketplace/basket/", token),
      ]);
      setPage(speciesData);
      setBasket(basketData.basket);
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

  const visibleStock = useMemo(() => {
    const items = page?.species || [];
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, page]);

  const updateDraft = (stock, patch) => {
    const current = drafts[stock.id] || defaultDraft(stock);
    setDrafts((existing) => ({
      ...existing,
      [stock.id]: {
        ...current,
        ...patch,
      },
    }));
  };

  const currentDraft = (stock) => drafts[stock.id] || defaultDraft(stock);
  const formatCategory = (category) => (category || "uncategorised").replaceAll("_", " ");

  const addBasketItem = async (stock, payload, options = {}) => {
    try {
      setBusyStockId(stock.id);
      const response = await commerceFetch("/marketplace/basket/items/", token, {
        method: "POST",
        body: JSON.stringify({
          breeder_stock_id: stock.id,
          ...payload,
          ...options,
        }),
      });
      if (response.conflict) {
        setConflictState({
          stock,
          payload,
          existingBreeder: response.existing_breeder,
          incomingBreeder: response.incoming_breeder,
        });
        return;
      }
      setBasket(response.basket);
      setDrafts((existing) => ({
        ...existing,
        [stock.id]: defaultDraft(stock),
      }));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyStockId("");
    }
  };

  const addSingleFixed = async (stock) => {
    const draft = currentDraft(stock);
    await addBasketItem(stock, {
      quantity: Math.max(1, Number(draft.quantity) || 1),
    });
  };

  const addTiered = async (stock) => {
    const draft = currentDraft(stock);
    const tiers = Object.entries(draft.tierCounts || {}).filter(([, count]) => Number(count) > 0);
    if (tiers.length === 0) {
      setError("Choose at least one S, M, or L quantity before adding to basket.");
      return;
    }
    for (const [sizeTier, quantity] of tiers) {
      // eslint-disable-next-line no-await-in-loop
      await addBasketItem(stock, { size_tier: sizeTier, quantity: Number(quantity) });
    }
  };

  const replaceBasket = async () => {
    if (!conflictState) return;
    await addBasketItem(conflictState.stock, conflictState.payload, { force_replace: true });
    setConflictState(null);
  };

  return (
    <CommerceShell
      title="Breeder Profile Species Page"
      subtitle="The breeder stock card is the listing in v4. Buyers browse by category, add stock straight into a single-breeder basket, and use one canonical checkout."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {page?.checkout_blocked && (
        <div className="commerce-alert">
          Holiday mode is enabled. Buyers can still browse and build a basket, but checkout is blocked until the breeder returns.
          {page.holiday_message ? ` ${page.holiday_message}` : ""}
        </div>
      )}
      {conflictState && (
        <div className="commerce-alert warning">
          Your basket already belongs to {conflictState.existingBreeder?.name || conflictState.existingBreeder?.username}. Replacing it will clear those items and start a new basket with {conflictState.incomingBreeder?.name || conflictState.incomingBreeder?.username}.
          <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
            <button className="commerce-primary-btn" onClick={replaceBasket}>Replace basket</button>
            <button className="commerce-ghost-btn" onClick={() => setConflictState(null)}>Keep current basket</button>
          </div>
        </div>
      )}
      {loading && <div className="commerce-empty">Loading breeder stock...</div>}
      {!loading && page && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--side">
            <h2>{page.seller_profile?.company_name || page.seller_profile?.name || page.seller_profile?.username}</h2>
            <p className="commerce-muted">Buyer flow: browse stock, add to basket, then use the same checkout regardless of where the journey started.</p>
            <div className="commerce-pill-row">
              <span className="commerce-tag">Rating {page.seller_profile?.rating ?? 0}</span>
              <span className={`commerce-status ${page.shipping_profile?.delivery_enabled ? "" : "pending"}`}>
                Delivery {page.shipping_profile?.delivery_enabled ? "enabled" : "locked"}
              </span>
            </div>
            <div className="commerce-inline-form">
              <h4>Feature D badges</h4>
              <FeatureDBadgeRow
                badges={page.seller_profile?.feature_d_badges || []}
                emptyLabel="This breeder has not unlocked any Feature D commerce badges yet."
              />
            </div>
            <div className="commerce-inline-form">
              <button className="commerce-ghost-btn" onClick={() => setShowOpeningHours((current) => !current)}>
                {showOpeningHours ? "Hide opening times" : "View opening times"}
              </button>
              {showOpeningHours && (
                <div className="commerce-list" style={{ marginTop: "0.75rem" }}>
                  {Object.entries(page.shipping_profile?.opening_hours || {}).map(([day, value]) => (
                    <div className="commerce-list-item" key={day}>
                      <strong>{day}</strong>
                      <span className="commerce-muted">
                        {value?.closed ? "Closed" : `${value?.open || "?"} - ${value?.close || "?"}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="commerce-inline-form">
              <h4>Basket</h4>
              {!basket && <p className="commerce-muted">No active breeder basket yet.</p>}
              {basket && (
                <>
                  <p className="commerce-muted">
                    {basket.item_count} item(s) from {basket.breeder?.name || basket.breeder?.username}
                  </p>
                  <p><strong>Subtotal £{basket.subtotal}</strong></p>
                  <button
                    className="commerce-primary-btn"
                    disabled={page.checkout_blocked}
                    onClick={() => navigate("/marketplace/checkout")}
                  >
                    Go to checkout
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="commerce-card commerce-card--wide">
            <div className="commerce-section-title">
              <div>
                <h2>Available stock</h2>
                <p className="commerce-muted">Category tabs match the marketplace enum so the mobile buyer flow can reuse the same filters and labels.</p>
              </div>
              <div className="commerce-pill-row">
                <button className={activeCategory === "all" ? "commerce-primary-btn" : "commerce-ghost-btn"} onClick={() => setActiveCategory("all")}>All</button>
                {(page.categories || []).map((category) => (
                  <button
                    key={category}
                    className={activeCategory === category ? "commerce-primary-btn" : "commerce-ghost-btn"}
                    onClick={() => setActiveCategory(category)}
                  >
                    {formatCategory(category)}
                  </button>
                ))}
              </div>
            </div>

            <div className="commerce-list">
              {visibleStock.length === 0 && <div className="commerce-empty">No breeder stock in this category.</div>}
              {visibleStock.map((stock) => {
                const draft = currentDraft(stock);
                return (
                  <article className="commerce-list-item" key={stock.id}>
                    <header>
                      <div>
                        <h3>{stock.title}</h3>
                        <p className="commerce-muted">
                          {stock.species_name} · {formatCategory(stock.category)} · {stock.quantity} in stock
                        </p>
                        <p className="commerce-muted">
                          {stock.pricing_mode === "tiered" ? `£${stock.price_min} - £${stock.price_max}` : `£${stock.base_price}`}
                        </p>
                      </div>
                      {stock.low_stock && <span className="commerce-status pending">Low stock</span>}
                    </header>

                    {stock.pricing_mode === "single_fixed" && (
                      <div className="commerce-inline-form">
                        <div className="commerce-action-row">
                          <button
                            className="commerce-ghost-btn"
                            onClick={() => updateDraft(stock, { quantity: Math.max(1, Number(draft.quantity || 1) - 1) })}
                          >
                            -
                          </button>
                          <strong>{draft.quantity}</strong>
                          <button
                            className="commerce-ghost-btn"
                            onClick={() => updateDraft(stock, { quantity: Number(draft.quantity || 1) + 1 })}
                          >
                            +
                          </button>
                          <button className="commerce-primary-btn" disabled={busyStockId === stock.id} onClick={() => addSingleFixed(stock)}>
                            {busyStockId === stock.id ? "Adding..." : "Add to basket"}
                          </button>
                        </div>
                      </div>
                    )}

                    {stock.pricing_mode === "tiered" && (
                      <div className="commerce-inline-form">
                        <div className="commerce-form-grid">
                          {["S", "M", "L"].map((tier) => (
                            <div key={tier} className="commerce-stat">
                              <span>{tier}</span>
                              <strong>£{stock.tier_prices?.[tier] || "0.00"}</strong>
                              <div className="commerce-action-row">
                                <button
                                  className="commerce-ghost-btn"
                                  onClick={() =>
                                    updateDraft(stock, {
                                      tierCounts: {
                                        ...(draft.tierCounts || {}),
                                        [tier]: Math.max(0, Number(draft.tierCounts?.[tier] || 0) - 1),
                                      },
                                    })
                                  }
                                >
                                  -
                                </button>
                                <strong>{draft.tierCounts?.[tier] || 0}</strong>
                                <button
                                  className="commerce-ghost-btn"
                                  onClick={() =>
                                    updateDraft(stock, {
                                      tierCounts: {
                                        ...(draft.tierCounts || {}),
                                        [tier]: Number(draft.tierCounts?.[tier] || 0) + 1,
                                      },
                                    })
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="commerce-action-row" style={{ marginTop: "0.75rem" }}>
                          <button className="commerce-primary-btn" disabled={busyStockId === stock.id} onClick={() => addTiered(stock)}>
                            {busyStockId === stock.id ? "Adding..." : "Add selected sizes"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </CommerceShell>
  );
}
