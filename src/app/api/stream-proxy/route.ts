import { NextRequest, NextResponse } from "next/server";
import { Ytdl } from "@distube/ytdl-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const itagParam = searchParams.get("itag");
    const urlParam = searchParams.get("url");

    let streamUrl = "";

    // 1. If video ID and itag are provided, resolve fresh URL on this server
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      const itag = itagParam ? parseInt(itagParam, 10) : null;
      const ytdl = new Ytdl({ clients: ["mweb", "web_embedded"] });
      const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
      const format = itag
        ? (info.formats || []).find((f: any) => f.itag === itag)
        : (info.formats || [])[0];

      if (format && format.url) {
        streamUrl = format.url;
      }
    }

    // 2. Or fallback to provided url parameter
    if (!streamUrl && urlParam) {
      try {
        streamUrl = urlParam.startsWith("http%3A") || urlParam.startsWith("https%3A")
          ? decodeURIComponent(urlParam)
          : urlParam;
      } catch {
        streamUrl = urlParam;
      }
    }

    if (!streamUrl) {
      return new NextResponse("Missing stream source (id or url parameter required)", {
        status: 400,
      });
    }

    const parsed = new URL(streamUrl);
    if (!parsed.hostname.endsWith("googlevideo.com")) {
      return new NextResponse("Unauthorized media host", { status: 403 });
    }

    const range = req.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    if (range) {
      fetchHeaders["Range"] = range;
    }

    const cdnRes = await fetch(streamUrl, {
      headers: fetchHeaders,
    });

    const resHeaders = new Headers();
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    resHeaders.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
    resHeaders.set("Content-Type", cdnRes.headers.get("content-type") || "video/mp4");
    resHeaders.set("Accept-Ranges", "bytes");

    if (cdnRes.headers.get("content-length")) {
      resHeaders.set("Content-Length", cdnRes.headers.get("content-length")!);
    }
    if (cdnRes.headers.get("content-range")) {
      resHeaders.set("Content-Range", cdnRes.headers.get("content-range")!);
    }

    return new Response(cdnRes.body, {
      status: cdnRes.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error("Stream proxy error:", err);
    return new NextResponse(err.message || "Streaming error", { status: 500 });
  }
}
