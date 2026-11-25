import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = "https://www.ytsnap.tech";
  const defaultRobots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*/admin/

Sitemap: ${baseUrl}/sitemap.xml`;

  let content = await getSetting("robots_txt_content", defaultRobots);
  if (content) {
    content = content.replace(/https?:\/\/(www\.)?ytsnap\.tech/g, "https://www.ytsnap.tech");
  }

  return new NextResponse(content || defaultRobots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
