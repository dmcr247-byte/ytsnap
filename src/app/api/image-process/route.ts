import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { isSafePublicUrl } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get("action")?.toString() || "resize";
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl")?.toString();

    let inputBuffer: Buffer;

    if (file && file.size > 0) {
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image file exceeds 15MB limit." },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    } else if (imageUrl) {
      if (!isSafePublicUrl(imageUrl)) {
        return NextResponse.json(
          { error: "Invalid or restricted image URL." },
          { status: 400 }
        );
      }
      const fetchRes = await fetch(imageUrl);
      if (!fetchRes.ok) {
        return NextResponse.json(
          { error: "Failed to download image from provided URL." },
          { status: 400 }
        );
      }
      const arrayBuffer = await fetchRes.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json(
        { error: "Please upload an image or provide a valid image URL." },
        { status: 400 }
      );
    }

    let pipeline = sharp(inputBuffer);
    const metadata = await pipeline.metadata();

    let outputFormat = formData.get("format")?.toString()?.toLowerCase() || "jpeg";
    if (outputFormat === "jpg") outputFormat = "jpeg";

    if (action === "resize") {
      const width = parseInt(formData.get("width")?.toString() || "1280", 10);
      const height = parseInt(formData.get("height")?.toString() || "720", 10);
      const fit = formData.get("fit")?.toString() === "contain" ? "contain" : "cover";

      pipeline = pipeline.resize(width, height, {
        fit,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      });
    }

    if (action === "compress") {
      const quality = Math.min(
        100,
        Math.max(10, parseInt(formData.get("quality")?.toString() || "80", 10))
      );

      if (outputFormat === "png") {
        pipeline = pipeline.png({ quality, compressionLevel: 8 });
      } else if (outputFormat === "webp") {
        pipeline = pipeline.webp({ quality });
      } else if (outputFormat === "avif") {
        pipeline = pipeline.avif({ quality });
      } else {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      }
    } else if (action === "convert" || action === "resize") {
      if (outputFormat === "png") {
        pipeline = pipeline.png();
      } else if (outputFormat === "webp") {
        pipeline = pipeline.webp({ quality: 90 });
      } else if (outputFormat === "avif") {
        pipeline = pipeline.avif({ quality: 85 });
      } else {
        pipeline = pipeline.jpeg({ quality: 92 });
      }
    }

    const processedBuffer = await pipeline.toBuffer();
    const mimeTypes: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
    };

    const finalMime = mimeTypes[outputFormat] || "image/jpeg";
    const filename = `ytsnap-processed-${Date.now()}.${outputFormat === "jpeg" ? "jpg" : outputFormat}`;

    return new NextResponse(new Uint8Array(processedBuffer), {
      headers: {
        "Content-Type": finalMime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": processedBuffer.length.toString(),
        "X-Original-Size": (metadata.size || inputBuffer.length).toString(),
        "X-Processed-Size": processedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      { error: "Image processing failed. Please verify format and try again." },
      { status: 500 }
    );
  }
}
