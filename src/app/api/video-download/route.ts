import { NextRequest, NextResponse } from "next/server";
import { Ytdl } from "@distube/ytdl-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const itagParam = searchParams.get("itag");
    const formatParam = (searchParams.get("format") || "").toLowerCase();
    const rawTitle = searchParams.get("title") || "video";
    const streamUrl = searchParams.get("streamUrl");

    const cleanTitle = (rawTitle || "video")
      .replace(/[\\/:*?"<>|#]/g, "")
      .replace(/\s+/g, "_")
      .trim()
      .slice(0, 80) || "video";

    // Priority 1: Direct CDN Redirect (bypasses datacenter 403 & saves 100% server bandwidth)
    if (streamUrl && streamUrl.startsWith("http")) {
      const finalUrl = streamUrl.includes("&title=")
        ? streamUrl
        : `${streamUrl}&title=${encodeURIComponent(cleanTitle)}`;

      return NextResponse.redirect(finalUrl, 302);
    }

    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    // Priority 2: RapidAPI URL Resolution -> Redirect to client
    if (
      process.env.RAPIDAPI_KEY ||
      process.env.RAPID_API_KEY ||
      process.env.YOUTUBE_RAPIDAPI_KEY
    ) {
      try {
        const { fetchFromRapidAPI } = await import("@/lib/rapidapi-youtube");
        const rapid = await fetchFromRapidAPI(id);
        if (rapid) {
          const all = [
            ...rapid.videoFormats,
            ...rapid.audioFormats,
            ...rapid.mp3Formats,
          ];
          const itagNum = itagParam ? parseInt(itagParam, 10) : null;
          const match =
            (itagNum && all.find((f: any) => f.itag === itagNum)) ||
            (formatParam === "mp3" && rapid.audioFormats[0]) ||
            rapid.videoFormats[0];

          if (match && match.url) {
            const finalUrl = match.url.includes("&title=")
              ? match.url
              : `${match.url}&title=${encodeURIComponent(cleanTitle)}`;

            return NextResponse.redirect(finalUrl, 302);
          }
        }
      } catch (rErr) {
        console.warn("RapidAPI download resolve note:", rErr);
      }
    }

    // Priority 3: Fallback Ytdl extraction -> Redirect to stream
    let info: any = null;
    const clientCandidates: (string[] | undefined)[] = [
      ["mweb", "web_embedded"],
      ["tv", "visionos"],
      ["web_embedded"],
      undefined,
    ];

    for (const clients of clientCandidates) {
      try {
        const ytdl = new Ytdl(clients ? { clients: clients as any } : {});
        const res = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
        if (res && res.formats && res.formats.length > 0) {
          info = res;
          break;
        }
      } catch (err) {
        // continue
      }
    }

    if (!info || !info.formats || info.formats.length === 0) {
      return new NextResponse("Unable to load video stream info. Please try again.", {
        status: 502,
      });
    }

    const itag = itagParam ? parseInt(itagParam, 10) : null;
    const isAudioOnly = formatParam === "mp3" || formatParam === "m4a";

    let targetFormat: any = null;
    if (isAudioOnly) {
      targetFormat =
        info.formats.find((f: any) => f.itag === 140) ||
        info.formats
          .filter((f: any) => !f.hasVideo && f.hasAudio)
          .sort((a: any, b: any) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
    } else if (itag) {
      targetFormat = info.formats.find((f: any) => f.itag === itag);
    }

    if (!targetFormat) {
      targetFormat =
        info.formats.find((f: any) => f.hasVideo && f.hasAudio) ||
        info.formats.find((f: any) => f.hasVideo) ||
        info.formats[0];
    }

    if (!targetFormat || !targetFormat.url) {
      return new NextResponse("Requested format stream not available", { status: 404 });
    }

    const finalUrl = targetFormat.url.includes("&title=")
      ? targetFormat.url
      : `${targetFormat.url}&title=${encodeURIComponent(cleanTitle)}`;

    return NextResponse.redirect(finalUrl, 302);
  } catch (error: any) {
    console.error("Video download streaming error:", error);
    return new NextResponse(
      "Failed to stream video: " + (error?.message || "Unknown server error"),
      { status: 500 }
    );
  }
}
