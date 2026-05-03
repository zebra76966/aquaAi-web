import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/login";
import Register from "./components/auth/register";
import PasswordReset from "./components/auth/passwordReset";
import SessionBootstrapper from "./components/auth/SessionBootstrapper";

import "bootstrap/dist/css/bootstrap.min.css";
import "./components/master.css";
import { AuthProvider } from "./components/auth/authcontext";
import { ThemeProvider } from "./components/auth/ThemeContext";
import Plans from "./components/auth/Plans";
import Dashboard from "./components/dashboard";
import Tanks from "./components/tanks";
import PaymentSuccess from "./components/auth/PaymentSuccess";
import PaymentFail from "./components/auth/PaymentFail";
import BreederApply from "./components/breeder/BreederApply";
import AdminDashboard from "./components/admin/AdminDashboard";
import FeatureDLab from "./components/featured/FeatureDLab";
import MarketplaceListingDetail from "./components/commerce/MarketplaceListingDetail";
import BreederSpeciesPage from "./components/commerce/BreederSpeciesPage";
import MyReservationsPage from "./components/commerce/MyReservationsPage";
import BreederReservationsPage from "./components/commerce/BreederReservationsPage";
import NotificationsInbox from "./components/commerce/NotificationsInbox";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<PasswordReset />} />
            <Route path="/session/bootstrap" element={<SessionBootstrapper />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tanks" element={<Tanks />} />
            <Route path="/breeder" element={<BreederApply />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/featured" element={<FeatureDLab />} />
            <Route path="/marketplace/listings/:listingId" element={<MarketplaceListingDetail />} />
            <Route path="/marketplace/breeders/:sellerId/species" element={<BreederSpeciesPage />} />
            <Route path="/reservations" element={<MyReservationsPage />} />
            <Route path="/breeder/reservations" element={<BreederReservationsPage />} />
            <Route path="/notifications" element={<NotificationsInbox />} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
