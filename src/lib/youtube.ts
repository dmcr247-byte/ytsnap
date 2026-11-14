export interface ThumbnailItem {
  key: "maxresdefault" | "sddefault" | "hqdefault" | "mqdefault" | "default";
  name: string;
  width: number;
  height: number;
  url: string;
  available: boolean;
  contentLength?: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  authorName: string;
  authorUrl?: string;
  thumbnailUrl: string;
  embedHtml?: string;
  description?: string;
  publishedAt?: string;
  duration?: string;
  durationSeconds?: number;
  viewCount?: string;
  viewCountNumber?: number;
  keywords?: string[];
  category?: string;
  thumbnails: ThumbnailItem[];
}

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-character alphanumeric video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Handle youtu.be shortlinks
    const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return youtuBeMatch[1];
    }

    // Handle standard watch URLs
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }

    // Handle /shorts/
    const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) {
      return shortsMatch[1];
    }

    // Handle /embed/
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }

    // Handle /v/
    const vMatch = trimmed.match(/\/v\/([a-zA-Z0-9_-]{11})/i);
    if (vMatch && vMatch[1]) {
      return vMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export async function checkThumbnailAvailability(
  url: string,
  key: string
): Promise<{ available: boolean; size?: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { available: false };
    }

    const contentLength = Number(res.headers.get("content-length") || "0");

    // YouTube returns a tiny 120x90 placeholder gif/jpg (~1097 bytes) when maxresdefault is not generated
    if (key === "maxresdefault" && contentLength > 0 && contentLength < 2000) {
      return { available: false, size: contentLength };
    }

    return { available: true, size: contentLength };
  } catch {
    return { available: false };
  }
}

export async function getThumbnailDetails(videoId: string): Promise<ThumbnailItem[]> {
  const configs: Array<{
    key: "maxresdefault" | "sddefault" | "hqdefault" | "mqdefault" | "default";
    name: string;
    width: number;
    height: number;
  }> = [
    {
      key: "maxresdefault",
      name: "Maximum Resolution (HD)",
      width: 1280,
      height: 720,
    },
    {
      key: "sddefault",
      name: "Standard Definition (SD)",
      width: 640,
      height: 480,
    },
    {
      key: "hqdefault",
      name: "High Quality (HQ)",
      width: 480,
      height: 360,
    },
    {
      key: "mqdefault",
      name: "Medium Quality (MQ)",
      width: 320,
      height: 180,
    },
    {
      key: "default",
      name: "Default Thumbnail",
      width: 120,
      height: 90,
    },
  ];

  const results = await Promise.all(
    configs.map(async (cfg) => {
      const url = `https://img.youtube.com/vi/${videoId}/${cfg.key}.jpg`;
      const check = await checkThumbnailAvailability(url, cfg.key);
      return {
        key: cfg.key,
        name: cfg.name,
        width: cfg.width,
        height: cfg.height,
        url,
        available: check.available,
        contentLength: check.size,
      };
    })
  );

  return results;
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

export async function fetchYouTubeMetadata(videoId: string): Promise<VideoMetadata> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    watchUrl
  )}&format=json`;

  let title = `YouTube Video (${videoId})`;
  let authorName = "YouTube Creator";
  let authorUrl = `https://www.youtube.com`;
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  let embedHtml = `<iframe width="100%" height="360" src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  let description: string | undefined;
  let publishedAt: string | undefined;
  let duration: string | undefined;
  let durationSeconds: number | undefined;
  let viewCount: string | undefined;
  let viewCountNumber: number | undefined;
  let keywords: string[] | undefined;
  let category: string | undefined;

  try {
    const res = await fetch(oEmbedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) authorName = data.author_name;
      if (data.author_url) authorUrl = data.author_url;
      if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      if (data.html) embedHtml = data.html;
    }
  } catch (err) {
    console.error("oEmbed fetch error:", err);
  }

  const thumbnails = await getThumbnailDetails(videoId);

  return {
    id: videoId,
    title,
    authorName,
    authorUrl,
    thumbnailUrl,
    embedHtml,
    description,
    publishedAt,
    duration,
    durationSeconds,
    viewCount,
    viewCountNumber,
    keywords,
    category,
    thumbnails,
  };
}
