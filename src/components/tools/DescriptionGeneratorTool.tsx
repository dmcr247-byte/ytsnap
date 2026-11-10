"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { FileText, Copy, Check, Sparkles } from "lucide-react";

interface DescriptionGeneratorToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function DescriptionGeneratorTool({ lang, dict }: DescriptionGeneratorToolProps) {
  const [topic, setTopic] = useState("");
  const [timestamps, setTimestamps] = useState(
    "00:00 - Introduction\n01:15 - Key Concepts\n03:45 - Practical Demonstration\n07:20 - Pro Tips & Tricks\n09:30 - Summary & Next Steps"
  );
  const [socialLinks, setSocialLinks] = useState(
    "🌐 Website: https://yourbrand.com\n🐦 Twitter/X: https://x.com/yourhandle\n📷 Instagram: https://instagram.com/yourhandle"
  );
  const [cta, setCta] = useState(
    "🔔 Subscribe to the channel for weekly creator tutorials!\n👍 If this video helped you, please drop a like and leave a comment below."
  );
  const [disclaimer, setDisclaimer] = useState(
    "⚠️ Disclaimer: Some links in this description may be affiliate links. All opinions expressed are 100% my own."
  );
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = topic.trim() || "In this video, we explore modern creator workflows and key tips.";

    const formatted = `${cleanTopic}

━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ TIMESTAMPS / CHAPTERS:
${timestamps}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 CONNECT WITH US:
${socialLinks}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 SUPPORT THE CHANNEL:
${cta}

━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️ LEGAL & AFFILIATE NOTICE:
${disclaimer}

#YouTube #CreatorTools #MediaSnap #Tutorial`;

    setGeneratedDesc(formatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDesc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">
              {dict.descTool.topic}
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Provide a 2-3 sentence overview of what your video covers..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">
              {dict.descTool.timestamps}
            </label>
            <textarea
              rows={4}
              value={timestamps}
              onChange={(e) => setTimestamps(e.target.value)}
              className="w-full font-mono text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">
                {dict.descTool.social}
              </label>
              <textarea
                rows={3}
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">
                {dict.descTool.cta}
              </label>
              <textarea
                rows={3}
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-5 h-5 fill-white/20" />
            <span>{dict.descTool.generateBtn}</span>
          </button>
        </form>
      </div>

      {generatedDesc && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Generated YouTube Description</span>
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? dict.common.copied : dict.descTool.copyBtn}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={14}
            value={generatedDesc}
            className="w-full font-sans text-xs sm:text-sm p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
