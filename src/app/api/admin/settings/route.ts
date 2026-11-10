import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const settings = await prisma.websiteSetting.findMany({
    orderBy: { group: "asc" },
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { settings } = body; // Array of { key, value }

  if (Array.isArray(settings)) {
    for (const item of settings) {
      if (item.key) {
        await prisma.websiteSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value ?? "") },
          create: {
            key: item.key,
            value: String(item.value ?? ""),
            group: item.group || "general",
            description: item.description,
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true, message: "Settings saved" });
}
