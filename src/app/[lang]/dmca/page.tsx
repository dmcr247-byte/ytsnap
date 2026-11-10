import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { FileText, Mail } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "DMCA Copyright Notice & Removal Request | MediaSnap",
    description: "Submit a DMCA takedown request or notice of copyright infringement to MediaSnap.",
  };
}

export default function DmcaPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.dmca }]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          DMCA / Copyright Removal Notice
        </h1>
        <p className="text-xs text-slate-400">Digital Millennium Copyright Act Compliance</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notice of Non-Hosting</h2>
          <p>
            Please note that MediaSnap does not store or host video media or thumbnail images on its private servers. When a user enters a YouTube URL, MediaSnap acts solely as an intermediary client retrieving and checking public image headers hosted directly on Google&apos;s Content Delivery Network (<code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded">img.youtube.com</code> / <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded">i.ytimg.com</code>).
          </p>
          <p>
            To have a thumbnail permanently removed from the internet, you must file a copyright takedown directly with YouTube (Google LLC), which will immediately propagate across their CDN and disable all thumbnail access everywhere.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Submitting a DMCA Notice to MediaSnap</h2>
          <p>
            If you believe content appearing on our blog, educational guides, or pages infringes your copyright, please submit a written notification including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Specific URL on MediaSnap where the material is located.</li>
            <li>Your full name, address, telephone number, and email address.</li>
            <li>A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner.</li>
            <li>A physical or electronic signature of the authorized copyright holder.</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <span className="text-sm">
            Send DMCA notices to: <strong className="text-primary">dmca@mediasnap.com</strong> or use our{" "}
            <Link href={`/${lang}/contact`} className="underline font-semibold">
              Contact Form
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
