import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "viatalia-theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return savedTheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const palette = theme === "dark"
      ? {
          bg: "#071321",
          bgGradient: "radial-gradient(circle at 85% 5%, rgba(24, 92, 135, .12), transparent 32%), linear-gradient(180deg, #071321 0%, #091727 100%)",
          surface: "#081523",
          surfaceSoft: "rgba(255, 255, 255, 0.08)",
          card: "rgba(255, 255, 255, 0.10)",
          border: "rgba(255, 255, 255, 0.18)",
          text: "#e8eef7",
          muted: "#a9b8c8",
          input: "rgba(255, 255, 255, 0.08)",
          shadow: "rgba(0, 0, 0, 0.22)"
        }
      : {
          bg: "#f1f3f2",
          bgGradient: "linear-gradient(180deg, #f1f3f2 0%, #e7ecea 100%)",
          surface: "#ffffff",
          surfaceSoft: "#f7f9f8",
          card: "#ffffff",
          border: "#d9e1de",
          text: "#111111",
          muted: "#5b6873",
          input: "#ffffff",
          shadow: "rgba(22, 43, 35, 0.10)"
        };

    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--client-${key}`, value);
    });

    root.dataset.theme = theme;
    body.dataset.theme = theme;
    body.classList.toggle("theme-dark", theme === "dark");
    body.classList.toggle("theme-light", theme === "light");
    body.style.backgroundColor = theme === "dark" ? "#071321" : "#f1f3f2";
    body.style.color = theme === "dark" ? "#e8eef7" : "#111111";
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
