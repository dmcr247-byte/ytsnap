"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { ThumbnailItem, VideoMetadata } from "@/lib/youtube";
import {
  Search,
  Clipboard,
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  FileImage,
} from "lucide-react";

interface ThumbnailHeroProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
  initialVideoId?: string;
}

export function ThumbnailHero({ lang, dict, initialVideoId }: ThumbnailHeroProps) {
  const [urlInput, setUrlInput] = useState(initialVideoId ? `https://youtu.be/${initialVideoId}` : "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<string>("maxresdefault");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setErrorMessage(null);
      }
    } catch {
      // Clipboard access might be blocked by browser
    }
  };

  const handleClear = () => {
    setUrlInput("");
    setVideoData(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage(dict.hero.errorEmpty);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), lang }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || dict.hero.errorInvalid);
        setVideoData(null);
      } else {
        setVideoData(json.data);
        // Default active tab to highest available resolution
        const available = json.data.thumbnails.find((t: ThumbnailItem) => t.available);
        if (available) {
          setActiveTab(available.key);
        }
      }
    } catch {
      setErrorMessage("Network error. Please verify your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeThumbnail = videoData?.thumbnails.find((t) => t.key === activeTab) || videoData?.thumbnails[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-rose-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-rose-400 text-xs sm:text-sm font-semibold mb-6 animate-in fade-in zoom-in-95 duration-200">
          <Sparkles className="w-4 h-4 fill-primary/30" />
          <span>{dict.hero.badge}</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-5">
          {dict.hero.title}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
          {dict.hero.subtitle}
        </p>

        {/* Main Search Input Form */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 flex items-center min-w-0">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={dict.hero.inputPlaceholder}
                className="w-full pl-11 pr-20 sm:pr-24 py-3 sm:py-3.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              {/* Paste & Clear Action Buttons */}
              <div className="absolute right-2 flex items-center gap-1">
                {urlInput ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title={dict.hero.clearBtn}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title={dict.hero.pasteBtn}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{dict.hero.pasteBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Fetch Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm sm:text-base rounded-xl shadow-md shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{dict.common.loading}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{dict.hero.fetchBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Supported Link Hints */}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {dict.hero.supportedUrls}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start gap-3 text-sm text-left animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">{dict.common.error}</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Results Container */}
        {videoData && (
          <div className="mt-10 text-left bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header: Title & Channel Info */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-2">
                ✓ {dict.thumbnail.available}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {videoData.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span>
                  <strong>{dict.videoInfo.channel}:</strong> {videoData.authorName}
                </span>
                <span>•</span>
                <span>
                  <strong>{dict.videoInfo.videoId}:</strong> {videoData.id}
                </span>
              </div>
            </div>

            {/* Resolution Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {videoData.thumbnails.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === t.key
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : t.available
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100"
                  }`}
                >
                  {t.available ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{t.width} × {t.height}</span>
                  <span className="hidden sm:inline font-normal opacity-80">
                    ({t.key === "maxresdefault" ? "HD" : t.key.replace("default", "").toUpperCase()})
                  </span>
                </button>
              ))}
            </div>

            {/* Active Thumbnail Preview & Download Actions */}
            {activeThumbnail && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visual Preview */}
                <div className="lg:col-span-7">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-video shadow-inner group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeThumbnail.url}
                      alt={videoData.title}
                      className="w-full h-full object-contain"
                    />
                    {!activeThumbnail.available && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <XCircle className="w-12 h-12 text-rose-500 mb-2" />
                        <h4 className="text-white font-bold text-base">
                          {dict.thumbnail.unavailable}
                        </h4>
                        <p className="text-slate-300 text-xs max-w-xs mt-1">
                          {dict.thumbnail.resolutionGuideDesc}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specs and Download Action Buttons */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                        {dict.thumbnail.imageDimensions} & Details
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-xs block">Resolution</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {activeThumbnail.width} × {activeThumbnail.height} px
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-xs block">Format</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">JPG / PNG</span>
                        </div>
                        <div className="col-span-2 mt-1">
                          <span className="text-slate-500 dark:text-slate-400 text-xs block">Status</span>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold text-xs ${
                              activeThumbnail.available ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                            }`}
                          >
                            {activeThumbnail.available ? dict.thumbnail.available : dict.thumbnail.unavailable}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5">
                    {/* Download JPG button */}
                    <a
                      href={`/api/download-proxy?id=${videoData.id}&res=${activeThumbnail.key}&format=jpg`}
                      download
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                        activeThumbnail.available
                          ? "bg-primary hover:bg-primary-hover text-white shadow-primary/25"
                          : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{dict.thumbnail.downloadJpg} ({activeThumbnail.width}x{activeThumbnail.height})</span>
                    </a>

                    {/* Download PNG button */}
                    <a
                      href={`/api/download-proxy?id=${videoData.id}&res=${activeThumbnail.key}&format=png`}
                      download
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
                        activeThumbnail.available
                          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750"
                          : "border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      <FileImage className="w-4 h-4 text-primary" />
                      <span>{dict.thumbnail.downloadPng}</span>
                    </a>

                    {/* Copy CDN URL & Open in Tab */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleCopyUrl(activeThumbnail.url, activeThumbnail.key)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedKey === activeThumbnail.key ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{dict.common.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dict.thumbnail.copyUrl}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={activeThumbnail.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dict.thumbnail.openImage}</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {dict.thumbnail.notice}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
