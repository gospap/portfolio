"use client";

import { useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A panel that answers the cursor: a shallow 3D tilt toward the pointer and a
 * soft accent spotlight that follows it (--px/--py drive the glow in the CSS).
 * No timers, no frame loop — it only moves when you do.
 *
 * Four degrees, not fifteen. This sits inside a page whose motion is otherwise
 * scroll-driven and slow; a card that flips about under the mouse would be the
 * loudest thing on it.
 */
export default function TiltPanel({ children, className = "", ...rest }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--px", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--py", `${(y * 100).toFixed(1)}%`);
    el.style.transform = `perspective(900px) rotateY(${((x - 0.5) * 4).toFixed(
      2,
    )}deg) rotateX(${((0.5 - y) * 4).toFixed(2)}deg) translateY(-3px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.removeProperty("--px");
    el.style.removeProperty("--py");
  };

  return (
    <div
      ref={ref}
      className={`tilt ${className}`.trim()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      <span className="tilt__glow" aria-hidden />
      {children}
    </div>
  );
}
