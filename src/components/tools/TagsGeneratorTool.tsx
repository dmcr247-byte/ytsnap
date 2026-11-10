"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { Hash, Copy, Check, Sparkles, X, Plus } from "lucide-react";

interface TagsGeneratorToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function TagsGeneratorTool({ lang, dict }: TagsGeneratorToolProps) {
  const [keyword, setKeyword] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyword.trim().toLowerCase() || "youtube tips";

    const baseTags = [
      clean,
      `${clean} tutorial`,
      `how to ${clean}`,
      `best ${clean} 2026`,
      `${clean} for beginners`,
      `${clean} step by step`,
      `${clean} guide`,
      `${clean} tips and tricks`,
      `${clean} review`,
      `learn ${clean}`,
      `${clean} complete course`,
      `${clean} mistakes to avoid`,
      `${clean} explanation`,
    ];

    // Deduplicate and filter length
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
            Video Topic / Primary Keyword:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={dict.tagsTool.inputPlaceholder}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-white/20" />
              <span>{dict.tagsTool.generateBtn}</span>
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          {dict.tagsTool.tips}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          {/* Top Header: Character Counter & Copy Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generated YouTube Tags ({tags.length})
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="text-slate-400">{dict.tagsTool.charCount}:</span>
                <span
                  className={`font-bold ${
                    charCount > 500 ? "text-rose-500 font-extrabold" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {charCount} / 500
                </span>
                {charCount > 500 && (
                  <span className="text-rose-500 font-medium">
                    (Exceeds YouTube limit! Remove some tags)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? dict.common.copied : dict.tagsTool.copyBtn}</span>
            </button>
          </div>

          {/* Interactive Tag Pills */}
          <div className="flex flex-wrap gap-2">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="hover:text-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom tag input */}
          <form onSubmit={addTag} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Add another tag..."
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </form>

          {/* Comma-Separated Box Preview */}
          <div className="pt-3">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Comma-Separated Preview (Direct paste into YouTube Studio):
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 select-all break-words">
              {commaSeparated}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
