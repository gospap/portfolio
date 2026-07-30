/* ===========================================================================
   profile.js — every fact about the person, in one file.

   Anything marked TODO is a placeholder: the site renders correctly without
   it (links with an empty href are dropped from the footer and contact page
   rather than rendered dead), so filling these in is a one-line edit here and
   nothing else needs to move.
   =========================================================================== */

export const PROFILE = {
  name: "Giorgos Papanikolaou",
  handle: "gospap",

  // Roles, in the order they should be read. Used by the hero banner ring and
  // the <title> template.
  roles: {
    en: ["Software Engineer", "R&D Engineer"],
    el: ["Μηχανικός Λογισμικού", "Μηχανικός Έρευνας & Ανάπτυξης"],
  },

  /* Drop a portrait at this path and it appears in the hero. Until the file
     exists the panel falls back to a monogram plate, so the layout is never
     broken by a missing image — see HeroCarousel's onError. Portrait crop,
     roughly 4:5, at least 800px wide. */
  photo: "/media/portrait.png",

  email: "dev@letstudy.gr", // TODO confirm: work address or a personal one?
  github: "", // TODO
  linkedin: "", // TODO
  cv: "", // TODO e.g. "/giorgos-papanikolaou-cv.pdf" in public/

  location: { en: "Greece", el: "Ελλάδα" },

  study: {
    year: 4,
    of: 5,
    graduates: "", // TODO expected year, e.g. "2027"
    program: {
      en: "Information Technology & Electronics Engineering",
      el: "Μηχανικών Πληροφορικής & Ηλεκτρονικών",
    },
    school: { en: "", el: "" }, // TODO university + department
  },
};

/** Links, minus the ones still empty — so nothing renders as a dead anchor. */
export function socialLinks() {
  return [
    {
      key: "email",
      label: "Email",
      href: PROFILE.email ? `mailto:${PROFILE.email}` : "",
      value: PROFILE.email,
    },
    {
      key: "github",
      label: "GitHub",
      href: PROFILE.github,
      value: shortUrl(PROFILE.github),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: PROFILE.linkedin,
      value: shortUrl(PROFILE.linkedin),
    },
  ].filter((l) => l.href);
}

function shortUrl(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
