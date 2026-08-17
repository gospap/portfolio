import { Manrope, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { DEFAULT_LOCALE, LOCALES, getDict, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import { SITE_URL } from "@/lib/site";
import { jsonLd, personSchema, siteSchema } from "@/lib/seo";
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
    description: dict.about.lead,
    /* The handle is a name people search for and it appears in no sentence on
       the site, so it is declared here and in the Person graph's
       alternateName. Keywords carry almost no ranking weight any more; this
       is about the string existing in the document at all. */
    keywords: [
      PROFILE.name,
      PROFILE.handle,
      "George Papanikolaou",
      "Γιώργος Παπανικολάου",
      "software engineer",
      "web developer",
      "Greece",
    ],
    authors: [{ name: PROFILE.name, url: SITE_URL }],
    creator: PROFILE.name,
    publisher: PROFILE.name,
    alternates: {
      canonical: `/${loc}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
        /* Which locale a crawler should serve when it cannot match one.
           Without this, two equally-weighted alternates just compete. */
        "x-default": `/${DEFAULT_LOCALE}`,
      },
    },
    openGraph: {
      type: "profile",
      firstName: "Giorgos",
      lastName: "Papanikolaou",
      username: PROFILE.handle,
      locale: loc === "el" ? "el_GR" : "en_GB",
      alternateLocale: loc === "el" ? "en_GB" : "el_GR",
      siteName: PROFILE.name,
      title: `${PROFILE.name} — ${dict.hero.role}`,
      description: dict.about.lead,
      url: `/${loc}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${PROFILE.name} — ${dict.hero.role}`,
      description: dict.about.lead,
    },
    /* Search Console verification, the meta-tag method. The HTML file in
       public/ does the same job, and both are kept because they fail in
       different places: the file is fetched at a literal path and cannot be
       redirected, while this tag is only seen if the crawler follows "/" to
       "/en" through the locale proxy. Whichever Google reaches first wins,
       and removing either one later un-verifies nothing. */
    verification: {
      google: "v9_Y3gA9RUM6XgdCS_JePkRvkU-UGGlv8x--xcBfzW8",
    },
    robots: {
      index: true,
      follow: true,
      /* Let Google show a full-length snippet and a large image. The defaults
         are conservative and truncate both, which for a name query means the
         one result that should be unmistakable shows two lines of nothing. */
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
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
        {/* Identity, for machines. See lib/seo.js for why sameAs and
            alternateName are the two fields that matter here. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(personSchema(loc, dict), siteSchema(loc, dict)),
          }}
        />
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
