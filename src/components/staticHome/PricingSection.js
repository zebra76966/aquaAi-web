import "./PricingSection.css";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { FiCheck, FiLock, FiX, FiAlertCircle } from "react-icons/fi";
import FishModel from "./FishModel";
import { useNavigate } from "react-router-dom";

/* ── API ─────────────────────────────────────────────── */
const API_BASE = "https://api.aquaai.uk/api/v1";
const PLANS_URL = `${API_BASE}/subscription/subscription/public-plans/`;

/* ── Fish for promo banner (same pattern as CTABanner) ── */
function SwimmingFish({ speed = 1, radius = 1.2, phaseOffset = 0 }) {
  const groupRef = useRef();
  const t = useRef(phaseOffset);

  useFrame((_, delta) => {
    t.current += delta * speed * 0.4;
    if (!groupRef.current) return;
    const denom = 1 + Math.sin(t.current) ** 2;
    const x = (radius * Math.cos(t.current)) / denom;
    const z = (radius * Math.sin(t.current) * Math.cos(t.current)) / denom;
    const dx = -(radius * Math.sin(t.current) * (2 + Math.sin(t.current) ** 2)) / denom ** 2;
    const dz = (radius * Math.cos(2 * t.current)) / denom;
    groupRef.current.position.set(x, 0, z);
    groupRef.current.rotation.set(0, Math.atan2(dx, dz), 0);
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      <FishModel animationSpeed={speed} />
    </group>
  );
}

function BannerFish({ className, speed, phaseOffset }) {
  return (
    <div className={`pb-fish ${className}`}>
      <Canvas camera={{ position: [0, 6, 0], fov: 45, up: [0, 0, -1] }}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-5, 4, -5]} intensity={1} />
        <Suspense fallback={null}>
          <SwimmingFish speed={speed} radius={1.4} phaseOffset={phaseOffset} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ── Promo Banner ─────────────────────────────────────── */
function PromoBanner({ usersPromo, breederPromo, onDismiss }) {
  const hasUserPromo = usersPromo?.available;
  const hasBreederPromo = breederPromo?.available;
  if (!hasUserPromo && !hasBreederPromo) return null;

  return (
    <div className="pb-banner">
      {/* Ripple rings */}
      <div className="pb-ripple pb-ripple--1" />
      <div className="pb-ripple pb-ripple--2" />
      <div className="pb-ripple pb-ripple--3" />

      {/* Fish */}
      <BannerFish className="pb-fish--a" speed={0.85} phaseOffset={0} />
      <BannerFish className="pb-fish--b" speed={1.1} phaseOffset={Math.PI} />

      {/* Content */}
      <div className="pb-content">
        <div className="pb-icon">
          <FiAlertCircle />
        </div>
        <div className="pb-text">
          <p className="pb-headline">Early Adopter Pricing is Live!</p>
          <p className="pb-body">
            {hasUserPromo && (
              <span>
                <strong>{usersPromo.slots_remaining}</strong> user spots remaining at launch price.{" "}
              </span>
            )}
            {hasBreederPromo && (
              <span>
                <strong>{breederPromo.slots_remaining}</strong> breeder spots left.{" "}
              </span>
            )}
            Lock in your rate for life while subscribed.
          </p>
          <div className="pb-lock mt-3">
            <FiLock /> Locked in for life
          </div>
        </div>
      </div>

      {/* Dismiss */}
      <button className="pb-dismiss" onClick={onDismiss} aria-label="Dismiss">
        <FiX />
      </button>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────── */
const fmt = (n) => (n === 0 ? "£0" : `£${Number(n).toFixed(2)}`);

function featureLabel(key, value) {
  const MAP = {
    max_habitats: (v) => `${v} Habitat${v === 1 ? "" : v === "Unlimited" ? "s (inc. Pond)" : "s"}`,
    allow_pond: () => "Pond Support",
    disease_detection: () => "Disease Detection",
    water_parameter_interpretation: () => "Water Parameter Interpretation",
    ai_chat: (_, p) => (p?.ai_chat_monthly_limit ? `AI Chat (${p.ai_chat_monthly_limit}/mo)` : "AI Chat"),
    ai_maintenance_suggestions: () => "AI Maintenance Suggestions",
    historical_tracking: () => "Historical Tracking",
    advanced_analytics: () => "Advanced Analytics",
    preventative_alerts: () => "Preventative Alerts",
    priority_inference: () => "Priority AI Inference",
    data_export: () => "Data Export",
    marketplace_sell: () => "Marketplace — Buy & Sell",
    consultant_booking: () => "Consultant Booking",
    consultant_contact: () => "Direct Consultant Contact",
    breeder_contact: () => "Direct Breeder Contact",
    priority_inquiries: () => "Priority Inquiries",
    become_breeder: () => "Apply as Breeder",
    become_consultant: () => "Apply as Consultant",
    // breeder-specific
    can_list_breeders: () => "List Breeder Stock",
    can_manage_inventory: () => "Manage Inventory",
    priority_breeder_listing: () => "Priority Listing",
    breeder_analytics: () => "Breeder Analytics",
  };
  // Skip false-y values and the raw limit field (shown inside ai_chat label)
  if (key === "ai_chat_monthly_limit") return null;
  if (value === false || value === 0 || value === null) return null;
  const fn = MAP[key];
  return fn ? fn(value) : null;
}

function planFeatureList(features) {
  const items = [];
  Object.entries(features).forEach(([k, v]) => {
    if (k === "breeder_specific" && typeof v === "object") {
      Object.entries(v).forEach(([bk, bv]) => {
        const l = featureLabel(bk, bv, features);
        if (l) items.push(l);
      });
    } else {
      const l = featureLabel(k, v, features);
      if (l) items.push(l);
    }
  });
  return items;
}

/* ── Single Plan Card ─────────────────────────────────── */
function PlanCard({ plan, annual, highlight, popularLabel }) {
  const navigate = useNavigate();

  const pricing = annual ? plan.yearly : plan.monthly;
  const hasPromo = plan.promotion?.available;
  const price = hasPromo ? pricing.promo_price : pricing.discounted_price;
  const origPrice = hasPromo ? pricing.original_price : null;
  const isFree = price === 0 && (!origPrice || origPrice === 0);
  const features = planFeatureList(plan.features);

  return (
    <div className={`pricing-card${highlight ? " pricing-card--highlight" : ""}`}>
      {popularLabel && <div className="pricing-popular">{popularLabel}</div>}

      <h3 className="pricing-plan-name">{plan.name}</h3>

      <div className="pricing-price">
        <span className="pricing-promo">{isFree ? "Free" : fmt(price)}</span>
        {!isFree && origPrice && origPrice !== price && <span className="pricing-orig">{fmt(origPrice)}</span>}
        {!isFree && <span className="pricing-period">{annual ? "/yr" : "/mo"}</span>}
      </div>

      {hasPromo && !isFree && (
        <p className="pricing-promo-note">
          <FiLock size={13} /> Early adopter — {plan.promotion.slots_remaining} spots left. Locked in for life.
        </p>
      )}

      {annual && plan.yearly?.savings > 0 && (
        <p className="pricing-savings">
          Save {fmt(plan.yearly.savings)} ({plan.yearly.savings_percent}%) vs monthly
        </p>
      )}

      <ul className="pricing-features">
        {features.map((f) => (
          <li key={f}>
            <FiCheck className="pricing-check" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          navigate("/register");
        }}
        className={`pricing-cta${highlight ? " pricing-cta--primary" : ""}`}
      >
        {plan.key === "free" ? "Get Started Free" : "Get Started"}
      </button>
    </div>
  );
}

/* ── Tab views ────────────────────────────────────────── */
function UserPlans({ plans, annual }) {
  const userKeys = ["free", "premium", "pro"];
  const userPlans = userKeys.map((k) => plans.find((p) => p.key === k)).filter(Boolean);
  return (
    <div className="pricing-grid">
      {console.log("plans", userPlans)}
      {userPlans.map((plan) => (
        <PlanCard key={plan.key} plan={plan} annual={annual} highlight={plan.key === "premium"} popularLabel={plan.key === "premium" ? "Most Popular" : null} />
      ))}
    </div>
  );
}

function BreederPlan({ plans, annual }) {
  const plan = plans.find((p) => p.key === "breeder");
  if (!plan) return null;
  return (
    <div className="pricing-single-wrap">
      <div className="pricing-card pricing-card--highlight pricing-card--wide">
        <PlanCard plan={plan} annual={annual} highlight popularLabel="Breeder Plan" />
      </div>
    </div>
  );
}

function ConsultantPlan() {
  const features = ["Service listing", "Calendar management", "Booking management", "Client data access", "Analytics dashboard", "Trust intelligence", "10% commission on bookings"];
  return (
    <div className="pricing-single-wrap">
      <div className="pricing-card pricing-card--highlight pricing-card--wide">
        <div className="pricing-popular">Consultant Plan</div>
        <h3 className="pricing-plan-name">Aquatic Professionals</h3>
        <div className="pricing-price">
          <span className="pricing-promo">£0</span>
          <span className="pricing-period"> + 10% commission</span>
        </div>
        <ul className="pricing-features">
          {features.map((f) => (
            <li key={f}>
              <FiCheck className="pricing-check" />
              {f}
            </li>
          ))}
        </ul>
        <button className="pricing-cta pricing-cta--primary">Apply as Consultant</button>
      </div>
    </div>
  );
}

/* ── Main Section ─────────────────────────────────────── */
export default function PricingSection() {
  const [tab, setTab] = useState("users");
  const [annual, setAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  const [promo, setPromo] = useState({ users: null, breeder: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PLANS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setPlans(json.data.plans);
        setPromo({
          users: json.data.users_promo,
          breeder: json.data.breeder_promo,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const anyPromo = promo.users?.available || promo.breeder?.available;

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-inner">
        {/* Promo banner */}
        {!loading && !error && anyPromo && showBanner && <PromoBanner usersPromo={promo.users} breederPromo={promo.breeder} onDismiss={() => setShowBanner(false)} />}

        {/* <PromoBanner usersPromo={promo.users} breederPromo={promo.breeder} onDismiss={() => setShowBanner(false)} /> */}

        <div className="pricing-heading">
          <p className="pricing-eyebrow">Pricing</p>
          <h2 className="pricing-title">
            Choose the <span className="pricing-accent">perfect plan</span>
          </h2>
        </div>

        <div className="pricing-tabs">
          {["users", "breeders", "consultants"].map((t) => (
            <button key={t} className={`pricing-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab !== "consultants" && (
          <div className="pricing-toggle">
            <span className={!annual ? "toggle-active" : ""}>Monthly</span>
            <button className={`toggle-switch${annual ? " on" : ""}`} onClick={() => setAnnual(!annual)} aria-label="Toggle annual billing">
              <span className="toggle-thumb" />
            </button>
            <span className={annual ? "toggle-active" : ""}>
              Annual <em>save up to 20%</em>
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="pricing-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pricing-skeleton-card" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="pricing-error">
            <FiAlertCircle />
            <p>Could not load pricing. Please try refreshing.</p>
            <small>{error}</small>
          </div>
        )}

        {/* Plans */}
        {!loading && !error && (
          <>
            {tab === "users" && <UserPlans plans={plans} annual={annual} />}
            {tab === "breeders" && <BreederPlan plans={plans} annual={annual} />}
            {tab === "consultants" && <ConsultantPlan />}
          </>
        )}
      </div>
    </section>
  );
}
