"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

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
          <span>Ada pertanyaan? Chat kami! 👋</span>
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
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white relative z-10" />
          </a>
        )}
      </div>
    </div>
  );
}
