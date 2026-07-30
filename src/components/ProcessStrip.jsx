"use client";

import { useEffect, useRef } from "react";
import { trackSection } from "@/lib/scroll";
import { damp, prefersReducedMotion } from "@/lib/motion";

/**
 * A section that changes the direction of travel: you keep scrolling down, the
 * content moves sideways. Worth doing once on a page and never twice — it is
 * the rhythm break between two vertical stretches, not a layout.
 *
 * The transform is written straight to the node from a frame loop rather than
 * through React state: this runs every frame, and re-rendering a component
 * tree sixty times a second to move one element is the wrong mechanism.
 */
export default function ProcessStrip({ steps, kicker, title }) {
  const section = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr) return;

    if (prefersReducedMotion()) {
      // Falls back to an ordinary vertical list — see the CSS.
      el.classList.add("hstrip--static");
      return;
    }

    const tracker = trackSection(el);
    let raf = 0;
    let x = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const span = Math.max(0, tr.scrollWidth - window.innerWidth);
      // A light damp on top of Lenis: the horizontal move reads better with a
      // touch more weight than the vertical scroll it is driven by.
      x = damp(x, tracker.read() * span, 0.055, dt);
      tr.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      tracker.dispose();
    };
  }, []);

  return (
    <section
      ref={section}
      className="hstrip theme-metal curtain"
      /* Scroll distance is tuned against the track's own width: too tall and
         the panels crawl, too short and they whip past. ~70vh per panel puts
         the lateral travel at roughly a third of the vertical, which reads as
         a deliberate drift rather than a scroll-jack. */
      style={{ height: `${steps.length * 70}vh` }}
    >
      <div className="hstrip__stage">
        <div className="hstrip__head wrap">
          <p className="kicker">{kicker}</p>
          <h2 className="h2 hstrip__title">{title}</h2>
        </div>

        <div className="hstrip__track" ref={track}>
          {steps.map((s, i) => (
            <article className="hstrip__panel" key={s.title}>
              <span className="hstrip__num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="hstrip__panelTitle">{s.title}</h3>
              <p className="hstrip__panelBody">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
