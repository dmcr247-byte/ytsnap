import { NextRequest, NextResponse } from "next/server";
import { Ytdl } from "@distube/ytdl-core";
import { getProxyAgent, getRandomProxy, getProxyList, fetchWithProxy } from "@/lib/youtube-proxy";
import { fetch as undiciFetch } from "undici";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function streamResponse(
  cdnRes: any,
  filename: string,
  isAudio: boolean
): Response {
  const resHeaders = new Headers();
  const contentType = isAudio
    ? "audio/mpeg"
    : cdnRes.headers?.get?.("content-type") || "video/mp4";

  resHeaders.set("Content-Type", contentType);
  resHeaders.set(
    "Content-Disposition",
    `attachment; filename="${filename.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  resHeaders.set("Accept-Ranges", "bytes");
  resHeaders.set("Cache-Control", "public, max-age=3600");

  const contentLength = cdnRes.headers?.get?.("content-length");
  if (contentLength) {
    resHeaders.set("Content-Length", contentLength);
  }
  const contentRange = cdnRes.headers?.get?.("content-range");
  if (contentRange) {
    resHeaders.set("Content-Range", contentRange);
  }

  return new Response(cdnRes.body, {
    status: cdnRes.status === 206 ? 206 : 200,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const itagParam = searchParams.get("itag");
    const formatParam = (searchParams.get("format") || "").toLowerCase();
    const rawTitle = searchParams.get("title") || "video";
    const streamUrl = searchParams.get("streamUrl");

    const cleanTitle =
      (rawTitle || "video")
        .replace(/[\\/:*?"<>|#]/g, "")
        .replace(/\s+/g, "_")
        .trim()
        .slice(0, 80) || "video";

    const isAudioOnly = formatParam === "mp3" || formatParam === "m4a";
    const defaultExtension = isAudioOnly ? "mp3" : "mp4";
    const defaultFilename = `${cleanTitle}.${defaultExtension}`;

    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    const range = req.headers.get("range");
    if (range) {
      fetchHeaders["Range"] = range;
    }

    // 1. If streamUrl is provided, attempt direct streaming through matching proxy
    if (streamUrl && streamUrl.startsWith("http")) {
      try {
        const cdnRes = await fetchWithProxy(streamUrl, { headers: fetchHeaders });
        if (cdnRes.ok || cdnRes.status === 206) {
          return streamResponse(cdnRes, defaultFilename, isAudioOnly);
        }
      } catch (streamErr) {
        console.warn("Direct streamUrl fetch note, falling back to id resolution:", streamErr);
      }
    }

    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    // 2. High-performance format resolution and streaming via unified residential proxy
    const proxyList = getProxyList();
    const clientCandidates: (string[] | undefined)[] = [
      ["mweb", "web_embedded"],
      ["tv"],
      ["visionos"],
      ["web_embedded"],
      undefined,
    ];

    let lastError: any = null;

    for (const proxyUrl of proxyList) {
      try {
        const proxyAgent = getProxyAgent(proxyUrl);
        const proxyFetch = (url: any, init: any) =>
          undiciFetch(url, { ...init, dispatcher: proxyAgent });

        let info: any = null;
        for (const clients of clientCandidates) {
          try {
            const ytdl = new Ytdl({
              fetch: proxyFetch as any,
              ...(clients ? { clients: clients as any } : {}),
            });
            const res = await ytdl.getInfo(id);
            if (res && res.formats && res.formats.length > 0) {
              info = res;
              break;
            }
          } catch (cErr) {
            // try next client candidate
          }
        }

        if (!info || !info.formats || info.formats.length === 0) {
          continue;
        }

        const itag = itagParam ? parseInt(itagParam, 10) : null;
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
          continue;
        }

        // Fetch stream through the EXACT SAME proxy agent that resolved it (IP match guaranteed)
        const cdnRes = await undiciFetch(targetFormat.url, {
          dispatcher: proxyAgent,
          headers: fetchHeaders,
        });

        if (cdnRes.ok || cdnRes.status === 206) {
          const targetExt = isAudioOnly
            ? "mp3"
            : (targetFormat.container || "mp4").toLowerCase();
          return streamResponse(cdnRes, `${cleanTitle}.${targetExt}`, isAudioOnly);
        }
      } catch (proxyLoopErr) {
        lastError = proxyLoopErr;
        console.warn("Proxy resolution cycle note:", proxyLoopErr);
      }
    }

    return new NextResponse(
      "Unable to stream video content from CDN. Please refresh and try again.",
      { status: 502 }
    );
  } catch (error: any) {
    console.error("Video download streaming error:", error);
    return new NextResponse(
      "Failed to stream video: " + (error?.message || "Unknown server error"),
      { status: 500 }
    );
  }
}
