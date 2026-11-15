import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isValidLanguage,
  getDictionary,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/i18n";
import { VideoDownloaderTool } from "@/components/tools/VideoDownloaderTool";
import { DownloadPageClient } from "./DownloadPageClient";
import { ShieldCheck, Sparkles } from "lucide-react";

interface DownloadPageProps {
  params: { lang: string };
  searchParams?: { url?: string; v?: string };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: DownloadPageProps): Promise<Metadata> {
  const { lang } = params;
  if (!isValidLanguage(lang)) return {};

  const isHi = lang === "hi";
  const title = isHi
    ? "यूट्यूब डाउनलोड ऑप्शन्स (1080p Full HD, 720p & MP3) | YTSnap"
    : "YouTube Download Options (1080p Full HD, 720p & MP3) | YTSnap";
  const description = isHi
    ? "अपनी पसंद की वीडियो क्वालिटी (1080p, 720p, 480p, 360p) और ऑडियो ट्रैक चुनें और तुरंत डाउनलोड करें।"
    : "Choose your preferred video quality (1080p, 720p, 480p, 360p) and audio track to download instantly.";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ytsnap.tech";

  return {
    title,
    description,
    robots: {
      index: false, // Download option result pages should not pollute SEO index
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/${lang}/download`,
    },
  };
}

export default function DownloadPage({ params, searchParams }: DownloadPageProps) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();

  const dict = getDictionary(lang);
  const initialUrl = searchParams?.url || (searchParams?.v ? `https://www.youtube.com/watch?v=${searchParams.v}` : "");

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Top Header Badge */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>
            {lang === "hi"
              ? "YouTube Download Options • 1080p, 720p & MP3 Audio"
              : "YouTube Download Options • 1080p, 720p & MP3 Audio"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === "hi" ? "YouTube डाउनलोड ऑप्शन्स" : "YouTube Download Options"}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {lang === "hi"
            ? "1080p Full HD, 720p HD या 360p MP4 वीडियो और हाई-क्वालिटी ऑडियो ट्रैक में से चुनें और डाउनलोड करें।"
            : "Select your desired resolution (1080p Full HD, 720p HD, 480p, 360p) and audio track to start your download."}
        </p>
      </div>

      {/* Interactive Tool with Suspense boundary for Next.js searchParams */}
      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading YouTube download options...
          </div>
        }
      >
        <DownloadPageClient lang={lang as SupportedLanguage} dict={dict} initialUrl={initialUrl} />
      </Suspense>
    </div>
  );
}
