"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Building2 } from "lucide-react";
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
  isActive: boolean;
}

export default function AdminBanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchBanks = () => {
    fetch("/api/admin/banks")
      .then((r) => r.json())
      .then(setBanks)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanks(); }, []);

  const handleToggle = async (bank: Bank) => {
    setToggling(bank.id);
    try {
      await fetch("/api/admin/banks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bank.id, bankName: bank.bankName, bankCode: bank.bankCode, isActive: !bank.isActive }),
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

  const handleAdd = async () => {
    if (!newName || !newCode) return toast.warning("Lengkapi nama dan kode bank");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName: newName, bankCode: newCode.toUpperCase() }),
      });
      if (!res.ok) throw new Error();
      const added = await res.json();
      setBanks((prev) => [...prev, added]);
      setNewName(""); setNewCode("");
      setDialogOpen(false);
      toast.success(`${newCode.toUpperCase()} berhasil ditambahkan`);
    } catch {
      toast.error("Gagal menambahkan bank. Pastikan kode unik.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bank Mitra</h1>
            <p className="text-sm text-muted-foreground">Kelola daftar bank yang bermitra</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button id="btn-add-bank" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Tambah Bank
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Bank Mitra</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="bank-name">Nama Bank</Label>
                <Input id="bank-name" placeholder="Bank Central Asia" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-code">Kode Bank</Label>
                <Input id="bank-code" placeholder="BCA" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} maxLength={20} />
              </div>
              <Button className="w-full gap-2" onClick={handleAdd} disabled={adding} id="btn-confirm-add-bank">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tambahkan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {banks.map((bank, idx) => (
            <div
              key={bank.id}
              className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${
                idx < banks.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Bank info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{bank.bankCode}</span>
                  <Badge variant={bank.isActive ? "default" : "secondary"} className="text-[10px]">
                    {bank.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{bank.bankName}</p>
              </div>

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
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <div className="py-12 text-center text-muted-foreground text-sm">
              Belum ada bank. Klik &quot;Tambah Bank&quot; untuk memulai.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
