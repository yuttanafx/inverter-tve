"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, LayoutGrid, DoorOpen, Clock, Sliders, Factory, GitBranch, Zap,
  Bell, Cpu, BatteryCharging, BarChart3, Settings, User, Code2, Menu, X,
  Maximize2, ChevronDown, ChevronRight, Sun, CloudSun, DollarSign,
  Play, Square, CheckCircle2, AlertTriangle, Info, Wifi, Lightbulb,
  Thermometer, Tv, Plug, Wind, Cog, Flame, MoveHorizontal, Mic, Send,
  Sparkles, TrendingUp, ShieldAlert, CircleDot,
} from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceDot,
} from "recharts";
import { useLang } from "@/lib/i18n";
import { useInverterData } from "@/lib/useInverterData";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import SettingsPanel from "./SettingsPanel";

// ---------------------------------------------------------------------------
// สี status/brand คงเดิมในทั้งสองธีม ส่วน bg/panel/text ใช้ CSS var (ดู globals.css)
// ---------------------------------------------------------------------------

const NAV = [
  { section: null, items: [{ key: "overview", labelKey: "nav_overview", icon: Home }] },
  {
    sectionKey: "nav_section_home",
    items: [
      { key: "devices", labelKey: "nav_devices", icon: LayoutGrid },
      { key: "rooms", labelKey: "nav_rooms", icon: DoorOpen },
      { key: "schedule", labelKey: "nav_schedule", icon: Clock },
      { key: "modes", labelKey: "nav_modes", icon: Sliders },
    ],
  },
  {
    sectionKey: "nav_section_factory",
    items: [
      { key: "machines", labelKey: "nav_machines", icon: Factory },
      { key: "lines", labelKey: "nav_lines", icon: GitBranch },
      { key: "factoryPower", labelKey: "nav_factoryPower", icon: Zap },
      { key: "alerts", labelKey: "nav_alerts", icon: Bell },
    ],
  },
  {
    sectionKey: "nav_section_system",
    items: [
      { key: "inverter", labelKey: "nav_inverter", icon: Cpu },
      { key: "battery", labelKey: "nav_battery", icon: BatteryCharging },
      { key: "reports", labelKey: "nav_reports", icon: BarChart3 },
      { key: "settings", labelKey: "nav_settings", icon: Settings },
      { key: "users", labelKey: "nav_users", icon: User },
    ],
  },
];

const MOBILE_TABS = [
  { key: "overview", labelKey: "nav_overview", icon: Home },
  { key: "devices", labelKey: "mobile_devices", icon: LayoutGrid },
  { key: "machines", labelKey: "mobile_machines", icon: Factory },
  { key: "alerts", labelKey: "mobile_alerts", icon: Bell },
];

const ROOM_TABS = [
  { key: "ทั้งหมด", th: "ทั้งหมด", en: "All" },
  { key: "ห้องนั่งเล่น", th: "ห้องนั่งเล่น", en: "Living Room" },
  { key: "ห้องนอน", th: "ห้องนอน", en: "Bedroom" },
  { key: "ห้องครัว", th: "ห้องครัว", en: "Kitchen" },
  { key: "ห้องน้ำ", th: "ห้องน้ำ", en: "Bathroom" },
  { key: "โรงรถ", th: "โรงรถ", en: "Garage" },
];

const DEVICES = [
  { id: "d1", th: "ไฟเพดาน", en: "Ceiling Light", room: "ห้องนั่งเล่น", icon: Lightbulb, on: true, watt: "80W" },
  { id: "d2", th: "แอร์", en: "Air Conditioner", room: "ห้องนั่งเล่น", icon: Thermometer, on: true, watt: "1,200W" },
  { id: "d3", th: "ทีวี", en: "TV", room: "ห้องนั่งเล่น", icon: Tv, on: true, watt: "60W" },
  { id: "d4", th: "ปลั๊กไฟ", en: "Power Plug", room: "ห้องนั่งเล่น", icon: Plug, on: false, watt: "120W" },
  { id: "d5", th: "โคมไฟหัวเตียง", en: "Bedside Lamp", room: "ห้องนอน", icon: Lightbulb, on: true, watt: "15W" },
  { id: "d6", th: "แอร์ห้องนอน", en: "Bedroom AC", room: "ห้องนอน", icon: Thermometer, on: false, watt: "900W" },
  { id: "d7", th: "เตาไฟฟ้า", en: "Electric Stove", room: "ห้องครัว", icon: Plug, on: true, watt: "1,500W" },
  { id: "d8", th: "ไฟโรงรถ", en: "Garage Light", room: "โรงรถ", icon: Lightbulb, on: false, watt: "40W" },
];

const LINE_TABS = [
  { key: "ทั้งหมด", th: "ทั้งหมด", en: "All" },
  { key: "ไลน์ผลิต 1", th: "ไลน์ผลิต 1", en: "Line 1" },
  { key: "ไลน์ผลิต 2", th: "ไลน์ผลิต 2", en: "Line 2" },
  { key: "ไลน์ผลิต 3", th: "ไลน์ผลิต 3", en: "Line 3" },
];

const MACHINES = [
  { id: "m1", th: "เครื่องอัดอากาศ 3", en: "Air Compressor 3", line: "ไลน์ผลิต 1", icon: Wind, kw: "7.5 kW", status: "on" },
  { id: "m2", th: "เครื่องปั๊มน้ำ 2", en: "Water Pump 2", line: "ไลน์ผลิต 1", icon: Cog, kw: "5.5 kW", status: "on" },
  { id: "m3", th: "เครื่องเชื่อม 3", en: "Welding Machine 3", line: "ไลน์ผลิต 2", icon: Flame, kw: "6.0 kW", status: "off" },
  { id: "m4", th: "สายพานลำเลียง 3", en: "Conveyor Belt 3", line: "ไลน์ผลิต 3", icon: MoveHorizontal, kw: "3.0 kW", status: "on" },
];

const CHART_DATA = [
  { t: "00:00", produced: 0, used: 3.2, exported: 0, battery: 42 },
  { t: "02:00", produced: 0, used: 2.6, exported: 0, battery: 38 },
  { t: "04:00", produced: 0.2, used: 2.4, exported: 0, battery: 34 },
  { t: "06:00", produced: 1.8, used: 4.6, exported: 0, battery: 36 },
  { t: "08:00", produced: 6.4, used: 6.8, exported: 0.4, battery: 48 },
  { t: "10:00", produced: 11.6, used: 5.2, exported: 4.8, battery: 68 },
  { t: "12:00", produced: 14.8, used: 4.4, exported: 8.6, battery: 88 },
  { t: "14:00", produced: 13.6, used: 4.8, exported: 7.4, battery: 96 },
  { t: "16:00", produced: 9.8, used: 5.6, exported: 4.2, battery: 100 },
  { t: "18:00", produced: 3.6, used: 7.8, exported: 0.6, battery: 92 },
  { t: "20:00", produced: 0.4, used: 8.4, exported: 0, battery: 78 },
  { t: "22:00", produced: 0, used: 5.6, exported: 0, battery: 60 },
  { t: "24:00", produced: 0, used: 3.8, exported: 0, battery: 50 },
];

const ANOMALY_CHART = [
  { t: "00:00", actual: 3.2, lo: 2.0, hi: 3.6 },
  { t: "02:00", actual: 2.6, lo: 1.8, hi: 3.0 },
  { t: "04:00", actual: 2.4, lo: 1.8, hi: 2.8 },
  { t: "06:00", actual: 4.6, lo: 3.5, hi: 5.0 },
  { t: "08:00", actual: 6.8, lo: 5.5, hi: 7.5 },
  { t: "10:00", actual: 5.2, lo: 4.5, hi: 6.5 },
  { t: "12:00", actual: 4.4, lo: 4.0, hi: 6.0 },
  { t: "14:00", actual: 9.8, lo: 4.0, hi: 6.0 },
  { t: "16:00", actual: 5.6, lo: 4.5, hi: 6.5 },
  { t: "18:00", actual: 7.8, lo: 6.5, hi: 8.5 },
  { t: "20:00", actual: 8.4, lo: 7.0, hi: 9.0 },
  { t: "22:00", actual: 5.6, lo: 4.0, hi: 6.0 },
  { t: "24:00", actual: 3.8, lo: 3.0, hi: 4.5 },
];

const ANOMALIES = [
  { id: "a1", severity: "high", icon: AlertTriangle, color: "#F0475C", th: "ใช้ไฟพุ่งสูงผิดปกติ", en: "Abnormal power spike", descTh: "ห้องครัว: 1,500W ต่อเนื่อง 45 นาที (ปกติไม่เกิน 20 นาที)", descEn: "Kitchen: 1,500W continuously for 45 min (normally under 20 min)", time: "14:20" },
  { id: "a2", severity: "medium", icon: Clock, color: "#F0B429", th: "อุปกรณ์ทำงานนอกเวลาปกติ", en: "Device active outside usual hours", descTh: "แอร์ห้องนอนเปิดตอนตี 3 ซึ่งไม่ตรงกับรูปแบบการใช้งานปกติ", descEn: "Bedroom AC turned on at 3 AM, which doesn't match the usual pattern", time: "03:10" },
  { id: "a3", severity: "low", icon: Info, color: "#3B82F6", th: "ประสิทธิภาพแผงโซลาร์ลดลง", en: "Solar panel efficiency dropped", descTh: "ผลผลิตต่ำกว่าค่าเฉลี่ย 12% เทียบกับสภาพอากาศเดียวกัน", descEn: "Output is 12% below average for the same weather conditions", time: "วันนี้" },
];

const INVERTER_MOCK = {
  model: "MAX 10KTL3-X",
  statusOk: true,
  power: "5.2 kW",
  voltage: "230 V",
  freq: "50.0 Hz",
  temp: "32°C",
  wifiOk: true,
  updatedAt: "10:30:45",
};

const NOTICES = [
  { icon: CheckCircle2, color: "#22C55E", time: "10:30", th: "อินเวอร์เตอร์ทำงานปกติ", en: "Inverter operating normally" },
  { icon: AlertTriangle, color: "#F0B429", time: "09:15", th: "แบตเตอรี่ใกล้จะเต็ม", en: "Battery is nearly full" },
  { icon: Info, color: "#3B82F6", time: "08:45", th: "ตั้งเวลาการทำงานสำเร็จ", en: "Schedule set successfully" },
];

function StatCard({ icon: Icon, iconBg, label, value, unit, delta, up, suffix }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={19} color="#fff" />
        </div>
        <span className="text-[12.5px] leading-tight" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-[24px] font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{value}</span>
        <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>{unit}</span>
      </div>
      <div className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: up ? "#22C55E" : "#F0475C" }}>
        {up ? "↑" : "↓"} {delta} {suffix}
      </div>
    </div>
  );
}

function FlowNode({ icon: Icon, label, sub, tint }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border" style={{ background: "var(--panel-alt)", borderColor: tint }}>
        <Icon size={22} style={{ color: tint }} />
      </div>
      <div>
        <p className="text-[11.5px] sm:text-[12px] font-medium" style={{ color: "var(--text)" }}>{label}</p>
        {sub && <p className="text-[10.5px] sm:text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function EnergyFlow({ t }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 800 220" className="w-full h-auto" style={{ maxHeight: 200 }}>
        <defs>
          <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#3B82F6" /></marker>
          <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22C55E" /></marker>
        </defs>
        <path d="M195,40 L340,40" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 6" markerEnd="url(#arrowBlue)"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" /></path>
        <path d="M460,40 L605,40" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="6 6" markerEnd="url(#arrowGreen)"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" /></path>
        <path d="M400,70 L400,120 L195,120 L195,150" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 6" markerEnd="url(#arrowBlue)"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" /></path>
        <path d="M400,70 L400,120 L605,120 L605,150" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="6 6" markerEnd="url(#arrowGreen)"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" /></path>
      </svg>
      <div className="grid grid-cols-3 -mt-2">
        <div className="flex flex-col items-start gap-8 sm:gap-10">
          <FlowNode icon={Sun} label={t("flow_solar")} sub="5.2 kW" tint="#3B82F6" />
          <FlowNode icon={BatteryCharging} label={t("flow_battery")} sub="80% · 2.8 kW" tint="#3B82F6" />
        </div>
        <div className="flex flex-col items-center justify-start">
          <FlowNode icon={Cpu} label={t("flow_inverter")} sub={`● ${t("flow_normal")}`} tint="#22C55E" />
        </div>
        <div className="flex flex-col items-end gap-8 sm:gap-10">
          <FlowNode icon={Zap} label={t("flow_grid")} sub="1.2 kW" tint="#22C55E" />
          <FlowNode icon={Home} label={t("flow_home_load")} sub="4.0 kW" tint="#22C55E" />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border px-3 py-2 text-[12px]" style={{ background: "var(--panel-alt)", borderColor: "var(--border-stronger)" }}>
      <p style={{ color: "var(--text-muted)" }} className="mb-1">{label}</p>
      {payload.map((p) => (<p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}{p.dataKey === "battery" ? "%" : " kW"}</p>))}
    </div>
  );
}

function DeviceTile({ d, onToggle, pick }) {
  const Icon = d.icon;
  return (
    <div className="rounded-xl p-3.5 border" style={{ background: "var(--panel-alt)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: d.on ? "rgba(59,130,246,0.16)" : "var(--border-soft)" }}>
          <Icon size={17} style={{ color: d.on ? "#3B82F6" : "var(--text-dim)" }} />
        </div>
        <button onClick={() => onToggle(d.id)} className="w-9 h-5 rounded-full relative shrink-0" style={{ background: d.on ? "#3B82F6" : "var(--border-stronger)" }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: d.on ? "18px" : "2px" }} />
        </button>
      </div>
      <p className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{pick(d.th, d.en)}</p>
      <p className="text-[11px] mb-1" style={{ color: "var(--text-dim)" }}>{pick(d.room, ROOM_TABS.find((r) => r.key === d.room)?.en)}</p>
      <p className="text-[12px] tabular-nums" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d.watt}</p>
    </div>
  );
}

function MachineRow({ m, onToggle, pick, t }) {
  const Icon = m.icon;
  const on = m.status === "on";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--border-soft)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: on ? "rgba(34,197,94,0.14)" : "var(--border-soft)" }}>
        <Icon size={16} style={{ color: on ? "#22C55E" : "var(--text-dim)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{pick(m.th, m.en)}</p>
        <p className="text-[11px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{m.kw}</p>
      </div>
      <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full shrink-0" style={{ color: on ? "#22C55E" : "#F0475C", background: on ? "rgba(34,197,94,0.1)" : "rgba(240,71,92,0.1)" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: on ? "#22C55E" : "#F0475C" }} /> {on ? t("machine_on") : t("machine_off")}
      </span>
      <button onClick={() => onToggle(m.id)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: on ? "#22C55E" : "#F0475C" }}>
        {on ? <Play size={12} fill="#0A1120" color="#0A1120" /> : <Square size={11} fill="#0A1120" color="#0A1120" />}
      </button>
    </div>
  );
}

function AnomalyCard({ a, pick }) {
  const Icon = a.icon;
  return (
    <div className="rounded-xl p-3 border-l-4 flex items-start gap-3" style={{ background: "var(--panel-alt)", borderColor: a.color }}>
      <Icon size={16} style={{ color: a.color }} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12.5px] font-medium" style={{ color: "var(--text)" }}>{pick(a.th, a.en)}</p>
          <span className="text-[10.5px] shrink-0" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{a.time}</span>
        </div>
        <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{pick(a.descTh, a.descEn)}</p>
      </div>
    </div>
  );
}

// ---- AI console: text + voice command hook -------------------------------
function useSpeechRecognition(onResult, lang) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.lang = lang === "en" ? "en-US" : "th-TH";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => onResult(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
  }, [onResult, lang]);

  const start = () => {
    if (!recRef.current) return;
    setListening(true);
    try { recRef.current.start(); } catch (e) { setListening(false); }
  };
  const stop = () => { recRef.current?.stop(); setListening(false); };

  return { supported, listening, start, stop };
}

function AiAssistant({ devices, setDeviceOn, machines, setMachineStatus, open, onClose }) {
  const { t, lang, pick } = useLang();
  const [log, setLog] = useState([{ who: "ai", text: t("ai_greeting") }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);

  const run = (raw) => {
    const text = raw.trim();
    if (!text) return;
    setLog((l) => [...l, { who: "user", text }]);

    const wantOn = text.includes("เปิด") || /\bturn on\b/i.test(text) || /\bon\b/i.test(text);
    const wantOff = text.includes("ปิด") || /\bturn off\b/i.test(text) || /\boff\b/i.test(text);
    const askAnomaly = text.includes("ผิดปกติ") || text.includes("แจ้งเตือน") || /anomal|alert/i.test(text);
    const matches = (name, en) => text.includes(name) || (en && text.toLowerCase().includes(en.toLowerCase()));
    const target =
      devices.find((d) => matches(d.th, d.en) || text.includes(d.room)) ||
      machines.find((m) => matches(m.th, m.en));

    setTimeout(() => {
      if (askAnomaly) {
        const top = ANOMALIES[0];
        setLog((l) => [...l, { who: "ai", text: `${t("ai_anomaly_found")} ${ANOMALIES.length} ${t("ai_anomaly_latest")} ${pick(top.th, top.en)} — ${pick(top.descTh, top.descEn)}` }]);
        return;
      }
      if ((wantOn || wantOff) && target) {
        const name = pick(target.th, target.en);
        if (devices.includes(target)) {
          setDeviceOn(target.id, wantOn);
        } else {
          setMachineStatus(target.id, wantOn ? "on" : "off");
        }
        setLog((l) => [...l, { who: "ai", text: `${wantOn ? t("ai_turned_on") : t("ai_turned_off")} “${name}” ${t("ai_done")}` }]);
      } else if (wantOn || wantOff) {
        setLog((l) => [...l, { who: "ai", text: t("ai_not_found") }]);
      } else {
        setLog((l) => [...l, { who: "ai", text: t("ai_fallback") }]);
      }
    }, 400);
  };

  const { supported, listening, start, stop } = useSpeechRecognition((transcript) => run(transcript), lang);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "var(--overlay)", backdropFilter: "blur(3px)" }}>
      <div className="w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl border flex flex-col" style={{ background: "var(--panel)", backdropFilter: "blur(16px)", borderColor: "rgba(59,130,246,0.3)", maxHeight: "80vh" }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#3B82F6", animation: "pulseRing 2.2s ease-out infinite" }} />
              <Sparkles size={13} style={{ color: "var(--text)" }} className="relative" />
            </div>
            <span className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{t("ai_title")}</span>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 min-h-[140px]">
          {log.map((m, i) => (
            <div key={i} className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className="text-[12.5px] leading-snug px-3 py-2 rounded-xl max-w-[85%]"
                style={{
                  background: m.who === "user" ? "#3B82F6" : "var(--panel-alt)",
                  color: m.who === "user" ? "#fff" : "var(--text)",
                }}
              >
                {m.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {!supported && (
          <p className="px-4 text-[11px] pb-1" style={{ color: "#F0B429" }}>{t("ai_unsupported")}</p>
        )}

        <div className="flex items-center gap-2 px-3 pb-4 pt-1">
          <button
            onClick={listening ? stop : start}
            disabled={!supported}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30"
            style={{
              background: listening ? "#F0475C" : "linear-gradient(135deg,#3B82F6,#22C55E)",
              boxShadow: listening ? "0 0 0 6px rgba(240,71,92,0.15)" : "none",
            }}
          >
            <Mic size={18} color="#fff" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border" style={{ background: "var(--panel-alt)", borderColor: "var(--border-strong)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { run(input); setInput(""); } }}
              placeholder={listening ? t("ai_placeholder_listening") : t("ai_placeholder")}
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: "var(--text)" }}
            />
          </div>
          <button onClick={() => { run(input); setInput(""); }} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.14)" }}>
            <Send size={16} style={{ color: "#3B82F6" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InverterControlCenter() {
  const { t, pick } = useLang();
  const [navOpen, setNavOpen] = useState(false);
  const [active, setActive] = useState("overview");
  const [roomTab, setRoomTab] = useState("ห้องนั่งเล่น");
  const [lineTab, setLineTab] = useState("ทั้งหมด");
  const [range, setRange] = useState("day");
  const [aiOpen, setAiOpen] = useState(false);

  const { devices, machines, inverter, source, toggleDevice, toggleMachine, setDeviceOn, setMachineStatus } =
    useInverterData({ devices: DEVICES, machines: MACHINES, inverter: INVERTER_MOCK });

  // ---- นำทางแบบ scroll-to-section: กดเมนูแล้วเลื่อนไปโซนที่เกี่ยวข้อง + ไฮไลต์ชั่วครู่ ----
  const topRef = useRef(null);
  const devicesSectionRef = useRef(null);
  const machinesSectionRef = useRef(null);
  const flowChartSectionRef = useRef(null);
  const inverterSectionRef = useRef(null);
  const anomalySectionRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const [pulse, setPulse] = useState(null);

  const SECTION_REFS = {
    top: topRef,
    devices: devicesSectionRef,
    machines: machinesSectionRef,
    flow: flowChartSectionRef,
    inverter: inverterSectionRef,
    anomaly: anomalySectionRef,
  };
  const NAV_TO_SECTION = {
    overview: "top",
    devices: "devices",
    rooms: "devices",
    schedule: "devices",
    modes: "devices",
    machines: "machines",
    lines: "machines",
    factoryPower: "flow",
    alerts: "anomaly",
    inverter: "inverter",
    battery: "flow",
    reports: "flow",
    users: "top",
    settings: null,
  };

  const goTo = (key) => {
    setNavOpen(false);
    const wasInSettings = active === "settings" && key !== "settings";
    setActive(key);
    const sectionName = NAV_TO_SECTION[key];
    if (!sectionName) return;

    const runScroll = () => {
      SECTION_REFS[sectionName].current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPulse(sectionName);
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setPulse(null), 1400);
    };
    // ถ้ากำลังออกจากหน้าตั้งค่า ต้องรอให้ DOM ของหน้า overview mount ก่อนค่อย scroll
    if (wasInSettings) {
      requestAnimationFrame(() => requestAnimationFrame(runScroll));
    } else {
      runScroll();
    }
  };

  const pulseStyle = (name) => ({
    transition: "box-shadow 0.35s ease",
    boxShadow: pulse === name ? "0 0 0 3px rgba(59,130,246,0.6), 0 0 32px rgba(59,130,246,0.35)" : "none",
  });

  const filteredDevices = useMemo(() => (roomTab === "ทั้งหมด" ? devices : devices.filter((d) => d.room === roomTab)), [devices, roomTab]);
  const filteredMachines = useMemo(() => (lineTab === "ทั้งหมด" ? machines : machines.filter((m) => m.line === lineTab)), [machines, lineTab]);

  const RANGE_TABS = [
    { key: "day", label: t("range_day") },
    { key: "week", label: t("range_week") },
    { key: "month", label: t("range_month") },
    { key: "year", label: t("range_year") },
  ];

  return (
    <div className="min-h-screen w-full flex" style={{ color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{`
        @keyframes pulseRing { 0% { transform: scale(0.6); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
      `}</style>

      {/* Mobile drawer backdrop */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "var(--overlay)" }} onClick={() => setNavOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto transition-transform duration-200 border-r flex flex-col
          ${navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "var(--sidebar)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3B82F6,#22C55E)" }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <div className="leading-none">
              <p className="text-[13px] font-semibold tracking-wide" style={{ color: "var(--text)" }}>{t("brand_title")}</p>
              <p className="text-[9.5px] tracking-widest" style={{ color: "var(--text-dim)" }}>{t("brand_sub")}</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setNavOpen(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.sectionKey && <p className="px-3 mb-1.5 text-[10.5px] tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>{t(group.sectionKey)}</p>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => goTo(item.key)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] transition-colors"
                    style={{ background: isActive ? "rgba(59,130,246,0.14)" : "transparent", color: isActive ? "#3B82F6" : "var(--text-muted)" }}
                  >
                    <Icon size={16} />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mx-3 mb-4 rounded-xl p-3.5 border flex items-center gap-2.5" style={{ borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.08)" }}>
          <Code2 size={16} style={{ color: "#3B82F6" }} />
          <div className="leading-tight">
            <p className="text-[11.5px] font-medium" style={{ color: "var(--text)" }}>{t("api_doc_title")}</p>
            <p className="text-[10.5px]" style={{ color: "var(--text-dim)" }}>{t("api_doc_sub")}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setNavOpen(true)} className="lg:hidden" style={{ color: "var(--text-muted)" }}><Menu size={20} /></button>
          <span className="hidden lg:block text-[13px]" style={{ color: "var(--text-dim)" }} />
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text)" }}>
              <CloudSun size={18} style={{ color: "#F0B429" }} /> 32°C <span style={{ color: "var(--text-dim)" }}>{t("weather_sunny")}</span>
            </div>
            <LangToggle />
            <ThemeToggle />
            <button className="relative" style={{ color: "var(--text-muted)" }}>
              <Bell size={18} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center" style={{ background: "#F0475C", color: "#fff" }}>3</span>
            </button>
            <Maximize2 size={18} className="hidden sm:block" style={{ color: "var(--text-muted)" }} />
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: "var(--border-strong)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3B82F6,#A78BFA)" }}>
                <User size={15} color="#fff" />
              </div>
              <div className="leading-tight hidden sm:block">
                <p className="text-[12.5px] font-medium" style={{ color: "var(--text)" }}>{t("admin")}</p>
                <p className="text-[10.5px]" style={{ color: "var(--text-dim)" }}>{t("admin_name")}</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block" style={{ color: "var(--text-dim)" }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 pb-24 lg:pb-6">
          {active === "settings" ? (
            <SettingsPanel />
          ) : (
          <>
          <div ref={topRef} className="flex items-center gap-2 flex-wrap mb-1 scroll-mt-4">
            <h1 className="text-[21px] sm:text-[24px] font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{t("page_title")}</h1>
            <span
              className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full"
              style={{
                color: source === "live" ? "#22C55E" : "#F0B429",
                background: source === "live" ? "rgba(34,197,94,0.1)" : "rgba(240,180,41,0.12)",
              }}
            >
              <CircleDot size={11} />
              {source === "live" ? t("live_badge") : t("demo_badge")}
            </span>
          </div>
          <p className="text-[12.5px] sm:text-[13px] mb-5" style={{ color: "var(--text-dim)" }}>{t("page_sub")}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            <StatCard icon={Sun} iconBg="linear-gradient(135deg,#3B82F6,#1D4ED8)" label={t("stat_produced")} value="45.6" unit="kWh" delta="12.5%" up suffix={t("vs_yesterday")} />
            <StatCard icon={BatteryCharging} iconBg="linear-gradient(135deg,#22C55E,#15803D)" label={t("stat_used")} value="28.3" unit="kWh" delta="8.3%" up={false} suffix={t("vs_yesterday")} />
            <StatCard icon={Zap} iconBg="linear-gradient(135deg,#A78BFA,#7C3AED)" label={t("stat_exported")} value="17.3" unit="kWh" delta="15.7%" up suffix={t("vs_yesterday")} />
            <StatCard icon={DollarSign} iconBg="linear-gradient(135deg,#F0B429,#D97706)" label={t("stat_saved")} value="฿156.75" unit="" delta="10.2%" up suffix={t("vs_yesterday")} />
          </div>

          <div ref={flowChartSectionRef} className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-4 mb-5 rounded-2xl scroll-mt-4" style={pulseStyle("flow")}>
            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
              <h2 className="text-[14px] font-medium mb-4" style={{ color: "var(--text)" }}>{t("realtime_status")}</h2>
              <EnergyFlow t={t} />
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>{t("energy_chart")}</h2>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-strong)" }}>
                  {RANGE_TABS.map((r) => (
                    <button key={r.key} onClick={() => setRange(r.key)} className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px]" style={{ background: range === r.key ? "#3B82F6" : "transparent", color: range === r.key ? "#fff" : "var(--text-muted)" }}>{r.label}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={CHART_DATA} margin={{ left: -18, right: 0, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={{ stroke: "var(--border-strong)" }} tickLine={false} />
                  <YAxis yAxisId="kw" tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip t={t} />} />
                  <Legend verticalAlign="top" align="right" height={28} formatter={(v) => <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{v}</span>} />
                  <Area yAxisId="kw" type="monotone" dataKey="produced" name={t("legend_produced")} stroke="#22C55E" fill="url(#prodFill)" strokeWidth={2} />
                  <Line yAxisId="kw" type="monotone" dataKey="used" name={t("legend_used")} stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line yAxisId="kw" type="monotone" dataKey="exported" name={t("legend_exported")} stroke="#A78BFA" strokeWidth={2} dot={false} />
                  <Line yAxisId="pct" type="monotone" dataKey="battery" name={t("legend_battery")} stroke="#F0B429" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
            <div ref={devicesSectionRef} className="rounded-2xl p-4 sm:p-5 border scroll-mt-4" style={{ background: "var(--panel)", borderColor: "var(--border)", ...pulseStyle("devices") }}>
              <h2 className="text-[14px] font-medium mb-3" style={{ color: "var(--text)" }}>{t("home_devices_title")}</h2>
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {ROOM_TABS.map((r) => (
                  <button key={r.key} onClick={() => setRoomTab(r.key)} className="px-2.5 py-1 rounded-full text-[11.5px] whitespace-nowrap shrink-0" style={{ background: roomTab === r.key ? "#3B82F6" : "var(--border-soft)", color: roomTab === r.key ? "#fff" : "var(--text-muted)" }}>{pick(r.th, r.en)}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {filteredDevices.map((d) => <DeviceTile key={d.id} d={d} onToggle={toggleDevice} pick={pick} />)}
              </div>
              <button className="w-full flex items-center justify-center gap-1 text-[12.5px] py-2 rounded-lg" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)" }}>{t("view_all_devices")} <ChevronRight size={13} /></button>
            </div>

            <div ref={machinesSectionRef} className="rounded-2xl p-4 sm:p-5 border scroll-mt-4" style={{ background: "var(--panel)", borderColor: "var(--border)", ...pulseStyle("machines") }}>
              <h2 className="text-[14px] font-medium mb-3" style={{ color: "var(--text)" }}>{t("factory_machines_title")}</h2>
              <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                {LINE_TABS.map((l) => (
                  <button key={l.key} onClick={() => setLineTab(l.key)} className="px-2.5 py-1 rounded-full text-[11.5px] whitespace-nowrap shrink-0" style={{ background: lineTab === l.key ? "#3B82F6" : "var(--border-soft)", color: lineTab === l.key ? "#fff" : "var(--text-muted)" }}>{pick(l.th, l.en)}</button>
                ))}
              </div>
              <div className="mb-2">{filteredMachines.map((m) => <MachineRow key={m.id} m={m} onToggle={toggleMachine} pick={pick} t={t} />)}</div>
              <button className="w-full flex items-center justify-center gap-1 text-[12.5px] py-2 rounded-lg" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)" }}>{t("view_all_machines")} <ChevronRight size={13} /></button>
            </div>

            <div ref={inverterSectionRef} className="rounded-2xl p-4 sm:p-5 border scroll-mt-4" style={{ background: "var(--panel)", borderColor: "var(--border)", ...pulseStyle("inverter") }}>
              <h2 className="text-[14px] font-medium mb-3" style={{ color: "var(--text)" }}>{t("inverter_status_title")}</h2>
              <div className="rounded-xl p-4 mb-3 flex items-center justify-center" style={{ background: "var(--panel-alt)" }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3B82F6,#22C55E)" }}><Cpu size={28} color="#fff" /></div>
              </div>
              <dl className="space-y-2 text-[12.5px]">
                {[
                  [t("inv_model"), inverter?.model ?? "—"],
                  [t("inv_status"), inverter?.statusOk === false ? t("inv_status_abnormal") : t("inv_status_normal"), inverter?.statusOk === false ? "#F0475C" : "#22C55E"],
                  [t("inv_power"), inverter?.power ?? "—"],
                  [t("inv_voltage"), inverter?.voltage ?? "—"],
                  [t("inv_freq"), inverter?.freq ?? "—"],
                  [t("inv_temp"), inverter?.temp ?? "—"],
                  [t("inv_wifi"), inverter?.wifiOk === false ? t("inv_wifi_disconnected") : t("inv_wifi_connected"), inverter?.wifiOk === false ? "#F0475C" : "#3B82F6"],
                  [t("inv_updated"), inverter?.updatedAt ?? "—"],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt style={{ color: "var(--text-faint)" }}>{k}</dt>
                    <dd style={{ color: c || "var(--text)", fontFamily: "var(--font-mono)" }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <button className="w-full flex items-center justify-center gap-1 text-[12.5px] py-2 rounded-lg mt-3" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)" }}>{t("view_more")} <ChevronRight size={13} /></button>
            </div>
          </div>

          {/* Usage behavior & anomaly detection */}
          <div ref={anomalySectionRef} className="rounded-2xl p-4 sm:p-5 border mb-5 scroll-mt-4" style={{ background: "var(--panel)", borderColor: "var(--border)", ...pulseStyle("anomaly") }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} style={{ color: "#F0475C" }} />
              <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>{t("anomaly_title")}</h2>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full ml-auto" style={{ color: "#F0475C", background: "rgba(240,71,92,0.12)" }}>{ANOMALIES.length} {t("anomaly_items")}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
                  <TrendingUp size={13} /> {t("anomaly_chart_label")}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={ANOMALY_CHART} margin={{ left: -18, right: 8, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: "var(--text-faint)", fontSize: 9.5 }} axisLine={{ stroke: "var(--border-strong)" }} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-faint)", fontSize: 9.5 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip t={t} />} />
                    <Area type="monotone" dataKey="hi" stroke="none" fill="url(#bandFill)" name={t("anomaly_chart_label")} />
                    <Area type="monotone" dataKey="lo" stroke="none" fill="var(--bg)" fillOpacity={1} name="lo" />
                    <Line type="monotone" dataKey="actual" name={t("anomaly_legend_actual")} stroke="#F0475C" strokeWidth={2} dot={false} />
                    <ReferenceDot x="14:00" y={9.8} r={5} fill="#F0475C" stroke="var(--bg)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {ANOMALIES.map((a) => <AnomalyCard key={a.id} a={a} pick={pick} />)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 border flex items-center gap-4 sm:gap-6 flex-wrap" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
            <span className="text-[13px] font-medium shrink-0" style={{ color: "var(--text)" }}>{t("notices_title")}</span>
            {NOTICES.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[12px] sm:text-[12.5px]">
                  <Icon size={14} style={{ color: n.color }} />
                  <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{n.time}</span>
                  <span style={{ color: "var(--text-muted)" }}>{pick(n.th, n.en)}</span>
                </div>
              );
            })}
            <button onClick={() => goTo("alerts")} className="ml-auto flex items-center gap-1 text-[12.5px] shrink-0" style={{ color: "#3B82F6" }}>{t("notices_view_all")} <ChevronRight size={13} /></button>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Floating AI button */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed z-30 bottom-20 lg:bottom-6 right-5 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#3B82F6,#22C55E)", boxShadow: "0 8px 24px -6px rgba(59,130,246,0.6)" }}
        aria-label={t("ai_button_label")}
      >
        <Mic size={22} color="#fff" />
      </button>
      <AiAssistant devices={devices} setDeviceOn={setDeviceOn} machines={machines} setMachineStatus={setMachineStatus} open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t flex items-stretch" style={{ background: "var(--sidebar)", borderColor: "var(--border-strong)" }}>
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button key={tab.key} onClick={() => goTo(tab.key)} className="flex-1 flex flex-col items-center gap-0.5 py-2.5">
              <Icon size={18} style={{ color: isActive ? "#3B82F6" : "var(--text-dim)" }} />
              <span className="text-[10px]" style={{ color: isActive ? "#3B82F6" : "var(--text-dim)" }}>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
