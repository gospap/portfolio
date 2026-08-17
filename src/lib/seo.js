/* ===========================================================================
   seo.js — structured data.

   WHAT THIS IS FOR, AND WHAT IT IS NOT
   Metadata makes a page indexable; that part was already done in layout.jsx.
   This file does the other half: it tells a search engine that the site is
   ABOUT A PERSON, which name that person goes by, and which other profiles on
   the web are the same human.

   That last point is the whole game for a name query. A crawler finding
   "Giorgos Papanikolaou" on a portfolio, on LinkedIn and on GitHub has no way
   to know those are one person rather than three — `sameAs` is the statement
   that they are, and it is what lets the profiles reinforce each other
   instead of competing.

   `alternateName` carries the handle and the spellings. Someone searching
   "gospap" is searching for a string that appears nowhere in the prose; this
   is where it is declared as a name this person answers to.

   None of this makes anything rank. It removes the ambiguity that stops a
   correct result from being served — the rest is external links and time.
   =========================================================================== */

import { PROFILE } from "@/lib/content/profile";
import { SITE_URL } from "@/lib/site";

/** Every profile that is verifiably the same person. Empty ones drop out. */
function sameAs() {
  return [PROFILE.linkedin, PROFILE.github, PROFILE.instagram].filter(Boolean);
}

/**
 * A Person graph for the site owner.
 *
 * Emitted on every page rather than only the home page: each locale is a
 * separate URL, and a crawler that lands on /el/about first should get the
 * same identity claims as one that lands on /en.
 */
export function personSchema(loc, dict) {
  const url = `${SITE_URL}/${loc}`;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: PROFILE.name,
    /* The handle, the Latin spelling used by the LinkedIn profile, and the
       Greek spelling — all three are strings someone might actually type. */
    alternateName: [PROFILE.handle, "George Papanikolaou", "Γιώργος Παπανικολάου"],
    url,
    image: `${SITE_URL}${PROFILE.photo}`,
    email: PROFILE.email ? `mailto:${PROFILE.email}` : undefined,
    jobTitle: dict.hero.role,
    worksFor: {
      "@type": "Organization",
      name: "Overpass Connect",
      url: "https://overpassconnect.com",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "GR",
    },
    knowsAbout: [
      "Software engineering",
      "Web development",
      "React",
      "Next.js",
      "WebGL",
      "three.js",
      "Node.js",
      "PostgreSQL",
      "Electronics design",
      "PCB design",
      "CAD",
    ],
    sameAs: sameAs(),
  };
}

/**
 * The site itself, bound to the person above through `@id`. Two small graphs
 * that reference each other beat one large one: a crawler that only
 * understands WebSite still resolves the publisher.
 */
export function siteSchema(loc, dict) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/${loc}`,
    name: PROFILE.name,
    description: dict.about.lead,
    inLanguage: loc === "el" ? "el-GR" : "en-GB",
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/**
 * Serialise for a <script type="application/ld+json">.
 *
 * The `<` escape is not optional. This data is ours and static today, but a
 * string containing "</script>" anywhere in it would close the tag early and
 * spill the rest into the document as markup — so it is escaped at the one
 * place every graph passes through rather than trusted per field.
 */
export function jsonLd(...graphs) {
  return JSON.stringify(graphs.length === 1 ? graphs[0] : graphs).replace(
    /</g,
    "\\u003c",
  );
}
