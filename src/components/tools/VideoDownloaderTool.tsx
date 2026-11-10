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
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);

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

  const handleDownload = (itag: number, title: string) => {
    if (!videoData) return;
    setDownloadingItag(itag);

    const downloadUrl = `/api/video-download?id=${videoData.id}&itag=${itag}&title=${encodeURIComponent(
      title
    )}`;

    // Open direct Google CDN stream in a new tab for instant high-speed download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => setDownloadingItag(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <form onSubmit={handleFetch} className="space-y-4">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            Enter YouTube Video or Shorts URL:
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
                  <span>Analyzing Video...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Get Video Links</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Video Stream Results Card */}
      {videoData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Header Video Preview */}
          <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-full md:w-64 rounded-2xl overflow-hidden aspect-video bg-black relative shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                {videoData.duration}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                ✓ Ready for Download
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {videoData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span><strong>Channel:</strong> {videoData.author}</span>
                <span>•</span>
                <span><strong>Views:</strong> {videoData.views}</span>
              </div>
            </div>
          </div>

          {/* Instructions Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs sm:text-sm flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                {lang === "hi" ? "डाउनलोड कैसे करें:" : "How to save your download:"}
              </p>
              <p className="text-blue-700 dark:text-blue-400 leading-relaxed text-xs">
                {lang === "hi"
                  ? "बटन पर क्लिक करने पर वीडियो हाई-स्पीड Google CDN से नए टैब में खुलेगा। वीडियो प्लेयर में 3 डॉट्स (⋮) पर क्लिक करके 'Download' चुनें, या कीबोर्ड पर Ctrl + S दबाकर सेव करें।"
                  : "Clicking download opens the direct high-speed Google CDN stream in a new tab. In the video player, click the 3 dots (⋮) on bottom-right and select 'Download', or press Ctrl + S."}
              </p>
            </div>
          </div>

          {/* Formats Tabs (Video vs Audio) */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "video"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video (MP4)</span>
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "audio"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio Only (MP3/M4A)</span>
            </button>
          </div>

          {/* Video Formats Table */}
          {activeTab === "video" && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Available Video Resolutions:
              </span>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {videoData.videoFormats.map((f: any) => (
                  <div
                    key={f.itag}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
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
                          {f.hasAudio ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                              ✓ Video + Audio
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                              Video Only
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {f.sizeMb ? `Est. Size: ${f.sizeMb}` : "Direct Stream"} • {f.fps || 30} FPS
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(f.itag, videoData.title)}
                      disabled={downloadingItag === f.itag}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-60"
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

          {/* Audio Formats Table */}
          {activeTab === "audio" && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Available Audio Bitrates:
              </span>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {videoData.audioFormats.map((f: any) => (
                  <div
                    key={f.itag}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
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
                          {f.sizeMb ? `Est. Size: ${f.sizeMb}` : "Direct Audio"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(f.itag, videoData.title)}
                      disabled={downloadingItag === f.itag}
                      className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-60"
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

          {/* Legal Compliance & Fair Use Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
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
      )}
    </div>
  );
}
