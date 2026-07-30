import { DEFAULT_LOCALE, getDict, isLocale } from "@/lib/content/i18n";
import { byKind, localise } from "@/lib/content/projects";
import Showcase from "@/components/showcase/Showcase";

/**
 * /work, /apps and /hardware are this component three times over. They differ
 * only in which slice of the project list they pass down and which block of
 * copy heads the page — so the behaviour is defined once and cannot drift
 * between them.
 */
export default function ProjectsRoute({ locale, kind, pageKey }) {
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);
  const copy = dict.pages[pageKey];
  const items = byKind(kind).map((p) => localise(p, loc));

  return (
    <>
      <header className="phead theme-silver">
        <div className="wrap">
          <p className="kicker">{dict.helix.counter}</p>
          <h1 className="phead__title">{copy.title}</h1>
          <p className="lead phead__lead">{copy.lead}</p>
        </div>
        <span className="phead__count" aria-hidden>
          {String(items.length).padStart(2, "0")}
        </span>
      </header>

      {items.length ? (
        <Showcase items={items} dict={dict} />
      ) : (
        <p className="wrap lead">{dict.helix.empty}</p>
      )}
    </>
  );
}
