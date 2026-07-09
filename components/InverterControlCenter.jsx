"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, LayoutGrid, DoorOpen, Clock, Sliders, Factory, GitBranch, Zap,
  Bell, Cpu, BatteryCharging, BarChart3, Settings, User, Code2, Menu, X,
  Maximize2, ChevronDown, ChevronRight, Sun, CloudSun, DollarSign,
  Play, Square, CheckCircle2, AlertTriangle, Info, Wifi, Lightbulb,
  Thermometer, Tv, Plug, Wind, Cog, Flame, MoveHorizontal, Mic, Send,
  Sparkles, TrendingUp, ShieldAlert,
} from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceDot,
} from "recharts";

// ---------------------------------------------------------------------------
// tokens: bg #0A1120 panel #121B2E line rgba(255,255,255,.06)
// text #EAF0F8 muted #7C8AA0
// blue #3B82F6 green #22C55E purple #A78BFA gold #F0B429 red #F0475C
// ---------------------------------------------------------------------------

const NAV = [
  { section: null, items: [{ key: "overview", label: "ภาพรวม", icon: Home }] },
  {
    section: "ควบคุมบ้าน",
    items: [
      { key: "devices", label: "อุปกรณ์ทั้งหมด", icon: LayoutGrid },
      { key: "rooms", label: "ห้องต่างๆ", icon: DoorOpen },
      { key: "schedule", label: "การตั้งเวลา", icon: Clock },
      { key: "modes", label: "โหมดการทำงาน", icon: Sliders },
    ],
  },
  {
    section: "ควบคุมโรงงาน",
    items: [
      { key: "machines", label: "เครื่องจักรทั้งหมด", icon: Factory },
      { key: "lines", label: "ไลน์การผลิต", icon: GitBranch },
      { key: "factoryPower", label: "พลังงานโรงงาน", icon: Zap },
      { key: "alerts", label: "การแจ้งเตือน", icon: Bell },
    ],
  },
  {
    section: "ระบบ",
    items: [
      { key: "inverter", label: "อินเวอร์เตอร์", icon: Cpu },
      { key: "battery", label: "แบตเตอรี่", icon: BatteryCharging },
      { key: "reports", label: "รายงานพลังงาน", icon: BarChart3 },
      { key: "settings", label: "ตั้งค่า", icon: Settings },
      { key: "users", label: "ผู้ใช้งาน", icon: User },
    ],
  },
];

const MOBILE_TABS = [
  { key: "overview", label: "ภาพรวม", icon: Home },
  { key: "devices", label: "อุปกรณ์", icon: LayoutGrid },
  { key: "machines", label: "เครื่องจักร", icon: Factory },
  { key: "alerts", label: "แจ้งเตือน", icon: Bell },
];

const ROOM_TABS = ["ทั้งหมด", "ห้องนั่งเล่น", "ห้องนอน", "ห้องครัว", "ห้องน้ำ", "โรงรถ"];

const DEVICES = [
  { id: "d1", name: "ไฟเพดาน", room: "ห้องนั่งเล่น", icon: Lightbulb, on: true, watt: "80W" },
  { id: "d2", name: "แอร์", room: "ห้องนั่งเล่น", icon: Thermometer, on: true, watt: "1,200W" },
  { id: "d3", name: "ทีวี", room: "ห้องนั่งเล่น", icon: Tv, on: true, watt: "60W" },
  { id: "d4", name: "ปลั๊กไฟ", room: "ห้องนั่งเล่น", icon: Plug, on: false, watt: "120W" },
  { id: "d5", name: "โคมไฟหัวเตียง", room: "ห้องนอน", icon: Lightbulb, on: true, watt: "15W" },
  { id: "d6", name: "แอร์ห้องนอน", room: "ห้องนอน", icon: Thermometer, on: false, watt: "900W" },
  { id: "d7", name: "เตาไฟฟ้า", room: "ห้องครัว", icon: Plug, on: true, watt: "1,500W" },
  { id: "d8", name: "ไฟโรงรถ", room: "โรงรถ", icon: Lightbulb, on: false, watt: "40W" },
];

const LINE_TABS = ["ทั้งหมด", "ไลน์ผลิต 1", "ไลน์ผลิต 2", "ไลน์ผลิต 3"];

const MACHINES = [
  { id: "m1", name: "เครื่องอัดอากาศ 3", line: "ไลน์ผลิต 1", icon: Wind, kw: "7.5 kW", status: "on" },
  { id: "m2", name: "เครื่องปั๊มน้ำ 2", line: "ไลน์ผลิต 1", icon: Cog, kw: "5.5 kW", status: "on" },
  { id: "m3", name: "เครื่องเชื่อม 3", line: "ไลน์ผลิต 2", icon: Flame, kw: "6.0 kW", status: "off" },
  { id: "m4", name: "สายพานลำเลียง 3", line: "ไลน์ผลิต 3", icon: MoveHorizontal, kw: "3.0 kW", status: "on" },
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
  { id: "a1", severity: "high", icon: AlertTriangle, color: "#F0475C", title: "ใช้ไฟพุ่งสูงผิดปกติ", desc: "ห้องครัว: 1,500W ต่อเนื่อง 45 นาที (ปกติไม่เกิน 20 นาที)", time: "14:20" },
  { id: "a2", severity: "medium", icon: Clock, color: "#F0B429", title: "อุปกรณ์ทำงานนอกเวลาปกติ", desc: "แอร์ห้องนอนเปิดตอนตี 3 ซึ่งไม่ตรงกับรูปแบบการใช้งานปกติ", time: "03:10" },
  { id: "a3", severity: "low", icon: Info, color: "#3B82F6", title: "ประสิทธิภาพแผงโซลาร์ลดลง", desc: "ผลผลิตต่ำกว่าค่าเฉลี่ย 12% เทียบกับสภาพอากาศเดียวกัน", time: "วันนี้" },
];

const NOTICES = [
  { icon: CheckCircle2, color: "#22C55E", time: "10:30", text: "อินเวอร์เตอร์ทำงานปกติ" },
  { icon: AlertTriangle, color: "#F0B429", time: "09:15", text: "แบตเตอรี่ใกล้จะเต็ม" },
  { icon: Info, color: "#3B82F6", time: "08:45", text: "ตั้งเวลาการทำงานสำเร็จ" },
];

function StatCard({ icon: Icon, iconBg, label, value, unit, delta, up }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={19} color="#fff" />
        </div>
        <span className="text-[12.5px] leading-tight" style={{ color: "#8593A8" }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-[24px] font-semibold" style={{ color: "#EAF0F8", fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
        <span className="text-[13px]" style={{ color: "#8593A8" }}>{unit}</span>
      </div>
      <div className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: up ? "#22C55E" : "#F0475C" }}>
        {up ? "↑" : "↓"} {delta} จากเมื่อวาน
      </div>
    </div>
  );
}

function FlowNode({ icon: Icon, label, sub, tint }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border" style={{ background: "#0E1626", borderColor: tint }}>
        <Icon size={22} style={{ color: tint }} />
      </div>
      <div>
        <p className="text-[11.5px] sm:text-[12px] font-medium" style={{ color: "#EAF0F8" }}>{label}</p>
        {sub && <p className="text-[10.5px] sm:text-[11px]" style={{ color: "#8593A8", fontFamily: "'JetBrains Mono', monospace" }}>{sub}</p>}
      </div>
    </div>
  );
}

function EnergyFlow() {
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
          <FlowNode icon={Sun} label="โซลาร์เซลล์" sub="5.2 kW" tint="#3B82F6" />
          <FlowNode icon={BatteryCharging} label="แบตเตอรี่" sub="80% · 2.8 kW" tint="#3B82F6" />
        </div>
        <div className="flex flex-col items-center justify-start">
          <FlowNode icon={Cpu} label="อินเวอร์เตอร์" sub="● ทำงานปกติ" tint="#22C55E" />
        </div>
        <div className="flex flex-col items-end gap-8 sm:gap-10">
          <FlowNode icon={Zap} label="การไฟฟ้า" sub="1.2 kW" tint="#22C55E" />
          <FlowNode icon={Home} label="โหลดในบ้าน" sub="4.0 kW" tint="#22C55E" />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border px-3 py-2 text-[12px]" style={{ background: "#0E1626", borderColor: "rgba(255,255,255,0.1)" }}>
      <p style={{ color: "#8593A8" }} className="mb-1">{label}</p>
      {payload.map((p) => (<p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}{p.dataKey === "battery" ? "%" : " kW"}</p>))}
    </div>
  );
}

function DeviceTile({ d, onToggle }) {
  const Icon = d.icon;
  return (
    <div className="rounded-xl p-3.5 border" style={{ background: "#0E1626", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: d.on ? "rgba(59,130,246,0.16)" : "rgba(255,255,255,0.05)" }}>
          <Icon size={17} style={{ color: d.on ? "#3B82F6" : "#5C6B80" }} />
        </div>
        <button onClick={() => onToggle(d.id)} className="w-9 h-5 rounded-full relative shrink-0" style={{ background: d.on ? "#3B82F6" : "rgba(255,255,255,0.1)" }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: d.on ? "18px" : "2px" }} />
        </button>
      </div>
      <p className="text-[13px] font-medium" style={{ color: "#EAF0F8" }}>{d.name}</p>
      <p className="text-[11px] mb-1" style={{ color: "#5C6B80" }}>{d.room}</p>
      <p className="text-[12px] tabular-nums" style={{ color: "#8593A8", fontFamily: "'JetBrains Mono', monospace" }}>{d.watt}</p>
    </div>
  );
}

function MachineRow({ m, onToggle }) {
  const Icon = m.icon;
  const on = m.status === "on";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: on ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.05)" }}>
        <Icon size={16} style={{ color: on ? "#22C55E" : "#5C6B80" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium truncate" style={{ color: "#EAF0F8" }}>{m.name}</p>
        <p className="text-[11px]" style={{ color: "#5C6B80", fontFamily: "'JetBrains Mono', monospace" }}>{m.kw}</p>
      </div>
      <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full shrink-0" style={{ color: on ? "#22C55E" : "#F0475C", background: on ? "rgba(34,197,94,0.1)" : "rgba(240,71,92,0.1)" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: on ? "#22C55E" : "#F0475C" }} /> {on ? "ทำงาน" : "หยุด"}
      </span>
      <button onClick={() => onToggle(m.id)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: on ? "#22C55E" : "#F0475C" }}>
        {on ? <Play size={12} fill="#0A1120" color="#0A1120" /> : <Square size={11} fill="#0A1120" color="#0A1120" />}
      </button>
    </div>
  );
}

function AnomalyCard({ a }) {
  const Icon = a.icon;
  return (
    <div className="rounded-xl p-3 border-l-4 flex items-start gap-3" style={{ background: "#0E1626", borderColor: a.color }}>
      <Icon size={16} style={{ color: a.color }} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12.5px] font-medium" style={{ color: "#EAF0F8" }}>{a.title}</p>
          <span className="text-[10.5px] shrink-0" style={{ color: "#5C6B80", fontFamily: "'JetBrains Mono', monospace" }}>{a.time}</span>
        </div>
        <p className="text-[11.5px] mt-0.5" style={{ color: "#8593A8" }}>{a.desc}</p>
      </div>
    </div>
  );
}

// ---- AI console: text + voice command hook -------------------------------
function useSpeechRecognition(onResult) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.lang = "th-TH";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => onResult(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
  }, [onResult]);

  const start = () => {
    if (!recRef.current) return;
    setListening(true);
    try { recRef.current.start(); } catch (e) { setListening(false); }
  };
  const stop = () => { recRef.current?.stop(); setListening(false); };

  return { supported, listening, start, stop };
}

function AiAssistant({ devices, setDevices, machines, setMachines, open, onClose }) {
  const [log, setLog] = useState([
    { who: "ai", text: "สวัสดีครับ ผมคือผู้ช่วย AI — สั่งงานด้วยเสียงหรือพิมพ์ได้เลย เช่น “เปิดไฟห้องนั่งเล่น” หรือ “มีอะไรผิดปกติไหม”" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);

  const run = (raw) => {
    const text = raw.trim();
    if (!text) return;
    setLog((l) => [...l, { who: "user", text }]);

    const wantOn = text.includes("เปิด");
    const wantOff = text.includes("ปิด");
    const askAnomaly = text.includes("ผิดปกติ") || text.includes("แจ้งเตือน");
    const target = devices.find((d) => text.includes(d.name) || text.includes(d.room))
      || machines.find((m) => text.includes(m.name));

    setTimeout(() => {
      if (askAnomaly) {
        const top = ANOMALIES[0];
        setLog((l) => [...l, { who: "ai", text: `พบ ${ANOMALIES.length} ความผิดปกติ ล่าสุด: ${top.title} — ${top.desc}` }]);
        return;
      }
      if ((wantOn || wantOff) && target) {
        if (devices.includes(target)) {
          setDevices((ds) => ds.map((d) => (d.id === target.id ? { ...d, on: wantOn } : d)));
        } else {
          setMachines((ms) => ms.map((m) => (m.id === target.id ? { ...m, status: wantOn ? "on" : "off" } : m)));
        }
        setLog((l) => [...l, { who: "ai", text: `${wantOn ? "เปิด" : "ปิด"}ใช้งาน “${target.name}” เรียบร้อยแล้ว` }]);
      } else if (wantOn || wantOff) {
        setLog((l) => [...l, { who: "ai", text: "ไม่พบอุปกรณ์ที่ตรงกับคำสั่ง ลองระบุชื่ออุปกรณ์หรือห้องให้ชัดเจนขึ้น" }]);
      } else {
        setLog((l) => [...l, { who: "ai", text: "รับทราบคำสั่ง — จุดนี้คือตำแหน่งที่จะเชื่อมต่อโมเดล AI จริงในอนาคต" }]);
      }
    }, 400);
  };

  const { supported, listening, start, stop } = useSpeechRecognition((transcript) => run(transcript));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(3,5,8,0.7)", backdropFilter: "blur(3px)" }}>
      <div className="w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl border flex flex-col" style={{ background: "rgba(14,19,27,0.96)", backdropFilter: "blur(16px)", borderColor: "rgba(59,130,246,0.3)", maxHeight: "80vh" }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#3B82F6", animation: "pulseRing 2.2s ease-out infinite" }} />
              <Sparkles size={13} style={{ color: "#EAF0F8" }} className="relative" />
            </div>
            <span className="text-[13px] font-medium" style={{ color: "#EAF0F8" }}>ผู้ช่วย AI</span>
          </div>
          <button onClick={onClose} style={{ color: "#8593A8" }}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 min-h-[140px]">
          {log.map((m, i) => (
            <div key={i} className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className="text-[12.5px] leading-snug px-3 py-2 rounded-xl max-w-[85%]"
                style={{
                  background: m.who === "user" ? "#3B82F6" : "#0E1626",
                  color: m.who === "user" ? "#fff" : "#DCE4EF",
                }}
              >
                {m.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {!supported && (
          <p className="px-4 text-[11px] pb-1" style={{ color: "#F0B429" }}>เบราว์เซอร์นี้ยังไม่รองรับคำสั่งเสียง ใช้การพิมพ์แทนได้</p>
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
          <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border" style={{ background: "rgba(6,8,11,0.7)", borderColor: "rgba(120,150,180,0.2)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { run(input); setInput(""); } }}
              placeholder={listening ? "กำลังฟัง…" : "พิมพ์คำสั่ง เช่น เปิดแอร์ห้องนอน"}
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: "#EAF0F8" }}
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
  const [navOpen, setNavOpen] = useState(false);
  const [active, setActive] = useState("overview");
  const [roomTab, setRoomTab] = useState("ห้องนั่งเล่น");
  const [lineTab, setLineTab] = useState("ทั้งหมด");
  const [range, setRange] = useState("วัน");
  const [devices, setDevices] = useState(DEVICES);
  const [machines, setMachines] = useState(MACHINES);
  const [aiOpen, setAiOpen] = useState(false);

  const toggleDevice = (id) => setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, on: !d.on } : d)));
  const toggleMachine = (id) => setMachines((ms) => ms.map((m) => (m.id === id ? { ...m, status: m.status === "on" ? "off" : "on" } : m)));

  const filteredDevices = useMemo(() => (roomTab === "ทั้งหมด" ? devices : devices.filter((d) => d.room === roomTab)), [devices, roomTab]);
  const filteredMachines = useMemo(() => (lineTab === "ทั้งหมด" ? machines : machines.filter((m) => m.line === lineTab)), [machines, lineTab]);

  return (
    <div className="min-h-screen w-full flex" style={{ background: "#0A1120", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulseRing { 0% { transform: scale(0.6); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
      `}</style>

      {/* Mobile drawer backdrop */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setNavOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto transition-transform duration-200 border-r flex flex-col
          ${navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "#0D1526", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3B82F6,#22C55E)" }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <div className="leading-none">
              <p className="text-[13px] font-semibold tracking-wide" style={{ color: "#EAF0F8" }}>INVERTER</p>
              <p className="text-[9.5px] tracking-widest" style={{ color: "#5C6B80" }}>CONTROL CENTER</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setNavOpen(false)} style={{ color: "#8593A8" }}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.section && <p className="px-3 mb-1.5 text-[10.5px] tracking-widest uppercase" style={{ color: "#3E4A5E" }}>{group.section}</p>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActive(item.key); setNavOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] transition-colors"
                    style={{ background: isActive ? "rgba(59,130,246,0.14)" : "transparent", color: isActive ? "#3B82F6" : "#8593A8" }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mx-3 mb-4 rounded-xl p-3.5 border flex items-center gap-2.5" style={{ borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.08)" }}>
          <Code2 size={16} style={{ color: "#3B82F6" }} />
          <div className="leading-tight">
            <p className="text-[11.5px] font-medium" style={{ color: "#EAF0F8" }}>API DOCUMENTATION</p>
            <p className="text-[10.5px]" style={{ color: "#5C6B80" }}>เชื่อมต่อและจัดการผ่าน API</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setNavOpen(true)} className="lg:hidden" style={{ color: "#8593A8" }}><Menu size={20} /></button>
          <span className="hidden lg:block text-[13px]" style={{ color: "#5C6B80" }} />
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-1.5 text-[13px]" style={{ color: "#EAF0F8" }}>
              <CloudSun size={18} style={{ color: "#F0B429" }} /> 32°C <span style={{ color: "#5C6B80" }}>แดดออก</span>
            </div>
            <button className="relative" style={{ color: "#8593A8" }}>
              <Bell size={18} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center" style={{ background: "#F0475C", color: "#fff" }}>3</span>
            </button>
            <Maximize2 size={18} className="hidden sm:block" style={{ color: "#8593A8" }} />
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3B82F6,#A78BFA)" }}>
                <User size={15} color="#fff" />
              </div>
              <div className="leading-tight hidden sm:block">
                <p className="text-[12.5px] font-medium" style={{ color: "#EAF0F8" }}>Admin</p>
                <p className="text-[10.5px]" style={{ color: "#5C6B80" }}>ผู้ดูแลระบบ</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block" style={{ color: "#5C6B80" }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 pb-24 lg:pb-6">
          <h1 className="text-[21px] sm:text-[24px] font-semibold" style={{ color: "#EAF0F8", fontFamily: "'Space Grotesk', sans-serif" }}>ภาพรวมระบบ</h1>
          <p className="text-[12.5px] sm:text-[13px] mb-5" style={{ color: "#5C6B80" }}>ตรวจสอบและควบคุมระบบไฟฟ้าผ่าน API อินเวอร์เตอร์</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            <StatCard icon={Sun} iconBg="linear-gradient(135deg,#3B82F6,#1D4ED8)" label="พลังงานผลิตวันนี้" value="45.6" unit="kWh" delta="12.5%" up />
            <StatCard icon={BatteryCharging} iconBg="linear-gradient(135deg,#22C55E,#15803D)" label="พลังงานใช้วันนี้" value="28.3" unit="kWh" delta="8.3%" up={false} />
            <StatCard icon={Zap} iconBg="linear-gradient(135deg,#A78BFA,#7C3AED)" label="พลังงานส่งออก" value="17.3" unit="kWh" delta="15.7%" up />
            <StatCard icon={DollarSign} iconBg="linear-gradient(135deg,#F0B429,#D97706)" label="ประหยัดค่าไฟวันนี้" value="฿156.75" unit="" delta="10.2%" up />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-4 mb-5">
            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="text-[14px] font-medium mb-4" style={{ color: "#EAF0F8" }}>สถานะพลังงานแบบเรียลไทม์</h2>
              <EnergyFlow />
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-[14px] font-medium" style={{ color: "#EAF0F8" }}>กราฟพลังงาน</h2>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {["วัน", "สัปดาห์", "เดือน", "ปี"].map((r) => (
                    <button key={r} onClick={() => setRange(r)} className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px]" style={{ background: range === r ? "#3B82F6" : "transparent", color: range === r ? "#fff" : "#8593A8" }}>{r}</button>
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
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "#5C6B80", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                  <YAxis yAxisId="kw" tick={{ fill: "#5C6B80", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fill: "#5C6B80", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="top" align="right" height={28} formatter={(v) => <span style={{ color: "#8593A8", fontSize: 11 }}>{v}</span>} />
                  <Area yAxisId="kw" type="monotone" dataKey="produced" name="ผลิต" stroke="#22C55E" fill="url(#prodFill)" strokeWidth={2} />
                  <Line yAxisId="kw" type="monotone" dataKey="used" name="ใช้" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line yAxisId="kw" type="monotone" dataKey="exported" name="ส่งออก" stroke="#A78BFA" strokeWidth={2} dot={false} />
                  <Line yAxisId="pct" type="monotone" dataKey="battery" name="แบตเตอรี่ (%)" stroke="#F0B429" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="text-[14px] font-medium mb-3" style={{ color: "#EAF0F8" }}>ควบคุมอุปกรณ์ในบ้าน</h2>
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {ROOM_TABS.map((r) => (
                  <button key={r} onClick={() => setRoomTab(r)} className="px-2.5 py-1 rounded-full text-[11.5px] whitespace-nowrap shrink-0" style={{ background: roomTab === r ? "#3B82F6" : "rgba(255,255,255,0.05)", color: roomTab === r ? "#fff" : "#8593A8" }}>{r}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {filteredDevices.map((d) => <DeviceTile key={d.id} d={d} onToggle={toggleDevice} />)}
              </div>
              <button className="w-full flex items-center justify-center gap-1 text-[12.5px] py-2 rounded-lg" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)" }}>ดูอุปกรณ์ทั้งหมด <ChevronRight size={13} /></button>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="text-[14px] font-medium mb-3" style={{ color: "#EAF0F8" }}>ควบคุมเครื่องจักรในโรงงาน</h2>
              <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                {LINE_TABS.map((l) => (
                  <button key={l} onClick={() => setLineTab(l)} className="px-2.5 py-1 rounded-full text-[11.5px] whitespace-nowrap shrink-0" style={{ background: lineTab === l ? "#3B82F6" : "rgba(255,255,255,0.05)", color: lineTab === l ? "#fff" : "#8593A8" }}>{l}</button>
                ))}
              </div>
              <div className="mb-2">{filteredMachines.map((m) => <MachineRow key={m.id} m={m} onToggle={toggleMachine} />)}</div>
              <button className="w-full flex items-center justify-center gap-1 text-[12.5px] py-2 rounded-lg" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)" }}>ดูเครื่องจักรทั้งหมด <ChevronRight size={13} /></button>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="text-[14px] font-medium mb-3" style={{ color: "#EAF0F8" }}>สถานะอินเวอร์เตอร์และระบบ</h2>
              <div className="rounded-xl p-4 mb-3 flex items-center justify-center" style={{ background: "#0E1626" }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3B82F6,#22C55E)" }}><Cpu size={28} color="#fff" /></div>
              </div>
              <dl className="space-y-2 text-[12.5px]">
                {[["รุ่น", "MAX 10KTL3-X"], ["สถานะ", "● ทำงานปกติ", "#22C55E"], ["กำลังไฟฟ้า", "5.2 kW"], ["แรงดันไฟฟ้า", "230 V"], ["ความถี่", "50.0 Hz"], ["อุณหภูมิ", "32°C"], ["Wi-Fi", "● เชื่อมต่อแล้ว", "#3B82F6"], ["อัปเดตล่าสุด", "10:30:45"]].map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt style={{ color: "#5C6B80" }}>{k}</dt>
                    <dd style={{ color: c || "#EAF0F8", fontFamily: "'JetBrains Mono', monospace" }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <button className="w-full flex items-center justify-center gap-1 text-[12.5px] py-2 rounded-lg mt-3" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.08)" }}>ดูรายละเอียดเพิ่มเติม <ChevronRight size={13} /></button>
            </div>
          </div>

          {/* Usage behavior & anomaly detection */}
          <div className="rounded-2xl p-4 sm:p-5 border mb-5" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} style={{ color: "#F0475C" }} />
              <h2 className="text-[14px] font-medium" style={{ color: "#EAF0F8" }}>พฤติกรรมการใช้ไฟ &amp; AI ตรวจจับความผิดปกติ</h2>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full ml-auto" style={{ color: "#F0475C", background: "rgba(240,71,92,0.12)" }}>{ANOMALIES.length} รายการ</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-[11.5px]" style={{ color: "#5C6B80" }}>
                  <TrendingUp size={13} /> การใช้ไฟจริง เทียบกับช่วงปกติที่ AI เรียนรู้ไว้
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={ANOMALY_CHART} margin={{ left: -18, right: 8, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: "#5C6B80", fontSize: 9.5 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                    <YAxis tick={{ fill: "#5C6B80", fontSize: 9.5 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="hi" stroke="none" fill="url(#bandFill)" name="ช่วงปกติ (สูงสุด)" />
                    <Area type="monotone" dataKey="lo" stroke="none" fill="#0A1120" fillOpacity={1} name="ช่วงปกติ (ต่ำสุด)" />
                    <Line type="monotone" dataKey="actual" name="ใช้จริง" stroke="#F0475C" strokeWidth={2} dot={false} />
                    <ReferenceDot x="14:00" y={9.8} r={5} fill="#F0475C" stroke="#0A1120" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {ANOMALIES.map((a) => <AnomalyCard key={a.id} a={a} />)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 border flex items-center gap-4 sm:gap-6 flex-wrap" style={{ background: "#121B2E", borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-[13px] font-medium shrink-0" style={{ color: "#EAF0F8" }}>การแจ้งเตือนล่าสุด</span>
            {NOTICES.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[12px] sm:text-[12.5px]">
                  <Icon size={14} style={{ color: n.color }} />
                  <span style={{ color: "#5C6B80", fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</span>
                  <span style={{ color: "#8593A8" }}>{n.text}</span>
                </div>
              );
            })}
            <button className="ml-auto flex items-center gap-1 text-[12.5px] shrink-0" style={{ color: "#3B82F6" }}>ดูทั้งหมด <ChevronRight size={13} /></button>
          </div>
        </div>
      </div>

      {/* Floating AI button */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed z-30 bottom-20 lg:bottom-6 right-5 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#3B82F6,#22C55E)", boxShadow: "0 8px 24px -6px rgba(59,130,246,0.6)" }}
        aria-label="เปิดผู้ช่วย AI"
      >
        <Mic size={22} color="#fff" />
      </button>
      <AiAssistant devices={devices} setDevices={setDevices} machines={machines} setMachines={setMachines} open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t flex items-stretch" style={{ background: "#0D1526", borderColor: "rgba(255,255,255,0.08)" }}>
        {MOBILE_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button key={t.key} onClick={() => setActive(t.key)} className="flex-1 flex flex-col items-center gap-0.5 py-2.5">
              <Icon size={18} style={{ color: isActive ? "#3B82F6" : "#5C6B80" }} />
              <span className="text-[10px]" style={{ color: isActive ? "#3B82F6" : "#5C6B80" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
