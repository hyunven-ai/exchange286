import {
  pgTable,
  serial,
  varchar,
  numeric,
  boolean,
  timestamp,
  text,
  integer,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Exchange Rates ────────────────────────────────────────────────────────────
export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  currencyCode: varchar("currency_code", { length: 3 }).notNull().unique(), // USD | SAR | THB
  /** Optional display name — overrides CURRENCY_META for unknown ISO codes */
  currencyName: varchar("currency_name", { length: 100 }),
  buyRate: numeric("buy_rate", { precision: 12, scale: 2 }).notNull(),
  sellRate: numeric("sell_rate", { precision: 12, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Supported Banks ───────────────────────────────────────────────────────────
export const supportedBanks = pgTable("supported_banks", {
  id: serial("id").primaryKey(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  bankCode: varchar("bank_code", { length: 20 }).notNull().unique(),
  accountNumber: varchar("account_number", { length: 50 }),
  accountName: varchar("account_name", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
});

// ── Operational Hours ─────────────────────────────────────────────────────────
export const operationalHours = pgTable("operational_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday … 6=Saturday
  openTime: time("open_time"),                 // null if closed
  closeTime: time("close_time"),               // null if closed
  isClosed: boolean("is_closed").notNull().default(false),
});

// ── System Settings (key-value) ───────────────────────────────────────────────
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
});

// ── Admin Users ───────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  /** 'buy' = customer buys foreign currency (pays IDR) */
  /** 'sell' = customer sells foreign currency (receives IDR) */
  type: varchar("type", { length: 10 }).notNull(), // 'buy' | 'sell'
  currencyCode: varchar("currency_code", { length: 3 }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 4 }).notNull(),
  rate: numeric("rate", { precision: 12, scale: 2 }).notNull(),
  idrAmount: numeric("idr_amount", { precision: 18, scale: 2 }).notNull(),
  bankId: integer("bank_id"),
  customerName: varchar("customer_name", { length: 150 }),
  customerPhone: varchar("customer_phone", { length: 30 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | confirmed | done | cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  bank: one(supportedBanks, {
    fields: [transactions.bankId],
    references: [supportedBanks.id],
  }),
}));

// ── Type Exports ──────────────────────────────────────────────────────────────
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type SupportedBank = typeof supportedBanks.$inferSelect;
export type OperationalHour = typeof operationalHours.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
