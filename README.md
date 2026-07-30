# Portfolio — Giorgos Papanikolaou

Next.js 16 · React 19 · React Three Fiber · three.js · Lenis · plain CSS.
**No TypeScript** — every file is `.jsx` / `.js`, with `jsconfig.json` carrying
the `@/*` alias.

```bash
npm install
npm run dev     # http://localhost:3006
npm run build   # what Vercel runs
```

## Where things are

```
src/
  proxy.js                 locale routing (Next 16's replacement for middleware)
  app/
    [locale]/              the root layout lives here — <html lang> needs the locale
      page.jsx             landing: hero ring, featured helix, index, capabilities,
                           process strip, now, about, contact
      work|apps|hardware/  one component, three slices of the project list
      about|contact/
    globals.css  site.css  home.css  pages.css
    sitemap.js  robots.js  icon.svg
  components/
    hero/                  bent-card carousel  (bent.js is ported from pmndrs)
    helix/                 project helix + detail panel + pane shader
    SiteHeader  SiteFooter  LocaleSwitch  Reveal  ProcessStrip
    ContactRows  ProjectsRoute  CanvasBoundary
  lib/
    motion.js              springs, damping, detents  ← read this first
    scroll.js              the single Lenis instance
    plates.js              canvas-drawn card art
    useCardTextures.js  useNearViewport.js  site.js
    content/               projects.js · profile.js · i18n/
```

## The two rules that hold the motion together

**One scroll value.** There is not a single `window.addEventListener("scroll")`
in this codebase. Lenis animates the page on its own rAF loop, so anything
reading the browser's scroll events is drawing a frame from a slightly
different moment than the one it is animating — which no amount of camera
smoothing hides. Everything reads `lib/scroll.js` instead, per frame.

**Time constants, never blend factors.** Nothing calls `lerp(a, b, 0.1)`.
Every animated value goes through `lib/motion.js`, whose functions take a
half-life in seconds and are therefore identical at 30, 60 and 144 fps.

The helix takes this one step further: the camera pose is never smoothed at
all. A single scalar — the fractional card index — is sprung, and the pose is
computed exactly from it, so the camera is always precisely on its rail and
precisely on aim. Smoothing position and rotation separately (the usual
approach) lets them converge at different rates, which slides the focused card
off-centre for the duration of every move.

## Editing content

Everything is in `src/lib/content/`:

- `projects.js` — one record per project; its shape is documented at the top of
  the file and checked at import time in development.
- `profile.js` — name, links, studies. Fields left empty are dropped from the
  UI rather than rendered as dead links, so the `TODO`s are safe to leave.
- `i18n/en.js`, `i18n/el.js` — all UI copy. Keep the two in step.

## Card art

Everything is **16:9**. Nothing falls over when a file is missing: both the hero
cards and the showcase plates fall back to art drawn on a canvas at runtime
(`lib/plates.js`) and upgrade the moment the real media resolves.

- Hero ring → **video**, `public/media/vids/<slug>.mp4`, muted, ~1280 × 720.
  A card plays only while it faces the camera; the rest hold their last decoded
  frame. Each card draws its own label plate (number, title, kicker) over the
  video from `projects.js`, so don't burn text into the clip.
- Showcase plates → **stills**, `public/media/cards/<slug>.jpg`.
- Hero portrait → `public/media/portrait.jpg`, 4:5.

Full details, including which projects deliberately have no media, are in
[`public/media/README.md`](public/media/README.md).

## Deploying

Push and import into Vercel; the defaults are correct. Set
`NEXT_PUBLIC_SITE_URL` to the final domain so canonicals, the sitemap and
Open Graph URLs are absolute and right.
