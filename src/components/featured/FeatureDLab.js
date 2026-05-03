import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../auth/authcontext";
import { baseUrl } from "../auth/config";
import "./FeatureDLab.css";


const sectionFetch = async (url, token, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || json?.detail || "Request failed");
  }
  return json?.data ?? json;
};


export default function FeatureDLab() {
  const { token, activeTankId, userProfile } = useContext(AuthContext);
  const queryTankId = new URLSearchParams(window.location.search).get("tank_id");
  const selectedTankId = activeTankId || queryTankId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compatibleListings, setCompatibleListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [responderProfile, setResponderProfile] = useState(null);
  const [registryRecords, setRegistryRecords] = useState([]);

  const [cycleForm, setCycleForm] = useState({ cycle_name: "", status: "planned", estimated_cost: "" });
  const [emergencyForm, setEmergencyForm] = useState({
    title: "",
    emergency_type: "pump_failure",
    severity: "high",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [registryForm, setRegistryForm] = useState({
    specimen_label: "",
    generation_number: 1,
    colour_morph: "",
    genetic_traits: "",
    lineage_notes: "",
  });
  const [responderForm, setResponderForm] = useState({
    display_name: "",
    responder_type: "hobbyist",
    can_receive_alerts: false,
    latitude: "",
    longitude: "",
    service_radius_km: 50,
    specialties: "",
  });
  const [busyAction, setBusyAction] = useState("");

  const userLabel = useMemo(
    () => userProfile?.name || userProfile?.username || "AquaAI member",
    [userProfile],
  );

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const requests = await Promise.allSettled([
        selectedTankId
          ? sectionFetch(`${baseUrl}/featured/marketplace/compatible-listings/?tank_id=${selectedTankId}`, token)
          : Promise.resolve({ results: [] }),
        sectionFetch(`${baseUrl}/featured/marketplace/purchases/`, token),
        sectionFetch(`${baseUrl}/featured/breeder/analytics/`, token),
        sectionFetch(`${baseUrl}/featured/breeder/cycles/`, token),
        sectionFetch(`${baseUrl}/featured/emergency/requests/`, token),
        sectionFetch(`${baseUrl}/featured/emergency/responders/me/`, token),
        sectionFetch(`${baseUrl}/featured/genetics/registry/`, token),
      ]);

      if (requests[0].status === "fulfilled") setCompatibleListings(requests[0].value?.results || []);
      if (requests[1].status === "fulfilled") setPurchases(requests[1].value?.purchases || []);
      if (requests[2].status === "fulfilled") setAnalytics(requests[2].value || null);
      if (requests[3].status === "fulfilled") setCycles(requests[3].value?.cycles || []);
      if (requests[4].status === "fulfilled") setEmergencyRequests(requests[4].value?.requests || []);
      if (requests[5].status === "fulfilled") {
        const profile = requests[5].value || {};
        setResponderProfile(profile);
        setResponderForm({
          display_name: profile.display_name || "",
          responder_type: profile.responder_type || "hobbyist",
          can_receive_alerts: Boolean(profile.can_receive_alerts),
          latitude: profile.latitude ?? "",
          longitude: profile.longitude ?? "",
          service_radius_km: profile.service_radius_km || 50,
          specialties: Array.isArray(profile.specialties) ? profile.specialties.join(", ") : "",
        });
      }
      if (requests[6].status === "fulfilled") setRegistryRecords(requests[6].value?.records || []);

      const firstFailure = requests.find((result) => result.status === "rejected");
      if (firstFailure) {
        setError(firstFailure.reason?.message || "Some Feature D sections could not be loaded.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTankId, queryTankId]);

  const postJson = async (url, body) => {
    return sectionFetch(url, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  const putJson = async (url, body) => {
    return sectionFetch(url, token, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  };

  const handleQuarantineAction = async (purchaseId, action) => {
    setBusyAction(`quarantine-${purchaseId}-${action}`);
    try {
      await postJson(`${baseUrl}/featured/marketplace/purchases/${purchaseId}/quarantine/`, { action });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction("");
    }
  };

  const handleCycleSubmit = async (event) => {
    event.preventDefault();
    setBusyAction("cycle");
    try {
      await postJson(`${baseUrl}/featured/breeder/cycles/`, cycleForm);
      setCycleForm({ cycle_name: "", status: "planned", estimated_cost: "" });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction("");
    }
  };

  const handleEmergencySubmit = async (event) => {
    event.preventDefault();
    setBusyAction("emergency");
    try {
      await postJson(`${baseUrl}/featured/emergency/requests/`, emergencyForm);
      setEmergencyForm({
        title: "",
        emergency_type: "pump_failure",
        severity: "high",
        description: "",
        latitude: emergencyForm.latitude,
        longitude: emergencyForm.longitude,
      });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction("");
    }
  };

  const handleResponderSave = async (event) => {
    event.preventDefault();
    setBusyAction("responder");
    try {
      await putJson(`${baseUrl}/featured/emergency/responders/me/`, {
        ...responderForm,
        specialties: responderForm.specialties
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction("");
    }
  };

  const handleRegistrySubmit = async (event) => {
    event.preventDefault();
    setBusyAction("registry");
    try {
      await postJson(`${baseUrl}/featured/genetics/registry/`, {
        ...registryForm,
        genetic_traits: registryForm.genetic_traits
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setRegistryForm({
        specimen_label: "",
        generation_number: 1,
        colour_morph: "",
        genetic_traits: "",
        lineage_notes: "",
      });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction("");
    }
  };

  if (!token) {
    return <div className="fd-shell"><div className="fd-empty">Log in to use the Feature D intelligence workspace.</div></div>;
  }

  return (
    <div className="fd-shell">
      <section className="fd-hero">
        <div>
          <p className="fd-kicker">Feature D Intelligence Lab</p>
          <h1>Operational intelligence for livestock safety, breeder growth, and emergency response</h1>
          <p className="fd-lead">
            {userLabel} can use this workspace to test quarantine automation, live compatibility scoring, breeder analytics,
            emergency dispatch, and cryptographically signed lineage records from one screen.
          </p>
        </div>
        <div className="fd-hero-grid">
          <div className="fd-stat-card">
            <span>Active Tank</span>
            <strong>{selectedTankId || "Not selected"}</strong>
          </div>
          <div className="fd-stat-card">
            <span>Compatible Listings</span>
            <strong>{compatibleListings.length}</strong>
          </div>
          <div className="fd-stat-card">
            <span>Quarantine Protocols</span>
            <strong>{purchases.length}</strong>
          </div>
          <div className="fd-stat-card">
            <span>Registry Records</span>
            <strong>{registryRecords.length}</strong>
          </div>
        </div>
      </section>

      {error && <div className="fd-alert">{error}</div>}
      {loading && <div className="fd-loading">Loading Feature D workspace…</div>}

      <div className="fd-grid">
        <section className="fd-panel">
          <div className="fd-panel-head">
            <h2>Automated Quarantine Protocols</h2>
            <p>Buyer-facing protocols generated when a livestock purchase is marked sold.</p>
          </div>
          <div className="fd-list">
            {purchases.length === 0 && <div className="fd-empty">No accepted livestock purchases yet.</div>}
            {purchases.map((purchase) => (
              <article key={purchase.purchase_id} className="fd-card">
                <div className="fd-card-top">
                  <div>
                    <h3>{purchase.species_name || purchase.listing_title}</h3>
                    <p>{purchase.seller} • £{purchase.sold_price}</p>
                  </div>
                  <span className={`fd-pill fd-pill-${purchase.quarantine_protocol?.risk_level || "neutral"}`}>
                    {purchase.quarantine_status}
                  </span>
                </div>
                <p>{purchase.quarantine_protocol?.summary}</p>
                <ul>
                  {(purchase.quarantine_protocol?.instructions || []).slice(0, 3).map((step) => <li key={step}>{step}</li>)}
                </ul>
                <div className="fd-actions">
                  <button onClick={() => handleQuarantineAction(purchase.purchase_id, "acknowledge")} disabled={busyAction.startsWith(`quarantine-${purchase.purchase_id}`)}>Acknowledge</button>
                  <button onClick={() => handleQuarantineAction(purchase.purchase_id, "complete")} disabled={busyAction.startsWith(`quarantine-${purchase.purchase_id}`)}>Complete</button>
                  <button className="ghost" onClick={() => handleQuarantineAction(purchase.purchase_id, "skip")} disabled={busyAction.startsWith(`quarantine-${purchase.purchase_id}`)}>Skip</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fd-panel">
          <div className="fd-panel-head">
            <h2>Dynamic Species Compatibility</h2>
            <p>Ranks live marketplace listings against the selected habitat.</p>
          </div>
          {!selectedTankId && <div className="fd-empty">Activate a tank first or pass a tank_id query parameter to load compatibility-ranked listings.</div>}
          <div className="fd-list">
            {compatibleListings.map((listing) => (
              <article key={listing.listing_id} className="fd-card">
                <div className="fd-card-top">
                  <div>
                    <h3>{listing.species_name}</h3>
                    <p>{listing.title} • {listing.seller}</p>
                  </div>
                  <span className={`fd-score fd-score-${listing.compatibility_level}`}>{Math.round(listing.compatibility_score * 100)}%</span>
                </div>
                <p>{listing.supplier_note}</p>
                <div className="fd-chip-row">
                  <span className="fd-chip">{listing.compatibility_level}</span>
                  <span className="fd-chip">{listing.readiness}</span>
                  <span className="fd-chip">£{listing.base_price}</span>
                </div>
                <ul>
                  {(listing.recommended_actions || []).slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="fd-panel">
          <div className="fd-panel-head">
            <h2>Breeder Analytics Suite</h2>
            <p>Commercial insight across demand, sell-through, pricing, and breeding cycle performance.</p>
          </div>
          <div className="fd-metric-strip">
            <div><span>Revenue</span><strong>£{analytics?.summary?.total_revenue ?? 0}</strong></div>
            <div><span>Sold</span><strong>{analytics?.summary?.sold_count ?? 0}</strong></div>
            <div><span>Sell-through</span><strong>{Math.round((analytics?.intelligence?.sell_through_rate ?? 0) * 100)}%</strong></div>
            <div><span>Demand</span><strong>{analytics?.intelligence?.demand_forecast || "n/a"}</strong></div>
          </div>
          <div className="fd-analytics-note">
            <strong>Pricing signal:</strong> {analytics?.intelligence?.pricing_recommendation || "No pricing recommendation yet."}
          </div>
          <form className="fd-form" onSubmit={handleCycleSubmit}>
            <h3>Create breeding cycle</h3>
            <input placeholder="Cycle name" value={cycleForm.cycle_name} onChange={(e) => setCycleForm({ ...cycleForm, cycle_name: e.target.value })} />
            <div className="fd-form-grid">
              <select value={cycleForm.status} onChange={(e) => setCycleForm({ ...cycleForm, status: e.target.value })}>
                <option value="planned">Planned</option>
                <option value="conditioning">Conditioning</option>
                <option value="spawning">Spawning</option>
                <option value="hatching">Hatching</option>
                <option value="growout">Growout</option>
              </select>
              <input placeholder="Estimated cost" value={cycleForm.estimated_cost} onChange={(e) => setCycleForm({ ...cycleForm, estimated_cost: e.target.value })} />
            </div>
            <button type="submit" disabled={busyAction === "cycle"}>{busyAction === "cycle" ? "Saving…" : "Save cycle"}</button>
          </form>
          <div className="fd-mini-list">
            {cycles.map((cycle) => (
              <div key={cycle.id} className="fd-mini-item">
                <strong>{cycle.cycle_name}</strong>
                <span>{cycle.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="fd-panel">
          <div className="fd-panel-head">
            <h2>Emergency Response Network</h2>
            <p>Opt responders in, then dispatch habitat failures with immediate actions and nearby matches.</p>
            {responderProfile && (
              <p className="fd-inline-note">
                Alerts {responderProfile.can_receive_alerts ? "enabled" : "disabled"} for {responderProfile.responder_type || "hobbyist"} response.
              </p>
            )}
          </div>
          <form className="fd-form" onSubmit={handleResponderSave}>
            <h3>Responder profile</h3>
            <input placeholder="Display name" value={responderForm.display_name} onChange={(e) => setResponderForm({ ...responderForm, display_name: e.target.value })} />
            <div className="fd-form-grid">
              <select value={responderForm.responder_type} onChange={(e) => setResponderForm({ ...responderForm, responder_type: e.target.value })}>
                <option value="hobbyist">Experienced hobbyist</option>
                <option value="breeder">Breeder</option>
                <option value="consultant">Consultant</option>
                <option value="vendor">Vendor</option>
              </select>
              <input placeholder="Specialties (comma separated)" value={responderForm.specialties} onChange={(e) => setResponderForm({ ...responderForm, specialties: e.target.value })} />
            </div>
            <div className="fd-form-grid">
              <input placeholder="Latitude" value={responderForm.latitude} onChange={(e) => setResponderForm({ ...responderForm, latitude: e.target.value })} />
              <input placeholder="Longitude" value={responderForm.longitude} onChange={(e) => setResponderForm({ ...responderForm, longitude: e.target.value })} />
            </div>
            <label className="fd-checkbox">
              <input type="checkbox" checked={responderForm.can_receive_alerts} onChange={(e) => setResponderForm({ ...responderForm, can_receive_alerts: e.target.checked })} />
              Receive emergency alerts
            </label>
            <button type="submit" disabled={busyAction === "responder"}>{busyAction === "responder" ? "Saving…" : "Save responder profile"}</button>
          </form>

          <form className="fd-form" onSubmit={handleEmergencySubmit}>
            <h3>Request emergency help</h3>
            <input placeholder="Emergency title" value={emergencyForm.title} onChange={(e) => setEmergencyForm({ ...emergencyForm, title: e.target.value })} />
            <div className="fd-form-grid">
              <select value={emergencyForm.emergency_type} onChange={(e) => setEmergencyForm({ ...emergencyForm, emergency_type: e.target.value })}>
                <option value="pump_failure">Pump failure</option>
                <option value="heater_failure">Heater failure</option>
                <option value="oxygen_drop">Oxygen drop</option>
              </select>
              <select value={emergencyForm.severity} onChange={(e) => setEmergencyForm({ ...emergencyForm, severity: e.target.value })}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <textarea placeholder="What happened?" value={emergencyForm.description} onChange={(e) => setEmergencyForm({ ...emergencyForm, description: e.target.value })} />
            <button type="submit" disabled={busyAction === "emergency"}>{busyAction === "emergency" ? "Dispatching…" : "Dispatch emergency request"}</button>
          </form>

          <div className="fd-mini-list">
            {emergencyRequests.map((request) => (
              <div key={request.id} className="fd-mini-item">
                <strong>{request.title}</strong>
                <span>{request.matched_responders?.length || 0} responders matched</span>
              </div>
            ))}
          </div>
        </section>

        <section className="fd-panel fd-panel-wide">
          <div className="fd-panel-head">
            <h2>Genetic Registry & Lineage Tracking</h2>
            <p>Cryptographically signed provenance records that can be attached to breeder stock over time.</p>
          </div>
          <form className="fd-form" onSubmit={handleRegistrySubmit}>
            <div className="fd-form-grid">
              <input placeholder="Specimen label" value={registryForm.specimen_label} onChange={(e) => setRegistryForm({ ...registryForm, specimen_label: e.target.value })} />
              <input placeholder="Colour morph" value={registryForm.colour_morph} onChange={(e) => setRegistryForm({ ...registryForm, colour_morph: e.target.value })} />
            </div>
            <div className="fd-form-grid">
              <input placeholder="Generation number" value={registryForm.generation_number} onChange={(e) => setRegistryForm({ ...registryForm, generation_number: e.target.value })} />
              <input placeholder="Traits (comma separated)" value={registryForm.genetic_traits} onChange={(e) => setRegistryForm({ ...registryForm, genetic_traits: e.target.value })} />
            </div>
            <textarea placeholder="Lineage notes" value={registryForm.lineage_notes} onChange={(e) => setRegistryForm({ ...registryForm, lineage_notes: e.target.value })} />
            <button type="submit" disabled={busyAction === "registry"}>{busyAction === "registry" ? "Signing…" : "Create signed lineage record"}</button>
          </form>
          <div className="fd-registry-grid">
            {registryRecords.map((record) => (
              <article key={record.record_id} className="fd-registry-card">
                <h3>{record.specimen_label}</h3>
                <p>{record.species_name || "Species not linked yet"}</p>
                <code>{record.signature}</code>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
