import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import { commerceFetch } from "./commerceApi";


const STORAGE_KEY = "aquaai.featured.lastAddress";


function loadCachedAddress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}


export default function BasketCheckoutPage() {
  const { token } = useContext(AuthContext);
  const [basket, setBasket] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("collect");
  const [saveAddressPreference, setSaveAddressPreference] = useState(true);
  const [address, setAddress] = useState(() => loadCachedAddress());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commerceFetch("/marketplace/basket/", token);
      setBasket(data.basket);
      if (data.basket?.address_snapshot && Object.keys(data.basket.address_snapshot).length > 0) {
        setAddress((current) => ({ ...current, ...data.basket.address_snapshot }));
      }
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

  useEffect(() => {
    if (saveAddressPreference) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
    }
  }, [address, saveAddressPreference]);

  const canCheckout = useMemo(() => Boolean(basket?.item_count), [basket]);

  const submitCheckout = async () => {
    try {
      setBusy(true);
      const data = await commerceFetch("/marketplace/checkout/", token, {
        method: "POST",
        body: JSON.stringify({
          delivery_method: deliveryMethod,
          address,
          save_address_preference: saveAddressPreference,
        }),
      });
      setReservation(data.reservation);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const completeCheckout = async () => {
    try {
      setBusy(true);
      const data = await commerceFetch("/marketplace/checkout/complete/", token, {
        method: "POST",
        body: JSON.stringify({ reservation_id: reservation.id }),
      });
      setReservation(data.reservation);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CommerceShell
      title="Breeder Checkout"
      subtitle="One canonical checkout handles both entry paths: direct breeder browse and marketplace handoff."
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading basket...</div>}
      {!loading && (
        <div className="commerce-grid">
          <section className="commerce-card commerce-card--wide">
            <h2>Basket summary</h2>
            {!basket && <div className="commerce-empty">No active basket yet.</div>}
            {basket && (
              <>
                <p className="commerce-muted">Breeder: {basket.breeder?.name || basket.breeder?.username}</p>
                <div className="commerce-list">
                  {(basket.items || []).map((item) => (
                    <div className="commerce-list-item" key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <p className="commerce-muted">
                          {item.species_name} · Qty {item.quantity}
                          {item.size_tier ? ` · ${item.size_tier}` : ""}
                        </p>
                      </div>
                      <strong>£{item.line_total}</strong>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: "1rem" }}><strong>Subtotal £{basket.subtotal}</strong></p>
              </>
            )}
          </section>

          <section className="commerce-card commerce-card--side">
            <h2>Delivery setup</h2>
            <div className="commerce-form-grid">
              <label className="commerce-label">
                Fulfilment method
                <select className="commerce-select" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                  <option value="collect">Collection</option>
                  <option value="delivery">Delivery</option>
                </select>
              </label>
              <label className="commerce-label">
                Address
                <input className="commerce-input" value={address.address || ""} onChange={(e) => setAddress((current) => ({ ...current, address: e.target.value }))} />
              </label>
              <label className="commerce-label">
                City
                <input className="commerce-input" value={address.city || ""} onChange={(e) => setAddress((current) => ({ ...current, city: e.target.value }))} />
              </label>
              <label className="commerce-label">
                County / State
                <input className="commerce-input" value={address.state || ""} onChange={(e) => setAddress((current) => ({ ...current, state: e.target.value }))} />
              </label>
              <label className="commerce-label">
                Postcode
                <input className="commerce-input" value={address.postal_code || ""} onChange={(e) => setAddress((current) => ({ ...current, postal_code: e.target.value }))} />
              </label>
              <label className="commerce-label">
                Country
                <input className="commerce-input" value={address.country || ""} onChange={(e) => setAddress((current) => ({ ...current, country: e.target.value }))} />
              </label>
            </div>
            <label className="commerce-label" style={{ marginTop: "0.75rem" }}>
              <input
                type="checkbox"
                checked={saveAddressPreference}
                onChange={(e) => setSaveAddressPreference(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              Save this as my last-used checkout address
            </label>
            <div className="commerce-action-row" style={{ marginTop: "1rem" }}>
              <button className="commerce-primary-btn" disabled={!canCheckout || busy} onClick={submitCheckout}>
                {busy ? "Creating..." : "Go to checkout"}
              </button>
            </div>
          </section>

          {reservation && (
            <section className="commerce-card">
              <h2>Checkout created</h2>
              <p className="commerce-muted">
                Reservation {reservation.reservation_code} · {reservation.status}
              </p>
              <p><strong>Total £{reservation.total_amount}</strong></p>
              <div className="commerce-action-row">
                {reservation.payment_session_url && (
                  <a className="commerce-ghost-btn" href={reservation.payment_session_url} target="_blank" rel="noreferrer">
                    Open Stripe checkout
                  </a>
                )}
                <button className="commerce-primary-btn" disabled={busy} onClick={completeCheckout}>
                  {busy ? "Saving..." : "Complete checkout"}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </CommerceShell>
  );
}
