"use client";

import React, { useState, useEffect } from "react";
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
  ChevronUp,
  PlaySquare,
  Share2,
  Volume2,
  VolumeX,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Film,
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

  // SnapYT-style format selection states
  const [selectedProgressiveItag, setSelectedProgressiveItag] = useState<number | null>(null);
  const [selectedHdVideoItag, setSelectedHdVideoItag] = useState<number | null>(null);
  const [selectedAudioItag, setSelectedAudioItag] = useState<number | null>(null);

  // HD Mux / Combine states
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStatusText, setMergeStatusText] = useState("");
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (videoData) {
      const withAudio = videoData.videoFormats?.filter((f: any) => f.hasAudio) || [];
      const videoOnly = videoData.videoFormats?.filter((f: any) => !f.hasAudio) || [];
      const audios = videoData.audioFormats || [];

      if (withAudio.length > 0) {
        setSelectedProgressiveItag(withAudio[0].itag);
      } else if (videoData.videoFormats?.length > 0) {
        setSelectedProgressiveItag(videoData.videoFormats[0].itag);
      }

      if (videoOnly.length > 0) {
        setSelectedHdVideoItag(videoOnly[0].itag);
      }
      if (audios.length > 0) {
        setSelectedAudioItag(audios[0].itag);
      }
      setIsMerging(false);
      setMergeProgress(0);
      setMergeStatusText("");
      setMergeSuccess(false);
      setMergeError(null);
      setShowManualFallback(false);
    }
  }, [videoData]);

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
    setShowManualFallback(false);
    setMergeSuccess(false);
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

  const handleCopyLink = () => {
    if (!videoData) return;
    const watchUrl = `https://www.youtube.com/shorts/${videoData.id}`;
    navigator.clipboard.writeText(watchUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const progressiveFormats = videoData?.videoFormats?.filter((f: any) => f.hasAudio) || [];
  const hdVideoOnlyFormats = videoData?.videoFormats?.filter((f: any) => !f.hasAudio) || [];
  const audioFormats = videoData?.audioFormats || [];

  const selectedProgressiveFormat =
    videoData?.videoFormats?.find((f: any) => f.itag === selectedProgressiveItag) ||
    progressiveFormats[0] ||
    videoData?.videoFormats?.[0];

  const selectedHdVideoFormat =
    hdVideoOnlyFormats.find((f: any) => f.itag === selectedHdVideoItag) ||
    hdVideoOnlyFormats[0];

  const selectedAudioFormat =
    audioFormats.find((f: any) => f.itag === selectedAudioItag) ||
    audioFormats[0];

  const handleMergeAndDownload = async () => {
    if (!videoData || !selectedHdVideoFormat || !selectedAudioFormat) return;

    if (!selectedHdVideoFormat.url || !selectedAudioFormat.url) {
      setMergeError(
        lang === "hi"
          ? "इस स्ट्रीम के लिए डायरेक्ट URL उपलब्ध नहीं है। कृपया नीचे दिए गए अलग-अलग बटन से सेव करें।"
          : "Direct stream URL not available for automated muxing. Please download separate tracks below."
      );
      setShowManualFallback(true);
      return;
    }

    setIsMerging(true);
    setMergeError(null);
    setMergeSuccess(false);
    setMergeProgress(5);
    setMergeStatusText(
      lang === "hi"
        ? `HD शॉर्ट्स (${selectedHdVideoFormat.qualityLabel}) और ऑडियो डाउनलोड हो रहा है...`
        : `Downloading HD Shorts (${selectedHdVideoFormat.qualityLabel}) & Audio...`
    );

    try {
      const { mergeVideoAndAudioInBrowser } = await import("@/lib/client-muxer");
      await mergeVideoAndAudioInBrowser(
        selectedHdVideoFormat.url,
        selectedAudioFormat.url,
        videoData.title,
        selectedHdVideoFormat.qualityLabel,
        (status, pct) => {
          setMergeStatusText(status);
          setMergeProgress(pct);
        }
      );
      setMergeSuccess(true);
      setMergeStatusText(
        lang === "hi"
          ? "✅ HD शॉर्ट्स और ऑडियो 1 फाइल में जुड़कर डाउनलोड हो गया!"
          : "✅ HD Shorts and audio merged successfully into 1 MP4 file!"
      );
    } catch (err: any) {
      console.error("Browser merge failed:", err);
      setMergeError(
        lang === "hi"
          ? `मर्जिंग में समस्या: ${err.message || "Unknown error"}। आप नीचे दिए गए बटनों से दोनों फ़ाइलें अलग-अलग डाउनलोड कर सकते हैं।`
          : `Merging notice: ${err.message || "Unknown error"}. You can save both streams separately below.`
      );
      setShowManualFallback(true);
    } finally {
      setIsMerging(false);
    }
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

      {/* SnapYT-Style 2-Card Results Section */}
      {videoData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            {/* Left Card: Video Details & Vertical Shorts Thumbnail */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Ready pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <Film className="w-3.5 h-3.5" />
                  <span>YouTube Shorts Ready</span>
                </div>

                {/* Vertical 9:16 Shorts Thumbnail with HD Thumbnail button overlay */}
                <div className="w-48 mx-auto rounded-2xl overflow-hidden aspect-[9/16] bg-black relative shadow-lg group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                    {videoData.duration}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                    9:16 Vertical
                  </span>

                  <a
                    href={`/api/download-proxy?id=${videoData.id}&res=maxresdefault&format=jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors"
                  >
                    <ImageIcon className="w-3 h-3 text-emerald-400" />
                    <span>Thumbnail</span>
                  </a>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {videoData.title}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span><strong>Duration:</strong> {videoData.duration}</span>
                    <span>•</span>
                    <span><strong>Channel:</strong> {videoData.author}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Media Badges */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </span>
              </div>
            </div>

            {/* Right Card: SnapYT-Style Shorts Download Options & HD Combiner */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
              {/* Top Download Header */}
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  YouTube Download Options
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Approx. {selectedProgressiveFormat?.sizeMb || "15.4 MB"}
                </p>
              </div>

              {/* Recommended Badges Pill Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                  Recommended
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                  {selectedProgressiveFormat?.qualityLabel || "360p"} MP4
                </span>
                {selectedProgressiveFormat?.sizeMb && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                    {selectedProgressiveFormat.sizeMb}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  Video + Audio
                </span>
              </div>

              {/* Quality Dropdown & Big Download Button */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {lang === "hi" ? "Shorts वीडियो क्वालिटी चुनें:" : "Choose your YouTube quality"}
                </label>

                <select
                  value={selectedProgressiveItag || ""}
                  onChange={(e) => setSelectedProgressiveItag(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {progressiveFormats.map((f: any) => (
                    <option key={f.itag} value={f.itag}>
                      ★ {f.qualityLabel} MP4 {f.sizeMb ? `· ${f.sizeMb}` : ""} — {lang === "hi" ? "Recommended (आवाज़ सहित)" : "Recommended (Video + Audio)"}
                    </option>
                  ))}
                  {progressiveFormats.length === 0 && (
                    <option value={videoData.videoFormats[0]?.itag}>
                      {videoData.videoFormats[0]?.qualityLabel} MP4
                    </option>
                  )}
                </select>

                {/* Big Green Download Button */}
                <button
                  onClick={() =>
                    selectedProgressiveFormat &&
                    handleDownload(selectedProgressiveFormat, videoData.title)
                  }
                  disabled={downloadingItag === selectedProgressiveFormat?.itag}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {downloadingItag === selectedProgressiveFormat?.itag ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{lang === "hi" ? "डाउनलोड शुरू हो रहा है..." : "Starting Download..."}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>{lang === "hi" ? "Download Video (आवाज़ सहित)" : "Download Video"}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  By downloading, you agree to our Terms of Service.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`https://www.youtube.com/shorts/${videoData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open on YouTube</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Copy YouTube Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reset / Download Another Video Button */}
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "अन्य YouTube Shorts डाउनलोड करें" : "Download another YouTube video"}</span>
              </button>

              {/* ── SNAPYT-STYLE HD COMBINER BOX ── */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500/25 bg-emerald-50/15 dark:bg-emerald-950/10 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>
                      {lang === "hi"
                        ? "उच्च क्वालिटी चाहिए? YouTube वीडियो + ऑडियो कंबाइन करें"
                        : "Need higher quality? Combine YouTube video + audio"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === "hi"
                      ? "एक HD 1080p वीडियो क्वालिटी और ऑडियो ट्रैक चुनें, फिर सिंगल HD MP4 तैयार करें।"
                      : "Pick a video-only quality and an audio track, then prepare a single HD MP4 file."}
                  </p>
                </div>

                {/* Two Dropdowns Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Select Video Quality */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {lang === "hi" ? "वीडियो क्वालिटी चुनें:" : "Select video quality"}
                    </label>
                    <select
                      value={selectedHdVideoItag || ""}
                      onChange={(e) => {
                        setSelectedHdVideoItag(Number(e.target.value));
                        setMergeSuccess(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {hdVideoOnlyFormats.map((f: any) => (
                        <option key={f.itag} value={f.itag}>
                          {f.qualityLabel} MP4 {f.sizeMb ? `(${f.sizeMb})` : ""}
                        </option>
                      ))}
                      {hdVideoOnlyFormats.length === 0 && (
                        <option value="">No HD streams</option>
                      )}
                    </select>
                  </div>

                  {/* Select Audio Track */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {lang === "hi" ? "ऑडियो ट्रैक चुनें:" : "Select audio track"}
                    </label>
                    <select
                      value={selectedAudioItag || ""}
                      onChange={(e) => {
                        setSelectedAudioItag(Number(e.target.value));
                        setMergeSuccess(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {audioFormats.map((f: any) => (
                        <option key={f.itag} value={f.itag}>
                          {f.audioBitrate} kbps Audio {f.sizeMb ? `(${f.sizeMb})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Merge Progress Bar */}
                {isMerging && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {mergeStatusText || (lang === "hi" ? "HD शॉर्ट्स और ऑडियो जुड़ रहे हैं..." : "Combining HD Shorts & audio...")}
                      </span>
                      <span>{mergeProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${mergeProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Merge Success Notice */}
                {mergeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>
                      {lang === "hi"
                        ? "✅ HD शॉर्ट्स और ऑडियो सफलता से 1 MP4 फाइल में डाउनलोड हो गया!"
                        : "✅ HD Shorts & audio successfully combined and downloaded as 1 MP4 file!"}
                    </span>
                  </div>
                )}

                {/* Merge Error Notice */}
                {mergeError && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>{mergeError}</span>
                  </div>
                )}

                {/* Primary HD 1-Click Merge & Download Button */}
                <button
                  type="button"
                  onClick={handleMergeAndDownload}
                  disabled={isMerging || !selectedHdVideoFormat || !selectedAudioFormat}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === "hi" ? "वीडियो व ऑडियो जुड़ रहे हैं..." : "Combining Shorts & Audio..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>
                        {lang === "hi"
                          ? `⚡ दोनों को जोड़कर 1 फाइल में डाउनलोड करें (${selectedHdVideoFormat?.qualityLabel || "HD"} + Audio)`
                          : `⚡ Merge & Download HD (${selectedHdVideoFormat?.qualityLabel || "HD"} + Audio in 1 File)`}
                      </span>
                    </>
                  )}
                </button>

                {/* Toggle Manual Separate Downloads */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualFallback(!showManualFallback)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-medium"
                  >
                    {showManualFallback
                      ? (lang === "hi" ? "▲ अलग-अलग ट्रैक छुपाएं" : "▲ Hide separate track downloads")
                      : (lang === "hi" ? "▼ अलग-अलग वीडियो और ऑडियो फाइल सेव करना चाहते हैं?" : "▼ Prefer saving separate video & audio files?")}
                  </button>
                </div>

                {/* Manual Separate Fallback Drawer */}
                {showManualFallback && (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-300">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === "hi" ? "अलग-अलग फाइलें डाउनलोड करें:" : "Download separate streams:"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedHdVideoFormat && (
                        <button
                          onClick={() =>
                            handleDownload(selectedHdVideoFormat, `${videoData.title}-HD-Shorts`)
                          }
                          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>Save HD Video ({selectedHdVideoFormat.qualityLabel})</span>
                        </button>
                      )}

                      {selectedAudioFormat && (
                        <button
                          onClick={() =>
                            handleDownload(selectedAudioFormat, `${videoData.title}-Audio`)
                          }
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Save Audio ({selectedAudioFormat.audioBitrate}k)</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {lang === "hi"
                        ? "💡 टिप: दोनों फाइलें VLC Player, CapCut या InShot में एक साथ चलेंगी।"
                        : "💡 Tip: Both files play together in VLC Media Player, CapCut, Premiere Pro, or InShot."}
                    </p>
                  </div>
                )}
              </div>
            </div>
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
