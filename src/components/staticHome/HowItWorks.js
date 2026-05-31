import "./HowItWorks.css";
import { useEffect, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiDroplet, FiTrendingUp, FiBell, FiHeart } from "react-icons/fi";
import CTABanner from "./CTABanner";

const STEPS = [
  {
    number: "01",
    label: "Monitor",
    body: "We monitor your water quality and fish behavior.",
    icon: <FiDroplet />,
  },
  {
    number: "02",
    label: "Analyze",
    body: "AI analyzes the data to detect patterns and issues.",
    icon: <FiTrendingUp />,
  },
  {
    number: "03",
    label: "Alert",
    body: "Get instant alerts and actionable insights.",
    icon: <FiBell />,
  },
  {
    number: "04",
    label: "Improve",
    body: "Follow personalized recommendations for better care.",
    icon: <FiHeart />,
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`hiw-section${visible ? " is-visible" : ""} d-xl-flex d-block`} ref={ref}>
      <Container fluid="xl">
        {/* ── Heading (centred) ── */}
        <Row className="justify-content-center">
          <Col xs={12} className="text-center">
            <div className="hiw-heading">
              <p className="hiw-eyebrow">Simple. Smart. Seamless.</p>
              <h2 className="hiw-title">
                How <span className="hiw-brand">Aqua AI</span> Works
              </h2>
              <div className="hiw-heading-bar d-flex justify-content-center gap-1">
                <span className="hiw-bar hiw-bar--1" />
                <span className="hiw-bar hiw-bar--2" />
                <span className="hiw-bar hiw-bar--3" />
                <span className="hiw-bar hiw-bar--4" />
              </div>
            </div>
          </Col>
        </Row>

        {/* ── Steps ── */}
        <Row className="hiw-steps-row justify-content-center">
          {/* Pure-CSS dashed connector — 1 px, sits behind icons */}
          <div className="hiw-connector" aria-hidden="true" />

          {STEPS.map((step, i) => (
            <Col
              key={i}
              xs={12}
              sm={6}
              md={3}
              className={`hiw-step${activeStep === i ? " active" : ""}`}
              style={{ "--delay": `${i * 0.14}s` }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Icon circle */}
              <div className="hiw-icon-wrap mx-auto">
                <div className="hiw-icon d-flex align-items-center justify-content-center">{step.icon}</div>
                <div className="hiw-pulse" />
              </div>

              {/* Text */}
              <div className="hiw-text text-center mx-auto">
                <span className="hiw-number">{step.number}</span>
                <h3 className="hiw-label">{step.label}</h3>
                <p className="hiw-body">{step.body}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <CTABanner />
    </section>
  );
}
