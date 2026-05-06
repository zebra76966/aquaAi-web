import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { baseUrl } from "./config";
import { fetchAndSetRealtimeAuth } from "./supabase/supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTankId, setActiveTankId] = useState(null);

  const [roles, setRoles] = useState([]);

  const [tier, setTier] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const isAdmin = roles.includes("admin");

  // Ref so clearSession can be called inside callbacks without stale closure issues
  const logoutRef = useRef(null);

  const clearSession = useCallback(() => {
    setToken(null);
    setTier(null);
    setPermissions(null);
    setActiveTankId(null);
    setUserProfile(null);
    setRoles([]);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("activeTankId");
    localStorage.removeItem("userRoles");
  }, []);

  // Call this whenever any protected fetch returns 401.
  // It clears the session and redirects to /login.
  const handleUnauthorized = useCallback(() => {
    clearSession();
    window.location.href = "/login";
  }, [clearSession]);

  logoutRef.current = handleUnauthorized;

  const fetchUserPermissions = useCallback(async (accessToken) => {
    if (!accessToken) return;
    try {
      setPermissionsLoading(true);
      const res = await fetch(`${baseUrl}/user/me/permissions/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });
      if (res.status === 401) { logoutRef.current(); return; }
      const json = await res.json();
      if (json?.data) {
        setTier(json.data.tier);
        setPermissions(json.data.features);
        localStorage.setItem("userPermissions", JSON.stringify(json.data));
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  const fetchUserProfile = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${baseUrl}/user/profile/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });
      if (res.status === 401) { logoutRef.current(); return; }
      if (!res.ok) return;
      const json = await res.json();
      const data = json?.data || json;
      if (data) setUserProfile(data);
    } catch (e) {
      console.log("Profile fetch error:", e);
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedPermissions = localStorage.getItem("userPermissions");
        const storedTankId = localStorage.getItem("activeTankId");
        const storedRoles = localStorage.getItem("userRoles");

        if (storedTankId) setActiveTankId(storedTankId);
        if (storedRoles) setRoles(JSON.parse(storedRoles));

        if (storedToken) {
          setToken(storedToken);
          fetchUserProfile(storedToken);
          await fetchAndSetRealtimeAuth(storedToken);

          if (storedPermissions) {
            const parsed = JSON.parse(storedPermissions);
            setTier(parsed.tier);
            setPermissions(parsed.features);
          } else {
            fetchUserPermissions(storedToken);
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [fetchUserPermissions, fetchUserProfile]);

  // login now accepts roles array from the API response
  const login = async (accessToken, incomingRoles = []) => {
    setToken(accessToken);
    setRoles(incomingRoles);
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("userRoles", JSON.stringify(incomingRoles));
    fetchUserPermissions(accessToken);
    fetchUserProfile(accessToken);
    await fetchAndSetRealtimeAuth(accessToken);
  };

  const logout = () => {
    clearSession();
  };

  const activateTank = (tankId) => {
    setActiveTankId(tankId);
    localStorage.setItem("activeTankId", String(tankId));
  };

  const clearActiveTank = () => {
    setActiveTankId(null);
    localStorage.removeItem("activeTankId");
  };

  return (
    <AuthContext.Provider
      value={{
        token, loading, login, logout,
        roles, isAdmin,
        activeTankId, activateTank, clearActiveTank,
        tier, permissions, permissionsLoading,
        userProfile,
        handleUnauthorized,
        refreshPermissions: () => fetchUserPermissions(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
