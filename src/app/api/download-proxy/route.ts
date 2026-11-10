import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");
    const resKey = searchParams.get("res") || "maxresdefault";
    const format = (searchParams.get("format") || "jpg").toLowerCase();

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return new NextResponse("Invalid YouTube video ID", { status: 400 });
    }

    const validKeys = [
      "maxresdefault",
      "sddefault",
      "hqdefault",
      "mqdefault",
      "default",
    ];
    const safeKey = validKeys.includes(resKey) ? resKey : "hqdefault";

    const cdnUrl = `https://img.youtube.com/vi/${videoId}/${safeKey}.jpg`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const cdnRes = await fetch(cdnUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    if (!cdnRes.ok) {
      return new NextResponse("Thumbnail image not available on YouTube CDN", {
        status: 404,
      });
    }

    const imageArrayBuffer = await cdnRes.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    let outputBuffer: Buffer = imageBuffer;
    let contentType = "image/jpeg";
    let extension = "jpg";

    if (format === "png") {
      outputBuffer = await sharp(imageBuffer).png().toBuffer();
      contentType = "image/png";
      extension = "png";
    } else if (format === "webp") {
      outputBuffer = await sharp(imageBuffer).webp({ quality: 95 }).toBuffer();
      contentType = "image/webp";
      extension = "webp";
    }

    const filename = `mediasnap-${videoId}-${safeKey}.${extension}`;

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": outputBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("Download proxy error:", err);
    return new NextResponse("Failed to download requested thumbnail", {
      status: 500,
    });
  }
}
