# Inverter Control Center — Next.js

แดชบอร์ดควบคุมพลังงาน (บ้าน/โรงงาน) + สถานะอินเวอร์เตอร์ + ผู้ช่วย AI (ข้อความ/เสียง)

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

## โครงสร้างไฟล์

```
app/
  layout.jsx        ← root layout, โหลด globals.css
  page.jsx           ← หน้าแรก เรียกใช้ InverterControlCenter
  globals.css         ← Tailwind directives
components/
  InverterControlCenter.jsx  ← คอมโพเนนต์หลักทั้งหมด (client component)
```

## ฟีเจอร์ที่เพิ่มเข้ามา

- **โหมดกลางวัน/กลางคืน** — สลับด้วยปุ่มดวงอาทิตย์/ดวงจันทร์ที่มุมบน จำค่าไว้ในเบราว์เซอร์ (`lib/theme.jsx`)
- **2 ภาษา (ไทย/อังกฤษ)** — สลับด้วยปุ่ม TH/EN ที่มุมบน ข้อความ UI ทั้งหมดแปลผ่าน `lib/i18n.jsx`
- **เชื่อมต่อ API เครื่องอินเวอร์เตอร์ของผู้ใช้เอง** — ไปที่เมนู "ตั้งค่า" เพื่อกรอก URL/Key ของอุปกรณ์ตัวเอง ค่าจะถูกบันทึกในเบราว์เซอร์ของผู้ใช้คนนั้นเท่านั้น (`localStorage`) ทำให้แต่ละคน/แต่ละบ้านใช้เว็บเดียวกันแต่ดึงข้อมูลจากเครื่องของตัวเองได้ (`lib/apiConfig.jsx`, `lib/useInverterData.js`)
  - ถ้ายังไม่ตั้งค่า หรือเชื่อมต่อไม่ได้ จะ fallback ไปแสดงข้อมูลตัวอย่าง (โหมดสาธิต) โดยอัตโนมัติ พร้อม badge บอกสถานะที่หน้าแรก
  - เมื่อเชื่อมต่อสำเร็จ ระบบจะดึงข้อมูลซ้ำอัตโนมัติทุก 15 วินาที และการกดเปิด/ปิดอุปกรณ์บนแดชบอร์ดจะยิงคำสั่งไปที่ API จริงทันที (optimistic update — ถ้าคำสั่งล้มเหลวจะย้อนสถานะกลับให้)

### API contract ที่แดชบอร์ดคาดหวัง

| Method | Endpoint | ใช้ทำอะไร | Body |
|---|---|---|---|
| GET | `{url}/status` | สถานะอินเวอร์เตอร์ | — |
| GET | `{url}/devices` | รายการอุปกรณ์ในบ้าน | — |
| GET | `{url}/machines` | รายการเครื่องจักรในโรงงาน | — |
| PATCH | `{url}/devices/{id}` | เปิด/ปิดอุปกรณ์ | `{ "on": true }` |
| PATCH | `{url}/machines/{id}` | เปิด/ปิดเครื่องจักร | `{ "status": "on" }` |

ถ้ามีการตั้งค่า API Key ไว้ในหน้า "ตั้งค่า" ระบบจะแนบ header `Authorization: Bearer {key}` ไปด้วยทุกครั้ง

ตัวอย่างข้อมูลที่ `GET {url}/status` ควรตอบกลับ:
```json
{
  "model": "MAX 10KTL3-X",
  "statusOk": true,
  "power": "5.2 kW",
  "voltage": "230 V",
  "freq": "50.0 Hz",
  "temp": "32°C",
  "wifiOk": true,
  "updatedAt": "10:30:45"
}
```

ตัวอย่างข้อมูลที่ `GET {url}/devices` ควรตอบกลับ (แต่ละชิ้นในอาเรย์):
```json
{
  "id": "d1",
  "th": "ไฟเพดาน",
  "en": "Ceiling Light",
  "room": "ห้องนั่งเล่น",
  "on": true,
  "watt": "80W",
  "type": "light"
}
```
`type` ใช้เลือกไอคอน รองรับ: `light`, `ac`, `tv`, `plug`, `fan` (ถ้าไม่ระบุหรือไม่ตรง จะใช้ไอคอนปลั๊กไฟเป็นค่าเริ่มต้น)

ตัวอย่างข้อมูลที่ `GET {url}/machines` ควรตอบกลับ:
```json
{
  "id": "m1",
  "th": "เครื่องอัดอากาศ 3",
  "en": "Air Compressor 3",
  "line": "ไลน์ผลิต 1",
  "status": "on",
  "kw": "7.5 kW",
  "type": "compressor"
}
```
`type` รองรับ: `compressor`, `pump`, `welder`, `conveyor` (ถ้าไม่ระบุ จะใช้ไอคอนเฟืองเป็นค่าเริ่มต้น)

หมายเหตุ: ค่า `room` และ `line` ที่ส่งกลับมาควรตรงกับชื่อแท็บกรองที่มีอยู่แล้วในแดชบอร์ด (เช่น `"ห้องนั่งเล่น"`, `"ไลน์ผลิต 1"`) ไม่งั้นอุปกรณ์นั้นจะไม่ถูกกรองเข้าแท็บที่ถูกต้อง — ถ้าต้องการเพิ่มห้อง/ไลน์ใหม่ ให้แก้ `ROOM_TABS` / `LINE_TABS` ใน `components/InverterControlCenter.jsx` ด้วย
- **พื้นหลังอนิเมชั่นเบาๆ** — บล็อบไล่สีลอยตัวช้าๆ ด้วย CSS transform (ไม่ใช้ canvas/JS animation loop จึงเบามาก) เคารพ `prefers-reduced-motion` (`components/AnimatedBackground.jsx`)
- **ฟอนต์โหลดผ่าน `next/font`** แทน `@import` เดิม — self-host อัตโนมัติ ลด request ภายนอก และไม่มี layout shift ตอนโหลดฟอนต์ (เพิ่มความเร็วหน้าเว็บ)
- **เชื่อมต่อสวิตช์/ปลั๊กไวไฟ Tuya (Tuya Smart / Smart Life)** — ไปที่เมนู "ตั้งค่า" หัวข้อ "เชื่อมต่ออุปกรณ์ Tuya" เพื่อกรอก Access ID / Access Secret / UID / ภูมิภาค อุปกรณ์ Tuya ที่จับคู่ไว้จะมาแสดงในรายการอุปกรณ์ พร้อมสั่งเปิด/ปิดได้จริงจากแดชบอร์ด (`lib/tuyaServer.js`, `app/api/tuya/**`, `lib/useInverterData.js`)

### การเชื่อมต่อ Tuya (สวิตช์/ปลั๊กไวไฟ)

1. สมัคร [iot.tuya.com](https://iot.tuya.com) แล้วสร้าง **Cloud Project** (เลือก Data Center ให้ตรงกับที่ใช้ในแอป Tuya Smart / Smart Life ของคุณ)
2. จะได้ **Access ID (Client ID)** และ **Access Secret** จากหน้า Cloud > Project
3. ไปที่แท็บ **Devices > Link Tuya App Account** เพื่อผูกบัญชีแอปที่จับคู่สวิตช์/ปลั๊กไว้เข้ากับ Cloud Project แล้วจะได้ **UID** มา
4. กรอกค่าทั้งหมด (Access ID, Access Secret, UID, ภูมิภาค) ที่หน้า "ตั้งค่า" ของแดชบอร์ด แล้วกด "บันทึกและเชื่อมต่อ"
5. อุปกรณ์ Tuya จะปรากฏในรายการอุปกรณ์ (ดึงข้อมูลซ้ำทุก 15 วินาทีเหมือนอุปกรณ์อื่น) กดปุ่มเปิด/ปิดบนแดชบอร์ดได้ทันที

**สถาปัตยกรรม:** ฝั่ง client จะยิงไปที่ `/api/tuya/devices` และ `/api/tuya/devices/{id}` ของเว็บนี้เอง (same-origin) โดยส่ง Access ID/Secret ผ่าน header เท่านั้น จากนั้น Route Handler (`app/api/tuya/**`, รันบน Vercel Function ฝั่งเซิร์ฟเวอร์) จะเป็นผู้เซ็นลายเซ็น HMAC-SHA256 และเรียก Tuya OpenAPI จริงให้ — Access Secret จึงไม่ถูกส่งออกไปยังบุคคลที่สามใดๆ นอกจาก Tuya เอง

## หมายเหตุ

- คอมโพเนนต์หลักเป็น `"use client"` เพราะใช้ React hooks, Web Speech API (คำสั่งเสียง) และ Recharts
- ข้อมูล (อุปกรณ์, เครื่องจักร, กราฟ) เป็น mock data อยู่ในไฟล์เดียวกัน — ใช้แสดงเป็นค่าเริ่มต้นเมื่อยังไม่ได้เชื่อมต่อ API ของผู้ใช้
- Build สำหรับ production: `npm run build && npm run start`
- โปรเจกต์นี้ถูกแก้ไขในระบบที่ไม่มีการเชื่อมต่ออินเทอร์เน็ต (ยังไม่ได้รัน `npm install`/`npm run build` จริงเพื่อยืนยัน) แนะนำให้รัน `npm install && npm run dev` แล้วตรวจสอบอีกครั้งก่อน deploy จริง

## Deploy

พร้อม deploy ขึ้น [Vercel](https://vercel.com) ได้ทันที — แค่ push ขึ้น GitHub แล้ว import repo เข้า Vercel
