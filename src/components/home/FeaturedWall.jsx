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

/* Aspect per position, so the wall has a rhythm instead of five identical
   boxes. Indexed by position rather than assigned per project: the shape is a
   property of the layout, not of the work. */
const SHAPES = ["4 / 5", "1 / 1", "3 / 4", "4 / 3", "1 / 1"];

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
                  /* only the first face keeps the shape rhythm; the ones under
                     it are wider than tall so the card does not become a
                     column of squares */
                  aspectRatio: f === 0 ? SHAPES[i % SHAPES.length] : "16 / 10",
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
