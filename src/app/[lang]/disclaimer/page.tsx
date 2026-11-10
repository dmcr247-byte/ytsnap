import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AlertCircle, ShieldCheck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Disclaimer & Platform Notice | YTSnap",
    description: "Official disclaimer regarding YouTube, Google LLC, and media usage rights.",
  };
}

export default function DisclaimerPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.disclaimer }]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Platform Disclaimer
        </h1>
        <p className="text-xs text-slate-400">Important Notice to All Users</p>
      </div>

      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-amber-900 dark:text-amber-200">
          <p className="font-bold text-base">Not Affiliated with YouTube or Google LLC</p>
          <p className="leading-relaxed">
            YTSnap is an independent third-party media utility and is NOT affiliated with, authorized, maintained, sponsored, or in any way officially connected with YouTube, Google LLC, Alphabet Inc., or any of their affiliates.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trademark Notice</h2>
          <p>
            &quot;YouTube&quot;, the YouTube logo, &quot;Shorts&quot;, and other related marks are registered trademarks of Google LLC. All product names, logos, brands, trademarks, and registered trademarks cited on YTSnap are property of their respective owners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Media Rights & User Responsibility</h2>
          <p>
            Users are solely responsible for ensuring that they have the appropriate rights, licenses, or permissions before downloading, re-using, modifying, or republishing any thumbnail image, video metadata, or content retrieved via this website.
          </p>
          <p>
            YTSnap does not facilitate unauthorized duplication or distribution of copyrighted material. If you wish to use thumbnails or media created by other creators, you must obtain their prior written authorization or verify that your intended use qualifies under applicable fair use doctrine in your jurisdiction.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Stream Ripping</h2>
          <p>
            YTSnap does not provide unauthorized video or audio stream ripping services. We strictly comply with digital copyright safeguards and platform terms.
          </p>
        </section>
      </div>
    </div>
  );
}
