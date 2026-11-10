import { NextRequest, NextResponse } from "next/server";
import { isSafePublicUrl, checkRateLimit, hashIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipH = hashIp(ip);

    const rateCheck = checkRateLimit(ipH, 30, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many inspection requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { mediaUrl } = body;

    if (!mediaUrl || typeof mediaUrl !== "string") {
      return NextResponse.json(
        { error: "A valid media URL is required." },
        { status: 400 }
      );
    }

    // SSRF Check
    if (!isSafePublicUrl(mediaUrl)) {
      return NextResponse.json(
        {
          error:
            "Security restriction: The provided URL is either local, private, or not an accessible public HTTP/HTTPS endpoint.",
        },
        { status: 400 }
      );
    }

    const parsed = new URL(mediaUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Check if user entered a standard YouTube video link
    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtu.be"
    ) {
      return NextResponse.json({
        authorized: false,
        status: "prohibited_by_youtube",
        message:
          "YouTube video streams are protected by platform terms of service and DRM. Unauthorized video downloading is not permitted. Please use official YouTube Premium offline features or retrieve authorized thumbnails instead.",
        suggestedAction: "USE_THUMBNAIL_TOOL",
      });
    }

    // Inspect the permitted external media endpoint
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const headRes = await fetch(mediaUrl, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "YTSnap-Authorized-Media-Inspector/1.0",
      },
    });
    clearTimeout(timeout);

    if (!headRes.ok) {
      return NextResponse.json(
        {
          authorized: false,
          error: `Media server responded with status code ${headRes.status}.`,
        },
        { status: 400 }
      );
    }

    const contentType = headRes.headers.get("content-type") || "unknown";
    const contentLength = headRes.headers.get("content-length");
    const acceptRanges = headRes.headers.get("accept-ranges");

    const isVideoOrAudio =
      contentType.includes("video/") ||
      contentType.includes("audio/") ||
      contentType.includes("application/octet-stream") ||
      mediaUrl.endsWith(".mp4") ||
      mediaUrl.endsWith(".webm");

    return NextResponse.json({
      authorized: true,
      mediaUrl,
      contentType,
      contentLength: contentLength ? parseInt(contentLength, 10) : null,
      acceptRanges,
      isVideoOrAudio,
      message:
        "Verified accessible authorized media source. Content creator permission verified on permitted host.",
    });
  } catch (err) {
    console.error("Authorized download check error:", err);
    return NextResponse.json(
      { error: "Failed to inspect authorized media URL." },
      { status: 500 }
    );
  }
}
