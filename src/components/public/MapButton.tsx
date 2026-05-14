"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapButtonProps {
  mapsUrl: string;
}

export function MapButton({ mapsUrl }: MapButtonProps) {
  return (
    <section id="location" className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-4">Lokasi Kami</h2>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Exchange 286</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Klik tombol di bawah untuk melihat lokasi kami di Google Maps
            </p>

            <Button
              className="mt-4 w-full sm:w-auto gap-2 shadow-sm"
              onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}
              id="btn-open-maps"
            >
              <MapPin className="w-4 h-4" />
              Buka di Google Maps
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
