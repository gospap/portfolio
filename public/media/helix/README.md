# Helix cards

The five images on the landing page's helix, in the order the column deals
them. Drop them in with **these exact names** and they appear automatically —
no code change.

```
public/media/helix/helix1.png
public/media/helix/helix2.png
public/media/helix/helix3.png
public/media/helix/helix4.png
public/media/helix/helix5.png
```

The order is the `FEATURED` list in `src/app/[locale]/page.jsx`, so as things
stand:

| file | project | slug |
| --- | --- | --- |
| `helix1.png` | Overpass Connect | `overpass` |
| `helix2.png` | LivelyVend | `livelyvend` |
| `helix3.png` | Async Exam Proctoring | `async-proctoring` |
| `helix4.png` | BeasyPro | `beasypro` |
| `helix5.png` | Property Hub | `property-hub` |

**Reorder `FEATURED` and the numbering moves with it** — `helix1` is whatever
is first in that array, not a fixed project. That is the whole point of
numbering them by position rather than by slug: the helix is a sequence, and
the images are addressed the way the sequence is.

## Format

**Landscape, roughly 16:9** (1600 × 900 is plenty). `.png` as named above;
`.jpg` and `.webp` work too if the extension is changed where the helix items
are built.

Unlike the flat showcase on `/work`, `/apps` and `/hardware` — which falls back
to a generated plate when an image is missing — the helix builds its card from
the image itself. A missing file is a blank card, not a plate, so all five need
to exist before the section is worth showing.

These are separate from `public/media/cards/`. Those feed the flat showcase
plates and are addressed by slug; these feed the helix and are addressed by
position. A project can appear in both with different captures.
