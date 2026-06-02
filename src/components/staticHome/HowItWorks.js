import "./HowItWorks.css";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { FiDroplet, FiTrendingUp, FiBell, FiHeart,
         FiDownload, FiHome, FiCpu, FiUsers } from "react-icons/fi";
import { GiFishbone } from "react-icons/gi";
import FishModel from "./FishModel";

const STEPS = [
  { number: "01", label: "Monitor",           icon: <FiDroplet />,   body: "We monitor your water quality and fish behaviour in real time, tracking every parameter that matters." },
  { number: "02", label: "Analyse",           icon: <FiTrendingUp />,body: "AI analyses the data to detect patterns, anomalies, and potential issues before they become problems." },
  { number: "03", label: "Alert",             icon: <FiBell />,      body: "Get instant, actionable alerts tailored to your specific habitat and species mix." },
  { number: "04", label: "Improve",           icon: <FiHeart />,     body: "Follow personalised care plan recommendations to keep your aquarium thriving long-term." },
];

/* ── Single decorative fish (top-down, CSS-positioned, gentle float) ── */
function DecorFish({ className, animationSpeed = 1 }) {
  return (
    <div className={`hiw-fish ${className}`}>
      <Canvas camera={{ position: [0, 6, 0], fov: 45, up: [0, 0, -1] }}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-5, 4, -5]} intensity={1} />
        <Suspense fallback={null}>
          {/* Top-down view, CSS handles on-screen angle via transform */}
          <group rotation={[Math.PI / 2, 0, 0]}>
            <FishModel animationSpeed={animationSpeed} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);
  const [visible,    setVisible]    = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`hiw-section${visible ? " is-visible" : ""}`}
      ref={sectionRef}
      id="how-it-works"
    >
      {/* ── Decorative floating koi fish (left side / scattered) ── */}
      <DecorFish className="hiw-fish--1" animationSpeed={0.8} />
      <DecorFish className="hiw-fish--2" animationSpeed={1.1} />
      <DecorFish className="hiw-fish--3" animationSpeed={0.9} />

      <div className="hiw-layout">

        {/* ════════════════ LEFT: heading + steps ════════════════ */}
        <div className="hiw-left">

          {/* Heading */}
          <div className="hiw-heading">
            <p className="hiw-eyebrow">How It Works</p>
            <h2 className="hiw-title">
              Simple. <span className="hiw-brand">Intelligent.</span> Effective.
            </h2>
            <div className="hiw-bars d-flex gap-1">
              <span className="hiw-bar hiw-bar--1" />
              <span className="hiw-bar hiw-bar--2" />
              <span className="hiw-bar hiw-bar--3" />
              <span className="hiw-bar hiw-bar--4" />
            </div>
          </div>

          {/* Step cards with vertical connector line */}
          <div className="hiw-steps-wrap">
            {/* Vertical dashed line between steps */}
            <div className="hiw-vline" aria-hidden="true" />

            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`hiw-step-row${activeStep === i ? " active" : ""}`}
                style={{ "--delay": `${i * 0.14}s` }}
                onMouseEnter={() => setActiveStep(i)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Card */}
                <div className="hiw-step-card">
                  <span className="hiw-step-num">{step.number}</span>
                  <h3 className="hiw-step-label">{step.label}</h3>
                  <p className="hiw-step-body">{step.body}</p>
                </div>

                {/* Centre node on the line */}
                <div className="hiw-node">
                  <div className="hiw-node-icon">{step.icon}</div>
                  <div className="hiw-node-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════ RIGHT: sticky video panel ════════════════ */}
        <div className="hiw-right">
          <div className="hiw-video-sticky">
            <div className="hiw-video-frame">
              {/* Inner glow */}
              <div className="hiw-video-glow" />

              <video
                className="hiw-video"
                src="/fishes.mp4"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Subtle overlay gradient at bottom */}
              <div className="hiw-video-overlay" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
