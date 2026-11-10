import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | MediaSnap",
    default: "MediaSnap - Free YouTube Thumbnail & Creator Media Tools",
  },
  description:
    "Preview and download full HD YouTube thumbnails (1280x720), inspect video metadata, and access 10 free creator utilities in 8 languages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
