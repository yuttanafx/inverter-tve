"use client";

import { useEffect, useState } from "react";
import { useApiConfig } from "./apiConfig";

/**
 * ดึงข้อมูลจาก API ของเครื่องอินเวอร์เตอร์ที่ผู้ใช้ตั้งค่าไว้ (ต่อเบราว์เซอร์)
 * ถ้ายังไม่ได้ตั้งค่า หรือเชื่อมต่อไม่ได้ จะ fallback กลับไปใช้ mockData ที่ส่งเข้ามา
 * รูปแบบ endpoint ที่คาดหวัง: GET {url}/status , GET {url}/devices , GET {url}/machines
 */
export function useInverterData(mockData) {
  const { config, isConfigured, setStatus } = useApiConfig();
  const [data, setData] = useState(mockData);
  const [source, setSource] = useState("demo"); // demo | live

  useEffect(() => {
    if (!isConfigured) {
      setData(mockData);
      setSource("demo");
      return;
    }

    let cancelled = false;
    const base = config.url.replace(/\/+$/, "");
    const headers = config.key ? { Authorization: `Bearer ${config.key}` } : {};

    async function load() {
      setStatus("testing");
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const [statusRes, devicesRes, machinesRes] = await Promise.allSettled([
          fetch(`${base}/status`, { headers, signal: ctrl.signal }),
          fetch(`${base}/devices`, { headers, signal: ctrl.signal }),
          fetch(`${base}/machines`, { headers, signal: ctrl.signal }),
        ]);
        clearTimeout(timer);
        if (cancelled) return;

        const ok = statusRes.status === "fulfilled" && statusRes.value.ok;
        if (!ok) {
          setStatus("fail");
          setData(mockData);
          setSource("demo");
          return;
        }

        const statusJson = await statusRes.value.json().catch(() => null);
        const devicesJson =
          devicesRes.status === "fulfilled" && devicesRes.value.ok
            ? await devicesRes.value.json().catch(() => null)
            : null;
        const machinesJson =
          machinesRes.status === "fulfilled" && machinesRes.value.ok
            ? await machinesRes.value.json().catch(() => null)
            : null;

        setStatus("ok");
        setSource("live");
        setData({
          ...mockData,
          inverter: statusJson ?? mockData.inverter,
          devices: devicesJson ?? mockData.devices,
          machines: machinesJson ?? mockData.machines,
        });
      } catch (e) {
        if (cancelled) return;
        setStatus("fail");
        setData(mockData);
        setSource("demo");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, config.url, config.key]);

  return { data, source };
}
