import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "./styles/theme.css";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById("root"));

const theme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", theme);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
