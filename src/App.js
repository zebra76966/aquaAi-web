import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/login";
import Register from "./components/auth/register";
import PasswordReset from "./components/auth/passwordReset";

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
            <Route path="/plans" element={<Plans />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tanks" element={<Tanks />} />
            <Route path="/breeder" element={<BreederApply />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/featured" element={<FeatureDLab />} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
