import { en } from "./en";
import { el } from "./el";

export const DICTS = { en, el };
export const LOCALES = ["en", "el"];
export const DEFAULT_LOCALE = "en";

export const isLocale = (v) => LOCALES.includes(v);

/** Never throws — an unknown segment falls back to the default dictionary. */
export const getDict = (locale) => DICTS[locale] ?? DICTS[DEFAULT_LOCALE];

/** Prefix a path with the locale: href("el", "/apps") → "/el/apps" */
export const href = (locale, path = "/") =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;

/**
 * Swap the locale segment of a pathname, keeping the rest.
 * "/en/apps" → "/el/apps"; "/en" → "/el"; "/" → "/el"
 */
export function swapLocale(pathname, next) {
  const parts = (pathname || "/").split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts[0] = next;
  else parts.unshift(next);
  return `/${parts.join("/")}`;
}
