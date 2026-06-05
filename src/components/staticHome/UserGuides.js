import "./UserGuides.css";
import { useState } from "react";
import { FiChevronDown, FiDownload, FiYoutube } from "react-icons/fi";

/* ── Video link map — keyed to section titles ── */
const VIDEO_LINKS = {
  "Adding Fish & Species ID": "https://youtube.com/shorts/IlJTL2NDzmg?feature=share",
  "Setting Up Your Habitat": "https://youtube.com/shorts/spOO86BdajA?feature=share",
  "Water Parameters & Testing": "https://www.youtube.com/watch?v=q_phhmldAVg&list=PL8oU20hcR0ed-_oQOD2eflOX5RIl15PT0&index=1",
  "Marketplace & Buying": "https://youtube.com/shorts/YHbtAd_f1q0",
  "Booking a Consultant": "https://youtube.com/shorts/Ns6iDQB56rA",
  "Community & Badges": "https://youtube.com/shorts/iisfOMzaPGQ?feature=share",
  "Managing Your Calendar": "https://youtube.com/shorts/gKaitEn-fxM?feature=share",
  "Analytics & Trust Intelligence": "https://youtube.com/shorts/Nt3lV1ViZxw",
  "Adding Services": "https://youtube.com/shorts/fUsHNeenM5g",
  "Breeder Intelligence": "https://youtube.com/shorts/nMklY4-hpkg?feature=share",
  "Managing Store Hours & Orders": "https://youtube.com/shorts/NYkBUheVyPs?feature=share",
};

const USER_SECTIONS = [
  { title: "Getting Started", body: "Download the app, create your account, and complete your profile. This section walks you through onboarding step by step." },
  { title: "Setting Up Your Habitat", body: "Name your tank or pond, select water type, enter volume and dimensions. Add photos to personalise your setup." },
  { title: "Adding Fish & Species ID", body: "Use the camera scanner or search the species database. Learn how the AI confirms identification from image or video." },
  { title: "Water Parameters & Testing", body: "Enter readings manually or scan a test strip. Understand what each parameter means and how AI interprets the results." },
  { title: "AI Care Plans & Insights", body: "How personalised care plans are generated. Understanding alerts, recommendations, and when to act." },
  { title: "Marketplace & Buying", body: "Browse listings, add to basket, checkout, and arrange collection or delivery. Buyer protection and dispute resolution." },
  { title: "Booking a Consultant", body: "Find, filter, and book aquatic professionals. In-app calendar, payment, and messaging walkthrough." },
  { title: "Community & Badges", body: "Share your tank, interact with the community, and understand the trust badge system and how to earn rank upgrades." },
];

const PROVIDER_SECTIONS = {
  Breeders: [
    { title: "Setting Up Your Breeder Profile", body: "Create and verify your breeder account. Add certifications, location, species specialisms, and contact preferences." },
    { title: "Listing Stock", body: "Add individual fish or batch listings. Set pricing, availability, collection or delivery options." },
    { title: "Managing Store Hours & Orders", body: "Set your opening hours, weekend availability, and holiday mode. Accept, fulfil, and manage orders end-to-end." },
    { title: "Breeder Intelligence", body: "Track listing performance, buyer engagement, and trust score. Understand how badges affect your visibility." },
    { title: "Analytics & Trust Intelligence", body: "View AI-powered insights on your stock performance, pricing, cohort benchmarks, and retention triggers." },
  ],
  Consultants: [
    { title: "Consultant Onboarding", body: "Apply for a consultant account. Submit credentials, set your service areas, rates, and availability." },
    { title: "Adding Services", body: "Add services from the catalogue, set your price and duration per service, and manage your service list." },
    { title: "Managing Your Calendar", body: "Sync your availability, set appointment types, and manage bookings from the calendar dashboard." },
    { title: "Client Sessions & Data", body: "Access client habitat data before a session. Add notes, recommendations, and follow-up actions." },
    { title: "Analytics & Trust Intelligence", body: "Understand the 10% booking commission, payout schedule, trust scores, and AI intelligence insights." },
  ],
};

function VideoLink({ title }) {
  const url = VIDEO_LINKS[title];
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="ug-video-link">
      <FiYoutube className="ug-yt-icon" />
      Watch video walkthrough
    </a>
  );
}

function Accordion({ sections }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="ug-accordion">
      {sections.map((s, i) => {
        const hasVideo = !!VIDEO_LINKS[s.title];
        return (
          <div key={i} className={`ug-item${open === i ? " open" : ""}`}>
            <button className="ug-question" onClick={() => setOpen(open === i ? null : i)}>
              <span className="ug-question-text">
                {s.title}
                {hasVideo && <span className="ug-video-dot" title="Video available" />}
              </span>
              <FiChevronDown className="ug-chevron" />
            </button>
            {open === i && (
              <div className="ug-answer">
                <p>{s.body}</p>
                <VideoLink title={s.title} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const downloadGuide = (type) => {
  const guides = {
    users: "/guides/Professional AQUA AI Users App Guide.pdf",
    breeders: "/guides/Professional AQUA AI Breeders App Guide.pdf",
    consultants: "/guides/Professional AQUA AI Consultants App Guide.pdf",
  };
  const fileUrl = guides[type];
  if (!fileUrl) return;
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileUrl.split("/").pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function UserGuides() {
  const [tab, setTab] = useState("users");
  const [providerTab, setProviderTab] = useState("Breeders");

  return (
    <section className="ug-section" id="user-guides">
      <div className="ug-inner">
        <div className="ug-heading">
          <p className="ug-eyebrow">User Guides</p>
          <h2 className="ug-title">
            Everything you need to <span className="ug-accent">get started</span>
          </h2>
        </div>

        {/* Main tabs */}
        <div className="ug-tabs">
          <button className={`ug-tab${tab === "users" ? " active" : ""}`} onClick={() => setTab("users")}>
            Users App
          </button>
          <button className={`ug-tab${tab === "providers" ? " active" : ""}`} onClick={() => setTab("providers")}>
            Providers App
          </button>
        </div>

        {tab === "users" && (
          <div className="ug-panel">
            <div className="ug-download-bar d-flex align-items-center justify-content-between gap-3">
              <p className="ug-subtitle">
                Look for <span className="ug-dot-legend" /> to watch the video.
              </p>
              <button className="ug-download-btn" onClick={() => downloadGuide("users")}>
                <FiDownload /> Download Full User Guide (PDF)
              </button>
            </div>

            <Accordion sections={USER_SECTIONS} />
          </div>
        )}

        {tab === "providers" && (
          <div className="ug-panel">
            <div className="ug-provider-tabs">
              {Object.keys(PROVIDER_SECTIONS).map((k) => (
                <button key={k} className={`ug-provider-tab${providerTab === k ? " active" : ""}`} onClick={() => setProviderTab(k)}>
                  {k}
                </button>
              ))}
            </div>
            <div className="ug-download-bar d-flex align-items-center justify-content-between gap-3">
              <p className="ug-subtitle">
                Look for <span className="ug-dot-legend" /> to watch the video.
              </p>

              <button className="ug-download-btn" onClick={() => downloadGuide(providerTab === "Breeders" ? "breeders" : "consultants")}>
                <FiDownload /> Download {providerTab} Guide (PDF)
              </button>
            </div>

            <Accordion sections={PROVIDER_SECTIONS[providerTab]} />
          </div>
        )}
      </div>
    </section>
  );
}
