"use client";

/* ===========================================================================
   scroll.js — one scroll value for the whole site.

   The failure mode this exists to prevent: Lenis animates the page on its own
   rAF loop, while `window.addEventListener("scroll")` fires from the browser's
   scroll pipeline. A WebGL scene that reads the second one is always chasing a
   number from a slightly different moment than the frame it is drawing, and no
   amount of camera smoothing hides it — it reads as the scene lagging the page.

   So: one Lenis instance, and everything reads its *smoothed* position at the
   moment it needs it, inside its own frame loop. There is not a single
   `scroll` listener in this codebase.
   =========================================================================== */

import Lenis from "lenis";

let lenis = null;
let refCount = 0;

/** Live, frame-accurate scroll state. Read it, never write it. */
export const scrollState = {
  /** smoothed scroll position in px */
  y: 0,
  /** px/frame, signed — what the detents use to tell moving from settled */
  velocity: 0,
  /** document progress 0..1 */
  progress: 0,
};

/* DOM-side subscribers (the header, mainly). These fire from inside Lenis's
   own rAF tick, so they are frame-synced in a way a `scroll` listener is not —
   and they cost nothing at all while the page is still. Scene code does NOT
   use this: a canvas reads scrollY() directly inside its own frame loop. */
const listeners = new Set();

export function onScroll(fn) {
  listeners.add(fn);
  // fire once so a subscriber can settle into the right state on mount
  fn(scrollState);
  return () => listeners.delete(fn);
}

/**
 * Start (or join) the shared Lenis instance. Reference-counted so several
 * components can depend on smooth scrolling without fighting over its lifetime.
 * Returns a disposer.
 */
export function acquireLenis() {
  refCount += 1;

  if (!lenis) {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    lenis = new Lenis({
      // A shade slower than default: the helix reads better when a flick
      // travels a card and a half rather than four.
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      // Reduced motion turns the *smoothing* off, not Lenis itself — it stays
      // mounted so everything downstream keeps getting frame-synced values
      // from one place instead of branching on a media query.
      smoothWheel: !reduced,
      // Never smooth touch. On a phone the OS scroll physics are the thing
      // people expect, and overriding them feels broken rather than premium.
      syncTouch: false,
      autoRaf: true,
    });

    lenis.on("scroll", (e) => {
      scrollState.y = e.scroll;
      scrollState.velocity = e.velocity;
      scrollState.progress = e.progress;
      for (const fn of listeners) fn(scrollState);
    });

    document.documentElement.classList.add("lenis");
  }

  return () => {
    refCount -= 1;
    if (refCount <= 0 && lenis) {
      lenis.destroy();
      lenis = null;
      refCount = 0;
      document.documentElement.classList.remove("lenis");
    }
  };
}

/** The shared instance, or null before it is started / after SSR. */
export const getLenis = () => lenis;

/**
 * The current scroll position. Falls back to the native value so anything
 * calling this still works before Lenis has started, or with it disabled.
 */
export function scrollY() {
  if (lenis) return lenis.scroll;
  return typeof window === "undefined" ? 0 : window.scrollY;
}

export function scrollTo(target, options) {
  if (lenis) lenis.scrollTo(target, options);
  else if (typeof window !== "undefined") {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}

/** Pause/resume — used while a full-screen detail panel owns the wheel. */
export function stopScroll() {
  lenis?.stop();
}
export function startScroll() {
  lenis?.start();
}

/* ---------------------------------------------------------------------------
   Section tracker.

   Reports how far through a tall sticky section the page has scrolled, as
   0..1. Deliberately does NOT call getBoundingClientRect() per frame: that is
   a forced synchronous layout on every frame, and it returns a position from
   the browser's scroll pipeline rather than Lenis's. Instead the element's
   document offset is measured once (and on resize), and progress is derived
   from the smoothed scroll value — cheap and exactly in step with the frame.
   --------------------------------------------------------------------------- */
// offsetTop chain, not getBoundingClientRect + scrollY: rect is relative to
// the *native* scroll position, which under Lenis can be mid-interpolation.
function documentTop(el) {
  let node = el;
  let y = 0;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return y;
}

/* Re-measure on the three things that move an element down the page: its own
   size, the viewport's, and web fonts landing after first paint. */
function remeasureOn(el, measure) {
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  window.addEventListener("resize", measure);
  document.fonts?.ready.then(measure).catch(() => {});
  return () => {
    ro.disconnect();
    window.removeEventListener("resize", measure);
  };
}

export function trackSection(el) {
  let top = 0;
  let span = 1;

  const measure = () => {
    if (!el) return;
    top = documentTop(el);
    span = Math.max(1, el.offsetHeight - window.innerHeight);
  };

  measure();
  const stop = remeasureOn(el, measure);

  return {
    /** 0..1 through the section's scrollable span, clamped. */
    read() {
      const p = (scrollY() - top) / span;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    },
    /** Document offset of the section's top edge, in px. */
    top: () => top,
    /** Scrollable runway, in px — the section's height minus one viewport. */
    span: () => span,
    measure,
    dispose: stop,
  };
}

/* ---------------------------------------------------------------------------
   Arrival tracker.

   trackSection needs a section with a scroll runway of its own. A section that
   is exactly one viewport tall — every `.stage` on this site — has a span of
   zero, so its progress snaps from 0 to 1 with nothing in between and cannot
   drive a scrub.

   This measures against the viewport instead: 0 when the element's top edge is
   `lead` viewports below the top of the screen, 1 after `run` viewports of
   further scrolling. So `lead: 0.6, run: 1` starts a scrub while the element is
   still rising into view and finishes it 0.4 viewports after it has pinned —
   which is what puts the end of the animation in front of a stationary reader
   rather than behind them.
   --------------------------------------------------------------------------- */
export function trackEnter(el, { lead = 0.6, run = 1 } = {}) {
  let start = 0;
  let span = 1;

  const measure = () => {
    if (!el) return;
    const vh = window.innerHeight;
    start = documentTop(el) - vh * lead;
    span = Math.max(1, vh * run);
  };

  measure();
  const stop = remeasureOn(el, measure);

  return {
    /** 0..1 across the arrival window, clamped. */
    read() {
      const p = (scrollY() - start) / span;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    },
    measure,
    dispose: stop,
  };
}
