import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "react-bootstrap";
import {
  FaBuilding, FaGlobe, FaInstagram, FaFacebook, FaPhone,
  FaMapMarkerAlt, FaStar, FaCertificate, FaFish, FaSearch,
  FaTimes, FaCheckCircle, FaChevronRight, FaShieldAlt, FaLeaf
} from "react-icons/fa";
import { baseUrl } from "../auth/config";
import "./BreederApply.css";

const SPECIES_CATEGORIES = [
  { key: "freshwater_fish", label: "Freshwater", icon: "🌿" },
  { key: "marine_fish", label: "Saltwater", icon: "🌊" },
  { key: "pond_fish", label: "Pond Fish", icon: "🏞️" },
  { key: "marine_invertebrate", label: "Invertebrates", icon: "🦀" },
];

const StepIndicator = ({ current, total }) => (
  <div className="breeder-steps">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`step-dot ${i < current ? "done" : i === current ? "active" : ""}`}>
        {i < current ? <FaCheckCircle size={10} /> : i + 1}
      </div>
    ))}
    <div className="step-track">
      <div className="step-fill" style={{ width: `${(current / (total - 1)) * 100}%` }} />
    </div>
  </div>
);

const FieldGroup = ({ icon: Icon, children }) => (
  <div className="field-group">
    <span className="field-icon"><Icon /></span>
    {children}
  </div>
);

export default function BreederApply() {
  // Extract token from URL query param: /breeder?token=xxx
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form fields
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

  // Species
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
      // silently fail
    } finally {
      setLoadingSpecies(false);
    }
  }, [activeCategory, token]);

  useEffect(() => { fetchSpecies(); }, [fetchSpecies]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
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
    if (step === 0 && (!companyName || !bio)) {
      setError("Please fill in Company Name and Bio.");
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

  const handleBack = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

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
        certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
        agree_terms: true,
        agree_guidelines: true,
      };

      const res = await fetch(`${baseUrl}/breeders/apply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.message || "Submission failed. Please try again."); return; }

      setSuccess(true);
      // Redirect back to native app after 2.5s
      setTimeout(() => { window.location.href = "aquaProviders://"; }, 2500);
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="breeder-page">
        <div className="breeder-bg">
          <div className="blob-1" /><div className="blob-2" /><div className="blob-3" />
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
      <div className="breeder-page">
        <div className="breeder-bg">
          <div className="blob-1" /><div className="blob-2" /><div className="blob-3" />
        </div>
        <motion.div className="success-panel" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="success-ring">
            <FaCheckCircle size={48} color="#4ade80" />
          </div>
          <h2>Application Submitted!</h2>
          <p>Your breeder profile is under review. We'll notify you once approved.</p>
          <p className="redirect-hint">Returning you to the AquaAI app…</p>
          <div className="success-loader">
            <div className="success-bar" />
          </div>
        </motion.div>
      </div>
    );
  }

  const STEPS = [
    {
      title: "Business Info",
      subtitle: "Tell us about your breeding operation",
      icon: <FaBuilding />,
      content: (
        <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          <FieldGroup icon={FaBuilding}>
            <input
              className="breeder-input"
              placeholder="Company / Breeder Name *"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </FieldGroup>
          <div className="field-group textarea-group">
            <span className="field-icon textarea-icon"><FaLeaf /></span>
            <textarea
              className="breeder-input breeder-textarea"
              placeholder="Describe your breeding operation, experience, and passion… *"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
            />
          </div>
        </motion.div>
      ),
    },
    {
      title: "Online Presence",
      subtitle: "Where can customers find you?",
      icon: <FaGlobe />,
      content: (
        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          <FieldGroup icon={FaGlobe}>
            <input className="breeder-input" placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </FieldGroup>
          <FieldGroup icon={FaInstagram}>
            <input className="breeder-input" placeholder="Instagram handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </FieldGroup>
          <FieldGroup icon={FaFacebook}>
            <input className="breeder-input" placeholder="Facebook page URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </FieldGroup>
          <FieldGroup icon={FaPhone}>
            <input className="breeder-input" placeholder="Business Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FieldGroup>
          <FieldGroup icon={FaMapMarkerAlt}>
            <input className="breeder-input" placeholder="Business Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FieldGroup>
        </motion.div>
      ),
    },
    {
      title: "Species & Expertise",
      subtitle: "What do you breed?",
      icon: <FaFish />,
      content: (
        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          <div className="expertise-row">
            <FieldGroup icon={FaStar}>
              <input className="breeder-input" placeholder="Years of Experience" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
            </FieldGroup>
            <FieldGroup icon={FaLeaf}>
              <input className="breeder-input" placeholder="Breeding Focus (e.g. Rare Discus)" value={focus} onChange={(e) => setFocus(e.target.value)} />
            </FieldGroup>
            <FieldGroup icon={FaCertificate}>
              <input className="breeder-input" placeholder="Certifications (comma separated)" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
            </FieldGroup>
          </div>

          <div className="species-section">
            <p className="species-label">Species You Breed *</p>
            <div className="category-pills">
              {SPECIES_CATEGORIES.map((c) => (
                <button key={c.key} className={`cat-pill ${activeCategory === c.key ? "active" : ""}`}
                  onClick={() => { setActiveCategory(c.key); setSearchQuery(""); setDropdownOpen(false); }}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>

            <div className="species-search-wrap" ref={searchRef}>
              <FieldGroup icon={FaSearch}>
                <input
                  className="breeder-input"
                  placeholder="Search species…"
                  value={searchQuery}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
                />
              </FieldGroup>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div className="species-dropdown" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    {loadingSpecies ? (
                      <div className="dropdown-loader"><Spinner animation="border" size="sm" style={{ color: "#6366f1" }} /></div>
                    ) : filteredList.length === 0 ? (
                      <div className="dropdown-empty">No species found</div>
                    ) : (
                      filteredList.slice(0, 12).map((item) => (
                        <div key={item.id} className="dropdown-row" onClick={() => addSpecies(item)}>
                          <FaFish className="dropdown-fish-icon" />
                          <div>
                            <div className="dropdown-name">{item.name}</div>
                            <div className="dropdown-scientific">{item.scientific_name}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedSpecies.length > 0 && (
              <div className="species-chips">
                {selectedSpecies.map((s) => (
                  <motion.div key={s.id} className="species-chip" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <FaFish size={10} />
                    <span>{s.name}</span>
                    <button onClick={() => removeSpecies(s.id)}><FaTimes size={10} /></button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ),
    },
    {
      title: "Review & Submit",
      subtitle: "Confirm your application",
      icon: <FaShieldAlt />,
      content: (
        <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          <div className="review-card">
            <div className="review-row"><span>Company</span><strong>{companyName || "—"}</strong></div>
            <div className="review-row"><span>Species Selected</span><strong>{selectedSpecies.length} species</strong></div>
            <div className="review-row"><span>Experience</span><strong>{years ? `${years} years` : "—"}</strong></div>
            <div className="review-row"><span>Focus</span><strong>{focus || "—"}</strong></div>
            {website && <div className="review-row"><span>Website</span><strong>{website}</strong></div>}
          </div>

          <div className="agree-row" onClick={() => setAgreeTerms((v) => !v)}>
            <div className={`agree-box ${agreeTerms ? "checked" : ""}`}>
              {agreeTerms && <FaCheckCircle size={14} />}
            </div>
            <p>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a></p>
          </div>

          <div className="agree-row" onClick={() => setAgreeGuidelines((v) => !v)}>
            <div className={`agree-box ${agreeGuidelines ? "checked" : ""}`}>
              {agreeGuidelines && <FaCheckCircle size={14} />}
            </div>
            <p>I agree to the <a href="/guidelines" target="_blank" rel="noreferrer">Breeder Community Guidelines</a></p>
          </div>
        </motion.div>
      ),
    },
  ];

  const currentStep = STEPS[step];

  return (
    <div className="breeder-page">
      <div className="breeder-bg">
        <div className="blob-1" /><div className="blob-2" /><div className="blob-3" />
      </div>

      <div className="breeder-layout">
        {/* Sidebar */}
        <motion.div className="breeder-sidebar" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="sidebar-logo">
            <div className="logo-mark">🐠</div>
            <div>
              <div className="logo-name">AquaAI</div>
              <div className="logo-sub">Breeder Program</div>
            </div>
          </div>

          <div className="sidebar-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`sidebar-step ${i === step ? "active" : i < step ? "done" : ""}`}>
                <div className="sidebar-step-icon">
                  {i < step ? <FaCheckCircle /> : s.icon}
                </div>
                <div className="sidebar-step-text">
                  <div className="sidebar-step-label">{s.title}</div>
                  {i === step && <div className="sidebar-step-sub">{s.subtitle}</div>}
                </div>
                {i < STEPS.length - 1 && <div className="sidebar-connector" />}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <FaShieldAlt />
            <span>Your data is encrypted & secure</span>
          </div>
        </motion.div>

        {/* Main form panel */}
        <motion.div className="breeder-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="panel-header">
            <StepIndicator current={step} total={STEPS.length} />
            <h2 className="panel-title">{currentStep.title}</h2>
            <p className="panel-subtitle">{currentStep.subtitle}</p>
          </div>

          <div className="panel-body">
            <AnimatePresence mode="wait">
              {currentStep.content}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div className="breeder-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              ⚠️ {error}
            </motion.div>
          )}

          <div className="panel-actions">
            {step > 0 && (
              <button className="btn-back" onClick={handleBack}>← Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-next" onClick={handleNext}>
                Continue <FaChevronRight size={12} />
              </button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : "Submit Application"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
