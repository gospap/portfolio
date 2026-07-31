import Link from "next/link";
import Reveal from "@/components/Reveal";

/*
 * The featured work, as a flat wall.
 *
 * Masonry via CSS `columns`, not grid: a Pinterest wall is defined by cards of
 * unequal height packing tightly, and `columns` does exactly that with no
 * measuring and no JS. The trade is reading ORDER — columns flow top-to-bottom
 * then across, so card 2 sits under card 1 rather than beside it. For a wall of
 * five whose order is curation rather than ranking, that is the right trade;
 * for a numbered list it would not be.
 *
 * No canvas. /work, /apps and /hardware keep the 3D showcase — this is the
 * landing page, where the job is to show five things quickly.
 */

/* Aspect ratios for the faces. A wall reads as random when no two neighbours
   share a height and no run of shapes repeats — cycling a short list by index
   gives you a visible pattern the moment there are more items than shapes.

   So the shape is picked by HASHING the slug. That is not the same as random:
   it is stable, which matters twice over. The server and the client must agree
   or React reports a hydration mismatch, and a card must not change height
   between two visits — a wall that reshuffles on reload reads as broken rather
   than as lively.

   Eight ratios, none of them equal and none a neat multiple of another, so
   even a long wall never lands in a rhythm. */
const SHAPES = [
  "3 / 4",
  "1 / 1",
  "4 / 5",
  "5 / 7",
  "4 / 3",
  "2 / 3",
  "16 / 11",
  "5 / 6",
];

/* djb2-ish. Any stable hash does; this one is three lines and needs no import. */
function shapeFor(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return SHAPES[Math.abs(h) % SHAPES.length];
}

export default function FeaturedWall({ items, dict, routeFor }) {
  return (
    <div className="wall">
      {items.map((p, i) => (
        <Reveal key={p.slug} index={i % 3} className="wall__cell">
          <Link className="wall__card" href={routeFor(p)}>
            {/* The faces. A project can carry more than one — they stack, and
                the card simply gets taller, which in a masonry wall is exactly
                what you want the flagship to do rather than being the same box
                as everything else.

                `wall` falls back to `cover`, then to the project's own tint,
                which is a deliberate plate rather than a grey hole. */}
            {(p.wall?.length ? p.wall : [p.cover]).map((src, f) => (
              <span
                key={f}
                className="wall__face"
                style={{
                  /* Only the first face takes the hashed shape; the ones under
                     it are wider than tall so a multi-photo card does not
                     become a column of squares. */
                  aspectRatio: f === 0 ? shapeFor(p.slug) : "16 / 10",
                  "--tint": p.tint,
                  backgroundImage: src ? `url(${src})` : undefined,
                }}
                aria-hidden
              >
                {src ? null : (
                  <span className="wall__mark">{p.title.slice(0, 2)}</span>
                )}
              </span>
            ))}

            <span className="wall__body">
              <span className="mono-note wall__kicker">{p.kicker}</span>
              <span className="wall__title">{p.title}</span>
              <span className="wall__meta">
                <span>{p.year}</span>
                <span className={`wall__status wall__status--${p.status}`}>
                  {dict.status[p.status]}
                </span>
              </span>
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
