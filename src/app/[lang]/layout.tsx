import React from "react";
import { notFound } from "next/navigation";
import {
  isValidLanguage,
  getDictionary,
  getDirection,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((l) => ({ lang: l.code }));
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const dir = getDirection(lang);

  return (
    <div dir={dir} className="min-h-screen flex flex-col justify-between">
      <Header lang={lang as SupportedLanguage} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang as SupportedLanguage} dict={dict} />
    </div>
  );
}
