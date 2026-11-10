import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy | YTSnap",
    description: "YTSnap Privacy Policy. Learn how we handle information, cookies, and protect creator privacy.",
  };
}

export default function PrivacyPolicyPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.privacyPolicy }]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: January 2026</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Introduction</h2>
          <p>
            YTSnap (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects the privacy of our visitors. This Privacy Policy explains our practices regarding data collection, usage, and disclosure when you use our website and online creator tools.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. No Personal Data Storage for General Tool Usage</h2>
          <p>
            You do not need to create an account or provide any personal information to use YTSnap creator utilities. We do not store your name, email, or passwords for public tool queries.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Information Collected Automatically</h2>
          <p>
            Like most modern web services, our servers automatically collect non-personally identifiable log information when you access YTSnap, including hashed IP addresses, browser types, language preferences, referring URLs, and timestamps. This information is used strictly to prevent automated abuse, defend against DDoS attacks, and enforce rate limits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Cookies and Local Storage</h2>
          <p>
            We use functional cookies and browser local storage strictly to remember your language preference (e.g. English, Hindi, Spanish, Arabic) and your interface theme (Dark vs Light mode).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Third-Party Services & Links</h2>
          <p>
            YTSnap interacts with YouTube public image CDNs to inspect and retrieve publicly available thumbnail assets. We do not transmit any personal visitor information to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Contacting Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, please email us at <span className="font-semibold text-primary">support@ytsnap.tech</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
