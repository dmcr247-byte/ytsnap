"use client";

import React, { useState, useEffect, useRef } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import {
  Download,
  Search,
  Clipboard,
  X,
  Loader2,
  Video,
  Music,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Film,
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface VideoDownloaderToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function VideoDownloaderTool({ lang, dict }: VideoDownloaderToolProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any | null>(null);
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);

  // Top format dropdown selector (supports progressive, video-only DASH, and MP3)
  const [selectedTopItag, setSelectedTopItag] = useState<number | null>(null);

  // HD Combiner dropdown selectors
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

  // Ref to scroll down to Combine section when "Combine with audio →" is clicked
  const combineRef = useRef<HTMLDivElement>(null);

  // Auto-initialize dropdown defaults when videoData arrives
  useEffect(() => {
    if (videoData) {
      const withAudio = videoData.videoFormats?.filter((f: any) => f.hasAudio) || [];
      const videoOnly = videoData.videoFormats?.filter((f: any) => !f.hasAudio) || [];
      const audios = videoData.audioFormats || [];

      // Default top dropdown: prioritize progressive format with audio (e.g. 360p)
      if (withAudio.length > 0) {
        setSelectedTopItag(withAudio[0].itag);
      } else if (videoData.videoFormats?.length > 0) {
        setSelectedTopItag(videoData.videoFormats[0].itag);
      }

      // Default HD combiner dropdowns: highest resolution video and best audio track
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
      setErrorMessage(dict.hero.errorEmpty);
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
        setErrorMessage(json.error || "Failed to fetch video streams.");
        setVideoData(null);
      } else {
        setVideoData(json.data);
      }
    } catch {
      setErrorMessage("Network error while communicating with video server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: any, title: string) => {
    if (!videoData) return;
    setDownloadingItag(format.itag);

    let targetUrl: string;
    if (format.isAudioOnly) {
      const bestAudio = videoData.audioFormats?.[0];
      targetUrl =
        bestAudio?.url ||
        `/api/video-download?id=${videoData.id}&itag=${bestAudio?.itag || 140}&title=${encodeURIComponent(
          title
        )}&format=mp3`;
    } else {
      targetUrl =
        format.url ||
        `/api/video-download?id=${videoData.id}&itag=${format.itag}&title=${encodeURIComponent(
          title
        )}`;
    }

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
    const watchUrl = `https://www.youtube.com/watch?v=${videoData.id}`;
    navigator.clipboard.writeText(watchUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

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
        ? `HD वीडियो (${selectedHdVideoFormat.qualityLabel}) और ऑडियो डाउनलोड हो रहा है...`
        : `Downloading HD Video (${selectedHdVideoFormat.qualityLabel}) & Audio...`
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
          ? "✅ HD वीडियो और ऑडियो 1 फाइल में जुड़कर डाउनलोड हो गया!"
          : "✅ HD video and audio merged successfully into 1 MP4 file!"
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

  const progressiveFormats = videoData?.videoFormats?.filter((f: any) => f.hasAudio) || [];
  const hdVideoOnlyFormats = videoData?.videoFormats?.filter((f: any) => !f.hasAudio) || [];
  const audioFormats: any[] = videoData?.audioFormats || [];
  const mp3Formats: any[] = videoData?.mp3Formats || [];

  // All formats available in the top dropdown
  const allTopFormats = [
    ...progressiveFormats,
    ...hdVideoOnlyFormats,
    ...mp3Formats,
  ];

  const currentSelectedTopFormat =
    allTopFormats.find((f: any) => f.itag === selectedTopItag) ||
    progressiveFormats[0] ||
    videoData?.videoFormats?.[0];

  const isVideoOnlySelected =
    currentSelectedTopFormat &&
    !currentSelectedTopFormat.hasAudio &&
    !currentSelectedTopFormat.isAudioOnly;

  const isAudioOnlySelected = currentSelectedTopFormat?.isAudioOnly;

  const selectedHdVideoFormat =
    hdVideoOnlyFormats.find((f: any) => f.itag === selectedHdVideoItag) ||
    hdVideoOnlyFormats[0];

  const selectedAudioFormat =
    audioFormats.find((f: any) => f.itag === selectedAudioItag) ||
    audioFormats[0];

  // Distinct language groups for the audio dropdown
  const audioLanguageGroups = Array.from(
    new Set(audioFormats.map((f: any) => f.language || "Original"))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <form onSubmit={handleFetch} className="space-y-4">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            {lang === "hi"
              ? "YouTube वीडियो या Shorts का लिंक डालें:"
              : "Enter YouTube Video or Shorts URL:"}
          </label>
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
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full pl-11 pr-20 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {urlInput ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{lang === "hi" ? "वीडियो लोड हो रहा है..." : "Analyzing Video..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{lang === "hi" ? "वीडियो निकालें" : "Get Video Links"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
        )}
      </div>

      {/* SnapYT-Style 2-Card Preview & Download Experience */}
      {videoData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          {/* Left Card: Video Details & Thumbnail */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Ready pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Film className="w-3.5 h-3.5" />
                <span>YouTube Video Ready</span>
              </div>

              {/* Thumbnail with HD Thumbnail button overlay */}
              <div className="w-full rounded-2xl overflow-hidden aspect-video bg-black relative shadow-md group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={videoData.thumbnail}
                  alt={videoData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                  {videoData.duration}
                </span>

                <a
                  href={`/api/download-proxy?id=${videoData.id}&res=maxresdefault&format=jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors"
                >
                  <ImageIcon className="w-3 h-3 text-emerald-400" />
                  <span>Thumbnail HD</span>
                </a>
              </div>

              {/* Title & Dynamic Metadata */}
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {videoData.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Duration: {videoData.duration}</span>
                  {currentSelectedTopFormat?.sizeMb && (
                    <>
                      <span>•</span>
                      <span>Size: {currentSelectedTopFormat.sizeMb}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Channel: {videoData.author}</span>
                </div>
              </div>
            </div>

            {/* Bottom Media Badges (reflects selected top format) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              {isAudioOnlySelected ? (
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/60">
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio Only</span>
                </span>
              ) : isVideoOnlySelected ? (
                <>
                  <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 border border-rose-200/60 dark:border-rose-900/60">
                    <X className="w-3.5 h-3.5" />
                    <span>No Audio</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 border border-blue-200/60 dark:border-blue-900/60">
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/60">
                    <Music className="w-3.5 h-3.5" />
                    <span>Audio</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 border border-blue-200/60 dark:border-blue-900/60">
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Card: SnapYT-Style Download Options & HD Combiner */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
            {/* Top Download Header */}
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                YouTube Download Options
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Approx. {currentSelectedTopFormat?.sizeMb || "46.52 MB"}
              </p>
            </div>

            {/* Badges Pill Row */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
              {currentSelectedTopFormat?.isRecommended && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                  Recommended
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                {currentSelectedTopFormat?.qualityLabel || "360p"} {currentSelectedTopFormat?.container || "MP4"}
              </span>
              {currentSelectedTopFormat?.sizeMb && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  {currentSelectedTopFormat.sizeMb}
                </span>
              )}
              {isAudioOnlySelected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  Audio Only
                </span>
              ) : isVideoOnlySelected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                  Video Only (No Sound)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  Video + Audio
                </span>
              )}
            </div>

            {/* Quality Dropdown & Warning Card */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {lang === "hi" ? "YouTube वीडियो क्वालिटी चुनें:" : "Choose your YouTube quality"}
              </label>

              {/* Categorized Dropdown with Optgroups matching SnapYT */}
              <select
                value={selectedTopItag || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedTopItag(val);
                  // If user selected a video-only format, auto-sync HD combiner video dropdown
                  const matchHd = hdVideoOnlyFormats.find((f: any) => f.itag === val);
                  if (matchHd) {
                    setSelectedHdVideoItag(val);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {/* 1. Video + Audio (Ready to Download) */}
                {progressiveFormats.length > 0 && (
                  <optgroup
                    label={
                      lang === "hi"
                        ? "🎬 वीडियो + ऑडियो (सीधे डाउनलोड के लिए तैयार)"
                        : "🎬 Video + Audio (Ready to Download)"
                    }
                  >
                    {progressiveFormats.map((f: any) => (
                      <option key={f.itag} value={f.itag}>
                        ★ {f.qualityLabel} {f.container} · {f.sizeMb || ""} — {lang === "hi" ? "Recommended" : "Recommended"}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 2. Higher Quality Video — Combine with audio for sound */}
                {hdVideoOnlyFormats.length > 0 && (
                  <optgroup
                    label={
                      lang === "hi"
                        ? "🎞️ उच्च क्वालिटी वीडियो — आवाज़ के लिए ऑडियो से जोड़ें"
                        : "🎞️ Higher Quality Video — Combine with audio for sound"
                    }
                  >
                    {hdVideoOnlyFormats.map((f: any) => (
                      <option key={f.itag} value={f.itag}>
                        {f.qualityLabel} {f.container} · {f.sizeMb || ""}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 3. MP3 Presets */}
                {mp3Formats.length > 0 && (
                  <optgroup label="🎵 MP3">
                    {mp3Formats.map((f: any) => (
                      <option key={f.itag} value={f.itag}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* SnapYT-Style Amber Warning Callout (shown when Video-Only format is chosen) */}
              {isVideoOnlySelected && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        {lang === "hi" ? "इस क्वालिटी में आवाज़ नहीं है" : "This quality has no sound"}
                      </div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                        {lang === "hi"
                          ? "पूरी HD फाइल डाउनलोड करने के लिए इसे नीचे दिए गए ऑडियो ट्रैक से जोड़ें।"
                          : "Pair it with an audio track below to download a complete HD file."}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => combineRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold whitespace-nowrap shadow-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span>{lang === "hi" ? "Combine with audio →" : "Combine with audio →"}</span>
                  </button>
                </div>
              )}

              {/* Big Green Download Button */}
              <button
                onClick={() =>
                  currentSelectedTopFormat &&
                  handleDownload(currentSelectedTopFormat, videoData.title)
                }
                disabled={downloadingItag === currentSelectedTopFormat?.itag}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {downloadingItag === currentSelectedTopFormat?.itag ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === "hi" ? "डाउनलोड शुरू हो रहा है..." : "Starting Download..."}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>
                      {isAudioOnlySelected
                        ? (lang === "hi" ? "Download Audio (MP3)" : "Download Audio (MP3)")
                        : isVideoOnlySelected
                        ? (lang === "hi" ? "Download Video (No Audio)" : "Download Video (No Audio)")
                        : (lang === "hi" ? "Download Video (Video + Audio)" : "Download Video")}
                    </span>
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
                href={`https://www.youtube.com/watch?v=${videoData.id}`}
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
              <span>{lang === "hi" ? "अन्य YouTube वीडियो डाउनलोड करें" : "Download another YouTube video"}</span>
            </button>

            {/* ── SNAPYT-STYLE HD COMBINER BOX (Attached to combineRef) ── */}
            <div
              ref={combineRef}
              className="p-5 rounded-2xl border-2 border-emerald-500/25 bg-emerald-50/15 dark:bg-emerald-950/10 space-y-4 scroll-mt-6"
            >
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>
                    {lang === "hi"
                      ? "Need higher quality? Combine YouTube video + audio"
                      : "Need higher quality? Combine YouTube video + audio"}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === "hi"
                    ? "Pick a video-only quality and an audio track, then prepare a single HD MP4 file."
                    : "Pick a video-only quality and an audio track, then prepare a single HD MP4 file."}
                </p>
              </div>

              {/* Two Dropdowns Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Select Video Quality */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {lang === "hi" ? "Select video quality" : "Select video quality"}
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
                        {f.qualityLabel} {f.container} · {f.sizeMb || ""}
                      </option>
                    ))}
                    {hdVideoOnlyFormats.length === 0 && (
                      <option value="">No HD streams</option>
                    )}
                  </select>
                </div>

                {/* 2. Select Audio Track (Grouped by Language like SnapYT Image 3) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {lang === "hi" ? "Select audio track" : "Select audio track"}
                  </label>
                  <select
                    value={selectedAudioItag || ""}
                    onChange={(e) => {
                      setSelectedAudioItag(Number(e.target.value));
                      setMergeSuccess(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {audioLanguageGroups.map((langGroup) => (
                      <optgroup key={langGroup} label={langGroup}>
                        {audioFormats
                          .filter((f: any) => (f.language || "Original") === langGroup)
                          .map((f: any) => (
                            <option key={f.itag} value={f.itag}>
                              {f.codecLabel} · {f.audioBitrate} kbps{f.sizeMb ? ` · ${f.sizeMb}` : ""}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                    {audioFormats.length === 0 && (
                      <option value="">No audio tracks</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Merge Progress Bar */}
              {isMerging && (
                <div className="space-y-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {mergeStatusText || "Combining HD video & audio..."}
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
                      ? "✅ HD वीडियो और ऑडियो सफलता से 1 MP4 फाइल में डाउनलोड हो गया!"
                      : "✅ HD video & audio successfully combined and downloaded as 1 MP4 file!"}
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

              {/* SnapYT-Style Primary Prepare HD Download Button */}
              <button
                type="button"
                onClick={handleMergeAndDownload}
                disabled={isMerging || !selectedHdVideoFormat || !selectedAudioFormat}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "hi" ? "वीडियो व ऑडियो जुड़ रहे हैं..." : "Combining Video & Audio..."}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>{lang === "hi" ? "Prepare HD Download" : "Prepare HD Download"}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400">
                By downloading, you agree to our Terms of Service.
              </p>

              {/* Toggle Manual Separate Downloads */}
              <div className="text-center pt-0.5">
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
                          handleDownload(selectedHdVideoFormat, `${videoData.title}-HD-Video`)
                        }
                        className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Save HD Video ({selectedHdVideoFormat.qualityLabel} {selectedHdVideoFormat.container})</span>
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
                      ? "💡 टिप: दोनों फाइलें VLC Player, CapCut या Premiere Pro में एक साथ चलेंगी।"
                      : "💡 Tip: Both files play together in VLC Media Player, CapCut, Premiere Pro, or DaVinci Resolve."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legal Compliance & Fair Use Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Fair Use & Platform Rights Notice:
          </p>
          <p className="mt-0.5 leading-relaxed">
            YTSnap video downloading is provided for personal archiving, fair use commentary, and creator-owned content. Please ensure you have appropriate rights or permissions from the video creator before using media in derivative works.
          </p>
        </div>
      </div>
    </div>
  );
}
