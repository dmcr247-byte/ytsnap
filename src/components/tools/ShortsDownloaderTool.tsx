"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import {
  Download,
  Search,
  Clipboard,
  X,
  Loader2,
  Video,
  Music,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileVideo,
  Info,
  Sparkles,
  Smartphone,
  Laptop,
  Zap,
  Layers,
  HelpCircle,
  ChevronDown,
  PlaySquare,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ShortsDownloaderToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function ShortsDownloaderTool({ lang, dict }: ShortsDownloaderToolProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);
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
    setVideoData(null);
    setErrorMessage(null);
  };

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage(
        lang === "hi"
          ? "कृपया एक वैध यूट्यूब शॉर्ट्स लिंक दर्ज करें।"
          : "Please enter a valid YouTube Shorts link."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/video-formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), lang }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Failed to fetch YouTube Shorts.");
        setVideoData(null);
      } else {
        setVideoData(json.data);
      }
    } catch {
      setErrorMessage("Network error while connecting to media server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: any, title: string) => {
    if (!videoData) return;
    setDownloadingItag(format.itag);

    // Direct high-speed Google CDN stream
    const targetUrl =
      format.url ||
      `/api/video-download?id=${videoData.id}&itag=${format.itag}&title=${encodeURIComponent(
        title
      )}`;

    const a = document.createElement("a");
    a.href = targetUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => setDownloadingItag(null), 2500);
  };

  const faqs = [
    {
      q: lang === "hi"
        ? "क्या यह टूल यूट्यूब शॉर्ट्स (Shorts) लिंक्स के साथ काम करता है?"
        : "Does this tool work with YouTube Shorts links?",
      a: lang === "hi"
        ? "हाँ! आप किसी भी शॉर्ट्स लिंक (जैसे youtube.com/shorts/VIDEO_ID या youtu.be लिंक) को कॉपी करके सीधे यहाँ पेस्ट कर सकते हैं। हमारा सिस्टम इसे तुरंत प्रोसेस करके ओरिजिनल वीडियो स्ट्रीम ढूंढ लेता है।"
        : "Yes! Simply paste any Shorts URL (e.g. youtube.com/shorts/VIDEO_ID or mobile share links) and our engine will instantly process and retrieve the highest quality available streams.",
    },
    {
      q: lang === "hi"
        ? "क्या डाउनलोड किए गए शॉर्ट्स वीडियो में कोई वॉटरमार्क (Watermark) होगा?"
        : "Will the downloaded YouTube Short have a watermark?",
      a: lang === "hi"
        ? "बिल्कुल नहीं! YTSnap ओरिजिनल Google CDN स्ट्रीम से वीडियो देता है। इसमें कोई लोगो, वॉटरमार्क या टेक्स्ट ओवरले नहीं जोड़ा जाता।"
        : "No! The downloaded file is the clean, original creator video with zero added watermarks, stamps, or promotional overlays.",
    },
    {
      q: lang === "hi"
        ? "क्या मैं अपने iPhone या Android मोबाइल पर शॉर्ट्स डाउनलोड कर सकता हूँ?"
        : "Can I download Shorts on iPhone, iPad, or Android?",
      a: lang === "hi"
        ? "हाँ! YTSnap मोबाइल ब्राउज़र्स (Safari, Chrome, Samsung Internet) पर 100% काम करता है। यूट्यूब ऐप में शेयर बटन दबाकर लिंक कॉपी करें और यहाँ पेस्ट करें।"
        : "Yes! YTSnap is 100% web-based and runs on any mobile browser. Tap 'Share' in the YouTube mobile app, copy the link, and paste it here.",
    },
    {
      q: lang === "hi"
        ? "शॉर्ट्स के कौन-से फॉर्मेट और रेजोल्यूशन उपलब्ध हैं?"
        : "What formats and resolutions are available for Shorts?",
      a: lang === "hi"
        ? "शॉर्ट्स के लिए 1080p Full HD (1080x1920 vertical), 720p HD, 480p, 360p MP4 वीडियो और अलग से MP3/M4A ऑडियो फॉर्मेट उपलब्ध होते हैं।"
        : "You can download in 1080p Full HD (1080x1920 vertical), 720p HD, 480p MP4, as well as high-bitrate MP3/M4A audio tracks.",
    },
    {
      q: lang === "hi"
        ? "क्या मैं शॉर्ट्स वीडियो से बैकग्राउंड म्यूजिक या MP3 ऑडियो निकाल सकता हूँ?"
        : "Can I extract audio or music from a YouTube Short?",
      a: lang === "hi"
        ? "हाँ! 'Audio Only (MP3)' टैब पर क्लिक करके आप वायरल गानों, डायलॉग और साउंड इफेक्ट्स को उच्च गुणवत्ता वाले MP3 फॉर्मेट में डाउनलोड कर सकते हैं।"
        : "Yes! Switch to the 'Audio Only (MP3)' tab after analyzing the link to save trending background music, sound effects, or speech in MP3 format.",
    },
    {
      q: lang === "hi"
        ? "क्या शॉर्ट्स डाउनलोड करने की कोई दैनिक सीमा (Limit) है?"
        : "Is there any limit on how many Shorts I can download?",
      a: lang === "hi"
        ? "नहीं! YTSnap पूरी तरह मुफ्त और असीमित है। आप बिना किसी रजिस्ट्रेशन या शुल्क के जितने चाहें उतने शॉर्ट्स डाउनलोड कर सकते हैं।"
        : "No! YTSnap is completely free with no usage caps, registration, or download limits. You can download as many Shorts as you need.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Tool Hero Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs">
            <PlaySquare className="w-3.5 h-3.5" />
            <span>YouTube Shorts Downloader (No Watermark)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === "hi"
              ? "यूट्यूब शॉर्ट्स डाउनलोडर — बिना वॉटरमार्क MP4 और MP3"
              : "Download YouTube Shorts in MP4 & MP3 (No Watermark)"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {lang === "hi"
              ? "यूट्यूब ऐप या वेब से किसी भी शॉर्ट्स का लिंक पेस्ट करें और फुल एचडी 1080p, 720p MP4 वीडियो और क्रिस्टल क्लियर MP3 ऑडियो तुरंत मुफ्त में डाउनलोड करें।"
              : "Paste any YouTube Shorts URL to save vertical 1080p Full HD, 720p MP4 video, and high-bitrate MP3 audio instantly without any apps or watermarks."}
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
                    ? "यूट्यूब शॉर्ट्स लिंक पेस्ट करें (उदा. https://youtube.com/shorts/...)"
                    : "Paste YouTube Shorts link (e.g. https://youtube.com/shorts/...)"
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
              className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-primary hover:from-rose-600 hover:to-primary-hover text-white font-bold rounded-2xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching Shorts...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Get Shorts</span>
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
      {videoData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Header Video Preview */}
          <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-slate-100 dark:border-slate-800">
            {/* Vertical aspect ratio for Shorts */}
            <div className="w-40 sm:w-48 rounded-2xl overflow-hidden aspect-[9/16] bg-black relative shadow-lg shrink-0 mx-auto sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                {videoData.duration}
              </span>
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                Shorts
              </span>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  ✓ 100% No Watermark
                </span>
                <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  ✓ High Speed Stream
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {videoData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span><strong>Channel:</strong> {videoData.author}</span>
                <span>•</span>
                <span><strong>Views:</strong> {videoData.views}</span>
              </div>

              {/* Instructions Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === "hi"
                    ? "बटन पर क्लिक करने पर वीडियो नए टैब में Google CDN से खुलेगा। प्लेयर में 3 डॉट्स (⋮) दबाकर 'Download' चुनें या Ctrl + S दबाएं।"
                    : "Download opens the direct Google CDN stream in a new tab. In the player, click 3 dots (⋮) on bottom-right and choose 'Download' or press Ctrl + S."}
                </p>
              </div>
            </div>
          </div>

          {/* Formats Tabs (Video vs Audio) */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "video"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Shorts Video (MP4)</span>
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "audio"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio Only (MP3)</span>
            </button>
          </div>

          {/* Video Formats Table */}
          {activeTab === "video" && (() => {
            const withAudioFormats = videoData.videoFormats.filter((f: any) => f.hasAudio);
            const videoOnlyFormats = videoData.videoFormats.filter((f: any) => !f.hasAudio);

            return (
              <div className="space-y-6">
                {/* Audio Guidance Alert */}
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                  <Volume2 className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      {lang === "hi"
                        ? "Shorts आवाज़ (Sound) के साथ कैसे डाउनलोड करें:"
                        : "How to download Shorts with sound (audio):"}
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-xs">
                      {lang === "hi"
                        ? "यदि आपको फोन या WhatsApp पर आवाज़ के साथ Shorts देखना/शेयर करना है, तो नीचे दिए गए '🔊 Video + Audio (Sound Included)' हरे बॉक्स वाले विकल्प को चुनें। YouTube 1080p को बिना आवाज़ (Video-Only) अलग स्ट्रीम में रखता है।"
                        : "For a complete vertical Shorts video with sound ready to post or watch, choose the green '🔊 Video + Audio (Sound Included)' option below. High-definition 1080p is served by YouTube as a video-only DASH stream."}
                    </p>
                  </div>
                </div>

                {/* Section 1: Shorts With Audio (Recommended) */}
                {withAudioFormats.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" />
                        <span>
                          {lang === "hi"
                            ? "पूरा Shorts वीडियो (आवाज़ सहित) - सर्वश्रेष्ठ"
                            : "Complete Shorts Video + Audio (Sound Included)"}
                        </span>
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold rounded-full">
                        {lang === "hi" ? "✓ आवाज़ शामिल है" : "✓ Sound Included"}
                      </span>
                    </div>

                    <div className="border-2 border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-2xl overflow-hidden divide-y divide-emerald-100 dark:divide-emerald-900/40">
                      {withAudioFormats.map((f: any) => (
                        <div
                          key={f.itag}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-emerald-100/30 dark:hover:bg-emerald-950/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                              <Volume2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {f.qualityLabel} MP4
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 uppercase">
                                  {f.container}
                                </span>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs">
                                  {lang === "hi" ? "✓ वीडियो + आवाज़" : "✓ Video + Audio"}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {f.sizeMb ? `Est. Size: ${f.sizeMb}` : "Direct Stream"} • {f.fps || 30} FPS • 9:16 Vertical • {lang === "hi" ? "आवाज़ सहित तैयार" : "Ready to watch with sound"}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownload(f, videoData.title)}
                            disabled={downloadingItag === f.itag}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-60 shrink-0"
                          >
                            {downloadingItag === f.itag ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Downloading...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>{lang === "hi" ? `डाउनलोड (आवाज़ सहित)` : `Download with Audio`}</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 2: High-Definition DASH Streams (Video Only) */}
                {videoOnlyFormats.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <VolumeX className="w-4 h-4 text-amber-500" />
                        <span>
                          {lang === "hi"
                            ? "HD & 1080p Shorts केवल (बिना आवाज़ / DASH स्ट्रीम)"
                            : "High-Definition Shorts Streams (Video Only / Silent)"}
                        </span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold rounded-full">
                        {lang === "hi" ? "केवल वीडियो" : "Video Only"}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {videoOnlyFormats.map((f: any) => (
                        <div
                          key={f.itag}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              <FileVideo className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {f.qualityLabel} MP4
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                                  {f.container}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                  {lang === "hi" ? "बिना आवाज़ (Video Only)" : "Silent (Video Only)"}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {f.sizeMb ? `Est. Size: ${f.sizeMb}` : "Direct Stream"} • {f.fps || 30} FPS • 9:16 Vertical
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownload(f, videoData.title)}
                            disabled={downloadingItag === f.itag}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60 shrink-0"
                          >
                            {downloadingItag === f.itag ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Downloading...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Download {f.qualityLabel}</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Audio Formats Table */}
          {activeTab === "audio" && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Available Shorts Audio Streams:
              </span>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {videoData.audioFormats.map((f: any) => (
                  <div
                    key={f.itag}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {f.audioBitrate} kbps Audio
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                            {f.container}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {f.sizeMb ? `Est. Size: ${f.sizeMb}` : "High Quality Audio Track"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(f, videoData.title)}
                      disabled={downloadingItag === f.itag}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-60"
                    >
                      {downloadingItag === f.itag ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Audio</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Step Walkthrough: From URL to Download in Seconds */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple & Fast</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "URL से डाउनलोड तक — सिर्फ 3 आसान स्टेप्स"
              : "From URL to Download in Seconds"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {lang === "hi"
              ? "बिना किसी ऐप या एक्सटेंशन के अपने फोन या कंप्यूटर पर यूट्यूब शॉर्ट्स तुरंत सेव करें।"
              : "Save any YouTube Short directly to your device without installing third-party apps."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-extrabold text-lg mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "शॉर्ट्स का लिंक कॉपी करें" : "Copy the Shorts URL"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "यूट्यूब ऐप या वेबसाइट में शॉर्ट्स वीडियो खोलें। 'Share' बटन पर क्लिक करके 'Copy Link' चुनें।"
                : "Open the Short in YouTube app or web. Tap the 'Share' icon and select 'Copy Link'."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "पेस्ट करें और सर्च दबाएं" : "Paste & Fetch"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "लिंक को ऊपर दिए गए सर्च बॉक्स में पेस्ट करें और 'Get Shorts' बटन पर क्लिक करें।"
                : "Paste the URL into YTSnap above and click 'Get Shorts'. Our engine retrieves available resolutions."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-lg mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "बिना वॉटरमार्क डाउनलोड करें" : "Download Without Watermarks"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "1080p, 720p HD या MP3 में से अपनी पसंदीदा क्वालिटी चुनें और तुरंत सेव करें।"
                : "Pick your preferred resolution (1080p, 720p, or MP3 audio) and save directly to your storage."}
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid: What you get */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Core Highlights</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "YTSnap शॉर्ट्स डाउनलोडर की मुख्य विशेषताएं"
              : "What You Get with YTSnap Shorts Downloader"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {lang === "hi"
              ? "क्रिएटर्स और दर्शकों के लिए विशेष रूप से डिज़ाइन किया गया सबसे तेज़ और सुरक्षित टूल।"
              : "Engineered specifically for creators, editors, and viewers who need pristine vertical media."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <PlaySquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "शॉर्ट्स के लिए विशेष रूप से निर्मित" : "Built Specifically for Shorts"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "सभी /shorts/ URLs और मोबाइल शेयरिंग लिंक्स को 100% सपोर्ट करता है। 9:16 वर्टिकल रेशियो में बिना कटे सेव होता है।"
                : "Native support for /shorts/ URLs, mobile links, and standard IDs without aspect-ratio clipping."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "100% कोई वॉटरमार्क नहीं" : "100% No Watermarks"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "ओरिजिनल क्रिएटर फ़ाइल डाउनलोड करें बिना किसी अतिरिक्त लोगो, टेक्स्ट या वॉटरमार्क के।"
                : "Receive the clean, untouched source video without added branding, TikTok stamps, or watermarks."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "1080p फुल एचडी क्वालिटी" : "Up to 1080p Full HD"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "यूट्यूब सर्वर पर उपलब्ध उच्चतम क्वालिटी (1080x1920 और 720p) में क्रिस्टल-क्लियर वीडियो।"
                : "Preserve every pixel with true high-definition vertical 1080x1920 video and 60 FPS playback."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-500 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "शॉर्ट्स ऑडियो / MP3 एक्सट्रैक्ट" : "Shorts Audio & Music MP3"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "शॉर्ट्स के बैकग्राउंड ट्रेंडिंग ऑडियो, साउंड्स और डायलॉग को अलग से MP3 फॉर्मेट में सेव करें।"
                : "Extract trending audio, viral voice clips, and background beats into standalone MP3/M4A files."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "मोबाइल और कंप्यूटर फ्रेंडली" : "Works on Mobile & Desktop"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "iPhone Safari, Android Chrome, Mac, Windows और iPad पर बिना किसी ऐप के स्मूथ चलता है।"
                : "Fully responsive. Use on iPhone, Android, iPad, Mac, Windows, or Linux directly in any browser."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {lang === "hi" ? "असीमित और 100% मुफ्त" : "Completely Free & Unlimited"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "hi"
                ? "कोई दैनिक सीमा नहीं, कोई लॉगिन या क्रेडिट कार्ड की आवश्यकता नहीं। हमेशा 100% फ्री।"
                : "No registration, no hidden subscriptions, and no daily download quotas. Use anytime for free."}
            </p>
          </div>
        </div>
      </section>

      {/* How Creators Use This Tool */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Versatile Workflows</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === "hi"
              ? "क्रिएटर्स और दर्शक इस टूल का उपयोग कैसे करते हैं?"
              : "How People Use This Tool"}
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {lang === "hi"
              ? "कंटेंट रीपर्पसिंग से लेकर ऑफलाइन स्टडी तक — YTSnap हर ज़रूरत को पूरा करता है।"
              : "From multi-platform repurposing to offline study archives, YTSnap empowers every workflow."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <Share2 className="w-6 h-6 text-rose-400" />
            <h3 className="font-bold text-white text-base">
              {lang === "hi" ? "क्रिएटर्स रीपर्पसिंग" : "Social Repurposing"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "hi"
                ? "अपने यूट्यूब शॉर्ट्स को बिना किसी वॉटरमार्क के Instagram Reels, TikTok और Facebook पर दोबारा पोस्ट करें।"
                : "Repurpose your own YouTube Shorts directly onto Instagram Reels, TikTok, and Pinterest without platform watermarks."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <Video className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-white text-base">
              {lang === "hi" ? "वीडियो एडिटर्स & मीम्स" : "Editors & Memes"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "hi"
                ? "रिएक्शन वीडियो, कमेंट्री और मीम्स बनाने के लिए वायरल क्लिप्स और बी-रोल आसानी से सेव करें।"
                : "Clip viral soundbites, funny moments, and reaction clips for high-engagement longform video editing."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <Laptop className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {lang === "hi" ? "ऑफलाइन स्टडी & ट्यूटोरियल" : "Offline Learning"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "hi"
                ? "कोडिंग टिप्स, रेसिपीज, वर्कआउट और एजुकेशनल शॉर्ट्स को यात्रा या ऑफलाइन देखने के लिए सेव करें।"
                : "Keep quick educational tutorials, coding snippets, gym workouts, and cooking recipes on hand offline."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <Music className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-base">
              {lang === "hi" ? "वायरल म्यूजिक & साउंड्स" : "Viral Audio Clips"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "hi"
                ? "शॉर्ट्स में बजने वाले ट्रेंडिंग गानों और बैकग्राउंड स्कोर को हाई-क्वालिटी MP3 में अलग से निकालें।"
                : "Extract trending speech, podcast clips, and catchy background tunes for remixes and ringtones."}
            </p>
          </div>
        </div>
      </section>

      {/* Technical Specs Comparison */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Technical Overview</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "यूट्यूब शॉर्ट्स की तकनीकी जानकारी (Specifications)"
              : "YouTube Shorts Technical Specifications"}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-bold">Aspect Ratio</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">9:16 Vertical</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-bold">Max Resolution</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">1080x1920 (FHD)</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-bold">Max Duration</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">Up to 3 Minutes</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-bold">Video Format</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">MP4 / H.264</span>
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

      {/* Fair Use & Legal Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Fair Use Notice:</strong> YTSnap provides YouTube Shorts downloading utilities for personal archiving, educational study, commentary, and creator-owned content. Please respect copyright laws and creator ownership before reusing third-party video content.
        </p>
      </div>
    </div>
  );
}
