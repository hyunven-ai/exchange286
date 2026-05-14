import type { SupportedBank } from "@/db/schema";

const BANK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BCA:     { bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800"   },
  MANDIRI: { bg: "bg-yellow-50 dark:bg-yellow-950/40", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800" },
  BRI:     { bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-800 dark:text-blue-200",   border: "border-blue-200 dark:border-blue-800"   },
  BNI:     { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  CIMB:   { bg: "bg-red-50 dark:bg-red-950/40",     text: "text-red-700 dark:text-red-300",     border: "border-red-200 dark:border-red-800"     },
};

const DEFAULT_COLOR = { bg: "bg-muted", text: "text-foreground", border: "border-border" };

interface BanksGridProps {
  banks: SupportedBank[];
}

export function BanksGrid({ banks }: BanksGridProps) {
  if (banks.length === 0) return null;

  return (
    <section id="banks" className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-4">Bank Mitra</h2>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs text-muted-foreground mb-4">
          Exchange 286 bekerja sama dengan bank-bank terkemuka di Indonesia untuk kemudahan transaksi Anda.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {banks.map((bank) => {
            const colors = BANK_COLORS[bank.bankCode] ?? DEFAULT_COLOR;
            return (
              <div
                key={bank.id}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-transform hover:scale-105 ${colors.bg} ${colors.border}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${colors.text} ${colors.bg} border-2 ${colors.border}`}
                >
                  {bank.bankCode.slice(0, 3)}
                </div>
                <span className={`text-xs font-semibold text-center leading-tight ${colors.text}`}>
                  {bank.bankName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
