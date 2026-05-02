import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "react-bootstrap";
import {
  FaBuilding,
  FaGlobe,
  FaInstagram,
  FaFacebook,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaCertificate,
  FaFish,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaChevronRight,
  FaShieldAlt,
  FaLeaf,
  FaCrown,
  FaGem,
  FaCheck,
  FaBolt,
} from "react-icons/fa";
import { RiArrowLeftLine, RiCalendarLine, RiVipCrownLine, RiCoinsLine } from "react-icons/ri";
import { baseUrl } from "../auth/config";
import "./BreederApply.css";
import ThemeToggle from "../ThemeToggle";

/* ─────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────── */
const SPECIES_CATEGORIES = [
  { key: "freshwater_fish", label: "Freshwater", icon: "🌿" },
  { key: "marine_fish", label: "Saltwater", icon: "🌊" },
  { key: "pond_fish", label: "Pond", icon: "🏞️" },
  { key: "marine_invertebrate", label: "Invertebrates", icon: "🦀" },
];

const STEPS_META = [
  { title: "Business Info", subtitle: "Tell us about your operation", icon: FaBuilding },
  { title: "Online Presence", subtitle: "Where can customers find you?", icon: FaGlobe },
  { title: "Species & Expertise", subtitle: "What do you breed?", icon: FaFish },
  { title: "Review", subtitle: "Confirm your details", icon: FaShieldAlt },
  { title: "Choose a Plan", subtitle: "Subscribe to go live", icon: FaCrown },
];

const TOTAL_STEPS = STEPS_META.length; // 5

/* ─────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────── */

const MobileStepHeader = ({ step, total, onBack }) => (
  <div className="br-mobile-header">
    <button className="br-mobile-back" onClick={onBack} disabled={step === 0}>
      <RiArrowLeftLine size={18} />
    </button>
    <div className="br-mobile-progress-wrap">
      <div className="br-mobile-step-label">
        Step {step + 1} of {total}
      </div>
      <div className="br-mobile-bar-track">
        <motion.div className="br-mobile-bar-fill" initial={false} animate={{ width: `${((step + 1) / total) * 100}%` }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
    <div className="br-mobile-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`br-mobile-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
      ))}
    </div>
  </div>
);

const Field = ({ icon: Icon, children, isTextarea }) => (
  <div className={`br-field ${isTextarea ? "br-field-textarea" : ""}`}>
    <span className="br-field-icon">
      <Icon />
    </span>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────
   PLAN CARD
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

const PlanCard = ({ plan, billing, selected, onSelect }) => {
  const Icon = PLAN_ICONS[plan.key] ?? FaGem;
  const colors = PLAN_COLORS[plan.key] ?? PLAN_COLORS.premium;
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  const isSelected = selected === plan.key;
  const isPro = plan.key === "pro";

  // Only show features relevant to breeders (subset)
  const KEY_FEATURES = ["become_breeder", "priority_inquiries", "marketplace_sell", "ai_chat", "ai_chat_monthly_limit", "disease_detection", "advanced_analytics", "data_export"];

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
            <span className="br-plan-amount">${price.discounted_price.toFixed(2)}</span>
            <span className="br-plan-period">/ {billing === "monthly" ? "mo" : "yr"}</span>
          </div>
          {price.original_price > price.discounted_price && <div className="br-plan-original">${price.original_price.toFixed(2)}</div>}
        </div>
        <div className={`br-plan-radio ${isSelected ? "checked" : ""}`}>{isSelected && <FaCheck size={10} />}</div>
      </div>

      {billing === "yearly" && plan.yearly.savings && (
        <div className="br-plan-savings">
          <FaBolt size={10} /> Save ${plan.yearly.savings.toFixed(2)} ({plan.yearly.savings_percent}% off)
        </div>
      )}

      <div className="br-plan-features">
        {KEY_FEATURES.map((k) => {
          const val = plan.features[k];
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
export default function BreederApply() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  /* wizard */
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* form fields */
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [years, setYears] = useState("");
  const [focus, setFocus] = useState("");
  const [certifications, setCertifications] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeGuidelines, setAgreeGuidelines] = useState(false);

  /* species */
  const [speciesList, setSpeciesList] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [activeCategory, setActiveCategory] = useState("freshwater_fish");
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  /* subscription — step 4 */
  const [plans, setPlans] = useState([]);
  const [credit, setCredit] = useState(0);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"
  const [selectedPlan, setSelectedPlan] = useState(null); // plan key
  const [subscribing, setSubscribing] = useState(false);

  /* ── fetch species ───────────────────────────────── */
  const fetchSpecies = useCallback(async () => {
    if (!token) return;
    setLoadingSpecies(true);
    try {
      const res = await fetch(`${baseUrl}/tanks/search-species/?category=${activeCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setSpeciesList(json.data || []);
    } catch {
      /* silent */
    } finally {
      setLoadingSpecies(false);
    }
  }, [activeCategory, token]);

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  /* ── close dropdown on outside click ────────────── */
  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── fetch plans when entering step 4 ───────────── */
  useEffect(() => {
    if (step !== 4 || plans.length > 0) return;
    (async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch(`${baseUrl}/subscription/subscription/plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setPlans(json?.data?.plans ?? []);
        setCredit(json?.data?.your_credit ?? 0);
        if (json?.data?.plans?.length) setSelectedPlan(json.data.plans[0].key);
      } catch {
        setError("Failed to load subscription plans.");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [step]); // eslint-disable-line

  /* ── species helpers ─────────────────────────────── */
  const filteredList = speciesList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.scientific_name.toLowerCase().includes(q);
  });
  const addSpecies = (item) => {
    if (!selectedSpecies.find((s) => s.id === item.id)) setSelectedSpecies((p) => [...p, item]);
    setSearchQuery("");
    setDropdownOpen(false);
  };
  const removeSpecies = (id) => setSelectedSpecies((p) => p.filter((s) => s.id !== id));

  /* ── validation ──────────────────────────────────── */
  const validateStep = () => {
    if (step === 0 && (!companyName.trim() || !bio.trim())) {
      setError("Please fill in your Company Name and Bio.");
      return false;
    }
    if (step === 2 && selectedSpecies.length === 0) {
      setError("Please select at least one species you breed.");
      return false;
    }
    if (step === 3 && (!agreeTerms || !agreeGuidelines)) {
      setError("You must agree to the Terms and Guidelines.");
      return false;
    }
    if (step === 4 && !selectedPlan) {
      setError("Please choose a subscription plan.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ── submit application (called AFTER successful subscribe) ── */
  const submitApplication = async () => {
    const payload = {
      company_name: companyName,
      bio,
      website,
      instagram,
      facebook,
      business_phone: phone,
      business_address: address,
      species: selectedSpecies.map((s) => s.id),
      years_experience: Number(years) || 0,
      breeding_focus: focus,
      certifications: certifications
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      agree_terms: true,
      agree_guidelines: true,
    };
    const res = await fetch(`${baseUrl}/breeders/apply/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Application submission failed.");
  };

  /* ── subscribe + auto-submit ─────────────────────── */
  const handleSubscribeAndSubmit = async () => {
    if (!validateStep()) return;
    setSubscribing(true);
    setError("");
    try {
      /* 1. Subscribe — get payment URL */
      const subRes = await fetch(`${baseUrl}/subscription/subscription/breeder/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billing_period: billing, plan_key: selectedPlan }),
      });
      const subJson = await subRes.json();

      if (!subRes.ok) {
        setError(subJson.message || "Subscription failed. Please try again.");
        return;
      }

      const paymentUrl = subJson?.data?.checkout_url ?? subJson?.checkout_url ?? null;
      console.log("Subscription response:", subJson);

      console.log("Payment URL:", paymentUrl);

      if (paymentUrl) {
        /* Has a payment URL — submit application first, then redirect to payment */
        await submitApplication();
        setSuccess(true);
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 1800);
        return;
      }

      /* No redirect needed (e.g. credit covered it) — just submit application */
      await submitApplication();
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "aquaProviders://";
      }, 2500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  if (!token) {
    return (
      <div className="br-page ">
        <div className="br-bg">
          <div className="br-blob-a" />
          <div className="br-blob-b" />
          <div className="br-blob-c" />
        </div>
        <div className="breeder-error-state">
          <div className="error-icon">⚠️</div>
          <h2>Access Denied</h2>
          <p>No authentication token found. Please open this page from the AquaAI app.</p>
        </div>
      </div>
    );
  }

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
          <h2>You're all set!</h2>
          <p>Your application is submitted. Redirecting to complete payment…</p>
          <p className="br-redirect-hint">Taking you to secure checkout…</p>
          <div className="br-success-bar-wrap">
            <div className="br-success-bar" />
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────
     STEP CONTENT
  ───────────────────────────────────────────────── */
  const stepContent = [
    /* 0 — Business Info */
    <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <Field icon={FaBuilding}>
        <input className="br-input" placeholder="Company / Breeder Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      </Field>
      <Field icon={FaLeaf} isTextarea>
        <textarea className="br-input br-textarea" placeholder="Describe your breeding operation, experience, and passion… *" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
      </Field>
    </motion.div>,

    /* 1 — Online Presence */
    <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <Field icon={FaGlobe}>
        <input className="br-input" placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </Field>
      <Field icon={FaInstagram}>
        <input className="br-input" placeholder="Instagram handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
      </Field>
      <Field icon={FaFacebook}>
        <input className="br-input" placeholder="Facebook page URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
      </Field>
      <Field icon={FaPhone}>
        <input className="br-input" placeholder="Business Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field icon={FaMapMarkerAlt}>
        <input className="br-input" placeholder="Business Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
    </motion.div>,

    /* 2 — Species & Expertise */
    <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <Field icon={FaStar}>
        <input className="br-input" placeholder="Years of Experience" type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} />
      </Field>
      <Field icon={FaLeaf}>
        <input className="br-input" placeholder="Breeding Focus (e.g. Rare Discus)" value={focus} onChange={(e) => setFocus(e.target.value)} />
      </Field>
      <Field icon={FaCertificate}>
        <input className="br-input" placeholder="Certifications (comma separated)" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
      </Field>
      <div className="br-species-section">
        <p className="br-section-label">Species You Breed *</p>
        <div className="br-cat-pills">
          {SPECIES_CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`br-cat-pill ${activeCategory === c.key ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(c.key);
                setSearchQuery("");
                setDropdownOpen(false);
              }}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
        <div className="br-species-search" ref={searchRef}>
          <div className="br-field">
            <span className="br-field-icon">
              <FaSearch />
            </span>
            <input
              className="br-input"
              placeholder="Search species…"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
            />
          </div>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div className="br-dropdown" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                {loadingSpecies ? (
                  <div className="br-dropdown-state">
                    <Spinner size="sm" animation="border" />
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="br-dropdown-state">No species found</div>
                ) : (
                  filteredList.slice(0, 12).map((item) => (
                    <div key={item.id} className="br-dropdown-row" onClick={() => addSpecies(item)}>
                      <FaFish className="br-dropdown-icon" />
                      <div>
                        <div className="br-dropdown-name">{item.name}</div>
                        <div className="br-dropdown-sci">{item.scientific_name}</div>
                      </div>
                      {selectedSpecies.find((s) => s.id === item.id) && <FaCheckCircle size={12} className="br-dropdown-check" />}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {selectedSpecies.length > 0 && (
          <div className="br-chips">
            {selectedSpecies.map((s) => (
              <motion.div key={s.id} className="br-chip" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <FaFish size={10} />
                <span>{s.name}</span>
                <button onClick={() => removeSpecies(s.id)} aria-label={`Remove ${s.name}`}>
                  <FaTimes size={9} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>,

    /* 3 — Review */
    <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <div className="br-review-card">
        {[["Company", companyName || "—"], ["Species", `${selectedSpecies.length} selected`], ["Experience", years ? `${years} years` : "—"], ["Focus", focus || "—"], website && ["Website", website]]
          .filter(Boolean)
          .map(([label, value]) => (
            <div key={label} className="br-review-row">
              <span className="br-review-label">{label}</span>
              <span className="br-review-value">{value}</span>
            </div>
          ))}
      </div>
      <div className="br-selected-species-preview">
        {selectedSpecies.slice(0, 6).map((s) => (
          <span key={s.id} className="br-chip">
            <FaFish size={10} />
            {s.name}
          </span>
        ))}
        {selectedSpecies.length > 6 && <span className="br-chip br-chip-more">+{selectedSpecies.length - 6} more</span>}
      </div>
      <div className="br-agree" onClick={() => setAgreeTerms((v) => !v)}>
        <div className={`br-agree-box ${agreeTerms ? "checked" : ""}`}>{agreeTerms && <FaCheckCircle size={13} />}</div>
        <p>
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noreferrer">
            Terms of Service
          </a>
        </p>
      </div>
      <div className="br-agree" onClick={() => setAgreeGuidelines((v) => !v)}>
        <div className={`br-agree-box ${agreeGuidelines ? "checked" : ""}`}>{agreeGuidelines && <FaCheckCircle size={13} />}</div>
        <p>
          I agree to the{" "}
          <a href="/guidelines" target="_blank" rel="noreferrer">
            Breeder Community Guidelines
          </a>
        </p>
      </div>
    </motion.div>,

    /* 4 — Choose a Plan */
    <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      {/* Credit banner */}
      {credit > 0 && (
        <div className="br-credit-banner">
          <RiCoinsLine size={16} />
          <span>
            You have <strong>${credit.toFixed(2)}</strong> referral credit — applied automatically at checkout
          </span>
        </div>
      )}

      {/* Billing toggle */}
      <div className="br-billing-toggle">
        <button className={`br-billing-btn ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>
          <RiCalendarLine size={13} /> Monthly
        </button>
        <button className={`br-billing-btn ${billing === "yearly" ? "active" : ""}`} onClick={() => setBilling("yearly")}>
          <RiVipCrownLine size={13} /> Yearly
          <span className="br-billing-save">Save up to 20%</span>
        </button>
      </div>

      {/* Plan cards */}
      {loadingPlans ? (
        <div className="br-plan-loading">
          <Spinner animation="border" style={{ color: "var(--accent)" }} />
          <span>Loading plans…</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="br-plan-empty">No plans available. Please try again.</div>
      ) : (
        <div className="br-plans-grid">
          {plans.map((plan) => (
            <PlanCard key={plan.key} plan={plan} billing={billing} selected={selectedPlan} onSelect={setSelectedPlan} />
          ))}
        </div>
      )}

      {/* What happens next */}
      <div className="br-next-steps">
        <div className="br-next-step">
          <div className="br-next-num">1</div>
          <span>Choose your plan above</span>
        </div>
        <div className="br-next-sep" />
        <div className="br-next-step">
          <div className="br-next-num">2</div>
          <span>Complete secure payment</span>
        </div>
        <div className="br-next-sep" />
        <div className="br-next-step">
          <div className="br-next-num">3</div>
          <span>Your application is submitted automatically</span>
        </div>
      </div>
    </motion.div>,
  ];

  const curMeta = STEPS_META[step];
  const StepIcon = curMeta.icon;
  const isLastStep = step === TOTAL_STEPS - 1;

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
        {/* Sidebar */}
        <motion.aside className="br-sidebar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="br-logo">
            {/* <div className="br-logo-icon">🐠</div> */}
            <img src="/icon.png" alt="AquaAI Logo" className="auth-logo-img" />
            <div>
              <div className="br-logo-name">AquaAI</div>
              <div className="br-logo-sub">Breeder Program</div>
            </div>
          </div>
          <nav className="br-steps-nav">
            {STEPS_META.map((s, i) => {
              const Icon = s.icon;
              const state = i < step ? "done" : i === step ? "active" : "idle";
              return (
                <div key={i} className={`br-step-item ${state}`}>
                  <div className="br-step-bullet">{state === "done" ? <FaCheckCircle size={13} /> : <Icon size={13} />}</div>
                  <div className="br-step-text">
                    <div className="br-step-name">{s.title}</div>
                    {state === "active" && <div className="br-step-hint">{s.subtitle}</div>}
                  </div>
                  {i < STEPS_META.length - 1 && <div className="br-step-line" />}
                </div>
              );
            })}
          </nav>
          <div className="br-sidebar-footer">
            <FaShieldAlt />
            <span>256-bit encrypted · GDPR compliant</span>
          </div>
        </motion.aside>

        {/* Panel */}
        <motion.div className="br-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <MobileStepHeader step={step} total={TOTAL_STEPS} onBack={handleBack} />

          <div className="br-panel-head">
            <div className="br-panel-icon">
              <StepIcon size={18} />
            </div>
            <div>
              <h2 className="br-panel-title">{curMeta.title}</h2>
              <p className="br-panel-sub">{curMeta.subtitle}</p>
            </div>
          </div>

          <div className="br-panel-body">
            <AnimatePresence mode="wait">{stepContent[step]}</AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="br-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="br-actions">
            {step > 0 && (
              <button className="br-btn-back" onClick={handleBack}>
                <RiArrowLeftLine size={15} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {!isLastStep ? (
              <button className="br-btn-next" onClick={handleNext}>
                Continue <FaChevronRight size={12} />
              </button>
            ) : (
              <button className="br-btn-submit" onClick={handleSubscribeAndSubmit} disabled={subscribing || loadingPlans || !selectedPlan}>
                {subscribing ? (
                  <>
                    <Spinner size="sm" animation="border" /> Processing…
                  </>
                ) : (
                  <>
                    <FaCrown size={13} /> Subscribe & Submit
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
