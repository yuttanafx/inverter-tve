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
  - ระบบจะเรียก `GET {url}/status`, `GET {url}/devices`, `GET {url}/machines`
  - ถ้ายังไม่ตั้งค่า หรือเชื่อมต่อไม่ได้ จะ fallback ไปแสดงข้อมูลตัวอย่าง (โหมดสาธิต) โดยอัตโนมัติ พร้อม badge บอกสถานะที่หน้าแรก
- **พื้นหลังอนิเมชั่นเบาๆ** — บล็อบไล่สีลอยตัวช้าๆ ด้วย CSS transform (ไม่ใช้ canvas/JS animation loop จึงเบามาก) เคารพ `prefers-reduced-motion` (`components/AnimatedBackground.jsx`)
- **ฟอนต์โหลดผ่าน `next/font`** แทน `@import` เดิม — self-host อัตโนมัติ ลด request ภายนอก และไม่มี layout shift ตอนโหลดฟอนต์ (เพิ่มความเร็วหน้าเว็บ)

## หมายเหตุ

- คอมโพเนนต์หลักเป็น `"use client"` เพราะใช้ React hooks, Web Speech API (คำสั่งเสียง) และ Recharts
- ข้อมูล (อุปกรณ์, เครื่องจักร, กราฟ) เป็น mock data อยู่ในไฟล์เดียวกัน — ใช้แสดงเป็นค่าเริ่มต้นเมื่อยังไม่ได้เชื่อมต่อ API ของผู้ใช้
- Build สำหรับ production: `npm run build && npm run start`
- โปรเจกต์นี้ถูกแก้ไขในระบบที่ไม่มีการเชื่อมต่ออินเทอร์เน็ต (ยังไม่ได้รัน `npm install`/`npm run build` จริงเพื่อยืนยัน) แนะนำให้รัน `npm install && npm run dev` แล้วตรวจสอบอีกครั้งก่อน deploy จริง

## Deploy

พร้อม deploy ขึ้น [Vercel](https://vercel.com) ได้ทันที — แค่ push ขึ้น GitHub แล้ว import repo เข้า Vercel
