"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { VideoDownloaderTool } from "@/components/tools/VideoDownloaderTool";

interface DownloadPageClientProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
  initialUrl?: string;
}

export function DownloadPageClient({ lang, dict, initialUrl }: DownloadPageClientProps) {
  const searchParams = useSearchParams();
  const queryUrl = searchParams.get("url") || (searchParams.get("v") ? `https://www.youtube.com/watch?v=${searchParams.get("v")}` : "");
  const targetUrl = queryUrl || initialUrl || "";

  return (
    <VideoDownloaderTool
      lang={lang}
      dict={dict}
      initialUrl={targetUrl}
      isDedicatedPage={true}
    />
  );
}
