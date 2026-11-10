import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import { getAllSettings } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | MediaSnap",
    default: "MediaSnap - Free YouTube Thumbnail & Creator Media Tools",
  },
  description:
    "Preview and download full HD YouTube thumbnails (1280x720), inspect video metadata, and access 10 free creator utilities in 8 languages.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAllSettings();
  const gaId = settings.google_analytics_id;
  const adsenseId = settings.google_adsense_client_id;
  const adsenseEnabled = settings.google_adsense_enabled === "true";
  const customHeader = settings.custom_header_code;
  const customFooter = settings.custom_footer_code;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />

        {/* Google AdSense Script (Injected dynamically from Admin) */}
        {adsenseEnabled && adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Google Analytics GA4 (Injected dynamically from Admin) */}
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}

        {/* Custom Header Code (HTML, CSS <style>, JS <script> injected from Admin) */}
        {customHeader && (
          <div
            style={{ display: "none" }}
            dangerouslySetInnerHTML={{ __html: customHeader }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {children}

        {/* Custom Footer Code (Chat widgets, Pixels, Analytics injected from Admin) */}
        {customFooter && (
          <div
            style={{ display: "none" }}
            dangerouslySetInnerHTML={{ __html: customFooter }}
          />
        )}
      </body>
    </html>
  );
}
