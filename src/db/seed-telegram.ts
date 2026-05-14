import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { systemSettings } from "./schema";

async function run() {
  await db
    .insert(systemSettings)
    .values({ settingKey: "telegram_url", settingValue: "" })
    .onConflictDoNothing();
  console.log("✅ telegram_url seeded!");
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
