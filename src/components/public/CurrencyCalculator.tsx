"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator, ArrowLeftRight, ChevronDown, ShoppingCart, Send, X, CheckCircle } from "lucide-react";
import type { ExchangeRate, SupportedBank } from "@/db/schema";

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
  banks: SupportedBank[];
}

type ModalStep = "form" | "success";

export function CurrencyCalculator({ rates, banks }: CurrencyCalculatorProps) {
  const [amount, setAmount] = useState("1");
  const [selectedCode, setSelectedCode] = useState(rates[0]?.currencyCode ?? "USD");
  const [direction, setDirection] = useState<Direction>("sell"); // sell = user gives IDR, gets foreign
  const [result, setResult] = useState<number | null>(null);
  const [dropOpen, setDropOpen] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("form");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<number | "">("");
  // Jual Valas: customer's own bank details
  const [customerBank, setCustomerBank] = useState("");
  const [customerAccountName, setCustomerAccountName] = useState("");
  const [customerAccountNumber, setCustomerAccountNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [waNumber, setWaNumber] = useState("");

  // Fetch admin WA number once
  useEffect(() => {
    fetch("/api/settings/whatsapp")
      .then((r) => r.json())
      .then((d) => setWaNumber(d.whatsappNumber ?? ""))
      .catch(() => {});
  }, []);

  const selectedRate = rates.find((r) => r.currencyCode === selectedCode);

  const calculate = useCallback(() => {
    const num = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (!selectedRate || isNaN(num) || num <= 0) {
      setResult(null);
      return;
    }

    if (direction === "sell") {
      // Beli Valas: client inputs valas amount they WANT to buy → pays IDR
      // valas × sellRate = IDR to pay
      const rate = parseFloat(selectedRate.sellRate);
      setResult(num * rate);
    } else {
      // Jual Valas: client inputs valas amount they HAVE → receives IDR
      // valas × buyRate = IDR received
      const rate = parseFloat(selectedRate.buyRate);
      setResult(num * rate);
    }
  }, [amount, selectedCode, direction, selectedRate]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const fmt = (n: number) =>
    n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Beli Valas (sell): client inputs valas to buy → total IDR to pay
  // Jual Valas (buy):  client inputs valas they have → IDR received
  // Both modes: input = valas, output = IDR
  const fromCurrency = selectedCode;
  const toCurrency   = "IDR";
  const fromLabel    = direction === "sell"
    ? `Jumlah ${selectedCode} yang ingin dibeli`
    : `Saya punya (${selectedCode})`;
  const toLabel      = direction === "sell" ? "Total bayar (IDR)" : "Saya terima (IDR)";

  const activeRate = selectedRate
    ? direction === "sell"
      ? parseFloat(selectedRate.sellRate)
      : parseFloat(selectedRate.buyRate)
    : 0;

  const numAmount = parseFloat(amount) || 0;

  const openModal = () => {
    setModalStep("form");
    setCustomerName("");
    setCustomerPhone("");
    setSelectedBankId("");
    setCustomerBank("");
    setCustomerAccountName("");
    setCustomerAccountNumber("");
    setNotes("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) return;
    setSubmitting(true);
    try {
      const selectedBankObj = direction === "sell" && selectedBankId !== ""
        ? banks.find((b) => b.id === selectedBankId)
        : null;

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: direction === "sell" ? "buy" : "sell",
          currencyCode: selectedCode,
          amount: numAmount,
          rate: activeRate,
          idrAmount: result ?? 0,
          bankId: direction === "sell" ? (selectedBankId || null) : null,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || null,
          notes: [
            notes.trim(),
            direction === "buy" && customerBank ? `Bank: ${customerBank}` : "",
            direction === "buy" && customerAccountName ? `Nama Rek: ${customerAccountName}` : "",
            direction === "buy" && customerAccountNumber ? `No. Rek: ${customerAccountNumber}` : "",
          ].filter(Boolean).join(" | ") || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.id);
        setModalStep("success");

        // ── Build WhatsApp message ──────────────────────────────
        if (waNumber) {
          const tipe = direction === "sell" ? "Beli Valas" : "Jual Valas";
          const nominalStr = `${selectedCode} ${fmt(numAmount)}`;
          const idrStr = `IDR ${result !== null ? fmt(result) : "0"}`;
          const rateStr = `1 ${selectedCode} = IDR ${activeRate.toLocaleString("id-ID")}`;

          const lines: string[] = [
            `*Order #${data.id} — ${tipe}*`,
            ``,
            `*Mata Uang:* ${CURRENCY_META[selectedCode]?.flag ?? ""} ${selectedCode} (${CURRENCY_META[selectedCode]?.name ?? ""})`,
            `*Tipe:* ${tipe}`,
            `*Nominal:* ${nominalStr}`,
            direction === "sell"
              ? `*Total Bayar (IDR):* ${idrStr}`
              : `*Diterima (IDR):* ${idrStr}`,
            `*Rate:* ${rateStr}`,

            ``,
            `*Nama:* ${customerName.trim()}`,
            customerPhone.trim() ? `*No. HP:* ${customerPhone.trim()}` : "",
          ];

          // Beli Valas: tampilkan bank Exchange 286 yang dipilih
          if (direction === "sell" && selectedBankObj) {
            lines.push(``);
            lines.push(`*Bank Tujuan Transfer:* ${selectedBankObj.bankCode} — ${selectedBankObj.bankName}`);
            if (selectedBankObj.accountNumber) lines.push(`*No. Rekening:* ${selectedBankObj.accountNumber}`);
            if (selectedBankObj.accountName) lines.push(`*Atas Nama:* ${selectedBankObj.accountName}`);
          }

          // Jual Valas: tampilkan rekening customer
          if (direction === "buy" && customerBank) {
            lines.push(``);
            lines.push(`*Rekening Penerima IDR:*`);
            lines.push(`Bank: ${customerBank}`);
            if (customerAccountName) lines.push(`Nama: ${customerAccountName}`);
            if (customerAccountNumber) lines.push(`No. Rek: ${customerAccountNumber}`);
          }

          if (notes.trim()) {
            lines.push(``);
            lines.push(`*Catatan:* ${notes.trim()}`);
          }

          const msg = lines.filter((l) => l !== null && l !== undefined).join("\n");
          const waUrl = `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;

          // Small delay so success screen is visible briefly before redirect
          setTimeout(() => { window.open(waUrl, "_blank", "noopener,noreferrer"); }, 800);
        }
      }
    } catch {
      // silently ignore, keep modal open
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
                    <div className="overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
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

            {/* CTA Button */}
            {result !== null && numAmount > 0 && (
              <button
                id="calc-cta-order"
                onClick={openModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 shadow-md active:scale-95"
                style={{
                  background: direction === "sell"
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#fff",
                }}
              >
                {direction === "sell" ? (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Beli {selectedCode} Sekarang
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Jual {selectedCode} Sekarang
                  </>
                )}
              </button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              * Kalkulator ini bersifat estimasi. Kurs aktual dapat berbeda saat transaksi.
            </p>
          </div>
        </div>
      </section>

      {/* ── Transaction Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {modalStep === "form" ? (
              <>
                {/* Modal Header */}
                <div
                  className="px-5 py-4 flex items-center justify-between border-b border-border"
                  style={{
                    background: direction === "sell"
                      ? "linear-gradient(135deg, #f59e0b22, #d9770611)"
                      : "linear-gradient(135deg, #3b82f622, #1d4ed811)",
                  }}
                >
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      {direction === "sell" ? "Order Beli Valas" : "Order Jual Valas"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Lengkapi data transaksi Anda</p>
                  </div>
                  <button
                    id="modal-close-btn"
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Summary Card */}
                  <div className="rounded-xl bg-muted/40 border border-border px-4 py-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ringkasan Transaksi</p>
                    <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                      <span className="text-muted-foreground">Mata Uang</span>
                      <span className="font-semibold text-right">{CURRENCY_META[selectedCode]?.flag} {selectedCode} — {CURRENCY_META[selectedCode]?.name}</span>

                      <span className="text-muted-foreground">Tipe</span>
                      <span className="font-semibold text-right">
                        {direction === "sell" ? "Beli Valas" : "Jual Valas"}
                      </span>

                      <span className="text-muted-foreground">Nominal</span>
                      <span className="font-rate font-bold text-right">
                        {selectedCode} {fmt(numAmount)}
                      </span>

                      <span className="text-muted-foreground">
                        {direction === "sell" ? "Total Bayar (IDR)" : "Diterima (IDR)"}
                      </span>
                      <span className="font-rate font-bold text-primary text-right">
                        IDR {result !== null ? fmt(result) : "—"}
                      </span>

                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-rate text-right text-xs">
                        1 {selectedCode} = IDR {activeRate.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-name" className="text-xs font-medium text-muted-foreground">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="tx-name"
                      type="text"
                      placeholder="Nama Anda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-phone" className="text-xs font-medium text-muted-foreground">No. HP / WhatsApp</label>
                    <input
                      id="tx-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="08xxxxxxxxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Bank Section — beda tergantung arah transaksi */}
                  {direction === "sell" ? (
                    /* Beli Valas: pilih bank Exchange 286 (customer transfer ke kita) */
                    banks.length > 0 && (
                      <div className="space-y-1.5">
                        <label htmlFor="tx-bank" className="text-xs font-medium text-muted-foreground">
                          Bank Tujuan Transfer
                          <span className="ml-1 text-muted-foreground/60">(rekening Exchange 286)</span>
                        </label>
                        <select
                          id="tx-bank"
                          value={selectedBankId}
                          onChange={(e) => setSelectedBankId(e.target.value ? Number(e.target.value) : "")}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                        >
                          <option value="">— Pilih Bank —</option>
                          {banks.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.bankCode} — {b.bankName}
                              {b.accountNumber ? ` (${b.accountNumber})` : ""}
                            </option>
                          ))}
                        </select>
                        {selectedBankId !== "" && (() => {
                          const bank = banks.find((b) => b.id === selectedBankId);
                          if (!bank?.accountNumber) return null;
                          return (
                            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs space-y-0.5">
                              <p className="text-muted-foreground">No. Rekening: <span className="font-bold text-foreground font-rate">{bank.accountNumber}</span></p>
                              {bank.accountName && <p className="text-muted-foreground">Atas Nama: <span className="font-semibold text-foreground">{bank.accountName}</span></p>}
                            </div>
                          );
                        })()}
                      </div>
                    )
                  ) : (
                    /* Jual Valas: customer isi rekening miliknya sendiri */
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        🏦 Rekening Penerima IDR Anda
                      </p>
                      <div className="space-y-1.5">
                        <label htmlFor="tx-cust-bank" className="text-xs font-medium text-muted-foreground">
                          Nama Bank <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="tx-cust-bank"
                          type="text"
                          placeholder="Contoh: BCA, Mandiri, BRI..."
                          value={customerBank}
                          onChange={(e) => setCustomerBank(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="tx-cust-account-name" className="text-xs font-medium text-muted-foreground">
                          Nama Rekening <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="tx-cust-account-name"
                          type="text"
                          placeholder="Nama pemilik rekening"
                          value={customerAccountName}
                          onChange={(e) => setCustomerAccountName(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="tx-cust-account-number" className="text-xs font-medium text-muted-foreground">
                          Nomor Rekening <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="tx-cust-account-number"
                          type="text"
                          inputMode="numeric"
                          placeholder="Contoh: 1234567890"
                          value={customerAccountNumber}
                          onChange={(e) => setCustomerAccountNumber(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-rate focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-notes" className="text-xs font-medium text-muted-foreground">Catatan (opsional)</label>
                    <textarea
                      id="tx-notes"
                      rows={2}
                      placeholder="Informasi tambahan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    id="tx-submit-btn"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      !customerName.trim() ||
                      (direction === "buy" && (!customerBank.trim() || !customerAccountName.trim() || !customerAccountNumber.trim()))
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: direction === "sell"
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      color: "#fff",
                    }}
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitting ? "Memproses..." : "Kirim Permintaan"}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Permintaan Terkirim!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order #{orderId} telah kami terima. Tim kami akan segera menghubungi Anda.
                  </p>
                </div>
                <div className="w-full rounded-xl bg-muted/40 border border-border px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipe</span>
                    <span className="font-semibold">{direction === "sell" ? "Beli Valas" : "Jual Valas"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mata Uang</span>
                    <span className="font-semibold">{selectedCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nominal</span>
                    <span className="font-rate font-bold">{selectedCode} {fmt(numAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {direction === "sell" ? "Estimasi Bayar (IDR)" : "Estimasi Terima (IDR)"}
                    </span>
                    <span className="font-rate font-bold text-primary">
                      IDR {result !== null ? fmt(result) : "—"}
                    </span>
                  </div>
                </div>

                {/* WA Redirect Banner */}
                {waNumber && (
                  <div className="w-full rounded-xl border border-green-500/25 bg-green-500/8 px-4 py-3 space-y-2">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center justify-center gap-1.5">
                      📲 Mengalihkan ke WhatsApp admin...
                    </p>
                    <a
                      href={`https://wa.me/${waNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      id="tx-wa-fallback"
                      className="block text-xs text-green-600 dark:text-green-400 underline underline-offset-2"
                    >
                      Klik di sini jika tidak terbuka otomatis →
                    </a>
                  </div>
                )}

                <button
                  id="tx-success-close"
                  onClick={() => setModalOpen(false)}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
