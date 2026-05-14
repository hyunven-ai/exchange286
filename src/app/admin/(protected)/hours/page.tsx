"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Clock } from "lucide-react";

interface OperationalHour {
  id: number;
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function AdminHoursPage() {
  const [hours, setHours] = useState<OperationalHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [edits, setEdits] = useState<Record<number, { open: string; close: string; isClosed: boolean }>>({});

  useEffect(() => {
    fetch("/api/admin/hours")
      .then((r) => r.json())
      .then((data: OperationalHour[]) => {
        setHours(data);
        const init: Record<number, { open: string; close: string; isClosed: boolean }> = {};
        data.forEach((h) => {
          init[h.id] = {
            open: h.openTime?.slice(0, 5) ?? "08:00",
            close: h.closeTime?.slice(0, 5) ?? "17:00",
            isClosed: h.isClosed,
          };
        });
        setEdits(init);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (h: OperationalHour) => {
    setSaving(h.id);
    try {
      const edit = edits[h.id];
      const res = await fetch("/api/admin/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: h.id,
          openTime: edit.open,
          closeTime: edit.close,
          isClosed: edit.isClosed,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${DAY_NAMES[h.dayOfWeek]} berhasil disimpan`);
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jam Operasional</h1>
          <p className="text-sm text-muted-foreground">Atur hari dan jam buka-tutup layanan</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {hours.map((h) => {
            const edit = edits[h.id] ?? { open: "08:00", close: "17:00", isClosed: false };
            return (
              <div
                key={h.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground">{DAY_NAMES[h.dayOfWeek]}</h2>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`closed-${h.id}`} className="text-xs text-muted-foreground">
                      Libur
                    </Label>
                    <Switch
                      id={`closed-${h.id}`}
                      checked={edit.isClosed}
                      onCheckedChange={(checked) =>
                        setEdits((prev) => ({
                          ...prev,
                          [h.id]: { ...prev[h.id], isClosed: checked },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 transition-opacity ${edit.isClosed ? "opacity-40 pointer-events-none" : ""}`}>
                  <div className="space-y-1">
                    <Label htmlFor={`open-${h.id}`} className="text-xs text-secondary">Jam Buka</Label>
                    <Input
                      id={`open-${h.id}`}
                      type="time"
                      className="font-time"
                      value={edit.open}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [h.id]: { ...prev[h.id], open: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`close-${h.id}`} className="text-xs text-primary">Jam Tutup</Label>
                    <Input
                      id={`close-${h.id}`}
                      type="time"
                      className="font-time"
                      value={edit.close}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [h.id]: { ...prev[h.id], close: e.target.value } }))
                      }
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3 gap-2"
                  onClick={() => handleSave(h)}
                  disabled={saving === h.id}
                  id={`btn-save-hours-${h.dayOfWeek}`}
                >
                  {saving === h.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Simpan
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
