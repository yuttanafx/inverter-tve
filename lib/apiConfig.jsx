"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ApiConfigContext = createContext(null);
const STORAGE_KEY = "inverter_api_config"; // { url, key, keyId, keySecret, sn, aiHubUrl, tuya*, savedAt }

// สร้าง headers สำหรับยิง request ไปยัง API ของเครื่อง โดยอิงจากค่าที่ผู้ใช้กรอกไว้ในหน้าตั้งค่า
// - key            -> Authorization: Bearer (สำหรับ API ทั่วไปที่ใช้ bearer token)
// - keyId/keySecret/sn -> x-solis-key-id / x-solis-key-secret / x-solis-sn (สำหรับ Solis Proxy โดยเฉพาะ)
export function buildAuthHeaders(config) {
  const headers = { "Content-Type": "application/json" };
  if (config.key) headers["Authorization"] = `Bearer ${config.key}`;
  if (config.keyId) headers["x-solis-key-id"] = config.keyId;
  if (config.keySecret) headers["x-solis-key-secret"] = config.keySecret;
  if (config.sn) headers["x-solis-sn"] = config.sn;
  return headers;
}

// headers สำหรับ Tuya โดยเฉพาะ — ใช้ยิงไปที่ /api/tuya/* ของเว็บเราเอง (same-origin) เท่านั้น
// ไม่เอาไปปนกับ buildAuthHeaders เพราะ config.url ด้านบนอาจชี้ไป proxy ภายนอกที่เราไม่ควรส่ง Tuya secret ให้
export function buildTuyaHeaders(config) {
  return {
    "Content-Type": "application/json",
    "x-tuya-client-id": config.tuyaClientId || "",
    "x-tuya-client-secret": config.tuyaClientSecret || "",
    "x-tuya-uid": config.tuyaUid || "",
    "x-tuya-region": config.tuyaRegion || "sg",
  };
}

export function isTuyaConfigured(config) {
  return !!(config.tuyaClientId && config.tuyaClientSecret && config.tuyaUid);
}

const EMPTY_CONFIG = {
  url: "",
  key: "",
  keyId: "",
  keySecret: "",
  sn: "",
  aiHubUrl: "",
  houseId: "",
  tuyaClientId: "",
  tuyaClientSecret: "",
  tuyaUid: "",
  tuyaRegion: "sg",
  savedAt: null,
};

export function ApiConfigProvider({ children }) {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [status, setStatus] = useState("idle"); // idle | testing | ok | fail
  const [tuyaStatus, setTuyaStatus] = useState("idle"); // idle | testing | ok | fail
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig({ ...EMPTY_CONFIG, ...JSON.parse(raw) });
    } catch (e) {}
    setMounted(true);
  }, []);

  const persist = (next) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  // headers เป็น optional: ถ้าไม่ส่งมา จะสร้างจาก config ปัจจุบัน (ใช้ตอนกดปุ่ม "ทดสอบ" เฉยๆ)
  const testConnection = useCallback(
    async (url, headers) => {
      setStatus("testing");
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(`${url.replace(/\/+$/, "")}/status`, {
          headers: headers ?? buildAuthHeaders(config),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          setStatus("ok");
          return true;
        }
        setStatus("fail");
        return false;
      } catch (e) {
        setStatus("fail");
        return false;
      }
    },
    [config]
  );

  // fields: { url, key, keyId, keySecret, sn } — ไม่แตะ aiHubUrl เพื่อไม่ให้ค่าที่ตั้งไว้หายเวลาบันทึกฝั่ง Solis ใหม่
  const saveConfig = useCallback(
    async (fields) => {
      const trimmed = (fields.url || "").trim();
      if (!trimmed) {
        persist({ ...EMPTY_CONFIG, aiHubUrl: config.aiHubUrl, houseId: config.houseId });
        setStatus("idle");
        return;
      }
      const next = {
        ...config,
        url: trimmed,
        key: (fields.key || "").trim(),
        keyId: (fields.keyId || "").trim(),
        keySecret: (fields.keySecret || "").trim(),
        sn: (fields.sn || "").trim(),
        savedAt: new Date().toISOString(),
      };
      persist(next);
      await testConnection(trimmed, buildAuthHeaders(next));
    },
    [testConnection, config]
  );

  const clearConfig = useCallback(() => {
    persist({ ...EMPTY_CONFIG, aiHubUrl: config.aiHubUrl, houseId: config.houseId });
    setStatus("idle");
  }, [config.aiHubUrl, config.houseId]);

  // เก็บ URL ของ AI Hub แยกต่างหาก ไม่เกี่ยวกับสถานะเชื่อมต่อ Solis (source == "ok"/"fail")
  const saveAiHubUrl = useCallback(
    (url) => {
      persist({ ...config, aiHubUrl: (url || "").trim() });
    },
    [config]
  );

  // house id ของบ้านนี้ใน HOUSES_CONFIG ของ AI Hub (ไว้ต่อท้าย ?house= ตอนเรียก /api/insights)
  const saveHouseId = useCallback(
    (id) => {
      persist({ ...config, houseId: (id || "").trim() });
    },
    [config]
  );

  // ทดสอบเชื่อมต่อ Tuya โดยยิงไป /api/tuya/devices (route ภายในเว็บเราเอง ไม่ใช่ Tuya โดยตรง)
  const testTuyaConnection = useCallback(async (fields) => {
    const c = fields ?? config;
    if (!isTuyaConfigured(c)) {
      setTuyaStatus("idle");
      return false;
    }
    setTuyaStatus("testing");
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`/api/tuya/devices`, { headers: buildTuyaHeaders(c), signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        setTuyaStatus("ok");
        return true;
      }
      setTuyaStatus("fail");
      return false;
    } catch (e) {
      setTuyaStatus("fail");
      return false;
    }
  }, [config]);

  // fields: { tuyaClientId, tuyaClientSecret, tuyaUid, tuyaRegion }
  const saveTuyaConfig = useCallback(
    async (fields) => {
      const next = {
        ...config,
        tuyaClientId: (fields.tuyaClientId || "").trim(),
        tuyaClientSecret: (fields.tuyaClientSecret || "").trim(),
        tuyaUid: (fields.tuyaUid || "").trim(),
        tuyaRegion: fields.tuyaRegion || "sg",
        savedAt: new Date().toISOString(),
      };
      persist(next);
      await testTuyaConnection(next);
    },
    [config, testTuyaConnection]
  );

  const clearTuyaConfig = useCallback(() => {
    persist({ ...config, tuyaClientId: "", tuyaClientSecret: "", tuyaUid: "", tuyaRegion: "sg" });
    setTuyaStatus("idle");
  }, [config]);

  const isConfigured = mounted && !!config.url;
  const tuyaConfigured = mounted && isTuyaConfigured(config);

  return (
    <ApiConfigContext.Provider
      value={{
        config,
        status,
        setStatus,
        saveConfig,
        clearConfig,
        testConnection,
        saveAiHubUrl,
        saveHouseId,
        isConfigured,
        mounted,
        tuyaStatus,
        saveTuyaConfig,
        clearTuyaConfig,
        testTuyaConnection,
        tuyaConfigured,
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
}

export function useApiConfig() {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error("useApiConfig ต้องถูกใช้ภายใน ApiConfigProvider");
  return ctx;
}
