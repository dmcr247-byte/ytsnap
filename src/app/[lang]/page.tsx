import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  isValidLanguage,
  getDictionary,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/i18n";
import { notFound } from "next/navigation";
import { ThumbnailHero } from "@/components/ThumbnailHero";
import {
  HowItWorksSection,
  ResolutionGuideSection,
  FeaturesSection,
  CreatorToolsGrid,
  FaqSection,
} from "@/components/HomeSections";
import { JsonLd } from "@/components/JsonLd";
import { AdBanner } from "@/components/AdBanner";
import prisma from "@/lib/prisma";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

interface PageProps {
  params: { lang: string };
  searchParams?: { v?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = params;
  if (!isValidLanguage(lang)) return {};

  const dict = getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const alternatesLanguages: Record<string, string> = {};
  for (const l of SUPPORTED_LANGUAGES) {
    alternatesLanguages[l.code] = `${baseUrl}/${l.code}`;
  }

  return {
    title: `${dict.hero.title} | YTSnap`,
    description: dict.hero.subtitle,
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title: `${dict.hero.title} | YTSnap`,
      description: dict.hero.subtitle,
      url: `${baseUrl}/${lang}`,
      siteName: "YTSnap",
      locale: lang,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.hero.title,
      description: dict.hero.subtitle,
    },
  };
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { lang } = params;
  if (!isValidLanguage(lang)) notFound();

  const dict = getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Fetch FAQs from database with fallback
  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    const dbFaqs = await prisma.faqItem.findMany({
      where: { language: lang },
      orderBy: { order: "asc" },
      take: 6,
    });

    if (dbFaqs.length > 0) {
      faqs = dbFaqs.map((f) => ({ question: f.question, answer: f.answer }));
    } else {
      // Fallback to English faqs if language-specific not yet translated in db
      const fallbackFaqs = await prisma.faqItem.findMany({
        where: { language: "en" },
        orderBy: { order: "asc" },
        take: 6,
      });
      faqs = fallbackFaqs.map((f) => ({ question: f.question, answer: f.answer }));
    }
  } catch (err) {
    console.warn("FAQ fetch error:", err);
  }

  // Fetch Latest Blog Posts
  let latestPosts: any[] = [];
  try {
    latestPosts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (err) {
    console.warn("Blog posts fetch error:", err);
  }

  // Structured Data Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "YTSnap",
        description: dict.hero.subtitle,
        inLanguage: lang,
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "YTSnap",
        url: baseUrl,
        logo: `${baseUrl}/favicon.ico`,
      },
      {
        "@type": "WebApplication",
        name: "YTSnap YouTube Thumbnail & Creator Suite",
        url: `${baseUrl}/${lang}`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      ...(faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      {/* Main Hero & Thumbnail Downloader */}
      <ThumbnailHero
        lang={lang as SupportedLanguage}
        dict={dict}
        initialVideoId={searchParams?.v}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner slot="hero_bottom" />
      </div>

      {/* How It Works Section */}
      <HowItWorksSection dict={dict} />

      {/* Resolution Guide Section */}
      <ResolutionGuideSection dict={dict} />

      {/* Features & Benefits */}
      <FeaturesSection dict={dict} />

      {/* Popular Creator Tools Grid */}
      <CreatorToolsGrid lang={lang as SupportedLanguage} dict={dict} />

      {/* Latest Blog Guides */}
      {latestPosts.length > 0 && (
        <section className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Creator Insights
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Latest Guides & Tutorials
                </h2>
              </div>
              <Link
                href={`/${lang}/blog`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${lang}/blog/${post.slug}`}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
                >
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
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime}</span>
                      </span>
                      <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner slot="in_content" />
      </div>

      {/* Frequently Asked Questions */}
      {faqs.length > 0 && <FaqSection dict={dict} faqs={faqs} />}
    </>
  );
}
