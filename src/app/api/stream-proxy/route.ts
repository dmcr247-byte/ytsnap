import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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
  const urlParam = req.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl = urlParam;
  try {
    if (urlParam.startsWith("http%3A") || urlParam.startsWith("https%3A")) {
      targetUrl = decodeURIComponent(urlParam);
    }
  } catch {
    targetUrl = urlParam;
  }

  try {
    const parsed = new URL(targetUrl);
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

    const cdnRes = await fetch(targetUrl, {
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
    return new NextResponse(err.message || "Streaming error", { status: 500 });
  }
}
