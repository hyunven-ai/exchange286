import { auth } from "@/auth";
import { db } from "@/db";
import { transactions, supportedBanks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      currencyCode: transactions.currencyCode,
      amount: transactions.amount,
      rate: transactions.rate,
      idrAmount: transactions.idrAmount,
      bankId: transactions.bankId,
      bankName: supportedBanks.bankName,
      bankCode: supportedBanks.bankCode,
      customerName: transactions.customerName,
      customerPhone: transactions.customerPhone,
      notes: transactions.notes,
      status: transactions.status,
      createdAt: transactions.createdAt,
      processedAt: transactions.processedAt,
    })
    .from(transactions)
    .leftJoin(supportedBanks, eq(transactions.bankId, supportedBanks.id))
    .orderBy(desc(transactions.createdAt));

  return NextResponse.json(rows);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await db
    .update(transactions)
    .set({ status, processedAt: ["done", "cancelled"].includes(status) ? new Date() : null })
    .where(eq(transactions.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(transactions).where(eq(transactions.id, id));
  return NextResponse.json({ success: true });
}
