import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultRobots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*/admin/

Sitemap: ${baseUrl}/sitemap.xml`;

  const content = await getSetting("robots_txt_content", defaultRobots);

  return new NextResponse(content || defaultRobots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
