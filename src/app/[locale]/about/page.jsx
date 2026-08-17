import { DEFAULT_LOCALE, getDict, href, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import Reveal from "@/components/Reveal";
import StudyStack from "@/components/three/StudyStack";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: dict.about.title, description: dict.about.lead };
}

export default async function About({ params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);
  const { study } = PROFILE;
  const school = study.school[loc] || study.school.en;

  return (
    <>
      <header className="phead theme-silver">
        <div className="wrap">
          <p className="kicker">{PROFILE.name}</p>
          <h1 className="phead__title">{dict.about.title}</h1>
          <p className="lead phead__lead">{dict.about.lead}</p>
        </div>
      </header>

      <section className="wrap theme-silver">
        <div className="about__body">
          <Reveal className="about__prose">
            {dict.about.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <Reveal index={1} className="about__aside">
            <div>
              <p className="kicker">{dict.about.studyKicker}</p>
              <p className="about__year">
                {study.year}
                <span className="about__yearOf">/ {study.of}</span>
              </p>
              {/* The bar says "fourth of five" faster than the sentence does,
                  and it is the one fact on this page that is a number. */}
              <div className="about__progress" aria-hidden>
                {Array.from({ length: study.of }, (_, i) => (
                  <span
                    key={i}
                    className={`about__pip${i < study.year ? " is-done" : ""}`}
                  />
                ))}
              </div>

              {/* …and the same numbers a third time, as cut stock: four
                  segments finished, the fifth still raw. See StudyColumn. */}
              <StudyStack done={study.year} total={study.of} />
            </div>
            <div>
              <p className="about__asideTitle">
                {study.program[loc] ?? study.program.en}
              </p>
              {school ? <p className="about__asideBody">{school}</p> : null}
              <p className="about__asideBody">{dict.about.studyBody}</p>
            </div>
          </Reveal>
        </div>

        <div className="about__values">
          {dict.about.values.map((v, i) => (
            <Reveal key={v.title} index={i} className="about__value">
              <p className="mono-note" style={{ color: "var(--accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="about__valueTitle" style={{ marginTop: "1rem" }}>
                {v.title}
              </h2>
              <p className="about__valueBody">{v.body}</p>
            </Reveal>
          ))}
        </div>

        {/* ——— open source ———
            Not a project card. These have no status, no year and no gallery,
            and they are not client work, so they get their own shape rather
            than being forced into the one projects.js describes. */}
        <section className="oss">
          <Reveal className="oss__head">
            <p className="kicker">{dict.about.openSourceKicker}</p>
            <h2 className="h2">
              <span className="line-clip">
                <span>{dict.about.openSourceTitle}</span>
              </span>
            </h2>
            <p className="lead tint-in">{dict.about.openSourceLead}</p>
          </Reveal>

          {dict.about.openSource.map((o, i) => (
            <Reveal key={o.name} index={i}>
              <article className="oss__card card">
                <header className="oss__top">
                  <h3 className="oss__name">
                    <span className="oss__org">{o.org}/</span>
                    {o.name}
                  </h3>
                  <ul className="oss__tags">
                    <li className="oss__tag oss__tag--role">{o.role}</li>
                    <li className="oss__tag">{o.licence}</li>
                  </ul>
                </header>

                <p className="oss__summary">{o.summary}</p>

                <ol className="oss__points">
                  {o.points.map((p, n) => (
                    <li key={n}>
                      <span className="oss__num mono-note">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      <p>{p}</p>
                    </li>
                  ))}
                </ol>

                <a
                  className="btn-line oss__cta"
                  href={o.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {dict.about.openSourceCta}
                  <span aria-hidden>↗</span>
                </a>
              </article>
            </Reveal>
          ))}
        </section>

        <Reveal className="section-pad" style={{ textAlign: "center" }}>
          <Link className="btn" href={href(loc, "/contact")}>
            {dict.home.contactCta}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
