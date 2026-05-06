import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import "./login.css";
import { baseUrl } from "./config";
import { AuthContext } from "./authcontext";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "./ThemeContext";

export default function Login() {
  const { token, login, loading: authLoading } = useContext(AuthContext);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  useEffect(() => {
    if (!authLoading && token) navigate("/plans");
  }, [token, authLoading, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/user/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        // const roles = data.roles || [];
        const roles = data.roles || [];
        await login(data.access, roles);
        // navigate(roles.includes("admin") ? "/admin" : "/plans");
        navigate(data.is_admin ? "/admin" : "/plans");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />
        <div className="auth-grid" />
      </div>

      {/* Theme toggle — top right */}
      <div className="auth-topbar">
        <div className="auth-logo-small">
          <img src="/icon.png" alt="AquaAI Logo" className="auth-logo-img" />
          <span>AquaAI</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-center">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          {/* Header */}
          <div className="auth-card-header">
            <div className="auth-icon-wrap">
              {/* <RiShieldKeyholeLine size={26} /> */}
              <img src="/icon.png" alt="AquaAI Logo" className="auth-logo-img" />
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your AquaAI account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <FiAlertCircle size={15} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`auth-field ${focused === "username" ? "focused" : ""}`}>
              <FiUser className="auth-field-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username or Email"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused("")}
                required
                autoComplete="username"
              />
            </div>

            <div className={`auth-field ${focused === "password" ? "focused" : ""}`}>
              <FiLock className="auth-field-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="auth-forgot-row">
              <a href="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            No account? <a href="/register">Create one</a>
          </p>
        </motion.div>

        {/* Floating badge */}
        {/* <motion.div className="auth-trust-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <span className="trust-dot" />
          <span>256-bit encrypted · GDPR compliant</span>
        </motion.div> */}
      </div>
    </div>
  );
}
