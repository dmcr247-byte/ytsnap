import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import { getAllSettings } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings();
  const siteName = settings.site_name || "YTSnap";
  const siteTagline = settings.site_tagline || "Free YouTube Thumbnail & Creator Media Tools";
  const googleVerification = settings.google_site_verification;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ytsnap.tech"),
    title: {
      template: `%s | ${siteName}`,
      default: `${siteName} - ${siteTagline}`,
    },
    description:
      "Preview and download full HD YouTube thumbnails (1280x720), inspect video metadata, and access 10 free creator utilities in 8 languages.",
    verification: googleVerification
      ? {
          google: googleVerification,
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAllSettings();
  const gaId = settings.google_analytics_id;
  const adsenseId = settings.google_adsense_client_id;
  const adsenseEnabled = settings.google_adsense_enabled === "true";
  const googleVerification = settings.google_site_verification;
  const customHeader = settings.custom_header_code;
  const customFooter = settings.custom_footer_code;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />

        {/* Google Site Verification Meta Tag */}
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}

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
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {/* Custom Header Code (HTML, CSS <style>, JS <script> injected from Admin) */}
        {customHeader && (
          <div
            style={{ display: "none" }}
            dangerouslySetInnerHTML={{ __html: customHeader }}
          />
        )}

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
