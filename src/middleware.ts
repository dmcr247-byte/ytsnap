import { NextRequest, NextResponse } from "next/server";
import { isValidLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./lib/i18n";

export function middleware(req: NextRequest) {
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
    // Detect preferred language from cookie or Accept-Language header
    const savedLang = req.cookies.get("mediasnap_lang")?.value;
    let chosenLang = DEFAULT_LANGUAGE;

    if (savedLang && isValidLanguage(savedLang)) {
      chosenLang = savedLang;
    } else {
      const acceptLang = req.headers.get("accept-language") || "";
      for (const lang of SUPPORTED_LANGUAGES) {
        if (acceptLang.toLowerCase().includes(lang.code)) {
          chosenLang = lang.code;
          break;
        }
      }
    }

    // Preserve the remainder of the path
    const targetPath = `/${chosenLang}${pathname === "/" ? "" : pathname}`;
    const url = req.nextUrl.clone();
    url.pathname = targetPath;
    const response = NextResponse.redirect(url);
    response.cookies.set("mediasnap_lang", chosenLang, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  }

  // If visiting a language-prefixed path, save the preference in a cookie
  const response = NextResponse.next();
  response.cookies.set("mediasnap_lang", firstSegment, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
