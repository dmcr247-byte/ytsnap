import { extractYouTubeVideoId } from "./youtube";

export interface NormalizedVideoFormat {
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
}

export interface NormalizedAudioFormat {
  itag: number;
  audioBitrate: number;
  container: string;
  codecLabel: string;
  language: string;
  sizeMb?: string;
  url?: string;
  label: string;
}

export interface NormalizedMp3Preset {
  itag: number;
  qualityLabel: string;
  bitrate: number;
  container: string;
  sizeMb?: string;
  label: string;
  isAudioOnly: boolean;
  url?: string;
}

export interface NormalizedVideoDetails {
  id: string;
  title: string;
  author: string;
  channelUrl?: string;
  duration: string;
  durationSeconds: number;
  views: string;
  publishDate?: string;
  thumbnail: string;
  videoFormats: NormalizedVideoFormat[];
  audioFormats: NormalizedAudioFormat[];
  mp3Formats: NormalizedMp3Preset[];
}

function parseDurationSeconds(duration: any): number {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;
  const num = parseInt(String(duration), 10);
  if (!isNaN(num) && !String(duration).includes(":")) return num;

  const parts = String(duration).split(":").map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  return 0;
}

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function fetchFromRapidAPI(
  videoId: string
): Promise<NormalizedVideoDetails | null> {
  const apiKey =
    process.env.RAPIDAPI_KEY ||
    process.env.RAPID_API_KEY ||
    process.env.YOUTUBE_RAPIDAPI_KEY;

  if (!apiKey) {
    return null;
  }

  const host =
    process.env.RAPIDAPI_HOST || "yt-api.p.rapidapi.com";

  try {
    const endpoint = `https://${host}/dl?id=${encodeURIComponent(videoId)}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey.trim(),
        "x-rapidapi-host": host.trim(),
        "User-Agent": "YTSnap-Client/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`RapidAPI responded with HTTP ${res.status} from ${host}`);
      return null;
    }

    const rawData = await res.json().catch(() => null);
    if (!rawData) return null;

    // Handle various response wrappers from RapidAPI providers
    const payload = rawData.data || rawData;
    const title = payload.title || rawData.title || `YouTube Video (${videoId})`;
    const author =
      payload.channelTitle ||
      payload.author?.name ||
      rawData.channelTitle ||
      "YouTube Creator";
    const channelId = payload.channelId || rawData.channelId;
    const channelUrl = channelId
      ? `https://www.youtube.com/channel/${channelId}`
      : "https://www.youtube.com";

    const durationSeconds = parseDurationSeconds(
      payload.lengthSeconds || payload.duration || rawData.lengthSeconds
    );
    const duration = formatDuration(durationSeconds);
    const views = payload.viewCount
      ? parseInt(String(payload.viewCount), 10).toLocaleString()
      : "Unknown";
    const publishDate = payload.publishDate || rawData.publishDate || undefined;

    // Thumbnail selection
    let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const thumbs = payload.thumbnail || rawData.thumbnail;
    if (Array.isArray(thumbs) && thumbs.length > 0) {
      thumbnail = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || thumbnail;
    } else if (typeof thumbs === "string" && thumbs.startsWith("http")) {
      thumbnail = thumbs;
    }

    const allFormats: any[] = [
      ...(Array.isArray(payload.formats) ? payload.formats : []),
      ...(Array.isArray(payload.adaptiveFormats) ? payload.adaptiveFormats : []),
      ...(Array.isArray(rawData.formats) ? rawData.formats : []),
      ...(Array.isArray(rawData.adaptiveFormats) ? rawData.adaptiveFormats : []),
    ];

    if (allFormats.length === 0) {
      return null;
    }

    const videoFormats: NormalizedVideoFormat[] = [];
    const audioFormats: NormalizedAudioFormat[] = [];
    const seenVideoKeys = new Set<string>();
    let primaryAudioUrl: string | undefined = undefined;

    for (const f of allFormats) {
      const itag = parseInt(String(f.itag), 10) || 0;
      const mime = (f.mimeType || f.type || "").toLowerCase();
      const isVideo =
        f.hasVideo !== undefined
          ? Boolean(f.hasVideo)
          : mime.includes("video") || Boolean(f.qualityLabel || f.quality || f.height);
      const isAudio =
        f.hasAudio !== undefined
          ? Boolean(f.hasAudio)
          : mime.includes("audio") || Boolean(f.audioBitrate || f.audioQuality);

      const lengthBytes = parseInt(String(f.contentLength || f.size || 0), 10);
      const sizeMb =
        lengthBytes > 0 ? (lengthBytes / (1024 * 1024)).toFixed(2) + " MB" : undefined;

      const rawContainer =
        f.container ||
        (mime.includes("webm")
          ? "webm"
          : mime.includes("mp4") || mime.includes("m4a")
          ? "mp4"
          : "mp4");
      const containerUpper = rawContainer.toUpperCase();

      if (isVideo) {
        const qualityLabel =
          f.qualityLabel ||
          (f.height ? `${f.height}p` : f.quality ? `${f.quality}` : "720p");
        const audioKey = isAudio ? "withaudio" : "videoonly";
        const key = `${qualityLabel}-${containerUpper}-${audioKey}`;

        if (!seenVideoKeys.has(key)) {
          seenVideoKeys.add(key);
          videoFormats.push({
            itag: itag || 18,
            qualityLabel,
            container: containerUpper,
            resolution: qualityLabel,
            fps: f.fps ? parseInt(String(f.fps), 10) : undefined,
            sizeMb,
            hasAudio: isAudio,
            hasVideo: true,
            isRecommended: isAudio,
            url: f.url,
            label: `${qualityLabel} ${containerUpper}${sizeMb ? ` · ${sizeMb}` : ""}${
              isAudio ? " — Recommended" : ""
            }`,
          });
        }
      }

      if (isAudio && !isVideo) {
        if (!primaryAudioUrl && f.url) {
          primaryAudioUrl = f.url;
        }

        const audioBitrate =
          f.audioBitrate ||
          Math.round((f.bitrate || 0) / 1000) ||
          128;
        const codecLabel = mime.includes("opus")
          ? "Opus Audio"
          : mime.includes("m4a") || mime.includes("mp4a")
          ? "M4A Audio"
          : "Audio";

        audioFormats.push({
          itag: itag || 140,
          audioBitrate,
          container: rawContainer.toLowerCase() === "m4a" ? "m4a" : "mp3",
          codecLabel,
          language: "Original Audio",
          sizeMb,
          url: f.url,
          label: `${codecLabel} · ${audioBitrate} kbps${sizeMb ? ` · ${sizeMb}` : ""}`,
        });
      }
    }

    // Sort video formats (with audio first, resolution desc)
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

    // Sort audio formats (bitrate desc)
    audioFormats.sort((a, b) => b.audioBitrate - a.audioBitrate);

    // Generate MP3 presets
    const mp3Presets = [320, 192, 128, 64];
    const mp3Formats: NormalizedMp3Preset[] = mp3Presets.map((kbps) => {
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
        url: primaryAudioUrl,
      };
    });

    return {
      id: videoId,
      title,
      author,
      channelUrl,
      duration,
      durationSeconds,
      views,
      publishDate,
      thumbnail,
      videoFormats,
      audioFormats,
      mp3Formats,
    };
  } catch (err: any) {
    console.error("fetchFromRapidAPI error:", err?.message || err);
    return null;
  }
}
