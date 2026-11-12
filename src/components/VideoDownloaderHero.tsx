"use client";

import React from "react";
import Link from "next/link";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { VideoDownloaderTool } from "@/components/tools/VideoDownloaderTool";
import { Sparkles, Video, Zap, Image as ImageIcon, Layers } from "lucide-react";

interface VideoDownloaderHeroProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function VideoDownloaderHero({ lang, dict }: VideoDownloaderHeroProps) {
  const isHi = lang === "hi";

  const heroTitle = isHi
    ? "मुफ्त यूट्यूब वीडियो और शॉर्ट्स डाउनलोडर"
    : "Free YouTube Video & Shorts Downloader";

  const heroSubtitle = isHi
    ? "यूट्यूब वीडियो और शॉर्ट्स को फुल एचडी (1080p, 720p) और हाई-क्वालिटी MP3 ऑडियो में तेज़ स्पीड से डाउनलोड करें — ऑडियो और वीडियो एक साथ।"
    : "Download YouTube videos, Shorts & high-bitrate MP3 in 1080p, 720p HD with audio and video combined at lightning-fast speed.";

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-20">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-rose-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Pill */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-rose-400 text-xs sm:text-sm font-semibold animate-in fade-in zoom-in-95 duration-200">
            <Sparkles className="w-4 h-4 fill-primary/30" />
            <span>
              {isHi
                ? "100% फ्री • 1080p फुल एचडी और MP3 • तेज़ और सुरक्षित"
                : "100% Free • 1080p Full HD & MP3 • Fast & Secure"}
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mt-4 mb-4">
            {heroTitle}
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Quick Tool Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm shadow-primary/30 cursor-default">
              <Video className="w-3.5 h-3.5" />
              <span>{(dict.common as any).videoDownloader || "Video Downloader"}</span>
            </span>
            <Link
              href={`/${lang}/tools/youtube-shorts-downloader`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>{(dict.common as any).shortsDownloader || "Shorts Downloader"}</span>
            </Link>
            <Link
              href={`/${lang}/tools/youtube-banner-downloader`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>{(dict.common as any).bannerDownloader || "Banner Downloader"}</span>
            </Link>
            <Link
              href={`/${lang}/tools/youtube-thumbnail-downloader`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>{dict.common.thumbnailDownloader}</span>
            </Link>
          </div>
        </div>

        {/* Interactive Video Downloader Tool */}
        <div className="mt-8">
          <VideoDownloaderTool lang={lang} dict={dict} />
        </div>
      </div>
    </section>
  );
}
