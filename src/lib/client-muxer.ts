/**
 * In-browser Media Remuxing Engine using Mediabunny
 * 
 * Takes separate YouTube DASH video-only and audio-only streams, downloads them
 * chunk-by-chunk via the edge stream proxy, and merges them into a single high-quality
 * MP4 file in the user's browser without requiring server-side transcoding.
 */

export interface MergeProgressCallback {
  (status: string, percent: number): void;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100);
}

async function fetchWithProgress(
  url: string,
  label: string,
  startPct: number,
  endPct: number,
  onProgress?: MergeProgressCallback
): Promise<Uint8Array> {
  const proxyUrl = `/api/stream-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);

  if (!res.ok) {
    throw new Error(`Failed to stream ${label} (HTTP ${res.status})`);
  }

  const contentLengthHeader = res.headers.get("content-length");
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

  if (!res.body) {
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      if (totalBytes > 0 && onProgress) {
        const fraction = receivedBytes / totalBytes;
        const currentPct = Math.round(startPct + fraction * (endPct - startPct));
        const receivedMb = (receivedBytes / (1024 * 1024)).toFixed(1);
        const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
        onProgress(`Downloading ${label} (${receivedMb} / ${totalMb} MB)...`, currentPct);
      }
    }
  }

  // Combine chunks
  const combined = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return combined;
}

export async function mergeVideoAndAudioInBrowser(
  videoUrl: string,
  audioUrl: string,
  title: string,
  qualityLabel: string,
  onProgress?: MergeProgressCallback
): Promise<void> {
  // 1. Download Video Stream (0% -> 55%)
  onProgress?.(`Starting HD video download (${qualityLabel})...`, 5);
  const videoBuffer = await fetchWithProgress(
    videoUrl,
    `Video ${qualityLabel}`,
    5,
    55,
    onProgress
  );

  // 2. Download Audio Stream (55% -> 85%)
  onProgress?.("Downloading HD Audio stream...", 56);
  const audioBuffer = await fetchWithProgress(
    audioUrl,
    "Audio",
    56,
    85,
    onProgress
  );

  // 3. Load Mediabunny dynamically
  onProgress?.("Merging audio and video into 1 HD MP4 file...", 88);
  const {
    Input,
    Output,
    BufferSource,
    BufferTarget,
    Mp4OutputFormat,
    Mp4InputFormat,
    MatroskaInputFormat,
    WebMInputFormat,
    Conversion,
  } = await import("mediabunny");

  const inputFormats = [
    new Mp4InputFormat(),
    new MatroskaInputFormat(),
    new WebMInputFormat(),
  ];

  const videoInput = new Input({
    formats: inputFormats,
    source: new BufferSource(videoBuffer),
  });

  const audioInput = new Input({
    formats: inputFormats,
    source: new BufferSource(audioBuffer),
  });

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat(),
    target,
  });

  onProgress?.("Syncing streams...", 92);

  const videoConv = await Conversion.init({
    input: videoInput,
    output,
    composable: true,
  });

  const audioConv = await Conversion.init({
    input: audioInput,
    output,
    composable: true,
  });

  await output.start();

  onProgress?.("Multiplexing video and audio tracks...", 95);
  await Promise.all([videoConv.execute(), audioConv.execute()]);

  await output.finalize();

  onProgress?.("Done! File ready for download.", 100);

  // 4. Trigger browser download
  if (!target.buffer) {
    throw new Error("Muxing failed: output buffer is empty.");
  }
  const blob = new Blob([target.buffer], { type: "video/mp4" });
  const downloadUrl = URL.createObjectURL(blob);
  const filename = `${sanitizeFilename(title)}-${qualityLabel}-HD-with-audio.mp4`;

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 30000);
}
