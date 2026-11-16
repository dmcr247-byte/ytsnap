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

  const handleMergeAndDownload = async (videoFormat: any, audioFormat: any) => {
    if (!videoData || !videoFormat) return;

    // If video natively has audio (progressive like 360p itag 18), direct download!
    if (videoFormat.hasAudio) {
      handleDownload(videoFormat, videoData.title);
      return;
    }

    // If custom worker (e.g. Render/VPS) is configured, route 1080p/720p directly to it
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "https://ytsnap-worker.onrender.com";
    if (workerUrl) {
      const resNumber = parseInt(videoFormat.qualityLabel, 10) || 1080;
      const targetUrl = `${workerUrl.replace(/\/$/, "")}/api/download?id=${videoData.id}&res=${resNumber}`;
      const a = document.createElement("a");
      a.href = targetUrl;
      a.setAttribute("download", "");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMergeSuccess(true);
      setMergeStatusText(
        lang === "hi"
          ? `✅ 1080p Full HD वीडियो और ऑडियो जुड़कर डाउनलोड हो रहा है!`
          : `✅ 1080p Full HD video & audio combined download started!`
      );
      return;
    }

    // If no separate audio is found, trigger direct download of the video stream
    const targetAudio = audioFormat || (videoData.audioFormats && videoData.audioFormats[0]);
    if (!targetAudio) {
      handleDownload(videoFormat, videoData.title);
      return;
    }

    setIsMerging(true);
    setMergeError(null);
    setMergeSuccess(false);
    setMergeProgress(5);
    setMergeStatusText(
      lang === "hi"
        ? `HD वीडियो (${videoFormat.qualityLabel}) और ऑडियो तैयार हो रहा है...`
        : `Combining HD Video (${videoFormat.qualityLabel}) & Audio...`
    );

    try {
      const videoStreamParam = videoFormat.url
        ? `&streamUrl=${encodeURIComponent(videoFormat.url)}`
        : "";
      const audioStreamParam = targetAudio.url
        ? `&streamUrl=${encodeURIComponent(targetAudio.url)}`
        : "";

      const videoStreamEndpoint = `/api/video-download?id=${videoData.id}&itag=${videoFormat.itag}&title=${encodeURIComponent(
        videoData.title
      )}${videoStreamParam}`;
      const audioStreamEndpoint = `/api/video-download?id=${videoData.id}&itag=${targetAudio.itag}&title=${encodeURIComponent(
        videoData.title
      )}&format=m4a${audioStreamParam}`;

      const { mergeVideoAndAudioInBrowser } = await import("@/lib/client-muxer");
      await mergeVideoAndAudioInBrowser(
        videoStreamEndpoint,
        audioStreamEndpoint,
        videoData.title,
        videoFormat.qualityLabel,
        (status, pct) => {
          setMergeStatusText(status);
          setMergeProgress(pct);
        }
      );
      setMergeSuccess(true);
      setMergeStatusText(
        lang === "hi"
          ? "✅ HD वीडियो और ऑडियो 1 पूरी MP4 फाइल में डाउनलोड हो गया!"
          : "✅ HD video and audio combined into 1 complete MP4 file!"
      );
    } catch (err: any) {
      console.warn("Client merge fallback:", err);
      // Fallback: download video stream and audio stream sequentially so user has both
      handleDownload(videoFormat, `${videoData.title}-${videoFormat.qualityLabel}-HD-Video`);
      
      if (targetAudio) {
        setTimeout(() => {
          handleDownload(targetAudio, `${videoData.title}-AudioTrack`);
        }, 1200);
      }

      setMergeSuccess(true);
      setMergeStatusText(
        lang === "hi"
          ? `✅ ${videoFormat.qualityLabel} HD वीडियो और ऑडियो ट्रैक दोनों डाउनलोड हो गए!`
          : `✅ ${videoFormat.qualityLabel} HD Video & Audio track downloaded!`
      );
      setMergeError(
        lang === "hi"
          ? "नोट: YouTube 1080p को दो अलग-अलग फाइलों (HD वीडियो + ऑडियो) में रखता है। आपके फोन/PC में 1080p वीडियो और ऑडियो दोनों फाइलें डाउनलोड हो गई हैं। अगर आपको 1 ही फाइल में तुरंत वीडियो+ऑडियो चाहिए, तो नीचे 360p (Instant Video+Audio) चुनें।"
          : "Notice: YouTube stores 1080p as separate DASH video & audio files. Both HD video and audio have been downloaded. For a single instant combined file, select 360p (Ready-to-watch)."
      );
    } finally {
      setIsMerging(false);
    }
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
          {/* Main 2-Card Preview & Download Experience */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                {/* Title & Metadata */}
                <div className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {videoData.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Duration: {videoData.duration}</span>
                    {currentSelectedVideo?.sizeMb && (
                      <>
                        <span>•</span>
                        <span>Size: {currentSelectedVideo.sizeMb}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Channel: {videoData.author}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Badges */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {isMp3Selected ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/60">
                    <Music className="w-3.5 h-3.5" />
                    <span>Audio (MP3)</span>
                  </span>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/60">
                      <Music className="w-3.5 h-3.5" />
                      <span>Audio</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 border border-blue-200/60 dark:border-blue-900/60">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video ({currentSelectedVideo?.qualityLabel || "HD"})</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Card: YouTube Download Options */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  YouTube Download Options
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Approx. {currentSelectedVideo?.sizeMb || currentSelectedMp3?.sizeMb || "4.08 MB"}
                </p>
              </div>

              {/* Badges Pill Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                  Recommended
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                  {isMp3Selected
                    ? `MP3 · ${currentSelectedMp3?.bitrate} kbps`
                    : `${currentSelectedVideo?.qualityLabel || "1080p"} ${currentSelectedVideo?.container || "MP4"}`}
                </span>
                {(currentSelectedVideo?.sizeMb || currentSelectedMp3?.sizeMb) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                    {currentSelectedVideo?.sizeMb || currentSelectedMp3?.sizeMb}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  {isMp3Selected ? "Audio Only" : "Video + Audio"}
                </span>
              </div>

              {/* Quality & Audio Selectors */}
              <div className="space-y-4">
                {/* 1. Quality Selector Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {lang === "hi" ? "वीडियो क्वालिटी चुनें (Choose your YouTube quality):" : "Choose your YouTube quality:"}
                  </label>
                  <select
                    value={selectedTopItag || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSelectedTopItag(val);
                      setMergeSuccess(false);
                      setMergeError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {/* Video + Audio Group (1080p, 720p, 480p, 360p) */}
                    <optgroup
                      label={
                        lang === "hi"
                          ? "🎬 वीडियो + ऑडियो (Full Video + Audio)"
                          : "🎬 Video + Audio (Full Video with Sound)"
                      }
                    >
                      {mainVideoOptions.map((f: any) => (
                        <option key={f.itag} value={f.itag}>
                          ★ {f.qualityLabel} {f.container} · {f.sizeMb || ""} {f.hasAudio ? "— Video + Audio (1 File Ready)" : "— HD Video + Audio Track"}
                        </option>
                      ))}
                    </optgroup>

                    {/* MP3 Presets */}
                    {mp3Formats.length > 0 && (
                      <optgroup label="🎵 MP3 Audio (High Bitrate)">
                        {mp3Formats.map((m: any) => (
                          <option key={m.itag} value={m.itag}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 2. Audio Track Selector (Visible when Video is selected) */}
                {!isMp3Selected && (
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === "hi" ? "ऑडियो ट्रैक चुनें (Select Audio Track):" : "Select Audio Track:"}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {currentSelectedAudio ? `${currentSelectedAudio.audioBitrate} kbps` : "Original"}
                      </span>
                    </label>
                    <select
                      value={selectedAudioItag || ""}
                      onChange={(e) => setSelectedAudioItag(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {audioFormats.map((a: any) => (
                        <option key={a.itag} value={a.itag}>
                          {a.language || "Original Audio"} — {a.codecLabel} ({a.audioBitrate} kbps){a.sizeMb ? ` · ${a.sizeMb}` : ""}
                        </option>
                      ))}
                      {audioFormats.length === 0 && (
                        <option value="140">Default Audio Track (128 kbps AAC)</option>
                      )}
                    </select>
                  </div>
                )}

                {/* Primary Download Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isMp3Selected && currentSelectedMp3) {
                      handleDownload(currentSelectedMp3, videoData.title);
                    } else if (currentSelectedVideo) {
                      handleMergeAndDownload(currentSelectedVideo, currentSelectedAudio);
                    }
                  }}
                  disabled={isMerging || downloadingItag === selectedTopItag}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{mergeStatusText || "Combining HD Video & Audio..."}</span>
                    </>
                  ) : downloadingItag === selectedTopItag ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{lang === "hi" ? "डाउनलोड शुरू हो रहा है..." : "Starting Download..."}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>
                        {isMp3Selected
                          ? (lang === "hi" ? `ऑडियो (MP3) डाउनलोड करें (${currentSelectedMp3?.bitrate}k)` : `Download Audio (MP3 · ${currentSelectedMp3?.bitrate} kbps)`)
                          : (lang === "hi"
                              ? `वीडियो डाउनलोड करें (${currentSelectedVideo?.qualityLabel || "HD"} + Sound)`
                              : `Download Video (${currentSelectedVideo?.qualityLabel || "HD"} MP4 + Audio)`)}
                      </span>
                    </>
                  )}
                </button>

                {/* In-Place Merge Progress Bar */}
                {isMerging && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-in fade-in">
                    <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span>{mergeStatusText}</span>
                      <span>{mergeProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${mergeProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Merge Success Notice */}
                {mergeSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{mergeStatusText}</span>
                  </div>
                )}

                {/* Merge Error Notice */}
                {mergeError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                    {mergeError}
                  </div>
                )}

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
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "अन्य YouTube वीडियो डाउनलोड करें" : "Download another YouTube video"}</span>
              </button>
            </div>
          </div>

          {/* Interactive All Formats Table (1-Click Direct Downloads) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {lang === "hi" ? "सभी उपलब्ध डाउनलोड लिंक्स" : "All Available Download Links"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === "hi"
                    ? "सीधे 1-क्लिक में 1080p, 720p, 480p, 360p या MP3 ऑडियो डाउनलोड करें।"
                    : "Direct 1-click downloads for 1080p, 720p, 480p, 360p or MP3 Audio."}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTableTab("video")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    tableTab === "video"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  🎬 Video ({mainVideoOptions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTableTab("audio")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    tableTab === "audio"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  🎵 Audio ({mp3Formats.length + audioFormats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTableTab("other")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    tableTab === "other"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  🎞️ Raw Tracks
                </button>
              </div>
            </div>

            {/* Tab 1: Video + Audio */}
            {tableTab === "video" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Resolution</th>
                      <th className="pb-3 font-semibold">Format</th>
                      <th className="pb-3 font-semibold">File Size</th>
                      <th className="pb-3 font-semibold text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mainVideoOptions.map((f: any) => (
                      <tr key={f.itag} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                              {f.qualityLabel}
                            </span>
                            {f.qualityLabel === "1080p" && (
                              <span className="text-[10px] font-bold text-amber-500">Full HD</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">
                          {f.container} {f.hasAudio ? "(Video + Audio 1-File)" : "(HD Video + Audio)"}
                        </td>
                        <td className="py-3 text-slate-500 font-mono">
                          {f.sizeMb || "Fast"}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleMergeAndDownload(f, currentSelectedAudio)}
                            disabled={isMerging}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {f.qualityLabel}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Audio Only */}
            {tableTab === "audio" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Audio Quality</th>
                      <th className="pb-3 font-semibold">Format</th>
                      <th className="pb-3 font-semibold">File Size</th>
                      <th className="pb-3 font-semibold text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mp3Formats.map((m: any) => (
                      <tr key={m.itag} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                              MP3 · {m.bitrate} kbps
                            </span>
                            {m.bitrate === 320 && (
                              <span className="text-[10px] font-bold text-amber-500">Highest Quality</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">
                          MP3 Audio
                        </td>
                        <td className="py-3 text-slate-500 font-mono">
                          {m.sizeMb || "HQ"}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownload(m, videoData.title)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download MP3</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {audioFormats.map((a: any) => (
                      <tr key={a.itag} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                            {a.codecLabel} ({a.audioBitrate} kbps)
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">
                          {a.language || "Original Audio Track"}
                        </td>
                        <td className="py-3 text-slate-500 font-mono">
                          {a.sizeMb || "Standard"}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownload(a, `${videoData.title}-Audio`)}
                            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save Audio</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Raw Tracks (for video editors) */}
            {tableTab === "other" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Track Description</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">File Size</th>
                      <th className="pb-3 font-semibold text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {videoFormats.map((f: any) => (
                      <tr key={f.itag} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {f.qualityLabel} {f.container} {f.fps ? `(${f.fps}fps)` : ""}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">
                          {f.hasAudio ? "Video + Audio" : "Video Stream (Silent)"}
                        </td>
                        <td className="py-3 text-slate-500 font-mono">
                          {f.sizeMb || "Direct"}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownload(f, `${videoData.title}-${f.qualityLabel}`)}
                            className="px-3.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save File</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
