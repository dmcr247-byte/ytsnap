# YTSnap 🚀
### Production-Ready YouTube Video, Shorts & Creator Media Suite

[![Live Website](https://img.shields.io/badge/Live%20Website-ytsnap.tech-red?style=for-the-badge&logo=youtube)](https://www.ytsnap.tech/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> 🌐 **Official Live Application:** [**https://www.ytsnap.tech**](https://www.ytsnap.tech/)  
> 🇮🇳 **हिन्दी संस्करण (Hindi Portal):** [**https://www.ytsnap.tech/hi**](https://www.ytsnap.tech/hi)

**YTSnap** is an open-source, high-performance web utility suite engineered for YouTube content creators, video editors, and digital archivists. Built on **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and modern **WebAssembly/Client-side Muxing**, YTSnap delivers 1080p Full HD video downloading with sound, watermark-free Shorts, 4K channel banners, and raw CDN thumbnail extraction across **8 global languages**.

---

## 🔗 Official Tools & Quick Access Links

Explore the live utilities deployed on [YTSnap.tech](https://www.ytsnap.tech/):

| Tool Name | Direct Link | Key Capability |
| :--- | :--- | :--- |
| 🎬 **YouTube Video Downloader** | [**ytsnap.tech/en/tools/youtube-video-downloader**](https://www.ytsnap.tech/en/tools/youtube-video-downloader) | 1080p, 720p HD MP4 & 320kbps MP3 with audio & video muxed together |
| ⚡ **YouTube Shorts Downloader** | [**ytsnap.tech/en/tools/youtube-shorts-downloader**](https://www.ytsnap.tech/en/tools/youtube-shorts-downloader) | Vertical 9:16 portrait video (1080x1920) with **zero watermarks** |
| 🖼️ **YouTube Banner Downloader** | [**ytsnap.tech/en/tools/youtube-banner-downloader**](https://www.ytsnap.tech/en/tools/youtube-banner-downloader) | Master 2560x1440 4K channel headers with mobile & desktop safe-area guides |
| 📸 **YouTube Thumbnail Downloader** | [**ytsnap.tech/en/tools/youtube-thumbnail-downloader**](https://www.ytsnap.tech/en/tools/youtube-thumbnail-downloader) | Direct CDN grabber for full HD (1280x720 `maxresdefault`) without watermarks |
| 📊 **Video Information Finder** | [**ytsnap.tech/en/tools/youtube-video-information**](https://www.ytsnap.tech/en/tools/youtube-video-information) | Live metadata, SEO tags, view metrics, publish timestamps & embed codes |
| 📐 **Aspect Ratio Calculator** | [**ytsnap.tech/en/tools/video-aspect-ratio-calculator**](https://www.ytsnap.tech/en/tools/video-aspect-ratio-calculator) | Pixel-perfect dimension calculator for 16:9, 9:16 Shorts, 1:1, and 4:3 |
| 📝 **YouTube Title Generator** | [**ytsnap.tech/en/tools/youtube-title-generator**](https://www.ytsnap.tech/en/tools/youtube-title-generator) | High-CTR psychological title formulas under 70 characters |
| 🏷️ **YouTube Tags Generator** | [**ytsnap.tech/en/tools/youtube-tags-generator**](https://www.ytsnap.tech/en/tools/youtube-tags-generator) | High-search volume tag clusters with 500-char live counter |
| 🗜️ **Thumbnail Compressor** | [**ytsnap.tech/en/tools/image-compressor**](https://www.ytsnap.tech/en/tools/image-compressor) | Reduces file size under YouTube's strict 2MB limit with 0 quality loss |
| 🔄 **Image Format Converter** | [**ytsnap.tech/en/tools/image-converter**](https://www.ytsnap.tech/en/tools/image-converter) | 1-click converter between JPG, PNG, and next-gen WebP |

---

## 🌟 Architecture & Key Features

### 1. In-Browser Client-Side Muxing (No Silent Videos)
YouTube delivers 1080p, 1440p, and 4K video using the DASH protocol, separating the video and audio tracks. While legacy downloaders output silent videos, [YTSnap](https://www.ytsnap.tech/) integrates client-side muxing using `mediabunny`. It streams the video and audio byte ranges directly into the user's browser, combining them into a single, crystal-clear MP4 file in 1-2 seconds with zero server transcoding bottlenecks.

### 2. Multi-Language Audio Track Selection
Supports multi-language dubbed YouTube tracks. Users can inspect and pick their desired audio stream (e.g., Original Hindi, English, Spanish, Bengali) to merge with the high-definition video track.

### 3. Internationalization & Geo-Targeting (8 Languages)
YTSnap natively supports 8 languages with automatic Geo-IP detection:
- 🇺🇸 [English (`/en`)](https://www.ytsnap.tech/en)
- 🇮🇳 [हिन्दी / Hindi (`/hi`)](https://www.ytsnap.tech/hi)
- 🇪🇸 [Español / Spanish (`/es`)](https://www.ytsnap.tech/es)
- 🇧🇷 [Português / Portuguese (`/pt`)](https://www.ytsnap.tech/pt)
- 🇫🇷 [Français / French (`/fr`)](https://www.ytsnap.tech/fr)
- 🇩🇪 [Deutsch / German (`/de`)](https://www.ytsnap.tech/de)
- 🇸🇦 [العربية / Arabic (`/ar`) - Native RTL layout](https://www.ytsnap.tech/ar)
- 🇮🇩 [Bahasa Indonesia (`/id`)](https://www.ytsnap.tech/id)

### 4. Technical SEO & Core Web Vitals
- **Pre-rendered Static Site Generation (SSG):** All 200+ localized pages are pre-compiled to static HTML for instant sub-second Googlebot indexing.
- **Rich Structured Data:** JSON-LD `WebApplication`, `HowTo`, `FAQPage`, and `WebSite` schemas.
- **Clean User Experience:** Zero deceptive pop-under ads, zero malware, zero third-party tracking cookies.

---

## 🛠️ Technology Stack

- **Frontend & Routing:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Stream Processing:** Undici ProxyAgent, MediaBunny Client-Side Remuxer
- **Database & ORM:** Prisma ORM (PostgreSQL on Neon / SQLite for local development)
- **Security:** In-memory sliding-window rate limiting, SSRF protection (`isSafePublicUrl`)
- **Hosting & Infrastructure:** Vercel Serverless Edge, Node.js 20+

---



---

## 🛡️ Fair Use & Copyright Compliance

[YTSnap](https://www.ytsnap.tech/) strictly adheres to international copyright laws and fair use principles. The platform is designed for creators to back up their own content, access royalty-free educational media, and inspect public metadata. YTSnap does not circumvent DRM protections or host copyrighted media files on its servers.

---

## 📄 License & Attribution

Distributed under the MIT License. See `LICENSE` for more information.

*Disclaimer: YTSnap is an independent third-party tool and is not officially affiliated with, endorsed by, or sponsored by YouTube, Google LLC, or Alphabet Inc. YouTube is a registered trademark of Google LLC.*
