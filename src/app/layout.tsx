import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cookies } from "next/headers";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SocialWidgets } from "@/components/public/SocialWidgets";
import { Toaster } from "@/components/ui/sonner";
import { getAllSettings } from "@/lib/queries";
import "./globals.css";

// ── Dynamic metadata from DB ──────────────────────────────────────────────────
// We export a generateMetadata function that reads from DB at request time (ISR)
export async function generateMetadata(): Promise<Metadata> {
  let title = "Exchange 286 — Kurs Valuta Asing Terpercaya";
  let description =
    "Platform informasi kurs valuta asing real-time. Cek harga Beli & Jual USD, SAR, THB terkini di Exchange 286.";

  try {
    const settings = await getAllSettings();
    const map = Object.fromEntries(settings.map((s) => [s.settingKey, s.settingValue ?? ""]));
    if (map.site_title) title = map.site_title;
    if (map.site_description) description = map.site_description;
  } catch {
    // DB not ready — use defaults
  }

  return {
    title,
    description,
    keywords: ["kurs", "valuta asing", "USD", "SAR", "THB", "exchange", "money changer"],
    openGraph: {
      title,
      description,
      siteName: "Exchange 286",
      locale: "id_ID",
      type: "website",
    },
  };
}

// ── Root layout ───────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Theme from cookie (SSR, no flash)
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("exchange286-theme");
  const theme = themeCookie?.value === "light" ? "light" : "dark";

  // Load all settings for script injection
  let googleTagId = "";
  let fbPixelId = "";
  let ttPixelId = "";
  let waNumber = "";
  let waMessage = "";
  let telegramUrl = "";

  try {
    const settings = await getAllSettings();
    const map = Object.fromEntries(settings.map((s) => [s.settingKey, s.settingValue ?? ""]));
    googleTagId = map.google_tag_id ?? "";
    fbPixelId = map.facebook_pixel_id ?? "";
    ttPixelId = map.tiktok_pixel_id ?? "";
    waNumber = map.whatsapp_number ?? "";
    waMessage = map.whatsapp_message ?? "";
    telegramUrl = map.telegram_url ?? "";
  } catch {
    // DB not ready — skip injections
  }

  // Determine Google Tag type
  const isGTM = googleTagId.startsWith("GTM-");
  const isGA4 = googleTagId.startsWith("G-");

  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable} ${theme}`}
    >
      <body className="bg-background text-foreground antialiased">

        {/* ── Google Tag Manager (GTM) ── inject in body as noscript + head script */}
        {isGTM && (
          <>
            <Script
              id="gtm-script"
              strategy="afterInteractive"
            >{`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagId}');
            `}</Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${googleTagId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}

        {/* ── Google Analytics 4 (GA4) ── */}
        {isGA4 && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            />
            <Script id="ga4-config" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTagId}');
            `}</Script>
          </>
        )}

        {/* ── Facebook Pixel ── */}
        {fbPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}</Script>
        )}

        {/* ── TikTok Pixel ── */}
        {ttPixelId && (
          <Script id="tt-pixel" strategy="afterInteractive">{`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
              ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._o=ttq._o||{};ttq._o[e]=n||{};
              var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
              var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${ttPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}</Script>
        )}

        <ThemeProvider initialTheme={theme}>
          {children}
          <Toaster position="top-right" richColors />
          {/* Social widgets: WhatsApp + Telegram, positioned above mobile bottom nav */}
          <SocialWidgets
            whatsappNumber={waNumber || undefined}
            whatsappMessage={waMessage || undefined}
            telegramUrl={telegramUrl || undefined}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
