// Must load env before any db import
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { systemSettings } from "./schema";

const NEW_SETTINGS = [
  { settingKey: "site_title", settingValue: "Exchange 286 — Kurs Valuta Asing Terpercaya" },
  { settingKey: "site_description", settingValue: "Platform informasi kurs valuta asing real-time. Cek harga Beli & Jual USD, SAR, THB terkini di Exchange 286." },
  { settingKey: "google_tag_id", settingValue: "" },
  { settingKey: "facebook_pixel_id", settingValue: "" },
  { settingKey: "tiktok_pixel_id", settingValue: "" },
  { settingKey: "whatsapp_number", settingValue: "" },
  { settingKey: "whatsapp_message", settingValue: "Halo, saya ingin mengetahui kurs hari ini." },
];

async function run() {
  console.log("🌱 Seeding new settings...");
  await db
    .insert(systemSettings)
    .values(NEW_SETTINGS)
    .onConflictDoNothing();
  console.log("✅ Done!");
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
