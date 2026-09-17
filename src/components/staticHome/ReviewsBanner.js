import "./ReviewsBanner.css";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { GiWaves } from "react-icons/gi";
import FishModel from "./FishModel";

const REVIEWS = [
  {
    name: "Rohit S.",
    role: "Hobbyist",
    avatar: "RS",
    avatarColor: "#1a4a6e",
    stars: 5,
    quote: "AQUA AI® helped me detect fin rot early. The care plan was super easy to follow and my fish is doing great now!",
  },
  {
    name: "Priya S.",
    role: "Betta Keeper",
    avatar: "PS",
    avatarColor: "#1a3a4e",
    stars: 5,
    quote: "The disease scanner is scarily accurate. I uploaded a photo of my betta and it flagged early-stage columnaris before I'd even noticed anything wrong myself — my vet confirmed it a day later.",
  },
  {
    name: "Liam B.",
    role: "Marine Aquarist",
    avatar: "LB",
    avatarColor: "#0f2e50",
    stars: 5,
    quote: "Running a 200L reef tank used to mean constant manual logging. Now AQUA AI® tracks my parameters and nudges me before anything drifts out of range. Genuinely changed how I manage the tank.",
  },
  {
    name: "Sarah K.",
    role: "Koi Pond Enthusiast",
    avatar: "SK",
    avatarColor: "#1a3050",
    stars: 5,
    quote: "I've tried a few pond apps and none come close. The seasonal care reminders alone have saved my koi twice this year.",
  },
  {
    name: "Daniel O.",
    role: "First-Time Fishkeeper",
    avatar: "DO",
    avatarColor: "#164a5e",
    stars: 5,
    quote: "Honestly didn't know what I was doing when I set up my first tank. AQUA AI® walked me through cycling it properly and now checks in with tips as my tank matures. Feels like having an expert on call.",
  },
  {
    name: "Meera J.",
    role: "Planted Tank Hobbyist",
    avatar: "MJ",
    avatarColor: "#12395c",
    stars: 5,
    quote: "Love how the app connects water parameters to plant health, not just fish. Made it so much easier to figure out why my anubias kept melting.",
  },
  {
    name: "Tom H.",
    role: "Cichlid Breeder",
    avatar: "TH",
    avatarColor: "#0e3350",
    stars: 4,
    quote: "Great for keeping tabs on multiple tanks from one dashboard. Would love a few more alert customisation options, but it's already saved me from a couple of ammonia spikes.",
  },
  {
    name: "Amara N.",
    role: "Aquascaper",
    avatar: "AN",
    avatarColor: "#1a5570",
    stars: 5,
    quote: "The AI insights are spot on and it's genuinely nice to look at. Booked a consultant through the app too — quick, straightforward, and my scape has never looked better.",
  },
];

function StarRating({ count = 5 }) {
  return (
    <div className="rv-stars">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="rv-star" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* Reuse the exact same SwimmingFish pattern from CTABanner */
function SwimmingFish({ speed = 1, radius = 1.2, phaseOffset = 0 }) {
  const groupRef = useRef();
  const t = useRef(phaseOffset);

  useFrame((_, delta) => {
    t.current += delta * speed * 0.4;
    if (!groupRef.current) return;

    const denom = 1 + Math.sin(t.current) ** 2;
    const x = (radius * Math.cos(t.current)) / denom;
    const z = (radius * Math.sin(t.current) * Math.cos(t.current)) / denom;
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

function CardFish({ className, speed, phaseOffset }) {
  return (
    <div className={`rv-fish ${className}`}>
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

export default function ReviewsBanner() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward (for animation)
  const [animating, setAnimating] = useState(false);

  /* Auto-advance every 5s */
  useEffect(() => {
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [active]);

  function go(d) {
    if (animating) return;
    setDir(d);
    setAnimating(true);
    setTimeout(() => {
      setActive((a) => (a + d + REVIEWS.length) % REVIEWS.length);
      setAnimating(false);
    }, 350);
  }

  const review = REVIEWS[active];

  return (
    <section className="rv-section">
      <Container fluid="xl">
        {/* Heading */}
        <div className="rv-heading">
          <h2 className="rv-title">
            Our Users <span className="rv-accent">Review</span>
          </h2>
          <div className="rv-waves">
            <GiWaves />
          </div>
        </div>

        {/* Card reusing cta-card dark-theme aesthetic */}
        <div className="rv-card">
          {/* Ripple rings (same as CTABanner) */}
          <div className="rv-ripple rv-ripple--1" />
          <div className="rv-ripple rv-ripple--2" />
          <div className="rv-ripple rv-ripple--3" />
          <div className="rv-ripple rv-ripple--4" />

          {/* Fish on the right — same as CTABanner */}
          <CardFish className="rv-fish--a" speed={0.85} phaseOffset={0} />
          <CardFish className="rv-fish--b" speed={1.1} phaseOffset={Math.PI} />

          <Row className="align-items-center h-100 position-relative" style={{ zIndex: 10 }}>
            <Col xs={12} md={7} lg={6}>
              <div className={`rv-review${animating ? (dir > 0 ? " rv-review--exit-left" : " rv-review--exit-right") : " rv-review--enter"}`}>
                {/* Quote mark */}
                <div className="rv-quote-mark">"</div>

                <p className="rv-quote-text">{review.quote}</p>

                <StarRating count={review.stars} />

                <div className="rv-reviewer">
                  <div className="rv-avatar" style={{ background: review.avatarColor }}>
                    {review.avatar}
                  </div>
                  <div>
                    <p className="rv-name">{review.name}</p>
                    <p className="rv-role">{review.role}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="rv-nav">
                <button className="rv-nav-btn" onClick={() => go(-1)} aria-label="Previous">
                  <FiChevronLeft />
                </button>
                <div className="rv-dots">
                  {REVIEWS.map((_, i) => (
                    <button
                      key={i}
                      className={`rv-dot${i === active ? " rv-dot--active" : ""}`}
                      onClick={() => {
                        setDir(i > active ? 1 : -1);
                        setActive(i);
                      }}
                      aria-label={`Review ${i + 1}`}
                    />
                  ))}
                </div>
                <button className="rv-nav-btn" onClick={() => go(1)} aria-label="Next">
                  <FiChevronRight />
                </button>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
}
