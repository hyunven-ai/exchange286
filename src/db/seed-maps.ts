import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { systemSettings } from "./schema";

const EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.660279575934!2d106.7886887!3d-6.176213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f756b6321227%3A0xefc0d6d8ab504934!2sHarga%20Kurs%20Money%20Changer%20Jakarta!5e0!3m2!1sen!2sid!4v1778760596170!5m2!1sen!2sid";

async function run() {
  await db
    .insert(systemSettings)
    .values({ settingKey: "maps_embed_url", settingValue: EMBED_URL })
    .onConflictDoUpdate({
      target: systemSettings.settingKey,
      set: { settingValue: EMBED_URL },
    });
  console.log("✅ maps_embed_url saved!");
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
