import { Ytdl } from "@distube/ytdl-core";
import { VideoMetadata, getThumbnailDetails } from "./youtube";

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

  // 1. Primary Rich Extraction via Ytdl (server-side only)
  try {
    const ytdl = new Ytdl({ clients: ["mweb", "web_embedded"] });
    const info = await ytdl.getInfo(watchUrl);
    if (info && info.videoDetails) {
      const d = info.videoDetails;
      title = d.title || title;
      authorName = d.author?.name || authorName;
      authorUrl = (d.author as any)?.channel_url || (d.author as any)?.user_url || `https://www.youtube.com`;
      description = d.description || undefined;
      publishedAt = d.publishDate || undefined;
      category = d.category || undefined;
      if (d.keywords && Array.isArray(d.keywords) && d.keywords.length > 0) {
        keywords = d.keywords;
      }
      if (d.lengthSeconds) {
        durationSeconds = parseInt(String(d.lengthSeconds), 10);
        duration = formatDuration(durationSeconds);
      }
      if (d.viewCount) {
        viewCountNumber = parseInt(String(d.viewCount), 10);
        viewCount = Number(d.viewCount).toLocaleString();
      }
    }
  } catch (err) {
    console.warn("Ytdl metadata note, falling back to oEmbed:", err);
  }

  // 2. Fallback / Fill with oEmbed if needed
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
      if (!title || title.startsWith("YouTube Video")) title = data.title;
      if (!authorName || authorName === "YouTube Creator") authorName = data.author_name;
      if (!authorUrl || authorUrl === "https://www.youtube.com") authorUrl = data.author_url;
      if (!thumbnailUrl) thumbnailUrl = data.thumbnail_url;
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
