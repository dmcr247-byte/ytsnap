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
        { error: "Too many requests. Please wait a minute before analyzing more videos." },
        { status: 429 }
      );
    }

    const { url, lang = "en" } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Please enter a valid YouTube video URL." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please provide a standard watch link or short URL." },
        { status: 400 }
      );
    }

    const ytdl = new Ytdl({
      clients: ["tv", "visionos"],
    });

    const info = await ytdl.getInfo(videoId);

    const details = info.videoDetails;
    const durationSeconds = details.lengthSeconds ? parseInt(String(details.lengthSeconds), 10) : 0;

    // Filter & categorize formats
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
      label: string;
    }> = [];

    const audioFormats: Array<{
      itag: number;
      audioBitrate: number;
      container: string;
      codecLabel: string;
      language: string;
      sizeMb?: string;
      url?: string;
      label: string;
    }> = [];

    const seenVideoKeys = new Set<string>();

    for (const f of info.formats || []) {
      const lengthBytes = f.contentLength ? parseInt(String(f.contentLength), 10) : 0;
      const sizeMb =
        lengthBytes > 0 ? (lengthBytes / (1024 * 1024)).toFixed(2) + " MB" : undefined;
      const containerUpper = (f.container || "mp4").toUpperCase();

      if (f.hasVideo && f.qualityLabel) {
        const audioKey = f.hasAudio ? "withaudio" : "videoonly";
        const key = `${f.qualityLabel}-${containerUpper}-${audioKey}`;

        if (!seenVideoKeys.has(key)) {
          seenVideoKeys.add(key);
          videoFormats.push({
            itag: f.itag,
            qualityLabel: f.qualityLabel,
            container: containerUpper,
            resolution: f.qualityLabel,
            fps: f.fps,
            sizeMb,
            hasAudio: Boolean(f.hasAudio),
            hasVideo: true,
            isRecommended: Boolean(f.hasAudio),
            url: f.url,
            label: `${f.qualityLabel} ${containerUpper}${sizeMb ? ` · ${sizeMb}` : ""}${
              f.hasAudio ? " — Recommended" : ""
            }`,
          });
        }
      } else if (!f.hasVideo && f.hasAudio) {
        const audioBitrate = f.audioBitrate || Math.round((f.bitrate || 0) / 1000) || 128;
        const codecName = (f.audioCodec || "").toLowerCase().includes("opus")
          ? "Opus Audio"
          : (f.container?.toLowerCase() === "m4a" || (f.audioCodec || "").includes("mp4a")
          ? "M4A Audio"
          : "Audio");

        const language =
          f.audioTrack?.displayName ||
          (f.audioTrack?.audioIsDefault ? "Hindi (original)" : "Original Audio");

        audioFormats.push({
          itag: f.itag,
          audioBitrate,
          container: f.container || "mp3",
          codecLabel: codecName,
          language,
          sizeMb,
          url: f.url,
          label: `${codecName} · ${audioBitrate} kbps${sizeMb ? ` · ${sizeMb}` : ""}`,
        });
      }
    }

    // Sort video formats:
    // 1. Video + Audio progressive formats first (e.g. 360p)
    // 2. Video-only DASH formats by resolution descending (1080p -> 720p -> 480p -> 360p -> 240p -> 144p)
    // 3. For identical resolution: WEBM first then MP4 (matching SnapYT)
    videoFormats.sort((a, b) => {
      if (a.hasAudio && !b.hasAudio) return -1;
      if (!a.hasAudio && b.hasAudio) return 1;

      const aRes = parseInt(a.qualityLabel, 10) || 0;
      const bRes = parseInt(b.qualityLabel, 10) || 0;
      if (bRes !== aRes) return bRes - aRes;

      if (a.container === "WEBM" && b.container !== "WEBM") return -1;
      if (a.container !== "WEBM" && b.container === "WEBM") return 1;
      return 0;
    });

    // Sort audio formats:
    // Group by language, then bitrate descending
    audioFormats.sort((a, b) => {
      if (a.language !== b.language) {
        if (a.language.includes("Hindi") || a.language.includes("original")) return -1;
        if (b.language.includes("Hindi") || b.language.includes("original")) return 1;
        return a.language.localeCompare(b.language);
      }
      return b.audioBitrate - a.audioBitrate;
    });

    // Generate MP3 presets matching SnapYT calculations
    const mp3Presets = [320, 192, 128, 64];
    const mp3Formats = mp3Presets.map((kbps) => {
      const approxBytes = durationSeconds > 0 ? (kbps * 1000 * durationSeconds) / 8 : 0;
      const approxMb =
        approxBytes > 0 ? (approxBytes / (1024 * 1024)).toFixed(2) + " MB" : undefined;
      return {
        itag: -kbps,
        qualityLabel: `MP3 · ${kbps} kbps`,
        bitrate: kbps,
        container: "mp3",
        sizeMb: approxMb ? `≈ ${approxMb}` : undefined,
        label: `MP3 · ${kbps} kbps${approxMb ? ` ≈ ${approxMb}` : ""}`,
        isAudioOnly: true,
      };
    });

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
        channelUrl: (details.author as any)?.channel_url || (details.author as any)?.user_url,
        duration: durationSeconds
          ? `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60)
              .toString()
              .padStart(2, "0")}`
          : "Unknown",
        durationSeconds,
        views: details.viewCount
          ? parseInt(String(details.viewCount), 10).toLocaleString()
          : "Unknown",
        publishDate: details.publishDate,
        thumbnail:
          details.thumbnails?.[details.thumbnails.length - 1]?.url ||
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        videoFormats,
        audioFormats,
        mp3Formats,
      },
    });
  } catch (error: any) {
    console.error("Video formats fetch error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to retrieve video stream formats. Please verify the link.",
      },
      { status: 500 }
    );
  }
}
