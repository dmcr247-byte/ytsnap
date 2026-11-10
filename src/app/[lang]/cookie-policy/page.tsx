import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLanguage, getDictionary, SupportedLanguage } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cookie Policy | MediaSnap",
    description: "Learn how MediaSnap uses cookies and client storage for language and theme settings.",
  };
}

export default function CookiePolicyPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.cookiePolicy }]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Cookie Policy
        </h1>
        <p className="text-xs text-slate-400">Clear & Transparent Usage</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your computer or mobile device when you browse websites. They are widely used to make websites work efficiently and remember user preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cookies We Use on MediaSnap</h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">
                mediasnap_lang (Functional Cookie)
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Stores your preferred language selection (e.g., &quot;en&quot;, &quot;hi&quot;, &quot;es&quot;, &quot;ar&quot;) so you don&apos;t have to select it on every page load.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">
                mediasnap_theme (Local Storage)
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Saves whether you prefer Light Mode or Dark Mode.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block">
                mediasnap_admin_session (Security Cookie - Admin Only)
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                An HTTP-only secure JWT token used exclusively to authenticate administrators accessing the admin panel.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
