import { MetadataRoute } from "next";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import prisma from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configuredBase = await getSetting("sitemap_base_url", "");
  const baseUrl = (configuredBase || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/tools/youtube-video-downloader",
    "/tools/youtube-thumbnail-downloader",
    "/tools/youtube-video-information",
    "/tools/thumbnail-resizer",
    "/tools/image-compressor",
    "/tools/image-converter",
    "/tools/youtube-title-generator",
    "/tools/youtube-description-generator",
    "/tools/youtube-tags-generator",
    "/tools/youtube-hashtag-generator",
    "/tools/video-aspect-ratio-calculator",
    "/blog",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/copyright",
    "/dmca",
    "/cookie-policy",
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Generate multilingual entries for all static routes
  for (const route of staticRoutes) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const url = `${baseUrl}/${lang.code}${route}`;
      const alternatesLanguages: Record<string, string> = {};
      for (const altLang of SUPPORTED_LANGUAGES) {
        alternatesLanguages[altLang.code] = `${baseUrl}/${altLang.code}${route}`;
      }

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route.startsWith("/tools") ? 0.9 : 0.7,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  }

  // Add blog posts
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, language: true, updatedAt: true },
    });

    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/${post.language}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch (e) {
    console.warn("Sitemap blog fetch warning:", e);
  }

  return entries;
}
