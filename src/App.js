import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import Auth Components
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import PasswordReset from "./components/auth/passwordReset";

import "bootstrap/dist/css/bootstrap.min.css";
import "./components/master.css";
import { AuthProvider } from "./components/auth/authcontext";
import Plans from "./components/auth/Plans";
import Dashboard from "./components/dashboard";
import Tanks from "./components/tanks";
import PaymentSuccess from "./components/auth/PaymentSuccess";
import PaymentFail from "./components/auth/PaymentFail";
import BreederApply from "./components/breeder/BreederApply";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default to register for new users coming from the app */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<PasswordReset />} />

          <Route path="/plans" element={<Plans />} />

          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tanks" element={<Tanks />} />

          {/* Breeder application — token passed via ?token=xxx query param */}
          <Route path="/breeder" element={<BreederApply />} />

          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
