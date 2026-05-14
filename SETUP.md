# 🚀 Exchange 286 — Panduan Setup Database

## Step 1: Buat Database di Neon

1. Kunjungi [console.neon.tech](https://console.neon.tech/)
2. Sign up / Login (gratis)
3. Klik **"New Project"**
4. Beri nama: `exchange-286`
5. Pilih region terdekat (Singapore untuk Indonesia)
6. Klik **"Create Project"**

## Step 2: Ambil Connection String

1. Di dashboard Neon, klik tab **"Connection Details"**
2. Pilih **"Pooled connection"**
3. Copy connection string yang dimulai dengan `postgresql://...`

## Step 3: Update `.env.local`

Buka file `.env.local` di root project dan update:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="jalankan: npx auth secret"

ADMIN_EMAIL="admin@exchange286.com"
ADMIN_PASSWORD="Admin@286!"
```

> **Untuk generate AUTH_SECRET:** Jalankan `npx auth secret` di terminal

## Step 4: Generate & Jalankan Migrasi

```bash
# Generate SQL migration dari schema
npm run db:generate

# Jalankan migrasi ke database
npm run db:migrate
```

## Step 5: Seed Data Awal

```bash
# Isi data awal (rates, banks, hours, admin user)
npm run db:seed
```

## Step 6: Jalankan Aplikasi

```bash
npm run dev
```

Buka http://localhost:3000 untuk landing page.
Buka http://localhost:3000/admin/login untuk admin panel.

---

## Kredensial Admin Default

| Field | Value |
|---|---|
| Email | `admin@exchange286.com` |
| Password | `Admin@286!` |

> **Ganti password setelah login pertama!**

---

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan environment variables yang sama di Vercel Dashboard
4. Jalankan `npm run db:migrate` sekali via Vercel CLI atau local dengan `DATABASE_URL` production
