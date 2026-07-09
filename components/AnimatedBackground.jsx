"use client";

import React from "react";
import { useTheme } from "@/lib/theme";

/**
 * พื้นหลังอนิเมชั่นเบาๆ: บล็อบไล่สีลอยตัวช้าๆ + จุดดาว/แสงกระพริบบางๆ
 * ใช้ CSS transform/opacity เท่านั้น (GPU-friendly, ไม่กระทบ performance)
 * เคารพ prefers-reduced-motion และปรับโทนสีตาม theme
 */
export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute rounded-full blob blob-a"
        style={{
          width: 480,
          height: 480,
          top: "-10%",
          left: "-8%",
          background: isLight
            ? "radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0) 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0) 70%)",
        }}
      />
      <div
        className="absolute rounded-full blob blob-b"
        style={{
          width: 520,
          height: 520,
          top: "35%",
          right: "-12%",
          background: isLight
            ? "radial-gradient(circle, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0) 70%)"
            : "radial-gradient(circle, rgba(34,197,94,0.16) 0%, rgba(34,197,94,0) 70%)",
        }}
      />
      <div
        className="absolute rounded-full blob blob-c"
        style={{
          width: 420,
          height: 420,
          bottom: "-14%",
          left: "22%",
          background: isLight
            ? "radial-gradient(circle, rgba(167,139,250,0.14) 0%, rgba(167,139,250,0) 70%)"
            : "radial-gradient(circle, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0) 70%)",
        }}
      />

      {!isLight && (
        <div className="absolute inset-0 stars" />
      )}

      <style>{`
        .blob {
          filter: blur(40px);
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        .blob-a { animation-name: floatA; animation-duration: 22s; }
        .blob-b { animation-name: floatB; animation-duration: 26s; }
        .blob-c { animation-name: floatC; animation-duration: 30s; }

        @keyframes floatA {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(40px, 60px) scale(1.08); }
        }
        @keyframes floatB {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(-50px, -30px) scale(1.1); }
        }
        @keyframes floatC {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(30px, -40px) scale(1.06); }
        }

        .stars {
          background-image:
            radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.5) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 65% 15%, rgba(255,255,255,0.35) 50%, transparent 100%),
            radial-gradient(1px 1px at 80% 55%, rgba(255,255,255,0.4) 50%, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.3) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 90% 80%, rgba(255,255,255,0.35) 50%, transparent 100%),
            radial-gradient(1px 1px at 10% 85%, rgba(255,255,255,0.3) 50%, transparent 100%);
          background-repeat: repeat;
          background-size: 340px 340px;
          opacity: 0.5;
          animation: twinkle 6s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          from { opacity: 0.28; }
          to   { opacity: 0.55; }
        }

        @media (prefers-reduced-motion: reduce) {
          .blob, .stars { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
