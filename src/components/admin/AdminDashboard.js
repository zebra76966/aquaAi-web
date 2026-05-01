import React, { useContext, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiHeartPulseLine,
  RiScalesLine,
  RiBrainLine,
  RiMagicLine,
  RiRadarLine,
  RiUserStarLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiWifiLine,
} from "react-icons/ri";
import { AuthContext } from "../auth/authcontext";
import { useNavigate } from "react-router-dom";
import PlatformHealth from "./tabs/PlatformHealth";
import SignalWeights from "./tabs/SignalWeights";
import LearningInsights from "./tabs/LearningInsights";
import Counterfactual from "./tabs/Counterfactual";
import IntelligenceSessions from "./tabs/IntelligenceSessions";
import UserIntelligence from "./tabs/UserIntelligence";
import ThemeToggle from "../ThemeToggle";
import "./AdminDashboard.css";

const NAV_ITEMS = [
  { key: "health", label: "Platform Health", icon: RiHeartPulseLine, color: "#10b981" },
  { key: "signals", label: "Signal Weights", icon: RiScalesLine, color: "#3b82f6" },
  { key: "insights", label: "Learning Insights", icon: RiBrainLine, color: "#8b5cf6" },
  { key: "counterfact", label: "Counterfactual", icon: RiMagicLine, color: "#f59e0b" },
  { key: "sessions", label: "Intel Sessions", icon: RiRadarLine, color: "#06b6d4" },
  { key: "users", label: "User Intelligence", icon: RiUserStarLine, color: "#ec4899" },
];

export default function AdminDashboard() {
  const { token, logout, userProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("health");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderTab = () => {
    const props = { token };
    switch (activeTab) {
      case "health":
        return <PlatformHealth {...props} />;
      case "signals":
        return <SignalWeights {...props} />;
      case "insights":
        return <LearningInsights {...props} />;
      case "counterfact":
        return <Counterfactual {...props} />;
      case "sessions":
        return <IntelligenceSessions {...props} />;
      case "users":
        return <UserIntelligence {...props} />;
      default:
        return <PlatformHealth {...props} />;
    }
  };

  const current = NAV_ITEMS.find((n) => n.key === activeTab);
  const CurrentIcon = current?.icon;

  const SidebarContent = ({ collapsed }) => (
    <>
      <div className="adm-logo">
        <div className="bg-none">
          {/* <RiShieldCheckLine size={20} /> */}
          <img src="/icon.png" alt="AquaAI Logo" className="auth-logo-img" />
        </div>
        {!collapsed && (
          <div>
            <div className="adm-logo-name">AquaAI</div>
            <div className="adm-logo-badge">Admin Console</div>
          </div>
        )}
      </div>

      <nav className="adm-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              className={`adm-nav-item ${active ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.key);
                setMobileSidebarOpen(false);
              }}
              title={collapsed ? item.label : undefined}
              style={active ? { "--item-color": item.color } : {}}
            >
              <span className="adm-nav-icon-wrap" style={active ? { background: `${item.color}22`, color: item.color } : {}}>
                <Icon size={18} />
              </span>
              {!collapsed && <span className="adm-nav-label">{item.label}</span>}
              {!collapsed && active && <span className="adm-nav-active-bar" style={{ background: item.color }} />}
            </button>
          );
        })}
      </nav>

      <div className="adm-sidebar-footer">
        {!collapsed && (
          <div className="adm-profile">
            <div className="adm-avatar">{userProfile?.name?.[0]?.toUpperCase() || "A"}</div>
            <div className="adm-profile-info">
              <div className="adm-profile-name">{userProfile?.name || "Admin"}</div>
              <div className="adm-profile-role">Administrator</div>
            </div>
          </div>
        )}
        <button className="adm-logout-btn" onClick={handleLogout} title="Logout">
          <RiLogoutBoxRLine size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="adm-root">
      {/* Mobile overlay */}
      {mobileSidebarOpen && <div className="adm-mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Desktop sidebar */}
      <aside className={`adm-sidebar d-none d-lg-flex ${sidebarOpen ? "open" : "collapsed"}`}>
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`adm-sidebar adm-mobile-sidebar d-lg-none ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <SidebarContent collapsed={false} />
      </aside>

      {/* Main */}
      <main className="adm-main">
        {/* Topbar */}
        <div className="adm-topbar">
          {/* Mobile hamburger */}
          <button className="adm-toggle d-lg-none" onClick={() => setMobileSidebarOpen((v) => !v)}>
            <RiMenuUnfoldLine size={18} />
          </button>
          {/* Desktop collapse */}
          <button className="adm-toggle d-none d-lg-flex" onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? <RiMenuFoldLine size={18} /> : <RiMenuUnfoldLine size={18} />}
          </button>

          <div className="adm-breadcrumb">
            {CurrentIcon && <CurrentIcon size={18} style={{ color: current?.color }} />}
            <span>{current?.label}</span>
          </div>

          <div className="adm-topbar-right">
            <a className="adm-live-chip" href="https://aquaai-ccbc69b7c6ff.herokuapp.com" target="_blank" rel="noopener noreferrer">
              <RiUserStarLine size={12} />
              <span>Access Super Admin</span>
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Content */}
        <div className="adm-content">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22, ease: "easeOut" }}>
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
