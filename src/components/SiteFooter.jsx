import Link from "next/link";
import { href } from "@/lib/content/i18n";
import { PROFILE, socialLinks } from "@/lib/content/profile";

const ROUTES = [
  { path: "/work", key: "work" },
  { path: "/apps", key: "apps" },
  { path: "/hardware", key: "hardware" },
  { path: "/about", key: "about" },
  { path: "/contact", key: "contact" },
];

export default function SiteFooter({ locale, dict }) {
  const links = socialLinks();
  const year = 2026; // stamped, not computed — a server/client mismatch on a
  // date is a hydration warning for no benefit on a footer

  return (
    <footer className="ftr theme-silver">
      <div className="wrap ftr__inner">
        <div className="ftr__brand">
          <p className="ftr__name">{PROFILE.name}</p>
          <p className="ftr__role">{dict.hero.role}</p>
          <p className="ftr__built">{dict.footer.built}</p>
        </div>

        <nav className="ftr__nav" aria-label={dict.nav.menu}>
          {ROUTES.map((r) => (
            <Link key={r.path} href={href(locale, r.path)}>
              {dict.nav[r.key]}
            </Link>
          ))}
        </nav>

        <div className="ftr__links">
          {links.length ? (
            links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                {...(l.key === "email"
                  ? {}
                  : { target: "_blank", rel: "noreferrer noopener" })}
              >
                {l.label}
              </a>
            ))
          ) : (
            <span className="mono-note">{dict.contact.pending}</span>
          )}
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
