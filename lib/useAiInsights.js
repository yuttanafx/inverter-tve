"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useApiConfig } from "./apiConfig";

const POLL_MS = 30000; // หน้าเว็บดึงผลจาก AI Hub ทุก 30 วินาที (ตัว AI Hub เองตรวจจริงทุก 15 นาทีผ่าน cron)

// ดึงผลวิเคราะห์ล่าสุดจาก AI Hub (โปรเจกต์แยกที่คอยตรวจสอบความผิดปกติของอินเวอร์เตอร์)
// ไม่ต้องมี key ใดๆ ฝั่งนี้ เพราะ endpoint /api/insights ของ AI Hub เป็น read-only แบบ public
export function useAiInsights() {
  const { config } = useApiConfig();
  const aiHubUrl = (config.aiHubUrl || "").trim().replace(/\/+$/, "");
  const houseId = (config.houseId || "").trim();
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | ok | fail | missing_house
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    if (!aiHubUrl) {
      setState("idle");
      return;
    }
    if (!houseId) {
      setState("missing_house");
      return;
    }
    setState((s) => (s === "idle" || s === "missing_house" ? "loading" : s));
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${aiHubUrl}/api/insights?house=${encodeURIComponent(houseId)}`, {
        signal: ctrl.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error("insights endpoint unreachable");
      const json = await res.json();
      setLatest(json.latest ?? null);
      setHistory(Array.isArray(json.history) ? json.history : []);
      setState("ok");
    } catch (e) {
      setState("fail");
    }
  }, [aiHubUrl, houseId]);

  useEffect(() => {
    load();
    clearInterval(pollRef.current);
    if (aiHubUrl && houseId) pollRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [aiHubUrl, houseId, load]);

  return { latest, history, state, isConfigured: !!aiHubUrl, refresh: load };
}
