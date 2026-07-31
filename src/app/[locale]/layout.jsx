import { Manrope, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { DEFAULT_LOCALE, LOCALES, getDict, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import { SITE_URL } from "@/lib/site";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

import "../globals.css";
import "../site.css";
import "../home.css";
import "../pages.css";
import "@/components/hero/hero.css";
import "@/components/showcase/showcase.css";

/* Greek is a first-class locale here, so both faces have to carry Greek
   glyphs — a Latin-only display face would silently fall back mid-heading on
   half the site. That rules out the thin display serifs this layout would
   otherwise want, so the moksha character comes from weight and tracking on
   Manrope (200–300) instead of from a second family. */
const sans = Manrope({
  subsets: ["latin", "latin-ext", "greek"],
  variable: "--font-manrope",
  display: "swap",
});
/* The display face. Anthropic-adjacent: an editorial serif for headings over a
   geometric sans for reading. Source Serif 4 is the one that carries GREEK —
   most serifs with this feel are Latin-only, and a Latin-only display face
   would silently fall back mid-heading on half of this site. */
const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext", "greek"],
  variable: "--font-serif-src",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "greek"],
  variable: "--font-mono-jb",
  display: "swap",
});

/* Only these two locales exist; anything else is a 404 rather than a page
   rendered with an undefined dictionary. */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${PROFILE.name} — ${dict.hero.role}`,
      template: `%s · ${PROFILE.name}`,
    },
    description: dict.hero.tagline,
    alternates: {
      canonical: `/${loc}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      locale: loc === "el" ? "el_GR" : "en_GB",
      siteName: PROFILE.name,
      title: `${PROFILE.name} — ${dict.hero.role}`,
      description: dict.hero.tagline,
      url: `/${loc}`,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);

  return (
    <html
      lang={dict.htmlLang}
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          {dict.a11y.skip}
        </a>
        <SmoothScroll />
        <Cursor />
        <SiteHeader locale={loc} dict={dict} />
        <main id="main">{children}</main>
        <SiteFooter locale={loc} dict={dict} />
      </body>
    </html>
  );
}
