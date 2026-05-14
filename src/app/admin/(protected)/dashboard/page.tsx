import { db } from "@/db";
import { exchangeRates, supportedBanks, operationalHours } from "@/db/schema";
import { count } from "drizzle-orm";
import { TrendingUp, Building2, Clock, Settings } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard — Exchange 286 Admin" };

export default async function AdminDashboardPage() {
  const [ratesCount, banksCount, hoursCount] = await Promise.all([
    db.select({ count: count() }).from(exchangeRates),
    db.select({ count: count() }).from(supportedBanks),
    db.select({ count: count() }).from(operationalHours),
  ]);

  const stats = [
    {
      label: "Mata Uang Aktif",
      value: ratesCount[0]?.count ?? 0,
      icon: TrendingUp,
      href: "/admin/rates",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Bank Mitra",
      value: banksCount[0]?.count ?? 0,
      icon: Building2,
      href: "/admin/banks",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Jadwal Hari",
      value: hoursCount[0]?.count ?? 0,
      icon: Clock,
      href: "/admin/hours",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pengaturan",
      value: "—",
      icon: Settings,
      href: "/admin/announcements",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang di panel manajemen Exchange 286
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground font-rate">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                {stat.label}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/admin/rates", label: "Perbarui Kurs USD / SAR / THB", icon: TrendingUp },
            { href: "/admin/announcements", label: "Edit Teks Pengumuman & Peta", icon: Settings },
            { href: "/admin/banks", label: "Kelola Bank Mitra", icon: Building2 },
            { href: "/admin/hours", label: "Atur Jam Operasional", icon: Clock },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
