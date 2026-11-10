import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import ar from "@/locales/ar.json";
import id from "@/locales/id.json";

export type SupportedLanguage =
  | "en"
  | "hi"
  | "es"
  | "pt"
  | "fr"
  | "de"
  | "ar"
  | "id";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr", flag: "🇧🇷" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr", flag: "🇩🇪" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "🇸🇦" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr", flag: "🇮🇩" },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export type TranslationDictionary = typeof en;

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  hi,
  es,
  pt,
  fr,
  de,
  ar,
  id,
};

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((l) => l.code === lang);
}

export function getDictionary(lang: string): TranslationDictionary {
  if (isValidLanguage(lang)) {
    return dictionaries[lang];
  }
  return dictionaries[DEFAULT_LANGUAGE];
}

export function getLanguageInfo(lang: string): LanguageInfo {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return found || SUPPORTED_LANGUAGES[0];
}

export function getDirection(lang: string): "ltr" | "rtl" {
  return getLanguageInfo(lang).dir;
}
