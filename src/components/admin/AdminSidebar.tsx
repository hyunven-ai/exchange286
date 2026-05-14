"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/public/ThemeToggle";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rates", label: "Kurs", icon: TrendingUp },
  { href: "/admin/banks", label: "Bank Mitra", icon: Building2 },
  { href: "/admin/hours", label: "Jam Operasional", icon: Clock },
  { href: "/admin/announcements", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen border-r border-border bg-card flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
        <Image
          src="https://res.cloudinary.com/dzojrrwtr/image/upload/v1778774517/286logo_q9zz8x.png"
          alt="Exchange 286"
          width={40}
          height={40}
          className="rounded-full object-contain"
        />
        <div>
          <p className="font-bold text-sm text-foreground leading-tight">Exchange 286</p>
          <p className="text-[10px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`admin-nav-${item.href.split("/").pop()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          id="btn-admin-logout"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
