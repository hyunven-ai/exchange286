import { auth } from "@/auth";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await db.select().from(systemSettings);
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { settingKey, settingValue } = body;
  if (!settingKey) return NextResponse.json({ error: "Missing settingKey" }, { status: 400 });

  await db
    .insert(systemSettings)
    .values({ settingKey, settingValue })
    .onConflictDoUpdate({
      target: systemSettings.settingKey,
      set: { settingValue },
    });

  revalidateTag("settings", "max");
  return NextResponse.json({ success: true });
}
