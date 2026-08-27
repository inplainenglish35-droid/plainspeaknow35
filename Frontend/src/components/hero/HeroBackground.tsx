import type { ReactNode } from "react";

type HeroBackgroundProps = {
  children: ReactNode;
};

export function HeroBackground({
  children,
}: HeroBackgroundProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F7FBFC] to-[#EAF5F8]">

      {/* =========================
          LEFT ORGANIC CONTOURS
      ========================= */}
      <svg
        aria-hidden="true"
        viewBox="0 0 500 900"
        className="pointer-events-none absolute -left-20 top-0 h-full w-[420px] opacity-60"
        preserveAspectRatio="none"
      >
        <path
          d="M30 0 C180 120, 40 250, 190 360 S350 600, 120 900"
          fill="none"
          stroke="#9BC7BA"
          strokeWidth="2"
        />

        <path
          d="M85 0 C245 150, 80 280, 240 410 S385 650, 175 900"
          fill="none"
          stroke="#B8D9D0"
          strokeWidth="2"
        />

        <path
          d="M145 0 C300 160, 135 315, 295 455 S420 690, 235 900"
          fill="none"
          stroke="#D1E7E1"
          strokeWidth="2"
        />
      </svg>

      {/* =========================
          RIGHT ORGANIC CONTOURS
      ========================= */}
      <svg
        aria-hidden="true"
        viewBox="0 0 500 900"
        className="pointer-events-none absolute -right-24 top-0 h-full w-[430px] opacity-55"
        preserveAspectRatio="none"
      >
        <path
          d="M470 0 C300 150, 460 285, 300 400 S130 630, 370 900"
          fill="none"
          stroke="#9FCAD7"
          strokeWidth="2"
        />

        <path
          d="M410 0 C245 165, 415 320, 250 445 S100 665, 315 900"
          fill="none"
          stroke="#BEDCE4"
          strokeWidth="2"
        />

        <path
          d="M350 0 C195 175, 355 350, 200 485 S80 700, 260 900"
          fill="none"
          stroke="#D6E9EE"
          strokeWidth="2"
        />
      </svg>

      {/* =========================
          SOFT SAGE SHAPE
      ========================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-[38%] h-72 w-72 rounded-[42%_58%_55%_45%] bg-[#DDEDE7]/45"
      />

      {/* =========================
          SOFT SKY SHAPE
      ========================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-16 h-80 w-80 rounded-[55%_45%_38%_62%] bg-[#DDEFF4]/55"
      />

      {/* =========================
          SMALL DECORATIVE DOTS
      ========================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[24%] h-2 w-2 rounded-full bg-[#7EAD9E]/35"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-[30%] h-3 w-3 rounded-full border border-[#7EAD9E]/30"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[10%] top-[30%] h-2.5 w-2.5 rounded-full bg-[#8DBBC8]/30"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[14%] top-[38%] h-4 w-4 rounded-full border border-[#8DBBC8]/25"
      />

      {/* =========================
          BOTTOM WAVE
      ========================= */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 h-36 w-full opacity-65"
      >
        <path
          d="M0 105 C260 35 470 155 720 105 C970 55 1190 40 1440 105 L1440 180 L0 180 Z"
          fill="#E5F2EE"
        />

        <path
          d="M0 135 C260 90 510 165 760 125 C1020 85 1210 95 1440 130 L1440 180 L0 180 Z"
          fill="#E6F2F6"
        />
      </svg>

      {/* =========================
          CONTENT
      ========================= */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}

export default HeroBackground;