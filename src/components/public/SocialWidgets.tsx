"use client";

import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";

interface SocialWidgetsProps {
  /** WhatsApp: phone number in international format without + */
  whatsappNumber?: string;
  /** WhatsApp: pre-filled message */
  whatsappMessage?: string;
  /** Telegram: username (without @) or full t.me URL */
  telegramUrl?: string;
}

export function SocialWidgets({
  whatsappNumber,
  whatsappMessage,
  telegramUrl,
}: SocialWidgetsProps) {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 1500);
    const t2 = setTimeout(() => setTooltip(true), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const hasWA = Boolean(whatsappNumber);
  const hasTG = Boolean(telegramUrl);

  if (!hasWA && !hasTG) return null;

  const waHref = hasWA
    ? `https://wa.me/${whatsappNumber!.replace(/\D/g, "")}${
        whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""
      }`
    : "#";

  // Normalize telegram: accept @username, username, or full URL
  const tgHref = hasTG
    ? telegramUrl!.startsWith("http")
      ? telegramUrl!
      : `https://t.me/${telegramUrl!.replace(/^@/, "")}`
    : "#";

  return (
    /**
     * Positioning:
     * - Mobile: bottom-20 (80px) to clear the fixed BottomNav (~64px) + margin
     * - Desktop (sm+): bottom-6 (24px) as usual
     * z-40 so it stays under dialogs but above content
     */
    <div
      className={`fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end gap-2
        transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}
    >
      {/* Tooltip bubble — only when both haven't been dismissed */}
      {tooltip && !dismissed && (
        <div className="relative bg-white dark:bg-card text-foreground text-xs font-medium px-3 py-2 rounded-xl shadow-lg border border-border max-w-[180px] text-center">
          <span>Info rate? 💱</span>
          {/* Arrow */}
          <span className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-card border-r border-b border-border rotate-45" />
          <button
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center"
            onClick={() => {
              setDismissed(true);
              setTooltip(false);
            }}
            aria-label="Tutup tooltip"
          >
            <X className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Widget buttons stack */}
      <div className="flex flex-col items-center gap-2.5">
        {/* Telegram button */}
        {hasTG && (
          <a
            href={tgHref}
            target="_blank"
            rel="noreferrer noopener"
            id="telegram-widget-btn"
            aria-label="Chat via Telegram"
            onClick={() => setTooltip(false)}
            className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl transition-transform duration-200 hover:scale-110 active:scale-95"
            style={{ backgroundColor: "#229ED9" }}
          >
            {/* Ripple */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: "#229ED9" }}
            />
            {/* Telegram paper-plane icon */}
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 -rotate-12" />
          </a>
        )}

        {/* WhatsApp button */}
        {hasWA && (
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer noopener"
            id="whatsapp-widget-btn"
            aria-label="Chat via WhatsApp"
            onClick={() => setTooltip(false)}
            className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl transition-transform duration-200 hover:scale-110 active:scale-95"
            style={{ backgroundColor: "#25D366" }}
          >
            {/* Ripple */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: "#25D366" }}
            />
            {/* WhatsApp SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-5 h-5 sm:w-6 sm:h-6 relative z-10"
              fill="white"
            >
              <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.64 4.64 1.853 6.64L2.667 29.333l6.88-1.813A13.28 13.28 0 0 0 16.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 24a11.04 11.04 0 0 1-5.627-1.547l-.4-.24-4.08 1.08 1.093-3.973-.267-.413A10.987 10.987 0 0 1 5.04 16c0-6.053 4.92-10.987 10.973-10.987S27 9.947 27 16s-4.933 10.667-10.996 10.667zm6.013-8.213c-.32-.16-1.92-.947-2.213-1.053-.294-.107-.507-.16-.72.16-.213.32-.827 1.053-.987 1.267-.173.213-.333.24-.653.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.013-.48.147-.64.147-.147.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.267-.627-.533-.547-.72-.547h-.613c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.267 3.453 5.493 4.84.773.333 1.373.533 1.84.68.773.24 1.48.213 2.04.133.627-.093 1.92-.787 2.187-1.547.267-.76.267-1.413.187-1.547-.08-.133-.293-.213-.614-.373z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
