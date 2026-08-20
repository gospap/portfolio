# Giorgos Papanikolaou

Personal site. [Zola](https://www.getzola.org) with the
[Duckquill](https://codeberg.org/daudix/duckquill) theme, in black and midnight
purple, in English and Greek.

```bash
git clone --recurse-submodules https://github.com/gospap/portfolio.git
zola serve                     # http://127.0.0.1:1111
zola build                     # writes ./public
```

The theme is a git submodule. If you cloned without `--recurse-submodules`,
run `git submodule update --init` or the build will fail with missing templates.

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
  _index.md           home            (+ _index.el.md for Greek)
  blog/_index.md      the post list
  blog/<slug>/        one folder per post, images colocated
  links/index.md      profile list
  contact/index.md    direct routes
i18n/en.toml el.toml  every string the theme renders
sass/portfolio.scss   palette override and page furniture
templates/            the two theme files this site forks
static/               card.png, Search Console verification
themes/duckquill/     submodule
```

Greek is a second file next to the English one, `index.el.md` beside
`index.md`. Adding a page means adding both, or the Greek nav will 404 on it.

## The two forked theme files

Everything else comes from the theme untouched. These two do not, and both
carry a comment saying so:

- `templates/partials/head.html` adds `hreflang` alternates, so the English and
  Greek pages read as translations of one page rather than as duplicates, and a
  `Person` JSON-LD record on the home page. Duckquill offers no hook inside
  `<head>`, so the file is a copy with an addition at the bottom. When the theme
  updates, re-copy it and re-apply that block.
- `templates/shortcodes/lane.html` is new, not a fork. It renders the cards on
  the home page. Pass `url` for an internal `@/path.md` link, which resolves per
  language, or `href` for an external one.

## Colours

`config.extra.accent_color` and `accent_color_dark` drive the whole palette,
because Duckquill derives its dark background as `color-mix(accent 10%, black)`.
`sass/portfolio.scss` then pins the ground to near black and the raised surfaces
to the purple.

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
