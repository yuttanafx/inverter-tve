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

## หมายเหตุ

- คอมโพเนนต์หลักเป็น `"use client"` เพราะใช้ React hooks, Web Speech API (คำสั่งเสียง) และ Recharts
- ข้อมูล (อุปกรณ์, เครื่องจักร, กราฟ) เป็น mock data อยู่ในไฟล์เดียวกัน — พร้อมให้ต่อ API จริงภายหลัง
- ฟอนต์ (Space Grotesk, Inter, JetBrains Mono) โหลดผ่าน `@import` ใน component; ถ้าต้องการ optimize เพิ่มเติมสามารถย้ายไปใช้ `next/font` ได้
- Build สำหรับ production: `npm run build && npm run start`

## Deploy

พร้อม deploy ขึ้น [Vercel](https://vercel.com) ได้ทันที — แค่ push ขึ้น GitHub แล้ว import repo เข้า Vercel
