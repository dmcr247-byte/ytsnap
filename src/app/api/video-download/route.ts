import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId } from "@/lib/youtube";

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

    const { Ytdl } = require("@distube/ytdl-core");
    const ytdl = new Ytdl();

    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
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

    const cleanTitle = (rawTitle || info.videoDetails?.title || "ytsnap-video")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);

    const ext = targetFormat.container || (targetFormat.hasVideo ? "mp4" : "mp3");
    const qualityLabel = targetFormat.qualityLabel || `${targetFormat.audioBitrate || 128}kbps`;
    const filename = `ytsnap-${cleanTitle}-${qualityLabel}.${ext}`;

    // If client requested direct redirect to Google CDN
    const redirectDirect = searchParams.get("redirect") === "true";
    if (redirectDirect) {
      return NextResponse.redirect(targetFormat.url);
    }

    // Proxy the stream with attachment headers
    const cdnRes = await fetch(targetFormat.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!cdnRes.ok || !cdnRes.body) {
      // Fallback to redirect if proxy stream blocked
      return NextResponse.redirect(targetFormat.url);
    }

    const headers = new Headers();
    headers.set("Content-Type", cdnRes.headers.get("content-type") || "video/mp4");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    if (cdnRes.headers.get("content-length")) {
      headers.set("Content-Length", cdnRes.headers.get("content-length")!);
    }
    headers.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(cdnRes.body as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Video download streaming error:", error);
    return new NextResponse("Failed to download video stream", { status: 500 });
  }
}
