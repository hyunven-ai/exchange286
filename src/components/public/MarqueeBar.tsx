"use client";

import { useEffect, useRef } from "react";

interface MarqueeBarProps {
  text: string;
}

export function MarqueeBar({ text }: MarqueeBarProps) {
  const doubled = `${text}  •  ${text}  •  `;

  return (
    <div
      className="marquee-container w-full overflow-hidden bg-primary text-primary-foreground py-2 select-none"
      aria-label="Pengumuman"
    >
      <div className="flex whitespace-nowrap">
        <span className="animate-marquee inline-block text-sm font-medium tracking-wide pr-8">
          {doubled}
        </span>
        <span
          className="animate-marquee inline-block text-sm font-medium tracking-wide pr-8"
          aria-hidden="true"
        >
          {doubled}
        </span>
      </div>
    </div>
  );
}
