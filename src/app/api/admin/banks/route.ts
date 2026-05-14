import { auth } from "@/auth";
import { db } from "@/db";
import { supportedBanks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const banks = await db.select().from(supportedBanks).orderBy(supportedBanks.bankCode);
  return NextResponse.json(banks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bankName, bankCode } = body;
  if (!bankName || !bankCode) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const [bank] = await db.insert(supportedBanks).values({ bankName, bankCode, isActive: true }).returning();
  revalidateTag("banks", "max");
  return NextResponse.json(bank, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, bankName, bankCode, isActive } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.update(supportedBanks).set({ bankName, bankCode, isActive }).where(eq(supportedBanks.id, id));
  revalidateTag("banks", "max");
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(supportedBanks).where(eq(supportedBanks.id, id));
  revalidateTag("banks", "max");
  return NextResponse.json({ success: true });
}
