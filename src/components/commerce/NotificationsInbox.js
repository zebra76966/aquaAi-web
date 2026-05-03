import React, { useCallback, useContext, useEffect, useState } from "react";

import { AuthContext } from "../auth/authcontext";
import CommerceShell from "./CommerceShell";
import { commerceFetch } from "./commerceApi";


export default function NotificationsInbox() {
  const { token } = useContext(AuthContext);
  const [inbox, setInbox] = useState({ items: [], unread_count: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commerceFetch("/notifications/", token);
      setInbox(data);
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

  const markRead = async (id) => {
    try {
      await commerceFetch(`/notifications/${id}/read/`, token, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await commerceFetch("/notifications/mark-all-read/", token, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <CommerceShell
      title="In-App Notifications Inbox"
      subtitle="Reservation events surface here even before native APNS / FCM wiring lands, so quote updates, dispatch notices, disputes, and payment milestones are still visible to the user."
      actions={<button className="commerce-primary-btn" onClick={markAllRead}>Mark all read</button>}
    >
      {error && <div className="commerce-alert error">{error}</div>}
      {loading && <div className="commerce-empty">Loading notification feed...</div>}
      {!loading && (
        <div className="commerce-list">
          {inbox.items?.length === 0 && <div className="commerce-empty">No notifications yet.</div>}
          {inbox.items?.map((item) => (
            <article className="commerce-card" key={item.id}>
              <header className="commerce-section-title">
                <div>
                  <div className={`commerce-status ${item.is_read ? "" : "pending"}`}>
                    {item.severity} · {item.is_read ? "read" : "unread"}
                  </div>
                  <h2>{item.title}</h2>
                </div>
                {!item.is_read && (
                  <button className="commerce-ghost-btn" onClick={() => markRead(item.id)}>
                    Mark read
                  </button>
                )}
              </header>
              <p>{item.message}</p>
              <p className="commerce-muted">{new Date(item.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </CommerceShell>
  );
}
