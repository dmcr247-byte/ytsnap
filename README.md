# YTSnap 🚀
### Production-Ready Multilingual YouTube Media Tools & Creator Suite

**YTSnap** is a high-performance, international SaaS platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Sharp**. It provides fast YouTube thumbnail retrieval with real-time CDN verification, video metadata inspection, authorized media tools, and a full suite of 10 creator utilities in **8 languages** with native RTL support.

---

## 🌟 Key Highlights & Features

### 1. YouTube Thumbnail Downloader & Inspector
- Real-time HTTP HEAD checks against Google's YouTube CDN (`img.youtube.com` / `i.ytimg.com`).
- Eliminates broken 404 placeholders by dynamically detecting whether High Definition (`maxresdefault.jpg` at 1280x720) was uploaded.
- Supports all available resolutions:
  - **MaxRes HD:** 1280 × 720
  - **Standard Definition (SD):** 640 × 480
  - **High Quality (HQ):** 480 × 360
  - **Medium Quality (MQ):** 320 × 180
  - **Default Thumbnail:** 120 × 90
- One-click downloads as original **JPG** or converted **PNG** via high-speed server streaming proxy (`/api/download-proxy`).
- Copy direct CDN URL to clipboard and preview in full aspect ratio.

### 2. Video Information & Platform Compliance
- Extracts title, channel name, embed player, duration, and publication date using YouTube's oEmbed API and optional YouTube Data API v3.
- **Strict Compliance:** Respects YouTube's Terms of Service and Digital Millennium Copyright Act (DMCA). Clearly explains DRM restrictions and directs users to official YouTube Premium offline options.
- **Authorized Media Inspector:** Content creators can inspect permitted direct media streams (`.mp4`, `.webm`) on authorized self-hosted platforms with full SSRF protection.

### 3. Complete Creator Utility Suite (All 10 Tools Functional)
1. **YouTube Thumbnail Downloader:** Instant retrieval and multi-resolution availability checker.
2. **YouTube Video Information Finder:** Metadata, channel details, and embed code generator.
3. **Thumbnail Image Resizer:** Presets for YouTube Thumbnails (1280x720), Banners (2560x1440), Shorts (1080x1920), and Community Posts (1200x1200) with aspect ratio lock and Sharp image engine.
4. **Image Compressor:** Reduces images below YouTube's strict 2MB threshold with real-time savings percentage and visual quality retention.
5. **Image Format Converter:** Fast conversion between PNG, JPG, WEBP, and AVIF formats.
6. **YouTube Title Generator:** Generates 10+ algorithm-optimized titles categorized by tone (Curiosity, Educational, Urgency, Listicle) with CTR score estimations.
7. **YouTube Description Generator:** Structured template generator with timestamps, social media links, affiliate notices, and search keywords.
8. **YouTube Tags Generator:** Tag extractor with live character count tracker against YouTube's 500-character limit and 1-click comma-separated copy.
9. **YouTube Hashtag Generator:** Broad and niche hashtag generator for YouTube search and Shorts feed visibility.
10. **Video Aspect Ratio & Bitrate Calculator:** Calculates aspect ratios (16:9, 9:16 Shorts, 1:1, 4:3, 21:9), visual box preview, recommended YouTube bitrates, and file size estimates.

### 4. Multilingual System (8 Languages + True RTL)
- Structured dictionary files for 8 languages:
  1. **English (`en`)** - Default
  2. **Hindi (`hi`)**
  3. **Spanish (`es`)**
  4. **Portuguese (`pt`)**
  5. **French (`fr`)**
  6. **German (`de`)**
  7. **Arabic (`ar`)** - Full RTL layout (`dir="rtl"`, mirrored UI elements)
  8. **Indonesian (`id`)**
- Header language switcher with flags and native names.
- Auto-detects browser language on first visit via middleware and remembers user preferences in cookies.
- Clean SEO URL prefixes: `/[lang]/tools/...`.

### 5. Secure Admin Dashboard & CMS (`/admin`)
- Secure session authentication with **bcrypt** password hashing and HTTP-only **JWT cookies**.
- Pre-seeded admin account: `admin@ytsnap.tech` / `Admin@YTSnap2026!`.
- **Analytics & Metrics:** Total tool runs, daily visitors, monthly estimates, tool popularity breakdown, and language distribution.
- **Blog CMS:** Create, edit, and delete multilingual articles with tags, reading times, and cover images.
- **FAQ Manager:** Add and manage FAQs per language and tool category.
- **Contact Inquiries:** View, toggle read status, and manage incoming user messages.
- **Settings & Ad Slots:** Edit website settings, Google Analytics ID, API keys, and toggle banner ad slots.

### 6. Technical SEO & Performance
- Full static site generation (180+ pre-rendered pages) and edge API routes.
- XML Sitemap (`/sitemap.xml`) with alternate `hreflang` links across all 8 languages.
- Search-engine compliant `robots.txt` (`/robots.txt`).
- Structured Schema.org JSON-LD data: `WebSite`, `Organization`, `WebApplication`, `BreadcrumbList`, `Article`, and `FAQPage`.
- Fast, accessible UI with Dark and Light mode (zero-flicker theme script).

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Database & ORM:** SQLite out-of-the-box (Prisma ORM, seamlessly switchable to PostgreSQL)
- **Image Processing:** Sharp
- **Security & Auth:** bcryptjs, jsonwebtoken, SSRF validator, in-memory sliding-window rate limiting
- **Icons:** Lucide React

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18.17+ or 20+ (tested on Node 22)
- npm or pnpm

### 2. Installation
```bash
# Clone or navigate to the project directory
cd d:/yt-new

# Install dependencies
npm install
```

### 3. Database Setup & Seed
```bash
# Push schema to SQLite database (dev.db)
npx prisma db push

# Seed initial admin, settings, FAQs, and blog guides
node scripts/seed.js
```

### 4. Running the Application
```bash
# Development mode
npm run dev

# Production build and start
npm run build
npm start
```
The application will be live at `http://localhost:3000`.

---

## 🧪 Automated Test Suite

A built-in end-to-end test runner verifies all 28 critical routes and API endpoints:

```bash
node scripts/test-endpoints.js
```

**Test Coverage:**
- ✅ Root Language Redirect (307)
- ✅ All 8 Language Homepages (200 OK)
- ✅ Arabic True RTL layout validation
- ✅ Live YouTube Thumbnail CDN inspection
- ✅ Error handling for invalid video URLs
- ✅ Download proxy stream with JPG & PNG headers
- ✅ Video Info metadata & compliance notices
- ✅ Authorized media inspection & YouTube DRM guard
- ✅ Contact form validation & SQLite database persistence
- ✅ Admin authentication, password verification, & JWT cookie
- ✅ Admin stats & metric endpoints
- ✅ Dynamic XML sitemap & robots.txt
- ✅ All 10 Creator Tools pages

---

## 🛡️ Security Architecture

1. **SSRF Protection:** All outgoing media inspection requests pass through `isSafePublicUrl()` in `src/lib/security.ts`. Loops back, private IP ranges (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), local domains (`localhost`, `.internal`, `.local`), and cloud metadata IPs (`169.254.169.254`) are blocked.
2. **API Abuse Prevention & Rate Limiting:** In-memory sliding window rate limiter protects endpoints (`/api/thumbnail`, `/api/video-info`, `/api/contact`) by client IP hash.
3. **Admin Protection:** Sensitive operations require authenticated JWT verification via `verifyAdminToken()`.

---

## 📂 Project Architecture

```
d:/yt-new/
├── prisma/
│   └── schema.prisma         # Database models (AdminUser, BlogPost, ToolUsage, etc.)
├── scripts/
│   ├── seed.js               # Database seeder (Admin, blog posts, FAQs, settings)
│   └── test-endpoints.js     # 28-point end-to-end automated test runner
├── src/
│   ├── app/
│   │   ├── [lang]/           # Multilingual dynamic routes (en, hi, es, pt, fr, de, ar, id)
│   │   │   ├── layout.tsx    # Header, Footer, and RTL direction wrapper
│   │   │   ├── page.tsx      # Homepage with Hero, How It Works, FAQs
│   │   │   ├── tools/
│   │   │   │   └── [toolSlug]/page.tsx  # Dynamic router for all 10 Creator Tools
│   │   │   ├── blog/         # Multilingual blog list and detail pages
│   │   │   ├── about/        # About Us page
│   │   │   ├── contact/      # Interactive Contact form
│   │   │   ├── privacy-policy/
│   │   │   ├── terms/
│   │   │   ├── disclaimer/
│   │   │   ├── copyright/
│   │   │   ├── dmca/
│   │   │   └── cookie-policy/
│   │   ├── admin/            # Secure Admin Dashboard & CMS
│   │   ├── api/              # Secure API routes (thumbnail, download, proxy, auth)
│   │   ├── layout.tsx        # Root HTML layout with ThemeScript
│   │   ├── not-found.tsx     # Custom 404 page
│   │   ├── robots.ts         # Robots.txt generator
│   │   └── sitemap.ts        # XML Sitemap with hreflang alternates
│   ├── components/
│   │   ├── Header.tsx        # Responsive navigation, language picker, theme toggle
│   │   ├── Footer.tsx        # Footer with tools, legal links, language strip
│   │   ├── ThumbnailHero.tsx # Main thumbnail search & preview interface
│   │   ├── HomeSections.tsx  # How It Works, Features, Resolution Guide, FAQs
│   │   ├── tools/            # 10 Interactive Creator Tool Components
│   │   ├── Breadcrumbs.tsx   # Semantic breadcrumb component
│   │   ├── JsonLd.tsx        # Schema.org structured data renderer
│   │   └── ThemeScript.tsx   # Anti-FOUC dark mode script
│   ├── lib/
│   │   ├── i18n.ts           # Language dictionaries, types, RTL utilities
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── security.ts       # SSRF protection, rate limiting, JWT & bcrypt helpers
│   │   └── youtube.ts        # URL parser, CDN checker, oEmbed fetcher
│   ├── locales/              # 8 Translation JSON files (en, hi, es, pt, fr, de, ar, id)
│   └── middleware.ts         # Language detection, routing, and cookie persistence
├── .env                      # Active environment configuration
├── .env.example              # Environment variables template
├── tailwind.config.ts        # Design system colors, fonts, dark mode configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 📄 License & Compliance

YTSnap is provided as an open tool under standard commercial web guidelines. All YouTube thumbnail images and metadata belong to their respective copyright owners. YTSnap is an independent third-party tool and is not affiliated with or endorsed by YouTube or Google LLC.
