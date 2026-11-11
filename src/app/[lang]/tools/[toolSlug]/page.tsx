import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isValidLanguage,
  getDictionary,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ThumbnailHero } from "@/components/ThumbnailHero";
import { VideoDownloaderTool } from "@/components/tools/VideoDownloaderTool";
import { ShortsDownloaderTool } from "@/components/tools/ShortsDownloaderTool";
import { BannerDownloaderTool } from "@/components/tools/BannerDownloaderTool";
import { VideoInfoTool } from "@/components/tools/VideoInfoTool";
import { ResizerTool } from "@/components/tools/ResizerTool";
import { CompressorTool } from "@/components/tools/CompressorTool";
import { ConverterTool } from "@/components/tools/ConverterTool";
import { TitleGeneratorTool } from "@/components/tools/TitleGeneratorTool";
import { DescriptionGeneratorTool } from "@/components/tools/DescriptionGeneratorTool";
import { TagsGeneratorTool } from "@/components/tools/TagsGeneratorTool";
import { HashtagGeneratorTool } from "@/components/tools/HashtagGeneratorTool";
import { AspectRatioTool } from "@/components/tools/AspectRatioTool";
import { FaqSection } from "@/components/HomeSections";

interface ToolPageProps {
  params: { lang: string; toolSlug: string };
  searchParams?: { v?: string };
}

const VALID_TOOLS = [
  "youtube-video-downloader",
  "youtube-shorts-downloader",
  "youtube-banner-downloader",
  "youtube-thumbnail-downloader",
  "youtube-video-information",
  "thumbnail-resizer",
  "image-compressor",
  "image-converter",
  "youtube-title-generator",
  "youtube-description-generator",
  "youtube-tags-generator",
  "youtube-hashtag-generator",
  "video-aspect-ratio-calculator",
];

export async function generateStaticParams() {
  const params: Array<{ lang: string; toolSlug: string }> = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const toolSlug of VALID_TOOLS) {
      params.push({ lang: lang.code, toolSlug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { lang, toolSlug } = params;
  if (!isValidLanguage(lang) || !VALID_TOOLS.includes(toolSlug)) return {};

  const dict = getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let title = "Creator Tool";
  let description = "Free YouTube Creator Utility on YTSnap.";

  switch (toolSlug) {
    case "youtube-video-downloader":
      title = (dict.common as any).videoDownloader || "YouTube Video Downloader";
      description = "Download YouTube videos and Shorts in MP4 1080p, 720p HD, 480p, and MP3 audio with instant high-speed server streaming.";
      break;
    case "youtube-shorts-downloader":
      title = (dict.common as any).shortsDownloader || "YouTube Shorts Downloader";
      description = (dict.common as any).shortsDownloaderDesc || "Download YouTube Shorts in MP4 1080p, 720p HD and MP3 audio instantly without any app or watermark.";
      break;
    case "youtube-banner-downloader":
      title = (dict.common as any).bannerDownloader || "YouTube Banner Downloader";
      description = (dict.common as any).bannerDownloaderDesc || "Download YouTube channel banners, channel art, and avatars in 2560x1440 HD.";
      break;
    case "youtube-thumbnail-downloader":
      title = dict.thumbnail.title;
      description = dict.thumbnail.subtitle;
      break;
    case "youtube-video-information":
      title = dict.videoInfo.title;
      description = dict.videoInfo.subtitle;
      break;
    case "thumbnail-resizer":
      title = dict.resizerTool.title;
      description = dict.resizerTool.subtitle;
      break;
    case "image-compressor":
      title = dict.compressorTool.title;
      description = dict.compressorTool.subtitle;
      break;
    case "image-converter":
      title = dict.converterTool.title;
      description = dict.converterTool.subtitle;
      break;
    case "youtube-title-generator":
      title = dict.titleTool.title;
      description = dict.titleTool.subtitle;
      break;
    case "youtube-description-generator":
      title = dict.descTool.title;
      description = dict.descTool.subtitle;
      break;
    case "youtube-tags-generator":
      title = dict.tagsTool.title;
      description = dict.tagsTool.subtitle;
      break;
    case "youtube-hashtag-generator":
      title = dict.hashtagTool.title;
      description = dict.hashtagTool.subtitle;
      break;
    case "video-aspect-ratio-calculator":
      title = dict.ratioTool.title;
      description = dict.ratioTool.subtitle;
      break;
  }

  const alternatesLanguages: Record<string, string> = {};
  for (const l of SUPPORTED_LANGUAGES) {
    alternatesLanguages[l.code] = `${baseUrl}/${l.code}/tools/${toolSlug}`;
  }

  return {
    title: `${title} | YTSnap`,
    description,
    alternates: {
      canonical: `${baseUrl}/${lang}/tools/${toolSlug}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title: `${title} | YTSnap`,
      description,
      url: `${baseUrl}/${lang}/tools/${toolSlug}`,
      siteName: "YTSnap",
      type: "website",
    },
  };
}

export default function ToolPage({ params, searchParams }: ToolPageProps) {
  const { lang, toolSlug } = params;

  if (!isValidLanguage(lang) || !VALID_TOOLS.includes(toolSlug)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let toolTitle = "";
  let toolSubtitle = "";
  let toolComponent = null;
  let toolFaqs: Array<{ question: string; answer: string }> = [];

  switch (toolSlug) {
    case "youtube-video-downloader":
      toolTitle = (dict.common as any).videoDownloader || "YouTube Video Downloader";
      toolSubtitle = "Download YouTube videos and Shorts in MP4 1080p, 720p HD, 480p, and MP3 audio with instant high-speed server streaming.";
      toolComponent = <VideoDownloaderTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Can I download YouTube videos in 1080p Full HD and 720p?",
          answer:
            "Yes! YTSnap detects all available video stream resolutions provided by YouTube, including 1080p Full HD, 720p HD, 480p, and 360p MP4 formats.",
        },
        {
          question: "Can I extract audio / MP3 from a YouTube video?",
          answer:
            "Yes, you can easily switch to the Audio tab and download high-bitrate audio tracks (128kbps, 160kbps, 256kbps) in MP3 / M4A format.",
        },
        {
          question: "Does this tool work for YouTube Shorts?",
          answer:
            "Yes! You can paste any standard YouTube video URL, short link (youtu.be), or YouTube Shorts URL.",
        },
      ];
      break;
    case "youtube-shorts-downloader":
      toolTitle = (dict.common as any).shortsDownloader || "YouTube Shorts Downloader";
      toolSubtitle = (dict.common as any).shortsDownloaderDesc || "Download YouTube Shorts in MP4 1080p, 720p HD and MP3 audio instantly without any app or watermark.";
      toolComponent = <ShortsDownloaderTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Does this tool work with YouTube Shorts links?",
          answer: "Yes! Simply paste any Shorts URL (e.g. youtube.com/shorts/VIDEO_ID or mobile share links) and our engine will instantly process and retrieve the highest quality available streams.",
        },
        {
          question: "Will the downloaded YouTube Short have a watermark?",
          answer: "No! The downloaded file is the clean, original creator video with zero added watermarks, stamps, or promotional overlays.",
        },
        {
          question: "Can I download Shorts on iPhone, iPad, or Android?",
          answer: "Yes! YTSnap is 100% web-based and runs on any mobile browser. Tap 'Share' in the YouTube mobile app, copy the link, and paste it here.",
        },
        {
          question: "What formats and resolutions are available for Shorts?",
          answer: "You can download in 1080p Full HD (1080x1920 vertical), 720p HD, 480p MP4, as well as high-bitrate MP3/M4A audio tracks.",
        },
        {
          question: "Can I extract audio or music from a YouTube Short?",
          answer: "Yes! Switch to the 'Audio Only (MP3)' tab after analyzing the link to save trending background music, sound effects, or speech in MP3 format.",
        },
        {
          question: "Is there any limit on how many Shorts I can download?",
          answer: "No! YTSnap is completely free with no usage caps, registration, or download limits. You can download as many Shorts as you need.",
        },
      ];
      break;
    case "youtube-banner-downloader":
      toolTitle = (dict.common as any).bannerDownloader || "YouTube Banner Downloader";
      toolSubtitle = (dict.common as any).bannerDownloaderDesc || "Download YouTube channel banners, channel art, and avatars in 2560x1440 HD.";
      toolComponent = <BannerDownloaderTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "What is the recommended YouTube banner size in 2026?",
          answer: "According to YouTube's official design guidelines, the ideal channel banner dimension is 2560 x 1440 pixels (16:9 ratio). The minimum upload dimension is 2048 x 1152 pixels with a mobile safe area of 1546 x 423 pixels.",
        },
        {
          question: "Does this tool download the original 2560x1440 high-resolution banner?",
          answer: "Yes! YTSnap retrieves the original, uncropped 2560x1440 canvas directly from Google CDN servers without downscaling or compression.",
        },
        {
          question: "Can I also download the YouTube channel profile photo (avatar)?",
          answer: "Yes! Simply click the 'Channel Avatar (900x900)' tab to preview and download the creator's full 900x900 high-definition profile avatar.",
        },
        {
          question: "Can I enter a channel handle (@name) or video link instead of the channel URL?",
          answer: "Yes! You can enter any channel handle (e.g. @MrBeast), channel link (youtube.com/@channel), or any video link uploaded by that channel.",
        },
        {
          question: "Is there any watermark added to the downloaded banner image?",
          answer: "No! All downloaded images are the pristine original creator files with zero watermarks, branding, or overlays added.",
        },
        {
          question: "Is downloading YouTube channel banners legal?",
          answer: "Yes, downloading public channel art for personal design inspiration, color palettes, safe-area reference, or backing up your own channel is completely safe and legal under fair use.",
        },
      ];
      break;
    case "youtube-thumbnail-downloader":
      toolTitle = dict.thumbnail.title;
      toolSubtitle = dict.thumbnail.subtitle;
      toolComponent = (
        <ThumbnailHero
          lang={lang as SupportedLanguage}
          dict={dict}
          initialVideoId={searchParams?.v}
        />
      );
      toolFaqs = [
        {
          question: "Can I download 4K or 1080p YouTube thumbnails?",
          answer:
            "YouTube's CDN generates thumbnails up to 1280x720 (maxresdefault.jpg). While creators often refer to this as 1080p/HD, 1280x720 is the exact maximum resolution stored on Google's YouTube image servers.",
        },
        {
          question: "Do thumbnails downloaded from YTSnap have watermarks?",
          answer:
            "No! YTSnap retrieves the original, untouched image files directly from Google's YouTube CDN without modifying or adding any watermarks.",
        },
      ];
      break;

    case "youtube-video-information":
      toolTitle = dict.videoInfo.title;
      toolSubtitle = dict.videoInfo.subtitle;
      toolComponent = <VideoInfoTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Why does YTSnap not offer direct YouTube video downloading?",
          answer:
            "YTSnap complies strictly with YouTube Terms of Service and international digital copyright laws. YouTube restricts unauthorized stream ripping. We provide metadata inspection and support authorized media for creators with their own content.",
        },
      ];
      break;

    case "thumbnail-resizer":
      toolTitle = dict.resizerTool.title;
      toolSubtitle = dict.resizerTool.subtitle;
      toolComponent = <ResizerTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "What is the recommended size for a YouTube thumbnail?",
          answer:
            "YouTube recommends 1280 pixels wide by 720 pixels tall (minimum width 640 pixels) with a 16:9 aspect ratio and under 2MB in file size.",
        },
      ];
      break;

    case "image-compressor":
      toolTitle = dict.compressorTool.title;
      toolSubtitle = dict.compressorTool.subtitle;
      toolComponent = <CompressorTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "What is YouTube's thumbnail file size limit?",
          answer:
            "YouTube requires all custom thumbnail uploads to be under 2MB. Our image compressor easily reduces files from 5MB+ down to 400KB-800KB without visible quality loss.",
        },
      ];
      break;

    case "image-converter":
      toolTitle = dict.converterTool.title;
      toolSubtitle = dict.converterTool.subtitle;
      toolComponent = <ConverterTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Is PNG or JPG better for YouTube thumbnails?",
          answer:
            "JPG is generally best for photographic thumbnails because of smaller file sizes. PNG is best for graphics with text overlays and transparent elements.",
        },
      ];
      break;

    case "youtube-title-generator":
      toolTitle = dict.titleTool.title;
      toolSubtitle = dict.titleTool.subtitle;
      toolComponent = <TitleGeneratorTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "How long should a YouTube video title be?",
          answer:
            "YouTube allows up to 100 characters, but recommends keeping titles under 60-70 characters so they are not cut off on mobile devices.",
        },
      ];
      break;

    case "youtube-description-generator":
      toolTitle = dict.descTool.title;
      toolSubtitle = dict.descTool.subtitle;
      toolComponent = <DescriptionGeneratorTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Why are video timestamps important in YouTube descriptions?",
          answer:
            "Timestamps create interactive chapters in the YouTube player and enable Google Search to show Key Moments, drastically increasing search visibility.",
        },
      ];
      break;

    case "youtube-tags-generator":
      toolTitle = dict.tagsTool.title;
      toolSubtitle = dict.tagsTool.subtitle;
      toolComponent = <TagsGeneratorTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Do tags still matter for YouTube SEO in 2026?",
          answer:
            "Yes, tags help YouTube disambiguate common misspellings and categorize video content, especially for new channels and niche search queries.",
        },
      ];
      break;

    case "youtube-hashtag-generator":
      toolTitle = dict.hashtagTool.title;
      toolSubtitle = dict.hashtagTool.subtitle;
      toolComponent = <HashtagGeneratorTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "Where should I put hashtags on YouTube?",
          answer:
            "You can include 1-2 hashtags in the video title or up to 3-5 hashtags at the bottom of the video description.",
        },
      ];
      break;

    case "video-aspect-ratio-calculator":
      toolTitle = dict.ratioTool.title;
      toolSubtitle = dict.ratioTool.subtitle;
      toolComponent = <AspectRatioTool lang={lang as SupportedLanguage} dict={dict} />;
      toolFaqs = [
        {
          question: "What is the aspect ratio for YouTube Shorts?",
          answer:
            "YouTube Shorts uses a vertical 9:16 aspect ratio (standard resolution 1080 x 1920 pixels). Standard videos use 16:9 (1920 x 1080).",
        },
      ];
      break;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${toolTitle} - YTSnap`,
    url: `${baseUrl}/${lang}/tools/${toolSlug}`,
    description: toolSubtitle,
    applicationCategory: "MultimediaApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="py-8 md:py-14">
      <JsonLd data={structuredData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Breadcrumbs
          lang={lang as SupportedLanguage}
          items={[
            { label: dict.common.creatorTools, href: `/${lang}#tools` },
            { label: toolTitle },
          ]}
        />

        {toolSlug !== "youtube-thumbnail-downloader" && (
          <div className="text-center max-w-3xl mx-auto my-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              {toolTitle}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              {toolSubtitle}
            </p>
          </div>
        )}

        {/* Render Interactive Tool */}
        <div className="mt-6">{toolComponent}</div>
      </div>

      {/* Tool-specific FAQs */}
      {toolFaqs.length > 0 && <FaqSection dict={dict} faqs={toolFaqs} />}
    </div>
  );
}
