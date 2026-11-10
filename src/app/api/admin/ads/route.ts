import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ads = await prisma.advertisement.findMany({
    orderBy: { slot: "asc" },
  });
  return NextResponse.json({ ads });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Support batch update if array is passed
  if (Array.isArray(body.ads)) {
    for (const adItem of body.ads) {
      if (adItem.id) {
        await prisma.advertisement.update({
          where: { id: adItem.id },
          data: {
            htmlContent: adItem.htmlContent ?? null,
            imageUrl: adItem.imageUrl ?? null,
            targetUrl: adItem.targetUrl ?? null,
            isActive: Boolean(adItem.isActive),
          },
        });
      }
    }
    const updatedAds = await prisma.advertisement.findMany({ orderBy: { slot: "asc" } });
    return NextResponse.json({ success: true, ads: updatedAds });
  }

  // Single ad update
  const { id, htmlContent, imageUrl, targetUrl, isActive } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing ad id" }, { status: 400 });
  }

  const ad = await prisma.advertisement.update({
    where: { id },
    data: {
      htmlContent: htmlContent ?? null,
      imageUrl: imageUrl ?? null,
      targetUrl: targetUrl ?? null,
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json({ success: true, ad });
}
