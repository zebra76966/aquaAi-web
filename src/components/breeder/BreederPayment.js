/**
 * BreederPayment.js
 *
 * Rendered at /breeder/:breederId/payments/
 *
 * Flow:
 *  1. Read `breederId` from the URL and check that breeder's subscription
 *     status via GET /subscription/breeder/<breeder_id>/status/
 *  2. If there's no active subscription (status/plan come back null or
 *     "no_subscription"), fetch the available plans and let the breeder
 *     pick one and subscribe — same plan-picker + subscribe flow used in
 *     BreederApply's "Choose a Plan" step.
 *  3. If a subscription is already active, just show its details instead
 *     of the picker.
 */
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "react-bootstrap";
import { FaCheckCircle, FaShieldAlt, FaCrown, FaGem, FaCheck, FaTimes, FaBolt, FaExclamationTriangle } from "react-icons/fa";
import { RiCalendarLine, RiVipCrownLine, RiCoinsLine } from "react-icons/ri";
import { baseUrl } from "../auth/config";
import "./BreederApply.css";
import ThemeToggle from "../ThemeToggle";
import { AuthContext } from "../auth/authcontext";

/* ─────────────────────────────────────────────────────
   PLAN CARD — same visual language as BreederApply
───────────────────────────────────────────────────── */
const PLAN_ICONS = { premium: FaGem, pro: FaCrown };
const PLAN_COLORS = { premium: { from: "#6366f1", to: "#7c3aed", glow: "rgba(99,102,241,0.3)" }, pro: { from: "#f59e0b", to: "#ea580c", glow: "rgba(245,158,11,0.3)" } };

const FEATURE_LABELS = {
  max_habitats: "Habitats",
  allow_pond: "Pond support",
  disease_detection: "Disease detection",
  water_parameter_interpretation: "Water parameter AI",
  ai_chat: "AI Chat",
  ai_chat_monthly_limit: "Monthly AI messages",
  ai_maintenance_suggestions: "Maintenance suggestions",
  historical_tracking: "Historical tracking",
  advanced_analytics: "Advanced analytics",
  preventative_alerts: "Preventative alerts",
  priority_inference: "Priority inference",
  data_export: "Data export",
  marketplace_sell: "Marketplace selling",
  consultant_contact: "Contact consultants",
  consultant_booking: "Book consultants",
  become_consultant: "Become a consultant",
  breeder_contact: "Contact breeders",
  priority_inquiries: "Priority inquiries",
  become_breeder: "Become a breeder",
};

const KEY_FEATURES = ["become_breeder", "priority_inquiries", "marketplace_sell", "ai_chat", "ai_chat_monthly_limit", "disease_detection", "advanced_analytics", "data_export"];

const PlanCard = ({ plan, billing, selected, onSelect }) => {
  const Icon = PLAN_ICONS[plan.key] ?? FaGem;
  const colors = PLAN_COLORS[plan.key] ?? PLAN_COLORS.premium;
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  const isSelected = selected === plan.key;
  const isPro = plan.key === "pro";

  return (
    <motion.div
      className={`br-plan-card ${isSelected ? "selected" : ""} ${isPro ? "featured" : ""}`}
      style={{ "--plan-from": colors.from, "--plan-to": colors.to, "--plan-glow": colors.glow }}
      onClick={() => onSelect(plan.key)}
      whileTap={{ scale: 0.98 }}
    >
      {isPro && <div className="br-plan-badge">Most Popular</div>}

      <div className="br-plan-header">
        <div className="br-plan-icon" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="br-plan-name">{plan.name}</div>
          <div className="br-plan-price">
            <span className="br-plan-amount">£{price?.discounted_price.toFixed(2)}</span>
            <span className="br-plan-period">/ {billing === "monthly" ? "mo" : "yr"}</span>
          </div>
          {price?.original_price > price?.discounted_price && <div className="br-plan-original">£{price.original_price.toFixed(2)}</div>}
        </div>
        <div className={`br-plan-radio ${isSelected ? "checked" : ""}`}>{isSelected && <FaCheck size={10} />}</div>
      </div>

      {billing === "yearly" && plan.yearly?.savings > 0 && (
        <div className="br-plan-savings">
          <FaBolt size={10} /> Save £{plan.yearly.savings.toFixed(2)} ({plan.yearly.savings_percent}% off)
        </div>
      )}
      {plan.isPromo && <div className="br-plan-promo-tag">🔒 Early adopter price — locked in for life</div>}

      <div className="br-plan-features">
        {KEY_FEATURES.map((k) => {
          const val = plan.features?.[k];
          if (val === undefined) return null;
          const isBool = typeof val === "boolean";
          const active = isBool ? val : true;
          return (
            <div key={k} className={`br-plan-feat ${active ? "on" : "off"}`}>
              {active ? <FaCheck size={9} /> : <FaTimes size={9} />}
              <span>
                {FEATURE_LABELS[k] ?? k.replace(/_/g, " ")}
                {!isBool && val != null && <strong> · {val === null ? "∞" : val}</strong>}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────── */
export default function BreederPayment() {
  const { breederId } = useParams();
  const { token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  /* subscription status */
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [needsPlan, setNeedsPlan] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);

  /* plans */
  const [plans, setPlans] = useState([]);
  const [credit, setCredit] = useState(0);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);

  /* subscribe */
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [checkoutData, setCheckoutData] = useState(null);
  const [success, setSuccess] = useState(false);

  /* ── 1. Check subscription status for this breeder ──────── */
  const fetchStatus = useCallback(async () => {
    if (!breederId) return;
    setStatusLoading(true);
    setStatusError("");
    try {
      const res = await fetch(`${baseUrl}/subscription/breeder/${breederId}/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setStatusError(json?.message || "Could not load subscription status.");
        return;
      }

      const data = json?.data ?? {};
      const hasNoSubscription = data.status === "no_subscription" || data.status == null || data.plan == null || data.is_active !== true;

      if (hasNoSubscription) {
        setNeedsPlan(true);
      } else {
        setActiveSubscription(data);
      }
    } catch (e) {
      setStatusError("Something went wrong while checking your subscription.");
    } finally {
      setStatusLoading(false);
    }
  }, [token, breederId]);

  useEffect(() => {
    if (authLoading) return;
    fetchStatus();
  }, [authLoading, fetchStatus]);

  /* ── 2. Fetch plans once we know a plan is needed ───────── */
  useEffect(() => {
    if (!needsPlan || plans.length > 0) return;
    (async () => {
      setLoadingPlans(true);
      setPlansError("");
      try {
        const res = await fetch(`${baseUrl}/subscription/subscription/breeder/plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const rawPlans = json?.data?.plans ?? [];

        /* Normalise the API shape so PlanCard can read plan.monthly / plan.yearly
           The API returns: standard_pricing.monthly/yearly + promo_pricing.monthly/yearly
           We use promo when available, otherwise standard. */
        const normalisedPlans = rawPlans.map((p) => {
          const usePromo = p.promo_pricing?.is_available === true;
          const mo = usePromo ? p.promo_pricing?.monthly : p.standard_pricing?.monthly;
          const yr = usePromo ? p.promo_pricing?.yearly : p.standard_pricing?.yearly;

          return {
            ...p,
            /* Flat monthly shape PlanCard reads */
            monthly: {
              discounted_price: mo?.discounted_price ?? mo?.original_price ?? 0,
              original_price: usePromo ? (p.standard_pricing?.monthly?.original_price ?? 0) : (mo?.original_price ?? 0),
            },
            /* Flat yearly shape PlanCard reads — includes savings */
            yearly: {
              discounted_price: yr?.discounted_price ?? yr?.original_price ?? 0,
              original_price: usePromo ? (p.standard_pricing?.yearly?.original_price ?? 0) : (yr?.original_price ?? 0),
              savings: yr?.savings ?? 0,
              savings_percent: yr?.savings_percent ?? 0,
            },
            isPromo: usePromo,
          };
        });

        setPlans(normalisedPlans);
        /* your_credit is an object: { available, held, usable } — show usable */
        const creditObj = json?.data?.your_credit;
        setCredit(typeof creditObj === "object" ? (creditObj?.usable ?? 0) : (creditObj ?? 0));
        if (normalisedPlans.length) setSelectedPlan(normalisedPlans[0].key);
      } catch {
        setPlansError("Failed to load subscription plans.");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [needsPlan, token, plans.length]);

  /* ── 3. Subscribe — same pattern as BreederApply ─────────── */
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setSubscribeError("Please choose a subscription plan.");
      return;
    }
    setSubscribing(true);
    setSubscribeError("");
    try {
      const subRes = await fetch(`${baseUrl}/subscription/subscription/breeder/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billing_period: billing, plan_key: selectedPlan }),
      });
      const subJson = await subRes.json();

      if (!subRes.ok) {
        setSubscribeError(subJson.message || "Subscription failed. Please try again.");
        return;
      }

      const checkoutUrl = subJson?.data?.checkout_url ?? subJson?.checkout_url ?? null;

      if (checkoutUrl) {
        setCheckoutData({
          url: checkoutUrl,
          plan_key: subJson?.data?.plan_key ?? selectedPlan,
          billing_period: subJson?.data?.billing_period ?? billing,
          original_price: subJson?.data?.original_price ?? 0,
          discounted_price: subJson?.data?.discounted_price ?? 0,
          credit_used: subJson?.data?.credit_used ?? 0,
          launch_pricing: subJson?.data?.launch_pricing_eligible ?? false,
        });
        return;
      }

      /* No checkout URL — credit covered it fully, subscription is active */
      setSuccess(true);
    } catch (err) {
      setSubscribeError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  /* ── Loading / error states ──────────────────────────────── */
  if (authLoading || statusLoading) {
    return (
      <div className="br-page">
        <div className="br-bg">
          <div className="br-blob br-blob-a" />
          <div className="br-blob br-blob-b" />
        </div>
        <div className="br-plan-loading">
          <Spinner animation="border" style={{ color: "var(--accent)" }} />
          <span>Checking your subscription…</span>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="br-page">
        <div className="br-bg">
          <div className="br-blob br-blob-a" />
          <div className="br-blob br-blob-b" />
        </div>
        <motion.div className="br-success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="br-success-ring" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            <FaExclamationTriangle size={36} />
          </div>
          <h2>Couldn't load your subscription</h2>
          <p style={{ marginBottom: 28, color: "#7a9ab0" }}>{statusError}</p>
          <button className="br-modal-btn-primary" style={{ width: "100%" }} onClick={fetchStatus}>
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Success — subscription just activated ───────────────── */
  if (success) {
    return (
      <div className="br-page">
        <div className="br-bg">
          <div className="br-blob br-blob-a" />
          <div className="br-blob br-blob-b" />
        </div>
        <motion.div className="br-success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="br-success-ring">
            <FaCheckCircle size={44} />
          </div>
          <h2>Subscription Activated!</h2>
          <p style={{ marginBottom: 28, color: "#7a9ab0" }}>Your breeder subscription is now active. You're all set to start selling.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <button
              onClick={() => {
                window.location.href = "aquaproviders://";
              }}
              className="br-modal-btn-primary"
              style={{ width: "100%" }}
            >
              Return to Aqua Providers App
            </button>
            <button className="br-modal-btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/breeder-dashboard")}>
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Checkout / Payment screen (only reached if the API returns
       a Stripe checkout_url — otherwise subscribe activates directly) ── */
  if (checkoutData) {
    const isYearly = checkoutData.billing_period === "yearly";

    return (
      <div className="br-page">
        <div className="br-bg">
          <div className="br-blob br-blob-a" />
          <div className="br-blob br-blob-b" />
        </div>

        <motion.div className="br-success br-checkout" initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 20 }}>
          <div className="br-checkout-header">
            <div className="br-checkout-icon">
              <FaShieldAlt size={32} />
            </div>
            <h2>Almost There</h2>
            <p className="br-checkout-sub">One last step — complete your payment to activate your breeder subscription.</p>
          </div>

          <div className="br-order-summary">
            <p className="br-order-label">Order Summary</p>

            <div className="br-order-row">
              <span>Breeder Plan</span>
              <span className="br-order-cap">{checkoutData.billing_period === "monthly" ? "Monthly" : "Annual"}</span>
            </div>

            {checkoutData.original_price !== checkoutData.discounted_price && (
              <div className="br-order-row br-order-row--muted">
                <span>Standard price</span>
                <span className="br-order-strike">£{checkoutData.original_price.toFixed(2)}</span>
              </div>
            )}

            {checkoutData.credit_used > 0 && (
              <div className="br-order-row br-order-row--green">
                <span>Referral credit applied</span>
                <span>−£{checkoutData.credit_used.toFixed(2)}</span>
              </div>
            )}

            {checkoutData.launch_pricing && (
              <div className="br-order-row br-order-row--cyan">
                <span>🔒 Early adopter pricing</span>
                <span>Locked in for life</span>
              </div>
            )}

            <div className="br-order-divider" />

            <div className="br-order-row br-order-total">
              <span>Total due today</span>
              <span className="br-order-amount">
                £{checkoutData.discounted_price.toFixed(2)}
                <small>/{isYearly ? "yr" : "mo"}</small>
              </span>
            </div>
          </div>

          <div className="br-checkout-actions">
            <a href={checkoutData.url} className="br-checkout-pay-btn" target="_self" rel="noreferrer">
              <FaShieldAlt size={15} />
              Complete Payment — £{checkoutData.discounted_price.toFixed(2)}
            </a>
            <p className="br-checkout-secure">Secured by Stripe · Cancel anytime</p>
            <button className="br-checkout-skip" onClick={() => setCheckoutData(null)}>
              Back to plans
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Already subscribed — show current plan instead of a picker ── */
  if (!needsPlan && activeSubscription) {
    return (
      <div className="br-page">
        <div className="br-bg">
          <div className="br-blob br-blob-a" />
          <div className="br-blob br-blob-b" />
        </div>
        <motion.div className="br-success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="br-success-ring">
            <FaCheckCircle size={44} />
          </div>
          <h2>You're Already Subscribed</h2>
          <p style={{ marginBottom: 6, color: "#7a9ab0" }}>
            Plan: <strong style={{ color: "var(--text)" }}>{activeSubscription.plan}</strong> · {activeSubscription.billing_period === "yearly" ? "Annual" : "Monthly"}
          </p>
          {activeSubscription.price != null && <p style={{ marginBottom: 6, color: "#7a9ab0" }}>£{Number(activeSubscription.price).toFixed(2)}</p>}
          {activeSubscription.expires_at && <p style={{ marginBottom: 28, color: "#7a9ab0" }}>Renews / expires {new Date(activeSubscription.expires_at).toLocaleDateString()}</p>}

          <button className="br-modal-btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/breeder-dashboard")}>
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Plan picker ──────────────────────────────────────────── */
  return (
    <div className="br-page">
      <div className="br-bg">
        <div className="br-blob br-blob-a" />
        <div className="br-blob br-blob-b" />
        <div className="br-grid" />
      </div>
      <div className="br-theme-btn">
        <ThemeToggle />
      </div>

      <div className="br-layout">
        <motion.div className="br-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="br-panel-head">
            <div className="br-panel-icon">
              <FaCrown size={18} />
            </div>
            <div>
              <h2 className="br-panel-title">Choose a Plan</h2>
              <p className="br-panel-sub">Activate your breeder subscription to start selling</p>
            </div>
          </div>

          <div className="br-panel-body">
            {credit > 0 && (
              <div className="br-credit-banner">
                <RiCoinsLine size={16} />
                <span>
                  You have <strong>£{credit.toFixed(2)}</strong> referral credit — applied automatically at checkout
                </span>
              </div>
            )}

            <div className="br-billing-toggle">
              <button className={`br-billing-btn ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>
                <RiCalendarLine size={13} /> Monthly
              </button>
              <button className={`br-billing-btn ${billing === "yearly" ? "active" : ""}`} onClick={() => setBilling("yearly")}>
                <RiVipCrownLine size={13} /> Yearly
                <span className="br-billing-save">Save up to 20%</span>
              </button>
            </div>

            {loadingPlans ? (
              <div className="br-plan-loading">
                <Spinner animation="border" style={{ color: "var(--accent)" }} />
                <span>Loading plans…</span>
              </div>
            ) : plansError ? (
              <div className="br-plan-empty">{plansError}</div>
            ) : plans.length === 0 ? (
              <div className="br-plan-empty">No plans available. Please try again.</div>
            ) : (
              <div className="br-plans-grid">
                {plans.map((plan) => (
                  <PlanCard key={plan.key} plan={plan} billing={billing} selected={selectedPlan} onSelect={setSelectedPlan} />
                ))}
              </div>
            )}
          </div>

          {subscribeError && (
            <motion.div className="br-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              ⚠️ {subscribeError}
            </motion.div>
          )}

          <div className="br-actions">
            <div style={{ flex: 1 }} />
            <button className="br-btn-submit" onClick={handleSubscribe} disabled={subscribing || loadingPlans || !selectedPlan}>
              {subscribing ? (
                <>
                  <Spinner size="sm" animation="border" /> Processing…
                </>
              ) : (
                <>
                  <FaCrown size={13} /> Subscribe Now
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
