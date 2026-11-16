"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Film,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface VideoDownloaderToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
  initialUrl?: string;
  isDedicatedPage?: boolean;
}

export function VideoDownloaderTool({
  lang,
  dict,
  initialUrl = "",
  isDedicatedPage = false,
}: VideoDownloaderToolProps) {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any | null>(null);
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);

  // Selected format in top dropdown
  const [selectedTopItag, setSelectedTopItag] = useState<number | null>(null);
  // Selected audio track
  const [selectedAudioItag, setSelectedAudioItag] = useState<number | null>(null);

  // Active tab in bottom format table ("video" | "audio" | "other")
  const [tableTab, setTableTab] = useState<"video" | "audio" | "other">("video");

  // HD Mux / Combine states
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStatusText, setMergeStatusText] = useState("");
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Ref to scroll to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // Function to fetch video details
  const fetchVideoDetails = async (urlToFetch: string) => {
    if (!urlToFetch.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/video-formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToFetch.trim(), lang }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // response was not JSON
      }

      if (!res.ok) {
        setErrorMessage(
          json?.error ||
          (res.status === 429
            ? "Too many requests. Please wait a moment."
            : `Server returned error (${res.status}). Please try again.`)
        );
        setVideoData(null);
      } else if (!json?.data) {
        setErrorMessage("Invalid response from video server.");
        setVideoData(null);
      } else {
        setVideoData(json.data);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMessage(
        err?.message?.includes("Failed to fetch")
          ? "Network connection error. Please verify your connection or try again."
          : (err?.message || "Error while communicating with video server.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If initialUrl is passed on mount (e.g. dedicated /download page), fetch automatically
  useEffect(() => {
    if (initialUrl && !videoData) {
      setUrlInput(initialUrl);
      fetchVideoDetails(initialUrl);
    }
  }, [initialUrl]);

  // When videoData arrives, initialize default selection
  useEffect(() => {
    if (videoData) {
      const videos = videoData.videoFormats || [];
      const audios = videoData.audioFormats || [];

      // Default selection: prioritize 1080p, then 720p, then 360p
      const p1080 = videos.find((f: any) => f.qualityLabel === "1080p" && f.container === "MP4");
      const p720 = videos.find((f: any) => f.qualityLabel === "720p" && f.container === "MP4");
      const p360 = videos.find((f: any) => f.qualityLabel === "360p" && f.container === "MP4");
      const defaultVideo = p1080 || p720 || p360 || videos[0];

      if (defaultVideo) {
        setSelectedTopItag(defaultVideo.itag);
      }

      if (audios.length > 0) {
        setSelectedAudioItag(audios[0].itag);
      }

      setIsMerging(false);
      setMergeProgress(0);
      setMergeStatusText("");
      setMergeSuccess(false);
      setMergeError(null);

      // Auto scroll to results if on dedicated page or after load
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
    setMergeSuccess(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setErrorMessage(dict.hero.errorEmpty);
      return;
    }

    // If on homepage or standard tool page, navigate directly to dedicated download page
    if (!isDedicatedPage) {
      router.push(`/${lang}/download?url=${encodeURIComponent(cleanUrl)}`);
      return;
    }

    // Already on dedicated download page -> fetch in place
    await fetchVideoDetails(cleanUrl);
  };

  const handleDownload = (format: any, title: string) => {
    if (!videoData) return;
    setDownloadingItag(format.itag);

    let targetUrl: string;
    const streamParam = format.url ? `&streamUrl=${encodeURIComponent(format.url)}` : "";
    if (format.isAudioOnly || format.isMp3 || format.container === "MP3") {
      targetUrl = `/api/video-download?id=${videoData.id}&itag=${format.itag || 140}&title=${encodeURIComponent(
        title
      )}&format=mp3${streamParam}`;
    } else {
      targetUrl = `/api/video-download?id=${videoData.id}&itag=${format.itag}&title=${encodeURIComponent(
        title
      )}${streamParam}`;
    }

    const a = document.createElement("a");
    a.href = targetUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("download", "");
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

  const handleMergeAndDownload = (videoFormat: any, audioFormat: any) => {
    if (!videoData || !videoFormat) return;

    setMergeError(null);
    setMergeSuccess(false);

    // If video natively has audio (progressive like 360p itag 18), direct 1-file download!
    if (videoFormat.hasAudio) {
      handleDownload(videoFormat, videoData.title);
      setMergeSuccess(true);
      setMergeStatusText(
        lang === "hi"
          ? `✅ ${videoFormat.qualityLabel} वीडियो और ऑडियो (1 File Ready) डाउनलोड शुरू हो गया!`
          : `✅ ${videoFormat.qualityLabel} Video & Audio (1 File Ready) download started!`
      );
      return;
    }

    // DASH formats (1080p Full HD, 720p HD, etc.):
    // 1. Download HD video stream directly from Google CDN
    handleDownload(videoFormat, `${videoData.title}-${videoFormat.qualityLabel}-HD-Video`);

    // 2. Download original audio track directly from Google CDN
    const targetAudio = audioFormat || (videoData.audioFormats && videoData.audioFormats[0]);
    if (targetAudio) {
      setTimeout(() => {
        handleDownload(targetAudio, `${videoData.title}-Original-Audio`);
      }, 1000);
    }

    setMergeSuccess(true);
    setMergeStatusText(
      lang === "hi"
        ? `✅ ${videoFormat.qualityLabel} HD वीडियो और ओरिजिनल ऑडियो दोनों डाउनलोड हो रहे हैं!`
        : `✅ ${videoFormat.qualityLabel} HD Video and Original Audio Track downloading!`
    );
    setMergeError(
      lang === "hi"
        ? "💡 टिप: YouTube 1080p को दो अलग-अलग फाइलों (HD Video + Audio Track) में रखता है। दोनों फाइलें सीधे Google के हाई-स्पीड CDN से आपके डिवाइस में डाउनलोड हो रही हैं। अगर आपको 1 ही फाइल में तुरंत तैयार वीडियो+ऑडियो चाहिए, तो ऊपर 360p (1 File Ready) चुनें।"
        : "💡 Tip: YouTube delivers 1080p as separate DASH video & audio streams. Both files are downloading at maximum speed directly from Google CDN. For an instant 1-file video+audio, choose 360p (1 File Ready)."
    );
  };

  // Group and sort formats
  const videoFormats: any[] = videoData?.videoFormats || [];
  const audioFormats: any[] = videoData?.audioFormats || [];
  const mp3Formats: any[] = videoData?.mp3Formats || [];

  // Filter distinct video resolutions for the main dropdown
  const distinctResolutions: string[] = [];
  const mainVideoOptions: any[] = [];
  for (const f of videoFormats) {
    const q = f.qualityLabel || `${f.resolution}p`;
    if (q && !distinctResolutions.includes(q)) {
      distinctResolutions.push(q);
      mainVideoOptions.push(f);
    }
  }

  // Determine current selection
  const isMp3Selected = selectedTopItag !== null && selectedTopItag < 0;
  const currentSelectedMp3 = isMp3Selected
    ? mp3Formats.find((m: any) => m.itag === selectedTopItag) || mp3Formats[0]
    : null;

  const currentSelectedVideo =
    videoFormats.find((f: any) => f.itag === selectedTopItag) ||
    mainVideoOptions[0] ||
    videoFormats[0];

  const currentSelectedAudio =
    audioFormats.find((a: any) => a.itag === selectedAudioItag) ||
    audioFormats[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Dedicated YouTube Download Options Section */}
      {videoData && (
        <div ref={resultsRef} className="space-y-6 animate-in fade-in duration-300 scroll-mt-6">
          {/* 1. Video Summary Card (Vidssave Banner Style) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Thumbnail with HD Button */}
              <div className="w-full md:w-72 shrink-0 rounded-2xl overflow-hidden aspect-video bg-black relative shadow-md group">
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

              {/* Title & Info */}
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <Film className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "डाउनलोड के लिए तैयार" : "Ready to Download"}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {videoData.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>⏱️ {videoData.duration}</span>
                  <span>•</span>
                  <span>📺 {videoData.author}</span>
                  {videoData.views && (
                    <>
                      <span>•</span>
                      <span>👁️ {videoData.views} views</span>
                    </>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={`https://www.youtube.com/watch?v=${videoData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{lang === "hi" ? "नया वीडियो" : "New Video"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Success / Toast Status Notice */}
          {mergeSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mergeStatusText}</span>
            </div>
          )}

          {mergeError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200 text-xs font-semibold">
              {mergeError}
            </div>
          )}

          {/* 3. Vidssave Style Formats & Download Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                  <span>{lang === "hi" ? "डाउनलोड विकल्प (Download Options)" : "Download Options"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === "hi"
                    ? "सीधे 1-क्लिक में वीडियो (MP4) या ऑडियो (MP3) डाउनलोड करें।"
                    : "Direct 1-click downloads for MP4 Video and MP3 Audio."}
                </p>
              </div>

              {/* Vidssave Tabs Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTableTab("video")}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    tableTab === "video"
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video (MP4) · {mainVideoOptions.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTableTab("audio")}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    tableTab === "audio"
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Music (MP3) · {mp3Formats.length + audioFormats.length}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: VIDEO (MP4) - Vidssave Row List */}
            {tableTab === "video" && (
              <div className="space-y-3">
                {mainVideoOptions.map((f: any) => {
                  const is1080 = f.qualityLabel === "1080p";
                  const is720 = f.qualityLabel === "720p";
                  const isReady1File = f.hasAudio;
                  const isCurrentDownloading = downloadingItag === f.itag;

                  return (
                    <div
                      key={f.itag}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                    >
                      {/* Left: Format Badge + Quality Info */}
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs tracking-wider border border-blue-500/20">
                          {f.container || "MP4"}
                        </span>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900 dark:text-white">
                              {f.qualityLabel}
                            </span>
                            {is1080 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                Full HD
                              </span>
                            )}
                            {is720 && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200/60">
                                HD
                              </span>
                            )}
                            {isReady1File && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                🎬 1-File Ready
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isReady1File
                              ? (lang === "hi" ? "वीडियो + ऑडियो (1 पूरी फाइल तैयार)" : "Video + Audio (1 Complete File)")
                              : (lang === "hi" ? "Ultra HD वीडियो + ऑडियो ट्रैक" : "Ultra HD Video + Audio Track")}
                          </p>
                        </div>
                      </div>

                      {/* Right: File Size + Fast Download Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {f.sizeMb ? `~${f.sizeMb}` : "Fast Download"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMergeAndDownload(f, currentSelectedAudio)}
                          disabled={isCurrentDownloading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isCurrentDownloading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{lang === "hi" ? "डाउनलोड शुरू..." : "Starting..."}</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-current" />
                              <span>⚡ Fast Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: AUDIO / MUSIC (MP3) - Vidssave Row List */}
            {tableTab === "audio" && (
              <div className="space-y-3">
                {/* MP3 High-Bitrate Formats */}
                {mp3Formats.map((m: any) => {
                  const isCurrentDownloading = downloadingItag === m.itag;
                  const is320 = m.bitrate === 320;

                  return (
                    <div
                      key={m.itag}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs tracking-wider border border-emerald-500/20">
                          MP3
                        </span>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900 dark:text-white">
                              {m.bitrate} KBPS
                            </span>
                            {is320 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                Highest Quality
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {is320
                              ? (lang === "hi" ? "320 kbps शुद्ध HD साउंड" : "320 kbps Crystal Clear HD Audio")
                              : (lang === "hi" ? "MP3 ऑडियो फाइल" : "MP3 Audio File")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {m.sizeMb || "Fast Audio"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDownload(m, videoData.title)}
                          disabled={isCurrentDownloading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isCurrentDownloading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{lang === "hi" ? "डाउनलोड शुरू..." : "Starting..."}</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-current" />
                              <span>⚡ Fast Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Original Audio Tracks (M4A AAC, Opus) */}
                {audioFormats.map((a: any) => {
                  const isCurrentDownloading = downloadingItag === a.itag;

                  return (
                    <div
                      key={a.itag}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs tracking-wider border border-blue-500/20">
                          {a.container?.toUpperCase() || "M4A"}
                        </span>

                        <div className="space-y-0.5">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {a.codecLabel} ({a.audioBitrate} kbps)
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {a.language || "Original Master Audio"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {a.sizeMb || "Standard"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDownload(a, `${videoData.title}-Original-Audio`)}
                          disabled={isCurrentDownloading}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isCurrentDownloading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Starting...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Track</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compliance Notice */}
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
