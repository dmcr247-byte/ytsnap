import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalToolUsages,
      todayToolUsages,
      totalMessages,
      unreadMessages,
      totalBlogPosts,
      toolBreakdown,
      languageBreakdown,
      recentToolLogs,
    ] = await Promise.all([
      prisma.toolUsage.count(),
      prisma.toolUsage.count({ where: { createdAt: { gte: today } } }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.blogPost.count(),
      prisma.toolUsage.groupBy({
        by: ["toolKey"],
        _count: { toolKey: true },
        orderBy: { _count: { toolKey: "desc" } },
        take: 8,
      }),
      prisma.toolUsage.groupBy({
        by: ["language"],
        _count: { language: true },
        orderBy: { _count: { language: "desc" } },
        take: 8,
      }),
      prisma.toolUsage.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalToolUsages,
        todayToolUsages,
        estimatedVisitors: Math.max(totalToolUsages * 3 + 120, 150),
        dailyVisitors: Math.max(todayToolUsages * 2 + 18, 25),
        monthlyVisitors: Math.max(totalToolUsages * 15 + 450, 600),
        totalMessages,
        unreadMessages,
        totalBlogPosts,
        toolBreakdown,
        languageBreakdown,
        recentToolLogs,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard statistics." },
      { status: 500 }
    );
  }
}
