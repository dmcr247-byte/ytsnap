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
  FileText,
  Tags,
  Crop,
  Minimize2,
  RefreshCw,
  Layers,
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
  const [videoDropdownOpen, setVideoDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  // Mobile drawer sub-accordions
  const [mobileDownloadersOpen, setMobileDownloadersOpen] = useState(true);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically close all menus and dropdowns when navigation occurs
  useEffect(() => {
    setVideoDropdownOpen(false);
    setToolsDropdownOpen(false);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (videoRef.current && !videoRef.current.contains(event.target as Node)) {
        setVideoDropdownOpen(false);
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
      localStorage.setItem("ytsnap_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ytsnap_theme", "dark");
      setIsDark(true);
    }
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      segments[0] = newLang;
    } else {
      segments.push(newLang);
    }
    const newPath = "/" + segments.join("/");
    document.cookie = `ytsnap_lang=${newLang}; max-age=${60 * 60 * 24 * 365}; path=/`;
    router.push(newPath);
  };

  // Smooth hover handlers with debounce buffer to avoid gap flicker
  const handleVideoEnter = () => {
    if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
    setVideoDropdownOpen(true);
  };

  const handleVideoLeave = () => {
    videoTimeoutRef.current = setTimeout(() => {
      setVideoDropdownOpen(false);
    }, 180);
  };

  const handleToolsEnter = () => {
    if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    setToolsDropdownOpen(true);
  };

  const handleToolsLeave = () => {
    toolsTimeoutRef.current = setTimeout(() => {
      setToolsDropdownOpen(false);
    }, 180);
  };

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const downloadersList = [
    {
      name: (dict.common as any).videoDownloader || "YouTube Video Downloader",
      href: `/${lang}/tools/youtube-video-downloader`,
      desc: lang === "hi" ? "1080p, 720p HD वीडियो और MP3 डाउनलोड करें" : "Download 1080p, 720p HD videos & MP3 audio",
      badge: "HD",
      icon: <Video className="w-4 h-4 text-primary" />,
    },
    {
      name: (dict.common as any).shortsDownloader || "YouTube Shorts Downloader",
      href: `/${lang}/tools/youtube-shorts-downloader`,
      desc: lang === "hi" ? "बिना वॉटरमार्क के 1080p फुल एचडी शॉर्ट्स" : "Download YouTube Shorts with no watermark",
      badge: "HOT",
      icon: <Sparkles className="w-4 h-4 text-rose-500" />,
    },
    {
      name: (dict.common as any).bannerDownloader || "YouTube Banner Downloader",
      href: `/${lang}/tools/youtube-banner-downloader`,
      desc: lang === "hi" ? "2560x1440 HD चैनल बैनर और अवतार डाउनलोड करें" : "Channel banners & avatars in 2560x1440 HD",
      badge: "NEW",
      icon: <Download className="w-4 h-4 text-blue-500" />,
    },
    {
      name: dict.common.thumbnailDownloader || "Thumbnail Downloader",
      href: `/${lang}/tools/youtube-thumbnail-downloader`,
      desc: lang === "hi" ? "फुल एचडी (1280x720) थंबनेल डाउनलोड करें" : "Download HD YouTube video thumbnails",
      badge: null,
      icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
    },
  ];

  const creatorToolsList = [
    {
      name: dict.tools.t2Name,
      href: `/${lang}/tools/youtube-video-information`,
      desc: dict.tools.t2Desc,
      icon: <Info className="w-4 h-4 text-blue-500" />,
    },
    {
      name: dict.tools.t8Name,
      href: `/${lang}/tools/youtube-tags-generator`,
      desc: dict.tools.t8Desc,
      icon: <Tags className="w-4 h-4 text-emerald-500" />,
    },
    {
      name: dict.tools.t9Name,
      href: `/${lang}/tools/youtube-hashtag-generator`,
      desc: dict.tools.t9Desc,
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
    {
      name: dict.tools.t6Name,
      href: `/${lang}/tools/youtube-title-generator`,
      desc: dict.tools.t6Desc,
      icon: <FileText className="w-4 h-4 text-amber-500" />,
    },
    {
      name: dict.tools.t7Name,
      href: `/${lang}/tools/youtube-description-generator`,
      desc: dict.tools.t7Desc,
      icon: <BookOpen className="w-4 h-4 text-rose-500" />,
    },
    {
      name: dict.tools.t3Name,
      href: `/${lang}/tools/thumbnail-resizer`,
      desc: dict.tools.t3Desc,
      icon: <Crop className="w-4 h-4 text-cyan-500" />,
    },
    {
      name: dict.tools.t4Name,
      href: `/${lang}/tools/image-compressor`,
      desc: dict.tools.t4Desc,
      icon: <Minimize2 className="w-4 h-4 text-indigo-500" />,
    },
    {
      name: dict.tools.t5Name,
      href: `/${lang}/tools/image-converter`,
      desc: dict.tools.t5Desc,
      icon: <RefreshCw className="w-4 h-4 text-teal-500" />,
    },
    {
      name: dict.tools.t10Name,
      href: `/${lang}/tools/video-aspect-ratio-calculator`,
      desc: dict.tools.t10Desc,
      icon: <Layers className="w-4 h-4 text-orange-500" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
        >
          <img
            src="/logo-icon.png"
            alt="YTSnap Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
              YT<span className="text-primary">Snap</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-1 tracking-wider uppercase">
              Creator Tools
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href={`/${lang}`}
            className={`px-3 py-2 rounded-xl transition-colors ${
              pathname === `/${lang}`
                ? "text-primary font-bold bg-primary/10"
                : "hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {dict.common.home}
          </Link>

          {/* YouTube Video Downloader Menu with Sub-menu */}
          <div
            className="relative"
            ref={videoRef}
            onMouseEnter={handleVideoEnter}
            onMouseLeave={handleVideoLeave}
          >
            <div className={`flex items-center rounded-xl transition-colors ${
              videoDropdownOpen || pathname.includes("youtube-video-downloader")
                ? "bg-primary/10 text-primary font-bold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}>
              <Link
                href={`/${lang}/tools/youtube-video-downloader`}
                className="flex items-center gap-1.5 pl-3 py-2 pr-1 rounded-l-xl font-bold hover:text-primary transition-colors"
              >
                <Video className="w-4 h-4 text-primary" />
                <span>{(dict.common as any).videoDownloader || "Video Downloader"}</span>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoDropdownOpen((prev) => !prev);
                }}
                aria-label="Toggle downloaders submenu"
                className="p-2 pr-2.5 rounded-r-xl text-slate-500 hover:text-primary transition-colors focus:outline-none"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    videoDropdownOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
            </div>

            {/* Sub-menu Dropdown with hover bridge padding */}
            {videoDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 w-96 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden ring-1 ring-black/5">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{(dict.common as any).videoDownloader || "YouTube Downloader"}</span>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">HD Suite</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {downloadersList.map((tool, idx) => {
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={idx}
                          href={tool.href}
                          onClick={() => setVideoDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}>
                            {tool.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                              <span className="truncate">{tool.name}</span>
                              {tool.badge && (
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
                                    tool.badge === "HOT"
                                      ? "bg-rose-500 text-white"
                                      : tool.badge === "NEW"
                                      ? "bg-blue-600 text-white"
                                      : "bg-primary/15 text-primary"
                                  }`}
                                >
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {tool.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Creator Tools Dropdown */}
          <div
            className="relative"
            ref={toolsRef}
            onMouseEnter={handleToolsEnter}
            onMouseLeave={handleToolsLeave}
          >
            <button
              type="button"
              onClick={() => setToolsDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-colors focus:outline-none ${
                toolsDropdownOpen || (pathname.includes("/tools/") && !downloadersList.some((d) => d.href === pathname))
                  ? "text-primary bg-primary/10 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{dict.common.creatorTools}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
                  toolsDropdownOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 w-96 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden ring-1 ring-black/5">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{dict.tools.sectionTitle || "Creator Utilities"}</span>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                      {creatorToolsList.length} Tools
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-0.5 mt-1 pr-1">
                    {creatorToolsList.map((tool, idx) => {
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={idx}
                          href={tool.href}
                          onClick={() => setToolsDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                            isActive ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800"
                          }`}>
                            {tool.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold transition-colors ${
                              isActive
                                ? "text-primary font-bold"
                                : "text-slate-800 dark:text-slate-200 group-hover:text-primary"
                            }`}>
                              {tool.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {tool.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href={`/${lang}/blog`}
            className={`px-3 py-2 rounded-xl transition-colors ${
              pathname.includes("/blog")
                ? "text-primary font-bold bg-primary/10"
                : "hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {dict.common.blog}
          </Link>
          <Link
            href={`/${lang}/about`}
            className={`px-3 py-2 rounded-xl transition-colors ${
              pathname.includes("/about")
                ? "text-primary font-bold bg-primary/10"
                : "hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {dict.common.about}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className={`px-3 py-2 rounded-xl transition-colors ${
              pathname.includes("/contact")
                ? "text-primary font-bold bg-primary/10"
                : "hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
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
                        ? "bg-primary/10 text-primary dark:bg-primary/20 font-bold"
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
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-8 space-y-3 max-h-[85vh] overflow-y-auto">
          <Link
            href={`/${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-base font-bold transition-colors ${
              pathname === `/${lang}`
                ? "bg-primary/10 text-primary"
                : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {dict.common.home}
          </Link>

          {/* Mobile Accordion 1: YouTube Downloader Suite */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-800/40">
            <button
              type="button"
              onClick={() => setMobileDownloadersOpen(!mobileDownloadersOpen)}
              className="w-full flex items-center justify-between p-3.5 text-left font-bold text-sm text-slate-900 dark:text-white"
            >
              <span className="flex items-center gap-2 text-primary">
                <Video className="w-4 h-4" />
                <span>{(dict.common as any).videoDownloader || "YouTube Downloader Suite"}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileDownloadersOpen ? "rotate-180 text-primary" : ""}`}
              />
            </button>

            {mobileDownloadersOpen && (
              <div className="px-2 pb-3 space-y-1">
                {downloadersList.map((tool, idx) => {
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={idx}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-white font-bold"
                          : "hover:bg-white dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={isActive ? "text-white" : ""}>{tool.icon}</span>
                        <span className="font-semibold">{tool.name}</span>
                      </span>
                      {tool.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
                            isActive
                              ? "bg-white text-primary"
                              : tool.badge === "HOT"
                              ? "bg-rose-500 text-white"
                              : tool.badge === "NEW"
                              ? "bg-blue-600 text-white"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Accordion 2: Creator Tools */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-800/40">
            <button
              type="button"
              onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
              className="w-full flex items-center justify-between p-3.5 text-left font-bold text-sm text-slate-900 dark:text-white"
            >
              <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Wrench className="w-4 h-4 text-primary" />
                <span>{dict.common.creatorTools}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileToolsOpen ? "rotate-180 text-primary" : ""}`}
              />
            </button>

            {mobileToolsOpen && (
              <div className="px-2 pb-3 space-y-1">
                {creatorToolsList.map((tool, idx) => {
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={idx}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-white font-bold"
                          : "hover:bg-white dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className={isActive ? "text-white" : ""}>{tool.icon}</span>
                      <span className="font-medium truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Other Links */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
            <Link
              href={`/${lang}/blog`}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl text-base font-semibold ${
                pathname.includes("/blog")
                  ? "bg-primary/10 text-primary"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {dict.common.blog}
            </Link>
            <Link
              href={`/${lang}/about`}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl text-base font-semibold ${
                pathname.includes("/about")
                  ? "bg-primary/10 text-primary"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {dict.common.about}
            </Link>
            <Link
              href={`/${lang}/contact`}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl text-base font-semibold ${
                pathname.includes("/contact")
                  ? "bg-primary/10 text-primary"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {dict.common.contact}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
