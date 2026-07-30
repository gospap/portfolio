import Link from "next/link";
import { DEFAULT_LOCALE, getDict, href, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import { PROJECTS, ROUTE_FOR, bySlug, localise } from "@/lib/content/projects";
import { PLATE_STYLES } from "@/lib/plates";
import HeroCarousel from "@/components/hero/HeroCarousel";
import Showcase from "@/components/showcase/Showcase";
import ProcessStrip from "@/components/ProcessStrip";
import Reveal from "@/components/Reveal";
import ScrubQuote from "@/components/home/ScrubQuote";
import DisciplineIndex from "@/components/home/DisciplineIndex";
import CapabilityDeck from "@/components/home/CapabilityDeck";
import CountUp from "@/components/home/CountUp";
import TiltPanel from "@/components/home/TiltPanel";
import MagneticCta from "@/components/home/MagneticCta";

const LANES = [
  { key: "work", kind: "web" },
  { key: "apps", kind: "app" },
  { key: "hardware", kind: "hardware" },
];

/* The home showcase is a curated five, not the whole list: one from each
   discipline plus the two that carry the most weight. The full sets live on
   their own routes. */
const FEATURED = [
  "overpass",
  "livelyvend",
  "async-proctoring",
  "beasypro",
  "property-hub",
];

export default async function Home({ params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);

  /* The hero cards are video, not screenshots: each one plays `/media/vids/
     <slug>.mp4` when it turns square-on to the camera, and falls back to a
     generated plate until that file exists. The still covers in projects.js
     are still used by the showcase plates further down the page — only the
     ring switched to motion. */
  const cards = PROJECTS.filter(
    (p) => !["overpass", "mechanical-cad"].includes(p.slug),
  ).map((p, i) => {
    const t = localise(p, loc);
    return {
      key: p.slug,
      slug: p.slug,
      label: t.title,
      sub: t.kicker,
      video: `/media/vids/${p.slug}.mp4`,
      plate: PLATE_STYLES[i % PLATE_STYLES.length],
      /* the background colour inside this card's portal */
      tint: p.tint,
      route: href(loc, `${ROUTE_FOR[p.kind]}#${p.slug}`),
    };
  });

  const featured = FEATURED.map((slug) => localise(bySlug(slug), loc));

  /* Resolved here rather than inside the index: DisciplineIndex is a client
     component for the pointer tracking, and the project list has no business
     crossing that boundary just to be counted. */
  const lanes = LANES.map((lane) => ({
    key: lane.key,
    href: href(loc, ROUTE_FOR[lane.kind]),
    count: PROJECTS.filter((p) => p.kind === lane.kind).length,
    ...dict.home.lanes[lane.key],
  }));

  const bannerWords = [
    PROFILE.name.toUpperCase(),
    dict.hero.role.toUpperCase(),
  ];

  return (
    <>
      <HeroCarousel
        cards={cards}
        dict={dict}
        name={PROFILE.name}
        bannerWords={bannerWords}
        portrait={PROFILE.photo}
      />

      {/* ——— 01 · position ———————————————————————————————————————— */}
      {/* Theme alternates down the page: silver where you read, deeper metal
          where something is rendered. The classes flip six tokens; nothing
          below them knows which ground it is on.

          The rhythm is stage → curtain → stage → curtain: odd sections pin
          themselves to the viewport, even ones scroll up over them. See the
          STAGE / CURTAIN block in globals.css. */}
      <section className="section-pad stmt theme-silver stage">
        <div className="wrap stmt__inner">
          <Reveal className="stmt__side">
            <p className="kicker">{dict.home.statementKicker}</p>
            <p className="stmt__note">{dict.home.statementNote}</p>
          </Reveal>
          {/* No Reveal on the quote: it inks itself in word by word off the
              scroll position, and a fade-up underneath that would be two
              entrances fighting over the same element. */}
          <div className="stmt__quoteWrap">
            <ScrubQuote
              text={dict.home.statementQuote}
              className="stmt__quote"
            />
          </div>
        </div>
      </section>

      {/* ——— 02 · selected work ——————————————————————————————————— */}
      <div className="feat curtain">
        <section className="feat__head theme-metal">
          <div className="wrap">
            <Reveal>
              <p className="kicker">{dict.home.featuredKicker}</p>
              <h2 className="h2 feat__title">{dict.home.featuredTitle}</h2>
              <p className="lead feat__lead">{dict.home.featuredLead}</p>
            </Reveal>
          </div>
        </section>
        <Showcase items={featured} dict={dict} />
      </div>

      {/* ——— 03 · disciplines ————————————————————————————————————— */}
      <section className="section-pad theme-silver curtain">
        <div className="wrap">
          <Reveal className="home__introHead">
            <p className="kicker">{dict.home.introKicker}</p>
            <h2 className="h2 home__introTitle">{dict.home.introTitle}</h2>
            <p className="lead home__introBody">{dict.home.introBody}</p>
          </Reveal>
        </div>

        {/* Full-bleed index rows rather than a card grid — the third grid of
            three boxes on one page is what makes a site look generated. The
            wash under a row tracks the pointer; see DisciplineIndex. */}
        <DisciplineIndex lanes={lanes} />
      </section>

      {/* ——— 04 · capability index ———————————————————————————————— */}
      {/* This was a table you scrolled past. It is now a pinned deck that
          deals one group at a time — the section's own scroll runway IS the
          animation, so it takes the place of a `stage` here rather than
          sitting on top of one. */}
      <CapabilityDeck
        groups={dict.home.capabilities}
        kicker={dict.home.capabilitiesKicker}
        title={dict.home.capabilitiesTitle}
        lead={dict.home.capabilitiesLead}
      />

      {/* ——— 05 · process, sideways ——————————————————————————————— */}
      <ProcessStrip
        steps={dict.home.process}
        kicker={dict.home.processKicker}
        title={dict.home.processTitle}
      />

      {/* ——— 06 · now ————————————————————————————————————————————— */}
      <section className="section-pad now theme-silver curtain">
        <div className="wrap">
          <Reveal>
            <p className="kicker">{dict.home.nowKicker}</p>
            <h2 className="h2 now__title">{dict.home.nowTitle}</h2>
          </Reveal>
          <div className="now__rows">
            {dict.home.now.map((n, i) => (
              <Reveal key={n.label} index={i} className="now__row">
                <span className="mono-note now__label">{n.label}</span>
                <span className="now__value">{n.value}</span>
                <span className="now__note">{n.note}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 07 · about ——————————————————————————————————————————— */}
      <section className="section-pad home__about theme-metal stage">
        <div className="wrap home__aboutInner">
          <Reveal className="home__aboutCopy">
            <p className="kicker">{dict.home.aboutKicker}</p>
            <p className="home__aboutLead">{dict.about.lead}</p>
            <Link
              className="btn btn-ghost home__aboutCta"
              href={href(loc, "/about")}
            >
              {dict.home.aboutCta}
              <Arrow />
            </Link>
          </Reveal>

          <Reveal index={1}>
            <TiltPanel className="home__facts">
              <Fact
                label={dict.about.studyKicker}
                value={`${PROFILE.study.year} / ${PROFILE.study.of}`}
                note={PROFILE.study.program[loc] ?? PROFILE.study.program.en}
              />
              <Fact
                label={dict.pages.apps.title}
                value={String(
                  PROJECTS.filter(
                    (p) => p.kind === "app" && p.status === "live",
                  ).length,
                )}
                note={dict.status.live}
              />
              <Fact
                label={dict.pages.work.title}
                value={String(PROJECTS.filter((p) => p.kind === "web").length)}
                note={dict.status.live}
              />
            </TiltPanel>
          </Reveal>
        </div>
      </section>

      {/* ——— 08 · contact ————————————————————————————————————————— */}
      <section className="section-pad home__contact theme-silver curtain">
        <div className="wrap wrap-narrow home__contactInner">
          <Reveal>
            <p className="kicker">{dict.home.contactKicker}</p>
            <h2 className="h2 home__contactTitle">{dict.home.contactTitle}</h2>
            <p className="lead">{dict.home.contactBody}</p>
            <MagneticCta
              className="btn home__contactCta"
              href={href(loc, "/contact")}
            >
              {dict.home.contactCta}
              <Arrow />
            </MagneticCta>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Fact({ label, value, note }) {
  return (
    <div className="home__fact">
      <span className="mono-note home__factLabel">{label}</span>
      <CountUp className="home__factValue" value={value} />
      <span className="home__factNote">{note}</span>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
