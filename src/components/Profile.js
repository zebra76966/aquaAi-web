import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./auth/authcontext";
import { baseUrl } from "./auth/config";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const { token, logout, tier, userProfile, handleUnauthorized } = useContext(AuthContext);
  const navigate = useNavigate();

  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Badges & Trust
  const [badges, setBadges] = useState([]);
  const [badgeDefs, setBadgeDefs] = useState([]);
  const [trust, setTrust] = useState(null);
  const [badgeLoading, setBadgeLoading] = useState(true);

  // Referral
  const [referralData, setReferralData] = useState({ available_credits: 0, my_referral_code: "" });
  const [codeCopied, setCodeCopied] = useState(false);

  // Active section
  const [activeSection, setActiveSection] = useState("profile");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`${baseUrl}/user/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) return;
      const json = await res.json();
      const data = json?.data || json;
      const fullName = data.name || "";
      const parts = fullName.trim().split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
      setCity(data.city || "");
      setState(data.state || "");
      setCountry(data.country || "");
      setPostalCode(data.postal_code || "");
      if (data.profile_picture) setProfileImage(data.profile_picture);
      setReferralData({
        available_credits: data.available_credits || 0,
        my_referral_code: data.my_referral_code || "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchBadges = async () => {
    if (!token) return;
    setBadgeLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [myRes, defsRes, trustRes] = await Promise.all([
        fetch(`${baseUrl}/badges/badges/me/`, { headers }),
        fetch(`${baseUrl}/badges/definitions/`, { headers }),
        fetch(`${baseUrl}/badges/trust-score/me/`, { headers }),
      ]);
      if ([myRes, defsRes, trustRes].some((r) => r.status === 401)) {
        handleUnauthorized();
        return;
      }
      const [myJson, defsJson, trustJson] = await Promise.all([
        myRes.json(), defsRes.json(), trustRes.json(),
      ]);
      setBadges(myJson?.data?.recently_earned || []);
      setBadgeDefs(defsJson?.data || []);
      setTrust(trustJson?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setBadgeLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBadges();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("country", country);
      formData.append("postal_code", postalCode);

      const res = await fetch(`${baseUrl}/user/profile/update/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralData.my_referral_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const latestBadge = badges[0];
  const resolvedBadge = latestBadge && badgeDefs.find((b) => b.badge_code === latestBadge.badge_code);
  const tierName = trust?.trust_score?.regulatory_tier;
  const tierColor = trust?.trust_score?.tier_color || "#00f2ff";
  const tierIcon = trust?.trust_score?.tier_icon || "🥉";
  const trustPoints = trust?.trust_score?.trust_score;

  const SECTIONS = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "badges", label: "Badges & Trust", icon: "🏅" },
    { key: "referral", label: "Refer & Earn", icon: "🎁" },
  ];

  return (
    <div className="prof-wrapper">
      <div className="prof-bg" />

      <div className="prof-layout">
        {/* Sidebar */}
        <aside className="prof-sidebar">
          {/* Avatar */}
          <div className="prof-avatar-wrap">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="prof-avatar" />
            ) : (
              <div className="prof-avatar-placeholder">
                {firstName ? firstName[0].toUpperCase() : "?"}
              </div>
            )}
            <div className="prof-avatar-info">
              <p className="prof-display-name">{firstName} {lastName}</p>
              <p className="prof-email-sub">{email}</p>
            </div>
          </div>

          {/* Tier Badge */}
          {tier && (
            <div className="prof-tier-pill">
              <span>✨</span>
              <span className="prof-tier-name">{tier}</span>
            </div>
          )}

          {/* Trust Score */}
          {tierName && (
            <div className="prof-trust-card">
              <span className="prof-trust-icon">{tierIcon}</span>
              <div>
                <p className="prof-trust-tier" style={{ color: tierColor }}>{tierName} Tier</p>
                {trustPoints != null && <p className="prof-trust-pts">{trustPoints} trust points</p>}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="prof-nav">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                className={`prof-nav-item ${activeSection === s.key ? "prof-nav-active" : ""}`}
                onClick={() => setActiveSection(s.key)}
              >
                <span className="prof-nav-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button className="prof-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="prof-main">
          <AnimatePresence mode="wait">

            {/* PROFILE */}
            {activeSection === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <h2 className="prof-section-title">Profile Information</h2>
                {profileLoading ? (
                  <div className="prof-loading"><div className="prof-spinner" /></div>
                ) : (
                  <form onSubmit={handleUpdate}>
                    <div className="prof-form-grid">
                      <div className="prof-field">
                        <label className="prof-label">First Name</label>
                        <input className="prof-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">Last Name</label>
                        <input className="prof-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                      </div>
                    </div>

                    <div className="prof-field">
                      <label className="prof-label">Email</label>
                      <input className="prof-input prof-input-disabled" value={email} readOnly />
                      <p className="prof-field-hint">Email cannot be changed</p>
                    </div>

                    <h3 className="prof-subsection">Address</h3>
                    <div className="prof-field">
                      <label className="prof-label">Street Address</label>
                      <input className="prof-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Ocean Drive" />
                    </div>
                    <div className="prof-form-grid">
                      <div className="prof-field">
                        <label className="prof-label">City</label>
                        <input className="prof-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">State / Province</label>
                        <input className="prof-input" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
                      </div>
                    </div>
                    <div className="prof-form-grid">
                      <div className="prof-field">
                        <label className="prof-label">Country</label>
                        <input className="prof-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">Postal Code</label>
                        <input className="prof-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="00000" />
                      </div>
                    </div>

                    <div className="prof-submit-row">
                      <button type="submit" className="prof-save-btn" disabled={updateLoading}>
                        {updateLoading ? <span className="prof-spinner-sm" /> : updateSuccess ? "✓ Saved!" : "Save Changes"}
                      </button>
                      {updateSuccess && <span className="prof-success-msg">Profile updated successfully</span>}
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* BADGES */}
            {activeSection === "badges" && (
              <motion.div key="badges" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <h2 className="prof-section-title">Badges & Trust Score</h2>
                {badgeLoading ? (
                  <div className="prof-loading"><div className="prof-spinner" /></div>
                ) : (
                  <>
                    {trust?.trust_score && (
                      <div className="prof-trust-full-card">
                        <div className="prof-trust-header">
                          <div>
                            <span className="prof-trust-big-icon">{tierIcon}</span>
                            <h3 className="prof-trust-big-tier" style={{ color: tierColor }}>{tierName} Tier</h3>
                          </div>
                          <div className="prof-trust-score-circle" style={{ borderColor: tierColor }}>
                            <span className="prof-trust-score-num" style={{ color: tierColor }}>{trustPoints}</span>
                            <span className="prof-trust-score-label">pts</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {resolvedBadge && (
                      <div className="prof-badge-featured" style={{ borderColor: resolvedBadge.color }}>
                        <div className="prof-badge-glow" style={{ background: resolvedBadge.color }} />
                        <span className="prof-badge-big-icon">{resolvedBadge.icon}</span>
                        <div className="prof-badge-featured-info">
                          <h3 className="prof-badge-name">{resolvedBadge.name}</h3>
                          <p className="prof-badge-desc">{resolvedBadge.description}</p>
                          {latestBadge?.earned_at && (
                            <p className="prof-badge-earned">Earned {new Date(latestBadge.earned_at).toLocaleDateString()}</p>
                          )}
                          {resolvedBadge.authority_signals?.length > 0 && (
                            <div className="prof-badge-signals">
                              {resolvedBadge.authority_signals.map((s, i) => (
                                <span key={i} className="prof-signal-chip" style={{ borderColor: resolvedBadge.color, color: resolvedBadge.color }}>{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {badges.length === 0 && !resolvedBadge && (
                      <div className="prof-empty">
                        <span className="prof-empty-icon">🏅</span>
                        <p>No badges earned yet.</p>
                        <p className="prof-empty-sub">Keep your tanks healthy and engage with the AquaAI community to earn badges.</p>
                      </div>
                    )}

                    {badges.length > 0 && (
                      <div className="prof-all-badges">
                        <h3 className="prof-subsection">All Earned Badges</h3>
                        <div className="prof-badges-grid">
                          {badges.map((b, i) => {
                            const def = badgeDefs.find((d) => d.badge_code === b.badge_code);
                            if (!def) return null;
                            return (
                              <div key={i} className="prof-badge-card" style={{ borderColor: def.color + "44" }}>
                                <span className="prof-badge-card-icon">{def.icon}</span>
                                <p className="prof-badge-card-name">{def.name}</p>
                                <p className="prof-badge-card-date">{new Date(b.earned_at).toLocaleDateString()}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* REFERRAL */}
            {activeSection === "referral" && (
              <motion.div key="referral" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <h2 className="prof-section-title">Refer & Earn</h2>

                <div className="prof-referral-hero">
                  <div className="prof-referral-credits">
                    <span className="prof-credits-num">{referralData.available_credits}</span>
                    <span className="prof-credits-label">Available Credits</span>
                  </div>
                  <p className="prof-referral-desc">
                    Share your referral code with friends. When they sign up, you both get discount credits on your next billing cycle!
                  </p>
                </div>

                <div className="prof-code-wrap">
                  <label className="prof-label">Your Referral Code</label>
                  <div className="prof-code-row">
                    <div className="prof-code-box">
                      <span className="prof-code-text">{referralData.my_referral_code || "—"}</span>
                    </div>
                    <button className="prof-copy-btn" onClick={handleCopyCode} disabled={!referralData.my_referral_code}>
                      {codeCopied ? "✓ Copied!" : "Copy"}
                    </button>
                    <button
                      className="prof-share-btn"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: "AquaAI Referral",
                            text: `Use my code ${referralData.my_referral_code} for a discount on AquaAI!`,
                          });
                        } else {
                          handleCopyCode();
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      Share
                    </button>
                  </div>
                </div>

                <div className="prof-referral-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Credits are applied automatically to your next billing cycle.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div className="prof-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)}>
            <motion.div className="prof-confirm-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <h3 className="prof-confirm-title">Logout?</h3>
              <p className="prof-confirm-sub">You'll need to sign in again to access your tanks.</p>
              <div className="prof-confirm-actions">
                <button className="prof-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button className="prof-confirm-logout" onClick={handleLogout}>Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
