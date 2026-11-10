"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { VideoMetadata } from "@/lib/youtube";
import {
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  Loader2,
  Download,
  Info,
} from "lucide-react";

interface VideoInfoToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function VideoInfoTool({ lang, dict }: VideoInfoToolProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Authorized direct media inspector state
  const [directMediaUrl, setDirectMediaUrl] = useState("");
  const [isInspectingDirect, setIsInspectingDirect] = useState(false);
  const [directMediaResult, setDirectMediaResult] = useState<any>(null);
  const [directMediaError, setDirectMediaError] = useState<string | null>(null);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError(dict.hero.errorEmpty);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), lang }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to inspect video.");
        setVideoData(null);
      } else {
        setVideoData(json.data);
      }
    } catch {
      setError("Network error while inspecting video.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmbed = () => {
    if (videoData?.embedHtml) {
      navigator.clipboard.writeText(videoData.embedHtml);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleInspectDirectMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMediaUrl.trim()) return;

    setIsInspectingDirect(true);
    setDirectMediaError(null);
    setDirectMediaResult(null);

    try {
      const res = await fetch("/api/authorized-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl: directMediaUrl.trim() }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setDirectMediaError(json.error || "Failed to inspect media URL.");
      } else {
        setDirectMediaResult(json);
      }
    } catch {
      setDirectMediaError("Error connecting to media server.");
    } finally {
      setIsInspectingDirect(false);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleInspect} className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            {dict.videoInfo.inputPlaceholder}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{dict.common.loading}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>{dict.videoInfo.fetchBtn}</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
        </form>
      </div>

      {/* Video Details Card */}
      {videoData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-72 rounded-2xl overflow-hidden aspect-video bg-black shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoData.thumbnailUrl}
                alt={videoData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {videoData.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">{dict.videoInfo.channel}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {videoData.authorName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{dict.videoInfo.videoId}</span>
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {videoData.id}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`https://www.youtube.com/watch?v=${videoData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors"
                >
                  <span>{dict.videoInfo.openInYoutube}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Embed Preview & Code */}
          {videoData.embedHtml && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span>{dict.videoInfo.embedPreview}</span>
                </h3>
                <button
                  onClick={handleCopyEmbed}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? dict.common.copied : dict.common.copy}</span>
                </button>
              </div>
              <div
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video max-w-2xl mx-auto shadow-inner"
                dangerouslySetInnerHTML={{ __html: videoData.embedHtml }}
              />
            </div>
          )}

          {/* Compliance & Fair Use Notice */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{dict.videoInfo.complianceTitle}</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed">
                {dict.videoInfo.complianceText}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
                {dict.videoInfo.officialYoutubeNotice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authorized Media / Self-Hosted Stream Inspector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {dict.videoInfo.authorizedDownloadSection}
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {dict.videoInfo.authorizedDownloadHelp}
        </p>

        <form onSubmit={handleInspectDirectMedia} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="url"
            value={directMediaUrl}
            onChange={(e) => setDirectMediaUrl(e.target.value)}
            placeholder={dict.videoInfo.authorizedUrlPlaceholder}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isInspectingDirect}
            className="px-5 py-3 bg-secondary hover:bg-secondary-hover text-white text-sm font-bold rounded-xl shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isInspectingDirect ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{dict.videoInfo.inspectMediaBtn}</span>
          </button>
        </form>

        {directMediaError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
            {directMediaError}
          </div>
        )}

        {directMediaResult && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-sm">
            {directMediaResult.authorized ? (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Authorized Stream Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Content Type</span>
                    <span className="font-mono">{directMediaResult.contentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Content Length</span>
                    <span className="font-mono">
                      {directMediaResult.contentLength
                        ? `${(directMediaResult.contentLength / (1024 * 1024)).toFixed(2)} MB`
                        : "Stream"}
                    </span>
                  </div>
                </div>
                <a
                  href={directMediaResult.mediaUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{dict.videoInfo.downloadMediaBtn}</span>
                </a>
              </>
            ) : (
              <div className="text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
                <strong>Platform Notice:</strong> {directMediaResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
