import type { OperationalHour } from "@/db/schema";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatTime(time: string | null): string {
  if (!time) return "—";
  // time is HH:MM:SS or HH:MM
  return time.slice(0, 5);
}

function getCurrentDayOfWeek(): number {
  // Indonesia timezone (WIB = UTC+7)
  const now = new Date();
  const jakartaOffset = 7 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const jakarta = new Date(utc + jakartaOffset * 60000);
  return jakarta.getDay();
}

interface HoursTableProps {
  hours: OperationalHour[];
}

export function HoursTable({ hours }: HoursTableProps) {
  const today = getCurrentDayOfWeek();

  return (
    <section id="hours" className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-4">Jam Operasional</h2>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-3 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Hari</span>
          <span className="text-center">Buka</span>
          <span className="text-right">Tutup</span>
        </div>

        {hours.map((h, idx) => {
          const isToday = h.dayOfWeek === today;
          const isOpen = !h.isClosed;

          return (
            <div
              key={h.id}
              className={`grid grid-cols-3 items-center px-4 py-3 transition-colors ${
                idx < hours.length - 1 ? "border-b border-border" : ""
              } ${isToday ? "bg-primary/8 dark:bg-primary/12" : "hover:bg-muted/40"}`}
            >
              {/* Day */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    isToday ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {DAY_NAMES[h.dayOfWeek]}
                </span>
                {isToday && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Hari ini
                  </span>
                )}
              </div>

              {/* Open time */}
              <div className="text-center">
                {isOpen ? (
                  <span className={`font-time text-sm font-semibold text-secondary`}>
                    {formatTime(h.openTime)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Libur</span>
                )}
              </div>

              {/* Close time */}
              <div className="text-right">
                {isOpen ? (
                  <span className={`font-time text-sm font-semibold text-primary`}>
                    {formatTime(h.closeTime)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
