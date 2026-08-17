import Link from "next/link";
import { href } from "@/lib/content/i18n";
import { PROFILE, socialIcons, socialLinks } from "@/lib/content/profile";

/* ===========================================================================
   Platform marks, drawn here rather than fetched.

   Inline SVG for the same reason the rest of the site avoids assets: no extra
   request, crisp at any DPR, and the stroke inherits `currentColor` so the
   marks recolour with the footer instead of being flat images that have to be
   re-exported when the palette moves — which it just did.

   Geometric constructions on a 24-unit grid, stroked to the same weight as the
   hairlines everywhere else, not the official brand artwork.
   =========================================================================== */
const ICONS = {
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3.5" />
      {/* the i: dot detached from the stem, as the mark has it */}
      <path d="M7.7 10.6v6.1" />
      <path d="M7.7 7.6v.02" />
      {/* the n: stem, then the shoulder turning over into the second leg */}
      <path d="M11.9 16.7v-6.1" />
      <path d="M11.9 13.4a2.6 2.6 0 0 1 4.9 1.2v2.1" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.1 6.9v.02" />
    </>
  ),
  github: (
    <>
      <path d="M9.2 20.1c-4.1 1.2-4.1-2.2-5.7-2.6m11.4 5v-3.4c0-1 .1-1.4-.5-1.9 2.6-.3 5.1-1.3 5.1-5.6a4.3 4.3 0 0 0-1.2-3 4 4 0 0 0-.1-3s-1-.3-3.2 1.2a11 11 0 0 0-5.7 0C7.1 4.3 6.1 4.6 6.1 4.6a4 4 0 0 0-.1 3 4.3 4.3 0 0 0-1.2 3c0 4.3 2.5 5.3 5.1 5.6-.5.5-.5 1-.5 1.7v3.6" />
    </>
  ),
};

const ROUTES = [
  { path: "/work", key: "work" },
  { path: "/apps", key: "apps" },
  { path: "/hardware", key: "hardware" },
  { path: "/about", key: "about" },
  { path: "/contact", key: "contact" },
];

export default function SiteFooter({ locale, dict }) {
  const links = socialLinks();
  const icons = socialIcons();
  /* The icon row already carries these, so printing them again as words
     directly above it is the same link twice. Email is the only one that
     stays a labelled link — you read an address, you do not press a glyph. */
  const textLinks = links.filter((l) => !icons.some((i) => i.key === l.key));
  const year = 2026; // stamped, not computed — a server/client mismatch on a
  // date is a hydration warning for no benefit on a footer

  return (
    <footer className="ftr theme-silver">
      <div className="wrap ftr__inner">
        <div className="ftr__brand">
          <p className="ftr__name">{PROFILE.name}</p>
          <p className="ftr__role">{dict.hero.role}</p>
        </div>

        <nav className="ftr__nav" aria-label={dict.nav.menu}>
          {ROUTES.map((r) => (
            <Link key={r.path} href={href(locale, r.path)}>
              {dict.nav[r.key]}
            </Link>
          ))}
        </nav>

        <div className="ftr__links">
          {textLinks.map((l) => (
            <a
              key={l.key}
              href={l.href}
              {...(l.key === "email"
                ? {}
                : { target: "_blank", rel: "noreferrer noopener" })}
            >
              {l.label}
            </a>
          ))}

          {icons.length ? (
            <ul className="ftr__social">
              {icons.map((s) => (
                <li key={s.key}>
                  <a
                    className="ftr__icon"
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    /* The mark is the only content, so the link would other-
                       wise have no accessible name at all. */
                    aria-label={s.label}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {ICONS[s.key]}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {!textLinks.length && !icons.length ? (
            <span className="mono-note">{dict.contact.pending}</span>
          ) : null}
        </div>
      </div>

      <div className="wrap ftr__base">
        <span className="mono-note">
          © {year} {PROFILE.name} · {dict.footer.rights}
        </span>
        <span className="mono-note ftr__handle">{PROFILE.handle}</span>
      </div>
    </footer>
  );
}
