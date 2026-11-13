import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import { getAllSettings } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings();
  const siteName = settings.site_name || "YTSnap";
  const siteTagline = settings.site_tagline || "Free YouTube Video, Shorts & Creator Media Tools";
  const googleVerification = settings.google_site_verification;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.ytsnap.tech"),
    title: {
      template: "%s",
      default: `${siteName} - ${siteTagline}`,
    },
    description:
      "Download HD YouTube videos, shorts, audio, thumbnails, and access 10+ free creator utilities in 8 languages.",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/logo-icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title: `${siteName} - ${siteTagline}`,
      description:
        "Download HD YouTube videos, shorts, audio, thumbnails, and access 10+ free creator utilities.",
      url: "https://www.ytsnap.tech",
      siteName: siteName,
      images: [
        {
          url: "/logo.png",
          width: 1024,
          height: 1024,
          alt: "YTSnap Creator Tools",
        },
      ],
    },
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo-icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

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
