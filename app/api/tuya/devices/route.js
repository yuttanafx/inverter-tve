// app/api/tuya/devices/route.js
// รันบนเซิร์ฟเวอร์ (Vercel Function) เท่านั้น — รับ credential ของ Tuya มาจาก header ที่ฝั่ง client ส่งมา
// (ยิงมาจาก origin เดียวกัน ไม่ใช่การส่ง secret ออกไปที่อื่น) แล้วค่อยเซ็น request ไปหา Tuya จริงจากตรงนี้

import { NextResponse } from "next/server";
import { listTuyaDevices, categoryToType, readSwitchValue, readWatt } from "@/lib/tuyaServer";

function configFromHeaders(req) {
  return {
    clientId: req.headers.get("x-tuya-client-id") || "",
    clientSecret: req.headers.get("x-tuya-client-secret") || "",
    uid: req.headers.get("x-tuya-uid") || "",
    region: req.headers.get("x-tuya-region") || "sg",
  };
}

export async function GET(req) {
  const config = configFromHeaders(req);
  if (!config.clientId || !config.clientSecret || !config.uid) {
    return NextResponse.json({ error: "missing Tuya credentials" }, { status: 400 });
  }

  try {
    const raw = await listTuyaDevices(config);
    const devices = raw.map((d) => ({
      id: d.id,
      th: d.custom_name || d.name,
      en: d.custom_name || d.name,
      room: d.room_name || "Tuya",
      on: readSwitchValue(d.status),
      watt: readWatt(d.status),
      type: categoryToType(d.category),
      online: !!d.online,
    }));
    return NextResponse.json(devices, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Tuya request failed" }, { status: 502 });
  }
}
