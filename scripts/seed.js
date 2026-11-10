const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding MediaSnap database...");

  // 1. Create or update Default Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mediasnap.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@MediaSnap2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "MediaSnap Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user verified: ${admin.email}`);

  // 2. Default Website Settings
  const settings = [
    { key: "site_name", value: "MediaSnap", group: "general", description: "Official website title" },
    { key: "site_tagline", value: "Free YouTube Thumbnail & Creator Media Tools", group: "general", description: "Main tagline" },
    { key: "support_email", value: "support@mediasnap.com", group: "general", description: "Official support email" },
    { key: "primary_color", value: "#E62117", group: "general", description: "Primary brand theme color" },
    { key: "default_language", value: "en", group: "general", description: "Default interface language" },
    { key: "youtube_api_key", value: process.env.YOUTUBE_API_KEY || "", group: "api", description: "Optional YouTube Data API v3 key" },
    { key: "google_analytics_id", value: "", group: "seo", description: "Google Analytics (GA4) Measurement ID" },
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
      content: `## Why YouTube Thumbnails Determine 90% of Your Video Success\n\nYour thumbnail is your video's billboard on the digital highway. Even the best produced video will fail to gain traction if prospective viewers scroll right past it.\n\n### 1. The Rule of the High-Contrast Focal Point\nViewers browse YouTube primarily on mobile devices with relatively small screen footprints. Your main subject (whether an expressive human face or high-contrast element) must pop against a decluttered background.\n\n### 2. Standard Resolutions: 1280x720 (16:9)\nAlways export your YouTube thumbnail in **1280 x 720 pixels** with a minimum width of 640 pixels. Maintain a 16:9 aspect ratio and keep the file size under 2MB in JPG, GIF, or PNG format.\n\n### 3. Keep Text Under 4 Words\nNever repeat the exact title inside the thumbnail. Instead, use 2 to 4 impactful words in bold, easily legible sans-serif fonts (such as Impact, Montserrat, or Bebas Neue) with heavy dropshadows or contrast pill badges.\n\n### 4. Beware the Bottom-Right Timestamp\nYouTube overlays the duration timestamp on the bottom-right corner of the thumbnail preview. Never place critical faces, text, or logos in the bottom right 20% of your canvas.\n\n### Use MediaSnap Tools to Test\nInspect your existing thumbnails with our free **YouTube Thumbnail Downloader & Inspector** to see how your maxres, sd, and mq previews render across screen sizes!`,
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
      content: `## The 5 Thumbnail Resolutions YouTube Stores\n\nWhen a creator uploads a custom thumbnail to YouTube, Google's media pipeline generates several resized assets on their CDN (img.youtube.com / i.ytimg.com):\n\n1. **maxresdefault.jpg (1280 x 720)** - Full High Definition (HD). Only present if the original source upload met HD resolution criteria.\n2. **sddefault.jpg (640 x 480)** - Standard Definition thumbnail.\n3. **hqdefault.jpg (480 x 360)** - High Quality 4:3 preview.\n4. **mqdefault.jpg (320 x 180)** - Medium Quality widescreen preview.\n5. **default.jpg (120 x 90)** - Smallest fallback thumbnail.\n\n### Why does maxresdefault sometimes return 404?\nOlder YouTube videos or videos uploaded at 480p or lower often do not have a 1280x720 thumbnail generated. MediaSnap dynamically verifies HTTP availability so you never download a broken or missing image placeholder!`,
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
      question: "Can I download full YouTube videos with MediaSnap?",
      answer: "MediaSnap strictly adheres to platform terms and copyright laws. We do not facilitate unauthorized downloads of YouTube videos or bypass DRM restrictions. We provide video metadata and authorized media tools for content creators working with permitted sources and their own original assets.",
      category: "general",
      language: "en",
      order: 3,
    },
    {
      question: "How do I extract a thumbnail from a YouTube Short?",
      answer: "Simply paste the YouTube Short URL (e.g., youtube.com/shorts/VIDEO_ID or youtu.be/VIDEO_ID) into MediaSnap. Our system automatically parses the Short ID and fetches all available high-resolution thumbnails instantly.",
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
      question: "Are MediaSnap creator tools completely free to use?",
      answer: "Yes! All MediaSnap tools—including the Thumbnail Downloader, Video Info Finder, Image Resizer, Compressor, Title Generator, and Tags Generator—are 100% free with no registration required.",
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
