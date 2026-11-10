import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ads = await prisma.advertisement.findMany();
  return NextResponse.json({ ads });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, htmlContent, imageUrl, targetUrl, isActive } = body;

  const ad = await prisma.advertisement.update({
    where: { id },
    data: {
      htmlContent,
      imageUrl,
      targetUrl,
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json({ success: true, ad });
}
