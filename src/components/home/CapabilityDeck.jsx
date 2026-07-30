"use client";

import { useEffect, useRef, useState } from "react";
import { scrollTo, trackSection } from "@/lib/scroll";
import { clamp01, prefersReducedMotion } from "@/lib/motion";
import { useNearViewport } from "@/lib/useNearViewport";

/**
 * The capability index as a pinned deck rather than a table you scroll past.
 *
 * The section is several viewports tall and its stage is sticky, so scrolling
 * through it deals the groups one at a time into a single cell beside a
 * heading that stays put. One scroll value drives which group is showing AND
 * the rail beneath it, which is what makes it read as one mechanism instead of
 * a list that happens to fade.
 *
 * WHY THE COPY IS ALL STILL IN THE DOM
 * Every group is rendered; the ones that are not current are hidden from
 * assistive tech rather than unmounted. To a crawler — and to a reader who has
 * asked for reduced motion, who gets the whole thing as a plain stacked list —
 * this is one readable block of prose.
 *
 * ROUND, NOT FLOOR
 * A group changes over at the halfway point between two rest positions rather
 * than the instant you start moving, so a small scroll nudge does not flip the
 * panel out from under someone who is reading it.
 */

/* Dead zones at both ends of the runway. Without them the first group flips
   away almost as soon as the stage pins, and the last never gets a moment of
   stillness before the section releases. */
const LEAD_IN = 0.06;
const USABLE = 0.88;

/* Scroll runway per changeover. Tuned against the horizontal strip further
   down the page: a shade slower there, because sideways travel needs more
   room to read than a cross-fade does. */
const VH_PER_STEP = 105;

export default function CapabilityDeck({ groups, kicker, title, lead }) {
  const section = useRef(null);
  const tracker = useRef(null);
  const [step, setStep] = useState(0);
  const n = groups.length;
  /* The deck is deep in the page; there is no reason for its frame loop to be
     running while the visitor is still in the hero. */
  const near = useNearViewport(section, false, "60% 0px");

  useEffect(() => {
    const el = section.current;
    if (!el || n < 2) return;

    /* The pinned behaviour is opt-IN, added here rather than switched off by a
       `--static` class. The section ships from the server as an ordinary
       stacked index, so the states that never reach this line — reduced
       motion, JS off, a hydration error — all land on the readable one instead
       of on four viewports of blank runway showing a single group. */
    if (prefersReducedMotion()) return;
    el.classList.add("is-live");

    const t = trackSection(el);
    tracker.current = t;
    return () => {
      el.classList.remove("is-live");
      t.dispose();
      tracker.current = null;
    };
  }, [n]);

  useEffect(() => {
    if (!near) return;
    const t = tracker.current;
    if (!t) return;

    let raf = 0;
    let shown = -1;
    const tick = () => {
      const p = clamp01((t.read() - LEAD_IN) / USABLE);
      const next = Math.round(p * (n - 1));
      // setState only on a changeover — a handful of renders for the section,
      // not one per frame
      if (next !== shown) {
        shown = next;
        setStep(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, n]);

  /* The rail is not decoration: a deck this tall is tedious to scrub through
     to reach the last group, so its ticks are buttons that seek to one. */
  const seek = (i) => {
    const t = tracker.current;
    if (!t) return;
    scrollTo(t.top() + (LEAD_IN + (i / (n - 1)) * USABLE) * t.span());
  };

  return (
    <section
      ref={section}
      className="deck theme-silver curtain"
      /* The runway is a variable, not a height: the CSS only spends it once
         the section is live, so the static state keeps its natural height. */
      style={{ "--runway": `${100 + (n - 1) * VH_PER_STEP}vh` }}
    >
      <div className="deck__stage">
        <div className="wrap deck__inner">
          <div className="deck__side">
            <p className="kicker">{kicker}</p>
            <h2 className="h2 deck__title">{title}</h2>
            <p className="lead deck__lead">{lead}</p>

            <div className="deck__rail">
              {groups.map((g, i) => (
                <button
                  key={g.title}
                  type="button"
                  className={`deck__tick${i === step ? " is-on" : ""}`}
                  aria-label={g.title}
                  aria-current={i === step ? "true" : undefined}
                  onClick={() => seek(i)}
                >
                  <span className="deck__tickBar" aria-hidden />
                  <span className="deck__tickLabel">{g.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Every group occupies the same cell, so the block never resizes as
              the lists change length. */}
          <div className="deck__cell">
            {groups.map((g, i) => (
              <article
                key={g.title}
                className={`deck__slide${i === step ? " is-on" : ""}`}
                aria-hidden={i !== step}
              >
                <p className="mono-note deck__count">
                  {String(i + 1).padStart(2, "0")}
                  <span className="deck__countOf">
                    {" / "}
                    {String(n).padStart(2, "0")}
                  </span>
                </p>
                <h3 className="deck__slideTitle">{g.title}</h3>
                <ul className="deck__items">
                  {g.items.map((item, j) => (
                    <li key={item} className="deck__item" style={{ "--j": j }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
