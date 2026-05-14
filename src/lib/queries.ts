import { db } from "@/db";
import {
  exchangeRates,
  supportedBanks,
  operationalHours,
  systemSettings,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// ── Exchange Rates ────────────────────────────────────────────────────────────
export const getAllRates = unstable_cache(
  async () => {
    return db.select().from(exchangeRates).orderBy(exchangeRates.currencyCode);
  },
  ["exchange-rates"],
  { revalidate: 60, tags: ["rates"] }
);

// ── Supported Banks ───────────────────────────────────────────────────────────
export const getActiveBanks = unstable_cache(
  async () => {
    return db
      .select()
      .from(supportedBanks)
      .where(eq(supportedBanks.isActive, true))
      .orderBy(supportedBanks.bankCode);
  },
  ["active-banks"],
  { revalidate: 300, tags: ["banks"] }
);

export const getAllBanks = async () => {
  return db.select().from(supportedBanks).orderBy(supportedBanks.bankCode);
};

// ── Operational Hours ─────────────────────────────────────────────────────────
export const getOperationalHours = unstable_cache(
  async () => {
    return db
      .select()
      .from(operationalHours)
      .orderBy(operationalHours.dayOfWeek);
  },
  ["operational-hours"],
  { revalidate: 3600, tags: ["hours"] }
);

// ── System Settings ───────────────────────────────────────────────────────────
export const getSetting = unstable_cache(
  async (key: string) => {
    const result = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, key))
      .limit(1);
    return result[0]?.settingValue ?? null;
  },
  ["system-settings"],
  { revalidate: 300, tags: ["settings"] }
);

export const getAllSettings = unstable_cache(
  async () => {
    return db.select().from(systemSettings);
  },
  ["all-settings"],
  { revalidate: 300, tags: ["settings"] }
);
