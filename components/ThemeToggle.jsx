"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? t("theme_toggle_to_dark") : t("theme_toggle_to_light")}
      title={isLight ? t("theme_toggle_to_dark") : t("theme_toggle_to_light")}
      className="relative w-14 h-8 rounded-full shrink-0 transition-colors duration-300 flex items-center px-1"
      style={{
        background: isLight
          ? "linear-gradient(90deg,#7DD3FC,#38BDF8)"
          : "linear-gradient(90deg,#1E293B,#0F172A)",
        border: "1px solid var(--border-strong)",
      }}
    >
      <span
        className="absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow"
        style={{
          left: isLight ? "26px" : "2px",
          background: isLight ? "#F0B429" : "#CBD5F5",
        }}
      >
        {isLight ? <Sun size={14} color="#7C4A03" /> : <Moon size={13} color="#1E293B" />}
      </span>
    </button>
  );
}
