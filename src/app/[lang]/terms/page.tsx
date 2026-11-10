import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms and Conditions | MediaSnap",
    description: "Terms and Conditions of use for MediaSnap creator utilities.",
  };
}

export default function TermsPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.terms }]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-400">Effective Date: January 2026</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using MediaSnap, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Permitted Use & Compliance</h2>
          <p>
            MediaSnap provides utilities for YouTube thumbnail inspection, image formatting, and video metadata retrieval. You agree to use the service only for lawful purposes, such as fair use analysis, educational commentary, video production, or for content that you own or have obtained explicit permission to use.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. YouTube Terms of Service</h2>
          <p>
            You agree to respect YouTube&apos;s Terms of Service and Community Guidelines. MediaSnap does not provide tools to circumvent access controls, breach Digital Rights Management (DRM), or download copyrighted audio/video streams without authorization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Intellectual Property</h2>
          <p>
            YouTube video thumbnails and metadata belong to their respective copyright owners. MediaSnap facilitates direct inspection of publicly hosted CDN assets and does not claim ownership over any third-party thumbnail or media content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Disclaimer of Warranty</h2>
          <p>
            MediaSnap is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. We do not guarantee uninterrupted access or that all thumbnail resolutions will be available for every submitted URL.
          </p>
        </section>
      </div>
    </div>
  );
}
