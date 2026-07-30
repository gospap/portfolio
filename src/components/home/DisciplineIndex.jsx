"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";

/**
 * The three disciplines as an index of full-bleed rows.
 *
 * The wash under a row used to be a fixed gradient that switched on at hover.
 * Now it follows the pointer: the row publishes where the cursor is as --px,
 * and the CSS puts the light there. No timers and no frame loop — it only
 * moves when you do, so a still page costs nothing.
 *
 * Touch never fires pointermove without a press, so --px keeps its 50%
 * default there and the row lights from the centre. That is the right
 * behaviour rather than a fallback: there is no cursor to follow.
 */
export default function DisciplineIndex({ lanes }) {
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      "--px",
      `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`,
    );
  };
  const onLeave = (e) => e.currentTarget.style.removeProperty("--px");

  return (
    <div className="disc">
      {lanes.map((lane, i) => (
        <Reveal key={lane.key} index={i}>
          <Link
            href={lane.href}
            className="disc__row"
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          >
            <span className="disc__num mono-note">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="disc__title">{lane.title}</span>
            <span className="disc__body">{lane.body}</span>
            <span className="disc__count mono-note">
              {String(lane.count).padStart(2, "0")}
            </span>
            <span className="disc__arrow" aria-hidden>
              →
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
