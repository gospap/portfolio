# Giorgos Papanikolaou

Personal site. [Zola](https://www.getzola.org) with the
[Duckquill](https://codeberg.org/daudix/duckquill) theme, in black and midnight
purple, in English and Greek.

```bash
git clone https://github.com/gospap/portfolio.git
zola serve                     # http://127.0.0.1:1111
zola build                     # writes ./public
```

The theme is vendored under `themes/duckquill`, not a submodule. It was a
submodule at first and Vercel would not fetch it, because the submodule lives
on Codeberg rather than on the same host as this repo; the build then failed
with `Failed to load theme duckquill` and exit 1. Vendoring also pins the
theme, which matters here: Duckquill has no release newer than v6.3.0 and its
main branch is a moving target that can break against Zola 0.21.

To update it, replace the contents of `themes/duckquill` from
https://codeberg.org/daudix/duckquill and re-apply the two forks listed below.

## Zola version

Pinned to **0.21.0**, in `vercel.json` and here. This is not arbitrary: Zola
0.23 ships a newer Tera that rejects Duckquill's own templates, because that
Tera requires every template to import the macros it uses and the theme relies
on inheriting them. Until the theme is updated, 0.21.0 is the version that
works. Newer Zola will fail loudly at build time, not silently.

## Layout

```
config.toml           site config, palette, nav, footer, Person data
content/
  _index.md           home: CRT block, hero, bio, education, open source
  work/_index.md      the project list        (+ _index.el.md for Greek)
  work/<slug>/        one folder per project, banner and stills colocated
  blog/_index.md      the post list
  blog/<slug>/        one folder per post
  contact/index.md    portrait, email and profiles, in one page
i18n/en.toml el.toml  every string the theme renders
sass/portfolio.scss   palette, headings, and the few classes the pages use
templates/            the theme files this site forks, plus work_list.html
                      and contact.html
static/               card.png, media/ (portrait, bench photo), Search Console verification
themes/duckquill/     submodule
```

The home page is generated rather than hand-written, from the copy that lived
in `src/lib/content` on `main`. Nothing on the site is retyped prose.

Greek is a second file next to the English one, `index.el.md` beside
`index.md`. Adding a page means adding both, or the Greek nav will 404 on it.

## The forked theme files

Everything else comes from the theme untouched. These two do not, and both
carry a comment saying so:

- `templates/partials/head.html` adds `hreflang` alternates, so the English and
  Greek pages read as translations of one page rather than as duplicates, and a
  `Person` JSON-LD record on the home page. Duckquill offers no hook inside
  `<head>`, so the file is a copy with an addition at the bottom. When the theme
  updates, re-copy it and re-apply that block.
- `templates/partials/articles.html` drives each project card's badge from
  `extra.status` in its front matter. Duckquill's own card states are blog
  states, and one of them ("poor") is drawn with a poop icon. It also renders
  `extra.banner` as a real thumbnail at the top of the card, with the page
  description under it; upstream only ever uses the banner as a 4x2 blur
  behind the text, which tells a reader nothing about the project.
- `templates/work_list.html` is new, not a fork. It is `article_list.html`
  without the post count and the tag filter, neither of which belongs on a
  project list.
- `templates/contact.html` is new as well. It is `page.html` without the `<h1>`:
  the reader clicked "Contact" in the nav to get there, so a heading repeating
  the word is a line that tells them nothing. The portrait takes its place, and
  `#contact` in the stylesheet centres the column.

`sass/portfolio.scss` also puts back the theme's serif headings, which
`bundled_fonts` would otherwise replace with bold Inter, turns off the accent
wash and the giant icon Duckquill paints across every card, and keeps the nav
on one row on a phone — Duckquill gives every non-circle nav item
`flex: 0 0 100%` under 480px, which stacks the bar into four separate lines.

## Colours

Black and lilac. `config.extra.accent_color` and `accent_color_dark` drive the
whole palette, because Duckquill derives its dark background as
`color-mix(accent 10%, black)`. `sass/portfolio.scss` then pins the ground to
near black and the raised surfaces to the purple.

The two accents are not the same colour. `accent_color_dark` is the one that
shows on the default theme and is a true lilac; `accent_color` is the same hue
held several steps darker, because a lilac at full lightness is not readable as
link text on a white page.

## Deploying

Vercel, with the settings committed in `vercel.json`, so nothing needs to be
configured in the dashboard and the Next.js settings on `main` are untouched.
The install step downloads the Zola musl binary and the build step runs it.

`base_url` in `config.toml` is a placeholder. The real one is passed at build
time by `vercel.json`:

- production uses `$SITE_URL` if set, else Vercel's own production domain,
- previews use their own `$VERCEL_URL`, so preview links stay in the preview.

Set `SITE_URL` in the Vercel project once the final domain is fixed, and put the
same value in `config.toml` so a plain local `zola build` is correct too.
