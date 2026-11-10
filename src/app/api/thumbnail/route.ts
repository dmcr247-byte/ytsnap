import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId, fetchYouTubeMetadata } from "@/lib/youtube";
import { checkRateLimit, hashIp } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipH = hashIp(ip);

    // Rate Limiting (60 requests per minute)
    const rateCheck = checkRateLimit(ipH, 60, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { url, lang = "en" } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid YouTube URL or Video ID is required." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "Invalid YouTube URL format. Please provide a link like youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/...",
        },
        { status: 400 }
      );
    }

    const metadata = await fetchYouTubeMetadata(videoId);

    // Asynchronously log tool usage
    try {
      await prisma.toolUsage.create({
        data: {
          toolKey: "thumbnail-downloader",
          language: lang,
          videoId,
          status: "success",
          ipHash: ipH,
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    } catch (logErr) {
      console.warn("Tool usage log warning:", logErr);
    }

    return NextResponse.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error("Thumbnail API error:", error);
    return NextResponse.json(
      { error: "Failed to inspect YouTube thumbnail. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
