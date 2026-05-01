import React, { useState, useContext } from "react";
import { Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowRight, FiAlertCircle, FiCheckCircle, FiGift } from "react-icons/fi";
import { RiBubbleChartLine } from "react-icons/ri";
import "./register.css";
import { baseUrl } from "./config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authcontext";
import ThemeToggle from "../ThemeToggle";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: "", email: "", name: "", password: "", referral_code: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage("Account created!");
        if (data.access) {
          await login(data.access, data.roles || []);
          navigate("/plans");
        } else {
          try {
            const lr = await fetch(`${baseUrl}/user/login/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: formData.username, password: formData.password }),
            });
            const ld = await lr.json();
            if (lr.ok && ld.access) {
              await login(ld.access, ld.roles || []);
              navigate("/plans");
            } else setTimeout(() => navigate("/login"), 1500);
          } catch {
            setTimeout(() => navigate("/login"), 1500);
          }
        }
      } else {
        setMessage(data?.message || "Registration failed.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", type: "text", placeholder: "Full Name", icon: <FiUser /> },
    { name: "username", type: "text", placeholder: "Username", icon: <FiUser /> },
    { name: "email", type: "email", placeholder: "Email Address", icon: <FiMail /> },
    { name: "password", type: "password", placeholder: "Password", icon: <FiLock /> },
    { name: "referral_code", type: "text", placeholder: "Referral Code (optional)", icon: <FiGift /> },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />
        <div className="auth-grid" />
      </div>

      <div className="auth-topbar">
        <div className="auth-logo-small">
          <RiBubbleChartLine size={20} />
          <span>AquaAI</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-center">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="auth-card-header">
            <div className="auth-icon-wrap" style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}>
              <RiBubbleChartLine size={26} />
            </div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join the AquaAI community today</p>
          </div>

          {message && (
            <motion.div className={success ? "auth-success" : "auth-error"} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              {success ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
              <span>{message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {fields.map(({ name, type, placeholder, icon }) => (
              <div key={name} className={`auth-field ${focused === name ? "focused" : ""}`}>
                <span className="auth-field-icon">{icon}</span>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  onFocus={() => setFocused(name)}
                  onBlur={() => setFocused("")}
                  required={name !== "referral_code"}
                  autoComplete={name}
                />
              </div>
            ))}

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </motion.div>

        {/* <motion.div className="auth-trust-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <span className="trust-dot" />
          <span>256-bit encrypted · GDPR compliant</span>
        </motion.div> */}
      </div>
    </div>
  );
}
