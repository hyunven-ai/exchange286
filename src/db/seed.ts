import { db } from "./index";
import {
  exchangeRates,
  supportedBanks,
  operationalHours,
  systemSettings,
  users,
} from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Exchange Rates ──────────────────────────────────────────────────────────
  await db
    .insert(exchangeRates)
    .values([
      { currencyCode: "USD", buyRate: "15500.00", sellRate: "15700.00" },
      { currencyCode: "SAR", buyRate: "4100.00",  sellRate: "4250.00"  },
      { currencyCode: "THB", buyRate: "420.00",   sellRate: "440.00"   },
    ])
    .onConflictDoNothing();

  // ── Supported Banks ─────────────────────────────────────────────────────────
  await db
    .insert(supportedBanks)
    .values([
      { bankName: "Bank Central Asia",  bankCode: "BCA",     isActive: true },
      { bankName: "Bank Mandiri",        bankCode: "MANDIRI", isActive: true },
      { bankName: "Bank Rakyat Indonesia", bankCode: "BRI",   isActive: true },
      { bankName: "Bank Negara Indonesia", bankCode: "BNI",   isActive: true },
      { bankName: "Bank CIMB Niaga",     bankCode: "CIMB",   isActive: true },
    ])
    .onConflictDoNothing();

  // ── Operational Hours ───────────────────────────────────────────────────────
  const hours = [
    { dayOfWeek: 0, openTime: null,    closeTime: null,    isClosed: true  }, // Sunday
    { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00", isClosed: false }, // Monday
    { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00", isClosed: false }, // Tuesday
    { dayOfWeek: 3, openTime: "08:00", closeTime: "17:00", isClosed: false }, // Wednesday
    { dayOfWeek: 4, openTime: "08:00", closeTime: "17:00", isClosed: false }, // Thursday
    { dayOfWeek: 5, openTime: "08:00", closeTime: "17:00", isClosed: false }, // Friday
    { dayOfWeek: 6, openTime: "08:00", closeTime: "14:00", isClosed: false }, // Saturday
  ];
  await db.insert(operationalHours).values(hours).onConflictDoNothing();

  // ── System Settings ─────────────────────────────────────────────────────────
  await db
    .insert(systemSettings)
    .values([
      {
        settingKey: "marquee_text",
        settingValue:
          "🏦 Exchange 286 — Kurs Terbaik! USD · SAR · THB · Buka Senin-Sabtu · Hubungi kami untuk rate khusus · Transaksi Aman & Terpercaya 💵",
      },
      {
        settingKey: "maps_url",
        settingValue: "https://maps.google.com/?q=-6.200000,106.816666",
      },
    ])
    .onConflictDoNothing();

  // ── Admin User ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "Admin@286!",
    12
  );
  await db
    .insert(users)
    .values({
      email: process.env.ADMIN_EMAIL ?? "admin@exchange286.com",
      hashedPassword,
    })
    .onConflictDoNothing();

  console.log("✅ Seeding complete.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
