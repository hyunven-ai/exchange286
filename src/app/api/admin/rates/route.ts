import { auth } from "@/auth";
import { db } from "@/db";
import { exchangeRates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rates = await db.select().from(exchangeRates).orderBy(exchangeRates.currencyCode);
  return NextResponse.json(rates);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { currencyCode, currencyName, buyRate, sellRate } = body;

  if (!currencyCode || buyRate == null || sellRate == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const code = String(currencyCode).toUpperCase().trim();
  if (!/^[A-Z]{3}$/.test(code)) {
    return NextResponse.json(
      { error: "Kode mata uang harus 3 huruf (contoh: USD)" },
      { status: 400 }
    );
  }

  const [rate] = await db
    .insert(exchangeRates)
    .values({
      currencyCode: code,
      currencyName: currencyName ? String(currencyName).trim() : null,
      buyRate: String(buyRate),
      sellRate: String(sellRate),
    })
    .returning();

  revalidateTag("rates", "max");
  return NextResponse.json(rate, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, currencyName, buyRate, sellRate } = body;

  if (!id || buyRate == null || sellRate == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await db
    .update(exchangeRates)
    .set({
      ...(currencyName !== undefined && { currencyName: currencyName ? String(currencyName).trim() : null }),
      buyRate: String(buyRate),
      sellRate: String(sellRate),
      updatedAt: new Date(),
    })
    .where(eq(exchangeRates.id, id));

  revalidateTag("rates", "max");
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(exchangeRates).where(eq(exchangeRates.id, id));
  revalidateTag("rates", "max");
  return NextResponse.json({ success: true });
}
