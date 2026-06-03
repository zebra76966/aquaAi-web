import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./components/auth/login";
import Register from "./components/auth/register";
import PasswordReset from "./components/auth/passwordReset";

import "bootstrap/dist/css/bootstrap.min.css";
import "./components/master.css";

import { AuthProvider, AuthContext } from "./components/auth/authcontext";
import { ThemeProvider } from "./components/auth/ThemeContext";

import Plans from "./components/auth/Plans";
import Dashboard from "./components/dashboard";
import Tanks from "./components/tanks";
import TankDetail from "./components/TankDetail";
import Profile from "./components/Profile";
import PaymentSuccess from "./components/auth/PaymentSuccess";
import PaymentFail from "./components/auth/PaymentFail";

import BreederApply from "./components/breeder/BreederApply";
import ConsultantApply from "./components/consultant/ConsultantApply";

import AdminDashboard from "./components/admin/AdminDashboard";

import FloatingNav from "./components/FloatingNav";
import AppDownloadBanner from "./components/AppDownloadBanner";

import BreederDashboard from "./components/breeder-dashboard/BreederDashboard";
import ConsultantDashboard from "./components/consultant-dashboard/ConsultantDashboard";

import Home from "./components/staticHome/main";
import AppDownloadSection from "./components/staticHome/AppDownloadSection";
import Navbar from "./components/staticHome/Navbar";
import Footer from "./components/staticHome/Footer";
import UserGuides from "./components/staticHome/UserGuides";
import ContactSection from "./components/staticHome/ContactSection";
import ContactPage from "./components/staticHome/ContactPage";
import FaqsPage from "./components/staticHome/FaqsPage";
import FeaturesPage from "./components/staticHome/FeaturesPage";
import HowItWorksPage from "./components/staticHome/HowItWorksPage";
import ProviderApplicationStatus from "./components/auth/ProviderApplicationStatus";
import PricingPage from "./components/staticHome/PricingPage";

function RoleRedirect() {
  const { token, roles, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!token) return <Navigate to="/" replace />;

  if (roles.includes("admin")) {
    return <Navigate to="/admin" replace />;
  }

  if (roles.includes("breeder")) {
    return <Navigate to="/breeder-dashboard" replace />;
  }

  if (roles.includes("consultant")) {
    return <Navigate to="/consultant-dashboard" replace />;
  }

  return <Navigate to="/plans" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // change to "auto" if you want instant
    });
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  const navbarPatterns = [/^\/$/, /^\/faqs$/, /^\/features$/, /^\/pricing$/, /^\/how-it-works$/, /^\/about$/, /^\/contact$/, /^\/download$/, /^\/privacy-policy$/, /^\/blog(\/.*)?$/];

  const showNavbar = navbarPatterns.some((regex) => regex.test(location.pathname));

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<AppDownloadSection />} />
        <Route path="/faqs" element={<FaqsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        <Route path="/role-redirect" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<PasswordReset />} />
        <Route path="/provider-status" element={<ProviderApplicationStatus />} />
        <Route path="/plans" element={<Plans />} />

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />

        {/* Regular user routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tanks" element={<Tanks />} />
        <Route path="/tanks/:tankId" element={<TankDetail />} />
        <Route path="/profile" element={<Profile />} />

        {/* Role dashboards */}
        <Route path="/breeder-dashboard" element={<BreederDashboard />} />
        <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />

        {/* Admin */}
        <Route path="/breeder" element={<BreederApply />} />
        <Route path="/consultant" element={<ConsultantApply />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <FloatingNav />
      <AppDownloadBanner />

      {showNavbar && <Footer />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
