import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const defaultAdsTxt = `# MediaSnap Ads.txt
# Add your Google AdSense publisher line here from Admin Dashboard:
# Example: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`;

  const content = await getSetting("ads_txt_content", defaultAdsTxt);

  return new NextResponse(content || defaultAdsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
