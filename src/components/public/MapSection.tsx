import { MapPin, ExternalLink } from "lucide-react";

interface MapSectionProps {
  mapsUrl: string;
  /** Optional: Google Maps embed URL (src for <iframe>).
   *  If not provided, we try to generate one from mapsUrl.
   *  Format: https://www.google.com/maps/embed?pb=!1m18... */
  embedUrl?: string;
}

/**
 * Only use the embed URL if it's explicitly set in DB settings.
 * Auto-conversion requires a Google Maps API key — not available here.
 * Admin must paste the embed src from Google Maps → Share → Embed a map.
 */
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Only accept actual embed URLs (no API key needed for embed/v1 with iframe)
  if (url.includes("google.com/maps/embed")) return url;
  // All other formats require API key — skip
  return null;
}

export function MapSection({ mapsUrl, embedUrl }: MapSectionProps) {
  // Prefer explicit embed URL, fallback to auto-converted, fallback to null
  const iframeSrc = embedUrl || toEmbedUrl(mapsUrl);

  return (
    <section id="location" className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-4">Lokasi Kami</h2>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Map embed */}
        {iframeSrc ? (
          <div className="w-full aspect-video relative bg-muted">
            <iframe
              src={iframeSrc}
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Exchange 286 di Google Maps"
            />
          </div>
        ) : (
          /* Placeholder when no embed URL available */
          <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3">
            <MapPin className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center px-4">
              Peta belum dikonfigurasi.<br />
              <span className="text-xs">Masukkan URL Embed Maps di Pengaturan Admin.</span>
            </p>
          </div>
        )}

        {/* Info bar + open button */}
        <div className="flex items-center gap-4 p-4 border-t border-border">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Exchange 286</p>
            <p className="text-xs text-muted-foreground">
              Klik tombol untuk navigasi langsung
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            id="btn-open-maps"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Maps
          </a>
        </div>
      </div>
    </section>
  );
}
