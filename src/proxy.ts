import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Simple in-memory rate limit (edge-compatible) ─────────────────────────────
// Key: IP → { count, resetAt }
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || now > record.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count++;
  if (record.count > limit) return true;
  return false;
}

export default auth(async (req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // ── Rate Limit: API routes → 60 req/min ──────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    if (isRateLimited(ip, 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // ── Rate Limit: Login → 10 attempts/min ──────────────────────────────────
  if (pathname === "/api/auth/callback/credentials") {
    if (isRateLimited(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
    }
  }

  // ── Auth Guard: /admin/* except /admin/login ──────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (req as any).auth;
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/callback/credentials"],
};
