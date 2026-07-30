"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A figure that runs up to its value the first time it is seen.
 *
 * Takes the finished string and animates the digit runs inside it, rather than
 * taking a number — so "4 / 5" counts both halves and the caller keeps writing
 * the value in one place instead of splitting it into props for this.
 *
 * The final string is what the server renders, so it is the string that is in
 * the HTML: the count is an embellishment applied after hydration, never the
 * source of the number. Nothing is lost with JS off, and a screen reader is
 * handed the value once rather than sixty times a second.
 */
export default function CountUp({ value, className = "" }) {
  const host = useRef(null);
  const text = String(value);

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReducedMotion()) return;

    // Split into digit runs and everything between them, so the separators
    // ("/", spaces, a "+") survive untouched.
    const parts = text.split(/(\d+)/);
    if (!parts.some((p) => /^\d+$/.test(p))) return;

    const targets = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : null));
    const DURATION = 900;
    let raf = 0;
    let start = 0;

    const frame = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out cubic: quick off the mark, settles rather than stops
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = parts
        .map((p, i) =>
          targets[i] === null
            ? p
            : /* padded so "04" does not become "4" halfway up */
              String(Math.round(targets[i] * e)).padStart(p.length, "0"),
        )
        .join("");
      if (t < 1) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text]);

  return (
    <span ref={host} className={className}>
      {text}
    </span>
  );
}
