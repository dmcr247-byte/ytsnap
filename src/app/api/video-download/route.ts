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

    // Shortcut 1: Stream directly from resolved CDN URL (zero bot-check overhead)
    if (streamUrl && streamUrl.startsWith("http")) {
      const isAudioOnly = formatParam === "mp3" || formatParam === "m4a";
      const extension = isAudioOnly ? "mp3" : "mp4";
      const cleanTitle =
        (rawTitle || "ytsnap_download")
          .replace(/[\\/:*?"<>|#]/g, "")
          .replace(/\s+/g, "_")
          .trim()
          .slice(0, 80) || "video";
      const filename = `${cleanTitle}.${extension}`;

      const fetchHeaders: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };
      const range = req.headers.get("range");
      if (range) {
        fetchHeaders["Range"] = range;
      }

      const cdnRes = await fetch(streamUrl, { headers: fetchHeaders });
      if (!cdnRes.ok && cdnRes.status !== 206) {
        return new NextResponse(
          `Failed to retrieve media stream from source (HTTP ${cdnRes.status})`,
          { status: cdnRes.status }
        );
      }

      const resHeaders = new Headers();
      const contentType = isAudioOnly
        ? "audio/mpeg"
        : cdnRes.headers.get("content-type") || "video/mp4";

      resHeaders.set("Content-Type", contentType);
      resHeaders.set(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      resHeaders.set("Accept-Ranges", "bytes");
      resHeaders.set("Cache-Control", "public, max-age=3600");

      if (cdnRes.headers.get("content-length")) {
        resHeaders.set("Content-Length", cdnRes.headers.get("content-length")!);
      }
      if (cdnRes.headers.get("content-range")) {
        resHeaders.set("Content-Range", cdnRes.headers.get("content-range")!);
      }

      return new Response(cdnRes.body, {
        status: cdnRes.status === 206 ? 206 : 200,
        headers: resHeaders,
      });
    }

    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    let info: any = null;

    // Shortcut 2: Try RapidAPI if key is configured
    if (process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY || process.env.YOUTUBE_RAPIDAPI_KEY) {
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
            info = {
              videoDetails: { title: rapid.title },
              formats: [{ ...match, url: match.url }],
            };
          }
        }
      } catch (rErr) {
        console.warn("RapidAPI download resolve note:", rErr);
      }
    }

    // Shortcut 3: Direct ytdl extraction
    if (!info) {
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

    const isAudio = !targetFormat.hasVideo && targetFormat.hasAudio;
    let extension = isAudio
      ? (formatParam === "mp3" ? "mp3" : (targetFormat.container || "mp3"))
      : (targetFormat.container || "mp4").toLowerCase();

    const cleanTitle = (rawTitle || info.videoDetails?.title || "ytsnap_download")
      .replace(/[\\/:*?"<>|#]/g, "")
      .replace(/\s+/g, "_")
      .trim()
      .slice(0, 80) || "video";

    const filename = `${cleanTitle}.${extension}`;

    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const range = req.headers.get("range");
    if (range) {
      fetchHeaders["Range"] = range;
    }

    const cdnRes = await fetch(targetFormat.url, {
      headers: fetchHeaders,
    });

    if (!cdnRes.ok && cdnRes.status !== 206) {
      return new NextResponse(
        `Failed to retrieve media stream from source (HTTP ${cdnRes.status})`,
        { status: cdnRes.status }
      );
    }

    const resHeaders = new Headers();
    const contentType = isAudio
      ? (extension === "mp3" ? "audio/mpeg" : (cdnRes.headers.get("content-type") || "audio/mp4"))
      : (cdnRes.headers.get("content-type") || "video/mp4");

    resHeaders.set("Content-Type", contentType);
    resHeaders.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    resHeaders.set("Accept-Ranges", "bytes");
    resHeaders.set("Cache-Control", "public, max-age=3600");

    if (cdnRes.headers.get("content-length")) {
      resHeaders.set("Content-Length", cdnRes.headers.get("content-length")!);
    }
    if (cdnRes.headers.get("content-range")) {
      resHeaders.set("Content-Range", cdnRes.headers.get("content-range")!);
    }

    return new Response(cdnRes.body, {
      status: cdnRes.status === 206 ? 206 : 200,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("Video download streaming error:", error);
    return new NextResponse(
      "Failed to stream video: " + (error?.message || "Unknown server error"),
      { status: 500 }
    );
  }
}
