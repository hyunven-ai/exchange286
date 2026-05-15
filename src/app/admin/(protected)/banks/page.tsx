"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Building2,
  Pencil,
  ShoppingCart,
  Info,
  Eye,
  EyeOff,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Bank {
  id: number;
  bankName: string;
  bankCode: string;
  accountNumber?: string | null;
  accountName?: string | null;
  isActive: boolean;
}

const emptyForm = { bankName: "", bankCode: "", accountNumber: "", accountName: "" };

export default function AdminBanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bank | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const fetchBanks = () => {
    fetch("/api/admin/banks")
      .then((r) => r.json())
      .then(setBanks)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanks(); }, []);

  const openAddDialog = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (bank: Bank) => {
    setEditTarget(bank);
    setForm({
      bankName: bank.bankName,
      bankCode: bank.bankCode,
      accountNumber: bank.accountNumber ?? "",
      accountName: bank.accountName ?? "",
    });
    setDialogOpen(true);
  };

  const handleToggle = async (bank: Bank) => {
    setToggling(bank.id);
    try {
      await fetch("/api/admin/banks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bank.id,
          bankName: bank.bankName,
          bankCode: bank.bankCode,
          accountNumber: bank.accountNumber,
          accountName: bank.accountName,
          isActive: !bank.isActive,
        }),
      });
      setBanks((prev) =>
        prev.map((b) => (b.id === bank.id ? { ...b, isActive: !b.isActive } : b))
      );
      toast.success(`${bank.bankCode} ${!bank.isActive ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      toast.error("Gagal mengubah status bank");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (bank: Bank) => {
    if (!confirm(`Hapus ${bank.bankName}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(bank.id);
    try {
      await fetch(`/api/admin/banks?id=${bank.id}`, { method: "DELETE" });
      setBanks((prev) => prev.filter((b) => b.id !== bank.id));
      toast.success(`${bank.bankCode} dihapus`);
    } catch {
      toast.error("Gagal menghapus bank");
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = async () => {
    if (!form.bankName || !form.bankCode) return toast.warning("Lengkapi nama dan kode bank");
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch("/api/admin/banks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editTarget.id,
            bankName: form.bankName,
            bankCode: form.bankCode.toUpperCase(),
            accountNumber: form.accountNumber || null,
            accountName: form.accountName || null,
            isActive: editTarget.isActive,
          }),
        });
        if (!res.ok) throw new Error();
        setBanks((prev) =>
          prev.map((b) =>
            b.id === editTarget.id
              ? { ...b, ...form, bankCode: form.bankCode.toUpperCase(), accountNumber: form.accountNumber || null, accountName: form.accountName || null }
              : b
          )
        );
        toast.success(`${form.bankCode.toUpperCase()} berhasil diperbarui`);
      } else {
        const res = await fetch("/api/admin/banks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankName: form.bankName,
            bankCode: form.bankCode.toUpperCase(),
            accountNumber: form.accountNumber || null,
            accountName: form.accountName || null,
          }),
        });
        if (!res.ok) throw new Error();
        const added = await res.json();
        setBanks((prev) => [...prev, added]);
        toast.success(`${form.bankCode.toUpperCase()} berhasil ditambahkan`);
      }
      setDialogOpen(false);
    } catch {
      toast.error(editTarget ? "Gagal memperbarui bank." : "Gagal menambahkan bank. Pastikan kode unik.");
    } finally {
      setSaving(false);
    }
  };

  const activeBanks = banks.filter((b) => b.isActive);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bank Tujuan Transfer</h1>
            <p className="text-sm text-muted-foreground">
              Rekening Exchange 286 yang tampil di form <span className="font-semibold text-primary">Order Beli Valas</span>
            </p>
          </div>
        </div>
        <Button id="btn-add-bank" className="gap-2" onClick={openAddDialog}>
          <Plus className="w-4 h-4" /> Tambah Bank
        </Button>
      </div>

      {/* ── Info Banner ── */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex gap-3">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Bank Tujuan Transfer</span> adalah rekening Exchange 286 yang akan ditampilkan kepada customer saat mereka memilih
            {" "}<span className="font-semibold text-amber-500">Beli Valas</span> di kalkulator kurs.
          </p>
          <p>Pastikan <span className="font-semibold text-foreground">Nomor Rekening</span> dan <span className="font-semibold text-foreground">Nama Pemilik</span> diisi dengan benar agar customer dapat melakukan transfer dengan tepat.</p>
          <p>Bank yang <span className="font-semibold text-foreground">Nonaktif</span> tidak akan muncul di form pelanggan.</p>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-3.5 border-b border-border hover:bg-muted/30 transition-colors"
          onClick={() => setShowPreview((v) => !v)}
          id="btn-toggle-preview"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            Preview — Tampilan di Form Order Beli Valas
          </div>
          {showPreview ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showPreview && (
          <div className="p-4">
            <div className="rounded-xl border border-border bg-background p-4 space-y-3 max-w-sm mx-auto">
              <label className="text-xs font-medium text-muted-foreground">
                Bank Tujuan Transfer{" "}
                <span className="text-muted-foreground/60">(rekening Exchange 286)</span>
              </label>

              {/* Simulated select */}
              <div className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-muted-foreground">
                — Pilih Bank —
              </div>

              {/* Active bank list preview */}
              {activeBanks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Pilihan tersedia ({activeBanks.length})
                  </p>
                  {activeBanks.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3 text-primary" />
                        <span className="font-bold text-foreground">{b.bankCode}</span>
                        <span className="text-muted-foreground">— {b.bankName}</span>
                      </div>
                      {b.accountNumber && (
                        <div className="mt-1 pl-5 space-y-0.5">
                          <p className="text-muted-foreground">
                            No. Rek:{" "}
                            <span className="font-rate font-bold text-foreground">{b.accountNumber}</span>
                          </p>
                          {b.accountName && (
                            <p className="text-muted-foreground">
                              a.n. <span className="font-semibold text-foreground">{b.accountName}</span>
                            </p>
                          )}
                        </div>
                      )}
                      {!b.accountNumber && (
                        <p className="mt-1 pl-5 text-amber-500/80">⚠ No. rekening belum diisi</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Belum ada bank aktif. Tambahkan dan aktifkan bank di bawah.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── CRUD Table ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-2.5 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground gap-3">
            <span>Bank &amp; Rekening</span>
            <span>Edit</span>
            <span>Aktif</span>
            <span>Hapus</span>
          </div>

          {banks.map((bank) => (
            <div
              key={bank.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-4 border-b border-border last:border-0 transition-colors hover:bg-muted/20 gap-3"
            >
              {/* Bank info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">{bank.bankCode}</span>
                  <span className="text-sm text-muted-foreground">{bank.bankName}</span>
                  <Badge
                    variant={bank.isActive ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {bank.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                {/* Account details */}
                {bank.accountNumber ? (
                  <div className="mt-1.5 inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-1.5">
                    <CreditCard className="w-3 h-3 text-primary shrink-0" />
                    <div className="text-xs">
                      <span className="font-rate font-bold text-foreground">{bank.accountNumber}</span>
                      {bank.accountName && (
                        <span className="text-muted-foreground ml-1.5">a.n. {bank.accountName}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-amber-500">
                    <span>⚠</span>
                    <span>Nomor rekening belum diisi — tidak akan tampil di form pelanggan</span>
                  </div>
                )}
              </div>

              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                id={`btn-edit-bank-${bank.id}`}
                onClick={() => openEditDialog(bank)}
                className="text-muted-foreground hover:text-foreground shrink-0"
                title="Edit bank"
              >
                <Pencil className="w-4 h-4" />
              </Button>

              {/* Toggle */}
              <Switch
                id={`toggle-bank-${bank.id}`}
                checked={bank.isActive}
                disabled={toggling === bank.id}
                onCheckedChange={() => handleToggle(bank)}
                aria-label={`Toggle ${bank.bankCode}`}
              />

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                id={`btn-delete-bank-${bank.id}`}
                disabled={deleting === bank.id}
                onClick={() => handleDelete(bank)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                title="Hapus bank"
              >
                {deleting === bank.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}

          {banks.length === 0 && (
            <div className="py-14 text-center space-y-2">
              <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Belum ada bank. Klik &quot;Tambah Bank&quot; untuk memulai.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editTarget ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editTarget ? "Edit Bank Tujuan Transfer" : "Tambah Bank Tujuan Transfer"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Bank identity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bank-name">Nama Bank</Label>
                <Input
                  id="bank-name"
                  placeholder="Bank Central Asia"
                  value={form.bankName}
                  onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-code">Kode Bank</Label>
                <Input
                  id="bank-code"
                  placeholder="BCA"
                  value={form.bankCode}
                  onChange={(e) => setForm((f) => ({ ...f, bankCode: e.target.value.toUpperCase() }))}
                  maxLength={20}
                />
              </div>
            </div>

            {/* Divider with label */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" />
                Data Rekening (ditampilkan ke customer)
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bank-account-number">
                Nomor Rekening
                <span className="ml-1 text-xs text-muted-foreground font-normal">(wajib agar muncul di form)</span>
              </Label>
              <Input
                id="bank-account-number"
                placeholder="1234567890"
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className="font-rate"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bank-account-name">Nama Pemilik Rekening</Label>
              <Input
                id="bank-account-name"
                placeholder="Exchange 286"
                value={form.accountName}
                onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
              />
            </div>

            {/* Preview pill */}
            {(form.bankCode || form.accountNumber) && (
              <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5 text-xs space-y-1">
                <p className="text-muted-foreground font-medium">Preview di dropdown pelanggan:</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3 h-3 text-primary" />
                  <span className="font-bold">{form.bankCode || "KODE"}</span>
                  <span className="text-muted-foreground">— {form.bankName || "Nama Bank"}</span>
                </div>
                {form.accountNumber && (
                  <div className="pl-5">
                    <p>No. Rek: <span className="font-rate font-bold text-foreground">{form.accountNumber}</span></p>
                    {form.accountName && <p>a.n. {form.accountName}</p>}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full gap-2"
              onClick={handleSave}
              disabled={saving}
              id="btn-confirm-save-bank"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editTarget ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {editTarget ? "Simpan Perubahan" : "Tambahkan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
