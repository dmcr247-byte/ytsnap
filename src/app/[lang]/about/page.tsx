import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Sparkles, ShieldCheck, Zap, Users, Globe2, Heart } from "lucide-react";

interface PageProps {
  params: { lang: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = params;
  if (!isValidLanguage(lang)) return {};
  return {
    title: "About Us | YTSnap",
    description: "Learn about YTSnap, our mission, architectural principles, and creator utility suite.",
  };
}

export default function AboutPage({ params }: PageProps) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.about }]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Our Story & Mission
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
          Empowering Digital Creators Worldwide
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          YTSnap was founded to deliver lightning-fast, platform-compliant media tools that save creators hours of production time every week.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <Zap className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Instant Verification</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Direct CDN status checks to eliminate broken 404 links.</p>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <Globe2 className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">8 Global Languages</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Accessible to creators in English, Hindi, Spanish, Arabic, and more.</p>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">100% Platform Compliant</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ethical software strictly respecting YouTube Terms and DRM.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Architecture & Philosophy</h2>
        <p>
          Unlike legacy utility sites cluttered with intrusive ads, broken download scripts, and security vulnerabilities, YTSnap is engineered on a modern Next.js 14 stack with server-side CDN validation, Edge image optimization via Sharp, and strict SSRF and rate-limiting safeguards.
        </p>
        <p>
          We believe in transparent creator tooling: when a high-resolution thumbnail is unavailable on YouTube's servers, we tell you immediately rather than fabricating a blurry upscale or leading you through artificial countdown gates.
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          <strong>Legal Independence:</strong> YTSnap is an independent third-party utility and is not affiliated with, endorsed by, or sponsored by YouTube, Google LLC, or Alphabet Inc. YouTube and the YouTube logo are registered trademarks of Google LLC.
        </div>
      </div>
    </div>
  );
}
