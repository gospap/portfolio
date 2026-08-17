import Link from "next/link";
import { DEFAULT_LOCALE, getDict, href, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";
import { PROJECTS, ROUTE_FOR, bySlug, localise } from "@/lib/content/projects";
import { PLATE_STYLES } from "@/lib/plates";
import HeroCarousel from "@/components/hero/HeroCarousel";
import FeaturedWall from "@/components/home/FeaturedWall";
import SkillGrid from "@/components/home/SkillGrid";
import ProcessStrip from "@/components/ProcessStrip";
import Reveal from "@/components/Reveal";
import ScrubQuote from "@/components/home/ScrubQuote";
import StatementStack from "@/components/home/StatementStack";
import DisciplineIndex from "@/components/home/DisciplineIndex";
import CountUp from "@/components/home/CountUp";
import TiltPanel from "@/components/home/TiltPanel";
import MagneticCta from "@/components/home/MagneticCta";

/* The home showcase is a curated five, not the whole list. The full sets
   live on their own routes. */
const FEATURED = [
  "overpass",
  "livelyvend",
  "async-proctoring",
  "beasypro",
  "property-hub",
];

const LANES = [
  { key: "work", kind: "web" },
  { key: "apps", kind: "app" },
  { key: "hardware", kind: "hardware" },
];

/* The stack, for the grid in section 04. Product names are not translated —
   PostgreSQL is PostgreSQL in both — so only the descriptions carry locales.
   Ordered front to back: what a visitor sees first is the interface layer and
   the last thing is the network under it, which is the order the work is
   actually built in. */
const SKILLS = [
  {
    key: "next",
    title: "Next.js",
    en: {
      kicker: "App Router · RSC",
      body: "Server components, route handlers and static generation — including this site, which prerenders every locale rather than rendering Greek on demand.",
    },
    el: {
      kicker: "App Router · RSC",
      body: "Server components, route handlers και στατικές σελίδες. Και αυτός ο ιστότοπος, που βγάζει έτοιμες και τις δύο γλώσσες στο build.",
    },
  },
  {
    key: "react",
    title: "React",
    en: {
      kicker: "Hooks · React Three Fiber",
      body: "Including the parts most projects never reach: frame loops writing straight to the DOM or the GPU rather than through state, because re-rendering a tree sixty times a second to move one element is the wrong mechanism.",
    },
    el: {
      kicker: "Hooks · React Three Fiber",
      body: "Και τα κομμάτια που σπάνια χρειάζεται κανείς: loops που γράφουν κατευθείαν στο DOM ή στην GPU, χωρίς state — δεν ξαναχτίζεις ένα δέντρο εξήντα φορές το δευτερόλεπτο για να κουνήσεις ένα στοιχείο.",
    },
  },
  {
    key: "node",
    title: "Node.js",
    en: {
      kicker: "Services · realtime",
      body: "REST and WebSocket services behind live products — a live-selling platform, a hiring pipeline — plus the video pipelines that feed them.",
    },
    el: {
      kicker: "Υπηρεσίες · realtime",
      body: "Υπηρεσίες REST και WebSocket πίσω από προϊόντα που είναι ήδη σε χρήση, μαζί με το κομμάτι του βίντεο.",
    },
  },
  {
    key: "mongodb",
    title: "MongoDB",
    en: {
      kicker: "Document stores",
      body: "Native driver rather than an ODM where the schema is genuinely fluid, and aggregation pipelines for the reporting that would otherwise be six round trips.",
    },
    el: {
      kicker: "Αποθήκες εγγράφων",
      body: "Native driver αντί για ODM όταν η δομή αλλάζει συχνά, και aggregation pipelines για αναφορές που αλλιώς θέλουν πέντε-έξι ερωτήματα.",
    },
  },
  {
    key: "postgres",
    title: "PostgreSQL",
    en: {
      kicker: "Relational · transactional",
      body: "Where the data has shape and the constraints belong in the database rather than in whichever service happens to be writing that week.",
    },
    el: {
      kicker: "Σχεσιακή · συναλλακτική",
      body: "Όταν τα δεδομένα έχουν σταθερή δομή και οι κανόνες πρέπει να είναι στη βάση, όχι σε κάθε υπηρεσία ξεχωριστά.",
    },
  },
  {
    key: "kerberos",
    title: "Kerberos",
    en: {
      kicker: "Authentication · SPNEGO",
      body: "Ticket-based single sign-on end to end: realms and KDCs, keytabs, SPNEGO over a reverse proxy, and the delegation edge cases that only show up against a real domain controller.",
    },
    el: {
      kicker: "Ταυτοποίηση · SPNEGO",
      body: "Single sign-on με tickets: realms και KDC, keytabs, SPNEGO πίσω από reverse proxy, και τα θέματα delegation που βγαίνουν μόνο πάνω σε πραγματικό domain controller.",
    },
  },
  {
    key: "systems",
    title: "Systems & Networking",
    en: {
      kicker: "Architecture · IP",
      body: "Web servers and reverse proxies, addressing and subnets, DNS and TLS. Knowing which layer a fault is actually in before changing anything.",
    },
    el: {
      kicker: "Αρχιτεκτονική · IP",
      body: "Web servers και reverse proxies, διευθύνσεις και υποδίκτυα, DNS και TLS. Να ξέρω σε ποιο επίπεδο είναι η βλάβη πριν αλλάξω κάτι.",
    },
  },
  {
    key: "security",
    title: "Security",
    en: {
      kicker: "Hardening · rate limiting",
      body: "Rate limiting, firewalls and attack prevention on services that are open to the internet. Assume the traffic is hostile and size the limits for it.",
    },
    el: {
      kicker: "Θωράκιση · rate limiting",
      body: "Rate limiting, firewalls και προστασία από επιθέσεις σε υπηρεσίες ανοιχτές στο internet. Η κίνηση θεωρείται εχθρική και τα όρια μπαίνουν ανάλογα.",
    },
  },
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
      /* Anything not shipped yet says so on the card itself. Read off `status`
         rather than listed by slug, so marking a project live in projects.js
         is the only edit needed to clear the badge. */
      badge:
        p.status === "soon" || p.status === "wip" ? dict.status[p.status] : "",
      plate: PLATE_STYLES[i % PLATE_STYLES.length],
      /* the background colour inside this card's portal */
      tint: p.tint,
      route: href(loc, `${ROUTE_FOR[p.kind]}#${p.slug}`),
    };
  });

  const featured = FEATURED.map((slug) => localise(bySlug(slug), loc));

  /* Flattened for the grid: product names are shared, only the descriptions
     carry a locale. */
  const skills = SKILLS.map((s) => ({
    slug: s.key,
    title: s.title,
    kicker: s[loc]?.kicker ?? s.en.kicker,
    body: s[loc]?.body ?? s.en.body,
  }));

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
    PROFILE.name,
    dict.hero.role,
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
          <div className="stmt__side">
            <Reveal>
              <p className="kicker">{dict.home.statementKicker}</p>
              <p className="stmt__note">{dict.home.statementNote}</p>
            </Reveal>
            {/* the sentence beside it, as an object — see StatementScene */}
            <StatementStack />
          </div>
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
      {/* The helix, and ONLY here. /work, /apps and /hardware keep the flat
          showcase: those are pages you go to in order to read, and a column
          you have to fly through is the wrong shape for reading. */}
      <div className="feat curtain">
        <section className="feat__head theme-metal">
          <div className="wrap">
            <Reveal>
              <p className="kicker">{dict.home.featuredKicker}</p>
              {/* The heading wipes up from behind its own baseline and the
                  lead resolves from muted to full — see .line-clip and
                  .tint-in. Both are driven by the .is-in this Reveal adds. */}
              <h2 className="h2 feat__title">
                <span className="line-clip">
                  <span>{dict.home.featuredTitle}</span>
                </span>
              </h2>
            </Reveal>
          </div>
        </section>
        <FeaturedWall
          items={featured}
          dict={dict}
          routeFor={(p) => href(loc, `${ROUTE_FOR[p.kind]}#${p.slug}`)}
        />

        {/* ——— open source, directly under the work ———
            Inside the same curtain as the wall rather than a section of its
            own: it belongs to the work above it, and giving it its own
            stage/curtain would insert a full-viewport wipe between a project
            grid and a single card — announcing it far louder than one card
            can carry.

            Small on purpose. It is one card wide, one paragraph deep, and the
            depth lives on the repository at the other end of the link. */}
        <section className="oss">
          <div className="wrap">
            <Reveal className="oss__head">
              <p className="kicker">{dict.home.openSourceKicker}</p>
              <h2 className="h2 oss__title">
                <span className="line-clip">
                  <span>{dict.home.openSourceTitle}</span>
                </span>
              </h2>
            </Reveal>

            {dict.home.openSource.map((o, i) => (
              <Reveal key={o.name} index={i + 1}>
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

                  <a
                    className="btn-line oss__cta"
                    href={o.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {dict.home.openSourceCta}
                    <span aria-hidden>↗</span>
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* ——— 03 · disciplines ————————————————————————————————————— */}
      <section className="section-pad theme-silver curtain">
        <div className="wrap">
          <Reveal className="home__introHead">
            <p className="kicker">{dict.home.introKicker}</p>
            <h2 className="h2 home__introTitle">
              <span className="line-clip">
                <span>{dict.home.introTitle}</span>
              </span>
            </h2>
            <p className="lead home__introBody tint-in">{dict.home.introBody}</p>
          </Reveal>
        </div>

        {/* Full-bleed index rows rather than a card grid — the third grid of
            three boxes on one page is what makes a site look generated. The
            wash under a row tracks the pointer; see DisciplineIndex. */}
        <DisciplineIndex lanes={lanes} />
      </section>

      {/* ——— 04 · the stack ——————————————————————————————————————— */}
      {/* Deliberately the plainest section on the page. It was a pinned deck
          for a while and that was the wrong instrument: someone scanning for
          "do they know Postgres" should not have to scroll four viewports to
          find out. Flat grid, hover state, done. */}
      {/* A CURTAIN, not a stage, and it must be one or the other — never
          neither.

          Not a stage: a stage pins itself, contributes nothing to the flow and
          clips to `overflow: hidden`, so it only works for content that fits
          in one viewport. This does not — measured at 1280x720 it needs 1290px
          against a 720px stage, so 570px of the grid was unreachable.

          But a plain section is not the answer either, and that mistake is
          invisible until you scroll onto it. The statement section above is
          sticky and stays pinned for the whole page; the ONLY thing keeping it
          out of the sections that follow is `.curtain`, which gives them
          `position: relative; z-index: 10` and an opaque background. Drop the
          class and this section paints UNDER the pinned statement, so the
          quote reads straight through the middle of the grid. */}
      <section className="section-pad cap theme-silver curtain">
        <div className="wrap">
          <Reveal className="cap__head">
            <p className="kicker">{dict.home.capabilitiesKicker}</p>
            <h2 className="h2">
              <span className="line-clip">
                <span>{dict.home.capabilitiesTitle}</span>
              </span>
            </h2>
          </Reveal>
          <SkillGrid items={skills} />
        </div>
      </section>

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
            <h2 className="h2 now__title">
              <span className="line-clip">
                <span>{dict.home.nowTitle}</span>
              </span>
            </h2>
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
