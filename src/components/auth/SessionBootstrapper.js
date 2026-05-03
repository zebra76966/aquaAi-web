import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";


export default function SessionBootstrapper() {
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const roles = params.get("roles");
    const next = params.get("next") || "/dashboard";
    const activeTankId = params.get("active_tank_id");

    if (token) {
      localStorage.setItem("authToken", token);
    }
    if (roles) {
      localStorage.setItem("userRoles", JSON.stringify(roles.split(",").map((item) => item.trim()).filter(Boolean)));
    }
    if (activeTankId) {
      localStorage.setItem("activeTankId", activeTankId);
    }
    localStorage.removeItem("userPermissions");
    window.location.replace(next);
  }, [params]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#07131f", color: "#e9f4ff" }}>
      <div>Configuring session…</div>
    </div>
  );
}
