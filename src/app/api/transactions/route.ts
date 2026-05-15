import { db } from "@/db";
import { transactions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      currencyCode,
      amount,
      rate,
      idrAmount,
      bankId,
      customerName,
      customerPhone,
      notes,
    } = body;

    if (!type || !currencyCode || !amount || !rate || !idrAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [tx] = await db
      .insert(transactions)
      .values({
        type,
        currencyCode,
        amount: String(amount),
        rate: String(rate),
        idrAmount: String(idrAmount),
        bankId: bankId ?? null,
        customerName: customerName ?? null,
        customerPhone: customerPhone ?? null,
        notes: notes ?? null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    console.error("[POST /api/transactions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
