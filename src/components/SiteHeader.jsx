"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { href } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import { onScroll } from "@/lib/scroll";
import LocaleSwitch from "./LocaleSwitch";

const ROUTES = [
  { path: "/work", key: "work" },
  { path: "/apps", key: "apps" },
  { path: "/hardware", key: "hardware" },
  { path: "/about", key: "about" },
];

export default function SiteHeader({ locale, dict }) {
  const pathname = usePathname() || "/";
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);

  const home = pathname === `/${locale}` || pathname === `/${locale}/`;

  /* Frosting threshold differs by route: on the home page the header floats
     over a full-screen canvas and should stay transparent until the hero is
     nearly gone; everywhere else content starts immediately under it. Kept in
     a ref so changing routes does not re-subscribe. */
  const threshold = useRef(0);
  useEffect(() => {
    threshold.current = home ? window.innerHeight * 0.78 : 24;
  }, [home, pathname]);

  /* Lenis's own emitter, not a window scroll listener — it fires inside the
     same rAF tick that moved the page, and is silent when nothing moves. */
  useEffect(() => onScroll((s) => setSolid(s.y > threshold.current)), []);

  /* A route change while the mobile sheet is open must close it, or the new
     page arrives underneath a menu nobody asked for. */
  useEffect(() => setMenu(false), [pathname]);

  /* The bar used to watch what was passing under it and invert itself over
     dark sections. Both themes are silver now — pale and deeper shades of the
     same metal, graphite ink on both — so one set of header colours is correct
     everywhere and the observer that maintained the other set is gone. */

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menu]);

  const isActive = (path) => pathname.startsWith(`/${locale}${path}`);

  return (
    <header
      className={`hdr${solid ? " is-solid" : ""}${menu ? " is-open" : ""}`}
    >
      <div className="hdr__inner">
        <Link className="hdr__brand" href={href(locale, "/")} aria-label={PROFILE.name}>
          <span className="hdr__name">
            <span className="hdr__nameFull">{PROFILE.name}</span>
            <span className="hdr__nameRole">{dict.hero.role}</span>
          </span>
        </Link>

        <nav className="hdr__nav" aria-label={dict.nav.menu}>
          {ROUTES.map((r) => (
            <Link
              key={r.path}
              className={`hdr__link${isActive(r.path) ? " is-active" : ""}`}
              href={href(locale, r.path)}
              aria-current={isActive(r.path) ? "page" : undefined}
            >
              {dict.nav[r.key]}
            </Link>
          ))}
        </nav>

        <div className="hdr__right">
          <LocaleSwitch locale={locale} dict={dict} />
          <Link className="hdr__cta" href={href(locale, "/contact")}>
            {dict.nav.contact}
          </Link>
          <button
            type="button"
            className="hdr__burger"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? dict.nav.close : dict.nav.menu}
            onClick={() => setMenu((v) => !v)}
          >
            <span aria-hidden />
            <span aria-hidden />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="hdr__sheet" hidden={!menu}>
        <nav aria-label={dict.nav.menu}>
          {ROUTES.concat({ path: "/contact", key: "contact" }).map((r, i) => (
            <Link
              key={r.path}
              className={`hdr__sheetLink${isActive(r.path) ? " is-active" : ""}`}
              href={href(locale, r.path)}
              style={{ "--i": i }}
            >
              {dict.nav[r.key]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
