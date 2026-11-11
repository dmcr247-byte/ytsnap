"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import {
  Download,
  Search,
  Clipboard,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Monitor,
  Tv,
  Tablet,
  Smartphone,
  User,
  Sparkles,
  Info,
  HelpCircle,
  ChevronDown,
  Layers,
  Palette,
  Maximize2,
} from "lucide-react";

interface BannerDownloaderToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function BannerDownloaderTool({ lang, dict }: BannerDownloaderToolProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "desktop" | "tablet" | "mobile" | "avatar">("original");
  const [downloadFormat, setDownloadFormat] = useState<"jpg" | "png" | "webp">("jpg");
  const [isDownloading, setIsDownloading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setErrorMessage(null);
      }
    } catch {
      // clipboard access error
    }
  };

  const handleClear = () => {
    setUrlInput("");
    setChannelData(null);
    setErrorMessage(null);
  };

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage(
        lang === "hi"
          ? "कृपया एक वैध यूट्यूब चैनल लिंक, @handle या वीडियो लिंक दर्ज करें।"
          : "Please enter a valid YouTube channel URL, @handle, or video link."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/channel-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlOrHandle: urlInput.trim(), lang }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Failed to fetch channel banner.");
        setChannelData(null);
      } else {
        setChannelData(json.data);
      }
    } catch {
      setErrorMessage("Network error while connecting to YouTube channel. Please verify the URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentImageUrl = (): string => {
    if (!channelData) return "";
    if (activeTab === "avatar") {
      return channelData.avatar?.hd || "";
    }
    if (!channelData.banner) return "";
    switch (activeTab) {
      case "original":
        return channelData.banner.original2560;
      case "desktop":
        return channelData.banner.desktop;
      case "tablet":
        return channelData.banner.tablet;
      case "mobile":
        return channelData.banner.mobile;
      default:
        return channelData.banner.original2560;
    }
  };

  const getCurrentResolutionLabel = (): string => {
    switch (activeTab) {
      case "original":
        return "2560 x 1440 (TV / Full HD Canvas)";
      case "desktop":
        return "2120 x 351 (Desktop Display)";
      case "tablet":
        return "1707 x 283 (Tablet Display)";
      case "mobile":
        return "1060 x 175 (Mobile Safe Zone)";
      case "avatar":
        return "900 x 900 (High-Resolution Avatar)";
    }
  };

  const handleDownload = () => {
    const imgUrl = getCurrentImageUrl();
    if (!imgUrl || !channelData) return;

    setIsDownloading(true);

    const safeTitle = (channelData.channelTitle || "channel")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const proxyDownloadUrl = `/api/download-proxy?url=${encodeURIComponent(
      imgUrl
    )}&name=${safeTitle}-${activeTab}&format=${downloadFormat}`;

    const a = document.createElement("a");
    a.href = proxyDownloadUrl;
    a.download = `ytsnap-${safeTitle}-${activeTab}.${downloadFormat}`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => setIsDownloading(false), 2000);
  };

  const faqs = [
    {
      q: lang === "hi"
        ? "यूट्यूब बैनर (Channel Art) का सही साइज क्या होता है?"
        : "What is the recommended YouTube banner size in 2026?",
      a: lang === "hi"
        ? "यूट्यूब के आधिकारिक दिशानिर्देशों के अनुसार, बैनर का आदर्श आकार 2560 x 1440 पिक्सल (16:9 रेशियो) है। इसमें 1546 x 423 पिक्सल का 'Safe Area' होता है जो सभी मोबाइल, टैबलेट और डेस्कटॉप पर बिना कटे दिखाई देता है।"
        : "According to YouTube's official design guidelines, the ideal channel banner dimension is 2560 x 1440 pixels (16:9 ratio). The minimum upload dimension is 2048 x 1152 pixels with a mobile safe area of 1546 x 423 pixels.",
    },
    {
      q: lang === "hi"
        ? "क्या यह टूल ओरिजिनल 2560x1440 हाई-रेजोल्यूशन बैनर डाउनलोड करता है?"
        : "Does this tool download the original 2560x1440 high-resolution banner?",
      a: lang === "hi"
        ? "हाँ! YTSnap सीधे Google के इमेज सर्वर से ओरिजिनल अनक्रॉप्ड 2560x1440 टीवी-कैनवास बैनर निकालता है, जिसे आप फुल क्वालिटी में सेव कर सकते हैं।"
        : "Yes! YTSnap retrieves the original, uncropped 2560x1440 canvas directly from Google CDN servers without downscaling or compression.",
    },
    {
      q: lang === "hi"
        ? "क्या मैं चैनल प्रोफाइल पिक्चर (अवतार) भी डाउनलोड कर सकता हूँ?"
        : "Can I also download the YouTube channel profile photo (avatar)?",
      a: lang === "hi"
        ? "हाँ! 'Channel Avatar (900x900)' टैब पर क्लिक करके आप चैनल की फुल एचडी 900x900 रेजोल्यूशन वाली प्रोफाइल फोटो भी डाउनलोड कर सकते हैं।"
        : "Yes! Simply click the 'Channel Avatar (900x900)' tab to preview and download the creator's full 900x900 high-definition profile avatar.",
    },
    {
      q: lang === "hi"
        ? "क्या मैं चैनल लिंक की जगह सिर्फ चैनल का नाम या वीडियो लिंक पेस्ट कर सकता हूँ?"
        : "Can I enter a channel handle (@name) or video link instead of the channel URL?",
      a: lang === "hi"
        ? "हाँ! आप चैनल का हैंडल (जैसे @MrBeast), चैनल का लिंक (youtube.com/@channel) या चैनल के किसी भी वीडियो का लिंक पेस्ट कर सकते हैं। हमारा सिस्टम चैनल को अपने आप खोज लेता है।"
        : "Yes! You can enter any channel handle (e.g. @MrBeast), channel link (youtube.com/@channel), or any video link uploaded by that channel.",
    },
    {
      q: lang === "hi"
        ? "क्या डाउनलोड की गई इमेज पर कोई वॉटरमार्क या लोगो जोड़ा जाता है?"
        : "Is there any watermark added to the downloaded banner image?",
      a: lang === "hi"
        ? "बिल्कुल नहीं! YTSnap आपको क्रिएटर की ओरिजिनल फ़ाइल बिना किसी अतिरिक्त वॉटरमार्क, लोगो या टेक्स्ट के उपलब्ध कराता है।"
        : "No! All downloaded images are the pristine original creator files with zero watermarks, branding, or overlays added.",
    },
    {
      q: lang === "hi"
        ? "क्या यूट्यूब चैनल बैनर डाउनलोड करना वैध और सुरक्षित है?"
        : "Is downloading YouTube channel banners legal?",
      a: lang === "hi"
        ? "हाँ, किसी भी सार्वजनिक यूट्यूब चैनल के बैनर को डिज़ाइन प्रेरणा, रंग मिलान, या अपने खुद के चैनल के बैकअप के लिए देखना और डाउनलोड करना पूरी तरह सुरक्षित है। कृपया किसी अन्य के बैनर का उपयोग बिना अनुमति अपने चैनल पर न करें।"
        : "Yes, downloading public channel art for personal design inspiration, color palettes, safe-area reference, or backing up your own channel is completely safe and legal under fair use.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Tool Hero Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>YouTube Banner & Channel Art Downloader</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === "hi"
              ? "यूट्यूब बैनर डाउनलोडर — ओरिजिनल 2560x1440 HD"
              : "YouTube Banner Downloader (2560x1440 HD)"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {lang === "hi"
              ? "किसी भी यूट्यूब चैनल का बैनर, डेस्कटॉप हेडर और 900x900 चैनल अवतार ओरिजिनल 2560x1440 फुल रेजोल्यूशन में तुरंत मुफ्त डाउनलोड करें।"
              : "Download original YouTube channel banners, desktop headers, mobile safe-zone art, and 900x900 HD profile avatars in full 2560x1440 resolution."}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  lang === "hi"
                    ? "चैनल लिंक, @handle या वीडियो लिंक दर्ज करें (उदा. @MrBeast, https://youtube.com/@...)"
                    : "Enter channel URL, @handle, or video link (e.g. @MrBeast, https://youtube.com/@...)"
                }
                className="w-full pl-11 pr-20 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {urlInput && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-primary hover:from-blue-700 hover:to-primary-hover text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching Banner...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Get Banner</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Results Card */}
      {channelData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Channel Header Profile */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {channelData.avatar?.hd && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md border-2 border-primary/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={channelData.avatar.hd}
                    alt={channelData.channelTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {channelData.channelTitle}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 justify-center sm:justify-start">
                  <span>{channelData.handle}</span>
                  {channelData.subscriberCount && (
                    <>
                      <span>•</span>
                      <span>{channelData.subscriberCount}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <a
              href={channelData.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <span>Visit Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Resolution Selector Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Choose Banner Resolution & Display:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("original")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "original"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Original (2560x1440)</span>
              </button>

              <button
                onClick={() => setActiveTab("desktop")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "desktop"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (2120x351)</span>
              </button>

              <button
                onClick={() => setActiveTab("tablet")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "tablet"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (1707x283)</span>
              </button>

              <button
                onClick={() => setActiveTab("mobile")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "mobile"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (1060x175)</span>
              </button>

              <button
                onClick={() => setActiveTab("avatar")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "avatar"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Avatar (900x900)</span>
              </button>
            </div>
          </div>

          {/* Banner Live Preview Container */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
              {getCurrentImageUrl() ? (
                <div
                  className={`w-full flex items-center justify-center p-2 bg-slate-950 ${
                    activeTab === "avatar" ? "max-w-xs mx-auto aspect-square py-8" : "aspect-[16/9] sm:aspect-[21/9]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCurrentImageUrl()}
                    alt={`${channelData.channelTitle} ${activeTab}`}
                    className={`max-h-full object-contain ${
                      activeTab === "avatar" ? "rounded-full shadow-2xl" : "rounded-lg"
                    }`}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  This channel does not currently have a custom banner uploaded.
                </div>
              )}
            </div>

            {/* Download Bar & Format Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Active Display: {getCurrentResolutionLabel()}
                </span>
                <span className="text-[11px] text-slate-400">
                  Direct Google CDN high-speed stream with zero watermarks.
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Format Picker */}
                <div className="flex rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-bold">
                  {(["jpg", "png", "webp"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setDownloadFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                        downloadFormat === fmt
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:text-primary"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || !getCurrentImageUrl()}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-60"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {downloadFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Walkthrough Guide */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Fast & Simple</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "यूट्यूब बैनर कैसे डाउनलोड करें — 3 आसान स्टेप्स"
              : "How to Download a YouTube Channel Banner"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {lang === "hi"
              ? "बिना किसी सॉफ़्टवेयर या एक्सटेंशन के किसी भी क्रिएटर का 2560x1440 बैनर डाउनलोड करें।"
              : "Download high-resolution YouTube channel art in original 2560x1440 format in seconds."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-extrabold text-lg mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "चैनल लिंक या @Handle कॉपी करें" : "Copy Channel Handle or Link"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "यूट्यूब ऐप या वेब से चैनल का @handle (जैसे @MrBeast) या चैनल का URL कॉपी करें।"
                : "Copy the YouTube channel @handle (e.g. @MrBeast), channel link, or any video link."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "सर्च बार में पेस्ट करें" : "Paste & Analyze"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "YTSnap के सर्च बॉक्स में पेस्ट करें और 'Get Banner' बटन पर क्लिक करें।"
                : "Paste into the input box above and click 'Get Banner'. Our engine extracts all resolutions."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-lg mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "2560x1440 HD में सेव करें" : "Download in 2560x1440 HD"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "टीवी, डेस्कटॉप, या मोबाइल साइज चुनें और JPG, PNG या WebP में तुरंत डाउनलोड करें।"
                : "Select TV, Desktop, or Mobile size, choose JPG/PNG/WebP, and download instantly."}
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Banner Dimension Specifications Guide */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Official 2026 Guidelines</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === "hi"
              ? "यूट्यूब बैनर साइज और सेफ एरिया गाइड (2026)"
              : "YouTube Banner Size & Safe Area Guidelines"}
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {lang === "hi"
              ? "यूट्यूब अलग-अलग डिवाइस (टीवी, कंप्यूटर, मोबाइल) पर बैनर कैसे दिखाता है, उसकी पूरी जानकारी।"
              : "Understanding how YouTube displays channel art across TV, desktop, tablet, and mobile screens."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Tv className="w-6 h-6 text-primary" />
            <span className="text-xs text-slate-400 block font-bold">Smart TV / 4K Displays</span>
            <span className="text-lg font-extrabold text-white block">2560 x 1440 px</span>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {lang === "hi"
                ? "पूरा 16:9 कैनवास सिर्फ स्मार्ट टीवी स्क्रीन पर दिखाई देता है।"
                : "The entire 16:9 canvas is only visible on large Smart TV displays."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Monitor className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-slate-400 block font-bold">Desktop / PC</span>
            <span className="text-lg font-extrabold text-white block">2560 x 423 px</span>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {lang === "hi"
                ? "डेस्कटॉप पर ऊपर और नीचे का हिस्सा कट जाता है और चौड़ी पट्टी दिखती है।"
                : "Wide horizontal banner displayed across laptop and desktop monitors."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Tablet className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-slate-400 block font-bold">Tablet Devices</span>
            <span className="text-lg font-extrabold text-white block">1855 x 423 px</span>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {lang === "hi"
                ? "iPad और एंड्रॉइड टैबलेट्स के स्क्रीन साइज के हिसाब से अनुकूलित।"
                : "Responsive width rendered across iPad and Android tablet screens."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Smartphone className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-slate-400 block font-bold">Mobile Safe Area</span>
            <span className="text-lg font-extrabold text-white block">1546 x 423 px</span>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {lang === "hi"
                ? "लोगो और टेक्स्ट हमेशा इसी सुरक्षित क्षेत्र के अंदर होने चाहिए।"
                : "Guaranteed visible region on all smartphones without any cropping."}
            </p>
          </div>
        </div>
      </section>

      {/* Why Designers and Creators Use This Tool */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Creator Workflows</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "डिज़ाइनर्स और क्रिएटर्स के लिए यह टूल क्यों ज़रूरी है?"
              : "Why Designers & Creators Use YTSnap Banner Downloader"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <Palette className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "डिज़ाइन प्रेरणा और मूडबोर्ड" : "Design Inspiration & Moodboards"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "शीर्ष चैनलों के बैनर डिज़ाइन, टाइपोग्राफी और कलर पैलेट को उच्च रेजोल्यूशन में देखकर प्रेरणा लें।"
                : "Study top creator channel art, typography, color schemes, and layout hierarchies in crisp full-size resolution."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <Layers className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "सेफ एरिया अलाइनमेंट चेक" : "Safe-Zone Alignment Analysis"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "देखें कि पेशेवर क्रिएटर्स अपने लोगो और सोशल मीडिया हैंडल्स को 1546x423 सेफ जोन में कैसे सेट करते हैं।"
                : "Analyze how successful creators position their core logos and social handles inside the 1546x423 safe area."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "खोए हुए बैनर का बैकअप" : "Backup Lost Original Art"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "अगर आपने अपने चैनल का ओरिजिनल बैनर डिलीट कर दिया है, तो उसे 2560x1440 HD में दोबारा प्राप्त करें।"
                : "Easily retrieve the original high-resolution master file of your own channel if you lost your source graphics."}
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "अक्सर पूछे जाने वाले सवाल (FAQs)"
              : "Frequently Asked Questions"}
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Fair Use & Legal Notice */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Fair Use Notice:</strong> YTSnap YouTube Banner Downloader provides channel art inspection and downloading utilities for personal design inspiration, educational study, and creator-owned content backups. Channel artwork is copyrighted by its respective creators.
        </p>
      </div>
    </div>
  );
}
