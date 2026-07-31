# Landing-page wall

Extra photos for the masonry wall in section 1 of the landing page. These are
**not** the same as `../cards/` — those feed the flat showcase on `/work`,
`/apps` and `/hardware`, one per project. These stack inside a single card,
which makes that card taller and gives the wall its rhythm.

```
public/media/wall/overpass1.png
public/media/wall/overpass2.png
```

Set on a project with a `wall` array in `src/lib/content/projects.js`:

```js
wall: ["/media/wall/overpass1.png", "/media/wall/overpass2.png"],
```

A project with no `wall` falls back to its `cover`; one with neither shows a
plate in its own tint. Any number of photos works — two is what Overpass has.

## Format

**Landscape.** The first image is cropped to the wall's own shape rhythm, so
leave some margin around the subject. The second and later ones are shown at
16:10 and are not cropped much.

1600 px wide is plenty. `.png` as named above; `.jpg` and `.webp` work too if
the paths in `projects.js` are changed to match.
