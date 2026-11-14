"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { VideoMetadata } from "@/lib/youtube";
import {
  Search,
  ExternalLink,
  Eye,
  Clock,
  Calendar,
  Tag,
  Copy,
  Check,
  Loader2,
  Download,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
  const [copiedTags, setCopiedTags] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

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

  const handleCopyTags = () => {
    if (videoData?.keywords && videoData.keywords.length > 0) {
      navigator.clipboard.writeText(videoData.keywords.join(", "));
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleInspect} className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            {lang === "hi"
              ? "यूट्यूब वीडियो का लिंक डालें और पूरी जानकारी निकालें:"
              : dict.videoInfo.inputPlaceholder}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{dict.common.loading}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>{lang === "hi" ? "जानकारी निकालें" : dict.videoInfo.fetchBtn}</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">{error}</p>
          )}
        </form>
      </div>

      {/* Video Details Card */}
      {videoData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          {/* Header Preview & Channel Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-80 rounded-2xl overflow-hidden aspect-video bg-black shrink-0 relative shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoData.thumbnailUrl}
                alt={videoData.title}
                className="w-full h-full object-cover"
              />
              {videoData.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">
                  {videoData.duration}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {videoData.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <a
                  href={videoData.authorUrl || `https://www.youtube.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>{videoData.authorName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span>•</span>
                <span className="font-mono text-xs text-slate-400">ID: {videoData.id}</span>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  href={`/${lang}/tools/youtube-video-downloader`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "वीडियो डाउनलोड करें" : "Download Video"}</span>
                </Link>

                <Link
                  href={`/${lang}/tools/youtube-thumbnail-downloader`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                >
                  <span>{lang === "hi" ? "थंबनेल सेव करें" : "Get Thumbnails"}</span>
                </Link>

                <a
                  href={`https://www.youtube.com/watch?v=${videoData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{dict.videoInfo.openInYoutube}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>{lang === "hi" ? "व्यूज (Views)" : "Total Views"}</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {videoData.viewCount || "Public"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === "hi" ? "अवधि (Duration)" : "Duration"}</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                {videoData.duration || "HD Video"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === "hi" ? "पब्लिश डेट" : "Published Date"}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {videoData.publishedAt ? new Date(videoData.publishedAt).toLocaleDateString() : "Uploaded"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>{lang === "hi" ? "कैटेगरी" : "Category"}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {videoData.category || "Entertainment"}
              </div>
            </div>
          </div>

          {/* YouTube Video Tags / Keywords Section */}
          {videoData.keywords && videoData.keywords.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span>{lang === "hi" ? `वीडियो टैग्स (${videoData.keywords.length})` : `Video Tags (${videoData.keywords.length})`}</span>
                </h3>
                <button
                  onClick={handleCopyTags}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {copiedTags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTags ? (lang === "hi" ? "कॉपी हो गया!" : "Copied!") : (lang === "hi" ? "सभी टैग कॉपी करें" : "Copy All Tags")}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {videoData.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Description */}
          {videoData.description && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === "hi" ? "वीडियो विवरण (Description):" : "Video Description:"}
              </h3>
              <div className="relative">
                <p
                  className={`text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed ${
                    showFullDesc ? "" : "max-h-28 overflow-hidden"
                  }`}
                >
                  {videoData.description}
                </p>
                {videoData.description.length > 250 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <span>{showFullDesc ? (lang === "hi" ? "कम दिखाएं" : "Show less") : (lang === "hi" ? "पूरा विवरण पढ़ें" : "Read full description")}</span>
                    {showFullDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Interactive Embed Preview & Code */}
          {videoData.embedHtml && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span>{dict.videoInfo.embedPreview}</span>
                </h3>
                <button
                  onClick={handleCopyEmbed}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
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
        </div>
      )}
    </div>
  );
}
