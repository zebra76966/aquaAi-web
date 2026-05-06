import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/authcontext";
import { baseUrl } from "../auth/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartBar,
  FaUser,
  FaCheckCircle,
  FaHourglassHalf,
  FaClock,
  FaStar,
  FaDollarSign,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBrain,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaToggleOn,
  FaToggleOff,
  FaGlobe,
  FaInstagram,
  FaFacebook,
  FaSave,
  FaBuilding,
  FaChevronRight,
  FaSync,
  FaInfoCircle,
} from "react-icons/fa";
import { MdBusiness } from "react-icons/md";
import "./ConsultantDashboard.css";

const Spinner = () => <div className="cd-spinner" />;
const KpiCard = ({ label, value, icon, color, trend }) => (
  <div className="cd-kpi" style={{ "--kc": color }}>
    <span className="cd-kpi-icon" style={{ color }}>
      {icon}
    </span>
    <span className="cd-kpi-val">{value ?? "—"}</span>
    <span className="cd-kpi-label">{label}</span>
    {trend != null && (
      <span className={"cd-kpi-trend " + (trend >= 0 ? "cd-trend--up" : "cd-trend--down")}>
        {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trend)}%
      </span>
    )}
  </div>
);
const InsightRow = ({ text }) => (
  <div className="cd-insight-row">
    <FaLightbulb className="cd-insight-icon" />
    <p>{text}</p>
  </div>
);
const SectionHead = ({ icon, title }) => (
  <div className="cd-section-head">
    <span className="cd-section-icon">{icon}</span>
    <h3 className="cd-section-title">{title}</h3>
  </div>
);

// ═══════════════════════════════════════════════
//  TAB: DASHBOARD
// ═══════════════════════════════════════════════
function DashboardTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/intelligence/dashboard/consultant/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to load");
        return;
      }
      setData(json);
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading)
    return (
      <div className="cd-loading">
        <Spinner />
        <p>Loading dashboard…</p>
      </div>
    );
  if (error)
    return (
      <div className="cd-loading">
        <FaExclamationTriangle style={{ color: "#f87171", fontSize: 32 }} />
        <p style={{ color: "#f87171" }}>{error}</p>
        <button className="cd-retry-btn" onClick={fetchDashboard}>
          <FaSync /> Retry
        </button>
      </div>
    );

  const kpi = data?.kpi;
  const trends = data?.trends;
  const disputeRisk = data?.disputeRisk;
  const cohort = data?.cohortBenchmark;
  const aiInsights = data?.aiInsights || [];
  const bookingStatus = data?.bookingStatus;

  return (
    <div>
      {kpi && (
        <div className="cd-kpi-grid">
          <KpiCard label="Total Bookings" value={kpi.totalBookings} icon={<FaCalendarAlt />} color="#00f2ff" trend={trends?.bookingsChange} />
          <KpiCard label="Earnings" value={kpi.totalEarnings != null ? `$${kpi.totalEarnings}` : "—"} icon={<FaDollarSign />} color="#4ade80" trend={trends?.earningsChange} />
          <KpiCard label="Avg Rating" value={kpi.avgRating || "—"} icon={<FaStar />} color="#fbbf24" />
          <KpiCard label="Completion" value={kpi.completionRate != null ? kpi.completionRate + "%" : "—"} icon={<FaCheckCircle />} color="#a78bfa" />
          <KpiCard label="Pending" value={kpi.pendingBookings ?? "—"} icon={<FaHourglassHalf />} color="#f472b6" />
          <KpiCard label="Avg Response" value={kpi.avgResponseHours != null ? kpi.avgResponseHours + "h" : "—"} icon={<FaClock />} color="#60a5fa" />
        </div>
      )}

      {/* Booking pipeline */}
      {bookingStatus && (
        <div className="cd-card">
          <SectionHead icon={<FaBriefcase />} title="Booking Pipeline" />
          <div className="cd-status-grid">
            {Object.entries(bookingStatus).map(([k, v]) => (
              <div key={k} className="cd-status-pill">
                <span className="cd-status-val">{v}</span>
                <span className="cd-status-key">{k}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispute risk */}
      {disputeRisk && (
        <div className={"cd-card cd-risk-card " + (disputeRisk.risk_level === "low" ? "cd-risk--low" : "cd-risk--high")}>
          <div className="cd-risk-header">
            {disputeRisk.risk_level === "low" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>Dispute Risk — {disputeRisk.risk_level?.toUpperCase()}</span>
            {disputeRisk.dispute_probability != null && <span className="cd-risk-pct">{(disputeRisk.dispute_probability * 100).toFixed(0)}%</span>}
          </div>
          <p className="cd-risk-msg">{disputeRisk.intervention_message}</p>
        </div>
      )}

      {/* Cohort */}
      {cohort && (
        <div className="cd-card">
          <SectionHead icon={<FaTrophy />} title={`Cohort — ${cohort.tier || ""}`} />
          <p className="cd-narrative">{cohort.narrative}</p>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="cd-ai-card">
          <div className="cd-ai-header">
            <FaBrain />
            <span>AI Performance Insights</span>
          </div>
          {aiInsights.map((ins, i) => (
            <InsightRow key={i} text={ins} />
          ))}
        </div>
      )}

      {!kpi && (
        <div className="cd-empty-state">
          <FaChartBar />
          <p>Dashboard data not available yet. Complete your first booking to see insights.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  TAB: CALENDAR + BOOKINGS
// ═══════════════════════════════════════════════
// ─── Helpers ────────────────────────────────────────────────────
// Returns the best display name for a booking requester
const clientName = (b) => {
  const info = b.requester_info;
  if (info?.full_name?.trim()) return info.full_name.trim();
  if (info?.email) return info.email;
  return b.requester || "Client";
};

// Returns a comma-joined string of service labels
const serviceLabels = (b) => {
  if (!b.services?.length) return null;
  return b.services.map((s) => s.label).join(", ");
};

// Status label — prefer consultant_status if available
const bookingStatusLabel = (b) => b.consultant_status || b.status || "pending";

// ─── Booking Card ────────────────────────────────────────────────
function BookingCard({ b, onAccept, onDecline, accepting, declining }) {
  const [expanded, setExpanded] = useState(false);
  const status = bookingStatusLabel(b);
  const name = clientName(b);
  const services = serviceLabels(b);

  const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isPast = b.is_past;
  const isUpcoming = b.is_upcoming;

  return (
    <motion.div
      className={"cd-booking-card" + (isPast ? " cd-booking-card--past" : "") + (isUpcoming ? " cd-booking-card--upcoming" : "")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* ── Top row ── */}
      <div className="cd-booking-top">
        <div className="cd-booking-client-block">
          <div className="cd-booking-avatar">{name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="cd-booking-client">{name}</p>
            {services && <p className="cd-booking-service">{services}</p>}
          </div>
        </div>
        <div className="cd-booking-badges">
          <span className={"cd-booking-status-chip cd-status-" + status}>{status}</span>
          {isUpcoming && <span className="cd-booking-upcoming-badge">Upcoming</span>}
          {isPast && <span className="cd-booking-past-badge">Past</span>}
        </div>
      </div>

      {/* ── Meta row ── */}
      <div className="cd-booking-meta">
        {b.scheduled_start && (
          <span>
            <FaCalendarAlt style={{ opacity: 0.5, fontSize: 11 }} />
            {fmtDate(b.scheduled_start)}
          </span>
        )}
        {b.scheduled_start && b.scheduled_end && (
          <span>
            <FaClock style={{ opacity: 0.5, fontSize: 11 }} />
            {fmtTime(b.scheduled_start)} – {fmtTime(b.scheduled_end)}
          </span>
        )}
        {b.duration_minutes && (
          <span>
            <FaClock style={{ opacity: 0.5, fontSize: 11 }} />
            {b.duration_minutes}m
          </span>
        )}
        {b.full_price != null && (
          <span>
            <FaDollarSign style={{ opacity: 0.5, fontSize: 11 }} />£{b.full_price}
            {b.booking_fee && <span className="cd-booking-fee"> (fee: £{b.booking_fee})</span>}
          </span>
        )}
      </div>

      {/* ── Payment status row ── */}
      <div className="cd-booking-payment-row">
        <span className={"cd-payment-chip cd-payment-" + (b.payment_status || "pending")}>💳 Payment: {b.payment_status || "pending"}</span>
        {b.services?.length > 1 && <span className="cd-booking-multi-service">{b.services.length} services</span>}
      </div>

      {/* ── Expandable: services detail ── */}
      {b.services?.length > 0 && (
        <>
          <button className="cd-booking-expand-btn" onClick={() => setExpanded((v) => !v)}>
            <FaInfoCircle style={{ fontSize: 11 }} />
            {expanded ? "Hide" : "View"} service details
            <span className={"cd-expand-arrow" + (expanded ? " cd-arrow-up" : "")}>▾</span>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                className="cd-booking-services-detail"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                {b.services.map((s) => (
                  <div key={s.id} className="cd-service-row">
                    <span className="cd-service-label">{s.label}</span>
                    <span className="cd-service-category">{s.category}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Actions for pending bookings ── */}
      {status === "pending" && !isPast && (
        <div className="cd-booking-actions">
          <button className="cd-btn-accept" onClick={onAccept} disabled={accepting || declining}>
            {accepting ? (
              <Spinner />
            ) : (
              <>
                <FaCheckCircle /> Accept
              </>
            )}
          </button>
          <button className="cd-btn-decline" onClick={onDecline} disabled={accepting || declining}>
            {declining ? <Spinner /> : "Decline"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Calendar Tab ────────────────────────────────────────────────
function CalendarTab({ token }) {
  const [calMode, setCalMode] = useState("bookings"); // default to bookings where data lives
  const [calLoading, setCalLoading] = useState(true);
  const [rawDays, setRawDays] = useState([]);
  const [sections, setSections] = useState([]);
  const [filter, setFilter] = useState("all");

  const [bookingsTab, setBookingsTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);

  // Track per-card accept/decline loading states
  const [actionLoading, setActionLoading] = useState({}); // { [id]: "accept" | "decline" | null }

  const fetchCalendar = useCallback(async () => {
    setCalLoading(true);
    try {
      const res = await fetch(`${baseUrl}/consultants/calendar/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      const days = json.data?.calendar || [];
      setRawDays(days);
      applyFilter(days, "all");
    } catch (e) {
      console.error(e);
    } finally {
      setCalLoading(false);
    }
  }, [token]);

  const applyFilter = (days, f) => {
    setFilter(f);
    let d = days;
    if (f === "today") d = days.filter((x) => x.is_today);
    else if (f === "week") {
      const now = new Date(),
        end = new Date();
      end.setDate(now.getDate() + 7);
      d = days.filter((x) => {
        const c = new Date(x.date);
        return c >= now && c <= end;
      });
    } else if (f === "booked") d = days.filter((x) => x.bookings?.length > 0);
    setSections(
      d.map((day) => ({
        title: `${day.day_of_week}, ${day.date}`,
        isToday: day.is_today,
        bookings: day.bookings || [],
      })),
    );
  };

  const fetchBookings = useCallback(async () => {
    setBookLoading(true);
    try {
      const res = await fetch(`${baseUrl}/consultants/consultant/bookings?status=${bookingsTab}`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const json = await res.json();
      // API returns { data: [...], counts: {...} }
      setBookings(Array.isArray(json.data) ? json.data : []);
      setCounts(json.counts || null);
    } catch (e) {
      console.error(e);
    } finally {
      setBookLoading(false);
    }
  }, [token, bookingsTab]);

  const updateBookingStatus = async (id, newStatus) => {
    const actionKey = newStatus === "confirmed" ? "accept" : "decline";
    setActionLoading((prev) => ({ ...prev, [id]: actionKey }));
    try {
      const res = await fetch(`${baseUrl}/consultants/consultant/bookings/${id}/update-status/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: newStatus }),
      });
      if (res.ok) {
        // Optimistic update — remove from pending list or refresh
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (counts) setCounts((prev) => ({ ...prev, pending: Math.max(0, (prev.pending || 1) - 1) }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);
  useEffect(() => {
    if (calMode === "bookings") fetchBookings();
  }, [calMode, fetchBookings]);

  const fmt = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* ── Mode toggle ── */}
      <div className="cd-toggle-row">
        <button className={"cd-toggle-btn " + (calMode === "calendar" ? "cd-toggle-btn--active" : "")} onClick={() => setCalMode("calendar")}>
          <FaCalendarAlt /> Calendar
        </button>
        <button className={"cd-toggle-btn " + (calMode === "bookings" ? "cd-toggle-btn--active" : "")} onClick={() => setCalMode("bookings")}>
          <FaBriefcase /> Bookings
          {counts?.pending > 0 && <span className="cd-badge-dot">{counts.pending}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ══ CALENDAR VIEW ══ */}
        {calMode === "calendar" && (
          <motion.div key="cal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="cd-filter-row">
              {["all", "today", "week", "booked"].map((f) => (
                <button key={f} className={"cd-filter-chip " + (filter === f ? "cd-filter-chip--active" : "")} onClick={() => applyFilter(rawDays, f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {calLoading ? (
              <div className="cd-loading">
                <Spinner />
              </div>
            ) : sections.length === 0 ? (
              <div className="cd-empty-state">
                <FaCalendarAlt />
                <p>No availability days found for this filter.</p>
              </div>
            ) : (
              <div className="cd-cal-list">
                {sections.map((sec, i) => (
                  <div key={i} className={"cd-cal-day " + (sec.isToday ? "cd-cal-day--today" : "")}>
                    <div className="cd-cal-day-head">
                      <span className="cd-cal-day-label">{sec.title}</span>
                      {sec.isToday && <span className="cd-today-badge">Today</span>}
                      <span className="cd-cal-count">
                        {sec.bookings.length} booking{sec.bookings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {sec.bookings.length === 0 ? (
                      <p className="cd-cal-empty">Available — no bookings</p>
                    ) : (
                      <div className="cd-cal-bookings">
                        {sec.bookings.map((b, j) => (
                          <div key={j} className="cd-cal-booking-item">
                            <div className="cd-cal-booking-time">
                              <FaClock style={{ fontSize: 11, opacity: 0.5 }} />
                              {b.scheduled_start ? fmt(b.scheduled_start) : "—"}
                              {b.scheduled_end ? " – " + fmt(b.scheduled_end) : ""}
                            </div>
                            <div className="cd-cal-booking-info">
                              {/* Calendar bookings may use different shape — fall back gracefully */}
                              <span className="cd-cal-booking-name">{clientName(b) || b.client_name || "Client"}</span>
                              {(serviceLabels(b) || b.service_name) && <span className="cd-cal-booking-service">{serviceLabels(b) || b.service_name}</span>}
                            </div>
                            <span className={"cd-booking-status-chip cd-status-" + (b.status || "pending")}>{b.status || "pending"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ══ BOOKINGS VIEW ══ */}
        {calMode === "bookings" && (
          <motion.div key="bk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Counts summary */}
            {counts && (
              <div className="cd-counts-row">
                {[
                  { label: "Total", val: counts.total, color: "var(--cd-accent)" },
                  { label: "Pending", val: counts.pending, color: "#fbbf24" },
                  { label: "Confirmed", val: counts.confirmed, color: "#4ade80" },
                  { label: "Upcoming", val: counts.upcoming, color: "#a78bfa" },
                  { label: "Today", val: counts.todays, color: "#f472b6" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="cd-count-chip">
                    <span className="cd-count-val" style={{ color }}>
                      {val}
                    </span>
                    <span className="cd-count-label">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Status filter */}
            <div className="cd-filter-row">
              {["pending", "confirmed", "completed", "cancelled"].map((t) => (
                <button key={t} className={"cd-filter-chip " + (bookingsTab === t ? "cd-filter-chip--active" : "")} onClick={() => setBookingsTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === "pending" && counts?.pending > 0 && <span className="cd-badge-dot">{counts.pending}</span>}
                </button>
              ))}
            </div>

            {bookLoading ? (
              <div className="cd-loading">
                <Spinner />
              </div>
            ) : bookings.length === 0 ? (
              <div className="cd-empty-state">
                <FaBriefcase />
                <p>No {bookingsTab} bookings.</p>
                <p className="cd-empty-sub">
                  {bookingsTab === "pending"
                    ? "New booking requests will appear here."
                    : bookingsTab === "confirmed"
                      ? "Confirmed appointments will show here."
                      : "Completed sessions will appear here."}
                </p>
              </div>
            ) : (
              <div className="cd-bookings-list">
                {bookings.map((b, i) => (
                  <BookingCard
                    key={b.id || i}
                    b={b}
                    onAccept={() => updateBookingStatus(b.id, "confirm")}
                    onDecline={() => updateBookingStatus(b.id, "cancel")}
                    accepting={actionLoading[b.id] === "accept"}
                    declining={actionLoading[b.id] === "decline"}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  TAB: ANALYTICS
// ═══════════════════════════════════════════════
function AnalyticsTab({ token }) {
  const [mode, setMode] = useState("analytics");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [intel, setIntel] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const fetchBase = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const profRes = await fetch(`${baseUrl}/consultants/profile/`, { headers: h });
      const profJson = await profRes.json();
      const uid = profJson?.data?.id;
      setUserId(uid);
      const anaRes = await fetch(`${baseUrl}/intelligence/dashboard/consultant/?entity_type=consultant&entity_id=${uid}`, { headers: h });
      const anaJson = await anaRes.json();
      setData(anaJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchIntelligence = useCallback(
    async (uid) => {
      if (!uid) return;
      setIntelLoading(true);
      const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const fw = async (url, method = "GET", body = null) => {
        try {
          const opts = { method, headers: h };
          if (body) opts.body = JSON.stringify(body);
          return await (await fetch(url, opts)).json();
        } catch {
          return null;
        }
      };
      const [score, trajectory, digest, cohort, churn, disputeForecast] = await Promise.all([
        fw(`${baseUrl}/intelligence/trust/consultant/${uid}/score`),
        fw(`${baseUrl}/intelligence/trust/consultant/${uid}/trajectory`),
        fw(`${baseUrl}/intelligence/digest/consultant/${uid}/latest`),
        fw(`${baseUrl}/intelligence/cohort/consultant/${uid}`),
        fw(`${baseUrl}/intelligence/predict/churn/consultant/${uid}`),
        fw(`${baseUrl}/intelligence/dispute/predict`, "POST", { entity_id: uid, entity_type: "consultant" }),
      ]);
      setIntel({ score, trajectory, digest, cohort, churn, disputeForecast });
      setIntelLoading(false);
    },
    [token],
  );

  useEffect(() => {
    fetchBase();
  }, [fetchBase]);
  useEffect(() => {
    if (mode === "intelligence" && userId && !intel) fetchIntelligence(userId);
  }, [mode, userId, intel, fetchIntelligence]);

  if (loading)
    return (
      <div className="cd-loading">
        <Spinner />
      </div>
    );

  const kpi = data?.kpi;
  const trends = data?.trends;
  const aiInsights = data?.aiInsights || [];
  const cohort = data?.cohortBenchmark;
  const bookingStatus = data?.bookingStatus;

  return (
    <div>
      <div className="cd-toggle-row">
        <button className={"cd-toggle-btn " + (mode === "analytics" ? "cd-toggle-btn--active" : "")} onClick={() => setMode("analytics")}>
          <FaChartBar /> Analytics
        </button>
        <button className={"cd-toggle-btn " + (mode === "intelligence" ? "cd-toggle-btn--active" : "")} onClick={() => setMode("intelligence")}>
          <FaBrain /> AI Intelligence
        </button>
      </div>
      <AnimatePresence mode="wait">
        {mode === "analytics" && (
          <motion.div key="ana" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!data ? (
              <div className="cd-empty-state">
                <FaChartBar />
                <p>No analytics data yet.</p>
              </div>
            ) : (
              <>
                {kpi && (
                  <div className="cd-kpi-grid">
                    <KpiCard label="Total Bookings" value={kpi.totalBookings} icon={<FaCalendarAlt />} color="#00f2ff" trend={trends?.bookingsChange} />
                    <KpiCard label="Earnings" value={kpi.totalEarnings != null ? `$${kpi.totalEarnings}` : "—"} icon={<FaDollarSign />} color="#4ade80" trend={trends?.earningsChange} />
                    <KpiCard label="Avg Rating" value={kpi.avgRating || "—"} icon={<FaStar />} color="#fbbf24" />
                    <KpiCard label="Completion %" value={kpi.completionRate != null ? kpi.completionRate + "%" : "—"} icon={<FaCheckCircle />} color="#a78bfa" />
                  </div>
                )}
                {bookingStatus && (
                  <div className="cd-card">
                    <SectionHead icon={<FaBriefcase />} title="Booking Pipeline" />
                    <div className="cd-status-grid">
                      {Object.entries(bookingStatus).map(([k, v]) => (
                        <div key={k} className="cd-status-pill">
                          <span className="cd-status-val">{v}</span>
                          <span className="cd-status-key">{k}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cohort && (
                  <div className="cd-card">
                    <SectionHead icon={<FaTrophy />} title={`Cohort — ${cohort.tier || ""}`} />
                    <p className="cd-narrative">{cohort.narrative}</p>
                  </div>
                )}
                {aiInsights.length > 0 && (
                  <div className="cd-ai-card">
                    <div className="cd-ai-header">
                      <FaBrain />
                      <span>AI Performance Insights</span>
                    </div>
                    {aiInsights.map((ins, i) => (
                      <InsightRow key={i} text={ins} />
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
        {mode === "intelligence" && (
          <motion.div key="intel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {intelLoading ? (
              <div className="cd-loading">
                <Spinner />
                <p>Loading AI Intelligence…</p>
              </div>
            ) : !intel ? (
              <div className="cd-empty-state">
                <FaBrain />
                <p>AI intelligence not available yet.</p>
              </div>
            ) : (
              <>
                {/* ── Trust Score — direct object, no .data wrapper ── */}
                {intel.score && !intel.score.error && (
                  <div className="cd-card">
                    <SectionHead icon={<FaShieldAlt />} title="Trust Score" />
                    <div className="cd-trust-row">
                      <div className="cd-trust-circle">
                        <span className="cd-trust-num">{intel.score.decay_adjusted_score ?? intel.score.raw_score ?? "—"}</span>
                        <span className="cd-trust-sub">pts</span>
                      </div>
                      <div>
                        {intel.score.tier && (
                          <p className="cd-trust-tier" style={{ textTransform: "capitalize" }}>
                            {intel.score.tier === "silver" ? "🥈" : intel.score.tier === "gold" ? "🥇" : intel.score.tier === "bronze" ? "🥉" : "⭐"} {intel.score.tier} Tier
                          </p>
                        )}
                        {intel.score.signal_count != null && <p style={{ fontSize: 12, color: "var(--cd-muted)", margin: "4px 0 0" }}>{intel.score.signal_count} signals recorded</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Cohort — direct object ── */}
                {intel.cohort && !intel.cohort.error && (
                  <div className="cd-card">
                    <SectionHead icon={<FaTrophy />} title={`Cohort Benchmark — ${intel.cohort.tier ? intel.cohort.tier.charAt(0).toUpperCase() + intel.cohort.tier.slice(1) : ""}`} />
                    {intel.cohort.narrative && <p className="cd-narrative">{intel.cohort.narrative}</p>}
                    {intel.cohort.metrics && (
                      <div className="cd-status-grid" style={{ marginTop: 12 }}>
                        {intel.cohort.metrics.avg_review_rating != null && (
                          <div className="cd-status-pill">
                            <span className="cd-status-val">{intel.cohort.metrics.avg_review_rating.percentile != null ? intel.cohort.metrics.avg_review_rating.percentile + "th" : "—"}</span>
                            <span className="cd-status-key">Review %ile</span>
                          </div>
                        )}
                        {intel.cohort.metrics.inquiry_response_rate != null && (
                          <div className="cd-status-pill">
                            <span className="cd-status-val">{intel.cohort.metrics.inquiry_response_rate.percentile != null ? intel.cohort.metrics.inquiry_response_rate.percentile + "th" : "—"}</span>
                            <span className="cd-status-key">Response %ile</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Churn — uses risk_level + retention_trigger_message ── */}
                {intel.churn && !intel.churn.error && (
                  <div className={"cd-card cd-risk-card " + (intel.churn.risk_level === "low" ? "cd-risk--low" : intel.churn.risk_level === "critical" ? "cd-risk--critical" : "cd-risk--high")}>
                    <div className="cd-risk-header">
                      {intel.churn.risk_level === "low" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      <span>Retention Risk — {intel.churn.risk_level?.toUpperCase()}</span>
                      {intel.churn.churn_probability != null && <span className="cd-risk-pct">{Math.round(intel.churn.churn_probability * 100)}%</span>}
                    </div>
                    {intel.churn.retention_trigger_message && <p className="cd-risk-msg">{intel.churn.retention_trigger_message}</p>}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {intel.churn.days_since_last_activity != null && (
                        <span className="cd-filter-chip">Last active: {intel.churn.days_since_last_activity === 999 ? "No activity yet" : intel.churn.days_since_last_activity + "d ago"}</span>
                      )}
                      {intel.churn.recent_14d_activity_count != null && <span className="cd-filter-chip">{intel.churn.recent_14d_activity_count} actions (14d)</span>}
                    </div>
                  </div>
                )}

                {/* ── Digest — error field means unavailable ── */}
                {intel.digest && !intel.digest.error && (
                  <div className="cd-ai-card">
                    <div className="cd-ai-header">
                      <FaBrain />
                      <span>Intelligence Digest</span>
                    </div>
                    {intel.digest.insights?.map((ins, i) => <InsightRow key={i} text={ins} />) ||
                      (intel.digest.summary ? (
                        <p className="cd-narrative">{intel.digest.summary}</p>
                      ) : (
                        <p className="cd-narrative" style={{ opacity: 0.5 }}>
                          No digest available yet.
                        </p>
                      ))}
                  </div>
                )}

                {/* ── Dispute forecast ── */}
                {intel.disputeForecast && !intel.disputeForecast.error && intel.disputeForecast.risk_level && (
                  <div className={"cd-card cd-risk-card " + (intel.disputeForecast.risk_level === "low" ? "cd-risk--low" : "cd-risk--high")}>
                    <div className="cd-risk-header">
                      <FaExclamationTriangle />
                      <span>Dispute Risk</span>
                      {intel.disputeForecast.dispute_probability != null && <span className="cd-risk-pct">{Math.round(intel.disputeForecast.dispute_probability * 100)}%</span>}
                    </div>
                    <p className="cd-risk-msg">{intel.disputeForecast.intervention_message}</p>
                  </div>
                )}

                {/* ── Pricing — skip access_denied ── */}
                {intel.pricing && intel.pricing.status !== "access_denied" && !intel.pricing.error && (
                  <div className="cd-card">
                    <SectionHead icon={<FaStar />} title="Pricing Intelligence" />
                    <p className="cd-narrative">{intel.pricing.recommendation || intel.pricing.message}</p>
                  </div>
                )}

                {/* ── Global fallback ── */}
                {intel && !intel.score && !intel.cohort && !intel.churn && (
                  <div className="cd-empty-state">
                    <FaBrain />
                    <p>Activity needed to generate AI intelligence insights.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  TAB: PROFILE  (full version matching user Profile.js)
// ═══════════════════════════════════════════════
function ProfileTab({ token }) {
  const { logout, tier } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileMode, setProfileMode] = useState("personal");
  const [activePersonalSection, setActivePersonalSection] = useState("profile");

  // Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pState, setPState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [successPersonal, setSuccessPersonal] = useState(false);

  // Badges / Trust / Referral
  const [badges, setBadges] = useState([]);
  const [badgeDefs, setBadgeDefs] = useState([]);
  const [trust, setTrust] = useState(null);
  const [badgeLoading, setBadgeLoading] = useState(true);
  const [referralData, setReferralData] = useState({ available_credits: 0, my_referral_code: "" });
  const [codeCopied, setCodeCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Business
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [policy, setPolicy] = useState("");
  const [autoAccept, setAutoAccept] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [successBusiness, setSuccessBusiness] = useState(false);

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/user/profile/`, { headers: h });
        const json = await res.json();
        const d = json?.data || json;
        const parts = (d.name || "").trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        setEmail(d.email || "");
        setAddress(d.address || "");
        setCity(d.city || "");
        setPState(d.state || "");
        setCountry(d.country || "");
        setPostalCode(d.postal_code || "");
        if (d.profile_picture) setProfileImage(d.profile_picture);
        setReferralData({ available_credits: d.available_credits || 0, my_referral_code: d.my_referral_code || "" });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPersonal(false);
      }
    })();
    (async () => {
      try {
        const [myRes, defsRes, trustRes] = await Promise.all([
          fetch(`${baseUrl}/badges/badges/me/`, { headers: h }),
          fetch(`${baseUrl}/badges/definitions/`, { headers: h }),
          fetch(`${baseUrl}/badges/trust-score/me/`, { headers: h }),
        ]);
        const [myJson, defsJson, trustJson] = await Promise.all([myRes.json(), defsRes.json(), trustRes.json()]);
        setBadges(myJson?.data?.recently_earned || []);
        setBadgeDefs(defsJson?.data || []);
        setTrust(trustJson?.data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setBadgeLoading(false);
      }
    })();
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/consultants/profile/`, { headers: h });
        const json = await res.json();
        const d = json?.data || json;
        if (d?.company_name) {
          setIsEdit(true);
          setCompanyName(d.company_name || "");
          setBio(d.bio || "");
          setWebsite(d.website || "");
          setInstagram(d.instagram || "");
          setFacebook(d.facebook || "");
          setPolicy(d.cancellation_policy || "");
          setAutoAccept(!!d.auto_accept);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingBusiness(false);
      }
    })();
  }, [token]);

  const savePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const fd = new FormData();
      fd.append("first_name", firstName);
      fd.append("last_name", lastName);
      fd.append("address", address);
      fd.append("city", city);
      fd.append("state", pState);
      fd.append("country", country);
      fd.append("postal_code", postalCode);
      const res = await fetch(`${baseUrl}/user/profile/update/`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) {
        setSuccessPersonal(true);
        setTimeout(() => setSuccessPersonal(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPersonal(false);
    }
  };

  const saveBusiness = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setSavingBusiness(true);
    try {
      const url = isEdit ? `${baseUrl}/consultants/profile/update/` : `${baseUrl}/consultants/apply/`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName, bio, website, instagram, facebook, cancellation_policy: policy, auto_accept: autoAccept }),
      });
      if (res.ok) {
        setSuccessBusiness(true);
        setTimeout(() => setSuccessBusiness(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralData.my_referral_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const latestBadge = badges[0];
  const resolvedBadge = latestBadge && badgeDefs.find((b) => b.badge_code === latestBadge.badge_code);
  const tierColor = trust?.trust_score?.tier_color || "#00f2ff";
  const tierIcon = trust?.trust_score?.tier_icon || "🥉";
  const trustPoints = trust?.trust_score?.trust_score;
  const tierName = trust?.trust_score?.regulatory_tier;

  return (
    <div>
      <div className="cd-toggle-row">
        <button className={"cd-toggle-btn " + (profileMode === "personal" ? "cd-toggle-btn--active" : "")} onClick={() => setProfileMode("personal")}>
          <FaUser /> Personal
        </button>
        <button className={"cd-toggle-btn " + (profileMode === "business" ? "cd-toggle-btn--active" : "")} onClick={() => setProfileMode("business")}>
          <MdBusiness /> Business
        </button>
      </div>

      <AnimatePresence mode="wait">
        {profileMode === "personal" && (
          <motion.div key="personal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loadingPersonal ? (
              <div className="cd-loading">
                <Spinner />
              </div>
            ) : (
              <div className="cd-profile-layout">
                <aside className="cd-prof-sidebar">
                  <div className="cd-prof-avatar-wrap">
                    {profileImage ? <img src={profileImage} alt="Profile" className="cd-prof-avatar" /> : <div className="cd-prof-avatar-ph">{firstName ? firstName[0].toUpperCase() : "?"}</div>}
                  </div>
                  <p className="cd-prof-name">
                    {firstName} {lastName}
                  </p>
                  <p className="cd-prof-email">{email}</p>
                  {tier && (
                    <div className="cd-prof-tier-pill">
                      <span>✨</span>
                      <span>{tier}</span>
                    </div>
                  )}
                  {tierName && (
                    <div className="cd-prof-trust-card">
                      <span>{tierIcon}</span>
                      <div>
                        <p className="cd-prof-trust-tier" style={{ color: tierColor }}>
                          {tierName} Tier
                        </p>
                        {trustPoints != null && <p className="cd-prof-trust-pts">{trustPoints} trust points</p>}
                      </div>
                    </div>
                  )}
                  <nav className="cd-prof-nav">
                    {[
                      { key: "profile", label: "Profile", icon: "👤" },
                      { key: "badges", label: "Badges & Trust", icon: "🏅" },
                      { key: "referral", label: "Refer & Earn", icon: "🎁" },
                    ].map((s) => (
                      <button key={s.key} className={"cd-prof-nav-item " + (activePersonalSection === s.key ? "cd-prof-nav-active" : "")} onClick={() => setActivePersonalSection(s.key)}>
                        <span>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </nav>
                  <button className="cd-prof-logout-btn" onClick={() => setShowLogout(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Logout
                  </button>
                </aside>
                <main className="cd-prof-main">
                  <AnimatePresence mode="wait">
                    {activePersonalSection === "profile" && (
                      <motion.div key="prof" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 className="cd-prof-section-title">Profile Information</h2>
                        <form onSubmit={savePersonal} className="cd-form">
                          <div className="cd-form-grid">
                            <div className="cd-field">
                              <label>First Name</label>
                              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className="cd-field">
                              <label>Last Name</label>
                              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                          </div>
                          <div className="cd-field">
                            <label>
                              Email <span className="cd-hint-label">(read-only)</span>
                            </label>
                            <input value={email} readOnly className="cd-input-disabled" />
                          </div>
                          <h3 className="cd-prof-subsection">Address</h3>
                          <div className="cd-field">
                            <label>Street Address</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Ocean Drive" />
                          </div>
                          <div className="cd-form-grid">
                            <div className="cd-field">
                              <label>City</label>
                              <input value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                            <div className="cd-field">
                              <label>State / Province</label>
                              <input value={pState} onChange={(e) => setPState(e.target.value)} />
                            </div>
                          </div>
                          <div className="cd-form-grid">
                            <div className="cd-field">
                              <label>Country</label>
                              <input value={country} onChange={(e) => setCountry(e.target.value)} />
                            </div>
                            <div className="cd-field">
                              <label>Postal Code</label>
                              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                            </div>
                          </div>
                          <button type="submit" className="cd-save-btn" disabled={savingPersonal}>
                            {savingPersonal ? (
                              <Spinner />
                            ) : successPersonal ? (
                              <>
                                <FaCheckCircle /> Saved!
                              </>
                            ) : (
                              <>
                                <FaSave /> Save Changes
                              </>
                            )}
                          </button>
                        </form>
                      </motion.div>
                    )}
                    {activePersonalSection === "badges" && (
                      <motion.div key="badges" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 className="cd-prof-section-title">Badges & Trust Score</h2>
                        {badgeLoading ? (
                          <div className="cd-loading">
                            <Spinner />
                          </div>
                        ) : (
                          <>
                            {trust?.trust_score && (
                              <div className="cd-card" style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <span style={{ fontSize: 28 }}>{tierIcon}</span>
                                    <p style={{ color: tierColor, fontWeight: 700, margin: "4px 0 0" }}>{tierName} Tier</p>
                                  </div>
                                  <div className="cd-trust-circle">
                                    <span className="cd-trust-num" style={{ color: tierColor }}>
                                      {trustPoints}
                                    </span>
                                    <span className="cd-trust-sub">pts</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {resolvedBadge && (
                              <div className="cd-card" style={{ borderColor: resolvedBadge.color + "44", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
                                <span style={{ fontSize: 40 }}>{resolvedBadge.icon}</span>
                                <div>
                                  <p style={{ fontWeight: 700, color: "#f0f9ff", margin: "0 0 4px" }}>{resolvedBadge.name}</p>
                                  <p style={{ fontSize: 13, color: "rgba(240,249,255,.5)", margin: "0 0 8px" }}>{resolvedBadge.description}</p>
                                  {latestBadge?.earned_at && <p style={{ fontSize: 12, color: "rgba(240,249,255,.35)", margin: 0 }}>Earned {new Date(latestBadge.earned_at).toLocaleDateString()}</p>}
                                </div>
                              </div>
                            )}
                            {badges.length === 0 && !resolvedBadge && (
                              <div className="cd-empty-state">
                                <span style={{ fontSize: 40 }}>🏅</span>
                                <p>No badges earned yet.</p>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                    {activePersonalSection === "referral" && (
                      <motion.div key="ref" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 className="cd-prof-section-title">Refer & Earn</h2>
                        <div className="cd-card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                          <div style={{ textAlign: "center" }}>
                            <span style={{ fontSize: 36, fontWeight: 800, color: "#00f2ff", display: "block" }}>{referralData.available_credits}</span>
                            <span style={{ fontSize: 12, color: "rgba(240,249,255,.4)" }}>Credits</span>
                          </div>
                          <p style={{ fontSize: 13, color: "rgba(240,249,255,.55)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                            Share your referral code — when friends sign up, you both get discount credits!
                          </p>
                        </div>
                        <div className="cd-field" style={{ marginBottom: 16 }}>
                          <label>Your Referral Code</label>
                          <div style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1, background: "rgba(0,242,255,.07)", border: "1px solid rgba(0,242,255,.2)", borderRadius: 10, padding: "12px 16px" }}>
                              <span style={{ fontSize: 18, fontWeight: 800, color: "#00f2ff", letterSpacing: "0.08em" }}>{referralData.my_referral_code || "—"}</span>
                            </div>
                            <button className="cd-save-btn" onClick={handleCopy} style={{ padding: "10px 16px" }} type="button">
                              {codeCopied ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(240,249,255,.4)", display: "flex", alignItems: "center", gap: 8 }}>ℹ️ Credits applied automatically on your next billing cycle.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>
            )}
            <AnimatePresence>
              {showLogout && (
                <motion.div className="cd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogout(false)}>
                  <motion.div className="cd-modal" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#f0f9ff", margin: "0 0 8px", textAlign: "center" }}>Logout?</p>
                    <p style={{ fontSize: 14, color: "rgba(240,249,255,.5)", margin: "0 0 24px", textAlign: "center" }}>You'll need to sign in again.</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="cd-toggle-btn" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>
                        Cancel
                      </button>
                      <button
                        className="cd-save-btn"
                        style={{ flex: 1, background: "rgba(248,113,113,.12)", borderColor: "rgba(248,113,113,.3)", color: "#f87171", justifyContent: "center" }}
                        onClick={() => {
                          logout();
                          navigate("/login");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {profileMode === "business" && (
          <motion.div key="business" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="cd-prof-section-title">Business Profile</h2>
            {loadingBusiness ? (
              <div className="cd-loading">
                <Spinner />
              </div>
            ) : (
              <form onSubmit={saveBusiness} className="cd-form">
                <div className="cd-field">
                  <label>Company Name *</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div className="cd-field">
                  <label>Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                </div>
                <div className="cd-form-grid">
                  <div className="cd-field">
                    <label>
                      <FaGlobe /> Website
                    </label>
                    <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
                  </div>
                  <div className="cd-field">
                    <label>
                      <FaInstagram /> Instagram
                    </label>
                    <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
                  </div>
                  <div className="cd-field">
                    <label>
                      <FaFacebook /> Facebook
                    </label>
                    <input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                  </div>
                </div>
                <div className="cd-field">
                  <label>Cancellation Policy</label>
                  <textarea value={policy} onChange={(e) => setPolicy(e.target.value)} rows={2} />
                </div>
                <div className="cd-toggle-field">
                  <span>Auto-accept bookings</span>
                  <button type="button" className="cd-toggle-switch" onClick={() => setAutoAccept((v) => !v)}>
                    {autoAccept ? <FaToggleOn className="cd-toggle-on" /> : <FaToggleOff className="cd-toggle-off" />}
                  </button>
                </div>
                <button type="submit" className="cd-save-btn" disabled={savingBusiness}>
                  {savingBusiness ? (
                    <Spinner />
                  ) : successBusiness ? (
                    <>
                      <FaCheckCircle /> Saved!
                    </>
                  ) : (
                    <>
                      <FaSave /> {isEdit ? "Update Business" : "Create Profile"}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════
const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <FaBriefcase /> },
  { key: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
  { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
  { key: "profile", label: "Profile", icon: <FaUser /> },
];

export default function ConsultantDashboard() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Read active tab from URL query param so FloatingNav can control it
  const params = new URLSearchParams(location.search);
  const tabFromUrl = params.get("tab");
  const activeTab = TABS.find((t) => t.key === tabFromUrl) ? tabFromUrl : "dashboard";

  const setActiveTab = (key) => {
    navigate(`/consultant-dashboard${key !== "dashboard" ? "?tab=" + key : ""}`, { replace: true });
  };

  return (
    <div className="cd-wrapper">
      <div className="cd-bg" />
      <div className="cd-container">
        <motion.header className="cd-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="cd-eyebrow">AquaAI Consultant</p>
            <h1 className="cd-title">Intelligence Center</h1>
            <p className="cd-subtitle">Manage appointments, analytics, and your consulting business.</p>
          </div>
          <div className="cd-header-icon">
            <FaBriefcase />
          </div>
        </motion.header>

        <div className="cd-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={"cd-tab " + (activeTab === t.key ? "cd-tab--active" : "")} onClick={() => setActiveTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="cd-tab-content">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DashboardTab token={token} />
              </motion.div>
            )}
            {activeTab === "calendar" && (
              <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CalendarTab token={token} />
              </motion.div>
            )}
            {activeTab === "analytics" && (
              <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalyticsTab token={token} />
              </motion.div>
            )}
            {activeTab === "profile" && (
              <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileTab token={token} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
