"use client";

import React, { useState, useEffect } from "react";
import { Plug, CheckCircle2, XCircle, Loader2, Trash2, Info, Wifi, UploadCloud } from "lucide-react";
import { useApiConfig } from "@/lib/apiConfig";
import { useLang } from "@/lib/i18n";

const TUYA_REGIONS = [
  { value: "sg", label: "Singapore — ไทย/เวียดนาม/มาเลเซีย/อินโดนีเซีย ฯลฯ (openapi-sg.iotbing.com)" },
  { value: "eu", label: "Central Europe (openapi.tuyaeu.com)" },
  { value: "us", label: "Western America (openapi.tuyaus.com)" },
  { value: "cn", label: "China (openapi.tuyacn.com)" },
  { value: "in", label: "India (openapi.tuyain.com)" },
];

export default function SettingsPanel() {
  const {
    config,
    status,
    saveConfig,
    clearConfig,
    testConnection,
    saveAiHubUrl,
    saveHouseId,
    saveHouseSyncMeta,
    syncToAiHub,
    hubSyncStatus,
    tuyaStatus,
    saveTuyaConfig,
    clearTuyaConfig,
    testTuyaConnection,
  } = useApiConfig();
  const { t } = useLang();
  const [url, setUrl] = useState(config.url || "");
  const [key, setKey] = useState(config.key || "");
  const [keyId, setKeyId] = useState(config.keyId || "");
  const [keySecret, setKeySecret] = useState(config.keySecret || "");
  const [sn, setSn] = useState(config.sn || "");
  const [aiHubUrl, setAiHubUrl] = useState(config.aiHubUrl || "");
  const [houseId, setHouseId] = useState(config.houseId || "");
  const [houseName, setHouseNameState] = useState(config.houseName || "");
  const [hubAdminSecret, setHubAdminSecretState] = useState(config.hubAdminSecret || "");
  const [aiHubSaved, setAiHubSaved] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const [tuyaClientId, setTuyaClientId] = useState(config.tuyaClientId || "");
  const [tuyaClientSecret, setTuyaClientSecret] = useState(config.tuyaClientSecret || "");
  const [tuyaUid, setTuyaUid] = useState(config.tuyaUid || "");
  const [tuyaRegion, setTuyaRegion] = useState(config.tuyaRegion || "sg");

  useEffect(() => {
    setUrl(config.url || "");
    setKey(config.key || "");
    setKeyId(config.keyId || "");
    setKeySecret(config.keySecret || "");
    setSn(config.sn || "");
    setAiHubUrl(config.aiHubUrl || "");
    setHouseId(config.houseId || "");
    setHouseNameState(config.houseName || "");
    setHubAdminSecretState(config.hubAdminSecret || "");
    setTuyaClientId(config.tuyaClientId || "");
    setTuyaClientSecret(config.tuyaClientSecret || "");
    setTuyaUid(config.tuyaUid || "");
    setTuyaRegion(config.tuyaRegion || "sg");
  }, [
    config.url,
    config.key,
    config.keyId,
    config.keySecret,
    config.sn,
    config.aiHubUrl,
    config.houseId,
    config.houseName,
    config.hubAdminSecret,
    config.tuyaClientId,
    config.tuyaClientSecret,
    config.tuyaUid,
    config.tuyaRegion,
  ]);

  const tuyaStatusMeta = {
    idle: { text: t("settings_tuya_status_idle"), color: "var(--text-dim)", icon: Info },
    testing: { text: t("settings_tuya_status_testing"), color: "#F0B429", icon: Loader2 },
    ok: { text: t("settings_tuya_status_ok"), color: "#22C55E", icon: CheckCircle2 },
    fail: { text: t("settings_tuya_status_fail"), color: "#F0475C", icon: XCircle },
  }[tuyaStatus];
  const TuyaStatusIcon = tuyaStatusMeta.icon;

  const hubSyncStatusMeta = {
    idle: { text: null, color: "var(--text-dim)", icon: Info },
    syncing: { text: t("settings_hub_sync_syncing"), color: "#F0B429", icon: Loader2 },
    ok: { text: t("settings_hub_sync_ok"), color: "#22C55E", icon: CheckCircle2 },
    fail: { text: syncMsg || t("settings_hub_sync_fail"), color: "#F0475C", icon: XCircle },
  }[hubSyncStatus];
  const HubSyncIcon = hubSyncStatusMeta.icon;

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

      <div className="rounded-2xl p-4 sm:p-5 border mt-4" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Wifi size={16} style={{ color: "#22C55E" }} />
          <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>
            {t("settings_tuya_section")}
          </h2>
        </div>
        <p className="text-[12px] leading-relaxed mb-4" style={{ color: "var(--text-dim)" }}>
          {t("settings_tuya_desc")}
        </p>

        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_tuya_clientid_label")}
        </label>
        <input
          value={tuyaClientId}
          onChange={(e) => setTuyaClientId(e.target.value)}
          placeholder={t("settings_tuya_clientid_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />

        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_tuya_clientsecret_label")}
        </label>
        <input
          value={tuyaClientSecret}
          onChange={(e) => setTuyaClientSecret(e.target.value)}
          type="password"
          placeholder={t("settings_tuya_clientsecret_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />

        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_tuya_uid_label")}
        </label>
        <input
          value={tuyaUid}
          onChange={(e) => setTuyaUid(e.target.value)}
          placeholder={t("settings_tuya_uid_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />

        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_tuya_region_label")}
        </label>
        <select
          value={tuyaRegion}
          onChange={(e) => setTuyaRegion(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-4"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        >
          {TUYA_REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => saveTuyaConfig({ tuyaClientId, tuyaClientSecret, tuyaUid, tuyaRegion })}
            className="px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ background: "#22C55E", color: "#fff" }}
          >
            {t("settings_save")}
          </button>
          <button
            onClick={() => testTuyaConnection({ tuyaClientId, tuyaClientSecret, tuyaUid, tuyaRegion })}
            className="px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ background: "var(--panel-alt)", color: "var(--text)", border: "1px solid var(--border-strong)" }}
          >
            {t("settings_test")}
          </button>
          {config.tuyaClientId && (
            <button
              onClick={clearTuyaConfig}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium ml-auto"
              style={{ color: "#F0475C", background: "rgba(240,71,92,0.1)" }}
            >
              <Trash2 size={13} /> {t("settings_clear")}
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12.5px]"
          style={{ background: "var(--panel-alt)", color: tuyaStatusMeta.color }}
        >
          <TuyaStatusIcon size={15} className={tuyaStatus === "testing" ? "animate-spin" : ""} />
          {tuyaStatusMeta.text}
        </div>

        <p className="text-[11px] leading-relaxed mt-3" style={{ color: "var(--text-faint)" }}>
          {t("settings_tuya_note")}
        </p>
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
        <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("settings_house_id_label")}
        </label>
        <input
          value={houseId}
          onChange={(e) => {
            setHouseId(e.target.value);
            setAiHubSaved(false);
          }}
          placeholder={t("settings_house_id_placeholder")}
          className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
          style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        />
        <button
          onClick={() => {
            saveAiHubUrl(aiHubUrl);
            saveHouseId(houseId);
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

        <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-[13px] font-medium mb-1.5" style={{ color: "var(--text)" }}>
            {t("settings_hub_sync_section")}
          </p>
          <p className="text-[11.5px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
            {t("settings_hub_sync_desc")}
          </p>

          <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
            {t("settings_house_name_label")}
          </label>
          <input
            value={houseName}
            onChange={(e) => setHouseNameState(e.target.value)}
            placeholder={t("settings_house_name_placeholder")}
            className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
            style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          />

          <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>
            {t("settings_hub_admin_secret_label")}
          </label>
          <input
            value={hubAdminSecret}
            onChange={(e) => setHubAdminSecretState(e.target.value)}
            type="password"
            placeholder={t("settings_hub_admin_secret_placeholder")}
            className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none mb-3"
            style={{ background: "var(--panel-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          />

          <button
            onClick={async () => {
              saveAiHubUrl(aiHubUrl);
              saveHouseId(houseId);
              saveHouseSyncMeta({ houseName, hubAdminSecret });
              const result = await syncToAiHub();
              setSyncMsg(result.ok ? null : result.error);
            }}
            disabled={hubSyncStatus === "syncing"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ background: "#22C55E", color: "#fff", opacity: hubSyncStatus === "syncing" ? 0.7 : 1 }}
          >
            <UploadCloud size={14} />
            {hubSyncStatus === "syncing" ? t("settings_hub_sync_syncing") : t("settings_hub_sync_button")}
          </button>

          {hubSyncStatus !== "idle" && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12.5px] mt-3"
              style={{ background: "var(--panel-alt)", color: hubSyncStatusMeta.color }}
            >
              <HubSyncIcon size={15} className={hubSyncStatus === "syncing" ? "animate-spin" : ""} />
              {hubSyncStatusMeta.text}
            </div>
          )}
        </div>
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
