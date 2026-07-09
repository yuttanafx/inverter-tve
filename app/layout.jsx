import "./globals.css";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import { LangProvider } from "@/lib/i18n";
import { ApiConfigProvider } from "@/lib/apiConfig";
import AnimatedBackground from "@/components/AnimatedBackground";

// โหลดฟอนต์ผ่าน next/font: self-host อัตโนมัติ, ไม่มี layout shift,
// ไม่ต้องยิง request ไปที่ Google Fonts ตอน runtime (เร็วขึ้นกว่า @import เดิมมาก)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "Inverter Control Center",
  description: "ควบคุมและตรวจสอบระบบพลังงานผ่าน API อินเวอร์เตอร์ของคุณ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      >
        <ThemeProvider>
          <LangProvider>
            <ApiConfigProvider>
              <AnimatedBackground />
              {children}
            </ApiConfigProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
