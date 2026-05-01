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
} from "react-icons/fa";
import { RiArrowLeftLine } from "react-icons/ri";
import { baseUrl } from "../auth/config";
import "./BreederApply.css";
import ThemeToggle from "../ThemeToggle";

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
  { title: "Review & Submit", subtitle: "Confirm your application", icon: FaShieldAlt },
];

/* ── Mobile step header ───────────────────────────── */
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

/* ── Field wrapper with icon ──────────────────────── */
const Field = ({ icon: Icon, children, isTextarea }) => (
  <div className={`br-field ${isTextarea ? "br-field-textarea" : ""}`}>
    <span className="br-field-icon">
      <Icon />
    </span>
    {children}
  </div>
);

export default function BreederApply() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* Form fields */
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

  /* Species */
  const [speciesList, setSpeciesList] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [activeCategory, setActiveCategory] = useState("freshwater_fish");
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

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

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredList = speciesList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.scientific_name.toLowerCase().includes(q);
  });

  const addSpecies = (item) => {
    if (!selectedSpecies.find((s) => s.id === item.id)) {
      setSelectedSpecies((prev) => [...prev, item]);
    }
    setSearchQuery("");
    setDropdownOpen(false);
  };
  const removeSpecies = (id) => setSelectedSpecies((prev) => prev.filter((s) => s.id !== id));

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
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };
  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

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
      if (!res.ok) {
        setError(json.message || "Submission failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "aquaProviders://";
      }, 2500);
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
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
          <h2>Application Submitted!</h2>
          <p>Your breeder profile is under review. We'll notify you once approved.</p>
          <p className="br-redirect-hint">Returning you to the AquaAI app…</p>
          <div className="br-success-bar-wrap">
            <div className="br-success-bar" />
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Step content ─────────────────────────────────── */
  const stepContent = [
    /* Step 0 — Business Info */
    <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <Field icon={FaBuilding}>
        <input className="br-input" placeholder="Company / Breeder Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      </Field>
      <Field icon={FaLeaf} isTextarea>
        <textarea className="br-input br-textarea" placeholder="Describe your breeding operation, experience, and passion… *" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
      </Field>
    </motion.div>,

    /* Step 1 — Online Presence */
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

    /* Step 2 — Species & Expertise */
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

        {/* Category tabs */}
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

        {/* Search */}
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

        {/* Selected chips */}
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

    /* Step 3 — Review & Submit */
    <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
      <div className="br-review-card">
        {[
          ["Company", companyName || "—"],
          ["Species Selected", `${selectedSpecies.length} species`],
          ["Experience", years ? `${years} years` : "—"],
          ["Breeding Focus", focus || "—"],
          website && ["Website", website],
        ]
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
  ];

  const curMeta = STEPS_META[step];
  const StepIcon = curMeta.icon;

  return (
    <div className="br-page">
      {/* BG */}
      <div className="br-bg">
        <div className="br-blob br-blob-a" />
        <div className="br-blob br-blob-b" />
        <div className="br-grid" />
      </div>

      {/* Theme toggle fixed top-right */}
      <div className="br-theme-btn">
        <ThemeToggle />
      </div>

      {/* ── Desktop layout ─────────────────────────── */}
      <div className="br-layout">
        {/* Sidebar (desktop only) */}
        <motion.aside className="br-sidebar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="br-logo">
            <div className="br-logo-icon">🐠</div>
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

        {/* Main panel */}
        <motion.div className="br-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          {/* Mobile step header */}
          <MobileStepHeader step={step} total={STEPS_META.length} onBack={handleBack} />

          {/* Desktop panel header */}
          <div className="br-panel-head">
            <div className="br-panel-icon">
              <StepIcon size={18} />
            </div>
            <div>
              <h2 className="br-panel-title">{curMeta.title}</h2>
              <p className="br-panel-sub">{curMeta.subtitle}</p>
            </div>
          </div>

          {/* Step content */}
          <div className="br-panel-body">
            <AnimatePresence mode="wait">{stepContent[step]}</AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div className="br-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="br-actions">
            {step > 0 && (
              <button className="br-btn-back" onClick={handleBack}>
                <RiArrowLeftLine size={15} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS_META.length - 1 ? (
              <button className="br-btn-next" onClick={handleNext}>
                Continue <FaChevronRight size={12} />
              </button>
            ) : (
              <button className="br-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : "Submit Application"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
