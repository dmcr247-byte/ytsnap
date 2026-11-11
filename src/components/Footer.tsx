import React from "react";
import Link from "next/link";
import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { Sparkles, Shield, Heart } from "lucide-react";

interface FooterProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function Footer({ lang, dict }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const toolLinks = [
    { name: (dict.common as any).shortsDownloader || "YouTube Shorts Downloader", href: `/${lang}/tools/youtube-shorts-downloader` },
    { name: (dict.common as any).bannerDownloader || "YouTube Banner Downloader", href: `/${lang}/tools/youtube-banner-downloader` },
    { name: (dict.common as any).videoDownloader || "YouTube Video Downloader", href: `/${lang}/tools/youtube-video-downloader` },
    { name: dict.tools.t1Name, href: `/${lang}/tools/youtube-thumbnail-downloader` },
    { name: dict.tools.t2Name, href: `/${lang}/tools/youtube-video-information` },
    { name: dict.tools.t3Name, href: `/${lang}/tools/thumbnail-resizer` },
    { name: dict.tools.t4Name, href: `/${lang}/tools/image-compressor` },
    { name: dict.tools.t5Name, href: `/${lang}/tools/image-converter` },
    { name: dict.tools.t6Name, href: `/${lang}/tools/youtube-title-generator` },
    { name: dict.tools.t7Name, href: `/${lang}/tools/youtube-description-generator` },
    { name: dict.tools.t8Name, href: `/${lang}/tools/youtube-tags-generator` },
    { name: dict.tools.t9Name, href: `/${lang}/tools/youtube-hashtag-generator` },
    { name: dict.tools.t10Name, href: `/${lang}/tools/video-aspect-ratio-calculator` },
  ];

  const legalLinks = [
    { name: dict.common.privacyPolicy, href: `/${lang}/privacy-policy` },
    { name: dict.common.terms, href: `/${lang}/terms` },
    { name: dict.common.disclaimer, href: `/${lang}/disclaimer` },
    { name: dict.common.copyright, href: `/${lang}/copyright` },
    { name: dict.common.dmca, href: `/${lang}/dmca` },
    { name: dict.common.cookiePolicy, href: `/${lang}/cookie-policy` },
  ];

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={`/${lang}`} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                YT<span className="text-primary">Snap</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              {dict.footer.desc}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{dict.footer.disclaimerNotice}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {dict.common.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${lang}`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  {dict.common.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/tools/youtube-video-downloader`}
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  {(dict.common as any).videoDownloader || "Video Downloader"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/tools/youtube-thumbnail-downloader`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  {dict.common.thumbnailDownloader}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/tools/youtube-video-information`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  {dict.common.videoTools}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/blog`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  {dict.common.blog}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/about`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  {dict.common.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contact`}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  {dict.common.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Creator Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {dict.common.creatorTools}
            </h4>
            <ul className="space-y-1.5 text-sm">
              {toolLinks.slice(0, 6).map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {dict.common.legal}
            </h4>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Global Languages Strip */}
        <div className="pt-6 pb-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {dict.common.language}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {SUPPORTED_LANGUAGES.map((l) => (
              <Link
                key={l.code}
                href={`/${l.code}`}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  l.code === lang
                    ? "border-primary/40 bg-primary/10 text-primary font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.nativeName}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright and Bottom Meta */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>
            © {currentYear} YTSnap. {dict.common.allRightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/disclaimer`} className="hover:text-primary">
              {dict.common.disclaimer}
            </Link>
            <span>•</span>
            <Link href={`/${lang}/privacy-policy`} className="hover:text-primary">
              {dict.common.privacyPolicy}
            </Link>
            <span>•</span>
            <Link href={`/${lang}/terms`} className="hover:text-primary">
              {dict.common.terms}
            </Link>
            <span>•</span>
            <Link href="/admin" className="text-slate-400 hover:text-primary">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
