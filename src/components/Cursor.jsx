"use client";

import { useEffect, useRef } from "react";
import { damp, prefersReducedMotion } from "@/lib/motion";

/* ===========================================================================
   Cursor — a ring that trails the pointer, and a dot that does not.

   Two elements, because one cannot do both jobs. The DOT sits exactly under
   the pointer and never lags: it is the thing you aim with, and a target that
   trails behind your hand is unusable. The RING is damped and arrives a moment
   later, which is what reads as weight — and it is the part that reacts,
   growing and filling as it passes over anything you can actually press.

   MOUNTED ONLY WHERE IT MAKES SENSE
   `(pointer: fine)` — a real pointing device. On a touch screen there is no
   cursor to replace and the elements are never created. Reduced motion also
   opts out entirely rather than getting a non-trailing version, since the
   trail IS the effect.

   `cursor: none` is applied from JS, never from the stylesheet. Set in CSS it
   would hide the real cursor even if this component failed to mount or the
   bundle never arrived — leaving a page with no pointer at all, which is worse
   than any cursor. The class goes on in an effect, so it can only ever be on
   when the replacement is already running.
   =========================================================================== */

/* What counts as pressable. Kept as a selector rather than a list of classes
   so a new button anywhere on the site is picked up without editing this. */
const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], summary, label[for], input, textarea, select, .show__open, .wall__card, .disc__row, .skill';

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia?.("(pointer: fine)").matches) return;

    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    document.documentElement.classList.add("has-cursor");

    /* Parked off-screen until the pointer is first seen, so neither element
       flashes at 0,0 on load. */
    let px = -100;
    let py = -100;
    let rx = -100;
    let ry = -100;
    let over = false;
    let down = false;
    let seen = false;

    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        // first sighting: put the ring under the pointer rather than flying
        // it in from the corner
        seen = true;
        rx = px;
        ry = py;
        document.documentElement.classList.add("has-cursor--on");
      }
      const t = e.target instanceof Element ? e.target : null;
      over = !!t?.closest(INTERACTIVE);

      /* The hero ring is DRAGGED, and drag has a cursor everybody already
         knows. A reticle there would be replacing a universally understood
         affordance with a decorative one, so over the hero the custom cursor
         steps aside and the native grab hand comes back. */
      document.documentElement.classList.toggle(
        "has-cursor--native",
        !!t?.closest(".hero__stage"),
      );
    };

    const onDown = () => {
      down = true;
    };
    const onUp = () => {
      down = false;
    };
    /* Leaving the window must park it, or the ring sits frozen at the edge
       while the pointer is somewhere else entirely. */
    const onLeave = () => {
      document.documentElement.classList.remove("has-cursor--on");
      seen = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let last = performance.now();
    let scale = 1;

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      /* The ring chases; the dot is written straight through. 0.045s is short
         enough to feel attached and long enough to read as a separate object
         with mass. */
      rx = damp(rx, px, 0.045, dt);
      ry = damp(ry, py, 0.045, dt);
      /* A filled reticle needs less growth than an outline did to read: at 1.9
         a 17px square became 32px, which covers a whole word. 1.5 is enough to
         be unmistakable and still lets you see what is under it. */
      scale = damp(scale, over ? 1.5 : 1, 0.05, dt) * (down ? 0.8 : 1);

      d.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
      r.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      r.dataset.over = over ? "1" : "0";

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove(
        "has-cursor",
        "has-cursor--on",
        "has-cursor--native",
      );
    };
  }, []);

  return (
    <>
      <span ref={ring} className="cur cur__ring" aria-hidden />
      <span ref={dot} className="cur cur__dot" aria-hidden />
    </>
  );
}
