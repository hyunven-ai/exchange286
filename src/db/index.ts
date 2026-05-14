import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbType = NeonHttpDatabase<typeof schema> & { $client: ReturnType<typeof neon> };

let _db: DbType | null = null;

function getDb(): DbType {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your Vercel environment variables."
    );
  }

  const sql = neon(url);
  _db = drizzle(sql, { schema }) as DbType;
  return _db;
}

/**
 * Lazy DB proxy — the Neon connection is only created on first access.
 * This prevents build-time crashes when DATABASE_URL is absent
 * (e.g. Vercel static /_not-found page collection).
 */
export const db = new Proxy({} as DbType, {
  get(_target, prop: string | symbol) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
