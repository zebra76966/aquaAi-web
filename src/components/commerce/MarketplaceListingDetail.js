import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import { commerceFetch } from "./commerceApi";


export default function MarketplaceListingDetail() {
  const { token } = useContext(AuthContext);
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await commerceFetch(`/marketplace/listings/${listingId}/`, token);
        if (active) {
          setListing(data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (token) {
      load();
    }
    return () => {
      active = false;
    };
  }, [listingId, token]);

  const goToBreeder = () => {
    if (!listing?.seller_user_id) return;
    navigate(`/marketplace/breeders/${listing.seller_user_id}/species`);
  };

  const addDirectToBasket = async () => {
    if (!listing?.breeder_stock_id) {
      goToBreeder();
      return;
    }
    try {
      await commerceFetch("/marketplace/basket/items/", token, {
        method: "POST",
        body: JSON.stringify({
          breeder_stock_id: listing.breeder_stock_id,
          quantity: 1,
        }),
      });
      navigate("/marketplace/checkout");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <CommerceShell
      title="Marketplace Listing Detail"
      subtitle="Breeder-origin marketplace cards now feed the same breeder-section basket and checkout flow instead of launching a separate quote path."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading listing...</div>}
      {!loading && listing && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--wide">
            <h2>{listing.title}</h2>
            <p className="commerce-muted">{listing.description}</p>
            <div className="commerce-stat-row">
              <div className="commerce-stat">
                <strong>{listing.species_name}</strong>
                <span className="commerce-muted">Species</span>
              </div>
              <div className="commerce-stat">
                <strong>{listing.display_price === "Quote on request" ? listing.display_price : `£${listing.display_price}`}</strong>
                <span className="commerce-muted">Price</span>
              </div>
              <div className="commerce-stat">
                <strong>{listing.listed_quantity}</strong>
                <span className="commerce-muted">Stock</span>
              </div>
            </div>
            <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
              <button className="commerce-primary-btn" onClick={addDirectToBasket}>
                Add to basket
              </button>
              <button className="commerce-ghost-btn" onClick={goToBreeder}>
                Reserve via breeder profile
              </button>
            </div>
          </section>
        </div>
      )}
    </CommerceShell>
  );
}
