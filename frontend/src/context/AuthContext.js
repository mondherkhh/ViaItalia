import React, { createContext, useState, useEffect, useContext } from "react";

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
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const loginUser = (newToken, newRole, userData) => {
    setToken(newToken);
    setRole(newRole);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
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
