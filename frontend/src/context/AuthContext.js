import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Load user profile (with allowedSections) after token exists
  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) { setLoading(false); return; }
    axiosInstance.get('/auth/me')
      .then(r => r.data)
      .then(data => {
        if (data?.success && data?.data) {
          const d = data.data;
          const updated = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...d, allowedSections: d.allowedSections || [] };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
          if (d.role) { setRole(d.role); localStorage.setItem('role', d.role); }
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  const loginUser = (newToken, newRole, userData) => {
    setToken(newToken);
    setRole(newRole);
    // Ensure allowedSections (from /auth/me or login response) is stored
    const data = userData || {};
    if (data.allowedSections === undefined && Array.isArray(data.allowedSections)) data.allowedSections = [];
    setUser(data);
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
    }
  };

  const logoutUser = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, role, user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
