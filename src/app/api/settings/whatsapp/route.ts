import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/** Public endpoint: returns only the whatsapp_number setting (no auth needed) */
export async function GET() {
  const rows = await db
    .select({ settingKey: systemSettings.settingKey, settingValue: systemSettings.settingValue })
    .from(systemSettings)
    .where(eq(systemSettings.settingKey, "whatsapp_number"));

  const number = rows[0]?.settingValue ?? "";
  return NextResponse.json({ whatsappNumber: number });
}
