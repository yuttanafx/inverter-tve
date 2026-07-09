"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, toggleLang, t } = useLang();

  return (
    <button
      onClick={toggleLang}
      aria-label={t("lang_toggle")}
      title={t("lang_toggle")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
      style={{ color: "var(--text-muted)", background: "var(--panel-alt)", border: "1px solid var(--border)" }}
    >
      <Languages size={14} />
      <span style={{ color: lang === "th" ? "var(--text)" : "var(--text-dim)" }}>TH</span>
      <span style={{ color: "var(--text-faint)" }}>/</span>
      <span style={{ color: lang === "en" ? "var(--text)" : "var(--text-dim)" }}>EN</span>
    </button>
  );
}
