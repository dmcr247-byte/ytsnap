"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import {
  Link as LinkIcon,
  Search,
  Download,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Layers,
  Crop,
  Minimize2,
  RefreshCw,
  Type,
  FileText,
  Hash,
  Maximize2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface HomeSectionsProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function HowItWorksSection({ dict }: { dict: TranslationDictionary }) {
  const steps = [
    {
      num: "01",
      icon: <LinkIcon className="w-6 h-6 text-primary" />,
      title: dict.howItWorks.step1Title,
      desc: dict.howItWorks.step1Desc,
    },
    {
      num: "02",
      icon: <Search className="w-6 h-6 text-secondary" />,
      title: dict.howItWorks.step2Title,
      desc: dict.howItWorks.step2Desc,
    },
    {
      num: "03",
      icon: <Download className="w-6 h-6 text-emerald-500" />,
      title: dict.howItWorks.step3Title,
      desc: dict.howItWorks.step3Desc,
    },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Quick Tutorial
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            {dict.howItWorks.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            {dict.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  {s.icon}
                </div>
                <span className="text-4xl font-black text-slate-200 dark:text-slate-800 group-hover:text-primary/20 transition-colors">
                  {s.num}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResolutionGuideSection({ dict }: { dict: TranslationDictionary }) {
  const resolutions = [
    {
      name: "Maximum Resolution (HD)",
      tag: "maxresdefault",
      dim: "1280 × 720",
      aspect: "16:9 Widescreen",
      quality: "High Definition (720p/1080p)",
      desc: "Generated when the creator uploads a custom HD image. Ideal for YouTube banners, redesigns, and presentations.",
    },
    {
      name: "Standard Definition (SD)",
      tag: "sddefault",
      dim: "640 × 480",
      aspect: "4:3 Standard",
      quality: "Standard Definition",
      desc: "Standard YouTube preview format. Always generated for standard uploads.",
    },
    {
      name: "High Quality (HQ)",
      tag: "hqdefault",
      dim: "480 × 360",
      aspect: "4:3 Classic",
      quality: "High Quality Preview",
      desc: "Universal thumbnail created for virtually all public YouTube videos.",
    },
    {
      name: "Medium Quality (MQ)",
      tag: "mqdefault",
      dim: "320 × 180",
      aspect: "16:9 Compact",
      quality: "Mobile Preview",
      desc: "Compact widescreen preview optimized for YouTube search result feeds.",
    },
    {
      name: "Default Thumbnail",
      tag: "default",
      dim: "120 × 90",
      aspect: "4:3 Mini",
      quality: "Smallest Icon",
      desc: "Ultra-compact thumbnail used in playlist sidebars and legacy players.",
    },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            CDN Technical Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            {dict.thumbnail.resolutionGuideTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            {dict.thumbnail.resolutionGuideDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resolutions.map((r, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {r.dim}
                </span>
                <span className="text-xs font-semibold text-primary">{r.aspect}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {r.name}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{r.tag}.jpg</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection({ dict }: { dict: TranslationDictionary }) {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: dict.features.f1Title,
      desc: dict.features.f1Desc,
    },
    {
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      title: dict.features.f2Title,
      desc: dict.features.f2Desc,
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      title: dict.features.f3Title,
      desc: dict.features.f3Desc,
    },
    {
      icon: <Layers className="w-5 h-5 text-secondary" />,
      title: dict.features.f4Title,
      desc: dict.features.f4Desc,
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-500" />,
      title: dict.features.f5Title,
      desc: dict.features.f5Desc,
    },
    {
      icon: <Maximize2 className="w-5 h-5 text-rose-500" />,
      title: dict.features.f6Title,
      desc: dict.features.f6Desc,
    },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Engineered For Creators
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            {dict.features.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            {dict.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 w-fit mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CreatorToolsGrid({
  lang,
  dict,
}: {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}) {
  const tools = [
    {
      icon: <Download className="w-6 h-6 text-primary" />,
      title: (dict.common as any).videoDownloader || "YouTube Video Downloader",
      desc: "Fast, high-speed YouTube video & Shorts downloader supporting 1080p, 720p HD, and MP3 audio.",
      href: `/${lang}/tools/youtube-video-downloader`,
    },
    {
      icon: <Download className="w-6 h-6 text-rose-500" />,
      title: dict.tools.t1Name,
      desc: dict.tools.t1Desc,
      href: `/${lang}/tools/youtube-thumbnail-downloader`,
    },
    {
      icon: <Layers className="w-6 h-6 text-secondary" />,
      title: dict.tools.t2Name,
      desc: dict.tools.t2Desc,
      href: `/${lang}/tools/youtube-video-information`,
    },
    {
      icon: <Crop className="w-6 h-6 text-emerald-500" />,
      title: dict.tools.t3Name,
      desc: dict.tools.t3Desc,
      href: `/${lang}/tools/thumbnail-resizer`,
    },
    {
      icon: <Minimize2 className="w-6 h-6 text-amber-500" />,
      title: dict.tools.t4Name,
      desc: dict.tools.t4Desc,
      href: `/${lang}/tools/image-compressor`,
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-purple-500" />,
      title: dict.tools.t5Name,
      desc: dict.tools.t5Desc,
      href: `/${lang}/tools/image-converter`,
    },
    {
      icon: <Type className="w-6 h-6 text-rose-500" />,
      title: dict.tools.t6Name,
      desc: dict.tools.t6Desc,
      href: `/${lang}/tools/youtube-title-generator`,
    },
    {
      icon: <FileText className="w-6 h-6 text-cyan-500" />,
      title: dict.tools.t7Name,
      desc: dict.tools.t7Desc,
      href: `/${lang}/tools/youtube-description-generator`,
    },
    {
      icon: <Hash className="w-6 h-6 text-blue-500" />,
      title: dict.tools.t8Name,
      desc: dict.tools.t8Desc,
      href: `/${lang}/tools/youtube-tags-generator`,
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-500" />,
      title: dict.tools.t9Name,
      desc: dict.tools.t9Desc,
      href: `/${lang}/tools/youtube-hashtag-generator`,
    },
    {
      icon: <Maximize2 className="w-6 h-6 text-orange-500" />,
      title: dict.tools.t10Name,
      desc: dict.tools.t10Desc,
      href: `/${lang}/tools/video-aspect-ratio-calculator`,
    },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Creator Utility Directory
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            {dict.tools.sectionTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            {dict.tools.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t, idx) => (
            <Link
              key={idx}
              href={t.href}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 w-fit mb-4 group-hover:scale-110 transition-transform">
                  {t.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-2">
                  {t.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary">
                <span>{dict.tools.viewTool}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({
  dict,
  faqs,
}: {
  dict: TranslationDictionary;
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            {dict.faq.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            {dict.faq.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base text-slate-900 dark:text-white focus:outline-none"
              >
                <span>{f.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                    openIndex === idx ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3 animate-in fade-in duration-150">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
