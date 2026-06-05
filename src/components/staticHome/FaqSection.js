import "./UserGuides.css";
import "./FaqSection.css";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const FAQ_CATEGORIES = [
  {
    key: "getting-started",
    label: "Getting Started",
    items: [
      {
        q: "What is Aqua AI?",
        a: "Aqua AI is the world's most advanced aquatic intelligence platform. It provides hobbyists, breeders, and consultants with AI-powered tools for habitat management, species identification, water parameter analysis, disease detection, marketplace commerce, and professional bookings — all in one platform.",
      },
      {
        q: "How do I download the app?",
        a: "Aqua AI is available as a mobile application. Download it from the App Store (iOS) or Google Play (Android). You can also access certain features through the web platform at www.aquaai.uk.",
      },
      {
        q: "How do I create an account?",
        a: "Open the app, tap Sign Up, and create your account using a valid email address and password. Alternatively, you can sign up using Apple or Google authentication.",
      },
      {
        q: "Is Aqua AI free to use?",
        a: "Yes. Aqua AI offers a Free tier that includes 1 habitat, species identification via image, basic water parameter tracking, basic care plan, peer-to-peer marketplace access (browse and buy), and consultant booking. Premium and Pro tiers unlock additional habitats, AI features, and selling capabilities.",
      },
      {
        q: "What devices does Aqua AI support?",
        a: "Aqua AI is available on iOS and Android devices. The web platform at www.aquaai.uk provides additional access to certain features including dashboards for breeders and consultants.",
      },
      {
        q: "Is there an age restriction?",
        a: "Aqua AI is not directed at children under 13. Users aged 13 to 18 require parental consent. Users under 13 require explicit, verified parental consent to access any platform features.",
      },
    ],
  },
  {
    key: "pricing",
    label: "Subscriptions & Pricing",
    items: [
      {
        q: "What are the subscription tiers?",
        a: "Aqua AI operates a three-tier model:\n\nFree (£0): 1 habitat, species identification (image), basic water parameter tracking, basic care plan, peer-to-peer marketplace.\n\nPremium (£14.99/month or £139.99/year): Up to 3 habitats, disease detection, AquaBot (100 queries/month), marketplace selling, consultant booking, breeder purchasing, growth tracking, and full water intelligence.\n\nPro (£24.99/month or £239.99/year): Unlimited habitats including ponds, full AI capabilities, AquaBot (500 queries/month), preventative alerts, data export, and priority features.",
      },
      {
        q: "Is there a promotional launch price?",
        a: "Yes. The first 1,000 qualifying users (Premium and Pro) and the first 100 qualifying breeders receive grandfathered promotional pricing:\n\nPremium: £11.99/month or £114.99/year\nPro: £19.99/month or £189.99/year\nBreeder: £19.99/month or £189.99/year\n\nThis rate is locked in for the lifetime of your continuous subscription.",
      },
      {
        q: "What happens if I cancel my promotional subscription?",
        a: "If you cancel, you have a 30-day grace period. If you re-subscribe within those 30 days, your promotional pricing is restored. After 30 days, you will be charged at the standard rate.",
      },
      {
        q: "Can Aqua AI change its prices?",
        a: "Aqua AI reserves the right to modify pricing with 30 days' written notice. Existing subscribers retain their current pricing until their next renewal.",
      },
      {
        q: "What payment methods are accepted?",
        a: "Payments are processed via Stripe. Supported methods include Apple Pay, Google Pay, and credit/debit cards. All prices are in British Pounds Sterling (£), inclusive of VAT where applicable.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel your subscription at any time via in-app settings or by contacting info@aquaai.uk. Cancellation takes effect at the end of your current billing period.",
      },
      { q: "Do subscriptions renew automatically?", a: "Yes. Subscriptions renew automatically at the end of each billing period unless cancelled at least 24 hours before the renewal date." },
      {
        q: "Can I upgrade or downgrade my tier?",
        a: "Yes. You can upgrade at any time, with the new tier taking effect immediately. Downgrades take effect at the end of the current billing period.",
      },
    ],
  },
  {
    key: "habitats",
    label: "Habitats & Tank",
    items: [
      {
        q: "How do I set up my first habitat?",
        a: "After creating your account, you will be guided through setting up your first habitat. Enter the habitat name, type (freshwater, saltwater, pond), volume, and dimensions. You can add photos and populate species and equipment from there.",
      },
      { q: "How many habitats can I manage?", a: "Free: 1 habitat. Premium: Up to 3 habitats. Pro: Unlimited habitats, including ponds." },
      {
        q: "What information can I track for each habitat?",
        a: "Each habitat supports tracking of species (with individual profiles), equipment (type, brand, wattage, model number), water parameters (history and trends), products and dosing schedules, care logs, and AI-generated insights.",
      },
      {
        q: "Can I manage both tanks and ponds?",
        a: "Yes. Pro tier subscribers can manage unlimited habitats including ponds. Pond management includes the same AI intelligence, care plan generation, and water parameter analysis as tank management.",
      },
      {
        q: "What is the Tank Health Score?",
        a: "The Tank Health Score is a visible health scale that provides an at-a-glance assessment of your habitat's overall condition, factoring in water parameters, species compatibility, recent AI alerts, and care plan completion.",
      },
      {
        q: "Can I track equipment and products?",
        a: "Yes. You can add and manage equipment with type, brand, wattage, and model number tracking. For products, you can save items via Amazon URL, set dosing schedules, and receive low-stock alerts.",
      },
    ],
  },
  {
    key: "ai",
    label: "AI Features & Intelligence",
    items: [
      {
        q: "How does AI Water Intelligence work?",
        a: "Instead of just showing you raw readings, the AI Water Intelligence engine interprets your test results. It provides contextual explanations, risk flags, and recommended actions specific to your exact habitat configuration and species mix.",
      },
      {
        q: "How do I test my water parameters?",
        a: "You can enter water parameters manually or by uploading a photo of a test strip. The AI analyses the strip and records all values automatically, linking them to your habitat history.",
      },
      {
        q: "Can the app identify fish and diseases?",
        a: "Yes. The AI engine can identify over 20,000 aquatic species via image, video, or live video analysis. The disease detection engine visually flags health concerns and recommends targeted treatment plans.",
      },
      {
        q: "How does AquaBot work?",
        a: "AquaBot is your floating AI assistant. You can ask it questions by text or voice about any aspect of aquarium keeping — from chemistry to species behaviour. Available 24/7, with monthly usage limits depending on your subscription tier.",
      },
      {
        q: "How do AI-generated care plans work?",
        a: "The AI generates personalised care plans and maintenance schedules based on your specific habitat, species mix, and live water conditions. Plans update automatically as your parameters and species change.",
      },
      {
        q: "How fast are AI responses?",
        a: "Target response times under normal conditions:\n\nSpecies ID (image): within 6 seconds\nSpecies ID (video): within 10 seconds\nDisease detection: within 8 seconds\nWater parameter analysis: within 4 seconds\nAquaBot chat: within 5 seconds\nCare plan generation: within 10 seconds",
      },
      {
        q: "Are AI outputs guaranteed to be accurate?",
        a: "All AI outputs are probabilistic and advisory. Aqua AI strives for accuracy and the AI improves over time, but results should be treated as guidance, not a substitute for professional veterinary or specialist advice in critical situations.",
      },
    ],
  },
  {
    key: "marketplace",
    label: "Marketplace",
    items: [
      {
        q: "What is the P2P Marketplace?",
        a: "The Peer-to-Peer (P2P) Marketplace allows users to buy and sell aquatic goods, equipment, plants, and accessories directly with each other. Free tier users can browse and buy; Premium and Pro users can also sell.",
      },
      {
        q: "Does Aqua AI charge fees on P2P sales?",
        a: "No. There are no platform fees or commissions on P2P marketplace transactions. Aqua AI facilitates the connection but does not process payment — buyers and sellers arrange payment directly.",
      },
      {
        q: "Are marketplace listings restricted by location?",
        a: "Yes. To ensure the safety of live transport and relevance of local sales, listings are visible within a 200km radius of the seller's location.",
      },
      {
        q: "What is Breeder Commerce?",
        a: "Breeder Commerce is the in-app purchasing system for verified professional breeders selling commercial livestock. Unlike the P2P marketplace, Breeder sales are processed through Stripe with a secure 7-day payment hold, collection/delivery options, and dispute resolution.",
      },
      {
        q: "What is the 7-day security hold?",
        a: "When you purchase from a Breeder, your payment is held securely for 7 days. This ensures you have time to collect the livestock and confirm it is as described before funds are released to the breeder.",
      },
      { q: "What commission does Aqua AI charge on Breeder sales?", a: "Aqua AI charges 7% on all in-app Breeder sales. The Breeder keeps 93% of every transaction." },
    ],
  },
  {
    key: "breeders",
    label: "Professional Breeders",
    items: [
      {
        q: "How do I become a Breeder on Aqua AI?",
        a: "Download the Aqua Providers app, tap Sign Up, and select Breeder as your provider role. Complete the application with your business details, species specialisms, and location. Once approved, subscribe to activate your Breeder account.",
      },
      {
        q: "How much does it cost to be a Breeder?",
        a: "The Breeder subscription is £24.99/month or £239.99/year. Early adopter promotional pricing (first 100 breeders) is £19.99/month or £189.99/year, locked in for life.",
      },
      {
        q: "What tools do Breeders get?",
        a: "Breeders receive a comprehensive intelligence suite: Breeder Hub Dashboard, Manage Species (full inventory management), order management with collection/delivery, Analytics, Trust Intelligence, Provider AI Business Assistant, and a Research Tool for market intelligence.",
      },
      {
        q: "How do I get paid for sales?",
        a: "Payments are processed via Stripe Connect. You link your bank account during onboarding. When a buyer's payment clears, funds are released after the 7-day security hold and transferred to your account within 2–5 business days.",
      },
      {
        q: "Can I be both a Breeder and a Consultant?",
        a: "Yes. Both roles can be held simultaneously under the same account. You can switch between the Breeder and Consultant dashboards within the Aqua Providers app.",
      },
      {
        q: "Are there additional certification tiers?",
        a: "Yes. Optional certification tiers provide enhanced verification and visibility:\n\nAqua Certified: £250/year — entry-level platform verification\nProfessional: £699/year — enhanced verification and badge visibility\nMaster Breeder: £1,499/year — highest tier with premium visibility and priority placement",
      },
    ],
  },
  {
    key: "consultants",
    label: "Professional Consultants",
    items: [
      {
        q: "How do I become a Consultant on Aqua AI?",
        a: "Download the Aqua Providers app, tap Sign Up, and select Consultancy as your provider role. Complete your application with credentials, service areas, and availability. Once approved, your profile becomes discoverable in the Consultant Directory.",
      },
      {
        q: "How much does it cost to be a Consultant?",
        a: "The Consultant subscription is £50/month plus a 10% platform commission on all bookings. Commission is deducted at the point of payout — no upfront fees beyond the monthly subscription.",
      },
      {
        q: "What services can I offer?",
        a: "You can offer services across three categories with over 20 service types:\n\nConsultancy: Coaching, education, one-off advice, testing, urgent support, water quality\nPond: Construction, equipment, filtration, fish health, maintenance, seasonal, water quality\nTank: Design, breakdown, disease, equipment, maintenance, setup, stocking, water assessments\n\nFor each service you set the price, unit (hour/visit/job), and estimated duration.",
      },
      {
        q: "How do bookings work?",
        a: "Bookings are organised into three tabs: Pending, Active, and Completed. You have 72 hours to accept or decline a booking request. If you don't respond, it auto-cancels. Once accepted and paid, the booking moves to Active.",
      },
      {
        q: "What is the cancellation policy?",
        a: "Over 48 hours' notice: No trust score penalty. Consultant cancellation triggers a full refund.\nUnder 48 hours' notice: Subject to trust score accountability (L1–L4 escalation).\nUser cancellation: No refund. Users are encouraged to reschedule.",
      },
      {
        q: "What is the earning potential for Consultants?",
        a: "At a rate of £75/hour:\n\n1 booking per day → ~£1,500/month\n4 bookings per day → ~£6,000/month\n8 bookings per day (full capacity) → ~£12,000/month (~£108,000/year after 10% commission)\n\nConsultants charging £100+/hour at full capacity can earn £144,000+ per year.",
      },
    ],
  },
  {
    key: "trust",
    label: "Trust Score & Badges",
    items: [
      {
        q: "What is the Trust Score?",
        a: "The Trust Score is the reputational backbone of Aqua AI. It is calculated automatically based on your verified platform activity, consistency, responsiveness, and community contributions.",
      },
      {
        q: "How do the Trust Tiers work?",
        a: "Bronze: 0–39 points\nSilver: 40–79 points\nGold: 80–119 points\nPlatinum: 120+ points\n\nYour tier affects your ranking and visibility. Breeders and Consultants achieving Gold or Platinum receive priority placement in search results and AI recommendations.",
      },
      {
        q: "Can I lose Trust Score points?",
        a: "Yes. Incidents are classified by severity:\n\nL1 (Minor): −5 points — late responses, minor inaccuracies\nL2 (Moderate): −10 to −15 points — repeated infractions, policy violations\nL3 (Serious): −20 to −25 points — significant policy breaches, data integrity failures\nL4 (Critical): −30 to −40 points — fraud, animal welfare violations, illegal activity\n\nL1–L3 incidents decay over 180–365 days. L4 incidents may persist permanently.",
      },
      { q: "When does my Trust Score update?", a: "Trust scores recompute nightly. All changes are logged in an immutable audit trail visible in your Trust Intelligence dashboard." },
    ],
  },
  {
    key: "privacy",
    label: "Data & Privacy",
    items: [
      {
        q: "What data does Aqua AI collect?",
        a: "Aqua AI collects account information, habitat data (species, equipment, water parameters), images and video (for AI analysis), booking and transaction records, and usage analytics to improve the platform.",
      },
      {
        q: "Does Aqua AI sell my data?",
        a: "No. Aqua AI does not sell your personal data. Data is shared only with service providers necessary to operate the platform (such as Stripe for payments and cloud hosting providers).",
      },
      {
        q: "How is my data protected?",
        a: "Security measures include TLS/HTTPS encryption in transit, AES-256 encryption at rest, JWT authentication with short token expiry, and regular security audits.",
      },
      { q: "Does Aqua AI store my card details?", a: "No. All payment card details are processed and stored directly by Stripe. Aqua AI does not have access to your full card details at any point." },
      {
        q: "What happens to my data if I delete my account?",
        a: "Upon account termination, access ceases immediately. Account data is retained for 30 days (in case of accidental deletion), then permanently deleted — except where longer retention is required by law (e.g., 7 years for financial records).",
      },
      {
        q: "What are my data rights?",
        a: "Under UK GDPR and the Data Protection Act 2018, you have the right to access, rectify, erase, restrict processing, port your data, and object to processing. Contact info@aquaai.uk to exercise any of these rights.",
      },
    ],
  },
  {
    key: "support",
    label: "Platform & Support",
    items: [
      {
        q: "What is Aqua AI's uptime target?",
        a: "Aqua AI targets 99.5% uptime for core platform services, measured monthly, excluding scheduled maintenance windows announced at least 48 hours in advance.",
      },
      { q: "How do I contact support?", a: "Email: info@aquaai.uk\nSupport: support@aquaai.uk\nWhatsApp / Signal: +44 7586 576323\nSMS: +44 7782 207333\nWebsite: www.aquaai.uk/support" },
      {
        q: "What are the support response times?",
        a: "Critical (platform outage, data loss, security incident): within 4 hours\nHigh priority (payment/payout, booking failures, account access): within 24 hours\nStandard (feature questions, feedback): within 48 hours\nLow priority (suggestions, non-urgent feedback): within 5 business days",
      },
      { q: "Who operates Aqua AI?", a: "Aqua AI is operated by Humara Ltd, registered in England and Wales. The platform is governed by the laws of England and Wales." },
      {
        q: "Does Aqua AI endorse listings or providers?",
        a: "No. Aqua AI does not endorse or guarantee any user content, listing, consultant service, or breeder stock. Users and providers are independent, and all transactions are conducted at the parties' own risk.",
      },
    ],
  },
];

function FaqAccordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="ug-accordion faq-accordion">
      {items.map((item, i) => (
        <div key={i} className={`ug-item${open === i ? " open" : ""}`}>
          <button className="ug-question" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <FiChevronDown className="ug-chevron" />
          </button>
          {open === i && (
            <div className="ug-answer">
              {item.a.split("\n\n").map((block, bi) => (
                <p key={bi} style={{ whiteSpace: "pre-line" }}>
                  {block}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const category = FAQ_CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <section className="ug-section faq-section" id="faqs">
      <div className="ug-inner faq-inner">
        <div className="ug-heading">
          <p className="ug-eyebrow">FAQ</p>
          <h2 className="ug-title">
            Frequently Asked <span className="ug-accent">Questions</span>
          </h2>
          <p className="ug-subtitle">
            {FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0)} questions across {FAQ_CATEGORIES.length} topics.
          </p>
        </div>

        <div className="faq-layout">
          {/* Category sidebar */}
          <nav className="faq-sidebar">
            {FAQ_CATEGORIES.map((cat) => (
              <button key={cat.key} className={`faq-cat-btn${activeCategory === cat.key ? " active" : ""}`} onClick={() => setActiveCategory(cat.key)}>
                {cat.label}
                <span className="faq-cat-count">{cat.items.length}</span>
              </button>
            ))}
          </nav>

          {/* Questions panel */}
          <div className="faq-panel">
            <div className="faq-panel-header">
              <h3 className="faq-panel-title">{category.label}</h3>
              <span className="faq-panel-count">{category.items.length} questions</span>
            </div>
            <FaqAccordion items={category.items} />
          </div>
        </div>
      </div>
    </section>
  );
}
