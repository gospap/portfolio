"use client";

import { useEffect, useRef } from "react";
import { damp, omegaFor, prefersReducedMotion, spring } from "@/lib/motion";

/* ===========================================================================
   Cursor — a circle that follows the pointer.

   The native cursor is left alone. This is decoration riding on top of it, not
   a replacement for it, which is why there is one element here and not two:
   the old version hid the real pointer and therefore needed a DOT to aim with
   and a RING for weight. With the OS cursor visible the dot has nothing to do,
   and the whole `cursor: none` apparatus — plus the per-element rules that had
   to hand back the text caret, the grab hand and the link pointer one at a
   time — goes with it.

   MOUNTED ONLY WHERE IT MAKES SENSE
   `(pointer: fine)` — a real pointing device. On a touch screen there is no
   pointer to follow and the element is never created. Reduced motion opts out
   entirely rather than getting a non-trailing version, since the trail IS the
   effect.
   =========================================================================== */

/* What counts as pressable. Kept as a selector rather than a list of classes
   so a new button anywhere on the site is picked up without editing this. */
const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], summary, label[for], input, textarea, select, .show__open, .wall__card, .disc__row, .skill';

/* ——— how hard the circle is pulled ———
   A critically damped spring tracking a target that is MOVING settles at a
   constant distance behind it of 2·v/ω — so the felt lag is a property of this
   one number, and it can be chosen rather than discovered.

   At ω = ln2/0.012 ≈ 58 rad/s: about 14px behind at a normal 400px/s drift,
   about 35px behind on a fast flick, and closed within a couple of frames of
   stopping. The previous value trailed roughly 65px at 400px/s, which is what
   read as lag.

   Lower the half-life to tighten it further; the circle welds itself to the
   pointer somewhere around 0.006 and stops reading as a separate object. */
const FOLLOW = omegaFor(0.012);

export default function Cursor() {
  const ring = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia?.("(pointer: fine)").matches) return;

    const r = ring.current;
    if (!r) return;

    /* Parked off-screen until the pointer is first seen, so the circle never
       flashes at 0,0 on load. Each axis carries its own velocity — that is the
       whole reason this is a spring and not a damp: a first-order chase
       restarts from zero speed every time the target moves, so it is
       permanently accelerating from a standstill and permanently behind. A
       spring keeps its velocity through the move and through direction
       changes, which is what makes it feel attached. */
    const sx = { x: -100, v: 0 };
    const sy = { x: -100, v: 0 };
    let px = -100;
    let py = -100;
    let over = false;
    let down = false;
    let seen = false;

    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        // first sighting: put the circle under the pointer rather than flying
        // it in from the corner, velocity included or it arrives with a kick
        seen = true;
        sx.x = px;
        sy.x = py;
        sx.v = 0;
        sy.v = 0;
        document.documentElement.classList.add("has-cursor--on");
      }
      const t = e.target instanceof Element ? e.target : null;
      over = !!t?.closest(INTERACTIVE);
    };

    const onDown = () => {
      down = true;
    };
    const onUp = () => {
      down = false;
    };
    /* Leaving the window must park it, or the circle sits frozen at the edge
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
      /* The spring integrates analytically and is unconditionally stable, so
         a long stall cannot explode it — but dt is still clamped, because a
         tab restored after a minute would otherwise teleport the circle
         across the viewport in one frame instead of flying to the pointer. */
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      const x = spring(sx, px, FOLLOW, dt);
      const y = spring(sy, py, FOLLOW, dt);

      /* An outline needs more growth than the old filled shape did to register
         — there is far less ink to notice. 1.45 takes 30px to ~44px, which
         clears typical body text rather than sitting on top of it. Scale is
         still a plain damp: it is a state change, not a tracking problem, so
         there is no velocity worth carrying. */
      scale = damp(scale, over ? 1.45 : 1, 0.05, dt) * (down ? 0.82 : 1);

      r.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
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
      document.documentElement.classList.remove("has-cursor--on");
    };
  }, []);

  return <span ref={ring} className="cur cur__ring" aria-hidden />;
}
