import { NextRequest, NextResponse } from "next/server";
import { isValidLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage } from "./lib/i18n";

// Country-to-Language mapping for geo-targeted language delivery
const COUNTRY_TO_LANG: Record<string, SupportedLanguage> = {
  // Hindi (India)
  IN: "hi",

  // Spanish (Spain & Latin America)
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  PR: "es",

  // Portuguese (Brazil, Portugal, etc.)
  BR: "pt",
  PT: "pt",
  AO: "pt",
  MZ: "pt",
  CV: "pt",
  GW: "pt",
  ST: "pt",

  // French (France, Belgium, parts of Africa/Canada)
  FR: "fr",
  BE: "fr",
  SN: "fr",
  CI: "fr",
  CM: "fr",
  MG: "fr",
  CD: "fr",
  CG: "fr",
  ML: "fr",
  NE: "fr",
  BF: "fr",
  TG: "fr",
  BJ: "fr",
  GA: "fr",

  // German (Germany, Austria, Switzerland, etc.)
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  LU: "de",

  // Arabic (Middle East & North Africa)
  SA: "ar",
  AE: "ar",
  EG: "ar",
  DZ: "ar",
  MA: "ar",
  IQ: "ar",
  SD: "ar",
  YE: "ar",
  SY: "ar",
  TN: "ar",
  JO: "ar",
  LY: "ar",
  LB: "ar",
  OM: "ar",
  KW: "ar",
  MR: "ar",
  QA: "ar",
  BH: "ar",

  // Indonesian (Indonesia)
  ID: "id",
};

export function middleware(req: NextRequest) {
  // 1. Redirect vercel.app domains (e.g. ytsnap-chi.vercel.app) to official domain
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (host.includes("vercel.app")) {
    const targetUrl = new URL(
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
      "https://www.ytsnap.tech"
    );
    return NextResponse.redirect(targetUrl, 301);
  }

  const { pathname } = req.nextUrl;

  // Skip API routes, Next.js static assets, favicon, robots, sitemap
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a supported language
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment || !isValidLanguage(firstSegment)) {
    // 1. Check if user already explicitly selected a language in cookie
    const savedLang = req.cookies.get("ytsnap_lang")?.value;
    let chosenLang: SupportedLanguage = DEFAULT_LANGUAGE;

    if (savedLang && isValidLanguage(savedLang)) {
      chosenLang = savedLang;
    } else {
      // 2. Country / Geo-detection: Check Vercel/Cloudflare Geo Headers
      const countryCode = (
        req.headers.get("x-vercel-ip-country") ||
        (req as any).geo?.country ||
        req.headers.get("cf-ipcountry") ||
        ""
      ).toUpperCase();

      if (countryCode && COUNTRY_TO_LANG[countryCode]) {
        chosenLang = COUNTRY_TO_LANG[countryCode];
      } else {
        // 3. Fallback to Accept-Language header from browser
        const acceptLang = req.headers.get("accept-language") || "";
        for (const lang of SUPPORTED_LANGUAGES) {
          if (acceptLang.toLowerCase().includes(lang.code)) {
            chosenLang = lang.code;
            break;
          }
        }
      }
    }

    // Preserve the remainder of the path
    const targetPath = `/${chosenLang}${pathname === "/" ? "" : pathname}`;
    const url = req.nextUrl.clone();
    url.pathname = targetPath;
    const response = NextResponse.redirect(url);
    response.cookies.set("ytsnap_lang", chosenLang, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  }

  // If visiting a language-prefixed path, save the preference in a cookie
  const response = NextResponse.next();
  response.cookies.set("ytsnap_lang", firstSegment, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
