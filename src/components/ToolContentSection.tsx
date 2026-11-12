import React from "react";
import { SupportedLanguage } from "@/lib/i18n";
import { getToolArticle } from "@/lib/tool-content";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Cpu,
  BookOpen,
} from "lucide-react";

interface ToolContentSectionProps {
  toolSlug: string;
  lang: SupportedLanguage;
}

export function ToolContentSection({ toolSlug, lang }: ToolContentSectionProps) {
  const article = getToolArticle(toolSlug, lang);

  return (
    <section className="mt-16 md:mt-24 border-t border-slate-200/80 dark:border-slate-800/80 pt-12 md:pt-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Editorial E-E-A-T Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{article.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {article.heading}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {article.overview}
          </p>
        </div>

        {/* Step-by-Step 1-2-3 How-To Guide */}
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>{article.howToTitle}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {article.steps.map((st) => (
              <div
                key={st.step}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden"
              >
                <div className="w-8 h-8 rounded-xl bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow-sm shadow-primary/30">
                  {st.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {st.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specifications Matrix */}
        {article.specs && article.specs.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span>{article.specsTitle}</span>
            </h3>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {article.specs.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {sp.label}
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-primary dark:text-rose-400 font-bold">
                      {sp.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* In-depth Editorial Analysis */}
        {article.deepDiveParagraphs && article.deepDiveParagraphs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {article.deepDiveTitle}
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              {article.deepDiveParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Fair Use & Safety Trust Callout */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>{article.fairUseTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {article.fairUseText}
          </p>
        </div>
      </div>
    </section>
  );
}
