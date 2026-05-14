"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Building2,
  Clock,
  MapPin,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home",   label: "Beranda",    href: "/",        icon: Home,      anchor: ""       },
  { id: "rates",  label: "Kurs",       href: "/#rates",  icon: TrendingUp, anchor: "rates"  },
  { id: "banks",  label: "Bank",       href: "/#banks",  icon: Building2,  anchor: "banks"  },
  { id: "hours",  label: "Jam Buka",   href: "/#hours",  icon: Clock,      anchor: "hours"  },
  { id: "map",    label: "Lokasi",     href: "/#location",icon: MapPin,    anchor: "location"},
];

export function BottomNav() {
  const pathname = usePathname();

  const scrollTo = (anchor: string) => {
    if (!anchor) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-md bottom-nav-safe"
      aria-label="Navigasi utama"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.anchor === ""
              ? pathname === "/"
              : false; // anchors are always on "/" so active based on scroll is JS-heavy; keep simple

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => scrollTo(item.anchor)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-1 transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
