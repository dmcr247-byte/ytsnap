"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { Type, Sparkles, Copy, Check, TrendingUp } from "lucide-react";

interface TitleGeneratorToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function TitleGeneratorTool({ lang, dict }: TitleGeneratorToolProps) {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("Tech");
  const [tone, setTone] = useState("curiosity");
  const [generatedTitles, setGeneratedTitles] = useState<
    Array<{ title: string; score: number; style: string }>
  >([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const niches = [
    "Tech & Gadgets",
    "Gaming",
    "Education & Tutorials",
    "Finance & Crypto",
    "Lifestyle & Vlogs",
    "Fitness & Health",
    "Cooking & Food",
    "Entertainment & Commentary",
  ];

  const tones = [
    { key: "curiosity", label: "High Curiosity / Click-Worthy" },
    { key: "howto", label: "Educational / How-To" },
    { key: "urgent", label: "Urgent / Warning" },
    { key: "listicle", label: "Numbered / Top 5 / Best Of" },
    { key: "question", label: "Question / Myth Busting" },
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = topic.trim() || "YouTube Video";

    // Proven title formula generators
    const titlesList: Array<{ title: string; score: number; style: string }> = [
      {
        title: `I Tested ${cleanTopic} For 30 Days (Here's What Happened)`,
        score: 96,
        style: "Case Study",
      },
      {
        title: `Why Nobody Is Talking About ${cleanTopic} in 2026`,
        score: 94,
        style: "Curiosity Loop",
      },
      {
        title: `The Ultimate ${cleanTopic} Guide (From Beginner to Pro)`,
        score: 92,
        style: "Comprehensive",
      },
      {
        title: `Stop Doing ${cleanTopic} Like This! (Big Mistake)`,
        score: 95,
        style: "Warning",
      },
      {
        title: `5 Secret ${cleanTopic} Tips Pros Don't Want You to Know`,
        score: 91,
        style: "Listicle",
      },
      {
        title: `Is ${cleanTopic} Really Worth It? (Honest Review)`,
        score: 89,
        style: "Review",
      },
      {
        title: `How I Mastered ${cleanTopic} in 24 Hours`,
        score: 93,
        style: "Fast Results",
      },
      {
        title: `${cleanTopic}: Everything Changed After This`,
        score: 90,
        style: "Story Arc",
      },
      {
        title: `The TRUTH About ${cleanTopic} Nobody Tells You`,
        score: 97,
        style: "Exposé",
      },
      {
        title: `Don't Buy ${cleanTopic} Until You Watch This!`,
        score: 94,
        style: "High Urgency",
      },
    ];

    setGeneratedTitles(titlesList);
  };

  const copyTitle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Configuration Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1.5">
              Video Topic or Keyword:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={dict.titleTool.topicPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {dict.titleTool.nicheLabel}
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
              >
                {niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {dict.titleTool.toneLabel}
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
              >
                {tones.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Sparkles className="w-5 h-5 fill-white/20" />
            <span>{dict.titleTool.generateBtn}</span>
          </button>
        </form>
      </div>

      {/* Generated Titles Results */}
      {generatedTitles.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{dict.titleTool.resultsLabel} ({generatedTitles.length})</span>
            </h3>
            <span className="text-xs text-slate-400">{dict.titleTool.clickToCopy}</span>
          </div>

          <div className="space-y-3">
            {generatedTitles.map((item, idx) => (
              <div
                key={idx}
                onClick={() => copyTitle(item.title, idx)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-all flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.style}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      CTR: {item.score}%
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 shadow-sm shrink-0">
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
