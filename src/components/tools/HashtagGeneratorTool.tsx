"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { Hash, Sparkles, Copy, Check, TrendingUp, Loader2 } from "lucide-react";

interface HashtagGeneratorToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function HashtagGeneratorTool({ lang, dict }: HashtagGeneratorToolProps) {
  const [keyword, setKeyword] = useState("");
  const [popularHashtags, setPopularHashtags] = useState<string[]>([]);
  const [nicheHashtags, setNicheHashtags] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedSource, setExtractedSource] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = keyword.trim();
    if (!input) return;

    setExtractedSource(null);

    // 1. If YouTube Video URL, extract hashtags from video
    const videoId = extractYouTubeVideoId(input);
    if (videoId) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/video-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input, lang }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const titleWords = (json.data.title || "").split(/\s+/).filter((w: string) => w.startsWith("#"));
          const descWords = (json.data.description || "").split(/\s+/).filter((w: string) => w.startsWith("#"));
          const tagHashtags = (json.data.keywords || []).map((k: string) => `#${k.replace(/[^a-zA-Z0-9]/g, "")}`);

          const combined = Array.from(new Set([...titleWords, ...descWords, ...tagHashtags]))
            .filter((h) => h.length > 2 && h.length < 35);

          if (combined.length > 0) {
            setPopularHashtags(combined.slice(0, 8));
            setNicheHashtags(combined.slice(8, 20));
            setExtractedSource(json.data.title || "YouTube Video");
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not extract hashtags from video, fallback to generation:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // 2. Keyword generation
    const clean = input.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "contentcreator";

    const popular = [
      `#${clean}`,
      "#shorts",
      `#${clean}tips`,
      "#youtubeshorts",
      `#${clean}tutorial`,
      "#trending",
      "#viralvideo",
      "#explore",
      "#fyp",
      "#creator",
    ];

    const niche = [
      `#${clean}life`,
      `#${clean}2026`,
      `#best${clean}`,
      `#howTo${clean}`,
      `#${clean}review`,
      `#${clean}guide`,
      `#${clean}hacks`,
      `#learn${clean}`,
      `#${clean}community`,
      `#${clean}india`,
    ];

    setPopularHashtags(popular);
    setNicheHashtags(niche);
  };

  const copyIndividual = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copyAll = () => {
    const all = [...popularHashtags, ...nicheHashtags].join(" ");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            {lang === "hi"
              ? "टॉपिक लिखें या YouTube Video का लिंक पेस्ट करके वायरल हैशटैग निकालें:"
              : "Enter Video Topic OR Paste YouTube Video URL for Viral Hashtags:"}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "उदा. 'crypto' या 'https://www.youtube.com/watch?v=...'"
                  : "e.g. 'gaming' or 'https://www.youtube.com/watch?v=...'"
              }
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "hi" ? "हैशटैग निकाले जा रहे हैं..." : "Analyzing..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white/20" />
                  <span>{lang === "hi" ? "हैशटैग निकालें" : dict.hashtagTool.generateBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          {(dict.hashtagTool as any).tips || "Add 3-5 relevant hashtags to your video title and description to help YouTube categorize your content."}
        </p>
      </div>

      {extractedSource && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>
            {lang === "hi"
              ? `सफलतापूर्वक "${extractedSource}" से हैशटैग निकाले गए!`
              : `Successfully extracted hashtags from "${extractedSource}"!`}
          </span>
        </div>
      )}

      {(popularHashtags.length > 0 || nicheHashtags.length > 0) && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={copyAll}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 transition-all"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? dict.common.copied : ((dict.hashtagTool as any).copyAll || dict.common.copy || "Copy All")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* High Volume / Viral Category */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{lang === "hi" ? "🔥 ट्रेंडिंग और वायरल हैशटैग" : "🔥 Trending & Viral Hashtags"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularHashtags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyIndividual(tag)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-primary border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    {copiedTag === tag ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-40" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Targeted / Niche Category */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                <Hash className="w-4 h-4" />
                <span>{lang === "hi" ? "🎯 टार्गेटेड और नीश हैशटैग" : "🎯 Targeted & Niche Hashtags"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {nicheHashtags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyIndividual(tag)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-primary border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    {copiedTag === tag ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-40" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
