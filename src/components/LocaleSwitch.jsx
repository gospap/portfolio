"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, DICTS, swapLocale } from "@/lib/content/i18n";

/**
 * Two links, not a <select>. Rendering both locales as real anchors means the
 * alternate language is crawlable and openable in a new tab, which a JS-driven
 * switcher gives up for no benefit at two languages.
 */
export default function LocaleSwitch({ locale, dict }) {
  const pathname = usePathname() || "/";

  /* Record the choice so a later visit to a bare path lands in the same
     language instead of being re-guessed from Accept-Language. Read by
     src/proxy.js; set here rather than server-side because following a plain
     link is the whole point of rendering these as anchors. */
  const remember = (l) => {
    document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`;
  };

  return (
    <div className="lsw" role="group" aria-label={dict.a11y.localeSwitch}>
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            className={`lsw__opt${active ? " is-active" : ""}`}
            href={swapLocale(pathname, l)}
            hrefLang={l}
            onClick={() => remember(l)}
            aria-current={active ? "true" : undefined}
            // The label is the language's own name, so a Greek visitor looking
            // for Greek is not hunting for the word "Greek" in English.
            title={DICTS[l].label}
          >
            {DICTS[l].short}
          </Link>
        );
      })}
    </div>
  );
}
