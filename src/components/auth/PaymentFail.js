import React from "react";
import { motion } from "framer-motion";
import "./payment.css";

export default function PaymentFail() {
  return (
    <div className="payment-page payment-fail-page">
      {/* Animated background */}
      <div className="payment-bg">
        <div className="payment-orb orb-fail-1" />
        <div className="payment-orb orb-fail-2" />
        <div className="payment-grid" />
      </div>

      <motion.div
        className="payment-card"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* X icon */}
        <motion.div
          className="payment-icon-wrap fail-icon-wrap"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 180, damping: 14 }}
        >
          <svg className="cross-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="cross-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="cross-line" fill="none" d="M16 16 36 36 M36 16 16 36" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <h1 className="payment-title">Payment Failed</h1>
          <p className="payment-subtitle">
            Something went wrong with your payment. Don't worry — you haven't been charged.
            Please try again or use a different payment method.
          </p>

          <div className="payment-details-pill fail-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="me-1">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
            Transaction Declined
          </div>
        </motion.div>

        <motion.div
          className="payment-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <a href="/plans" className="payment-btn payment-btn-primary">
            Try Again
          </a>
          <a href="aqua://" className="payment-btn payment-btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" className="me-2">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to App
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
