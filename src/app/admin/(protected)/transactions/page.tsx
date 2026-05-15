"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShoppingCart,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Clock,
} from "lucide-react";

interface TxRow {
  id: number;
  type: string;
  currencyCode: string;
  amount: string;
  rate: string;
  idrAmount: string;
  bankId: number | null;
  bankName: string | null;
  bankCode: string | null;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending:   { label: "Menunggu",   variant: "secondary",   icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: "Dikonfirmasi", variant: "default",  icon: <CheckCircle className="w-3 h-3" /> },
  done:      { label: "Selesai",    variant: "default",     icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Dibatalkan", variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
};

function fmt(n: string | number) {
  return Number(n).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/transactions");
      const data = await res.json();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const handleStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success(`Status diubah ke "${STATUS_CONFIG[status]?.label ?? status}"`);
    } catch {
      toast.error("Gagal mengubah status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus transaksi ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/transactions?id=${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Transaksi dihapus");
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    confirmed: rows.filter((r) => r.status === "confirmed").length,
    done: rows.filter((r) => r.status === "done").length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transaksi</h1>
            <p className="text-sm text-muted-foreground">Order beli/jual valas dari pelanggan</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRows} id="btn-refresh-transactions" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "done", "cancelled"] as const).map((s) => (
          <button
            key={s}
            id={`filter-${s}`}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "all" ? "Semua" : STATUS_CONFIG[s]?.label ?? s}
            {" "}
            <span className="opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground text-sm">
          Tidak ada transaksi ditemukan.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {filtered.map((row) => {
            const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.pending;
            const isBuy = row.type === "buy"; // store sells foreign = customer buys
            return (
              <div key={row.id} className="px-5 py-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">#{row.id}</span>
                    <div
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isBuy
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {isBuy ? <ShoppingCart className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      {isBuy ? "Beli Valas" : "Jual Valas"}
                    </div>
                    <Badge variant={cfg.variant} className="gap-1 text-[10px]">
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{fmtDate(row.createdAt)}</span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Mata Uang</p>
                    <p className="font-semibold">{row.currencyCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nominal</p>
                    <p className="font-rate font-bold">{row.currencyCode} {fmt(row.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {isBuy ? "Pembayaran (IDR)" : "Diterima (IDR)"}
                    </p>
                    <p className="font-rate font-bold text-primary">IDR {fmt(row.idrAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="font-rate text-xs">{Number(row.rate).toLocaleString("id-ID")}</p>
                  </div>
                </div>

                {/* Customer + Bank */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Pelanggan</p>
                    <p className="font-medium">{row.customerName ?? "—"}</p>
                    {row.customerPhone && (
                      <p className="text-xs text-muted-foreground">{row.customerPhone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bank Tujuan</p>
                    <p className="font-medium">{row.bankCode ? `${row.bankCode} — ${row.bankName}` : "—"}</p>
                  </div>
                </div>

                {row.notes && (
                  <p className="text-xs text-muted-foreground italic">📝 {row.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {row.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        id={`btn-confirm-tx-${row.id}`}
                        disabled={updating === row.id}
                        onClick={() => handleStatus(row.id, "confirmed")}
                        className="gap-1.5 h-8 text-xs"
                      >
                        {updating === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Konfirmasi
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        id={`btn-cancel-tx-${row.id}`}
                        disabled={updating === row.id}
                        onClick={() => handleStatus(row.id, "cancelled")}
                        className="gap-1.5 h-8 text-xs"
                      >
                        <XCircle className="w-3 h-3" />
                        Batalkan
                      </Button>
                    </>
                  )}
                  {row.status === "confirmed" && (
                    <Button
                      size="sm"
                      id={`btn-done-tx-${row.id}`}
                      disabled={updating === row.id}
                      onClick={() => handleStatus(row.id, "done")}
                      className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updating === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Selesaikan
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    id={`btn-delete-tx-${row.id}`}
                    disabled={deleting === row.id}
                    onClick={() => handleDelete(row.id)}
                    className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  >
                    {deleting === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
