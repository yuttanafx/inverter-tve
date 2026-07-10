// lib/tuyaServer.js
// ตัวช่วยฝั่งเซิร์ฟเวอร์สำหรับเซ็นลายเซ็นและยิง request ไปยัง Tuya OpenAPI (Cloud)
// ไฟล์นี้ถูก import จาก app/api/tuya/** เท่านั้น (Route Handler รันบนเซิร์ฟเวอร์/Vercel Function
// ไม่ถูกส่งไปรวมกับโค้ดฝั่ง client) จึงปลอดภัยที่จะถือ Access Secret ของผู้ใช้ระหว่างการประมวลผล request

import crypto from "crypto";

export const TUYA_REGIONS = {
  eu: "https://openapi.tuyaeu.com", // Central Europe
  us: "https://openapi.tuyaus.com", // Western America
  cn: "https://openapi.tuyacn.com", // China
  in: "https://openapi.tuyain.com", // India
};

function regionUrl(region) {
  return TUYA_REGIONS[region] || TUYA_REGIONS.eu;
}

function sha256Hex(str) {
  return crypto.createHash("sha256").update(str || "", "utf8").digest("hex");
}

function hmacSha256Upper(str, secret) {
  return crypto.createHmac("sha256", secret).update(str, "utf8").digest("hex").toUpperCase();
}

// Tuya "string to sign": METHOD \n Content-SHA256 \n Headers(ว่างไว้ ไม่ได้ใช้ signed headers) \n Path(รวม query)
function stringToSign(method, path, bodyStr) {
  return [method.toUpperCase(), sha256Hex(bodyStr || ""), "", path].join("\n");
}

// ขอ access_token — ไม่แคชข้าม request เพื่อความง่าย (serverless function สั้นๆ อยู่แล้ว)
// Tuya token มีอายุ ~2 ชม. หากต้องการลดจำนวนการขอ token สามารถแคชไว้ใน module scope ได้ในอนาคต
export async function getTuyaToken({ clientId, clientSecret, region }) {
  if (!clientId || !clientSecret) throw new Error("missing Tuya clientId/clientSecret");
  const base = regionUrl(region);
  const t = Date.now().toString();
  const path = "/v1.0/token?grant_type=1";
  const sts = stringToSign("GET", path, "");
  const sign = hmacSha256Upper(clientId + t + sts, clientSecret);

  const res = await fetch(base + path, {
    method: "GET",
    headers: { client_id: clientId, sign, t, sign_method: "HMAC-SHA256" },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.msg || "Tuya token request failed");
  return json.result.access_token;
}

// เรียก endpoint ทั่วไปของ Tuya ที่ต้องใช้ access_token (business API)
export async function tuyaRequest({ clientId, clientSecret, region }, method, path, body) {
  const base = regionUrl(region);
  const token = await getTuyaToken({ clientId, clientSecret, region });
  const t = Date.now().toString();
  const bodyStr = body ? JSON.stringify(body) : "";
  const sts = stringToSign(method, path, bodyStr);
  const sign = hmacSha256Upper(clientId + token + t + sts, clientSecret);

  const res = await fetch(base + path, {
    method,
    headers: {
      client_id: clientId,
      access_token: token,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      "Content-Type": "application/json",
    },
    body: bodyStr || undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.msg || `Tuya API error on ${path}`);
  return json.result;
}

// รายชื่ออุปกรณ์ทั้งหมดที่ผูกกับบัญชีแอป Tuya Smart/Smart Life (uid) — endpoint นี้คืนสถานะ (status) มาด้วยในตัว
export async function listTuyaDevices(config) {
  const uid = config.uid;
  if (!uid) throw new Error("missing Tuya uid");
  const result = await tuyaRequest(config, "GET", `/v1.0/users/${uid}/devices`);
  return Array.isArray(result) ? result : [];
}

// สถานะล่าสุดของอุปกรณ์ชิ้นเดียว (ใช้ตอนจะสั่งเปิด/ปิด เพื่อรู้ว่า DP code ของสวิตช์ชื่ออะไร)
export async function getTuyaDeviceStatus(config, deviceId) {
  const result = await tuyaRequest(config, "GET", `/v1.0/iot-03/devices/${deviceId}/status`);
  return Array.isArray(result) ? result : [];
}

// สั่งเปิด/ปิดสวิตช์ — เดายื่น DP code ที่ขึ้นต้นด้วย switch (switch_1, switch, switch_led, ...)
// โดยเช็คจาก /status ก่อนเผื่ออุปกรณ์แต่ละรุ่นใช้ code ไม่เหมือนกัน
export async function setTuyaSwitch(config, deviceId, on) {
  const status = await getTuyaDeviceStatus(config, deviceId);
  const switchDp = status.find((s) => typeof s.value === "boolean" && /^switch/i.test(s.code));
  const code = switchDp?.code || "switch_1";
  return tuyaRequest(config, "POST", `/v1.0/iot-03/devices/${deviceId}/commands`, {
    commands: [{ code, value: !!on }],
  });
}

// แปลง category ของ Tuya เป็น type ที่หน้า dashboard เรารู้จัก (ไอคอน)
const CATEGORY_TYPE_MAP = {
  dj: "light",
  dc: "light",
  fwd: "light",
  cz: "plug",
  pc: "plug",
  insert_sockets: "plug",
  fs: "fan",
  kt: "ac",
  ktkzq: "ac",
};

export function categoryToType(category) {
  return CATEGORY_TYPE_MAP[category] || "plug";
}

// หา DP (data point) ที่เป็นสวิตช์หลัก เพื่อบอกสถานะ เปิด/ปิด บนการ์ดอุปกรณ์
export function readSwitchValue(statusList) {
  if (!Array.isArray(statusList)) return false;
  const dp = statusList.find((s) => typeof s.value === "boolean" && /^switch/i.test(s.code));
  return !!dp?.value;
}

// หากำลังไฟที่ใช้อยู่ (ถ้าอุปกรณ์รองรับการวัดพลังงาน) — cur_power ของ Tuya มีหน่วยเป็น 0.1W
export function readWatt(statusList) {
  if (!Array.isArray(statusList)) return "";
  const dp = statusList.find((s) => s.code === "cur_power");
  if (!dp || typeof dp.value !== "number") return "";
  return `${(dp.value / 10).toFixed(dp.value % 10 === 0 ? 0 : 1)}W`;
}
