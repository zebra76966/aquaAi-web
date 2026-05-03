import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import { commerceFetch } from "./commerceApi";


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
  const [deliveryMethod, setDeliveryMethod] = useState("collect");
  const [buyerNote, setBuyerNote] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [createdReservation, setCreatedReservation] = useState(null);

  const highlightedListing = useMemo(
    () => page?.species?.find((item) => Number(item.id) === Number(activeListingId)) || null,
    [activeListingId, page],
  );

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

  const reserveListing = async (targetId) => {
    try {
      setBusyId(targetId);
      const data = await commerceFetch(`/marketplace/listings/${targetId}/reserve/`, token, {
        method: "POST",
        body: JSON.stringify({
          delivery_method: deliveryMethod,
          quantity: 1,
          buyer_note: buyerNote,
        }),
      });
      setCreatedReservation(data.reservation);
      setBuyerNote("");
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
      subtitle="This is now the primary transaction surface for breeder stock. Buyers choose collection or a structured delivery quote directly from the breeder catalogue."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {createdReservation && (
        <div className="commerce-alert">
          Reservation {createdReservation.reservation_code} created with status <strong>{createdReservation.status}</strong>.
          {createdReservation.payment_session_url ? " Continue into the Stripe sheet from My Reservations." : " The breeder now needs to answer with a delivery quote."}
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
                <span className="commerce-tag">Reserve for collection or quote-based delivery</span>
              </div>
            </div>
            <div className="commerce-list">
              {page.species?.map((item) => (
                <article className="commerce-list-item" key={item.id}>
                  <header>
                    <div>
                      <h3>{item.title}</h3>
                      <p className="commerce-muted">
                        {item.species_name} · £{item.base_price} · {item.listed_quantity} in stock
                      </p>
                    </div>
                    <div className="commerce-action-row">
                      <span className="commerce-status">{item.status}</span>
                      <button className="commerce-ghost-btn" onClick={() => setActiveListingId(item.id)}>
                        Reserve
                      </button>
                    </div>
                  </header>
                  {Number(activeListingId) === Number(item.id) && (
                    <div className="commerce-inline-form">
                      <div className="commerce-form-grid">
                        <label className="commerce-label">
                          Delivery option
                          <select className="commerce-select" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                            {item.supports_collection && <option value="collect">Collect</option>}
                            {item.supports_delivery_quote && <option value="delivery_quote">Request Delivery Quote</option>}
                          </select>
                        </label>
                        <label className="commerce-label">
                          Buyer note
                          <textarea
                            className="commerce-textarea"
                            placeholder="Preferred pickup slot, habitat notes, or delivery constraints"
                            value={buyerNote}
                            onChange={(e) => setBuyerNote(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="commerce-action-row" style={{ marginTop: "0.8rem" }}>
                        <button className="commerce-primary-btn" disabled={busyId === item.id} onClick={() => reserveListing(item.id)}>
                          {busyId === item.id ? "Creating..." : deliveryMethod === "collect" ? "Reserve for Collection" : "Request Delivery Quote"}
                        </button>
                        <button className="commerce-ghost-btn" onClick={() => setActiveListingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
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
