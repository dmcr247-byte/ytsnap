"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { Hash, Copy, Check, Sparkles, X, Plus, Loader2, Link as LinkIcon, Search } from "lucide-react";

interface TagsGeneratorToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function TagsGeneratorTool({ lang, dict }: TagsGeneratorToolProps) {
  const [keyword, setKeyword] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceVideoTitle, setSourceVideoTitle] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyword.trim();
    if (!clean) return;

    setSourceVideoTitle(null);

    // 1. Check if user entered a YouTube Video URL
    const videoId = extractYouTubeVideoId(clean);
    if (videoId) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/video-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: clean, lang }),
        });
        const json = await res.json();
        if (json.success && json.data?.keywords && json.data.keywords.length > 0) {
          setTags(json.data.keywords);
          setSourceVideoTitle(json.data.title || "Extracted Video");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not extract tags from video link, generating keyword tags:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // 2. Keyword generation
    const baseClean = clean.toLowerCase();
    const isHindi = lang === "hi";

    const baseTags = [
      baseClean,
      `${baseClean} tutorial`,
      `how to ${baseClean}`,
      `best ${baseClean} 2026`,
      `${baseClean} for beginners`,
      `${baseClean} step by step`,
      `${baseClean} guide`,
      `${baseClean} tips and tricks`,
      `${baseClean} full course`,
      `${baseClean} review`,
      `${baseClean} secrets`,
      `learn ${baseClean}`,
      `${baseClean} in 2026`,
      `${baseClean} mistakes to avoid`,
      `${baseClean} strategy`,
      ...(isHindi
        ? [
            `${baseClean} kaise kare`,
            `${baseClean} in hindi`,
            `${baseClean} ki puri jankari`,
            `${baseClean} kaise sikhe`,
            `${baseClean} video`,
            `best ${baseClean} tarika`,
          ]
        : [
            `${baseClean} explained`,
            `${baseClean} hacks`,
            `master ${baseClean}`,
            `top 5 ${baseClean}`,
          ]),
    ];

    const unique = Array.from(new Set(baseTags));
    setTags(unique);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      setTags([...tags, newTagInput.trim().toLowerCase()]);
      setNewTagInput("");
    }
  };

  const commaSeparated = tags.join(", ");
  const charCount = commaSeparated.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(commaSeparated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            {lang === "hi"
              ? "वीडियो का टॉपिक लिखें या किसी YouTube Video का लिंक पेस्ट करके उसके असली Tags निकालें:"
              : "Enter Video Topic OR Paste a YouTube Video URL to Extract Real Tags:"}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "उदा. 'video editing' या 'https://www.youtube.com/watch?v=...'"
                  : "e.g. 'video editing' or 'https://www.youtube.com/watch?v=...'"
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
                  <span>{lang === "hi" ? "टैग्स निकाले जा रहे हैं..." : "Extracting Tags..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white/20" />
                  <span>{lang === "hi" ? "टैग्स निकालें / बनाएं" : dict.tagsTool.generateBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          {dict.tagsTool.tips}
        </p>
      </div>

      {sourceVideoTitle && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>
            {lang === "hi"
              ? `सफलतापूर्वक "${sourceVideoTitle}" से ${tags.length} असली टैग्स निकाले गए!`
              : `Extracted ${tags.length} live SEO tags from "${sourceVideoTitle}"!`}
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          {/* Top Header: Character Counter & Copy Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === "hi" ? `तैयार टैग्स (${tags.length})` : `Generated YouTube Tags (${tags.length})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {charCount} / 500 characters{" "}
                <span className={charCount > 500 ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>
                  {charCount > 500 ? "(Exceeds YouTube 500 limit)" : "(Optimal for YouTube)"}
                </span>
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? dict.common.copied : ((dict.tagsTool as any).copyAll || dict.common.copy || "Copy All Tags")}</span>
            </button>
          </div>

          {/* Tags Cloud */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="text-slate-400 hover:text-red-500 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom tag */}
          <form onSubmit={addTag} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder={lang === "hi" ? "कोई और कस्टम टैग जोड़ें..." : "Add custom tag..."}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "जोड़ें" : "Add"}</span>
            </button>
          </form>

          {/* Comma-separated preview block for easy YouTube Studio paste */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              {lang === "hi" ? "YouTube Studio में पेस्ट करने के लिए कॉमा से अलग किया गया फॉर्मेट:" : "Comma-separated format for YouTube Studio:"}
            </label>
            <textarea
              readOnly
              value={commaSeparated}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
