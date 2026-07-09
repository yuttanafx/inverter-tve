"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ApiConfigContext = createContext(null);
const STORAGE_KEY = "inverter_api_config"; // { url, key, savedAt }

export function ApiConfigProvider({ children }) {
  const [config, setConfig] = useState({ url: "", key: "", savedAt: null });
  const [status, setStatus] = useState("idle"); // idle | testing | ok | fail
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig(JSON.parse(raw));
    } catch (e) {}
    setMounted(true);
  }, []);

  const persist = (next) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  const testConnection = useCallback(async (url) => {
    setStatus("testing");
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`${url.replace(/\/+$/, "")}/status`, { signal: ctrl.signal });
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
  }, []);

  const saveConfig = useCallback(
    async (url, key) => {
      const trimmed = url.trim();
      if (!trimmed) {
        persist({ url: "", key: "", savedAt: null });
        setStatus("idle");
        return;
      }
      const next = { url: trimmed, key: key.trim(), savedAt: new Date().toISOString() };
      persist(next);
      await testConnection(trimmed);
    },
    [testConnection]
  );

  const clearConfig = useCallback(() => {
    persist({ url: "", key: "", savedAt: null });
    setStatus("idle");
  }, []);

  const isConfigured = mounted && !!config.url;

  return (
    <ApiConfigContext.Provider
      value={{ config, status, setStatus, saveConfig, clearConfig, testConnection, isConfigured, mounted }}
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
