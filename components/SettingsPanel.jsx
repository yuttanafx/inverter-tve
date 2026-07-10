"use client";

import React, { useState, useEffect } from "react";
import { Plug, CheckCircle2, XCircle, Loader2, Trash2, Info } from "lucide-react";
import { useApiConfig } from "@/lib/apiConfig";
import { useLang } from "@/lib/i18n";

export default function SettingsPanel() {
  const { config, status, saveConfig, clearConfig, testConnection, saveAiHubUrl } = useApiConfig();
  const { t } = useLang();
  const [url, setUrl] = useState(config.url || "");
  const [key, setKey] = useState(config.key || "");
  const [keyId, setKeyId] = useState(config.keyId || "");
  const [keySecret, setKeySecret] = useState(config.keySecret || "");
  const [sn, setSn] = useState(config.sn || "");
  const [aiHubUrl, setAiHubUrl] = useState(config.aiHubUrl || "");
  const [aiHubSaved, setAiHubSaved] = useState(false);

  useEffect(() => {
    setUrl(config.url || "");
    setKey(config.key || "");
    setKeyId(config.keyId || "");
    setKeySecret(config.keySecret || "");
    setSn(config.sn || "");
    setAiHubUrl(config.aiHubUrl || "");
  }, [config.url, config.key, config.keyId, config.keySecret, config.sn, config.aiHubUrl]);

  const statusMeta = {
    idle: { text: t("settings_status_idle"), color: "var(--text-dim)", icon: Info },
    testing: { text: t("settings_status_testing"), color: "#F0B429", icon: Loader2 },
    ok: { text: t("settings_status_ok"), color: "#22C55E", icon: CheckCircle2 },
    fail: { text: t("settings_status_fail"), color: "#F0475C", icon: XCircle },
  }[status];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="max-w-2xl">
      <h1
        className="text-[21px] sm:text-[24px] font-semibold"
        style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
      >
        {t("settings_title")}
      </h1>
      <p className="text-[12.5px] sm:text-[13px] mb-5" style={{ color: "var(--text-dim)" }}>
        {t("settings_sub")}
      </p>

      <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Plug size={16} style={{ color: "#3B82F6" }} />
          <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>
            {t("settings_api_section")}
          </h2>
        </div>
        <p className="text-[12px] leading-relaxed mb-4" style={{ color: "var(--text-dim)" }}>
          {t("settings_api_desc")}
        </p>

        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_api_url_label")}
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("settings_api_url_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />

        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_api_key_label")}
        </label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          type="password"
          placeholder={t("settings_api_key_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-4"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />

        <div className="rounded-xl p-3 mb-4" style={{ background: "var(--panel-alt)", border: "1px dashed var(--border-strong)" }}>
          <p className="text-[12px] font-medium mb-2" style={{ color: "var(--text)" }}>
            {t("settings_solis_section")}
          </p>
          <p className="text-[11.5px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
            {t("settings_solis_desc")}
          </p>

          <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
            {t("settings_keyid_label")}
          </label>
          <input
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder={t("settings_keyid_placeholder")}
            className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
            style={{ background: "var(--panel)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          />

          <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
            {t("settings_keysecret_label")}
          </label>
          <input
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            type="password"
            placeholder={t("settings_keysecret_placeholder")}
            className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
            style={{ background: "var(--panel)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          />

          <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
            {t("settings_sn_label")}
          </label>
          <input
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            placeholder={t("settings_sn_placeholder")}
            className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
            style={{ background: "var(--panel)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => saveConfig({ url, key, keyId, keySecret, sn })}
            className="px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ background: "#3B82F6", color: "#fff" }}
          >
            {t("settings_save")}
          </button>
          <button
            onClick={() =>
              url.trim() &&
              testConnection(url.trim(), {
                "Content-Type": "application/json",
                ...(key ? { Authorization: `Bearer ${key}` } : {}),
                ...(keyId ? { "x-solis-key-id": keyId } : {}),
                ...(keySecret ? { "x-solis-key-secret": keySecret } : {}),
                ...(sn ? { "x-solis-sn": sn } : {}),
              })
            }
            className="px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ background: "var(--panel-alt)", color: "var(--text)", border: "1px solid var(--border-strong)" }}
          >
            {t("settings_test")}
          </button>
          {config.url && (
            <button
              onClick={clearConfig}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium ml-auto"
              style={{ color: "#F0475C", background: "rgba(240,71,92,0.1)" }}
            >
              <Trash2 size={13} /> {t("settings_clear")}
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12.5px]"
          style={{ background: "var(--panel-alt)", color: statusMeta.color }}
        >
          <StatusIcon size={15} className={status === "testing" ? "animate-spin" : ""} />
          {statusMeta.text}
        </div>
        {config.savedAt && (
          <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
            {t("settings_saved_at")}: {new Date(config.savedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div
        className="rounded-2xl p-4 sm:p-5 border mt-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <p className="text-[13px] font-medium mb-1.5" style={{ color: "var(--text)" }}>
          {t("settings_ai_hub_section")}
        </p>
        <p className="text-[11.5px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
          {t("settings_ai_hub_desc")}
        </p>
        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_ai_hub_url_label")}
        </label>
        <input
          value={aiHubUrl}
          onChange={(e) => {
            setAiHubUrl(e.target.value);
            setAiHubSaved(false);
          }}
          placeholder={t("settings_ai_hub_url_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />
        <button
          onClick={() => {
            saveAiHubUrl(aiHubUrl);
            setAiHubSaved(true);
          }}
          className="px-4 py-2 rounded-lg text-[13px] font-medium"
          style={{ background: "#A78BFA", color: "#fff" }}
        >
          {t("settings_ai_hub_save")}
        </button>
        {aiHubSaved && (
          <CheckCircle2 size={15} className="inline-block ml-2 align-middle" style={{ color: "#22C55E" }} />
        )}
      </div>

      <div
        className="rounded-2xl p-4 sm:p-5 border mt-4 text-[12px] leading-relaxed"
        style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-dim)" }}
      >
        <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
          {t("settings_note_title")}
        </p>
        <p style={{ fontFamily: "var(--font-mono)" }}>{t("settings_note_body")}</p>
      </div>
    </div>
  );
}
