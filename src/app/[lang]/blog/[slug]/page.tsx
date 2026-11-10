import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLanguage,
  getDictionary,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import prisma from "@/lib/prisma";
import {
  Clock,
  Calendar,
  User,
  Share2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface ArticlePageProps {
  params: { lang: string; slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang, slug } = params;
  if (!isValidLanguage(lang)) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
  });

  if (!post) return {};

  const alternatesLanguages: Record<string, string> = {};
  for (const l of SUPPORTED_LANGUAGES) {
    alternatesLanguages[l.code] = `${baseUrl}/${l.code}/blog/${slug}`;
  }

  return {
    title: `${post.title} | YTSnap Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `${baseUrl}/${lang}/blog/${slug}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/${lang}/blog/${slug}`,
      siteName: "YTSnap",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostDetailPage({ params }: ArticlePageProps) {
  const { lang, slug } = params;
  if (!isValidLanguage(lang)) notFound();

  const dict = getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Try finding post in user's language, fallback to English version
  let post = await prisma.blogPost.findUnique({
    where: { slug_language: { slug, language: lang } },
  });

  if (!post) {
    post = await prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
    });
  }

  if (!post) notFound();

  // Related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      slug: { not: slug },
      isPublished: true,
      category: post.category,
    },
    take: 3,
  });

  // Check if content has FAQ section to generate FAQPage Schema
  let faqSchema: any = null;
  if (post.content.includes("Frequently Asked Questions")) {
    const faqSection = post.content.split(/## Frequently Asked Questions/i)[1];
    if (faqSection) {
      const qBlocks = faqSection.split(/\n### /).slice(1);
      if (qBlocks.length > 0) {
        faqSchema = {
          "@type": "FAQPage",
          mainEntity: qBlocks.map((block) => {
            const firstLineBreak = block.indexOf("\n");
            const q = firstLineBreak > 0 ? block.slice(0, firstLineBreak).trim() : block.trim();
            const a = firstLineBreak > 0 ? block.slice(firstLineBreak).trim() : "";
            return {
              "@type": "Question",
              name: q,
              acceptedAnswer: {
                "@type": "Answer",
                text: a,
              },
            };
          }),
        };
      }
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage || `${baseUrl}/favicon.ico`,
        author: {
          "@type": "Person",
          name: post.author,
        },
        publisher: {
          "@type": "Organization",
          name: "YTSnap",
          logo: `${baseUrl}/favicon.ico`,
        },
        datePublished: post.createdAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/${lang}/blog/${post.slug}`,
        },
      },
      ...(faqSchema ? [faqSchema] : []),
    ],
  };

  const articleUrl = `${baseUrl}/${lang}/blog/${post.slug}`;

  return (
    <article className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <JsonLd data={structuredData} />

      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[
          { label: dict.common.blog, href: `/${lang}/blog` },
          { label: post.category, href: `/${lang}/blog?category=${encodeURIComponent(post.category)}` },
          { label: post.title },
        ]}
      />

      {/* Article Header */}
      <div className="mt-8 mb-8 space-y-4">
        <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.2]">
          {post.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {post.excerpt}
        </p>

        {/* Metadata Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4 text-primary" />
              <span>{post.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Share:
            </span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-primary transition-colors text-xs font-bold"
            >
              X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-primary transition-colors text-xs font-bold"
            >
              FB
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-primary transition-colors text-xs font-bold"
            >
              IN
            </a>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.coverImage && (
        <div className="rounded-3xl overflow-hidden aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 shadow-md mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-base sm:text-lg">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Back to Blog & Related Articles */}
      <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
        <Link
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Guides</span>
        </Link>

        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  href={`/${lang}/blog/${r.slug}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                    {r.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                    {r.title}
                  </h4>
                  <span className="text-xs text-slate-400 mt-3 block">
                    {r.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
