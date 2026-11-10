const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding YTSnap database...");

  // 1. Create or update Default Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ytsnap.tech";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@YTSnap2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "YTSnap Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user verified: ${admin.email}`);

  // 2. Default Website Settings
  const settings = [
    { key: "site_name", value: "YTSnap", group: "general", description: "Official website title" },
    { key: "site_tagline", value: "Free YouTube Thumbnail & Creator Media Tools", group: "general", description: "Main tagline" },
    { key: "support_email", value: "support@ytsnap.tech", group: "general", description: "Official support email" },
    { key: "primary_color", value: "#E62117", group: "general", description: "Primary brand theme color" },
    { key: "default_language", value: "en", group: "general", description: "Default interface language" },
    { key: "youtube_api_key", value: process.env.YOUTUBE_API_KEY || "", group: "api", description: "Optional YouTube Data API v3 key" },
    { key: "google_analytics_id", value: "", group: "seo", description: "Google Analytics (GA4) Measurement ID (e.g. G-XXXXXXXXXX)" },
    { key: "google_adsense_client_id", value: "", group: "ads", description: "Google AdSense Publisher ID (e.g. ca-pub-1234567890123456)" },
    { key: "google_adsense_enabled", value: "false", group: "ads", description: "Enable Google AdSense across pages" },
    { key: "custom_header_code", value: "", group: "code", description: "Custom HTML, CSS <style>, or JS <script> injected into <head>" },
    { key: "custom_footer_code", value: "", group: "code", description: "Custom JS scripts or widgets injected before </body>" },
    { key: "robots_txt_content", value: "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /*/admin/\n\nSitemap: http://localhost:3000/sitemap.xml", group: "seo", description: "Directives served at /robots.txt" },
    { key: "ads_txt_content", value: "# YTSnap Ads.txt\n# Example: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0", group: "ads", description: "Publisher lines served at /ads.txt" },
    { key: "sitemap_base_url", value: "http://localhost:3000", group: "seo", description: "Base domain URL for sitemap.xml" },
    { key: "enable_ads", value: "false", group: "ads", description: "Master switch to display banner ads" },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✓ Site settings seeded.");

  // 3. Blog Categories
  const categories = [
    { slug: "guides", name: "Creator Guides", description: "In-depth tutorials for creators" },
    { slug: "video-tools", name: "Video Tools", description: "Guides, safe download options, and creator media tools" },
    { slug: "seo", name: "YouTube SEO", description: "Optimize reach, titles, and click-through rates" },
    { slug: "design", name: "Thumbnail Design", description: "Visual aesthetics and psychology of thumbnails" },
    { slug: "legal", name: "Copyright & Fair Use", description: "Stay compliant with platform rules and media rights" },
  ];

  for (const c of categories) {
    await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }
  console.log("✓ Blog categories seeded.");

  // 4. Initial Blog Posts
  const posts = [
    {
      slug: "how-to-design-click-worthy-youtube-thumbnails",
      language: "en",
      title: "How to Design Click-Worthy YouTube Thumbnails in 2026",
      excerpt: "Master the visual psychology, color contrast rules, and resolution standards that drive high CTR on YouTube.",
      content: `## Why YouTube Thumbnails Determine 90% of Your Video Success\n\nYour thumbnail is your video's billboard on the digital highway. Even the best produced video will fail to gain traction if prospective viewers scroll right past it.\n\n### 1. The Rule of the High-Contrast Focal Point\nViewers browse YouTube primarily on mobile devices with relatively small screen footprints. Your main subject (whether an expressive human face or high-contrast element) must pop against a decluttered background.\n\n### 2. Standard Resolutions: 1280x720 (16:9)\nAlways export your YouTube thumbnail in **1280 x 720 pixels** with a minimum width of 640 pixels. Maintain a 16:9 aspect ratio and keep the file size under 2MB in JPG, GIF, or PNG format.\n\n### 3. Keep Text Under 4 Words\nNever repeat the exact title inside the thumbnail. Instead, use 2 to 4 impactful words in bold, easily legible sans-serif fonts (such as Impact, Montserrat, or Bebas Neue) with heavy dropshadows or contrast pill badges.\n\n### 4. Beware the Bottom-Right Timestamp\nYouTube overlays the duration timestamp on the bottom-right corner of the thumbnail preview. Never place critical faces, text, or logos in the bottom right 20% of your canvas.\n\n### Use YTSnap Tools to Test\nInspect your existing thumbnails with our free **YouTube Thumbnail Downloader & Inspector** to see how your maxres, sd, and mq previews render across screen sizes!`,
      category: "Thumbnail Design",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      author: "Alex Rivera",
      readTime: "5 min read",
      tags: "thumbnails,ctr,design,creator-tips",
      isPublished: true,
    },
    {
      slug: "understanding-youtube-thumbnail-resolutions",
      language: "en",
      title: "The Ultimate Guide to YouTube Thumbnail Sizes & Resolutions",
      excerpt: "Everything you need to know about maxresdefault, sddefault, hqdefault, mqdefault and when they are available.",
      content: `## The 5 Thumbnail Resolutions YouTube Stores\n\nWhen a creator uploads a custom thumbnail to YouTube, Google's media pipeline generates several resized assets on their CDN (img.youtube.com / i.ytimg.com):\n\n1. **maxresdefault.jpg (1280 x 720)** - Full High Definition (HD). Only present if the original source upload met HD resolution criteria.\n2. **sddefault.jpg (640 x 480)** - Standard Definition thumbnail.\n3. **hqdefault.jpg (480 x 360)** - High Quality 4:3 preview.\n4. **mqdefault.jpg (320 x 180)** - Medium Quality widescreen preview.\n5. **default.jpg (120 x 90)** - Smallest fallback thumbnail.\n\n### Why does maxresdefault sometimes return 404?\nOlder YouTube videos or videos uploaded at 480p or lower often do not have a 1280x720 thumbnail generated. YTSnap dynamically verifies HTTP availability so you never download a broken or missing image placeholder!`,
      category: "Creator Guides",
      coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
      author: "Sarah Chen",
      readTime: "4 min read",
      tags: "resolutions,maxres,hd,cdn",
      isPublished: true,
    },
    {
      slug: "youtube-seo-tags-and-title-best-practices",
      language: "en",
      title: "YouTube SEO in 2026: Titles, Descriptions, and Tags That Rank",
      excerpt: "Step-by-step framework to optimize your video metadata for YouTube search algorithm and suggested feed recommendations.",
      content: `## Search vs. Suggested: Two Different Algorithms\n\nYouTube traffic comes from two primary sources: **Search** and **Suggested Videos**. Here is how to structure your metadata for both:\n\n### Crafting Click-Worthy Titles\n- Put your core keyword in the first 40 characters.\n- Use emotional triggers or curiosity loops without misleading clickbait.\n- Test different variations using our **YouTube Title Generator**.\n\n### Optimized Descriptions\n- Write a compelling 200-word overview including natural keyword variations.\n- Add clear timestamps (chapters) to improve user retention and Google search key moments.\n- Include relevant social links and attribution disclaimers.\n\n### Tags Best Practice\n- YouTube tags serve primarily to disambiguate common misspellings and identify semantic clusters. Stay within the 500-character limit and avoid repetitive keyword stuffing.`,
      category: "YouTube SEO",
      coverImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      author: "David Miller",
      readTime: "6 min read",
      tags: "seo,tags,titles,algorithm",
      isPublished: true,
    },
    {
      slug: "youtube-video-downloader",
      language: "en",
      title: "YouTube Video Downloader: Best Free Online Tools, Apps & Safe Download Options",
      excerpt: "Compare YouTube video downloader options: official Premium downloads, free online tools, apps for iPhone and Mac, MP4 and 4K, plus safety tips.",
      content: `A YouTube video downloader is any app, website, browser extension or command-line program that saves a YouTube video as a file on your device. People search for one to watch on a flight, keep a lecture for study, back up their own uploads, or pull a clip into an editor. The options range from YouTube's own offline feature to free online downloader sites, desktop software and open-source tools, and they differ a lot in safety, quality and legality.

### Quick Answer (as of November 2026)
- **The only route YouTube officially endorses** for other people's videos is its own **Download button**, which needs YouTube Premium and keeps the video inside YouTube.
- **Your own uploads** can be downloaded as an MP4 directly from **YouTube Studio**, at zero cost.
- **Authorized media inspection & direct downloads:** You can inspect video formats and resolutions safely with our free [YTSnap YouTube Video Tool](/en/tools/youtube-video-downloader).
- **Third-party tools** such as 4K Video Downloader+ and yt-dlp can save files, but using them on content you don't own or have permission for conflicts with YouTube's Terms of Service.
- **Free online downloader sites** carry the highest risk of fake buttons, aggressive ads and unwanted installers.

> **A Note on Legality:** YouTube's [Terms of Service](https://www.youtube.com/static?gl=CA&template=terms) bar downloading any content unless the service expressly allows it or you have prior written permission from YouTube and, where relevant, the rights holder. Copyright law may also apply, and it varies by country. This guide is not legal advice. It does not cover bypassing DRM, paywalls or access restrictions, and it points you to permitted options first: YouTube Premium, your own videos, Creative Commons content and videos you have explicit permission to save.

---

## What Is a YouTube Video Downloader?

A YouTube video downloader reads a video's link, fetches the stream YouTube serves for it, and saves it as a file such as MP4 (video) or MP3 (audio). It comes in four forms:
1. **Online downloader sites** that you use in a browser by pasting a link, with nothing to install.
2. **Desktop software** for Windows, Mac or Linux, such as 4K Video Downloader+.
3. **Command-line tools** such as the open-source yt-dlp.
4. **Mobile apps and browser extensions**, which are the hardest category to trust because they often ask for broad permissions.

---

## The Official Way: YouTube Premium Offline Downloads

If your goal is simply to watch offline, YouTube's own feature is the one option that is clearly permitted. According to [YouTube Help](https://support.google.com/youtube/answer/11977233), Premium members can download videos on mobile, and on a computer through Chrome, Edge, Firefox and Opera. Downloads are played back inside YouTube and can be watched offline for up to 29 days before the app needs to reconnect.

The trade-offs are real. Downloads are stored encrypted and can only be watched in the YouTube app, so you do not get an MP4 you can move or edit.

---

## Best YouTube Video Downloader Tools

### 1. YouTube Premium (Official Offline Downloads)
**Best for:** watching other creators' videos offline with no terms-of-service risk.

### 2. YouTube Studio (Your Own Uploads)
**Best for:** creators who want a backup of videos they uploaded. Open a video's menu in YouTube Studio and choose Download to get an MP4 of it.

### 3. YTSnap YouTube Video Downloader (Free Web Utility)
**Best for:** creators looking for authorized resolution inspection, video info retrieval, and permitted media saving directly in their browser without installing suspicious software. Check out the [YTSnap YouTube Video Downloader](/en/tools/youtube-video-downloader).

### 4. 4K Video Downloader+ (Desktop Software)
**Best for:** people who are permitted to save a video and want a straightforward app on desktop.

### 5. yt-dlp (Open-Source, Command Line)
**Best for:** technical users who are comfortable in a terminal with python and ffmpeg.

---

## YouTube Video Downloader Comparison Table

| Tool | Platforms | Free or Paid | MP4 File | 4K | Install Required | Privacy and Security Notes |
| --- | --- | --- | --- | --- | --- | --- |
| [YouTube Premium](https://support.google.com/youtube/answer/11977233) | Mobile apps; desktop via Chrome, Edge, Firefox, Opera | Paid: $15.99/mo; Lite $8.99/mo | No, playable only in YouTube | Not verified | App or browser | Official and permitted; downloads are encrypted and tied to your account |
| YouTube Studio ([guide](https://www.howtogeek.com/693705/how-to-download-your-own-youtube-videos/)) | Web, mobile app | Free | Yes, your own uploads only | Not verified | None | Official; no third party involved |
| [YTSnap Video Tool](/en/tools/youtube-video-downloader) | Web (All devices) | 100% Free | Yes, accessible streams | HD, 1080p, 720p | None | Free web tool; transparent stream inspection without malware or fake ads |
| [4K Video Downloader+](https://www.techspot.com/news/111489-download-youtube-videos-offline-full-playlists.html) | Windows, macOS, Ubuntu, Android | Free tier with limits; paid from $15/yr or $25 lifetime | Yes | Up to 8K where available; inconsistent | Yes | Install only from official site; ToS issue remains |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Windows, macOS, Linux | Free, open source | Yes (ffmpeg recommended) | Depends on formats offered | Yes (command line) | Signed releases; use only official repository; ToS issue remains |
| SaveFrom.net ([scan](https://tools.malwaretips.com/url-scan/savefrom.net)) | Web, extension | Free | Yes | One review says 4K comes without sound | No (extension optional) | Rated "suspicious" (55/100) by MalwareTips; reports of adware and redirects; ToS issue |
| SaveTube, save.tube ([scan](https://tools.malwaretips.com/url-scan/save.tube)) | Web | Free | Not verified | Claims 4K/8K; not verified | No | Rated "suspicious" (51/100) in a July 2026 scan; no contact or ownership details found |

---

## How to Download YouTube Videos as MP4 (Permitted Methods)

1. **Your Own Video from YouTube Studio:** Go to Content, select the video, and click Download.
2. **Creative Commons (CC BY):** Use YouTube search filters to find reusable content.
3. **Written Permission:** If the copyright owner gave express authorization.

---

## Is a YouTube Video Downloader Safe?

The main risk is not the video stream itself, but malicious ads, fake download buttons, notification prompts, and Trojan installers disguised as setup files on shady online sites. Always use verified tools like YouTube Premium, YouTube Studio, or clean web utilities like [YTSnap](/en/tools/youtube-video-downloader).

---

## Frequently Asked Questions

### What is the best YouTube video downloader?
For other people's videos, the best option is YouTube Premium's built-in Download feature, because it is the one method YouTube allows. For your own uploads, use YouTube Studio. If you have permission to save a video and want software, 4K Video Downloader+ is a well-known desktop choice, and yt-dlp suits technical users.

### Is there a free YouTube video downloader?
Yes. YouTube Studio is free for your own videos. 4K Video Downloader+ has a free tier with daily limits, and yt-dlp is free open-source software. Free online downloader sites also exist, but they carry the most risk from ads, redirects and unwanted installers.

### Can I download YouTube videos online without installing software?
Technically, yes, through online downloader sites or online web inspectors like YTSnap. We don't recommend shady third-party sites since many carry warning signs. If you use one, only for content you may save, and leave any page that offers an installer or shows several identical Download buttons.

### Which YouTube video downloader works on iPhone?
The YouTube app with Premium is the reliable choice, and downloads stay inside the app. Third-party downloaders for iPhone often route you through extra installs or settings changes, which is a reason to avoid them.

### Can I download YouTube videos on a Mac?
Yes. Premium downloads work in Chrome, Edge, Firefox and Opera on a computer. 4K Video Downloader+ lists macOS support, and yt-dlp provides a macOS executable. Get either from the official source.

### Is a 4K YouTube video downloader available?
Some desktop tools advertise 4K, and 4K Video Downloader+ is reported to offer up to 8K where the video has it. Results vary, the video must exist in 4K, and some tools may save video without audio. Always check the result.

### Can YouTube videos be downloaded in MP4 format?
For videos you uploaded, YouTube Studio gives you an MP4. Premium downloads are not MP4 files you can move around. Third-party tools can produce MP4s, but only use them for content you own or have permission to save.

### Is a YouTube video downloader safe?
It depends on the tool and on how you get it. Official routes are safest. Online downloader sites and unfamiliar extensions are the most likely to expose you to fake buttons, malicious ads or bundled software. No tool is guaranteed safe, so check reputation and download only from official sources.

### What is SaveTube?
SaveTube is a name used by online downloader sites, including save.tube, which advertises free downloads from YouTube and other platforms. A July 2026 MalwareTips scan rated save.tube suspicious and found no ownership details. We don't recommend it.

### What is the safest way to watch YouTube videos offline?
Use YouTube Premium and download videos in the YouTube app or a supported browser. It keeps everything within YouTube's rules and avoids third-party software entirely.

### Is it legal to download YouTube videos?
It depends. YouTube's terms prohibit downloads unless the service allows them or you have written permission, and copyright law may apply on top. Your own videos, Premium downloads, and content with a license or permission that allows it are the clear cases. This is general information, not legal advice.

### Can I download just the audio or an MP3?
YouTube says it is not possible to download audio, music or MP3 files from the YouTube app, though Premium members can use YouTube Music for offline songs. Converters that extract audio raise the same permission and safety questions.`,
      category: "Video Tools",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      author: "@jeet",
      readTime: "8 min read",
      tags: "youtube video downloader, offline viewing, youtube premium, mp4, 4k video, video downloader safety, yt-dlp, 4k video downloader, savetube",
      isPublished: true,
    },
  ];

  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug_language: { slug: p.slug, language: p.language } },
      update: p,
      create: p,
    });
  }
  console.log("✓ Blog posts seeded.");

  // 5. Frequently Asked Questions
  const faqs = [
    {
      question: "Is it legal to download YouTube thumbnails?",
      answer: "YouTube thumbnails are publicly accessible images cached on YouTube's CDN. Downloading a thumbnail for offline reference, fair use commentary, analysis, or for your own uploaded videos is generally permitted. However, you should always respect original creator copyright and not republish another creator's thumbnail as your own without authorization.",
      category: "thumbnail",
      language: "en",
      order: 1,
    },
    {
      question: "Why is the Maximum Resolution (1280x720) thumbnail not available for some videos?",
      answer: "Maximum resolution (maxresdefault) thumbnails are only generated by YouTube when the video publisher uploads an image with at least 1280x720 resolution. For older videos, lower resolution uploads, or auto-generated video stills, YouTube only creates HQ (480x360) or MQ (320x180) previews.",
      category: "thumbnail",
      language: "en",
      order: 2,
    },
    {
      question: "Can I download full YouTube videos with YTSnap?",
      answer: "YTSnap strictly adheres to platform terms and copyright laws. We do not facilitate unauthorized downloads of YouTube videos or bypass DRM restrictions. We provide video metadata and authorized media tools for content creators working with permitted sources and their own original assets.",
      category: "general",
      language: "en",
      order: 3,
    },
    {
      question: "How do I extract a thumbnail from a YouTube Short?",
      answer: "Simply paste the YouTube Short URL (e.g., youtube.com/shorts/VIDEO_ID or youtu.be/VIDEO_ID) into YTSnap. Our system automatically parses the Short ID and fetches all available high-resolution thumbnails instantly.",
      category: "thumbnail",
      language: "en",
      order: 4,
    },
    {
      question: "What image formats can I download thumbnails in?",
      answer: "You can download thumbnails in their native high-quality JPG format directly from the CDN or use our 1-click converter to download as PNG, WEBP, or AVIF with customizable compression.",
      category: "tools",
      language: "en",
      order: 5,
    },
    {
      question: "Are YTSnap creator tools completely free to use?",
      answer: "Yes! All YTSnap tools—including the Thumbnail Downloader, Video Info Finder, Image Resizer, Compressor, Title Generator, and Tags Generator—are 100% free with no registration required.",
      category: "general",
      language: "en",
      order: 6,
    },
  ];

  for (const f of faqs) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: f.question, language: f.language },
    });
    if (!existing) {
      await prisma.faqItem.create({ data: f });
    }
  }
  console.log("✓ FAQs seeded.");

  // 6. Advertisements
  const adSlots = [
    { slot: "header_top", name: "Header Banner", isActive: false },
    { slot: "hero_bottom", name: "Hero Bottom Banner", isActive: false },
    { slot: "sidebar", name: "Sidebar Banner", isActive: false },
    { slot: "in_content", name: "In-Content Native Banner", isActive: false },
    { slot: "footer_top", name: "Footer Top Banner", isActive: false },
  ];

  for (const ad of adSlots) {
    await prisma.advertisement.upsert({
      where: { slot: ad.slot },
      update: { name: ad.name },
      create: ad,
    });
  }
  console.log("✓ Ad slots initialized.");

  console.log("Database seed completed successfully! 🚀");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
