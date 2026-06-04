import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiCalendar, FiSun, FiMoon, FiX, FiCheck, FiAlertCircle, FiEdit2 } from "react-icons/fi";
import { baseUrl } from "../auth/config";

const ALL_DAYS     = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS     = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const h = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

const timeOptions = [];
for (let hour = 6; hour <= 22; hour++) {
  for (const min of ["00", "15", "30", "45"]) {
    timeOptions.push(`${String(hour).padStart(2, "0")}:${min}`);
  }
}

function TimeSelect({ value, onChange, disabled }) {
  return (
    <select className="bd-select" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="bd-modal-overlay" onClick={onClose}>
      <motion.div className="bd-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}>
        <div className="bd-modal-head"><h3>{title}</h3><button className="bd-modal-close" onClick={onClose}><FiX /></button></div>
        {children}
      </motion.div>
    </div>
  );
}

export default function ScheduleTab({ token }) {
  const [hours,   setHours]   = useState({});   // { Mon: {open,close}|null, ... }
  const [weekend, setWeekend] = useState({});   // { saturday: {open,close}|null, sunday:... }
  const [holiday, setHoliday] = useState({});   // { holiday_mode_enabled, on_holiday_until, holiday_message }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Edit hours modal
  const [editModal, setEditModal] = useState(false);
  const [editDay,   setEditDay]   = useState("");
  const [editOpen,  setEditOpen]  = useState("09:00");
  const [editClose, setEditClose] = useState("17:00");
  const [editClosed, setEditClosed] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  // Weekend modal
  const [weekModal, setWeekModal] = useState(false);
  const [satClosed, setSatClosed] = useState(false);
  const [satOpen,   setSatOpen]   = useState("10:00");
  const [satClose,  setSatClose]  = useState("14:00");
  const [sunClosed, setSunClosed] = useState(true);
  const [sunOpen,   setSunOpen]   = useState("10:00");
  const [sunClose,  setSunClose]  = useState("14:00");
  const [savingWk, setSavingWk]   = useState(false);

  // Holiday modal
  const [holModal, setHolModal] = useState(false);
  const [holDate,  setHolDate]  = useState("");
  const [holMsg,   setHolMsg]   = useState("");
  const [holEnabled, setHolEnabled] = useState(false);
  const [savingHol, setSavingHol]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [hRes, wRes, holRes] = await Promise.all([
        fetch(`${baseUrl}/marketplace/breeder/opening-hours/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/marketplace/breeder/weekend/`,       { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/marketplace/breeder/holiday/`,       { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [hJson, wJson, holJson] = await Promise.all([hRes.json(), wRes.json(), holRes.json()]);
      setHours(hJson?.data?.opening_hours ?? hJson?.data ?? {});
      setWeekend(wJson?.data ?? {});
      setHoliday(holJson?.data ?? {});
    } catch { setError("Could not load schedule."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openEditDay = (day) => {
    const entry = hours[day];
    setEditDay(day);
    setEditClosed(entry === null);
    setEditOpen(entry?.open ?? "09:00");
    setEditClose(entry?.close ?? "17:00");
    setEditModal(true);
  };

  const saveHours = async () => {
    setSavingHours(true);
    try {
      const res = await fetch(`${baseUrl}/marketplace/breeder/opening-hours/`, {
        method: "POST",
        headers: h(token),
        body: JSON.stringify({ day: editDay, open_time: editOpen, close_time: editClose, is_closed: editClosed }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to save.");
      setEditModal(false); load();
    } catch (e) { setError(e.message); }
    finally { setSavingHours(false); }
  };

  const openWeekend = () => {
    const sat = weekend.saturday;
    const sun = weekend.sunday;
    setSatClosed(sat === null); setSatOpen(sat?.open ?? "10:00"); setSatClose(sat?.close ?? "14:00");
    setSunClosed(sun === null); setSunOpen(sun?.open ?? "10:00"); setSunClose(sun?.close ?? "14:00");
    setWeekModal(true);
  };

  const saveWeekend = async () => {
    setSavingWk(true);
    try {
      const res = await fetch(`${baseUrl}/marketplace/breeder/weekend/`, {
        method: "POST", headers: h(token),
        body: JSON.stringify({
          saturday: satClosed ? null : { open: satOpen, close: satClose },
          sunday:   sunClosed ? null : { open: sunOpen, close: sunClose },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to save.");
      setWeekModal(false); load();
    } catch (e) { setError(e.message); }
    finally { setSavingWk(false); }
  };

  const openHoliday = () => {
    setHolEnabled(!!holiday.holiday_mode_enabled);
    setHolDate(holiday.on_holiday_until?.slice(0, 10) ?? "");
    setHolMsg(holiday.holiday_message ?? "");
    setHolModal(true);
  };

  const saveHoliday = async () => {
    setSavingHol(true);
    try {
      const res = await fetch(`${baseUrl}/marketplace/breeder/holiday/`, {
        method: "POST", headers: h(token),
        body: JSON.stringify({ holiday_mode_enabled: holEnabled, on_holiday_until: holDate || null, holiday_message: holMsg }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to save.");
      setHolModal(false); load();
    } catch (e) { setError(e.message); }
    finally { setSavingHol(false); }
  };

  if (loading) return <div className="bd-loading"><div className="bd-spinner" /><p>Loading schedule…</p></div>;

  return (
    <div>
      {error && <div className="ord-error"><FiAlertCircle size={14} /> {error}</div>}

      {/* Holiday mode active banner */}
      {holiday.holiday_mode_enabled && (
        <div className="sch-holiday-banner">
          <FiMoon size={16} />
          <div>
            <p style={{ fontWeight: 700, color: "#f0a500", margin: 0 }}>Holiday Mode Active</p>
            {holiday.on_holiday_until && <p style={{ fontSize: 12, color: "#7a9ab0", margin: "2px 0 0" }}>Until {new Date(holiday.on_holiday_until).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>}
            {holiday.holiday_message && <p style={{ fontSize: 13, color: "#c0d0e0", margin: "4px 0 0" }}>"{holiday.holiday_message}"</p>}
          </div>
          <button className="bd-toggle-btn" onClick={openHoliday} style={{ marginLeft: "auto" }}><FiEdit2 size={13} /> Edit</button>
        </div>
      )}

      {/* Weekday hours */}
      <div className="bd-card" style={{ marginBottom: 20 }}>
        <div className="bd-section-head"><span className="bd-section-icon"><FiClock /></span><h3 className="bd-section-title">Weekday Hours</h3></div>
        <div className="sch-days-grid">
          {WEEKDAYS.map(day => {
            const entry = hours[day];
            const isClosed = entry === null;
            return (
              <div key={day} className={`sch-day-row${isClosed ? " sch-day-row--closed" : ""}`}>
                <span className="sch-day-name">{day}</span>
                <span className="sch-day-hours">
                  {isClosed ? "Closed" : entry ? `${entry.open} – ${entry.close}` : "Not set"}
                </span>
                <button className="sch-edit-btn" onClick={() => openEditDay(day)}><FiEdit2 size={12} /></button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekend settings */}
      <div className="bd-card" style={{ marginBottom: 20 }}>
        <div className="bd-section-head" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="bd-section-icon"><FiSun /></span><h3 className="bd-section-title">Weekend Hours</h3>
          </div>
          <button className="bd-toggle-btn bd-toggle-btn--active" onClick={openWeekend}><FiEdit2 size={13} /> Edit</button>
        </div>
        <div className="sch-days-grid" style={{ marginTop: 16 }}>
          {["saturday", "sunday"].map(day => {
            const entry = weekend[day];
            const isClosed = entry === null;
            return (
              <div key={day} className={`sch-day-row${isClosed ? " sch-day-row--closed" : ""}`}>
                <span className="sch-day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                <span className="sch-day-hours">{isClosed ? "Closed" : entry ? `${entry.open} – ${entry.close}` : "Not set"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holiday mode */}
      <div className="bd-card">
        <div className="bd-section-head" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="bd-section-icon"><FiMoon /></span><h3 className="bd-section-title">Holiday Mode</h3>
          </div>
          <button className={`bd-toggle-btn${holiday.holiday_mode_enabled ? " bd-toggle-btn--active" : ""}`} onClick={openHoliday}>
            {holiday.holiday_mode_enabled ? "Active — Edit" : "Set Holiday"}
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#7a9ab0", marginTop: 10 }}>
          Enable holiday mode to pause your store and notify buyers automatically.
        </p>
      </div>

      {/* Edit day modal */}
      <AnimatePresence>
        {editModal && (
          <Modal show={editModal} onClose={() => setEditModal(false)} title={`Edit ${editDay} Hours`}>
            <div className="bd-form">
              <div className="bd-toggle-field" style={{ marginBottom: 20 }}>
                <span>Closed on {editDay}</span>
                <button type="button" className="bd-toggle-switch" onClick={() => setEditClosed(v => !v)}>
                  {editClosed
                    ? <span style={{ color: "#ef4444", fontSize: 22 }}>⏸</span>
                    : <span style={{ color: "#22c55e", fontSize: 22 }}>▶</span>}
                </button>
              </div>
              {!editClosed && (
                <div className="bd-form-grid">
                  <div className="bd-field"><label>Opens</label><TimeSelect value={editOpen} onChange={setEditOpen} /></div>
                  <div className="bd-field"><label>Closes</label><TimeSelect value={editClose} onChange={setEditClose} /></div>
                </div>
              )}
              <button className="bd-save-btn" onClick={saveHours} disabled={savingHours}>
                {savingHours ? "Saving…" : <><FiCheck size={14} /> Save {editDay}</>}
              </button>
            </div>
          </Modal>
        )}

        {/* Weekend modal */}
        {weekModal && (
          <Modal show={weekModal} onClose={() => setWeekModal(false)} title="Weekend Hours">
            <div className="bd-form">
              {[
                { label: "Saturday", closed: satClosed, setClosed: setSatClosed, open: satOpen, setOpen: setSatOpen, close: satClose, setClose: setSatClose },
                { label: "Sunday",   closed: sunClosed, setClosed: setSunClosed, open: sunOpen, setOpen: setSunOpen, close: sunClose, setClose: setSunClose },
              ].map(day => (
                <div key={day.label} style={{ marginBottom: 20 }}>
                  <div className="bd-toggle-field" style={{ marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, color: "#e8f0fe" }}>{day.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#7a9ab0" }}>{day.closed ? "Closed" : "Open"}</span>
                      <button type="button" className="bd-toggle-switch" onClick={() => day.setClosed(v => !v)}>
                        {day.closed ? <span style={{ color: "#ef4444", fontSize: 20 }}>⏸</span> : <span style={{ color: "#22c55e", fontSize: 20 }}>▶</span>}
                      </button>
                    </div>
                  </div>
                  {!day.closed && (
                    <div className="bd-form-grid">
                      <div className="bd-field"><label>Opens</label><TimeSelect value={day.open} onChange={day.setOpen} /></div>
                      <div className="bd-field"><label>Closes</label><TimeSelect value={day.close} onChange={day.setClose} /></div>
                    </div>
                  )}
                </div>
              ))}
              <button className="bd-save-btn" onClick={saveWeekend} disabled={savingWk}>
                {savingWk ? "Saving…" : <><FiCheck size={14} /> Save Weekend Hours</>}
              </button>
            </div>
          </Modal>
        )}

        {/* Holiday modal */}
        {holModal && (
          <Modal show={holModal} onClose={() => setHolModal(false)} title="Holiday Mode">
            <div className="bd-form">
              <div className="bd-toggle-field" style={{ marginBottom: 20 }}>
                <div>
                  <p style={{ fontWeight: 600, color: "#e8f0fe", marginBottom: 2 }}>Enable Holiday Mode</p>
                  <p style={{ fontSize: 12, color: "#7a9ab0" }}>Pauses your store and shows buyers a message</p>
                </div>
                <button type="button" className="bd-toggle-switch" onClick={() => setHolEnabled(v => !v)}>
                  {holEnabled ? <span style={{ color: "#f0a500", fontSize: 22 }}>🌙</span> : <span style={{ color: "#7a9ab0", fontSize: 22 }}>☀️</span>}
                </button>
              </div>
              {holEnabled && (
                <>
                  <div className="bd-field">
                    <label>Return Date (optional)</label>
                    <input type="date" value={holDate} onChange={e => setHolDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                  </div>
                  <div className="bd-field">
                    <label>Message to Buyers</label>
                    <textarea value={holMsg} onChange={e => setHolMsg(e.target.value)} rows={3} placeholder="e.g. Back on 15th June — orders welcome after then." />
                  </div>
                </>
              )}
              <button className="bd-save-btn" onClick={saveHoliday} disabled={savingHol}>
                {savingHol ? "Saving…" : <><FiCheck size={14} /> {holEnabled ? "Enable Holiday Mode" : "Disable Holiday Mode"}</>}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
