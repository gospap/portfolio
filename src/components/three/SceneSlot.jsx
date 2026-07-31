"use client";

import { useEffect, useRef, useState } from "react";
import { trackEnter } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { useNearViewport } from "@/lib/useNearViewport";

/* ===========================================================================
   SceneSlot — the DOM half of any scene that is driven by its own arrival.

   Every canvas on this site needs the same four things around it: a host
   element to measure, an arrival tracker feeding a progress ref, a near-
   viewport gate so only one context is alive at a time, and a reduced-motion
   escape hatch. Writing that four times over is how the four scenes end up
   subtly disagreeing about when "near" starts.

   `children` is a render function so the slot can hand down the progress ref
   without the caller having to make one.
   =========================================================================== */
export default function SceneSlot({
  children,
  className = "",
  lead = 0.75,
  run = 1,
  margin = "80% 0px",
}) {
  const host = useRef(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const near = useNearViewport(host, false, margin);

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReducedMotion()) return;
    setReady(true);

    const tracker = trackEnter(el, { lead, run });
    let raf = 0;
    const tick = () => {
      progress.current = tracker.read();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      tracker.dispose();
      setReady(false);
    };
  }, [lead, run]);

  return (
    <div ref={host} className={className} aria-hidden>
      {ready && near ? children({ progress, active: near }) : null}
    </div>
  );
}
