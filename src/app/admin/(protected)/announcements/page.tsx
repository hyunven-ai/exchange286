"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Settings,
  Megaphone,
  MapPin,
  Globe,
  Tag,
  BarChart2,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Setting {
  id: number;
  settingKey: string;
  settingValue: string | null;
}

// ── Section collapsible wrapper ───────────────────────────────────────────────
function Section({
  title,
  description,
  icon: Icon,
  iconColor,
  keys,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  keys: string[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-border space-y-4">{children}</div>}
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────
function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  hint,
  mono = false,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
        {label}
      </Label>
      {multiline ? (
        <textarea
          id={id}
          className={`w-full min-h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y ${mono ? "font-mono text-xs" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={mono ? "font-mono text-xs" : ""}
        />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Setting[]) => {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.settingKey] = s.settingValue ?? ""; });
        setSettings(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string) => (v: string) =>
    setSettings((prev) => ({ ...prev, [key]: v }));

  const val = (key: string) => settings[key] ?? "";

  const handleSave = async (keys: string[], label: string) => {
    const id = keys.join(",");
    setSaving(id);
    try {
      await Promise.all(
        keys.map((key) =>
          fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settingKey: key, settingValue: settings[key] ?? "" }),
          }).then((r) => { if (!r.ok) throw new Error(); })
        )
      );
      toast.success(`✅ ${label} berhasil disimpan`);
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(null);
    }
  };

  const isSaving = (keys: string[]) => saving === keys.join(",");

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan Situs</h1>
          <p className="text-sm text-muted-foreground">
            SEO, analitik, integrasi peta, dan pengumuman
          </p>
        </div>
      </div>

      {/* ── 1. SEO ──────────────────────────────────────────────────────────── */}
      <Section
        title="SEO — Judul & Deskripsi"
        description="Tampil di hasil pencarian Google dan media sosial"
        icon={Globe}
        iconColor="bg-blue-500/10 text-blue-500"
        keys={["site_title", "site_description"]}
      >
        <Field
          id="field-site-title"
          label="Judul Halaman (Title)"
          placeholder="Exchange 286 — Kurs Valuta Asing Terpercaya"
          value={val("site_title")}
          onChange={set("site_title")}
          hint="Maksimal 60 karakter. Tampil di tab browser dan hasil Google."
        />
        <Field
          id="field-site-description"
          label="Deskripsi Meta (Meta Description)"
          placeholder="Platform informasi kurs valuta asing real-time. Cek USD, SAR, THB terkini."
          value={val("site_description")}
          onChange={set("site_description")}
          multiline
          hint="Maksimal 160 karakter. Tampil di snippet hasil pencarian Google."
        />
        <Button
          id="btn-save-seo"
          className="gap-2"
          onClick={() => handleSave(["site_title", "site_description"], "Pengaturan SEO")}
          disabled={isSaving(["site_title", "site_description"])}
        >
          {isSaving(["site_title", "site_description"]) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan SEO
        </Button>
      </Section>

      {/* ── 2. Konten Publik ─────────────────────────────────────────────────── */}
      <Section
        title="Konten Publik"
        description="Teks berjalan dan URL lokasi di halaman utama"
        icon={Megaphone}
        iconColor="bg-orange-500/10 text-orange-500"
        keys={["marquee_text", "maps_url"]}
      >
        <Field
          id="field-marquee-text"
          label="Teks Pengumuman (Marquee)"
          placeholder="🏦 Exchange 286 — Kurs Terbaik! ..."
          value={val("marquee_text")}
          onChange={set("marquee_text")}
          multiline
          hint="Teks ini akan berjalan di bagian teratas halaman utama."
        />
        <Field
          id="field-maps-url"
          label="URL Google Maps (tombol navigasi)"
          placeholder="https://maps.google.com/?q=-6.2,106.8"
          value={val("maps_url")}
          onChange={set("maps_url")}
          hint="Tautan ke lokasi Exchange 286 di Google Maps. Digunakan untuk tombol 'Buka Maps'."
        />
        <Field
          id="field-maps-embed"
          label="URL Embed Google Maps (iframe peta)"
          placeholder="https://www.google.com/maps/embed?pb=!1m18..."
          value={val("maps_embed_url")}
          onChange={set("maps_embed_url")}
          hint={
            <span>
              URL embed untuk tampilan peta di halaman. Cara mendapat URL ini:{" "}
              <strong>Google Maps → Share → Embed a map → Copy HTML</strong> → ambil bagian{" "}
              <code className="text-xs bg-muted px-1 rounded">src="..."</code> saja.
            </span>
          }
        />
        <Button
          id="btn-save-content"
          className="gap-2"
          onClick={() => handleSave(["marquee_text", "maps_url", "maps_embed_url"], "Konten Publik")}
          disabled={isSaving(["marquee_text", "maps_url", "maps_embed_url"])}
        >
          {isSaving(["marquee_text", "maps_url", "maps_embed_url"]) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Konten
        </Button>
      </Section>

      {/* ── 3. Google Tag ───────────────────────────────────────────────────── */}
      <Section
        title="Google Tag (Analytics / GTM)"
        description="Google Analytics 4 atau Google Tag Manager"
        icon={BarChart2}
        iconColor="bg-emerald-500/10 text-emerald-500"
        keys={["google_tag_id"]}
      >
        <Field
          id="field-google-tag"
          label="Google Tag ID"
          placeholder="G-XXXXXXXXXX atau GTM-XXXXXXX"
          value={val("google_tag_id")}
          onChange={set("google_tag_id")}
          mono
          hint={
            val("google_tag_id").startsWith("GTM-")
              ? "✅ Google Tag Manager terdeteksi — script GTM akan diinjeksi."
              : val("google_tag_id").startsWith("G-")
              ? "✅ Google Analytics 4 terdeteksi — gtag.js akan diinjeksi."
              : "Masukkan ID yang dimulai dengan G- (GA4) atau GTM- (Tag Manager)."
          }
        />
        <Button
          id="btn-save-gtag"
          className="gap-2"
          onClick={() => handleSave(["google_tag_id"], "Google Tag")}
          disabled={isSaving(["google_tag_id"])}
        >
          {isSaving(["google_tag_id"]) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Google Tag
        </Button>
      </Section>

      {/* ── 4. Pixel ────────────────────────────────────────────────────────── */}
      <Section
        title="Facebook & TikTok Pixel"
        description="Tracking konversi untuk iklan berbayar"
        icon={Tag}
        iconColor="bg-violet-500/10 text-violet-500"
        keys={["facebook_pixel_id", "tiktok_pixel_id"]}
      >
        <Field
          id="field-fb-pixel"
          label="Facebook Pixel ID"
          placeholder="123456789012345"
          value={val("facebook_pixel_id")}
          onChange={set("facebook_pixel_id")}
          mono
          hint="Temukan di Meta Business Manager → Events Manager → Data Sources."
        />
        <Field
          id="field-tt-pixel"
          label="TikTok Pixel ID"
          placeholder="C4ABCDEFGH1234567890"
          value={val("tiktok_pixel_id")}
          onChange={set("tiktok_pixel_id")}
          mono
          hint="Temukan di TikTok Ads Manager → Assets → Events → Web Events."
        />
        <Button
          id="btn-save-pixel"
          className="gap-2"
          onClick={() => handleSave(["facebook_pixel_id", "tiktok_pixel_id"], "Pixel")}
          disabled={isSaving(["facebook_pixel_id", "tiktok_pixel_id"])}
        >
          {isSaving(["facebook_pixel_id", "tiktok_pixel_id"]) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Pixel
        </Button>
      </Section>

      {/* ── 5. Widget Chat (WhatsApp + Telegram) ───────────────────────────── */}
      <Section
        title="Widget Chat"
        description="Tombol WhatsApp & Telegram mengambang di halaman publik"
        icon={MessageCircle}
        iconColor="bg-green-500/10 text-green-500"
        keys={["whatsapp_number", "whatsapp_message", "telegram_url"]}
      >
        {/* WhatsApp */}
        <div className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-foreground">WhatsApp</span>
          </div>
          <Field
            id="field-wa-number"
            label="Nomor WhatsApp"
            placeholder="6281234567890"
            value={val("whatsapp_number")}
            onChange={set("whatsapp_number")}
            mono
            hint="Format internasional tanpa + dan spasi. Contoh: 6281234567890"
          />
          <Field
            id="field-wa-message"
            label="Pesan Otomatis"
            placeholder="Halo, saya ingin mengetahui kurs hari ini."
            value={val("whatsapp_message")}
            onChange={set("whatsapp_message")}
            hint="Pesan yang langsung terisi saat pengguna membuka WhatsApp."
          />
          {val("whatsapp_number") && (
            <a
              href={`https://wa.me/${val("whatsapp_number")}${val("whatsapp_message") ? `?text=${encodeURIComponent(val("whatsapp_message"))}` : ""}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-green-500 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Tes tautan WhatsApp →
            </a>
          )}
        </div>

        {/* Telegram */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-semibold text-foreground">Telegram</span>
          </div>
          <Field
            id="field-telegram-url"
            label="Username atau URL Telegram"
            placeholder="namatoko atau t.me/namatoko"
            value={val("telegram_url")}
            onChange={set("telegram_url")}
            mono
            hint={(
              <span>
                Masukkan username tanpa @ (contoh: <code className="text-xs bg-muted px-1 rounded">exchange286</code>)
                {" "}atau URL lengkap{" "}
                <code className="text-xs bg-muted px-1 rounded">https://t.me/exchange286</code>.
                Kosongkan untuk menyembunyikan tombol Telegram.
              </span>
            )}
          />
          {val("telegram_url") && (
            <a
              href={
                val("telegram_url").startsWith("http")
                  ? val("telegram_url")
                  : `https://t.me/${val("telegram_url").replace(/^@/, "")}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-sky-500 hover:underline"
            >
              <Send className="w-3.5 h-3.5" />
              Tes tautan Telegram →
            </a>
          )}
        </div>

        <Button
          id="btn-save-chat-widgets"
          className="gap-2"
          onClick={() => handleSave(["whatsapp_number", "whatsapp_message", "telegram_url"], "Widget Chat")}
          disabled={isSaving(["whatsapp_number", "whatsapp_message", "telegram_url"])}
        >
          {isSaving(["whatsapp_number", "whatsapp_message", "telegram_url"]) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Widget Chat
        </Button>
      </Section>
    </div>
  );
}
