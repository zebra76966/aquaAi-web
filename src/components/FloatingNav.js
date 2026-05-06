import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./auth/authcontext";
import "./FloatingNav.css";

// SVG icons
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconWave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20M2 12c0-5 4-9 10-9s10 4 10 9M2 12c0 5 4 9 10 9s10-4 10-9"/>
    <path d="M6 16c1-1 2-1.5 3-1s2 1 3 1 2-.5 3-1 2-1 3-1"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconFish = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c-2.5 0-5 1.5-7 4 2 2.5 4.5 4 7 4 2 0 4-1 5.5-2.5L20 12l-2.5-3.5C16 7 14 6 12 6z"/>
    <circle cx="15" cy="11" r="1" fill="currentColor"/>
    <path d="M4 10c-.5 1-.5 2 0 3"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);

// Items for each role
// For breeder/consultant, clicking a nav item that maps to a tab navigates to
// /breeder-dashboard?tab=<tab> or /consultant-dashboard?tab=<tab>
const USER_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: <IconGrid />, tab: null },
  { path: "/tanks",     label: "Tanks",     icon: <IconWave />, tab: null },
  { path: "/profile",   label: "Profile",   icon: <IconUser />, tab: null },
];

const BREEDER_ITEMS = [
  { path: "/breeder-dashboard", label: "Hub",       icon: <IconGrid />,     tab: null },
  { path: "/breeder-dashboard", label: "Species",   icon: <IconFish />,     tab: "species" },
  { path: "/breeder-dashboard", label: "Analytics", icon: <IconChart />,    tab: "analytics" },
  { path: "/breeder-dashboard", label: "Profile",   icon: <IconUser />,     tab: "profile" },
];

const CONSULTANT_ITEMS = [
  { path: "/consultant-dashboard", label: "Dashboard", icon: <IconBriefcase />, tab: null },
  { path: "/consultant-dashboard", label: "Calendar",  icon: <IconCalendar />,  tab: "calendar" },
  { path: "/consultant-dashboard", label: "Analytics", icon: <IconChart />,     tab: "analytics" },
  { path: "/consultant-dashboard", label: "Profile",   icon: <IconUser />,      tab: "profile" },
];

export default function FloatingNav() {
  const { token, roles, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const isBreeder    = roles.includes("breeder");
  const isConsultant = roles.includes("consultant");

  const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/plans", "/payment/success", "/payment/fail"];
  const shouldHide  = AUTH_ROUTES.includes(location.pathname) || isAdmin || !token;

  useEffect(() => {
    if (!shouldHide) setTimeout(() => setVisible(true), 300);
    else setVisible(false);
  }, [shouldHide]);

  if (shouldHide) return null;

  const items = isBreeder ? BREEDER_ITEMS : isConsultant ? CONSULTANT_ITEMS : USER_ITEMS;

  // Current tab from the URL query string (for breeder/consultant)
  const currentTab = new URLSearchParams(location.search).get("tab") || null;

  const handleNav = (item) => {
    if (item.tab) {
      navigate(`${item.path}?tab=${item.tab}`, { replace: false });
    } else {
      navigate(item.path, { replace: false });
    }
  };

  const isItemActive = (item) => {
    if (location.pathname !== item.path) return false;
    // For role dashboards: match both path and tab
    if (item.tab) return currentTab === item.tab;
    // "Hub" / "Dashboard" item with no tab: active only when no tab param
    if (item.path === "/breeder-dashboard" || item.path === "/consultant-dashboard") {
      return currentTab === null;
    }
    return true;
  };

  return (
    <nav className={`floating-nav ${visible ? "nav-visible" : ""}`}>
      <div className="nav-pill">
        {items.map((item, i) => {
          const active = isItemActive(item);
          return (
            <button
              key={i}
              className={`nav-item ${active ? "nav-active" : ""}`}
              onClick={() => handleNav(item)}
              aria-label={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {active && <span className="nav-dot" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
