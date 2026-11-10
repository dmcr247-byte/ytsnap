import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId, fetchYouTubeMetadata } from "@/lib/youtube";
import { checkRateLimit, hashIp } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipH = hashIp(ip);

    const rateCheck = checkRateLimit(ipH, 60, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { url, lang = "en" } = body;

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL or ID is required." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL provided." },
        { status: 400 }
      );
    }

    const meta = await fetchYouTubeMetadata(videoId);

    // Asynchronously log tool usage
    try {
      await prisma.toolUsage.create({
        data: {
          toolKey: "video-information",
          language: lang,
          videoId,
          status: "success",
          ipHash: ipH,
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    } catch (e) {
      console.warn("Log warning:", e);
    }

    return NextResponse.json({
      success: true,
      data: meta,
      complianceNotice: {
        isDirectDownloadAllowed: false,
        reason:
          "YouTube Terms of Service explicitly prohibit unauthorized downloading of copyrighted video streams. MediaSnap does not circumvent DRM or provide unauthorized download links.",
        officialOption:
          "For offline viewing, use the official YouTube mobile app with a YouTube Premium subscription.",
      },
    });
  } catch (error) {
    console.error("Video Info API error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve video information. Please try again." },
      { status: 500 }
    );
  }
}
