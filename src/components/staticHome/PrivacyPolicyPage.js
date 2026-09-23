import "./PrivacyPolicyPage.css";

const SECTIONS = [
  { id: "introduction", num: "1", label: "Introduction" },
  { id: "info-we-collect", num: "2", label: "Information We Collect" },
  { id: "how-we-use", num: "3", label: "How We Use Your Information" },
  { id: "legal-basis", num: "4", label: "Legal Basis for Processing" },
  { id: "ai-processing", num: "5", label: "Intelligence Layer & AI Processing" },
  { id: "data-sharing", num: "6", label: "Data Sharing" },
  { id: "data-security", num: "7", label: "Data Storage & Security" },
  { id: "data-retention", num: "8", label: "Data Retention" },
  { id: "your-rights", num: "9", label: "Your Rights (UK GDPR)" },
  { id: "international-transfers", num: "10", label: "International Transfers" },
  { id: "childrens-privacy", num: "11", label: "Children's Privacy" },
  { id: "changes", num: "12", label: "Changes" },
  { id: "showcase-referrals", num: "13", label: "Community Showcase & Referrals" },
  { id: "contact", num: "14", label: "Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="legal-section">
      <div className="legal-inner">
        <div className="legal-heading">
          <p className="legal-eyebrow">Legal</p>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">
            Version 3.0 &nbsp;·&nbsp; Last updated: May 2026 &nbsp;·&nbsp; Classification: Public
            <br />
            Operated by <strong>Humara Ltd</strong>, Registered in England and Wales
          </p>
        </div>

        <nav className="legal-jumpnav" aria-label="Jump to section">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.num}. {s.label}
            </a>
          ))}
        </nav>

        <div id="introduction" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">1.</span> Introduction
          </h2>
          <div className="legal-body">
            <p>
              This Privacy Policy explains how Humara Ltd, trading as Aqua AI, collects, uses, stores, shares, and protects your personal data when you use the Aqua AI and
              Aqua Providers mobile applications and the website at www.aquaai.uk.
            </p>
            <p>We comply with the UK GDPR, the Data Protection Act 2018, and the Privacy and Electronic Communications Regulations 2003.</p>
            <p>For data protection purposes, Humara Ltd is the data controller.</p>
          </div>
        </div>

        <div id="info-we-collect" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">2.</span> Information We Collect
          </h2>

          <h3 className="legal-h3">2.1. Information You Provide</h3>
          <ul className="legal-list">
            <li>
              <span>
                <strong>Account information:</strong> name, email address, password, and authentication data (Google, Apple, Facebook)
              </span>
            </li>
            <li>
              <span>
                <strong>Profile information:</strong> display name, profile image, bio, address, contact preferences, and profile visibility settings
              </span>
            </li>
            <li>
              <span>
                <strong>Aquarium data:</strong> habitat configurations (name, type, volume, water type), species, equipment details (type, brand, wattage, model number),
                water parameters (standard and saltwater), care schedules, and maintenance logs
              </span>
            </li>
            <li>
              <span>
                <strong>Product data:</strong> tank products, dosing records (dosage amounts, schedules, completion history), and reorder preferences
              </span>
            </li>
            <li>
              <span>
                <strong>Images and video:</strong> photographs and recordings for species identification, disease detection, tank scanning, and marketplace listings
              </span>
            </li>
            <li>
              <span>
                <strong>Voice data:</strong> voice queries submitted to AquaBot
              </span>
            </li>
            <li>
              <span>
                <strong>Marketplace content:</strong> listing descriptions, images, pricing, categories, and location
              </span>
            </li>
            <li>
              <span>
                <strong>Booking information:</strong> service requirements, scheduling, consultation descriptions, and booking-scoped messages
              </span>
            </li>
            <li>
              <span>
                <strong>Breeder contact:</strong> species enquiries, purchase requests, and follow-up communications
              </span>
            </li>
            <li>
              <span>
                <strong>Provider data:</strong> business profiles, service listings, stock levels, pricing, availability schedules, health/mortality data (entered
                manually), and business AI assistant interactions
              </span>
            </li>
          </ul>

          <h3 className="legal-h3">2.2. Information Collected Automatically</h3>
          <ul className="legal-list">
            <li>
              <span>
                <strong>Device information:</strong> model, OS, unique identifiers, mobile network, browser type
              </span>
            </li>
            <li>
              <span>
                <strong>Usage data:</strong> features accessed, session duration, interactions, navigation paths, AquaBot query frequency
              </span>
            </li>
            <li>
              <span>
                <strong>Performance data:</strong> crash reports, error logs, diagnostics
              </span>
            </li>
            <li>
              <span>
                <strong>Location data:</strong> approximate and precise (with permission) for marketplace, consultants, and breeders
              </span>
            </li>
            <li>
              <span>
                <strong>AI interaction data:</strong> queries, responses, confidence scores, care plan generation events, health score calculations
              </span>
            </li>
          </ul>
        </div>

        <div id="how-we-use" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">3.</span> How We Use Your Information
          </h2>
          <ul className="legal-list">
            <li>
              <span>
                <strong>To provide AI services:</strong> species identification, disease detection, water analysis, AI Water Intelligence, compatibility assessment, care
                plans, product recommendations with dosage calculations, health scoring, preventative alerts, comparative species tracking, and AquaBot assistance
              </span>
            </li>
            <li>
              <span>To operate consultant bookings, including sharing pre-diagnosis data with booked consultants</span>
            </li>
            <li>
              <span>To operate the breeder directory and facilitate species search and contact</span>
            </li>
            <li>
              <span>To operate the marketplace and purchase request/email confirmation flow</span>
            </li>
            <li>
              <span>To process payments and manage subscriptions via Stripe</span>
            </li>
            <li>
              <span>
                <strong>Breeder commerce data:</strong> in-app order details, shipping/collection preferences, and follow-up communications. For Breeders, identity and
                bank details submitted directly to Stripe Connect for payout processing.
              </span>
            </li>
            <li>
              <span>
                <strong>Transaction metadata:</strong> order amounts, 7-day hold status, commission calculations, and payout routing
              </span>
            </li>
            <li>
              <span>To calculate and maintain trust scores, badges, and incident records</span>
            </li>
            <li>
              <span>To power provider tools: Analytics, Trust Intelligence, Research, and Provider AI Business Assistant</span>
            </li>
            <li>
              <span>To improve AI accuracy through aggregated, anonymised data analysis</span>
            </li>
            <li>
              <span>To comply with legal obligations</span>
            </li>
          </ul>
        </div>

        <div id="legal-basis" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">4.</span> Legal Basis for Processing
          </h2>
          <ul className="legal-list">
            <li>
              <span>
                <strong>Contract performance:</strong> services you have subscribed to
              </span>
            </li>
            <li>
              <span>
                <strong>Legitimate interests:</strong> improving the Platform, fraud prevention, trust scoring, aggregated analytics
              </span>
            </li>
            <li>
              <span>
                <strong>Consent:</strong> location data, marketing, voice data processing
              </span>
            </li>
            <li>
              <span>
                <strong>Legal obligation:</strong> where required by law
              </span>
            </li>
          </ul>
        </div>

        <div id="ai-processing" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">5.</span> Intelligence Layer and AI Processing
          </h2>
          <div className="legal-body">
            <p>Aqua AI operates a three-layer intelligence architecture:</p>
          </div>
          <ul className="legal-list">
            <li>
              <span>
                <strong>Layer 1 (Operational):</strong> raw inputs — tank parameters, species, readings, bookings. Never overwritten by AI.
              </span>
            </li>
            <li>
              <span>
                <strong>Layer 2 (Analytical):</strong> AI-generated insights, recommendations, dosage calculations, health scores. Probabilistic, logged, auditable.
              </span>
            </li>
            <li>
              <span>
                <strong>Layer 3 (MI/BI):</strong> aggregated anonymised analytics for platform improvement. No personal data.
              </span>
            </li>
          </ul>
          <div className="legal-body">
            <p>
              Provider AI tools (Business Assistant, Research, Trust Intelligence) process your provider data to generate personalised business insights, based on your
              activity, listings, and performance.
            </p>
          </div>
        </div>

        <div id="data-sharing" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">6.</span> Data Sharing
          </h2>
          <div className="legal-body">
            <p>We do not sell your personal data. We share data only as follows:</p>
          </div>
          <ul className="legal-list">
            <li>
              <span>
                <strong>With consultants:</strong> pre-diagnosis data for booked services (ceases on completion/cancellation)
              </span>
            </li>
            <li>
              <span>
                <strong>With marketplace buyers/sellers:</strong> confirmation emails with contact details for completed transactions
              </span>
            </li>
            <li>
              <span>
                <strong>With breeders:</strong> order details, shipping addresses, and contact information for fulfilling in-app purchases
              </span>
            </li>
            <li>
              <span>
                <strong>With service providers:</strong> Stripe (payments), Supabase (hosting), AWS (infrastructure), OpenAI (AI processing), Expo (notifications),
                Geoapify (geolocation)
              </span>
            </li>
            <li>
              <span>
                <strong>With other users:</strong> public profile, trust score, badges, and marketplace listings
              </span>
            </li>
            <li>
              <span>Legal requirements and business transfers as required</span>
            </li>
          </ul>
        </div>

        <div id="data-security" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">7.</span> Data Storage and Security
          </h2>
          <div className="legal-body">
            <p>Primary database: Supabase (PostgreSQL). Object storage: AWS S3. AI inference: secure API connections.</p>
            <p>
              Security: TLS/HTTPS, AES-256 at rest, JWT authentication (5-minute access tokens), backend ACL, Row Level Security, audit logging, MFA on operational
              accounts, PBKDF2 password hashing, Redis rate limiting.
            </p>
          </div>
        </div>

        <div id="data-retention" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">8.</span> Data Retention
          </h2>
          <ul className="legal-list">
            <li>
              <span>
                <strong>Account data:</strong> active account duration + 30 days
              </span>
            </li>
            <li>
              <span>
                <strong>Tank, species, equipment, and product data:</strong> account duration
              </span>
            </li>
            <li>
              <span>
                <strong>AI interaction and voice logs:</strong> 24 months, then anonymised
              </span>
            </li>
            <li>
              <span>
                <strong>Booking records:</strong> 36 months
              </span>
            </li>
            <li>
              <span>
                <strong>Trust score and badge history:</strong> account lifetime + 12 months
              </span>
            </li>
            <li>
              <span>
                <strong>Payment records:</strong> 7 years (UK financial obligations)
              </span>
            </li>
            <li>
              <span>
                <strong>Anonymised analytics:</strong> indefinitely
              </span>
            </li>
          </ul>
        </div>

        <div id="your-rights" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">9.</span> Your Rights (UK GDPR)
          </h2>
          <div className="legal-body">
            <p>
              You have the right to access, rectification, erasure, restriction, portability, objection, and withdrawal of consent. Contact{" "}
              <a href="mailto:info@aquaai.uk" style={{ color: "#00d4ff" }}>
                info@aquaai.uk
              </a>
              . We aim to respond within 30 days. You can also complain to the ICO at{" "}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff" }}>
                ico.org.uk
              </a>
              .
            </p>
          </div>
        </div>

        <div id="international-transfers" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">10.</span> International Transfers
          </h2>
          <div className="legal-body">
            <p>We apply appropriate safeguards (UK Standard Contractual Clauses, adequacy decisions) for transfers outside the UK.</p>
          </div>
        </div>

        <div id="childrens-privacy" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">11.</span> Children's Privacy
          </h2>
          <div className="legal-body">
            <p>Aqua AI is not directed at users under 13. Parental consent is required. Data is deleted promptly if collected without consent.</p>
          </div>
        </div>

        <div id="changes" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">12.</span> Changes
          </h2>
          <div className="legal-body">
            <p>Material changes to this policy will be notified through the Apps or by email.</p>
          </div>
        </div>

        <div id="showcase-referrals" className="legal-block">
          <h2 className="legal-h2">
            <span className="legal-h2-num">13.</span> Community Showcase &amp; Referrals
          </h2>
          <div className="legal-body">
            <p>
              <strong style={{ color: "#e8f0fe" }}>Community Showcase Data:</strong> If you opt in to the Community Showcase, we collect and display data related to your
              showcased tanks, including images, descriptions, likes received, and engagement metrics. Direct messaging initiated through the showcase is processed
              securely to facilitate user-to-user communication.
            </p>
            <p>
              <strong style={{ color: "#e8f0fe" }}>Referral Data:</strong> When participating in the Referral Programme, we process referral codes and link
              referrer–referee accounts to calculate and apply platform credits. To comply with data minimisation principles, only the username of the referred
              individual and the current reward value are displayed in the referrer's dashboard; specific subscribed plans and billing intervals are not disclosed.
            </p>
          </div>
        </div>

        <div className="legal-divider" />

        <div id="contact" className="legal-block" style={{ marginBottom: 0 }}>
          <h2 className="legal-h2" style={{ justifyContent: "center" }}>
            <span className="legal-h2-num">14.</span> Contact
          </h2>
          <div className="legal-contact-card">
            <p className="legal-contact-brand">Aqua AI — operated by Humara Ltd</p>
            <p>
              www.aquaai.uk
              <br />
              General Enquiries: <a href="mailto:info@aquaai.uk">info@aquaai.uk</a> &nbsp;·&nbsp; Support: <a href="mailto:support@aquaai.uk">support@aquaai.uk</a>
              <br />
              WhatsApp / Signal: <a href="tel:+447586576323">+44 7586 576323</a> &nbsp;·&nbsp; SMS: <a href="tel:+447782207333">+44 7782 207333</a>
              <br />
              Registered in England and Wales &nbsp;·&nbsp; May 2026
            </p>
          </div>
        </div>

        <div className="legal-backtotop">
          <a href="#introduction">Back to top ↑</a>
        </div>
      </div>
    </section>
  );
}
