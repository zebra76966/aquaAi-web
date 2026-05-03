import React, { useCallback, useEffect, useState } from "react";

import { baseUrl } from "../auth/config";
import "./CommerceHub.css";


async function adminFetch(path, token, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Admin request failed");
  }
  return payload?.data ?? payload;
}


export default function AdminReservationOps({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetch("/marketplace/admin/reservations/dashboard/", token);
      setDashboard(data);
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

  const reviewVerification = async (verificationId, decision) => {
    try {
      await adminFetch(`/marketplace/admin/verifications/${verificationId}/review/`, token, {
        method: "POST",
        body: JSON.stringify({
          decision,
          rejection_reason: decision === "approve" ? "" : "Please resubmit a clearer or current licence copy.",
        }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const resolveDispute = async (disputeId, resolution) => {
    try {
      await adminFetch(`/marketplace/admin/disputes/${disputeId}/resolve/`, token, {
        method: "POST",
        body: JSON.stringify({
          resolution,
          summary: resolution === "refund_buyer" ? "Refund issued after dispute review." : "Released to breeder after evidence review.",
        }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDelivery = async (sellerId, enabled) => {
    try {
      await adminFetch(`/marketplace/admin/breeders/${sellerId}/delivery-toggle/`, token, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="commerce-empty">Loading breeder commerce dashboard...</div>;
  }

  return (
    <div className="commerce-stack">
      {error && <div className="commerce-alert error">{error}</div>}

      <section className="commerce-card">
        <div className="commerce-stat-row">
          <div className="commerce-stat">
            <strong>{dashboard?.active_reservations ?? 0}</strong>
            <span className="commerce-muted">Active reservations</span>
          </div>
          <div className="commerce-stat">
            <strong>{dashboard?.completed_reservations ?? 0}</strong>
            <span className="commerce-muted">Completed reservations</span>
          </div>
          <div className="commerce-stat">
            <strong>{dashboard?.dispute_open_count ?? 0}</strong>
            <span className="commerce-muted">Open disputes</span>
          </div>
        </div>
      </section>

      <section className="commerce-card">
        <h3>Licence Verification Queue</h3>
        <div className="commerce-list">
          {dashboard?.pending_verifications?.length === 0 && <div className="commerce-empty">No pending verifications.</div>}
          {dashboard?.pending_verifications?.map((item) => (
            <div className="commerce-list-item" key={item.id}>
              <header>
                <div>
                  <strong>{item.licence_number || "Pending licence"}</strong>
                  <p className="commerce-muted">{item.issuing_authority || "No authority supplied yet"}</p>
                </div>
                <div className="commerce-pill-row">
                  <button className="commerce-primary-btn" onClick={() => reviewVerification(item.id, "approve")}>Approve</button>
                  <button className="commerce-danger-btn" onClick={() => reviewVerification(item.id, "reject")}>Reject</button>
                </div>
              </header>
            </div>
          ))}
        </div>
      </section>

      <section className="commerce-card">
        <h3>Reservation Dispute Queue</h3>
        <div className="commerce-list">
          {dashboard?.disputes?.length === 0 && <div className="commerce-empty">No disputes right now.</div>}
          {dashboard?.disputes?.map((item) => (
            <div className="commerce-list-item" key={item.id}>
              <header>
                <div>
                  <strong>{item.reservation_code}</strong>
                  <p className="commerce-muted">{item.reason} · buyer {item.buyer_username} · breeder {item.seller_username}</p>
                </div>
                <span className={`commerce-status ${item.status === "open" ? "warning" : ""}`}>{item.status}</span>
              </header>
              <p>{item.description}</p>
              {item.breeder_response && <p><strong>Breeder response:</strong> {item.breeder_response}</p>}
              <div className="commerce-action-row">
                <button className="commerce-danger-btn" onClick={() => resolveDispute(item.id, "refund_buyer")}>Refund buyer</button>
                <button className="commerce-ghost-btn" onClick={() => resolveDispute(item.id, "release_to_breeder")}>Release to breeder</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="commerce-card">
        <h3>Stripe Connect Account Monitor</h3>
        <div className="commerce-list">
          {dashboard?.connect_monitor?.map((item) => (
            <div className="commerce-list-item" key={item.seller_id}>
              <header>
                <div>
                  <strong>{item.seller_username}</strong>
                  <p className="commerce-muted">Connect {item.stripe_connect_status} · payouts {item.payouts_enabled ? "enabled" : "disabled"}</p>
                </div>
                <div className="commerce-pill-row">
                  <span className={`commerce-status ${item.delivery_sales_enabled ? "" : "pending"}`}>
                    Delivery {item.delivery_sales_enabled ? "enabled" : "locked"}
                  </span>
                  <button className="commerce-ghost-btn" onClick={() => toggleDelivery(item.seller_id, !item.delivery_sales_enabled)}>
                    {item.delivery_sales_enabled ? "Lock delivery" : "Unlock delivery"}
                  </button>
                </div>
              </header>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
