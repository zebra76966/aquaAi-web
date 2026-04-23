import React, { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl } from "./config";
// Note: Ensure this path is correct for your web project structure
import { fetchAndSetRealtimeAuth } from "./supabase/supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTankId, setActiveTankId] = useState(null);

  /* Permissions & Profile */
  const [tier, setTier] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  /* ---------------------------------- */
  /* Fetch User Permissions */
  /* ---------------------------------- */
  const fetchUserPermissions = useCallback(async (accessToken) => {
    if (!accessToken) return;
    try {
      setPermissionsLoading(true);
      const res = await fetch(`${baseUrl}/user/me/permissions/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
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

  /* ---------------------------------- */
  /* Fetch User Profile */
  /* ---------------------------------- */
  const fetchUserProfile = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${baseUrl}/user/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = json?.data || json;
      if (data) setUserProfile(data);
    } catch (e) {
      console.log("Profile fetch error:", e);
    }
  }, []);

  /* ---------------------------------- */
  /* Load Session on App Start */
  /* ---------------------------------- */
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedPermissions = localStorage.getItem("userPermissions");
        const storedTankId = localStorage.getItem("activeTankId");

        if (storedTankId) setActiveTankId(storedTankId);

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

  /* ---------------------------------- */
  /* Auth Actions */
  /* ---------------------------------- */
  const login = async (newToken) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
    fetchUserPermissions(newToken);
    fetchUserProfile(newToken);
    await fetchAndSetRealtimeAuth(newToken);
  };

  const logout = () => {
    setToken(null);
    setTier(null);
    setPermissions(null);
    setActiveTankId(null);
    setUserProfile(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("activeTankId");
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
        token,
        loading,
        login,
        logout,
        activeTankId,
        activateTank,
        clearActiveTank,
        tier,
        permissions,
        permissionsLoading,
        userProfile,
        refreshPermissions: () => fetchUserPermissions(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
