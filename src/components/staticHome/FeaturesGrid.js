import "./FeaturesGrid.css";
import { FiCamera, FiAlertCircle, FiDroplet, FiCalendar, FiShoppingCart, FiUsers, FiTrendingUp, FiShoppingBag, FiStore, FiBookOpen, FiMessageSquare, FiStar, FiShield } from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import FishModel from "./FishModel";

/* Same Fish component as HeroLanding — uses identical CSS classes */
function Fish({ className, animationSpeed = 1 }) {
  return (
    <div className={`fish ${className}`}>
      <div className="fish-inner">
        <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
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

const FEATURES = [
  { icon: FiCamera, name: "Species Identification", tier: null, body: "Scan your tank with your camera or upload an image. AI identifies species from a database of 20,000+ aquatic life." },
  { icon: FiAlertCircle, name: "Disease Detection", tier: "Premium", body: "Point your camera at a fish. AI detects visible health issues and recommends targeted treatment plans." },
  { icon: FiDroplet, name: "Water Intelligence", tier: null, body: "Enter parameters manually or scan test strips. AI interprets results, flags risks, and guides corrective action." },
  { icon: FiCalendar, name: "AI Care Plans", tier: null, body: "Personalised maintenance schedules based on your specific habitat, species mix, and live water conditions." },
  { icon: FiShoppingCart, name: "Products & Dosing", tier: null, body: "Add products via Amazon URL. AI tracks dosing schedules and alerts you when products run low." },
  { icon: FiUsers, name: "Compatible Species", tier: null, body: "See which species suit your habitat parameters. Check local breeder availability before purchasing." },
  { icon: FiTrendingUp, name: "Growth Tracking", tier: "Premium", body: "Compare fish size over time using calibrated camera measurements. Track progress with visual charts." },
  { icon: FiShoppingBag, name: "Marketplace", tier: null, body: "Buy and sell aquarium items peer-to-peer. Browse listings with checkout and delivery options." },
  { icon: FaStore, name: "Breeder Marketplace", tier: null, body: "Search verified breeders by location and species. Add to basket, checkout, collect or get delivery." },
  { icon: FiBookOpen, name: "Consultant Booking", tier: null, body: "Find and book certified aquatic professionals. In-app booking, payment processing, and secure messaging." },
  { icon: FiMessageSquare, name: "AquaBot", tier: null, body: "AI assistant for instant aquarium and pond guidance. Ask anything by text or voice — available 24/7." },
  { icon: FiStar, name: "Community Showcase", tier: null, body: "Share your tank with the community. Like, message other hobbyists, and earn rank badges for your efforts." },
  { icon: FiShield, name: "Trust & Badges", tier: null, body: "Earn trust through consistent care and activity. Badges unlock visibility and priority marketplace placement." },
];

export default function FeaturesGrid() {
  return (
    <section className="features-section" id="features" style={{ position: "relative", overflow: "hidden" }}>
      {/* Fish flock — identical classes + speeds to HeroLanding */}
      <div className="fish-flock fg-fish-flock">
        <Fish className="swim-lr-1 size-xl"              animationSpeed={1.0} />
        <Fish className="swim-lr-floaty size-lg over-text" animationSpeed={0.9} />
        <Fish className="swim-rl-1 size-xl tint-dark"    animationSpeed={0.6} />
        <Fish className="swim-rl-floaty size-lg over-text" animationSpeed={1.3} />
        <Fish className="swim-tb-1 size-xl tint-warm"    animationSpeed={1.2} />
        <Fish className="swim-bt-1 size-lg tint-cool over-text" animationSpeed={0.8} />
        <Fish className="swim-diag-1 size-xl tint-dark over-text" animationSpeed={0.7} />
        <Fish className="swim-diag-2 size-xl over-text"  animationSpeed={1.3} />
      </div>

      <div className="features-inner" style={{ position: "relative", zIndex: 5 }}>
        <div className="features-heading">
          <p className="features-eyebrow">Powerful Features</p>
          <h2 className="features-title">
            Everything you need for
            <br />
            <span className="features-accent">smarter aquarium care</span>
          </h2>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, name, tier, body }, i) => (
            <div key={i} className="feature-card-pg">
              <div className="fc-top">
                <div className="fc-icon">
                  <Icon />
                </div>
                {tier && <span className="fc-badge">{tier}</span>}
              </div>
              <h3 className="fc-name">{name}</h3>
              <p className="fc-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
