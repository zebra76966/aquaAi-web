import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";
import "./login.css";
import { baseUrl } from "./config";
import { AuthContext } from "./authcontext";

export default function Login() {
  const { token, login, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Local state for the button spinner
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Use authLoading (from context) not loading (from local state)
    if (!authLoading && token) {
      navigate("/plans");
    }
  }, [token, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/user/login/`, {
        // Using baseUrl from config
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        // Use the context login function!
        // This handles token storage and redirects via the useEffect above
        await login(data.access);
        navigate("/plans");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* These blobs create the colorful glow behind the glass */}
      <div className="bg-glow-container">
        <div className="blob-purple"></div>
        <div className="blob-blue"></div>
      </div>

      <motion.div className="glass-panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div className="login-header text-center mb-4">
          <h2 className="login-title fw-bold">Welcome Back</h2>
          <p className="text-muted small">Please enter your details to sign in</p>
        </div>

        {error && <div className="custom-alert mb-3">{error}</div>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaUser />
              </span>
              <Form.Control type="text" name="username" placeholder="Username or Email" className="custom-input" onChange={handleChange} required />
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaLock />
              </span>
              <Form.Control type="password" name="password" placeholder="Password" className="custom-input" onChange={handleChange} required />
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end mb-4">
            <a href="/forgot-password" opacity="0.8" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="glow-button w-100" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Sign In"}
          </Button>
        </Form>

        <p className="text-center mt-4 mb-0 text-muted small">
          Don't have an account?{" "}
          <a href="/register" className="auth-nav-link">
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
