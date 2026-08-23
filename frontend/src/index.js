import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
