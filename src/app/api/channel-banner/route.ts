import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, hashIp } from "@/lib/security";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipH = hashIp(ip);

    const rateCheck = checkRateLimit(`channel-banner-${ipH}`, 60, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { urlOrHandle, lang = "en" } = body;

    if (!urlOrHandle || typeof urlOrHandle !== "string") {
      return NextResponse.json(
        { error: "A valid YouTube channel URL, handle (@name), or video link is required." },
        { status: 400 }
      );
    }

    let targetUrl = urlOrHandle.trim();

    // 1. If user entered a video URL, resolve the channel URL
    const videoMatch = targetUrl.match(/(?:watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (videoMatch) {
      const videoId = videoMatch[1];
      try {
        const vidRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        const vidHtml = await vidRes.text();
        const channelMatch =
          vidHtml.match(/"channelUrl":"(https:\/\/www\.youtube\.com\/@[^"]+)"/) ||
          vidHtml.match(/"ownerProfileUrl":"(https:\/\/www\.youtube\.com\/@[^"]+)"/) ||
          vidHtml.match(/"externalChannelId":"([^"]+)"/);

        if (channelMatch && channelMatch[1]) {
          if (channelMatch[1].startsWith("http")) {
            targetUrl = channelMatch[1];
          } else {
            targetUrl = `https://www.youtube.com/channel/${channelMatch[1]}`;
          }
        }
      } catch (err) {
        console.warn("Could not resolve channel from video:", err);
      }
    }

    // 2. Normalize channel URL format
    if (!targetUrl.startsWith("http")) {
      targetUrl = "https://www.youtube.com/" + (targetUrl.startsWith("@") ? targetUrl : "@" + targetUrl);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Unable to access YouTube channel (Status code: ${res.status}). Please verify the channel handle or URL.` },
        { status: 404 }
      );
    }

    const html = await res.text();
    const dataMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!dataMatch) {
      return NextResponse.json(
        { error: "Could not read YouTube channel metadata. The channel may be private or restricted." },
        { status: 500 }
      );
    }

    const data = JSON.parse(dataMatch[1]);
    const header = data.header;

    let channelTitle = "YouTube Creator";
    let handle = "";
    let subscriberCount = "";
    let avatarUrl = "";
    let rawBannerUrl = "";

    // Case A: pageHeaderRenderer (Modern InnerTube layout)
    if (header?.pageHeaderRenderer) {
      const phr = header.pageHeaderRenderer;
      channelTitle = phr.pageTitle || channelTitle;
      const vm = phr.content?.pageHeaderViewModel;

      if (vm?.metadata?.contentMetadataViewModel?.metadataRows) {
        const rows = vm.metadata.contentMetadataViewModel.metadataRows;
        const parts = rows?.[0]?.metadataParts || [];
        for (const p of parts) {
          const text = p?.text?.content || "";
          if (text.startsWith("@")) handle = text;
          else if (text.toLowerCase().includes("subscriber") || text.toLowerCase().includes("sub")) {
            subscriberCount = text;
          }
        }
      }

      const avatarSources = vm?.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources;
      if (avatarSources && avatarSources.length > 0) {
        avatarUrl = avatarSources[avatarSources.length - 1].url;
      }

      const bannerSources = vm?.banner?.imageBannerViewModel?.image?.sources;
      if (bannerSources && bannerSources.length > 0) {
        rawBannerUrl = bannerSources[bannerSources.length - 1].url;
      }
    }
    // Case B: c4TabbedHeaderRenderer (Legacy InnerTube layout)
    else if (header?.c4TabbedHeaderRenderer) {
      const c4 = header.c4TabbedHeaderRenderer;
      channelTitle = c4.title || channelTitle;
      handle = c4.channelHandleText?.runs?.[0]?.text || "";
      subscriberCount = c4.subscriberCountText?.simpleText || "";

      const avatarSources = c4.avatar?.thumbnails;
      if (avatarSources && avatarSources.length > 0) {
        avatarUrl = avatarSources[avatarSources.length - 1].url;
      }

      const bannerSources = c4.banner?.thumbnails;
      if (bannerSources && bannerSources.length > 0) {
        rawBannerUrl = bannerSources[bannerSources.length - 1].url;
      }
    }

    // Clean base image URLs
    const baseBanner = rawBannerUrl ? rawBannerUrl.split("=")[0] : "";
    const baseAvatar = avatarUrl ? avatarUrl.split("=")[0] : "";

    // Log tool usage asynchronously
    try {
      await prisma.toolUsage.create({
        data: {
          toolKey: "youtube-banner-downloader",
          language: lang,
          videoId: handle || channelTitle,
          status: "success",
          ipHash: ipH,
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    } catch (e) {
      console.warn("Tool usage log warning:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        channelTitle,
        handle: handle || (targetUrl.includes("@") ? "@" + targetUrl.split("@")[1] : ""),
        subscriberCount,
        channelUrl: targetUrl,
        hasBanner: Boolean(baseBanner),
        banner: baseBanner
          ? {
              original2560: `${baseBanner}=s0`,
              tv: `${baseBanner}=s2560`,
              desktop: `${baseBanner}=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
              tablet: `${baseBanner}=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
              mobile: `${baseBanner}=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
            }
          : null,
        avatar: baseAvatar
          ? {
              hd: `${baseAvatar}=s900-c-k-c0x00ffffff-no-rj`,
              medium: `${baseAvatar}=s240-c-k-c0x00ffffff-no-rj`,
              standard: `${baseAvatar}=s160-c-k-c0x00ffffff-no-rj`,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Channel banner extraction error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve channel banner. Please verify the URL or handle." },
      { status: 500 }
    );
  }
}
