import { LOCALES } from "@/lib/content/i18n";
import { SITE_URL } from "@/lib/site";

const PATHS = ["", "/work", "/apps", "/hardware", "/about", "/contact"];

/**
 * Every route in both locales, each carrying the alternates for the other —
 * which is what tells a crawler these are translations rather than duplicates.
 */
export default function sitemap() {
  return LOCALES.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: path === "" ? "monthly" : "yearly",
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
