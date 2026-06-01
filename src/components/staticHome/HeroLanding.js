import "./HeroLanding.css";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiMenu, FiClipboard, FiTrendingUp, FiShield, FiMessageCircle, FiArrowRight } from "react-icons/fi";
import { GiWaves } from "react-icons/gi";
import FishModel from "./FishModel";
import { useNavigate } from "react-router-dom";

function Fish({ className, animationSpeed = 1 }) {
  return (
    <div className={`fish ${className}`}>
      <div className="fish-inner">
        <Canvas
          camera={{
            position: [0, 0, 8],
            fov: 35,
          }}
        >
          <ambientLight intensity={2} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <directionalLight position={[-5, -2, -5]} intensity={1} />

          <Suspense fallback={null}>
            <group rotation={[Math.PI / 2, 0, 0]}>
              <FishModel animationSpeed={animationSpeed} />
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

function GiantRevealFish({ onComplete }) {
  return (
    <motion.div
      className="giant-fish"
      initial={{ top: "-30%", opacity: 0 }}
      animate={{ top: ["-30%", "10%", "60%", "130%"], opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 5.2,
        times: [0, 0.25, 0.7, 1],
        ease: "easeInOut",
      }}
      onAnimationComplete={onComplete}
    >
      <div className="fish-inner">
        <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
          <ambientLight intensity={2} />
          <directionalLight position={[5, 5, 5]} intensity={2.5} />
          <directionalLight position={[-5, -2, -5]} intensity={1} />
          <Suspense fallback={null}>
            <group rotation={[Math.PI / 2, 0, 0]}>
              <FishModel animationSpeed={1.2} />
            </group>
          </Suspense>
        </Canvas>
      </div>
    </motion.div>
  );
}

function AquaTitle() {
  return (
    <svg className="aqua-title" viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg" aria-label="AQUA AI">
      <defs>
        <mask id="water-mask">
          <path className="water-wave" d="M-100,80 Q 0,60 100,80 T 300,80 T 500,80 T 700,80 T 900,80 L 900,180 L -100,180 Z" fill="white" />
        </mask>
      </defs>

      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" className="title-outline">
        AQUA AI
      </text>

      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" className="title-fill" mask="url(#water-mask)">
        AQUA AI
      </text>
    </svg>
  );
}

function RandomRipples({ count = 14 }) {
  const ripples = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 90,
      left: Math.random() * 90,
      size: 100 + Math.random() * 220,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 4,
    })),
  )[0];

  return (
    <>
      {ripples.map((r) => (
        <div
          key={r.id}
          className="random-ripple"
          style={{
            top: `${r.top}%`,
            left: `${r.left}%`,
            width: `${r.size}px`,
            height: `${r.size}px`,
            animationDelay: `${r.delay}s`,
            animationDuration: `${r.duration}s`,
          }}
        />
      ))}
    </>
  );
}

/** Feature cards row that sits below the CTAs. */
const FEATURE_CARDS = [
  {
    icon: FiClipboard,
    title: "Personalized\nCare Plans",
    body: "Tailored care plans for your aquarium's unique needs.",
  },
  {
    icon: FiTrendingUp,
    title: "AI Insights",
    body: "Understand water quality and fish health with AI insights.",
  },
  {
    icon: FiShield,
    title: "Disease Detection",
    body: "Detect signs of disease early and take action faster.",
  },
  {
    icon: FiMessageCircle,
    title: "Expert Guidance",
    body: "Get AI recommendations and expert-backed advice.",
  },
];

function FeatureCards({ cardVariants }) {
  return (
    <div className="feature-cards">
      {FEATURE_CARDS.map(({ icon: Icon, title, body }, i) => (
        <motion.div key={i} className="feature-card" variants={cardVariants} style={{ position: "relative", zIndex: i % 2 ? 199 : 1 }}>
          <div className="feature-icon">
            <Icon />
          </div>
          <h3 className="feature-title">
            {title.split("\n").map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h3>
          <p className="feature-body">{body}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function HeroLanding() {
  const [introDone, setIntroDone] = useState(false);
  const [contentReveal, setContentReveal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const revealTimer = setTimeout(() => setContentReveal(true), 1600);
    return () => clearTimeout(revealTimer);
  }, []);

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
      zIndex: 1,
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="hero">
      <motion.img src="/pond.png" alt="" className="pond-bg" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: introDone ? 0.7 : 0 }} transition={{ duration: 1.2, ease: "easeOut" }} />

      <RandomRipples count={14} />

      <AnimatePresence>{!introDone && <GiantRevealFish onComplete={() => setIntroDone(true)} />}</AnimatePresence>

      <div className="ripple ripple1"></div>
      <div className="ripple ripple2"></div>
      <div className="ripple ripple3"></div>
      <div className="ripple ripple4"></div>

      <motion.div className="content" variants={contentVariants} initial="hidden" animate={contentReveal ? "visible" : "hidden"}>
        <motion.div className="fish-flock" initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ duration: 1.0, ease: "easeOut" }}>
          <Fish className="swim-lr-1 size-xl " animationSpeed={1.0} />
          {/* <Fish className="swim-lr-2 size-lg tint-cool over-text" animationSpeed={1.4} /> */}
          <Fish className="swim-lr-floaty size-lg over-text" animationSpeed={0.9} />

          <Fish className="swim-rl-1 size-xl tint-dark" animationSpeed={0.6} />
          {/* <Fish className="swim-rl-2 size-md tint-cool" animationSpeed={1.1} /> */}
          <Fish className="swim-rl-floaty size-lg over-text" animationSpeed={1.3} />

          <Fish className="swim-tb-1 size-xl tint-warm" animationSpeed={1.2} />
          <Fish className="swim-bt-1 size-lg tint-cool over-text" animationSpeed={0.8} />

          <Fish className="swim-diag-1 size-xl tint-dark over-text" animationSpeed={0.7} />
          <Fish className="swim-diag-2 size-xl over-text" animationSpeed={1.3} />
        </motion.div>

        <motion.div className="subtitle" variants={itemVariants}>
          SMART CARE. HEALTHY AQUARIUMS.
        </motion.div>
        <motion.div variants={itemVariants} style={{ position: "relative", zIndex: 199 }}>
          <AquaTitle />
        </motion.div>

        <motion.h6 variants={itemVariants}>
          <GiWaves size={30} className="wave-icon" />
        </motion.h6>

        <motion.p variants={itemVariants}>
          Automated care plans, smart insights, and early disease
          <br />
          detection for a healthier aquarium.
        </motion.p>

        <motion.div className="cta-row" variants={{ ...itemVariants }} style={{ position: "relative", zIndex: 200 }}>
          <button className="btn btn-outline" onClick={() => navigate("/download")}>
            <FiDownload className="btn-icon" />
            Download App
          </button>
          <button className="btn btn-filled" onClick={() => navigate("/features")}>
            Learn More
            <FiArrowRight className="btn-icon" />
          </button>
        </motion.div>

        <FeatureCards cardVariants={itemVariants} />
      </motion.div>
    </section>
  );
}
