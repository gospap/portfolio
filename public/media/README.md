# Where the images go

Drop files in with these exact names and they appear automatically — no code
change. Anything missing falls back to a generated plate (`src/lib/plates.js`),
which is a deliberate design, not a placeholder, so the site is never broken by
an image you have not made yet.

## Hero portrait

```
public/media/portrait.jpg
```

Portrait crop, roughly **4:5**, at least 800px wide. Shown in the left column of
the hero. Until it exists the panel shows a "GP" monogram plate.

## Hero card videos

The cards on the hero ring are **video**, not stills. A card plays its clip
when it turns square-on to the camera and pauses on its last frame when it
turns away — only ever one playing at a time, because nine decoding videos
would cost more than the whole rest of the scene.

```
public/media/vids/async-proctoring.mp4
public/media/vids/overpass.mp4
public/media/vids/livelyvend.mp4
public/media/vids/beasypro.mp4
public/media/vids/vibeway.mp4
public/media/vids/property-hub.mp4
public/media/vids/broadcast-box.mp4
public/media/vids/space-canvas.mp4
public/media/vids/mechanical-cad.mp4
```

**Landscape 16:9**, H.264 `.mp4`, **no audio** (the cards are muted, so a silent
track is wasted bytes). Keep them short and loopable — 6–12 seconds — and
small; these load on the landing page. **1280 × 720 is plenty.**

16:9 means a plain screen recording works: record the site or app at 1280 × 720
and it drops straight in with no cropping.

Every card also carries a **label plate** across its top with its number, title
and kicker, drawn over the video. That text comes from `projects.js`, so you do
not need to burn it into the clip.

## Showcase card stills

These feed the plates on `/work`, `/apps` and `/hardware` — not the hero.

```
public/media/cards/overpass.jpg
public/media/cards/livelyvend.jpg
public/media/cards/beasypro.jpg
public/media/cards/vibeway.jpg
public/media/cards/broadcast-box.png
public/media/cards/space-canvas.jpg
```

**Landscape, roughly 16:9** (1280 × 720 or 1600 × 900). The showcase plates are
landscape too, so an ordinary desktop screenshot fits with almost no cropping —
no need to resize your browser or crop anything first.

Three projects have **no** card image on purpose and always use a generated
plate, because there is nothing real to photograph yet:

- `property-hub` — not built
- `async-proctoring` — waiting on a capture of the proctoring console

## Detail-panel screens

```
public/media/shots/<slug>-1.jpg, -2.jpg, …
```

The strip under the write-up in a project's detail panel, listed on `images`
in `src/lib/content/projects.js`. Unlike the card these are shown at their own
aspect ratio and never cropped, so phone captures go in as-shot — `vibeway`
is six of them straight off the device.

The cover is **not** repeated here: it is the plate the reader clicked to open
the panel. A project with no `images` simply has no strip.

## Mechanical CAD — the two enclosure renders

```
public/media/cards/mechanical-cad.jpg           ← assembled view
public/media/cards/mechanical-cad-exploded.jpg  ← exploded view
```

`projects.js` already points at both: the assembled one is the card, the
exploded one is the first image in the detail gallery. That way round because
an exploded view shrunk to card size reads as a grey smear — it needs the
room the detail panel gives it.

The renders are on a pale ground, which is the same silver the page is, so no
cropping or background removal is needed. `.jpg` as named; if you export PNG,
change the two paths on the `mechanical-cad` record to match.

To give those a real image later, drop the file in as above and set `cover` on
that record in `src/lib/content/projects.js`.

## Naming

The filename is the project's `slug` in `src/lib/content/projects.js`. If you
add a project, its card image is `cards/<slug>.jpg`.

`.jpg`, `.png` and `.webp` all work — if you use a different extension, update
`cover` on the record to match.
