import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang");

  const posts = await prisma.blogPost.findMany({
    where: lang ? { language: lang } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      slug,
      language = "en",
      title,
      excerpt,
      content,
      category = "Guides",
      coverImage,
      author = "YTSnap Team",
      readTime = "4 min read",
      tags,
      isPublished = true,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required." },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        slug: slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        language,
        title,
        excerpt: excerpt || title,
        content,
        category,
        coverImage,
        author,
        readTime,
        tags,
        isPublished: Boolean(isPublished),
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { error: "Failed to create post. Slug and language may already exist." },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, excerpt, content, category, coverImage, author, readTime, tags, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
        category,
        coverImage,
        author,
        readTime,
        tags,
        isPublished: Boolean(isPublished),
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
