"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TranslationDictionary,
} from "@/lib/i18n";
import {
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Download,
  Video,
  Wrench,
  BookOpen,
  Info,
  Mail,
  ShieldCheck,
  Check,
} from "lucide-react";

interface HeaderProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function Header({ lang, dict }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mediasnap_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mediasnap_theme", "dark");
      setIsDark(true);
    }
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);

    // Replace the language segment in the pathname
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      segments[0] = newLang;
    } else {
      segments.push(newLang);
    }
    const newPath = "/" + segments.join("/");
    document.cookie = `mediasnap_lang=${newLang}; max-age=${60 * 60 * 24 * 365}; path=/`;
    router.push(newPath);
  };

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const toolsList = [
    {
      name: dict.tools.t1Name,
      href: `/${lang}/tools/youtube-thumbnail-downloader`,
      desc: dict.tools.t1Desc,
    },
    {
      name: dict.tools.t2Name,
      href: `/${lang}/tools/youtube-video-information`,
      desc: dict.tools.t2Desc,
    },
    {
      name: dict.tools.t3Name,
      href: `/${lang}/tools/thumbnail-resizer`,
      desc: dict.tools.t3Desc,
    },
    {
      name: dict.tools.t4Name,
      href: `/${lang}/tools/image-compressor`,
      desc: dict.tools.t4Desc,
    },
    {
      name: dict.tools.t5Name,
      href: `/${lang}/tools/image-converter`,
      desc: dict.tools.t5Desc,
    },
    {
      name: dict.tools.t6Name,
      href: `/${lang}/tools/youtube-title-generator`,
      desc: dict.tools.t6Desc,
    },
    {
      name: dict.tools.t7Name,
      href: `/${lang}/tools/youtube-description-generator`,
      desc: dict.tools.t7Desc,
    },
    {
      name: dict.tools.t8Name,
      href: `/${lang}/tools/youtube-tags-generator`,
      desc: dict.tools.t8Desc,
    },
    {
      name: dict.tools.t9Name,
      href: `/${lang}/tools/youtube-hashtag-generator`,
      desc: dict.tools.t9Desc,
    },
    {
      name: dict.tools.t10Name,
      href: `/${lang}/tools/video-aspect-ratio-calculator`,
      desc: dict.tools.t10Desc,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Media<span className="text-primary">Snap</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-1 tracking-wider uppercase">
              Creator Suite
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href={`/${lang}`}
            className="px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dict.common.home}
          </Link>
          <Link
            href={`/${lang}/tools/youtube-thumbnail-downloader`}
            className="px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dict.common.thumbnailDownloader}
          </Link>
          <Link
            href={`/${lang}/tools/youtube-video-information`}
            className="px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dict.common.videoTools}
          </Link>

          {/* Creator Tools Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <span>{dict.common.creatorTools}</span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute top-full right-0 md:left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {dict.tools.sectionTitle}
                </div>
                <div className="max-h-96 overflow-y-auto space-y-0.5">
                  {toolsList.map((tool, idx) => (
                    <Link
                      key={idx}
                      href={tool.href}
                      onClick={() => setToolsDropdownOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                    >
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {tool.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href={`/${lang}/blog`}
            className="px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dict.common.blog}
          </Link>
          <Link
            href={`/${lang}/about`}
            className="px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dict.common.about}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className="px-3 py-2 rounded-lg hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dict.common.contact}
          </Link>
        </nav>

        {/* Action Controls: Theme + Language + Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={dict.common.switchTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span>{currentLangInfo.flag}</span>
              <span className="hidden sm:inline font-semibold">
                {currentLangInfo.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {dict.common.language}
                </div>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleLanguageChange(item.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.code === lang
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{item.nativeName}</span>
                      <span className="text-xs text-slate-400">({item.name})</span>
                    </span>
                    {item.code === lang && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <Link
            href={`/${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dict.common.home}
          </Link>
          <Link
            href={`/${lang}/tools/youtube-thumbnail-downloader`}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dict.common.thumbnailDownloader}
          </Link>
          <Link
            href={`/${lang}/tools/youtube-video-information`}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dict.common.videoTools}
          </Link>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {dict.common.creatorTools}
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
              {toolsList.map((t, idx) => (
                <Link
                  key={idx}
                  href={t.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
            <Link
              href={`/${lang}/blog`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200"
            >
              {dict.common.blog}
            </Link>
            <Link
              href={`/${lang}/about`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200"
            >
              {dict.common.about}
            </Link>
            <Link
              href={`/${lang}/contact`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200"
            >
              {dict.common.contact}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
