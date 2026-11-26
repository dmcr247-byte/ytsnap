import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { STATIC_BLOG_POSTS } from "@/data/static-posts";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = [];
  for (const post of STATIC_BLOG_POSTS) {
    try {
      const res = await prisma.blogPost.upsert({
        where: {
          slug_language: {
            slug: post.slug,
            language: post.language,
          },
        },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          coverImage: post.coverImage,
          author: post.author,
          readTime: post.readTime,
          tags: post.tags,
          isPublished: true,
        },
        create: {
          slug: post.slug,
          language: post.language,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          coverImage: post.coverImage,
          author: post.author,
          readTime: post.readTime,
          tags: post.tags,
          isPublished: true,
        },
      });
      results.push({ language: post.language, status: "upserted", id: res.id });
    } catch (e: any) {
      results.push({ language: post.language, status: "error", error: e.message });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Synced static posts to database",
    results,
  });
}
