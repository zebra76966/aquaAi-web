/**
 * ProviderApplicationStatus.js
 *
 * Cases:
 *  1 — Neither applied            → Choose Your Path
 *  2 — Applied, nothing approved  → Status cards + pending UI
 *  3 — Only Consultant approved   → Go to Consultant Dashboard
 *  4a — Breeder approved + payment done   → Go to Breeder Dashboard
 *  4b — Breeder approved + payment MISSING → Payment recovery flow
 *  5 — Both approved              → Pick which dashboard
 */
import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "react-bootstrap";
import { FiCheckCircle, FiClock, FiXCircle, FiHelpCircle, FiBriefcase, FiAlertCircle, FiLogOut, FiArrowRight, FiExternalLink, FiGrid, FiCreditCard } from "react-icons/fi";
import { FaCheck, FaTimes, FaBolt, FaShieldAlt, FaGem, FaCrown, FaBolt as FaBoltIcon } from "react-icons/fa";
import { RiCalendarLine, RiVipCrownLine } from "react-icons/ri";
import { IoFishSharp } from "react-icons/io5";
import { AuthContext } from "./authcontext";
import { baseUrl } from "./config";
import "./ProviderApplicationStatus.css";

const PROVIDER_APP_SCHEME = "aquaproviders://";

/* ── Status metadata ── */
function statusMeta(status) {
  switch (status) {
    case "approved":
      return { icon: FiCheckCircle, color: "#00d4ff", label: "Approved" };
    case "pending":
      return { icon: FiClock, color: "#f0a500", label: "Under Review" };
    case "rejected":
      return { icon: FiXCircle, color: "#ff4d4d", label: "Not Approved" };
    default:
      return { icon: FiHelpCircle, color: "#7a9ab0", label: "Not Applied" };
  }
}

/* ── Status card ── */
function StatusCard({ type, status, message }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <motion.div className={`pas-status-card pas-status-card--${status || "none"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="pas-status-icon-wrap" style={{ color: meta.color }}>
        <Icon size={28} />
      </div>
      <div className="pas-status-info">
        <p className="pas-status-type">{type}</p>
        <p className="pas-status-label" style={{ color: meta.color }}>
          {meta.label}
        </p>
        {message && <p className="pas-status-msg">{message}</p>}
      </div>
    </motion.div>
  );
}

/* ── Role choice card ── */
function RoleCard({ icon: Icon, title, desc, onClick }) {
  return (
    <motion.button className="pas-role-card" onClick={onClick} whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <div className="pas-role-icon">
        <Icon size={26} />
      </div>
      <h3 className="pas-role-title">{title}</h3>
      <p className="pas-role-desc">{desc}</p>
      <FiArrowRight className="pas-role-arrow" />
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════
   BREEDER PAYMENT RECOVERY FLOW
   Shown when breeder is approved but is_payment_completed=false.
   Fetches plans → billing toggle → plan card → subscribe → checkout screen.
   ════════════════════════════════════════════════════════════ */
function BreederPaymentFlow({ token, onPayLater }) {
  const [step, setStep] = useState("plans"); // "plans" | "checkout"
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [credit, setCredit] = useState(0);
  const [error, setError] = useState("");

  /* Fetch breeder plans */
  useEffect(() => {
    (async () => {
      try {
        setLoadingPlans(true);
        const res = await fetch(`${baseUrl}/subscription/subscription/breeder/plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const rawPlans = json?.data?.plans ?? [];

        const normalised = rawPlans.map((p) => {
          const usePromo = p.promo_pricing?.is_available === true;
          const mo = usePromo ? p.promo_pricing?.monthly : p.standard_pricing?.monthly;
          const yr = usePromo ? p.promo_pricing?.yearly : p.standard_pricing?.yearly;
          return {
            ...p,
            monthly: {
              discounted_price: mo?.discounted_price ?? mo?.original_price ?? 0,
              original_price: usePromo ? (p.standard_pricing?.monthly?.original_price ?? 0) : (mo?.original_price ?? 0),
            },
            yearly: {
              discounted_price: yr?.discounted_price ?? yr?.original_price ?? 0,
              original_price: usePromo ? (p.standard_pricing?.yearly?.original_price ?? 0) : (yr?.original_price ?? 0),
              savings: yr?.savings ?? 0,
              savings_percent: yr?.savings_percent ?? 0,
            },
            isPromo: usePromo,
          };
        });

        setPlans(normalised);
        const creditObj = json?.data?.your_credit;
        setCredit(typeof creditObj === "object" ? (creditObj?.usable ?? 0) : (creditObj ?? 0));
        if (normalised.length) setSelectedPlan(normalised[0].key);
      } catch {
        setError("Could not load plans. Please try again.");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [token]);

  /* Subscribe and get checkout URL */
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribing(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/subscription/subscription/breeder/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billing_period: billing, plan_key: selectedPlan }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Could not start checkout.");
        return;
      }

      const checkoutUrl = json?.data?.checkout_url ?? null;
      if (checkoutUrl) {
        setCheckoutData({
          url: checkoutUrl,
          billing_period: json?.data?.billing_period ?? billing,
          original_price: json?.data?.original_price ?? 0,
          discounted_price: json?.data?.discounted_price ?? 0,
          credit_used: json?.data?.credit_used ?? 0,
          launch_pricing: json?.data?.launch_pricing_eligible ?? false,
        });
        setStep("checkout");
      } else {
        /* Credit covered it fully */
        onPayLater();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  /* ── Checkout screen ── */
  if (step === "checkout" && checkoutData) {
    const isYearly = checkoutData.billing_period === "yearly";
    return (
      <motion.div className="pas-payment-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Warning badge */}
        <div className="pas-payment-alert">
          <FiCreditCard size={16} />
          <span>Your previous payment didn't complete — finish it below to activate your account.</span>
        </div>

        {/* Order summary */}
        <div className="pas-order-summary">
          <p className="pas-order-label">Order Summary</p>

          <div className="pas-order-row">
            <span>Breeder Plan</span>
            <span className="pas-order-cap">{isYearly ? "Annual" : "Monthly"}</span>
          </div>

          {checkoutData.original_price !== checkoutData.discounted_price && (
            <div className="pas-order-row pas-order-row--muted">
              <span>Standard price</span>
              <span className="pas-order-strike">£{checkoutData.original_price.toFixed(2)}</span>
            </div>
          )}

          {checkoutData.credit_used > 0 && (
            <div className="pas-order-row pas-order-row--green">
              <span>Credit applied</span>
              <span>−£{checkoutData.credit_used.toFixed(2)}</span>
            </div>
          )}

          {checkoutData.launch_pricing && (
            <div className="pas-order-row pas-order-row--cyan">
              <span>🔒 Early adopter pricing</span>
              <span>Locked in for life</span>
            </div>
          )}

          <div className="pas-order-divider" />

          <div className="pas-order-row pas-order-total">
            <span>Total due today</span>
            <span className="pas-order-amount">
              £{checkoutData.discounted_price.toFixed(2)}
              <small>/{isYearly ? "yr" : "mo"}</small>
            </span>
          </div>
        </div>

        {/* CTA */}
        <a href={checkoutData.url} className="pas-pay-btn" target="_self" rel="noreferrer">
          <FaShieldAlt size={14} />
          Complete Payment — £{checkoutData.discounted_price.toFixed(2)}
        </a>
        <p className="pas-pay-secure">Secured by Stripe · Cancel anytime</p>
        <button className="pas-pay-later" onClick={onPayLater}>
          Pay later — View status
        </button>
      </motion.div>
    );
  }

  /* ── Plan selector ── */
  return (
    <motion.div className="pas-payment-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Warning */}
      <div className="pas-payment-alert">
        <FiCreditCard size={16} />
        <span>Your breeder account is approved but payment is incomplete. Complete payment to activate.</span>
      </div>

      {error && (
        <div className="pas-alert pas-alert--error" style={{ marginBottom: 12 }}>
          <FiAlertCircle /> <span>{error}</span>
        </div>
      )}

      {credit > 0 && (
        <div className="pas-credit-banner">
          <span>
            💳 You have <strong>£{credit.toFixed(2)}</strong> referral credit — applied automatically at checkout
          </span>
        </div>
      )}

      {/* Billing toggle */}
      <div className="pas-billing-toggle">
        <button className={`pas-billing-btn${billing === "monthly" ? " active" : ""}`} onClick={() => setBilling("monthly")}>
          <RiCalendarLine size={13} /> Monthly
        </button>
        <button className={`pas-billing-btn${billing === "yearly" ? " active" : ""}`} onClick={() => setBilling("yearly")}>
          <RiVipCrownLine size={13} /> Yearly
          <span className="pas-billing-save">Save up to 20%</span>
        </button>
      </div>

      {/* Plans */}
      {loadingPlans ? (
        <div className="pas-plan-loading">
          <Spinner animation="border" size="sm" style={{ color: "#00d4ff" }} />
          <span>Loading plans…</span>
        </div>
      ) : plans.length === 0 ? (
        <p style={{ color: "#7a9ab0", textAlign: "center", fontSize: 14 }}>No plans available. Please try again.</p>
      ) : (
        <div className="pas-plans">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly;
            const isSel = selectedPlan === plan.key;
            return (
              <div key={plan.key} className={`pas-plan-card${isSel ? " selected" : ""}`} onClick={() => setSelectedPlan(plan.key)}>
                <div className="pas-plan-row">
                  <div>
                    <p className="pas-plan-name">{plan.name}</p>
                    <div className="pas-plan-price-row">
                      <span className="pas-plan-price">£{price.discounted_price.toFixed(2)}</span>
                      <span className="pas-plan-period">/ {billing === "monthly" ? "mo" : "yr"}</span>
                      {price.original_price > price.discounted_price && <span className="pas-plan-orig">£{price.original_price.toFixed(2)}</span>}
                    </div>
                    {billing === "yearly" && plan.yearly?.savings > 0 && (
                      <p className="pas-plan-saving">
                        Save £{plan.yearly.savings.toFixed(2)} ({plan.yearly.savings_percent}% off)
                      </p>
                    )}
                  </div>
                  <div className={`pas-plan-radio${isSel ? " checked" : ""}`}>{isSel && <FaCheck size={10} />}</div>
                </div>
                {plan.isPromo && <p className="pas-plan-promo">🔒 Early adopter price — locked in for life</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Subscribe button */}
      <button
        className="pas-return-btn pas-return-btn--primary"
        onClick={handleSubscribe}
        disabled={subscribing || !selectedPlan}
        style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {subscribing ? (
          <>
            <Spinner animation="border" size="sm" /> Processing…
          </>
        ) : (
          <>
            <FiCreditCard size={15} /> Proceed to Payment
          </>
        )}
      </button>

      <button className="pas-pay-later" onClick={onPayLater} style={{ marginTop: 8 }}>
        Pay later — View application status
      </button>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function ProviderApplicationStatus() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consultantStatus, setConsultantStatus] = useState(null);
  const [breederStatus, setBreederStatus] = useState(null);
  const [consultantMsg, setConsultantMsg] = useState("");
  const [breederMsg, setBreederMsg] = useState("");
  const [breederPaymentDone, setBreederPaymentDone] = useState(true); // default true — only false when API says so
  const [showPaymentFlow, setShowPaymentFlow] = useState(false); // user dismissed payment alert

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cRes, bRes] = await Promise.all([
          fetch(`${baseUrl}/consultants/application/status/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/breeders/application/status/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (cRes.status === 401 || bRes.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        const cJson = await cRes.json().catch(() => null);
        const bJson = await bRes.json().catch(() => null);

        const cStatus = cRes.ok ? (cJson?.data?.status?.admin_status ?? cJson?.data?.status?.application_status ?? "not_applied") : "not_applied";
        const bStatus = bRes.ok ? (bJson?.data?.status?.admin_status ?? bJson?.data?.status?.application_status ?? "not_applied") : "not_applied";

        setConsultantStatus(cStatus);
        setBreederStatus(bStatus);
        setConsultantMsg(cJson?.data?.message || "");
        setBreederMsg(bJson?.data?.message || "");

        /* Read is_payment_completed from the breeder response */
        const paymentDone = bJson?.data?.status?.is_payment_completed;

        /* Only mark as incomplete when the field is explicitly false */
        if (paymentDone === false) {
          setBreederPaymentDone(false);
          setShowPaymentFlow(true); // auto-open the payment recovery flow
        }
      } catch {
        setError("Could not load application status. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const goToDashboard = (role) => {
    const currentRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    if (!currentRoles.includes(role)) {
      localStorage.setItem("userRoles", JSON.stringify([...currentRoles, role]));
    }
    navigate(role === "breeder" ? "/breeder-dashboard" : "/consultant-dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const openProviderApp = () => {
    window.location.href = PROVIDER_APP_SCHEME;
  };

  /* ── Derived ── */
  const noneApplied = consultantStatus === "not_applied" && breederStatus === "not_applied";
  const consultantApproved = consultantStatus === "approved";
  const breederApproved = breederStatus === "approved";
  const bothApproved = consultantApproved && breederApproved;
  const onlyConsultant = consultantApproved && !breederApproved;
  const onlyBreeder = breederApproved && !consultantApproved;
  const hasAnyApproval = consultantApproved || breederApproved;
  const showCStatus = consultantStatus && consultantStatus !== "not_applied";
  const showBStatus = breederStatus && breederStatus !== "not_applied";
  const canApplyConsult = consultantStatus === "not_applied";
  const canApplyBreeder = breederStatus === "not_applied";
  const pendingOnly = !noneApplied && !hasAnyApproval;

  /* Breeder approved but payment missing and flow is active */
  /* Payment is needed when breeder is approved OR pending, payment is incomplete, and flow is shown */
  const breederNeedsPayment = (breederApproved || breederStatus === "pending") && !breederPaymentDone;
  const needsBreederPayment = breederNeedsPayment && showPaymentFlow;

  if (loading) {
    return (
      <div className="pas-page">
        <div className="pas-bg">
          <div className="pas-orb pas-orb-a" />
          <div className="pas-orb pas-orb-b" />
        </div>
        <div className="pas-loader">
          <Spinner animation="border" style={{ color: "#00d4ff" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="pas-page">
      <div className="pas-bg">
        <div className="pas-orb pas-orb-a" />
        <div className="pas-orb pas-orb-b" />
        <div className="pas-grid" />
      </div>

      <div className="pas-topbar">
        <div className="pas-logo">
          <img src="/favicon32.png" alt="AquaAI" className="pas-logo-img" />
          <span>AquaAI</span>
        </div>
        <button className="pas-logout-btn" onClick={handleLogout}>
          <FiLogOut size={15} /> Sign out
        </button>
      </div>

      <div className="pas-center">
        <motion.div className="pas-card" initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          {error && (
            <div className="pas-alert pas-alert--error">
              <FiAlertCircle /> <span>{error}</span>
            </div>
          )}

          {/* ── CASE 1: Neither applied ── */}
          {noneApplied && (
            <>
              <div className="pas-header">
                <div className="pas-icon-wrap">
                  <IoFishSharp size={28} />
                </div>
                <h1 className="pas-title">Choose Your Path</h1>
                <p className="pas-subtitle">How would you like to join Aqua AI as a provider?</p>
              </div>
              <div className="pas-roles">
                <RoleCard icon={FiBriefcase} title="Apply as Consultant" desc="Offer aquatic services, manage bookings, and grow your professional business." onClick={() => navigate("/consultant")} />
                <RoleCard icon={IoFishSharp} title="Apply as Breeder" desc="List your stock, manage enquiries, and build your breeder brand." onClick={() => navigate("/breeder")} />
              </div>
            </>
          )}

          {/* ── CASE 2: Applied but nothing approved yet ── */}
          {pendingOnly && (
            <>
              <div className="pas-header">
                <div className="pas-icon-wrap">
                  <FiClock size={28} />
                </div>
                <h1 className="pas-title">Application Status</h1>
                <p className="pas-subtitle">Here's where things stand with your applications.</p>
              </div>
              <div className="pas-statuses">
                {showCStatus && <StatusCard type="Consultant" status={consultantStatus} message={consultantMsg} />}
                {showBStatus && <StatusCard type="Breeder" status={breederStatus} message={breederMsg} />}
              </div>
              {(canApplyConsult || canApplyBreeder) && (
                <div className="pas-also-apply">
                  <p className="pas-also-label">Also interested in…</p>
                  <div className="pas-roles pas-roles--compact">
                    {canApplyConsult && <RoleCard icon={FiBriefcase} title="Apply as Consultant" desc="Offer services, manage bookings." onClick={() => navigate("/consultant")} />}
                    {canApplyBreeder && <RoleCard icon={IoFishSharp} title="Apply as Breeder" desc="List stock, manage enquiries." onClick={() => navigate("/breeder")} />}
                  </div>
                </div>
              )}
              {/* Payment flow for pending breeder with incomplete payment */}
              {breederStatus === "pending" &&
                !breederPaymentDone &&
                (showPaymentFlow ? (
                  <BreederPaymentFlow token={token} onPayLater={() => setShowPaymentFlow(false)} />
                ) : (
                  <button className="pas-return-btn pas-return-btn--warn" onClick={() => setShowPaymentFlow(true)} style={{ marginTop: 4 }}>
                    <FiCreditCard size={15} /> Complete Payment While You Wait
                  </button>
                ))}

              <div className="pas-return">
                <button className="pas-return-btn pas-return-btn--primary" onClick={openProviderApp}>
                  <FiExternalLink size={15} /> Return to Aqua Providers App
                </button>
              </div>
            </>
          )}

          {/* ── CASE 3: Only Consultant approved ── */}
          {onlyConsultant && (
            <>
              <div className="pas-header">
                <div className="pas-icon-wrap pas-icon-wrap--success">
                  <FiCheckCircle size={28} />
                </div>
                <h1 className="pas-title">Consultant Approved!</h1>
                <p className="pas-subtitle">Your consultant application has been approved. Ready to get started?</p>
              </div>
              <div className="pas-statuses">
                <StatusCard type="Consultant" status="approved" message={consultantMsg} />
                {showBStatus && <StatusCard type="Breeder" status={breederStatus} message={breederMsg} />}
              </div>

              {/* Breeder pending + payment incomplete — show payment flow here too */}
              {breederStatus === "pending" &&
                !breederPaymentDone &&
                (showPaymentFlow ? (
                  <BreederPaymentFlow token={token} onPayLater={() => setShowPaymentFlow(false)} />
                ) : (
                  <button className="pas-return-btn pas-return-btn--warn" onClick={() => setShowPaymentFlow(true)} style={{ marginTop: 4 }}>
                    <FiCreditCard size={15} /> Complete Breeder Payment While You Wait
                  </button>
                ))}

              {canApplyBreeder && (
                <div className="pas-also-apply">
                  <p className="pas-also-label">Also interested in…</p>
                  <div className="pas-roles pas-roles--compact">
                    <RoleCard icon={IoFishSharp} title="Apply as Breeder" desc="List stock, manage enquiries." onClick={() => navigate("/breeder")} />
                  </div>
                </div>
              )}
              <div className="pas-return">
                <button className="pas-return-btn pas-return-btn--primary" onClick={() => goToDashboard("consultant")}>
                  <FiGrid size={15} /> Go to Consultant Dashboard
                </button>
                <button className="pas-return-btn pas-return-btn--ghost" onClick={openProviderApp}>
                  <FiExternalLink size={15} /> Return to Aqua Providers App
                </button>
              </div>
            </>
          )}

          {/* ── CASE 4: Only Breeder approved ── */}
          {onlyBreeder && (
            <>
              <div className="pas-header">
                <div className="pas-icon-wrap pas-icon-wrap--success">
                  <FiCheckCircle size={28} />
                </div>
                <h1 className="pas-title">Breeder Approved!</h1>
                <p className="pas-subtitle">
                  {needsBreederPayment ? "Your application is approved — complete your payment to activate your account." : "Your breeder application has been approved. Ready to get started?"}
                </p>
              </div>

              <div className="pas-statuses">
                {showCStatus && <StatusCard type="Consultant" status={consultantStatus} message={consultantMsg} />}
                <StatusCard type="Breeder" status="approved" message={breederMsg} />
              </div>

              {/* Payment recovery flow when is_payment_completed === false */}
              {needsBreederPayment ? (
                <BreederPaymentFlow token={token} onPayLater={() => setShowPaymentFlow(false)} />
              ) : (
                <>
                  {/* Incomplete payment banner (dismissed state) */}
                  {!breederPaymentDone && !showPaymentFlow && (
                    <button className="pas-return-btn pas-return-btn--warn" onClick={() => setShowPaymentFlow(true)} style={{ marginBottom: 12 }}>
                      <FiCreditCard size={15} /> Complete Payment to Activate
                    </button>
                  )}

                  {canApplyConsult && (
                    <div className="pas-also-apply">
                      <p className="pas-also-label">Also interested in…</p>
                      <div className="pas-roles pas-roles--compact">
                        <RoleCard icon={FiBriefcase} title="Apply as Consultant" desc="Offer services, manage bookings." onClick={() => navigate("/consultant")} />
                      </div>
                    </div>
                  )}

                  <div className="pas-return">
                    <button
                      className="pas-return-btn pas-return-btn--primary"
                      onClick={() => goToDashboard("breeder")}
                      disabled={!breederPaymentDone}
                      title={!breederPaymentDone ? "Complete payment first" : ""}
                    >
                      <FiGrid size={15} /> Go to Breeder Dashboard
                    </button>
                    <button className="pas-return-btn pas-return-btn--ghost" onClick={openProviderApp}>
                      <FiExternalLink size={15} /> Return to Aqua Providers App
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── CASE 5: Both approved ── */}
          {bothApproved && (
            <>
              <div className="pas-header">
                <div className="pas-icon-wrap pas-icon-wrap--success">
                  <FiCheckCircle size={28} />
                </div>
                <h1 className="pas-title">Both Approved!</h1>
                <p className="pas-subtitle">
                  {needsBreederPayment
                    ? "Consultant approved and ready. Complete breeder payment to unlock the breeder dashboard."
                    : "Both applications are approved. Which dashboard would you like to open?"}
                </p>
              </div>

              <div className="pas-statuses">
                <StatusCard type="Consultant" status="approved" message={consultantMsg} />
                <StatusCard type="Breeder" status="approved" message={breederMsg} />
              </div>

              {/* Breeder payment recovery if needed */}
              {needsBreederPayment && <BreederPaymentFlow token={token} onPayLater={() => setShowPaymentFlow(false)} />}

              <div className="pas-return" style={{ marginTop: needsBreederPayment ? 16 : 0 }}>
                <button className="pas-return-btn pas-return-btn--primary" onClick={() => goToDashboard("consultant")}>
                  <FiBriefcase size={15} /> Go to Consultant Dashboard
                </button>
                {(!needsBreederPayment || !showPaymentFlow) && (
                  <>
                    {!breederPaymentDone && !showPaymentFlow ? (
                      <button className="pas-return-btn pas-return-btn--warn" onClick={() => setShowPaymentFlow(true)}>
                        <FiCreditCard size={15} /> Complete Breeder Payment
                      </button>
                    ) : (
                      <button className="pas-return-btn pas-return-btn--primary pas-return-btn--teal" onClick={() => goToDashboard("breeder")} disabled={!breederPaymentDone}>
                        <IoFishSharp size={15} /> Go to Breeder Dashboard
                      </button>
                    )}
                  </>
                )}
                <button className="pas-return-btn pas-return-btn--ghost" onClick={openProviderApp}>
                  <FiExternalLink size={15} /> Return to Aqua Providers App
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
