import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.faqItem.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { question, answer, category = "general", language = "en", order = 0 } = body;

  if (!question || !answer) {
    return NextResponse.json({ error: "Question and answer required" }, { status: 400 });
  }

  const faq = await prisma.faqItem.create({
    data: { question, answer, category, language, order: Number(order) || 0 },
  });

  return NextResponse.json({ success: true, faq });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, question, answer, category, language, order } = body;

  const faq = await prisma.faqItem.update({
    where: { id },
    data: { question, answer, category, language, order: Number(order) || 0 },
  });

  return NextResponse.json({ success: true, faq });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.faqItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
