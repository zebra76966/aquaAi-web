import React, { useState, useEffect } from "react";
import "./AppDownloadBanner.css";

export default function AppDownloadBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("app_banner_dismissed");
    if (!wasDismissed) {
      setTimeout(() => setVisible(true), 1200);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
    localStorage.setItem("app_banner_dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <div className={`app-banner ${visible ? "banner-show" : ""}`}>
      <div className="banner-glow" />
      <div className="banner-inner">
        <div className="banner-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" className="banner-fish-icon">
            <path d="M20 12c-2-4-6-7-10-7S3 8 2 12c1 4 5 7 9 7 1.5 0 3-.4 4.3-1.1" stroke="#00f2ff" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="11" r="1" fill="#00f2ff"/>
            <path d="M18 8l3-3M18 16l3 3M21 12h-6" stroke="#00f2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="banner-text">
          <p className="banner-title">Get the Full AquaAI Experience</p>
          <p className="banner-sub">
            AI fish scans, AR tank setup, real-time alerts & more — only in the app.
          </p>
        </div>
        <div className="banner-actions">
          <a
            href="https://apps.apple.com/app/aquaai"
            target="_blank"
            rel="noreferrer"
            className="banner-btn banner-ios"
            aria-label="Download on App Store"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            App Store
          </a>
          <a
            href="https://play.google.com/store/apps/aquaai"
            target="_blank"
            rel="noreferrer"
            className="banner-btn banner-android"
            aria-label="Get it on Google Play"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.847c.589.34.929.955.929 1.64 0 .685-.34 1.3-.929 1.64l-1.987 1.149L13.42 12l2.291-2.291 1.987 1.151zM5.864 2.658L16.8 9 14.498 11.3 5.864 2.658z"/>
            </svg>
            Google Play
          </a>
        </div>
        <button className="banner-close" onClick={handleDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
