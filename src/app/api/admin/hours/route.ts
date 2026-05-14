import { auth } from "@/auth";
import { db } from "@/db";
import { operationalHours } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hours = await db.select().from(operationalHours).orderBy(operationalHours.dayOfWeek);
  return NextResponse.json(hours);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, openTime, closeTime, isClosed } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db
    .update(operationalHours)
    .set({
      openTime: isClosed ? null : openTime,
      closeTime: isClosed ? null : closeTime,
      isClosed,
    })
    .where(eq(operationalHours.id, id));

  revalidateTag("hours", "max");
  return NextResponse.json({ success: true });
}
