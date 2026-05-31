import "./TrustBar.css";
import { FiDatabase, FiCpu, FiAward, FiMapPin } from "react-icons/fi";

const METRICS = [
  { icon: FiDatabase, value: "20,000+", label: "Species in Database" },
  { icon: FiCpu,      value: "AI-Powered", label: "Care Plans" },
  { icon: FiAward,    value: "Verified", label: "Breeders & Consultants" },
  { icon: FiMapPin,   value: "UK-Based", label: "Platform" },
];

export default function TrustBar() {
  return (
    <section className="trust-bar">
      <div className="trust-bar-inner">
        {METRICS.map(({ icon: Icon, value, label }, i) => (
          <div key={i} className="trust-item">
            <div className="trust-icon"><Icon /></div>
            <div className="trust-text">
              <span className="trust-value">{value}</span>
              <span className="trust-label">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
