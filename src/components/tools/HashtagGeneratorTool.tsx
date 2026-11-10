"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { Hash, Sparkles, Copy, Check, TrendingUp } from "lucide-react";

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

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyword.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "contentcreator";

    const popular = [
      `#${clean}`,
      "#shorts",
      `#${clean}tips`,
      "#youtubeshorts",
      `#${clean}tutorial`,
      "#trending",
      "#viralvideo",
      "#explore",
    ];

    const niche = [
      `#${clean}life`,
      `#${clean}2026`,
      `#best${clean}`,
      `#howTo${clean}`,
      `#${clean}review`,
      `#${clean}guide`,
      `#${clean}community`,
      `#learn${clean}`,
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
            Video Niche or Topic Keyword:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={dict.hashtagTool.keywordPlaceholder}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-white/20" />
              <span>{dict.hashtagTool.generateBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {(popularHashtags.length > 0 || nicheHashtags.length > 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Generated Hashtags</span>
            </h3>
            <button
              onClick={copyAll}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? dict.common.copied : dict.hashtagTool.copyBtn}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                {dict.hashtagTool.popularTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                {popularHashtags.map((h, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => copyIndividual(h)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                  >
                    <span>{h}</span>
                    {copiedTag === h && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                {dict.hashtagTool.nicheTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                {nicheHashtags.map((h, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => copyIndividual(h)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all flex items-center gap-1"
                  >
                    <span>{h}</span>
                    {copiedTag === h && <Check className="w-3 h-3 text-emerald-500" />}
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
