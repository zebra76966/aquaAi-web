import "./HowItWorksTimeline.css";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { FiDownload, FiHome, FiDroplet, FiCpu, FiUsers, FiTrendingUp } from "react-icons/fi";
import { IoFishSharp } from "react-icons/io5";
import FishModel from "./FishModel";

const STEPS = [
  { icon: FiDownload, num: "01", title: "Download the App", body: "Available on iOS and Android. Create your account on the Aqua AI platform in under two minutes." },
  { icon: FiHome, num: "02", title: "Set Up Your Habitat", body: "Name your tank or pond. Choose your water type — freshwater, saltwater, or brackish. Enter the volume." },
  { icon: IoFishSharp, num: "03", title: "Add Your Fish", body: "Scan your tank with the camera or search the species database. Confirm identification and save to your habitat." },
  { icon: FiDroplet, num: "04", title: "Enter Water Parameters", body: "Manually enter readings or scan a test strip with your camera. AI interprets the results instantly." },
  { icon: FiCpu, num: "05", title: "Get AI Insights", body: "Receive personalised care plans, early alerts, and recommendations based on your live habitat data." },
  { icon: FiUsers, num: "06", title: "Connect with Experts", body: "Browse verified breeders for new stock. Book certified aquatic consultants for professional support." },
  { icon: FiTrendingUp, num: "07", title: "Track & Improve", body: "Monitor health scores, growth tracking, water trends, and badge progress over time." },
];

/* Decorative top-down koi using FishModel GLB */
function DecorFish({ className, animationSpeed = 1 }) {
  return (
    <div className={`tl-fish ${className}`} aria-hidden="true">
      <Canvas camera={{ position: [0, 6, 0], fov: 45, up: [0, 0, -1] }}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-5, 4, -5]} intensity={1} />
        <Suspense fallback={null}>
          <group rotation={[Math.PI / 2, 0, 0]}>
            <FishModel animationSpeed={animationSpeed} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function HowItWorksTimeline() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hiw-timeline-section" id="how-it-works" ref={ref} data-visible={visible}>
      {/* ── Decorative floating fish (visible desktop only) ── */}
      {/* <DecorFish className="tl-fish--1" animationSpeed={0.8} />
      <DecorFish className="tl-fish--2" animationSpeed={1.1} />
      <DecorFish className="tl-fish--3" animationSpeed={0.95} /> */}

      {/* ── Two-column outer wrapper ── */}
      <div className="tl-outer">
        {/* LEFT: heading + alternating timeline steps */}
        <div className="tl-left">
          <div className="hiw-tl-inner">
            <div className="hiw-tl-heading">
              <p className="hiw-tl-eyebrow">How It Works</p>
              <h2 className="hiw-tl-title">
                Simple. <span className="hiw-tl-accent">Intelligent.</span> Effective.
              </h2>
            </div>

            <div className="hiw-tl-track">
              <div className="hiw-tl-line" />

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isRight = i % 2 === 1;
                return (
                  <div key={i} className={`hiw-tl-step${isRight ? " hiw-tl-step--right" : ""}`} style={{ "--delay": `${i * 0.12}s` }}>
                    <div className="hiw-tl-card">
                      <div className="hiw-tl-card-num">{step.num}</div>
                      <h3 className="hiw-tl-card-title">{step.title}</h3>
                      <p className="hiw-tl-card-body">{step.body}</p>
                    </div>

                    <div className="hiw-tl-node">
                      <div className="hiw-tl-node-icon">
                        <Icon />
                      </div>
                      <div className="hiw-tl-node-pulse" />
                    </div>

                    <div className="hiw-tl-spacer" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: sticky video panel */}
        <div className="tl-right">
          <div className="tl-video-sticky">
            <div className="tl-video-frame">
              <div className="tl-video-glow" />
              <video className="tl-video" src="/vid/heroVod.mp4" autoPlay muted loop playsInline />
              <div className="tl-video-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
