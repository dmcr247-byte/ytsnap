const fs = require("fs");
const path = require("path");

const filesToUpdate = [
  "src/app/layout.tsx",
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/components/ThemeScript.tsx",
  "src/lib/security.ts",
  "src/middleware.ts",
  "src/app/admin/page.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.txt/route.ts",
  "src/app/ads.txt/route.ts",
  "src/app/api/authorized-download/route.ts",
  "src/app/api/download-proxy/route.ts",
  "src/app/api/image-process/route.ts",
  "src/app/api/video-download/route.ts",
  "src/app/api/video-info/route.ts",
  "src/app/api/admin/blogs/route.ts",
  "src/app/[lang]/page.tsx",
  "src/app/[lang]/about/page.tsx",
  "src/app/[lang]/blog/page.tsx",
  "src/app/[lang]/blog/[slug]/page.tsx",
  "src/app/[lang]/contact/page.tsx",
  "src/app/[lang]/cookie-policy/page.tsx",
  "src/app/[lang]/copyright/page.tsx",
  "src/app/[lang]/disclaimer/page.tsx",
  "src/app/[lang]/dmca/page.tsx",
  "src/app/[lang]/privacy-policy/page.tsx",
  "src/app/[lang]/terms/page.tsx",
  "src/app/[lang]/tools/[toolSlug]/page.tsx",
  "src/components/tools/CompressorTool.tsx",
  "src/components/tools/ConverterTool.tsx",
  "src/components/tools/DescriptionGeneratorTool.tsx",
  "src/components/tools/ResizerTool.tsx",
  "src/components/tools/VideoDownloaderTool.tsx",
  "src/locales/en.json",
  "src/locales/hi.json",
  "src/locales/es.json",
  "src/locales/pt.json",
  "src/locales/fr.json",
  "src/locales/de.json",
  "src/locales/ar.json",
  "src/locales/id.json",
  "scripts/seed.js",
  "scripts/add-video-downloader-article.js",
  ".env",
  ".env.example",
  "package.json",
  "README.md",
];

const replacements = [
  { from: /support@mediasnap\.com/g, to: "support@ytsnap.tech" },
  { from: /admin@mediasnap\.com/g, to: "admin@ytsnap.tech" },
  { from: /Admin@MediaSnap2026!/g, to: "Admin@YTSnap2026!" },
  { from: /mediasnap\.com/g, to: "ytsnap.tech" },
  { from: /mediasnap_admin_session/g, to: "ytsnap_admin_session" },
  { from: /mediasnap_theme/g, to: "ytsnap_theme" },
  { from: /mediasnap-/g, to: "ytsnap-" },
  { from: /MediaSnap/g, to: "YTSnap" },
  { from: /mediasnap/g, to: "ytsnap" },
];

console.log("Starting systematic rebranding to YTSnap (ytsnap.tech)...");

let count = 0;
for (const relPath of filesToUpdate) {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, "utf8");
    let changed = false;

    for (const r of replacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(fullPath, content, "utf8");
      console.log(`  ✓ Updated: ${relPath}`);
      count++;
    }
  } else {
    console.warn(`  ! File not found: ${relPath}`);
  }
}

console.log(`\nRebranded ${count} files successfully! 🚀`);
