import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import FeatureDBadgeRow from "./FeatureDBadgeRow";
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
    if (token) load();
    return () => {
      active = false;
    };
  }, [listingId, token]);

  return (
    <CommerceShell
      title="Marketplace Listing Detail"
      subtitle="Breeder-origin listings now route into the reservation flow so buyers complete collection or delivery inside a single audited path."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading listing...</div>}
      {!loading && listing && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--wide">
            <div className="commerce-section-title">
              <div>
                <div className={`commerce-status ${listing.status === "active" ? "" : "warning"}`}>{listing.status}</div>
                <h2>{listing.title}</h2>
              </div>
              {listing.is_breeder_listing && <div className="commerce-tag">Breeder transaction surface</div>}
            </div>
            <p className="commerce-muted">{listing.description}</p>
            <div className="commerce-stat-row">
              <div className="commerce-stat">
                <strong>{listing.species_name}</strong>
                <span className="commerce-muted">Species</span>
              </div>
              <div className="commerce-stat">
                <strong>£{listing.base_price}</strong>
                <span className="commerce-muted">Unit price</span>
              </div>
              <div className="commerce-stat">
                <strong>{listing.listed_quantity}</strong>
                <span className="commerce-muted">Stock available</span>
              </div>
              <div className="commerce-stat">
                <strong>{listing.shipping_days_estimate} day(s)</strong>
                <span className="commerce-muted">Typical dispatch estimate</span>
              </div>
            </div>
            <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
              {listing.is_breeder_listing ? (
                <button
                  className="commerce-primary-btn"
                  onClick={() => navigate(`/marketplace/breeders/${listing.seller_user_id}/species?listing_id=${listing.id}`)}
                >
                  {listing.buy_button_label}
                </button>
              ) : (
                <button className="commerce-primary-btn" disabled>
                  Buy
                </button>
              )}
              {listing.buy_route && (
                <Link className="commerce-link" to={listing.buy_route}>
                  Preview breeder species page
                </Link>
              )}
            </div>
          </section>

          <aside className="commerce-card commerce-card--side">
            <h3>{listing.breeder_name}</h3>
            <p className="commerce-muted">Primary seller and breeder transaction owner.</p>
            <div className="commerce-pill-row">
              <span className="commerce-tag">Rating {listing.seller_profile?.rating ?? 0}</span>
              <span className={`commerce-status ${listing.delivery_verification_status === "approved" ? "" : "pending"}`}>
                Delivery {listing.delivery_verification_status}
              </span>
            </div>
            <div className="commerce-stack" style={{ marginTop: "1rem" }}>
              <div>
                <strong>{listing.seller_profile?.reviews_count ?? 0}</strong>
                <div className="commerce-muted">reviews</div>
              </div>
              <div>
                <strong>{listing.supports_collection ? "Yes" : "No"}</strong>
                <div className="commerce-muted">Collection available</div>
              </div>
              <div>
                <strong>{listing.supports_delivery_quote ? "Yes" : "No"}</strong>
                <div className="commerce-muted">Delivery quote available</div>
              </div>
            </div>
            <div className="commerce-inline-form">
              <h4>Feature D badges</h4>
              <FeatureDBadgeRow
                badges={listing.seller_profile?.feature_d_badges || []}
                emptyLabel="This breeder has not unlocked any Feature D commerce badges yet."
              />
            </div>
          </aside>
        </div>
      )}
    </CommerceShell>
  );
}
