"use client";

import { useEffect, useState } from "react";

/**
 * True while an element is within `margin` of the viewport.
 *
 * The home page carries two WebGL canvases. Left mounted they both hold a
 * context and both run a frame loop for the entire visit, which is a waste on
 * a laptop and a real problem on a phone — browsers cap the number of live
 * contexts and start dropping the oldest. Mounting each canvas only near its
 * section means one is live at a time in practice.
 *
 * @param {{current: Element|null}} ref
 * @param {boolean} initial  true for a section that is on screen at load, so
 *                           it renders on the first paint rather than after
 *                           the observer's first callback
 */
export function useNearViewport(ref, initial = false, margin = "90% 0px") {
  const [near, setNear] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  return near;
}
