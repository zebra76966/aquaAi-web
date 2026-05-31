import "./PricingSection.css";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { FiCheck, FiLock } from "react-icons/fi";

const USER_PLANS = [
  {
    name: "Free",
    price: { mo: "£0", yr: "£0" },
    promo: null,
    cta: "Get Started",
    highlight: false,
    features: ["1 Habitat", "Species Identification", "Community Access", "Marketplace (Buy only)", "Consultant Booking", "Breeder Browse"],
  },
  {
    name: "Premium",
    price: { mo: "£14.99", yr: "£144.99" },
    promo: { mo: "£11.99", yr: "£114.99" },
    cta: "Get Started",
    highlight: true,
    features: ["Up to 3 Habitats", "Species Identification", "Disease Detection", "100 AI Chats / month", "Buy & Sell Marketplace", "Consultant Booking", "Breeder Browse & Buy", "Community Access"],
  },
  {
    name: "Pro",
    price: { mo: "£24.99", yr: "£239.99" },
    promo: { mo: "£19.99", yr: "£189.99" },
    cta: "Get Started",
    highlight: false,
    features: [
      "Unlimited Habitats (inc. Pond)",
      "Species Identification",
      "Disease Detection",
      "500 AI Chats / month",
      "Full Marketplace Access",
      "Consultant Booking",
      "Breeder Browse & Buy",
      "Community Access",
      "Priority Support",
    ],
  },
];

const BREEDER_FEATURES = [
  "Stock listing & management",
  "Marketplace visibility",
  "Order management",
  "Analytics dashboard",
  "Trust intelligence",
  "Rank badges",
  "No sales commission — one fixed fee",
];

// Remove the Cer tiers
// const CERT_TIERS = [
//   { name: "Aqua Certified", price: "£250/yr" },
//   { name: "Professional",   price: "£699/yr" },
//   { name: "Master Breeder", price: "£1,499/yr" },
// ];

const CONSULTANT_FEATURES = ["Service listing", "Calendar management", "Booking management", "Client data access", "Analytics dashboard", "Trust intelligence", "10% commission on bookings"];

function UserPlans({ annual }) {
  return (
    <div className="pricing-grid">
      {USER_PLANS.map((plan) => (
        <div key={plan.name} className={`pricing-card${plan.highlight ? " pricing-card--highlight" : ""}`}>
          {plan.highlight && <div className="pricing-popular">Most Popular</div>}
          <h3 className="pricing-plan-name">{plan.name}</h3>

          <div className="pricing-price">
            {plan.promo ? (
              <>
                <span className="pricing-promo">{annual ? plan.promo.yr : plan.promo.mo}</span>
                <span className="pricing-orig">{annual ? plan.price.yr : plan.price.mo}</span>
              </>
            ) : (
              <span className="pricing-promo">{plan.price.mo}</span>
            )}
            {plan.name !== "Free" && <span className="pricing-period">{annual ? "/yr" : "/mo"}</span>}
          </div>

          {plan.promo && (
            <p className="pricing-promo-note">
              <FiLock size={16} /> Early adopter pricing — locked in for life
            </p>
          )}

          <ul className="pricing-features">
            {plan.features.map((f) => (
              <li key={f}>
                <FiCheck className="pricing-check" />
                {f}
              </li>
            ))}
          </ul>
          <button className={`pricing-cta${plan.highlight ? " pricing-cta--primary" : ""}`}>{plan.cta}</button>
        </div>
      ))}
    </div>
  );
}

function BreederPlan({ annual }) {
  return (
    <div className="pricing-single-wrap">
      <div className="pricing-card pricing-card--highlight pricing-card--wide">
        <div className="pricing-popular">Breeder Plan</div>
        <h3 className="pricing-plan-name">Breeder Marketplace</h3>
        <div className="pricing-price">
          <span className="pricing-promo">{annual ? "£239.99" : "£24.99"}</span>
          <span className="pricing-period">{annual ? "/yr" : "/mo"}</span>
        </div>
        <p className="pricing-promo-note">
          <FiLock size={16} /> First 100 breeders: {annual ? "£189.99/yr" : "£19.99/mo"} — locked in for life
        </p>
        <ul className="pricing-features">
          {BREEDER_FEATURES.map((f) => (
            <li key={f}>
              <FiCheck className="pricing-check" />
              {f}
            </li>
          ))}
        </ul>
        <button className="pricing-cta pricing-cta--primary">Get Started</button>
      </div>
    </div>
  );
}

function ConsultantPlan() {
  return (
    <div className="pricing-single-wrap">
      <div className="pricing-card pricing-card--highlight pricing-card--wide">
        <div className="pricing-popular">Consultant Plan</div>
        <h3 className="pricing-plan-name">Aquatic Professionals</h3>
        <div className="pricing-price">
          <span className="pricing-promo">£0</span>
          <span className="pricing-period"> 10% commission</span>
        </div>
        <ul className="pricing-features">
          {CONSULTANT_FEATURES.map((f) => (
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

export default function PricingSection() {
  const [tab, setTab] = useState("users");
  const [annual, setAnnual] = useState(false);

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-inner">
        <div className="pricing-heading">
          <p className="pricing-eyebrow">Pricing</p>
          <h2 className="pricing-title">
            Choose the <span className="pricing-accent">perfect plan</span>
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="pricing-tabs">
          {["users", "breeders", "consultants"].map((t) => (
            <button key={t} className={`pricing-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Annual toggle (only for users/breeders) */}
        {tab !== "consultants" && (
          <div className="pricing-toggle">
            <span className={!annual ? "toggle-active" : ""}>Monthly</span>
            <button className={`toggle-switch${annual ? " on" : ""}`} onClick={() => setAnnual(!annual)} aria-label="Toggle annual">
              <span className="toggle-thumb" />
            </button>
            <span className={annual ? "toggle-active" : ""}>
              Annual <em>save up to 20%</em>
            </span>
          </div>
        )}

        {tab === "users" && <UserPlans annual={annual} />}
        {tab === "breeders" && <BreederPlan annual={annual} />}
        {tab === "consultants" && <ConsultantPlan />}
      </div>
    </section>
  );
}
