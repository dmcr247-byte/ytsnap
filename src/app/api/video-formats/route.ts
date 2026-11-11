import { NextRequest, NextResponse } from "next/server";
import { Ytdl } from "@distube/ytdl-core";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { checkRateLimit, hashIp } from "@/lib/security";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipH = hashIp(ip);

    const rateCheck = checkRateLimit(`video-formats-${ipH}`, 60, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { url, lang = "en" } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid YouTube video URL or ID is required." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format. Please provide a valid watch, short, or youtu.be link." },
        { status: 400 }
      );
    }

    // Load Ytdl prioritizing clients that provide combined Video + Audio streams (mweb, tv, web_embedded)
    // with visionos fallback to prevent cipher issues while ensuring formats with sound are included.
    let ytdl = new Ytdl({ clients: ["mweb", "tv", "web_embedded", "visionos"] });

    let info: any;
    try {
      info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    } catch {
      // Fallback directly to VisionOS client alone
      const fallbackYtdl = new Ytdl({ clients: ["visionos"] });
      info = await fallbackYtdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    }
    const details = info.videoDetails;

    // Filter and normalize formats
    const videoFormats: Array<{
      itag: number;
      qualityLabel: string;
      container: string;
      resolution: string;
      fps?: number;
      sizeMb?: string;
      hasAudio: boolean;
      hasVideo: boolean;
      isRecommended?: boolean;
      url?: string;
    }> = [];

    const audioFormats: Array<{
      itag: number;
      audioBitrate?: number;
      container: string;
      sizeMb?: string;
      url?: string;
    }> = [];

    const seenLabels = new Set<string>();

    for (const f of info.formats || []) {
      const lengthBytes = f.contentLength ? parseInt(f.contentLength, 10) : 0;
      const sizeMb = lengthBytes > 0 ? (lengthBytes / (1024 * 1024)).toFixed(1) + " MB" : undefined;

      if (f.hasVideo && f.qualityLabel) {
        // Distinguish formats with audio from video-only DASH streams
        const audioKey = f.hasAudio ? "withaudio" : "videoonly";
        const key = `${f.qualityLabel}-${f.container}-${audioKey}`;
        if (!seenLabels.has(key)) {
          seenLabels.add(key);
          videoFormats.push({
            itag: f.itag,
            qualityLabel: f.qualityLabel,
            container: f.container || "mp4",
            resolution: f.qualityLabel,
            fps: f.fps,
            sizeMb,
            hasAudio: Boolean(f.hasAudio),
            hasVideo: true,
            isRecommended: Boolean(f.hasAudio),
            url: f.url,
          });
        }
      } else if (!f.hasVideo && f.hasAudio && f.audioBitrate) {
        audioFormats.push({
          itag: f.itag,
          audioBitrate: f.audioBitrate,
          container: f.container === "m4a" ? "m4a" : "mp3",
          sizeMb,
          url: f.url,
        });
      }
    }

    // Sort video formats:
    // 1. Formats with audio first (so users immediately get playable video with sound)
    // 2. Then highest resolution to lowest
    videoFormats.sort((a, b) => {
      if (a.hasAudio && !b.hasAudio) return -1;
      if (!a.hasAudio && b.hasAudio) return 1;
      const aRes = parseInt(a.qualityLabel, 10) || 0;
      const bRes = parseInt(b.qualityLabel, 10) || 0;
      return bRes - aRes;
    });

    // Sort audio formats from highest bitrate to lowest
    audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

    // Asynchronously log tool usage
    try {
      await prisma.toolUsage.create({
        data: {
          toolKey: "youtube-video-downloader",
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
      data: {
        id: videoId,
        title: details.title,
        author: details.author?.name || "YouTube Creator",
        channelUrl: details.author?.channel_url,
        duration: details.lengthSeconds ? `${Math.floor(parseInt(details.lengthSeconds, 10) / 60)}:${(parseInt(details.lengthSeconds, 10) % 60).toString().padStart(2, "0")}` : "Unknown",
        views: details.viewCount ? parseInt(details.viewCount, 10).toLocaleString() : "Unknown",
        publishDate: details.publishDate,
        thumbnail: details.thumbnails?.[details.thumbnails.length - 1]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        videoFormats: videoFormats.slice(0, 8),
        audioFormats: audioFormats.slice(0, 3),
      },
    });
  } catch (error: any) {
    console.error("Video formats fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve video stream formats. Please verify the link." },
      { status: 500 }
    );
  }
}
