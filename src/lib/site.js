/**
 * The canonical origin, resolved the same way everywhere it is needed
 * (metadata, sitemap, robots).
 *
 * Order matters: an explicit NEXT_PUBLIC_SITE_URL wins so a custom domain can
 * override Vercel's generated one, which in turn beats the localhost fallback
 * used during development.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3006");
