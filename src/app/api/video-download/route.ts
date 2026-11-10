import { NextRequest, NextResponse } from "next/server";
import { Ytdl } from "@distube/ytdl-core";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const itagParam = searchParams.get("itag");
    const rawTitle = searchParams.get("title") || "video";

    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    let ytdl = new Ytdl({ clients: ["visionos", "tv", "mweb"] });

    let info: any;
    try {
      info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    } catch {
      const fallbackYtdl = new Ytdl({ clients: ["visionos"] });
      info = await fallbackYtdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    }
    const itag = itagParam ? parseInt(itagParam, 10) : null;

    let targetFormat = null;
    if (itag) {
      targetFormat = (info.formats || []).find((f: any) => f.itag === itag);
    }

    if (!targetFormat) {
      // Fallback to highest quality format with both video and audio, or best available
      targetFormat =
        (info.formats || []).find((f: any) => f.hasVideo && f.hasAudio) ||
        (info.formats || [])[0];
    }

    if (!targetFormat || !targetFormat.url) {
      return new NextResponse("Requested format not available", { status: 404 });
    }

    // Direct 307 Temporary Redirect to Google CDN stream.
    // Bypasses Vercel Serverless Function 4.5MB payload limit and 10s execution timeout,
    // streaming directly from Google's high-speed CDN to user's browser.
    return NextResponse.redirect(targetFormat.url, 307);
  } catch (error: any) {
    console.error("Video download streaming error:", error);
    return new NextResponse(
      "Failed to retrieve video stream: " + (error?.message || "Unknown error"),
      { status: 500 }
    );
  }
}
