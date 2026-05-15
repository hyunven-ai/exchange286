import type { ExchangeRate } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const CURRENCY_META: Record<
  string,
  { flag: string; name: string; fullName: string }
> = {
  USD: { flag: "🇺🇸", name: "Dolar AS",         fullName: "United States Dollar"   },
  SAR: { flag: "🇸🇦", name: "Riyal Saudi",       fullName: "Saudi Arabian Riyal"    },
  THB: { flag: "🇹🇭", name: "Baht Thai",         fullName: "Thai Baht"              },
  EUR: { flag: "🇪🇺", name: "Euro",              fullName: "Euro"                   },
  SGD: { flag: "🇸🇬", name: "Dolar Singapura",   fullName: "Singapore Dollar"       },
  MYR: { flag: "🇲🇾", name: "Ringgit Malaysia",  fullName: "Malaysian Ringgit"      },
  AUD: { flag: "🇦🇺", name: "Dolar Australia",   fullName: "Australian Dollar"      },
  JPY: { flag: "🇯🇵", name: "Yen Jepang",        fullName: "Japanese Yen"           },
  GBP: { flag: "🇬🇧", name: "Pound Inggris",     fullName: "British Pound"          },
  CNY: { flag: "🇨🇳", name: "Yuan China",        fullName: "Chinese Yuan"           },
  KWD: { flag: "🇰🇼", name: "Dinar Kuwait",      fullName: "Kuwaiti Dinar"          },
  AED: { flag: "🇦🇪", name: "Dirham UAE",        fullName: "UAE Dirham"             },
  OMR: { flag: "🇴🇲", name: "Riyal Oman",        fullName: "Omani Rial"             },
  QAR: { flag: "🇶🇦", name: "Riyal Qatar",       fullName: "Qatari Riyal"           },
  CHF: { flag: "🇨🇭", name: "Franc Swiss",       fullName: "Swiss Franc"            },
};

function formatRate(value: string | number): string {
  return Number(value).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface RatesTableProps {
  rates: (ExchangeRate & { currencyName?: string | null })[];
}

export function RatesTable({ rates }: RatesTableProps) {
  return (
    <section id="rates" className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-foreground">Kurs Hari Ini</h2>
        <Badge variant="secondary" className="text-xs">
          Live
        </Badge>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-3 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Mata Uang</span>
          <span className="text-center">Beli (IDR)</span>
          <span className="text-right">Jual (IDR)</span>
        </div>

        {/* Rows */}
        {rates.map((rate, idx) => {
          const meta = CURRENCY_META[rate.currencyCode];
          // DB custom name > CURRENCY_META > code itself
          const displayName = (rate as ExchangeRate & { currencyName?: string | null }).currencyName
            || meta?.name
            || rate.currencyCode;
          const flag = meta?.flag ?? "💱";

          return (
            <div
              key={rate.id}
              className={`grid grid-cols-3 items-center px-4 py-4 transition-colors hover:bg-muted/40 ${
                idx < rates.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Currency info */}
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-bold text-foreground text-sm">
                    {rate.currencyCode}
                  </p>
                  <p className="text-xs text-muted-foreground">{displayName}</p>
                </div>
              </div>

              {/* Buy rate */}
              <div className="text-center">
                <span className="font-rate text-base font-semibold text-secondary">
                  {formatRate(rate.buyRate)}
                </span>
              </div>

              {/* Sell rate */}
              <div className="text-right">
                <span className="font-rate text-base font-semibold text-primary">
                  {formatRate(rate.sellRate)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last updated */}
      {rates[0] && (
        <p className="text-xs text-muted-foreground mt-2 text-right">
          Diperbarui:{" "}
          <span className="font-rate">
            {new Date(rates[0].updatedAt).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </p>
      )}
    </section>
  );
}
