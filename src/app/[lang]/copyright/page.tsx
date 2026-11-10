import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShieldCheck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Copyright Policy & Fair Use Guidelines | MediaSnap",
    description: "MediaSnap copyright policy, creator intellectual property rights, and fair use guidelines.",
  };
}

export default function CopyrightPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.copyright }]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Copyright Policy
        </h1>
        <p className="text-xs text-slate-400">Respecting Content Creator Rights</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Ownership of Thumbnails</h2>
          <p>
            When creators design custom thumbnails for their YouTube videos, they own the original copyright in those images (provided the components do not infringe on other protected works).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Acceptable Uses for Downloaded Thumbnails</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Own Content Management:</strong> Recovering high-resolution thumbnails for your own videos when original assets were lost.</li>
            <li><strong>Fair Use Commentary & Critique:</strong> Using a thumbnail in a video review, critique, or reaction video under statutory fair use doctrine.</li>
            <li><strong>Design Inspiration & Study:</strong> Analyzing color balance, font choices, and CTR patterns for educational research.</li>
            <li><strong>Offline Archiving:</strong> Personal reference and academic archiving.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Prohibited Infringing Uses</h2>
          <p>
            You may <strong>NOT</strong> take another creator&apos;s thumbnail and use it as your own custom thumbnail on your video without their written consent. Doing so violates copyright law and YouTube&apos;s impersonation and metadata policies.
          </p>
        </section>
      </div>
    </div>
  );
}
