"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { trackEnter } from "@/lib/scroll";
import { damp, prefersReducedMotion } from "@/lib/motion";

/**
 * The statement, inked in word by word as you scroll rather than faded in as a
 * block. The section it lives in is a `.stage`, so it pins — and the scrub is
 * timed to finish a little after the pin, which is the whole point: the last
 * words land while the reader is stationary and looking straight at them.
 *
 * ONE NUMBER, WRITTEN ONCE PER FRAME
 * A word could be a component holding its own opacity, which would be ~50
 * React re-renders a frame. Instead JS writes a single `--lit` (a float word
 * index) to the blockquote and CSS does the per-word arithmetic from it and
 * each word's `--i`. React renders this once, ever.
 *
 * The damp is what keeps a flicked scroll from strobing the whole paragraph:
 * `--lit` chases the scroll position rather than tracking it exactly, so a
 * fast reversal reads as ink draining back out instead of as a flash.
 */
export default function ScrubQuote({ text, className = "" }) {
  const host = useRef(null);
  // split once — the text is a prop that never changes within a locale
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const count = words.length;
  const [narrow, setNarrow] = useState(false);

  /* The two timings below are tuned against two different layouts, so which
     one applies has to be re-decided when the breakpoint is crossed. */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    // Reduced motion gets the finished state, not a slower version of the scrub.
    if (prefersReducedMotion()) {
      el.style.setProperty("--lit", String(count + 4));
      return;
    }

    /* Desktop: the section is a pinned stage, so the scrub can afford a long
       runway and finish while the reader is held still.

       Narrow: it is an ordinary 0.7-viewport block that scrolls straight past.
       The same timings meant the ink was still arriving after the section had
       left the screen. Start almost as soon as it appears from the bottom, and
       finish inside half a viewport of scrolling. */
    const tracker = narrow
      ? trackEnter(el, { lead: 0.95, run: 0.5 })
      : trackEnter(el, { lead: 0.62, run: 1.05 });
    let raf = 0;
    let lit = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      /* Overshoot by three words so the final one reaches full ink before the
         scrub runs out of runway, rather than arriving permanently at 90%. */
      lit = damp(lit, tracker.read() * (count + 3), 0.06, dt);
      el.style.setProperty("--lit", lit.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      tracker.dispose();
    };
  }, [count, narrow]);

  return (
    <blockquote
      ref={host}
      className={`scrub ${className}`.trim()}
      style={{ "--n": count }}
    >
      {/* The space BETWEEN the spans, not inside them: a word box is
          inline-block so it can be nudged, and an inline-block swallows its own
          trailing whitespace — without a real text node here the paragraph
          would have neither word gaps nor anywhere to wrap. */}
      {words.map((w, i) => (
        <Fragment key={`${i}-${w}`}>
          <span className="scrub__w" style={{ "--i": i }}>
            {w}
          </span>{" "}
        </Fragment>
      ))}
    </blockquote>
  );
}
