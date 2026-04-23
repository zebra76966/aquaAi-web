import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./payment.css";

export default function PaymentSuccess() {
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRipple(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="payment-page payment-success-page">
      {/* Animated background */}
      <div className="payment-bg">
        <div className="payment-orb orb-success-1" />
        <div className="payment-orb orb-success-2" />
        <div className="payment-grid" />
      </div>

      {/* Ripple rings */}
      {ripple && (
        <div className="ripple-container">
          <div className="ripple-ring ring-1" />
          <div className="ripple-ring ring-2" />
          <div className="ripple-ring ring-3" />
        </div>
      )}

      <motion.div
        className="payment-card"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Checkmark */}
        <motion.div
          className="payment-icon-wrap success-icon-wrap"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 14 }}
        >
          <svg className="checkmark-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <h1 className="payment-title">Payment Successful!</h1>
          <p className="payment-subtitle">
            Your subscription is now active. Welcome to the full AquaAI experience.
          </p>

          <div className="payment-details-pill">
            <span className="pulse-dot" />
            Subscription Activated
          </div>
        </motion.div>

        <motion.div
          className="payment-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <a href="aqua://" className="payment-btn payment-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
            Open AquaAI App
          </a>
          <a href="/plans" className="payment-btn payment-btn-ghost">
            View Plans
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
