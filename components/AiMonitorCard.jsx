"use client";

import { Sparkles, CircleDot, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAiInsights } from "@/lib/useAiInsights";
import { useLang } from "@/lib/i18n";

const SEVERITY_STYLE = {
  normal: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", Icon: ShieldCheck },
  warning: { color: "#F0B429", bg: "rgba(240,180,41,0.12)", Icon: AlertTriangle },
  critical: { color: "#F0475C", bg: "rgba(240,71,92,0.12)", Icon: ShieldAlert },
};

export default function AiMonitorCard() {
  const { t, pick, lang } = useLang();
  const { latest, state, isConfigured } = useAiInsights();

  if (!isConfigured) {
    return (
      <div className="rounded-2xl p-4 sm:p-5 border mb-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: "#A78BFA" }} />
          <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>
            {t("ai_monitor_title")}
          </h2>
        </div>
        <p className="text-[12.5px]" style={{ color: "var(--text-dim)" }}>
          {t("ai_monitor_not_configured")}
        </p>
      </div>
    );
  }

  const sev = SEVERITY_STYLE[latest?.severity] ?? SEVERITY_STYLE.normal;
  const SevIcon = sev.Icon;

  return (
    <div className="rounded-2xl p-4 sm:p-5 border mb-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Sparkles size={16} style={{ color: "#A78BFA" }} />
        <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>
          {t("ai_monitor_title")}
        </h2>
        <span
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full ml-auto"
          style={{ color: state === "ok" ? "#22C55E" : state === "fail" ? "#F0475C" : "#8b949e", background: "rgba(139,148,158,0.1)" }}
        >
          <CircleDot size={11} />
          {state === "ok" ? t("ai_monitor_connected") : state === "fail" ? t("ai_monitor_unreachable") : t("ai_monitor_loading")}
        </span>
      </div>

      {latest ? (
        <div className="rounded-xl p-3.5" style={{ background: sev.bg }}>
          <div className="flex items-center gap-2 mb-1.5">
            <SevIcon size={16} style={{ color: sev.color }} />
            <span className="text-[13px] font-medium" style={{ color: sev.color }}>
              {t(`ai_severity_${latest.severity}`) || latest.severity}
            </span>
            {latest.checkedAt && (
              <span className="ml-auto text-[11px]" style={{ color: "var(--text-faint)" }}>
                {new Date(latest.checkedAt).toLocaleString(lang === "th" ? "th-TH" : "en-US")}
              </span>
            )}
          </div>
          <p className="text-[12.5px]" style={{ color: "var(--text)" }}>
            {pick(latest.message_th, latest.message_en) || latest.message_th}
          </p>
          {latest.reasoning && (
            <p className="text-[11.5px] mt-1.5" style={{ color: "var(--text-faint)" }}>
              {t("ai_monitor_reasoning")}: {latest.reasoning}
            </p>
          )}
        </div>
      ) : (
        <p className="text-[12.5px]" style={{ color: "var(--text-dim)" }}>
          {state === "fail" ? t("ai_monitor_unreachable_desc") : t("ai_monitor_waiting")}
        </p>
      )}
    </div>
  );
}
