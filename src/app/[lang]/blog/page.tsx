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
import prisma from "@/lib/prisma";
import { Clock, Calendar, BookOpen, ArrowRight, Search } from "lucide-react";

interface BlogPageProps {
  params: { lang: string };
  searchParams?: { category?: string; q?: string };
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { lang } = params;
  if (!isValidLanguage(lang)) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const alternatesLanguages: Record<string, string> = {};
  for (const l of SUPPORTED_LANGUAGES) {
    alternatesLanguages[l.code] = `${baseUrl}/${l.code}/blog`;
  }

  return {
    title: "YouTube Creator Blog, SEO Guides & Tutorials | MediaSnap",
    description:
      "Actionable guides for video creators: mastering YouTube thumbnail design, title copywriting formulas, algorithm SEO, and platform compliance.",
    alternates: {
      canonical: `${baseUrl}/${lang}/blog`,
      languages: alternatesLanguages,
    },
  };
}

export default async function BlogListPage({ params, searchParams }: BlogPageProps) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();

  const dict = getDictionary(lang);
  const activeCategory = searchParams?.category;
  const searchQuery = searchParams?.q?.toLowerCase();

  let posts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      category: activeCategory ? activeCategory : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  if (searchQuery) {
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery) ||
        p.excerpt.toLowerCase().includes(searchQuery) ||
        p.content.toLowerCase().includes(searchQuery)
    );
  }

  const categories = [
    "All",
    "Thumbnail Design",
    "Creator Guides",
    "YouTube SEO",
    "Copyright & Fair Use",
  ];

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs
        lang={lang as SupportedLanguage}
        items={[{ label: dict.common.blog }]}
      />

      <div className="text-center max-w-3xl mx-auto mt-6 mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          MediaSnap Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-1">
          YouTube Creator Blog & Guides
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
          Level up your production with expert strategies on thumbnail click-through rates, metadata optimization, and copyright rules.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const isSelected = (!activeCategory && cat === "All") || activeCategory === cat;
          return (
            <Link
              key={cat}
              href={cat === "All" ? `/${lang}/blog` : `/${lang}/blog?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Blog Cards Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${lang}/blog/${post.slug}`}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{post.readTime}</span>
                </span>
                <span className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles found</h3>
          <p className="text-sm text-slate-500 mt-1">Try selecting another category or clear your search.</p>
        </div>
      )}
    </div>
  );
}
