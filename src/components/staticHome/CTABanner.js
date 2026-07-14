import "./CTABanner.css";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiArrowRight } from "react-icons/fi";
import FishModel from "./FishModel";
import { useNavigate } from "react-router-dom";

/** Wraps FishModel and makes it swim in a gentle figure-8 path inside 3D space,
 *  so the tail-flap AND body movement are both visible — no CSS animation needed. */
function SwimmingFish({ speed = 1, radius = 1.2, phaseOffset = 0 }) {
  const groupRef = useRef();
  const t = useRef(phaseOffset);

  useFrame((_, delta) => {
    t.current += delta * speed * 0.4;
    if (!groupRef.current) return;

    // Lemniscate (figure-8) path in XZ plane viewed from above
    const denom = 1 + Math.sin(t.current) ** 2;
    const x = (radius * Math.cos(t.current)) / denom;
    const z = (radius * Math.sin(t.current) * Math.cos(t.current)) / denom;

    // Heading angle = direction of travel (derivative of position)
    const dx = -(radius * Math.sin(t.current) * (2 + Math.sin(t.current) ** 2)) / denom ** 2;
    const dz = (radius * Math.cos(2 * t.current)) / denom;
    const angle = Math.atan2(dx, dz);

    groupRef.current.position.set(x, 0, z);
    groupRef.current.rotation.set(0, angle, 0);
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      <FishModel animationSpeed={speed} />
    </group>
  );
}

function CardFish({ className, speed = 1, phaseOffset = 0 }) {
  return (
    <div className={`cta-fish ${className}`}>
      <Canvas camera={{ position: [0, 6, 0], fov: 45, up: [0, 0, -1] }}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-5, 4, -5]} intensity={1} />
        <Suspense fallback={null}>
          <SwimmingFish speed={speed} radius={1.4} phaseOffset={phaseOffset} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function CTABanner() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <Container fluid="xl">
        <div className="cta-card shadow-lg ">
          <div className="cta-ripple cta-ripple--1" />
          <div className="cta-ripple cta-ripple--2" />
          <div className="cta-ripple cta-ripple--3" />
          <div className="cta-ripple cta-ripple--4" />

          <CardFish className="cta-fish--a" speed={0.85} phaseOffset={0} />
          <CardFish className="cta-fish--b" speed={1.1} phaseOffset={Math.PI} />

          <Row className="align-items-center gy-4 position-relative" style={{ zIndex: 10 }}>
            <Col xs={12} md={8} lg={9}>
              <div className="cta-copy">
                <p className="cta-eyebrow">Trusted by 10,000+ aquarists</p>
                <h2 className="cta-headline">
                  Your Aquarium,
                  <br />
                  Smarter Than Ever
                </h2>
                <p className="cta-body">Join thousands of aquarists who trust AQUA AI® to keep their tanks healthy and thriving.</p>
                <button className="cta-btn" onClick={() => navigate("/register")}>
                  Get Started Free
                  <FiArrowRight className="cta-btn-icon" />
                </button>
              </div>
            </Col>
            <Col xs={12} md={5} lg={6} />
          </Row>
        </div>
      </Container>
    </section>
  );
}
