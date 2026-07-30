"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { damp, prefersReducedMotion } from "@/lib/motion";

/**
 * The closing call to action, with a slight pull toward the cursor.
 *
 * The pointer is tracked on the WRAPPER, not the button, and the wrapper is
 * larger than what it holds: a magnet that only engages once you are already
 * on the button is not a magnet, it is a hover state. The catchment is the
 * padded area around it.
 *
 * The button chases its target in a frame loop rather than jumping to it, so
 * releasing it drifts home instead of snapping — and the loop only exists
 * while a pointer is inside the catchment.
 */
const PULL = 0.32; // how far toward the cursor the button travels

export default function MagneticCta({ href, className = "", children }) {
  const zone = useRef(null);
  const btn = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  };

  useEffect(() => stop, []);

  const run = () => {
    if (raf.current) return;
    let last = performance.now();
    const at = { x: 0, y: 0 };
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      at.x = damp(at.x, target.current.x, 0.07, dt);
      at.y = damp(at.y, target.current.y, 0.07, dt);
      if (btn.current) {
        btn.current.style.transform = `translate3d(${at.x.toFixed(2)}px, ${at.y.toFixed(2)}px, 0)`;
      }
      // settled and released: let the loop die rather than idle at 60fps
      if (
        target.current.x === 0 &&
        target.current.y === 0 &&
        Math.abs(at.x) < 0.1 &&
        Math.abs(at.y) < 0.1
      ) {
        if (btn.current) btn.current.style.transform = "";
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const onMove = (e) => {
    const el = btn.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    target.current = {
      x: (e.clientX - (r.left + r.width / 2)) * PULL,
      y: (e.clientY - (r.top + r.height / 2)) * PULL,
    };
    run();
  };

  const onLeave = () => {
    target.current = { x: 0, y: 0 };
    run();
  };

  return (
    <div
      ref={zone}
      className="magnet"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Link ref={btn} href={href} className={className}>
        {children}
      </Link>
    </div>
  );
}
