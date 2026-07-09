"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "inverter_theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // dark = ดวงจันทร์, light = ดวงอาทิตย์
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial = "dark";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        initial = saved;
      } else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
        initial = "light";
      }
    } catch (e) {}
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme ต้องถูกใช้ภายใน ThemeProvider");
  return ctx;
}
