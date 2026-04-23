import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaGem, FaCrown, FaStar, FaTags, FaHistory, FaInfoCircle, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom"; // Added for navigation
import { AuthContext } from "./authcontext";
import { baseUrl } from "./config";
import "./plans.css";

export default function Plans() {
  const { token, logout } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [planDiscounts, setPlanDiscounts] = useState([]);
  const [currentDiscountPreview, setCurrentDiscountPreview] = useState(null);
  const [userCredit, setUserCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

        const [pRes, sRes, dAllRes, dCurrentRes] = await Promise.all([
          fetch(`${baseUrl}/subscription/subscription/plans/`, { headers }),
          fetch(`${baseUrl}/subscription/subscription/my/`, { headers }),
          fetch(`${baseUrl}/subscription/subscription/plan-discounts/`, { headers }),
          fetch(`${baseUrl}/subscription/subscription/preview-discount/`, { headers }),
        ]);

        const pJson = await pRes.json();
        const sJson = await sRes.json();
        const dAllJson = await dAllRes.json();
        const dCurrentJson = await dCurrentRes.json();

        if (pJson.data) setPlans(pJson.data.plans);

        if (sJson.data) {
          setMySubscription(sJson.data);
          if (sJson.data.plan?.billing_period === "yearly") {
            setIsYearly(true);
          }
        }

        if (dAllJson.data) {
          setPlanDiscounts(dAllJson.data.plans);
          setUserCredit(dAllJson.data.your_credit.available);
        }
        if (dCurrentJson.data) setCurrentDiscountPreview(dCurrentJson.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load subscription data.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPlansData();
  }, [token]);

  const handleSubscribe = async (planKey) => {
    setSubmitting(planKey);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/subscription/subscription/subscribe/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_key: planKey,
          billing_period: isYearly ? "yearly" : "monthly",
          referral_code: "01F6287AAFB4N8",
        }),
      });

      const result = await response.json();

      if (response.ok && result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        setError(result.message || "Something went wrong. Please try again.");
        setSubmitting(null);
      }
    } catch (err) {
      setError("Connection error. Please check your internet.");
      setSubmitting(null);
    }
  };

  if (loading)
    return (
      <div className="plans-loading-screen">
        <Spinner animation="border" variant="info" />
      </div>
    );

  return (
    <div className="plans-page">
      <div className="animated-bg">
        <div className="mesh-gradient"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <Container className="py-5 position-relative">
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="text-center">
            {error}
          </Alert>
        )}

        <div className="text-center mb-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Back to App Button */}
            <div className="mb-3">
              <a href="aqua://" className="back-to-app-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                </svg>
                Back to App
              </a>
            </div>
            <div className="promo-pill mb-3">
              <FaStar className="me-2 text-warning" />
              <span>
                Available Credit: <strong>£{userCredit}</strong>
              </span>
            </div>
            <h1 className="main-title">Pricing Plans</h1>
          </motion.div>

          <div className="toggle-container">
            <span className={!isYearly ? "label-active" : "label-inactive"}>Monthly</span>
            <button className={`toggle-switch ${isYearly ? "is-yearly" : ""}`} onClick={() => setIsYearly(!isYearly)}>
              <div className="switch-handle" />
            </button>
            <span className={isYearly ? "label-active" : "label-inactive"}>
              Yearly <small className="discount-tag">Best Value</small>
            </span>
          </div>
        </div>

        <Row className="justify-content-center align-items-stretch g-4">
          {planDiscounts.map((discountPlan) => {
            const basePlanInfo = plans.find((p) => p.key === discountPlan.plan);
            const checkType = isYearly ? "yearly" : "monthly";
            const isCurrent = mySubscription?.has_subscription && mySubscription?.plan?.key === discountPlan.plan && mySubscription?.plan?.billing_period === checkType;
            const priceData = isYearly ? discountPlan.yearly : discountPlan.monthly;
            const isPro = discountPlan.plan === "pro";
            const isProcessing = submitting === discountPlan.plan;

            return (
              <Col key={discountPlan.plan} lg={5} md={6}>
                <motion.div className={`premium-card ${isPro ? "pro-card" : "base-card"}`} whileHover={{ scale: 1.02 }}>
                  {isCurrent && <div className="active-tag">CURRENT PLAN</div>}

                  <div className="card-inner-header">
                    <div className="icon-circle">{discountPlan.plan === "premium" ? <FaGem size={22} /> : <FaCrown size={22} />}</div>
                    <div className="name-box">
                      <h2 className="plan-display-name">{discountPlan.name}</h2>
                      <p className="plan-subtitle">{isPro ? "Professional" : "Standard"}</p>
                    </div>
                  </div>

                  <div className="price-box">
                    <AnimatePresence mode="wait">
                      <motion.div key={isYearly} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="d-flex align-items-end gap-1">
                          <span className="unit">£</span>
                          <span className="big-price">{priceData?.you_pay}</span>
                          <span className="cycle">/{isYearly ? "yr" : "mo"}</span>
                        </div>
                        {priceData.discount > 0 && <div className="original-price-strike">Was £{priceData.original}</div>}
                      </motion.div>
                    </AnimatePresence>
                    {priceData.discount > 0 && (
                      <div className="extra-discount-pill">
                        <FaTags className="me-1" /> -£{priceData.discount} Credit Applied
                      </div>
                    )}
                  </div>

                  {isCurrent && currentDiscountPreview && (
                    <div className="current-plan-preview-box">
                      <div className="preview-header">
                        <FaHistory className="me-2" /> Next Renewal Details
                      </div>
                      <p className="preview-text">{currentDiscountPreview.note}</p>
                      <small className="preview-tip">
                        <FaInfoCircle className="me-1" /> {currentDiscountPreview.tip}
                      </small>
                    </div>
                  )}

                  <div className="feature-grid mt-4">
                    {basePlanInfo?.features && (
                      <>
                        <div className="feat-item">
                          <FaCheckCircle className="feat-icon" /> {basePlanInfo.features.max_habitats || "Unlimited"} Habitats
                        </div>
                        <div className="feat-item">
                          <FaCheckCircle className="feat-icon" /> {basePlanInfo.features.ai_chat_monthly_limit} AI Queries
                        </div>
                        {basePlanInfo.features.disease_detection && (
                          <div className="feat-item">
                            <FaCheckCircle className="feat-icon" /> Disease Detection
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="card-footer mt-auto">
                    <Button className={`action-btn ${isCurrent ? "btn-disabled" : "btn-neon"}`} disabled={isCurrent || submitting !== null} onClick={() => handleSubscribe(discountPlan.plan)}>
                      {isProcessing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Redirecting...
                        </>
                      ) : isCurrent ? (
                        "Active"
                      ) : (
                        `Switch to ${discountPlan.name}`
                      )}
                    </Button>
                  </div>
                </motion.div>
              </Col>
            );
          })}
        </Row>

        {/* --- Skip / Logout Actions --- */}
        <motion.div className="text-center mt-5 d-flex flex-column align-items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link to="/dashboard" className="skip-link">
            No thanks, skip for now <FaArrowRight className="ms-1" size={12} />
          </Link>
          <button
            className="btn-danger btn"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
          >
            Log out
          </button>
        </motion.div>
      </Container>
    </div>
  );
}
