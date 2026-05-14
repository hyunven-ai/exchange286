CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"currency_code" varchar(3) NOT NULL,
	"buy_rate" numeric(12, 2) NOT NULL,
	"sell_rate" numeric(12, 2) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_rates_currency_code_unique" UNIQUE("currency_code")
);
--> statement-breakpoint
CREATE TABLE "operational_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supported_banks" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank_name" varchar(100) NOT NULL,
	"bank_code" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "supported_banks_bank_code_unique" UNIQUE("bank_code")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" varchar(100) NOT NULL,
	"setting_value" text,
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
