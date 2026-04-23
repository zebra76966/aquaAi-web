import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "./passwordReset.css";
import { baseUrl } from "./config";

export default function PasswordReset() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("reset_token");

  const [step, setStep] = useState(urlToken ? "SUBMIT" : "REQUEST");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (urlToken) {
      fetch(`${baseUrl}/api/v1/user/password-reset/verify/?reset_token=${urlToken}`)
        .then((res) => {
          if (!res.ok) setMessage("Invalid or expired token.");
        })
        .catch(() => setMessage("Error verifying token."));
    }
  }, [urlToken]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/user/password-reset/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setMessage("Check your inbox! A reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/user/password-reset/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: urlToken, password }),
      });
      if (res.ok) {
        setMessage("Password updated successfully! Redirecting...");
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="bg-glow-container">
        <div className="blob-orange-top"></div>
        <div className="blob-purple-bottom"></div>
      </div>

      <motion.div className="glass-panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <div className="text-center mb-4">
          <h2 className="reset-title fw-bold">{step === "REQUEST" ? "Reset Password" : "New Password"}</h2>
          <p className="text-muted small">{step === "REQUEST" ? "We'll send a link to your email to get back in." : "Choose a strong password to secure your account."}</p>
        </div>

        {message && <div className={`custom-alert mb-4 ${message.includes("success") || message.includes("inbox") ? "alert-success-glass" : ""}`}>{message}</div>}

        {step === "REQUEST" ? (
          <Form onSubmit={handleRequest}>
            <Form.Group className="mb-4">
              <div className="input-group-custom">
                <span className="input-icon">
                  <FaEnvelope />
                </span>
                <Form.Control type="email" placeholder="Enter your email" className="custom-input" onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </Form.Group>
            <Button type="submit" className="glow-button w-100 py-2" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Send Reset Link"}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <div className="input-group-custom">
                <span className="input-icon">
                  <FaLock />
                </span>
                <Form.Control type="password" placeholder="Enter new password" className="custom-input" onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </Form.Group>
            <Button type="submit" className="glow-button w-100 py-2" disabled={loading || message === "Invalid or expired token."}>
              {loading ? <Spinner size="sm" animation="border" /> : "Confirm New Password"}
            </Button>
          </Form>
        )}

        <div className="text-center mt-4">
          <a href="/login" className="back-to-login">
            ← Back to Login
          </a>
        </div>
      </motion.div>
    </div>
  );
}
