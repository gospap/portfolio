import { DEFAULT_LOCALE, getDict, href, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import Reveal from "@/components/Reveal";
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

        <Reveal className="section-pad" style={{ textAlign: "center" }}>
          <Link className="btn" href={href(loc, "/contact")}>
            {dict.home.contactCta}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
