import React, { useState, useContext } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaIdBadge, FaHandsHelping } from "react-icons/fa";
import "./register.css";
import { baseUrl } from "./config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authcontext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: "", email: "", name: "", password: "", referral_code: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        setMessage("Account created! Signing you in...");

        // Auto-login: use the token returned from registration
        // If the API returns an access token directly, use it; otherwise login with credentials
        if (data.access) {
          await login(data.access);
          navigate("/plans");
        } else {
          // Fallback: log in with credentials to get a token
          try {
            const loginRes = await fetch(`${baseUrl}/user/login/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: formData.username, password: formData.password }),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.access) {
              await login(loginData.access);
              navigate("/plans");
            } else {
              // Login failed but registration succeeded — redirect to login
              setTimeout(() => navigate("/login"), 1500);
            }
          } catch {
            setTimeout(() => navigate("/login"), 1500);
          }
        }
      } else {
        console.log(data);
        setMessage(`Registration failed. ${data?.message}.`);
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Dynamic Background Blobs */}
      <div className="bg-glow-container">
        <div className="blob-purple-top"></div>
        <div className="blob-blue-bottom"></div>
      </div>

      <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-4">
          <h2 className="register-title fw-bold">Create Account</h2>
          <p className="text-muted small">Join our community today</p>
        </div>

        {message && <div className={`custom-alert mb-3 ${message.includes("Success") ? "alert-success-glass" : ""}`}>{message}</div>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaIdBadge />
              </span>
              <Form.Control type="text" name="name" placeholder="Full Name" className="custom-input" onChange={handleChange} required />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaUser />
              </span>
              <Form.Control type="text" name="username" placeholder="Username" className="custom-input" onChange={handleChange} required />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaEnvelope />
              </span>
              <Form.Control type="email" name="email" placeholder="Email Address" className="custom-input" onChange={handleChange} required />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaLock />
              </span>
              <Form.Control type="password" name="password" placeholder="Password" className="custom-input" onChange={handleChange} required />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <div className="input-group-custom">
              <span className="input-icon">
                <FaHandsHelping />
              </span>
              <Form.Control type="text" name="referral_code" placeholder="Referral Code" className="custom-input" onChange={handleChange} />
            </div>
          </Form.Group>

          <Button type="submit" className="glow-button w-100 py-2" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Register Now"}
          </Button>
        </Form>

        <p className="text-center mt-4 mb-0 text-muted small">
          Already have an account?{" "}
          <a href="/login" className="auth-nav-link">
            Sign In
          </a>
        </p>
      </motion.div>
    </div>
  );
}
