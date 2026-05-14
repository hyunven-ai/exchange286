"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

interface WhatsAppWidgetProps {
  phoneNumber: string;
  message?: string;
}

export function WhatsAppWidget({ phoneNumber, message }: WhatsAppWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Delay appearance for smoother page load
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 1500);
    const t2 = setTimeout(() => setPulse(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!phoneNumber) return null;

  const href = `https://wa.me/${phoneNumber.replace(/\D/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {/* Tooltip bubble */}
      {pulse && (
        <div className="relative bg-white dark:bg-card text-foreground text-xs font-medium px-3 py-2 rounded-xl shadow-lg border border-border max-w-[200px] text-center animate-fade-in">
          <span>Ada pertanyaan? Chat kami! 👋</span>
          {/* Arrow */}
          <span className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white dark:bg-card border-r border-b border-border rotate-45" />
          <button
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center"
            onClick={() => setPulse(false)}
            aria-label="Tutup"
          >
            <X className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Main button */}
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        id="whatsapp-widget-btn"
        aria-label="Chat via WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#25D366" }}
        onClick={() => setPulse(false)}
      >
        {/* Ripple ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: "#25D366" }}
        />
        <MessageCircle className="w-7 h-7 text-white fill-white relative z-10" />
      </a>
    </div>
  );
}
