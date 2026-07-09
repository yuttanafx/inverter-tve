import "./globals.css";

export const metadata = {
  title: "Inverter Control Center",
  description: "ควบคุมและตรวจสอบระบบพลังงานผ่าน API อินเวอร์เตอร์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
