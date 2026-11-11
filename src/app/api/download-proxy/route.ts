import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");
    const resKey = searchParams.get("res") || "maxresdefault";
    const format = (searchParams.get("format") || "jpg").toLowerCase();
    const customUrl = searchParams.get("url");
    const customName = searchParams.get("name") || "media";

    let cdnUrl = "";
    let baseFilename = "ytsnap";

    // 1. Direct safe image URL (e.g. YouTube banner from yt3.googleusercontent.com)
    if (customUrl) {
      try {
        const parsed = new URL(customUrl);
        const host = parsed.hostname.toLowerCase();
        const allowedHosts = [
          "yt3.googleusercontent.com",
          "yt3.ggpht.com",
          "i.ytimg.com",
          "img.youtube.com",
        ];
        if (!allowedHosts.some((h) => host === h || host.endsWith("." + h))) {
          return new NextResponse("Unauthorized media host", { status: 400 });
        }
        cdnUrl = customUrl;
        baseFilename = `ytsnap-${customName.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
      } catch {
        return new NextResponse("Invalid URL", { status: 400 });
      }
    }
    // 2. Standard video thumbnail by ID
    else if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      const validKeys = [
        "maxresdefault",
        "sddefault",
        "hqdefault",
        "mqdefault",
        "default",
      ];
      const safeKey = validKeys.includes(resKey) ? resKey : "hqdefault";
      cdnUrl = `https://img.youtube.com/vi/${videoId}/${safeKey}.jpg`;
      baseFilename = `ytsnap-${videoId}-${safeKey}`;
    } else {
      return new NextResponse("Invalid request parameters", { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const cdnRes = await fetch(cdnUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    if (!cdnRes.ok) {
      return new NextResponse("Image not available on YouTube CDN", {
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

    const filename = `${baseFilename}.${extension}`;

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
    return new NextResponse("Failed to download requested image", {
      status: 500,
    });
  }
}
