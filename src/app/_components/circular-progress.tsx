"use client";

export interface CircularProgressProps {
  /** 0–1 portion of the ring filled. */
  fraction: number;
}

export function CircularProgress({ fraction }: CircularProgressProps) {
  const cx = 8;
  const cy = 8;
  const r = 6;
  const stroke = 2;
  const size = 16;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, fraction));
  const offset = circumference * (1 - clamped);

  return (
    <svg
      className="shrink-0 -rotate-90 text-current"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        className="opacity-20"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}
