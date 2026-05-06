import React from "react";
import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
import AdminDashboard from "./components/admin/AdminDashboard";
import FloatingNav from "./components/FloatingNav";
import AppDownloadBanner from "./components/AppDownloadBanner";
import BreederDashboard from "./components/breeder-dashboard/BreederDashboard";
import ConsultantDashboard from "./components/consultant-dashboard/ConsultantDashboard";

// Role-based redirect — used for "/" and "*"
// Regular users go to /plans first (subscription screen), others to their dashboard directly.
function RoleRedirect() {
  const { token, roles, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!token) return <Navigate to="/register" replace />;
  if (roles.includes("admin")) return <Navigate to="/admin" replace />;
  if (roles.includes("breeder")) return <Navigate to="/breeder-dashboard" replace />;
  if (roles.includes("consultant")) return <Navigate to="/consultant-dashboard" replace />;
  // Regular "user" role → plans screen first (they choose a plan, then go to dashboard)
  return <Navigate to="/plans" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<PasswordReset />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            {/* Regular user routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tanks" element={<Tanks />} />
            <Route path="/tanks/:tankId" element={<TankDetail />} />
            <Route path="/profile" element={<Profile />} />
            {/* Role-specific dashboards */}
            <Route path="/breeder-dashboard" element={<BreederDashboard />} />
            <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />
            {/* Admin */}
            <Route path="/breeder" element={<BreederApply />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>

          <FloatingNav />
          <AppDownloadBanner />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
