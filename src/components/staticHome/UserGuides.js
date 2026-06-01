import "./UserGuides.css";
import { useState } from "react";
import { FiChevronDown, FiExternalLink, FiDownload } from "react-icons/fi";

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
    { title: "Managing Orders", body: "Accept, decline, and fulfil orders. Communicate with buyers via in-app messaging." },
    { title: "Analytics & Trust Intelligence", body: "Track listing performance, buyer engagement, and trust score. Understand how badges affect your visibility." },
  ],
  Consultants: [
    { title: "Consultant Onboarding", body: "Apply for a consultant account. Submit credentials, set your service areas, rates, and availability." },
    { title: "Managing Your Calendar", body: "Sync your availability, set appointment types, and manage bookings from the calendar dashboard." },
    { title: "Client Sessions & Data", body: "Access client habitat data before a session. Add notes, recommendations, and follow-up actions." },
    { title: "Payments & Commission", body: "Understand the 10% booking commission, payout schedule, and how to raise billing queries." },
  ],
};

function Accordion({ sections }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="ug-accordion">
      {sections.map((s, i) => (
        <div key={i} className={`ug-item${open === i ? " open" : ""}`}>
          <button className="ug-question" onClick={() => setOpen(open === i ? null : i)}>
            <span>{s.title}</span>
            <FiChevronDown className="ug-chevron" />
          </button>
          {open === i && (
            <div className="ug-answer">
              <p>{s.body}</p>
              <a href="#" className="ug-video-link">
                <FiExternalLink /> Watch video walkthrough (coming soon)
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const downloadGuide = (type) => {
  const guides = {
    users: "/guides/Professional AQUA AI Users App Guide.pdf",
    breeders: "/guides/Professional AQUA AI Breeders App Guide.pdf",
    consultants: "/guides/Professional AQUA AI Consultants App Guide.pdf",
    providers: "/guides/Professional AQUA AI Providers App Guide.pdf",
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

        {/* Main tab */}
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
            <div className="ug-download-bar">
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
            <div className="ug-download-bar">
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
