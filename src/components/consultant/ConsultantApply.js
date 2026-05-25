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
  FaCheckCircle,
  FaChevronRight,
  FaShieldAlt,
  FaUserMd,
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaLeaf,
  FaStethoscope,
  FaSearch,
} from "react-icons/fa";
import { RiArrowLeftLine } from "react-icons/ri";
import { baseUrl } from "../auth/config";
import "./ConsultantApply.css";
import ThemeToggle from "../ThemeToggle";

/* ─────────────────────────────────────────────────────
   STEPS — 4 steps, no plan/subscription
───────────────────────────────────────────────────── */
const STEPS_META = [
  { title: "Business Info", subtitle: "Tell us about your consultancy", icon: FaBuilding },
  { title: "Online Presence", subtitle: "Where can clients find you?", icon: FaGlobe },
  { title: "Expertise", subtitle: "Your experience & specialisation", icon: FaUserMd },
  { title: "Review & Submit", subtitle: "Confirm your details", icon: FaShieldAlt },
];

const TOTAL_STEPS = STEPS_META.length;

/* ─────────────────────────────────────────────────────
   SUB-COMPONENTS (reuse breeder patterns)
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
   MAIN COMPONENT
───────────────────────────────────────────────────── */
export default function ConsultantApply() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form fields — matches app CreateBusinessProfileScreen exactly
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [years, setYears] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [certifications, setCertifications] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeGuidelines, setAgreeGuidelines] = useState(false);

  // Services (fetched but optional — commented out in app too)
  const [servicesList, setServicesList] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Fetch services for potential future use
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoadingServices(true);
      try {
        const res = await fetch(`${baseUrl}/consultants/services/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setServicesList(Object.values(json?.data || {}).flat());
      } catch {
        /* silent */
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [token]);

  const toggleService = (id) => setSelectedServices((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* ── Validation ─────────────────────────────────── */
  const validateStep = () => {
    if (step === 0 && (!companyName.trim() || !bio.trim())) {
      setError("Please fill in your Company Name and Bio.");
      return false;
    }
    if (step === 3 && (!agreeTerms || !agreeGuidelines)) {
      setError("You must agree to the Terms and Guidelines to continue.");
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

  /* ── Submit ─────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        company_name: companyName,
        bio,
        website,
        instagram,
        facebook,
        business_phone: phone,
        business_address: address,
        years_experience: Number(years) || 0,
        specialization,
        certifications: certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        agree_terms: true,
        agree_guidelines: true,
      };

      const res = await fetch(`${baseUrl}/consultants/apply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Submission failed. Please check your details.");
        return;
      }

      setSuccess(true);
      // Redirect to consultant dashboard — no plans screen
      // setTimeout(() => {
      //   window.location.href = "/consultant-dashboard";
      // }, 2500);
      setTimeout(() => {
        window.location.href = "aquaProviders://";
      }, 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Guard: no token ─────────────────────────────── */
  if (!token) {
    return (
      <div className="br-page">
        <div className="br-bg">
          <div className="br-blob br-blob-a" />
          <div className="br-blob br-blob-b" />
        </div>
        <div className="breeder-error-state">
          <div className="error-icon">⚠️</div>
          <h2>Access Denied</h2>
          <p>No authentication token found. Please open this page from the AquaAI app.</p>
        </div>
      </div>
    );
  }

  /* ── Success screen ──────────────────────────────── */
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
          <h2>Application Submitted!</h2>
          <p>Your consultant application has been received. Taking you to your dashboard…</p>
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
        <input className="br-input" placeholder="Company / Consultancy Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      </Field>
      <Field icon={FaLeaf} isTextarea>
        <textarea
          className="br-input br-textarea"
          placeholder="Describe your consultancy, your approach, and what makes you stand out… *"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
        />
      </Field>
      <Field icon={FaPhone}>
        <input className="br-input" placeholder="Business Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field icon={FaMapMarkerAlt}>
        <input className="br-input" placeholder="Business Address" value={address} onChange={(e) => setAddress(e.target.value)} />
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
    </motion.div>,

    /* 2 — Expertise */
    <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <Field icon={FaStar}>
        <input className="br-input" placeholder="Years of Experience" type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} />
      </Field>
      <Field icon={FaStethoscope}>
        <input className="br-input" placeholder="Specialisation (e.g. Marine aquariums, Disease diagnosis)" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
      </Field>
      <Field icon={FaCertificate}>
        <input className="br-input" placeholder="Certifications (comma separated)" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
      </Field>
    </motion.div>,

    /* 3 — Review & Submit */
    <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <div className="br-review-card">
        {[
          ["Company", companyName || "—"],
          ["Phone", phone || "—"],
          ["Address", address || "—"],
          ["Experience", years ? `${years} years` : "—"],
          ["Specialisation", specialization || "—"],
          website && ["Website", website],
        ]
          .filter(Boolean)
          .map(([label, value]) => (
            <div key={label} className="br-review-row">
              <span className="br-review-label">{label}</span>
              <span className="br-review-value">{value}</span>
            </div>
          ))}
        {certifications && (
          <div className="br-review-row">
            <span className="br-review-label">Certifications</span>
            <span className="br-review-value">{certifications}</span>
          </div>
        )}
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
            Consultant Community Guidelines
          </a>
        </p>
      </div>
    </motion.div>,
  ];

  const curMeta = STEPS_META[step];
  const StepIcon = curMeta.icon;
  const isLast = step === TOTAL_STEPS - 1;

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
            <img src="/icon.png" alt="AquaAI Logo" className="auth-logo-img" />
            <div>
              <div className="br-logo-name">AquaAI</div>
              <div className="br-logo-sub">Consultant Programme</div>
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
            {!isLast ? (
              <button className="br-btn-next" onClick={handleNext}>
                Continue <FaChevronRight size={12} />
              </button>
            ) : (
              <button className="br-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" animation="border" /> Submitting…
                  </>
                ) : (
                  <>
                    <FaClipboardList size={13} /> Submit Application
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
