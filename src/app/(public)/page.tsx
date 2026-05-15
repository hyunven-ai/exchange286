import { Suspense } from "react";
import { MarqueeBar } from "@/components/public/MarqueeBar";
import { RatesTable } from "@/components/public/RatesTable";
import { CurrencyCalculator } from "@/components/public/CurrencyCalculator";
import { BanksGrid } from "@/components/public/BanksGrid";
import { HoursTable } from "@/components/public/HoursTable";
import { MapSection } from "@/components/public/MapSection";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllRates,
  getActiveBanks,
  getOperationalHours,
  getSetting,
} from "@/lib/queries";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const [rates, banks, hours, marqueeText, mapsUrl, mapsEmbedUrl] = await Promise.all([
    getAllRates(),
    getActiveBanks(),
    getOperationalHours(),
    getSetting("marquee_text"),
    getSetting("maps_url"),
    getSetting("maps_embed_url"),
  ]);

  return (
    <>
      {/* Announcement Marquee */}
      {marqueeText && <MarqueeBar text={marqueeText} />}

      {/* Page Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Exchange Rates */}
        <Suspense fallback={<Skeleton className="h-48 w-full rounded-2xl" />}>
          <RatesTable rates={rates} />
        </Suspense>

        {/* Currency Calculator — directly after rates */}
        {rates.length > 0 && (
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
            <CurrencyCalculator rates={rates} banks={banks} />
          </Suspense>
        )}

        {/* Supported Banks */}
        <Suspense fallback={<Skeleton className="h-36 w-full rounded-2xl" />}>
          <BanksGrid banks={banks} />
        </Suspense>

        {/* Operational Hours */}
        <Suspense fallback={<Skeleton className="h-56 w-full rounded-2xl" />}>
          <HoursTable hours={hours} />
        </Suspense>

        {/* Map Location — with embedded iframe */}
        <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
          <MapSection
            mapsUrl={mapsUrl ?? "https://maps.google.com"}
            embedUrl={mapsEmbedUrl ?? undefined}
          />
        </Suspense>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
          <p>© {new Date().getFullYear()} Exchange 286. Semua hak dilindungi.</p>
          <p className="mt-1">Kurs dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
        </footer>
      </div>
    </>
  );
}
