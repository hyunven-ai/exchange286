"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  TrendingUp,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Rate {
  id: number;
  currencyCode: string;
  currencyName: string | null;  // custom name from DB
  buyRate: string;
  sellRate: string;
  updatedAt: string;
}

interface NewRate {
  currencyCode: string;
  currencyName: string;
  buyRate: string;
  sellRate: string;
}

interface DeleteTarget {
  id: number;
  currencyCode: string;
}

interface EditValues {
  buy: string;
  sell: string;
  name: string;   // editable name in inline edit
}

// ── ISO dictionary ────────────────────────────────────────────────────────────
const CURRENCY_META: Record<string, { flag: string; name: string }> = {
  USD: { flag: "🇺🇸", name: "United States Dollar" },
  SAR: { flag: "🇸🇦", name: "Saudi Arabian Riyal" },
  THB: { flag: "🇹🇭", name: "Thai Baht" },
  EUR: { flag: "🇪🇺", name: "Euro" },
  SGD: { flag: "🇸🇬", name: "Singapore Dollar" },
  MYR: { flag: "🇲🇾", name: "Malaysian Ringgit" },
  AUD: { flag: "🇦🇺", name: "Australian Dollar" },
  JPY: { flag: "🇯🇵", name: "Japanese Yen" },
  GBP: { flag: "🇬🇧", name: "British Pound" },
  CNY: { flag: "🇨🇳", name: "Chinese Yuan" },
  KWD: { flag: "🇰🇼", name: "Kuwaiti Dinar" },
  AED: { flag: "🇦🇪", name: "UAE Dirham" },
  OMR: { flag: "🇴🇲", name: "Omani Rial" },
  QAR: { flag: "🇶🇦", name: "Qatari Riyal" },
  BHD: { flag: "🇧🇭", name: "Bahraini Dinar" },
  CHF: { flag: "🇨🇭", name: "Swiss Franc" },
  CAD: { flag: "🇨🇦", name: "Canadian Dollar" },
  HKD: { flag: "🇭🇰", name: "Hong Kong Dollar" },
  KRW: { flag: "🇰🇷", name: "South Korean Won" },
  NZD: { flag: "🇳🇿", name: "New Zealand Dollar" },
};

/** Get display name: DB custom name > CURRENCY_META > fallback */
function getDisplayName(rate: Rate): string {
  if (rate.currencyName) return rate.currencyName;
  return CURRENCY_META[rate.currencyCode]?.name ?? rate.currencyCode;
}

function getFlag(rate: Rate): string {
  return CURRENCY_META[rate.currencyCode]?.flag ?? "💱";
}

/** True if the code exists in CURRENCY_META */
function isKnownISO(code: string): boolean {
  return code.length === 3 && Boolean(CURRENCY_META[code]);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  // inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({ buy: "", sell: "", name: "" });
  const [saving, setSaving] = useState(false);

  // add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newRate, setNewRate] = useState<NewRate>({ currencyCode: "", currencyName: "", buyRate: "", sellRate: "" });
  const [adding, setAdding] = useState(false);

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRates = useCallback(async () => {
    const res = await fetch("/api/admin/rates");
    const data: Rate[] = await res.json();
    setRates(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // ── Derived: is the code in the Add dialog detected? ──────────────────────
  const addCode = newRate.currencyCode.toUpperCase();
  const addKnown = isKnownISO(addCode);
  const addMeta = CURRENCY_META[addCode];

  // Auto-fill currencyName when user types a known ISO code
  const handleAddCodeChange = (raw: string) => {
    const code = raw.toUpperCase().slice(0, 3);
    const known = CURRENCY_META[code];
    setNewRate((p) => ({
      ...p,
      currencyCode: code,
      // auto-fill name only if field is empty or was previously auto-filled
      currencyName: known ? known.name : p.currencyName,
    }));
  };

  // ── Inline edit ────────────────────────────────────────────────────────────
  const startEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setEditValues({
      buy: rate.buyRate,
      sell: rate.sellRate,
      name: rate.currencyName ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ buy: "", sell: "", name: "" });
  };

  const handleUpdate = async (rate: Rate) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rate.id,
          buyRate: editValues.buy,
          sellRate: editValues.sell,
          // Only send currencyName if it differs from CURRENCY_META (or is custom)
          currencyName: editValues.name.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`✅ Kurs ${rate.currencyCode} berhasil diperbarui`);
      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? {
                ...r,
                buyRate: editValues.buy,
                sellRate: editValues.sell,
                currencyName: editValues.name.trim() || null,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      setEditingId(null);
    } catch {
      toast.error("Gagal memperbarui kurs.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add new rate ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newRate.currencyCode || !newRate.buyRate || !newRate.sellRate) {
      toast.error("Lengkapi semua kolom.");
      return;
    }
    // If ISO not detected, name is required
    if (!addKnown && !newRate.currencyName.trim()) {
      toast.error("Nama mata uang wajib diisi untuk kode yang tidak dikenal.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: newRate.currencyCode,
          currencyName: newRate.currencyName.trim() || null,
          buyRate: newRate.buyRate,
          sellRate: newRate.sellRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menambah kurs.");
        return;
      }
      toast.success(`✅ Kurs ${data.currencyCode} berhasil ditambahkan`);
      setRates((prev) => [...prev, data].sort((a, b) => a.currencyCode.localeCompare(b.currencyCode)));
      setAddOpen(false);
      setNewRate({ currencyCode: "", currencyName: "", buyRate: "", sellRate: "" });
    } catch {
      toast.error("Gagal menambah kurs.");
    } finally {
      setAdding(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/rates?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`🗑️ Kurs ${deleteTarget.currencyCode} dihapus`);
      setRates((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus kurs.");
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (v: string) =>
    Number(v).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Kurs</h1>
            <p className="text-sm text-muted-foreground">{rates.length} mata uang aktif</p>
          </div>
        </div>
        <Button id="btn-add-rate" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Tambah Kurs
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : rates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada data kurs.</p>
          <Button className="mt-4 gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Tambah Kurs Pertama
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 px-5 py-3 bg-muted/40 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mata Uang</span>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Beli (IDR)</span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Jual (IDR)</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</span>
          </div>

          <div className="divide-y divide-border">
            {rates.map((rate) => {
              const isEditing = editingId === rate.id;
              const isKnown = isKnownISO(rate.currencyCode);
              const displayName = getDisplayName(rate);

              return (
                <div
                  key={rate.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_auto] items-start gap-4 px-5 py-4 transition-colors ${
                    isEditing ? "bg-primary/5" : "hover:bg-muted/20"
                  }`}
                >
                  {/* Currency info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{getFlag(rate)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground">{rate.currencyCode}</p>

                      {/* Name: inline editable when editing */}
                      {isEditing ? (
                        <div className="mt-1 space-y-0.5">
                          <Input
                            id={`edit-name-${rate.id}`}
                            placeholder={isKnown ? CURRENCY_META[rate.currencyCode]?.name : "Nama mata uang…"}
                            className="h-7 text-xs px-2"
                            value={editValues.name}
                            onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(rate);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <p className="text-[10px] text-muted-foreground pl-0.5">
                            {isKnown
                              ? "Kosongkan untuk pakai nama ISO otomatis"
                              : "⚠️ Kode tidak dikenal — nama wajib diisi"}
                          </p>
                        </div>
                      ) : (
                        <p className={`text-xs truncate ${!isKnown && !rate.currencyName ? "text-amber-500" : "text-muted-foreground"}`}>
                          {!isKnown && !rate.currencyName ? (
                            <span className="flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" />
                              Nama belum diatur
                            </span>
                          ) : (
                            displayName
                          )}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground/50 mt-0.5">
                        {new Date(rate.updatedAt).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Buy rate */}
                  <div className="pt-0.5">
                    {isEditing ? (
                      <Input
                        id={`edit-buy-${rate.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        className="font-rate h-9 text-secondary"
                        value={editValues.buy}
                        onChange={(e) => setEditValues((p) => ({ ...p, buy: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(rate);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="font-rate font-semibold text-secondary text-sm">{fmt(rate.buyRate)}</span>
                    )}
                  </div>

                  {/* Sell rate */}
                  <div className="pt-0.5">
                    {isEditing ? (
                      <Input
                        id={`edit-sell-${rate.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        className="font-rate h-9 text-primary"
                        value={editValues.sell}
                        onChange={(e) => setEditValues((p) => ({ ...p, sell: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(rate);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <span className="font-rate font-semibold text-primary text-sm">{fmt(rate.sellRate)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-0.5">
                    {isEditing ? (
                      <>
                        <Button
                          id={`btn-confirm-edit-${rate.currencyCode}`}
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handleUpdate(rate)}
                          disabled={saving}
                          title="Simpan"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          id={`btn-cancel-edit-${rate.currencyCode}`}
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          onClick={cancelEdit}
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          id={`btn-edit-${rate.currencyCode}`}
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => startEdit(rate)}
                          title="Edit kurs & nama"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          id={`btn-delete-${rate.currencyCode}`}
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => setDeleteTarget({ id: rate.id, currencyCode: rate.currencyCode })}
                          title="Hapus kurs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && rates.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Klik ✏️ untuk mengedit kurs &amp; nama · Enter untuk menyimpan · Esc untuk batal
        </p>
      )}

      {/* ── Add Dialog ─────────────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Mata Uang Baru</DialogTitle>
            <DialogDescription>
              Masukkan kode ISO 3 huruf dan harga Beli/Jual dalam Rupiah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Currency code */}
            <div className="space-y-1.5">
              <Label htmlFor="new-code">Kode Mata Uang</Label>
              <Input
                id="new-code"
                placeholder="Contoh: EUR, SGD, OMR"
                maxLength={3}
                className="uppercase font-bold tracking-widest text-center text-lg"
                value={newRate.currencyCode}
                onChange={(e) => handleAddCodeChange(e.target.value)}
              />

              {/* Status indicator */}
              {addCode.length === 3 && (
                addKnown ? (
                  <p className="text-xs text-emerald-500 pl-1 flex items-center gap-1">
                    {addMeta.flag} {addMeta.name} — terdeteksi otomatis ✓
                  </p>
                ) : (
                  <p className="text-xs text-amber-500 pl-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Kode tidak dikenal — masukkan nama di bawah
                  </p>
                )
              )}
            </div>

            {/* Currency name — always shown, highlighted when unknown ISO */}
            <div className="space-y-1.5">
              <Label
                htmlFor="new-name"
                className={!addKnown && addCode.length === 3 ? "text-amber-500 font-semibold" : ""}
              >
                Nama Mata Uang
                {!addKnown && addCode.length === 3 && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </Label>
              <Input
                id="new-name"
                placeholder={
                  addKnown
                    ? `${addMeta?.name ?? "Otomatis terisi"} (bisa dikosongkan)`
                    : "Contoh: Riyal Oman, Franc Swiss…"
                }
                className={!addKnown && addCode.length === 3 && !newRate.currencyName ? "border-amber-500 focus:ring-amber-500" : ""}
                value={newRate.currencyName}
                onChange={(e) => setNewRate((p) => ({ ...p, currencyName: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground pl-1">
                {addKnown
                  ? "Kosongkan untuk pakai nama ISO otomatis. Isi untuk mengganti tampilan."
                  : "Wajib diisi karena kode tidak ada di daftar ISO yang dikenal."}
              </p>
            </div>

            {/* Buy & Sell */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-buy" className="text-secondary">Harga Beli (IDR)</Label>
                <Input
                  id="new-buy"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="font-rate"
                  value={newRate.buyRate}
                  onChange={(e) => setNewRate((p) => ({ ...p, buyRate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-sell" className="text-primary">Harga Jual (IDR)</Label>
                <Input
                  id="new-sell"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="font-rate"
                  value={newRate.sellRate}
                  onChange={(e) => setNewRate((p) => ({ ...p, sellRate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setNewRate({ currencyCode: "", currencyName: "", buyRate: "", sellRate: "" });
              }}
            >
              Batal
            </Button>
            <Button
              id="btn-confirm-add-rate"
              onClick={handleAdd}
              disabled={adding}
              className="gap-2"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Kurs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Hapus Kurs {deleteTarget?.currencyCode}?
            </DialogTitle>
            <DialogDescription>
              Tindakan ini tidak bisa dibatalkan. Data kurs{" "}
              <strong>{deleteTarget?.currencyCode}</strong> akan dihapus permanen dari database
              dan tidak akan ditampilkan di halaman publik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button
              id={`btn-confirm-delete-${deleteTarget?.currencyCode}`}
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
