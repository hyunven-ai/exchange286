"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator, ArrowLeftRight, ChevronDown } from "lucide-react";
import type { ExchangeRate } from "@/db/schema";

const CURRENCY_META: Record<string, { flag: string; name: string }> = {
  USD: { flag: "🇺🇸", name: "Dolar AS" },
  SAR: { flag: "🇸🇦", name: "Riyal Saudi" },
  THB: { flag: "🇹🇭", name: "Baht Thai" },
  EUR: { flag: "🇪🇺", name: "Euro" },
  SGD: { flag: "🇸🇬", name: "Dolar Singapura" },
  MYR: { flag: "🇲🇾", name: "Ringgit Malaysia" },
  AUD: { flag: "🇦🇺", name: "Dolar Australia" },
  JPY: { flag: "🇯🇵", name: "Yen Jepang" },
  GBP: { flag: "🇬🇧", name: "Pound Inggris" },
  CNY: { flag: "🇨🇳", name: "Yuan China" },
  KWD: { flag: "🇰🇼", name: "Dinar Kuwait" },
  AED: { flag: "🇦🇪", name: "Dirham UAE" },
};

type Direction = "buy" | "sell";

interface CurrencyCalculatorProps {
  rates: ExchangeRate[];
}

export function CurrencyCalculator({ rates }: CurrencyCalculatorProps) {
  const [amount, setAmount] = useState("1");
  const [selectedCode, setSelectedCode] = useState(rates[0]?.currencyCode ?? "USD");
  const [direction, setDirection] = useState<Direction>("sell"); // sell = user gives IDR, gets foreign
  const [result, setResult] = useState<number | null>(null);
  const [dropOpen, setDropOpen] = useState(false);

  const selectedRate = rates.find((r) => r.currencyCode === selectedCode);

  const calculate = useCallback(() => {
    const num = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (!selectedRate || isNaN(num) || num <= 0) {
      setResult(null);
      return;
    }

    const rate =
      direction === "sell"
        ? parseFloat(selectedRate.sellRate) // user buys foreign → pays IDR at sell rate
        : parseFloat(selectedRate.buyRate);  // user sells foreign → gets IDR at buy rate

    setResult(direction === "sell" ? num * rate : num * rate);
  }, [amount, selectedCode, direction, selectedRate]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const fmt = (n: number) =>
    n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const fromCurrency = direction === "sell" ? selectedCode : "IDR";
  const toCurrency = direction === "sell" ? "IDR" : selectedCode;
  const fromLabel = direction === "sell" ? "Saya punya" : "Saya punya (IDR)";
  const toLabel = direction === "sell" ? "Saya terima (IDR)" : `Saya terima (${selectedCode})`;

  return (
    <section id="calculator" className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-foreground">Kalkulator Kurs</h2>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Direction tabs */}
        <div className="grid grid-cols-2 border-b border-border">
          <button
            id="calc-tab-sell"
            onClick={() => setDirection("sell")}
            className={`py-3 text-sm font-semibold transition-colors ${
              direction === "sell"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            💸 Saya Beli Valas
          </button>
          <button
            id="calc-tab-buy"
            onClick={() => setDirection("buy")}
            className={`py-3 text-sm font-semibold transition-colors ${
              direction === "buy"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            🏦 Saya Jual Valas
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Currency selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Mata Uang</label>
            <div className="relative">
              <button
                id="calc-currency-selector"
                onClick={() => setDropOpen((o) => !o)}
                className="w-full flex items-center gap-3 rounded-xl border border-input bg-background px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
              >
                <span className="text-xl">
                  {CURRENCY_META[selectedCode]?.flag ?? "💱"}
                </span>
                <span className="flex-1 text-left font-semibold">{selectedCode}</span>
                <span className="text-muted-foreground text-xs">
                  {CURRENCY_META[selectedCode]?.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    dropOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropOpen && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                  {rates.map((r) => {
                    const m = CURRENCY_META[r.currencyCode];
                    return (
                      <button
                        key={r.currencyCode}
                        onClick={() => {
                          setSelectedCode(r.currencyCode);
                          setDropOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${
                          selectedCode === r.currencyCode ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        <span className="text-xl">{m?.flag ?? "💱"}</span>
                        <span className="font-semibold">{r.currencyCode}</span>
                        <span className="text-muted-foreground text-xs flex-1 text-left">
                          {m?.name}
                        </span>
                        <span className="font-rate text-xs text-muted-foreground">
                          Jual: {Number(r.sellRate).toLocaleString("id-ID")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Amount input + result */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            {/* From */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{fromLabel}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  {fromCurrency}
                </span>
                <input
                  id="calc-amount-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-12 pr-3 py-3 text-right font-rate text-base font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Swap button */}
            <button
              id="calc-swap-btn"
              onClick={() => setDirection((d) => (d === "sell" ? "buy" : "sell"))}
              title="Balik arah"
              className="mb-0.5 p-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* To */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{toLabel}</label>
              <div className="relative rounded-xl border border-primary/30 bg-primary/5 px-3 py-3 min-h-[48px] flex items-center justify-between">
                <span className="text-xs font-bold text-primary/60">{toCurrency}</span>
                <span className="font-rate text-base font-bold text-primary">
                  {result !== null ? fmt(result) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Rate info */}
          {selectedRate && (
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                Rate yang digunakan:{" "}
                <span className="font-rate font-semibold text-foreground">
                  {direction === "sell"
                    ? `Jual ${Number(selectedRate.sellRate).toLocaleString("id-ID")}`
                    : `Beli ${Number(selectedRate.buyRate).toLocaleString("id-ID")}`}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                Estimasi
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            * Kalkulator ini bersifat estimasi. Kurs aktual dapat berbeda saat transaksi.
          </p>
        </div>
      </div>
    </section>
  );
}
