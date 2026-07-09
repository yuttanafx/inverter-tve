"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Lightbulb, Thermometer, Tv, Plug, Wind, Cog, Flame, MoveHorizontal } from "lucide-react";
import { useApiConfig, buildAuthHeaders } from "./apiConfig";

const POLL_MS = 15000; // ดึงข้อมูลซ้ำทุก 15 วินาทีเมื่อเชื่อมต่อ API จริงอยู่

const DEVICE_ICONS = { light: Lightbulb, ac: Thermometer, tv: Tv, plug: Plug, fan: Wind };
const MACHINE_ICONS = { compressor: Wind, pump: Cog, welder: Flame, conveyor: MoveHorizontal };

function normalizeDevices(list, fallback) {
  if (!Array.isArray(list)) return fallback;
  return list.map((d, i) => ({
    id: d.id ?? `d${i}`,
    th: d.th ?? d.name ?? `อุปกรณ์ ${i + 1}`,
    en: d.en ?? d.name ?? `Device ${i + 1}`,
    room: d.room ?? "ทั้งหมด",
    on: !!d.on,
    watt: d.watt ?? "",
    icon: DEVICE_ICONS[d.type] ?? Plug,
  }));
}

function normalizeMachines(list, fallback) {
  if (!Array.isArray(list)) return fallback;
  return list.map((m, i) => ({
    id: m.id ?? `m${i}`,
    th: m.th ?? m.name ?? `เครื่องจักร ${i + 1}`,
    en: m.en ?? m.name ?? `Machine ${i + 1}`,
    line: m.line ?? "ทั้งหมด",
    status: m.status === "on" ? "on" : "off",
    kw: m.kw ?? "",
    icon: MACHINE_ICONS[m.type] ?? Cog,
  }));
}

/**
 * ดึงข้อมูล + ส่งคำสั่งควบคุมไปยัง API ของเครื่องอินเวอร์เตอร์ที่ผู้ใช้ตั้งค่าไว้ (ต่อเบราว์เซอร์)
 * ถ้ายังไม่ได้ตั้งค่า หรือเชื่อมต่อไม่ได้ จะ fallback กลับไปใช้ mockData ที่ส่งเข้ามา (โหมดสาธิต)
 *
 * รูปแบบ API ที่คาดหวัง (ผู้ใช้สามารถทำ endpoint พร็อกซีให้ตรงรูปแบบนี้ได้):
 *  GET   {url}/status                -> { model, statusOk, power, voltage, freq, temp, wifiOk, updatedAt }
 *  GET   {url}/devices                -> [{ id, th, en, room, on, watt, type }]
 *  GET   {url}/machines                -> [{ id, th, en, line, status:"on"|"off", kw, type }]
 *  PATCH {url}/devices/{id}   body:{on:boolean}
 *  PATCH {url}/machines/{id}  body:{status:"on"|"off"}
 */
export function useInverterData(mockData) {
  const { config, isConfigured, setStatus } = useApiConfig();
  const [devices, setDevices] = useState(mockData.devices);
  const [machines, setMachines] = useState(mockData.machines);
  const [inverter, setInverter] = useState(mockData.inverter ?? null);
  const [source, setSource] = useState("demo");
  const pollRef = useRef(null);

  const base = isConfigured ? config.url.replace(/\/+$/, "") : null;
  // รองรับทั้ง Authorization Bearer (API ทั่วไป) และ header เฉพาะของ Solis Proxy (x-solis-*)
  const headers = useMemo(() => buildAuthHeaders(config), [config.key, config.keyId, config.keySecret, config.sn]);

  const load = useCallback(async () => {
    if (!base) {
      setDevices(mockData.devices);
      setMachines(mockData.machines);
      setInverter(mockData.inverter ?? null);
      setSource("demo");
      return;
    }
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

      if (!(statusRes.status === "fulfilled" && statusRes.value.ok)) {
        throw new Error("status endpoint unreachable");
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

      setInverter(statusJson ?? mockData.inverter ?? null);
      setDevices(normalizeDevices(devicesJson, mockData.devices));
      setMachines(normalizeMachines(machinesJson, mockData.machines));
      setSource("live");
      setStatus("ok");
    } catch (e) {
      setDevices(mockData.devices);
      setMachines(mockData.machines);
      setInverter(mockData.inverter ?? null);
      setSource("demo");
      setStatus("fail");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, headers]);

  useEffect(() => {
    load();
    clearInterval(pollRef.current);
    if (base) pollRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, headers]);

  // ตั้งค่าสถานะอุปกรณ์แบบระบุชัดเจน: อัปเดต UI ทันที (optimistic) แล้วค่อยยิงคำสั่งไป API จริง
  const setDeviceOn = useCallback(
    async (id, on) => {
      setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, on } : d)));
      if (!base) return; // โหมดสาธิต: แก้แค่ในเบราว์เซอร์ ไม่มีเครื่องจริงให้สั่ง
      try {
        const res = await fetch(`${base}/devices/${id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ on }),
        });
        if (!res.ok) throw new Error("command failed");
      } catch (e) {
        setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, on: !on } : d))); // ส่งคำสั่งไม่สำเร็จ -> ย้อนค่ากลับ
      }
    },
    [base, headers]
  );

  const setMachineStatus = useCallback(
    async (id, status) => {
      setMachines((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)));
      if (!base) return;
      try {
        const res = await fetch(`${base}/machines/${id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("command failed");
      } catch (e) {
        setMachines((ms) => ms.map((m) => (m.id === id ? { ...m, status: status === "on" ? "off" : "on" } : m)));
      }
    },
    [base, headers]
  );

  const toggleDevice = useCallback(
    (id) => {
      const target = devices.find((d) => d.id === id);
      setDeviceOn(id, target ? !target.on : true);
    },
    [devices, setDeviceOn]
  );

  const toggleMachine = useCallback(
    (id) => {
      const target = machines.find((m) => m.id === id);
      setMachineStatus(id, target?.status === "on" ? "off" : "on");
    },
    [machines, setMachineStatus]
  );

  return { devices, machines, inverter, source, toggleDevice, toggleMachine, setDeviceOn, setMachineStatus, refresh: load };
}
