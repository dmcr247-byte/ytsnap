import { NextRequest, NextResponse } from "next/server";
import { Ytdl, createPoTokenProvider } from "@distube/ytdl-core";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { checkRateLimit, hashIp } from "@/lib/security";
import prisma from "@/lib/prisma";
import { ProxyAgent } from "undici";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

let cachedPoTokenProvider: any = null;
let poTokenProviderPromise: Promise<any> | null = null;

async function getPoTokenProvider() {
  if (cachedPoTokenProvider) return cachedPoTokenProvider;
  if (!poTokenProviderPromise) {
    poTokenProviderPromise = createPoTokenProvider({ timeoutMs: 15000 })
      .then((provider) => {
        cachedPoTokenProvider = provider;
        return provider;
      })
      .catch((err) => {
        console.warn("PO token provider initialization note:", err?.message || err);
        poTokenProviderPromise = null;
        return null;
      });
  }
  return poTokenProviderPromise;
}

function getProxyDispatcher(): ProxyAgent | undefined {
  let proxyUrl =
    process.env.YOUTUBE_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.HTTPS_PROXY;

  if (!proxyUrl) {
    try {
      const pPath = path.join(process.cwd(), "proxies.txt");
      if (fs.existsSync(pPath)) {
        const lines = fs
          .readFileSync(pPath, "utf8")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 0) {
          const randomLine = lines[Math.floor(Math.random() * lines.length)];
          proxyUrl = randomLine.startsWith("http")
            ? randomLine
            : `http://${randomLine}`;
        }
      }
    } catch {
      // ignore
    }
  }

  if (proxyUrl) {
    try {
      return new ProxyAgent(proxyUrl);
    } catch (e) {
      console.warn("Invalid proxy configuration:", e);
    }
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  let lang = "en";
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

    const body = await req.json().catch(() => ({}));
    const url = body.url;
    if (body.lang) lang = body.lang;

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

    // Priority 0: RapidAPI extraction (completely immune to serverless IP bot walls)
    if (
      process.env.RAPIDAPI_KEY ||
      process.env.RAPID_API_KEY ||
      process.env.YOUTUBE_RAPIDAPI_KEY
    ) {
      try {
        const { fetchFromRapidAPI } = await import("@/lib/rapidapi-youtube");
        const rapidData = await fetchFromRapidAPI(videoId);
        if (rapidData && rapidData.videoFormats.length > 0) {
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
            data: rapidData,
          });
        }
      } catch (rErr) {
        console.warn("RapidAPI resolution attempt error:", rErr);
      }
    }

    let info: any = null;
    let lastError: any = null;

    const poTokenProvider = await getPoTokenProvider();
    const dispatcher = getProxyDispatcher();
    const customFetch = dispatcher
      ? ((url: any, init: any) => fetch(url, { ...init, dispatcher }))
      : undefined;

    // Strategic fallback client candidates:
    // 1. ["mweb", "web_embedded"]: Lowest bot detection, public streams
    // 2. ["tv"]: Samsung Tizen TV client
    // 3. ["visionos"]: Apple Vision client
    // 4. ["web_embedded"]: Third-party embedded player
    // 5. undefined: all default clients with PO Token
    const clientCandidates: (string[] | undefined)[] = [
      ["mweb", "web_embedded"],
      ["tv"],
      ["visionos"],
      ["web_embedded"],
      undefined,
    ];

    // Priority 1: Fetch without cookie (prevents "cookie signed out" error on all public videos)
    for (const clients of clientCandidates) {
      try {
        const ytdlOptions: any = {
          fetch: customFetch as any,
        };
        if (clients) {
          ytdlOptions.clients = clients;
        }
        if (poTokenProvider) {
          ytdlOptions.getPoToken = poTokenProvider;
        }
        const ytdl = new Ytdl(ytdlOptions);
        const candidateInfo = await ytdl.getInfo(videoId);
        if (candidateInfo && candidateInfo.formats && candidateInfo.formats.length > 0) {
          info = candidateInfo;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Client candidate [${clients ? clients.join(",") : "default"}] error:`, err?.message || err);
      }
    }

    // Priority 2: Optional cookie fallback only if without-cookie failed AND YOUTUBE_COOKIE is configured
    if (!info && process.env.YOUTUBE_COOKIE) {
      try {
        const cookieYtdl = new Ytdl({
          clients: ["web_embedded", "tv"] as any,
          cookie: process.env.YOUTUBE_COOKIE,
          fetch: customFetch as any,
        });
        const cookieInfo = await cookieYtdl.getInfo(videoId);
        if (cookieInfo && cookieInfo.formats && cookieInfo.formats.length > 0) {
          info = cookieInfo;
        }
      } catch (cErr: any) {
        // If cookie is expired/signed out, ignore cookie error and preserve meaningful error
        if (!cErr?.message?.includes("cookie") && !cErr?.message?.includes("signed out")) {
          lastError = cErr;
        }
      }
    }

    if (!info) {
      throw lastError || new Error("Failed to retrieve formats from video servers.");
    }

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
    const rawMsg = error?.message || "";
    const lowerMsg = rawMsg.toLowerCase();
    const isHindi = lang === "hi";

    let cleanMsg = "";
    if (lowerMsg.includes("unavailable") || lowerMsg.includes("not available") || lowerMsg.includes("404")) {
      cleanMsg = isHindi
        ? "यह YouTube वीडियो अनुपलब्ध (Unavailable), प्राइवेट या डिलीट कर दी गई है। कृपया किसी चालू वीडियो का लिंक डालें।"
        : "This YouTube video is unavailable, private, or has been deleted. Please try another public video link.";
    } else if (lowerMsg.includes("private")) {
      cleanMsg = isHindi
        ? "यह एक प्राइवेट वीडियो है। YTSnap केवल सार्वजनिक (Public) वीडियो को प्रोसेस कर सकता है।"
        : "This video is private. YTSnap can only process public YouTube videos.";
    } else if (lowerMsg.includes("age-restricted") || lowerMsg.includes("confirm your age")) {
      cleanMsg = isHindi
        ? "यह वीडियो आयु-प्रतिबंधित (Age-Restricted) है। YouTube इसके लिए सीधे साइन-इन मांगता है।"
        : "This video is age-restricted and requires signing in directly on YouTube.";
    } else if (lowerMsg.includes("bot") || lowerMsg.includes("sign in to confirm")) {
      cleanMsg = isHindi
        ? "YouTube सुरक्षा जांच (Bot Rate-Check) ट्रिगर हुई है। 100% स्थायी समाधान के लिए Vercel Environment Variables में RAPIDAPI_KEY या YOUTUBE_PROXY जोड़ें।"
        : "YouTube security rate-check triggered. Please configure RAPIDAPI_KEY or YOUTUBE_PROXY in Vercel to permanently bypass bot checks.";
    } else if (lowerMsg.includes("cookie") || lowerMsg.includes("signed out")) {
      cleanMsg = isHindi
        ? "वीडियो स्ट्रीम लोड करने में समस्या आई। कृपया वीडियो का लिंक जांचें या दूसरा वीडियो आज़माएं।"
        : "Unable to retrieve video stream. Please verify the URL or try another video.";
    } else {
      cleanMsg = isHindi
        ? "वीडियो स्ट्रीम लोड करने में समस्या आई। कृपया सुनिश्चित करें कि लिंक सही और वीडियो सार्वजनिक है।"
        : "Failed to retrieve video stream formats. Please verify the link.";
    }

    return NextResponse.json(
      {
        error: cleanMsg,
        debugDetails: rawMsg,
      },
      { status: 500 }
    );
  }
}
