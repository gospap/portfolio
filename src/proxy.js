import { NextResponse } from "next/server";

/*
 * Locale routing. In Next 16 the `middleware` file convention is renamed
 * `proxy`, and the exported function with it.
 *
 * Every path is locale-prefixed (/en, /el). A request without a prefix is
 * redirected to the visitor's best match: an explicit choice they made earlier
 * (the NEXT_LOCALE cookie the switcher sets) wins, then Accept-Language, then
 * English.
 *
 * The locale list is inlined rather than imported from lib/content/i18n so the
 * bundle stays small — importing the dictionary index would drag both full
 * translation files into this runtime for a string comparison.
 */

const LOCALES = ["en", "el"];
const DEFAULT_LOCALE = "en";
const COOKIE = "NEXT_LOCALE";

const isLocale = (v) => LOCALES.includes(v);

/** "el-GR,el;q=0.9,en;q=0.8" → "el". Hand-rolled: two locales, no regions. */
function preferredLocale(header) {
  if (!header) return undefined;
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      const quality = q === undefined ? 1 : Number.parseFloat(q);
      return {
        base: tag.trim().split("-")[0].toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((e) => e.quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .find((e) => isLocale(e.base))?.base;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const fromCookie = request.cookies.get(COOKIE)?.value;
  const locale =
    (fromCookie && isLocale(fromCookie) ? fromCookie : undefined) ??
    preferredLocale(request.headers.get("accept-language")) ??
    DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  // "/" must not become "//en"
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  /* Skip Next internals, the metadata routes, and anything with a file
     extension — those must not be locale-prefixed. */
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
